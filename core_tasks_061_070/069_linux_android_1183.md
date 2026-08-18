# Core 069 — `linux_android_1183`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1183.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Grab the booking code from the calendar event, match it against `/tmp/rooms/room_table.csv` by code and date, then write `/tmp/rooms/booking_status.md`.
```

### 中文翻译

从日历取 booking code，按 code+date 匹配 room table，并写 booking_status.md。

## 2. 数据与评测

日历：Client booking BK-4471，2026-07-08，Orchid Room。表中同 code 7/8 available，7/9 hold；另有近似 `BK-447I`。

唯一文本 evaluator 要肯定关联 BK-4471、Orchid Room、2026-07-08，禁止 2026-07-09/not confirmed/cancelled/rejected。推荐：`BK-4471 is confirmed for Orchid Room on 2026-07-08.`

