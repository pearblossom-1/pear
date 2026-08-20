# Core 114 — `linux_smarthome_851`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 114 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_851.json`
- 运行配置：`configs/cross_device/local_2linux_smarthome.json`
- 难度：medium
- 设备拓扑：`2L+1H`（`linux_0`、`linux_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

先用 `zones.csv` 把 Z1–Z4 映射到真实房间，再结合请求工作簿和实时 Home inventory 分四种情况处理：

- Z1 → living room：有 curtain，当前 80%，请求 20%，所以执行并改到 20%；
- Z2 → bedroom：房间受保护，虽然灯存在且当前 35%，也不能改；
- Z3 → guest room：请求 heater 24，但实时 inventory 没有 guest-room heater，记录 Missing；
- Z4 → hallway：灯已是 20%，记录 No Action，不重复发送命令。

最终只能产生 1 条 Home command，即调整 living-room curtain。

## 1. Instruction

### 英文原文（逐字）

```text
Use `/tmp/zones/zones.csv` on the first Linux machine to interpret the four zone requests in `/tmp/zones/requests.xlsx` on the second. Check the mapped rooms against the live Home inventory, handle each request according to its protection and availability rules, and complete the request workbook.
```

### 中文翻译

使用第一台 Linux 机器上的 `/tmp/zones/zones.csv` 来解释第二台 Linux 机器 `/tmp/zones/requests.xlsx` 中的四个区域请求。将映射后的房间与实时 Home inventory 核对，按照保护与可用性规则处理每个请求，并完成请求工作簿。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或实际 PNG 附件。

### 2.1 Linux 0：`zones.csv` 原文

```csv
zone,label,room,handling
Z1,blue northwest,living room,normal request
Z2,orange northeast,bedroom,protected room - do not control devices
Z3,green southwest,guest room,normal request subject to device availability
Z4,purple southeast,hallway,normal request subject to live state
```

### 2.2 Linux 1：请求工作簿修改前内容

运行时路径及最终保存路径：`/tmp/zones/requests.xlsx`

工作簿有 `Requests` 和 `Completion Guide` 两个可见 sheet。

`Requests` 修改前：

| Zone | Label | Request | Mapped Room | Live | Decision |
|---|---|---|---|---|---|
| Z1 | blue northwest | curtain 20 | 空 | 空 | 空 |
| Z2 | orange northeast | light 10 | 空 | 空 | 空 |
| Z3 | green southwest | heater 24 | 空 | 空 | 空 |
| Z4 | purple southeast | light 20 | 空 | 空 | 空 |

Completion Guide 定义：

- Live 只能表达 supported、protected、missing、already satisfied；
- Supported 表示已应用；Protected 表示房间政策阻止；Missing 表示设备不存在；No Action 表示实时状态已满足。

### 2.3 SmartHome 初始状态

当前时间：`2026-06-16 19:00`，只有三台设备：

```text
bedroom_dimmable_light_1: on, brightness 35
hallway_dimmable_light_1: on, brightness 20
living_room_curtain_1: open_pct 80, status partial
```

Guest room 存在，但没有 heater。初始 schedules、workflows、history 为空。

### 2.4 配置元数据中的已知不一致

任务 metadata 的 `surfaces` 仍写有 `linux_png_source`，`readiness.linux_sources_present` 也写成 3；但实际 setup 和 asset 目录只有 `zones.csv` 与 `requests.xlsx` 两个 Linux 输入，没有 PNG。这不影响当前执行或 evaluator，但属于陈旧元数据，本文以实际 setup 为准。

## 3. Setup 具体流程

### `linux_0`

删除旧 `zones.csv`，创建 `/tmp/zones`，上传 CSV。

### `linux_1`

删除旧 `requests.xlsx`，创建 `/tmp/zones`，上传请求工作簿。

### `home_0`

从 episode config 重置 Home，建立四个房间和上述三台设备。Setup 不会自动打开 CSV 或工作簿。

## 4. Evaluator：评测方式与具体评测点

本任务有 4 个 evaluator，后两个为不计分守护项。

### 4.0 先说人话：怎样才算通过

只把 living-room curtain 从 80 调到 20；bedroom 灯保持 35，hallway 灯保持 20；然后把工作簿 D–F 列逐格填成下表，并确保 Home history 总计恰好 1 条命令。

### 4.1 living-room curtain

`living_room_curtain_1.open_pct` 必须为 `20`。

### 4.2 `Requests` sheet 逐格精确值

| Zone | Label | Request | Mapped Room | Live | Decision |
|---|---|---|---|---|---|
| Z1 | blue northwest | curtain 20 | living room | supported | Supported |
| Z2 | orange northeast | light 10 | bedroom | protected | Protected |
| Z3 | green southwest | heater 24 | guest room | missing | Missing |
| Z4 | purple southeast | light 20 | hallway | already satisfied | No Action |

Evaluator 要求 sheet 名称精确为 `Requests`，指定文本逐格精确匹配。格式、颜色、列宽不评分；Completion Guide 不评分。此任务没有禁止 Requests 中额外非空单元格，但不要添加无关内容最稳妥。

### 4.3 受保护/已满足状态守护

必须保持：

```text
bedroom_dimmable_light_1: power=on, brightness_pct=35
hallway_dimmable_light_1: power=on, brightness_pct=20
```

### 4.4 全局命令数

Home command history 总数必须恰好为 1。调整 living curtain 就占用这唯一一条；重复设置 hallway、尝试操作受保护 bedroom 或其他额外动作都会失败。

## 5. 常见失败与真实评测边界

- 把 Z2 当成普通请求，将 bedroom 灯改到 10：失败。
- 因 guest room heater 缺失而创建替代设备或操作别处 heater：工作簿/命令数不符。
- 对已是 20 的 hallway 灯重复下命令：即使状态不变，history 变成 2，失败。
- 工作簿用 `Not available` 代替精确的 `missing` / `Missing`：失败。

Evaluator 没有显式检查 schedule/workflow 总数，也没有检查除上述三台设备外的状态。

## 6. Cleanup

- Linux 0 删除 CSV；
- Linux 1 删除 requests workbook；
- Home reset；
- 尝试删除空的 `/tmp/zones`。

