# DevicesWorld Diagnostic-60 Sampling Report

> This report records the original result-blind Primary-60 and Backup-20 sampling. The reviewed frozen list is `diagnostic60_final.jsonl`: Primary rank 42 alone was replaced with Backup rank 15, as recorded in `diagnostic60_replacement_log.jsonl`. No resampling occurred.

## Freeze inputs

- Core-200 equivalent manifest: `tasks/mdcbench_lite/mdcbench_lite_v1.json`
- Benchmark label: `MDCBench Lite v1`
- Source Git commit: `2bbd3b7b627b9f1f5dff91bf9b257b8c529b148d`
- Sampling seed: `20260806`
- Core task count: **200**; primary count: **60**; backup count: **20**.
- Selection uses only task identity, manifest family/difficulty/surface tags, task setup, and scored evaluator structure.
- No model success, score, trajectory, failure category, token, duration, or prior run artifact is used.
- Topology minima use multi-label `topology_tags`; `primary_topology` is the single dominant label used for distribution reporting.

## Constraint status

| Constraint | Requested | Available | Effective | Primary | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| `environment_scope=same_class_multi_device` | 12 | 38 | 12 | 12 | met |
| `environment_scope=two_environment` | 12 | 122 | 12 | 35 | met |
| `environment_scope=three_environment` | 12 | 30 | 12 | 12 | met |
| `device_count=2` | 12 | 95 | 12 | 27 | met |
| `device_count=3` | 12 | 66 | 12 | 20 | met |
| `device_count=4` | 12 | 29 | 12 | 12 | met |
| `difficulty_label=easy` | 15 | 42 | 15 | 15 | met |
| `difficulty_label=medium` | 15 | 108 | 15 | 30 | met |
| `difficulty_label=hard` | 15 | 50 | 15 | 15 | met |
| `topology_tag=chain` | 6 | 6 | 6 | 6 | met |
| `topology_tag=fan_in` | 6 | 181 | 6 | 53 | met |
| `topology_tag=fan_out` | 6 | 96 | 6 | 30 | met |
| `topology_tag=return_dependency` | 6 | 8 | 6 | 6 | met |
| `topology_tag=multi_output_joint_postconditions` | 6 | 132 | 6 | 37 | met |
| `feasibility_type=infeasible` | 4 | 9 | 4 | 4 | met |

## Coverage distributions

### Environment scope

| Value | Core-200 | Primary-60 | Backup-20 |
| --- | ---: | ---: | ---: |
| `same_class_multi_device` | 38 | 12 | 4 |
| `single_environment` | 10 | 1 | 1 |
| `three_environment` | 30 | 12 | 4 |
| `two_environment` | 122 | 35 | 11 |

### Device count

| Value | Core-200 | Primary-60 | Backup-20 |
| --- | ---: | ---: | ---: |
| `1` | 10 | 1 | 1 |
| `2` | 95 | 27 | 9 |
| `3` | 66 | 20 | 6 |
| `4` | 29 | 12 | 4 |

### Difficulty

| Value | Core-200 | Primary-60 | Backup-20 |
| --- | ---: | ---: | ---: |
| `easy` | 42 | 15 | 5 |
| `hard` | 50 | 15 | 5 |
| `medium` | 108 | 30 | 10 |

### Primary topology

| Value | Core-200 | Primary-60 | Backup-20 |
| --- | ---: | ---: | ---: |
| `chain` | 6 | 6 | 0 |
| `fan_in` | 88 | 23 | 8 |
| `fan_out` | 3 | 0 | 0 |
| `multi_output_joint_postconditions` | 92 | 25 | 10 |
| `other` | 3 | 0 | 0 |
| `return_dependency` | 8 | 6 | 2 |

### Feasibility

| Value | Core-200 | Primary-60 | Backup-20 |
| --- | ---: | ---: | ---: |
| `feasible` | 191 | 56 | 19 |
| `infeasible` | 9 | 4 | 1 |

### Manifest family

| Value | Core-200 | Primary-60 | Backup-20 |
| --- | ---: | ---: | ---: |
| `android_only` | 15 | 4 | 2 |
| `android_smarthome` | 25 | 6 | 1 |
| `linux_android` | 45 | 14 | 3 |
| `linux_android_smarthome` | 30 | 12 | 4 |
| `linux_only` | 15 | 5 | 2 |
| `linux_smarthome` | 30 | 8 | 5 |
| `real100` | 8 | 5 | 0 |
| `real200` | 10 | 2 | 0 |
| `real300` | 12 | 3 | 2 |
| `smarthome_generated_scripted` | 10 | 1 | 1 |

### Topology tags

| Value | Core-200 | Primary-60 | Backup-20 |
| --- | ---: | ---: | ---: |
| `chain` | 6 | 6 | 0 |
| `fan_in` | 181 | 53 | 19 |
| `fan_out` | 96 | 30 | 11 |
| `multi_output_joint_postconditions` | 132 | 37 | 15 |
| `other` | 3 | 0 | 0 |
| `return_dependency` | 8 | 6 | 2 |

### Apps and surfaces

| Value | Core-200 | Primary-60 | Backup-20 |
| --- | ---: | ---: | ---: |
| `android files` | 3 | 2 | 0 |
| `audio` | 1 | 1 | 0 |
| `audio recorder` | 2 | 1 | 0 |
| `broccoli app` | 5 | 2 | 1 |
| `browser_web` | 21 | 8 | 2 |
| `calendar` | 40 | 13 | 2 |
| `camera` | 1 | 1 | 0 |
| `clock` | 9 | 3 | 1 |
| `code_cli` | 28 | 9 | 4 |
| `contacts` | 42 | 13 | 3 |
| `csv` | 9 | 4 | 2 |
| `documents` | 42 | 15 | 4 |
| `email` | 2 | 1 | 0 |
| `files` | 153 | 47 | 17 |
| `html` | 1 | 1 | 0 |
| `image` | 2 | 0 | 1 |
| `json` | 3 | 1 | 1 |
| `json_structured` | 38 | 11 | 4 |
| `linux.html_browser` | 1 | 0 | 0 |
| `linux.odt_docx` | 1 | 0 | 0 |
| `linux.pdf` | 1 | 1 | 0 |
| `linux.text_markdown` | 1 | 0 | 0 |
| `linux.vlc_playback` | 1 | 0 | 0 |
| `linux.xlsx` | 1 | 1 | 0 |
| `linux.zip_archive` | 1 | 1 | 0 |
| `maps_osmand` | 21 | 6 | 2 |
| `markdown` | 2 | 1 | 0 |
| `markor` | 62 | 19 | 3 |
| `media_audio` | 22 | 6 | 4 |
| `media_image` | 20 | 6 | 3 |
| `osmand` | 14 | 4 | 1 |
| `pdf` | 1 | 0 | 0 |
| `python` | 4 | 0 | 1 |
| `retro music` | 14 | 5 | 2 |
| `simple calendar pro` | 39 | 12 | 2 |
| `simple gallery pro` | 9 | 3 | 1 |
| `simple sms messenger` | 54 | 17 | 4 |
| `smarthome_control` | 58 | 15 | 7 |
| `smarthome_schedule` | 25 | 4 | 1 |
| `smarthome_state` | 54 | 12 | 5 |
| `smarthome_workflow` | 25 | 8 | 2 |
| `sms_email` | 67 | 19 | 7 |
| `tables` | 106 | 35 | 10 |
| `tasks` | 17 | 9 | 3 |
| `tasks_notes` | 75 | 23 | 4 |
| `tests` | 3 | 0 | 0 |
| `text` | 5 | 1 | 1 |
| `xlsx` | 2 | 1 | 0 |
| `zip` | 1 | 0 | 1 |

## Family diversity

- Core-200 family keys: **171**.
- Primary family keys: **58**.
- Maximum primary repetition: **2** (cap: 2).
- Repeated primary families: `{"structural_v1:android_smarthome:S021": 2, "structural_v1:linux_android_smarthome:S008": 2}`.
- These values are near-duplicate/dedup signatures only, not a formal task-family taxonomy. Explicit `metadata.motif` and `metadata.sh_type` identifiers take priority; all other keys use the documented structural signature in `metadata_core200.jsonl`.

## Relaxation log

- None. All effective primary constraints are satisfied.

## Unknown or derived metadata

- `builder_id=unknown`: **200** tasks. The task files contain no explicit builder/template identifier; source-plan names were not relabeled as builders.
- Task-family ID methods: `{"auditable_structural_signature_v1": 160, "metadata.motif": 30, "metadata.sh_type": 10}`.
- `source_types` contains `unknown`: **0** tasks. IDs: `none`.
- `primary_topology=other`: **3** tasks. IDs: `sh4_time_schedule_study_focus_sequence_feasible_0030, sh3_explicit_control_close_living_curtain_feasible_0001, sh4_time_schedule_living_ac_temperature_feasible_0032`.
- `gold_or_estimated_steps` unavailable: **200** tasks; values remain `null` rather than being guessed.
- `dependency_depth` and `expected_stages` are deterministic structural proxies, not gold action counts.

## Determinism and audit boundary

- The generator performs an in-memory second run and requires identical primary and backup task ID order.
- The test suite mutates performance-related manifest fields and requires the selected task IDs to remain unchanged.
- Primary and backup are disjoint, and all JSONL records use versioned schemas.
- The structural proxy is not a taxonomy or blocking issue; its only role is near-duplicate/dedup control in the original sampler.
- No stage task, decomposition spec, model run, or automatic replacement is produced by this sampling generator; decomposition proposals are separate human-review-gated artifacts.

## Researcher confirmation

- Confirm that the paper term **Core-200** refers to the frozen final `MDCBench Lite v1` manifest above.
- Review tasks whose topology is `other` or whose source type is `unknown` before freezing Diagnostic-60.
- Review the primary and backup lists for semantic near-duplicates; do not use model performance during that review.
