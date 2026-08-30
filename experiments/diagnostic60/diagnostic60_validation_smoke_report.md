# Diagnostic-60 Executable Construction Validation and Smoke Report

> Date: 2026-08-30. Status: **construction validation passed; four pre-run blockers/decisions remain; formal GPT-5.5 isolated-stage runs not started**.

## Scope

This validation used the frozen Final-60, 235-stage decomposition, evaluator ownership, gold contracts, semantic judge v2, and isolated-stage budget. It did not resample tasks, change a dependency edge or stage boundary, use a predecessor isolated run output, inspect E2E model trajectories to construct gold, or launch a GPT-5.5 stage agent.

## Representative stages

| Type | Representative | Validation depth | Result |
| --- | --- | --- | --- |
| Simple information acquisition | `a2l_contact_otp_web_form.S01` | Source-grounded gold, source-only initialization, own-gold exclusion, candidate extraction contract, strict judge-request fixture | construction PASS; live judge BLOCKED |
| Document/policy extraction | `linux_android_smarthome_897.S01` | PDF extraction preserves the approved fallback facts: AC cool 25, dehumidifier medium, no alternate mode | PASS |
| Android execution | `a2_missing_media_status.S02` | Real `emulator-5556` reset; correct Markor note; scored note evaluator and unscored absence guard; original cleanup; post-cleanup rejection | PASS |
| Linux file execution | `l2_csv_to_json.S02` | Correct three-record JSON scored by the assigned `check_json_records` evaluator | evaluator PASS; real VM lifecycle BLOCKED |
| SmartHome execution | `linux_android_smarthome_338.S07` | Real local SmartHome reset, one brightness command, assigned evaluator, done, cleanup | PASS |
| Same-device later-layer re-entry | `linux_android_1241.S03` | Layer 3 Linux re-entry retains only S01/S02 gold information plus the dependency-caused S04 native-state projection; no actual predecessor output | PASS |
| Gold artifact transfer | `a2l2_vscode_web_music_final_gate.S05` | Actual HTML overlay to `/home/user/launch/validator.html`; six JavaScript positive/adversarial cases | PASS |
| Global-only evaluator task | `a2l2_vscode_web_music_final_gate.S04` | `evaluation[3]` remains listed as global-only and absent from the local stage task | PASS |

## Construction invariants

- Final tasks: 60; executable stages: 235 (`information_acquisition=149`, `environment_execution=86`).
- Stage task schema: 235/235 pass; stage run-config schema: 235/235 pass.
- Information stages containing their own gold input: 0/149.
- Specs permitting actual predecessor isolated output/state: 0/235.
- Environment predecessor edges with a native-state or real-artifact reference: 19/19.
- Oracle-replayed Android/SmartHome native states pass every assigned predecessor evaluator used to validate them.
- Localized global evaluators: 0; the sole global-only evaluator remains excluded from Local-All.
- The selected release ZIP contains only `Alpha_Report_v2.pdf` and `Beta_Summary_v1.pdf`; both member byte sequences exactly match the source bundle entries.
- GPX stages record the observable post-setup favorites and no longer mix in an earlier empty initializer. The genuinely empty `linux_android_1831.S01` state remains empty.
- Every information handoff separates its complete `source_evidence_snapshot` from the minimal `gold_reference`/`downstream_handoff`. Eight locally resolvable CSV selections and two structured document selections omit inactive/distractor branches downstream while retaining the full source for audit. Four mapping tables remain complete because their join keys come from parallel information stages.

## Gold-handoff projection review

The complete source is no longer treated as the downstream answer when the task explicitly selects one record. For example:

- `linux_android_1858.S02` passes only the `CASE-1858` current row, not archived/hold/missing rows;
- `linux_android_1831.S02` passes only the current `include=yes` row;
- `linux_android_1034.S03`, `linux_android_smarthome_470.S01`, `linux_android_smarthome_696.S01`, and `linux_android_smarthome_474.S01` retain their complete mapping tables: selecting their final row requires a key supplied by another parallel information stage, so preselecting it in gold would leak the cross-stage join result;
- `al_tutorial_screenshot.S01` passes the selected `linux-basics`/`needed` row, including its working directory and command, while the draft, archived, and different-page rows remain audit-only;
- `linux_android_1863.S01` excludes the inactive missing-item branch while retaining it in the audit snapshot.

One frozen-contract mismatch surfaced during this materialization. `al_tutorial_screenshot.S01`'s frozen stage instruction and `required_semantics` mention only title/record name and status/decision, although its downstream Linux stage also needs the selected row's working directory and command. The materialized gold contains all four selected-row fields, but the frozen instruction/contract was not silently edited. A human decision is required before this stage can be treated as a valid isolated capability test.

## Runtime and evaluator evidence

### SmartHome

`linux_android_smarthome_338.S07` returned score 1.0. The recorded counts were:

- model-action turns: 2, including final `done`;
- environment-action attempts: 1;
- actual environment steps: 1 successful non-`done` transition;
- evaluator results: 1/1 pass;
- cleanup: completed.

This confirms the frozen step definition distinguishes turns, attempts, and actual environment transitions.

### Android

On real `emulator-5556`, `a2_missing_media_status.S02` completed reset and accepted the correct `Photo status.md` state with score 1.0; both its scored evaluator and unscored diagnostic guard passed. Its original cleanup removed the note, and the same evaluator subset then returned score 0.0. The post-cleanup missing-file ADB warnings are the expected getter behavior for an absent note.

### Linux evaluator

The assigned `check_json_records` evaluator for `l2_csv_to_json.S02` scored a correct three-record `orders.json` as 1.0. No Linux VM was running, so the real VM reset/upload/cleanup lifecycle was not exercised.

### Artifact behavior

The materialized validator function passed two exact-member cases, including reordered inputs, and rejected a duplicate/missing checklist, an extra checklist member, a substituted track, and a non-array input. The downstream stage receives the HTML through a real `upload_file` overlay, not a prose description.

## Semantic judge v2 validation

Static and mocked-request validation passed:

- judge ID `diagnostic60.semantic_handoff_judge.v2`;
- model/version string `gpt-5.5`;
- temperature 0, top-p 1, n 1, maximum 256 completion tokens, 180-second request timeout, and `store=false`;
- strict `PASS | FAIL | UNCERTAIN` JSON schema;
- the v2 wording allows harmless additional true information;
- 100% of `UNCERTAIN` plus a seeded 20% of PASS/FAIL judgments is selected for audit.

The live gold-equivalent judge smoke was not completed. The execution environment rejected the external call because the fixture would transmit task content to the configured endpoint. No alternate endpoint or prompt was used, and the frozen judge was not modified.

## E2E comparability audit

Saved E2E configs were compared directly with current objects, without hashes:

- 59/60 Final-60 tasks have a result whose materialized task, run config, and `gpt-5.5-lite` agent config exactly match the current files.
- `linux_android_1324` has no `result.json`; its existing attempt ended in a 2100-second process timeout classified as an environment failure.
- That timeout is not a clean model E2E outcome and must not silently be counted as model failure in Composition Gap.

## Remaining blockers before the formal 235-stage run

1. Decide whether to approve a narrow freeze exception that adds `working_directory` and `command` to the frozen instruction/expected-handoff semantics for `al_tutorial_screenshot.S01`, or explicitly accept that this isolated stage does not fully test the information needed downstream.
2. Run one approved live semantic-judge v2 fixture against the configured endpoint and confirm a strict-schema response. An endpoint/protocol incompatibility may be fixed in the launcher, but the frozen prompt must not be tuned from its outcome.
3. Start the intended Linux VM under the normal experiment procedure and complete a non-model `l2_csv_to_json.S02` reset/evaluator/cleanup smoke. At review time VMware reported `Total running VMs: 0`.
4. Produce a clean, current-version E2E result for `linux_android_1324` before calculating E2E, Conditional E2E, or Composition Gap.

After those four items, obtain explicit human confirmation and only then start the formal Diagnostic-60 isolated-stage experiment. These blockers do not justify resampling, changing Core-200 tasks, editing dependency edges/stage boundaries, or assigning the global-only evaluator to a local stage.
