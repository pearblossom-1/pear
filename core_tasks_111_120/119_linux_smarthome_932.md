# Core 119 — `linux_smarthome_932`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 119 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_932.json`
- 运行配置：`configs/cross_device/local_2linux_smarthome.json`
- 难度：medium
- 设备拓扑：`2L+1H`（`linux_0`、`linux_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

旧 register 记录 curtain=90，但 DOCX 规定必须以实时 Home 值为准，允许范围是 20–70，只有 live 值超界才修。实时 office curtain=65，已经在范围内，因此绝对不要操作 Home；只需在 register 中记录 live=65、in range=yes、decision=`Live In Range`、final=`no repair`。

## 1. Instruction

### 英文原文（逐字）

```text
`/tmp/ranges/current.docx` on the first Linux machine is the current allowed range, and `/tmp/ranges/register.xlsx` on the second Linux machine records the old configuration. Please read the actual SmartHome properties and complete the reconciliation.
```

### 中文翻译

第一台 Linux 机器上的 `/tmp/ranges/current.docx` 是当前允许范围，第二台 Linux 机器上的 `/tmp/ranges/register.xlsx` 记录旧配置。请读取真实 SmartHome 属性并完成核对。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 Linux 0：`current.docx` 完整内容

该 DOCX 为一页，标题和正文为：

```text
Curtain Range Policy

Use the live SmartHome value when reconciling the register. Repair only when the live value falls outside the allowed range.
```

文档内表格：

| attribute | min | max | repair_rule |
|---|---:|---:|---|
| open_pct | 20 | 70 | repair only if live value outside range |

结构检查确认文档没有评论；范围信息就在正文和这张表中。

### 2.2 Linux 1：`register.xlsx` 修改前内容

运行时路径及最终保存路径：`/tmp/ranges/register.xlsx`

工作簿有 `Register` 和 `Completion Guide` 两个 sheet。

`Register` 修改前：

| Registered | Live | Range | In Range | Decision | Final |
|---:|---|---|---|---|---|
| 90 | 空 | 20-70 | 空 | 空 | 空 |

Completion Guide 要求记录 live 值、是否在范围内、对应决定以及是否需要修复。

### 2.3 SmartHome 初始状态

当前时间：`2026-07-15 10:00`；office occupied=true。

唯一设备：

```text
office_curtain_1: open_pct=65, status=partial
```

初始 command history、schedules、workflows 均为空。

## 3. Setup 具体流程

### `linux_0`

删除旧 DOCX，创建 `/tmp/ranges`，上传 `current.docx`。

### `linux_1`

删除旧 register workbook，创建 `/tmp/ranges`，上传 `register.xlsx`。

### `home_0`

从 episode config 重置 office 和 curtain。Setup 不会自动打开 DOCX 或工作簿。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，后两个是 Home 不应被修复的守护项。

### 4.0 先说人话：怎样才算通过

完全不控制 Home，只把 register 补成“旧值 90、live 65、范围 20-70、在范围内、无需修复”；command history 必须仍为 0。

### 4.1 `Register` sheet 最终逐格值

| Registered | Live | Range | In Range | Decision | Final |
|---:|---:|---|---|---|---|
| 90 | 65 | 20-70 | yes | Live In Range | no repair |

对应单元格：

```text
A1=Registered  B1=Live  C1=Range  D1=In Range  E1=Decision  F1=Final
A2=90          B2=65    C2=20-70 D2=yes       E2=Live In Range F2=no repair
```

Evaluator 要求 sheet 名精确为 `Register`。指定文本逐格比较，不接受把 `Live In Range` 改成 `Within range`；数字 90 和 65 应写成数值。格式、样式和 Completion Guide 不评分。

### 4.2 Home 状态与命令历史

- `office_curtain_1.open_pct` 必须仍为 65；
- 全局 Home command history 必须精确为 0。

因此不能为了把旧 register 的 90 “修正”而把 Home 调到 70、20 或 90。

## 5. 常见失败与真实评测边界

- 把 Registered 90 当目标值操作窗帘：失败。
- 因 90 超过允许上限，就把 live curtain 调回 70：政策要求以 live 65 为准，失败。
- 工作簿只把 A2 改成 65，而不保留旧 registered 90：逐格失败。
- 不操作 Home，但把 Decision 写成 `Repair`：失败。

Evaluator 没有检查 schedules/workflows；它只要求 curtain 最终仍为 65、command history 为 0，并精确检查工作簿。

## 6. Cleanup

- Linux 0 删除 current.docx；
- Linux 1 删除 register.xlsx；
- Home reset；
- 尝试删除空的 `/tmp/ranges`。

