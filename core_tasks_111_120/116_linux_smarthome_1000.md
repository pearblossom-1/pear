# Core 116 — `linux_smarthome_1000`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 116 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_1000.json`
- 运行配置：`configs/cross_device/local_2linux_smarthome.json`
- 难度：medium
- 设备拓扑：`2L+1H`（`linux_0`、`linux_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

工作簿有四个请求，必须逐个结合 HTML 政策和实时设备 capability 判断：

- R1 office curtain 50：`open_pct` 可写，执行到 50；
- R2 living temperature 23：living room 有空调，政策允许把“房间+温度”解释为直接空调请求；先开机，再设目标 23，保持当前 heat mode；
- R3 entry brightness 30：entry 是普通 light，不支持 brightness，记录 Unsupported，不操作；
- R4 office vacuum battery 80：battery 是只读 telemetry，只记录当前 18，不能改。

Home command history 最终必须恰好 3 条：窗帘 1 条、living AC 开机和改目标温度 2 条。

## 1. Instruction

### 英文原文（逐字）

```text
`/tmp/capability/policy.html` on the first Linux machine defines writable and read-only fields, and `/tmp/capability/board.xlsx` on the second Linux machine has four requests. Query Home, perform only the supported changes, complete the board's Decision and After columns, and save it at the same path.
```

### 中文翻译

第一台 Linux 机器上的 `/tmp/capability/policy.html` 定义了可写和只读字段，第二台 Linux 机器上的 `/tmp/capability/board.xlsx` 包含四个请求。查询 Home，只执行受支持的修改，完成工作簿中的 Decision 和 After 列，并保存回原路径。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 Linux 0：政策 HTML

运行时路径：`/tmp/capability/policy.html`

页面标题：`Capability Field Policy`。核心表格：

| field | handling |
|---|---|
| open_pct | writable |
| target_temperature_c | writable via air conditioner |
| brightness_pct | requires dimmable light |
| battery_pct | read only telemetry |

页面另有一段关键规则：如果请求只写房间和温度，而该房间有 air conditioner，这就是获批的直接空调请求；设置目标温度前先把空调打开。

### 2.2 Linux 1：`board.xlsx` 修改前内容

运行时路径及最终保存路径：`/tmp/capability/board.xlsx`

工作簿有 `Board` 和 `Completion Guide` 两个 sheet。`Board` 修改前只预填 Row 和 Request：

| Row | Request | Capability | Policy | Evidence | Decision | After |
|---|---|---|---|---|---|---|
| R1 | office curtain 50 | 空 | 空 | 空 | 空 | 空 |
| R2 | living temperature 23 | 空 | 空 | 空 | 空 | 空 |
| R3 | entry brightness 30 | 空 | 空 | 空 | 空 | 空 |
| R4 | office vacuum battery 80 | 空 | 空 | 空 | 空 | 空 |

Completion Guide 定义：

```text
Execute = approved command applied to the requested device
Unsupported = capability absent
Readonly = observation only
```

### 2.3 SmartHome 初始状态

当前时间：`2026-07-15 14:00`。直接相关设备：

```text
office_curtain_1:
  open_pct=10, status=partial

living_room_air_conditioner_1:
  power=off, mode=heat, target_temperature_c=20

entry_light_1:
  device_type=light, power=off

office_robot_vacuum_1:
  power=on, status=docked, battery_pct=18
```

Entry 没有 dimmable light。初始 schedules、workflows、history 为空。

## 3. Setup 具体流程

### `linux_0`

删除旧 policy HTML，创建 `/tmp/capability`，上传 `policy.html`。

### `linux_1`

删除旧 `board.xlsx`，创建 `/tmp/capability`，上传源工作簿。

### `home_0`

使用 episode config 重置 Home，建立五个房间和相关设备初态。Setup 不会自动打开 HTML 或 workbook。

## 4. Evaluator：评测方式与具体评测点

本任务有 4 个 evaluator，其中 entry-light 和 command-count 是守护项。

### 4.0 先说人话：怎样才算通过

Office curtain 改到 50；living AC 打开并把目标温度改到 23，但 mode 保持 heat；entry light 继续 off；office vacuum 继续 docked 且 battery=18。随后把 `Board` sheet 的每个指定单元格填成 evaluator 的固定文本，并确保总命令数为 3。

### 4.1 `Board` sheet 的最终逐格内容

| Row | Request | Capability | Policy | Evidence | Decision | After |
|---|---|---|---|---|---|---|
| R1 | office curtain 50 | set_open_pct supported | approved | live open_pct 10 | Execute | open_pct 50 |
| R2 | living temperature 23 | set_target_temperature supported | approved fallback device | living AC available | Execute | target 23 |
| R3 | entry brightness 30 | unsupported on plain light | approved but unsupported | no dimming capability | Unsupported | off |
| R4 | office vacuum battery 80 | battery is read-only | never write read-only telemetry | live battery 18 | Readonly | battery 18 |

Evaluator 要求存在名称精确为 `Board` 的 sheet，并逐格比较 A1:G5。文本不是自然语言语义匹配，大小写、连字符和措辞应按上表填写。格式、颜色、列宽不评分；Completion Guide 不评分。

### 4.2 需要达到和保持的 Home 状态

第一组状态要求：

```text
office_curtain_1: open_pct=50
living_room_air_conditioner_1: power=on, mode=heat, target_temperature_c=23
office_robot_vacuum_1: power=on, status=docked, battery_pct=18
```

注意 evaluator 明确要求 AC 最终 mode 仍为 `heat`；本题请求只要求目标温度，不应擅自切到 cool。

守护状态：

```text
entry_light_1: power=off
```

### 4.3 全局命令数

Home command history 总数必须恰好为 3。最符合政策的动作是：

1. `office_curtain_1` set_open_pct 50；
2. `living_room_air_conditioner_1` turn_on；
3. 同一空调 set_target_temperature 23。

不要尝试修改 brightness 或 battery，也不要重复下达已满足的命令。

## 5. 常见失败与真实评测边界

- 将 living AC 切到 cool：即使 23°C 正确，mode 不等于 heat，失败。
- 把 entry 普通灯打开或尝试 set_brightness：entry 状态/命令数失败。
- 把 vacuum battery 改为 80：只读 telemetry 被破坏，失败。
- 工作簿使用 `Read-only`、`Not supported` 等同义文字：逐格不相等，失败。

Evaluator 没有显式检查 schedule/workflow 数量，也没有逐台保护所有无关 Home 设备；全局三条命令是主要额外动作约束。

## 6. Cleanup

- Linux 0 删除 policy HTML；
- Linux 1 删除 board workbook；
- Home reset；
- 尝试删除空的 `/tmp/capability`。

