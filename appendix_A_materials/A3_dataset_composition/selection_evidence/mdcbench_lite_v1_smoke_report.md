# MDCBench Lite v1 Smoke Report

Status: **final current-hash lifecycle closure, 200/200 passed**.

Every final Lite v1 task must have a real smoke result. Dry-run and structural
checks are recorded only as supporting evidence; they do not satisfy final smoke.

## Smoke Standard

- Setup evaluation should fail before oracle/scripted solution.
- Oracle/scripted solution should make the task pass.
- Cleanup evaluation should fail after cleanup, confirming the task state was removed.
- Failed smoke must be followed by directed repair and rerun, or an auditable
  replacement with equivalent quota and coverage.

## 2026-07-29 Authoritative Current-Hash Run

- Evidence root: `runs/mdcbench_lite_v1_targeted_hardening_20260729`
- Evidence index: `runs/mdcbench_lite_v1_targeted_hardening_20260729/current_hash_evidence_index.json`
- Manifest tasks: `200`
- Unique current task hashes with lifecycle evidence: `200`
- Passed: `200`
- Missing evidence: `0`
- Stale-hash evidence: `0`
- Lifecycle contract: setup `false`, final `true`, score `1.0`, cleanup `false`
- Builder/spec regeneration: not used
- Replacements: `0`

| Family | Tasks | Authoritative result path(s) | Result |
| --- | ---: | --- | --- |
| `real100` | 8 | `real100_lifecycle/<task_id>/smoke_result.json` | 8/8 passed |
| `real200` | 10 | `real200_lifecycle/<task_id>/smoke_result.json` | 10/10 passed |
| `real300` | 12 | `real300_lifecycle/<task_id>/smoke_result.json` | 12/12 passed |
| `linux_android` | 45 | `linux_android/results.jsonl`, `linux_android_remaining/results.jsonl`, `linux_android_repair_1313/results.jsonl` | 45/45 passed |
| `linux_android_smarthome` | 30 | `linux_android_smarthome/results.jsonl`, `metadata_repair_linux_android_smarthome/results.jsonl` | 30/30 passed |
| `linux_smarthome` | 30 | `linux_smarthome/results.jsonl`, `metadata_repair_linux_smarthome/results.jsonl` | 30/30 passed |
| `android_smarthome` | 25 | `android_smarthome/results.jsonl`, `android_smarthome_repair_026_357/results.jsonl`, `metadata_repair_android_smarthome/results.jsonl` | 25/25 passed |
| `android_only` | 15 | `android_only/results.jsonl`, `metadata_repair_android_only_retry1/results.jsonl` | 15/15 passed |
| `linux_only` | 15 | `linux_only/results.jsonl`, `linux_only_repair_300/results.jsonl` | 15/15 passed |
| `smarthome_generated_scripted` | 10 | `smarthome_generated_scripted_lifecycle/results.jsonl` | 10/10 passed |

All paths in the table are relative to the evidence root. The manifest's
`current_hash_smoke_evidence` records the exact result locator and verified
SHA-256 for each task.

### Repairs Triggered by the Current Run

- `android_smarthome_026`, `android_smarthome_357`, and
  `linux_android_smarthome_472`: synchronized the semantic-note evaluator's
  expected `pass` contract in task and episode files, then reran the affected
  tasks.
- `linux_android_1313`: split an oversized embedded ZIP command into bounded
  chunks to avoid host `ARG_MAX`, narrowed temporary-file cleanup, and passed
  the dedicated rerun.
- `linux_only_300`: split the contact-sheet payload into bounded chunks,
  covered the temporary payload in cleanup, and passed the dedicated rerun.
- Eight PNG inputs across seven tasks were losslessly stripped of embedded
  OpenAI/C2PA provenance. All seven passed dedicated current-asset lifecycle
  reruns.
- `android_only_234`: the first metadata-sanitized run exposed an old hidden
  SHA guard. The task now checks the exact album inventory, real PNG format,
  and dimensions without requiring undisclosed byte identity; its full retry
  passed.
- Legacy `real100`, `real200`, and `real300` runners were extended to execute
  and verify cleanup. Standalone SmartHome received a lifecycle runner with the
  same setup/final/cleanup contract.

Historical evidence from earlier hardening rounds is retained only as
provenance. Missing historical run directories and prior-hash negative records
are not used to support final acceptance.

## Historical Runner Readiness

| Family | Runner Status | Notes |
| --- | --- | --- |
| real100/real200/real300 | lifecycle oracle runners | Current-hash lifecycle run passed 30/30. |
| linux_android/android_only/linux_only | runner available | `scripts/smoke/run_topology_view_oracle_smoke.py` supports Lite manifest filtering and `linux_actions`/`android_setup` schema; 75-task dry-run passed. |
| android_smarthome | runner available | `scripts/smoke/run_android_smarthome_oracle_smoke.py` supports task-id filtering; selector probe passed. |
| linux_smarthome/linux_android_smarthome | lifecycle oracle runners | Current-hash lifecycle run passed 60/60. |
| smarthome_generated_scripted | lifecycle scripted runner | Current-hash lifecycle run passed 10/10. |

## Historical Batch Smoke Log

| Batch | Lite Index Range | Status | Result Dir | Passed | Failed | Retry/Fix Notes |
| --- | --- | --- | --- | --- | --- | --- |
| B001 | 1-20 | passed | `runs/mdcbench_lite_v1/real100_selected`, `runs/mdcbench_lite_v1/real200_selected`, `runs/mdcbench_lite_v1/real300_selected` | 20 | 0 | Real-anchor runners passed selected tasks. |
| B002 | 21-40 | passed | `runs/mdcbench_lite_v1/real300_selected`, `runs/mdcbench_lite_v1/linux_android_all`, `runs/mdcbench_lite_v1/linux_android_failed_rerun` | 20 | 0 | Real300 tail plus linux_android entries passed after linux_android targeted reruns where applicable. |
| B003 | 41-60 | passed | `runs/mdcbench_lite_v1/linux_android_all`, `runs/mdcbench_lite_v1/linux_android_failed_rerun` | 20 | 0 | Linux_android entries passed after targeted reruns where applicable. |
| B004 | 61-80 | passed | `runs/mdcbench_lite_v1_hardening/B004/positive_topology_current_hash`, `retry_l066_l067_l074_current_hash`, `positive_smarthome_current_hash`, `retry_l079_positive_current_hash` | 20 | 0 | Effective current-hash positive 20/20; targeted SmartHome negatives rejected 5/5. |
| B005 | 81-100 | passed_current_hash | `runs/mdcbench_lite_v1_hardening/B005/positive_1a1l_current_hash`, `positive_1a1l_sms_retry_current_hash`, `positive_2a1l_current_hash`, `positive_1a2l_current_hash` | 20 | 0 | Effective current-hash positive 20/20; nine targeted real negatives rejected 9/9. |
| B006 | 101-120 | passed | `runs/mdcbench_lite_v1/linux_android_smarthome_2android_all`, `runs/mdcbench_lite_v1/linux_android_smarthome_2linux_all`, `runs/mdcbench_lite_v1/linux_smarthome_all`, `runs/mdcbench_lite_v1/linux_smarthome_062_rerun` | 20 | 0 | Linux_android_smarthome tail and linux_smarthome entries passed after `linux_smarthome_062` asset repair/rerun. |
| B007 | 121-140 | passed | `runs/mdcbench_lite_v1/linux_smarthome_all`, `runs/mdcbench_lite_v1/android_smarthome_all` | 20 | 0 | Linux_smarthome and android_smarthome entries passed. |
| B008 | 141-160 | passed | `runs/mdcbench_lite_v1/android_smarthome_all` | 20 | 0 | Android_smarthome entries passed. |
| B009 | 161-180 | passed | `runs/mdcbench_lite_v1/topology_real_android_only_all`, `runs/mdcbench_lite_v1/topology_real_android_only_rerun_failed`, `runs/mdcbench_lite_v1/topology_real_linux_only_all` plus Linux reruns | 20 | 0 | Android-only 161-175 passed after repairs to `android_only_214` oracle path and `android_only_270` evaluator shell; Linux-only 176-180 passed. |
| B010 | 181-200 | passed | `runs/mdcbench_lite_v1/topology_real_linux_only_all`, `runs/mdcbench_lite_v1/topology_real_linux_only_rerun_failed`, `runs/mdcbench_lite_v1/topology_real_linux_only_295_rerun2`, `runs/mdcbench_lite_v1/smarthome_scripted` | 20 | 0 | Linux-only 181-190 passed after repairs to `linux_only_295` setup and `linux_only_260` evaluator; standalone SmartHome 191-200 passed. |
## Android SmartHome Real Smoke

- Scope: all 25 Lite android_smarthome entries.
- Command: `PYTHONDONTWRITEBYTECODE=1 /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_android_smarthome_oracle_smoke.py --task-ids <25 selected ids> --result-dir runs/mdcbench_lite_v1/android_smarthome_all --runtime-profile real --reuse-env`
- Result dir: `runs/mdcbench_lite_v1/android_smarthome_all`
- Summary: 25 passed, 0 failed.
- Notes: Uses real Android emulator plus SmartHome runtime. Earlier probe `android_smarthome_357` also passed in `runs/mdcbench_lite_v1/android_smarthome_probe_357`.
## Linux SmartHome Real Smoke

- Scope: all 30 Lite linux_smarthome entries.
- Main command: `PYTHONDONTWRITEBYTECODE=1 /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_linux_smarthome_oracle_smoke.py --task-ids <30 selected ids> --result-dir runs/mdcbench_lite_v1/linux_smarthome_all --attempts 2 --vm-data-dir /Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data`
- Main result dir: `runs/mdcbench_lite_v1/linux_smarthome_all`
- Main summary: 29 passed, 1 failed.
- Failure: `linux_smarthome_062` setup referenced missing `/tmp/home/docs/night-note.odt` source asset.
- Fix: changed the source to `/tmp/home/docs/night-note.txt`, updated setup/cleanup/metadata paths, and added a natural text note asset with the requested bedroom night setup.
- Rerun command: `PYTHONDONTWRITEBYTECODE=1 /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_linux_smarthome_oracle_smoke.py --task-ids linux_smarthome_062 --result-dir runs/mdcbench_lite_v1/linux_smarthome_062_rerun --attempts 2 --vm-data-dir /Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data`
- Rerun result dir: `runs/mdcbench_lite_v1/linux_smarthome_062_rerun`
- Final summary: 30 passed, 0 failed after repair/rerun.
## Linux Android SmartHome Real Smoke

- Scope: all 30 Lite linux_android_smarthome entries.
- Runner fix: added `--vm-data-dir` mapping and corrected topology run-config selection for `linux_1`; ran tasks in homogeneous topology groups so the reused env is not mixed across incompatible device sets.
- Single Android + single Linux: `runs/mdcbench_lite_v1/linux_android_smarthome_single_all`, 14 passed, 0 failed.
- Dual Android + single Linux: `runs/mdcbench_lite_v1/linux_android_smarthome_2android_all`, 12 passed, 0 failed.
- Single Android + dual Linux: `runs/mdcbench_lite_v1/linux_android_smarthome_2linux_all`, 4 passed, 0 failed.
- Final summary: 30 passed, 0 failed.
## Linux Android Real Smoke

- Scope: all 45 Lite linux_android entries.
- Main command: `PYTHONDONTWRITEBYTECODE=1 /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_topology_view_oracle_smoke.py --families linux_android --result-dir runs/mdcbench_lite_v1/linux_android_all --task-timeout-s 900 --linux-ready-timeout-s 90 --vm-data-dir /Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data --runtime-log-file runs/mdcbench_lite_v1/linux_android_all/runtime.log`
- Main result dir: `runs/mdcbench_lite_v1/linux_android_all`
- Main summary: 40 passed, 5 failed.
- Repairs:
  - `linux_android_1313`: replaced brittle missing-gold `compare_archive` with outcome-focused zip listing include/exclude check.
  - `linux_android_1314`: replaced brittle missing-gold `compare_archive` with outcome-focused zip listing include/exclude check.
  - `linux_android_1365`: added `body_contains` to absent sent-SMS evaluator so the SMS getter returns `missing` when no matching message exists.
  - `linux_android_1274`: added `body_contains` to both absent sent-SMS evaluators for the same reason.
  - `linux_android_1863`: changed PDF text include from phrase `Maya Chen` to separate `Maya` and `Chen` tokens because `pdftotext` line-wrapped the name.
- Rerun command: `PYTHONDONTWRITEBYTECODE=1 /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_topology_view_oracle_smoke.py --task-ids linux_android_1313,linux_android_1365,linux_android_1274,linux_android_1863,linux_android_1314 --result-dir runs/mdcbench_lite_v1/linux_android_failed_rerun --task-timeout-s 900 --linux-ready-timeout-s 90 --vm-data-dir /Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data --runtime-log-file runs/mdcbench_lite_v1/linux_android_failed_rerun/runtime.log`
- Rerun result dir: `runs/mdcbench_lite_v1/linux_android_failed_rerun`
- Final summary: 45 passed, 0 failed after repair/rerun.

## Real Anchor Smoke

- Real100 scope: 8 selected Lite entries.
- Real100 command: `PYTHONDONTWRITEBYTECODE=1 /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_real100_oracle_smoke.py --tasks <8 selected ids> --result-dir runs/mdcbench_lite_v1/real100_selected --runtime-log-file runs/mdcbench_lite_v1/real100_selected/runtime.log --vm-data-dir /Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data`
- Real100 summary: 8 passed, 0 failed.
- Real200 scope: 10 selected Lite entries.
- Real200 command: `PYTHONDONTWRITEBYTECODE=1 /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_real200_oracle_smoke.py --tasks <10 selected ids> --result-dir runs/mdcbench_lite_v1/real200_selected --runtime-log-file runs/mdcbench_lite_v1/real200_selected/runtime.log --vm-data-dir /Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data`
- Real200 summary: 10 passed, 0 failed.
- Real300 scope: 12 selected Lite entries.
- Real300 command: `PYTHONDONTWRITEBYTECODE=1 /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_real300_oracle_smoke.py --tasks <12 selected ids> --result-dir runs/mdcbench_lite_v1/real300_selected --runtime-log-file runs/mdcbench_lite_v1/real300_selected/runtime.log --vm-data-dir /Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data`
- Real300 summary: 12 passed, 0 failed.
- HTML local-form note: `al_camera_web_upload_form` keeps the natural user instruction `请在 Linux Chrome 打开 /home/user/upload/form.html`; the asset is valid `text/html`, and the oracle/runtime opening via `file:///home/user/upload/...` is an execution detail, not instruction text.

## Evaluator Fairness Hardening Resmoke Plan - 2026-07-03T14:52:44Z

All 48 patched tasks are marked `pending_resmoke` and require full real smoke before the Lite final state is considered restored:

- `a2l2_meeting_packet_full`
- `al_tutorial_screenshot`
- `a2l_agenda_from_two_phones`
- `al_sms_web_download_statement`
- `al2_alarm_calc_email`
- `a2l2_vscode_web_music_final_gate`
- `linux_android_1313`
- `linux_android_1851`
- `linux_android_smarthome_025`
- `android_smarthome_357`
- `android_smarthome_026`
- `android_only_234`
- `android_only_214`
- `android_only_305`
- `android_only_236`
- `android_only_270`
- `linux_only_305`
- `linux_only_249`
- `linux_only_224`
- `linux_only_218`
- `linux_only_259`
- `linux_only_295`
- `linux_only_248`
- `linux_only_275`
- `linux_only_300`
- `linux_only_251`
- `linux_only_261`
- `linux_only_260`
- `a2l2_training_deck_notify`
- `linux_android_1368`
- `linux_android_1255`
- `linux_android_1357`
- `linux_android_1215`
- `linux_android_1320`
- `linux_android_1289`
- `linux_android_1365`
- `linux_android_1274`
- `linux_android_smarthome_029`
- `linux_android_smarthome_005`
- `linux_smarthome_350`
- `linux_smarthome_851`
- `linux_smarthome_1000`
- `linux_smarthome_796`
- `linux_smarthome_932`
- `linux_smarthome_983`
- `linux_smarthome_982`
- `linux_smarthome_999`
- `linux_smarthome_981`

## Evaluator Fairness Hardening Full Resmoke - 2026-07-03T16:46:09Z

Scope: 48 patched MDCBench Lite v1 tasks from `docs/evaluation_audits/mdcbench_lite_v1_result_blind_evaluator_audit.md`. Replay of prior model action histories was intentionally deferred; this section records full real smoke with scripted/oracle execution after the evaluator hardening patch.

Commands and results:
- Real100: `MDCBENCH_OSWORLD_VM_DATA_DIR=/Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_real100_oracle_smoke.py --tasks a2l2_meeting_packet_full al_tutorial_screenshot a2l_agenda_from_two_phones --result-dir runs/mdcbench_lite_v1_evaluator_patch/real100 --runtime-log-file runs/mdcbench_lite_v1_evaluator_patch/real100/runtime.log` -> 3/3 passed.
- Real200: initial run for `a2l2_training_deck_notify,al2_alarm_calc_email` passed `al2_alarm_calc_email`; after fixing the ODP text evaluator newline escaping, `a2l2_training_deck_notify` rerun in `runs/mdcbench_lite_v1_evaluator_patch/real200_rerun_training` passed. Final: 2/2 passed.
- Real300: `MDCBENCH_OSWORLD_VM_DATA_DIR=/Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_real300_oracle_smoke.py --tasks a2l2_vscode_web_music_final_gate al_sms_web_download_statement --result-dir runs/mdcbench_lite_v1_evaluator_patch/real300 --runtime-log-file runs/mdcbench_lite_v1_evaluator_patch/real300/runtime.log` -> 2/2 passed.
- Topology-view Android/Linux families: main run in `runs/mdcbench_lite_v1_evaluator_patch/topology_view` passed 23/27; after task-local evaluator fixes for `linux_android_1320`, `android_only_234`, and `android_only_270`, plus infra rerun for `linux_only_248`, `runs/mdcbench_lite_v1_evaluator_patch/topology_view_rerun_1` passed 4/4. Final: 27/27 passed.
- Linux+Android+SmartHome: `runs/mdcbench_lite_v1_evaluator_patch/linux_android_smarthome` -> 3/3 passed.
- Linux+SmartHome: `runs/mdcbench_lite_v1_evaluator_patch/linux_smarthome` -> 9/9 passed.
- Android+SmartHome: `runs/mdcbench_lite_v1_evaluator_patch/android_smarthome` -> 2/2 passed.

Smoke-time repairs:
- `a2l2_training_deck_notify`: fixed ODP text evaluator newline escaping; rerun passed.
- `linux_android_1320`: fixed quoted glob patterns that prevented `/tmp/meal/*.json|md|txt|csv` expansion; rerun passed.
- `android_only_234`: removed contradictory `old_notice.jpg present` requirement from a report whose visible source/oracle says `old_notice.jpg missing`; rerun passed.
- `android_only_270`: changed negative longitude check from brittle `grep -Fq '--'` to `grep -Fq -- '-122.3022'`; rerun passed.
- `linux_only_248`: initial VMware IP lookup timed out; rerun passed without task changes.

Final patched-task smoke status: 48/48 passed. The Lite manifest entries for these 48 tasks now have `smoke_status: passed` and per-task resmoke evidence under `smoke_evidence`.

## Evaluator Fairness Follow-Up Smoke - 2026-07-04T04:20:31Z

- `a2l2_training_deck_notify`: after expanding the ODP evaluator to bounded user output locations and syncing cleanup/oracle metadata, targeted real smoke passed in `runs/mdcbench_lite_v1_evaluator_patch_followup/real200_training_deck_rerun`. The before state failed, and the oracle-completed state passed with score 1.0.
- `linux_smarthome_350`: after aligning the source DOCX text with `/tmp/maintenance/result.json`, targeted Linux+SmartHome real smoke passed in `runs/mdcbench_lite_v1_evaluator_patch_followup/linux_smarthome_350` with `{"passed": true}`.

## B001 L019 current-hash targeted repair - 2026-07-16

- This entry supersedes historical L019 smoke only for the current task hash; it does not change historical evidence.
- Core result `runs/mdcbench_lite_v1_human_quality_20260715/B001/L019_current_hash_positive_final2/a2l2_vscode_web_music_final_gate/smoke_result.json` scored 0.75: final linux_1 persisted behavior, open tab, and `final.json` passed; only the linux_0 `/tmp` persisted-page duplicate failed. The document-state diagnostic showed target snap Chromium loading `chrome-error://chromewebdata/` for that intermediate file.
- Reviewer repair removes only the infeasible linux_0 browser evaluator. The final linux_1 behavior suite remains runtime-generated, opaque, randomized, persisted-file based, fresh-context, and one-call-per-case; the open-tab and `final.json` contracts remain independently scored.
- Current task SHA-256 is `d766318da5e70991e5d062b3b3dea80e1ec1a83da0fc6b39ae5120ac4d7af680` with 3 evaluators. Static positive/negative oracle compilation is 3/3 operations with `unsupported=0`.
- **Current status: pending Core positive and negative current-hash smoke.** No real smoke was run in this Reviewer repair, and no current-hash pass is claimed.

## B001 current-hash closure - 2026-07-16T05:17:13Z

- Core verified all 20 B001 task paths against their manifest SHA-256 values and completed current-hash positive real smoke for L001-L020: **20/20 passed**. Every positive run failed before the oracle outcome and passed afterward.
- Smoke-driven repairs were rerun on their final contracts: L004 and L016 passed their dedicated retries; L013 passed after the exact-set evaluator simplification; L019 passed after removing only the infeasible linux_0 intermediate-page evaluator; L020 passed after its additive alarm redesign.
- Real negative smoke also passed for L013, L019, and L020. The remaining tasks have focused adversarial evaluator regressions plus negative oracle-plan dry-runs; those checks reject the documented partial, stale, contradictory, duplicate, hidden-content, and self-report bypasses.
- L019 was rerun after JSON-only formatting changed its file SHA-256. Final task hash `52d04380246b68a025dabad39db12b6c535f32251f778c00bcba47d6ec2dd6e6` passed positive smoke in `runs/mdcbench_lite_v1_human_quality_20260715/B001/L019_formatted_current_hash_positive` and negative smoke in `runs/mdcbench_lite_v1_human_quality_20260715/B001/L019_formatted_current_hash_negative`.
- B001 is accepted. The overall Lite manifest remains `pending_core_smoke` because B002-B010 have not yet completed this goal.

## B002 first current-hash Real300 run and targeted helper repair - 2026-07-16

- Core run `runs/mdcbench_lite_human_quality_2026-07-16/B002/real300_positive` passed L022/L024/L026/L028/L030 and failed L021/L023/L025/L027/L029. This is failure evidence, not current-hash acceptance evidence.
- L021/L027: the oracle compiler chose `>/dev/null` from `command -v pdftotext` instead of the real PDF input. The generic parser and relational PDF plan were repaired.
- L023: screenshots show the GTK chooser path missing its initial `h`; the oracle now explicitly focuses, selects and clears the location entry before typing.
- L025: AndroidWorld controller pull split the album path containing spaces; media evaluation now prefers configured direct ADB with the remote path preserved as one argument and retains controller fallback.
- L029: the guarded download GET occurred, but Chromium displayed `Insecure download blocked` with a `Keep` action; the oracle now handles that fixed-viewport confirmation before filesystem verification.
- Static evidence after repair: focused **5 passed**, expanded focused **136 passed**, consolidated **489 passed / 1 skipped / 7 warnings**, strict manifest/hash/reference/pending nodes **3 passed**, positive/negative Real300 compile-only dry-runs **22/19 operations** with `unsupported=0`.
- No task/evaluator strictness, task hash, manifest entry, B001 evidence, or L041-L200 entry changed. **B002 remains pending Core current-hash real smoke.**

## B002 second targeted helper repair - 2026-07-16

- Core rerun `runs/mdcbench_lite_human_quality_2026-07-16/B002/real300_failed_rerun1` confirms L021/L025/L027 now pass and leaves L023/L029 failed.
- L023 screenshots show the exact JPEG and fields present but focus trapped in the file control; the oracle now advances to and activates Submit only after chooser acceptance.
- L029 screenshot shows `statement.pdf`, 634 B, Done after Keep; the failure is fixed-name guest discovery. The oracle now marks the run before download, polls only known download/share directories, recognizes exact/numeric-collision basenames, rejects stale/unrelated/partial files, and produces useful diagnostics.
- L021/L027 generated PDF relation text now uses ASCII separators and extracts without replacement `?` characters.
- Static evidence after this second repair: focused **6 passed** after **4 failed / 2 passed** RED; consolidated **490 passed / 1 skipped / 7 warnings**. No task/evaluator/manifest contract changed. **L023/L029 remain pending Core rerun; no pass is claimed here.**

## B002 third targeted helper repair - 2026-07-16

- Core rerun `runs/mdcbench_lite_human_quality_2026-07-16/B002/real300_failed_rerun2` shows L023's exact fields and JPEG selected but no Submit activation; its oracle now uses an L023-only fixed-viewport click after chooser acceptance and an exact 1920x1080 guard.
- The same rerun shows L029's guarded GET and completed `statement (1).pdf`; its prior 12-second mtime poll was interrupted by the Linux setup layer's 10-second timeout. Discovery now snapshots only the exact/numeric-collision basename family, detects new or signature-changed completed files, and is bounded to 6 seconds.
- Static evidence: focused **6 passed** after **3 failed / 3 passed** RED; consolidated **490 passed / 1 skipped / 7 warnings**; strict nodes **3 passed**; compile-only dry-runs **22 positive / 19 negative operations**, `unsupported=0`.
- No task/evaluator/manifest contract changed. **L023/L029 remain pending Core rerun; no pass is claimed here.**

## B002 final root-cause helper repair - 2026-07-16

- Core rerun `runs/mdcbench_lite_human_quality_2026-07-16/B002/real300_failed_rerun3` shows L023's GTK Open File modal still present after the full path resolved. The L023-only oracle now clicks the visible file row, GTK Select, and rendered page Submit in that order after an exact 1920x1080 guard.
- The rerun and `/tmp/mdcbench_l029_download_diag` show completed L029 PDFs saved directly under `/home/user`, with the configured Downloads directory absent. Signature-snapshot discovery now includes `$HOME` itself and de-duplicates the bounded candidate paths while retaining exact/numeric basename, current-run signature, partial-file rejection, 6-second bound and diagnostics.
- Static evidence: focused **6 passed** after **3 failed / 3 passed** RED; consolidated **490 passed / 1 skipped / 7 warnings**; strict nodes **3 passed**. B001 and L041-L200 canonical hashes remain unchanged.
- No task/evaluator/manifest contract changed. **L023/L029 remain pending Core rerun; no pass is claimed here.**

## B002 grouped topology failure repair - 2026-07-16

- Core run `runs/mdcbench_lite_human_quality_2026-07-16/B002/topology_positive` passed 7/10; only L033, L035, and L039 failed. This remains failure provenance, not pass evidence.
- L033's positive oracle now creates the exact strict ZIP on `linux_1`; L035's positive oracle clears the isolated Calendar before adding one final preserved event; L039 task and episode now expect the getter's real `pass` token while retaining every entity/polarity/conflict rule.
- Static evidence: focused **3 failed → 3 passed**; B002 focused **62 passed**; consolidated **493 passed / 1 skipped / 7 warnings**; strict nodes **3 passed**; L031–L040 compile-only topology dry-run **10/10**.
- L033/L035 are oracle-only fixes. L039 current SHA-256 is `deced2112c9fd6b9c02288b553aa65ca3900705e89612c597f2d6ac90b5b9bb0`. All three remain `full_rerun_required` and `pending_core_current_hash`; Core must rerun them and no real-smoke pass is claimed.

## B002 grouped topology Auditor closure - 2026-07-16

- Static reproduction confirmed two remaining semantic issues: L035 rejected ordinary 9 AM forms and accepted non-applied proposals; L039 accepted either requested fact alone and rejected natural cannot-route/no-coordinate forms.
- Task-local rules now accept natural time/route/coordinate equivalents while requiring affirmative applied state for L035 and both independent blocked-plus-missing facts for L039. The L035 Calendar evaluator, L039 expected `pass` token, shared scorer, tasks outside L035/L039, and accepted L033 oracle are unchanged.
- Static evidence: **4 failed / 3 passed → 7 passed** focused; **66 passed** B002 grouped; **497 passed / 1 skipped / 7 warnings** consolidated; strict nodes **3 passed**; compile-only topology dry-run **10/10**.
- Current hashes are L035 `5b83fc243b5c62ce66bbe000bb36cc9359472a88d1d108ba6206f23b18dc1aee` and L039 `83ac298ea212917540670d1e27fa64c43a8e120f2ffc436306e8d1f7886a0154`. Both remain `full_rerun_required` / `pending_core_current_hash`; Core owns real smoke and no pass is claimed.

## B002 VMware subprocess crash closure - 2026-07-16T13:16:45Z

- The three-task topology rerun completed and persisted **3/3 passing** task records before environment close: L033, L035, and L039 each failed before the oracle, passed after the oracle with score 1.0, and failed again after cleanup as required.
- Two macOS Python crash reports were nevertheless generated while OSWorld attempted `vmrun` operations from the AndroidWorld gRPC process. Both identify `SIGTRAP`, `crashed on child side of fork pre-exec`, and a recursive libdispatch lock. This was an infrastructure cleanup defect, not a task/evaluator failure.
- The earlier macOS mitigation covered Android `adb` subprocesses only. The remaining OSWorld provider and smoke-runner `vmrun` paths still used `fork_exec` after gRPC threads had started.
- All runtime `vmrun` paths now resolve the executable to an absolute path and use `close_fds=False`, satisfying Python's macOS `posix_spawn` fast path. VM list/start/stop/snapshot/server-restart and both hard-stop fallback paths are covered.
- TDD evidence: five focused regressions were observed failing before the change and pass afterward. The complete related runtime/runner suite is **46 passed**.
- Real validation: `linux_android_1357` passed at `runs/mdcbench_lite_human_quality_2026-07-16/B002/vmrun_posix_spawn_validation` with `setup_success=false`, `final_success=true`, `cleanup_success=false`, and score 1.0.
- No Python crash report newer than `Python-2026-07-16-055212.ips` appeared during validation. Final resource checks reported `Total running VMs: 0` and no attached Android emulator after Core shut down both validation AVDs.

## B002 current-hash acceptance closure - 2026-07-16T13:16:45Z

- Core completed current-hash positive real smoke for L021-L040: **20/20 passed**. Every task rejected the setup state and accepted the oracle-completed state; topology-view tasks also rejected the cleanup state.
- Real300 evidence is split across `B002/real300_positive`, `B002/real300_failed_rerun1`, and `B002/real300_failed_rerun4`. Topology-view evidence is split across `B002/topology_positive/results.jsonl` and `B002/topology_failed_rerun1/results.jsonl`.
- Targeted real negative smoke passed **3/3** for L023 `al_camera_web_upload_form`, L027 `a2l2_training_media_deck_email`, and L029 `al_sms_web_download_statement`. Their wrong upload, incomplete media deck/email, and wrong download-code trajectories remained rejected.
- L029's first negative attempt exposed only a smoke-helper defect: the helper waited for a download even though the negative outcome correctly produced none. The negative plan now omits `download_to`; focused tests and the wider related suite passed, and the real negative rerun passed.
- The VMware `fork_exec` crash was closed by routing all runtime `vmrun` calls through macOS `posix_spawn`. The related suite passed **46/46**, a real Linux+Android validation passed, no newer Python crash report appeared, and Core confirmed no residual VM or emulator.
- Manifest hashes, evaluation counts, instruction lengths, evidence paths, and B002 accepted states passed the strict acceptance checks. **B002 is accepted; progress is 40/200, and B003 L041-L060 is next.**

## B003 Core current-hash smoke closure - 2026-07-16

- Full positive run
  `runs/mdcbench_lite_v1_human_quality_20260715/B003/post_auditor_positive_retry1`
  passed 19/20. L053 alone failed because its positive oracle/scripted solution
  omitted the visible `P1` and `Escalation lead` facts required by the current
  Thunderbird contract.
- After a test-first, task-local L053 oracle/scripted-solution repair, the real
  retry in
  `runs/mdcbench_lite_v1_human_quality_20260715/B003/post_auditor_positive_l053_retry1`
  passed 1/1 at score 1.0. No evaluator was weakened.
- Effective current-hash positive result is **20/20 passed**. All 20 rejected
  setup-only state, accepted final oracle state, and rejected post-cleanup
  state.
- Real targeted negatives in
  `runs/mdcbench_lite_v1_human_quality_20260715/B003/targeted_negative_retry1`
  rejected **6/6** material bypasses for L045, L050, L051, L052, L053, and
  L059.
- B003 is accepted as `accepted_b003_current_hash_smoke_passed`; overall
  progress is **60/200**. Per-task negative cases and scores are in
  `review_batches/B003_smoke.md`.

## B004 Core current-hash smoke closure — 2026-07-16

- Effective positive evidence is **20/20**: 12 unaffected topology passes plus the L066/L067/L074 retry, four SmartHome base passes, and the isolated L079 retry.
- Targeted `negative-home-omitted` evidence rejected **5/5** cases for L076-L080.
- Every effective positive has setup false, final true at score 1.0, cleanup false, and no error; every negative has setup/final/cleanup false and no error.
- B004 is `accepted_b004_current_hash_smoke_passed`; detailed paths, commands, retry provenance, and hashes are in `review_batches/B004_smoke.md`. Progress is **80/200** and B005 is next.

## B005 Core current-hash smoke closure - 2026-07-16

- Effective positive evidence is **20/20** across 1A+1L, 2A+1L, and 1A+2L topologies.
- The initial 1A+1L run's four SMS-only failures were traced to host/emulator clock skew, fixed in the shared sent-provider insert path, and passed 4/4 on complete task rerun.
- Targeted negatives rejected **9/9** cases: five Android-result omissions, three SmartHome-result omissions, and one L100 unrelated-device mutation.
- Every effective positive has setup false, final true at score 1.0, cleanup false, and no error. Detailed commands, hashes, retry provenance, and the L100 custom negative are in `review_batches/B005_smoke.md`.
- B005 is `accepted_b005_current_hash_smoke_passed`; accepted progress is **100/200**. B006-B010 remain assigned to other devices.

## B008-B010 selective integration and current-hash closure - 2026-07-16

- Core selectively integrated task-local files from `review/lite-B008-B010-integration`; its stale
  global manifest/shared runtime were not merged. Remote smoke references remain historical only.
- B008 L141-L160 passed **20/20** in
  `runs/mdcbench_lite_v1/hardening_b008_current_hash` using
  `scripts/smoke/run_android_smarthome_oracle_smoke.py` with the real runtime profile.
- B009 Android L161-L175 passed **15/15** effectively. The initial run in
  `runs/mdcbench_lite_v1/hardening_b009_android_current_hash` passed 14/15. L165
  `android_only_264` failed because an exact-set evaluator could not enumerate all alarms through
  the real Google Clock UI; after aligning the evaluator with the requested target-alarm outcome,
  its real retry passed in
  `runs/mdcbench_lite_v1/hardening_b009_android_264_retry_current_hash`.
- B009 Linux L176-L180 passed **5/5** in
  `runs/mdcbench_lite_v1/hardening_b009_linux_current_hash_retry`. An earlier attempt in the new
  clone failed before task setup because its local `third_party/OSWorld-main` path was absent; the
  passing rerun explicitly reused `/Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data`.
- B010 Linux L181-L190 passed **10/10** in
  `runs/mdcbench_lite_v1/hardening_b010_linux_current_hash` using the same fixed OSWorld VM copies.
- B010 standalone SmartHome L191-L200 passed **10/10** under
  `runs/mdcbench_lite_v1/hardening_b010_smarthome_current_hash/L191` through `L200`, each using its
  own scripted solution and `configs/smarthome/local_smarthome.json`.
- Final effective result is **60/60 passed**. Manifest entries L141-L200 contain the final task
  SHA-256, score 1.0, runner, and result path under `current_hash_smoke_evidence`.
- B008-B010 are accepted. B006-B007 are not present on this branch and remain outside this closure.

## B006-B007 selective integration and Core current-hash closure - 2026-07-17

- Core selectively integrated `origin/B006-007-round2-review`. The 40 task-local JSON/asset/oracle changes and round-2 reports were retained; the stale global manifest, Builder stage changes, and one-time task patch scripts were not merged.
- Branch-reported `runs/review_B006_B007_round2_20260717_144404` artifacts were absent from Git and were treated as historical claims only. Acceptance uses the Core-local runs below.
- B006 mixed Linux+Android+SmartHome L101-L105 passed **5/5** in `runs/mdcbench_lite_v1/hardening_b006_mixed_core_20260717`.
- B006/B007 Linux+SmartHome L106-L135 passed **30/30** in `runs/mdcbench_lite_v1/hardening_b006_b007_linux_home_core_20260717`.
- B007 Android+SmartHome L136-L140 passed **5/5** in `runs/mdcbench_lite_v1/hardening_b007_core_20260717` with the real Android runtime.
- All 40 current-hash records have setup false, final success true, score `1.0`, cleanup false, and no task error.
- Targeted real-runtime attacks passed **9/9** in `runs/mdcbench_lite_v1/hardening_b006_b007_targeted_negative_core_20260717`: L115 extra-plan, negated-conflict, and source-equivalent cases; L125 append-only; L127 extra-plan; and malformed/reordered JSON for L137/L140.
- Static closure is **25 passed** across the final 200-task acceptance gate, B006/B007 quality suite, and shared-runtime regressions. The shared Android/Linux/SmartHome regression is effectively **124/124 passed** after correcting one stale test-double signature.
- B006 and B007 are accepted at their current hashes. Overall Lite progress is **200/200** and `release_status` is `final`.

## Pre-Push Current-Hash Closure - 2026-07-17

- L105 `linux_android_smarthome_941` received a full positive real-smoke rerun after replacing
  ambiguous "Home state" wording with explicit "SmartHome state" and closing its expected-asset
  inventory.
- Command: `PYTHONDONTWRITEBYTECODE=1 /Users/lht/home/MDCBench/.venv/bin/python scripts/smoke/run_linux_android_smarthome_oracle_smoke.py --task-ids linux_android_smarthome_941 --result-dir runs/mdcbench_lite_v1/prepush_20260717/linux_android_smarthome_941 --mode positive --attempts 2 --task-timeout-s 1200 --linux-ready-timeout-s 120 --vm-data-dir /Users/lht/home/MDCBench/third_party/OSWorld-main/vmware_vm_data`.
- Result: passed on attempt 1; setup `false`, final `true`, score `1.0`, cleanup `false`.
- Artifacts: `runs/mdcbench_lite_v1/prepush_20260717/linux_android_smarthome_941/summary.json`
  and `results.jsonl`. VMware environment close emitted a timeout warning after the completed task
  result, but the runner exited successfully and retained the passing result.

## Final Targeted Current-Hash Closure - 2026-07-29

### Positive lifecycle evidence

- L056 PDF probe:
  `runs/mdcbench_lite_v1_final_targeted_20260729/topology_probe_after_pdf_relation_fix`
  passed 1/1 during layout repair.
- Remaining Linux/Android PDF and metadata scopes:
  `runs/mdcbench_lite_v1_final_targeted_20260729/topology_metadata_and_pdf_positive_retry`
  passed 15/15.
- Linux/Android/SmartHome:
  `runs/mdcbench_lite_v1_final_targeted_20260729/linux_android_smarthome_positive`
  passed 7 effective cases; L094's synonym repair retry in
  `linux_android_smarthome_423_positive_retry` passed 1/1.
- Linux/SmartHome task repairs:
  `runs/mdcbench_lite_v1_final_targeted_20260729/linux_smarthome_positive`
  passed 3/3.
- Removed stale/unused task-scoped assets:
  `runs/mdcbench_lite_v1_final_targeted_20260729/linux_smarthome_removed_stale_assets_positive`
  passed 2/2.
- Linux-only replacements:
  `runs/mdcbench_lite_v1_final_targeted_20260729/replacements_positive`
  passed 3/3.
- Final PDF metadata-sanitized rerun:
  `runs/mdcbench_lite_v1_final_targeted_20260729/pdf_metadata_sanitized_positive`
  passed L056/L068 2/2 and supersedes their earlier PDF evidence.

Effective positive result: **32/32 passed**. Every effective record has setup
`false`, final `true`, score `1.0`, and cleanup `false`.

### Targeted real negatives

- `replacements_targeted_negative`: 3/3 partial or wrong outputs remained
  failed. L184's correct browser half scored 0.5 but did not pass; L189's
  partial archive and L190's wrong confirmation each scored 0.0.
- `alarm_cluster_negative_home_omitted`: 3/3 Android-only completions remained
  failed.
- `alarm_cluster_negative_android_omitted`: 3/3 Home-only completions remained
  failed.

Effective targeted negative result: **9/9 correctly rejected**.

### Infrastructure provenance

The superseded directory
`topology_metadata_and_pdf_positive` contains 16 setup-time infrastructure
failures. The visible Android emulators had been started without explicit
`-grpc` ports and therefore enabled JWT-protected gRPC, while AndroidWorld
uses the project's local unauthenticated gRPC contract. Restarting with
`-grpc 8554` and `-grpc 8555` fixed the environment. The one-task probe then
reached real evaluation and exposed L056's paragraph-layout issue. No failed
infrastructure record is counted as task evidence.

Current-hash and task-scoped-asset hashes are indexed at
`runs/mdcbench_lite_v1_final_targeted_20260729/current_hash_evidence_index.json`.

Final complete Lite static/adversarial regression:
**892 passed / 1 skipped / 6 warnings**. The one OpenMP test that aborted in
the restricted shared-memory sandbox passed when isolated in the normal system
shared-memory environment; no task change was required.

## Final Release Current-Input Closure - 2026-07-30

- `real300`: L024 passed 1/1.
- `topology`: L033/L050/L068/L073/L179 passed 5/5.
- `linux_android_smarthome`: L078/L081/L090/L092/L099 passed 5/5.
- `linux_smarthome`: L111/L130 passed 2/2.

Effective result: **13/13 passed**. Every record rejected setup-only state,
accepted the oracle result at score 1.0, and rejected post-cleanup state.

Raw evidence:
`runs/mdcbench_lite_v1_final_release_20260730`.

Tracked compact evidence:
`tasks/mdcbench_lite/mdcbench_lite_v1_final_release_evidence_20260730.json`.

Superseded VMware-service and missing-second-emulator attempts are retained as
infrastructure provenance and are not counted as task failures or passing
evidence.

Final static/adversarial regression is effectively **950 passed / 1 skipped /
7 warnings**. One OpenMP/shared-memory-dependent test failed only in the
restricted combined run and passed in an isolated normal-system run.

## Semantic-Equivalence Current-Hash Closure - 2026-07-30

Fresh positive lifecycle smoke passed **16/16**:

- Real100 L004/L007:
  `runs/mdcbench_lite_v1_semantic_equivalence_20260730/real100_positive_retry1`.
- Real200 L011:
  `runs/mdcbench_lite_v1_semantic_equivalence_20260730/real200_positive_retry2`.
- Topology-view L034/L042/L052/L054/L177/L184:
  `runs/mdcbench_lite_v1_semantic_equivalence_20260730/topology_positive`.
- Linux+Android+SmartHome L077/L104:
  `runs/mdcbench_lite_v1_semantic_equivalence_20260730/linux_android_smarthome_positive`.
- Linux+Android+SmartHome oracle-sync retries L102/L103:
  `runs/mdcbench_lite_v1_semantic_equivalence_20260730/linux_android_smarthome_positive_retry1`.
- Linux+SmartHome L127:
  `runs/mdcbench_lite_v1_semantic_equivalence_20260730/linux_smarthome_positive`.
- Android+SmartHome L136:
  `runs/mdcbench_lite_v1_semantic_equivalence_20260730/android_smarthome_positive`.
- Android+SmartHome oracle-sync retry L138:
  `runs/mdcbench_lite_v1_semantic_equivalence_20260730/android_smarthome_positive_retry1`.

Every effective result has setup `false`, final `true`, score `1.0`, and
cleanup `false`. Superseded failures for L011/L102/L103/L138 are retained as
diagnostic provenance: each was caused by a stale positive oracle contract,
received a RED/GREEN repair, and passed its retry.

L052 targeted real contradiction:
`runs/mdcbench_lite_v1_semantic_equivalence_20260730/topology_negative_l052`
passed 1/1 with final score 0.0.

Tracked compact evidence:
`tasks/mdcbench_lite/mdcbench_lite_v1_semantic_equivalence_evidence_20260730.json`.
