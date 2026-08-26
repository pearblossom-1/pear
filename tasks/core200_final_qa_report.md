# Core200 final QA report

Date: 2026-08-25 (America/Los_Angeles)

Baseline branch: `origin/all-task-update-intergration`

Baseline commit: `98a55f32bd9f7eba856cd2ba0ab9a28d5d0526ac`

AllTask submission commit: `f7c129ff5`

QA worktree: `workflow/integration_worktrees/core200-final-qa-20260825`

Pear publication path: `tasks/core200_final_qa_report.md`

## Final status

- `CORE200_TASK_FREEZE_READY=YES`
- `CORE200_FROZEN=NO`
- `RUNTIME_SMOKE_PENDING=android_only_254,linux_only_298,linux_android_1078,linux_smarthome_350,linux_android_smarthome_185,l2_csv_to_json`

The task/configuration changes, natural-language regressions, runtime gate, and full
Core200 manifest validation pass. Two recommended Android smoke tasks passed through
real application interaction and the production evaluator. Six recommended smoke
tasks remain environment-pending, so this report does not declare the Core200 set
fully frozen.

## Changes made

| Area | Files | Outcome |
| --- | --- | --- |
| Runtime | `mdcbench/evaluation/entity_relations.py` | A single-record `semantic_record_table` now includes the same sentence/paragraph prefix before its only anchor. This accepts natural forms such as “Reviewer Mara handles session S-84” without binding earlier history. |
| Android + SmartHome infeasible | `tasks/cross_device/android_smarthome/android_smarthome_219.json`; mirrored `episode_config.json` | Kept the public-contract-supported “unsupported capability” category requirement; removed the unsupported one-report-only restriction. |
| Android + SmartHome infeasible | `android_smarthome_231.json`, `android_smarthome_233.json`; mirrored `episode_config.json` files | Removed hidden category-alias and reject-nonmatching restrictions. Existing no-SMS/no-home-mutation outcomes remain. |
| Linux + Android | `linux_android_1078.json`; mirrored `episode_config.json` | Replaced broad `ready`/`submitted` conflicts with direct success contradictions and allowed natural negative-status wording. |
| Linux + Android + SmartHome | `linux_android_smarthome_185.json`; mirrored `episode_config.json` | Removed the SMS self-report “unchanged” requirement, retained both native no-device-change evaluators, and accepted natural “not dimmable/cannot be applied” explanations. |
| Linux only | `linux_only_298.json`; mirrored `episode_config.json` | Allowed the required negative status “S-71 is not active/the active session” and narrowed the conflicting-active-session pattern. |
| real200 | `real200/a2_alarm_conflict_log.json`; `real200_assets/a2_alarm_conflict_log/manifest.json` | Made record mention order flexible while retaining strict label/time/role binding and entity-bound contradiction rejection. Synchronized task metadata with `ordered: false`. |
| Regression coverage | `tests/plan8/test_core200_final_qa.py` | Added production-scorer natural variants for six focus tasks, mirror checks, and full Core200 manifest/reference/asset validation. |
| Report | `tasks/core200_final_qa_report.md` in Pear | Records decisions, validation, real-device evidence, pending environment gates, and freeze status. |

No changes were required for `linux_smarthome_348` or
`linux_smarthome_350`.

## Focus-task decisions

| Task | Decision |
| --- | --- |
| `linux_android_smarthome_185` | Fixed P1. The SMS need only explain that the requested dimming cannot be applied; it no longer has to assert that the device was unchanged. Both `check_no_device_change` evaluators still score the actual SmartHome state. |
| `android_smarthome_233` | Removed hidden taxonomy and one-report restrictions. Exact sent-SMS count zero and no-home-mutation scoring remain. Real smoke passed. |
| `linux_android_1078` | “not ready/not submitted” no longer conflicts merely because it contains `ready` or `submitted`. Direct success claims still fail. |
| `linux_only_298` | The required negative statement about S-71 is accepted; a direct claim that S-71 is active still fails. |
| `a2_alarm_conflict_log` | Either mention order is accepted when both alarm records keep their own label, time, and role. Real smoke passed with “added instead of replacing”. |
| `linux_smarthome_348` | Correct as-is after DOCX audit; no change. |
| `linux_smarthome_350` | Correct as-is after DOCX and evaluator audit; no change. |

## Infeasible-report scan

All nine Core200 tasks using `smarthome.check_infeasible_report` were checked.

| Task | Category alias | Reject nonmatching reports | Result |
| --- | ---: | ---: | --- |
| `android_smarthome_219` | kept `true` | changed to `false` | The visible source explicitly asks to report an unsupported capability, but does not impose a one-report-only contract. |
| `android_smarthome_231` | changed to `false` | changed to `false` | The public instruction provides no category taxonomy or one-report limit. |
| `android_smarthome_233` | changed to `false` | changed to `false` | The public instruction provides no category taxonomy or one-report limit. |
| `sh2_implicit_intent_nursery_air_comfort_infeasible_0011` | already `false` | already `false` | Correct as-is. |
| `sh3_explicit_control_plain_light_dimming_infeasible_0013` | already `false` | already `false` | Correct as-is. |
| `sh1_state_inquiry_bedroom_energy_query_infeasible_0012` | already `false` | already `false` | Correct as-is. |
| `sh4_time_schedule_missing_balcony_light_infeasible_0014` | already `false` | already `false` | Correct as-is. |
| `sh5_event_schedule_plain_light_dim_after_dryer_infeasible_0016` | already `false` | already `false` | Correct as-is. |
| `sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016` | already `false` | already `false` | Correct as-is. |

## DOCX source audit

- `linux_smarthome_348/source/tmp/climate/priority.docx` visibly contains
  `selected`, `ignored`, `mode`, and `target_temperature_c`. Its evaluator
  contract is supported by the source document.
- `linux_smarthome_350/source/tmp/maintenance/request.docx` visibly contains
  `missing_anchor`, `status`, and `reason_code`, including the controlled
  choices/anchor needed by the task.
- For 350, `check_no_home_mutation` remains a scored evaluator.
  `check_command_history_count` remains diagnostic with
  `enable_score_calc=false`.

## Runtime and manifest gates

Runtime capabilities confirmed in the production scorer:

- `required_patterns`
- `conflict_patterns`
- `ordered_entities`
- `semantic_record_table`

`python -m py_compile mdcbench/evaluation/entity_relations.py` passed.

The authoritative Core200 manifest validation passed:

| Measure | Result |
| --- | ---: |
| `core200_total` | 200 |
| `missing_task_files` | 0 |
| `duplicate_ids` | 0 |
| `missing_refs` | 0 |
| `invalid_json` | 0 |
| `upload_target_conflicts` | 0 |

The validation resolves task paths, run configs, source Lite manifests,
episode/oracle/scripted-solution references, and local setup assets. It also rejects
same-device/same-target uploads from different sources.

## Natural-language regression

The new regression suite calls the production evaluators rather than a substitute
oracle.

| Task | Covered behavior |
| --- | --- |
| `android_only_254` | Natural confirmation order/format variants pass; wrong time/dock and direct contradiction fail. |
| `android_smarthome_233` | Natural infeasible reasons pass without hidden taxonomy; wrong target/reason and contradictions fail. |
| `linux_android_1078` | “not ready/not submitted” variants pass; direct successful-submission claims fail. |
| `linux_android_smarthome_185` | “not dimmable/cannot be applied” variants pass without a self-reported unchanged claim; wrong capability/relation fails. |
| `linux_only_298` | Natural negative-active-session variants pass; a direct active-session claim fails. |
| `a2_alarm_conflict_log` | Prose/table/order variants pass with correct record binding; swapped time/role and direct replacement contradictions fail. |

## Human-evaluation source of truth

A repository search found no current benchmark/runtime/test consumer of legacy
`core_tasks_*` or Core review Markdown files, and the Pear `tasks/` tree in the
available worktree contains no competing Core review notes. The authoritative
inputs for this QA are therefore the task JSON files plus
`experiments/human_validation1000/core200_manifest.jsonl`. No human-review note
was changed.

## Real application smoke

These runs used visible application state and normal UI/device actions through the
benchmark environment (with direct Android touch/keyboard input when the
benchmark coordinate adapter distorted Y coordinates). No oracle solution was
used to create the result. Final scoring used each task's production evaluator.

| Task | Status | Evidence |
| --- | --- | --- |
| `android_smarthome_233` | **PASS** | Real emulator SMS showed “Set kitchen aroma diffuser to lavender.” Home exposed no kitchen aroma diffuser. The agent submitted a normal infeasible report and sent no SMS. Production result: score 1.0, including infeasible report, sent-SMS exact count 0, and no-home-mutation. |
| `a2_alarm_conflict_log` | **PASS** | Calendar UI exposed the 08:20 Depot departure event. Clock UI retained enabled 07:50 Depot preparation and added enabled 08:20 Depot departure. Markor UI created `Documents/Markor/Alarm fix.md` with both labels/times and “added instead of replacing”. Production result: score 1.0 across all three evaluators. |
| `android_only_254` | **NOT_RUN_ENVIRONMENT** | Dual-Android setup/reset did not reach READY within 90 seconds and remained in Android runtime setup. This is not recorded as a task failure or pass. |
| `linux_only_298` | **NOT_RUN_ENVIRONMENT** | Linux VM unavailable: VMware `vmrun -T fusion list` could not start. |
| `linux_android_1078` | **NOT_RUN_ENVIRONMENT** | Linux VM unavailable. |
| `linux_smarthome_350` | **NOT_RUN_ENVIRONMENT** | Linux VM unavailable. |
| `linux_android_smarthome_185` | **NOT_RUN_ENVIRONMENT** | Linux VM unavailable. |
| `l2_csv_to_json` | **NOT_RUN_ENVIRONMENT** | Its Core200 run config is `local_2linux.json`; Linux VM unavailable. |

The in-app Computer Use native pipe was unavailable in this environment. The
project's purpose-built `MultiDeviceEnv` and visible Android UI were used instead.

## Automated validation results

- `pytest tests/test_runtime_evaluator_updates.py tests/test_core200_final_qa.py -q`
  before moving the new test out of the ignored root-test path: 21 passed.
- `pytest tests/plan8/test_linux_android_smarthome_final_frozen_v1.py tests/test_human_validation1000_replanning.py -q`:
  38 passed.
- `pytest tests/plan8/test_core200_final_qa.py -q` after moving the test into a
  trackable directory: 8 passed.
- `python -m py_compile mdcbench/evaluation/entity_relations.py`: passed.

## Freeze decision

No task-level failure remains in the checks that actually ran. The task set is
ready to freeze after the six pending environment smokes are executed on available
hardware. Until then, the correct state is:

```text
CORE200_TASK_FREEZE_READY=YES
CORE200_FROZEN=NO
RUNTIME_SMOKE_PENDING=android_only_254,linux_only_298,linux_android_1078,linux_smarthome_350,linux_android_smarthome_185,l2_csv_to_json
```
