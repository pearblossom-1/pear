# Core 115 — `linux_smarthome_433`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 115 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_433.json`
- 运行配置：`configs/cross_device/local_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1L+1H`（`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

图片规定 nursery 在 13:00–15:00 是 nap no-clean 区域。当前时间 13:30，nursery 扫地机器人正在 cleaning，而且 14:30 还有一条将再次启动清洁的 active schedule。两者都与 nap window 冲突，所以要：

1. 暂停当前 nursery robot；
2. 取消 14:30 的 nursery clean schedule，但保留该 schedule 记录并把状态变为 cancelled；
3. 不动 living room 等无关清洁；
4. 新建 `cleaning-audit.xlsx` 记录冲突和两项动作。

## 1. Instruction

### 英文原文（逐字）

```text
Use `/tmp/cleaning/no-clean.png` and `/tmp/cleaning/robot-plan.xlsx` to resolve any nursery cleaning conflicts during the 13:00–15:00 nap window. Pause or cancel only the conflicting robot work, leave unrelated cleaning alone, and save the actions taken to `/tmp/cleaning/cleaning-audit.xlsx` using the audit workbook fields described in the source template's Completion Guide.
```

### 中文翻译

使用 `/tmp/cleaning/no-clean.png` 和 `/tmp/cleaning/robot-plan.xlsx` 解决 nursery 在 13:00–15:00 午睡时段内的清洁冲突。只暂停或取消发生冲突的机器人工作，不要影响无关清洁，并按照源模板 Completion Guide 描述的 audit 字段，将采取的动作保存到 `/tmp/cleaning/cleaning-audit.xlsx`。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 `no-clean.png` 的详细视觉内容

图片标题：`Nursery nap no-clean map`。

- 左侧 Nursery 区域以红色标出；
- 可见文字：`No clean 13:00–15:00`；
- 下方说明：`Nap zone requires no robot cleaning.`；
- Hallway 和 Living room 没有被标成禁清洁区。

### 2.2 `robot-plan.xlsx` 修改前内容

源工作簿有 `Sheet1` 和 `Completion Guide` 两个 sheet。

`Sheet1`：

| Area | Window | Reason | Current conflict | Scheduled conflict | Result File |
|---|---|---|---|---|---|
| nursery | 13:00-15:00 nap | nap zone occupied | active robot cleaning | 14:30 cleaning | cleaning-audit.xlsx |
| living room | open | no conflict | none | none | cleaning-audit.xlsx |

Completion Guide：

```text
Audit columns:
Use the controlled headers Area, Conflict, Current Action, and Future Action in cleaning-audit.xlsx.

Operational wording:
Use the controlled operational phrases shown here: pause robot and cancel 14:30 clean.
```

注意：输出是一个新文件 `cleaning-audit.xlsx`，不是覆盖 `robot-plan.xlsx`。

### 2.3 SmartHome 初始状态

当前时间：`2026-06-16 13:30`。

- Nursery occupied=true；
- `nursery_robot_vacuum_1`：power=on、status=cleaning、battery=74；
- 唯一 schedule：

```text
schedule_id = nursery_clean_1430
run_at = 2026-06-16T14:30:00
device_id = nursery_robot_vacuum_1
command = start_cleaning
args = {}
status = active
```

初始 workflow 为 0。Living-room robot 当前 off/docked，dining-room robot 当前 paused，均是无关设备。

## 3. Setup 具体流程

### `linux_0`

1. 删除旧 PNG、source workbook 和 output workbook；
2. 创建 `/tmp/cleaning`；
3. 上传 `no-clean.png` 和 `robot-plan.xlsx`。

### `home_0`

从 episode config 重置 Home，恢复 13:30 的 nursery occupied 状态、正在 cleaning 的机器人、14:30 active schedule，以及其他无关设备。

Setup 不会自动打开图片或工作簿。

## 4. Evaluator：评测方式与具体评测点

本任务有 6 个 evaluator；最后三个是全局守护项。

### 4.0 先说人话：怎样才算通过

Nursery robot 最终必须暂停；14:30 schedule 必须仍是同一条记录但状态变为 cancelled；输出工作簿只有一条 nursery audit 记录；全局只允许 1 条直接设备命令、1 条 schedule 记录和 0 个 workflow。

### 4.1 Nursery robot 最终状态

```text
power = on
status = paused
battery_pct = 74
```

Battery 必须保持 74；pause 不是 return-to-dock，也不是关机。

### 4.2 Schedule 状态

必须匹配完整 schedule 身份和 cancelled 状态：

```text
nursery_clean_1430
2026-06-16T14:30:00
nursery_robot_vacuum_1
start_cleaning
args={}
status=cancelled
```

删除 schedule 记录不是同一件事，会导致 status evaluator 和 schedule-count guard 失败。

### 4.3 `cleaning-audit.xlsx`

目标 sheet 名没有被固定，但必须恰好有一个 sheet 能匹配以下目标区域：

| Area | Conflict | Current Action | Future Action |
|---|---|---|---|
| nursery | 自然语言冲突说明 | pause robot | cancel 14:30 clean |

固定单元格：

```text
A1=Area
B1=Conflict
C1=Current Action
D1=Future Action
A2=nursery
C2=pause robot
D2=cancel 14:30 clean
```

`B2` 不是整句绝对匹配，但必须：

- 非空；
- 包含 `nap`；
- 至少包含一项：`occupied`、`cleaning`、`robot`、`vacuum`；
- 还至少包含一项：`occupied`、`active`、`conflict`、`overlap`、`scheduled`、`current`、`future`、`13:00`、`14:30`。

可通过示例：

```text
nap window conflicts with active robot cleaning and the scheduled 14:30 clean
```

明确写成 `no conflict`、`unoccupied`、`does not overlap`、`cleaning is unrelated` 等否定语义会失败。

`reject_extra_nonempty_cells=true`：目标 sheet 的非空单元格集合必须正好是 A1:D2 这 8 格，不能多写标题、备注或第二行记录。

可以没有额外 sheet；如保留一个额外 source/evidence/guide sheet，则最多 1 个、至少 2 个非空格，并且其名称或正文要含 source、evidence、guide、robot-plan 或 no-clean 之一。

### 4.4 三个全局守护

- Home command history 总数必须恰好 1：即 pause robot；
- schedule 记录总数必须恰好 1：取消后记录仍在；
- workflow 总数必须为 0。

## 5. 常见失败与真实评测边界

- 把 robot 关机或送回 dock，而不是 paused：失败。
- 删除 14:30 schedule，而不是 cancel：失败。
- 额外暂停 living-room/dining-room robot：history 超过 1，失败。
- 在 output sheet 增加标题或解释段：触发 extra nonempty cells，失败。
- B2 只写 `nap`：缺第二层冲突事实，失败。

Evaluator 没有逐台核对所有无关机器人最终 state，但全局 1 条命令和计划数量约束已限制大部分额外操作。

## 6. Cleanup

- 删除 PNG、robot-plan.xlsx 和 cleaning-audit.xlsx；
- 尝试删除空的 `/tmp/cleaning`；
- Home reset。

