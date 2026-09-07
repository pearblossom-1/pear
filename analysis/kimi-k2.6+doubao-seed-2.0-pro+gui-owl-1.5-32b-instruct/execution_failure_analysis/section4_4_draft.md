# 4.4 Failure Analysis

我们对本机 Kimi K2.6、Doubao-Seed-2.0-Pro 与 GUI-Owl-1.5-32B-Instruct 的既有主实验进行定向轨迹分析，核实五条失败案例及一条成功对照，以下选取四条展示。分析结合当时任务要求、完整动作与反馈、关键截图和原生状态，识别未恢复的执行偏离；案例不是随机样本，不用于估计总体错误比例，也不构成覆盖全部失败的分类。

**局部操作停滞可阻断后续流程。** 在四设备会议任务 `a2l2_meeting_packet_full` 中，GUI-Owl 打开日历后连续执行 48 次相同的元素点击，却没有打开会议详情；该元素对应搜索图标。达到步数上限时，议程文档与两条确认短信均缺失（C01）。Doubao 在双手机照片核查任务 `android_only_234` 中则持续改变点击与导航方式，但最终仍停留在 Downloads，未形成第二手机上的状态记录（C03）。两例都体现局部交互未推进必要状态，而非已正确获取信息后跨设备传错。下游未开始也不能证明模型缺乏相应下游能力；界面定位、输入映射与策略的贡献仍未分离。

**形成结论不等于完成交付。** 在 `android_smarthome_854` 中，Kimi 根据清单与音乐应用作出精确歌单不可用、不能替代的判断，并转向 Tasks，但新增条目的点击没有进入有效编辑状态。之后模型返回文件搜索，直到超时，要求的 `Playlist routine result` 仍缺失（C02）。这里没有创建 Home routine 符合禁止替代的约束，真正未完成的是应当留下的结果记录。该任务的部分得分不能被解释为完成了若干独立阶段，也不能把模型请求耗时全部归因于重复操作。

**动作成功受理仍可能遗漏前置条件。** 在短信驱动的 `android_smarthome_202` 中，GUI-Owl 正确记录了 19:30 调高净化器档位和关闭窗帘的计划，却没有为初始关闭的净化器安排开机，随后主动结束（C04）。缺口是计划的因果完整性，而非调用失败。Kimi 的同任务成功轨迹将开机、调档和关帘一并排程（S01），提供了有限对照。这不意味着必须使用某一种 workflow，也不要求执行者提前推进时间；历史证据支持计划缺项，而非已经观测到未来时刻的设备效果。

这些案例提示，可进一步检验面向必要状态推进、待交付结果和动作前置条件的检查机制。不过，本轮没有干预实验，不能宣称某个规划、记忆或验证模块已经解决这些问题，更不能据此解释全部跨设备性能差距。

## 表 4.X 占位：不同执行环节的未完成状态

建议使用下列紧凑案例表，不制作失败占比图。正文保留四行；完整轨迹、成功对照及附录 C05 见 [案例证据](failure_cases.md)。

| 机制 | 模型与任务 / Case | 关键历史证据 | 未完成结果 |
|---|---|---|---|
| 局部源信息获取停滞 | GUI-Owl / 会议材料 / C01 | Calendar 中重复 click(index=0)，中段与末段仍未打开事件 | 议程文档与两条确认短信缺失 |
| 目标端文件导航停滞 | Doubao / 照片核查 / C03 | 多次导航后，末图仍为 Downloads；结果文件读取为空 | 第二手机的逐项照片状态未形成 |
| 结论未落成记录 | Kimi / 歌单结果 / C02 | no-substitution 清单、Tasks 空列表、最终条目 MISSING | 要求的未完成 Tasks 条目缺失 |
| 排程遗漏开机前置条件 | GUI-Owl / 短信安排 Home / C04 | 净化器初态 off；计划只有 set_level 与 close | 定时高档运行所需的开机动作缺失 |

Caption 草案：**表 4.X：既有主实验中的定性执行失败案例。** 同样的自动 FAIL 可以来自不同环节；动作接口受理或局部约束满足并不保证必要交付完成。表中事实来自各自 selected attempt 的历史证据，不表示机制频率或互斥归因。

### 后续排版可用的真实素材位置

- C01：[Calendar 中段截图][p-c01-mid]、[末段截图][p-c01-last]；[轨迹][p-c01-t] 的 s2–s49；同目录 `evaluator_trace.json` 的三个实际结果。截取工具栏和月历即可，不重绘截图。
- C03：[末段第二手机 Files 截图][p-c03-last]；[轨迹][p-c03-t] 的 s0–s32；同目录 `evaluator_trace.json` 的 evaluators[0].actual 为空。
- C02：[清单截图][p-c02-source]、[Tasks 空列表][p-c02-empty]；[轨迹][p-c02-t] 的 s5、s7–s15；同目录 `evaluator_trace.json` 的 evaluators[0].actual 为 MISSING。
- C04：[历史轨迹][p-c04-t] 的 reset Home 初态与 s0–s2 计划写入；[SMS 完整 UI 文本][p-c04-ui]。对照素材为 [S01 历史轨迹][p-s01-t] 的 s0 workflow；仅展示记录的计划，不绘制不存在的时间推进后观测。

[p-c01-mid]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/artifacts/android_0/screenshots/step_050.png
[p-c01-last]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/artifacts/android_0/screenshots/step_100.png
[p-c01-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/trajectory.json
[p-c03-last]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/162_android_only_234/artifacts/android_1/screenshots/step_066.png
[p-c03-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/162_android_only_234/trajectory.json
[p-c02-source]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/artifacts/android_0/screenshots/step_000.png
[p-c02-empty]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/artifacts/android_0/screenshots/step_032.png
[p-c02-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/trajectory.json
[p-c04-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/157_android_smarthome_202/trajectory.json
[p-c04-ui]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/157_android_smarthome_202/artifacts/android_0/ui_elements/step_000.json
[p-s01-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/157_android_smarthome_202/trajectory.json
