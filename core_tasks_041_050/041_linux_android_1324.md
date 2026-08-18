# Core 041 — `linux_android_1324`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1324.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`；拓扑 `2A+2L`
- 限制：最多 50 步；未单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Create `/tmp/agenda/appointment_agenda.odt` on the second Linux machine from the appointment, the matching attendee contact, and `/tmp/agenda/template.odt` on the first Linux machine. Follow the template's displayed date/time format, and send the attendee a concise confirmation text with the appointment, time, and location.
```

### 中文翻译

根据日历 appointment、匹配的参会联系人和第一台 Linux 的 `/tmp/agenda/template.odt`，在第二台 Linux 创建 `/tmp/agenda/appointment_agenda.odt`。使用模板显示的日期时间格式，并向参会者发送包含 appointment、时间和地点的简短确认短信。

## 2. 输入、附件与 Setup

模板七段原文：`Appointment Agenda`；`Appointment: [[APPOINTMENT]]`；`Date and time: [[DATE_TIME]] (format: YYYY-MM-DD HH:MM-HH:MM)`；`Location`；`Attendee`；`Phone`；`Confirmation`。

第一部手机日历：`APPT-1324 Vendor Review`，2026-08-15 08:00–09:00，`Room 4`，描述指向 Riley Stone / 5551201324。第二部手机 Contacts 有正确 `Riley Stone / 5551201324`，另有近名干扰 `Riley Stoner / 5551201399`；SMS 初始清空。Linux 1 的目标 ODT 初始不存在。

## 3. Evaluator 与通过标准

本任务 2 项评分。

### 先说人话

给 `5551201324` 发例如 `APPT-1324 Vendor Review is confirmed for 08:00 in Room 4.`；创建真实 ODT，替换全部六类 placeholder，并按模板逐段写：appointment、`2026-08-15 08:00-09:00`、Room 4、Riley Stone、号码、text confirmation。

- 短信：最近 30 分钟、目标号码正确，正文同时 contains `APPT-1324`、`Vendor Review`、`08:00`、`Room 4`，并为肯定关系；不是整句绝对匹配。
- ODT：必须是有效 ODF text 包，含 styles.xml、meta.xml，至少 7 个段落；标题保留，所有 `[[...]]` 禁止残留。
- 每组 label 和 value 必须位于同一肯定段落；日期格式必须精确为 `2026-08-15 08:00-09:00`。

