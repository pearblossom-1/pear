from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from mdcbench.core.errors import ConfigError
from mdcbench.core.task_config import REPO_ROOT, load_task_config
from mdcbench.tasks.generation.engine.common import device_type


_VARIABLE_TOKEN_RE = re.compile(r"\$\{([A-Za-z_][A-Za-z0-9_]*)\}")
_BUILT_IN_VARIABLES = {"repo_root"}


def assemble_task_draft(
    *,
    task_id: str,
    sample: dict[str, Any],
    instruction_spec: dict[str, Any],
    task_design: dict[str, Any],
    asset_plan: dict[str, Any],
    setup_plan: dict[str, Any],
    eval_cleanup_metadata_plan: dict[str, Any],
    oracle_plan: dict[str, Any],
) -> dict[str, Any]:
    devices = [
        {"id": str(device_id), "type": device_type(str(device_id))}
        for device_id in sample.get("devices", [])
    ]
    task_json = {
        "id": task_id,
        "instruction": instruction_spec["instruction"],
        "devices": devices,
        "variables": {},
        "setup": setup_plan.get("setup", []),
        "cleanup": eval_cleanup_metadata_plan.get("cleanup", []),
        "evaluation": eval_cleanup_metadata_plan.get("evaluation", []),
        "limits": eval_cleanup_metadata_plan.get("limits", {"max_steps": 40, "max_wall_time_s": 300}),
        "metadata": _task_metadata(
            sample=sample,
            task_design=task_design,
            setup_plan=setup_plan,
            eval_cleanup_metadata_plan=eval_cleanup_metadata_plan,
        ),
    }
    literal_variables = _literal_variable_tokens(task_json)
    if literal_variables:
        task_json["variables"] = literal_variables
    return {
        "status": "accepted",
        "unsupported_reason": None,
        "task_json": task_json,
        "asset_write_plan": _asset_write_plan(asset_plan),
        "task_design_summary": {
            "detailed_description": task_design.get("detailed_description", ""),
            "visible_sources": task_design.get("visible_sources", []),
            "required_outputs": task_design.get("required_outputs", []),
            "expected_data": task_design.get("expected_data", {}),
            "value_trace": task_design.get("value_trace", []),
        },
        "scripted_solution_plan": oracle_plan.get("scripted_solution_plan", []),
        "static_tests": [
            "load_task_config accepts assembled task_json",
            "score-enabled evaluation exists",
            "asset_write_plan covers every visible source asset",
        ],
    }


def _task_metadata(
    *,
    sample: dict[str, Any],
    task_design: dict[str, Any],
    setup_plan: dict[str, Any],
    eval_cleanup_metadata_plan: dict[str, Any],
) -> dict[str, Any]:
    metadata = dict(eval_cleanup_metadata_plan.get("metadata") or {})
    _drop_generated_metadata_traces(metadata)
    metadata.setdefault("category", "generated_cross_device")
    metadata["device_topology"] = _device_topology(sample)
    metadata["implementation_status"] = "engine_draft"
    metadata.setdefault("readiness", "R1_native_real_fixture")
    metadata.setdefault("native_evaluator_status", "native_content")
    metadata.setdefault("requires_helper_audit", False)
    metadata["surfaces"] = _surface_list(sample, task_design)
    native_outputs = _native_content_outputs(task_design)
    if native_outputs:
        metadata["native_content_outputs"] = native_outputs
    else:
        metadata["native_content_outputs"] = _normalize_native_content_outputs(
            metadata.get("native_content_outputs")
        )
    metadata.setdefault("setup_note", _setup_note(setup_plan))
    metadata.setdefault("evaluate_note", _evaluate_note(eval_cleanup_metadata_plan))
    return metadata


def _drop_generated_metadata_traces(metadata: dict[str, Any]) -> None:
    trace_keys = {"created_by", "authoring_tool", "author", "creator"}
    for key in list(metadata):
        value = metadata.get(key)
        if key in trace_keys and isinstance(value, str) and value.strip().lower() == "task_generator":
            metadata.pop(key, None)


def _device_topology(sample: dict[str, Any]) -> str:
    counts = {"android": 0, "linux": 0, "home": 0}
    for device_id in sample.get("devices", []):
        dtype = device_type(str(device_id))
        if dtype in counts:
            counts[dtype] += 1
    parts: list[str] = []
    if counts["android"]:
        parts.append(f"{counts['android']}A")
    if counts["linux"]:
        parts.append(f"{counts['linux']}L")
    if counts["home"]:
        parts.append(f"{counts['home']}S")
    return "+".join(parts) if parts else "unknown"


def _surface_list(sample: dict[str, Any], task_design: dict[str, Any]) -> list[str]:
    surfaces: set[str] = set()
    device_surfaces = sample.get("device_surfaces", {})
    if isinstance(device_surfaces, dict):
        for values in device_surfaces.values():
            if isinstance(values, list):
                surfaces.update(str(value) for value in values if value)
            elif isinstance(values, str) and values:
                surfaces.add(values)
    for section_name in ("visible_sources", "required_outputs"):
        section = task_design.get(section_name, [])
        if not isinstance(section, list):
            continue
        for item in section:
            if isinstance(item, dict) and item.get("surface"):
                surfaces.add(str(item["surface"]))
    return sorted(surfaces)


def _native_content_outputs(task_design: dict[str, Any]) -> list[dict[str, str]]:
    outputs: list[dict[str, str]] = []
    required_outputs = task_design.get("required_outputs", [])
    if not isinstance(required_outputs, list):
        return outputs
    for output in required_outputs:
        if not isinstance(output, dict):
            continue
        item = {
            key: str(output[key])
            for key in ("output_id", "device_id", "surface", "visible_name_or_path")
            if output.get(key)
        }
        if item:
            outputs.append(item)
    return outputs


def _normalize_native_content_outputs(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    normalized: list[dict[str, str]] = []
    for index, item in enumerate(value):
        if isinstance(item, dict):
            entry = {str(key): str(val) for key, val in item.items() if val is not None}
        elif isinstance(item, str) and item.strip():
            entry = {
                "output_id": f"output_{index + 1}",
                "visible_name_or_path": item.strip(),
            }
        else:
            continue
        if entry:
            normalized.append(entry)
    return normalized


def _setup_note(setup_plan: dict[str, Any]) -> str:
    setup_items = setup_plan.get("setup", [])
    if not isinstance(setup_items, list):
        return "Generated setup plan."
    device_ids = [
        str(item.get("device_id"))
        for item in setup_items
        if isinstance(item, dict) and item.get("device_id")
    ]
    if not device_ids:
        return "Generated setup plan."
    return f"Generated setup configures {len(device_ids)} device(s): {', '.join(device_ids)}."


def _evaluate_note(eval_cleanup_metadata_plan: dict[str, Any]) -> str:
    evaluation = eval_cleanup_metadata_plan.get("evaluation", [])
    if not isinstance(evaluation, list):
        return "Generated evaluation plan."
    score_enabled = sum(
        1
        for item in evaluation
        if isinstance(item, dict) and item.get("enable_score_calc", True) is not False
    )
    guard_count = sum(
        1
        for item in evaluation
        if isinstance(item, dict) and item.get("enable_score_calc", True) is False
    )
    return f"Generated evaluation has {score_enabled} score-enabled check(s) and {guard_count} guard check(s)."


def run_assembled_task_static_validation(task_draft: dict[str, Any], *, work_dir: str | Path) -> dict[str, Any]:
    work_path = Path(work_dir)
    work_path.mkdir(parents=True, exist_ok=True)
    task_path = work_path / "assembled_task.json"
    _rewrite_stage4_upload_local_paths(task_draft.get("task_json", {}), stage8_dir=work_path)
    task_path.write_text(json.dumps(task_draft.get("task_json", {}), ensure_ascii=False, indent=2), encoding="utf-8")
    errors: list[str] = []
    try:
        load_task_config(task_path)
    except ConfigError as exc:
        errors.append(str(exc))
    errors.extend(_validate_upload_local_paths_exist(task_draft.get("task_json", {})))
    evaluations = task_draft.get("task_json", {}).get("evaluation", [])
    if not any(isinstance(item, dict) and item.get("enable_score_calc", True) is not False for item in evaluations):
        errors.append("assembled task must include at least one score-enabled evaluator")
    return {"passed": not errors, "task_config_errors": errors}


def _rewrite_stage4_upload_local_paths(task_json: dict[str, Any], *, stage8_dir: Path) -> None:
    stage4_dir = stage8_dir.parent / "stage4_assets"
    if not stage4_dir.exists():
        return
    for file_item in _iter_upload_file_items(task_json):
        local_path = file_item.get("local_path")
        if not isinstance(local_path, str) or not local_path:
            continue
        if local_path.startswith("${repo_root}/") or Path(local_path).is_absolute():
            continue
        candidate = (stage4_dir / local_path).resolve()
        if not candidate.exists():
            continue
        file_item["local_path"] = _portable_local_path(candidate)


def _portable_local_path(path: Path) -> str:
    try:
        return "${repo_root}/" + path.relative_to(REPO_ROOT).as_posix()
    except ValueError:
        return str(path)


def _validate_upload_local_paths_exist(task_json: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for file_item in _iter_upload_file_items(task_json):
        local_path = file_item.get("local_path")
        if not isinstance(local_path, str) or not local_path:
            errors.append("upload_file local_path must be a non-empty string")
            continue
        materialized = local_path.replace("${repo_root}", str(REPO_ROOT), 1)
        if not Path(materialized).expanduser().exists():
            errors.append(f"upload_file local_path does not exist: {local_path}")
    return errors


def _iter_upload_file_items(task_json: dict[str, Any]):
    for section_name in ("setup", "cleanup"):
        section = task_json.get(section_name, [])
        if isinstance(section, dict):
            groups = [{"device_id": device_id, "config": config} for device_id, config in section.items()]
        else:
            groups = section if isinstance(section, list) else []
        for group in groups:
            if not isinstance(group, dict):
                continue
            config = group.get("config", [])
            if not isinstance(config, list):
                continue
            for step in config:
                if not isinstance(step, dict) or step.get("type") != "upload_file":
                    continue
                parameters = step.get("parameters", {})
                if not isinstance(parameters, dict):
                    continue
                files = parameters.get("files", [])
                if not isinstance(files, list):
                    continue
                for file_item in files:
                    if isinstance(file_item, dict):
                        yield file_item


def _literal_variable_tokens(value: Any) -> dict[str, str]:
    tokens: set[str] = set()

    def visit(item: Any) -> None:
        if isinstance(item, str):
            tokens.update(_VARIABLE_TOKEN_RE.findall(item))
        elif isinstance(item, list):
            for child in item:
                visit(child)
        elif isinstance(item, dict):
            for key, child in item.items():
                if key == "variables":
                    continue
                visit(child)

    visit(value)
    return {token: f"${{{token}}}" for token in sorted(tokens) if token not in _BUILT_IN_VARIABLES}


def _asset_write_plan(asset_plan: dict[str, Any]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for asset in asset_plan.get("asset_manifest", []):
        if not isinstance(asset, dict):
            continue
        items.append(
            {
                "asset_id": asset.get("asset_id"),
                "source_id": asset.get("source_id"),
                "materialization": asset.get("materialization"),
                "asset_kind": asset.get("asset_kind"),
                "materializer": asset.get("materializer"),
                "target_device_id": asset.get("target_device_id"),
                "target_path": asset.get("target_path"),
                "quality_checks": asset.get("quality_checks", []),
            }
        )
    return items
