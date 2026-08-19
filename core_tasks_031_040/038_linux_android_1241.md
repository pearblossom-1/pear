# Core 038 — `linux_android_1241`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 38 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1241.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与设备分工

| 设备 | 权威输入或输出 |
|---|---|
| `linux_0` | ODT meeting brief、审计模板、最终审计 CSV |
| `linux_1` | active/archived attendees 表 |
| `android_0` | 最终 Calendar 事件与三个人对应的“发/不发”SMS 状态 |

五个 evaluator 等权：事件一项、两个 active 短信各一项、archived 未发送一项、CSV 一项。

## 1. Instruction

### 英文原文（逐字）

```text
Please set up the active planning meeting and notify its attendees. The meeting details are in `/tmp/meeting/brief.odt` on the first Linux machine, and `/tmp/meeting/attendees.csv` on the second identifies the active and archived attendees. Create the event in Simple Calendar Pro, text each active attendee the title, time, and location, and do not text the archived attendee. For the notification record, use `/tmp/meeting/brief_transform_audit_template.csv` on the first Linux machine to create `/tmp/meeting/brief_transform_audit.csv` with one row per notification and one row for the archived attendee that was skipped.
```

### 中文翻译

请设置 active planning meeting 并通知参会者。会议详情在第一台 Linux 的 `/tmp/meeting/brief.odt`；第二台 Linux 的 `/tmp/meeting/attendees.csv` 标明 active 和 archived 人员。在 Simple Calendar Pro 创建事件，向每个 active 人员发送标题、时间和地点，不要给 archived 人员发短信。通知记录使用第一台 Linux 的模板创建 `/tmp/meeting/brief_transform_audit.csv`：每次通知一行，跳过的 archived 人员也记录一行。

## 2. 输入、附件与初始业务数据

ODT 可见文字：

```text
Planning brief
Brief code: OPS-PLANNING-1241
Active title: Ops Planning Sync
Date: 2026-07-28 08:30
Location: Pier 3 Room B
Archived title: Old Ops Draft
```

Attendees CSV：

```csv
name,phone,role,status
Mina,5551201241,lead,attend
Noor,5551201242,site,attend
Omar,5551201299,archive,archived
```

模板内容：

```csv
brief_code,calendar_title,attendee_phone,decision
EXAMPLE-A,Example active meeting,5550000001,notified
EXAMPLE-X,Example archived meeting,5550000002,skipped
```

## 3. Setup 具体流程

### `linux_0`

先删除旧 brief、output、template，创建 `/tmp/meeting`；再上传有效 `brief.odt` 与带两行示例的 `brief_transform_audit_template.csv`。

### `linux_1`

删除旧 attendees，创建同名目录并上传完整三人 CSV。

### `android_0`

确保 Simple Calendar Pro 与 Simple SMS Messenger 可用，清空 Calendar 和 SMS；没有预建活动事件或通知。

## 4. Evaluator：评测方式与具体评测点

本任务有 5 个 evaluator，通常各占 `1/5`。

### 4.0 先说人话：怎样才算通过

创建 `Ops Planning Sync / 2026-07-28 08:30 / Pier 3 Room B` 事件。分别给 5551201241、5551201242 发肯定短信，例如：

```text
Ops Planning Sync at 8:30 in Pier 3 Room B is confirmed.
```

绝对不要给 5551201299 发短信。输出 CSV 必须删除模板示例行并正好写三行：

```csv
brief_code,calendar_title,attendee_phone,decision
OPS-PLANNING-1241,Ops Planning Sync,5551201241,notified
OPS-PLANNING-1241,Ops Planning Sync,5551201242,notified
OPS-PLANNING-1241,Old Ops Draft,5551201299,skipped
```

### 4.1 日历与短信

- 日历匹配标题、开始时间戳 `1785227400` 和地点；结束时间、描述与唯一事件数不评测。
- 两位 active 人员各要有最近 30 分钟的匹配 sent 短信，正文含标题、`8:30` 和地点且为肯定关系。时间 matcher 也接受 `08:30`、`8:30 AM` 等同一时刻写法。
- archived 号码要求匹配短信为 missing；给它发任何近期短信都会使该项失败。

### 4.2 审计 CSV

四列集合必须精确，三条业务记录必须精确，行顺序不敏感。示例行若未删除就属于额外记录并失败。

## 5. 五项之间的边界与常见失败

- archived 短信 getter 使用 `any_body=true`：最近 30 分钟内给 `5551201299` 发任何正文都失败，不只是发会议内容才失败。
- active getter 只要求各号码至少存在一条合格短信；额外不匹配短信不会抹掉已有合格短信。
- `require_positive_relation=true` 会拒绝 `Ops Planning Sync at 8:30 ... maybe confirmed?`、`not confirmed` 或后续取消。
- CSV 使用 exact logical rows：表头集合必须恰好四列，大小写和连续空白归一化；每个 cell 也做同样归一化，三行顺序可交换，重复/多余/遗漏都失败。
- archived 审计行的 `calendar_title` 故意是 brief 中的 `Old Ops Draft`，不是 active title；写成 Ops Planning Sync 会失败。
- Calendar evaluator 不要求结束时间；这是当前评测覆盖宽松点，不能据此把错误结束时间当成符合 instruction 的正确做法。

## 6. Cleanup

清理会删除两台 Linux 的输入/输出和空目录，并清空 Android Calendar 与 SMS。
