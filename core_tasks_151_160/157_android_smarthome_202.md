# Core 157 — android_smarthome_202

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 157 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_202.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：easy
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

手机收到请求：19:30 把 living-room purifier 设 high，并关闭 curtain。Home 当前时间 19:00，所以必须创建一条未来 workflow，而不是立刻改设备。

正确 workflow 在 19:30 同时实现：

- purifier：power=on、level=high；
- curtain：open_pct=0、执行后 status=closed。

Evaluator 会先确认 19:00 时设备仍保持初始状态，再自行推进 30 分钟检查 workflow 是否真正执行。

## 1. Instruction

### 英文原文（逐字）

~~~text
Simple SMS Messenger has an updated request for the living-room air and curtain. Schedule the complete Home adjustment for the time in that message.
~~~

### 中文翻译

Simple SMS Messenger 中有一条更新后的 living-room 空气和窗帘请求。请按照消息中的时间安排完整的 Home 调整。

## 2. 输入、附件与初始业务数据

本任务没有文件附件、联系人或邮件。输入是一条 received SMS；不要求发送回复。

### 2.1 收到的短信

Simple SMS Messenger 会先被清空，再从 `5552020` 注入：

~~~text
At 19:30, set living room purifier high and close the curtain.
~~~

Setup 使用 `androidworld_sms_receive`，并等待 5 秒。这是收件箱输入，不是输出短信。

### 2.2 home_0：初始状态

当前时间：`2026-06-16T19:00:00`。

| 设备 | 初始状态 |
|---|---|
| living_room_air_purifier_1 | power=off，level=low |
| living_room_curtain_1 | open_pct=90，status=partial |

初始 schedules、workflows 和 history 均为空。

## 3. Setup 具体流程

### android_0

确保 Simple SMS Messenger 可用，清空 SMS，注入上述请求并等待 5 秒。

### home_0

使用 `android_smarthome_202/episode_config.json` reset Home。

Setup 不会创建 workflow，也不会推进到 19:30。

## 4. 正确输出

创建一条 `run_at=2026-06-16T19:30:00` 的 active workflow。Oracle：

| 顺序 | 设备 | command | args |
|---:|---|---|---|
| 1 | living_room_air_purifier_1 | turn_on | {} |
| 2 | living_room_air_purifier_1 | set_level | level=high |
| 3 | living_room_curtain_1 | close | {} |

Oracle workflow_id 是 `living_air_gap`，但 evaluator 不检查 ID。

不需要发送 SMS，也不应立即执行这些设备变化。

## 5. Evaluator：评测方式与具体评测点

### 5.0 评测按顺序执行

共有 5 个 evaluation 步骤，必须全部成功：

1. 检查 19:30 active workflow 的规范化效果；
2. 检查当前设备仍是 setup 初始状态的 hard guard；
3. evaluator 内部执行 `smarthome.advance_time(minutes=30)`；
4. 检查 purifier 执行后状态；
5. 检查 curtain 执行后状态。

步骤 2 设置 `enable_score_calc=false`；步骤 3 是内部评测步骤，本身也不计分。但它们失败仍会导致整体失败，hard guard 失败还会把总分置 0。

### 5.1 Workflow 记录

`smarthome.check_workflow_effects` 要求：

- Home 全部 workflows 中 active workflow 恰好 1 条；
- run_at 精确为 `2026-06-16T19:30:00`；
- 规范化 effects 精确等于：
  - purifier：power=on、level=high；
  - curtain：open_pct=0。

要得到 purifier 的两个字段，正常需要 `turn_on` 与 `set_level(high)`。只安排 set_level 会缺少 power=on 效果。多出其他设备或效果字段也会因字典不相等而失败。Workflow ID 不检查。

### 5.2 19:00 时不能提前改变设备

推进时间前，`check_multi_condition` 要求：

- purifier 仍为 off/low；
- curtain 仍为 open_pct=90、status=partial。

因此不能为了“确保结果”而先手动开 purifier 或关 curtain。

### 5.3 Evaluator 自动推进时间

第三步由 evaluator 自己把 Home 从 19:00 推进 30 分钟。Agent 不需要也不应手动推进时间。评测框架会为内部推进建立快照，并在评测结束后恢复评测引起的临时时间推进。

### 5.4 19:30 执行结果

推进后分别检查：

- purifier：power=on、level=high；
- curtain：open_pct=0、status=closed。

这些是状态子集匹配，但列出的字段都必须正确。仅创建一条看似正确但无法执行的 workflow，后两项仍会失败。

### 5.5 没有检查的手机输出

没有 sent SMS evaluator，也不检查输入 SMS 最后是否保留。任务输出只有 Home workflow 及其执行结果。

## 6. 常见失败与真实评测边界

- 创建两个独立 schedules：不是一条 workflow，失败。
- 立刻开 purifier/关 curtain：19:00 hard guard 失败。
- Workflow 时间写成 19:20 或 20:00：失败。
- 只安排 purifier high 而未安排 power on：effects 和执行后状态都可能失败。
- 不需要给 `5552020` 回复。

## 7. Cleanup

- android_0 清空 SMS；
- home_0 reset。
