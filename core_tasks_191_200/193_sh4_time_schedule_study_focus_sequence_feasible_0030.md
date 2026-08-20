# Core 193 — `sh4_time_schedule_study_focus_sequence_feasible_0030`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 193 项
- 任务文件：`tasks/smarthome/generated/sh4_time_schedule_study_focus_sequence_feasible_0030.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh4_time_schedule_study_focus_sequence_feasible_0030.json`
- 参考脚本：`tasks/smarthome/scripted/sh4_time_schedule_study_focus_sequence_feasible_0030_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：medium
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH4 time schedule，feasible
- Evaluator 函数：`smarthome.check_planned_effects`、`smarthome.check_no_home_mutation`
- 限制：最多 50 步

## 0. 任务链与直白结论

家庭当前时间是 2026-06-14 21:00。用户要求两个先后发生、但现在不能立即执行的动作：

1. 20 分钟后，即 21:20，把书房可调光灯设为 35%；
2. “twenty minutes after that” 指再过 20 分钟，即 21:40，打开书房空气净化器。

正确结果是留下两个未来 active plan。任务结束时灯仍应是 `off/0%`，净化器仍应是 `off/low`，当前时间仍是 21:00；evaluator 不会把时间推进到执行点。

## 1. Instruction

### 英文原文（逐字）

```text
For tonight's setup, I'm finishing email before a focus block; in 20 minutes, set the study light to 35 percent, and twenty minutes after that turn on the study air purifier.
```

### 中文翻译

为了安排今晚，我会先处理完邮件再进入专注时段；20 分钟后把书房灯调到 35%，再过 20 分钟打开书房空气净化器。

## 2. 输入、附件与初始业务数据

### 2.1 “email”是不是邮件附件

不是。本题没有短信、邮件正文、收件箱、便签、表格、图片或磁盘文件。manifest 虽把 surfaces 标成 `smarthome_control`、`sms_email`，但 task 只有 SmartHome 设备，setup 也没有注入任何 SMS/email 数据。instruction 中的 “I'm finishing email” 只是生活场景铺垫，不提供时间或设备信息。

episode 顶层 `user_location=study` 也不会被 reset 加载；实际 Home 状态只来自 `initial_home_config`。

### 2.2 时间与初始集合

- `base_time` / `current_time`：`2026-06-14T21:00:00`；
- `tick_interval=1` 存在于 JSON，但当前 Home initializer 忽略它；
- 初始 schedules、workflows、history、infeasible reports、answer reports 都是空数组。

### 2.3 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bedroom` | `temperature_c=22.2`；`humidity_pct=57.5`；`brightness_lux=740`；`air_quality_pm25=44.2`；`noise_level_db=35.9`；`occupied=true` |
| `dining_room` | `temperature_c=20.4`；`humidity_pct=58.8`；`brightness_lux=100`；`air_quality_pm25=40.5`；`noise_level_db=41.1`；`occupied=true` |
| `guest_room` | `temperature_c=19.9`；`humidity_pct=57.6`；`brightness_lux=430`；`air_quality_pm25=49.1`；`noise_level_db=30.3`；`occupied=false` |
| `living_room` | `temperature_c=21.1`；`humidity_pct=47.6`；`brightness_lux=347.7`；`air_quality_pm25=36.9`；`noise_level_db=39.5`；`occupied=true` |
| `study` | `temperature_c=21`；`humidity_pct=53.7`；`brightness_lux=321.6`；`air_quality_pm25=38.5`；`noise_level_db=58`；`occupied=false` |

### 2.4 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bedroom | `bedroom_air_conditioner_1` | air_conditioner | `power=off, mode=fan, target_temperature_c=24` |
| bedroom | `bedroom_curtain_1` | curtain | 原始 `open_pct=80`；加载后 `status=partial` |
| bedroom | `bedroom_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=100` |
| bedroom | `bedroom_humidifier_1` | humidifier | `power=off, level=medium` |
| bedroom | `bedroom_robot_vacuum_1` | robot_vacuum | `power=on, status=paused, battery_pct=56` |
| dining_room | `dining_room_air_conditioner_1` | air_conditioner | `power=off, mode=auto, target_temperature_c=22` |
| dining_room | `dining_room_curtain_1` | curtain | 原始 `open_pct=0`；加载后 `status=closed` |
| dining_room | `dining_room_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=20` |
| guest_room | `guest_room_air_purifier_1` | air_purifier | `power=off, level=medium` |
| guest_room | `guest_room_curtain_1` | curtain | 原始 `open_pct=60`；加载后 `status=partial` |
| guest_room | `guest_room_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=50` |
| guest_room | `guest_room_heater_1` | heater | `power=on, target_temperature_c=25` |
| living_room | `living_room_air_purifier_1` | air_purifier | `power=off, level=medium` |
| living_room | `living_room_dehumidifier_1` | dehumidifier | `power=on, level=low` |
| living_room | `living_room_heater_1` | heater | `power=off, target_temperature_c=30` |
| living_room | `living_room_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=84` |
| study | `study_air_purifier_1` | air_purifier | `power=off, level=low` |
| study | `study_dimmable_light_1` | dimmable_light | `power=off, brightness_pct=0` |
| study | `study_robot_vacuum_1` | robot_vacuum | `power=on, status=cleaning, battery_pct=63` |

## 3. Setup 具体流程

1. `home_0` runtime 先被初始化为空 Home；
2. task setup 通过 `smarthome.reset` 读取 episode 的 `initial_home_config`；
3. `base_time` 成为 current time，房间内嵌设备被展开并按设备类规范化；
4. 当前完整 Home 被保存为 baseline；
5. run config 暴露完整状态，并允许 `schedule_command`、`schedule_workflow` 等动作；`advance_time` 不在本任务 action space 中；
6. setup 不会创建任何已有计划，也不会提供邮件内容。

## 4. 正确输出应该是什么

最直接的做法是参考脚本中的两个 schedule：

```json
{
  "device_id": "home_0",
  "type": "smarthome.schedule_command",
  "parameters": {
    "schedule_id": "study_light_dim_20",
    "run_at": "2026-06-14T21:20:00",
    "device_id": "study_dimmable_light_1",
    "command": "set_brightness",
    "args": {"brightness_pct": 35}
  }
}
```

```json
{
  "device_id": "home_0",
  "type": "smarthome.schedule_command",
  "parameters": {
    "schedule_id": "study_purifier_on_after_light",
    "run_at": "2026-06-14T21:40:00",
    "device_id": "study_air_purifier_1",
    "command": "turn_on",
    "args": {}
  }
}
```

`schedule_id` 可以换名字；评测不看 ID。也可以用等价 workflow 表达，但最终 active plans 归一化后的时间和设备字段效果必须完全相同。

## 5. Evaluator：评测方式与具体评测点

本题有两个启用计分的 evaluator，各占 50%。计划效果和“不得立即执行”必须同时通过；任何一项失败，整体 `success=false`。

### 5.1 计划效果不是 JSON 逐字匹配

`check_planned_effects` 读取整个 Home 的 `schedules` 与 `workflows`，只保留状态为 `active` 的记录，再把命令转换成最终字段效果：

- `set_brightness {brightness_pct: 35}` 被规范成 `power=on` 加 `brightness_pct=35`；
- `turn_on {}` 被规范成 `power=on`。

随后按 `run_at` 合并，并要求实际效果图与下面的期望图完全相等：

| 绝对时间 | 目标设备 | 必须产生的字段效果 |
|---|---|---|
| `2026-06-14T21:20:00` | `study_dimmable_light_1` | `power=on, brightness_pct=35` |
| `2026-06-14T21:40:00` | `study_air_purifier_1` | `power=on` |

不检查 schedule/workflow ID、记录顺序，也不要求一定使用 schedule 而不能使用 workflow。`canceled/cancelled` 记录被忽略。

配置字段名叫 `exact_active_plan_count: 2`，但当前实现没有单独计算“实际 active 记录条数是否恰为 2”；它先验证 expected 列表有两项，然后比较按时间合并后的全部 active effects。因此通过的真正标准是上面两阶段效果图全等。额外 active 效果、额外时间点或错误字段都会让字典不等而失败。

### 5.2 时间计算必须按第二个相对词执行

- 起点是 21:00；
- “in 20 minutes” 是 21:20；
- “twenty minutes after that” 以第一步的 21:20 为起点，所以是 21:40，不是把第二步也放在 21:20，也不是从 21:00 只加 20 分钟。

Runtime 会把合法时间格式化为无时区的 ISO 秒级字符串。计划时间必须在当前时间之后。

### 5.3 不得立即改变目标设备或时间

第二项 `check_no_home_mutation` 只保护这两个设备及 current time：

- `study_dimmable_light_1` 最终仍须为 `power=off, brightness_pct=0`；
- `study_air_purifier_1` 最终仍须为 `power=off, level=low`；
- current time 仍须为 `2026-06-14T21:00:00`。

这说明计划应被保存但不能立即执行，也不能推进时间。新增 schedule/workflow 是允许的，否则第一项无法通过。

### 5.4 当前保护范围的真实边界

第二项没有设置 `all_devices`、`preserve_rooms`、`preserve_schedules` 或 `preserve_workflows`，所以它自身不检查其他 17 台设备、房间环境或非目标计划。第一项会拒绝任何改变 active effect 图的额外 active plan，但 cancelled plans、其他设备的立即状态变化、history/report 列表并不由这两项完整约束。它们不属于任务要求，不应利用这些漏检。

## 6. 当前 evaluator 没检查什么

- 不检查 schedule ID；
- 不要求先查看设备或列出计划；
- 不读取或评测任何真实邮件；
- 不把时间推进到 21:20/21:40，也不检查动作实际执行后的环境变化；
- 不检查最终聊天回复；
- 不全面保护非目标设备、房间环境、cancelled plan、history 或报告列表。

## 7. 常见失败方式

- 两个动作都排在 21:20：第二阶段时间错误；
- 第二个动作排在 22:00：误把“再过 20 分钟”算成再加 40 分钟；
- 现在立刻把灯调到 35%：目标设备 baseline guard 失败；
- 只创建第一个计划：效果图缺净化器阶段；
- 灯使用 `turn_on` 但不设置 35%：缺 brightness 效果；
- 建好计划后推进时间：current time 和设备状态 guard 失败；
- 添加第三个 active plan：最终 active effect 图不再全等。

## 8. Cleanup

cleanup 对 `home_0` 无参数 reset，清除家庭快照及新建的计划。
