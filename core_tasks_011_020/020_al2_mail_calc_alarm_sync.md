# Core 020 — `al2_mail_calc_alarm_sync`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 20 项
- 任务文件：`tasks/cross_device/real300/al2_mail_calc_alarm_sync.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 50 步，最长 300 秒

## 1. Instruction

### 英文原文（逐字）

```text
The Thunderbird email file `/tmp/shift/shift_email.eml` on the first Linux machine explains that the enabled Reminder alarm at 07:30 in Android Clock is an early fallback that must stay in place. The Morning row in `/tmp/shift/roster.xlsx` in LibreOffice Calc on the second Linux machine is authoritative for the actual departure alarm. Keep the fallback, add the enabled alarm from that roster row, and write `/tmp/shift/log.json` on the second Linux machine recording the sequence from the fallback to the actual alarm, including both labels and times.
```

### 中文翻译

第一台 Linux 机器上的 Thunderbird 邮件文件 `/tmp/shift/shift_email.eml` 说明，Android Clock 中 07:30 的已启用 `Reminder` 闹钟是必须保留的提前后备闹钟。第二台 Linux 机器上 LibreOffice Calc 中 `/tmp/shift/roster.xlsx` 的 Morning 行是实际出发闹钟的权威来源。请保留后备闹钟，新增该 roster 行给出的已启用闹钟，并在第二台 Linux 的 `/tmp/shift/log.json` 中记录从后备闹钟到实际闹钟的顺序，包含两个标签和时间。

## 2. 输入、附件与初始业务数据

### 2.1 Android 已有闹钟

```text
Reminder — 07:30 — enabled
```

### 2.2 第一台 Linux 的 EML

- 发件人：`shift-desk@example.com`
- 收件人：`site-leads@example.com`
- 主题：`Shift alarm reconciliation`
- 日期头：`Thu, 11 Jun 2026 18:45:00 +0000`
- 正文完整业务信息：

```text
The phone already has an enabled Reminder alarm at 07:30. It is the early fallback for travel readiness and should remain enabled.
Use the spreadsheet on the second Linux machine as the authority for the actual departure alarm for the next shift.

Read the row for the 2026-06-12 Morning shift in Calc. The spreadsheet—not this email—is the source for the actual alarm label and time.

Keep the fallback, add the actual departure alarm, and record their sequence in the reconciliation log.
```

### 2.3 第二台 Linux 的 `roster.xlsx`

工作表 `Sheet1` 的完整表格：

| Date | Shift | Alarm Label | Alarm Time | Owner |
|---|---|---|---|---|
| 2026-06-12 | Morning | Pickup | 08:20 | Mina |
| 2026-06-12 | Midday | Dock check | 12:10 | Ravi |
| 2026-06-13 | Morning | Gate open | 07:45 | Iris |

权威目标是日期 `2026-06-12` 的 `Morning` 行，因此实际闹钟为 `Pickup`、`08:20`。

## 3. Setup 具体流程

### `android_0`

清空 Clock 后预置已启用的 `Reminder`、07:30。

### `linux_0`

重建 `/tmp/shift` 并上传 `shift_email.eml`。

### `linux_1`

重建 `/tmp/shift` 并上传 `roster.xlsx`；`log.json` 初始不存在。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，各占 `1/3`。

### 4.0 先说人话：怎样才算通过

Android Clock 最终保留并启用：

```text
Reminder — 07:30
Pickup — 08:20
```

第二台 Linux 写入最小、最稳妥的 JSON：

```json
{
  "old": {
    "label": "Reminder",
    "time": "07:30"
  },
  "new": {
    "label": "Pickup",
    "time": "08:20"
  }
}
```

### 4.1 两个闹钟（各占 `1/3`）

- 分别检查 `Reminder` 07:30 enabled 和 `Pickup` 08:20 enabled 是否存在。
- 删除、关闭或改名任一目标闹钟都会使对应项失败。
- 两项都是存在性检查，没有限制其他无关闹钟总数。

### 4.2 `/tmp/shift/log.json`（权重 `1/3`）

- `func`：`check_semantic_change`
- 文件必须是有效 JSON，并能提取出恰好一条 old→new 关系。
- old 侧必须同时包含 `Reminder` 与 `07:30`。
- new 侧必须同时包含 `Pickup` 与 `08:20`。
- 允许用 `old/new`、`before/after`、`from/to` 等受支持的结构表达；键顺序不重要。
- 新值出现在 old 侧、旧值出现在 new 侧、存在两条独立变化关系、声称 unchanged 或互相矛盾都会失败。
- evaluator 不要求修改 `roster.xlsx`，也不检查 EML 文件本身；它们只是信息源。

