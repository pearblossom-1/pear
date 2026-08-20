# Core 159 — android_smarthome_233

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 159 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_233.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：easy
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

手机收到“把 kitchen aroma diffuser 设为 lavender”的请求，但 Home 的 kitchen 设备列表里没有 aroma diffuser。因此不能应用 lavender 设置。

正确输出是 SmartHome 中恰好一条 missing-device infeasible report，目标为 kitchen aroma diffuser，原因说明该设备不存在、设置无法应用。任务不要求回复短信。

## 1. Instruction

### 英文原文（逐字）

~~~text
Simple SMS Messenger has a request for a kitchen aroma setting. Check whether Home supports that request and report the outcome.
~~~

### 中文翻译

Simple SMS Messenger 中有一条 kitchen aroma 设置请求。检查 Home 是否支持该请求，并报告结果。

## 2. 输入、附件与初始业务数据

本任务没有文件附件、联系人或邮件。输入是一条 received SMS 和 Home 设备清单。

### 2.1 收到的短信

Simple SMS Messenger 会先清空，然后从 `5552330` 注入：

~~~text
Set kitchen aroma diffuser to lavender.
~~~

这是 received/inbox 输入，setup 等待 5 秒。

### 2.2 Home kitchen 设备

当前时间：`2026-06-16T19:00:00`。

Kitchen 中只有：

| 设备 | 状态 |
|---|---|
| kitchen_air_purifier_1 | off / low |
| kitchen_light_1 | off |
| kitchen_robot_vacuum_1 | on / cleaning / battery 37 |

没有 aroma diffuser。初始 infeasible_reports、schedules、workflows 和 history 均为空。

## 3. Setup 具体流程

### android_0

确保 Simple SMS Messenger 可用，清空 SMS，并注入请求。

### home_0

使用 `android_smarthome_233/episode_config.json` reset Home。Episode 标记为 `case=infeasible`。

## 4. 正确输出

Oracle：

~~~text
type: smarthome.report_infeasible
category: missing_device
target:
  room: kitchen
  need: aroma_diffuser
reason: The kitchen has no aroma diffuser, so the lavender setting cannot be applied.
details: {}
~~~

无需发送 SMS 回复，也无需创建 Markor/Tasks 输出。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

本任务只有 1 个 evaluator：infeasible_reports 列表必须恰好有 1 条，并通过 missing-device 语义 contract。

### 5.1 Category

给出的 aliases：

- `missing_device`、`missing device`；
- `equipment unavailable`。

实现拒绝空、available、success 等相反 category，并在可识别类别族上排除与 missing family 冲突的类别。使用 `missing_device` 最稳妥。

### 5.2 Target

报告必须匹配以下任一目标表达：

- `kitchen aroma diffuser`；
- `aroma diffuser in kitchen`；
- 或结构化 target 同时含 room=kitchen、need=aroma_diffuser。

非通用显式 target 自身也必须匹配。

### 5.3 Reason relation

必须包含：

- `kitchen` 或 `kitchen room`；
- `aroma diffuser` 或 `diffuser`；
- 至少一个不可用表达：
  - `no aroma diffuser`、`missing`、`not present`；
  - `cannot be applied`、`cannot set lavender`。

不得出现：

- `is present`、`exists`；
- `lavender was applied`、`setting succeeded`。

必要的 `no aroma diffuser`、`not present`、`cannot...` 被允许作为 negative-capability 表达。`lavender` 不是独立必需实体；若使用“no aroma diffuser”即可满足正向不可行表达，但正确报告仍应解释原请求的 lavender 设置无法应用。

### 5.4 没有短信回复或 no-change evaluator

Evaluator 不查 sent SMS，也没有 Home no-change guard。正确输出位置是 SmartHome report；不要误把“report the outcome”理解成必须回复 `5552330`。

## 6. 常见失败与真实评测边界

- 向 `5552330` 回一条失败短信但不提交 report：失败。
- 报告只写“lavender unsupported”，不提 kitchen diffuser：实体不齐，失败。
- 报告“diffuser exists”：命中冲突。
- 提交两条报告：exact_report_count=1，失败。
- 不要把 kitchen air purifier 当成 aroma diffuser。

## 7. Cleanup

- android_0 清空 SMS；
- home_0 reset。
