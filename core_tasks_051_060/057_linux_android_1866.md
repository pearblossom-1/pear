# Core 057 — `linux_android_1866`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1866.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`；拓扑 `2A+2L`
- 限制：最多 70 步，最长 600 秒

## 1. Instruction

### 英文原文（逐字）

```text
Create `/tmp/attendees/packet.odt` on the second Linux desktop using the Simple Calendar Pro event, the matching Android contact, and the Linux files `/tmp/attendees/attendee_matrix.csv` and `/tmp/agenda/agenda_template.odt`. Complete every visible template field, including the attendee role, while preserving the labeled layout.
```

### 中文翻译

用日历事件、匹配 Android 联系人、attendee_matrix.csv 和 agenda_template.odt，在第二台 Linux 创建 packet.odt；填写所有可见字段（包括 role）并保留标签布局。

## 2. 输入、附件与 Setup

Calendar：CASE-1866，2026-07-11 09:00，Harbor Gate 15，RT-66。Contact：Nora Alvarez / +15552001830 / nora.alvarez@example.test / Release coordinator。CSV ready 行补 code FB-1866。ODT 模板九段，字段为 Case/Approval、Attendee name/phone/email、Role、Event time/location/route、Status、Notes、Review、Handoff。

## 3. Evaluator 与通过标准

唯一 evaluator 要求真实 ODF text 包、styles.xml/meta.xml、至少 9 段、无任何 placeholder。必须逐段肯定关联：Case+CASE-1866+FB-1866；Attendee+三项联系信息；Role+Release coordinator；Event+时间+Harbor Gate 15+RT-66；Status+ready。禁止 archived/hold 干扰。标题 `Calendar Attendee Packet` 必须保留。

