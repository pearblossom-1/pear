# Diagnostic-60 Remaining Human-Review Questions

> Executable construction is complete. Formal GPT-5.5 isolated-stage runs remain stopped pending the frozen-contract decision, smoke blockers, and human confirmation below.

## Resolved

- Final-60 sampling/replacement, all 60 DAGs, 235 stage boundaries, device assignments, same-device re-entry causes, and evaluator ownership remain frozen.
- The 60 frozen DAGs, 235 boundaries, dependency edges, device assignments, and evaluator ownership were preserved without structural edits.
- Semantic judge v2 model/settings/prompt/schema and the isolated-stage budget are frozen.
- 149 information handoffs, 19 environment predecessor states/artifacts, and 235 executable specs are materialized without using model trajectories or predecessor isolated outputs. Complete source evidence is retained separately from the minimal downstream projection.
- The sole global-only evaluator remains task-global and is not forced into Local-All.

## Remaining blocking confirmations

1. Decide whether to allow a narrow freeze exception for `al_tutorial_screenshot.S01`: its frozen instruction/contract asks for title/status but the selected working directory and command are also required downstream. The materialized gold is complete; the frozen instruction was not silently changed.
2. Resolve or explicitly accept every runtime blocker recorded in `diagnostic60_validation_smoke_report.md`, including the live semantic-judge endpoint check and unavailable Linux VM lifecycle smoke.
3. Supply a clean, version-matched E2E outcome for every Final-60 task before calculating E2E or Composition Gap; do not silently treat an environment/process failure as model failure.
4. After reviewing the artifacts and smoke report, explicitly approve starting the formal Diagnostic-60 GPT-5.5 isolated-stage experiment.

These are execution-gate questions, not reasons to resample, change the Core-200 tasks, alter the frozen DAG, or localize the global-only evaluator.
