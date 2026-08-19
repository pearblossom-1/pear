# Core 069 — `linux_android_1183`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 69 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1183.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与匹配结论

Calendar 提供 booking code、日期和地点；Linux 表必须同时按 code 与 date 匹配。正确行是 `BK-4471 / 2026-07-08 / Orchid Room / available`，不是同 code 的次日 hold，也不是把数字 1 写成字母 I 的近似 code。

## 1. Instruction

### 英文原文（逐字）

```text
Grab the booking code from the calendar event, match it against `/tmp/rooms/room_table.csv` by code and date, then write `/tmp/rooms/booking_status.md`.
```

### 中文翻译

从手机 Calendar 事件中取得 booking code，按照 code 和 date 两个条件与 `/tmp/rooms/room_table.csv` 匹配，然后写入 `/tmp/rooms/booking_status.md`。

## 2. 输入、附件与初始业务数据

### 2.1 手机 Calendar

```text
Title: Client booking BK-4471
Start: 2026-07-08 00:00
End: 2026-07-08 02:00
Location: Orchid Room
Description: Booking code BK-4471 for 2026-07-08.
```

真正用于表格匹配的是 code=`BK-4471` 与 date=`2026-07-08`。

### 2.2 Linux `room_table.csv`

```csv
room,booking_code,date,status
Orchid Room,BK-4471,2026-07-08,available
Orchid Room,BK-4471,2026-07-09,hold
Oak Room,BK-447I,2026-07-08,available
```

- 第一行：code 和 date 都匹配。
- 第二行：code 相同，但日期是 2026-07-09，不匹配。
- 第三行：日期相同，但 code 末位是大写字母 `I`，不是数字 `1`，不匹配。

## 3. Setup 具体流程

### `linux_0`

- 删除旧 room_table.csv 与 booking_status.md，创建 `/tmp/rooms`。
- 上传 room_table.csv。

### `android_0`

- 确保 Simple Calendar Pro 可用并清空 Calendar。
- 添加上述唯一 booking event。

## 4. Evaluator：评测方式与具体评测点

本题只有 1 个文本 evaluator，读取 `/tmp/rooms/booking_status.md` 的全文。

### 4.1 稳妥通过示例

```text
BK-4471 is confirmed for Orchid Room on 2026-07-08.
```

### 4.2 实际匹配规则

- 必须出现 `BK-4471`。
- 必须出现 `Orchid Room`。
- 日期接受四种写法之一：`2026-07-08`、`July 8, 2026`、`July 8 2026`、`07/08/2026`。
- 必须至少出现一个肯定 booking 词：`confirmed`、`approved`、`booked`。
- 不能出现 `2026-07-09`、`not confirmed`、`cancelled`、`rejected`。
- 顶层还排除小写 `missing`。
- 问句、不确定语气与局部否定会失败。
- 未配置 clause/近邻绑定，实现在整份 Markdown 中寻找实体与状态词，而不是逐字匹配整篇。

## 5. 常见失败与真实评测边界

- 只写 `BK-4471 / Orchid Room / 2026-07-08 / available`：信息忠实于 CSV，但没有 evaluator 要求的 confirmed/approved/booked，失败。
- 同时写出 7 月 8 日和“忽略 2026-07-09”：仍命中 conflict date，失败。
- 写 `BK-447I`：code 实体不匹配。
- 写成疑问句 “Is BK-4471 confirmed...?”：问号和问句语义失败。

这里存在一处 source 与 evaluator 的语义张力：选中 CSV 行的 status 字面值是 `available`，instruction 只说写 booking_status.md，并没有明确要求把 available 推导成 confirmed；但 evaluator 不接受 `available`，只接受 confirmed/approved/booked。任务仍可按推荐句通过，但该肯定 booking 结论比 source 的原始 status 更强，文档不能把它误说成 CSV 中直接写着 confirmed。

Evaluator 也不检查 Markdown 标题、表格格式或是否提到 2 小时时长；只看上述全文语义条件。

## 6. Cleanup

- Linux 删除 room_table.csv 与 booking_status.md，并清理空目录。
- 手机清空 Calendar。
