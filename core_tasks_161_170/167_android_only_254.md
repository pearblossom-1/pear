# Core 167 — android_only_254

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 167 项
- 任务文件：`tasks/cross_device/android_only/android_only_254.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：medium
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机的 Nora Logistics 联系人提供收件号码 `5550254`、`Bay 4 handoff` 说明和首选日期时间格式 `YYYY-MM-DD HH:MM`。第二台手机的 Calendar 提供 Cargo check 事件时间 `2026-07-18 11:20`。

要从第二台手机给 `5550254` 发确认短信。可直接使用 oracle：

~~~text
Cargo check is confirmed for 2026-07-18 11:20 at Bay 4; use the saved handoff.
~~~

`Bay 4` 只能写一次，所以第二个分句用 “the saved handoff” 指回它。

## 1. Instruction

### 英文原文（逐字）

~~~text
The Nora Logistics contact on the first phone has the recipient number, dock note, and preferred date/time style. Use it together with the Cargo check event in Calendar on the second phone to send Nora a confirmation SMS from the second phone.
~~~

### 中文翻译

第一台手机上的 Nora Logistics 联系人包含收件号码、码头说明和首选日期/时间格式。将这些信息与第二台手机 Calendar 中的 Cargo check 事件结合，从第二台手机给 Nora 发送确认短信。

## 2. 输入、附件与初始业务数据

本任务没有邮件或文件附件。输入来自一条联系人记录和一个 Calendar 事件；输出是一条 sent SMS。

### 2.1 android_0：Nora Logistics 联系人

Contacts 会清空后创建：

| 字段 | 内容 |
|---|---|
| name | Nora Logistics |
| number | 5550254 |
| notes | `Dock note: use Bay 4 handoff. Confirmation date/time style: YYYY-MM-DD HH:MM.` |

Notes 给出三个关键输入：

- 使用 Bay 4；
- 这是一个 handoff；
- 日期时间推荐写为 `2026-07-18 11:20` 这种格式。

### 2.2 android_1：Cargo check 事件

| 字段 | 内容 |
|---|---|
| title | Cargo check |
| start_ts | `1784373600`（任务时区换算为 2026-07-18 11:20） |
| end_ts | `1784375400`（2026-07-18 11:50） |
| location | Bay 4 |
| description | Confirm arrival window with Nora. |

### 2.3 android_1：SMS 初态

Simple SMS Messenger 会被清空。Setup 不会预先发送确认短信。

## 3. Setup 具体流程

### android_0

1. 确保 Contacts 可用；
2. 清空 Contacts；
3. 创建 Nora Logistics 及上述号码和 notes。

### android_1

1. 确保 Simple Calendar Pro 可用并清空 Calendar；
2. 创建 Cargo check 事件；
3. 确保 Simple SMS Messenger 可用；
4. 清空 SMS。

## 4. 正确输出

从 android_1 向 `5550254` 发送短信。Oracle：

~~~text
Cargo check is confirmed for 2026-07-18 11:20 at Bay 4; use the saved handoff.
~~~

不是整句绝对匹配，但日期、时间、地点、确认关系和 handoff 使用关系都必须明确。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

只有 1 个 evaluator：android_1 sent box 中至少一条最近发送给 `5550254` 的短信通过正文 relation 规则。

### 5.1 消息方向、号码和时间窗口

- 必须从 android_1 发送；
- box 必须是 sent；
- address 为 `5550254`；
- 发送时间在最近 30 分钟内；
- 不要求 sent box 只有这一条，也没有 `exact_count`。

### 5.2 六个正文实体

正文必须包含且每个顶层实体组恰好匹配一次：

- `Cargo check`；
- `2026-07-18`、`July 18, 2026` 或 `July 18`；
- `11:20` 或 `11:20 AM`；
- `Bay 4`；
- `handoff`。

这里共有五个顶层实体组；日期和时间各自是“多种写法任选其一”。`unique_entities=true` 意味着不要重复标题、日期、时间、Bay 4 或 handoff。

联系人要求首选 `YYYY-MM-DD HH:MM`，oracle 遵守这一偏好。Evaluator 为自然表达保留了英文日期和 12 小时时间的替代写法，因此并非只接受首选格式。

### 5.3 两条关系

第一条 relation group 要求同一 clause 中出现：

- Cargo check；
- 合法日期；
- 合法时间；
- Bay 4；
- `confirmed`、`scheduled` 或 `set` 之一。

第二条 relation group 要求同一 clause 中出现：

- `handoff`；
- `use` 或 `follow`；
- 不能有 `do not use` 或 `ignore`。

分号会切分 clause，所以 oracle 的前半句负责完整确认，后半句负责 handoff 动作。每组默认只允许一个匹配 clause。

### 5.4 冲突与未列出 Bay

不得出现：

- `cancelled`/`canceled`、`withdrawn`、`retracted`、`pending`；
- `do not use`、`wrong dock`；
- `Bay 5`；
- 任何 `Bay + 数字` 形式但不在允许实体中的地点。

`reject_unlisted_entity_pattern` 会识别 `Bay 3`、`Bay 5` 等额外位置。只写 `Bay 4` 一次最稳。

问句、可能/待定语义、否定或后文撤销确认也会失败。

### 5.5 当前 evaluator 没有检查什么

- 不检查 android_0 的联系人最终是否仍存在；
- 不检查 android_1 的 Calendar 事件最终是否保持；
- 不要求严格使用首选日期时间格式，因为 evaluator 接受列出的替代写法；
- 不要求正文出现 `Nora` 或 `Nora Logistics`；
- 不检查事件结束时间 11:50；
- 不要求只有一条 sent SMS。

## 6. 常见失败与真实评测边界

- `Cargo check confirmed for 2026-07-18 11:20.`：缺 Bay 4 和 handoff 使用说明，失败。
- `Cargo check confirmed ... at Bay 4; use Bay 4 handoff.`：Bay 4 重复两次，`unique_entities` 失败。
- `Cargo check may be confirmed ...`：不确定语义，失败。
- 发到 5550254 但从第一台手机发送：设备不对，失败。
- 日期写 `07/18/2026`：不在允许替代项中，失败。

## 7. Cleanup

- android_0 清空 Contacts；
- android_1 清空 Calendar 和 SMS。
