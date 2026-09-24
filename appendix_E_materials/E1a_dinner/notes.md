# E1a：晚餐准备中的原料—食谱关联错误

任务 `linux_android_smarthome_696`，GPT-5.5（`gpt-5.5-lite`），采用运行 `core200_rerun_20260826_run_01/080_linux_android_smarthome_696`。主实验采用记录见 [task/main_experiment_selection.json](task/main_experiment_selection.json)，完整原始文件见 [run/](run/)。

## 原料、食谱与待办

| 对象 | 当次内容 | 原始入口 |
|---|---|---|
| Linux 规则 | R-5 的 `required_ingredient=tofu`，时间 18:05；这一列是原料条件 | [index.csv](task/resources/source/tmp/home_ops/service-notes/source/index.csv)；trajectory 的 s0、s12 实际读取反馈 |
| Android 食谱 | `title=Stir Fry`；`ingredients=tofu, vegetables, oil`；准备时间 20 minutes | task/config/task.json 的 `androidworld_recipe_add`；[初始食谱完整截图](run/artifacts/android_0/screenshots/step_000.png) |
| 原始待办 | `Dinner scene request`；初始 note 为 `Recipe code: R-5`；要求更新原记录并完成，不能创建重复项 | task/config/task.json 的 setup 与 instruction |
| 实际写入 | `Recipe code: R-5`、`Matched recipe: tofu`、`Scheduled scene time: 2026-06-16 18:05`、`Scene scheduled: yes` | trajectory 的 s15 action 与成功反馈；[写入后的完整屏幕](run/artifacts/android_0/screenshots/step_029.png) |
| 保存后的列表 | 原待办被勾选完成，摘要仍为 `Matched recipe: tofu...` | [最后完整截图](run/artifacts/android_0/screenshots/step_059.png)，对应 s30 后 |

**初始屏幕已经显示正确食谱 `Stir Fry` 及原料 `tofu`。** 因此本例不能写成“食谱没有提供给模型”或凭缺少打开 Broccoli 的后续动作断言“完全没有读过食谱”。可以确认的是：正确食谱信息可见，实际待办却把原料词写在食谱名称位置。配置只初始化了一条 Stir Fry；评测要求的名称同为 Stir Fry，时间允许 `18:05`、`6:05 PM` 或 `6:05PM`。保留完整规则，不人为增加唯一答案假设。

## 动作与结果

完整动作在 [trajectory.json](run/trajectory.json)。s0 读取完整 CSV；s1 创建家居 workflow；s2 起操作 Tasks；s12 再读 R-5 行；s15 输入上述 note；s30 后列表显示已完成。31 个设备动作分布为 Linux 2、Home 1、Android 28。最终 `time_limit` 事件发生在一次模型调用返回后，不能写成主动提交完成；result 记录 32 次模型调用、31 个 step。

[evaluator_trace.json](run/evaluator_trace.json) 保留两项检查：

| 检查 | 实际证据 | 原始结果 |
|---|---|---|
| 原待办完成且 note 满足关联条件 | getter 返回 `missing`；截图与输入动作同时证明记录存在并已勾选，但名称内容不符合 Stir Fry 要求 | FAIL |
| 18:05 的 cooking scene 计划效果 | workflow 有 `set_level(high)` 和 `set_brightness(50)`；初始设备都 off，计划未包含所需的开机效果 | FAIL |

因此总体成功为 false，部分得分 0。食谱名称错用是这一例展示的信息关联问题，**不是本次所有失败项的唯一解释**。`missing` 表示没有匹配完整评测条件的记录，不等于待办完全不存在。workflow 的原生对象保存在 evaluator 的 actual 中，无需重跑或模拟到点执行。

## 原始材料保存情况

run 共 228 个文件、94 张原始完整截图；手机截图均保留 `android_0` 目录标签。食谱、待办的初始化由保存的 config 和 reset 截图直接支持；没有单独的应用数据库导出。当前任务没有要求生成 Linux 输出文件。住宅初态见 trajectory 的 reset，评测时的 Home 状态及计划见 evaluator actual；没有使用 cleanup 后的状态。
