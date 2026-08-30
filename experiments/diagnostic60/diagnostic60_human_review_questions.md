# Diagnostic-60 Remaining Human-Review Questions

> Executable construction and final runtime preflight are complete. Formal GPT-5.5 isolated-stage runs remain stopped pending explicit human confirmation below.

## Resolved

- Final-60 sampling/replacement, all 60 DAGs, 235 stage boundaries, device assignments, same-device re-entry causes, and evaluator ownership remain frozen.
- The 60 frozen DAGs, 235 boundaries, dependency edges, device assignments, and evaluator ownership were preserved without structural edits.
- Semantic judge v2 model/settings/prompt/schema and the isolated-stage budget are frozen.
- Android, Linux, and SmartHome Prompt v2 use ordinary single-device task framing; the actual smoke requests contain no forbidden experiment framing.
- 149 information handoffs, 19 environment predecessor states/artifacts, and 235 executable specs are materialized without using model trajectories or predecessor isolated outputs. Complete source evidence is retained separately from the minimal downstream projection.
- The sole global-only evaluator remains task-global and is not forced into Local-All.
- `al_tutorial_screenshot.S01` now explicitly requires request/tutorial identity, status, `working_directory`, and command; the correction reason is recorded without changing its DAG.
- Semantic Judge endpoint serialization/connectivity/parsing passed for synthetic and real stage-format cases without changing the frozen prompt.
- Android, Linux, SmartHome, same-device re-entry, gold predecessor state, and native artifact-transfer lifecycles passed. The recorded Linux cleanup timeout and agent-deadline retry interception were corrected without changing the frozen task protocol.
- `linux_android_1324` now has a clean version-matched E2E PASS; the old process-timeout attempt remains preserved.

## Remaining confirmation

1. After reviewing the frozen artifacts and `diagnostic60_runtime_preflight_report.md`, explicitly approve starting the formal Diagnostic-60 GPT-5.5 isolated-stage experiment.

No executable implementation or runtime blocker remains. This human gate is not a reason to resample, change the Core-200 tasks, alter the frozen DAG, or localize the global-only evaluator.
