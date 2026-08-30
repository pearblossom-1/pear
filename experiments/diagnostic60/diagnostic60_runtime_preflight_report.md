# Diagnostic-60 Final Runtime Adaptation and Preflight Validation

> Status: **runtime implementation frozen; all requested preflight checks pass; formal 235-stage batch not started**.

## Frozen design preserved

- Final Diagnostic-60 remains 60 tasks and 235 stages; sampling, dependency DAGs, stage boundaries, evaluator ownership, and gold semantics were not redesigned.
- `al_tutorial_screenshot.S01` was corrected before formal runs to require request/tutorial identity, status, `working_directory`, and exact command. The DAG is unchanged.
- Formal isolated-stage runs started: **0/235**. Only the representative smoke cases below were executed.

## Runtime adaptation

- Three prompts are generated from the Core-200 GPT-5.5 baseline system prompt constructor: Android, Linux, and SmartHome. Each keeps the baseline agent/recovery/completion behavior and only the corresponding action reference.
- Each turn contains one frozen device identity, one current local observation, persistent stage/gold predecessor context, and the last 10 local textual steps. Other-device observations and predecessor/sibling/E2E trajectories are absent.
- The model omits runner-level `device_id`; the runner routes every non-global action to the executable spec's frozen device. SmartHome physical appliance IDs remain under `parameters.device_id`.
- Budget v2 is 30 Core-compatible recorded interactions and 600 seconds of post-reset agent execution. Setup/materialization, evaluation/judge, and cleanup use separate timeouts.

## Semantic Judge v2 endpoint smoke

- Synthetic and real stage-format requests both serialized, connected, and parsed with the frozen strict schema on the first attempt.
- Labels: `['PASS', 'PASS']`. The frozen prompt/config was not changed from smoke behavior.

## Real lifecycle smoke

| Stage | Device | Coverage | Lifecycle | Model stage result | Steps | Agent | Total lifecycle |
| --- | --- | --- | --- | --- | ---: | ---: | ---: |
| `a2l_contact_otp_web_form.S01` | `android_0` | android_information_semantic_judge | PASS | True | 1 | 11.231s | 41.650s |
| `a2_missing_media_status.S02` | `android_1` | android_environment_local_evaluator | PASS | False | 9 | 367.989s | 391.731s |
| `linux_android_smarthome_338.S07` | `home_0` | smarthome_environment_local_evaluator | PASS | True | 3 | 19.075s | 19.490s |
| `linux_android_1241.S03` | `linux_0` | linux_same_device_reentry_gold_state | PASS | False | 2 | 18.060s | 114.108s |
| `a2l2_vscode_web_music_final_gate.S05` | `linux_1` | linux_native_artifact_transfer | PASS | True | 8 | 141.798s | 247.408s |

The two model-level stage failures above are valid smoke trajectories, not implementation blockers. They did not trigger prompt, DAG, contract, or decomposition changes.

One implementation issue was found and fixed: Linux cleanup initially inherited a 60-second VMware command timeout despite its 180-second infrastructure phase. The pre-correction run remains recorded as infrastructure failure; generated Linux stage configs now use 170 seconds, and the same re-entry lifecycle passed setup, evaluation, and cleanup on rerun.

Native artifact transfer was exercised with the frozen HTML bytes uploaded to Linux1; both assigned local evaluators passed. Every downstream smoke used frozen gold inputs and records `actual_predecessor_outputs_used=false`.

## `linux_android_1324` clean E2E rerun

- Old process-timeout attempt preserved: **yes**.
- New mode/model/config: `baseline_multi_device`, `gpt-5.5`, Core-200 baseline multi-device prompt, max 50 steps, 1800 seconds, last-10 history, original `local_2android_linux.json` environment.
- Result: **PASS**, score `1.0`, `15` steps, `360.682s`, cleanup `PASS`.
- Result reference: `runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260830_task041_clean_e2e_run_01/041_linux_android_1324/result.json`.

## Validation

- `all_five_representative_lifecycles_pass`: **PASS**
- `all_smoke_records_match_current_frozen_specs`: **PASS**
- `all_single_device_runtime_checks_pass`: **PASS**
- `formal_logging_contract_pass`: **PASS**
- `semantic_judge_endpoint_pass`: **PASS**
- `linux_cleanup_correction_verified`: **PASS**
- `clean_e2e_rerun_completed`: **PASS**

## Remaining blockers

No executable implementation or runtime preflight blocker remains. The only remaining gate is explicit human approval before starting `GPT-5.5 × 235 isolated stages`.
