# Core 041 — `linux_android_1324`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 41 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1324.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与设备分工

| 设备 | 权威输入或输出 |
|---|---|
| `android_0` | Calendar appointment 的标题、起止时间、地点和 attendee 提示 |
| `android_1` | Contacts 中 Riley Stone 的号码；同时负责发送确认短信 |
| `linux_0` | 只保存 ODT 模板 |
| `linux_1` | 根据前三处信息创建最终 `appointment_agenda.odt` |

本任务有两项等权评分：一项看短信，一项看 ODT。只发送短信或只制作文档都不能整体通过。

## 1. Instruction

### 英文原文（逐字）

```text
Create `/tmp/agenda/appointment_agenda.odt` on the second Linux machine from the appointment, the matching attendee contact, and `/tmp/agenda/template.odt` on the first Linux machine. Follow the template's displayed date/time format, and send the attendee a concise confirmation text with the appointment, time, and location.
```

### 中文翻译

根据日历中的 appointment、匹配的 attendee 联系人和第一台 Linux 上的 `/tmp/agenda/template.odt`，在第二台 Linux 创建 `/tmp/agenda/appointment_agenda.odt`。遵循模板显示的日期/时间格式，并向 attendee 发送一条包含 appointment、时间和地点的简短确认短信。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机：Calendar 事件

| 字段 | 值 |
|---|---|
| Title | `APPT-1324 Vendor Review` |
| Start | `2026-08-15 08:00`；时间戳 `1786780800` |
| End | `2026-08-15 09:00`；时间戳 `1786784400` |
| Location | `Room 4` |
| Description | `attendee Riley Stone phone 5551201324` |

### 2.2 第二部手机：Contacts

| 联系人 | 号码 | Notes | 作用 |
|---|---|---|---|
| Riley Stone | `5551201324` | `Vendor contact for APPT-1324` | 正确 attendee |
| Riley Stoner | `5551201399` | `Near-name decoy` | 近名干扰项 |

SMS 在 setup 时被清空，因此确认消息必须在本轮任务中发送。

### 2.3 第一台 Linux：ODT 模板

- 源文件：`tasks/cross_device/linux_android_assets/linux_android_1324/source/tmp/agenda/template.odt`
- 注入路径：`linux_0:/tmp/agenda/template.odt`
- 类型：有效的 ODF text 包
- 七个可见段落原文：

```text
Appointment Agenda
Appointment: [[APPOINTMENT]]
Date and time: [[DATE_TIME]] (format: YYYY-MM-DD HH:MM-HH:MM)
Location: [[LOCATION]]
Attendee: [[ATTENDEE]]
Phone: [[PHONE]]
Confirmation: [[CONFIRMATION]]
```

### 2.4 预期输出

- `linux_1:/tmp/agenda/appointment_agenda.odt`
- `android_1` 发往 `5551201324` 的 sent SMS

模板不会自动复制到第二台 Linux；需要跨设备使用它。

## 3. Setup 具体流程

### `linux_0`

删除旧模板、创建 `/tmp/agenda`，再上传固定 `template.odt`。

### `linux_1`

删除旧 `/tmp/agenda/appointment_agenda.odt` 并创建目录；不预置模板或半成品。

### `android_0`

确保 Simple Calendar Pro 可用，清空 Calendar，再写入第 2.1 节唯一事件。

### `android_1`

确保 Contacts 可用，清空联系人并添加正确联系人和近名干扰项；随后确保 Simple SMS Messenger 可用并清空 SMS。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

给 `5551201324` 发送例如：

```text
APPT-1324 Vendor Review is confirmed for 08:00 in Room 4.
```

并在第二台 Linux 创建真实 ODT。最稳妥的七段正文是：

```text
Appointment Agenda
Appointment: APPT-1324 Vendor Review
Date and time: 2026-08-15 08:00-09:00
Location: Room 4
Attendee: Riley Stone
Phone: 5551201324
Confirmation: text
```

### 4.1 确认短信（权重 `1/2`）

- 只查看 `android_1` 的 sent box，地址为 `5551201324`，时间窗口为最近 30 分钟。
- 正文必须同时匹配 `APPT-1324`、`Vendor Review`、`08:00`、`Room 4`。
- 时间短语按时刻规则匹配，因此 `8:00`、`08:00`、`8 AM`、`8:00 AM` 都可表达同一时刻。
- `require_positive_relation=true`：问句、maybe/uncertain、不确认、取消或后续撤销不能通过。
- 不是全文绝对匹配，也没有要求只存在一条短信；只要至少一条近期消息合格即可。
- 没有对近名号码 `5551201399` 配置负向 guard。误发给干扰联系人不会抹掉一条已合格的正确短信，但不符合 instruction。

### 4.2 ODT（权重 `1/2`）

- 精确读取 `/tmp/agenda/appointment_agenda.odt`，必须是可解析的 ODF text 包，并含 `styles.xml`、`meta.xml`。
- 至少有 7 个可见段落，保留 `Appointment Agenda`；六种 `[[...]]` placeholder 均不得残留。
- 六组 label/value 必须分别位于同一可见段落，匹配不区分大小写：
  - Appointment ↔ `APPT-1324 Vendor Review`
  - Date and time ↔ `2026-08-15 08:00-09:00`
  - Location ↔ `Room 4`
  - Attendee ↔ `Riley Stone`
  - Phone ↔ `5551201324`
  - Confirmation ↔ 单词 `text`
- 日期时间在 ODT 中没有配置别名，建议严格按模板的 `YYYY-MM-DD HH:MM-HH:MM` 写法。
- 当前 evaluator 只规定“至少 7 段”和段落关系，没有锁定恰好七段、字体、页面方向或模板几何；额外无冲突段落可能不会失败。

## 5. 常见失败与不评测项

- 把日期写成 `08/15/2026 8:00 AM`：短信可以容忍时间别名，但 ODT 的日期时间关系不接受该格式。
- 只写 `APPT-1324` 而漏掉 `Vendor Review`：短信和 ODT 都不完整。
- 给 Riley Stoner 发短信：地址 evaluator 不匹配。
- 把六个 value 集中写在一个 token list、labels 留在别处：各组同段关系可能不成立。
- ODT evaluator 对 Confirmation 的硬要求只是 label 与单词 `text` 同段，并不验证它是一句自然确认；这是当前评测合同的宽松点。

Evaluator 不比较 ODT 文件哈希，也不证明它一定从原模板复制而来。

## 6. Cleanup

清理会删除两台 Linux 的模板/结果、清空第一部手机 Calendar，并清空第二部手机 Contacts 与 SMS；空目录会被移除。
