# DevicesWorld：三组 baseline 失败模式补充核查（v3）

本轮为 AI 辅助的离线历史证据核查，不是独立人工标注或重新评分。每组事前固定50条记录性FAIL，现已完成全部150条核查；保留疑点和材料限制，不替换不支持预期主题的样本。

## 1. 范围、抽样与完成情况

仅使用 Gemini 3.1 Pro Preview、Crab-MAE（GPT-5.5）、Mobile-Agent-v3.5（GUI-Owl-1.5-32B-Instruct）的既有 Core200 主实验。三组各200条的正式 selected attempt 和上一轮采用成绩不变；未混入 GUI-Owl 直跑、临时试跑、独立 Diagnostic stage 或旧任务实验。

| baseline | 合格FAIL池 | 原有随机 | 本轮新增 | 目标 | 已核查 | 其中证据受限 |
|---|---:|---:|---:|---:|---:|---:|
| Gemini 3.1 Pro Preview | 155 | 0 | 50 | 50 | 50 | 1 |
| Crab-MAE（GPT-5.5） | 141 | 0 | 50 | 50 | 50 | 2 |
| Mobile-Agent-v3.5（GUI-Owl-1.5-32B-Instruct） | 185 | 0 | 50 | 50 | 50 | 2 |

150条模型—任务运行涉及 **114个不同task_id**。审阅状态：150条均已审阅（其中5条明确标记材料受限），未审阅0条。分析结论为有独立失败证据121条（含系统阻断，不等于模型责任）、scoring_question 26条、uncertain 3条。后两类不计失败模式支持；这些是工作完成/证据状态数量，不是失败原因比例。

旧材料另行复用12条：6个失败案例、2个正式PASS对照、4个排除/疑点记录。旧随机名单未在检索范围发现，因此本轮从未实质性精读的合格FAIL池独立抽取；旧定向记录不充配额。已有确认结果不被raw FAIL撤销；本机原采用层未定位到适用的confirmed adjudication，沿用其“未重新审计”状态，不声称不存在外部裁决。

抽样使用Python 3.11.9，排序唯一键后 `random.Random("DevicesWorld-pattern-validation-v3|" + baseline_id).sample(...)`，三个baseline各无放回50条。完整候选、排除理由、种子和顺序见 [sampling_manifest.json](sampling_manifest.json)。名单冻结时间：2026-09-09T21:20:47.767889+08:00。冻结后未替换。

逐条记录见 [additional_reviews.jsonl](additional_reviews.jsonl)，新案ID为G-R01…G-R50、C-R01…C-R50、M-R01…M-R50，编号是抽取顺序，不是Lite任务序号。每条含原公开要求、设备实例、阶段事实、恢复、必要缺项、子类型、历史路径及实际核实方式。事件/step索引零基；截图编号不能当事件索引。

## 2. 证据覆盖，不是发生率

表中“运行/任务”分别按baseline+task_id+selected_attempt和task_id去重。H1/H2/H3可重叠，不能加总成互斥分布。旧定向与新增随机来源分别列示；SYS与OTHER不并入通用模型缺陷。

| 主题 | 旧失败支持：运行/任务；baseline | 新失败支持：运行/任务；baseline | 合并不同任务 | 边界与处理意见 |
|---|---|---|---:|---|
| H1 局部执行未推进必要状态 | 2/2；G, M | 86/73；G, C, M | 74 | 保留正文：状态未推进有多任务证据；GUI定位、语法、依赖、无效等待必须分子型，不推断共同认知根因。 |
| H2 信息、对象与设备对应错误 | 2/2；G, C | 16/14；G, C, M | 16 | 保留正文：区分源记录、字段、交付对象、环境路径、Home家电层级；不能统称跨设备实例混淆。 |
| H3 必要动作或交付未落地 | 0/0；— | 20/19；G, C, M | 19 | 保留正文：明确报告与状态、具体漏做项；不以部分分数或没有额外verifier代替证据。 |
| SYS 系统或适配接口特定阻断 | 2/2；C, M | 11/11；G, C, M | 13 | 限定系统讨论：Crab批次、Mobile schema/adapter done、Android空白/超时、请求耗时分别保留；不作基础模型共性。 |
| OTHER 其他可观察机制 | 0/0；— | 2/2；C | 2 | 附录个例：未实测的数值/能力断言，与H2/H3不同；目前只在少量Crab记录证实。 |

G=Gemini，C=Crab，M=Mobile。完整运行—子机制关系及所有反例/未决项见 [pattern_support.csv](pattern_support.csv)；它没有频率或占比列。计数只表明本地现有支持范围，不能判断“最常见”、总体原因比例或哪个模型更容易出错。

### 来源集合与实际覆盖

family沿用正式summary.records[].family，不凭ID前缀推断；这些字段有些按设备组合、有些按任务集合命名，不能当作独立生成模板。多个linux_android内容仍可能来自相关模板。

| baseline | 源family集合（记录数） | 设备类型组合（记录数） | 终止标签（记录数，不等于机制） |
|---|---|---|---|
| G | linux_android:16；linux_android_smarthome:9；real100:1；linux_only:6；android_smarthome:3；android_only:6；linux_smarthome:4；real200:2；real300:3 | android+linux:21；android+home+linux:9；linux:6；android+home:3；android:7；home+linux:4 | time_limit:3；done:23；max_steps:24 |
| C | android_only:5；android_smarthome:8；real100:2；linux_android_smarthome:10；linux_smarthome:9；real300:2；smarthome_generated_scripted:2；real200:2；linux_android:8；linux_only:2 | android:6；android+home:8；android+home+linux:10；home+linux:9；android+linux:13；home:2；linux:2 | max_steps:14；time_limit:15；done:21 |
| M | linux_only:4；android_only:4；linux_smarthome:5；linux_android_smarthome:9；linux_android:13；android_smarthome:5；real100:3；real300:4；real200:3 | linux:5；android:7；home+linux:5；android+home+linux:9；android+linux:19；android+home:5 | max_steps:42；done:8 |

新样本的源集合合并覆盖与集中度可从上表复核。尤其H1证据大量来自Android app工作流，因此正文应写“这些任务中的局部执行停滞”，而不是所有平台共享的同一种操作缺陷。未强制覆盖每种拓扑：Gemini和Mobile样本没有单Home任务，Crab有2条；不以额外抽样填齐。

### 同一任务跨baseline与不同任务的重复要分开

- `linux_android_smarthome_696`：M-R04漏掉映射灯光计划；G-R38/C-R45计划已正确建立、原Tasks交付未完成。是同一task的不同断点，不能把三条当三个独立任务的同一H3实例。
- `linux_only_218`：M-R01读取两机表后停在GIMP；G-R42有转换成功与正确逐人说明，却仍有评分疑点。后者不是该任务的第二个已证实失败机制，也不改为PASS。
- `linux_android_943`：G-R30/C-R38都把手机Downloads源文件放到Linux找，并用不匹配的当前短信补授权；这是该task的双baseline复现，路径子型不能凭这两条声称已跨不同task泛化。
- 同时也存在不同任务支持：H2在G-R04日历description→location、G-R37请求码RC-99→RC-42、C-R13手机报告写到Linux、C-R24报告写入另一笔记上可分别定位。H3在G-R17控制缺失、M-R40已应用回复与灯实际off、M-R30登记空白上是不同任务的独立证据。

## 3. 正文候选与分层解释

以下在完成全部固定样本后选取，优先清楚证据而非强求三个模型平均露出。旧案继续提供旁证，但没有冒充本轮重新看过旧图。

### H1：表单定位不推进

主展示：**G-R20 / Gemini 3.1 Pro Preview / `linux_android_1307`**（attempt `067_linux_android_1307`）。

在正确页面四次尝试CODE-1307输入/提交，坐标始终落在实际输入框/Verify按钮之外；终图输入框仍空。完整后续没有有效恢复。

旁证G-R35录音目录、C-R42不可行音乐报告、M-R01转换交付；旧M1为独立的语法修复子型。恢复反例G-R33/G-R50说明中间代码失败可被修复；旧G2的输入恢复不能再被计作最终原因。

可回查原证据：[任务](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/067_linux_android_1307/config/task.json)；[轨迹](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/067_linux_android_1307/trajectory.json)；[历史评价](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/067_linux_android_1307/evaluator_trace.json)。
关键事件：e4, e6, e7, e8, e9, e10, e11, e12。
真实图/状态素材：[step_018.png](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/067_linux_android_1307/artifacts/linux_0/screenshots/step_018.png)

### H2：正确事件中的description被写成location

主展示：**G-R04 / Gemini 3.1 Pro Preview / `al_calendar_schedule_conflict`**（attempt `004_al_calendar_schedule_conflict`）。

Vendor planning时间找对，但把搜索摘要“Source of truth for schedule correction”写入CSV地点及修改日志，最终回读仍保留该值；历史setup地点是Room 8。这里不是“没有读到事件”，也不声称模型曾正确读取Room 8。

旁证G-R37同标题不同request code、G-R31人名代替邮箱、G-R48人名代替职能、C-R13错误交付环境、C-R24/C-R39错误笔记。旧C1仍保留为单Home家电替换；S2仅是该具体任务的成功对照。

可回查原证据：[任务](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/004_al_calendar_schedule_conflict/config/task.json)；[轨迹](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/004_al_calendar_schedule_conflict/trajectory.json)；[历史评价](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/004_al_calendar_schedule_conflict/evaluator_trace.json)。
关键事件：e1, e2, e4, e30, e31, e33, e38, e39, e40。
真实图/状态素材：[step_055.png](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/004_al_calendar_schedule_conflict/artifacts/android_0/screenshots/step_055.png)；[step_057.png](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/004_al_calendar_schedule_conflict/artifacts/android_0/screenshots/step_057.png)；[step_061.png](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/004_al_calendar_schedule_conflict/artifacts/android_0/screenshots/step_061.png)

### H3：Applied记录没有相应控制动作

主展示：**G-R17 / Gemini 3.1 Pro Preview / `linux_smarthome_656`**（attempt `122_linux_smarthome_656`）。

读矩阵、查询office AC/study heater能力和状态后直接写applied JSON并done；全轨迹没有控制命令，历史Office仍off/auto26、study仍off。没有API或执行拒绝阻断作为替代解释。

旁证M-R40、M-R42短信声称已改但Home没动作，M-R49表单paused但机器人仍cleaning；M-R28/M-R30则是正确控制决策未写登记。C-R33同样有交付—计划不一致，但其阻断来自SYS协议，不混成同一直接原因。

可回查原证据：[任务](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656/config/task.json)；[轨迹](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656/trajectory.json)；[历史评价](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656/evaluator_trace.json)。
关键事件：e1, e2, e3, e4, e5。
真实图/状态素材：使用上述轨迹/评价中的结构化状态片段；不生成虚构Home截图。

### SYS：计划manifest与被拒绝的Home批次

主展示：**C-R33 / Crab-MAE (GPT-5.5) / `linux_smarthome_359`**（attempt `127_linux_smarthome_359`）。

正确checks manifest已写；同时提交两项Home调度遭协议拒绝，没有任何被接受的Home调度，随后done；终态scheduled command/workflow均为空。任务要求未来计划，不要求立即推进时间。

与旧C2、C-R32/C-R36/C-R43/C-R50共同支持Crab当前适配接口问题；旧X3已有分步恢复，限制“出现批次报错必然失败”。Mobile的M-R14/M-R33/M-R45是另一种schema/adapter结束，不能直接合并成相同故障。

可回查原证据：[任务](../../../runs/core200-rerun-20260826/crab-mae-gpt55-core200/PC-20260130VLZZ/run_01/127_linux_smarthome_359/config/task.json)；[轨迹](../../../runs/core200-rerun-20260826/crab-mae-gpt55-core200/PC-20260130VLZZ/run_01/127_linux_smarthome_359/trajectory.json)；[历史评价](../../../runs/core200-rerun-20260826/crab-mae-gpt55-core200/PC-20260130VLZZ/run_01/127_linux_smarthome_359/evaluator_trace.json)。
关键事件：e2, e4, e6, e8, e9, e10。
真实图/状态素材：使用上述轨迹/评价中的结构化状态片段；不生成虚构Home截图。

### 附录、降级与不采用

- H2下“跨环境源路径错用”在G-R30/C-R38集中于同一task，适合附录的限定子型；“家电替换”旧C1不能独自代表全部跨设备路由问题。环境交付错误C-R05/C-R13有不同任务证据，但仍集中Crab，且均涉及手机笔记写到Linux，不扩展为所有设备方向。
- OTHER：C-R09未执行功率查询却给出约1.76kW，C-R50未获得被拒的能力查询就写能力判断。保留“缺少测量/能力证据的断言”，目前只作Crab附录个例，不增设全benchmark第四大认知类别。
- G-R45空白Android表面与多次15秒超时，G-R47请求耗时耗尽墙钟预算，各作为基础设施/接口条件说明；样本不足以诊断Windows特有问题或API提供商是唯一责任方。G-R47仅4动作，已记录模型延迟约302/400/221/362秒，不能称为50步无效循环。
- 不采用“memory丢失”“所有问题都缺少全局验证”“框架done都是模型自信早停”“未来控制已经失败”等无法由当前轨迹推出的解释。没有测试新增验证器/锁/恢复模块的效果。

## 4. 不支持既有主题、恢复与具体材料缺口

所有未决记录保留在原随机配额中。不把有内容的笔记说成不存在，不把成功转换后的早期依赖异常写成最终原因。26条scoring_question只记录局部疑点，3条uncertain保留具体缺口；不新增裁决。

| 类型 | 新样本ID | 处理 |
|---|---|---|
| G / scoring_question | G-R02, G-R03, G-R06, G-R08, G-R10, G-R12, G-R15, G-R25, G-R26, G-R29, G-R32, G-R33, G-R34, G-R42, G-R50 | 留在JSONL与CSV unresolved，不计failure_support |
| C / scoring_question | C-R06, C-R14, C-R15, C-R19, C-R26, C-R27, C-R31, C-R34, C-R37 | 留在JSONL与CSV unresolved，不计failure_support |
| C / uncertain | C-R47 | 留在JSONL与CSV unresolved，不计failure_support |
| M / scoring_question | M-R24, M-R29 | 留在JSONL与CSV unresolved，不计failure_support |
| M / uncertain | M-R18, M-R20 | 留在JSONL与CSV unresolved，不计failure_support |

其中关键反例/疑点：G-R02/G-R12/G-R26等笔记终态有清楚内容，与历史检查存在落盘/匹配疑点；G-R33图片索引10 passed、G-R50合并器7 passed，但旧测试摘要检查FAIL，没有轨迹写测试的动作；G-R42对账输出内容与历史检查冲突。C-R26的APPROVAL与来源code映射不够直接，降为scoring_question而非支持H2。它们均未被宣布改判PASS。

G-R36的openpyxl安装、G-R48的LibreOffice替代pandas与Thunderbird重启、C-R33的标准库替代依赖已恢复；只分析其另外独立缺项。G-R44截图有真实PDF附件，不能沿用“草稿missing”说它没有附件；支持来自未生成的指定手机照片及文档引用不一致。M-R49 schema报错后网页提交已恢复，而Home控制仍未做。

| 材料受限条目 | 已核查与具体未补造内容 |
|---|---|
| G-R34 / `linux_smarthome_433` | Home 约束已满足，报告落盘内容不足以独立判断。 缺该次最终工作簿内容回读；不使用当前共享 cache 补造历史文件。 |
| C-R19 / `linux_only_300` | 没有建立独立执行失败；历史图像实际视觉匹配仍未确认。 本次运行没有已确认可读取的最终PNG副本/展示截图；不使用当前复用cache重建视觉证据。脚本成功与尺寸不能完全替代最终图像核查。 |
| C-R47 / `linux_android_1869` | 无法用目前精读材料独立确认草稿为何缺失匹配；尚缺联系人具体 role 原始内容与历史持久化草稿的逐字段对应。 评分疑点仅简记，不重新审计存储，也不自动改判。 |
| M-R18 / `a2_route_media_status` | Route media status为空。 公开要求声称已有favorites，历史终态却空；未定位是初始化、导入还是导航导致，不能把这一例直接算模型H1支持。无需扩展评分审计。 |
| M-R20 / `a2_gallery_cleanup_log` | 清理结果历史匹配mismatch。 不能由4张或FAIL独立断定应删哪几张；不把这条算明确机制支持，保留固定样本。 |

5条“证据受限”不是未读：它们的公开要求、完整动作序列及现有历史评价已检查，但历史产物/精确图像内容不足以确证机制；具体限制逐条保留。另有共享cache路径、未保存完整原始API请求体等边界，不以当前VM、后续运行、其他baseline产物补造。本轮未进行新的judge调用或设备连接。

## 5. 对上一轮4.4的修改意见与可替换正文

不覆盖原 [section4_4_draft.md](../execution_failure_analysis/section4_4_draft.md)。建议：

1. 首段将“核验六条失败、两条成功”改成“复用六条失败与两条成功、保留四条排除记录；另按三个baseline各50条固定随机核查”。说明抽的是未精读记录性FAIL，不是全部失败的简单随机样本。
2. 保留G1来源绑定和C1同Home对象替换事实，改为新H2的不同层级旁证；正文可用G-R04替代G1展示字段错绑，不将C1升级为跨设备路由。
3. 保留M1明确SyntaxError和S1对照，但放在H1的命令修复子型；用G-R20说明另一个GUI子型，避免将两者写成同一个定位或记忆根因。
4. 增加H3：G-R17及M-R40/M-R42提供无控制却报告Applied的独立状态证据；“部分成功”不足以自行支持此主题。
5. 原第三段C2移为单独系统接口段或附录，用C-R33补充不同任务证据及X3恢复边界。结尾策略仅列待验证假设，不写成已证明改进。

### 正文候选（定性结论，供跨机器合并后编辑）

我们进一步对三组本地baseline各固定随机核查50条尚未实质性精读的记录性失败，结合既有定向案例检验机制是否跨任务重复。该样本排除了已核查和已知争议记录，不用于估计失败原因占比；审阅中新发现的评分疑点与证据不足记录仍保留，不自动改分。

在多个不同任务中，局部执行未推进必要状态会阻断后续工作，但具体机制并不相同。验证码表单中，反复输入/提交动作没有命中实际控件，最终输入框仍空（G-R20）；另一双Linux转换实例则因重复语法错误而未生成文件（旧M1）。中间报错本身不够：图片索引和配置合并任务后来通过测试（G-R33、G-R50），不能把其早期错误用于解释最终记录性失败。

另一些运行表现为信息与目标的对应错误。Gemini把正确日历事件的描述摘要写成CSV地点（G-R04），也曾明知请求码不同仍用RC-99记录更新RC-42任务（G-R37）。Crab有把要求的手机笔记写到Linux或另一现有笔记的实例（C-R13、C-R24）。这些证据分别位于字段、源记录和交付对象层级，不等于同一种跨设备实例路由缺陷。

必要动作未落地还可能与看似完成的交付并存。Gemini读取策略和设备能力后保存applied JSON，却没有执行任何控制，设备仍关闭（G-R17）；Mobile-Agent也有已应用的回复与未改变Home状态并存的任务（M-R40、M-R42）。这类结论基于完整动作与历史终态，而非仅由部分得分或done标签推出。

此外，系统适配必须单独解释：Crab的合法目标可因同环境多动作批次被拒而无法形成实际计划（C-R33、旧C2），但另一个实例已通过分步调度恢复（旧X3）。Mobile-Agent的schema阈值结束、Android异常表面和请求延迟耗尽预算也属于不同执行条件，不能统一归因于基础模型能力。上述本地证据支持分层分析，不构成全部benchmark失败模式的频率排名或内部认知因果解释。

### 图表占位

**Table X：四个证据链展示行。** 使用H1/G-R20、H2/G-R04、H3/G-R17和独立SYS/C-R33；列为“公开目标—实际动作/反馈—历史终态—缺项—边界”，不展示原因百分比。

**Figure X：三个并列的真实执行片段。** (a) G-R20实际表单截图与历史点击位置；(b) G-R04搜索摘要、目标CSV读回片段；(c) G-R17applied JSON写入与没有控制的Home终态。图注标明事件索引、实例与selected attempt；Home采用结构化状态摘录，不画成未存在的真实屏幕。SYS批次拒绝可置附录Fig. A，展示C-R33协调错误与空计划列表。

## 6. 汇总边界与交付检查

本文件仅代表这台设备上的三组baseline证据。没有追加样本、重新评分、重新跑实验，也没有修改任务、evaluator、runtime、原结果或上一轮报告；没有commit/push。文件生成时逐条检查冻结名单可复现、每组50个不同task、全局150个唯一运行、旧案不充配额、事件/评价索引合法、所引用图片存在、所有必要字段完备。

最终全局三四个重点主题应在四组机器结果合并后确定。本机建议保留H1/H2/H3的分层定性讨论，SYS限定于实际系统和接口，OTHER及路径错用等窄子型按当前证据范围放附录；不声称50条达到理论饱和，不推出未观察到的机制不存在。
