# Diagnostic-60 Device-Local Decomposition Proposal

> Status: **reviewed and frozen; not executable; awaiting human go-ahead**. Stage instructions intentionally omit gold values.

The stage boundaries, device assignments, dependency edges, gold handoff/state contracts, and evaluator ownership are frozen. Exact runnable fixtures are intentionally not created in this review step; executable construction must materialize these frozen source-grounded contracts without changing them.

Original evaluator ownership is one of `local_stage`, `local_guard`, or `global_only`. A `global_only` evaluator is retained at task scope and is not forced into a local stage.

## 01. `linux_android_1241`

- Task: `tasks/cross_device/linux_android/linux_android_1241.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire] -> L2: S04[android_0:execute] -> L3: S03[linux_0:execute] | edges: S01→S03; S02→S03; S04→S03; S01→S04; S02→S04
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1241/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 4}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Please set up the planning meeting and notify its active attendees. The meeting details are in `/tmp/meeting/brief.odt` on the first Linux machine, and `/tmp/meeting/attendees.csv` on the second identifies active and archived attendees. Create the event in Simple Calendar Pro using the title, start time, end time, and location from the brief. Text each active attendee the meeting title, start time, and location, and do not text the archived attendee. Use `/tmp/meeting/brief_transform_audit_template.csv` on the first Linux machine to create `/tmp/meeting/brief_transform_audit.csv`, with one row for each attendee. Use the active meeting title for every audit row, and mark active attendees as `notified` and the archived attendee as `skipped`.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 3 | `linux_0` | `environment_execution` | S01, S02, S04 | E05(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file at `/tmp/meeting/brief_transform_audit.csv`. |
| `S04` | 2 | `android_0` | `environment_execution` | S01, S02 | E01(local_stage), E02(local_stage), E03(local_stage), E04(local_guard) | Complete the evaluated local outcomes on android_0: create the required calendar event; send or withhold the required message. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (brief identifier, title, time, location, and other declared meeting fields; required output fields, labels, layout, and formatting constraints; relevant rows, current/active selection, identifiers, and required fields; task-relevant document fields and any required layout/template constraints). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/meeting/brief.odt`, declared_source_file=`/tmp/meeting/brief_transform_audit_template.csv`
  - Expected handoff: information — brief identifier, title, time, location, and other declared meeting fields; required output fields, labels, layout, and formatting constraints; relevant rows, current/active selection, identifiers, and required fields; task-relevant document fields and any required layout/template constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (attendee identity, active/archive status, role, and contact destination; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/meeting/attendees.csv`
  - Expected handoff: information — attendee identity, active/archive status, role, and contact destination; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/meeting/brief_transform_audit.csv`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/meeting/brief_transform_audit.csv`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S04:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required calendar event; send or withhold the required message. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required calendar event; send or withhold the required message
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 02. `linux_android_1368`

- Task: `tasks/cross_device/linux_android/linux_android_1368.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire] -> L2: S03[android_0:execute] -> L3: S04[android_1:execute] | edges: S01→S03; S02→S03; S01→S04; S02→S04; S03→S04
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1368/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Please apply `/tmp/calendar/description_patch.csv` to the matching event in Simple Calendar Pro on the first phone, keeping its title, time, and location unchanged. Also write `Calendar patch CAL-1368.md` in Markor on the second phone with a concise summary of the final event title, time, location, and appended description.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 2 | `android_0` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create the required calendar event. |
| `S04` | 3 | `android_1` | `environment_execution` | S01, S02, S03 | E02(local_stage) | Complete the evaluated local outcomes on android_1: create or update the required Markor note. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/calendar/description_patch.csv`
  - Expected handoff: information — matching calendar event identity, time, location, and description; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; matching event identity, time, location, and description). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`
  - Expected handoff: information — matching calendar event identity, time, location, and description; matching event identity, time, location, and description
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required calendar event. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required calendar event
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or update the required Markor note. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or update the required Markor note
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 03. `android_smarthome_233`

- Task: `tasks/cross_device/android_smarthome/android_smarthome_233.json`
- Graph: L1: S01[android_0:acquire], S02[home_0:acquire] -> L2: S03[home_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/android_smarthome_assets/android_smarthome_233/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, infeasible_report_and_no_mutation_contract_reviewed, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 2, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Read the kitchen aroma request in Simple SMS Messenger on the phone and check whether Home has the equipment needed to carry it out. If it cannot be completed, report the missing equipment and why the requested setting cannot be applied. Do not substitute another device. Do not send an SMS reply.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | E02(local_guard) | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 2 | `home_0` | `environment_execution` | S01, S02 | E01(local_stage), E03(local_guard) | Complete the evaluated local outcomes on home_0: report the infeasible SmartHome request correctly. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`received message`
  - Expected handoff: information — message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/android_smarthome_assets/android_smarthome_233/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: report the infeasible SmartHome request correctly. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — report the infeasible SmartHome request correctly
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 04. `a2l2_vscode_web_music_final_gate`

- Task: `tasks/cross_device/real300/a2l2_vscode_web_music_final_gate.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire], S03[linux_0:acquire] -> L2: S04[linux_0:execute] -> L3: S05[linux_1:execute] | edges: S01→S04; S02→S04; S03→S04; S01→S05; S02→S05; S03→S05; S04→S05
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed, global_evaluator_retained_as_global_only, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"global_only": 1, "local_stage": 3}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Prepare the launch validator for the staging kiosk. The first phone's Markor note `Launch checklist` contains the approved operations checklist, and the second phone's Retro Music playlist `Launch audio` contains the approved audio cues. In the VSCode project on the first Linux machine, fix `/tmp/launch/validator.html` so `evaluateLaunchGate(checklist, playlistTracks)` accepts exactly those two approved lists; missing, substituted, duplicated, extra, or non-list values must fail. Copy the corrected file from the first Linux machine to `/home/user/launch/validator.html` on the second Linux machine. Open that copied page in Chrome, enter the approved checklist and audio-cue lists in the page, run validation, and leave the page showing that `checklistReady`, `audioReady`, and `launch_passed` are all `true`.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S04` | 2 | `linux_0` | `environment_execution` | S01, S02, S03 | E01(local_stage) | Complete the evaluated local outcomes on linux_0: implement the required persisted web logic. |
| `S05` | 3 | `linux_1` | `environment_execution` | S01, S02, S03, S04 | E02(local_stage), E04(local_stage) | Complete the evaluated local outcomes on linux_1: implement the required persisted web logic; leave the required validated browser state visible. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching phone value; required filename, file membership, or file content facts; playlist identity and exact track membership). Do not modify the source state.
  - Source/context: task_provided_android_file_or_state=`/storage/emulated/0/Documents/Markor`, task_provided_android_file_or_state=`/storage/emulated/0/Documents/Markor/Launch`
  - Expected handoff: information — matching phone value; required filename, file membership, or file content facts; playlist identity and exact track membership
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (playlist identity and exact ordered or unordered track membership required downstream; audio identity, requested format/location, or task-relevant content). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded audio file`, task_provided_app_state=`preloaded playlist`
  - Expected handoff: information — playlist identity and exact ordered or unordered track membership required downstream; audio identity, requested format/location, or task-relevant content
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching phone value; required filename, file membership, or file content facts; playlist identity and exact track membership). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/launch/README.md`, task_provided_file=`/tmp/launch/validator.html`
  - Expected handoff: information — matching phone value; required filename, file membership, or file content facts; playlist identity and exact track membership
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: implement the required persisted web logic. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — implement the required persisted web logic
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: implement the required persisted web logic; leave the required validated browser state visible. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — implement the required persisted web logic; leave the required validated browser state visible
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:artifact_transfer
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 05. `linux_android_1858`

- Task: `tasks/cross_device/linux_android/linux_android_1858.json`
- Graph: L1: S01[android_0:acquire], S02[linux_0:acquire] -> L2: S03[linux_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1858/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen`
- Evaluator ownership: `{"local_guard": 2, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Cross-check the latest Simple SMS Messenger request against the current row in `/tmp/contacts/recipient_table.csv` on the first Linux desktop. If their phone values conflict, write `/tmp/communication/communication_status.md` on the second Linux desktop with the case, approval code, owner, both phone values, and why no reply can be sent. Do not send a reply or confirmation to either phone value.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | E02(local_guard), E03(local_guard) | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S03` | 2 | `linux_1` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create and verify the required Linux artifact. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`received message`
  - Expected handoff: information — message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/contacts/recipient_table.csv`
  - Expected handoff: information — matching contact identity, role, phone number, or email address; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create and verify the required Linux artifact. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create and verify the required Linux artifact
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 06. `linux_android_1034`

- Task: `tasks/cross_device/linux_android/linux_android_1034.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire], S03[linux_0:acquire] -> L2: S04[android_1:execute], S05[linux_1:execute] | edges: S01→S04; S02→S04; S03→S04; S01→S05; S03→S05
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1034/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 4}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The field team needs a route decision for the current approved request. Open `1034-A_source.md` in Downloads on the first phone and compare it with `/tmp/sites/site_registry.csv` and `/tmp/sites/handoff_policy.md` on the first Linux machine. Follow the policy using the selected site record. On the second phone, leave the existing OsmAnd favorites unchanged unless that record authorizes a new favorite, and create a Markor note called `1034-A route status`. On the second Linux machine, write `/tmp/sites/1034-A_handoff.txt`. Both handoffs should identify the case, approval code, owner, selected site, route decision, and reason.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S04` | 2 | `android_1` | `environment_execution` | S01, S02, S03 | E01(local_stage), E02(local_stage) | Complete the evaluated local outcomes on android_1: create or preserve the required map favorites; create or update the required Markor note. |
| `S05` | 2 | `linux_1` | `environment_execution` | S01, S03 | E03(local_stage), E04(local_stage) | Complete the evaluated local outcomes on linux_1: create and verify the required Linux artifact; create or copy the required Linux text artifact at `/tmp/sites/1034-A_ha… |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (case or request identifier; approval code or approval status; responsible owner; matching phone value; record status or decision; applicable policy rule and decision consequence; which candidate record or state is current; route or handoff decision). Do not modify the source state.
  - Source/context: task_provided_file=`/sdcard/Download/1034-A_source.md`
  - Expected handoff: information — case or request identifier; approval code or approval status; responsible owner; matching phone value; record status or decision; applicable policy rule and decision consequence; which candidate record or state is current; route or handoff decision
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (site/room mapping, route facts, and applicable decision rule; favorite identity, label, and coordinates). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded map favorite state`, task_provided_file=`/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`
  - Expected handoff: information — site/room mapping, route facts, and applicable decision rule; favorite identity, label, and coordinates
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (applicable policy rule, thresholds, authorization, and decision consequence; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/sites/site_registry.csv`, task_provided_file=`/tmp/sites/handoff_policy.md`
  - Expected handoff: information — applicable policy rule, thresholds, authorization, and decision consequence; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or preserve the required map favorites; create or update the required Markor note. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or preserve the required map favorites; create or update the required Markor note
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create and verify the required Linux artifact; create or copy the required Linux text artifact at `/tmp/sites/1034-A_handoff.txt`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create and verify the required Linux artifact; create or copy the required Linux text artifact at `/tmp/sites/1034-A_handoff.txt`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 07. `a2_gallery_album_to_tasks`

- Task: `tasks/cross_device/real300/a2_gallery_album_to_tasks.json`
- Graph: L1: S01[android_0:acquire] -> L2: S02[android_1:execute] | edges: S01→S02
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed, visual_source_gold_contract_reviewed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The first phone's Simple Gallery Pro has a `Receipts` album with three receipt images. On the second phone, create one incomplete review task per image, using the exact image filename as the task title.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 2 | `android_1` | `environment_execution` | S01 | E01(local_stage) | Complete the evaluated local outcomes on android_1: create or preserve the required task set. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (media identity, filenames, album membership, and only required visible facts). Do not modify the source state.
  - Source/context: task_provided_file=`/sdcard/Pictures/Receipts/receipt_march_01.png`, task_provided_file=`/sdcard/Pictures/Receipts/receipt_march_15.png`, task_provided_file=`/sdcard/Pictures/Receipts/receipt_march_28.png`, task_provided_app_state=`preloaded gallery media`
  - Expected handoff: information — media identity, filenames, album membership, and only required visible facts
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or preserve the required task set. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or preserve the required task set
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 08. `a2_missing_media_status`

- Task: `tasks/cross_device/real100/a2_missing_media_status.json`
- Graph: L1: S01[android_0:acquire] -> L2: S02[android_1:execute] | edges: S01→S02
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The first phone received a Simple SMS Messenger message asking me to find a specific photo in Downloads on the second phone. Use Android Files on the second phone to check for it. If the photo is missing, create a Markor note called `Photo status` on the second phone with the missing filename and Simple SMS Messenger as the source.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 2 | `android_1` | `environment_execution` | S01 | E01(local_stage), E02(local_guard) | Complete the evaluated local outcomes on android_1: create the required Android status note. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`received message`
  - Expected handoff: information — message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Android status note. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Android status note
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 09. `linux_only_298`

- Task: `tasks/cross_device/linux_only/linux_only_298.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire] -> L2: S03[linux_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_only_assets/linux_only_298/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 3, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Prepare a playback handoff on the second Linux machine. Use the active session from `/tmp/media/current_session.csv` on the first Linux machine and confirm that its referenced clip exists in `/tmp/media/clips/` on the second Linux machine. Then write `/tmp/media/playback_review.md` on the second Linux machine with the active session ID, clip filename, and assigned reviewer.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | E04(local_guard) | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 2 | `linux_1` | `environment_execution` | S01, S02 | E01(local_stage), E02(local_guard), E03(local_guard) | Complete the evaluated local outcomes on linux_1: create and verify the required Linux artifact. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/media/current_session.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (audio identity, requested format/location, or task-relevant content). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/media/clips/long_audio_A.wav`, declared_source_file=`/tmp/media/clips/old_session.wav`
  - Expected handoff: information — audio identity, requested format/location, or task-relevant content
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create and verify the required Linux artifact. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create and verify the required Linux artifact
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 10. `al_thunderbird_attachment_to_tasks`

- Task: `tasks/cross_device/real200/al_thunderbird_attachment_to_tasks.json`
- Graph: L1: S01[linux_0:acquire] -> L2: S02[android_0:execute] | edges: S01→S02
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Linux Thunderbird has an email titled `Tasks for today` with a task-list CSV attachment. In the Android Tasks app, add one incomplete task using the `title` from every CSV row.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 2 | `android_0` | `environment_execution` | S01 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create or preserve the required task set. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/mail/message.eml`
  - Expected handoff: information — message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or preserve the required task set. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or preserve the required task set
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 11. `android_smarthome_219`

- Task: `tasks/cross_device/android_smarthome/android_smarthome_219.json`
- Graph: L1: S01[android_0:acquire], S02[home_0:acquire] -> L2: S03[home_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/android_smarthome_assets/android_smarthome_219/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, infeasible_report_and_no_mutation_contract_reviewed, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Open the `Color Light Request` note in Markor on the phone and check whether the installed bedroom light can satisfy the full request. If Home does not support part of the request, report what cannot be completed and why, and leave the Home devices unchanged.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 2 | `home_0` | `environment_execution` | S01, S02 | E01(local_stage), E02(local_guard) | Complete the evaluated local outcomes on home_0: report the infeasible SmartHome request correctly. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching phone value). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Documents/Markor/Color Light Request.md`
  - Expected handoff: information — matching phone value
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/android_smarthome_assets/android_smarthome_219/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: report the infeasible SmartHome request correctly. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — report the infeasible SmartHome request correctly
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 12. `al2_data_transform_sync`

- Task: `tasks/cross_device/real100/al2_data_transform_sync.json`
- Graph: L1: S01[android_0:acquire], S02[linux_0:acquire] -> L2: S03[linux_0:execute], S04[linux_1:execute] | edges: S01→S03; S02→S03; S01→S04; S02→S04
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> I need the CSV organized into a delivery spreadsheet according to the handoff rule. The Android Markor note `Transform rule` explains how to process `/tmp/data/input.csv` on the first Linux machine. Please create `/tmp/data/result.xlsx` on the second Linux machine and write `/tmp/data/status.json` on the first Linux machine.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S03` | 2 | `linux_0` | `environment_execution` | S01, S02 | E02(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file. |
| `S04` | 2 | `linux_1` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (applicable rule, thresholds, mapping, and decision consequence). Do not modify the source state.
  - Source/context: task_provided_file=`${rule_note_path}`
  - Expected handoff: information — applicable rule, thresholds, mapping, and decision consequence
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/data/input.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 13. `l2_csv_to_json`

- Task: `tasks/cross_device/real100/l2_csv_to_json.json`
- Graph: L1: S01[linux_0:acquire] -> L2: S02[linux_1:execute] | edges: S01→S02
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> `/tmp/orders/orders.csv` on the first Linux machine contains today's orders. Please convert it to `/tmp/orders/orders.json` on the second Linux machine.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 2 | `linux_1` | `environment_execution` | S01 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/orders/orders.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 14. `android_smarthome_231`

- Task: `tasks/cross_device/android_smarthome/android_smarthome_231.json`
- Graph: L1: S01[android_0:acquire], S02[home_0:acquire] -> L2: S03[home_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/android_smarthome_assets/android_smarthome_231/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, infeasible_report_and_no_mutation_contract_reviewed, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Open the `Nursery air request` note in Markor on the phone and check Home for the equipment needed to complete it. If the required equipment is missing, report what is unavailable and why the calibration cannot be completed. Do not substitute another device or change Home.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 2 | `home_0` | `environment_execution` | S01, S02 | E01(local_stage), E02(local_guard) | Complete the evaluated local outcomes on home_0: report the infeasible SmartHome request correctly. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching phone value). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Documents/Markor/Nursery air request.md`
  - Expected handoff: information — matching phone value
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/android_smarthome_assets/android_smarthome_231/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: report the infeasible SmartHome request correctly. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — report the infeasible SmartHome request correctly
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 15. `linux_android_1831`

- Task: `tasks/cross_device/linux_android/linux_android_1831.json`
- Graph: L1: S01[android_0:acquire], S02[linux_0:acquire] -> L2: S03[android_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1831/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Open `/tmp/android_targets/site_row.csv` on the Linux desktop and create an OsmAnd favorite on the phone from the row that is current and marked for inclusion. Use that row's site name, latitude, and longitude, and skip rows marked archived, hold, or missing-photo.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S03` | 2 | `android_0` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create or preserve the required map favorites. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (site/room mapping, route facts, and applicable decision rule; favorite identity, label, and coordinates). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded map favorite state`
  - Expected handoff: information — site/room mapping, route facts, and applicable decision rule; favorite identity, label, and coordinates
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/android_targets/site_row.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or preserve the required map favorites. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or preserve the required map favorites
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 16. `linux_android_smarthome_897`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_897.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire], S03[android_0:acquire], S04[home_0:acquire] -> L2: S07[home_0:execute] -> L3: S05[linux_1:execute], S06[android_0:execute] | edges: S01→S05; S02→S05; S03→S05; S04→S05; S07→S05; S01→S06; S02→S06; S03→S06; S04→S06; S07→S06; S01→S07; S02→S07; S03→S07; S04→S07
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_897/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 4}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Please carry out the approved bedroom comfort fallback requested in the existing Android task. Read `/tmp/bedroom-comfort-fallback/policy/mode_policy.pdf` on the first Linux machine and use `/tmp/bedroom-comfort-fallback/register/comfort_order.xlsx` on the second Linux machine as the record to complete. Apply the approved settings in SmartHome, then update and complete the existing Android task with a short note stating the AC setting, dehumidifier setting, and that the fallback was applied. Save the completed register on the second Linux machine as `/tmp/bedroom-comfort-fallback/result/comfort_order_done.xlsx`, preserving the workbook and setting its status to `Applied`.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S04` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S05` | 3 | `linux_1` | `environment_execution` | S01, S02, S03, S04, S07 | E04(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/tmp/bedroom-comfort-fallback/result/comfort_order_done.xlsx`. |
| `S06` | 3 | `android_0` | `environment_execution` | S01, S02, S03, S04, S07 | E01(local_stage) | Complete the evaluated local outcomes on android_0: update and complete the required task. |
| `S07` | 2 | `home_0` | `environment_execution` | S01, S02, S03, S04 | E02(local_stage), E03(local_stage) | Complete the evaluated local outcomes on home_0: apply the required SmartHome device state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (applicable policy rule, thresholds, authorization, and decision consequence; task-relevant policy, request, or template facts from the document). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/bedroom-comfort-fallback/policy/mode_policy.pdf`
  - Expected handoff: information — applicable policy rule, thresholds, authorization, and decision consequence; task-relevant policy, request, or template facts from the document
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current values, identifiers, and requested decisions; relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/bedroom-comfort-fallback/register/comfort_order.xlsx`
  - Expected handoff: information — relevant rows, current values, identifiers, and requested decisions; relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task identity, notes, due state, and fields required downstream). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Download/bedroom-comfort.txt`, task_provided_app_state=`preloaded task`
  - Expected handoff: information — task identity, notes, due state, and fields required downstream
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_897/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/bedroom-comfort-fallback/result/comfort_order_done.xlsx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/bedroom-comfort-fallback/result/comfort_order_done.xlsx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff, S07:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S06` frozen instruction blueprint: Using the available context, complete the requested work on the current device: update and complete the required task. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — update and complete the required task
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff, S07:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S07` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply the required SmartHome device state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply the required SmartHome device state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 17. `linux_android_smarthome_113`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_113.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[home_0:acquire] -> L2: S04[linux_0:execute], S05[android_0:execute], S06[home_0:execute] | edges: S01→S04; S02→S04; S03→S04; S01→S05; S02→S05; S03→S05; S01→S06; S02→S06; S03→S06
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_113/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 3}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Jordan Lee is visiting, so please prepare the Guest room using the saved contact preferences, Calendar timing, current SmartHome state, and `/tmp/visit/standard.xlsx`. Schedule the preparation workflow and send Jordan a concise confirmation with the Guest room, preparation time, temperature, light level, and air-purifier setting. Also create `/tmp/visit/record.docx` titled `Visitor record` with a readable two-column summary labeled `Visitor`, `Room`, `Workflow time`, `Temperature`, `Light`, and `Air purifier`.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 2 | `linux_0` | `environment_execution` | S01, S02, S03 | E03(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file at `/tmp/visit/record.docx`. |
| `S05` | 2 | `android_0` | `environment_execution` | S01, S02, S03 | E01(local_stage) | Complete the evaluated local outcomes on android_0: send or withhold the required message. |
| `S06` | 2 | `home_0` | `environment_execution` | S01, S02, S03 | E02(local_stage) | Complete the evaluated local outcomes on home_0: create, cancel, or preserve the required SmartHome workflow. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/visit/standard.xlsx`
  - Expected handoff: information — relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address; matching calendar event identity, time, location, and description; matching event identity, time, location, and description). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded contact`, task_provided_app_state=`preloaded calendar event`
  - Expected handoff: information — matching contact identity, role, phone number, or email address; matching calendar event identity, time, location, and description; matching event identity, time, location, and description
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_113/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/visit/record.docx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/visit/record.docx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: send or withhold the required message. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — send or withhold the required message
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S06` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create, cancel, or preserve the required SmartHome workflow. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create, cancel, or preserve the required SmartHome workflow
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 18. `linux_android_smarthome_470`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_470.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[android_1:acquire], S04[home_0:acquire] -> L2: S06[home_0:execute] -> L3: S05[android_1:execute] | edges: S01→S05; S02→S05; S03→S05; S04→S05; S06→S05; S01→S06; S02→S06; S03→S06; S04→S06
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_470/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Prepare the mapped arrival scene. Confirm the saved arrival location in OsmAnd on the first phone and the current arrival time in Simple Calendar Pro on the second phone. Use `/tmp/home_ops/operations-log/source/location_map.csv` to select the unique matching scene rule, schedule it in SmartHome, then reply in the existing SMS thread with the saved location, scheduled time, and that the scene has been scheduled / will be prepared then.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S04` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S05` | 3 | `android_1` | `environment_execution` | S01, S02, S03, S04, S06 | E01(local_stage) | Complete the evaluated local outcomes on android_1: send or withhold the required message. |
| `S06` | 2 | `home_0` | `environment_execution` | S01, S02, S03, S04 | E02(local_stage) | Complete the evaluated local outcomes on home_0: apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (site/room mapping, route facts, and applicable decision rule; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/home_ops/operations-log/source/location_map.csv`
  - Expected handoff: information — site/room mapping, route facts, and applicable decision rule; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (site/room mapping, route facts, and applicable decision rule; favorite identity, label, and coordinates). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded map favorite state`, task_provided_file=`/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`
  - Expected handoff: information — site/room mapping, route facts, and applicable decision rule; favorite identity, label, and coordinates
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; matching event identity, time, location, and description; message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`, task_provided_app_state=`received message`
  - Expected handoff: information — matching calendar event identity, time, location, and description; matching event identity, time, location, and description; message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_470/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: send or withhold the required message. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — send or withhold the required message
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff, S06:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S06` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 19. `linux_android_smarthome_696`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_696.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[home_0:acquire] -> L2: S05[home_0:execute] -> L3: S04[android_0:execute] | edges: S01→S04; S02→S04; S03→S04; S05→S04; S01→S05; S02→S05; S03→S05
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_696/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Match the recipe code in the existing `Dinner scene request` Task with the Broccoli recipe and `/tmp/home_ops/service-notes/source/index.csv`. Schedule the mapped SmartHome cooking scene, then complete that original Task—do not create a duplicate—and update its note with the matched recipe, the scheduled scene time, and that the scene has been scheduled.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 3 | `android_0` | `environment_execution` | S01, S02, S03, S05 | E01(local_stage) | Complete the evaluated local outcomes on android_0: update and complete the required task. |
| `S05` | 2 | `home_0` | `environment_execution` | S01, S02, S03 | E02(local_stage) | Complete the evaluated local outcomes on home_0: apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/home_ops/service-notes/source/index.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (recipe identity, code, mapped scene, and relevant preparation facts; task identity, notes, due state, and fields required downstream). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded task`, task_provided_app_state=`preloaded recipe`
  - Expected handoff: information — recipe identity, code, mapped scene, and relevant preparation facts; task identity, notes, due state, and fields required downstream
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_696/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: update and complete the required task. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — update and complete the required task
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S05:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 20. `linux_android_smarthome_474`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_474.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[android_1:acquire], S04[home_0:acquire] -> L2: S05[home_0:execute] | edges: S01→S05; S02→S05; S03→S05; S04→S05
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_474/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Use the current playlist on the first phone, the room and start time in the second phone's Calendar, and `/tmp/home_ops/approval-forms/source/music_scene.csv` to select the matching SmartHome preparation rule and schedule one preparation workflow at the rule's lead time before the session.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S04` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S05` | 2 | `home_0` | `environment_execution` | S01, S02, S03, S04 | E01(local_stage) | Complete the evaluated local outcomes on home_0: create, cancel, or preserve the required SmartHome workflow. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/home_ops/approval-forms/source/music_scene.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (playlist identity and exact ordered or unordered track membership required downstream; audio identity, requested format/location, or task-relevant content). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded audio file`, task_provided_app_state=`preloaded playlist`
  - Expected handoff: information — playlist identity and exact ordered or unordered track membership required downstream; audio identity, requested format/location, or task-relevant content
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; matching event identity, time, location, and description). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`
  - Expected handoff: information — matching calendar event identity, time, location, and description; matching event identity, time, location, and description
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_474/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create, cancel, or preserve the required SmartHome workflow. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create, cancel, or preserve the required SmartHome workflow
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 21. `linux_android_smarthome_077`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_077.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[home_0:acquire] -> L2: S05[home_0:execute] -> L3: S04[android_0:execute] | edges: S01→S04; S02→S04; S03→S04; S05→S04; S01→S05; S02→S05; S03→S05
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_077/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 3}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Use the approved `Climate Update` note on Android and `/tmp/schedules/merge.pdf` to replace the existing living-room AC schedule. Cancel the identified old schedule and create the approved active correction. In Markor, create `Climate correction result.md` and record the old 25 C setting, the new 24 C setting, the 20:00 scheduled time, and that the old schedule was cancelled while the replacement is active or applied.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 3 | `android_0` | `environment_execution` | S01, S02, S03, S05 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create or update the required Markor note. |
| `S05` | 2 | `home_0` | `environment_execution` | S01, S02, S03 | E02(local_stage), E03(local_stage) | Complete the evaluated local outcomes on home_0: create, cancel, or preserve the required SmartHome schedule; apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task-relevant policy, request, or template facts from the document). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/schedules/merge.pdf`
  - Expected handoff: information — task-relevant policy, request, or template facts from the document
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant date, time, duration, or lead time; which candidate records or controls are active). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Documents/Markor/Climate Update.md`
  - Expected handoff: information — relevant date, time, duration, or lead time; which candidate records or controls are active
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_077/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or update the required Markor note. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or update the required Markor note
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S05:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create, cancel, or preserve the required SmartHome schedule; apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create, cancel, or preserve the required SmartHome schedule; apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 22. `android_only_285`

- Task: `tasks/cross_device/android_only/android_only_285.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire] -> L2: S03[android_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/android_only_assets/android_only_285/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 5}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Open `music_export_manifest.csv` in Downloads on the first phone. On the second phone, use Files to copy each listed MP3 that is present in Music into `Music/Export`. Do not copy files that are not listed in the manifest, and do not create files that are missing. Then create a Markor note called `Music export report` on the second phone listing each manifest filename and whether it was copied or missing.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 2 | `android_1` | `environment_execution` | S01, S02 | E01(local_guard), E02(local_stage), E03(local_stage), E04(local_stage), E05(local_stage), E06(local_stage) | Complete the evaluated local outcomes on android_1: copy or preserve the required Android files; produce the required Android file set; produce or preserve the required… |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (exact requested item membership, filenames, and no-substitution constraints; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/sdcard/Download/music_export_manifest.csv`
  - Expected handoff: information — exact requested item membership, filenames, and no-substitution constraints; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (audio identity, requested format/location, or task-relevant content). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded audio file`
  - Expected handoff: information — audio identity, requested format/location, or task-relevant content
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: copy or preserve the required Android files; produce the required Android file set; produce or preserve the required Android file state; create or update the required Markor note. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — copy or preserve the required Android files; produce the required Android file set; produce or preserve the required Android file state; create or update the required Markor note
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 23. `linux_android_smarthome_423`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_423.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[android_1:acquire], S04[home_0:acquire] -> L2: S06[home_0:execute] -> L3: S05[android_1:execute] | edges: S01→S05; S02→S05; S03→S05; S04→S05; S06→S05; S01→S06; S02→S06; S03→S06; S04→S06
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_423/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The `Kitchen Filter Service` alarm on the first phone is the maintenance cutoff for the kitchen air purifier. Confirm the room mapping in `/tmp/home_ops/schedule-changes/source/clock_rule.csv` and open `filter_service_note.txt` in Downloads on the second phone, then schedule the purifier to turn off when the alarm next occurs. Update and complete the existing `Kitchen Filter Service follow-up` task on the second phone. In its note, record the 09:15 scheduled time, the kitchen air-purifier shutdown, and that the shutdown has been scheduled. Do not create a duplicate.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S04` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S05` | 3 | `android_1` | `environment_execution` | S01, S02, S03, S04, S06 | E01(local_stage) | Complete the evaluated local outcomes on android_1: update and complete the required task. |
| `S06` | 2 | `home_0` | `environment_execution` | S01, S02, S03, S04 | E02(local_stage) | Complete the evaluated local outcomes on home_0: apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (applicable rule, thresholds, mapping, and decision consequence; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/home_ops/schedule-changes/source/clock_rule.csv`
  - Expected handoff: information — applicable rule, thresholds, mapping, and decision consequence; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (alarm identity, enabled state, and next scheduled time). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded alarm`
  - Expected handoff: information — alarm identity, enabled state, and next scheduled time
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task identity, notes, due state, and fields required downstream). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Download/filter_service_note.txt`, task_provided_app_state=`preloaded task`
  - Expected handoff: information — task identity, notes, due state, and fields required downstream
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_423/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: update and complete the required task. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — update and complete the required task
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff, S06:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S06` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 24. `linux_only_275`

- Task: `tasks/cross_device/linux_only/linux_only_275.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire] -> L2: S03[linux_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_only_assets/linux_only_275/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 3, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Before the offline review portal is handed over, compare `/tmp/portal/required_pages.json` on the first Linux machine with `/tmp/portal/bookmark_export.html` and the local page files on the second. Write one disposition for every required page to `/tmp/portal/missing_pages.csv`; leave the bookmark export unchanged.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | E03(local_guard) | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 2 | `linux_1` | `environment_execution` | S01, S02 | E01(local_stage), E02(local_guard), E04(local_guard) | Complete the evaluated local outcomes on linux_1: create and verify the required Linux artifact. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant structured records, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/portal/required_pages.json`
  - Expected handoff: information — relevant structured records, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (required filename, file membership, or file content facts). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/portal/bookmark_export.html`, task_provided_file=`/tmp/portal/local_pages/a.html`, task_provided_file=`/tmp/portal/local_pages/b.html`
  - Expected handoff: information — required filename, file membership, or file content facts
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create and verify the required Linux artifact. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create and verify the required Linux artifact
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 25. `linux_android_smarthome_287`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_287.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[home_0:acquire] -> L2: S04[android_0:execute] | edges: S01→S04; S02→S04; S03→S04
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_287/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> An incoming Simple SMS Messenger message asks you to cancel tonight's away routine. Check the sender's role in Contacts and the authorization policy in `/tmp/access/cancel_policy.txt` before making any SmartHome change. If the sender is not authorized, leave the away routine active and reply in the existing message thread explaining why it was not changed.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | E02(local_guard) | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 2 | `android_0` | `environment_execution` | S01, S02, S03 | E01(local_stage) | Complete the evaluated local outcomes on android_0: send or withhold the required message. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (applicable policy rule, thresholds, authorization, and decision consequence). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/access/cancel_policy.txt`
  - Expected handoff: information — applicable policy rule, thresholds, authorization, and decision consequence
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address; message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`received message`, task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address; message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_287/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: send or withhold the required message. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — send or withhold the required message
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 26. `a2l2_training_media_deck_email`

- Task: `tasks/cross_device/real300/a2l2_training_media_deck_email.json`
- Graph: L1: S01[android_1:acquire], S02[linux_0:acquire], S03[linux_1:acquire], S04[android_0:execute] -> L2: S05[linux_1:execute] | edges: S01→S05; S02→S05; S03→S05
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 4}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Prepare the trainer's setup-photo handoff. On the first phone, take a new photo with Camera, then use Simple Gallery Pro to rename that new photo to `training_setup_photo.jpg`. The trainer contact on the second phone supplies the recipient address. Read the purpose and package reference from `/tmp/train/handoff.txt` on the first Linux machine. On the second Linux machine, complete its local `/tmp/train/template.odp` with the photo filename, trainer email, purpose, and reference; save it as `/tmp/train/deck.odp` and export `/tmp/train/training_deck.pdf`. Leave an unsent Thunderbird draft to the trainer with that PDF attached, mentioning both `training_deck.pdf` and the package reference.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S03` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S04` | 1 | `android_0` | `environment_execution` | — | E01(local_stage) | Complete the evaluated local outcomes on android_0: create or rename the required Android image. |
| `S05` | 2 | `linux_1` | `environment_execution` | S01, S02, S03 | E02(local_stage), E03(local_stage), E04(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/tmp/train/deck.odp`; create and verify the required Linux artifact; create the requ… |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact and communication destination; matching phone value; matching email recipient; required filename, file membership, or file content facts; photo identity or visible condition). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/train/handoff.txt`
  - Expected handoff: information — matching contact and communication destination; matching phone value; matching email recipient; required filename, file membership, or file content facts; photo identity or visible condition
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (required output fields, labels, layout, and formatting constraints). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/train/template.odp`
  - Expected handoff: information — required output fields, labels, layout, and formatting constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or rename the required Android image. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or rename the required Android image
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/train/deck.odp`; create and verify the required Linux artifact; create the required unsent Thunderbird draft. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/train/deck.odp`; create and verify the required Linux artifact; create the required unsent Thunderbird draft
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 27. `linux_only_283`

- Task: `tasks/cross_device/linux_only/linux_only_283.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire] -> L2: S03[linux_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_only_assets/linux_only_283/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The parser maintainer needs a triage-ready summary before the next test rerun. Use `/tmp/code/test_output.txt` on the first Linux machine and `/tmp/code/maintainer.csv` on the second to create an unsent plain-text RFC 5322 email draft at `/tmp/code/test_failure_summary.eml` on the second machine. Address only the responsible maintainer, with no Cc or Bcc recipients, use a clear failure-summary subject, and summarize only the failed tests, including the module and test name; do not send it.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 2 | `linux_1` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create and verify the required Linux artifact. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching email recipient). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/code/test_output.txt`
  - Expected handoff: information — matching email recipient
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/code/maintainer.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create and verify the required Linux artifact. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create and verify the required Linux artifact
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 28. `linux_android_smarthome_271`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_271.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[home_0:acquire] -> L2: S05[home_0:execute] -> L3: S04[android_0:execute] | edges: S01→S04; S02→S04; S03→S04; S05→S04; S01→S05; S02→S05; S03→S05
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_271/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 3}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The Owner has sent an evening-mode update that may replace the Calendar fallback. Use the Owner contact and SMS with `/tmp/conflicts/priority.xlsx` to determine which request has priority. Retire the outdated evening workflow and schedule the authorized replacement. In Markor, create `Evening priority decision.md` and record which source took priority, that the old plan was retired, and the replacement time and light-and-curtain settings.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 3 | `android_0` | `environment_execution` | S01, S02, S03, S05 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create or update the required Markor note. |
| `S05` | 2 | `home_0` | `environment_execution` | S01, S02, S03 | E02(local_stage), E03(local_stage) | Complete the evaluated local outcomes on home_0: create, cancel, or preserve the required SmartHome workflow; apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/conflicts/priority.xlsx`
  - Expected handoff: information — relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address; matching calendar event identity, time, location, and description; matching event identity, time, location, and description; message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`, task_provided_app_state=`received message`, task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address; matching calendar event identity, time, location, and description; matching event identity, time, location, and description; message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_271/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or update the required Markor note. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or update the required Markor note
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S05:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create, cancel, or preserve the required SmartHome workflow; apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create, cancel, or preserve the required SmartHome workflow; apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 29. `linux_android_smarthome_338`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_338.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[android_1:acquire], S04[home_0:acquire] -> L2: S05[android_0:execute], S07[home_0:execute] -> L3: S06[android_1:execute] | edges: S01→S05; S02→S05; S01→S06; S03→S06; S04→S06; S07→S06; S01→S07; S04→S07
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_338/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 3}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Prepare the bedroom for tonight's guest using `/tmp/home_ops/status-reports/source/coordination_note.txt`, the existing `Evening Prep Snack` recipe in Broccoli on the first phone, and the incomplete `Bedroom lighting` item in Tasks on the second phone. Rename the saved recipe to `Evening Guest Snack` and add the guest's requested tea accompaniment without changing its directions or preparation time. Set the bedroom light to the requested level, then complete the existing `Bedroom lighting` task with a brief note stating that the bedroom light was set to 55%. Do not create duplicate recipes or tasks.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S04` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S05` | 2 | `android_0` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create or update the required recipe state. |
| `S06` | 3 | `android_1` | `environment_execution` | S01, S03, S04, S07 | E02(local_stage) | Complete the evaluated local outcomes on android_1: update and complete the required task. |
| `S07` | 2 | `home_0` | `environment_execution` | S01, S04 | E03(local_stage) | Complete the evaluated local outcomes on home_0: apply the required SmartHome device state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant date, time, duration, or lead time; matching phone value; record status or decision). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/home_ops/status-reports/source/coordination_note.txt`
  - Expected handoff: information — relevant date, time, duration, or lead time; matching phone value; record status or decision
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (recipe identity, code, mapped scene, and relevant preparation facts). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded recipe`
  - Expected handoff: information — recipe identity, code, mapped scene, and relevant preparation facts
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task identity, notes, due state, and fields required downstream). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded task`
  - Expected handoff: information — task identity, notes, due state, and fields required downstream
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_338/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or update the required recipe state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or update the required recipe state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S06` frozen instruction blueprint: Using the available context, complete the requested work on the current device: update and complete the required task. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — update and complete the required task
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff, S07:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S07` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply the required SmartHome device state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply the required SmartHome device state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 30. `linux_android_smarthome_288`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_288.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[home_0:acquire] -> L2: S05[home_0:execute] -> L3: S04[android_0:execute] | edges: S01→S04; S02→S04; S03→S04; S05→S04; S01→S05; S02→S05; S03→S05
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_288/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 3}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The Owner has sent an updated guest-room routine that may supersede the Calendar fallback. Confirm the authority and timing with the Owner contact, the Owner SMS, and `/tmp/conflicts/rules_288.xlsx`. Retire the old guest-room workflow and schedule the authorized replacement. In Markor, create `Guest room decision 288.md` and record which request took priority, that the old plan was retired, and the replacement time and light-and-curtain settings.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 3 | `android_0` | `environment_execution` | S01, S02, S03, S05 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create or update the required Markor note. |
| `S05` | 2 | `home_0` | `environment_execution` | S01, S02, S03 | E02(local_stage), E03(local_stage) | Complete the evaluated local outcomes on home_0: create, cancel, or preserve the required SmartHome workflow; apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (applicable rule, thresholds, mapping, and decision consequence; relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/conflicts/rules_288.xlsx`
  - Expected handoff: information — applicable rule, thresholds, mapping, and decision consequence; relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address; matching calendar event identity, time, location, and description; matching event identity, time, location, and description; message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`, task_provided_app_state=`received message`, task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address; matching calendar event identity, time, location, and description; matching event identity, time, location, and description; message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_288/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or update the required Markor note. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or update the required Markor note
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S05:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create, cancel, or preserve the required SmartHome workflow; apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create, cancel, or preserve the required SmartHome workflow; apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 31. `linux_android_smarthome_439`

- Task: `tasks/cross_device/linux_android_smarthome/linux_android_smarthome_439.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[android_1:acquire], S04[home_0:acquire] -> L2: S06[home_0:execute] -> L3: S05[android_1:execute] | edges: S01→S05; S02→S05; S03→S05; S04→S05; S06→S05; S01→S06; S02→S06; S03→S06; S04→S06
- Oracle basis: `tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_439/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The guest bedroom gets too dry overnight. Use the `Guest Wake` alarm on the first phone as the humidity-recovery time, confirm the bedroom mapping in `/tmp/home_ops/plan-revisions/source/clock_rule.csv`, and open `guest_wake_humidity.txt` in Downloads on the second phone. Schedule a Home workflow that starts the bedroom humidifier at medium when the alarm next occurs. Update and complete the existing `Guest Wake follow-up` task. In its note, record the 09:35 scheduled time, the bedroom humidifier medium setting, and that the recovery workflow has been scheduled. Do not create a duplicate.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S04` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S05` | 3 | `android_1` | `environment_execution` | S01, S02, S03, S04, S06 | E01(local_stage) | Complete the evaluated local outcomes on android_1: update and complete the required task. |
| `S06` | 2 | `home_0` | `environment_execution` | S01, S02, S03, S04 | E02(local_stage) | Complete the evaluated local outcomes on home_0: create, cancel, or preserve the required SmartHome workflow. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (applicable rule, thresholds, mapping, and decision consequence; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/home_ops/plan-revisions/source/clock_rule.csv`
  - Expected handoff: information — applicable rule, thresholds, mapping, and decision consequence; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (alarm identity, enabled state, and next scheduled time). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded alarm`
  - Expected handoff: information — alarm identity, enabled state, and next scheduled time
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task identity, notes, due state, and fields required downstream). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Download/guest_wake_humidity.txt`, task_provided_app_state=`preloaded task`
  - Expected handoff: information — task identity, notes, due state, and fields required downstream
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_439/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: update and complete the required task. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — update and complete the required task
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff, S06:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S06` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create, cancel, or preserve the required SmartHome workflow. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create, cancel, or preserve the required SmartHome workflow
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 32. `linux_only_224`

- Task: `tasks/cross_device/linux_only/linux_only_224.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire] -> L2: S03[linux_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_only_assets/linux_only_224/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 2, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Create `/tmp/routes/dispatch.xlsx` on the second Linux machine by joining `/tmp/routes/route_table.csv` on the first Linux machine with `/tmp/routes/address_book.csv` on the second Linux machine. Include stop order, address, contact, and status. Use `ready` for an active contact, `blocked_contact` for an inactive contact, and `missing_address` when the route's site is absent from the address book.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | E02(local_guard) | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 2 | `linux_1` | `environment_execution` | S01, S02 | E01(local_stage), E03(local_guard) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/tmp/routes/dispatch.xlsx`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/routes/route_table.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/routes/address_book.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/routes/dispatch.xlsx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/routes/dispatch.xlsx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 33. `android_only_260`

- Task: `tasks/cross_device/android_only/android_only_260.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire] -> L2: S03[android_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/android_only_assets/android_only_260/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Open `road_survey_playlist.csv` in Downloads on the first phone. On the second phone, create a `Road Survey` playlist in Retro Music containing only the songs listed in the file.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 2 | `android_1` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on android_1: create or preserve the required music playlist. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (playlist identity and exact ordered or unordered track membership required downstream; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/sdcard/Download/road_survey_playlist.csv`
  - Expected handoff: information — playlist identity and exact ordered or unordered track membership required downstream; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (audio identity, requested format/location, or task-relevant content). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded audio file`
  - Expected handoff: information — audio identity, requested format/location, or task-relevant content
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or preserve the required music playlist. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or preserve the required music playlist
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 34. `linux_android_997`

- Task: `tasks/cross_device/linux_android/linux_android_997.json`
- Graph: L1: S01[android_0:acquire], S02[linux_0:acquire] -> L2: S03[android_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_997/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen`
- Evaluator ownership: `{"local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The calendar time for 997-A may not match the latest approved time. Compare the Simple Calendar Pro event with the latest approval SMS on the first phone using `/tmp/alarms/handoff_policy.md` on the Linux machine. If the difference is outside the allowed tolerance, add the enabled `997-A time check` fallback alarm at 08:45 in Clock on the second phone. Create a Markor note called `997-A time check` on the second phone with the case and approval details, both source times, their difference, and the fallback time.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S03` | 2 | `android_1` | `environment_execution` | S01, S02 | E01(local_stage), E02(local_stage) | Complete the evaluated local outcomes on android_1: create or update the required alarm; create or update the required Markor note. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; matching event identity, time, location, and description; message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`, task_provided_app_state=`received message`
  - Expected handoff: information — matching calendar event identity, time, location, and description; matching event identity, time, location, and description; message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (alarm identity, enabled state, and next scheduled time; applicable policy rule, thresholds, authorization, and decision consequence; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/alarms/alarm_policy.csv`, task_provided_file=`/tmp/alarms/handoff_policy.md`
  - Expected handoff: information — alarm identity, enabled state, and next scheduled time; applicable policy rule, thresholds, authorization, and decision consequence; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or update the required alarm; create or update the required Markor note. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or update the required alarm; create or update the required Markor note
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 35. `android_only_218`

- Task: `tasks/cross_device/android_only/android_only_218.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire] -> L2: S03[android_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/android_only_assets/android_only_218/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The `Site briefing` event on the second phone is out of date. Use its request code to find the matching current `Site briefing` event in Calendar on the first phone, then update the second phone's event to match it.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | E02(local_guard) | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 2 | `android_1` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on android_1: update the required calendar event set. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; matching event identity, time, location, and description). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`
  - Expected handoff: information — matching calendar event identity, time, location, and description; matching event identity, time, location, and description
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; matching event identity, time, location, and description). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`
  - Expected handoff: information — matching calendar event identity, time, location, and description; matching event identity, time, location, and description
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: update the required calendar event set. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — update the required calendar event set
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 36. `linux_android_1798`

- Task: `tasks/cross_device/linux_android/linux_android_1798.json`
- Graph: L1: S01[android_0:acquire], S02[linux_0:acquire], S03[linux_1:acquire] -> L2: S04[linux_1:execute] | edges: S01→S04; S02→S04; S03→S04
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1798/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Can you compare the Android Retro Music playlist `Route review set` against `/tmp/music/track_manifest.csv` on the first Linux desktop, then use `/tmp/music/playlist_audit_template.csv` on the second Linux desktop to write the complete audit to `/tmp/music/playlist_audit.csv`? In the `category` column, classify each row as `present`, `missing`, or `extra` according to the comparison.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S03` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S04` | 2 | `linux_1` | `environment_execution` | S01, S02, S03 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/tmp/music/playlist_audit.csv`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (playlist identity and exact ordered or unordered track membership required downstream; audio identity, requested format/location, or task-relevant content). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded audio file`, task_provided_app_state=`preloaded playlist`
  - Expected handoff: information — playlist identity and exact ordered or unordered track membership required downstream; audio identity, requested format/location, or task-relevant content
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (exact requested item membership, filenames, and no-substitution constraints; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/music/track_manifest.csv`
  - Expected handoff: information — exact requested item membership, filenames, and no-substitution constraints; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (playlist identity and exact ordered or unordered track membership required downstream; required output fields, labels, layout, and formatting constraints; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/music/playlist_audit_template.csv`
  - Expected handoff: information — playlist identity and exact ordered or unordered track membership required downstream; required output fields, labels, layout, and formatting constraints; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/music/playlist_audit.csv`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/music/playlist_audit.csv`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 37. `linux_android_1859`

- Task: `tasks/cross_device/linux_android/linux_android_1859.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire], S03[linux_0:acquire], S04[linux_1:acquire] -> L2: S05[linux_1:execute] | edges: S01→S05; S02→S05; S03→S05; S04→S05
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1859/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, visual_source_gold_contract_reviewed, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Create `/tmp/inspection/packet.odt` on the second Linux desktop using the local `/tmp/inspection/packet_template.odt`, the current row in `/tmp/sites/site_registry.csv` on the first Linux desktop, the sole favorite in OsmAnd and matching field photo in Simple Gallery Pro on the first phone, and `inspection_context.txt` in Downloads on the second phone. Complete every labeled template field, include the favorite coordinates and inspection window, describe the visible field condition from the photo in the observation field, and mark the current inspection ready while preserving the template's field layout.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S04` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S05` | 2 | `linux_1` | `environment_execution` | S01, S02, S03, S04 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/tmp/inspection/packet.odt`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (photo identity and only the visible condition needed downstream; media identity, filenames, album membership, and only required visible facts; site/room mapping, route facts, and applicable decision rule; favorite identity, label, and coordinates). Do not modify the source state.
  - Source/context: task_provided_file=`/sdcard/Pictures/FieldAlbum/rt-59_photo_a.jpg`, task_provided_app_state=`preloaded gallery media`, task_provided_app_state=`preloaded map favorite state`, task_provided_file=`/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`
  - Expected handoff: information — photo identity and only the visible condition needed downstream; media identity, filenames, album membership, and only required visible facts; site/room mapping, route facts, and applicable decision rule; favorite identity, label, and coordinates
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching phone value; which candidate record or state is current; coordinates or route data; photo identity or visible condition). Do not modify the source state.
  - Source/context: task_provided_file=`/sdcard/Download/inspection_context.txt`
  - Expected handoff: information — matching phone value; which candidate record or state is current; coordinates or route data; photo identity or visible condition
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/sites/site_registry.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (required output fields, labels, layout, and formatting constraints; task-relevant document fields and any required layout/template constraints). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/inspection/packet_template.odt`
  - Expected handoff: information — required output fields, labels, layout, and formatting constraints; task-relevant document fields and any required layout/template constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/inspection/packet.odt`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/inspection/packet.odt`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 38. `linux_only_327`

- Task: `tasks/cross_device/linux_only/linux_only_327.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire] -> L2: S04[linux_1:execute] -> L3: S03[linux_0:execute] | edges: S01→S03; S04→S03; S01→S04; S02→S04
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Assemble `/home/user/releases/release_candidate.zip` on the second Linux machine from the approved rows in `/home/user/manifests/release_manifest.xlsx` on the first and the original files in `/home/user/incoming/reports_bundle.zip` on the second. Then add only a `packaged` column to the workbook, marking every row yes or no according to actual archive membership.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 3 | `linux_0` | `environment_execution` | S01, S04 | E02(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file at `/home/user/manifests/release_manifest.xlsx`. |
| `S04` | 2 | `linux_1` | `environment_execution` | S01, S02 | E01(local_stage), E03(local_guard) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/home/user/releases/release_candidate.zip`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (exact requested item membership, filenames, and no-substitution constraints; relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/home/user/manifests/release_manifest.xlsx`
  - Expected handoff: information — exact requested item membership, filenames, and no-substitution constraints; relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (required filename, file membership, or file content facts). Do not modify the source state.
  - Source/context: task_provided_file=`/home/user/incoming/reports_bundle.zip`
  - Expected handoff: information — required filename, file membership, or file content facts
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/home/user/manifests/release_manifest.xlsx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/home/user/manifests/release_manifest.xlsx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S04:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/home/user/releases/release_candidate.zip`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/home/user/releases/release_candidate.zip`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 39. `linux_android_1866`

- Task: `tasks/cross_device/linux_android/linux_android_1866.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire], S03[linux_0:acquire], S04[linux_1:acquire] -> L2: S05[linux_1:execute] | edges: S01→S05; S02→S05; S03→S05; S04→S05
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1866/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Create `/tmp/attendees/packet.odt` on the second Linux desktop using the Simple Calendar Pro event, the matching Android contact, `/tmp/attendees/attendee_matrix.csv` on the first Linux desktop, and the local `/tmp/agenda/agenda_template.odt` on the second Linux desktop. Complete every visible template field, including the attendee role, and preserve the labeled layout and fixed template sections.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S04` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S05` | 2 | `linux_1` | `environment_execution` | S01, S02, S03, S04 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/tmp/attendees/packet.odt`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; matching event identity, time, location, and description). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`
  - Expected handoff: information — matching calendar event identity, time, location, and description; matching event identity, time, location, and description
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (attendee identity, active/archive status, role, and contact destination; listed entities, mapping/fallback rules, and visible output schema; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/attendees/attendee_matrix.csv`
  - Expected handoff: information — attendee identity, active/archive status, role, and contact destination; listed entities, mapping/fallback rules, and visible output schema; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (required output fields, labels, layout, and formatting constraints; task-relevant document fields and any required layout/template constraints). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/agenda/agenda_template.odt`
  - Expected handoff: information — required output fields, labels, layout, and formatting constraints; task-relevant document fields and any required layout/template constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/attendees/packet.odt`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/attendees/packet.odt`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 40. `android_only_210`

- Task: `tasks/cross_device/android_only/android_only_210.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire] -> L2: S03[android_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/android_only_assets/android_only_210/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> On the first phone, open the `Client delivery` task in Tasks. Use its details to update the `Client delivery` event in Calendar on the second phone so the time, location, and description match.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | E02(local_guard) | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 2 | `android_1` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on android_1: update the required calendar event set. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task identity, notes, due state, and fields required downstream). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded task`
  - Expected handoff: information — task identity, notes, due state, and fields required downstream
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; matching event identity, time, location, and description). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`
  - Expected handoff: information — matching calendar event identity, time, location, and description; matching event identity, time, location, and description
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: update the required calendar event set. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — update the required calendar event set
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 41. `linux_android_1863`

- Task: `tasks/cross_device/linux_android/linux_android_1863.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire], S03[linux_0:acquire], S04[linux_1:acquire] -> L2: S05[linux_1:execute] | edges: S01→S05; S02→S05; S03→S05; S04→S05
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1863/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> We need a release-readiness packet for the current case. Reconcile the release note in Markor, the latest approval SMS, and `/tmp/release/readiness.csv` on the first Linux desktop. On the second Linux desktop, use the local `/tmp/release/release_packet.pdf` as the visible packet template and create `/tmp/release/packet.pdf`, keeping the current case, approval, owner, route, site, scheduled time, readiness decision, and their sources together.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S04` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S05` | 2 | `linux_1` | `environment_execution` | S01, S02, S03, S04 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create and verify the required Linux artifact. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (case or request identifier; approval code or approval status; responsible owner; relevant date, time, duration, or lead time; which candidate record or state is current; route or handoff decision). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Documents/Markor/release_note.md`
  - Expected handoff: information — case or request identifier; approval code or approval status; responsible owner; relevant date, time, duration, or lead time; which candidate record or state is current; route or handoff decision
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`received message`
  - Expected handoff: information — message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/release/readiness.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task-relevant policy, request, or template facts from the document). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/release/release_packet.pdf`
  - Expected handoff: information — task-relevant policy, request, or template facts from the document
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create and verify the required Linux artifact. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create and verify the required Linux artifact
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S04:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[4]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 42. `linux_smarthome_373`

- Task: `tasks/cross_device/linux_smarthome/linux_smarthome_373.json`
- Graph: L1: S01[linux_0:acquire], S02[home_0:acquire] -> L2: S03[linux_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_smarthome_assets/linux_smarthome_373/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 2, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Use `/tmp/climate/rooms.csv` as the checklist, query the live SmartHome capabilities, and fill the preformatted Heat Capable and Cool Capable columns in `/tmp/climate/capability.xlsx`. Do not change Home while completing the capability audit.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | E02(local_guard), E03(local_guard) | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 2 | `linux_0` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file at `/tmp/climate/capability.xlsx`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields; relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/climate/rooms.csv`, task_provided_file=`/tmp/climate/capability.xlsx`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields; relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_smarthome_assets/linux_smarthome_373/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/climate/capability.xlsx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/climate/capability.xlsx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 43. `linux_smarthome_350`

- Task: `tasks/cross_device/linux_smarthome/linux_smarthome_350.json`
- Graph: L1: S01[linux_0:acquire], S02[home_0:acquire] -> L2: S03[linux_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_smarthome_assets/linux_smarthome_350/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 2, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Review `/tmp/maintenance/request.docx` and check whether the maintenance start can actually be scheduled from the available information. Save the decision to `/tmp/maintenance/result.json` using the field names documented in the request. If the maintenance start cannot be established, do not change Home or create a Home plan.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | E01(local_guard), E02(local_guard) | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 2 | `linux_0` | `environment_execution` | S01, S02 | E03(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file at `/tmp/maintenance/result.json`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task-relevant document fields and any required layout/template constraints). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/maintenance/request.docx`
  - Expected handoff: information — task-relevant document fields and any required layout/template constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_smarthome_assets/linux_smarthome_350/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/maintenance/result.json`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/maintenance/result.json`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 44. `al_request_audio`

- Task: `tasks/cross_device/real100/al_request_audio.json`
- Graph: L1: S01[linux_0:acquire] -> L2: S02[android_0:execute] | edges: S01→S02
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> `/tmp/brief/request.txt` on Linux gives the filename, format, and public save location for a voice memo. Please use Android Audio Recorder to record a short audio clip and save or export it as requested. You may use Android Files to place the finished recording in the requested public folder.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 2 | `android_0` | `environment_execution` | S01 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create the requested Android audio file. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (brief identifier, title, time, location, and other declared meeting fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/brief/request.txt`
  - Expected handoff: information — brief identifier, title, time, location, and other declared meeting fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the requested Android audio file. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the requested Android audio file
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 45. `linux_smarthome_361`

- Task: `tasks/cross_device/linux_smarthome/linux_smarthome_361.json`
- Graph: L1: S01[linux_0:acquire], S02[home_0:acquire] -> L2: S03[linux_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_smarthome_assets/linux_smarthome_361/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, visual_source_gold_contract_reviewed, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 2, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Compare the floor-plan rooms in `/tmp/home_reports/floor.png` with the live SmartHome room list, follow `/tmp/home_reports/brief.txt`, and complete `/tmp/home_reports/rooms.xlsx`. For each room, choose the comparison result and add brief evidence as described in the workbook's Completion Guide; record the actual SmartHome room count in the final row. Do not change Home while performing this audit.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | E02(local_guard), E03(local_guard) | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 2 | `linux_0` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file at `/tmp/home_reports/rooms.xlsx`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (brief identifier, title, time, location, and other declared meeting fields; relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/home_reports/floor.png`, task_provided_file=`/tmp/home_reports/brief.txt`, task_provided_file=`/tmp/home_reports/rooms.xlsx`
  - Expected handoff: information — brief identifier, title, time, location, and other declared meeting fields; relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_smarthome_assets/linux_smarthome_361/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/home_reports/rooms.xlsx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/home_reports/rooms.xlsx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 46. `android_smarthome_877`

- Task: `tasks/cross_device/android_smarthome/android_smarthome_877.json`
- Graph: L1: S01[android_0:acquire], S02[home_0:acquire] -> L2: S04[home_0:execute] -> L3: S03[android_0:execute] | edges: S01→S03; S02→S03; S04→S03; S01→S04; S02→S04
- Oracle basis: `tasks/cross_device/android_smarthome_assets/android_smarthome_877/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 3}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Open `climate_targets.csv` in Downloads/home on the phone and compare it with the live Home air-conditioning settings. Repair only the highest-priority drift marked for automatic repair, then create an incomplete Tasks item titled `Climate drift` recording the repaired room and settings and the manual and already-compliant rows that were left unchanged.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 3 | `android_0` | `environment_execution` | S01, S02, S04 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create or update the required task status. |
| `S04` | 2 | `home_0` | `environment_execution` | S01, S02 | E02(local_stage), E03(local_stage) | Complete the evaluated local outcomes on home_0: apply the required SmartHome device state; apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields; task identity, notes, due state, and fields required downstream). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Download/home/climate_targets.csv`, task_provided_app_state=`preloaded task`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields; task identity, notes, due state, and fields required downstream
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/android_smarthome_assets/android_smarthome_877/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or update the required task status. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or update the required task status
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S04:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply the required SmartHome device state; apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply the required SmartHome device state; apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 47. `a2l_contact_otp_web_form`

- Task: `tasks/cross_device/real200/a2l_contact_otp_web_form.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire], S03[linux_0:acquire] -> L2: S04[linux_0:execute] | edges: S01→S04; S02→S04; S03→S04
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The latest Simple SMS Messenger message on the first phone contains a web form OTP, and the Android Contacts app on the second phone has the client details. Please open `/home/user/web/client.html` in Linux Chrome, fill in the client details and OTP, and submit it.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S04` | 2 | `linux_0` | `environment_execution` | S01, S02, S03 | E01(local_stage) | Complete the evaluated local outcomes on linux_0: satisfy the `host_form_submission_state` outcome. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`received message`
  - Expected handoff: information — message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact and communication destination; matching phone value). Do not modify the source state.
  - Source/context: task_provided_file=`/home/user/web/client.html`
  - Expected handoff: information — matching contact and communication destination; matching phone value
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: satisfy the `host_form_submission_state` outcome. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — satisfy the `host_form_submission_state` outcome
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 48. `android_smarthome_336`

- Task: `tasks/cross_device/android_smarthome/android_smarthome_336.json`
- Graph: L1: S01[android_0:acquire], S02[home_0:acquire] -> L2: S03[android_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/android_smarthome_assets/android_smarthome_336/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 3, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Open the `Air audit format` note in Markor and use it to review the live Home air quality. Create a Markor note called `Home air audit` that ranks the three rooms with the highest PM2.5 readings and completes every published field and the final recommendation line. Do not change any purifier or purifier plan.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | E02(local_guard), E03(local_guard), E04(local_guard) | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 2 | `android_0` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on android_0: create or verify the required Android artifact. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (PM2.5 reading and comparison threshold). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Documents/Markor/Air audit format.md`
  - Expected handoff: information — PM2.5 reading and comparison threshold
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/android_smarthome_assets/android_smarthome_336/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or verify the required Android artifact. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or verify the required Android artifact
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 49. `linux_android_1274`

- Task: `tasks/cross_device/linux_android/linux_android_1274.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire] -> L2: S03[android_1:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1274/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen`
- Evaluator ownership: `{"local_stage": 3}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Check `/tmp/outreach/request.csv` on the Linux machine against the exact-name contact on the first phone, comparing both the name and phone number. If the name matches but the numbers differ, do not send a text to either number. On the second phone, create a Markor note called `Outreach status` with the contact name, the phone number from the request, the phone number in Contacts, and why the outreach was not sent.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 2 | `android_1` | `environment_execution` | S01, S02 | E01(local_stage), E02(local_stage), E03(local_stage) | Complete the evaluated local outcomes on android_1: create or update the required Markor note; send or withhold the required message. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/outreach/request.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create or update the required Markor note; send or withhold the required message. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create or update the required Markor note; send or withhold the required message
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 50. `linux_android_1324`

- Task: `tasks/cross_device/linux_android/linux_android_1324.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire], S03[android_1:acquire] -> L2: S04[linux_0:execute], S05[android_1:execute] | edges: S01→S04; S02→S04; S03→S04; S02→S05; S03→S05
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1324/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Create `/tmp/agenda/appointment_agenda.odt` on the Linux machine using the local `/tmp/agenda/template.odt`, the appointment in Simple Calendar Pro on the first phone, and the matching attendee contact on the second phone. Follow the date/time format shown in the template. Send the matching attendee a concise confirmation text with the appointment, time, and location, and record the confirmation channel in the template.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S04` | 2 | `linux_0` | `environment_execution` | S01, S02, S03 | E03(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file at `/tmp/agenda/appointment_agenda.odt`. |
| `S05` | 2 | `android_1` | `environment_execution` | S02, S03 | E01(local_stage), E02(local_guard) | Complete the evaluated local outcomes on android_1: send or withhold the required message. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (required output fields, labels, layout, and formatting constraints; task-relevant document fields and any required layout/template constraints). Do not modify the source state.
  - Source/context: declared_source_file=`/tmp/agenda/template.odt`
  - Expected handoff: information — required output fields, labels, layout, and formatting constraints; task-relevant document fields and any required layout/template constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching calendar event identity, time, location, and description; matching event identity, time, location, and description). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded calendar event`
  - Expected handoff: information — matching calendar event identity, time, location, and description; matching event identity, time, location, and description
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/agenda/appointment_agenda.odt`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/agenda/appointment_agenda.odt`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: send or withhold the required message. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — send or withhold the required message
  - Gold predecessor state: S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 51. `linux_smarthome_063`

- Task: `tasks/cross_device/linux_smarthome/linux_smarthome_063.json`
- Graph: L1: S01[linux_0:acquire], S02[home_0:acquire] -> L2: S03[home_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_smarthome_assets/linux_smarthome_063/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The recovery note is in /tmp/home/pages/kitchen-recovery.html; apply the kitchen air instruction.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 2 | `home_0` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on home_0: apply the required SmartHome device state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task-relevant source facts needed by the downstream outcomes). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/home/pages/kitchen-recovery.html`
  - Expected handoff: information — task-relevant source facts needed by the downstream outcomes
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_smarthome_assets/linux_smarthome_063/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply the required SmartHome device state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply the required SmartHome device state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 52. `linux_smarthome_999`

- Task: `tasks/cross_device/linux_smarthome/linux_smarthome_999.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire], S03[home_0:acquire] -> L2: S05[home_0:execute] -> L3: S04[linux_1:execute] | edges: S01→S04; S02→S04; S03→S04; S05→S04; S01→S05; S02→S05; S03→S05
- Oracle basis: `tasks/cross_device/linux_smarthome_assets/linux_smarthome_999/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 3, "local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Triage the four appliance service requests in `/tmp/lifecycle/board.xlsx` on the second Linux machine using `/tmp/lifecycle/policy.html` on the first. Check the live SmartHome devices, perform only the actions that should happen now, and complete each row's decision and after-state in the workbook.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 3 | `linux_1` | `environment_execution` | S01, S02, S03, S05 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/tmp/lifecycle/board.xlsx`. |
| `S05` | 2 | `home_0` | `environment_execution` | S01, S02, S03 | E02(local_stage), E03(local_guard), E04(local_guard), E05(local_guard) | Complete the evaluated local outcomes on home_0: apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (applicable policy rule, thresholds, authorization, and decision consequence). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/lifecycle/policy.html`
  - Expected handoff: information — applicable policy rule, thresholds, authorization, and decision consequence
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/lifecycle/board.xlsx`
  - Expected handoff: information — relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_smarthome_assets/linux_smarthome_999/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/lifecycle/board.xlsx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/lifecycle/board.xlsx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S05:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 53. `linux_android_1255`

- Task: `tasks/cross_device/linux_android/linux_android_1255.json`
- Graph: L1: S01[linux_0:acquire], S02[android_0:acquire] -> L2: S03[android_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1255/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Use `/tmp/contacts/role_rule.csv` to choose the north-region dispatch contact on the phone, send that row's message text and message code to the matching Contacts entry, and write `Dispatch Contact Log.md` in Markor with the selected contact, role, region, and message code.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S03` | 2 | `android_0` | `environment_execution` | S01, S02 | E01(local_stage), E02(local_guard), E03(local_stage) | Complete the evaluated local outcomes on android_0: send or withhold the required message; create or update the required Markor note. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address; applicable rule, thresholds, mapping, and decision consequence; relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/contacts/role_rule.csv`
  - Expected handoff: information — matching contact identity, role, phone number, or email address; applicable rule, thresholds, mapping, and decision consequence; relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: send or withhold the required message; create or update the required Markor note. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — send or withhold the required message; create or update the required Markor note
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 54. `linux_smarthome_932`

- Task: `tasks/cross_device/linux_smarthome/linux_smarthome_932.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire], S03[home_0:acquire] -> L2: S04[linux_1:execute] | edges: S01→S04; S02→S04; S03→S04
- Oracle basis: `tasks/cross_device/linux_smarthome_assets/linux_smarthome_932/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 2, "local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> `/tmp/ranges/current.docx` on the first Linux machine is the current allowed range, and `/tmp/ranges/register.xlsx` on the second Linux machine records the old configuration. Please read the actual SmartHome properties and complete the reconciliation.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | E02(local_guard), E03(local_guard) | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 2 | `linux_1` | `environment_execution` | S01, S02, S03 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/tmp/ranges/register.xlsx`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task-relevant document fields and any required layout/template constraints). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/ranges/current.docx`
  - Expected handoff: information — task-relevant document fields and any required layout/template constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current values, identifiers, and requested decisions; relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/ranges/register.xlsx`
  - Expected handoff: information — relevant rows, current values, identifiers, and requested decisions; relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_smarthome_assets/linux_smarthome_932/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/ranges/register.xlsx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/ranges/register.xlsx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 55. `al_tutorial_screenshot`

- Task: `tasks/cross_device/real100/al_tutorial_screenshot.json`
- Graph: L1: S01[android_0:acquire] -> L2: S02[linux_0:execute] | edges: S01→S02
- Oracle basis: `none; use source assets plus evaluator contract`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, no_oracle_reference_source_assets_and_evaluator_contract_reviewed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> I'm writing a Linux tutorial and need a reproducible evidence check. In Android Markor, `tutorial_evidence_request.md` has the title `Tutorial evidence request`; use the row where `page=linux-basics` and `status=needed`. On Linux, create an executable `/tmp/tutorial/linux-basics/capture_evidence.sh` that runs that row's command in its specified working directory and saves the command output to `/tmp/tutorial/linux-basics/evidence.txt`.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 2 | `linux_0` | `environment_execution` | S01 | E01(local_stage) | Complete the evaluated local outcomes on linux_0: create and verify the required Linux artifact. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (request and tutorial identity; selected record status; selected working_directory; exact selected command). Do not modify the source state.
  - Source/context: task_provided_file=`${note_path}`
  - Expected handoff: information — request and tutorial identity; selected record status; selected working_directory; exact selected command
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
  - Pre-run contract correction: the original task requires the downstream Linux stage to execute the selected row's command in its selected working_directory; title/status alone cannot initialize that downstream stage; scope: handoff contract and stage instruction only; no DAG, boundary, device, or evaluator change.
- `S02` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create and verify the required Linux artifact. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create and verify the required Linux artifact
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 56. `linux_smarthome_656`

- Task: `tasks/cross_device/linux_smarthome/linux_smarthome_656.json`
- Graph: L1: S01[linux_0:acquire], S02[home_0:acquire] -> L2: S04[home_0:execute] -> L3: S03[linux_0:execute] | edges: S01→S03; S02→S03; S04→S03; S01→S04; S02→S04
- Oracle basis: `tasks/cross_device/linux_smarthome_assets/linux_smarthome_656/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Read `/tmp/climate/fallback_matrix.md`, check the listed rooms and live SmartHome capabilities, and apply the best permitted climate fallback for each room. Save the compact room-by-room handoff to `/tmp/climate/fallback_result.json` using the visible schema in the matrix, including the reason for any unavailable room.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 3 | `linux_0` | `environment_execution` | S01, S02, S04 | E02(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file at `/tmp/climate/fallback_result.json`. |
| `S04` | 2 | `home_0` | `environment_execution` | S01, S02 | E01(local_stage) | Complete the evaluated local outcomes on home_0: apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (listed entities, mapping/fallback rules, and visible output schema). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/climate/fallback_matrix.md`
  - Expected handoff: information — listed entities, mapping/fallback rules, and visible output schema
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_smarthome_assets/linux_smarthome_656/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/climate/fallback_result.json`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/climate/fallback_result.json`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S04:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 57. `linux_smarthome_983`

- Task: `tasks/cross_device/linux_smarthome/linux_smarthome_983.json`
- Graph: L1: S01[linux_0:acquire], S02[linux_1:acquire], S03[home_0:acquire] -> L2: S05[home_0:execute] -> L3: S04[linux_1:execute] | edges: S01→S04; S02→S04; S03→S04; S05→S04; S01→S05; S02→S05; S03→S05
- Oracle basis: `tasks/cross_device/linux_smarthome_assets/linux_smarthome_983/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_guard": 1, "local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Prepare the maintenance-freeze handoff. Use `/tmp/protection/current.docx` on the first Linux machine to decide the four requests in `/tmp/protection/board.xlsx` on the second, record each decision and resulting value in that workbook, and carry out only the requests allowed by the active SmartHome rules.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `linux_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_1 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 3 | `linux_1` | `environment_execution` | S01, S02, S03, S05 | E01(local_stage) | Complete the evaluated local outcomes on linux_1: create the required Linux file at `/tmp/protection/board.xlsx`. |
| `S05` | 2 | `home_0` | `environment_execution` | S01, S02, S03 | E02(local_stage), E03(local_guard) | Complete the evaluated local outcomes on home_0: apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task-relevant document fields and any required layout/template constraints). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/protection/current.docx`
  - Expected handoff: information — task-relevant document fields and any required layout/template constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant workbook rows, current values, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/protection/board.xlsx`
  - Expected handoff: information — relevant workbook rows, current values, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_smarthome_assets/linux_smarthome_983/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/protection/board.xlsx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/protection/board.xlsx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S05:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 58. `linux_smarthome_098`

- Task: `tasks/cross_device/linux_smarthome/linux_smarthome_098.json`
- Graph: L1: S01[linux_0:acquire], S02[home_0:acquire] -> L2: S03[home_0:execute] | edges: S01→S03; S02→S03
- Oracle basis: `tasks/cross_device/linux_smarthome_assets/linux_smarthome_098/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 2}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> The room-prep sheet at `/tmp/home/actions/room_prep.csv` has the living-room settings; please apply them.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S02` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S03` | 2 | `home_0` | `environment_execution` | S01, S02 | E01(local_stage), E02(local_stage) | Complete the evaluated local outcomes on home_0: apply the required SmartHome device state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant rows, current/active selection, identifiers, and required fields). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/home/actions/room_prep.csv`
  - Expected handoff: information — relevant rows, current/active selection, identifiers, and required fields
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/linux_smarthome_assets/linux_smarthome_098/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply the required SmartHome device state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply the required SmartHome device state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 59. `android_smarthome_149`

- Task: `tasks/cross_device/android_smarthome/android_smarthome_149.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire], S03[home_0:acquire] -> L2: S05[home_0:execute] -> L3: S04[android_1:execute] | edges: S01→S04; S02→S04; S03→S04; S05→S04; S01→S05; S02→S05; S03→S05
- Oracle basis: `tasks/cross_device/android_smarthome_assets/android_smarthome_149/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, multi_output_dependencies_reviewed_independent_outputs_share_layer, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 3}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Open the `Air Quality Rule` note in Markor on the first phone and check the live Home air-quality reading it applies to. Follow the rule, then use the `Family Air Updates` contact on the second phone to send a concise update with the room, current PM2.5 reading, the rule's threshold, how the reading compares with that threshold, and the purifier setting that was applied.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 1 | `home_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on home_0 and retain only the facts needed downstream. |
| `S04` | 3 | `android_1` | `environment_execution` | S01, S02, S03, S05 | E01(local_stage) | Complete the evaluated local outcomes on android_1: send or withhold the required message. |
| `S05` | 2 | `home_0` | `environment_execution` | S01, S02, S03 | E02(local_stage), E03(local_stage) | Complete the evaluated local outcomes on home_0: apply the required SmartHome device state; apply or preserve the required SmartHome state. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (applicable rule, thresholds, mapping, and decision consequence). Do not modify the source state.
  - Source/context: task_provided_file=`/storage/emulated/0/Documents/Markor/Air Quality Rule.md`
  - Expected handoff: information — applicable rule, thresholds, mapping, and decision consequence
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (relevant live devices, properties, schedules, workflows, and feasibility constraints). Do not modify the source state.
  - Source/context: live_smarthome_state=`tasks/cross_device/android_smarthome_assets/android_smarthome_149/episode_config.json`
  - Expected handoff: information — relevant live devices, properties, schedules, workflows, and feasibility constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: send or withhold the required message. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — send or withhold the required message
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff, S05:semantic_postcondition
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
- `S05` frozen instruction blueprint: Using the available context, complete the requested work on the current device: apply the required SmartHome device state; apply or preserve the required SmartHome state. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — apply the required SmartHome device state; apply or preserve the required SmartHome state
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.

## 60. `linux_android_1814`

- Task: `tasks/cross_device/linux_android/linux_android_1814.json`
- Graph: L1: S01[android_0:acquire], S02[android_1:acquire], S03[linux_0:acquire] -> L2: S04[linux_0:execute] | edges: S01→S04; S02→S04; S03→S04
- Oracle basis: `tasks/cross_device/linux_android_assets/linux_android_1814/oracle_positive.json`
- Review findings: `gold_handoff_and_predecessor_contracts_frozen, same_device_later_layer_reentry_dependency_confirmed`
- Evaluator ownership: `{"local_stage": 1}`
- Five-part task review: `reviewed_pending_human_confirmation`

Original instruction:

> Complete every visible field in `/tmp/change/change_form.docx` on Linux using the latest approval SMS from the first phone and the matching approver contact from the second phone. Preserve the form's visible layout and use its displayed timestamp format.

| Stage | Layer | Device | Kind | Predecessors | Evaluators | Goal |
| --- | ---: | --- | --- | --- | --- | --- |
| `S01` | 1 | `android_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_0 and retain only the facts needed downstream. |
| `S02` | 1 | `android_1` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on android_1 and retain only the facts needed downstream. |
| `S03` | 1 | `linux_0` | `information_acquisition` | — | ai_semantic_judge | Read the task-provided source evidence on linux_0 and retain only the facts needed downstream. |
| `S04` | 2 | `linux_0` | `environment_execution` | S01, S02, S03 | E01(local_stage) | Complete the evaluated local outcomes on linux_0: create the required Linux file at `/tmp/change/change_form.docx`. |

Frozen stage handoff and initialization contracts:

- `S01` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (message sender, request identifiers, approval details, and requested action). Do not modify the source state.
  - Source/context: task_provided_app_state=`received message`
  - Expected handoff: information — message sender, request identifiers, approval details, and requested action
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[1]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S02` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (matching contact identity, role, phone number, or email address). Do not modify the source state.
  - Source/context: task_provided_app_state=`preloaded contact`
  - Expected handoff: information — matching contact identity, role, phone number, or email address
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[2]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S03` frozen instruction blueprint: Inspect the task-provided sources on the current device. Report the requested information (task-relevant document fields and any required layout/template constraints). Do not modify the source state.
  - Source/context: task_provided_file=`/tmp/change/change_form.docx`
  - Expected handoff: information — task-relevant document fields and any required layout/template constraints
  - Gold predecessor state: none
  - Gold handoff contract status: `frozen_source_grounded_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `ai_semantic_judge (diagnostic60.semantic_handoff_judge.v2)`.
- `S04` frozen instruction blueprint: Using the available context, complete the requested work on the current device: create the required Linux file at `/tmp/change/change_form.docx`. Work only on the current device.
  - Source/context: gold predecessor context only
  - Expected handoff: environment_state — create the required Linux file at `/tmp/change/change_form.docx`
  - Gold predecessor state: S01:inject_frozen_gold_semantic_handoff, S02:inject_frozen_gold_semantic_handoff, S03:inject_frozen_gold_semantic_handoff
  - Gold handoff contract status: `frozen_original_local_stage_contract`.
  - Initialization: original setup groups `[3]` plus declared gold overlays.
  - Evaluation: `original_evaluator_subset`.
