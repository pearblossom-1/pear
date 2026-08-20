# Core 151 — android_smarthome_464

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 151 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_464.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：hard
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台手机 JSON 指定三个待观察指标及优先级：air quality > humidity > temperature，并且只发送最高优先级告警。Home 当前对应读数是 kitchen PM2.5=91、laundry humidity=68%、entry temperature=24 C。因此选择 air-quality 告警，再根据第二台手机联系人角色映射，向 `Air Quality Lead` 的 `5550464` 发短信。

短信要明确写 kitchen、PM2.5/air quality、91、这是 highest-priority alert。

## 1. Instruction

### 英文原文（逐字）

~~~text
The first phone's Android Files app has `home_alert_config.json`, and the second phone has the role contacts. Please send the highest-priority Home alert from the second phone to the correct contact.
~~~

### 中文翻译

第一台手机的 Android Files app 中有 `home_alert_config.json`，第二台手机中有按角色保存的联系人。请从第二台手机把最高优先级的 Home 告警发送给正确联系人。

## 2. 输入、附件与初始业务数据

本任务没有邮件或预置短信。输入来自 JSON 文件、两个联系人和 Home 实时环境；短信是输出。

### 2.1 android_0：JSON 附件

`home_alert_config.json` 上传到：

~~~text
/storage/emulated/0/Download/home_alert_config.json
~~~

文件原文：

~~~json
{"metrics":["kitchen PM2.5","laundry humidity","entry temperature"],"priority_order":["air quality","humidity","temperature"],"send_highest_only":true}
~~~

含义：

- 候选指标：kitchen PM2.5、laundry humidity、entry temperature；
- 优先级从高到低：air quality、humidity、temperature；
- `send_highest_only=true`：只通知最高优先级项。

### 2.2 android_1：角色联系人

Contacts 会先清空，再加入两条：

| name | number | notes |
|---|---|---|
| Air Quality Lead | 5550464 | Role: air quality alerts |
| Laundry Lead | 5550465 | Role: humidity alerts |

所以 air-quality 告警的正确收件人是 `5550464`，不是 Laundry Lead。Simple SMS Messenger 会被清空。

### 2.3 home_0：三个指标的实时值

当前时间：`2026-06-16T19:00:00`。

| JSON 指标 | Home 实时值 | 优先级类别 |
|---|---:|---|
| kitchen PM2.5 | 91.0 | air quality，最高 |
| laundry humidity | 68.0% | humidity，第二 |
| entry temperature | 24.0 C | temperature，第三 |

Home 初始 schedules、workflows、reports 和 history 均为空。Kitchen purifier 当前 off/low，但 instruction 只要求发告警，不要求控制设备。

## 3. Setup 具体流程

### android_0

1. 确保 Android Files 可用；
2. 上传 `home_alert_config.json` 到 Download 根目录。

### android_1

1. 确保 Contacts 可用并清空；
2. 创建两条角色联系人；
3. 确保 Simple SMS Messenger 可用并清空 SMS。

### home_0

使用 `android_smarthome_464/episode_config.json` reset Home，装入 19:00 的房间环境和设备状态。

Setup 不会发送任何结果短信。

## 4. 正确输出

从 android_1 向 `5550464` 发送短信。Oracle 示例：

~~~text
Kitchen PM2.5 is 91, so this is the highest-priority air-quality alert.
~~~

不需要逐字照抄，但必须满足下面的语义组合。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

本任务只有 1 个 evaluator：android_1 的 sent SMS。没有 Home 状态或“不发送低优先级告警”的独立 guard。

### 5.1 收件箱、号码和时间窗口

Evaluator 在 sent box 中寻找：

- address=`5550464`；
- 发送时间在最近 30 分钟内；
- 至少一条正文通过 relation 规则。

号码匹配会忽略空格和连字符。它不要求 sent box 恰好只有一条消息。

### 5.2 正文不是整句绝对匹配

正文必须命中每个实体组：

- `kitchen`；
- `PM2.5` / `PM 2.5` / `air quality`；
- `91`；
- `highest-priority` / `highest priority`；
- `alert`。

还必须至少命中一个正向词：`alert`、`highest-priority`、`highest priority`。因为这些词也已出现在实体组中，写出完整的“highest-priority alert”即可满足。

不得出现：

- `pending`、`cancelled`、`canceled`；
- `not the highest priority`、`lower priority`、`not an alert`。

Relation scorer 大小写不敏感、按词边界匹配，允许改写和跨句出现；问句、明显不确定、否定或撤销语义会失败。

### 5.3 当前 evaluator 没有检查什么

- 不检查是否同时给 `5550465` 发了低优先级消息；按 JSON 不应发送，但 evaluator 只查正确号码上是否有匹配消息。
- 不检查 Home 是否保持不变，也不检查 purifier 状态。
- 不检查 JSON 或联系人最后是否仍存在。
- 不要求短信写 laundry humidity 或 entry temperature。

## 6. 常见失败与真实评测边界

- 发给 Laundry Lead：地址不匹配，失败。
- 只写“Kitchen air alert”：缺 91 和 highest-priority，失败。
- 写“this may be the highest priority?”：问号和不确定语义会失败。
- 可以写 `air quality` 而不必逐字写 `PM2.5`，但仍必须写 91。
- 正确行为是只发最高优先级告警，即使 evaluator 没有额外短信的排他检查。

## 7. Cleanup

- android_0 删除 `home_alert_config.json`；
- android_1 清空 Contacts 和 SMS；
- home_0 reset。
