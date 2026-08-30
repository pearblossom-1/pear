# Diagnostic-60 Remaining Human-Review Questions

> The task-level review is complete and the proposal is frozen but not executable. Human go-ahead is required before executable stage construction; no model/device run is authorized here.

## Resolved in this review

- Primary-60 was not resampled. Rank 42 alone changed: the single-device `sh2_implicit_intent_nursery_air_comfort_infeasible_0011` was replaced with Backup rank 15 `linux_smarthome_373`; the reason and strata comparison are in `diagnostic60_replacement_log.jsonl`.
- Structural family proxy is accepted only as a near-duplicate/dedup signature. It is not a formal task-family taxonomy and is not a blocking issue.
- All DAGs were reviewed. Independent outputs no longer receive an ordering edge merely because the instruction lists one action before another.
- **71** same-device later-layer re-entries remain, each with an explicit dependency cause in the JSONL proposal.
- Evaluator ownership is frozen as `local_stage`, `local_guard`, or `global_only`; no global evaluator is forced into a local stage.
- Gold handoff/state contracts are source-grounded and frozen for later executable materialization. Evaluator-only values are excluded from stage instructions.

## Task-level final confirmation

| Confirmation | Approved tasks |
| --- | ---: |
| no over-split | 60/60 |
| no missing dependency | 60/60 |
| correct device assignment | 60/60 |
| correct gold handoff/state contract | 60/60 |
| no stage-instruction answer leakage | 60/60 |

There are no remaining task-specific blocking questions in the frozen proposal.

## Remaining human decisions

1. Approve this frozen final manifest, replacement, DAG, decomposition, gold-contract lineage, and evaluator mapping as the basis for executable stage construction.
2. Select and freeze the concrete semantic-judge model/version and decoding settings. The prompt/protocol ID `diagnostic60.semantic_handoff_judge.v1` is already frozen.
3. Before formal runs, decide whether existing E2E results are task-version/configuration identical to this final Diagnostic-60; otherwise schedule fresh E2E runs after executable construction.

On approval, the next step is executable stage construction only. Do not start GPT-5.5 stage runs or revise tasks from model outcomes at this gate.
