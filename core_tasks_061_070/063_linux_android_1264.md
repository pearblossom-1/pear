# Core 063 — `linux_android_1264`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 63 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1264.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与比较结论

Linux CSV 是需要逐条核对的 source list，手机 Calendar 是现场实际值。三条 source event 的结果分别是：1264 完全匹配；1265 时间相同但地点不同；1266 在手机上完全缺失。最终要把三条结果写成一张结构严格的 CSV。

## 1. Instruction

### 英文原文（逐字）

```text
Compare the phone calendar with `/tmp/schedule/schedule_table.csv` and save `/tmp/schedule/calendar_mismatch.csv`. Use exactly these columns: `event_code`, `android_value`, `linux_value`, and `match_status`. Include every source event once, using `matched`, `location_mismatch`, or `missing_android_event` as appropriate. In each `android_value` and `linux_value`, write an event as `YYYY-MM-DDTHH:MM:SS Location` with one space between the timestamp and location; use `missing` when that side has no event.
```

### 中文翻译

比较手机日历与 `/tmp/schedule/schedule_table.csv`，并将结果保存为 `/tmp/schedule/calendar_mismatch.csv`。必须且只能使用 `event_code`、`android_value`、`linux_value`、`match_status` 四列。每个 source event 恰好写一行，并根据情况使用 `matched`、`location_mismatch` 或 `missing_android_event`。`android_value` 和 `linux_value` 中的事件必须写成 `YYYY-MM-DDTHH:MM:SS Location`，时间与地点之间恰好一个空格；某一侧没有事件时写 `missing`。

## 2. 输入、附件与初始业务数据

### 2.1 Linux 附件 `schedule_table.csv`

```csv
event_code,title,start,location
EVT-1264,Dock Briefing,2026-08-04T07:00:00,Dock A
EVT-1265,Yard Check,2026-08-04T08:00:00,Yard B
EVT-1266,Missing Event,2026-08-04T09:00:00,Office
```

这是 source side，所以最终输出必须包含这三个 event_code，各一次。

### 2.2 手机 Calendar 初始事件

事件一：

```text
Title: EVT-1264 Dock Briefing
Start: 2026-08-04 07:00
End: 2026-08-04 08:00
Location: Dock A
Description: event_code EVT-1264
```

事件二：

```text
Title: EVT-1265 Yard Check
Start: 2026-08-04 08:00
End: 2026-08-04 09:00
Location: Yard C
Description: event_code EVT-1265
```

手机没有 EVT-1266。注意 1265 在 Linux 中是 `Yard B`，手机中是 `Yard C`，所以它不是 matched。

## 3. Setup 具体流程

### `linux_0`

- 删除旧的 schedule_table.csv 和 calendar_mismatch.csv，然后创建 `/tmp/schedule`。
- 上传新的 source CSV 到 `/tmp/schedule/schedule_table.csv`。

### `android_0`

- 确保 Simple Calendar Pro 可用。
- 清空原有 Calendar。
- 添加 EVT-1264 与 EVT-1265 两个事件；不添加 EVT-1266。

## 4. Evaluator：评测方式与具体评测点

本题只有 1 个 `check_csv` evaluator，并启用了 exact logical rows。下面就是完整目标：

```csv
event_code,android_value,linux_value,match_status
EVT-1264,2026-08-04T07:00:00 Dock A,2026-08-04T07:00:00 Dock A,matched
EVT-1265,2026-08-04T08:00:00 Yard C,2026-08-04T08:00:00 Yard B,location_mismatch
EVT-1266,missing,2026-08-04T09:00:00 Office,missing_android_event
```

### 4.1 表头怎么比

- 必须恰好有四个逻辑列，不能增加 title、notes 等列，也不能漏列。
- 列名比较会压缩空白并忽略大小写。
- 实现按列名集合比较，没有强制列的物理顺序；但 instruction 明确给出了顺序，按示例写最稳妥。
- CSV 每一行都必须有完整四个 cell；多出未命名 cell 或尾部缺 cell 都会失败。

### 4.2 数据行怎么比

- 三条逻辑记录必须恰好相等，额外行、重复行、漏行都失败。
- `order_sensitive=false`，三行先后次序本身不影响分数。
- 每个 cell 会去除首尾空白、压缩连续空白并忽略大小写后比较；除此之外不是模糊关键词匹配。
- 时间、地点和状态都要形成目标完整值。例如 1265 的 android_value 必须是手机实际的 `... Yard C`，linux_value 必须是 CSV 的 `... Yard B`。
- 1266 的 Android 侧必须用字面值 `missing`，不能留空、写 N/A 或 unknown。

## 5. 常见失败与评测边界

- 只输出 mismatch 行而漏掉 matched 的 1264：失败，因为 instruction 要 every source event。
- 把 EVT-1265 标成 matched：整行不相等，失败。
- 把 EVT-1266 的整个值写成 `missing Office`：失败，目标是单独的 `missing`。
- 使用 `2026-08-04 07:00:00`，少了 `T`：失败。
- 值正确但多一列说明：列集合不精确，失败。

Evaluator 检查生成后的 CSV 内容，不验证你是否真的通过 Calendar UI 读取，也不要求保留 source title。Instruction 说时间与地点之间一个空格；实现会把多个连续空白规范化，所以多个空格也可能通过，但文档仍应按规定写一个。

## 6. Cleanup

- Linux 删除输入 schedule_table.csv 与输出 calendar_mismatch.csv，并清理空目录。
- 手机清空 Calendar。
