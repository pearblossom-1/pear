from __future__ import annotations


PATTERN_CATALOG = """\
direct_transfer: copy information across devices.
extract_transform: filter, compute, or convert information before output.
state_create_update: create/update app or file state from source.
sync_consistency: make fields consistent across devices.
multi_source_merge: combine multiple required sources.
dispatch_multi_device: one source assigns work to multiple devices/outputs.
validate_and_correct: generate then verify/correct using another source.
conflict_resolve: resolve visible conflicts by rule.
missing_or_infeasible: report missing/unavailable condition.
multi_output_consistency: write the same derived result to multiple outputs.
control_state_loop: adjust one state based on another state/feedback.
"""


VALID_PATTERNS = {
    "direct_transfer",
    "extract_transform",
    "state_create_update",
    "sync_consistency",
    "multi_source_merge",
    "dispatch_multi_device",
    "validate_and_correct",
    "conflict_resolve",
    "missing_or_infeasible",
    "multi_output_consistency",
    "control_state_loop",
}

