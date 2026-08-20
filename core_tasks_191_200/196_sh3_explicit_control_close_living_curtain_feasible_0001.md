# Core 196 — `sh3_explicit_control_close_living_curtain_feasible_0001`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 196 项
- 任务文件：`tasks/smarthome/generated/sh3_explicit_control_close_living_curtain_feasible_0001.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh3_explicit_control_close_living_curtain_feasible_0001.json`
- 参考脚本：`tasks/smarthome/scripted/sh3_explicit_control_close_living_curtain_feasible_0001_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：easy
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH3 explicit control，feasible
- Evaluator 函数：`smarthome.check_device_state`
- 限制：最多 50 步

## 0. 任务链与直白结论

客厅窗帘 `living_room_curtain_1` 当前开度 80%，初始化后状态是 `partial`。用户要求“close”，所以最终必须变成 `open_pct=0` 且派生状态 `status=closed`。

本题只评最终窗帘状态，不要求写报告、不要求创建计划，也没有“其他家庭状态必须不变”的第二 evaluator。最直接的正确动作是对指定窗帘立即执行 `close`。

## 1. Instruction

### 英文原文（逐字）

```text
The late sun is hitting the couch while I'm trying to read; close the living room curtain.
```

### 中文翻译

我想看书时，傍晚的阳光正照在沙发上；请关闭客厅窗帘。

## 2. 输入、附件与初始业务数据

本题没有短信、邮件、便签、表格、图片或文件附件。manifest surfaces 是 `smarthome_control`、`smarthome_state`，全部输入都在家庭快照中。

episode 顶层 `user_location=living_room` 不会由 reset 加载到 Home；任务目标已经由 instruction 和设备 ID 明确。

### 2.1 时间与初始集合

- `base_time` / `current_time`：`2026-06-05T19:00:00`；
- `tick_interval=1.0` 当前不进入 Home；
- schedules、workflows、history、infeasible reports、answer reports 初始全为空。

### 2.2 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bedroom` | `temperature_c=26.9`；`humidity_pct=53.8`；`brightness_lux=560.0`；`air_quality_pm25=52.4`；`noise_level_db=25.0`；`occupied=false` |
| `dining_room` | `temperature_c=25.0`；`humidity_pct=51.9`；`brightness_lux=180.3`；`air_quality_pm25=35.7`；`noise_level_db=33.7`；`occupied=false` |
| `guest_room` | `temperature_c=25.3`；`humidity_pct=55.1`；`brightness_lux=1120.0`；`air_quality_pm25=53.9`；`noise_level_db=29.9`；`occupied=true` |
| `laundry_room` | `temperature_c=26.8`；`humidity_pct=57.4`；`brightness_lux=500.0`；`air_quality_pm25=41.0`；`noise_level_db=52.0`；`occupied=true` |
| `living_room` | `temperature_c=24.7`；`humidity_pct=56.7`；`brightness_lux=1050.0`；`air_quality_pm25=46.6`；`noise_level_db=58.0`；`occupied=false` |

### 2.3 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bedroom | `bedroom_air_conditioner_1` | air_conditioner | `power=on, mode=auto, target_temperature_c=25.0` |
| bedroom | `bedroom_curtain_1` | curtain | 原始 `open_pct=20`；加载后 `status=partial` |
| bedroom | `bedroom_dimmable_light_1` | dimmable_light | `power=off, brightness_pct=0` |
| bedroom | `bedroom_humidifier_1` | humidifier | `power=off, level=high` |
| bedroom | `bedroom_light_1` | light | `power=on` |
| bedroom | `bedroom_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=64` |
| dining_room | `dining_room_air_purifier_1` | air_purifier | `power=off, level=low` |
| dining_room | `dining_room_curtain_1` | curtain | 原始 `open_pct=0`；加载后 `status=closed` |
| guest_room | `guest_room_air_conditioner_1` | air_conditioner | `power=off, mode=dry, target_temperature_c=27.0` |
| guest_room | `guest_room_curtain_1` | curtain | 原始 `open_pct=40`；加载后 `status=partial` |
| guest_room | `guest_room_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=100` |
| guest_room | `guest_room_heater_1` | heater | `power=on, target_temperature_c=23.0` |
| guest_room | `guest_room_light_1` | light | `power=on` |
| laundry_room | `laundry_room_dehumidifier_1` | dehumidifier | `power=off, level=medium` |
| laundry_room | `laundry_room_dryer_1` | dryer | `power=off, cycle=heavy, remaining_min=0, status=stopped` |
| laundry_room | `laundry_room_light_1` | light | `power=on` |
| laundry_room | `laundry_room_washer_1` | washer | `power=on, cycle=quick, remaining_min=24, status=running` |
| living_room | `living_room_air_purifier_1` | air_purifier | `power=on, level=low` |
| living_room | `living_room_curtain_1` | curtain | 原始 `open_pct=80`；加载后 `status=partial` |
| living_room | `living_room_dehumidifier_1` | dehumidifier | `power=off, level=low` |
| living_room | `living_room_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=50` |
| living_room | `living_room_humidifier_1` | humidifier | `power=off, level=low` |
| living_room | `living_room_light_1` | light | `power=on` |
| living_room | `living_room_robot_vacuum_1` | robot_vacuum | `power=on, status=cleaning, battery_pct=36` |

窗帘设备的能力包括 `open`、`close`、`set_open_pct`。它会根据开度自动派生 status：0 为 `closed`，100 为 `open`，中间值为 `partial`。

## 3. Setup 具体流程

1. 创建 `home_0` 并通过 episode ref reset；
2. 载入五个房间和 24 台设备；
3. `CurtainDevice.normalize_state` 把客厅窗帘原始 `open_pct=80` 转为 `open_pct=80, status=partial`；
4. 完整状态成为 baseline，但本题 evaluator 实际不使用 baseline；
5. run config 允许查询 capabilities 和执行 `smarthome.command`；
6. 没有其他附件或 GUI setup。

## 4. 正确操作应该是什么

参考脚本先查能力，然后执行：

```json
{
  "device_id": "home_0",
  "type": "smarthome.command",
  "parameters": {
    "device_id": "living_room_curtain_1",
    "command": "close",
    "args": {}
  }
}
```

直接使用 `set_open_pct` 且值为 0 也会得到相同最终状态并通过；evaluator 不限定必须使用 `close` 命令。

## 5. Evaluator：评测方式与具体评测点

本题只有一个 evaluator，默认启用计分，占 100%。Getter 只读取 `living_room_curtain_1` 的设备 state，expected 是：

```json
{
  "open_pct": 0,
  "status": "closed"
}
```

### 5.1 是最终状态子集匹配，不是动作轨迹匹配

`check_device_state` 递归检查 expected 中每个字段在 actual 中存在且相等。它不比较整条 Home，不检查执行过什么命令，也不检查 history。

对本题设备而言，runtime state 正好主要就是 `open_pct` 和派生 `status`，所以两项都必须正确：

- 只把 `status` 文本写成 closed、但开度不是 0，不通过；
- 开度 0 时设备类会自动生成 `status=closed`；
- `open_pct` 是数值绝对比较，没有容差；1、0.1 或 10 都不等于 0。

### 5.2 不检查其他家庭状态

本题没有 `check_no_home_mutation`、planned effects 或 history evaluator。因此当前代码不检查：

- 其他 23 台设备是否变化；
- 房间亮度等环境变化；
- current time；
- schedules/workflows；
- infeasible/answer reports；
- 是否真的使用 `close` 而不是另一条能产生相同状态的命令。

正常 `close` 命令可能根据设备效果更新客厅环境亮度，但这不影响本题通过。

## 6. 当前 evaluator 没检查什么

- 不要求先查 capabilities；
- 不看用户在客厅的位置；
- 不检查“阳光照到沙发”的环境因果；
- 不检查最终聊天回复；
- 不阻止不相关设备变化或额外计划；
- 不要求 schedule 为空。

## 7. 常见失败方式

- 关闭 `bedroom_curtain_1` 或 `guest_room_curtain_1`：目标设备仍是 80%；
- 只把客厅窗帘调到 20%：status 仍为 partial；
- 建一个未来 close schedule 后立刻结束：当前设备状态仍是 80%/partial；
- 只回复“已关闭”而不发 command：状态没变；
- 执行 `open`：最终是 100%/open。

## 8. Cleanup

cleanup 对 `home_0` 执行无参数 reset，清除本题家庭状态。
