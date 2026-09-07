# DevicesWorld execution analysis — GPT-5.5 / Claude Opus 4.8

2026-09-07；用于 4.2 Main Results 和 4.4 Failure Analysis。定性选样，不计算失败原因占比、不冻结互斥分类。

## 1. 输入与采用口径

本轮程序化整理 400 条正式 selected attempts：两模型各 200 个更新后 Core200 任务。选择依据复用 [既有选取清单说明](</Users/lht/home/MDCBench/analysis_phase1/data_inventory.md>) 和每行 selection_source_summary。GPT 选取原批次 183、环境/helper 替代 13、联系人 setup 修复 1、041 干净 E2E 1、077/105 补齐 2；Claude 选取原批次 85、recovery retry 115。不在有效重试中挑最高分，不混入旧 Gemini、Diagnostic 独立 stage 或人工试跑。

上传前口径修订：本目录初版误用补充裁决后的结果计算主统计；本版改为裁决前主表，替代初版的通过率、设备分组和 189 对比较。原日志、任务、evaluator 和评分审计文件均未修改。结果逐行来自 [reconciled_task_results.csv](</Users/lht/home/MDCBench/analysis/chatgpt+claude/evaluation_followup/reconciled_task_results.csv>) 的 existing_adopted_result / existing_adopted_score；绝不使用 adopted_result_after_review / adopted_score_after_review 作为主实验。原自动评测 raw 字段另从正式 result.json 核对。

CSV 明确分三层：main_* 是裁决前已有主表；raw_* 是未改动的自动评测；supplementary_* 仅保存额外评分分析及其 pending 状态，不进入主统计、分组、配对筛选或其他 baseline 的评分规则。保留已有记录不表示追加批准任何改判。

现有 400 份 result.json 和冻结 task.json 可读，逐行 raw 成败/分数与选定来源对应，缺失或冲突输入 0。所有 selected attempts 保留在各自 200 的分母内。评分分析中的 not_audited、pending 或 unresolved 不表示主实验运行无效，也不成为删除记录或改写主分数的理由。

历史任务版本名 unknown；复用 [已完成的冻结配置逐字段比较](</Users/lht/home/MDCBench/analysis_phase1/task_snapshot_comparison.csv>)：200 对原 task.json 相同。设备组合与实例数本轮从各自冻结 task.devices 读取。此结论不代表源资产字节、前景屏幕、全部 Home 背景状态、dirty runtime 完全相同；逐运行 runtime 和全部原生产物快照不齐。旧评分争议与这些边界照常保留。

## 2. 完整主实验概览

| 模型 | 固定 N / 有结果 | 裁决前主表 PASS / N | 完全自动 Raw PASS / N | 主表 partial 均值 | Raw partial 均值 |
| --- | --- | --- | --- | --- | --- |
| GPT-5.5 | 200 / 200 | 58/200 (29.00%) | 57/200 (28.50%) | 0.5358 | 0.5341 |
| Claude Opus 4.8 | 200 / 200 | 75/200 (37.50%) | 75/200 (37.50%) | 0.5845 | 0.5845 |

两种均值各覆盖 200 条，只是对应评分字段的算术均值，不是独立 stage 成功率，也不说明所有评分条件已人工确认。本轮没有重新计算单任务评分。

必须保留的历史差别：GPT 裁决前主表 58/200 中已经包含 linux_android_smarthome_288 的一条更早人工改判，原自动结果为 57/200。该差别不是本次评分补充分析造成的，不能把 58/200 标成完全自动评分；来源见 [原任务人工改判记录](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/experiments/diagnostic60/evaluator调整文档.md>)。此上传版保留用户此前主表，不自行将其改成 57/200；若最终论文严格要求零人工改分，应整套使用 raw 字段。Claude 两层均 75/200。补充裁决后的通过数不作为本报告主实验结果。

| 模型 | 步数统计 N | 平均 / 中位步数 | 时长统计 N | 平均 / 中位时长（秒） |
| --- | --- | --- | --- | --- |
| GPT-5.5 | 200 | 21.000 / 13 | 200 | 744.233 / 600.300 |
| Claude Opus 4.8 | 200 | 20.445 / 14 | 200 | 613.817 / 382.453 |

统计集合是各模型全部 200 条 selected attempts，不只成功任务。steps 是日志 turn 数（含 done、解析失败 turn）；duration 是 result.duration_s 的任务运行总时长，包含启动/setup/evaluation/cleanup 等开销，不是纯模型推理时间。CLI 批量动作与单次 Android 点击都可能记作一步；更少步、更短时长不自动等于更强能力。

| 模型 | done | max_steps | time_limit | 其他/unknown | done 且裁决前主表 FAIL |
| --- | --- | --- | --- | --- | --- |
| GPT-5.5 | 149 | 35 | 16 | 0 | 91 |
| Claude Opus 4.8 | 145 | 32 | 23 | 0 | 70 |

终止类型直接沿用 result.termination_reason，未凭 steps=50 或 duration>1800 推断。本轮显式步数/时间标志与这些终止类型的冲突 0。有效上限记录为 50 steps、1800s agent wall-time；整个任务总时长可因调用边界及前后处理超过 1800s。done 只表示主动结束，非 evaluator PASS；其中 91 / 70 条为裁决前主表 FAIL，不能全当已精读的“虚假完成”。最终选取中没有以 setup/helper/API 异常终止的记录；被替代的旧 503/连接失败尝试不混入该表，但这不保证有效轨迹内部从未出现调用或解析错误。

## 3. 有依据的分组表现

以下全部使用 main_result，与第 2 节裁决前主表一致；不采用补充裁决结果。

### 实际设备类型组合

| 分组 | 每模型 N | GPT 裁决前 PASS / N（率） | Claude 裁决前 PASS / N（率） |
| --- | --- | --- | --- |
| android | 20 | 3/20 (15.00%) | 3/20 (15.00%) |
| android+home | 25 | 3/25 (12.00%) | 9/25 (36.00%) |
| android+home+linux | 30 | 7/30 (23.33%) | 11/30 (36.67%) |
| android+linux | 67 | 16/67 (23.88%) | 19/67 (28.36%) |
| home | 10 | 4/10 (40.00%) | 4/10 (40.00%) |
| home+linux | 30 | 11/30 (36.67%) | 14/30 (46.67%) |
| linux | 18 | 14/18 (77.78%) | 15/18 (83.33%) |

home 表示 SmartHome runtime endpoint，不是单个屋内 appliance。组合分组互斥，每模型合计 200，不按 task_id 前缀推断。仅 Linux 类型和仅 Android 类型的任务均含两台具体设备，不能把它们解释为“单设备任务”。任务内容和操作接口同时变化，不能据此识别某设备造成的因果效应。

### 实际设备实例数

| 分组 | 每模型 N | GPT 裁决前 PASS / N（率） | Claude 裁决前 PASS / N（率） |
| --- | --- | --- | --- |
| 1 | 10 | 4/10 (40.00%) | 4/10 (40.00%) |
| 2 | 95 | 36/95 (37.89%) | 50/95 (52.63%) |
| 3 | 66 | 12/66 (18.18%) | 15/66 (22.73%) |
| 4 | 29 | 6/29 (20.69%) | 6/29 (20.69%) |

实例数=len(task.devices)，环境类型数另存 environment_type_count。唯一单 endpoint 组是 Home-only（每模型 N=10），不是所有名称含 only 的任务。不同实例数组的任务组合和样本量不同，不能将成功率差解释为设备数的净效应。小组仅描述，不作显著性或难度因果判断。

不新增难度、阶段数、依赖深度标签：既有 task_category 每模型 190/200 覆盖且混合来源族；difficulty/motif 仅 30/200，workflow_pattern 全缺。它们不足以支撑覆盖全体的可靠 workflow/难度分层，故本轮只采用完整来源的设备字段。

## 4. 同任务配对概览

200 对均有冻结配置一致的既有依据；按裁决前主表结果，有 200 对进入下表。补充评分分析的 pending / unresolved 不导致任何配对被排除，也不替换任何一侧的主实验分数。配对只要求两侧正式结果可用、历史任务配置具有一致依据。

| 两者 PASS | 两者 FAIL | 仅 GPT PASS | 仅 Claude PASS | 可比对数 |
| --- | --- | --- | --- | --- |
| 49 | 116 | 9 | 26 | 200 |

这描述的是固定评测结果的交集，不是人工确认“真实能力成功”的交集。配置一致不表示所有实时状态或 evaluator 实现版本逐字一致，故不能宣称已控制所有运行因素，也不能由配对差值推断某失败机制解释了模型差异。

## 5. 案例选择、核实程度与有限机制

从既有 Phase 1 标注与 evaluation_followup 的案例记录定向选取，回到各自 selected attempt。实际核实 7 条失败（7 个 task_id；GPT 5、Claude 2）及 1 条 Claude 同任务成功对照，共读取 169 个 step 的完整动作/反馈链；158 个属于所选失败，11 个属于对照。结合冻结 instruction、原 trace、stdout/Home 状态，实际打开 12 张关键历史截图。此数量说明阅读范围，不是独立人工标注、标注一致率或抽样代表性。[完整案例与证据位置](</Users/lht/home/MDCBench/analysis/chatgpt+claude/execution_failure_analysis/failure_cases.md>) 是核心交付。

| 定位 | 模型 / task_id | 实际证据支持的现象 | 用途 |
| --- | --- | --- | --- |
| C01 | Claude Opus 4.8 / al_calendar_schedule_conflict | 来源字段语义误绑定 | 正文候选 |
| C02 | GPT-5.5 / linux_android_904 | 已获取信息未完整写入目标 | 正文候选 |
| C03 | GPT-5.5 / linux_smarthome_378 | 记录完成与环境状态完成脱节 | 正文候选 |
| C04 | Claude Opus 4.8 / linux_android_smarthome_439 | 后续对象与具体设备实例未保持绑定 | 正文候选 |
| C05 | GPT-5.5 / linux_smarthome_576 | 资格条件遗漏并伴随控制子目标未执行 | 附录候选 |
| C06 | GPT-5.5 / sh3_explicit_control_plain_light_dimming_infeasible_0013 | 同一环境内 appliance 身份替换 | 附录候选 |
| C07 | GPT-5.5 / android_only_267 | 局部 GUI 导航停滞阻断后续交付 | 附录候选 |
| S01 | Claude Opus 4.8 / linux_smarthome_378 | 用于约束 C03 的过强解释 | 成功对照（不计入失败案例） |

C01 与 C02 应分开解释：C01 尚未确认源字段含义，C02 则有明确识别正确号码的文字与最终空号码截图。C03 证明报告交付与实际效果是不同必要要求；S01 用三条真实 Home 命令提供同任务可行对照。C04 证明后续搜索一直绑定错误 Android 实例；前期文件打开已恢复，不能当成最终失败主因。

附录 C05 同时保留资格筛选遗漏与实际控制未执行两个因素，不强求唯一主因；C06 发生在单 Home 内的 appliance 层，不能算跨设备实例混淆；C07 的完整区间与截图支持局部导航停滞，但不证明模型不会完成未启动的短信子任务。这些描述允许重叠，没有冻结覆盖全体失败的互斥分类。

## 6. 不成立的扩展、排除与待补反例

不能从定向选样推断最常见错误、失败原因占比或某模型更易发生某类错误。不能把正 partial 分解释为独立 stage 成功；本轮不合并 Diagnostic-60，其名单/评分/运行层关联未在这里重新统一，也不将 Local-All 与 Core200 成功率直接作差。案例不足以隔离纯 coordination effect 或解释全部 composition gap。

定性选样与主实验计数分开：七条失败均为原自动 FAIL，且有独立执行证据。评分疑点或补充分析认为已完成的记录不作为能力失败案例，但照原口径保留在主实验统计中。Claude linux_only_218 的 pending 疑点因此未作能力失败证据。GPT linux_android_1859 的旧候选没有最终原生 ODT 全文，字段语义证据不如 C02 明确，未选入。GPT linux_android_smarthome_614 的既有计时分析能说明请求等待占用预算，却不能隔离上游服务、网络和生成时间，故未把 timeout 解释成协调错误。Claude android_only_267 的先前部分恢复记录复用为选样背景，不重复增加同题失败样本；本轮没有要求读完其他剩余失败。

S01 的背景 Home inventory 与 C03 并非完全相同，虽目标空调初始状态及公开要求一致，仍只作为局部可行性对照。C01 地点字段定义来自当次 setup，未保存模型打开 Room 8 详情的截图，因此不能声称它正确读到地点后又传错。其余关键截图或结构化状态证据可回查，没有以今天缓存内容补造旧产物。

若后续合并其他 baseline，可优先补两种有针对性的反例：正确保留来源字段并完成同类下游 GUI 落地；在连续空搜索后重新定位正确设备并恢复交付。每种少量、各机自己的正式 selected attempt 即可，不预填 PASS，也不要求全量失败重审。现有证据已足以支持本轮有限正文。

## 7. 评分疑点的边界记录

本轮没有新增具体评分疑点，没有启动新审计。仅保留 [上轮已记录的 Claude linux_only_218 pending 疑点](</Users/lht/home/MDCBench/analysis/chatgpt+claude/evaluation_followup/new_scoring_conflicts.jsonl>) 的来源：保存后 XLSX/MD 回读与原 E1 拒绝存在争议，主实验仍为原 FAIL/0.5。其余既有评分分析与裁决只存 supplementary_*，不影响本报告主实验；不据“本轮不审计”宣称 evaluator 已无问题。

## 8. 输出与复现说明

execution_results.csv 是 400 行平面数据，数值缺项留空、版本未知显式标 unknown。main_*、raw_*、supplementary_* 分开保存，另保留 selected_attempt、metadata_ref、原裁决来源及状态；run_ref 指原 result.json，duration 单位秒。本版只修正派生分析视图，不写回 reconciled_task_results.csv 或任何原始结果。没有新增 hash、复制海量执行史、执行日志中的命令、连接设备、重跑 agent 或修改任务/evaluator。

本次上传范围仅为本目录四个交付文件：execution_results.csv、execution_analysis.md、failure_cases.md、section4_4_draft.md。历史日志/截图链接保留本机绝对路径供持有原记录的分析机器回查，不表示这些大文件也已上传。既有评分审计文件保持原样，应作为补充分析阅读。

本机构建脚本 build_execution_analysis.mjs 未包含在上传范围；CSV 由表格工具导入和类型化导出，Markdown 数值来自同一批逐行数据。
