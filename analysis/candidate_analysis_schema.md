# Candidate analysis schema（探索性，不冻结）

## 1. 分析单位和判断顺序

单位为 `(model, task_id, selected_attempt)`。选用尝试要先有明确 provenance；基础设施无效尝试与有效模型失败分开。每个 endpoint 再关联其 evaluator，而不是把 evaluator 数视作输出文件数。

先标 `evaluation_validity`：原始有效但未人工复核、已有人工作出的改判、需评估契约复核、记录不足。然后记录终止原因、可观察行为，最后才判断主要失败位置。模型原因不确定时用 `uncertain`，不是用最像的标签补齐分布。

主要原因沿用用户定义：**最早有明确证据、后来未恢复、确实阻断一个或多个必要结果的偏离**。一次点击没有立即改变 UI 不足以定因。先出现模块导入失败、后改为 OOXML 并通过文件条件时，前一错误必须标作 recovered。合法的部分操作（例如先 turn_on）在当时不是错误；如果后续永远不做剩余 setter，最早能确认的遗漏可能直到 done。

## 2. 候选 primary categories

这些是可继续验证的工作定义，不要求本阶段每类都有已确认实例。

| 候选 | 定义与 inclusion | exclusion/边界 | 实例或当前证据状态 |
|---|---|---|---|
| A source_information_acquisition | 必需来源未取得，或把错误 source record/surface 当成所需来源并继续执行 | 正确取值后才损坏归 C；纯目标 GUI 困难归 B；不要把已恢复的搜索困难作为主要原因 | GPT a2_gallery_album_to_tasks、linux_android_1365、linux_android_smarthome_025 |
| B local_execution_manipulation | 正确目标与所需值已确定，但有可定位的操作偏离，目标状态一直未实现 | 单凭预算耗尽/多次点击不够；明知正确值却写错内容更适合 C/F；明确 helper 故障归 I | android_only_260 等显示目标侧停滞，但本轮尚未精确确证首次未恢复偏离，因此保留候选、未强行填 primary |
| C cross_device_information_transfer | 来源端正确值已经有真实记录，目标端实际内容却变错、遗漏或错误变换 | 上游读错归 A；正确值已经到达目标命令参数但 setter 用错归 F；不推断内部记忆机制 | GPT linux_android_904 缺号码；Claude linux_android_1080 的 0/O |
| D device_role_target_binding | 未恢复地绑定错误 concrete endpoint、appliance identity、profile 或交付通道 | 子类型必须分开：同机器 profile 错不能算两台机器混淆；单 Home 设备 ID 替换不能当作 cross-device failure | Claude linux_android_smarthome_422 / 439；GPT l2_mail_rule_foldering；两模型 sh3_explicit_control_plain_light_dimming_infeasible_0013 是单 endpoint 反例 |
| E subgoal_dependency_maintenance | 可证实必需子目标被跳过/当作完成，或 eligibility prerequisite 被丢弃 | 不能因下游未开始就一律贴 E，它可能被上游 A/B 阻断；没有执行所有步骤不等于明确错误规划 | GPT al_camera_web_upload_form、linux_smarthome_378、linux_smarthome_576 |
| F final_output_realization | 已实施的构造产生明确错误内容、格式或 command effect，且不属于更早 A/C/D | 字符串 alias 过窄但公开语义正确应先复核 evaluator；不能凭复用 cache 路径或 fail 推断错误字段 | GPT al_tutorial_screenshot、android_smarthome_357 |
| G persistence_verification | 已有正确暂态内容，明确提交/保存链失效且未恢复，最终内容未持久化 | “没看到 save”不够，可能 autosave；getter missing 不够，它可能是语义不匹配；verification 通常是 secondary | GPT linux_android_1853 是待查候选，不作为已确认 G 频次 |
| H global_completion | 多个 endpoint 的完成判断本身失真，且找不到更早、可确认的 A–G | 大多数 done+fail 是结果信号，不应与 A–G 抢同一 primary；已发现更早具体原因时只作 secondary | 暂建议主要保留为结果/行为轴；GPT linux_android_904 已归 C，不再重复记 H |
| I runtime_environment_related | 明确 timeout/crash/helper/adapter 错误直接阻断必要结果，且没有恢复 | 1800s 耗尽不是充分证据；模型 action envelope 错或自己调用不存在的 CLI 工具不能全部算基础设施失败 | GPT linux_android_1078 的重复输入执行 timeout；无效初始重试另表记录 |

需要额外保留 `evaluation_contract_discrepancy`，但它是 **evaluation_validity 轴**，不是“模型失败”的新增类别。另保留 `source_selection_or_eligibility` 子类型，避免把 nursery 有人但没有 AC 这种 predicate 丢失概括成“reasoning failure”。

## 3. Secondary behavior labels

机器可稳定计数的描述性信号：完全相同 action 至少出现 3 次、完全相同 read command 再次出现、相同 explicit error 再次出现、device-switch 次数/step、done 后 evaluator failed、明确动作 timeout、模型 action envelope 错误。

这些指标只描述外形：重复读可能是合理复核；很多 switch 可能由任务所需；一次 action ok 也可能只有 dispatch 成功。`behavioral_signal_counts.csv` 中的 raw-PASS 对照用于避免把常见正常行为误写为失败原因。

需要逐轨迹确认的信号：wrong-device search、residual context used、unsupported completion claim、local-only verification、accepted action with incomplete effect、corrupted partial text、stagnation、failure to replan。后两项本轮不做全量无监督频率，因为不能用“连续 N 次相同动作”直接代替判断。

每个 recovered event 单独写 step IDs、原错误、恢复动作和恢复后的状态/条件。不把同一操作后来 ok、继续行动或者整任务最后 PASS，自动当成所有中途问题都已恢复。

## 4. Cross-device 专用字段

每条记录可以有多个、彼此独立的 evidence flag：

1. `correct_source_value_not_conveyed`：要有来源端值与目标端值/遗漏的配对证据。
2. `concrete_device_role_mixup`：指定 A1 却在 A0 操作；profile 和单 Home appliance 另计。
3. `required_dependency_predicate_dropped` / `required_downstream_subgoal_omitted`：资格条件丢弃与整段动作遗漏分开。
4. 切换后已知值丢失可记录时间顺序；不使用可观察证据无法证明的“模型遗忘”作原因。
5. `multiple_local_outputs_global_incomplete`：须证明至少两份正向 local outputs 已完成，再证明另一个 required endpoint 不完整；不把 unchanged/no-SMS guard 当作主动产物。
6. `local_failure_blocks_multiple_downstream_stages`：须定位真实依赖边，并确认下游未开始是此前失败造成；零 device actions 只是线索。
7. `last_verification_only_local`：末尾复核只针对局部，而且已有别的 endpoint 未满足的证据；不能因截图只包含最近设备就判定。

未贴 flag = unknown，不是 false。探索性案例数只报告已确证下限，分母列出原始多设备失败数及实际精读覆盖。只有完成同等深度复核后才能报告模型间 prevalence 或“哪种原因更多”。

## 5. 建议保留的 task-level breakdown

主维度用 task.devices：设备类型组合、实际 endpoint 数、实际拓扑、环境类型数。它们覆盖全部 200，直接对应跨设备问题；不同组合的成功率仍混有 surface 与任务内容差异，不支持单独估计“多加设备”的因果影响。

保留原始 task_category 作来源/任务组织维度，原样保留而不重新发明 taxonomy。总 evaluator 数和计分 evaluator 数各列，解释其不是 stage 数或产物数。

difficulty/motif 仅 30 条任务有数据；7–15 条 difficulty subgroup 和 1–10 条 motif subgroup 只能描述，无法泛化全 Core200。workflow_pattern 与 single-output/multi-output 全 NA，不能拿 evaluator 数或 scattered metadata 补造成同等可靠的标签。

主表优先按设备划分。real100/200/300 只作为原始 category/source provenance 的附加维度，不把它们当新的设备类别。

## 6. 不建议直接沿用旧 B1–B3 / D1–D5 互斥分布

原参考是 [MDCBench_failure_analysis_figure_design.md](/Users/lht/home/MDCBench/docs/paperdossier2/MDCBench_failure_analysis_figure_design.md:180)，本轮没有修改它。

旧 B1 source-state acquisition 与 B2 target completion 是位置轴；B3 unrecovered explicit error 是恢复/证据轴，会与两者重叠。缺依赖模块但之后成功产出，与 helper 持续超时，不应同贴一个“有错误”主类。

旧 D1 omitted subgoal、D2 device/destination confusion 可作为具体候选，但要找更早偏离。D3 incorrect final output 不能无视错误源值或错设备这个上游原因。D4 unverified persistence 同时混合“没复核”的行为和“未保存”的结果，需要拆开。D5 incomplete multidevice final state 与 D1/D3/D4 大量重叠，适合 outcome axis，不适合最后的兜底桶。

旧图表列 GPT B 分母 44、Claude 70，D 分母 132、109；它们不对应本轮 raw budget 51/55、done-failed 92/70。没有可审计的同一结果选择口径时，不移植旧数字。

## 7. 本轮值得继续核对的新现象

旧 profile/前一任务页面替代当前 source；接受了 workflow 但缺少目标设备开机/模式变更；Home report 被当作 Android reply；正确字段只在最终输入时 0/O 变形；可读的邮件 section/table 内容被更窄的字符串/同句匹配拒绝；正确回答已进入 Home answer_reports 但 evaluator 不接受其包装字段；正确的不可行报告与否定句被受限语义规则拒绝；相同 workbook FAIL 分别来自真实字段错误或未解释的 preservation 判定；vm_file trace 指向跨运行复用 cache，缺乏逐次历史输出定位。

以上不是统一判定所有失败“其实都成功了”。原始数据保持原样；先用证据判断具体问题是否确实影响该条结果，再确定是否需要复核、补采证据或改变后续所有 baseline 的共同分析口径。
