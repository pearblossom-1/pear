# DevicesWorld 主实验诊断：Phase 1

范围：更新后 Core200，GPT-5.5 与 Claude Opus 4.8。本报告是探索性分析记录，不是论文结论，也没有改变正式 failure taxonomy、任务或实验分数。

发布说明：本目录仅上传 Phase 1 要求的 7 个交付文件。文中其余本地证据、辅助表格、脚本及原始执行日志未随本次发布上传；相关本地路径保留作溯源，不能直接在 GitHub 打开。

**完成度说明：量化覆盖完整；逐失败轨迹的独立因果精读尚未完成。** 已为全部 268 条原始失败建立带 source/trajectory/evaluator 引用的记录，目前 70 条完成针对性因果/评估契约精读（GPT 41、Claude 29），198 条只完成完整文本机器索引。后者均保留 uncertain。本报告不能代替用户要求的全量逐步因果审核，不能用下面的案例数估计完整 taxonomy 分布。准确逐条状态见 [causal_review_status.csv](/Users/lht/home/MDCBench/analysis_phase1/causal_review_status.csv)。

## 1. Data coverage and quality

400 条有效结果覆盖每模型全部 200 task_id。每条均有 result、trajectory、execution_history、原始与 materialized task snapshot、evaluator_trace 和执行配置。共读取 8,289 个 step、54,235 行生命周期事件；在 step 引用范围内没有缺失截图/UI 文件。完整路径和缺失字段见 [data_inventory.md](data_inventory.md)。

两模型对应的冻结任务 JSON 全部一致，但当前工作树已有 14 份任务发生后续变更，分析不能回头用当前 evaluation 解释旧结果。JSON 一致也不保证初始 GUI、残留文件、源资产副本及 runtime 状态完全相同。

GPT 用 183 条原始有效结果与 17 条已记录的基础设施/进程失败补跑；Claude 按有效汇总使用 85 条原始结果与 115 条重试。没有择优挑分。历史 503/API/setup 无效尝试不混入最终模型失败。

关键限制有四项：部分 getter 只返回 `missing/fail`；嵌套规则没有逐项判定；源资产不全有逐运行副本；vm_file 的 actual 常为复用 cache 路径。56 种 cache 路径中 49 种跨运行复用，涉及 129 次 evaluator 引用，**今天的同名文件不能作为当时结果**。本轮没有重新执行 getter 或读取 live 设备状态来“补造”历史证据。

## 2. Overall GPT-5.5 / Claude results

| 指标 | GPT-5.5 | Claude Opus 4.8 |
|---|---:|---:|
| 原始 PASS | 57/200（28.50%） | 75/200（37.50%） |
| 已有人工复核口径 | 58/200（29.00%） | 75/200（37.50%） |
| 原始 mean partial score | 0.5341 | 0.5845 |
| 平均 / 中位 steps | 21.000 / 13 | 20.445 / 14 |
| 平均 / 中位 duration (s) | 744.23 / 600.30 | 613.82 / 382.45 |
| 步数耗尽 / 时间耗尽 | 35 / 16 | 32 / 23 |
| done 后原始评估失败 | 92 | 70 |
| 原始失败中正的 partial score | 93/143（65.03%） | 79/125（63.20%） |

GPT 的 58 来自已有的 `linux_android_smarthome_288` 人工改判，不是原始 JSON 直接算出的数字。本轮未新增改判。所有表格均同时保存 raw 与 adopted，避免 57/58 混用。

严格 PASS 是每个必要顶层条件同时成立，不是“模型能否做某一局部操作”的比例。partial score 也不是 stage success rate，因为条件粒度不同，且包含 no-SMS/no-change 等保持约束。完整计算与每个 subgroup 的 N/PASS/rate/mean score 在 [quantitative_overview.md](quantitative_overview.md) 和 [quantitative_tables.csv](quantitative_tables.csv)。

## 3. Task-level breakdowns

设备组合是主要维度：Linux-only 实际组合（包括 real 系列中的 Linux-only）为 18 个任务，GPT 14/18、Claude 15/18；Android-only 实际组合为 20 个，两者均 3/20。三环境 Android+Linux+Home 共 30 个，GPT 6/30、Claude 11/30。

按实际 endpoint 数，4-device 组两者都为 6/29；2-device 组为 36/95 与 50/95，3-device 组为 11/66 与 15/66。因此不支持“设备越多成功率一定严格递减”，也不能把设备数与 surface 难度混杂的分组差异当作因果效应。

category 覆盖 190/200；difficulty 与 motif 只覆盖 30/200。workflow_pattern、single-output/multi-output 没有统一历史字段，填 NA。不能以 evaluator 个数代替输出或 stage 数。保留现有 category 字符串作为附加来源维度，不把 real100/200/300 当设备分类。

## 4. Major trajectory patterns

以下每例的完整步骤、expected/actual、所处阶段、首次可确认 step 和 confidence 均在 [trajectory_annotations.jsonl](trajectory_annotations.jsonl)。`sN` 是零基 trajectory.step_index。

### 4.1 上游值正确，目标字段仍会丢失或变形

GPT `linux_android_904`：s0/s23 CSV 和 policy 给出 Mira Patel 的 `+1555011881`，s26 仍明确提到这个号码。但 s28–31 只填姓名，s33 保存后的真实 UI 显示 `Add phone number`。两份 Linux handoff 条件已通过，最终联系人条件失败。这里有来源与目标的直接配对证据，不是笼统“记忆不好”。

Claude `linux_android_1080`：s0/s12 来源是 `NX08091`，s22 备用写入命令也仍正确；s29 实际 input_text 写成 `NXO8091`，s30/s31 的 UI 保留该值。前一串数字零变成字母 O。号码冲突的业务判断正确、no-SMS 条件通过，并不保证全部关联字段正确传递。

### 4.2 错 source 与错 transfer 不能混为一类

GPT `a2_gallery_album_to_tasks` 最终在第二手机正确创建了三条 incomplete tasks，但标题来自 Files/Incoming receipts 中的 PDF，而不是题目 Gallery/Receipts 中的图片。创建能力存在，来源集合选错。

GPT `linux_android_1365` 在 reset 后看见上一任务 Markor 页面，直接把其中 `current handoff contact` 当成当前 Contacts 的可用角色。实际 setup 指定 Rina Patel / safety_observer。这里证明旧页面被用于当前答案，但**不能据此声称 Contacts 底层数据一定没有配置好**。

### 4.3 正确局部完成之后仍会去错手机

Claude `linux_android_smarthome_439` 在第二手机取得 humidity 文件，s20 完成 Home workflow；s21–49 却在第一手机空 Tasks 列表找 follow-up。目标 task 由 setup 放在第二手机。`linux_android_smarthome_422` 也在完成调度后 s46 转去错误手机。前段 source 导航困难已经恢复，不能把它们当最早不可恢复的 source failure。

同类边界反例：两模型的 `sh3_explicit_control_plain_light_dimming_infeasible_0013` 改了相似的 dimmable_light，而不是被指定的普通 light 1。这是具体 appliance 绑定错误，但该任务只有一个 runtime endpoint，不应计入跨设备混淆率。

### 4.4 已接受动作与正确最终效果不同

GPT `al_tutorial_screenshot` 的 s4 脚本仅重定向最后一个子命令，真实 stdout 读回证明 evidence.txt 不完整。源命令已取得，错误在目标脚本实现。

GPT `android_smarthome_357` 的 workflow 将 heater 目标温度设为 23，却没有打开初始为 off 的 heater；调度被接受仍不具备完整的 on/23 效果。灯的 `turn_on(brightness_pct=48)` 是受支持的，不能误判为灯亮度没有设置。来源值正确，问题在完整状态实现，故归 F，不归 C。

GPT `linux_smarthome_378` 只 turn_on AC，feedback 仍是 auto/24；之后只提交 Linux 表单中的 cool/21，并结束。页面描述与 Home 真实状态分离。这里 turn_on 是合法部分步骤，不能将该步本身当作错误，s6 done 才使遗漏成为明确终止偏离。

### 4.5 不能用第一处报错当主要失败

GPT `linux_android_904` 的 python-docx 缺失被 s8 OOXML 路线恢复，文件条件通过；最终失败是 Contacts 号码遗漏。GPT `linux_android_1368` 早期操作第二手机，但 s5 改回第一手机，故不能以最早 wrong-phone 作为未恢复原因。

全量数据中，GPT 12 条原始 PASS、Claude 16 条原始 PASS 也出现 explicit feedback error。反过来，GPT 83 条原始失败、Claude 43 条原始失败没有这类显式错误。

## 5. Candidate failure taxonomy

建议将 `evaluation_validity`、终止原因、primary failure、secondary behavior、cross-device evidence 五个轴分开。A–I 的具体定义、边界、例子及不推荐沿用的旧 B1–B3 / D1–D5 用法见 [candidate_analysis_schema.md](candidate_analysis_schema.md)。

当前 focused review 中提出具体 model primary 的有 22 条，另 1 条是已有人工复核通过；245 条仍为 uncertain，其中包括 47 条已精读但因历史证据/评估契约/首次偏离无法定因的记录，另 198 条尚待因果精读。**这些数是审阅覆盖，不是总体原因占比。** 本轮不绘制一个凑满 100% 的 failure taxonomy 图。

B 的预算内目标 GUI 停滞、G 的保存候选仍需进一步确证首次未恢复步骤。H/global incomplete 通常是结果轴，不宜与更早的 A/C/D/F 争抢同一个 primary。

## 6. Cross-device-specific phenomena

原始多设备失败分母为 GPT 137、Claude 119。以下只计当前有完整针对性证据链的案例，是下限，不是可比较的 prevalence：

| 现象 | GPT 确证数 | Claude 确证数 | 解释 |
|---|---:|---:|---|
| 正确 source 值未正确到达 target | 1 | 1 | 904 缺号码；1080 批准码 0/O |
| concrete runtime-device role 混淆 | 0 个已确证 | 2 | Claude 422/439；0 不代表没有 |
| 明确必要子目标未执行/被当作完成 | 5 | 未形成下限 | GPT 023、185、378、576、656 |
| prerequisite eligibility 被丢弃 | 1 | 未形成下限 | GPT 576 选没有 AC 的 nursery |
| 多份 local outputs 完成但 global 不完整 | 2 | 未形成下限 | GPT 904、357；不把 no-change 条件算主动输出 |
| 末尾只查局部而遗漏已知其他端点 | 3 | 未形成下限 | GPT 904、378、656 |
| local failure 阻断多个 downstream stages | 尚未全量确证 | 尚未全量确证 | device action 缺失不能单独证明依赖关系 |
| switch 引发内部遗忘 | 不作此心理归因 | 不作此心理归因 | 可记可观察值变化和切换顺序，不能证明内部机制 |

还观察到错误 profile、把 Home report 当 SMS 回复等不同 target-binding 子类型。将它们加总后宣称全是“多设备 coordination failure”会夸大研究问题。`confirmed_cross_device_phenomena` 没有标签的记录状态是 unknown，不是 negative。

## 7. Differences between GPT-5.5 and Claude

原始配对结果：49 两者通过、117 两者失败、26 仅 Claude 通过、8 仅 GPT 通过。已有复核口径为 49/116/26/9。Claude 整体更多通过，但不是处处占优。

Claude budget exhaustion 为 55，高于 GPT 的 51，同时 done-failed 为 70，低于 GPT 的 92。该形状说明终止模式不同，不能仅从“更少提前结束”推导更好的整体规划。82/125 Claude 原始失败出现 explicit feedback error，对比 GPT 60/143；其中不少是 action envelope，而不是设备基础设施错误。

另一项需保留的实验条件差异：全部有效运行中 GPT 有 17 条发生明确 Android action/ADB 输入 timeout，Claude 只有 1 条 Linux CLI timeout。GPT 其中 16 条原始失败、1 条原始 PASS，原始失败中还包括后来人工复核 PASS 的 288。**不能把 17 条全部剔除或全部归 I**，但也不能在模型比较中忽略执行层暴露差异。

source acquisition、local execution、role error、transfer error 的总体频率目前不能可靠比较，因为因果精读覆盖不对称。单次任务集合中观察到的差异不支持模型 architecture 的解释。

## 8. Ambiguous / difficult-to-label cases

`a2l_osmand_calc_visit`：自然表示的坐标和预约时间与公开需求相符，而有限 aliases 的 workbook evaluator 判零。需要核对历史输出与实际 normalization，不直接判“信息没传过去”。

`linux_only_283`：两个模型都生成了发给 maintainer 的 plain-text 草稿，只报告失败测试。getter 的 same-clause fail/test 关系不接受“failed tests”标题下单独列测试名的写法。`missing` 不代表 .eml 不存在，需对公开要求与段落语义评分做复核。

`sh1_state_inquiry_bathroom_humidity_feasible_0001`：两个模型都记录了正确 49.3%，API 接受 answer object，原始评分仍为 0.5。当前 evaluator 只读取特定字段而不抽取任意 text，说明 API 接受范围与评分序列化格式不同。需要核对模型可见动作说明和运行时版本，再决定是否属于公开格式契约问题。

`linux_android_smarthome_271`：Claude 的 20:30 符合来源相对时间规则，而冻结 Home expected 是 21:00，既有修订记录也说明这个冲突。该条没有被本轮偷偷改判。

`linux_android_1853`：compose 已填写，但无显式 save；仍不能单凭此认定 G，因为可能 autosave，getter missing 也可能来自内容/位置条件。需要候选 draft 与排除理由。

Calendar 搜索出现重复条目、Markor 可见正确文字但 getter fail、SMS 已见发送气泡但 getter missing，都要区分对象不存在、未持久化、重复身份、语义匹配和历史运行时间窗，不能用一个总标签覆盖。

补充的两类反例尤其重要：

- 正确不可行报告仍失败：两模型在 `android_smarthome_231/219/233` 分别准确报告缺少 nursery air monitor、不支持变蓝、缺少 kitchen aroma diffuser，且 Home 不变条件通过；报告条件仍为 0。`sh4_time_schedule_missing_balcony_light_infeasible_0014` 等也存在正确否定句未被接纳的疑点。这些不是本轮新增 PASS，而是需要所有 baseline 统一裁决的评估口径问题。
- 相同 workbook FAIL 不代表相同原因：`linux_smarthome_932` 中 GPT 按公开 guide 写出的四格值与 expected 完全一致，Claude 则没读 guide，把 Decision/Final 填成 `no repair`/`65`。前者需追查 artifact/preservation，后者有明确输出字段错误。`linux_smarthome_851` 的 Claude 也有所有目标 cell 读回值一致却总评失败的情况。

因此不能把保留模板的 XLSX 失败一概解释为不会编辑表格。本集合每模型有 19 个 `preserve_from` XLSX 条件，均为 4 PASS / 15 FAIL，并非该 evaluator 家族全部不可用；要逐条区分内容差异和未记录的 preservation 子判定。

`android_only_267` 的完整 50 步在两模型都表现为 Files 导航停滞，短信阶段未开始。Claude s32 的实际截图已显示两份录音，后来继续找指定 Recordings 目录直至预算结束；GPT 在多个目录间反复。无法可靠选出同一条最早未恢复偏离，故保留 uncertain，不能把最终未发短信自动解释成遗忘子目标。

## 9. Recommended analysis schema for all baselines

保留相同的 200-task attempt selection 口径，以及原始和人工复核两套结果。复核必须针对同一输出契约应用到所有模型，不能仅对某模型放宽。

采用本目录统一 task CSV 和逐失败 annotation 字段。每条具体 primary 必须带 first step、来源证据、目标证据、恢复判定、下游影响和 confidence；无法确定 first step 时保持 null/uncertain。

后续精读先完成 remaining 198，再在同等覆盖下比较 prevalence。分别保留“已精读但无法判断”和“尚未完成因果精读”，不能混成一个貌似完成的标签桶。无需设计新的 runtime、hash 清单或迁移框架。

若后续实验原有日志接口允许，最有价值的补充是随运行保存 evaluator 实际候选记录/输出字节、逐规则失败原因和模型可见输入摘要，而非仅记一个可被下次运行覆盖的 cache 路径。这是对已观察到证据缺口的建议，本轮没有修改记录方式或重跑实验。

## 10. Questions that require checking other baselines

需要在更新后同一 Core200 上检查：其他模型是否也受 source 残留页面影响；是否也存在正确 source 到 target 的标识符变形；同一规格是否普遍产生“GUI 已有/报告正确而 getter missing”的情况；是否出现类似 concrete phone role 混淆；Android 中途输入 timeout 是否依赖运行设备/批次；较低 strict PASS 是否主要来自单端点剩余条件，而非全部局部操作失败。

这些是待验证问题，不从本机两个 baseline 外推到 Gemini、UFO3 或其他模型。旧版 Gemini 不并入本阶段证据。

## 交付资料

[数据清单](data_inventory.md) · [400 条结果表](task_level_results.csv) · [量化说明](quantitative_overview.md) · [量化数据](quantitative_tables.csv) · [268 条原始失败证据记录](trajectory_annotations.jsonl) · [候选 schema](candidate_analysis_schema.md)
