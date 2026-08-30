# Diagnostic-60 Stage Evaluation Method Proposal

> Status: **mapping reviewed and frozen; not executable; no model run authorized**.

## Evaluator assignment

- Original evaluator references: **147** total; **127** are scored in the original tasks.
- Ownership counts: `local_stage=108`, `local_guard=38`, `global_only=1`.
- Information-acquisition stages using the semantic judge: **149**.
- `local_stage`: a programmatic outcome evaluator owned by the environment-changing stage it measures.
- `local_guard`: a preservation/no-prohibited-action check attached to the relevant local stage. A scored guard participates in that stage's pass; an originally unscored guard remains diagnostic.
- `global_only`: retained at task scope and deliberately not assigned to any local stage. The cross-device copy-integrity evaluator in `a2l2_vscode_web_music_final_gate` is the sole current example.
- Information stages use the fixed AI semantic judge and any attached local guards. Environment-changing stages reuse their reasonable original local-stage evaluator subset plus local guards.

## Frozen original-evaluator ownership map

| Task | Evaluator | Ownership | Local owner | Scored | Function |
| --- | --- | --- | --- | --- | --- |
| `linux_android_1241` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_1241` | `E02` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_1241` | `E03` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_1241` | `E04` | `local_guard` | `S04` | `true` | `exact_match` |
| `linux_android_1241` | `E05` | `local_stage` | `S03` | `true` | `check_csv_semantic_records` |
| `linux_android_1368` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_1368` | `E02` | `local_stage` | `S04` | `true` | `exact_match` |
| `android_smarthome_233` | `E01` | `local_stage` | `S03` | `true` | `smarthome.check_infeasible_report` |
| `android_smarthome_233` | `E02` | `local_guard` | `S01` | `true` | `exact_match` |
| `android_smarthome_233` | `E03` | `local_guard` | `S03` | `true` | `smarthome.check_no_home_mutation` |
| `a2l2_vscode_web_music_final_gate` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `a2l2_vscode_web_music_final_gate` | `E02` | `local_stage` | `S05` | `true` | `exact_match` |
| `a2l2_vscode_web_music_final_gate` | `E03` | `global_only` | `—` | `true` | `normalized_text_exact_match` |
| `a2l2_vscode_web_music_final_gate` | `E04` | `local_stage` | `S05` | `true` | `exact_match` |
| `linux_android_1858` | `E01` | `local_stage` | `S03` | `true` | `check_include_exclude` |
| `linux_android_1858` | `E02` | `local_guard` | `S01` | `true` | `exact_match` |
| `linux_android_1858` | `E03` | `local_guard` | `S01` | `true` | `exact_match` |
| `linux_android_1034` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_1034` | `E02` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_1034` | `E03` | `local_stage` | `S05` | `true` | `exact_match` |
| `linux_android_1034` | `E04` | `local_stage` | `S05` | `true` | `check_include_exclude` |
| `a2_gallery_album_to_tasks` | `E01` | `local_stage` | `S02` | `true` | `exact_match` |
| `a2_missing_media_status` | `E01` | `local_stage` | `S02` | `true` | `exact_match` |
| `a2_missing_media_status` | `E02` | `local_guard` | `S02` | `false` | `exact_match` |
| `linux_only_298` | `E01` | `local_stage` | `S03` | `true` | `check_include_exclude` |
| `linux_only_298` | `E02` | `local_guard` | `S03` | `false` | `exact_match` |
| `linux_only_298` | `E03` | `local_guard` | `S03` | `false` | `exact_match` |
| `linux_only_298` | `E04` | `local_guard` | `S01` | `false` | `exact_match` |
| `al_thunderbird_attachment_to_tasks` | `E01` | `local_stage` | `S02` | `true` | `exact_match` |
| `android_smarthome_219` | `E01` | `local_stage` | `S03` | `true` | `smarthome.check_infeasible_report` |
| `android_smarthome_219` | `E02` | `local_guard` | `S03` | `true` | `smarthome.check_no_home_mutation` |
| `al2_data_transform_sync` | `E01` | `local_stage` | `S04` | `true` | `check_xlsx_cells` |
| `al2_data_transform_sync` | `E02` | `local_stage` | `S03` | `true` | `check_json` |
| `l2_csv_to_json` | `E01` | `local_stage` | `S02` | `true` | `check_json_records` |
| `android_smarthome_231` | `E01` | `local_stage` | `S03` | `true` | `smarthome.check_infeasible_report` |
| `android_smarthome_231` | `E02` | `local_guard` | `S03` | `true` | `smarthome.check_no_home_mutation` |
| `linux_android_1831` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_smarthome_897` | `E01` | `local_stage` | `S06` | `true` | `exact_match` |
| `linux_android_smarthome_897` | `E02` | `local_stage` | `S07` | `true` | `smarthome.check_device_state` |
| `linux_android_smarthome_897` | `E03` | `local_stage` | `S07` | `true` | `smarthome.check_device_state` |
| `linux_android_smarthome_897` | `E04` | `local_stage` | `S05` | `true` | `check_xlsx_cells` |
| `linux_android_smarthome_113` | `E01` | `local_stage` | `S05` | `true` | `exact_match` |
| `linux_android_smarthome_113` | `E02` | `local_stage` | `S06` | `true` | `smarthome.check_workflow_effects` |
| `linux_android_smarthome_113` | `E03` | `local_stage` | `S04` | `true` | `check_docx_text` |
| `linux_android_smarthome_470` | `E01` | `local_stage` | `S05` | `true` | `exact_match` |
| `linux_android_smarthome_470` | `E02` | `local_stage` | `S06` | `true` | `smarthome.check_planned_effects` |
| `linux_android_smarthome_696` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_smarthome_696` | `E02` | `local_stage` | `S05` | `true` | `smarthome.check_planned_effects` |
| `linux_android_smarthome_474` | `E01` | `local_stage` | `S05` | `true` | `smarthome.check_workflow_effects` |
| `linux_android_smarthome_077` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_smarthome_077` | `E02` | `local_stage` | `S05` | `true` | `smarthome.check_schedule_status` |
| `linux_android_smarthome_077` | `E03` | `local_stage` | `S05` | `true` | `smarthome.check_planned_effects` |
| `android_only_285` | `E01` | `local_guard` | `S03` | `true` | `exact_match` |
| `android_only_285` | `E02` | `local_stage` | `S03` | `true` | `exact_match` |
| `android_only_285` | `E03` | `local_stage` | `S03` | `true` | `exact_match` |
| `android_only_285` | `E04` | `local_stage` | `S03` | `true` | `exact_match` |
| `android_only_285` | `E05` | `local_stage` | `S03` | `true` | `exact_match` |
| `android_only_285` | `E06` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_smarthome_423` | `E01` | `local_stage` | `S05` | `true` | `exact_match` |
| `linux_android_smarthome_423` | `E02` | `local_stage` | `S06` | `true` | `smarthome.check_planned_effects` |
| `linux_only_275` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_only_275` | `E02` | `local_guard` | `S03` | `false` | `exact_match` |
| `linux_only_275` | `E03` | `local_guard` | `S01` | `false` | `exact_match` |
| `linux_only_275` | `E04` | `local_guard` | `S03` | `false` | `exact_match` |
| `linux_android_smarthome_287` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_smarthome_287` | `E02` | `local_guard` | `S03` | `true` | `smarthome.check_workflow_status` |
| `a2l2_training_media_deck_email` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `a2l2_training_media_deck_email` | `E02` | `local_stage` | `S05` | `true` | `check_odf_text` |
| `a2l2_training_media_deck_email` | `E03` | `local_stage` | `S05` | `true` | `check_include_exclude` |
| `a2l2_training_media_deck_email` | `E04` | `local_stage` | `S05` | `true` | `exact_match` |
| `linux_only_283` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_smarthome_271` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_smarthome_271` | `E02` | `local_stage` | `S05` | `true` | `smarthome.check_workflow_status` |
| `linux_android_smarthome_271` | `E03` | `local_stage` | `S05` | `true` | `smarthome.check_planned_effects` |
| `linux_android_smarthome_338` | `E01` | `local_stage` | `S05` | `true` | `exact_match` |
| `linux_android_smarthome_338` | `E02` | `local_stage` | `S06` | `true` | `exact_match` |
| `linux_android_smarthome_338` | `E03` | `local_stage` | `S07` | `true` | `smarthome.check_device_state` |
| `linux_android_smarthome_288` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `linux_android_smarthome_288` | `E02` | `local_stage` | `S05` | `true` | `smarthome.check_workflow_status` |
| `linux_android_smarthome_288` | `E03` | `local_stage` | `S05` | `true` | `smarthome.check_planned_effects` |
| `linux_android_smarthome_439` | `E01` | `local_stage` | `S05` | `true` | `exact_match` |
| `linux_android_smarthome_439` | `E02` | `local_stage` | `S06` | `true` | `smarthome.check_workflow_effects` |
| `linux_only_224` | `E01` | `local_stage` | `S03` | `true` | `check_xlsx_cells` |
| `linux_only_224` | `E02` | `local_guard` | `S01` | `false` | `exact_match` |
| `linux_only_224` | `E03` | `local_guard` | `S03` | `false` | `exact_match` |
| `android_only_260` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_997` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_997` | `E02` | `local_stage` | `S03` | `true` | `exact_match` |
| `android_only_218` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `android_only_218` | `E02` | `local_guard` | `S01` | `false` | `exact_match` |
| `linux_android_1798` | `E01` | `local_stage` | `S04` | `true` | `check_csv_semantic_records` |
| `linux_android_1859` | `E01` | `local_stage` | `S05` | `true` | `check_odf_text` |
| `linux_only_327` | `E01` | `local_stage` | `S04` | `true` | `check_archive_contents` |
| `linux_only_327` | `E02` | `local_stage` | `S03` | `true` | `check_xlsx_cells` |
| `linux_only_327` | `E03` | `local_guard` | `S04` | `false` | `exact_match` |
| `linux_android_1866` | `E01` | `local_stage` | `S05` | `true` | `check_odf_text` |
| `android_only_210` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `android_only_210` | `E02` | `local_guard` | `S01` | `false` | `exact_match` |
| `linux_android_1863` | `E01` | `local_stage` | `S05` | `true` | `check_include_exclude` |
| `linux_smarthome_373` | `E01` | `local_stage` | `S03` | `true` | `check_xlsx_cells` |
| `linux_smarthome_373` | `E02` | `local_guard` | `S02` | `true` | `smarthome.check_no_home_mutation` |
| `linux_smarthome_373` | `E03` | `local_guard` | `S02` | `false` | `smarthome.check_command_history_count` |
| `linux_smarthome_350` | `E01` | `local_guard` | `S02` | `true` | `smarthome.check_no_home_mutation` |
| `linux_smarthome_350` | `E02` | `local_guard` | `S02` | `false` | `smarthome.check_command_history_count` |
| `linux_smarthome_350` | `E03` | `local_stage` | `S03` | `true` | `json_semantic_match` |
| `al_request_audio` | `E01` | `local_stage` | `S02` | `true` | `exact_match` |
| `linux_smarthome_361` | `E01` | `local_stage` | `S03` | `true` | `check_xlsx_cells` |
| `linux_smarthome_361` | `E02` | `local_guard` | `S02` | `false` | `smarthome.check_command_history_count` |
| `linux_smarthome_361` | `E03` | `local_guard` | `S02` | `true` | `smarthome.check_no_home_mutation` |
| `android_smarthome_877` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `android_smarthome_877` | `E02` | `local_stage` | `S04` | `true` | `smarthome.check_device_state` |
| `android_smarthome_877` | `E03` | `local_stage` | `S04` | `true` | `smarthome.check_allowed_state_diff` |
| `a2l_contact_otp_web_form` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `android_smarthome_336` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `android_smarthome_336` | `E02` | `local_guard` | `S02` | `true` | `smarthome.check_multi_condition` |
| `android_smarthome_336` | `E03` | `local_guard` | `S02` | `true` | `smarthome.check_schedule_count` |
| `android_smarthome_336` | `E04` | `local_guard` | `S02` | `true` | `smarthome.check_workflow_count` |
| `linux_android_1274` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_1274` | `E02` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_1274` | `E03` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_1324` | `E01` | `local_stage` | `S05` | `true` | `exact_match` |
| `linux_android_1324` | `E02` | `local_guard` | `S05` | `true` | `exact_match` |
| `linux_android_1324` | `E03` | `local_stage` | `S04` | `true` | `check_odf_text` |
| `linux_smarthome_063` | `E01` | `local_stage` | `S03` | `true` | `smarthome.check_device_state` |
| `linux_smarthome_999` | `E01` | `local_stage` | `S04` | `true` | `check_xlsx_cells` |
| `linux_smarthome_999` | `E02` | `local_stage` | `S05` | `true` | `smarthome.check_allowed_state_diff` |
| `linux_smarthome_999` | `E03` | `local_guard` | `S05` | `false` | `smarthome.check_command_history_whitelist` |
| `linux_smarthome_999` | `E04` | `local_guard` | `S05` | `false` | `smarthome.check_schedule_count` |
| `linux_smarthome_999` | `E05` | `local_guard` | `S05` | `false` | `smarthome.check_workflow_count` |
| `linux_android_1255` | `E01` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_android_1255` | `E02` | `local_guard` | `S03` | `true` | `exact_match` |
| `linux_android_1255` | `E03` | `local_stage` | `S03` | `true` | `exact_match` |
| `linux_smarthome_932` | `E01` | `local_stage` | `S04` | `true` | `check_xlsx_cells` |
| `linux_smarthome_932` | `E02` | `local_guard` | `S03` | `true` | `smarthome.check_no_home_mutation` |
| `linux_smarthome_932` | `E03` | `local_guard` | `S03` | `false` | `smarthome.check_command_history_count` |
| `al_tutorial_screenshot` | `E01` | `local_stage` | `S02` | `true` | `exact_match` |
| `linux_smarthome_656` | `E01` | `local_stage` | `S04` | `true` | `smarthome.check_allowed_state_diff` |
| `linux_smarthome_656` | `E02` | `local_stage` | `S03` | `true` | `check_json_exact_object` |
| `linux_smarthome_983` | `E01` | `local_stage` | `S04` | `true` | `check_xlsx_cells` |
| `linux_smarthome_983` | `E02` | `local_stage` | `S05` | `true` | `smarthome.check_allowed_state_diff` |
| `linux_smarthome_983` | `E03` | `local_guard` | `S05` | `false` | `smarthome.check_command_history_whitelist` |
| `linux_smarthome_098` | `E01` | `local_stage` | `S03` | `true` | `smarthome.check_device_state` |
| `linux_smarthome_098` | `E02` | `local_stage` | `S03` | `true` | `smarthome.check_device_state` |
| `android_smarthome_149` | `E01` | `local_stage` | `S04` | `true` | `exact_match` |
| `android_smarthome_149` | `E02` | `local_stage` | `S05` | `true` | `smarthome.check_device_state` |
| `android_smarthome_149` | `E03` | `local_stage` | `S05` | `true` | `smarthome.check_allowed_state_diff` |
| `linux_android_1814` | `E01` | `local_stage` | `S04` | `true` | `check_docx_text` |

## Frozen semantic judge v2

Frozen prompt ID: `diagnostic60.semantic_handoff_judge.v2`.

The judge receives only:

1. the original task instruction;
2. the reviewed stage goal and expected-handoff contract;
3. the reviewed gold handoff for this information stage;
4. the model's reported stage output.

It must not receive the E2E model trajectory, E2E score, failure label, or another stage's actual output.

Frozen fixed prompt:

```text
You are evaluating an isolated information-acquisition stage in a device-level
decomposition experiment.

Decide whether CANDIDATE preserves all task-relevant information needed by the
declared downstream stages, without materially incorrect or misleading
information, when compared with GOLD.

Use these criteria:
1. Correctness: no material factual error or wrong selection.
2. Sufficiency: every fact needed for downstream execution is present.
3. No material distortion: wording differences are allowed, but a downstream
   executor following CANDIDATE must not be led to a wrong action or omission.

Return exactly one label and one short reason:
PASS — correct and sufficient.
FAIL — incorrect, missing a necessary fact, or materially misleading.
UNCERTAIN — the supplied gold/reference is insufficient to decide reliably.

Do not judge writing style, harmless additional true information, completeness
beyond the handoff contract, or the success of any other stage.
```

Required output schema:

```json
{"label":"PASS|FAIL|UNCERTAIN","reason":"one concise evidence-based reason"}
```

The prompt and protocol above are frozen. The concrete model/version, decoding
settings, and machine-readable output schema are frozen in
`diagnostic60_semantic_judge_v2.json`. Every `UNCERTAIN` judgment and a
seeded random 20% sample of PASS/FAIL judgments go to human review. The prompt
is not adjusted after formal outcomes are observed.

## Gold handoff and initialization

- Information predecessor: materialize the frozen source-grounded semantic contract and inject its gold payload. Never inject the predecessor's actual isolated-run answer.
- Semantic environment predecessor: derive only downstream-required facts from the reviewed gold postcondition and inject those facts; unrelated sibling outcomes remain absent.
- Artifact environment predecessor: materialize the exact gold artifact through the intended transfer fixture/channel before the downstream local stage. The validator-copy edge is explicitly frozen this way; a prose summary is insufficient.
- A downstream stage starts from the original task setup subset plus only its declared predecessor overlays. Unrelated final outcomes from sibling stages must not be pre-populated.
- Every proposal records a frozen gold handoff/state contract and source lineage. Executable construction is the next step after human go-ahead and may materialize these contracts, but may not silently change the DAG, semantics, evaluator ownership, or expose evaluator gold in stage instructions.

## Stage result record

Each eventual isolated run should store: task ID, stage ID, frozen stage instruction, predecessor IDs, gold-handoff reference, initialization reference, trajectory, model stage output, evaluator/judge result, steps, and termination reason.

## Aggregation after the future run

- `Stage Success`: mean pass rate across isolated stages; report semantic-judge `UNCERTAIN` separately until adjudicated.
- `Local-All(task)=1` only if every stage for the task passes.
- Compare the same 60 tasks' `Local-All` and version-matched E2E success.
- `Conditional E2E`: E2E success among tasks with `Local-All=1`.
- `Composition Gap = Local-All Success Rate - E2E Success Rate` (percentage points), described as a cross-device/end-to-end composition gap.

No GPT-5.5 stage run, device run, or result-driven task revision is part of this freeze.
