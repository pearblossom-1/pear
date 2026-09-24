# A. Task Construction and Dataset Details

Draft based on inspected local implementation and retained artifacts. Source identifiers refer to the accompanying evidence index. Dataset counts describe the inspected experimental worktree; they should be matched to the released data snapshot before publication.

## A.1 Task Specification and Cross-Device Dependencies

A task specifies a user goal, participating devices, initial resources, environment initialization and cleanup, and observable completion conditions. Cross-device dependencies arise when information or state on one device determines an operation or output on another. Consequently, the device containing the final artifact is not necessarily the only device required to solve the task.

Consider `al_calendar_schedule_conflict`, a task included in DevicesWorld-Lite. The user asks the agent to reconcile a Linux meeting schedule with Android Simple Calendar Pro, preserve unmatched meetings, and record all changed fields with their old and new values. The Android calendar contains the authoritative event, while the Linux device holds the conflicting CSV and a visible reconciliation rule. The initial CSV lists “Vendor planning” at 09:00–10:00 in Room 2; the calendar specifies 15:00–16:00 in Room 8 on the same date. A second CSV entry, “Ops sync,” has no matching calendar event and must remain unchanged. [S1–S2]

The agent must therefore combine the Android event, the Linux rule, and the original Linux values. Completion requires both a corrected schedule and a persistent change log. The task's CSV evaluation checks the exact logical records without requiring row order. A separate rule-based relation check evaluates the meeting's old-to-new time and location changes in the log. These are outcome conditions, rather than a prescribed sequence of interface actions. Expected results are supplied to the evaluator, not included as pre-completed agent-visible outputs. The complete task configuration and source resources accompany this example. [S1–S2]

*Figure A.1 placeholder: user request; Android authoritative event; Linux initial schedule and rule; corrected schedule and three field changes. Highlight the unchanged “Ops sync” row to show the preservation constraint.*

## A.2 Task-Construction Pipeline

The inspected Android/Linux construction engine organizes generation into configuration sampling, task design, executable instantiation, and validation and repair. These are conceptual responsibilities: the implementation uses Stage0–Stage8, with review and repair embedded across stages rather than deferred exclusively to the end. [S3–S5]

**Configuration sampling.** Stage0 cycles through six device configurations: two Android devices, two Linux devices, one Android plus one Linux device, one Android plus two Linux devices, two Android plus one Linux device, and two of each. A seeded pseudorandom generator selects one surface per device from 13 Android or 14 Linux surface types and samples a distractor setup with probability 0.25. This stage defines the allowed environment; it does not generate the task narrative, dependency direction, expected answer, or evaluator. [S4]

**Task design.** Stage1 conditions on the sampled configuration, surface capabilities, and a pattern catalog. It produces the instruction, visible sources, required outputs, expected data, and value traces connecting expected results to available information. The design contract requires meaningful participation from every sampled device and rejects unrelated single-device actions presented as a collaborative task. Stage2 reviews semantic consistency, capability support, and the availability of necessary information. Stage3 conditionally repairs designs that require revision. The review is a separate model call; the current pipeline does not establish an independent reviewer model or human reviewer. [S3–S5]

**Executable instantiation.** Stage4 materializes assets and checks their specified properties. Stage5 produces device-specific setup actions. Stage6 defines output evaluation, cleanup, metadata, and limits. Stage7 produces positive and negative oracle plans, and Stage8 assembles the candidate task configuration and applies static checks. Producing an oracle plan is not executing it; similarly, successful static assembly does not demonstrate that an ordinary agent can complete the task through the available interfaces. [S3, S5]

**Validation and repair.** Stage-local checks are supplemented by post-generation inspection and runtime testing. The retained records distinguish configuration and asset checks, real-runtime setup smoke, oracle-based outcome tests, and ordinary agent execution. For example, the retained R01–R35 report describes representative setup smoke for a selected 700-task collection, not full agent-based validation of all 700 tasks. A documented construction trace, R01/sample_000014, illustrates a review that identified an unexposed presentation-title requirement and triggered repair. We retain both the historical stage record and a later edited configuration, rather than attributing all subsequent repairs to the initial model pipeline. [S6–S9]

The engine is one construction route within a heterogeneous task pool. The unified Android/Linux profile is active, whereas the unified SmartHome profiles remain marked as planned in the inspected implementation. SmartHome-specific builders, legacy seed collections, and later curation also contribute tasks. We therefore do not attribute every task in the pool to the same Stage0–Stage8 execution path. [S3–S5, S9, S12]

*Figure A.2: use the user-supplied task-construction PDF in the figures directory. It is a conceptual overview of configuration sampling, task design, executable instantiation, and validation/repair. Its SmartHome and human-review elements summarize the overall construction paradigm, not a claim that the current unified engine implements every route or that every historical task passed every depicted validation stage. See figures/notes.md for the proposed caption and implementation boundaries.*

## A.3 Dataset Composition and DevicesWorld-Lite Selection

We count task configurations in seven device-oriented directories, excluding assets, execution configurations, scripted solutions, and manifests. The inspected experimental worktree contains 5,897 configurations with distinct task IDs under this definition. A broader count of 6,240 task-shaped JSON files additionally includes legacy source collections and examples; these are not added to the device-oriented inventory. Distinct IDs do not by themselves establish semantic independence between template-derived tasks. [S9, S12]

| Device composition | Task-pool configurations | DevicesWorld-Lite |
| --- | ---: | ---: |
| Android only | 372 | 20 |
| Linux only | 371 | 18 |
| Android + Linux | 1,876 | 67 |
| Android + SmartHome | 1,018 | 25 |
| Linux + SmartHome | 1,010 | 30 |
| Android + Linux + SmartHome | 970 | 30 |
| SmartHome only | 280 | 10 |
| **Total** | **5,897** | **200** |

DevicesWorld-Lite uses a quota-constrained, coverage-oriented selection rather than uniform random sampling from the current pool. The retained selection policy allocates 30 positions across three legacy seed collections and the remaining 170 across Android/Linux, SmartHome, and mixed families. Quality criteria include natural user instructions, complete declared resources, outcome-focused evaluation, and surface/capability diversity within families. Retained per-task reasons and documented substitutions show subsequent curation to reduce repetitive workflows and improve coverage. The legacy collection names real100, real200, and real300 denote mechanically generated seed collections, not evidence of collection from real users; their selected tasks are grouped by actual devices in the table above. [S10]

The Lite device counts are derived from the 200 selected formal execution configurations, whose task-ID set matches the Lite manifest. Of these tasks, 10 use one runtime endpoint, 95 use two, 66 use three, and 29 use four. Android-only and Linux-only tasks each involve two devices. A SmartHome endpoint can represent multiple controllable entities and should not be interpreted as a single physical IoT device. The manifest labels 42 tasks easy, 108 medium, and 50 hard; these are retained selection labels rather than difficulty estimates inferred from model outcomes. [S10–S12]

The available evidence establishes the selected identities, quotas, reasons, and replacements, but does not provide a fully located original selector or a verified formula for its stored quality score. Historical acceptance reports also precede later maintenance status changes. We consequently avoid claims of a reconstructible uniform sampling procedure or fresh release-wide validation based solely on these older reports. The accompanying material records these version boundaries explicitly. [S10]
