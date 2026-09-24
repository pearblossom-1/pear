from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


CATALOG_PATH = Path(__file__).resolve().parent / "surface_capabilities.yaml"

_DESIGN_FIELDS = (
    "display_name",
    "user_visible_constraints",
    "stable_sources",
    "stable_outputs",
    "unsupported_designs",
)

_IMPLEMENTATION_FIELDS = (
    "implementation_notes",
    "generation_rules",
    "setup_interfaces",
    "evaluation_interfaces",
)


def load_surface_capability_catalog() -> dict[str, Any]:
    catalog = yaml.safe_load(CATALOG_PATH.read_text(encoding="utf-8"))
    if not isinstance(catalog, dict):
        raise ValueError("surface_capability_catalog_must_be_mapping")
    if not isinstance(catalog.get("surfaces"), dict):
        raise ValueError("surface_capability_catalog_missing_surfaces")
    return catalog


def build_surface_capability_context(sample: dict[str, Any], *, include_implementation: bool = False) -> dict[str, Any]:
    catalog = load_surface_capability_catalog()
    surfaces = catalog["surfaces"]
    selected_surface_ids = _sample_surface_ids(sample)
    selected: dict[str, Any] = {}
    for surface_id in selected_surface_ids:
        if surface_id not in surfaces:
            raise ValueError(f"unknown_surface_capability: {surface_id}")
        selected[surface_id] = _surface_prompt_entry(
            surfaces[surface_id],
            include_implementation=include_implementation,
        )
    interface_details = (
        _selected_runtime_interface_details(catalog, selected.values())
        if include_implementation
        else {}
    )

    return {
        "sample_surface_capabilities": selected,
        "runtime_interface_details": interface_details,
        "prompt_snippet": _render_prompt_snippet(selected, interface_details=interface_details),
    }


def _surface_prompt_entry(surface: dict[str, Any], *, include_implementation: bool) -> dict[str, Any]:
    entry = {
        field: _field_value(surface, field)
        for field in _DESIGN_FIELDS
    }
    if not entry.get("user_visible_constraints"):
        entry["user_visible_constraints"] = [
            "Use this surface through the user-visible app, file, or document object named by the task design.",
            "Do not expose helper names, evaluator names, database paths, or benchmark implementation paths in instruction.",
        ]
    if include_implementation:
        for field in _IMPLEMENTATION_FIELDS:
            entry[field] = _field_value(surface, field)
    return entry


def _field_value(surface: dict[str, Any], field: str) -> Any:
    value = surface.get(field)
    if value is not None:
        return value
    return [] if field.endswith("s") else ""


def _sample_surface_ids(sample: dict[str, Any]) -> list[str]:
    device_surfaces = sample.get("device_surfaces", {})
    if not isinstance(device_surfaces, dict):
        return []
    ordered: list[str] = []
    seen: set[str] = set()
    for device_id in sample.get("devices", []):
        for surface_id in device_surfaces.get(device_id, []):
            normalized = str(surface_id)
            if normalized not in seen:
                ordered.append(normalized)
                seen.add(normalized)
    return ordered


def _selected_runtime_interface_details(catalog: dict[str, Any], selected_surfaces: Any) -> dict[str, Any]:
    details = catalog.get("runtime_interface_details")
    if not isinstance(details, dict):
        return {}

    setup_names: set[str] = set()
    getter_names: set[str] = set()
    func_names: set[str] = set()
    for surface in selected_surfaces:
        if not isinstance(surface, dict):
            continue
        for item in surface.get("setup_interfaces", []):
            setup_names.add(_interface_name(item))
        for item in surface.get("evaluation_interfaces", []):
            name = _interface_name(item)
            if name in {"exact_match", "contains", "check_include_exclude", "check_csv", "check_json", "check_xlsx_cells", "check_image_dimensions", "check_odf_text", "check_docx_text", "compare_archive", "compare_pdf_images", "compare_pdfs", "is_expected_bookmarks", "is_expected_tabs", "bookmark_folder_urls", "check_python_file_by_test_suite", "compare_docx_files", "compare_docx_tables", "compare_image_text"}:
                func_names.add(name)
            else:
                getter_names.add(name)

    return {
        "setup_actions": _filter_details(details.get("setup_actions"), setup_names),
        "getters": _filter_details(details.get("getters"), getter_names),
        "evaluator_funcs": _filter_details(details.get("evaluator_funcs"), func_names),
    }


def _filter_details(detail_map: Any, names: set[str]) -> dict[str, Any]:
    if not isinstance(detail_map, dict):
        return {}
    return {
        name: detail_map[name]
        for name in sorted(names)
        if name in detail_map
    }


def _interface_name(value: Any) -> str:
    return str(value).split(":", 1)[0]


def _render_prompt_snippet(selected: dict[str, Any], *, interface_details: dict[str, Any] | None = None) -> str:
    if not selected:
        return "No sampled Android/Linux surface capabilities were provided."
    payload: dict[str, Any] = {"sample_surface_capabilities": selected}
    if interface_details:
        compact_details = {key: value for key, value in interface_details.items() if value}
        if compact_details:
            payload["runtime_interface_details_for_selected_surfaces"] = compact_details
    return yaml.safe_dump(
        payload,
        allow_unicode=True,
        sort_keys=False,
        width=120,
    ).strip()
