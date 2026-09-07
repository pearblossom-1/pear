# Core200 主实验执行结果与定性失败分析

整理日期：2026-09-08。本轮依据 [分析要求](../../../docs/plan9/DevicesWorld_execution_failure_analysis_prompt.md)，只读取既有运行；没有重跑、连接设备、修改任务/evaluator、重新评分或上传。

## 1. 输入与采用口径

分析 Kimi K2.6、Doubao-Seed-2.0-Pro、GUI-Owl-1.5-32B-Instruct 各 200 个 Core200 任务，共 **600 个模型—任务 selected attempts**。三组均使用 MDCBench 的 `mdcbench_envelope_v1` 接口，agent_id 分别为相应的 `*-lite`；GUI-Owl 的服务模型名是 `gui-owl`。本报告不把它们解释为另一个 MobileWorld agent framework 的实验。

历史记录均位于 `worker-worktrees/all-task-update-intergration-sync-20260826/runs/`。以下目录相对于该位置：

| 模型 | 主实验目录 | 有效运行选择依据 |
|---|---|---|
| Kimi K2.6 | `kimi-k2.6-lite/core200_20260826` | 初始 `run_01/summary.json`，按已有 corrected revision、基础设施 recovery、post-repair retry 队列顺序采用替代运行 |
| Doubao-Seed-2.0-Pro | `doubao-seed-2.0-pro-lite/core200_20260830` | 恢复运行之后的 `run_01/summary.json` 所指向的正式记录 |
| GUI-Owl-1.5-32B-Instruct | `gui-owl-1.5-32b-instruct-lite/core200_20260905` | `run_01/summary.json` 所指向的正式记录 |

Kimi 最终选取为：原 `run_01` 176 条、`corrected_revision_reruns` 1 条、`recovery_20260829/per_task` 14 条、`post_repair_retry_20260830/per_task` 9 条。依据是既有 [recovery 队列脚本][k-recovery]、[post-repair 队列脚本][k-retry] 及其对应 summary；任务 096 使用其 summary 中保留的最后一次恢复运行。`android_smarthome_357` 使用已有 [directed contract-repair 重测 summary][k-corrected]。后面的指定恢复阶段替代前面的对应任务，不按最高分挑选；重测后仍失败也保留。原始主目录中历史 incomplete/归档尝试不重复计入，也不当作当前仍在运行。Kimi 初始 summary 的 180 completed、41 PASS **不是**这份最终选择视图的结果。

本机相关 docs、runs、分析文件名检索中，未找到适用于这三组主实验的已生效重新评分/裁决表；不套用其他模型或旧实验的分析。因此每行 `adopted_result/score` 等于 **被选中运行**的 `result.json` 原始自动结果；这不表示全部结果已经人工审计。本轮发现的疑点仅在第 6 节说明，没有 FAIL→PASS 改判。已成功的记录仅可作为成功对照，不作为失败案例。

600 条均具有 `result.json`、历史 `config/task.json`、`config/materialized_task.json`、`trajectory.json` 和 `evaluator_trace.json`；结果与其 selected summary 的 success、score 一致。CSV 中保留具体运行、任务快照、summary、metadata 和结果来源路径，字段缺失与 FAIL 不混淆。这里的“有效”表示选定正式尝试完成并产生结果，不等于任务成功或评分已经审计。

## 2. 全量主实验结果

所有均值、中位数以每模型全部 200 条 selected attempts 为统计集合，不只统计成功任务。原始与采用口径一致，因此不另列重复的两套分数。

| 模型 | 总数 / 有效运行 | PASS | FAIL | 成功率 | mean score |
|---|---:|---:|---:|---:|---:|
| Kimi K2.6 | 200 / 200 | 43 | 157 | 21.5% | 0.4571 |
| Doubao-Seed-2.0-Pro | 200 / 200 | 46 | 154 | 23.0% | 0.4513 |
| GUI-Owl-1.5-32B-Instruct | 200 / 200 | 20 | 180 | 10.0% | 0.2903 |

| 模型 | 平均步数 | 步数中位数 | 平均时长（秒） | 时长中位数（秒） |
|---|---:|---:|---:|---:|
| Kimi K2.6 | 19.590 | 19 | 1215.557 | 1770.127 |
| Doubao-Seed-2.0-Pro | 27.985 | 32 | 1169.722 | 1473.066 |
| GUI-Owl-1.5-32B-Instruct | 40.415 | 50 | 421.759 | 382.955 |

时长来自 `result.duration_s`，不是纯推理延迟或全实验起止时间差。例如 C02 的 timings 将环境启动、setup/reset、模型请求、环境动作、evaluation、cleanup/close 一并计入 total。日志使用阻塞调用之间的 cooperative 时间限制，因此记录时长可能超过 1800 秒；不据此自行改写终止原因。

| 模型 | `done` | `max_steps` | `time_limit` | 其他 / unknown |
|---|---:|---:|---:|---:|
| Kimi K2.6 | 96 | 5 | 99 | 0 |
| Doubao-Seed-2.0-Pro | 83 | 50 | 67 | 0 |
| GUI-Owl-1.5-32B-Instruct | 44 | 154 | 2 | 0 |

以上直接采用记录中的 `termination_reason`，**不是失败机制分布**。`max_steps` 记录的步数均为 50。`done` 不保证成功；`time_limit` 也不必然失败：Doubao 的 `l2_vscode_settings_update` 记录为 38 步、`time_limit`，但既有结果为 PASS，本轮保留。GUI-Owl 的时长较短而步数更多，不能因此解释为能力更强；Kimi 的时间限制记录也不能全部解释成重复操作。

## 3. 有依据的任务分组

分组来自每条 selected attempt 的历史 **`task.devices`**，不从 task_id 猜测，也未新造难度、阶段数或依赖深度标签。三组模型的分组任务集合一致。类型组合去重后每任务仅属于一个组；实例数量另行统计。`home` 表示 SmartHome 环境，不是环境中的家电数量。

下表各模型单元格为“成功数 / 成功率 / mean score”；N 是该模型在该组的任务数。

| 设备类型组合 | N（每模型） | Kimi | Doubao | GUI-Owl |
|---|---:|---:|---:|---:|
| Android | 20 | 0 / 0.0% / 0.1542 | 1 / 5.0% / 0.2042 | 0 / 0.0% / 0.1542 |
| Android + Home | 25 | 3 / 12.0% / 0.5200 | 2 / 8.0% / 0.4600 | 0 / 0.0% / 0.4133 |
| Android + Home + Linux | 30 | 1 / 3.3% / 0.4833 | 1 / 3.3% / 0.4028 | 1 / 3.3% / 0.2583 |
| Android + Linux | 67 | 13 / 19.4% / 0.3269 | 13 / 19.4% / 0.3127 | 3 / 4.5% / 0.1585 |
| Home | 10 | 6 / 60.0% / 0.7000 | 5 / 50.0% / 0.7000 | 5 / 50.0% / 0.7000 |
| Home + Linux | 30 | 10 / 33.3% / 0.6867 | 13 / 43.3% / 0.7183 | 6 / 20.0% / 0.4150 |
| Linux | 18 | 10 / 55.6% / 0.6296 | 11 / 61.1% / 0.7269 | 5 / 27.8% / 0.3796 |

| 实际设备实例数 | N（每模型） | Kimi：成功数 / 成功率 / 均分 | Doubao：成功数 / 成功率 / 均分 | GUI-Owl：成功数 / 成功率 / 均分 |
|---|---:|---:|---:|---:|
| 1 | 10 | 6 / 60.0% / 0.7000 | 5 / 50.0% / 0.7000 | 5 / 50.0% / 0.7000 |
| 2 | 95 | 28 / 29.5% / 0.4756 | 34 / 35.8% / 0.5146 | 13 / 13.7% / 0.3109 |
| 3 | 66 | 6 / 9.1% / 0.4215 | 6 / 9.1% / 0.4008 | 1 / 1.5% / 0.2316 |
| 4 | 29 | 3 / 10.3% / 0.3937 | 1 / 3.4% / 0.2730 | 1 / 3.4% / 0.2155 |

可描述的现象是：本次 Android-only 类型组的三模型成功数为 0、1、0，而 Home-only 组为 6、5、5；两组分别只有 20 和 10 个任务，任务内容并非受控配对，不能推断加入 Android 导致失败。单实例组恰好都是 Home，实例数和内容构成混杂。Kimi 在 4 实例组的 10.3% 也略高于 3 实例组的 9.1%，不能强写单调难度曲线。

正 partial score 不代表完成了相同数量的独立阶段。C02 的 0.75 包括保持近似歌单不变、不创建 schedule、不创建 workflow 三项约束，而实际要求创建的 Tasks 条目仍缺失。

## 4. 同任务配对与可比性边界

逐对直接比较历史 task JSON 的 `instruction/devices/setup/evaluation/cleanup` 语义内容（对象键排序后比较，不生成 hash）：三对均为 **200/200 一致**，没有悄悄删除不同任务。配对表只是既有自动评分层的确定结果交叉表。

| A / B | N | 都 PASS | 仅 A PASS | 仅 B PASS | 都 FAIL | 解释层级 |
|---|---:|---:|---:|---:|---:|---|
| Doubao / GUI-Owl | 200 | 20 | 26 | 0 | 154 | 同任务快照、同记录启动 commit 的描述性对照 |
| Kimi / Doubao | 200 | 35 | 8 | 11 | 146 | 保留的条件性对照，不作为协议统一的正式排名 |
| Kimi / GUI-Owl | 200 | 18 | 25 | 2 | 155 | 保留的条件性对照，不作为协议统一的正式排名 |

具体限制：Kimi 的 experiment metadata 记录启动 commit `1e053e2cf7955b4a2c4aafbe5136ea918276eaec`，后两者为 `7348e006ce2a72ef39e134d3c1042de35ae11148`。Kimi metadata 明确记录了用户批准的 temperature=1（端点拒绝其他值），不能冒充与其他模型相同的 temperature=0。启动 commit 不能证明后续所有重试的 runtime 和未提交状态完全相同；CSV 因此称它为 `recorded_launch_commit`。任务 JSON 中相同的外部附件引用也不能证明当时附件字节完全相同。此处不主张已经完成严格的全部环境/评分实现版本一致性审计。

## 5. 案例范围与有证据的机制

本机未找到可直接复用的本组三模型既有 case notes/已确认归因表；复用的是原始轨迹、截图、任务快照和结果，而不是旧 AI 结论。先以结构化结果定位候选，再核对全段动作、反馈、最后状态及必要截图，防止将已经恢复的局部错误解释为最终失败。

形成 **5 条失败案例（C01–C05）和 1 条成功对照（S01）**，其中 C01–C04 为正文候选，C05 为附录候选。另对 8 条候选进行定向排除核查（其中 X08 的动作序列也完整检查），不宣称所有候选的每张截图均被精读。入选 6 条运行均核对完整动作/反馈和适用的最终 native state；Android 案例另实际查看关键历史截图。这是 AI 辅助定性分析，不是独立人工标注，也没有标注一致性统计。

| 可观察机制，不是互斥分类 | 轨迹支持 | 能支持与不能支持的解释 |
|---|---|---|
| 局部 GUI 操作未推进必要状态，上游获取阻断后续 | C01 GUI-Owl 日历；C03 Doubao 文件目录 | 重复/变换点击后仍未进入所需内容或形成交付；不等于模型不会执行尚未开始的下游任务 |
| 约束判断没有落成要求的记录 | C02 Kimi 歌单结果 Tasks | 有识别目标与禁止替代的直接输出，但条目始终缺失；并非要求它在不可行时强行创建 Home automation |
| 动作受理不等于因果前置条件完整 | C04 GUI-Owl 定时净化器，S01 Kimi 同任务对照 | 排程成功写入却遗漏关机设备的开机动作；不是“必须使用 workflow”或“必须 advance time”的路径限定 |
| 同一 Home 中将目标替换成另一个支持动作的家电 | C05 GUI-Owl 普通灯/可调光灯 | 实际调暗了另一个 appliance；不是跨设备实例路由错误，不据一个名称映射案例推断普遍实体理解缺陷 |

图表与正文建议见 [4.4 草稿](section4_4_draft.md)，完整证据见 [案例记录](failure_cases.md)。正文使用前三种机制；第四种保留为附录局部观察。对局部 GUI 停滞，目前证据不足以独立分离坐标定位、输入映射、应用交互和模型策略各自的贡献，不能一概写成纯模型推理缺陷。

## 6. 排除项与偶然评分疑点

以下运行仍保留在 200 条分母和原始自动结果中；“不采用为案例”不是改判。这里只记录事实和疑点，不启动评分审计。

| 编号 | 模型 / task_id | 定向核对后不采用的原因 |
|---|---|---|
| X01 | Kimi / `linux_only_295` | 归档存在，CSV 写出 7 行；自动检查期望 5 行。公开要求与明细粒度是否必须恰好一致不清楚，不以行数断言真实失败。 |
| X02 | Doubao / `linux_android_1858` | 已有冲突与状态文件回读；失败项涉及 blocked 等表述匹配。没有独立证据将同义状态表达写成能力失败。 |
| X03 | Kimi / `linux_android_1314` | 拷贝校验最终为 MATCH；ZIP 内 `files/` 前缀是否违反明确要求有疑点，手机还出现其他 release 标识。已恢复的 shell 校验错误不作为原因。 |
| X04 | Doubao / `linux_only_305` | 失败涉及图像文字/OCR 检查；当时产物指向复用 cache，未取得独立保存的历史图片。不使用当前 cache 文件冒充原图。 |
| X05 | Kimi / `a2_missing_media_status` | 历史截图已显示状态 note 和文件名/来源；缺失状态关系如何表达存在疑点，且 Markor 可能自动保存，不能凭未点击保存断言未交付。 |
| X06 | Kimi / `a2l_osmand_calc_visit` | 最后 Calc 截图已经出现地点、坐标、日期与时间行；自动检查与坐标/时间格式别名有疑点，不当作缺行或未保存。 |
| X07 | Doubao / `android_smarthome_149` | 末段短信截图出现已发送气泡及勾选状态。早期重复发送点击与解析错误已出现恢复证据，不能称为最终“短信未发送”。 |
| X08 | Kimi / `android_smarthome_409` | 48 步中源文件导航受阻且没有 Home 操作；最后历史截图仅见文件列表。未取得该次 CSV 正文的独立历史副本和结果 note 原文，因此不从 evaluator 的 expected 反推用户原始请求，暂不作为完整失败案例。 |

对应运行、检查事件与图片入口列于 [案例记录的排除项](failure_cases.md#排除项证据入口)。这些不是已批准的裁决；尤其 X05–X07 不进行新增“改分”。

## 7. 限制、复核与交付

本轮不能支持失败原因占比、覆盖全体失败的互斥 taxonomy、各模型发生某机制的频率比较，或“主要瓶颈/最常见问题”结论。没有关联版本明确的 Diagnostic 独立阶段结果，因此不估计 composition gap，不将未开始的下游操作写成独立能力失败。案例启发的状态推进检查、实体确认与前置条件检查仍只是待验证改进方向。

已有案例足以支持有限的 4.4 正文，无须扩大到所有剩余失败。若以后要论证“信息已正确获得但跨设备传错”，还需要有明确上游读值/使用证据和下游错误值的另一条轨迹；本轮不以“正确值出现在截图”代替这一证据。这里不是新增必做的实验清单。

交付：[全量 CSV](execution_results.csv)、本报告、[案例证据](failure_cases.md)、[4.4 草稿与图表占位](section4_4_draft.md)。CSV 经表格工作簿值往返校验后导出为纯 CSV；独立解析验证 600 行、模型内 task_id 唯一、每模型 200 条、来源路径闭合、统计与直接 result.json 聚合一致。辅助脚本和汇总 JSON 在 `_support/`，仅便于复核分析，不是新的 benchmark 代码。没有改写原始分数、日志或历史裁决。

[k-recovery]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/recovery_20260829/run_recovery_queue.sh
[k-retry]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/post_repair_retry_20260830/run_retry_queue.sh
[k-corrected]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/corrected_revision_reruns/136_android_smarthome_357/summary.json
