# DevicesWorld Diagnostic-60 Preparation Summary

> Current gate: **sampling and decomposition proposal complete; human review pending; no formal run started**.

This directory implements the pre-run deliverables requested by `docs/plan1/devicesworld_diagnostic60_decomposition_experiment_plan.md`.

## Completed proposal artifacts

| Plan deliverable | Artifact | Current status |
| --- | --- | --- |
| Core-200 metadata | `metadata_core200.jsonl` and `../manifests/core200.jsonl` | 200 unique frozen task references |
| Stratified sample | `diagnostic60_primary.jsonl` and `diagnostic60_backup.jsonl` | 60 primary + 20 disjoint backups, seed 20260806 |
| Sampling report | `diagnostic60_sampling_report.md` | all effective coverage minima met; result-blind input boundary documented |
| Dependency graphs | `diagnostic60_dependency_graph_proposal.md` | 60 task DAG proposals |
| Device-local decomposition | `diagnostic60_decomposition_proposals.jsonl` and `diagnostic60_decomposition_proposal.md` | 238 proposed stages, pending review |
| Stage evaluation method | `diagnostic60_stage_evaluation_method_proposal.md` | original evaluator subsets + fixed semantic-judge proposal |
| Human confirmation list | `diagnostic60_human_review_questions.md` | blocking global decisions and 60-task sign-off queue |

## Proposal totals

- Tasks: **60**.
- Stages: **238**; kinds: `{"environment_execution": 90, "information_acquisition": 148}`.
- Original evaluator references assigned exactly once: **146**, of which **127** are scored in the original tasks.
- Maximum-layer distribution by task: `{"1": 1, "2": 36, "3": 23}`.
- Model-result inputs used for sampling or decomposition: **0**.
- Executable stage tasks created: **0**.
- Model, Android, Linux VM, or SmartHome experiment runs started: **0**.

## Required next decision

Review and freeze the Primary-60 list, every dependency edge, device assignment, gold semantic handoff, environment-state overlay, evaluator subset, and stage-instruction leakage check. Only after all retained tasks are approved should executable stage construction begin.
