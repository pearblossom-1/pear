# Core 063 — `linux_android_1264`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1264.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Compare the phone calendar with `/tmp/schedule/schedule_table.csv` and save `/tmp/schedule/calendar_mismatch.csv`. Use exactly these columns: `event_code`, `android_value`, `linux_value`, and `match_status`. Include every source event once, using `matched`, `location_mismatch`, or `missing_android_event` as appropriate. In each `android_value` and `linux_value`, write an event as `YYYY-MM-DDTHH:MM:SS Location` with one space between the timestamp and location; use `missing` when that side has no event.
```

### 中文翻译

比较手机日历和 schedule_table.csv，按四个精确列及指定值格式输出 calendar_mismatch.csv；每个源事件正好一次，并按 matched/location_mismatch/missing_android_event 分类。

## 2. 数据与精确输出

Linux 行：1264 Dock A 07:00；1265 Yard B 08:00；1266 Office 09:00。Android：1264 Dock A；1265 同时刻但 Yard C；无 1266。

唯一 CSV evaluator 要求无额外记录：

```csv
event_code,android_value,linux_value,match_status
EVT-1264,2026-08-04T07:00:00 Dock A,2026-08-04T07:00:00 Dock A,matched
EVT-1265,2026-08-04T08:00:00 Yard C,2026-08-04T08:00:00 Yard B,location_mismatch
EVT-1266,missing,2026-08-04T09:00:00 Office,missing_android_event
```

