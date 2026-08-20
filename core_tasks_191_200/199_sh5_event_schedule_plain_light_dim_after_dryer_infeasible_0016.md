# Core 199 — `sh5_event_schedule_plain_light_dim_after_dryer_infeasible_0016`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 199 项
- 任务文件：`tasks/smarthome/generated/sh5_event_schedule_plain_light_dim_after_dryer_infeasible_0016.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh5_event_schedule_plain_light_dim_after_dryer_infeasible_0016.json`
- 参考脚本：`tasks/smarthome/scripted/sh5_event_schedule_plain_light_dim_after_dryer_infeasible_0016_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：hard
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH5 event schedule，infeasible，原因码 `missing_capability`
- Evaluator 函数：`smarthome.check_infeasible_report`、`smarthome.check_no_home_mutation`
- 限制：最多 50 步

## 0. 任务链与直白结论

洗衣房烘干机正在运行，剩余 25 分钟；但用户点名的 `laundry_room_light_1` 是普通 `light`，只支持开和关，没有亮度字段，无法调到 40%。

因此不应创建“烘干完成后调光”的 workflow，也不能拿其他可调光灯替代。正确结果是恰好一条不可行报告，明确 `laundry_room_light_1` 是 plain light、不能 dim，同时不改变任何设备、环境、计划、工作流或当前时间。

## 1. Instruction

### 英文原文（逐字）

```text
Since I don't want to check again later, after the dryer finishes, dim laundry room light 1 to 40 percent.
```

### 中文翻译

因为我不想稍后再检查一次，请在烘干机完成后，把 laundry room light 1 调暗到 40%。

## 2. 输入、附件与初始业务数据

本题没有短信、邮件、便签、表格、图片或文件附件，manifest surface 只有 `smarthome_control`。所谓“dryer finishes”来自家庭设备状态，不是另一个外部通知或消息。

episode 顶层 `user_location=laundry_room` 不会被 reset 加载到 Home，也不参与评测。

### 2.1 时间与初始集合

- `base_time` / `current_time`：`2026-06-10T19:00:00`；
- `tick_interval=1.0` 当前被 initializer 忽略；
- schedules、workflows、history、infeasible reports、answer reports 初始全部为空。

### 2.2 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bathroom` | `temperature_c=23.2`；`humidity_pct=58.6`；`brightness_lux=500.0`；`air_quality_pm25=27.7`；`noise_level_db=43.6`；`occupied=false` |
| `bedroom` | `temperature_c=22.5`；`humidity_pct=52.7`；`brightness_lux=250.0`；`air_quality_pm25=52.2`；`noise_level_db=25.0`；`occupied=true` |
| `laundry_room` | `temperature_c=23.1`；`humidity_pct=47.8`；`brightness_lux=500.0`；`air_quality_pm25=55.6`；`noise_level_db=39.4`；`occupied=false` |
| `living_room` | `temperature_c=22.3`；`humidity_pct=56.0`；`brightness_lux=325.0`；`air_quality_pm25=43.3`；`noise_level_db=29.5`；`occupied=true` |
| `office` | `temperature_c=23.7`；`humidity_pct=46.0`；`brightness_lux=0.3`；`air_quality_pm25=46.6`；`noise_level_db=32.7`；`occupied=true` |

### 2.3 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bathroom | `bathroom_air_purifier_1` | air_purifier | `power=off, level=high` |
| bathroom | `bathroom_heater_1` | heater | `power=on, target_temperature_c=26.0` |
| bathroom | `bathroom_humidifier_1` | humidifier | `power=off, level=low` |
| bathroom | `bathroom_light_1` | light | `power=on` |
| bedroom | `bedroom_air_conditioner_1` | air_conditioner | `power=on, mode=dry, target_temperature_c=23.0` |
| bedroom | `bedroom_air_purifier_1` | air_purifier | `power=on, level=low` |
| bedroom | `bedroom_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=50` |
| bedroom | `bedroom_heater_1` | heater | `power=off, target_temperature_c=22.0` |
| bedroom | `bedroom_humidifier_1` | humidifier | `power=off, level=high` |
| laundry_room | `laundry_room_dehumidifier_1` | dehumidifier | `power=off, level=high` |
| laundry_room | `laundry_room_dryer_1` | dryer | `power=on, cycle=quick, remaining_min=25, status=running` |
| laundry_room | `laundry_room_light_1` | light | `power=on` |
| living_room | `living_room_air_conditioner_1` | air_conditioner | `power=on, mode=heat, target_temperature_c=26.0` |
| living_room | `living_room_dehumidifier_1` | dehumidifier | `power=off, level=high` |
| living_room | `living_room_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=65` |
| living_room | `living_room_humidifier_1` | humidifier | `power=off, level=low` |
| office | `office_air_conditioner_1` | air_conditioner | `power=on, mode=cool, target_temperature_c=26.0` |
| office | `office_air_purifier_1` | air_purifier | `power=off, level=low` |
| office | `office_light_1` | light | `power=off` |
| office | `office_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=98` |

关键对照：

- dryer 的 `remaining_min=25` 可以说明“完成”大约对应 19:25；
- 但 `laundry_room_light_1` 的 state 只有 `power`，能力只有 `turn_on/turn_off`；
- `living_room_dimmable_light_1` 虽能调光，却不是用户指定的洗衣房灯。

## 3. Setup 具体流程

1. 创建 `home_0`；
2. `smarthome.reset` 从 episode 中只加载 `initial_home_config`；
3. 五个房间、20 台设备、current time 和所有空集合进入 Home；
4. 完整状态成为 evaluator baseline；
5. action space 可查询 dryer/light 能力、创建 schedule/workflow、提交不可行报告，但不开放 advance time；
6. 没有外部“dryer finished”事件附件或已有 automation。

## 4. 正确操作应该是什么

参考脚本直接提交：

```json
{
  "device_id": "home_0",
  "type": "smarthome.report_infeasible",
  "parameters": {
    "category": "missing_capability",
    "reason": "laundry_room_light_1 is a plain light and cannot be dimmed.",
    "target": "laundry_room_light_1.brightness_pct"
  }
}
```

可以先只读查询设备能力，但 evaluator 不要求。不要创建 19:25 schedule，因为目标灯无法产生 40% brightness 效果，而且无变更 evaluator 要求计划集合保持空。

## 5. Evaluator：评测方式与具体评测点

两个 evaluator 都计分，各占 50%：语义不可行报告与家庭完全无变更必须一起通过。

### 5.1 报告必须恰好一条

最终 infeasible reports 长度必须严格为 1。category aliases：

```text
missing_capability
missing capability
unsupported capability
no dimming capability
```

推荐 `missing_capability`。当前实现未启用 `require_category_alias`，所以 category 并非硬性别名匹配；只要非空、不是明确成功/可行类别，且不形成内置类别族冲突，任意未分类字符串也可能被接受。

### 5.2 target 与原因关系

target aliases：

```text
laundry_room_light_1.brightness_pct
laundry room light 1 brightness
laundry room light 1
```

实体要求：`laundry_room_light_1` 或 `laundry room light 1`。

必须命中任一肯定原因短语：

```text
cannot be dimmed
does not support dimming
no dimming
plain light
```

允许的正常能力否定：

```text
cannot be dimmed
does not support dimming
no dimming
```

冲突短语：

```text
supports dimming
workflow is active
was dimmed
```

本题没有 clause 分组。Target 可以承担设备实体，reason 负责说明 plain light/no dimming；四个字段拼接后满足即可。出现不确定词、问号、撤回表达或上述冲突短语会失败。

可通过示例：

```text
target: laundry_room_light_1.brightness_pct
reason: Laundry room light 1 is a plain light and cannot be dimmed.
```

失败示例：

```text
target: laundry_room_light_1
reason: Laundry room light 1 supports dimming and the workflow is active.
```

### 5.3 家庭完全无变更

第二项要求：

- 全部 20 台设备的 ID 集合与完整状态不变，包括 dryer 仍是 running/25 分钟、light 仍只有 power=on；
- 五个房间环境完全不变；
- schedules/workflows 仍为空；
- current time 仍为 `2026-06-10T19:00:00`。

因此不能推进 25 分钟，也不能留下 active 或 cancelled plan。该项不比较 infeasible reports，且未保护 answer reports/history。

## 6. 当前 evaluator 没检查什么

- 不要求报告提到 dryer、remaining 25 分钟、预计 19:25 或目标 40%；
- 不评估真正的“事件触发器”语义，只检查目标灯缺调光能力；
- 不要求先查询 capabilities；
- 不强制 category 等于 `missing_capability`；
- 不检查最终聊天回复、answer reports 或 history。

这意味着一条只清楚说明指定灯不能调光的报告就足够；不要为满足 instruction 的背景细节而创建无法通过的计划。

## 7. 常见失败方式

- 把客厅可调光灯设为 40%：目标设备错误且家庭状态变化；
- 给洗衣房普通灯安排 `set_brightness`：runtime 能力校验失败，且没有所需报告；
- 创建一个 19:25 workflow 后再报告：workflows 与 baseline 不同，第二项失败；
- 推进 25 分钟等待 dryer：time、dryer 和环境状态变化；
- 只写“missing capability”而不提指定灯/调光：实体或目标关系不足；
- 写 `workflow is active`：命中冲突短语。

## 8. Cleanup

cleanup 无参数 reset `home_0`，移除家庭快照和报告。
