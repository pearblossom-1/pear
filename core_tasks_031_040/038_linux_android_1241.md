# Core 038 — `linux_android_1241`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 38 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1241.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`
- 限制：最多 50 步；任务文件没有单独设置最长秒数

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

- `linux_0`：上传 brief.odt 和带示例行的模板，清理输出 CSV。
- `linux_1`：上传 attendees.csv。
- `android_0`：清空 Calendar 和 SMS。

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

- 日历匹配标题、08:30 开始时间和地点；结束时间不评测。
- 两位 active 人员各要有最近 30 分钟的匹配 sent 短信，正文含标题、8:30、地点且为肯定关系。
- archived 号码要求匹配短信为 missing；给它发任何近期短信都会使该项失败。

### 4.2 审计 CSV

四列集合必须精确，三条业务记录必须精确，行顺序不敏感。示例行若未删除就属于额外记录并失败。

