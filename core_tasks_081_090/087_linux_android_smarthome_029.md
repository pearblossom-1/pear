# Core 087 — `linux_android_smarthome_029`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 87 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_029.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Please have the living room warmed for the `Homecoming` event. Use its Calendar time, the current SmartHome temperature, and `/tmp/homecoming/heat.xlsx` to choose the applicable lead time and target, then schedule the heating adjustment. Leave a `Homecoming Heat.md` note in Markor with the current reading and matching temperature band, plus the final scheduled time and target.
```

### 中文翻译

让客厅在 `Homecoming` 事件到来前变暖。结合日历时间、SmartHome 当前温度和 `heat.xlsx`，选择适用的温度区间、提前量和目标温度，然后安排 heating adjustment。最后在 Markor 创建 `Homecoming Heat.md`，写出当前读数、命中的温度区间、最终计划时间和目标温度。

## 2. 输入、附件与初始业务数据

### 2.1 Android 日历

- 事件：`Homecoming`
- 开始：2026-06-16 18:40
- 结束：2026-06-16 19:00
- 地点：`Home`
- 描述：`Use the heating table.`

Markor 目标文件 `/storage/emulated/0/Documents/Markor/Homecoming Heat.md` 会在 setup 时被删除。

### 2.2 Linux 供暖表

路径：`/tmp/homecoming/heat.xlsx`，`Sheet1`：

| Temperature band | Offset | Target |
|---|---|---|
| 17-19 C | 35 minutes before | 22 C |
| 19-21 C | 20 minutes before | 21 C |

### 2.3 SmartHome 初始状态与推导

当前时间 `2026-06-16 17:30`：

- living room 当前温度：17.8°C；
- `living_room_heater_1`：power=off、target=19°C；
- 初始无 schedule 或 workflow。

17.8°C 命中 `17-19 C` 行，因此 target=22°C，提前 35 分钟。Homecoming 从 18:40 开始，所以最终计划时间是：

```text
18:40 - 00:35 = 18:05
```

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/homecoming` 并上传 `heat.xlsx`。

### `android_0`

清空日历后写入 Homecoming；确保 Markor 可用并删除旧目标笔记。

### `home_0`

重置到 17.8°C、heater off/19°C、无计划的基线。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator。

### 4.0 先说人话：怎样才算通过

- 建立唯一一个 active schedule，在 `2026-06-16 18:05` 对 `living_room_heater_1` 执行 `set_target_temperature(22°C)`；
- 创建指定 Markor 笔记，写出 Homecoming Heat、17.8°C、17-19°C 区间、18:05、22°C，并说明计划已 active/scheduled/applied。

最稳妥的笔记：

```text
Homecoming Heat is active: 17.8 C is in the 17-19 C band, so 22 C is scheduled at 18:05.
```

### 4.1 Markor 笔记 evaluator

- 文件路径必须精确匹配。
- 正文必须分别命中：
  - `Homecoming Heat`；
  - `17.8 C` 或 `17.8`；
  - `17-19 C` 或 `17 to 19 C`；
  - `18:05` 或 `6:05 PM`；
  - `22 C` 或 `22 degrees`；
  - `active/scheduled/applied` 至少一个。
- `pending`、`cancelled`、`not active` 会失败；问句、不确定或否定关系也会失败。
- 不是固定整句匹配，也没有 clause-level relation group。

### 4.2 SmartHome schedule evaluator

- 所有 active schedule 的总数必须恰好为 1。
- 与下列条件匹配的 schedule 也必须恰好为 1：

```text
run_at=2026-06-16T18:05:00
device_id=living_room_heater_1
command=set_target_temperature
args.temperature_c=22
status=active
```

- schedule ID 没有固定。
- evaluator 要的是单条 schedule，不是 workflow。
- 不要另加一条 `turn_on` schedule：那会使 active schedule 总数变成 2 而失败。当前 evaluator 只要求在 18:05 设置目标温度，没有要求届时同时打开 heater。
- 额外的 inactive schedule 不会增加 `exact_active_count`，且只要不再匹配目标条件，当前 evaluator 未必发现；正确执行仍应只建立所需计划。
