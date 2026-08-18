# Core 048 — `linux_android_1853`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1853.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`；拓扑 `2A+1L`
- 限制：最多 60 步，最长 480 秒

## 1. Instruction

### 英文原文（逐字）

```text
Create a Thunderbird draft for the current meeting handoff using the Simple Calendar Pro event on the first phone, the matching Contacts attendee on the second phone, and `/tmp/attend/attendee_roles.csv` on Linux. Address the matching attendee and include the meeting case and approval code, route, location, and scheduled time. Leave it as a draft; do not send it.
```

### 中文翻译

使用第一部手机日历事件、第二部手机匹配联系人和 Linux attendee_roles.csv，创建当前 meeting handoff 的 Thunderbird 草稿。收件人为匹配 attendee，正文写 case/code、route、location 和 scheduled time；只留草稿，不发送。

## 2. 输入、附件与 Setup

- Calendar：`CASE-1853 source event`，2026-07-18 09:50–10:35，Harbor Gate 2，描述 RT-53。
- Contact：`Ari Singh / +15552001829`，notes 含 `ari.singh@example.test; Support owner`。
- CSV current 行：`CASE-1853,FB-1853,Support owner,current`；另有 archived/hold 干扰。
- Linux 重建隔离 Thunderbird profile，Drafts 与 Sent 都初始为空。

## 3. Evaluator 与通过标准

本任务 2 项。留一封草稿，To 只写 `ari.singh@example.test`，正文可写：`CASE-1853 / FB-1853, RT-53 meeting handoff is scheduled at Harbor Gate 2 on 2026-07-18 09:50.`

- draft evaluator 在 Drafts 邮箱中找同一封邮件；正文必须包含 case，以及 code、route、location、time 四组事实。
- 不能出现 cancelled/wrong time/wrong location/do not send；主题和附件不检查。
- folder evaluator 要求 Inbox 与 Sent 都为空；一旦发送，即使还留草稿，也会破坏 Sent 精确状态。

