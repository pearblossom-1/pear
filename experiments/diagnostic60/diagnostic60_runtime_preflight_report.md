# Diagnostic-60 Prompt v2 Cleanup and Final Runtime Preflight

> Status: **runtime implementation frozen; all requested preflight checks pass; formal 235-stage batch not started**.

## Frozen design preserved

- Final Diagnostic-60 remains 60 tasks and 235 stages; sampling, dependency DAGs, stage boundaries, evaluator ownership, and gold semantics were not redesigned.
- `al_tutorial_screenshot.S01` was corrected before formal runs to require request/tutorial identity, status, `working_directory`, and exact command. The DAG is unchanged.
- Formal isolated-stage runs started: **0/235**. Only the representative smoke cases below were executed.

## Prompt v2 and runtime adaptation

- Android, Linux, and SmartHome prompt v2 are generated from the Core-200 GPT-5.5 baseline system prompt constructor. They retain baseline agent/recovery/completion behavior and only the corresponding action reference.
- Model-visible framing describes a normal task on one current device. It uses `Task`, optional `Available context`, `Current device`, `Current observation`, and recent interaction history; experiment-internal terminology remains only in specs and logs.
- The model omits `target_device` and top-level `device_id`; runtime routing still uses the executable spec's target device. SmartHome physical appliance IDs remain under `parameters.device_id`.
- Budget v2 is 30 Core-compatible recorded interactions and 600 seconds of post-reset agent execution. Setup/materialization, evaluation/judge, and cleanup use separate timeouts.
- The 600-second deadline also interrupts blocking model/environment calls and cannot be consumed by ordinary client retry handling.

## Model-visible request validation

- Every actual request from the five prompt-v2 lifecycle smoke runs was checked.
- Android, Linux, and SmartHome are all represented.
- Forbidden experiment-term hits: **0**.

## Semantic Judge v2 endpoint smoke

- Synthetic and real stage-format requests both serialized, connected, and parsed with the frozen strict schema on the first attempt.
- Labels: `['PASS', 'PASS']`. The frozen prompt/config was not changed from smoke behavior.

## Real lifecycle smoke

| Stage | Device | Coverage | Lifecycle | Model stage result | Steps | Agent | Total lifecycle |
| --- | --- | --- | --- | --- | ---: | ---: | ---: |
| `a2l_contact_otp_web_form.S01` | `android_0` | android_information_semantic_judge | PASS | True | 1 | 13.860s | 40.275s |
| `a2_missing_media_status.S02` | `android_1` | android_environment_local_evaluator | PASS | False | 1 | 29.641s | 54.339s |
| `linux_android_smarthome_338.S07` | `home_0` | smarthome_environment_local_evaluator | PASS | True | 2 | 13.389s | 13.669s |
| `linux_android_1241.S03` | `linux_0` | linux_same_device_reentry_gold_state | PASS | False | 2 | 28.285s | 125.808s |
| `a2l2_vscode_web_music_final_gate.S05` | `linux_1` | linux_native_artifact_transfer | PASS | False | 6 | 600.005s | 699.791s |

Model-level PASS/FAIL outcomes above are valid smoke trajectories, not implementation blockers. They did not trigger further prompt, DAG, contract, or decomposition changes.

Two implementation issues were found and fixed. Linux cleanup initially inherited a 60-second VMware command timeout despite its 180-second infrastructure phase; generated Linux stage configs now use 170 seconds, and the same re-entry lifecycle passed setup, evaluation, and cleanup on rerun. Separately, an Exception-based agent deadline was caught by model-client retry handling, allowing one artifact smoke to exceed 600 seconds. The original over-budget attempt remains recorded; the deadline now bypasses ordinary retry catches, and the artifact lifecycle was rerun under the corrected boundary.

Native artifact transfer was exercised with the frozen HTML bytes uploaded to Linux1. Every downstream smoke used frozen gold inputs and records `actual_predecessor_outputs_used=false`. Model-level evaluator outcomes are reported as observed and were not used to alter the protocol.

## `linux_android_1324` clean E2E rerun

- Old process-timeout attempt preserved: **yes**.
- New mode/model/config: `baseline_multi_device`, `gpt-5.5`, Core-200 baseline multi-device prompt, max 50 steps, 1800 seconds, last-10 history, original `local_2android_linux.json` environment.
- Result: **PASS**, score `1.0`, `15` steps, `360.682s`, cleanup `PASS`.
- Result reference: `runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260830_task041_clean_e2e_run_01/041_linux_android_1324/result.json`.

## Validation

- `all_five_representative_lifecycles_pass`: **PASS**
- `all_smoke_records_match_current_frozen_specs`: **PASS**
- `all_single_device_runtime_checks_pass`: **PASS**
- `all_prompt_v2_model_visible_requests_pass`: **PASS**
- `all_smoke_agent_durations_within_frozen_budget`: **PASS**
- `formal_logging_contract_pass`: **PASS**
- `semantic_judge_endpoint_pass`: **PASS**
- `linux_cleanup_correction_verified`: **PASS**
- `agent_deadline_correction_verified`: **PASS**
- `clean_e2e_rerun_completed`: **PASS**

## Remaining blockers

No executable implementation or runtime preflight blocker remains. The only remaining gate is explicit human approval before starting `GPT-5.5 × 235 single-device local-task runs`.
