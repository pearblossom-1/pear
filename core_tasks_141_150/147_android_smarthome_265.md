# Core 147 — android_smarthome_265

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 147 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_265.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

Markor 规则是“bedroom humidity 低于 35% 时，humidifier 设为 high”。Home 的实时 bedroom humidity 是 32%，所以条件成立。需要：

1. 打开 bedroom humidifier 并设为 high；
2. 向保存的 `Home Updates` 联系人号码 `5552650` 发短信；
3. 短信必须明确包含 32%、阈值 35%、32 低于 35、humidifier 已经在 high 档运行。

## 1. Instruction

### 英文原文（逐字）

~~~text
Use the humidity rule in the `Dry Air Rule` Markor note and the live Home bedroom humidity to decide whether action is needed. Apply the rule, then send the result to the saved `Home Updates` contact in Simple SMS Messenger.
~~~

### 中文翻译

使用 Markor 的 `Dry Air Rule` note 中的湿度规则和 Home 实时卧室湿度判断是否需要采取动作。应用规则后，在 Simple SMS Messenger 中把结果发送给已保存的 `Home Updates` 联系人。

## 2. 输入、附件与初始业务数据

本任务没有邮件或预置短信。输入是一份 Markor 文件、一个联系人和 Home 实时状态。

### 2.1 Markor 附件

`Dry Air Rule.md` 上传到：

~~~text
/storage/emulated/0/Documents/Markor/Dry Air Rule.md
~~~

文件全文：

~~~text
If bedroom humidity is below 35%, humidifier high.
~~~

### 2.2 联系人

Contacts 会先清空，再加入：

| 字段 | 内容 |
|---|---|
| name | Home Updates |
| number | 5552650 |
| notes | Receives bedroom humidity notices. |

Simple SMS Messenger 的短信会被清空。

### 2.3 home_0：相关初始状态

当前时间：`2026-06-16T19:00:00`。

| 项目 | 初始值 |
|---|---|
| bedroom humidity | 32.0% |
| bedroom_humidifier_1 | power=off，level=low |
| schedules/workflows/history | 均为空 |

因为 32 < 35，规则要求行动。

## 3. Setup 具体流程

### android_0

1. 确保 Markor 可用并上传 `Dry Air Rule.md`；
2. 确保 Contacts 可用并清空联系人；
3. 创建 `Home Updates`；
4. 确保 Simple SMS Messenger 可用并清空短信。

### home_0

使用 `android_smarthome_265/episode_config.json` reset Home。

Setup 不会启动 humidifier，也不会发送结果。

## 4. 正确输出

### 4.1 Home

`bedroom_humidifier_1` 最终必须为：

~~~text
power: on
level: high
~~~

### 4.2 短信

发送到 `5552650`。Oracle 示例：

~~~text
Bedroom humidity is 32%, below the 35% rule, so the humidifier is running on high.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 2 个 evaluator，两个都必须成功：匹配的 sent SMS，以及 humidifier 最终状态。

### 5.1 短信需要同时写读数、阈值和关系

Evaluator 在 sent box 中找发给 `5552650`、最近 30 分钟内的消息。正文必须命中每个实体组：

- `bedroom`；
- `humidity`；
- `32` 或 `32%`；
- `35` 或 `35%`；
- `humidifier`；
- `high`。

还必须：

- 至少出现 `running`、`is on`、`set to high`、`started` 之一；
- 必须出现 `below` 或 `under`；
- 不得出现 `pending`、`cancelled`、`canceled`、`not running`、`not on high`、`not set`。

因此只写“湿度低，已加湿”不够；32 和 35 两个数字都要出现，并且要用 below/under 表达比较。它是语义关键词组合，不是 Oracle 整句绝对匹配，也不要求恰好一条短信。

### 5.2 Home 状态

`smarthome.check_device_state` 对 `bedroom_humidifier_1` 做子集匹配：

- power=`on`；
- level=`high`。

不检查 command history 或具体动作顺序。

### 5.3 没有单独检查的输入

Evaluator 不检查 Markor 文件和联系人是否仍存在，也不要求短信逐字引用规则原句。Home 中其他设备和计划不在当前 evaluator 中。

## 6. 常见失败与真实评测边界

- 看到 32 后误以为“高于”35：短信缺 below/under，且动作逻辑错误。
- 只开机但保留 low：Home 失败。
- 短信漏掉 35 阈值：失败。
- 写 `not running` 后再写 `running`：冲突短语仍会使整条关系失败。
- 可以用 `under 35` 代替 `below 35`。

## 7. Cleanup

- android_0 删除 `Dry Air Rule.md`，清空 Contacts 和 SMS；
- home_0 reset。
