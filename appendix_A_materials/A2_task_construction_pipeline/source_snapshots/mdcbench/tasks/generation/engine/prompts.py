from __future__ import annotations

from typing import Any

from mdcbench.tasks.generation.prompt_loader import render_prompt_messages
from mdcbench.tasks.generation.engine.pattern_catalog import PATTERN_CATALOG
from mdcbench.tasks.generation.profiles.registry import DEFAULT_PROFILE_NAME, get_active_profile


DEFAULT_PROMPT_VARIANT = "default"


def build_stage1_task_design_messages(
    sample: dict[str, Any],
    *,
    prompt_variant: str = DEFAULT_PROMPT_VARIANT,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> list[dict[str, str]]:
    _validate_prompt_variant(prompt_variant)
    profile = get_active_profile(profile_name)
    build_surface_capability_context = profile.require_surface_capability_context_builder()
    surface_capability_context = build_surface_capability_context(sample)
    return render_prompt_messages(
        profile.require_prompt_path("stage1_task_design.yaml"),
        {
            "sample_json": sample,
            "surface_capability_context": surface_capability_context["prompt_snippet"],
            "pattern_catalog": PATTERN_CATALOG,
            "extra_constraints": "Use only the sampled devices and surfaces. Do not change feasibility_type.",
        },
    )


def build_stage2_task_design_review_messages(
    sample: dict[str, Any],
    task_design: dict[str, Any],
    *,
    prompt_variant: str = DEFAULT_PROMPT_VARIANT,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> list[dict[str, str]]:
    _validate_prompt_variant(prompt_variant)
    profile = get_active_profile(profile_name)
    build_surface_capability_context = profile.require_surface_capability_context_builder()
    surface_capability_context = build_surface_capability_context(sample, include_implementation=True)
    return render_prompt_messages(
        profile.require_prompt_path("stage2_task_design_review.yaml"),
        {
            "sample_json": sample,
            "task_design_json": task_design,
            "surface_capability_context": surface_capability_context["prompt_snippet"],
        },
    )


def build_stage2_instruction_compression_repair_messages(
    sample: dict[str, Any],
    task_design: dict[str, Any],
    review: dict[str, Any],
    review_errors: list[str],
    *,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> list[dict[str, str]]:
    profile = get_active_profile(profile_name)
    return render_prompt_messages(
        profile.require_prompt_path("stage2_instruction_compression_repair.yaml"),
        {
            "sample_json": sample,
            "task_design_json": task_design,
            "review_json": review,
            "review_errors_json": review_errors,
        },
    )


def build_stage3_task_design_repair_messages(
    sample: dict[str, Any],
    task_design: dict[str, Any],
    review: dict[str, Any],
    *,
    prompt_variant: str = DEFAULT_PROMPT_VARIANT,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> list[dict[str, str]]:
    _validate_prompt_variant(prompt_variant)
    profile = get_active_profile(profile_name)
    build_surface_capability_context = profile.require_surface_capability_context_builder()
    surface_capability_context = build_surface_capability_context(sample, include_implementation=True)
    return render_prompt_messages(
        profile.require_prompt_path("stage3_task_design_repair.yaml"),
        {
            "sample_json": sample,
            "task_design_json": task_design,
            "review_json": review,
            "surface_capability_context": surface_capability_context["prompt_snippet"],
        },
    )


def _validate_prompt_variant(prompt_variant: str) -> None:
    if prompt_variant != DEFAULT_PROMPT_VARIANT:
        raise ValueError(f"unknown prompt_variant {prompt_variant}; only default prompts are active")


def build_stage4_asset_messages(
    task_design: dict[str, Any],
    *,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> list[dict[str, str]]:
    profile = get_active_profile(profile_name)
    return render_prompt_messages(
        profile.require_prompt_path("stage4_assets.yaml"),
        {"task_design_json": task_design},
    )


def build_stage4_asset_repair_messages(
    task_design: dict[str, Any],
    asset_plan: dict[str, Any],
    asset_errors: list[str],
    asset_quality_report: dict[str, Any],
    *,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> list[dict[str, str]]:
    profile = get_active_profile(profile_name)
    return render_prompt_messages(
        profile.require_prompt_path("stage4_asset_repair.yaml"),
        {
            "task_design_json": task_design,
            "asset_plan_json": asset_plan,
            "asset_errors_json": asset_errors,
            "asset_quality_report_json": asset_quality_report,
        },
    )


def build_stage5_setup_messages(
    sample: dict[str, Any],
    task_design: dict[str, Any],
    asset_plan: dict[str, Any],
    *,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> list[dict[str, str]]:
    profile = get_active_profile(profile_name)
    build_surface_capability_context = profile.require_surface_capability_context_builder()
    surface_capability_context = build_surface_capability_context(sample, include_implementation=True)
    return render_prompt_messages(
        profile.require_prompt_path("stage5_setup.yaml"),
        {
            "sample_json": sample,
            "task_design_json": task_design,
            "asset_plan_json": asset_plan,
            "surface_capability_context": surface_capability_context["prompt_snippet"],
        },
    )


def build_stage6_eval_cleanup_metadata_messages(
    sample: dict[str, Any],
    task_design: dict[str, Any],
    setup_plan: dict[str, Any],
    *,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> list[dict[str, str]]:
    profile = get_active_profile(profile_name)
    build_surface_capability_context = profile.require_surface_capability_context_builder()
    surface_capability_context = build_surface_capability_context(sample, include_implementation=True)
    return render_prompt_messages(
        profile.require_prompt_path("stage6_eval_cleanup_metadata.yaml"),
        {
            "sample_json": sample,
            "task_design_json": task_design,
            "setup_plan_json": setup_plan,
            "surface_capability_context": surface_capability_context["prompt_snippet"],
        },
    )


def build_stage7_oracle_messages(
    task_design: dict[str, Any],
    eval_cleanup_metadata_plan: dict[str, Any],
    *,
    profile_name: str = DEFAULT_PROFILE_NAME,
) -> list[dict[str, str]]:
    profile = get_active_profile(profile_name)
    return render_prompt_messages(
        profile.require_prompt_path("stage7_oracle.yaml"),
        {
            "task_design_json": task_design,
            "eval_cleanup_metadata_plan_json": eval_cleanup_metadata_plan,
        },
    )
