# DevicesWorld 失败模式补充核查：GPT-5.5 与 Claude Opus 4.8

日期：2026-09-09。协议：`DevicesWorld_failure_pattern_validation_prompt_v3_50_per_baseline.md`。本机组：`chatgpt+claude`。

## 1. 结论与范围

完成两个 baseline 各 50 条事前固定的随机核查。新增证据支持继续讨论三个高层主题：**局部交互未推进必要状态（H1）、信息与目标的对应偏离（H2）、必要动作或交付缺项（H3）**。它们是组织观察的线索，不是已冻结的互斥分类，也不是已证明的内部认知根因。输入超时后文本残片叠加有跨任务重复，但应作为接口相关现象单列。

本轮只分析正式 selected attempt 的既有历史。主实验仍沿用上一轮结果表：GPT-5.5 **58/200**、Claude Opus 4.8 **75/200**；GPT 原自动结果 57 与主表 58 的既有差别见原报告。本轮没有改分。补充裁决结果不是主实验成绩，仅用于避免把已有明确完成结论的运行再当作真实失败证据；pending 不视作 PASS，新遇到的疑点也不自动改分。

输入与输出：

- 主表与原分析：[execution_results.csv](</Users/lht/home/MDCBench/analysis/chatgpt+claude/execution_failure_analysis/execution_results.csv>)、[execution_analysis.md](</Users/lht/home/MDCBench/analysis/chatgpt+claude/execution_failure_analysis/execution_analysis.md>)、[failure_cases.md](</Users/lht/home/MDCBench/analysis/chatgpt+claude/execution_failure_analysis/failure_cases.md>)、[section4_4_draft.md](</Users/lht/home/MDCBench/analysis/chatgpt+claude/execution_failure_analysis/section4_4_draft.md>)。
- 既有边界：[reconciled_task_results.csv](</Users/lht/home/MDCBench/analysis/chatgpt+claude/evaluation_followup/reconciled_task_results.csv>)、Phase 1 实质性审阅、后续轨迹标注和既有评分审计。不以仅有机器索引的旧候选标签自动赋因。
- 本轮：[sampling_manifest.json](</Users/lht/home/MDCBench/analysis/chatgpt+claude/failure_pattern_validation/sampling_manifest.json>) 固定名单；[additional_reviews.jsonl](</Users/lht/home/MDCBench/analysis/chatgpt+claude/failure_pattern_validation/additional_reviews.jsonl>) 100 条逐运行事实；[pattern_support.csv](</Users/lht/home/MDCBench/analysis/chatgpt+claude/failure_pattern_validation/pattern_support.csv>) 新旧证据关系；本文件为综合结论。原四个文件未覆盖。

### 实际工作量

| baseline | 原有随机样本 | 本轮新增 | 目标总数 | 实际核查完成 | 其中 reviewed / evidence_limited |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPT-5.5 | 0 | 50 | 50 | 50 | 40 / 10 |
| Claude Opus 4.8 | 0 | 50 | 50 | 50 | 48 / 2 |

未发现可续接的旧版随机 manifest；本次全部为 v3 首次固定抽样。100 条对应 **77 个不同 task_id**，不是 100 个独立任务。每条均阅读完整动作/反馈链及适用的历史任务、结果/评估记录；关键截图按条目引用实际打开，未声称逐张检查全部截图或完整检查所有原生交付物。

同时复用 **83 条旧实质性/定向审阅运行（GPT 46、Claude 37；51 个 task_id）**，包括失败、成功对照、已有完成边界及仍未确定项；不是新增随机配额。不是 83 条都支持失败：其中 27 条运行、24 个任务提供明确失败机制支持，其余保留为对照或未确定边界。合并新旧共有 **183 条运行、117 个任务、203 条运行—机制/边界关系**。CSV 中多行不等于多次运行，始终用 `baseline + task_id + selected_attempt` 去重；旧 C01 等编号仅保留为来源。

旧审阅的其余关系为 1 条恢复对照、32 条完成边界/成功对照、23 条仍未确定记录；后者的评分或历史材料边界沿用原记录，不因此追加审计。新旧合计 84 条不同运行、64 个任务提供至少一种明确失败机制证据；这只是去重后的证据覆盖，不能除以合并样本数解释为总体失败原因比例。

新增样本状态为 GPT：27 条 supported_failure、21 条 scoring_question、2 条 uncertain；Claude：30、19、1。这里的状态描述本轮可用证据，**不是新的成绩或改判建议**。100 条均保留，没有将疑点或材料不足条目换成“更典型”的失败。12 条 evidence_limited 是证据深度限制，其中也可能有足够支持某个窄观察的材料；不是 12 条没读。

## 2. 抽样与元数据覆盖

先排序候选唯一键，使用 Python 3.12.14 的 `random.Random(seed).sample(keys, 50)`，两个 baseline 分别固定种子 `DevicesWorld-pattern-validation-v3|gpt-5.5` 和 `DevicesWorld-pattern-validation-v3|claude-opus-4-8`。完整候选、逐项排除理由、顺序及历史入口在 manifest。两组 50 条全部在阅读新轨迹内容前固定，按固定顺序分五批完成，未换种子、重抽或替换样本。

| 抽样前口径 | GPT-5.5 | Claude Opus 4.8 |
| --- | ---: | ---: |
| 正式任务总数 | 200 | 200 |
| 主表非 FAIL，首先排除 | 58 | 75 |
| 剩余中已有明确完成结论，排除 | 13 | 14 |
| 剩余中此前实质性/定向审阅，排除 | 31 | 20 |
| 合格候选池 | 98 | 91 |
| 固定随机核查 | 50 | 50 |

此表为按优先顺序的**互不重复排除计数**；已知争议与其他理由可能重叠，逐项理由及重叠计数另在 manifest。无因基础入口缺失而另扣的合格记录，无配额不足。旧审阅 83 条不等于此处 31+20，因为旧审阅还包含已在前两行排除的完成记录及对照。

| 实际设备类型组合 | GPT-5.5 | Claude Opus 4.8 |
| --- | ---: | ---: |
| Android | 7 | 10 |
| Android + Home | 10 | 7 |
| Android + Linux | 16 | 23 |
| Android + Home + Linux | 12 | 7 |
| Home + Linux | 5 | 3 |

设备实例数 2/3/4：GPT 为 23/15/12，Claude 为 20/18/12。设备类型只有 Android 不代表只有一台手机。终止方式 done/max_steps/time_limit：GPT 为 28/15/7，Claude 为 20/15/15；它们是覆盖描述，不直接代表原因或成功声明。

有来源的 `manifest_family` 覆盖如下。它是原清单 cohort，经常只是设备分组，**不能作为独立语义任务族的证明**。

| manifest cohort | GPT-5.5 | Claude Opus 4.8 |
| --- | ---: | ---: |
| android_only | 5 | 7 |
| android_smarthome | 10 | 7 |
| linux_android | 10 | 17 |
| linux_android_smarthome | 12 | 7 |
| linux_smarthome | 5 | 3 |
| real100 | 2 | 2 |
| real200 | 3 | 3 |
| real300 | 3 | 4 |

新增样本没有 Linux-only 或 Home-only 运行。不能据此声称这些设备没有问题。尤其 H1 的证据集中在 Android GUI；不同 task_id 仍可能复用同一 app 流程或模板。本设计抽的是“本机未精读、具备材料的记录性失败池”，不是全体 200 个任务或全部失败的简单随机样本。

## 3. 模式支持与处理意见

下表仅计 `failure_support`，数值为“不同运行数 / 不同 task_id 数”。对照、恢复、未确定关系不计入。主题可重叠，不能求和制成失败原因分布。

| 候选主题 | 旧审阅支持 | 新随机支持 | 合并支持 | 合并所涉 baseline 运行数 | 建议 |
| --- | ---: | ---: | ---: | --- | --- |
| H1 局部交互未推进必要状态 | 2 / 1 | 47 / 38 | 49 / 39 | GPT 20；Claude 29 | 可增加为正文主线；限定为观察到的流程停滞，保留 app/阶段子类型 |
| H2 来源、字段、对象或实例对应偏离 | 16 / 14 | 2 / 2 | 18 / 16 | GPT 10；Claude 8 | 保留正文，但拆清语义字段、来源集合、具体手机与单 Home 对象层 |
| H3 必要动作或交付缺项 | 7 / 7 | 5 / 5 | 12 / 12 | GPT 10；Claude 2 | 保留正文；逐例指出缺哪个动作/字段，不能统称“缺全局验证” |
| SYS 系统或接口特定现象 | 2 / 2 | 5 / 5 | 7 / 7 | GPT 6；Claude 1 | 单列；内部是不同问题，不能作为共同模型缺陷 |

完整支持记录、selected attempt、证据和限制可在 CSV 按 `pattern_id`、`evidence_role`、`selection_origin` 筛选。旧与新运行唯一键不重叠；同题跨模型仍可能共享 task_id。

### H1：重复的是必要状态没有推进，不是一个统一 GUI 根因

旧证据主要是 `android_only_267` 的两个模型运行；新增扩大到曲目列表、Files 复制、Calendar 创建/修改、闹钟、地图收藏、Broccoli 配方编辑和 Markor/Tasks 交付等具体情境。

- 同题重复：两个模型在 `al_playlist_from_csv`、`android_only_260`、`android_only_285`、`linux_android_1831`、`linux_android_smarthome_338` 等均有停滞。跨模型重复需算作同一 task_id，而非新增任务背景。
- 跨任务支持：Claude `android_only_210` 的 Calendar 未保存、GPT `android_only_223` 只有 Task 标题而无必要正文、Claude `a2l2_meeting_packet_full` 完成 DOCX 后卡在联系人到短信转换。不是全部停在同一个输入源或同一个 app。
- 反例：GPT `linux_android_1289` 的笔记导航最终恢复；`linux_android_smarthome_423` 的任务编辑最终完成；`a2_alarm_conflict_log` 两条闹钟最终存在。它们不能因出现重复点击而被判为该环节失败。

合并 H1 的 manifest cohort 分布为 android_only 12、android_smarthome 6、linux_android 13、linux_android_smarthome 5、real100 3、real200 4、real300 6。范围跨 cohort，但可观察阻塞主要仍在 Android GUI。点击未命中、弹窗/焦点转换、来源访问、目标保存不是同一个已证实根因；无需将后续未开始的每项再计为 H3，也不能说模型不会执行未开始的下游环节。

### H2：高层线索有重复，但具体实例路由证据仍窄

新增 GPT `linux_android_smarthome_696` 把原料 tofu 当作食谱名，增加了来源字段语义错配证据；Claude `linux_android_1866` 始终在 android_0 查联系人，而配置源在 android_1，增加了具体手机来源绑定证据。后者还有 Calendar 访问停滞，不把手机选择当作唯一原因。

旧支持包括 Claude C01 的 description→location、GPT 的残留前台内容当来源（`linux_android_1365`）、错误图片/PDF 集合（`a2_gallery_album_to_tasks`）、邮件 profile（`l2_mail_rule_foldering`）、表格列义（`linux_smarthome_796`；Claude `linux_smarthome_932`）等。它们有共同的“对应关系偏离”外观，但发生层级不同。

必须保留以下限制：

- **具体手机实例未恢复**：本机明确证据集中在 Claude 的 3 个任务，旧 `linux_android_smarthome_422/439` 是目标 Tasks 手机，新 `linux_android_1866` 是联系人来源手机。不能用 H2 合计 18 次声称有 18 次跨设备路由错误，更不能据此比较模型倾向。
- **两台 Linux 的源路径误投**：新增 GPT `al2_mail_calc_alarm_sync`、Claude `linux_android_smarthome_941` 均在报错后返回正确 Linux；作为恢复对照，不作持续失败支持。此轮没有新增未恢复的同子类型证据。
- **单 Home 身份替换**：nursery 与普通灯各一个 task_id、各两个 baseline 的旧重复，仅支持 room/appliance 层的有限个例。不能算跨环境路由，也不能凭不同模型视作两个独立任务族。
- **局部正确对照**：Claude `linux_smarthome_576` 正确排除无空调的 nursery；Claude `linux_android_smarthome_696` 正确记录 Stir Fry。它们整体主表仍 FAIL，仅相应局部对应正确。

合并 H2 的 cohort 为 linux_android 4、linux_android_smarthome 4、linux_smarthome 3、real100 1、real300 2、smarthome_generated_scripted 4；语义模板独立性未知。旧 `linux_android_1859` 曾因原生文件证据不足排除，后来 followup 已确认“批准码→approved”的替换映射错误：这里复用后来的窄结论，不把旧文件整体视觉不确定性写成已解决，也不重新打分。

### H3：具体缺项有跨任务支持，“全局验证不足”仍不是被隔离的原因

旧证据覆盖联系人号码未填（C02）、表单与设备状态不一致（C03）、计划漏开机、报告发到错误通道，以及 Shell 文件重定向范围不完整。新增包括 GPT `android_smarthome_147` 设温但未开机、`linux_smarthome_387` 漏模式命令、`linux_android_1080` 尚未写笔记就主动 done；Claude `linux_android_1255` 短信仍在编辑框、`linux_android_1241` 先写 notified 但之后没发短信。

这 12 个支持运行对应 12 个任务；不是同一任务的两模型重复。合并 cohort 为 android_smarthome 2、linux_android 4、linux_android_smarthome 1、linux_smarthome 3、real100 1、real300 1；但旧 7 条全来自 GPT 的定向选例，不能用于模型频率比较。

Claude `linux_android_1255/1241` 分别同时支持 H1 和 H3：前者短信提交缺失独立于后来笔记编辑停滞；后者 audit 已写 notified 与后来 Calendar 阻塞是两项不同观察。不是把一个上游卡住所导致的一切下游缺失重复贴标签。Claude 同题 `linux_smarthome_378` 的完整控制及表单成功（旧 S01）是整体 PASS 对照；只限定可执行性，不构成控制变量实验。

### SYS：可讨论重复的接口恢复问题，其余保留个例

1. **文本输入超时后残片叠加**：旧 GPT `linux_android_1078`，新 GPT `android_smarthome_888`、`linux_android_smarthome_005`、`linux_android_1255`，共 4 个运行、4 个任务。完整后续重试仍未恢复，终局图实际出现不完整重叠文本。CSV 将三个措辞不同的旧/新标签统一到 `android_text_timeout_partial_append_corruption`，原逐条事实不改。此轮该窄现象的失败支持都来自 GPT 使用的 Android 输入路径；不能推断所有模型都如此，不能认定 ADB 并发或模型认知是唯一根因。
2. **空响应/解析失败连续链**：Claude `al2_data_transform_sync`，s10..21 连续空动作解析失败，之后恢复 GUI 交互但未完成 Linux 交付。是一个接口输出个例，不等同于已证实 HTTP 503、断网或模型故意不行动。
3. **邮件收件人序列化残留引号**：GPT `al2_alarm_calc_email` 终局可见多余引号；仅支持 compose 输入串与 GUI 的窄问题。未读历史原生 mailbox，不能声称已确认草稿持久化或发件行为。
4. **请求耗时占用预算**：旧 GPT `linux_android_smarthome_614` 的日志时长支持接口时间占用，无法隔离服务端/网络/生成；保留附录个例。

恢复对照同样存在：GPT `android_smarthome_854`、`linux_android_smarthome_029` 在超时后仍有完整必要内容；Claude `a2l2_meeting_packet_full` 的缺 python-docx 已在历史运行中修复并产出通过的 DOCX，最终失败发生在短信交付。不能把任何报错都算环境失败，更不能把所有 time_limit 归到 SYS。

## 4. 不支持原解释的记录及剩余证据边界

所有 100 条仍在 JSONL，包括 40 条 scoring_question、3 条 uncertain。这不是 43 个已确认误判，不产生 PASS 白名单；有独立缺项的运行即使另有 getter 疑点，仍只用其可证实缺项作支持。例如 GPT `linux_android_1255` 的短信实际已发送，与 getter 的 missing 有疑点，但日志乱码是独立执行问题。

新样本中的其他重要边界：

- 数值/实体表示及备注范围：如 `linux_smarthome_372` 的 63.0/63、Claude `linux_android_1274` 的电话号码格式、多个 Tasks 可见完成备注与 getter 不一致。本轮只简记，不扩展评分审计。
- 文档有读回不等于结构和布局全部正确。GPT `linux_android_1863`、Claude 同题的文字体现来源排除/清除占位符，可能碰到禁止词检查；不自动把原 FAIL 当作语义执行失败，也不确认改分。
- Claude `linux_smarthome_520` 读过 Guide 后重建工作簿，只保留 Sheet1，原辅助表丢失。这是实际结构变化，但是否构成公开交付违约仍有边界，暂不升格为新失败模式。GPT 同题未读完整 Guide，不能因为 instruction 没列标签就断言所有公开材料均无标签义务。
- Claude `a2_gallery_album_to_tasks` 末图的紫色异常缩略图是可见系统替代解释；尚不能证明文件名任务因此无法执行。该运行的来源导航停滞有证据，图像异常的成因与影响仍未隔离。
- 两模型同题未必同因：`linux_android_1255` 中 GPT 已发短信但笔记损坏，Claude 短信未提交且编辑器入口停滞；`linux_android_904` 中旧 GPT 是已知号码未写，新 Claude 是来源访问卡住；不能把任一模型机制移植给另一个。

12 条明确标记 evidence_limited 的范围如下；其中“未查看/未完整核实”不等于文件一定不存在。

| baseline / 抽取序号 | task_id | 具体材料限制与可保留结论 |
| --- | --- | --- |
| GPT #6 | linux_smarthome_372 | 缺本次 DOCX 原生全文读回；仅历史创建反馈与 trace，不用当前复用 cache 补证 |
| GPT #7 | linux_android_smarthome_877 | 未核实终局短信截图/原生短信；登记表有读回，结构未全面检查；“只设 level 是否满足目标”仍有契约边界 |
| GPT #15 | linux_android_1866 | ODT 文字信息有历史读回，原生布局/年份语义未独立审计 |
| GPT #17 | al2_alarm_calc_email | 未读历史 mailbox；可见收件人残留引号成立，完整草稿保存状态不确认 |
| GPT #24；Claude #5 | android_smarthome_766 | 备注截断或省略号后内容未独立看到；不从 input_text 参数补造保存文本 |
| GPT #29 | linux_android_smarthome_113 | DOCX 仅字段存在检查；没有完整原生视觉/结构确认 |
| GPT #32 | a2_alarm_conflict_log | 最后截图是 s48，早于 s49 输入超时；不能把超时前空正文当作超时后终态；闹钟已完成可保留 |
| GPT #44 | a2l2_vscode_web_music_final_gate | 缺明确的失败函数 case 输入/逐例值；页面正例通过不代表负例合同全对，不猜具体代码 bug |
| GPT #45 | android_smarthome_877 | 报告写在子任务标题，未见完整尾部；父任务 note 的匹配范围需另判 |
| GPT #47 | linux_android_1814 | DOCX 逐值存在检查不等于完整结构与视觉检查 |
| Claude #39 | linux_android_1859 | ODT 只存可复用 cache 路径及有限读回，未封存的原生细节不能从当前 cache 补造 |

这 12 条已完成协议要求的有限深度核查，未替换；3 条 uncertain 为 GPT #32/#44、Claude #39。无需因此继续重跑或扩展全量审计。其他记录即便可支持阶段级机制，也未必能确认唯一最早失误或内部根因。

## 5. 正文展示候选及历史素材

完成固定样本后选择下列候选，每个主题一条。它们不是按模型平均分配，不是新增评分裁决。所有路径指本次 selected attempt；完整证据在 JSONL 与 CSV。以下 s 均指 `step_index`，与截图文件编号不同。

### H1 主候选：GPT / al_playlist_from_csv（新 #16）

公开要求将 Linux CSV 三首歌放入 Android 的 Work drive 播放列表。来源已正确读出，之后多次操作音乐菜单、重开应用并再次读源；50 步后仍没有创建目标列表。真实终局是 Add to playlist → New playlist，而不是目标列表已保存。可展示“源 CSV 已读 → 多次创建入口交互 → 终局仍未创建”的三段状态。

- [完整轨迹](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260828_env_helper14_run_01/018_al_playlist_from_csv/trajectory.json>)：s0..49；[终局历史图](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260828_env_helper14_run_01/018_al_playlist_from_csv/artifacts/android_0/screenshots/step_098.png>) 本轮已查看。
- 其他支持：Claude 同题新 #25；两个模型 `android_only_260`；跨 app 的 Claude `android_only_210`、GPT `android_only_285`。同题是重复运行，不是独立任务背景。
- 对照/限制：GPT `linux_android_1289` 导航恢复后确有完整笔记。不能把“重复点击”本身作为失败，也不把本例解释为所有 GUI 坐标错误。

### H2 主候选：GPT / linux_android_smarthome_696（新 #12）

Linux 规则提供 R-5 → required_ingredient=tofu，任务要求再匹配食谱并记录食谱名。GPT 最终把 `Matched recipe: tofu` 写入完成后的原 Task；所需食谱实体为 Stir Fry。任务勾选及部分预约操作已经推进，所以不是完全没找到编辑器，也没有证据说它先正确取得 Stir Fry 后才遗忘。

- [轨迹](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/080_linux_android_smarthome_696/trajectory.json>)：s0..1、12、15 及后续至 s30；[错误实体与完成勾选](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/080_linux_android_smarthome_696/artifacts/android_0/screenshots/step_059.png>) 本轮已查看；只用可见实体，不补造省略尾文。
- 局部正确对照：[Claude 同题 Stir Fry/18:05 备注](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/080_linux_android_smarthome_696/artifacts/android_0/screenshots/step_039.png>)（新 #45，本轮已查看）。整体仍记录 FAIL，不在正文标为新的 PASS。
- 其他支持：旧 Claude C01 description→location；GPT `linux_smarthome_796` Actual 字段错配。手机实例错绑另用 Claude #27/旧 C04 作次级例证，不能与此字段混淆合为一个具体根因。

### H3 主候选：GPT / linux_smarthome_387（新 #41）

页面要求 living cool、study auto，并对不支持的 bedroom eco 拒绝。GPT 正确处理 living，study 却只 turn_on。s5 返回 study 仍 cool；随后仅修正表单并提交 study auto/supported/executed，s9 done。缺失的是具体 `set_mode auto` 动作，实际控制反馈并无阻止它执行的错误。

- [轨迹](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/110_linux_smarthome_387/trajectory.json>)：s0 请求 HTML；s1..2 living；s5 study before/after；s6..8 表单；s9 结束。
- [历史 evaluator 状态](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/110_linux_smarthome_387/evaluator_trace.json>)：表单通过而 Home study.mode=cool。本轮核实的是结构化历史反馈，不声称本轮打开了该运行的网页截图。
- 展示为三列即可：公开请求 auto｜实际命令 turn_on 后 cool｜提交报告 auto/executed。另有旧 C03、GPT `android_smarthome_147` 的即时缺项，以及 Claude #17 `linux_android_1255` 的未发送短信。旧 S01 是对应的完整控制成功对照。

### SYS 主候选（接口边栏或附录）：GPT / linux_android_1255（新 #34）

正确选择 north dispatch Ava Lane 后，s14 短信已实际发送；随后 s22..43 多次文本输入超时，缩短、追加与删除尝试后，s49 日志仍为不完整重叠残片。将“短信已完成”和“日志未恢复”并列，避免以两个 getter 的 FAIL 推断两项都没做。

- [轨迹](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/037_linux_android_1255/trajectory.json>)：s0、11..14、22..49；[已发短信](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/037_linux_android_1255/artifacts/android_0/screenshots/step_025.png>)；[终局残片](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/037_linux_android_1255/artifacts/android_0/screenshots/step_079.png>)。两图本轮已查看。
- 其他支持：新 GPT `android_smarthome_888`、`linux_android_smarthome_005`，旧 GPT `linux_android_1078`。超时后恢复对照为 GPT `android_smarthome_854`、`linux_android_smarthome_029`。
- Claude 同题 s14 [短信仍在输入框](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/037_linux_android_1255/artifacts/android_0/screenshots/step_029.png>) 是不同机制，不把它加入同类文本损坏支持。接口超时底层成因未隔离。

## 6. 对上一轮论文 4.4 草稿的具体修改意见

不覆盖原草稿。本轮建议：

1. **方法段更新范围**：从“七条定向失败与一条成功对照”改为“复用既有定向证据，并对两个 baseline 各固定核查 50 条此前未实质性审阅的记录性失败运行”。同时写明排除已确认完成/已知争议、保留抽中疑点、不估计原因占比；不要把 83 个旧边界条目都说成失败案例。
2. **增加 H1 正文段**：旧 C07 原留附录，现在补充样本在不同任务与 app 阶段有重复，具备正文讨论依据。用列表创建候选替代仅以单个 Recordings 搜索解释整体 GUI 能力。
3. **保留 C01 的窄表述**：“把说明当地点”，不是“正确地点传输时丢失”。正文可选择新食谱实体案例作为更直接的源字段→结果截图对照，C01 继续作其他支持。
4. **保留 C02/C03 的动作—状态证据**，将它们并入具体交付缺项主题；新 387 可展示同题之外的重复。删去或避免“因此证明全局验证/记忆不足”式因果结论。
5. **限定 C04 路由范围**：本机是 Claude 三个任务的具体 Android 实例选择证据，来源/目标阶段不同；两 Linux 错路径在新增样本已恢复，单 Home 灯具误选仍是另一层级。
6. **不把 C05–C06 升成普遍模式**：最高温房间资格筛选有 Claude 局部正确对照；普通灯和 nursery 是各一个任务的跨模型复现，适合作为对象层附录边界。ID 字符误转录、邮件 profile/compose 引号也保留具体个例，不新增一套“大类”。
7. **接口问题独立一小段/附录**：描述文本超时后的不完整恢复，明确本机 GPT 路径范围；空响应、超长 request 和异常缩略图分别说明证据等级，不写成统一“模型协调不足”。
8. **替换案例表 caption**：说明定向案例与固定随机补充来源、正式 selected attempt、局部正确对照非整体 PASS；计数仅为证据覆盖。删除任何“最常见/解释大多数/某模型更容易”的无设计支持表述。

可用正文概括（待跨机器整合后编辑）：

> 固定的补充核查在多个不同任务中观察到三类可区分的执行偏离：局部交互未能推进必要状态，来源信息或目标对象被错误对应，以及已有局部进展后仍缺少必要动作或交付。播放列表案例中来源曲目已正确取得，但反复菜单操作没有形成目标列表；食谱案例中原料字段被写成食谱实体；设备控制案例中报告声明的模式并未成为实际命令。这些观察不意味着共同的内部认知根因：设备选择错误可能恢复，输入超时也可能造成额外损坏，且同一任务在不同模型中可能失败于不同环节。完整记录、恢复反例和有限的历史材料边界因此需要与案例一并呈现。

图表占位建议：正文采用 H1/H2/H3 三个紧凑状态面板；SYS 保留接口边栏或附录。面板只使用第 5 节所列真实截图、原始请求与状态回读，不重绘不存在的 GUI；H3 可以是请求/命令效果/报告三列表，无需伪造截图。这里不制作原因百分比图。

## 7. 交给跨机器汇总时的边界

这是 GPT-5.5 与 Claude Opus 4.8 的本机证据，不是全部 baseline 或全 benchmark 的主要模式排名。50 条是工作预算，不是统计门槛；等额配额不是按失败总量比例抽样；旧定向集合与新随机池不能合算失败占比。不同模型共享任务、不同任务共享 app/模板，均限制独立性解释。

CSV 保留 selected attempt、来源、角色、局部 Case ID、验证方式与具体限制。合并时先按运行键去重，再分别报告 task_id 数和 baseline；`none`、`unresolved`、`success_comparison`、`recovery_counterexample` 不得作为 failure_support。不同子类型的名称可由全局整合再讨论，本机不冻结最终分类。

按 v3 停止条件，本轮四个文件与两组配额均已完成，未追加确认性样本。没有重跑、连接 live 设备、执行历史写入命令、调用新 judge、修改任务/evaluator/正式结果；没有 commit、push 或上传。后续三四个全局重点主题由各机器同标准材料合并后确定。
