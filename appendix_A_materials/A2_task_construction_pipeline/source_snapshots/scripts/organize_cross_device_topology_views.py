#!/usr/bin/env python3
"""Build topology-specific cross-device task views.

The source real*/R* task sets are kept in place. This script copies usable tasks
into android_only, linux_only, and linux_android directories, with
self-contained assets and rewritten local_path references.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import shutil
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
CROSS_DEVICE_DIR = REPO_ROOT / "tasks" / "cross_device"
RUNS_DIR = REPO_ROOT / "runs" / "generation_engine_probe" / "stress_gpt5mini"

CATEGORIES = {
    "android_only": {"android"},
    "linux_only": {"linux"},
    "linux_android": {"android", "linux"},
}

TARGET_DIRS = [
    CROSS_DEVICE_DIR / "android_only",
    CROSS_DEVICE_DIR / "android_only_assets",
    CROSS_DEVICE_DIR / "linux_only",
    CROSS_DEVICE_DIR / "linux_only_assets",
    CROSS_DEVICE_DIR / "linux_android",
    CROSS_DEVICE_DIR / "linux_android_assets",
]

LEGACY_TARGET_DIRS = [
    CROSS_DEVICE_DIR / "android_android",
    CROSS_DEVICE_DIR / "android_android_assets",
    CROSS_DEVICE_DIR / "linux_linux",
    CROSS_DEVICE_DIR / "linux_linux_assets",
]


@dataclass(frozen=True)
class SourceTask:
    origin_kind: str
    origin_label: str
    source_file: str
    sample_id: str | None
    task: dict[str, Any]
    asset_root: Path | None
    asset_root_label: str | None


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, value: dict[str, Any]) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _slug(value: str, *, max_len: int = 96) -> str:
    slug = re.sub(r"[^A-Za-z0-9_]+", "_", value).strip("_").lower()
    slug = re.sub(r"_+", "_", slug)
    return slug[:max_len].strip("_") or "task"


def _topology_category(task: dict[str, Any]) -> str | None:
    device_types = {str(device.get("type")) for device in task.get("devices", [])}
    if not device_types:
        return None
    if device_types == {"android"}:
        return "android_only"
    if device_types == {"linux"}:
        return "linux_only"
    if device_types <= {"android", "linux"} and device_types == {"android", "linux"}:
        return "linux_android"
    return None


def _task_topology_key(task: dict[str, Any]) -> str:
    counts = Counter(str(device.get("type")) for device in task.get("devices", []))
    return "+".join(f"{counts[key]}{key[0].upper()}" for key in sorted(counts))


def _copytree_contents(src: Path, dst: Path) -> None:
    if not src.exists():
        return
    for path in sorted(src.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(src)
        target = dst / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)


def _replace_strings(value: Any, replacements: list[tuple[str, str]]) -> Any:
    if isinstance(value, str):
        out = value
        for old, new in replacements:
            out = out.replace(old, new)
        return out
    if isinstance(value, list):
        return [_replace_strings(item, replacements) for item in value]
    if isinstance(value, dict):
        return {key: _replace_strings(item, replacements) for key, item in value.items()}
    return value


def _rewrite_relative_upload_paths(task: dict[str, Any], target_asset_root: Path) -> None:
    new_root = f"${{repo_root}}/{_repo_relative(target_asset_root)}"
    for block_name in ("setup", "cleanup"):
        for device_block in task.get(block_name, []) or []:
            for config in device_block.get("config", []) or []:
                if config.get("type") != "upload_file":
                    continue
                files = config.get("parameters", {}).get("files", [])
                if isinstance(files, dict):
                    files = [files]
                for file_spec in files:
                    local_path = str(file_spec.get("local_path", ""))
                    if not local_path:
                        continue
                    if local_path.startswith("${repo_root}/") or Path(local_path).is_absolute():
                        continue
                    file_spec["local_path"] = f"{new_root}/{local_path}"


def _iter_upload_local_paths(task: dict[str, Any]) -> list[str]:
    paths: list[str] = []
    for block_name in ("setup", "cleanup"):
        for device_block in task.get(block_name, []) or []:
            for config in device_block.get("config", []) or []:
                if config.get("type") != "upload_file":
                    continue
                files = config.get("parameters", {}).get("files", [])
                if isinstance(files, dict):
                    files = [files]
                for file_spec in files:
                    local_path = str(file_spec.get("local_path", ""))
                    if local_path:
                        paths.append(local_path)
    return paths


def _resolve_source_upload_path(source: SourceTask, local_path: str) -> Path | None:
    if local_path.startswith("${repo_root}/"):
        return REPO_ROOT / local_path.removeprefix("${repo_root}/")
    path = Path(local_path)
    if path.is_absolute():
        return path
    if source.asset_root:
        return source.asset_root / local_path
    return None


def _missing_source_upload_assets(source: SourceTask) -> list[str]:
    missing: list[str] = []
    for local_path in _iter_upload_local_paths(source.task):
        resolved = _resolve_source_upload_path(source, local_path)
        if resolved is None or not resolved.exists():
            missing.append(local_path)
    return missing


def _string_values(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            out.extend(_string_values(item))
        return out
    if isinstance(value, dict):
        out: list[str] = []
        for item in value.values():
            out.extend(_string_values(item))
        return out
    return []


def _repo_relative(path: Path) -> str:
    return path.relative_to(REPO_ROOT).as_posix()


def _path_prefixes(path: Path) -> list[str]:
    rel = _repo_relative(path)
    return [
        f"${{repo_root}}/{rel}",
        str(path),
        rel,
    ]


def _iter_real_tasks() -> list[SourceTask]:
    tasks: list[SourceTask] = []
    for collection in ("real100", "real200", "real300"):
        task_dir = CROSS_DEVICE_DIR / collection
        asset_dir = CROSS_DEVICE_DIR / f"{collection}_assets"
        for task_path in sorted(task_dir.glob("*.json")):
            if task_path.name.endswith("_solution.json"):
                continue
            task = _load_json(task_path)
            task_asset_root = asset_dir / task_path.stem
            tasks.append(
                SourceTask(
                    origin_kind="real",
                    origin_label=collection,
                    source_file=task_path.name,
                    sample_id=None,
                    task=task,
                    asset_root=task_asset_root if task_asset_root.exists() else None,
                    asset_root_label=task_path.stem,
                )
            )
    return tasks


def _round_result_paths() -> list[tuple[str, list[Path]]]:
    groups: list[tuple[str, list[Path]]] = []
    for number in range(1, 21):
        groups.append((f"R{number:02d}", [RUNS_DIR / f"R{number:02d}" / "result.json"]))
    groups.append(
        (
            "R21-R30",
            [
                RUNS_DIR / "R21_200" / "result.json",
                RUNS_DIR / "R21_200_resume_035" / "result.json",
            ],
        )
    )
    for number in range(31, 56):
        paths = [RUNS_DIR / f"R{number:02d}" / "result.json"]
        supplement = RUNS_DIR / f"R{number:02d}_missing_after_mechanism_fixes" / "result.json"
        if supplement.exists():
            paths.append(supplement)
        groups.append((f"R{number:02d}", paths))
    return groups


def _record_stage4_asset_root(result_path: Path, sample_id: str) -> Path | None:
    candidate = result_path.parent / "work" / sample_id / "stage4_assets"
    if candidate.exists():
        return candidate
    return None


def _iter_generated_tasks() -> tuple[list[SourceTask], Counter[str]]:
    tasks: list[SourceTask] = []
    failed = Counter()
    for group_label, paths in _round_result_paths():
        latest: dict[str, tuple[Path, dict[str, Any]]] = {}
        for result_path in paths:
            if not result_path.exists():
                continue
            result = _load_json(result_path)
            for record in result.get("records", []):
                sample_id = str(record.get("sample_id"))
                latest[sample_id] = (result_path, record)
        for sample_id, (result_path, record) in sorted(latest.items()):
            if record.get("status") != "completed":
                failed[str(record.get("failure_stage") or "unknown")] += 1
                continue
            task = (
                record.get("pipeline", {})
                .get("stages", {})
                .get("stage8", {})
                .get("task_draft", {})
                .get("task_json")
            )
            if not isinstance(task, dict):
                failed["missing_stage8_task_json"] += 1
                continue
            tasks.append(
                SourceTask(
                    origin_kind="generated",
                    origin_label=group_label,
                    source_file=result_path.relative_to(REPO_ROOT).as_posix(),
                    sample_id=sample_id,
                    task=task,
                    asset_root=_record_stage4_asset_root(result_path, sample_id),
                    asset_root_label="stage4_assets",
                )
            )
    return tasks, failed


def _copy_and_rewrite_task(source: SourceTask, category: str, stem: str) -> tuple[dict[str, Any], dict[str, Any]]:
    target_asset_root = CROSS_DEVICE_DIR / f"{category}_assets" / stem
    target_asset_root.mkdir(parents=True, exist_ok=True)
    replacements: list[tuple[str, str]] = []

    if source.asset_root and source.asset_root.exists():
        _copytree_contents(source.asset_root, target_asset_root)
        new_root = f"${{repo_root}}/{_repo_relative(target_asset_root)}"
        for prefix in _path_prefixes(source.asset_root):
            replacements.append((prefix, new_root))

    task = copy.deepcopy(source.task)
    original_id = str(task.get("id", ""))
    task = _replace_strings(task, replacements)
    if source.asset_root and source.asset_root.exists():
        _rewrite_relative_upload_paths(task, target_asset_root)
    task["id"] = stem
    metadata = dict(task.get("metadata") or {})
    metadata.update(
        {
            "topology_view": category,
            "source_origin_kind": source.origin_kind,
            "source_origin_label": source.origin_label,
            "source_origin_file": Path(source.source_file).name,
            "source_original_id": original_id,
            "source_original_task_name": Path(source.source_file).stem,
            "source_original_slug": _slug(original_id, max_len=120),
        }
    )
    if source.sample_id is not None:
        metadata["source_sample_id"] = source.sample_id
    task["metadata"] = metadata

    manifest_entry = {
        "category": category,
        "file": f"{stem}.json",
        "task_id": task["id"],
        "source_origin_kind": source.origin_kind,
        "source_origin_label": source.origin_label,
        "source_origin_file": source.source_file,
        "source_sample_id": source.sample_id,
        "source_original_id": original_id,
        "topology": _task_topology_key(task),
        "asset_dir": f"tasks/cross_device/{category}_assets/{stem}" if target_asset_root.exists() else None,
    }
    return task, manifest_entry


def _validate_task_paths(task_path: Path, task: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    category = task_path.parent.name
    expected_category = _topology_category(task)
    if expected_category != category:
        errors.append(f"{task_path}: expected category {category}, got {expected_category}")

    forbidden = [
        "runs/generation_engine_probe",
        "tasks/cross_device/real100_assets",
        "tasks/cross_device/real200_assets",
        "tasks/cross_device/real300_assets",
    ]
    for text in _string_values(task):
        for marker in forbidden:
            if marker in text:
                errors.append(f"{task_path}: contains old path marker {marker}: {text[:180]}")

    for device_setup in task.get("setup", []):
        for config in device_setup.get("config", []):
            if config.get("type") != "upload_file":
                continue
            files = config.get("parameters", {}).get("files", [])
            if isinstance(files, dict):
                files = [files]
            for file_spec in files:
                local_path = str(file_spec.get("local_path", ""))
                if not local_path.startswith("${repo_root}/"):
                    errors.append(f"{task_path}: upload_file local_path is not repo-rooted: {local_path}")
                    continue
                resolved = REPO_ROOT / local_path.removeprefix("${repo_root}/")
                if not resolved.exists():
                    errors.append(f"{task_path}: missing upload_file asset: {local_path}")
    return errors


def _write_report(
    manifest_entries: list[dict[str, Any]],
    failed_generated: Counter[str],
    skipped: Counter[str],
    skipped_entries: list[dict[str, Any]],
    validation_errors: list[str],
) -> None:
    manifest_dir = CROSS_DEVICE_DIR / "_manifests"
    manifest_dir.mkdir(parents=True, exist_ok=True)
    counts_by_category = Counter(entry["category"] for entry in manifest_entries)
    counts_by_origin = Counter(entry["source_origin_kind"] for entry in manifest_entries)
    counts_by_topology = Counter(entry["topology"] for entry in manifest_entries)
    report = {
        "schema_version": "cross_device_topology_view_manifest.v1",
        "total_tasks": len(manifest_entries),
        "counts_by_category": dict(sorted(counts_by_category.items())),
        "counts_by_origin": dict(sorted(counts_by_origin.items())),
        "counts_by_topology": dict(sorted(counts_by_topology.items())),
        "generated_failures_by_stage": dict(sorted(failed_generated.items())),
        "skipped_by_reason": dict(sorted(skipped.items())),
        "skipped_tasks": skipped_entries,
        "validation_errors": validation_errors,
        "tasks": manifest_entries,
    }
    _write_json(manifest_dir / "topology_views_manifest.json", report)

    lines = [
        "# Cross-Device Topology Views",
        "",
        "This report summarizes copied topology-specific task views. Source task sets are kept in place.",
        "",
        f"- Total copied tasks: {len(manifest_entries)}",
        f"- Validation errors: {len(validation_errors)}",
        "",
        "## Counts by category",
        "",
    ]
    for key, value in sorted(counts_by_category.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Counts by origin", ""])
    for key, value in sorted(counts_by_origin.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Counts by topology", ""])
    for key, value in sorted(counts_by_topology.items()):
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Generated failures by stage", ""])
    if failed_generated:
        for key, value in sorted(failed_generated.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- None")
    lines.extend(["", "## Skipped by reason", ""])
    if skipped:
        for key, value in sorted(skipped.items()):
            lines.append(f"- `{key}`: {value}")
    else:
        lines.append("- None")
    if skipped_entries:
        lines.extend(["", "## Skipped tasks", ""])
        for entry in skipped_entries[:200]:
            lines.append(
                f"- `{entry['source_origin_label']}` `{entry.get('source_sample_id') or entry['source_origin_file']}`: "
                f"{entry['reason']}"
            )
        if len(skipped_entries) > 200:
            lines.append(f"- ... {len(skipped_entries) - 200} more")
    if validation_errors:
        lines.extend(["", "## Validation errors", ""])
        lines.extend(f"- {error}" for error in validation_errors[:200])
        if len(validation_errors) > 200:
            lines.append(f"- ... {len(validation_errors) - 200} more")
    (manifest_dir / "topology_views_report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def build_views(force: bool) -> int:
    cleanable_dirs = TARGET_DIRS + LEGACY_TARGET_DIRS
    existing = [path for path in cleanable_dirs if path.exists()]
    if existing:
        if not force:
            joined = "\n".join(f"- {path.relative_to(REPO_ROOT)}" for path in existing)
            raise SystemExit(f"target directories already exist; rerun with --force:\n{joined}")
        for path in existing:
            shutil.rmtree(path)

    for path in TARGET_DIRS:
        path.mkdir(parents=True, exist_ok=True)

    source_tasks = _iter_real_tasks()
    generated_tasks, failed_generated = _iter_generated_tasks()
    source_tasks.extend(generated_tasks)

    manifest_entries: list[dict[str, Any]] = []
    skipped_entries: list[dict[str, Any]] = []
    skipped = Counter()
    validation_errors: list[str] = []
    seen_paths: set[Path] = set()
    category_counts = Counter()

    for source in source_tasks:
        category = _topology_category(source.task)
        if category not in CATEGORIES:
            skipped["unsupported_topology"] += 1
            continue
        missing_source_assets = _missing_source_upload_assets(source)
        if missing_source_assets:
            skipped["missing_required_asset"] += 1
            skipped_entries.append(
                {
                    "category": category,
                    "file": None,
                    "task_id": None,
                    "source_origin_kind": source.origin_kind,
                    "source_origin_label": source.origin_label,
                    "source_origin_file": source.source_file,
                    "source_sample_id": source.sample_id,
                    "source_original_id": str(source.task.get("id", "")),
                    "topology": _task_topology_key(source.task),
                    "asset_dir": None,
                    "reason": "; ".join(missing_source_assets),
                }
            )
            continue
        category_counts[category] += 1
        stem = f"{category}_{category_counts[category]:03d}"
        task, manifest_entry = _copy_and_rewrite_task(source, category, stem)
        task_path = CROSS_DEVICE_DIR / category / manifest_entry["file"]
        if task_path in seen_paths:
            skipped["duplicate_output_file"] += 1
            continue
        seen_paths.add(task_path)
        task_errors = _validate_task_paths(task_path, task)
        _write_json(task_path, task)
        validation_errors.extend(task_errors)
        manifest_entries.append(manifest_entry)

    _write_report(manifest_entries, failed_generated, skipped, skipped_entries, validation_errors)
    return len(validation_errors)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="replace existing topology view directories")
    args = parser.parse_args()
    validation_error_count = build_views(force=args.force)
    if validation_error_count:
        print(f"generated topology views with {validation_error_count} validation errors")
        return 1
    print("generated topology views successfully")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
