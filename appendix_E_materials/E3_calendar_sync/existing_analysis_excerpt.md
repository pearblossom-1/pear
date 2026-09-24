# 已有案例分析摘录（不是原始日志）

来源：pear 仓库 `4a9f57c0b48abda4c1a8ecb347d60f7bd576df15` 的 `analysis/ufo3-gpt-5.5+qwen3.7-plus+ui-venus-1.5-30b-a3b/execution_failure_analysis/failure_cases.md`，仅原样摘录 C01。

下文 `U/004...` 指 `main_experiment_selection.json` 定位的 UFO³ 主实验 attempt_001。2026-09-24 已将该目录原件补入 [run/](run/) 并核对。下方 C01 原文不改写；本次直接证据与计数澄清见 [notes.md](notes.md)：初始 constellation 的三个节点均为 PENDING，Android 在随后启动后为 RUNNING；终态 CSV 未独立归档，不能仅用 evaluator 中的缓存路径做内容逐字节核验。

## C01：局部探索耗尽全局预算

- **模型与 attempt**：UFO³ + GPT-5.5，Lite 004，`U/004_al_calendar_schedule_conflict/attempts/attempt_001`；正式 FAIL，score 0，评分无争议。
- **公开目标与设备角色**：从 `android_0` 的 Simple Calendar Pro 取得权威会议信息；在 `linux_0` 依规则更新 `week.csv`，并生成变更日志 `log.json`。
- **已完成的局部工作**：规划器把 Android 日历读取、Linux 规则读取以及更新/记录拆成三个子任务，并开始日历子任务。

| 步骤/区间 | 设备 | 可观察事实 | 原始证据 |
|---|---|---|---|
| 初始 constellation | Android / Linux | 日历子任务为 RUNNING，两个 Linux 子任务仍为 PENDING | `U/004.../trajectory.json:42-75` |
| 1–49 | `android_0` | 49 次 device-agent 环境动作全部落在 Android；没有 Linux 动作 | `U/004.../trajectory.json` 中全部 `agent_step.target_device_id`；`result.json:30-35` |
| 最后观测 | `android_0` | 实际查看的 `artifacts/android_0/screenshots/step_098.png` 仍停在月历界面，没有进入 Linux 处理 | 同路径截图；`trajectory.json:6014-6024` |
| 结束 | 全局 | 第 50 次 policy call 触发 step limit；0 次 replan | `result.json:20-38`；`trajectory.json:6030-6035` |
| 评估 | `linux_0` | `log.json` 不存在，`week.csv` 仍是旧内容，两项均为 0 | `U/004.../evaluator_trace.json:30-47,91-120` |

**未满足要求与机制。** 必要的 Linux 更新和日志都未发生。这里可观察到的机制是串行调度在局部 Android 探索没有收敛时仍持续投入全部动作预算，未把资源切换给独立可执行的 Linux 规则读取，也未触发动态重规划。不能由这一例推出所有 UFO³ 失败都来自调度；Qwen 和 UI-Venus 在同任务也失败，但本案例不把它们未经同等展开的轨迹归入相同机制。

**恢复、下游与改进边界。** 本次无恢复，两个下游产物均被阻断。可尝试为长时间无新信息的子任务设置 progress watchdog，并允许独立节点先行；这是案例启发的设计方向，不是已验证修复。
