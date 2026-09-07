# Failure Analysis

口径说明（非正文）：主实验保持裁决前结果，补充评分裁决不计入主表。以下七条失败在原自动评测和裁决前主表中均为 FAIL，成功对照均为 PASS；定性结论依据执行轨迹，不以补充裁决为依据。完整统计及 GPT 58/200 与原自动 57/200 的历史差别见 [execution_analysis.md](execution_analysis.md)。

我们对 GPT-5.5 与 Claude Opus 4.8 的七条失败轨迹进行定性复核，并检查一条同任务成功对照。案例来自各模型正式选定的主实验运行，结合动作反馈、历史截图和最终状态核实，不估计全体错误比例，也不将局部得分等同于独立阶段成功。

来源字段的含义可能在获取时就被误认。Claude 在 al_calendar_schedule_conflict（C01）中找到日历搜索结果，却将卡片中的说明文字当作地点，写入 Linux 日程表和变更日志。保存后回读确认错误同时存在于两个产物中。早期导航问题已通过搜索恢复，未恢复的是字段识别；不能将此例描述为正确地点在传输中丢失。

另一种偏离发生在信息已被明确识别之后。GPT 在 linux_android_904（C02）中读取获批记录，并明确复述协调人的正确号码。但进入第二台手机的联系人表单后，只填写姓名并保存，终局页面仍显示“Add phone number”。两份 Linux 交接产物已通过对应检查，因此本例说明局部交付不能保证来源信息完整落入所有必要目标，而非证明内部记忆失效。

记录正确也不代表环境效果已经实现。GPT 在 linux_smarthome_378（C03）中提交了制冷、21℃的网页选择，却仅对空调执行开机。实际反馈及终局状态仍为自动模式、24℃，后续没有补设。Claude 的同题对照（S01）依次执行开机、设置模式与温度，再提交表单，限定了“这项任务只需报告”的解释；但两次运行的背景状态并非完全相同，不能据此隔离模型差异的原因。

后续目标还可能与具体设备实例脱离。Claude 在 linux_android_smarthome_439（C04）中已成功安排加湿流程，却在第一台手机持续寻找 follow-up。第二台手机的初始截图实际显示该待办；后半段一直修改第一台手机的搜索和列表，直到步数耗尽，既有待办没有完成。这是目标定位未恢复，不是调度接口失败。附录的单 Home 灯具误选（C06）则发生在 appliance 层，不能混作跨设备实例混淆。

这些案例提示，来源字段、目标实例以及报告和实际效果需要分别保持对应关系。相关改进仍须对照实验验证；局部 GUI 停滞等其他问题也确实存在，不能以协调不足统摄所有失败。

## 图表占位：紧凑案例表（正文候选）

| 机制 | 模型 / 任务 / Case | 关键证据 | 下游结果 |
| --- | --- | --- | --- |
| 来源字段误绑定 | Claude / al_calendar_schedule_conflict / C01 | 日历说明文本 → 保存后的 location | 日程与变更日志均含错误地点 |
| 已知信息落地遗漏 | GPT / linux_android_904 / C02 | 明确复述号码 → 联系人 Add phone number | 联系人必要字段缺失 |
| 记录与实际效果脱节 | GPT / linux_smarthome_378 / C03 | 网页提交 cool/21；Home 实际 auto/24 | 设备目标没有实现 |
| 具体设备绑定未恢复 | Claude / linux_android_smarthome_439 / C04 | 第二手机初始有待办；第一手机持续空搜索 | 调度成功但 follow-up 未完成 |

Caption（建议）：正式主实验中的四条定向选取轨迹。表内并列公开要求、实际动作效果与未完成结果，展示不同层面的执行偏离；不是失败原因频率或覆盖所有模型的互斥分类。完整轨迹、恢复情况及成功对照见附录。

候选素材均为已查看的真实历史截图／已读取的状态回读，不重新绘制界面。制表时可精简文字，保留 Case ID；如后续改成截图 panels，按下列原素材取证：

- C01：[trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/trajectory.json>) :: step_index=0 :: info.stdout；[artifacts/android_0/screenshots/step_011.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/artifacts/android_0/screenshots/step_011.png>) :: s5 后截图，已查看；[trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/trajectory.json>) :: step_index=7 :: info.stdout; step_index=8。
- C02：[trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/trajectory.json>) :: step_index=0 :: info.stdout; step_index=10 :: thought；[artifacts/android_1/screenshots/step_055.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/artifacts/android_1/screenshots/step_055.png>) :: s33 后，已查看；[artifacts/android_1/screenshots/step_057.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/artifacts/android_1/screenshots/step_057.png>) :: s36 后，已查看。
- C03：[trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/trajectory.json>) :: step_index=0; step_index=2 :: info.stdout；[trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/trajectory.json>) :: step_index=1 :: info.before/after；[artifacts/linux_0/screenshots/step_011.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/artifacts/linux_0/screenshots/step_011.png>) :: s5 后，已查看；[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/evaluator_trace.json>) :: evaluators[0].actual.devices/history; evaluators[1].actual。
- C04：[artifacts/android_1/screenshots/step_000.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/artifacts/android_1/screenshots/step_000.png>) :: reset 截图，已查看；[artifacts/android_1/screenshots/step_038.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/artifacts/android_1/screenshots/step_038.png>) :: s19 后，已查看；[trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/trajectory.json>) :: step_index=20 :: info/observation；[artifacts/android_0/screenshots/step_067.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/artifacts/android_0/screenshots/step_067.png>) :: s43 后，已查看；[artifacts/android_0/screenshots/step_077.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/artifacts/android_0/screenshots/step_077.png>) :: s49 后，已查看。

正文只用以上四条机制段落；C05–C07 留作附录边界，不为凑分类数增加正文大类。S01 不计作失败案例，且不将另一模型成功轨迹当作 GPT 原运行的完成证据。
