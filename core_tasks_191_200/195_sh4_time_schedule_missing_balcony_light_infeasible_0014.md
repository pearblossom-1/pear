# Core 195 — `sh4_time_schedule_missing_balcony_light_infeasible_0014`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 195 项
- 任务文件：`tasks/smarthome/generated/sh4_time_schedule_missing_balcony_light_infeasible_0014.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh4_time_schedule_missing_balcony_light_infeasible_0014.json`
- 参考脚本：`tasks/smarthome/scripted/sh4_time_schedule_missing_balcony_light_infeasible_0014_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：medium
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH4 time schedule，infeasible，原因码 `missing_device`
- Evaluator 函数：`smarthome.check_infeasible_report`、`smarthome.check_no_home_mutation`
- 限制：最多 50 步

## 0. 任务链与直白结论

当前时间是 2026-06-09 20:00；若目标存在，“two hours from now” 本应是 22:00。但家庭只有 bedroom 和 living room，没有 balcony 房间，也没有 `balcony_light_1`。

因此不能给客厅灯创建一个替代计划，也不能创建指向不存在设备的伪 schedule。正确结果是恰好一条不可行报告，明确指出 `balcony_light_1` 不存在，并保持家庭、计划、工作流和时间完全不变。

## 1. Instruction

### 英文原文（逐字）

```text
Since I don't want to check again later, before guests arrive, have balcony light 1 turn on two hours from now.
```

### 中文翻译

因为我不想稍后再检查一次，请在客人到来前，让 balcony light 1 从现在起两小时后打开。

## 2. 输入、附件与初始业务数据

本题没有短信、邮件、便签、表格、图片或文件附件。manifest 只有 `smarthome_control` surface。episode 顶层写有 `user_location=living_room`，但 reset 只加载 `initial_home_config`，所以该位置字段不进入运行时或 evaluator。

### 2.1 时间与初始集合

- `base_time` / `current_time`：`2026-06-09T20:00:00`；
- `tick_interval=1` 被当前 initializer 忽略；
- schedules、workflows、history、infeasible reports、answer reports 初始均为空。

### 2.2 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bedroom` | `temperature_c=23.9`；`humidity_pct=55.4`；`brightness_lux=250`；`air_quality_pm25=37.6`；`noise_level_db=32.1`；`occupied=true` |
| `living_room` | `temperature_c=22`；`humidity_pct=42.3`；`brightness_lux=975`；`air_quality_pm25=39.5`；`noise_level_db=29.5`；`occupied=false` |

没有 `balcony` 房间。

### 2.3 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bedroom | `bedroom_air_conditioner_1` | air_conditioner | `power=on, mode=fan, target_temperature_c=26` |
| bedroom | `bedroom_air_purifier_1` | air_purifier | `power=on, level=low` |
| bedroom | `bedroom_dehumidifier_1` | dehumidifier | `power=off, level=low` |
| bedroom | `bedroom_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=50` |
| bedroom | `bedroom_heater_1` | heater | `power=on, target_temperature_c=30` |
| bedroom | `bedroom_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=72` |
| living_room | `living_room_air_conditioner_1` | air_conditioner | `power=on, mode=fan, target_temperature_c=20` |
| living_room | `living_room_curtain_1` | curtain | 原始 `open_pct=100`；加载后 `status=open` |
| living_room | `living_room_dehumidifier_1` | dehumidifier | `power=off, level=high` |
| living_room | `living_room_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=35` |
| living_room | `living_room_humidifier_1` | humidifier | `power=off, level=low` |
| living_room | `living_room_light_1` | light | `power=on` |

没有 `balcony_light_1`，也没有任何名字可合理视作它的 balcony 替代品。

## 3. Setup 具体流程

1. 创建单 Home runtime `home_0`；
2. setup 的 `smarthome.reset` 通过 episode ref 只取 `initial_home_config`；
3. base time、两个房间、12 台设备和五个空集合被载入；
4. 规范化后的完整 Home 被保存为 baseline；
5. action space 允许列房间、列设备、创建 schedule/workflow 和报告不可行，但不允许推进时间；
6. 没有隐藏 balcony fixture，也没有已有计划。

如果调用 `get_device_state` 或 `get_device_capabilities` 查询 `balcony_light_1`，runtime 会返回 device not found；这可以辅助判断，但不是 evaluator 强制步骤。

## 4. 正确操作应该是什么

参考脚本的规范动作是：

```json
{
  "device_id": "home_0",
  "type": "smarthome.report_infeasible",
  "parameters": {
    "category": "missing_device",
    "reason": "balcony_light_1 is not present in this home.",
    "target": "balcony_light_1"
  }
}
```

不需要、也不应创建 22:00 的计划，因为目标设备不存在。

## 5. Evaluator：评测方式与具体评测点

本题有两个等权计分项：不可行报告 50%，家庭完全无变更 50%。两项都通过才算通过。

### 5.1 不可行报告必须恰好一条

最终 infeasible reports 长度必须严格等于 1。category aliases 是：

```text
missing_device
missing device
device unavailable
unknown device
```

推荐使用 `missing_device`。不过当前语义 evaluator 没有开启 `require_category_alias`，所以 category 不做绝对别名匹配；它只拒绝空 category、明确成功/可行的 category，以及已识别但类别族冲突的值。规范报告不应利用这个放宽。

### 5.2 target 与原因关系

target aliases：

```text
balcony_light_1
balcony light 1
```

报告四个业务字段拼接后必须命中目标；若填写具体 target，target 自身也必须匹配。下划线和空格在语义别名规范化后等价。

原因关系还要求实体 `balcony_light_1`/`balcony light 1`，并命中以下任一肯定原因：

```text
not present
does not exist
missing
unavailable
cannot be scheduled
```

允许的正常否定短语是 `not present`、`does not exist`、`cannot be scheduled`。冲突短语是：

```text
is present
exists
schedule is active
```

本题没有 clause 分组，实体和原因可以分处 target 与 reason。全文若出现不确定词、问号、撤回/改口语义，或肯定声称设备存在/计划已激活，会失败。

可通过示例：

```text
target: balcony_light_1
reason: Balcony light 1 does not exist and cannot be scheduled.
```

失败示例：

```text
target: balcony_light_1
reason: Balcony light 1 is present and its schedule is active.
```

### 5.3 家庭完全无变更

第二项严格比较 setup baseline，要求：

- 12 台设备 ID 集合和全部状态不变；
- bedroom/living_room 环境值不变；
- schedules 仍为空；
- workflows 仍为空；
- current time 仍是 `2026-06-09T20:00:00`。

因此即使新建了一个指向别的灯的 22:00 schedule，第一项报告正确，第二项也会因 schedules 改变而失败。该检查不保护 infeasible reports，也未配置保护 answer reports/history。

## 6. 当前 evaluator 没检查什么

- 不检查报告里是否算出 22:00；
- 不要求先查询缺失设备；
- 不强制 category 逐字等于 `missing_device`；
- 不检查最终聊天回复；
- 不检查 answer reports/history；
- 不检查用户“客人何时到”，因为 instruction 没给具体到达时间。

## 7. 常见失败方式

- 给 `living_room_light_1` 建替代计划：改错目标且 schedules 变化；
- 提交正确报告后仍保留一个 active/cancelled schedule：schedules 与 baseline 不同；
- 只说“设备不存在”但不调用 report action：报告数为 0；
- 提交两条报告：报告数不等于 1；
- 写 `schedule is active`：命中冲突；
- 写 `Maybe balcony light 1 is missing?`：不确定和问号导致失败。

## 8. Cleanup

cleanup 无参数 reset `home_0`，清空家庭状态和报告。
