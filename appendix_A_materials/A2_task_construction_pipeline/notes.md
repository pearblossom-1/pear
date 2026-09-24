# A.2 Task-Construction Pipeline

## 1. 四个论文阶段如何对应实际代码

主实现是 [pipeline.py](source_snapshots/mdcbench/tasks/generation/engine/pipeline.py) 的 `run_model_pipeline`。四阶段是对职责的组织，不是声称代码只有四个函数，也不是把所有审查都放到最后。

| 论文阶段 | 实际阶段 | 输入 | 输出及衔接 |
| --- | --- | --- | --- |
| I. Configuration sampling / 配置采样 | Stage0 | 设备组合池、surface 列表、数量和随机种子 | sample：设备、各设备允许的 surface、clean/distractor；传给设计阶段 |
| II. Task design / 任务设计 | Stage1–Stage3 | sample、surface 能力说明、pattern catalog | 任务目标、visible sources、required outputs、expected data、value trace；经过审查和条件修复后进入实例化 |
| III. Executable instantiation / 可执行实例化 | Stage4–Stage8 | 审查后的设计、实现能力接口、资源要求 | 实体文件、setup、evaluation/cleanup/metadata/limits、oracle 计划、装配后的候选 task JSON |
| IV. Validation and repair / 验证与修复 | 贯穿 Stage2/3、Stage4、Stage8，另有生成后 QA | 各阶段产物、静态报告、已有 runtime/smoke 记录 | 接受、拒绝、局部修复或待复验；满足相应发布条件后才进入维护后的任务池/评测子集 |

“设计原则上支持”“静态产物通过”“setup 能运行”“oracle 正例通过”“普通 agent/人能操作完成”是不同证据等级。不能互相替代。

## 2. 配置采样：采的是运行空间，不是完整故事

实现：[stage0.py](source_snapshots/mdcbench/tasks/generation/profiles/linux_android/stage0.py)。

设备组合按顺序轮转：`2A → 2L → 1A+1L → 1A+2L → 2A+1L → 2A+2L`。每台设备从所属类别的 surface 列表随机选一个；`random.Random(seed)` 控制可复现随机过程；`distractor` 以 0.25 的概率抽取，否则为 `clean`。因此不应写成“设备拓扑完全随机采样”或“每批保证恰好 25% distractor”。

Android 采样集合有 13 类：Markor note、Files/download、Calendar、Tasks、SMS、Contacts、photo/video、Audio Recorder、Clock、Retro Music playlist、OsmAnd favorite/marker、Simple Draw、recipe。Linux 有 14 类：text/Markdown、CSV、JSON、XLSX、ODT/DOCX、ODP/PPTX、PDF、HTML/browser、Thunderbird draft、VSCode project、GIMP image、VLC playback、ZIP、terminal。

这些是 **当前 Android/Linux sampler 的可选 surface 类型**，不是全数据集已经实测的 app 数量或覆盖率。例如 Thunderbird draft 是这里明确允许的输出形态，不能扩写成该 profile 已普遍验证真实邮件发送。

Stage0 不调用模型，不决定业务场景、依赖方向、具体内容、答案、evaluator 或难度。`clean` 不等于“没有筛选和推理”，`distractor` 才要求增加自然的近似非目标候选。

## 3. 任务设计：先建立语义关系，再写用户指令

Stage1 根据 sample、设计层 capability 和 11 种 pattern 的目录，输出：

- `instruction` 与内部 `detailed_description`；
- `visible_sources`：agent 在初始环境能获得的信息；
- `required_outputs`：最终需要持久化的结果；
- `expected_data`：确定性的完成条件；
- `value_trace`：预期值如何由可见 source 或明确用户规则导出；
- `why_cross_device` / `information_flow`：设备之间为何存在必要依赖。

设计 prompt 禁止在此阶段生成 helper/API 调用，要求每台 sampled device 真正提供 source 或 output；不可用多个互不相关的单设备子任务拼成“协同”。指令应保留入口与输出定位信息，但不提前给出本应从源资源提取的答案。

Stage2 是独立的一次审查调用，给出 `accepted/revise/rejected` 及阻塞问题；可在保持语义的前提下优化 instruction。**当前 pipeline 使用同一传入 model/provider 配置，不构成“独立模型审查”或“人工审查”的证明。** Stage3 在 revise 时执行结构修复；无需修复时传递已审查设计。无支持能力的样本可以终止，不硬生成。

相关材料：

- [surface_capabilities.yaml](source_snapshots/mdcbench/tasks/generation/profiles/linux_android/surface_capabilities.yaml)：设计能力和实现接口来源。
- [pattern_catalog.py](source_snapshots/mdcbench/tasks/generation/engine/pattern_catalog.py)：迁移、转换、合并、同步、冲突消解、多输出一致性等设计模式。
- [stage1_task_design.yaml](source_snapshots/mdcbench/tasks/generation/profiles/linux_android/prompts/stage1_task_design.yaml)、[stage2_task_design_review.yaml](source_snapshots/mdcbench/tasks/generation/profiles/linux_android/prompts/stage2_task_design_review.yaml)、[stage3_task_design_repair.yaml](source_snapshots/mdcbench/tasks/generation/profiles/linux_android/prompts/stage3_task_design_repair.yaml)。

## 4. 可执行实例化：把语义设计落到真实文件与运行接口

| 实际阶段 | 产生什么 | 不能误写成什么 |
| --- | --- | --- |
| Stage4 assets | asset manifest、external file 内容、实体文件及质量报告；有条件资产修复 | 不能只把文件路径字符串当作真实可读文件，也不能把质量报告当作全套应用可用性证明 |
| Stage5 setup | 按设备组织的初始化动作与可见性要求 | 不是 agent 的解题动作，更不能预先完成创建型目标 |
| Stage6 evaluation / cleanup / metadata | 结果读取与评测、清理、元数据、限制 | 不是用指令相似度评价，也不是把 source guard 默认等同于目标完成 |
| Stage7 oracle plan | 正例、负例/no-op 的构造计划及预期 | **只生成计划，不在这里实际运行 oracle，更不是普通 agent 成功轨迹** |
| Stage8 assembly | 统一 task JSON、资源写入计划、静态报告 | `completed` 只说明流水线到达并通过此处的检查，不是端到端真机可行性证明 |

当前 Stage8 的实际检查包括：`load_task_config` 能接受配置、upload 本地源路径存在、至少一个计分 evaluator。Stage4 另有格式/内容约束检查。`static_tests` 列表中的文字与实际执行的检查也不应混为一谈。

对应实现：[stage4_materializer.py](source_snapshots/mdcbench/tasks/generation/engine/stages/stage4_materializer.py)、[stage8_assembly.py](source_snapshots/mdcbench/tasks/generation/engine/stages/stage8_assembly.py)。完整九份 YAML prompt 已复制到本资料包 `source_snapshots` 的对应目录；来源逐项列在 evidence source index。

## 5. 一组真实阶段产物：两台 Linux 的 JSON → 演示文稿任务

选用历史 **R01 / sample_000014**，记录模型 `gpt-5-mini`，批次 20 个 samples、seed `731001`。这是构造引擎的阶段例子，**不是 A.1 日历任务的生成谱系，也不声称它被选进 Lite-200**。

[完整历史记录](stage_example/historical_pipeline_record.json) 与 [来源](stage_example/provenance.json) 已保存，九个阶段亦分别拆为 JSON。

| 阶段 | 此样本的实际产物 |
| --- | --- |
| Stage0 | `linux_0: linux.json`；`linux_1: linux.odp_pptx`；`setup: clean` |
| Stage1 | 从第一台机器的产品 JSON 选取产品，在第二台机器用模板生成产品摘要幻灯片；含 sources/outputs/expected/value trace |
| Stage2 | `decision: revise`：要求演示文稿标题包含 `Product Updates`，但该要求不在用户可见指令/源信息中，属于隐藏要求 |
| Stage3 | `repair_attempted: true`，记录中 `repair_errors: []`；保留修复后设计原文 |
| Stage4 | 生成产品 JSON 与 ODP 模板的资产计划，历史报告写入两份文件并 `passed: true` |
| Stage5 | 两台 Linux 的目录准备、资源上传、输出清理配置 |
| Stage6 | 产品来源 guard（不计分）、演示文稿文本/页数评测、cleanup/limits |
| Stage7 | 正例与缺失必需产品内容的负例计划 |
| Stage8 | 历史 `static_report.passed: true`，batch 状态 `completed` |

不能把这个历史例子美化成无缺陷的最终发布件：历史 Stage3 输出仍保留了上述 title 预期；Stage4 又增加了 `approved` 的 P-420，而最初预期主要围绕 P-200/P-305，说明“全部 approved”范围可能与后续检查不一致。此处保留原文并报告这一具体问题，不在本轮修任务。

现有 selected 路径中的配置已经不同于历史 `result.json`：指令改为只选 `slide_request: include` 的行，产品源文件增加 include/skip 字段，P-420 为 `skip_this_round`。已将[后续 selected 配置](stage_example/later_selected/task.json)、产品 JSON 和模板另存；它们不冒充最初 Stage4/Stage8 的原始输出。

因此，该案例适合说明 **“采样 → 语义审查发现问题 → 实例化 → 生成后继续修复”** 的真实过程；不能据此声称 Stage3 自动消除了全部问题，或此任务已经通过本轮普通 agent/人工真机验证。

## 6. 验证与修复：实现、历史证据与结论边界

| 证据层 | 现有材料 | 能回答的问题 |
| --- | --- | --- |
| 阶段结构/资源检查 | pipeline 各 validator、Stage4/Stage8 报告 | 结构、接口、资源引用及部分内容约束是否成立 |
| 生成后静态 gate | `scripts/generation/check_selected_tasks_gate.py` | 缺资源、假媒体、可见构造痕迹、setup 风险等指定问题是否被发现 |
| 真实 runtime setup smoke | `scripts/smoke/run_generated_setup_smoke.py` 及既有记录 | start/reset/evaluate/cleanup 是否能运行，目标是否未被 setup 预先完成 |
| 正负例 oracle smoke | `scripts/smoke/run_generated_selected_oracle_smoke.py` 等已有 runner/报告 | 构造正确结果能否通过、指定错误结果能否被拒绝 |
| 普通 agent / 人真实操作 | 对应任务的实际执行轨迹 | 用户可见入口与操作路径能否真正支持完成；不能由 oracle 注入代替 |

[既有 R01–R35 真机 smoke 记录](source_snapshots/docs/R01-R35%E7%94%9F%E6%88%90%E4%BB%BB%E5%8A%A1%E7%9C%9F%E6%9C%BAsmoke%E6%B5%8B%E8%AF%95%E8%AE%B0%E5%BD%95.md) 明确是 selected 700 中的代表性 setup smoke，不是所有 700 条都有完整正负例和普通 agent 成功证据。它记录过 Retro playlist helper 清空其他 playlist、source 中混入评测语言、媒体格式与路径等真实问题，也区分 VMware 环境阻塞。记录中的状态属于相应历史运行，本轮没有复验。

## 7. 这条引擎与整个数据集的关系

当前注册的 `linux_android` profile 处于 active；`smarthome` 与 `smarthome_mixed` 仍为 planned。仓库中的 SmartHome 及其混合任务另有专用 builder/specs 和维护路线；旧 seed collections 与生成任务还通过 topology-view 组织脚本进入设备目录。

因此，论文可以把本流程描述为统一 Android/Linux 任务构造引擎及贯穿维护的构造原则；不能说 5,897 条或全部 Lite-200 均由当前 Stage0–Stage8 自动完成，也不能依据缺失的 provenance 标签计算全池自动/人工占比。

## 8. 流程图素材

本次上传以用户提供的 [DevicesWorld_task_construction (13).pdf](../figures/DevicesWorld_task_construction%20%2813%29.pdf) 作为主流程图，保持 PDF 原样。它是四阶段概念总览，详见[图与实现的对应说明](../figures/notes.md)。

此前材料准备阶段依据 [构建说明](source_snapshots/docs/paperdossier2/MDCBench_task_construction_pipeline.md) 与代码整理的 [SVG 图](../figures/implementation_reference/task_construction_pipeline.svg) 和 [Mermaid 源图](../figures/implementation_reference/task_construction_pipeline.mmd) 保留为补充参考，不是用户主图的源文件。它们将 staged generation、跨阶段审查/修复、运行验证以及 curated Lite selection 分开；箭头是职责衔接，不表示每条历史任务都执行过所有验证步骤。
