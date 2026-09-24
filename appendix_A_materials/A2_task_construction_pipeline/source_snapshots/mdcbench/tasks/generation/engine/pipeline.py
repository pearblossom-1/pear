from __future__ import annotations

from pathlib import Path
from typing import Any, Callable

import json
import re
import time

from mdcbench.tasks.generation.llm_client import chat_completion
from mdcbench.tasks.generation.profiles.registry import DEFAULT_PROFILE_NAME, get_active_profile
from mdcbench.tasks.generation.engine.prompts import (
    build_stage2_instruction_compression_repair_messages,
    build_stage1_task_design_messages,
    build_stage2_task_design_review_messages,
    build_stage3_task_design_repair_messages,
    build_stage4_asset_repair_messages,
    build_stage4_asset_messages,
    build_stage5_setup_messages,
    build_stage6_eval_cleanup_metadata_messages,
    build_stage7_oracle_messages,
)
from mdcbench.tasks.generation.engine.stages.stage1_instruction import (
    collect_instruction_style_warnings,
    validate_instruction_spec,
)
from mdcbench.tasks.generation.engine.stages.stage2_instruction_review import validate_instruction_review
from mdcbench.tasks.generation.engine.stages.stage3_task_design_repair import validate_task_design_repair
from mdcbench.tasks.generation.engine.stages.stage4_assets import normalize_asset_plan, validate_asset_plan
from mdcbench.tasks.generation.engine.stages.stage4_materializer import ImageGenerator, materialize_asset_plan
from mdcbench.tasks.generation.engine.stages.stage5_setup import validate_setup_plan
from mdcbench.tasks.generation.engine.stages.stage6_eval_cleanup_metadata import (
    normalize_eval_cleanup_metadata_plan,
    validate_eval_cleanup_metadata_plan,
)
from mdcbench.tasks.generation.engine.stages.stage7_oracle import validate_oracle_plan
from mdcbench.tasks.generation.engine.stages.stage8_assembly import (
    assemble_task_draft,
    run_assembled_task_static_validation,
)

ProgressFn = Callable[[dict[str, Any]], None]


def demo_stage0_sample() -> dict[str, Any]:
    return {
        "sample_id": "sample_000001",
        "devices": ["android_0", "linux_0"],
        "device_surfaces": {"android_0": ["android.markor_note"], "linux_0": ["linux.csv"]},
        "setup": "clean",
        "feasibility_type": "feasible",
    }


def demo_instruction_spec() -> dict[str, Any]:
    return {
        "status": "accepted",
        "unsupported_reason": None,
        "task_title": "Create invoice CSV from Android note",
        "patterns": ["extract_transform"],
        "feasibility_type": "feasible",
        "information_flow": "Android Markor note -> Linux CSV",
        "instruction": (
            "On the first Android device, open Markor and read the note titled `Invoice request`. "
            "Create `/tmp/invoice/items.csv` on the Linux device with columns sku, quantity, "
            "unit_price, and line_total."
        ),
        "detailed_description": (
            "The Android Markor note contains three invoice rows. The agent should read the rows, "
            "compute line_total for each row, and create the Linux CSV with sku, quantity, unit_price, "
            "and line_total columns."
        ),
        "why_cross_device": "The invoice rows are only visible in the Android Markor note, while the structured CSV must be created on Linux.",
        "visible_sources": [
            {
                "source_id": "invoice_note",
                "device_id": "android_0",
                "surface": "android.markor_note",
                "visible_name_or_path": "Markor note `Invoice request`",
                "content_mode": "inline",
                "content": "SKU123, 2, 15.50\nSKU456, 1, 42.00\nSKU789, 5, 3.20\n",
            }
        ],
        "required_outputs": [
            {
                "output_id": "items_csv",
                "device_id": "linux_0",
                "surface": "linux.csv",
                "visible_name_or_path": "/tmp/invoice/items.csv",
                "completion_condition": "CSV has sku, quantity, unit_price, and line_total for all note rows.",
            }
        ],
        "expected_data": {
            "items_csv": [
                {"sku": "SKU123", "quantity": "2", "unit_price": "15.50", "line_total": "31.00"},
                {"sku": "SKU456", "quantity": "1", "unit_price": "42.00", "line_total": "42.00"},
                {"sku": "SKU789", "quantity": "5", "unit_price": "3.20", "line_total": "16.00"},
            ]
        },
        "value_trace": [
            {"expected_path": "items_csv[0].sku", "expected_value": "SKU123", "visible_source": "invoice_note line 1"},
            {"expected_path": "items_csv[0].line_total", "expected_value": "31.00", "visible_source": "invoice_note line 1 quantity * unit_price"},
            {"expected_path": "items_csv[1].sku", "expected_value": "SKU456", "visible_source": "invoice_note line 2"},
            {"expected_path": "items_csv[1].line_total", "expected_value": "42.00", "visible_source": "invoice_note line 2 quantity * unit_price"},
            {"expected_path": "items_csv[2].sku", "expected_value": "SKU789", "visible_source": "invoice_note line 3"},
            {"expected_path": "items_csv[2].line_total", "expected_value": "16.00", "visible_source": "invoice_note line 3 quantity * unit_price"},
        ],
        "generation_notes": [
            "The Android note is the only source and the Linux CSV is the only output."
        ],
    }


def demo_instruction_review() -> dict[str, Any]:
    return {
        "decision": "accepted",
        "optimized_instruction": demo_instruction_spec()["instruction"],
        "instruction_revision_notes": [
            "Deterministic demo instruction is already concise enough for downstream stages."
        ],
        "blocking_issues": [],
        "optional_improvements": [],
        "stage3_ready": True,
    }


def demo_asset_plan() -> dict[str, Any]:
    return {
        "status": "accepted",
        "unsupported_reason": None,
        "asset_manifest": [
            {
                "asset_id": "invoice_note_asset",
                "source_id": "invoice_note",
                "materialization": "inline",
                "asset_kind": "text_note",
                "materializer": "inline_text",
                "target_device_id": "android_0",
                "target_path": "Markor note `Invoice request`",
                "content": "SKU123, 2, 15.50\nSKU456, 1, 42.00\nSKU789, 5, 3.20\n",
                "format_notes": "Inline Markor note text; no external asset file required.",
                "quality_checks": ["nonempty_text", "matches_visible_source"],
                "expected_anchor_values": ["SKU123", "SKU456", "SKU789"],
            }
        ],
        "external_files": [],
        "hidden_oracle": [
            {
                "name": "items_csv_expected_rows",
                "not_visible_to_agent": True,
                "content": "Derived line totals from visible invoice note.",
            }
        ],
    }


def demo_setup_plan() -> dict[str, Any]:
    return {
        "status": "accepted",
        "unsupported_reason": None,
        "setup": [
            {
                "device_id": "android_0",
                "config": [
                    {"type": "ensure_app", "parameters": {"app": "markor"}},
                    {
                        "type": "adb_shell",
                        "parameters": {
                            "command": [
                                "sh",
                                "-c",
                                "mkdir -p /storage/emulated/0/Documents/Markor && cat > '/storage/emulated/0/Documents/Markor/Invoice request.md' <<'EOF'\nSKU123, 2, 15.50\nSKU456, 1, 42.00\nSKU789, 5, 3.20\nEOF",
                            ]
                        },
                    },
                ],
            },
            {
                "device_id": "linux_0",
                "config": [
                    {"type": "execute", "parameters": {"command": "rm -rf /tmp/invoice && mkdir -p /tmp/invoice", "shell": True}}
                ],
            },
        ],
        "setup_visibility_checks": [
            "Markor note `Invoice request` exists.",
            "Linux `/tmp/invoice` exists and `/tmp/invoice/items.csv` does not exist before agent work.",
        ],
    }


def demo_eval_cleanup_metadata_plan() -> dict[str, Any]:
    return {
        "status": "accepted",
        "unsupported_reason": None,
        "evaluation": [
            {
                "device_id": "linux_0",
                "func": "check_csv",
                "result": {"type": "vm_file", "path": "/tmp/invoice/items.csv"},
                "expected": {
                    "type": "rule",
                    "rules": {
                        "expect": [
                            {"sku": "SKU123", "quantity": "2", "unit_price": "15.50", "line_total": "31.00"},
                            {"sku": "SKU456", "quantity": "1", "unit_price": "42.00", "line_total": "42.00"},
                            {"sku": "SKU789", "quantity": "5", "unit_price": "3.20", "line_total": "16.00"},
                        ]
                    },
                },
            },
            {
                "device_id": "linux_0",
                "func": "exact_match",
                "result": {
                    "type": "vm_command_line",
                    "command": "test -f /tmp/invoice/items.csv && echo present || echo missing",
                    "shell": True,
                },
                "expected": {"type": "rule", "rules": {"expected": "present"}},
            },
        ],
        "cleanup": [
            {
                "device_id": "android_0",
                "config": [
                    {
                        "type": "adb_shell",
                        "parameters": {"command": ["sh", "-c", "rm -f '/storage/emulated/0/Documents/Markor/Invoice request.md'"]},
                    }
                ],
            },
            {
                "device_id": "linux_0",
                "config": [
                    {"type": "execute", "parameters": {"command": "rm -rf /tmp/invoice", "shell": True}}
                ],
            },
        ],
        "metadata": {
            "category": "generated_cross_device",
            "device_topology": "1A+1L",
            "readiness": "R1_native_real_fixture",
            "implementation_status": "engine_draft",
            "surfaces": "Android Markor -> Linux CSV",
        },
        "limits": {"max_steps": 40, "max_wall_time_s": 300},
    }


def demo_oracle_plan() -> dict[str, Any]:
    return {
        "status": "accepted",
        "unsupported_reason": None,
        "scripted_solution_plan": [
            "Create `/tmp/invoice/items.csv` with the three derived rows and line totals."
        ],
        "positive_oracle_steps": [
            {"device_id": "linux_0", "action": "write_expected_csv", "path": "/tmp/invoice/items.csv"}
        ],
        "negative_oracle_steps": [
            {"device_id": "linux_0", "action": "noop", "expected_success": False}
        ],
        "smoke_expectations": {
            "setup_pre_eval_success": False,
            "positive_oracle_success": True,
            "negative_or_noop_success": False,
        },
    }


def run_deterministic_pipeline(
    *,
    work_dir: str | Path,
    image_generator: ImageGenerator | None = None,
    deterministic_image_fallback: bool = False,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> dict[str, Any]:
    profile = get_active_profile(profile_name)
    validate_sample = profile.require_sample_validator()
    sample = demo_stage0_sample()
    instruction = demo_instruction_spec()
    instruction_review = demo_instruction_review()
    assets = demo_asset_plan()
    setup = demo_setup_plan()
    eval_cleanup_metadata = demo_eval_cleanup_metadata_plan()
    oracle = demo_oracle_plan()
    repaired_instruction = _apply_optimized_instruction(instruction, instruction_review)

    stages: dict[str, Any] = {
        "stage0": {"profile": profile.name, "sample": sample, "sample_errors": validate_sample(sample)},
        "stage1": {
            "instruction_spec": instruction,
            "instruction_errors": validate_instruction_spec(instruction, sample),
            "instruction_style_warnings": collect_instruction_style_warnings(instruction),
        },
        "stage2": {
            "review": instruction_review,
            "review_errors": validate_instruction_review(instruction_review),
            "reviewed_instruction_spec": repaired_instruction,
        },
        "stage3": {
            "repair_attempted": False,
            "repair_errors": [],
            "repaired_instruction_spec": repaired_instruction,
        },
        "stage4": {
            "asset_plan": assets,
            "asset_errors": validate_asset_plan(assets, repaired_instruction),
            "asset_quality_report": materialize_asset_plan(
                assets,
                output_dir=Path(work_dir) / "stage4_assets",
                image_generator=image_generator,
                deterministic_image_fallback=deterministic_image_fallback,
            ),
        },
        "stage5": {
            "setup_plan": setup,
            "setup_errors": validate_setup_plan(setup, sample, asset_plan=assets, task_design=repaired_instruction),
        },
        "stage6": {
            "eval_cleanup_metadata_plan": eval_cleanup_metadata,
            "eval_cleanup_metadata_errors": validate_eval_cleanup_metadata_plan(
                eval_cleanup_metadata,
                sample,
                task_design=repaired_instruction,
            ),
        },
        "stage7": {"oracle_plan": oracle, "oracle_errors": validate_oracle_plan(oracle, sample)},
    }

    task_draft = assemble_task_draft(
        task_id="generated_invoice_csv_001",
        sample=sample,
        instruction_spec=stages["stage3"]["repaired_instruction_spec"],
        task_design=stages["stage3"]["repaired_instruction_spec"],
        asset_plan=assets,
        setup_plan=setup,
        eval_cleanup_metadata_plan=eval_cleanup_metadata,
        oracle_plan=oracle,
    )
    static_report = run_assembled_task_static_validation(task_draft, work_dir=Path(work_dir) / "stage8")
    stages["stage8"] = {"task_draft": task_draft, "static_report": static_report}

    blocking_errors: list[Any] = []
    for stage in stages.values():
        for key, value in stage.items():
            if key.endswith("_errors") and value:
                blocking_errors.extend(value)
            if key.endswith("_report") and isinstance(value, dict) and value.get("passed") is False:
                blocking_errors.extend(value.get("errors", [f"{key} failed"]))
    if not static_report.get("passed"):
        blocking_errors.extend(static_report.get("task_config_errors", []))
    return {
        "status": "failed" if blocking_errors else "completed",
        "failure_stage": _first_failed_stage(stages) if blocking_errors else None,
        "stages": stages,
    }


def run_model_pipeline(
    *,
    sample: dict[str, Any] | None,
    provider_config: dict[str, str],
    model: str,
    work_dir: str | Path,
    chat_fn=chat_completion,
    image_generator: ImageGenerator | None = None,
    deterministic_image_fallback: bool = False,
    prompt_variant: str = "default",
    profile_name: str = DEFAULT_PROFILE_NAME,
    progress_fn: ProgressFn | None = None,
) -> dict[str, Any]:
    profile = get_active_profile(profile_name)
    validate_sample = profile.require_sample_validator()
    selected_sample = sample or demo_stage0_sample()
    stage0_errors = validate_sample(selected_sample)
    stages: dict[str, Any] = {
        "stage0": {"profile": profile.name, "sample": selected_sample, "sample_errors": stage0_errors}
    }
    if stage0_errors:
        return _failed_record(stages, "stage0")

    _emit_progress(progress_fn, "stage1", "model_start")
    instruction = _call_json_model(
        chat_fn,
        provider_config,
        model,
        build_stage1_task_design_messages(selected_sample, prompt_variant=prompt_variant, profile_name=profile.name),
        temperature=0.2,
    )
    instruction = _normalize_stage1_instruction_spec(instruction)
    _emit_progress(progress_fn, "stage1", "model_done")
    instruction_errors = validate_instruction_spec(instruction, selected_sample)
    stages["stage1"] = {
        "instruction_spec": instruction,
        "instruction_errors": instruction_errors,
        "instruction_style_warnings": collect_instruction_style_warnings(instruction),
    }
    if instruction_errors or instruction.get("status") != "accepted":
        return _failed_record(stages, "stage1")

    _emit_progress(progress_fn, "stage2", "model_start")
    instruction_review = _call_json_model(
        chat_fn,
        provider_config,
        model,
        build_stage2_task_design_review_messages(
            selected_sample,
            instruction,
            prompt_variant=prompt_variant,
            profile_name=profile.name,
        ),
        temperature=0.1,
    )
    _emit_progress(progress_fn, "stage2", "model_done")
    review_errors = validate_instruction_review(instruction_review, task_design=instruction)
    review_retry_count = 0
    while review_errors and instruction_review.get("decision") == "accepted" and review_retry_count < 2:
        review_retry_count += 1
        _emit_progress(progress_fn, "stage2", "retry_model_start")
        instruction_review = _call_json_model(
            chat_fn,
            provider_config,
            model,
            _stage2_retry_messages(
                selected_sample,
                instruction,
                review_errors,
                attempt=review_retry_count,
                prompt_variant=prompt_variant,
                profile_name=profile.name,
            ),
            temperature=0.1,
        )
        _emit_progress(progress_fn, "stage2", "retry_model_done")
        review_errors = validate_instruction_review(instruction_review, task_design=instruction)
    compression_repair_attempted = False
    compression_repair_errors: list[str] = []
    if review_errors and instruction_review.get("decision") == "accepted":
        compression_repair_attempted = True
        _emit_progress(progress_fn, "stage2", "compression_repair_model_start")
        compression_repair = _call_json_model(
            chat_fn,
            provider_config,
            model,
            build_stage2_instruction_compression_repair_messages(
                selected_sample,
                instruction,
                instruction_review,
                review_errors,
                profile_name=profile.name,
            ),
            temperature=0.0,
        )
        _emit_progress(progress_fn, "stage2", "compression_repair_model_done")
        compression_repair_errors = _apply_instruction_compression_repair(
            instruction_review,
            compression_repair,
        )
        review_errors = compression_repair_errors or validate_instruction_review(
            instruction_review,
            task_design=instruction,
        )
    compression_fallback_applied = False
    if review_errors and instruction_review.get("decision") == "accepted":
        fallback_instruction = _fallback_compressed_instruction(instruction)
        if fallback_instruction:
            original_notes = instruction_review.get("instruction_revision_notes")
            notes = original_notes if isinstance(original_notes, list) else []
            instruction_review["optimized_instruction"] = fallback_instruction
            instruction_review["instruction_revision_notes"] = [
                *notes,
                "Applied a locator-based compression fallback after model compression still repeated source details.",
            ]
            fallback_errors = validate_instruction_review(instruction_review, task_design=instruction)
            if not fallback_errors:
                compression_fallback_applied = True
                review_errors = []
    if review_errors and instruction_review.get("decision") == "accepted" and _stage2_errors_need_design_repair(review_errors):
        _convert_stage2_review_to_revise(instruction_review, review_errors)
        review_errors = validate_instruction_review(instruction_review, task_design=instruction)
    reviewed_instruction = _apply_optimized_instruction(instruction, instruction_review)
    stages["stage2"] = {
        "review": instruction_review,
        "review_errors": review_errors,
        "review_retry_attempted": review_retry_count > 0,
        "review_retry_count": review_retry_count,
        "instruction_compression_repair_attempted": compression_repair_attempted,
        "instruction_compression_repair_errors": compression_repair_errors,
        "instruction_compression_fallback_applied": compression_fallback_applied,
        "reviewed_instruction_spec": reviewed_instruction,
    }
    if review_errors or instruction_review.get("decision") == "rejected":
        return _failed_record(stages, "stage2")

    repair_attempted = False
    repair_errors: list[str] = []
    repaired_instruction = reviewed_instruction
    if instruction_review.get("decision") == "revise":
        repair_attempted = True
        _emit_progress(progress_fn, "stage3", "model_start")
        repaired_instruction = _call_json_model(
            chat_fn,
            provider_config,
            model,
            build_stage3_task_design_repair_messages(
                selected_sample,
                instruction,
                instruction_review,
                prompt_variant=prompt_variant,
                profile_name=profile.name,
            ),
            temperature=0.1,
        )
        repaired_instruction = _normalize_stage1_instruction_spec(repaired_instruction)
        _emit_progress(progress_fn, "stage3", "model_done")
        repair_errors = validate_task_design_repair(repaired_instruction, selected_sample)
    elif instruction_review.get("decision") != "accepted" or instruction_review.get("stage3_ready") is not True:
        return _failed_record(stages, "stage2")
    stage3_instruction_lint_errors: list[str] = []
    stage3_instruction_fallback_applied = False
    if not repair_errors and repaired_instruction.get("status") == "accepted":
        stage3_instruction_lint_errors = _task_design_instruction_lint_errors(repaired_instruction)
        if stage3_instruction_lint_errors:
            fallback_instruction = _fallback_compressed_instruction(repaired_instruction)
            if fallback_instruction:
                candidate = dict(repaired_instruction)
                candidate["instruction"] = fallback_instruction
                candidate_lint_errors = _task_design_instruction_lint_errors(candidate)
                if not candidate_lint_errors:
                    repaired_instruction = candidate
                    stage3_instruction_fallback_applied = True
                    stage3_instruction_lint_errors = []
    stages["stage3"] = {
        "repair_attempted": repair_attempted,
        "repair_errors": repair_errors,
        "instruction_lint_errors": stage3_instruction_lint_errors,
        "instruction_fallback_applied": stage3_instruction_fallback_applied,
        "repaired_instruction_spec": repaired_instruction,
    }
    if repair_errors or stage3_instruction_lint_errors:
        return _failed_record(stages, "stage3")
    if repaired_instruction.get("status") == "unsupported":
        return _failed_record(stages, "stage3")

    _emit_progress(progress_fn, "stage4", "model_start")
    assets = _call_json_model(
        chat_fn,
        provider_config,
        model,
        build_stage4_asset_messages(repaired_instruction, profile_name=profile.name),
        temperature=0.2,
    )
    assets = normalize_asset_plan(assets)
    _emit_progress(progress_fn, "stage4", "model_done")
    asset_errors = validate_asset_plan(assets, repaired_instruction)
    asset_output_dir = Path(work_dir) / "stage4_assets"
    _emit_progress(progress_fn, "stage4", "materialize_start")
    asset_quality_report = materialize_asset_plan(
        assets,
        output_dir=asset_output_dir,
        image_generator=image_generator,
        deterministic_image_fallback=deterministic_image_fallback,
    )
    _emit_progress(progress_fn, "stage4", "materialize_done")
    asset_repair_attempted = False
    if asset_errors or not asset_quality_report.get("passed"):
        asset_repair_attempted = True
        _emit_progress(progress_fn, "stage4_repair", "model_start")
        assets = _call_json_model(
            chat_fn,
            provider_config,
            model,
            build_stage4_asset_repair_messages(
                repaired_instruction,
                assets,
                asset_errors,
                asset_quality_report,
                profile_name=profile.name,
            ),
            temperature=0.1,
        )
        assets = normalize_asset_plan(assets)
        _emit_progress(progress_fn, "stage4_repair", "model_done")
        asset_errors = validate_asset_plan(assets, repaired_instruction)
        _emit_progress(progress_fn, "stage4_repair", "materialize_start")
        asset_quality_report = materialize_asset_plan(
            assets,
            output_dir=asset_output_dir,
            image_generator=image_generator,
            deterministic_image_fallback=deterministic_image_fallback,
        )
        _emit_progress(progress_fn, "stage4_repair", "materialize_done")
    stages["stage4"] = {
        "asset_plan": assets,
        "asset_errors": asset_errors,
        "asset_quality_report": asset_quality_report,
        "repair_attempted": asset_repair_attempted,
    }
    if asset_errors or not asset_quality_report.get("passed") or assets.get("status") != "accepted":
        return _failed_record(stages, "stage4")

    _emit_progress(progress_fn, "stage5", "model_start")
    setup = _call_json_model(
        chat_fn,
        provider_config,
        model,
        build_stage5_setup_messages(selected_sample, repaired_instruction, assets, profile_name=profile.name),
        temperature=0.1,
    )
    _emit_progress(progress_fn, "stage5", "model_done")
    setup_errors = validate_setup_plan(setup, selected_sample, asset_plan=assets, task_design=repaired_instruction)
    stages["stage5"] = {"setup_plan": setup, "setup_errors": setup_errors}
    if setup_errors or setup.get("status") != "accepted":
        return _failed_record(stages, "stage5")

    _emit_progress(progress_fn, "stage6", "model_start")
    eval_cleanup_metadata = _call_json_model(
        chat_fn,
        provider_config,
        model,
        build_stage6_eval_cleanup_metadata_messages(
            selected_sample,
            repaired_instruction,
            setup,
            profile_name=profile.name,
        ),
        temperature=0.1,
    )
    _emit_progress(progress_fn, "stage6", "model_done")
    eval_cleanup_metadata = normalize_eval_cleanup_metadata_plan(
        eval_cleanup_metadata,
        task_design=repaired_instruction,
    )
    eval_errors = validate_eval_cleanup_metadata_plan(
        eval_cleanup_metadata,
        selected_sample,
        task_design=repaired_instruction,
    )
    stages["stage6"] = {
        "eval_cleanup_metadata_plan": eval_cleanup_metadata,
        "eval_cleanup_metadata_errors": eval_errors,
    }
    if eval_errors or eval_cleanup_metadata.get("status") != "accepted":
        return _failed_record(stages, "stage6")

    _emit_progress(progress_fn, "stage7", "model_start")
    oracle = _call_json_model(
        chat_fn,
        provider_config,
        model,
        build_stage7_oracle_messages(repaired_instruction, eval_cleanup_metadata, profile_name=profile.name),
        temperature=0.1,
    )
    _emit_progress(progress_fn, "stage7", "model_done")
    oracle_errors = validate_oracle_plan(oracle, selected_sample)
    stages["stage7"] = {"oracle_plan": oracle, "oracle_errors": oracle_errors}
    if oracle_errors or oracle.get("status") != "accepted":
        return _failed_record(stages, "stage7")

    task_draft = assemble_task_draft(
        task_id=_task_id_from_title(repaired_instruction.get("task_title", "generated task")),
        sample=selected_sample,
        instruction_spec=repaired_instruction,
        task_design=repaired_instruction,
        asset_plan=assets,
        setup_plan=setup,
        eval_cleanup_metadata_plan=eval_cleanup_metadata,
        oracle_plan=oracle,
    )
    static_report = run_assembled_task_static_validation(task_draft, work_dir=Path(work_dir) / "stage8")
    stages["stage8"] = {"task_draft": task_draft, "static_report": static_report}
    _emit_progress(progress_fn, "stage8", "done")
    if not static_report.get("passed"):
        return _failed_record(stages, "stage8")
    return {"status": "completed", "failure_stage": None, "stages": stages}


def _apply_optimized_instruction(instruction: dict[str, Any], review: dict[str, Any]) -> dict[str, Any]:
    reviewed = dict(instruction)
    optimized_instruction = review.get("optimized_instruction")
    if isinstance(optimized_instruction, str) and optimized_instruction.strip():
        reviewed["instruction"] = optimized_instruction.strip()
    return reviewed


def _normalize_stage1_instruction_spec(instruction: dict[str, Any]) -> dict[str, Any]:
    normalized = json.loads(json.dumps(instruction))
    for key in ("task_title", "instruction", "detailed_description", "information_flow", "why_cross_device"):
        value = normalized.get(key)
        if isinstance(value, str):
            normalized[key] = re.sub(r"\btask_id\b", "task ID", value, flags=re.IGNORECASE)
    for section_name in ("visible_sources", "required_outputs"):
        section = normalized.get(section_name)
        if not isinstance(section, list):
            continue
        for item in section:
            if not isinstance(item, dict):
                continue
            value = item.get("visible_name_or_path")
            if isinstance(value, str):
                item["visible_name_or_path"] = _strip_visible_state_suffix(value)
            if section_name == "visible_sources":
                _normalize_visible_source_requirements(item)
    return normalized


def _normalize_visible_source_requirements(source: dict[str, Any]) -> None:
    if source.get("content_mode") != "requirements":
        return
    requirements = source.get("content_requirements")
    if not isinstance(requirements, dict):
        return
    if str(requirements.get("source_kind", "")).strip():
        return
    source_kind = _default_source_kind_for_surface(
        str(source.get("surface", "")),
        str(source.get("visible_name_or_path", "")),
    )
    if source_kind:
        requirements["source_kind"] = source_kind


def _default_source_kind_for_surface(surface: str, visible_name: str) -> str:
    lowered_name = visible_name.lower()
    if surface == "linux.csv" or lowered_name.endswith(".csv"):
        return "csv"
    if surface == "linux.xlsx" or lowered_name.endswith((".xlsx", ".ods")):
        return "spreadsheet"
    if surface in {"linux.odt_docx", "linux.impress"} or lowered_name.endswith((".odt", ".docx", ".odp", ".pptx")):
        return "office_document"
    if surface == "linux.pdf" or lowered_name.endswith(".pdf"):
        return "pdf"
    if surface == "linux.vscode_project":
        return "code_project"
    if surface == "linux.vlc_playback" or lowered_name.endswith((".mp3", ".wav", ".m4a", ".3gp", ".ogg")):
        return "audio_file"
    if surface in {"android.gallery", "android.camera", "android.simple_draw"} or lowered_name.endswith((".png", ".jpg", ".jpeg", ".webp")):
        return "image"
    if surface in {"android.audio_recorder"}:
        return "audio_file"
    return "text"


def _strip_visible_state_suffix(value: str) -> str:
    return re.sub(
        r"(?:\s*[\(\[]\s*(?:updated|completed|modified|final|saved|synced)\s*[\)\]]|\s+[-–—]\s*(?:updated|completed|modified|final|saved|synced)|\s+(?:updated|completed|modified|saved|synced))$",
        "",
        value.strip(),
        flags=re.IGNORECASE,
    ).strip()


def _task_design_instruction_lint_errors(task_design: dict[str, Any]) -> list[str]:
    instruction = task_design.get("instruction")
    if not isinstance(instruction, str) or not instruction.strip():
        return ["task design instruction must be a non-empty string"]
    review = {
        "decision": "accepted",
        "optimized_instruction": instruction,
        "instruction_revision_notes": [],
        "blocking_issues": [],
        "optional_improvements": [],
        "stage3_ready": True,
    }
    stage2_errors = validate_instruction_review(review, task_design=task_design)
    compression_only_errors = {
        "optimized_instruction exceeds 350 chars without materially compressing the original",
        "optimized_instruction expands the original instruction instead of compressing it",
    }
    return [error for error in stage2_errors if error not in compression_only_errors]


def _apply_instruction_compression_repair(review: dict[str, Any], repair: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    optimized_instruction = repair.get("optimized_instruction")
    if not isinstance(optimized_instruction, str) or not optimized_instruction.strip():
        errors.append("instruction compression repair must return a non-empty optimized_instruction")
    notes = repair.get("instruction_revision_notes")
    if not isinstance(notes, list):
        errors.append("instruction compression repair must return instruction_revision_notes as an array")
    if errors:
        return errors
    review["optimized_instruction"] = optimized_instruction.strip()
    review["instruction_revision_notes"] = notes
    return []


def _stage2_errors_need_design_repair(review_errors: list[str]) -> bool:
    structural_needles = (
        "but no visible source contains an agent-visible request",
        "but no visible source defines that requested text",
        "drops required",
        "omits locator for visible_sources",
    )
    return any(any(needle in error for needle in structural_needles) for error in review_errors)


def _convert_stage2_review_to_revise(review: dict[str, Any], review_errors: list[str]) -> None:
    review["decision"] = "revise"
    review["optimized_instruction"] = ""
    notes = review.get("instruction_revision_notes")
    review["instruction_revision_notes"] = notes if isinstance(notes, list) else []
    review["stage3_ready"] = False
    existing_blockers = review.get("blocking_issues")
    blockers = existing_blockers if isinstance(existing_blockers, list) else []
    if not blockers:
        blockers = [
            {
                "area": "instruction",
                "issue": "The accepted optimized_instruction still violates structural instruction lint.",
                "evidence": error,
                "required_fix": "Repair the task design or visible source so the instruction can remain concise without hiding required source, request, or output-field information.",
            }
            for error in review_errors
        ]
    review["blocking_issues"] = blockers


SURFACE_INSTRUCTION_LABELS = {
    "android.markor_note": "Markor",
    "android.files_download": "Android Files",
    "android.calendar_event": "Simple Calendar Pro",
    "android.task": "Tasks app",
    "android.sms": "Simple SMS Messenger",
    "android.contacts": "Android Contacts",
    "android.photo_video": "Android Camera or Simple Gallery Pro",
    "android.audio_recording": "Android Audio Recorder",
    "android.clock_alarm_timer": "Android Clock",
    "android.retro_music_playlist": "Retro Music",
    "android.osmand_favorite_marker": "OsmAnd",
    "android.simple_draw": "Simple Draw Pro",
    "android.recipe": "Broccoli app",
    "linux.text_markdown": "text/Markdown file",
    "linux.csv": "CSV file",
    "linux.json": "JSON file",
    "linux.xlsx": "spreadsheet",
    "linux.odt_docx": "Writer document",
    "linux.odp_pptx": "Impress deck",
    "linux.pdf": "PDF",
    "linux.html_browser": "Chrome page",
    "linux.thunderbird_draft": "Thunderbird draft",
    "linux.vscode_project": "VSCode project",
    "linux.gimp_image": "GIMP image",
    "linux.vlc_playback": "VLC playback",
    "linux.zip_archive": "ZIP archive",
    "linux.terminal": "terminal-readable file",
}


def _fallback_compressed_instruction(task_design: dict[str, Any]) -> str:
    sources = [
        item
        for item in task_design.get("visible_sources", [])
        if isinstance(item, dict) and item.get("device_id") and item.get("visible_name_or_path")
    ]
    outputs = [
        item
        for item in task_design.get("required_outputs", [])
        if isinstance(item, dict) and item.get("device_id") and item.get("visible_name_or_path")
    ]
    if not sources or not outputs:
        return ""

    source_locators = {
        str(source.get("visible_name_or_path", "")).strip()
        for source in sources
        if str(source.get("visible_name_or_path", "")).strip()
    }
    source_sentence = _preserved_source_sentence(task_design, sources[:3]) or _source_locator_sentence(sources[:3], include_labels=True)
    output_sentence = _output_action_sentence(outputs, include_labels=True, source_locators=source_locators)
    if not source_sentence or not output_sentence:
        return ""
    bridge = _fallback_bridge_phrase(sources[:3])
    fallback = f"{source_sentence}. {bridge} and {output_sentence}."
    if len(fallback) <= 350:
        return fallback

    compact_source_sentence = _source_locator_sentence(sources[:3], include_labels=False)
    compact_output_sentence = _output_action_sentence(
        outputs,
        include_labels=False,
        source_locators=source_locators,
    )
    if not compact_source_sentence or not compact_output_sentence:
        return fallback
    compact_fallback = f"{compact_source_sentence}. {bridge} and {compact_output_sentence}."
    if len(compact_fallback) <= 350:
        return compact_fallback

    terse_source_sentence = _terse_source_locator_sentence(sources[:3])
    terse_output_sentence = _terse_output_action_sentence(outputs, source_locators=source_locators)
    if terse_source_sentence and terse_output_sentence:
        terse_fallback = f"{terse_source_sentence}; {terse_output_sentence}."
        if len(terse_fallback) <= 350:
            return terse_fallback

    merged_output_sentence = _merged_output_sentence(outputs, include_labels=False)
    if not merged_output_sentence:
        return compact_fallback
    merged_fallback = f"{compact_source_sentence}. {bridge} and {merged_output_sentence}."
    if len(merged_fallback) > 350 and bridge == "Follow the request":
        shorter = f"{compact_source_sentence}. Follow it and {merged_output_sentence}."
        if len(shorter) <= 350:
            return shorter
    if len(merged_fallback) > 350:
        short_bridge = "Follow it" if bridge == "Follow the request" else bridge
        ultra_output_sentence = _ultra_compact_output_sentence(outputs)
        if ultra_output_sentence:
            ultra = f"{compact_source_sentence}. {short_bridge} and {ultra_output_sentence}."
            if len(ultra) <= 350:
                return ultra
        ultra_output_sentence = _ultra_compact_output_sentence(outputs, preserve_object_names=False)
        if ultra_output_sentence:
            ultra = f"{compact_source_sentence}. {short_bridge} and {ultra_output_sentence}."
            if len(ultra) <= 350:
                return ultra
        minimal_output_sentence = _minimal_output_summary_sentence(outputs)
        if minimal_output_sentence:
            minimal_source_sentence = _terse_source_locator_sentence(sources[:3]) or compact_source_sentence
            minimal = f"{minimal_source_sentence}. {short_bridge} and {minimal_output_sentence}."
            if len(minimal) <= 350:
                return minimal
    if len(merged_fallback) > 350 and len(sources) > 1:
        primary_source_sentence = _source_locator_sentence(sources[:1], include_labels=True)
        primary_source_is_valid = bool(primary_source_sentence) and _sentence_mentions_required_file_sources(primary_source_sentence, sources[:3])
        ultra_output_sentence = _ultra_compact_output_sentence(outputs)
        if primary_source_is_valid and ultra_output_sentence:
            primary_only = f"{primary_source_sentence}. {bridge} and {ultra_output_sentence}."
            if len(primary_only) <= 350:
                return primary_only
        ultra_output_sentence = _ultra_compact_output_sentence(outputs, preserve_object_names=False)
        if primary_source_is_valid and ultra_output_sentence:
            primary_only = f"{primary_source_sentence}. {bridge} and {ultra_output_sentence}."
            if len(primary_only) <= 350:
                return primary_only
        minimal_output_sentence = _minimal_output_summary_sentence(outputs)
        if primary_source_is_valid and minimal_output_sentence:
            primary_only = f"{primary_source_sentence}. {bridge} and {minimal_output_sentence}."
            if len(primary_only) <= 350:
                return primary_only
    if len(merged_fallback) > 350:
        short_bridge = "Follow it" if bridge == "Follow the request" else bridge
        for source_sentence in (
            compact_source_sentence,
            _terse_source_locator_sentence(sources[:3]),
            _source_locator_sentence(sources[:2], include_labels=False),
        ):
            if not source_sentence:
                continue
            generic = f"{source_sentence}. {short_bridge} and create or update the requested outputs on their named devices."
            if len(generic) <= 350:
                return generic
    return merged_fallback


def _source_locator_sentence(sources: list[dict[str, Any]], *, include_labels: bool) -> str:
    phrases = [_source_locator_phrase(source, include_labels=include_labels) for source in sources]
    phrases = [phrase for phrase in phrases if phrase]
    if not phrases:
        return ""
    return f"Use {_join_phrases(phrases)}"


def _terse_source_locator_sentence(sources: list[dict[str, Any]]) -> str:
    phrases = [_terse_locator_phrase(source) for source in sources]
    phrases = [phrase for phrase in phrases if phrase]
    if not phrases:
        return ""
    return f"Use {_join_phrases(phrases)}"


def _terse_output_action_sentence(outputs: list[dict[str, Any]], *, source_locators: set[str]) -> str:
    phrases = [_terse_output_action_phrase(output, source_locators=source_locators) for output in outputs]
    phrases = [phrase for phrase in phrases if phrase]
    if not phrases:
        return ""
    return _join_phrases(phrases)


def _preserved_source_sentence(task_design: dict[str, Any], sources: list[dict[str, Any]]) -> str:
    instruction = str(task_design.get("instruction", "")).strip()
    if not instruction:
        return ""
    first_sentence = re.split(r"(?<=[.!?])\s+", instruction, maxsplit=1)[0].strip().rstrip(".")
    if not first_sentence or len(first_sentence) > 220:
        return ""
    if re.search(r"\b(?:android|linux|home)_\d+\b", first_sentence):
        return ""
    if _has_ambiguous_android_device_reference(first_sentence):
        return ""
    if _sentence_contains_output_action(first_sentence):
        return ""
    if not _sentence_mentions_any_source(first_sentence, sources):
        return ""
    if not _sentence_mentions_required_file_sources(first_sentence, sources):
        return ""
    return first_sentence


def _has_ambiguous_android_device_reference(sentence: str) -> bool:
    if not re.search(r"\bAndroid devices?\b", sentence):
        return False
    known_app_labels = (
        "Android Camera",
        "Simple Gallery Pro",
        "Simple SMS Messenger",
        "Simple Calendar Pro",
        "Android Contacts",
        "Android Files",
        "Tasks app",
        "Markor",
        "Broccoli app",
        "Retro Music",
        "OsmAnd",
        "Simple Draw Pro",
        "Audio Recorder",
        "VLC",
    )
    if not any(label in sentence for label in known_app_labels):
        return True
    if re.search(r"\bGallery\b", sentence) and "Simple Gallery Pro" not in sentence:
        return True
    return False


def _sentence_contains_output_action(sentence: str) -> bool:
    return bool(
        re.search(
            r"\b(?:create|save|write|update|submit|send|complete|fill|copy|export|move|delete|archive)\b",
            sentence,
            flags=re.IGNORECASE,
        )
    )


def _sentence_mentions_any_source(sentence: str, sources: list[dict[str, Any]]) -> bool:
    sentence_lower = sentence.lower()
    for source in sources:
        if not isinstance(source, dict):
            continue
        surface = str(source.get("surface", ""))
        label = SURFACE_INSTRUCTION_LABELS.get(surface, "")
        if label and label.lower() in sentence_lower:
            return True
        name = str(source.get("visible_name_or_path", ""))
        if name and _meaningful_locator_words(name) & _meaningful_locator_words(sentence):
            return True
    return False


def _sentence_mentions_required_file_sources(sentence: str, sources: list[dict[str, Any]]) -> bool:
    sentence_lower = sentence.lower()
    for source in sources:
        if not isinstance(source, dict):
            continue
        device_id = str(source.get("device_id", ""))
        surface = str(source.get("surface", ""))
        visible_name = str(source.get("visible_name_or_path", "")).strip()
        if not device_id.startswith("linux_"):
            continue
        if not visible_name.startswith("/") and surface != "linux.terminal":
            continue
        tokens = _preserved_source_locator_tokens(visible_name) if visible_name.startswith("/") else _preserved_non_path_source_tokens(source)
        if tokens and not any(token.lower() in sentence_lower for token in tokens):
            return False
    return True


def _preserved_source_locator_tokens(path: str) -> list[str]:
    normalized = path.rstrip("/")
    parts = [part for part in normalized.split("/") if part]
    if not parts:
        return []
    basename = parts[-1]
    tokens = [normalized, basename]
    if len(parts) >= 2:
        tokens.append("/" + "/".join(parts[:-1]))
    return [token for token in tokens if token]


def _preserved_non_path_source_tokens(source: dict[str, Any]) -> list[str]:
    surface = str(source.get("surface", ""))
    visible_name = str(source.get("visible_name_or_path", ""))
    tokens: list[str] = []
    if surface == "linux.terminal":
        tokens.append("terminal")
    tokens.extend(
        word
        for word in re.findall(r"[A-Za-z][A-Za-z0-9_-]{2,}", visible_name)
        if word.lower() not in {"the", "and", "for", "from", "with", "output", "file", "device"}
    )
    deduped: list[str] = []
    seen: set[str] = set()
    for token in tokens:
        key = token.lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(token)
    return deduped


def _meaningful_locator_words(value: str) -> set[str]:
    stopwords = {
        "the",
        "and",
        "for",
        "from",
        "with",
        "device",
        "first",
        "second",
        "android",
        "linux",
        "list",
        "file",
        "note",
        "event",
        "task",
    }
    return {
        word.lower()
        for word in re.findall(r"[A-Za-z][A-Za-z0-9_-]{2,}", value)
        if word.lower() not in stopwords
    }


def _fallback_bridge_phrase(sources: list[dict[str, Any]]) -> str:
    request_words = ("request", "asks", "please", "rules", "instructions", "instruction", "manifest", "checklist", "draft", "message")
    for source in sources:
        text = _source_request_cue_text(source)
        if any(word in text for word in request_words):
            return "Follow the request"
    return "Use those details"


def _source_request_cue_text(source: dict[str, Any]) -> str:
    parts = [
        str(source.get("visible_name_or_path", "")),
        str(source.get("content", "")),
    ]
    requirements = source.get("content_requirements")
    if isinstance(requirements, dict):
        parts.append(str(requirements))
    return "\n".join(parts).lower()


def _output_locator_sentence(outputs: list[dict[str, Any]], *, include_labels: bool) -> str:
    phrases = [_output_locator_phrase(output, include_labels=include_labels) for output in outputs]
    phrases = [phrase for phrase in phrases if phrase]
    if not phrases:
        return ""
    verb = "create or update"
    return f"{verb} {_join_phrases(phrases)}"


def _output_action_sentence(
    outputs: list[dict[str, Any]],
    *,
    include_labels: bool,
    source_locators: set[str] | None = None,
) -> str:
    phrases = [
        _output_action_phrase(output, include_labels=include_labels, source_locators=source_locators or set())
        for output in outputs
    ]
    phrases = [phrase for phrase in phrases if phrase]
    if not phrases:
        return ""
    return _join_phrases(phrases)


def _merged_output_sentence(outputs: list[dict[str, Any]], *, include_labels: bool) -> str:
    phrases: list[str] = []
    task_outputs = [
        output
        for output in outputs
        if isinstance(output, dict) and str(output.get("surface", "")).strip() == "android.task"
    ]
    grouped_task_ids = {id(output) for output in task_outputs} if len(task_outputs) > 1 else set()
    project_outputs = [
        output
        for output in outputs
        if isinstance(output, dict) and str(output.get("surface", "")).strip() == "linux.vscode_project"
    ]
    grouped_project_ids = {id(output) for output in project_outputs} if len(project_outputs) > 1 else set()
    if len(task_outputs) > 1:
        devices = sorted({str(output.get("device_id", "")).strip() for output in task_outputs if output.get("device_id")})
        device_phrase = ""
        if len(devices) == 1:
            device_phrase = f" on {_natural_device_reference(devices[0], compact=not include_labels)}"
        hint = ""
        if any("notes" in str(output.get("completion_condition", "")).lower() for output in task_outputs):
            if any(
                "source job_id" in str(output.get("completion_condition", "")).lower()
                or "source id" in str(output.get("completion_condition", "")).lower()
                or "job_id" in str(output.get("completion_condition", "")).lower()
                for output in task_outputs
            ):
                hint = " with notes that include the source ID"
            else:
                hint = " with the requested notes"
        phrases.append(f"create the requested Tasks app items{device_phrase}{hint}")
    if len(project_outputs) > 1:
        devices = sorted({str(output.get("device_id", "")).strip() for output in project_outputs if output.get("device_id")})
        if len(devices) == 2:
            phrases.append("update the requested project copies on both Linux devices")
        else:
            phrases.append("update the requested Linux project copies")
    for output in outputs:
        if id(output) in grouped_task_ids or id(output) in grouped_project_ids:
            continue
        phrases.append(_output_action_phrase(output, include_labels=include_labels, source_locators=set()))
    phrases = [phrase for phrase in phrases if phrase]
    if not phrases:
        return ""
    return _join_phrases(phrases)


def _ultra_compact_output_sentence(outputs: list[dict[str, Any]], *, preserve_object_names: bool = True) -> str:
    phrases = [_ultra_compact_output_phrase(output, preserve_object_names=preserve_object_names) for output in outputs]
    phrases = [phrase for phrase in phrases if phrase]
    if not phrases:
        return ""
    return _join_phrases(phrases)


def _minimal_output_summary_sentence(outputs: list[dict[str, Any]]) -> str:
    project_outputs = [
        output
        for output in outputs
        if isinstance(output, dict) and str(output.get("surface", "")).strip() == "linux.vscode_project"
    ]
    grouped_project_ids = {id(output) for output in project_outputs} if len(project_outputs) > 1 else set()
    phrases: list[str] = []
    if len(project_outputs) > 1:
        phrases.append("update requested Linux project copies")
    phrases.extend(
        _minimal_output_action_summary_phrase(output)
        for output in outputs
        if id(output) not in grouped_project_ids
    )
    phrases = [phrase for phrase in phrases if phrase]
    if not phrases:
        return ""
    return _join_phrases(phrases)


def _minimal_output_action_summary_phrase(item: dict[str, Any]) -> str:
    phrase = _minimal_output_summary_phrase(item)
    if not phrase:
        return ""
    surface = str(item.get("surface", "")).strip()
    if surface == "android.sms":
        return phrase.replace("requested Simple SMS Messenger reply", "send requested Simple SMS Messenger reply", 1)
    if surface in {
        "android.task",
        "android.calendar_event",
        "android.contacts",
        "android.recipe",
        "android.clock_alarm_timer",
        "android.osmand_favorite_marker",
        "android.retro_music_playlist",
        "android.markor_note",
        "android.simple_draw",
        "linux.thunderbird_draft",
    }:
        return f"create {phrase}"
    if surface == "linux.vscode_project":
        return f"update {phrase}"
    if str(item.get("visible_name_or_path", "")).strip().startswith("/"):
        return f"save {phrase}"
    return f"complete {phrase}"


def _minimal_output_summary_phrase(item: dict[str, Any]) -> str:
    device_id = str(item.get("device_id", "")).strip()
    surface = str(item.get("surface", "")).strip()
    name = str(item.get("visible_name_or_path", "")).strip()
    if not device_id:
        return ""
    device_ref = _natural_device_reference(device_id, compact=True)
    hint = _output_requirement_hint(item)
    if name.startswith("/"):
        parent = str(Path(name).parent)
        parent_phrase = f" in `{parent}/`" if parent and parent != "." else ""
        if surface == "linux.odp_pptx":
            return f"requested deck{parent_phrase} on {device_ref}"
        if surface == "linux.xlsx":
            return f"requested spreadsheet{parent_phrase} on {device_ref}"
        if surface == "linux.pdf":
            return f"requested PDF{parent_phrase} on {device_ref}"
        if surface == "linux.vscode_project":
            return f"requested project file{parent_phrase} on {device_ref}"
        return f"requested file{parent_phrase} on {device_ref}"
    surface_labels = {
        "android.task": "requested Tasks app task",
        "android.calendar_event": "requested Simple Calendar Pro event",
        "android.contacts": "requested Android Contacts entry",
        "android.recipe": "requested Broccoli app recipe",
        "android.clock_alarm_timer": "requested Android Clock item",
        "android.osmand_favorite_marker": "requested OsmAnd favorite",
        "android.retro_music_playlist": "requested Retro Music playlist",
        "android.markor_note": "requested Markor note",
        "android.simple_draw": "requested Simple Draw Pro drawing",
        "android.sms": "requested Simple SMS Messenger reply",
        "linux.thunderbird_draft": "requested Thunderbird draft",
    }
    label = surface_labels.get(surface, "requested output")
    return f"{label}{hint} on {device_ref}"


def _ultra_compact_output_phrase(item: dict[str, Any], *, preserve_object_names: bool = True) -> str:
    device_id = str(item.get("device_id", "")).strip()
    surface = str(item.get("surface", "")).strip()
    name = str(item.get("visible_name_or_path", "")).strip()
    if not device_id:
        return ""
    device_ref = _natural_device_reference(device_id, compact=True)
    if name.startswith("/"):
        parent = str(Path(name).parent)
        parent_phrase = f" under `{parent}/`" if parent and parent != "." else ""
        if surface == "linux.odp_pptx":
            return f"save the requested deck{parent_phrase} on {device_ref}"
        if surface == "linux.vscode_project":
            return f"update the requested project file{parent_phrase} on {device_ref}"
        return f"save the requested file{parent_phrase} on {device_ref}"
    if surface == "android.task":
        return f"create the requested Tasks app task{_output_requirement_hint(item)} on {device_ref}"
    if surface == "android.markor_note":
        if preserve_object_names and name:
            return f"create {name} on {device_ref}"
        return f"create the requested Markor note on {device_ref}"
    if surface == "android.sms":
        return f"send the requested Simple SMS Messenger reply on {device_ref}"
    if surface == "linux.thunderbird_draft":
        return f"create the requested Thunderbird draft on {device_ref}"
    label = SURFACE_INSTRUCTION_LABELS.get(surface, "output")
    return f"create the requested {label} on {device_ref}{_output_requirement_hint(item)}"


def _terse_locator_phrase(item: dict[str, Any]) -> str:
    device_id = str(item.get("device_id", "")).strip()
    name = str(item.get("visible_name_or_path", "")).strip()
    surface = str(item.get("surface", "")).strip()
    if not device_id or not name:
        return ""
    device_ref = _natural_device_reference(device_id, compact=True)
    label = SURFACE_INSTRUCTION_LABELS.get(surface, surface or "")
    quoted_name = _quote_locator(name)
    if device_id.startswith("android_") and label and not _locator_name_includes_label(quoted_name, label):
        if label == "Android Files":
            return f"{device_ref} Files {quoted_name}"
        return f"{device_ref} {label} {quoted_name}"
    return f"{device_ref} {quoted_name}"


def _terse_output_action_phrase(item: dict[str, Any], *, source_locators: set[str]) -> str:
    device_id = str(item.get("device_id", "")).strip()
    name = str(item.get("visible_name_or_path", "")).strip()
    if not device_id or not name:
        return ""
    verb = _output_action_verb(item, name=name, source_locators=source_locators)
    return f"{verb} {_terse_locator_phrase(item)}{_output_requirement_hint(item)}"


def _output_action_phrase(
    item: dict[str, Any],
    *,
    include_labels: bool,
    source_locators: set[str],
) -> str:
    device_id = str(item.get("device_id", "")).strip()
    name = str(item.get("visible_name_or_path", "")).strip()
    if not device_id or not name:
        return ""
    locator = _output_locator_phrase(item, include_labels=include_labels)
    verb = _output_action_verb(item, name=name, source_locators=source_locators)
    hint = _output_requirement_hint(item)
    return f"{verb} {locator}{hint}"


def _output_action_verb(item: dict[str, Any], *, name: str, source_locators: set[str]) -> str:
    if name in source_locators:
        return "update"
    if name.startswith("/"):
        return "save"
    surface = str(item.get("surface", "")).strip()
    if surface in {
        "android.task",
        "android.calendar_event",
        "android.contacts",
        "android.recipe",
        "android.clock_alarm_timer",
        "android.osmand_favorite_marker",
        "android.retro_music_playlist",
        "android.markor_note",
        "android.simple_draw",
        "linux.thunderbird_draft",
    }:
        return "create"
    if surface == "android.sms":
        return "send"
    return "complete"


def _output_requirement_hint(item: dict[str, Any]) -> str:
    surface = str(item.get("surface", "")).strip()
    condition = str(item.get("completion_condition", ""))
    condition_lower = condition.lower()
    if surface == "android.task" and "notes" in condition_lower:
        if "source job_id" in condition_lower or "source id" in condition_lower or "job_id" in condition_lower:
            return " with notes that include the source ID"
        return " with source-derived notes"
    if surface == "android.calendar_event" and "description" in condition_lower:
        return " with a source-derived description"
    if surface == "android.contacts" and "notes" in condition_lower:
        return " with the requested contact notes"
    return ""


def _source_locator_phrase(item: dict[str, Any], *, include_labels: bool) -> str:
    device_id = str(item.get("device_id", "")).strip()
    name = str(item.get("visible_name_or_path", "")).strip()
    surface = str(item.get("surface", "")).strip()
    if not device_id or not name:
        return ""
    device_ref = _natural_device_reference(device_id, compact=not include_labels)
    label = SURFACE_INSTRUCTION_LABELS.get(surface, surface or "source")
    name = _quote_locator(name)
    if name.startswith("`/"):
        if device_id.startswith("android_") and label:
            return f"{label} {name} on {device_ref}"
        return f"{name} on {device_ref}"
    keep_android_label = device_id.startswith("android_")
    prefix = "" if (not include_labels and not keep_android_label) or _locator_name_includes_label(name, label) else f"{label} "
    if _locator_name_mentions_device(name, device_id, device_ref=device_ref):
        return f"{prefix}{name}"
    return f"{prefix}{name} on {device_ref}"


def _output_locator_phrase(item: dict[str, Any], *, include_labels: bool) -> str:
    device_id = str(item.get("device_id", "")).strip()
    name = str(item.get("visible_name_or_path", "")).strip()
    surface = str(item.get("surface", "")).strip()
    if not device_id or not name:
        return ""
    device_ref = _natural_device_reference(device_id, compact=not include_labels)
    label = SURFACE_INSTRUCTION_LABELS.get(surface, surface or "output")
    name = _quote_locator(name)
    if name.startswith("`/"):
        if device_id.startswith("android_") and label:
            return f"{label} {name} on {device_ref}"
        return f"{name} on {device_ref}"
    keep_android_label = device_id.startswith("android_")
    prefix = "" if (not include_labels and not keep_android_label) or _locator_name_includes_label(name, label) else f"{label} "
    if _locator_name_mentions_device(name, device_id, device_ref=device_ref):
        return f"{prefix}{name}"
    return f"{prefix}{name} on {device_ref}"


def _natural_device_reference(device_id: str, *, compact: bool = False) -> str:
    match = re.fullmatch(r"(android|linux)_(\d+)", device_id)
    if not match:
        return "the selected device"
    family, index_text = match.groups()
    family_label = "Android" if family == "android" else "Linux"
    ordinals = ("first", "second", "third", "fourth")
    index = int(index_text)
    ordinal = ordinals[index] if 0 <= index < len(ordinals) else f"number {index + 1}"
    if compact:
        return f"{ordinal} {family_label}"
    return f"the {ordinal} {family_label} device"


def _quote_locator(value: str) -> str:
    if value.startswith("`") and value.endswith("`"):
        return value
    if value.startswith("/"):
        return f"`{value}`"
    return value


def _locator_name_includes_label(name: str, label: str) -> bool:
    name_lower = name.lower()
    label_lower = label.lower()
    if label_lower and label_lower in name_lower:
        return True
    if label_lower.startswith("android "):
        android_app_label = label_lower.split(" ", 1)[1]
        if android_app_label and android_app_label in name_lower:
            return True
    first_label_word = label_lower.split(" ", 1)[0]
    if first_label_word in {"android", "simple", "text/markdown", "writer", "impress"}:
        return False
    return bool(first_label_word and first_label_word in name_lower)


def _locator_name_mentions_device(name: str, device_id: str, *, device_ref: str | None = None) -> bool:
    normalized = name.lower().replace("_", " ").replace("-", " ")
    device_normalized = device_id.lower().replace("_", " ")
    if device_id.lower() in name.lower() or device_normalized in normalized:
        return True
    if device_ref and device_ref.lower() in name.lower():
        return True
    return False


def _join_phrases(phrases: list[str]) -> str:
    if len(phrases) == 1:
        return phrases[0]
    if len(phrases) == 2:
        return f"{phrases[0]} and {phrases[1]}"
    return f"{', '.join(phrases[:-1])}, and {phrases[-1]}"


def _stage2_retry_messages(
    sample: dict[str, Any],
    instruction: dict[str, Any],
    review_errors: list[str],
    *,
    attempt: int,
    prompt_variant: str,
    profile_name: str,
) -> list[dict[str, str]]:
    messages = build_stage2_task_design_review_messages(
        sample,
        instruction,
        prompt_variant=prompt_variant,
        profile_name=profile_name,
    )
    errors = "\n".join(f"- {error}" for error in review_errors)
    original_instruction = str(instruction.get("instruction", "")).strip()
    target_len = min(350, max(180, int(len(original_instruction) * 0.8))) if original_instruction else 300
    retry_kind = "hard compression rewrite" if attempt >= 2 else "compression rewrite"
    messages.append(
        {
            "role": "user",
            "content": (
                "Your accepted Stage2 review failed optimized_instruction lint errors:\n"
                f"{errors}\n\n"
                f"This is attempt {attempt}/2. Perform a {retry_kind}.\n"
                f"Original instruction length: {len(original_instruction)} chars. "
                f"Target optimized_instruction length: <= {target_len} chars.\n"
                "Return the same Stage2 JSON contract again. If the task design is otherwise valid, "
                "rewrite only optimized_instruction and instruction_revision_notes so the instruction "
                "keeps full app names, source/target locators, and a natural user style while delegating "
                "source details to the visible sources. Do not add field lists, mappings, exact final values, "
                "confirmation steps, examples, or execution details that were not already necessary in the "
                "original instruction; prefer phrasing like 'follow the request/page/document/source'. "
                "If the lint error reveals missing agent-visible information that wording cannot safely fix, "
                "return decision='revise' with blocking_issues."
            ),
        }
    )
    return messages


def _first_failed_stage(stages: dict[str, Any]) -> str | None:
    for stage_name, stage in stages.items():
        for key, value in stage.items():
            if key.endswith("_errors") and value:
                return stage_name
        static_report = stage.get("static_report") if isinstance(stage, dict) else None
        if isinstance(static_report, dict) and not static_report.get("passed", True):
            return stage_name
        for key, value in stage.items():
            if key.endswith("_report") and isinstance(value, dict) and value.get("passed") is False:
                return stage_name
    return None


def _call_json_model(
    chat_fn,
    provider_config: dict[str, str],
    model: str,
    messages: list[dict[str, str]],
    *,
    temperature: float,
) -> dict[str, Any]:
    retry_messages = messages
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            response = chat_fn(
                base_url=provider_config["base_url"],
                api_key=provider_config["api_key"],
                model=model,
                messages=retry_messages,
                temperature=temperature,
            )
        except (TimeoutError, ConnectionError, OSError) as exc:
            last_error = exc
            if attempt < 2:
                time.sleep(2**attempt)
                continue
            break
        try:
            return json.loads(response["choices"][0]["message"]["content"])
        except (json.JSONDecodeError, KeyError, IndexError, TypeError) as exc:
            last_error = exc
            retry_messages = [
                *messages,
                {
                    "role": "user",
                    "content": (
                        "Your previous response was not a valid JSON object. "
                        "Return only one complete JSON object that follows the requested schema. "
                        "Do not include Markdown fences, prose, or an empty response."
                    ),
                },
            ]
            if attempt < 2:
                continue
    assert last_error is not None
    raise last_error


def _failed_record(stages: dict[str, Any], stage: str) -> dict[str, Any]:
    return {"status": "failed", "failure_stage": stage, "stages": stages}


def _emit_progress(progress_fn: ProgressFn | None, stage: str, event: str, **extra: Any) -> None:
    if progress_fn is None:
        return
    payload = {"stage": stage, "event": event}
    payload.update(extra)
    progress_fn(payload)


def _task_id_from_title(title: str) -> str:
    chars = [char.lower() if char.isalnum() else "_" for char in title]
    compact = "_".join(part for part in "".join(chars).split("_") if part)
    return f"generated_{compact or 'task'}_001"
