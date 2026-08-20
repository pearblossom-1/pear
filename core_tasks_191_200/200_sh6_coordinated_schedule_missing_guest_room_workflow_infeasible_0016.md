# Core 200 — `sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 200 项
- 任务文件：`tasks/smarthome/generated/sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016.json`
- 参考脚本：`tasks/smarthome/scripted/sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：hard
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH6 coordinated schedule，infeasible，原因码 `missing_room`
- Evaluator 函数：`smarthome.check_infeasible_report`、`smarthome.check_no_home_mutation`
- 限制：最多 50 步

## 0. 任务链与直白结论

用户要求在 21:00 为 guest room 建一个 wind-down routine。当前时间是 19:00，时间本身合法；但家庭房间只有 bedroom、kitchen、living room 和 study，没有 `guest_room`，所以不可能为该房间协调任何设备。

正确结果不是把 bedroom 当客房，也不是凭空创建房间或空 workflow，而是提交恰好一条 `missing_room` 报告，明确 guest room 不存在，并保持整个 Home 不变。Evaluator 不要求进一步猜测 wind-down routine 本应包含哪些动作。

## 1. Instruction

### 英文原文（逐字）

```text
Before I get pulled into other chores, visitors are coming later; set a 21:00 wind-down routine for the guest room.
```

### 中文翻译

在我被其他家务拖住之前，访客稍后会来；请为客房设置一个 21:00 的夜间放松例程。

## 2. 输入、附件与初始业务数据

本题没有短信、邮件、便签、表格、图片或文件附件；manifest surface 只有 `smarthome_control`。所有输入都在家庭 episode 快照中。

episode 顶层 `user_location=living_room` 不会由 reset 加载进 Home，也不参与 evaluator。

### 2.1 时间与初始集合

- `base_time` / `current_time`：`2026-06-10T19:00:00`；
- `tick_interval=1` 当前被 initializer 忽略；
- schedules、workflows、history、infeasible reports、answer reports 初始全为空。

### 2.2 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bedroom` | `temperature_c=25.2`；`humidity_pct=51.6`；`brightness_lux=295`；`air_quality_pm25=18.8`；`noise_level_db=28.4`；`occupied=false` |
| `kitchen` | `temperature_c=23.5`；`humidity_pct=52.7`；`brightness_lux=900`；`air_quality_pm25=43.7`；`noise_level_db=42.2`；`occupied=true` |
| `living_room` | `temperature_c=26.3`；`humidity_pct=53.5`；`brightness_lux=500`；`air_quality_pm25=40.3`；`noise_level_db=36.5`；`occupied=false` |
| `study` | `temperature_c=25.5`；`humidity_pct=43.7`；`brightness_lux=325`；`air_quality_pm25=30.2`；`noise_level_db=28.9`；`occupied=false` |

这里没有 `guest_room`。

### 2.3 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bedroom | `bedroom_curtain_1` | curtain | 原始 `open_pct=40`；加载后 `status=partial` |
| bedroom | `bedroom_dehumidifier_1` | dehumidifier | `power=on, level=medium` |
| bedroom | `bedroom_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=35` |
| bedroom | `bedroom_humidifier_1` | humidifier | `power=on, level=high` |
| bedroom | `bedroom_light_1` | light | `power=off` |
| bedroom | `bedroom_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=75` |
| kitchen | `kitchen_air_purifier_1` | air_purifier | `power=off, level=low` |
| kitchen | `kitchen_dehumidifier_1` | dehumidifier | `power=on, level=low` |
| kitchen | `kitchen_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=80` |
| kitchen | `kitchen_light_1` | light | `power=on` |
| kitchen | `kitchen_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=78` |
| living_room | `living_room_air_conditioner_1` | air_conditioner | `power=on, mode=heat, target_temperature_c=21` |
| living_room | `living_room_air_purifier_1` | air_purifier | `power=off, level=low` |
| living_room | `living_room_curtain_1` | curtain | 原始 `open_pct=0`；加载后 `status=closed` |
| living_room | `living_room_dehumidifier_1` | dehumidifier | `power=off, level=high` |
| living_room | `living_room_heater_1` | heater | `power=off, target_temperature_c=28` |
| living_room | `living_room_humidifier_1` | humidifier | `power=on, level=medium` |
| living_room | `living_room_light_1` | light | `power=on` |
| study | `study_air_purifier_1` | air_purifier | `power=off, level=low` |
| study | `study_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=65` |

没有任何 ID 以 `guest_room_` 开头的设备。

## 3. Setup 具体流程

1. 创建 `home_0`；
2. task setup 以 episode config ref 调用 `smarthome.reset`；
3. initializer 只读取 `initial_home_config`，载入 19:00、四个房间、20 台设备和空集合；
4. 设备状态规范化后，完整 Home 被保存为 baseline；
5. action space 允许列房间/设备、创建 workflow、报告不可行，但不允许凭空创建新房间；
6. 没有隐藏 guest room 或已有 routine。

## 4. 正确操作应该是什么

参考脚本提交：

```json
{
  "device_id": "home_0",
  "type": "smarthome.report_infeasible",
  "parameters": {
    "category": "missing_room",
    "reason": "The home has no guest room to control.",
    "target": "guest_room"
  }
}
```

随后结束。无需创建空 workflow，也无需推测一个“wind-down”动作列表。

## 5. Evaluator：评测方式与具体评测点

两个启用计分的 evaluator 各占 50%：不可行报告和家庭无变更都必须通过。

### 5.1 报告数量和 category

最终 infeasible reports 必须严格恰好一条。category aliases：

```text
missing_room
missing room
room unavailable
unavailable room
unknown room
```

推荐 `missing_room`。当前实现没有开启 `require_category_alias`，所以实际 category 不要求逐字匹配；非空、非明确成功/可行且不与已知 expected family 冲突的未分类值也可能通过。这是实现放宽，不是规范写法。

### 5.2 target 与原因关系

target aliases：

```text
guest_room
guest room
```

实体同样要求 `guest_room` 或 `guest room`。必须命中任一正向原因：

```text
no guest room
does not exist
not present
missing
cannot be created
```

允许的正常否定短语：

```text
no guest room
does not exist
not present
cannot be created
```

冲突短语：

```text
guest room exists
room is present
workflow is active
```

本题未启用 clause 分组；target 中的实体和 reason 中的缺失说明会在拼接全文中共同建立关系。大小写、下划线和空格差异可被规范化。出现不确定、提问、撤回/改口，或肯定声称 guest room/workflow 存在会失败。

可通过示例：

```text
target: guest_room
reason: No guest room is present, so the routine cannot be created.
```

失败示例：

```text
target: guest_room
reason: The guest room exists and the workflow is active.
```

### 5.3 家庭完全无变更

第二项要求：

- 全部 20 台设备 ID 与完整 state 保持 baseline；
- 四个房间环境完全不变；
- schedules/workflows 仍为空；
- current time 仍为 `2026-06-10T19:00:00`。

因此不能为 bedroom 建替代 routine，也不能留下空的、active 的或 cancelled 的 workflow。该项允许新增本题所需 infeasible report，但没有保护 answer reports/history。

## 6. 当前 evaluator 没检查什么

- 不检查报告是否提到 21:00；
- 不要求定义 wind-down routine 具体应包括灯、窗帘还是温控；
- 不要求先调用 `list_rooms`；
- 不强制 category 等于 `missing_room`；
- 不检查最终聊天回复、answer reports 或 history；
- 不检查 user location/tick interval。

## 7. 常见失败方式

- 把 `bedroom` 当作 guest room 并创建 21:00 workflow：workflows 变化且目标错；
- 创建一个无步骤 workflow：runtime 本身拒绝，且仍缺不可行报告；
- 提交报告后又创建/取消 workflow：最终 workflows 不等于空 baseline；
- 只写 `cannot be created`，却不在任何字段写 guest room：target/entity 不成立；
- 写 `workflow is active`：命中冲突；
- 写 `Maybe there is no guest room?`：不确定和问号导致失败；
- 提交两条报告分别解释 room 与 workflow：报告数必须恰好一条。

## 8. Cleanup

cleanup 对 `home_0` 执行无参数 reset，清空本题 Home 和报告。
