# Core 197 — `sh4_time_schedule_living_ac_temperature_feasible_0032`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 197 项
- 任务文件：`tasks/smarthome/generated/sh4_time_schedule_living_ac_temperature_feasible_0032.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh4_time_schedule_living_ac_temperature_feasible_0032.json`
- 参考脚本：`tasks/smarthome/scripted/sh4_time_schedule_living_ac_temperature_feasible_0032_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：medium
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH4 time schedule，feasible
- Evaluator 函数：`smarthome.check_planned_effects`、`smarthome.check_no_home_mutation`
- 限制：最多 50 步

## 0. 任务链与直白结论

当前时间为 2026-06-15 20:00。75 分钟后是 21:15，用户要的是届时把客厅空调的**目标温度**设为 25°C。

正确结果是创建一个 21:15 的 active plan，其唯一规范化效果是 `living_room_air_conditioner_1.target_temperature_c=25`。任务结束时不能立刻改空调：它仍应是 `power=off, mode=dry, target_temperature_c=20`，时间仍是 20:00。Evaluator 也不要求计划同时开机；如果额外安排 turn on，反而会多出 `power=on` 效果并失败。

## 1. Instruction

### 英文原文（逐字）

```text
Before I get pulled into other chores, guests will be here later and I want the living room comfortable; in 75 minutes, have the air conditioner target 25 degrees automatically.
```

### 中文翻译

在我被其他家务拖住之前，客人稍后会来，我希望客厅舒适；75 分钟后，让空调自动把目标温度设为 25 度。

## 2. 输入、附件与初始业务数据

### 2.1 实际有没有表格附件

没有。本题不包含短信、邮件、便签、表格文件、图片或其他磁盘附件。manifest 虽把 surfaces 标成 `smarthome_control`、`tables`，task/setup 中没有任何 table device 或文件上传；全部输入都来自 SmartHome episode 快照。

episode 顶层 `user_location=living_room` 不会被 reset 加载到 Home，也不参与 evaluator。

### 2.2 时间与初始集合

- `base_time` / `current_time`：`2026-06-15T20:00:00`；
- `tick_interval=1` 在当前 initializer 中被忽略；
- schedules、workflows、history、infeasible reports、answer reports 初始都为空。

### 2.3 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bedroom` | `temperature_c=21.1`；`humidity_pct=47.6`；`brightness_lux=60`；`air_quality_pm25=38.1`；`noise_level_db=31.1`；`occupied=true` |
| `laundry_room` | `temperature_c=22.2`；`humidity_pct=44`；`brightness_lux=87.8`；`air_quality_pm25=25.3`；`noise_level_db=38.9`；`occupied=false` |
| `living_room` | `temperature_c=21.1`；`humidity_pct=39.4`；`brightness_lux=250`；`air_quality_pm25=35.3`；`noise_level_db=36.6`；`occupied=true` |
| `office` | `temperature_c=24.2`；`humidity_pct=32.7`；`brightness_lux=240`；`air_quality_pm25=47.8`；`noise_level_db=40.6`；`occupied=false` |

### 2.4 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bedroom | `bedroom_curtain_1` | curtain | 原始 `open_pct=20`；加载后 `status=partial` |
| bedroom | `bedroom_dehumidifier_1` | dehumidifier | `power=on, level=high` |
| bedroom | `bedroom_heater_1` | heater | `power=off, target_temperature_c=27` |
| bedroom | `bedroom_humidifier_1` | humidifier | `power=on, level=low` |
| laundry_room | `laundry_room_dryer_1` | dryer | `power=off, cycle=normal, remaining_min=0, status=idle` |
| laundry_room | `laundry_room_light_1` | light | `power=off` |
| living_room | `living_room_air_conditioner_1` | air_conditioner | `power=off, mode=dry, target_temperature_c=20` |
| living_room | `living_room_dehumidifier_1` | dehumidifier | `power=off, level=high` |
| living_room | `living_room_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=50` |
| living_room | `living_room_heater_1` | heater | `power=on, target_temperature_c=30` |
| office | `office_air_conditioner_1` | air_conditioner | `power=on, mode=fan, target_temperature_c=20` |
| office | `office_air_purifier_1` | air_purifier | `power=off, level=high` |
| office | `office_curtain_1` | curtain | 原始 `open_pct=80`；加载后 `status=partial` |
| office | `office_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=86` |

客厅空调支持 `set_target_temperature`，其运行时参数名是 `temperature_c`，允许范围 16–30。

## 3. Setup 具体流程

1. 创建 `home_0`；
2. `smarthome.reset` 由 episode config ref 加载 `initial_home_config`；
3. base time、四个房间、14 台设备与空计划集合被规范化；
4. 完整加载状态成为 baseline；
5. run config 开放 `schedule_command`、`schedule_workflow`、查询与报告等动作，但不开放 advance time；
6. 没有 table 附件或已有 schedule。

## 4. 正确输出应该是什么

参考脚本创建：

```json
{
  "device_id": "home_0",
  "type": "smarthome.schedule_command",
  "parameters": {
    "schedule_id": "living_ac_after_75",
    "run_at": "2026-06-15T21:15:00",
    "device_id": "living_room_air_conditioner_1",
    "command": "set_target_temperature",
    "args": {"temperature_c": 25.0}
  }
}
```

ID 可自定。注意 runtime 的空调命令要求参数键 `temperature_c`；虽然 effect evaluator 能理解 `target_temperature_c` 这一规范字段，但把它直接作为 `set_target_temperature` 的命令参数会在设备校验处失败。

## 5. Evaluator：评测方式与具体评测点

两个 evaluator 都启用计分，各占 50%：一项检查未来计划效果，一项检查没有立即改空调或推进时间。

### 5.1 active plan 的真正匹配方式

所有 active schedules/workflows 都会被转为“时间 → 设备 → 字段效果”图。期望图只有：

```text
2026-06-15T21:15:00
└── living_room_air_conditioner_1
    └── target_temperature_c = 25
```

最终归一化图必须完全相等。Evaluator：

- 不检查 schedule/workflow ID；
- 不检查记录顺序；
- 允许等价 workflow；
- 忽略 cancelled plan；
- 不接受多出的 active 时间、设备或字段效果。

`exact_active_plan_count=1` 只用于验证 expected 配置列表长度。代码没有另做“实际 active 原始记录数必须等于 1”的计数，而是比较按时间合并后的 active effect 图。对本题最稳妥、最直接的实现仍是一条 schedule。

### 5.2 不要额外开空调

期望效果不含 `power`。如果建立一个 workflow，在 21:15 先 `turn_on` 再 `set_target_temperature`，归一化结果会多出 `power=on`，与期望图不等。instruction 只要求 target 25 度，当前 evaluator 也是按这个字面字段评测。

### 5.3 不得立即改变空调或当前时间

`check_no_home_mutation` 要求：

- `living_room_air_conditioner_1` 最终仍为 `power=off, mode=dry, target_temperature_c=20`；
- current time 仍为 `2026-06-15T20:00:00`。

它允许新增计划。若直接把 target temperature 改成 25，即使用户目标看似达成，也会因“现在执行而非 75 分钟后”失败。

### 5.4 实际保护边界

第二项没有保护其他 13 台设备、房间环境、计划集合本身、history 或报告。第一项会因 effect 图全等要求拒绝额外 active plans，但 cancelled plans 和其他设备的即时变化仍可能漏检。它们不符合 instruction，不应加入。

## 6. 当前 evaluator 没检查什么

- 不检查 plan ID；
- 不要求计划来源必须是 schedule 而不能是 workflow；
- 不把时间推进到 21:15，不检查届时实际环境舒适度；
- 不要求空调在 21:15 开机；
- 不检查任何表格，因为不存在表格 fixture；
- 不全面检查非目标设备、cancelled plans、history/reports 或最终聊天回复。

## 7. 常见失败方式

- 把 75 分钟算成 20:75 或 21:25：run_at 错误；
- 立即将目标温度设为 25：baseline guard 失败；
- 计划 `turn_on` 而没有 set target：缺温度效果；
- 同时计划 turn on：多出 power 效果；
- 把目标写到 `office_air_conditioner_1`：设备 ID 错；
- 计划时间正确但参数键用 `target_temperature_c`：runtime 命令校验失败，计划不会创建；
- 添加其他 active plan：effect 图不再全等。

## 8. Cleanup

cleanup 无参数 reset `home_0`，清空家庭和新建计划。
