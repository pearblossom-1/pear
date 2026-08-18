# Core 011 — `al2_alarm_calc_email`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 11 项
- 任务文件：`tasks/cross_device/real200/al2_alarm_calc_email.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 70 步，最长 540 秒

## 1. Instruction

### 英文原文（逐字）

```text
The Android Clock app has a `Delivery` alarm. Please open `/tmp/delivery/schedule.xlsx` in LibreOffice Calc on the first Linux machine, find the Delivery row and fill in the alarm time, then create a notification draft in Thunderbird on the second Linux machine.
```

### 中文翻译

Android Clock 应用中有一个名为 `Delivery` 的闹钟。请在第一台 Linux 机器上用 LibreOffice Calc 打开 `/tmp/delivery/schedule.xlsx`，找到 Delivery 行并填写闹钟时间，然后在第二台 Linux 机器的 Thunderbird 中创建一封通知草稿。

## 2. 输入、附件与初始业务数据

### 2.1 Android Clock 闹钟

第一部手机被清空旧闹钟后，预置一个已启用闹钟：

| 字段 | 值 |
|---|---|
| 标签 | `Delivery` |
| 时间 | `08:45` |

### 2.2 第一台 Linux 的 XLSX 附件

- 仓库源文件：`tasks/cross_device/real200_assets/al2_alarm_calc_email/source/visible/deb4d71f_schedule.xlsx`
- 注入路径：`linux_0:/tmp/delivery/schedule.xlsx`
- 工作表：`Schedule`
- 使用范围：`A1:H13`

完整可见数据如下；`Delivery` 行的 `alarm_time` 初始为空：

| item | window | alarm_time | notify | owner | route | source | notes |
|---|---|---|---|---|---|---|---|
| Delivery | morning |  |  | Nora Bell | R-18 | Android Clock | Notify delivery-team@example.test after update |
| Inventory | afternoon | 15:00 | unchanged | Mina Park | R-04 | legacy | Do not edit |
| Cleanup | evening | 18:30 | unchanged | Owen Diaz | R-07 | legacy | Do not edit |
| ITE-504 | Wed 12:00 | alarm_time-04 | do not edit unless matched | Emi Carter | route-04 | source-04 | do not edit unless matched |
| ITE-505 | Wed 13:00 | alarm_time-05 | secondary queue | Finn Brooks | route-05 | source-05 | secondary queue |
| ITE-506 | Wed 14:00 | alarm_time-06 | distractor row | Avery Stone | route-06 | source-06 | distractor row |
| ITE-507 | Wed 15:00 | alarm_time-07 | unchanged | Blair Lee | route-07 | source-07 | unchanged |
| ITE-508 | Wed 08:00 | alarm_time-08 | waiting for source update | Casey Wu | route-08 | source-08 | waiting for source update |
| ITE-509 | Wed 09:00 | alarm_time-09 | historical reference | Devon Rao | route-09 | source-09 | historical reference |
| ITE-510 | Wed 10:00 | alarm_time-10 | do not edit unless matched | Emi Carter | route-10 | source-10 | do not edit unless matched |
| ITE-511 | Wed 11:00 | alarm_time-11 | secondary queue | Finn Brooks | route-11 | source-11 | secondary queue |
| ITE-512 | Wed 12:00 | alarm_time-12 | distractor row | Avery Stone | route-12 | source-12 | distractor row |

### 2.3 第二台 Linux 的邮件环境

Thunderbird 使用隔离的本地账户：

- 发件身份：`Field Operator <agent@example.test>`
- 本地配置目录：`~/.thunderbird/mail.default-release`
- `Drafts` 初始为空
- 通知目标来自表格备注：`delivery-team@example.test`

## 3. Setup 具体流程

### `android_0`

1. 确保 Clock 可用。
2. 清空现有闹钟。
3. 新增 `Delivery`、`08:45` 闹钟。

### `linux_0`

1. 创建 `/tmp/delivery`。
2. 上传源工作簿为 `/tmp/delivery/schedule.xlsx`。
3. 删除可能残留的 LibreOffice 锁文件 `.~lock.schedule.xlsx#`。

### `linux_1`

1. 删除旧的任务专用 Thunderbird profile。
2. 重建本地账户和 `profiles.ini`、`prefs.js`。
3. 创建空的 `Drafts` 邮箱文件。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，各占 `1/2`；完整通过要求二者都成功。

### 4.0 先说人话：怎样才算通过

只做两件事：

1. 在第一台 Linux 的原工作簿中，只把 `Schedule!C2` 填成 `08:45`，其他单元格不要动。
2. 在第二台 Linux 留一封收件人为 `delivery-team@example.test` 的未发送草稿，正文明确写出 Delivery 和 08:45。

最稳妥的正文是：

```text
Delivery is scheduled for 08:45.
```

主题不评分。把邮件发送出去、收件人多写一个、只在主题里写信息、正文写成疑问或否定，都会使邮件项失败。

### 4.1 工作簿（权重 `1/2`）

- `func`：`check_xlsx_cells`
- 必须仍是可解析的 XLSX，工作表名称仍为 `Schedule`。
- 允许变化的唯一单元格是 `Schedule!C2`。
- 明确检查 `A1=item`、`A2=Delivery`、`C2=08:45`，并禁止 `C2` 为空。
- evaluator 还将输出与源工作簿比较：除 `C2` 外，所有原有非空单元格、工作表集合、合并区域以及行列隐藏状态都要保留；增加或删改其他业务单元格也会失败。

### 4.2 Thunderbird 草稿（权重 `1/2`）

- `result.type`：`thunderbird_draft_state`
- 必须在指定 profile 的 Drafts 中找到一封匹配草稿。
- 收件人集合必须恰好是 `{delivery-team@example.test}`。
- 正文必须正面陈述 `Delivery`，并包含 `08:45`、`8:45 AM` 或 `8:45AM` 中至少一种时间写法。
- evaluator 按句子/行判断极性；疑问、不确定、否定、取消或后文推翻前文均不算正面通知。
- 不检查主题，也不要求附件。

