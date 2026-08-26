# Core200 final QA report

Date: 2026-08-26 (America/Los_Angeles)

Baseline branch: `origin/all-task-update-intergration`

Baseline commit: `98a55f32bd9f7eba856cd2ba0ab9a28d5d0526ac`

AllTask pre-freeze commit: `f7c129ff5`

QA worktree: `workflow/integration_worktrees/core200-final-qa-20260825`

Pear publication path: `tasks/core200_final_qa_report.md`

## Final status

- `CORE200_TASK_FREEZE_READY=YES`
- `CORE200_FROZEN=YES`
- `RUNTIME_SMOKE_PENDING=NONE`
- `ANDROID_FORMAL_ACTION_ADAPTER_SMOKE=PASS`

The final freeze gate is complete. The remaining task consistency issue and Pear
runtime publication issue were fixed, all six pending tasks passed real-application
smokes with production score 1.0, the formal Android action adapter passed without
a direct-touch bypass, and the targeted automated and Core200 manifest gates have
zero failures.

## Freeze-gate changes

| Area | Files | Outcome |
| --- | --- | --- |
| Android + SmartHome | `android_smarthome_219.json`; mirrored `episode_config.json` | Set `require_category_alias=false` while retaining target, reason, minimum matching-report count, contradiction rejection, and no-home-mutation scoring. |
| Linux + Android | `linux_android_1078.json`; mirrored episode/oracle/scripted assets | Reset stale Markor app state, initialize the visible lowercase `Documents/markor` target as blank, recover through the app onboarding, and align the evaluator/artifact path with the real visible file. The instruction and business outcome are unchanged. |
| Linux + Android + SmartHome | `linux_android_smarthome_185.json`; mirrored `episode_config.json` | Added the real natural contraction “doesn't support dimming” to the existing accepted capability explanation. Both native no-device-change evaluators remain scored. |
| Regression coverage | `tests/plan8/test_core200_final_qa.py` | Added production-evaluator regressions for the 219 category contract, the 185 natural SMS, and the 1078 reset/path contract. |
| Pear runtime publication | `patches/core200_entity_relations.patch`; `MDCBENCH_PROJECT_UPDATE_GUIDE.md` | Regenerated the compatibility patch from the clean target base to final production and documented when it is mandatory. |

No Core200 instruction, manifest membership, or manifest order was changed during
this freeze gate. No Android action-adapter code change was needed.

## 1. `android_smarthome_219`

The public contract requires a correct report about the bedroom light's unavailable
color control and the reason, but does not expose an internal report-category
taxonomy. Both the task and mirrored episode now use:

```text
semantic_report.require_category_alias = false
semantic_report.reject_nonmatching_reports = false
```

Production regression results:

- `unsupported_capability`, `capability_unavailable`, and `feature_missing` pass
  when the target and reason are correct.
- A wrong target, a false claim that color was changed, or any Home mutation fails.

Result: **PASS**.

## 2. Pear evaluator patch

`patches/core200_entity_relations.patch` was regenerated from clean MDCBench base
`12af909416` to final AllTask production `f7c129ff5`. The complete dependency set is
included because the final entity-relation implementation imports the related
canonicalization behavior:

- `mdcbench/evaluation/entity_relations.py`
- `mdcbench/evaluation/semantic_change.py`
- `mdcbench/evaluation/status_relations.py`

The patch includes `required_patterns`, `conflict_patterns`, `ordered_entities`,
`semantic_record_table`, and single-record prefix binding. The Pear guide now says:
if the destination runtime already contains the final changes, do not reapply the
patch; otherwise the patch must be applied before running Core200.

Validation in a clean worktree at the patch base:

| Gate | Result |
| --- | --- |
| Pear patch regenerated from final production runtime | YES |
| `git apply --check` | PASS |
| clean `git apply` | PASS |
| patched files equal final production files | PASS |
| `py_compile` | PASS |
| natural regressions for `linux_only_298`, `android_only_254`, `linux_android_1078`, and `a2_alarm_conflict_log` | PASS |
| “Reviewer Mara handles session S-84 with clip long_audio_A.wav.” | PASS |

Result: **PASS**.

## 3. Six final real-application smokes

These six runs used visible application state and normal Agent actions through the
formal benchmark environment. No oracle solution created the result. Each final
score came from the task's production evaluator.

| Task | Status | Production score | Evidence |
| --- | --- | ---: | --- |
| `android_only_254` | PASS | 1.0 | Read Nora Bennett's number and handoff preference on phone 1, read the Cargo check event on phone 2, and sent the field-complete confirmation to `555-4827`. Artifact: `runs/core200_final_freeze_20260825/android_only_254`. |
| `linux_only_298` | PASS | 1.0 | Read the active-session CSV and clip directory, then wrote natural prose binding `S-84`, `long_audio_A.wav`, and Mara. Artifact: `runs/core200_final_freeze_20260825/linux_only_298`. |
| `linux_android_1078` | PASS | 1.0 | Read the Linux records and latest SMS, left the visible form unsubmitted, and wrote the blocked status in the real Markor target. Both Markor and form-state evaluators passed. Artifact: `runs/core200_final_freeze_20260825/linux_android_1078_retry13`. |
| `linux_smarthome_350` | PASS | 1.0 | Read `request.docx`, wrote the source-defined `result.json`, and made no Home change or plan. Artifact: `runs/core200_final_freeze_20260825/linux_smarthome_350`. |
| `linux_android_smarthome_185` | PASS | 1.0 | Sent the natural unsupported-dimming explanation; both the basic and dimmable living-room lights remained unchanged. Artifact: `runs/core200_final_freeze_20260825/linux_android_smarthome_185_retry1`. |
| `l2_csv_to_json` | PASS | 1.0 | Read the CSV and created JSON with numeric `qty` and boolean `rush`; canonical record evaluation passed. Artifact: `runs/core200_final_freeze_20260825/l2_csv_to_json`. |

The first exploratory runs exposed two concrete, reachable configuration issues:
the 185 phrase list omitted the common contraction “doesn't support”, and 1078 used
a Markor path/reset sequence that did not match clean-device visible behavior. The
local fixes above were retested through the normal app path; the table records only
the final passing runs.

## 4. Android formal action adapter

- Action path: production `AndroidRuntime` through the formal
  `android.json_action` click/input API.
- Screenshot convention: integer pixels in the current screenshot, origin at the
  top-left, portrait orientation.
- Screenshot/logical/device/physical resolution: `1080 x 2400`.
- Markor Search control bounds: `x=870..975`, `y=138..264`.
- Adapter click input `(922, 201)` transformed to `(922, 201)` and opened Search.
- Search input bounds: `x=92..988`, `y=978..1096`.
- Adapter click input `(540, 1037)` transformed to `(540, 1037)`; formal
  `input_text` produced visible text `adapter smoke` in that field.
- Scaling, DPI, status-bar, navigation-bar, crop/letterbox, portrait-transform, and
  Y-axis distortion: not observed.
- Direct-touch/adb-tap bypass used: **NO**.
- Evidence: `/private/tmp/core200_android_adapter_smoke`.

Result: `ANDROID_FORMAL_ACTION_ADAPTER_SMOKE=PASS`. No runtime adapter change was
required.

## 5. Runtime and Core200 manifest gates

Runtime capabilities confirmed in the final production scorer:

- `required_patterns`
- `conflict_patterns`
- `ordered_entities`
- `semantic_record_table`

The authoritative manifest validation resolves task paths, run configs, source Lite
manifests, episode/oracle/scripted-solution references, and local setup assets. It
also rejects different sources uploaded to the same target on the same device.

| Measure | Result |
| --- | ---: |
| `core200_total` | 200 |
| `missing_task_files` | 0 |
| `duplicate_ids` | 0 |
| `missing_refs` | 0 |
| `invalid_json` | 0 |
| `upload_target_conflicts` | 0 |

## 6. Automated validation

- `python -m py_compile` for `entity_relations.py`, `semantic_change.py`, and
  `status_relations.py`: PASS.
- `pytest tests/plan8/test_core200_final_qa.py -q --tb=short`: 10 passed.
- Related existing evaluator/Lite suites covering the affected behavior: 246
  passed.
- Pear task/asset copies changed in this gate were directly compared with AllTask:
  all identical.
- Failing tests: 0.

## 7. Freeze decision

Every condition in the final freeze document is satisfied. Core200 task repair must
stop here unless baseline or human evaluation later exposes a concrete reproducible
problem.

```text
CORE200_TASK_FREEZE_READY=YES
CORE200_FROZEN=YES
RUNTIME_SMOKE_PENDING=NONE
ANDROID_FORMAL_ACTION_ADAPTER_SMOKE=PASS
```
