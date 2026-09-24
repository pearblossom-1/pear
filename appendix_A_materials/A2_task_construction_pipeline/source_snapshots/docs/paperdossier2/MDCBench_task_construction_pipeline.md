# MDCBench Runtime-Grounded Task Construction Pipeline

> Purpose: paper-facing technical record for the task-construction contribution.
>
> Status: evidence-backed draft based on the current repository implementation and generation records.
>
> Scope note: the unified multi-stage generation engine currently has an active `linux_android` profile. SmartHome-only and mixed SmartHome profiles are still marked `planned`; existing SmartHome task families were primarily produced by family-specific builders/specs and subsequent review workflows.

## 1. Contribution Positioning

MDCBench contributes not only a collection of heterogeneous multi-device tasks, but also a reusable method for constructing executable benchmark episodes at scale.

The central idea is to treat task construction as a constrained compilation process rather than a one-shot language-generation problem:

```text
coverage-controlled seed
    -> grounded task semantics
    -> semantic review and repair
    -> asset specification and materialization
    -> runtime-grounded setup
    -> outcome-oriented evaluation and cleanup
    -> oracle planning
    -> mechanical assembly and static validation
    -> release review and real-runtime smoke
```

The automatic engine is responsible for generating and validating candidate tasks. A separate release workflow performs batch-level audit, deep review, targeted task repair, and risk-based real-runtime smoke before a candidate is treated as a formal benchmark instance.

This distinction is important for the paper:

- The pipeline is automatic at the candidate-construction level.
- Final release remains quality-controlled rather than automatically trusted.
- The full formal task pool was produced through multiple construction routes; it must not be attributed entirely to the unified generation engine.

## 2. Why Multi-Device Task Construction Is Difficult

Generating a natural-language instruction is only one part of benchmark construction. A valid multi-device episode must satisfy several coupled contracts.

### 2.1 User Contract

The instruction must resemble a plausible user request. It must identify enough visible objects and entry points for a human or agent to begin, while avoiding oracle-like procedural details.

A task may be difficult because it requires cross-device search, transformation, conflict resolution, or planning. It must not be difficult merely because essential information was omitted.

### 2.2 Environment Contract

Setup and assets must establish every source state referenced by the instruction. The source must be visible through an ordinary app, document, file, browser page, or device state that the agent can access.

Typical failures include:

- an instruction names a file that setup does not create;
- a media file exists on disk but is not visible to the target Android app;
- an Office/PDF/ZIP file has the expected extension but is not a valid file of that format;
- a target output already exists after setup and therefore pre-satisfies the task.

### 2.3 Execution Contract

The task must be realizable using the actions exposed by the current runtimes. A semantically attractive design is still invalid if it assumes a nonexistent app helper, unsupported state transition, unavailable getter, or unstable GUI-only condition.

### 2.4 Observation Contract

Every fact required to solve the task must be available through the agent-visible instruction or environment. Internal metadata, helper paths, hidden expected files, evaluator implementation details, and benchmark-generation traces are not valid sources of task information.

### 2.5 Evaluation Contract

Evaluation must recognize reasonable successful executions without requiring one exact internal action sequence. It should verify user-visible outcomes while avoiding hidden filenames, hidden document fields, internal IDs, or formatting requirements that were never disclosed.

### 2.6 Isolation Contract

Cleanup must remove setup state and outputs that could affect later episodes. This includes files, Android app records, browser state where relevant, SmartHome schedules/workflows, temporary directories, and other task-specific state.

The pipeline exists to keep these contracts aligned throughout construction.

## 3. Design Principles

### 3.1 Separate Coverage Sampling from Task Semantics

Stage 0 controls device and surface coverage but does not prescribe a domain, instruction, source, evaluator, or oracle. This allows the benchmark designer to control distribution without forcing every sampled combination into a fixed textual template.

### 3.2 Use Runtime Capabilities as Generation Constraints

Task design is conditioned on a capability catalog describing stable sources, stable outputs, setup interfaces, evaluation interfaces, user-visible constraints, and unsupported designs for each selected surface.

### 3.3 Establish the Data Contract Before Implementation

The pipeline defines visible sources, required outputs, expected data, and value traces before generating setup or evaluation. Later stages must consume this contract rather than invent new expected values.

### 3.4 Prefer Structured Intermediate Representations

Each stage emits JSON with a stage-specific schema. This makes it possible to validate, retry, repair, audit, and attribute failures to a specific construction step.

### 3.5 Combine Model Flexibility with Deterministic Execution

The model designs task semantics and structured asset specifications. Deterministic code performs materialization, interface validation, schema validation, and mechanical assembly.

### 3.6 Fail Closed

A stage that fails validation does not silently continue. The pipeline either performs a bounded, stage-local repair or terminates with a recorded `failure_stage`.

### 3.7 Treat Generated Tasks as Candidates

Passing automatic validation means that a task is structurally closed and suitable for review. It does not by itself establish human-level realism, evaluator fairness, or real-runtime stability.

## 4. Formal Input and Output

### 4.1 Coverage Seed

A Stage 0 sample contains a minimal set of generation constraints:

```json
{
  "sample_id": "sample_000001",
  "devices": ["android_0", "linux_0"],
  "device_surfaces": {
    "android_0": ["android.markor_note"],
    "linux_0": ["linux.csv"]
  },
  "setup": "clean",
  "feasibility_type": "feasible"
}
```

The current Linux-Android profile supports the following topology pools:

| Topology | Devices |
| --- | --- |
| `2A` | `android_0`, `android_1` |
| `2L` | `linux_0`, `linux_1` |
| `1A+1L` | `android_0`, `linux_0` |
| `1A+2L` | `android_0`, `linux_0`, `linux_1` |
| `2A+1L` | `android_0`, `android_1`, `linux_0` |
| `2A+2L` | `android_0`, `android_1`, `linux_0`, `linux_1` |

The current sampler cycles across topology pools, samples one supported surface for each device, and assigns a distractor setup with probability 0.25. A fixed random seed makes a sample set reproducible.

### 4.2 Constructed Episode

The assembled candidate contains:

```text
task id
instruction
device declarations
setup
evaluation
cleanup
limits
metadata
materialized assets
asset write plan
oracle/solution plan
stage-level audit records
```

The core task JSON follows `schemas/task.schema.json`. Assets and oracle plans are stored as associated artifacts rather than being exposed in the user instruction.

## 5. Runtime-Grounded Surface Profiles

The profile abstraction isolates topology sampling, surface capability descriptions, prompt files, and sample validation from the reusable Stage 1-8 engine.

### 5.1 Android Surfaces

The active profile currently includes:

```text
android.markor_note
android.files_download
android.calendar_event
android.task
android.sms
android.contacts
android.photo_video
android.audio_recording
android.clock_alarm_timer
android.retro_music_playlist
android.osmand_favorite_marker
android.simple_draw
android.recipe
```

### 5.2 Linux Surfaces

The active profile currently includes:

```text
linux.text_markdown
linux.csv
linux.json
linux.xlsx
linux.odt_docx
linux.odp_pptx
linux.pdf
linux.html_browser
linux.thunderbird_draft
linux.vscode_project
linux.gimp_image
linux.vlc_playback
linux.zip_archive
linux.terminal
```

### 5.3 Capability Catalog

For each surface, the capability catalog records:

- a user-facing display name;
- user-visible constraints;
- stable source forms;
- stable output forms;
- unsupported designs;
- supported setup actions;
- supported getters and evaluator functions;
- implementation notes and generation rules.

The task-design prompt receives only the capability entries relevant to the sampled surfaces. Implementation stages additionally receive exact runtime interface details.

This reduces prompt size and prevents a model from selecting unrelated helpers simply because they appear elsewhere in a global interface list.

## 6. Task Pattern Catalog

Stage 1 may select one or more task patterns. Patterns describe information flow rather than fixed templates.

| Pattern | Meaning |
| --- | --- |
| `direct_transfer` | Move information from one device to another without semantic transformation. |
| `extract_transform` | Filter, compute, normalize, or convert source information before output. |
| `state_create_update` | Create or update app/file state from a source. |
| `sync_consistency` | Make selected fields consistent across devices. |
| `multi_source_merge` | Combine multiple indispensable sources into one result. |
| `dispatch_multi_device` | Use one source to assign distinct outputs to multiple devices. |
| `validate_and_correct` | Produce a result, verify it against another source, and correct it. |
| `conflict_resolve` | Resolve visible conflicts using an agent-visible authority rule. |
| `missing_or_infeasible` | Detect an unsatisfied precondition and report a missing/infeasible outcome. |
| `multi_output_consistency` | Write a derived result to multiple outputs with consistent fields. |
| `control_state_loop` | Adjust one state using another state or feedback signal. |

Patterns support coverage analysis and diversity control, but the pipeline does not assume that a pattern label alone proves task novelty or non-decomposable coordination.

## 7. Multi-Stage Construction Process

The table below follows the current engine numbering in `mdcbench/tasks/generation/engine/pipeline.py`.

| Stage | Model call | Main output | Deterministic gate | Repair behavior |
| --- | ---: | --- | --- | --- |
| 0. Sample | No | Device/surface seed | Profile sample validator | Fail |
| 1. Task design | Yes | Instruction and source-output-value contract | Task-design validator and style warnings | Fail |
| 2. Semantic review | Yes | Accept/revise/reject decision | Review validator | Up to two retries, compression repair/fallback |
| 3. Design repair | Conditional | Repaired task design | Repair validator and instruction lint | Fail if unresolved |
| 4. Assets | Yes | Asset plan and materialized files | Asset schema and quality report | One model-guided repair/materialization retry |
| 5. Setup | Yes | Per-device setup plan | Device/interface/setup validator | Fail |
| 6. Eval/cleanup | Yes | Evaluation, cleanup, metadata, limits | Normalizer plus semantic/interface validator | Fail |
| 7. Oracle | Yes | Positive/negative oracle plan | Oracle-plan validator | Fail |
| 8. Assembly | No | Task draft and static report | Task schema, path, scoring checks | Fail |

### 7.1 Stage 0: Programmatic Coverage Sampling

Stage 0 is deterministic given a sample count and random seed. It selects device topology, one or more agent-facing surfaces, and clean/distractor setup mode.

It intentionally forbids semantic fields such as domain, pattern, source, sink, evaluator, oracle, and difficulty. This prevents coverage metadata from becoming a hidden task template.

### 7.2 Stage 1: Grounded Task Design

Stage 1 expands a sparse seed into a complete semantic design. It outputs:

- a natural user instruction;
- a detailed task description;
- task pattern labels;
- information flow;
- a justification for the cross-device dependency;
- visible sources;
- required outputs;
- expected data;
- value traces;
- generation notes;
- or an explicit `unsupported` result.

The main contract is:

```text
visible source
    -> agent-readable transformation or decision rule
    -> required output
    -> expected value
```

Every required output must have expected data and at least one value trace. Expected values must be derivable from visible sources rather than from metadata or evaluator internals.

Stage 1 is forbidden from emitting setup, asset plans, evaluation, cleanup, metadata, oracle, or final task JSON. This keeps task semantics independent from implementation details.

### 7.3 Stage 2: Independent Semantic Review

Stage 2 reviews the Stage 1 design and returns `accepted`, `revise`, or `rejected`.

The review checks:

- whether the request resembles a plausible human need;
- whether the task genuinely uses the sampled devices;
- whether the instruction exposes natural entry points;
- whether app names, object names, and paths are sufficiently identifiable;
- whether all expected values are grounded in visible evidence;
- whether the task leaks answer values or implementation details;
- whether complex sources are represented as assets rather than oversized inline text;
- whether the desired outcome can be stably evaluated;
- whether the design assumes unsupported runtime behavior;
- whether an infeasible task has an observable reason and an evaluable report outcome.

The engine can retry malformed accepted reviews up to two times. If the review repeats source data excessively in the optimized instruction, it invokes a dedicated compression-repair prompt and then a deterministic locator-based fallback.

Instruction compression is not intended to remove task requirements. It removes data already available through a visible source while retaining locators, output requirements, authority rules, and required schemas.

### 7.4 Stage 3: Targeted Task-Design Repair

Stage 3 runs only when the semantic reviewer requests revision. It receives the original design and the blocking issues, and returns a repaired design using the same Stage 1 contract.

The repair is local to task semantics. It should preserve valid scenario elements while correcting missing information, unsupported behavior, inconsistent source/output mapping, or hidden expected values.

After repair, the engine reruns semantic validation and instruction linting. A design that remains unsupported or inconsistent is rejected rather than passed to later stages.

### 7.5 Stage 4: Asset Planning and Deterministic Materialization

Stage 4 converts visible-source requirements into an asset plan. The model specifies semantic content and file structure; code writes the actual files.

Supported classes include:

| Asset class | Examples |
| --- | --- |
| Text and structured data | TXT, Markdown, receipt, CSV, JSON |
| Web | HTML form, multi-page local web bundle, submit/invalid pages |
| Office and documents | XLSX, ODS, ODT, DOCX, ODP, PDF |
| Archives | ZIP with an explicit member tree |
| Visual media | PNG/JPEG, optionally through an injected image generator |
| Audio/video | WAV and MP4 fixtures |
| Development artifacts | Multi-file code project |
| Domain formats | GPX, EML, M3U, SQLite |

Each asset declares:

```text
asset_id
source_id
asset_kind
materializer
target device/path
semantic content
expected anchor values
quality checks
```

Materialization gates cover, where applicable:

- nonempty content;
- JSON parsing;
- CSV headers, rows, and anchors;
- HTML form structure and result-page consistency;
- OOXML/ODF package validity;
- PDF magic and text anchors;
- image dimensions;
- media decodability/duration;
- archive member names and nested file formats;
- code-project file trees;
- SQLite tables and rows.

The model does not emit arbitrary executable asset-generation code. Formal image assets requiring realistic semantics must use an injected image provider; deterministic fallback is allowed only when explicitly enabled for tests.

If either the asset validator or materialization quality report fails, Stage 4 performs one bounded repair cycle using the original plan and concrete failure report.

### 7.6 Stage 5: Runtime-Grounded Setup Construction

Stage 5 maps visible sources to real device state using only whitelisted setup interfaces.

Examples of Android setup mechanisms include:

- app installation and launch;
- SMS insertion and clearing;
- Contacts insertion and clearing;
- Calendar event creation;
- Tasks, alarms, timers, and recipes;
- Markor/file writes through Android shell;
- media push plus MediaScanner exposure;
- Retro Music playlist setup;
- OsmAnd favorite setup.

Linux setup uses file upload and VM command execution.

Setup validation checks:

- each operation belongs to the target device family;
- operation parameters match the runtime interface;
- every external asset path originates in Stage 4;
- every visible source is established;
- output paths are cleaned before the task;
- helper operations occur after required app initialization;
- setup does not write target output content or otherwise pre-complete the task.

### 7.7 Stage 6: Outcome-Oriented Evaluation, Cleanup, and Metadata

Stage 6 generates evaluation from the Stage 1 source-output-value contract. It must not invent additional expected values.

The evaluation policy distinguishes user goals from protective checks:

- Required outputs and requested state changes are score-enabled goals.
- Source sanity, preservation checks, no-change assertions, and unrelated-object guards may be retained with `enable_score_calc=false`.
- Every required output must have at least one score-enabled evaluator.
- The task must have at least one score-enabled evaluator overall.

The normalizer and validator detect or correct several common failure modes:

- evaluator checks a text field that the visible task never requests;
- evaluator requires a Git commit although the user only requests file changes;
- two evaluators repeat the same getter read instead of combining anchors;
- a source-state check is accidentally scored as a goal;
- a generated output existence check is incorrectly disabled;
- a getter is paired with an incompatible evaluator function;
- Android and Linux evaluator interfaces are mixed;
- an expected schema is malformed;
- one or more required outputs have no scoring coverage.

Evaluation should be outcome-focused. It may verify exact structured fields where the schema is visible, but it should not require an internal action sequence, internal schedule identifier, or undisclosed filename.

Cleanup uses the same device-group structure as setup and removes both initialized sources and possible agent/oracle outputs. Metadata records topology, surfaces, implementation state, native outputs, and human-readable setup/evaluation notes without exposing generator traces to the agent.

### 7.8 Stage 7: Oracle and Smoke Planning

Stage 7 produces:

- `scripted_solution_plan`;
- `positive_oracle_steps`;
- `negative_oracle_steps`;
- `smoke_expectations`.

The intended lifecycle invariant is:

```text
after setup:           success = false
after positive oracle: success = true
after negative/no-op:  success = false
after cleanup:         success = false
```

This checks both evaluator sensitivity and specificity. A correct outcome must pass, while a missing critical output or deliberately incomplete execution must not pass.

The current stage produces an oracle plan. It should not be described as producing a fully executable reference trajectory for every generated task.

### 7.9 Stage 8: Mechanical Assembly and Static Gate

Stage 8 assembles prior intermediate representations into the final candidate task. It does not call the model and does not introduce new semantic facts.

The static gate:

- writes the assembled task to an isolated work directory;
- rewrites materialized asset paths into portable paths where possible;
- validates the task against `schemas/task.schema.json`;
- materializes task variables;
- checks that upload source files exist;
- checks that at least one evaluator is score-enabled;
- records a static report and failure stage.

The output is an `engine_draft` candidate plus its associated asset and oracle plans.

## 8. Validation Invariants

A generated candidate is expected to satisfy the following invariants.

### 8.1 Groundedness

Every scored expected value is traceable to the instruction or an agent-visible source.

### 8.2 Implementability

Every setup operation, agent-facing surface, getter, and evaluator function belongs to a supported runtime interface.

### 8.3 Non-Precompletion

Setup establishes sources and distractors but does not satisfy the final task goals.

### 8.4 Output Coverage

Every required output has at least one score-enabled evaluator.

### 8.5 Result-Blind Fairness

The evaluator does not depend on hidden filenames, hidden fields, internal IDs, or undisclosed formatting constraints.

### 8.6 Asset Integrity

Uploaded assets exist and are valid examples of their claimed formats.

### 8.7 Isolation

Cleanup removes task-specific state sufficiently to prevent later episodes from inheriting a passing state.

### 8.8 Negative Discrimination

At least one clearly incomplete or no-op execution should remain unsuccessful where an executable negative oracle is available.

## 9. Post-Generation Release Workflow

Automatic completion is not the final acceptance criterion. Generated candidates enter a separate release pipeline.

### 9.1 Batch-Level Hard Gates

The selected-task gate checks issues such as:

- missing uploads;
- fake or corrupt media;
- invalid Office/PDF/archive members;
- benchmark-generation traces visible to the agent;
- inaccessible Linux paths;
- invalid surface metadata;
- setup helpers used before app initialization;
- unsupported image evaluator rules;
- setup/evaluator value transposition;
- single-device topology accidentally entering a cross-device batch.

### 9.2 Advisory Risk Scanning

Some checks are heuristic and are therefore reported rather than treated as hard failures. Examples include:

- rich outputs checked only by presence or size;
- output existence checks incorrectly marked as guards;
- source checks incorrectly marked as goals;
- incomplete cleanup evidence;
- high-risk runtime surfaces;
- evaluator commands with side effects.

### 9.3 Deep Review

Reviewer agents and human supervision inspect:

- task realism;
- instruction naturalness and sufficiency;
- source visibility;
- asset quality;
- setup completeness;
- evaluator fairness and generality;
- unnecessary evaluator/guard expansion;
- cleanup completeness;
- similarity to existing tasks;
- consistency with high-quality real-anchor, OSWorld, and AndroidWorld tasks.

### 9.4 Targeted Repair

Once a concrete task has been generated, review fixes are applied directly to that task's JSON, assets, setup, evaluation, cleanup, or oracle artifacts. The builder/spec is not rerun to overwrite a reviewed task.

This preserves task-specific improvements and reduces the tendency of later repairs to collapse back into mechanical templates.

### 9.5 Risk-Based Real-Runtime Smoke

Smoke selection prioritizes new or fragile mechanisms, including:

- Android media visibility;
- Audio Recorder;
- Retro Music;
- OsmAnd;
- Simple Draw;
- Chrome HTML submit/download flows;
- Thunderbird drafts;
- LibreOffice and PDF outputs;
- GIMP/Gallery;
- VLC playback;
- multi-VM topologies;
- SmartHome scheduling/workflow semantics.

Infrastructure failures such as unavailable VMs or ADB startup errors are recorded separately from task-semantic failures.

## 10. Scalability and Auditability

### 10.1 Reproducible Sampling

Stage 0 sample sets use fixed random seeds and stable sample IDs. This supports exact reruns and distribution analysis.

### 10.2 Stage-Local Failure Attribution

Every candidate records its intermediate stage outputs, validation errors, repair attempts, final status, and `failure_stage`. This makes it possible to distinguish failures in task semantics, assets, setup, evaluation, oracle planning, and final assembly.

### 10.3 Bounded Repair

Repair loops are deliberately bounded. The engine does not repeatedly call a model until a task happens to pass. Persistent failures are surfaced for resampling or manual investigation.

### 10.4 Profile-Based Extension

New device families can reuse the common multi-stage engine by providing:

- a Stage 0 sampler and validator;
- a surface capability catalog;
- profile-specific prompts;
- runtime interface descriptions.

The current registry includes `linux_android` as active and SmartHome-related profiles as planned placeholders.

### 10.5 Batch Coverage and Deduplication

Large-scale production must monitor:

- topology distribution;
- surface distribution;
- task-pattern distribution;
- clean versus distractor setup;
- feasible versus infeasible outcomes;
- evaluator types;
- high-risk surfaces;
- lexical and semantic duplicate-like candidates.

The pipeline should not rely on an instruction such as "do not repeat previous tasks" because an individual model call does not observe the full corpus. Diversity is a batch-level property and must be measured after generation.

## 11. Existing Evidence

### 11.1 End-to-End Pipeline Evidence

The repository contains deterministic and model-driven end-to-end probes. They exercise task design, review, repair, asset materialization, setup, evaluation/cleanup, oracle planning, and assembly while reporting the exact failure stage.

### 11.2 Selected Candidate Gate

The R01-R35 generation campaign retained 700 selected candidates across 35 rounds. The latest recorded static gate reports:

```text
missing_uploads = 0
fake_media = 0
fake_audio_text = 0
visible_leaks = 0
bad_linux_path = 0
metadata_trace = 0
clear_before_ensure_setup = 0
single_device_topology = 0
```

These results apply to the selected manifest at the time of the recorded audit, not to every historical rerun artifact.

### 11.3 Selective Real-Runtime Smoke

Representative true-runtime setup smoke has covered Android-only and Android+Linux mechanisms including OsmAnd, Retro Music, Audio Recorder, Simple Draw, Broccoli, Gallery/file transfer, and Linux spreadsheet evaluation.

The smoke verifies that runtime setup/evaluation/cleanup executes and that setup does not pre-satisfy scored goals. It does not establish full positive/negative end-to-end validation for all 700 selected candidates.

### 11.4 Test Coverage

Generation tests cover stage schemas, asset materializers, format checks, runtime interface pairing, setup structure, evaluator normalization, hidden-requirement detection, scoring requirements, and final task assembly. Exact test counts should be regenerated from the release commit before being reported in the paper.

## 12. Relationship to the Released Task Pool

The current canonical formal pool contains 5,897 tasks under the device-oriented task families, but these tasks were produced through multiple routes:

- the unified multi-stage Linux-Android generation engine;
- real-anchor task construction and topology views;
- family-specific Android-only/Linux-only builders;
- family-specific SmartHome builders/specs;
- Codex-coordinated builder/reviewer workflows;
- subsequent evaluator hardening and targeted repair.

Therefore, the paper may claim that MDCBench includes and validates a scalable task-construction pipeline. It must not claim that all 5,897 formal tasks were generated by the unified eight-stage engine.

The 200-task MDCBench Lite subset is a separate release artifact selected from the broader pool and subjected to deeper review, evaluator hardening, and per-task smoke evidence.

## 13. Supported and Unsupported Claims

### 13.1 Claims Supported by Current Evidence

- MDCBench implements a multi-stage, validator-in-the-loop candidate task-construction pipeline.
- The active pipeline is grounded in implemented Android and Linux runtime capabilities.
- The pipeline separates semantic design, asset materialization, setup, evaluation, cleanup, oracle planning, and assembly.
- Generated tasks retain stage-level records and failure attribution.
- The system supports real structured and multimedia assets rather than text-only placeholders.
- A 700-candidate selected generation set passed the recorded enhanced static gate.
- Representative high-risk mechanisms were exercised through real-runtime setup smoke.

### 13.2 Claims Not Yet Supported

- All 5,897 formal tasks were produced by the unified generation engine.
- All 700 selected generated tasks passed full positive and negative real-runtime smoke.
- SmartHome and mixed SmartHome profiles are fully integrated into the unified engine.
- Automatic validation alone guarantees human-level task realism or evaluator correctness.
- Every generated task is non-decomposable multi-device coordination.
- The pipeline is superior to one-shot generation without a controlled ablation.

## 14. Recommended Paper Framing

The task contribution is strongest when presented as three connected artifacts:

1. **Runtime-grounded task space.** MDCBench defines tasks over heterogeneous device topologies and observable Android, Linux, and SmartHome surfaces.
2. **Scalable construction methodology.** A multi-stage pipeline compiles coverage seeds into structurally closed candidate episodes using explicit contracts and deterministic validation.
3. **Quality-controlled benchmark instances.** Generated and manually designed candidates undergo batch audit, targeted review, repair, and runtime smoke before release.

The paper should not frame the contribution as task quantity alone. The more defensible contribution is the combination of scale, executability, evaluator grounding, and an auditable construction process.

## 15. Paper-Ready Chinese Draft

### Runtime-Grounded and Validator-in-the-Loop Task Construction

构造多设备 benchmark 任务不仅需要生成自然语言指令，还需要同时保证可见信息、环境初始化、运行时接口、评估逻辑和环境清理之间的一致性。直接要求语言模型一次性生成完整 task JSON，容易产生局部合理但整体不可执行的任务，例如 setup 未建立必要 source、资产格式无效、任务依赖不存在的接口、evaluation 检查隐藏字段，或 setup 已经预先满足最终目标。为解决这一问题，我们将任务构造建模为从 coverage seed 到 executable episode 的受约束编译过程。

Pipeline 首先根据设备拓扑、设备 surface 和 clean/distractor 初始状态采样覆盖种子。语言模型随后生成自然用户请求、可见 source、required outputs、expected data 和 value traces，显式建立 source-output-value contract。独立 review stage 检查任务真实性、可行性、信息完整性和隐藏要求，并对问题进行定向修复。对于复杂附件，模型仅生成结构化 asset specification，确定性 materializer 负责生成并验证真实的 CSV、JSON、HTML、Office/PDF、图片、音视频、压缩包、代码项目和其他领域文件。后续阶段只使用运行时已支持的接口构造 setup，并依据先前的数据契约生成 outcome-oriented evaluation、非计分 guard、cleanup 和 oracle plan。最终 task JSON 由代码机械装配，并通过 schema、设备接口、资产路径和计分目标检查。

每一阶段均输出结构化中间表示并执行确定性 validator。验证失败会被定位到具体阶段，并在受限范围内触发定向修复；无法实现的任务被标记为 unsupported，而不是通过编造 helper 或隐藏条件强行落地。通过自动 pipeline 的任务仍被视为 candidate，并在发布前接受批量重复度和覆盖审计、深度 review、针对 task JSON 和 assets 的定向修改，以及按风险选择的真实 Android、Linux VM 和 SmartHome smoke。该设计使大规模任务生成同时具备可扩展性、可执行性、可评估性和可审计性。

## 16. Paper-Ready English Draft

### Runtime-Grounded and Validator-in-the-Loop Task Construction

Constructing a multi-device benchmark task requires more than generating a natural-language instruction. The instruction, visible sources, environment setup, runtime interfaces, expected outcomes, evaluators, and cleanup operations must form a consistent and executable contract. A one-shot prompt that asks a language model to synthesize an entire task specification often produces locally plausible but globally invalid episodes, including missing source state, unsupported device operations, malformed assets, hidden evaluator requirements, or setup states that already satisfy the task goal.

We therefore formulate task construction as a constrained compilation process from a coverage-controlled seed to an executable benchmark episode. The pipeline first samples a device topology, agent-facing surfaces, and clean or distractor setup mode. A language model then constructs a grounded task design containing a natural user instruction, visible sources, required outputs, expected data, and explicit value traces that connect each scored outcome to agent-visible evidence. An independent semantic-review stage accepts, rejects, or requests targeted repair of the design. Complex source artifacts are represented as structured asset specifications and materialized by deterministic code into valid text, tabular, web, Office/PDF, archive, image, audio/video, code-project, and domain-specific files. Subsequent stages synthesize runtime-constrained setup, outcome-oriented evaluation, non-scoring guards, cleanup, and positive/negative oracle plans. The final task configuration is mechanically assembled and must pass schema, interface, asset-path, and scoring validation.

Each stage emits a structured intermediate representation and is guarded by deterministic validators. Failures are attributed to a specific stage and may trigger only bounded, stage-local repair; tasks that require unsupported capabilities are rejected rather than implemented through fabricated helpers or hidden conditions. Automatically completed tasks remain candidates. Before release, they undergo batch-level coverage and duplication audits, deep semantic and evaluator review, targeted edits to the concrete task and its assets, and risk-based smoke testing on the real Android, Linux, and SmartHome runtimes. This process enables scalable task construction while preserving executability, evaluator grounding, and auditability.

## 17. Suggested Contribution Statement

> We develop a runtime-grounded, validator-in-the-loop task-construction pipeline that compiles coverage-controlled seeds into executable and auditable multi-device benchmark episodes. The pipeline combines LLM-based semantic design with explicit source-output-value contracts, deterministic asset materialization, runtime-constrained setup and evaluator synthesis, bounded stage-local repair, and post-generation runtime validation.

## 18. Suggested Figure and Tables

### 18.1 Main Pipeline Figure

The main paper figure should show three layers:

```text
Coverage control
  Stage 0 topology/surface sampling

Candidate construction
  Stage 1 design -> Stage 2 review -> Stage 3 repair
  -> Stage 4 assets -> Stage 5 setup -> Stage 6 evaluation/cleanup
  -> Stage 7 oracle -> Stage 8 assembly

Release quality control
  batch gate -> risk review -> targeted repair -> real-runtime smoke
```

The figure should visually distinguish model calls from deterministic code and from reviewer/human-supervised release operations.

### 18.2 Recommended Tables

- Stage inputs, outputs, validators, and repair behavior.
- Supported device surfaces and task patterns.
- Asset materializer coverage.
- Generation failure rates by stage.
- Static gate findings before and after repair.
- Real-runtime smoke coverage by high-risk surface.

## 19. Recommended Ablations

To support a stronger pipeline contribution, compare the full pipeline with:

1. one-shot direct task JSON generation;
2. the pipeline without the surface capability catalog;
3. the pipeline without semantic review and targeted repair;
4. the pipeline without deterministic asset materialization;
5. the pipeline without hidden-requirement/evaluator validators;
6. the pipeline without post-generation batch audit.

Suggested metrics:

- task-design acceptance rate;
- end-to-end candidate completion rate;
- failure count by stage;
- missing or invalid asset rate;
- setup precompletion rate;
- hidden evaluator requirement rate;
- schema/interface error rate;
- duplicate-like rate;
- reviewer acceptance rate;
- real-runtime smoke pass rate;
- average model calls and generation cost per accepted task.

These ablations are not currently complete and should be presented as recommended experiments rather than existing results.

## 20. Repository Evidence Map

| Evidence | Repository path |
| --- | --- |
| End-to-end engine | `mdcbench/tasks/generation/engine/pipeline.py` |
| Generation profiles | `mdcbench/tasks/generation/profiles/` |
| Active topology/surface sampler | `mdcbench/tasks/generation/profiles/linux_android/stage0.py` |
| Surface capability catalog | `mdcbench/tasks/generation/profiles/linux_android/surface_capabilities.yaml` |
| Task pattern catalog | `mdcbench/tasks/generation/engine/pattern_catalog.py` |
| Stage 1 design validation | `mdcbench/tasks/generation/engine/stages/stage1_instruction.py` |
| Stage 2 review validation | `mdcbench/tasks/generation/engine/stages/stage2_instruction_review.py` |
| Stage 3 repair validation | `mdcbench/tasks/generation/engine/stages/stage3_task_design_repair.py` |
| Asset planning | `mdcbench/tasks/generation/engine/stages/stage4_assets.py` |
| Asset materialization | `mdcbench/tasks/generation/engine/stages/stage4_materializer.py` |
| Setup validation | `mdcbench/tasks/generation/engine/stages/stage5_setup.py` |
| Evaluation/cleanup validation | `mdcbench/tasks/generation/engine/stages/stage6_eval_cleanup_metadata.py` |
| Oracle-plan validation | `mdcbench/tasks/generation/engine/stages/stage7_oracle.py` |
| Assembly/static gate | `mdcbench/tasks/generation/engine/stages/stage8_assembly.py` |
| Pipeline probe CLI | `mdcbench/tasks/generation/engine/probes/run_pipeline_probe.py` |
| Generated-candidate hard gate | `scripts/generation/check_selected_tasks_gate.py` |
| Advisory risk report | `scripts/generation/report_selected_task_risks.py` |
| Generation result audit | `scripts/generation/audit_generation_result.py` |
| R01-R35 runtime-smoke record | `docs/R01-R35生成任务真机smoke测试记录.md` |
| Detailed implementation lessons | `docs/从任务描述到真实任务构造完整经验.md` |

