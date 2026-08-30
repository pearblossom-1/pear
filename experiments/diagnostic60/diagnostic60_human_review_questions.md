# Diagnostic-60 Human Review Questions

> These questions are the blocking gate before sample freeze, gold-handoff materialization, executable-stage construction, or any model/device run.

## Global decisions

1. Confirm that `tasks/mdcbench_lite/mdcbench_lite_v1.json` at the sampled source commit is the paper's frozen Core-200.
2. Approve the Primary-60 list as representative, or replace rejected items only from the frozen Backup-20 without looking at model outcomes; record every replacement in `diagnostic60_replacement_log.jsonl`.
3. Core-200 contains no explicit builder/template IDs. Confirm that motif/sh_type where present plus the auditable structural-family proxy is acceptable for near-duplicate control.
4. Decide whether the single-device SmartHome infeasible case should remain as a local-solvability control or be replaced by a backup task.
5. Review every proposed edge and same-device re-entry; confirm that stages are semantic units, not primitive actions, and that no causal dependency is missing.
6. Materialize and approve each information stage's exact gold handoff. Verify that it contains downstream-required facts but is not copied into the stage instruction.
7. Approve each environment-state overlay method, especially cross-device file/document transfer and SmartHome postconditions.
8. Freeze the judge model/version, settings, and `diagnostic60.semantic_handoff_judge.v1` prompt before any run.
9. Decide whether existing E2E results are task-version/configuration identical; otherwise schedule fresh E2E runs only after decomposition freeze.

## Review workload by flag

| Flag | Tasks |
| --- | ---: |
| `cross_device_global_evaluator_requires_stage_ownership_review` | 1 |
| `gold_handoff_values_require_human_materialization` | 60 |
| `infeasible_case_report_and_no_mutation_contract` | 4 |
| `multi_output_stage_order_requires_review` | 27 |
| `no_oracle_reference_use_evaluator_and_source_assets` | 12 |
| `return_dependency_order_requires_review` | 6 |
| `same_device_reappears_in_later_dependency_layer` | 50 |
| `single_device_case_in_diagnostic60_confirm_retention` | 1 |
| `visual_source_requires_human_gold_review` | 4 |

## Task-level sign-off queue

| Rank | Task | Stages | Max layer | Blocking review question |
| ---: | --- | ---: | ---: | --- |
| 1 | `linux_android_1241` | 4 | 3 | Is the proposed return-stage ordering correct, including the same-device later layer? |
| 2 | `linux_android_1368` | 4 | 3 | Is the proposed return-stage ordering correct, including the same-device later layer? |
| 3 | `android_smarthome_233` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 4 | `a2l2_vscode_web_music_final_gate` | 5 | 3 | Is the proposed return-stage ordering correct, including the same-device later layer? |
| 5 | `linux_android_1858` | 3 | 2 | Is the proposed return-stage ordering correct, including the same-device later layer? |
| 6 | `linux_android_1034` | 5 | 2 | Is the proposed return-stage ordering correct, including the same-device later layer? |
| 7 | `a2_gallery_album_to_tasks` | 2 | 2 | Does the gold handoff capture the task-relevant visual fact without over-describing the image? |
| 8 | `a2_missing_media_status` | 2 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 9 | `linux_only_298` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 10 | `al_thunderbird_attachment_to_tasks` | 2 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 11 | `android_smarthome_219` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 12 | `al2_data_transform_sync` | 4 | 3 | Is the proposed return-stage ordering correct, including the same-device later layer? |
| 13 | `l2_csv_to_json` | 2 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 14 | `android_smarthome_231` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 15 | `linux_android_1831` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 16 | `linux_android_smarthome_897` | 7 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 17 | `linux_android_smarthome_113` | 6 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 18 | `linux_android_smarthome_470` | 6 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 19 | `linux_android_smarthome_696` | 5 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 20 | `linux_android_smarthome_474` | 5 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 21 | `linux_android_smarthome_077` | 5 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 22 | `android_only_285` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 23 | `linux_android_smarthome_423` | 6 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 24 | `linux_only_275` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 25 | `linux_android_smarthome_287` | 5 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 26 | `a2l2_training_media_deck_email` | 6 | 2 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 27 | `linux_only_283` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 28 | `linux_android_smarthome_271` | 5 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 29 | `linux_android_smarthome_338` | 7 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 30 | `linux_android_smarthome_288` | 5 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 31 | `linux_android_smarthome_439` | 6 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 32 | `linux_only_224` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 33 | `android_only_260` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 34 | `linux_android_997` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 35 | `android_only_218` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 36 | `linux_android_1798` | 4 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 37 | `linux_android_1859` | 5 | 2 | Does the gold handoff capture the task-relevant visual fact without over-describing the image? |
| 38 | `linux_only_327` | 4 | 2 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 39 | `linux_android_1866` | 5 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 40 | `android_only_210` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 41 | `linux_android_1863` | 5 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 42 | `sh2_implicit_intent_nursery_air_comfort_infeasible_0011` | 1 | 1 | Retain as a local control, or replace from Backup-20? |
| 43 | `linux_smarthome_350` | 4 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 44 | `al_request_audio` | 2 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 45 | `linux_smarthome_361` | 3 | 2 | Does the gold handoff capture the task-relevant visual fact without over-describing the image? |
| 46 | `android_smarthome_877` | 4 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 47 | `a2l_contact_otp_web_form` | 4 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 48 | `android_smarthome_336` | 4 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 49 | `linux_android_1274` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 50 | `linux_android_1324` | 5 | 2 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 51 | `linux_smarthome_063` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 52 | `linux_smarthome_999` | 5 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 53 | `linux_android_1255` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 54 | `linux_smarthome_932` | 5 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 55 | `al_tutorial_screenshot` | 2 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 56 | `linux_smarthome_656` | 4 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 57 | `linux_smarthome_983` | 5 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 58 | `linux_smarthome_098` | 3 | 2 | Are device assignment, handoff content, and evaluator subset correct? |
| 59 | `android_smarthome_149` | 5 | 3 | Should the proposed output stages be sequential as drawn, or independent in the same layer? |
| 60 | `linux_android_1814` | 4 | 2 | Are device assignment, handoff content, and evaluator subset correct? |

## Required sign-off fields per task

Mark all five fields in the JSONL proposal only after review: `confirm_no_over_split`, `confirm_no_missing_dependency`, `confirm_device_assignment`, `confirm_gold_handoffs`, and `confirm_stage_instruction_no_answer_leakage`. Then set `human_review.status` to `approved` or document a replacement/revision.

Until all 60 retained tasks are approved, the decomposition remains a proposal and no formal experiment should run.
