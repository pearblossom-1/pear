# Core 198 — `sh1_state_inquiry_bathroom_humidity_feasible_0001`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 198 项
- 任务文件：`tasks/smarthome/generated/sh1_state_inquiry_bathroom_humidity_feasible_0001.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh1_state_inquiry_bathroom_humidity_feasible_0001.json`
- 参考脚本：`tasks/smarthome/scripted/sh1_state_inquiry_bathroom_humidity_feasible_0001_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：easy
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH1 state inquiry，feasible
- Evaluator 函数：`smarthome.check_answer_report`、`smarthome.check_no_home_mutation`
- 限制：最多 50 步

## 0. 任务链与直白结论

浴室当前环境的 `humidity_pct` 是 49.3。任务不是只把这个数字说在最终聊天里，而是要通过 `smarthome.report_answer` 向 Home 写入**恰好一条结构化 answer report**。规范答案应明确房间是 bathroom、字段是 humidity、数值为 49.3（可带 `%/percent/pct/percentage` 单位），同时不能改变任何设备、房间、计划、工作流或当前时间。

当前 evaluator 对数值有 ±0.5 容差；并且实现上没有强制 room/field 标签必须出现。推荐仍提交完整明确的结构化答案，不要依赖这个放宽。

## 1. Instruction

### 英文原文（逐字）

```text
I'm checking whether the bathroom will feel steamy after the shower; what is the humidity reading in there right now?
```

### 中文翻译

我在确认淋浴后浴室会不会感觉水汽很重；那里当前的湿度读数是多少？

## 2. 输入、附件与初始业务数据

本题没有短信、邮件、便签、表格、图片或文件附件。manifest surface 只有 `smarthome_state`。实际输入是 SmartHome 家庭快照。

episode 顶层 `user_location=bathroom` 不会被 reset 写入运行时 Home；浴室目标由 instruction 与 answer evaluator 明确指定。

### 2.1 时间与初始集合

- `base_time` / `current_time`：`2026-06-05T19:00:00`；
- `tick_interval=1.0` 当前被 initializer 忽略；
- schedules、workflows、history、infeasible reports、answer reports 初始均为空。

### 2.2 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bathroom` | `temperature_c=23.5`；`humidity_pct=49.3`；`brightness_lux=500.0`；`air_quality_pm25=21.9`；`noise_level_db=32.7`；`occupied=false` |
| `bedroom` | `temperature_c=23.5`；`humidity_pct=37.2`；`brightness_lux=500.0`；`air_quality_pm25=38.0`；`noise_level_db=25.0`；`occupied=false` |
| `kids_room` | `temperature_c=24.8`；`humidity_pct=46.2`；`brightness_lux=173.7`；`air_quality_pm25=32.3`；`noise_level_db=27.3`；`occupied=true` |
| `living_room` | `temperature_c=22.9`；`humidity_pct=50.8`；`brightness_lux=100.0`；`air_quality_pm25=26.6`；`noise_level_db=58.0`；`occupied=false` |
| `study` | `temperature_c=25.5`；`humidity_pct=42.2`；`brightness_lux=400.0`；`air_quality_pm25=32.6`；`noise_level_db=28.1`；`occupied=false` |

要回答的是 bathroom 的 49.3，不是 bedroom 37.2、kids room 46.2、living room 50.8 或 study 42.2。

### 2.3 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bathroom | `bathroom_heater_1` | heater | `power=on, target_temperature_c=26.0` |
| bathroom | `bathroom_humidifier_1` | humidifier | `power=off, level=high` |
| bathroom | `bathroom_light_1` | light | `power=on` |
| bedroom | `bedroom_air_conditioner_1` | air_conditioner | `power=on, mode=auto, target_temperature_c=27.0` |
| bedroom | `bedroom_air_purifier_1` | air_purifier | `power=on, level=high` |
| bedroom | `bedroom_dehumidifier_1` | dehumidifier | `power=off, level=medium` |
| bedroom | `bedroom_heater_1` | heater | `power=off, target_temperature_c=30.0` |
| bedroom | `bedroom_light_1` | light | `power=on` |
| kids_room | `kids_room_air_purifier_1` | air_purifier | `power=off, level=high` |
| kids_room | `kids_room_heater_1` | heater | `power=off, target_temperature_c=27.0` |
| kids_room | `kids_room_humidifier_1` | humidifier | `power=on, level=medium` |
| kids_room | `kids_room_light_1` | light | `power=off` |
| living_room | `living_room_air_conditioner_1` | air_conditioner | `power=on, mode=auto, target_temperature_c=21.0` |
| living_room | `living_room_air_purifier_1` | air_purifier | `power=off, level=medium` |
| living_room | `living_room_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=20` |
| living_room | `living_room_robot_vacuum_1` | robot_vacuum | `power=on, status=cleaning, battery_pct=79` |
| study | `study_air_conditioner_1` | air_conditioner | `power=off, mode=fan, target_temperature_c=23.0` |
| study | `study_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=80` |

## 3. Setup 具体流程

1. 创建 `home_0`；
2. 通过 `smarthome.reset` 加载 episode 的 `initial_home_config`；
3. 五个房间、18 台设备、current time 和空集合被实例化；
4. 完整状态成为 baseline；
5. observation 暴露房间环境，action space 允许 `get_room_state` 与 `report_answer`；
6. 没有其他附件或外部传感器数据。

## 4. 正确操作应该是什么

可先查询浴室：

```json
{
  "device_id": "home_0",
  "type": "smarthome.get_room_state",
  "parameters": {"room_id": "bathroom"}
}
```

然后按参考脚本提交：

```json
{
  "device_id": "home_0",
  "type": "smarthome.report_answer",
  "parameters": {
    "answer": {
      "answer_type": "room_state",
      "room_id": "bathroom",
      "field": "humidity_pct",
      "value": 49.3
    }
  }
}
```

`answer_type` 是清楚的业务标注，但当前 evaluator 不读取它。

## 5. Evaluator：评测方式与具体评测点

本题有两个等权计分项：answer report 50%，家庭无变更 50%。两项必须都通过。

### 5.1 answer report 数量必须严格等于一

Getter 读取 `smarthome_answer_reports`。最终必须恰好有 1 条，并且 report 的 `answer` 必须是非空 JSON object；0 条或多于 1 条失败。Runtime 会自动在外层附加 `sequence` 和 `time`，evaluator 将外层解开后检查内部 answer。

### 5.2 房间、字段和值怎样识别

若 answer 提供房间键，可使用 `room_id`、`room` 或 `location`；值必须是：

```text
bathroom
the bathroom
```

若提供指标键，可使用 `field`、`metric` 或 `measurement`；值必须属于：

```text
humidity_pct
humidity
relative humidity
```

数值可以直接放在键名 `humidity_pct`、`humidity`、`relative humidity` 下；否则 evaluator 依次寻找 `value`、`reading`、`answer`、`result`。

值可以是数值，也可以是“一个数值加可选单位”的完整字符串，例如：

```text
49.3
49.3%
49.3 percent
49.3 pct
49.3 percentage
```

如果单独提供 `unit`，也必须是 `%`、`percent`、`pct` 或 `percentage`。字符串必须整体是数值与单位，`humidity is 49.3%` 这种句子不能由数值 parser 解析。

### 5.3 数值不是固定 Oracle 常量比较，而是读最终房间状态

Evaluator 从最终 Home 的 `rooms.bathroom.environment.humidity_pct` 取目标值，本题在无变更条件下就是 49.3。配置容差为 0.5，判断条件是绝对误差 `<= 0.5`。最稳妥答案是精确的 49.3，不建议刻意使用边界值。

### 5.4 当前实现的两个实质放宽

源码只有“如果 room 键存在则校验”“如果 metric 存在则校验”，没有要求二者必须存在。因此下面这个极简 payload 在当前 evaluator 中也能得 1.0：

```json
{"value": 49.3}
```

这意味着所谓 `semantic_room_state` 实际并没有强制建立“bathroom + humidity + 49.3”的完整显式关系；只要正好提交正确数值即可。规范解法仍应写 `room_id` 和 `field`，否则答案对人类不清楚。

### 5.5 家庭必须完全不变

第二项要求：

- 全部 18 台设备 ID 与完整 state 保持 baseline；
- 五个房间环境保持 baseline，所以 bathroom humidity 仍是 49.3；
- schedules/workflows 仍为空；
- current time 仍为 `2026-06-05T19:00:00`。

它允许新增 answer report；配置没有保护 infeasible reports 或 history。

## 6. 当前 evaluator 没检查什么

- 不强制先调用 `get_room_state`；
- 不强制 answer 中出现 bathroom 或 humidity 标签；
- 不检查 `answer_type`；
- 不检查最终聊天回复；
- 不保护额外 infeasible report/history；
- 不根据“steamy”判断舒适度，只评当前湿度读数。

## 7. 常见失败方式

- 只在最终聊天说“49.3%”，不调用 `report_answer`：报告数为 0；
- 提交两个不同格式的 answer report：报告数为 2；
- 报 bedroom 的 37.2：超出容差；
- 写 `room_id: living_room` 但值 49.3：房间别名校验失败；
- 写 `field: temperature`：指标别名失败；
- 值写成 `humidity is 49.3%`：不能完整解析为数字；
- 为模拟淋浴而打开加湿器或推进时间：家庭无变更项失败。

## 8. Cleanup

cleanup 无参数 reset `home_0`，清空家庭及 answer report。
