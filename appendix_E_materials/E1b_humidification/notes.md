# E1b：加湿调度完成后，在错误手机上寻找待办

任务 `linux_android_smarthome_439`，Claude Opus 4.8（`claude-opus-4-8-lite`），采用运行 `core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439`。该恢复运行是 effective Core200 汇总正式采用的记录，定位见 [task/main_experiment_selection.json](task/main_experiment_selection.json)。

## 设备与记录位置

| 设备 | 任务角色与初始内容 | 证据 |
|---|---|---|
| `linux_0` | CSV 映射 `Guest Wake → bedroom` | [clock_rule.csv](task/resources/source/tmp/home_ops/plan-revisions/source/clock_rule.csv)；s0、s12 的实际读取 |
| 第一台手机 `android_0` | Clock 中 Guest Wake 闹钟，09:35 | task/config/task.json 的设备顺序和 alarm setup；该手机初始观测 |
| 第二台手机 `android_1` | Downloads 中 `guest_wake_humidity.txt`；原始 Tasks 记录 `Guest Wake follow-up` | [输入文件](task/resources/android/android_1/guest_wake_humidity.txt)；task setup；[reset 完整截图](run/artifacts/android_1/screenshots/step_000.png) |
| `home_0` | bedroom humidifier 的 Home workflow 目标 | 原始 instruction、Home reset、s20 及 evaluator |

指令明确指定第一台手机的闹钟与第二台手机的文件；待办位于第二台手机的直接依据是 **setup 和初始可见截图**。不要把它改写成用户指令逐字写明了待办所在手机。初始截图可见待办未完成，note 为 `Arrange the bedroom humidity recovery for guest wake time, then close this follow-up.`。

## 执行片段与关键画面

| 日志位置 | 实际操作与结果 | 画面／原始文件 |
|---|---|---|
| s0—s19 | 读取 Linux 映射，在 `android_1` 找到并打开文件；文件说明 medium 与 Guest Wake 时间 | [第二台手机文件画面](run/artifacts/android_1/screenshots/step_038.png)，对应 s19 后 |
| s20 | `home_0` 创建 `guest_wake_humidity_0935`，run_at 为 `2026-06-17T09:35:00`；包含 turn_on 和 set_level(medium)，调用成功 | [trajectory.json](run/trajectory.json)，step_index=20 |
| s21—s45 | 转到 `android_0` 的 Tasks，输入完整标题、Guest Wake、Guest 等进行寻找；目标记录在另一台手机 | s25、s26、s42 的输入动作；[搜索画面](run/artifacts/android_0/screenshots/step_067.png)，对应 s43 后 |
| s46 | 模型输出没有形成可执行 action；该 step 仍被预算计数 | trajectory 的 step_index=46 |
| s47—s49 | 继续在 `android_0` 操作 Tasks；最后仍是空列表 | [第一台手机最后完整截图](run/artifacts/android_0/screenshots/step_077.png) |
| 最后观测 | `android_1` 仍显示 humidity 文件，没有返回目标 Tasks 记录 | [第二台手机最后完整截图](run/artifacts/android_1/screenshots/step_067.png) |

详细动作、错误、完整反馈及每轮设备观测均保留在 trajectory 和 execution_history 中。s20 后没有向 `android_1` 提交动作；后续 Tasks 寻找全部发生在 `android_0`。

## 保存的计划与最终验证

[evaluator_trace.json](run/evaluator_trace.json) 的 `evaluators[1].actual` 保存最终 workflow 对象：时间 `2026-06-17T09:35:00`，status=`active`，steps 为 bedroom_humidifier_1 的 turn_on、set_level(medium)，steps_total=2、steps_done=0、error=null。该检查 **PASS**；任务要求创建未来计划，steps_done=0 不代表计划失败，不需要补做“到点执行”实验。

`evaluators[0]` 检查 `android_1` 的原待办是否完成、note 是否包含 09:35、bedroom、humidifier、medium 和已安排的关系，actual=`missing`，**FAIL**。结合初始目标记录、后续无目标手机更新动作，可以确认任务要求的更新未完成。没有单独的最终待办数据库导出，也没有拍到最终 Tasks 页；**初始未勾选图必须标为初始状态，不能冒充最终截图**。评测原始值只有 missing，未额外编造逐字段终值。

整体 FAIL、部分得分 0.5。result 记录 50 步、终止 `max_steps`；其中 49 个已解析设备动作，另一个为 s46 的无动作记录。设备动作分布：Linux 2、Home 1、android_1 18、android_0 28。完整生命周期时长 996.466 秒，不能当作纯模型交互时间。

run 共 454 个原始文件、198 张完整截图，保留每台设备的原目录和索引。全部 GUI 图片都是本次运行截图；Home 计划来自原始结构化返回。
