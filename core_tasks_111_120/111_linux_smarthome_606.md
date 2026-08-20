# Core 111 — `linux_smarthome_606`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 111 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_606.json`
- 运行配置：`configs/cross_device/local_2linux_smarthome.json`
- 难度：hard
- 设备拓扑：`2L+1H`（`linux_0`、`linux_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

这题不是照着旧快照把三个房间都修一遍。必须用实时 Home 状态覆盖旧快照，再按 PDF 政策决定是否自动处理：

- kitchen：旧快照 PM2.5=92，但实时值已经是 35，低于 70，不做动作；
- bathroom：旧快照湿度 78，实时仍为 76，仍高于 70，而且政策允许 Auto Fix，所以打开除湿机并设为 high；
- office：旧快照温度 30，实时仍为 29，确实高于 28，但政策只允许人工复核，不能自动开空调。

因此 Home 中只能自动修 bathroom；同时要把三行判断完整写回 `result.xlsx`。

## 1. Instruction

### 英文原文（逐字）

```text
Please help reconcile the records using the current policy at `/tmp/reconcile/policy.pdf`, the old snapshot at `/tmp/reconcile/snapshot.json`, and the workbook at `/tmp/reconcile/result.xlsx`. Treat the live home state as authoritative; only fix the item that is still violating policy and is allowed for automatic handling, then complete the workbook.
```

### 中文翻译

请使用 `/tmp/reconcile/policy.pdf` 中的当前政策、`/tmp/reconcile/snapshot.json` 中的旧快照以及 `/tmp/reconcile/result.xlsx` 工作簿来核对记录。以 Home 的实时状态为准；只修复仍违反政策且允许自动处理的项目，然后完成工作簿。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 Linux 0：政策 PDF

运行时路径：`/tmp/reconcile/policy.pdf`

PDF 只有 1 页，标题为 `Current Remediation Policy`，可见政策原文是：

```text
PM2.5
Above 70: Critical with Auto Fix.

HUMIDITY
Above 70: High with Auto Fix.

TEMPERATURE
Above 28: High with Manual review only.
```

也就是说，PM2.5 和湿度超阈值可自动修复；温度超阈值只能记录为人工复核。

### 2.2 Linux 1：旧快照 JSON

运行时路径：`/tmp/reconcile/snapshot.json`

```json
{
  "bathroom": {"humidity": 78},
  "kitchen": {"pm25": 92},
  "office": {"temperature": 30}
}
```

这些是旧值，不能直接当成当前状态。

### 2.3 Linux 1：源工作簿

运行时路径，同时也是最终保存路径：`/tmp/reconcile/result.xlsx`

工作簿有两个可见 sheet：`Result` 和 `Completion Guide`。

`Result` 修改前内容：

| Room | Metric | Snapshot Value | Live Value | Current Severity | Auto Fix | Decision |
|---|---|---:|---|---|---|---|
| kitchen | PM2.5 | 92 | 空 | 空 | 空 | 空 |
| bathroom | humidity | 78 | 空 | 空 | 空 | 空 |
| office | temperature | 30 | 空 | 空 | 空 | 空 |

`Completion Guide` 写明：

- `Room`、`Metric`、`Snapshot Value` 已预填，要与实时 Home 数值比较；
- Decision 应在“旧快照已过期/无需动作”“批准自动修复”“人工复核”之间按政策选择。

### 2.4 SmartHome 初始状态

当前时间：`2026-06-25 12:00`；初始 schedules、workflows 和 history 都为空。

| 房间 | 实时环境值 | 相关设备初态 |
|---|---|---|
| bathroom | humidity=76 | `bathroom_dehumidifier_1`：off、low |
| kitchen | PM2.5=35 | `kitchen_air_purifier_1`：off、low |
| office | temperature=29 | `office_air_conditioner_1`：off、cool、26°C |

## 3. Setup 具体流程

### `linux_0`

1. 删除旧 `/tmp/reconcile/policy.pdf`；
2. 创建 `/tmp/reconcile`；
3. 上传本题 policy PDF。

### `linux_1`

1. 删除旧 `snapshot.json` 和 `result.xlsx`；
2. 创建 `/tmp/reconcile`；
3. 上传旧快照和待填写工作簿。

### `home_0`

使用本任务 `episode_config.json` 重置 Home，写入上述三个房间、三台设备和空计划/空历史状态。

Setup 不会自动打开 PDF、JSON 或工作簿，执行者需要自己在对应 Linux 桌面打开或读取。

## 4. Evaluator：评测方式与具体评测点

本任务有 4 个 evaluator，其中后两个是 `enable_score_calc=false` 的守护项；要完整通过任务，仍应全部满足。

### 4.0 先说人话：怎样才算通过

必须同时做到：

1. bathroom 除湿机最终为 `on + high`；
2. kitchen 净化器和 office 空调保持原样；
3. Home 命令历史总数恰好为 2；
4. `Result` sheet 的 28 个指定单元格与下表完全一致。

最自然的两条 Home 命令是：打开 bathroom 除湿机、把档位设为 high。多操作任何 Home 设备都会让命令数超过 2。

### 4.1 bathroom 设备状态

`bathroom_dehumidifier_1` 必须满足：

```text
power = on
level = high
```

这是字段子集匹配；设备记录中存在其他无关字段不会导致失败。

### 4.2 `result.xlsx` 逐格检查

Evaluator 使用 `check_xlsx_cells`，要求存在名称精确为 `Result` 的 sheet，并逐格比较下列值：

| Room | Metric | Snapshot Value | Live Value | Current Severity | Auto Fix | Decision |
|---|---|---:|---:|---|---|---|
| kitchen | PM2.5 | 92 | 35 | Normal | Yes | No action - snapshot stale |
| bathroom | humidity | 78 | 76 | High | Yes | Run dehumidifier high |
| office | temperature | 30 | 29 | High | No | Manual review |

边界说明：

- 这些指定文本基本是逐格精确匹配，大小写、空格和标点不要自行改写；
- 数值单元格会按可见值转成字符串比较，因此数字 `35` 是最稳妥写法；
- 单元格格式、字体、颜色、列宽不参与评分；
- `Completion Guide` sheet 的内容不参与这项评分；
- 此任务没有开启 `reject_extra_nonempty_cells`，但最稳妥做法仍是只填要求的空白格。

### 4.3 未受影响设备守护

以下状态必须保持：

```text
kitchen_air_purifier_1: power=off, level=low
office_air_conditioner_1: power=off, mode=cool, target_temperature_c=26
```

所以不能因为旧快照 PM2.5=92 就开 kitchen 净化器，也不能因为 office 当前 29°C 就自动开空调。

### 4.4 全局命令数

Home history 中匹配任意命令的记录总数必须恰好为 2。它只数直接 Home command，不检查命令的文字说明；目标设备状态和未改设备守护共同限定了这两条命令应当做什么。

## 5. 常见失败与真实评测边界

- 按旧快照同时处理 kitchen、bathroom、office：失败。
- 把 office 自动降温：违反 Manual review only，并破坏空调初态守护。
- bathroom 只开机但仍为 low，或只设 high 但没开机：失败。
- 工作簿写 `Stale snapshot`、`Auto fix` 等同义句：逐格文本不等，失败。
- 正确填表但没有操作除湿机：Home evaluator 失败。

Evaluator 没有要求修改或删除旧快照，也没有检查 PDF/JSON 的最终状态；它检查的是最终工作簿、三台相关设备以及全局命令数。

## 6. Cleanup

- Linux 0 删除 policy PDF；
- Linux 1 删除 snapshot 和 result workbook；
- Home reset；
- 尝试删除空的 `/tmp/reconcile` 目录。

