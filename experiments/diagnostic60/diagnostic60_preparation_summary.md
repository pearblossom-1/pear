# DevicesWorld Diagnostic-60 Preparation Summary

> Current gate: **final sample and reviewed proposals frozen; awaiting human go-ahead for executable construction; no formal run started**.

This directory implements the pre-run deliverables requested by `docs/plan1/devicesworld_diagnostic60_decomposition_experiment_plan.md`.

## Completed proposal artifacts

| Plan deliverable | Artifact | Current status |
| --- | --- | --- |
| Core-200 metadata | `metadata_core200.jsonl` and `../manifests/core200.jsonl` | 200 unique frozen task references |
| Stratified sample | `diagnostic60_primary.jsonl` and `diagnostic60_backup.jsonl` | original 60 primary + 20 disjoint backups retained, seed 20260806 |
| Final sample | `diagnostic60_final.jsonl` and `diagnostic60_replacement_log.jsonl` | frozen 60; one documented Primary-to-Backup replacement |
| Sampling report | `diagnostic60_sampling_report.md` | all effective coverage minima met; result-blind input boundary documented |
| Dependency graphs | `diagnostic60_dependency_graph_proposal.md` | 60 reviewed and frozen task DAG proposals |
| Device-local decomposition | `diagnostic60_decomposition_proposals.jsonl` and `diagnostic60_decomposition_proposal.md` | 235 frozen stage blueprints; not executable |
| Stage evaluation method | `diagnostic60_stage_evaluation_method_proposal.md` | frozen ownership mapping + fixed semantic-judge prompt/protocol |
| Remaining human decisions | `diagnostic60_human_review_questions.md` | go-ahead, judge model/settings, and E2E-version decision |

## Proposal totals

- Tasks: **60**.
- Stages: **235**; kinds: `{"environment_execution": 86, "information_acquisition": 149}`.
- Original evaluator references mapped exactly once: **147**, of which **127** are scored in the original tasks.
- Evaluator ownership: `local_stage=108`, `local_guard=38`, `global_only=1`.
- Maximum-layer distribution by task: `{"2": 42, "3": 18}`.
- Model-result inputs used for sampling or decomposition: **0**.
- Executable stage tasks created: **0**.
- Model, Android, Linux VM, or SmartHome experiment runs started: **0**.

## Required next decision

Obtain human confirmation of the frozen artifacts and select the concrete semantic-judge model/settings. After confirmation, construct executable stages from the frozen contracts. Do not launch formal stages or modify tasks from model results at this gate.
