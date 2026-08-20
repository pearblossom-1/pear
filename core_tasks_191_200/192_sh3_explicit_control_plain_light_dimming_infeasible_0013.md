# Core 192 — `sh3_explicit_control_plain_light_dimming_infeasible_0013`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 192 项
- 任务文件：`tasks/smarthome/generated/sh3_explicit_control_plain_light_dimming_infeasible_0013.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh3_explicit_control_plain_light_dimming_infeasible_0013.json`
- 参考脚本：`tasks/smarthome/scripted/sh3_explicit_control_plain_light_dimming_infeasible_0013_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：medium
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH3 explicit control，infeasible，原因码 `missing_capability`
- Evaluator 函数：`smarthome.check_infeasible_report`、`smarthome.check_no_home_mutation`
- 限制：最多 50 步

## 0. 任务链与直白结论

用户明确指定 `bedroom light 1`，要求把亮度设为 35%。家庭中确实有 `bedroom_light_1`，但它的类型是普通 `light`，只有开和关；同一房间另有一盏可调光的 `bedroom_dimmable_light_1`，但那不是用户点名的灯。

所以不能偷偷改另一盏灯，也不能把普通灯“当成 35%”。正确做法是提交恰好一条 `missing_capability` 不可行报告，说明 `bedroom_light_1` 不支持 brightness/dimming，并保持整套家庭状态不变。

## 1. Instruction

### 英文原文（逐字）

```text
As I'm planning the evening, I'm trying to soften the plain ceiling fixture named bedroom light 1 for bedtime; set that fixture to 35 percent brightness.
```

### 中文翻译

在规划今晚安排时，我想把名为 bedroom light 1 的普通吸顶灯调柔和一些以便睡觉；请把那盏灯的亮度设为 35%。

## 2. 输入、附件与初始业务数据

### 2.1 实际有没有附件

本题没有短信、邮件、便签、表格、图片或磁盘文件附件。manifest 的 surfaces 是 `smarthome_control`、`smarthome_state`，实际输入就是 `home_0` 的家庭快照。

episode 顶层的 `user_location` 是 `bedroom`，但 reset 只读取 `initial_home_config`，这个位置字段不会进入运行时 Home，也不参与评测。

### 2.2 时间与初始集合

- `base_time` / 加载后的 `current_time`：`2026-06-09T19:00:00`；
- episode 中 `tick_interval=1.0`，当前 initializer 会忽略；
- `schedules`、`workflows`、`history`、`infeasible_reports`、`answer_reports` 初始均为空。

### 2.3 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bedroom` | `temperature_c=22.6`；`humidity_pct=48.2`；`brightness_lux=930.0`；`air_quality_pm25=35.9`；`noise_level_db=36.5`；`occupied=true` |
| `dining_room` | `temperature_c=20.6`；`humidity_pct=33.0`；`brightness_lux=300.0`；`air_quality_pm25=50.6`；`noise_level_db=36.0`；`occupied=true` |
| `living_room` | `temperature_c=22.5`；`humidity_pct=45.0`；`brightness_lux=300.0`；`air_quality_pm25=38.6`；`noise_level_db=37.6`；`occupied=true` |
| `study` | `temperature_c=22.5`；`humidity_pct=38.7`；`brightness_lux=120.0`；`air_quality_pm25=48.8`；`noise_level_db=33.2`；`occupied=false` |

### 2.4 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bedroom | `bedroom_air_conditioner_1` | air_conditioner | `power=off, mode=auto, target_temperature_c=21.0` |
| bedroom | `bedroom_air_purifier_1` | air_purifier | `power=on, level=low` |
| bedroom | `bedroom_curtain_1` | curtain | 原始 `open_pct=60`；加载后 `status=partial` |
| bedroom | `bedroom_dehumidifier_1` | dehumidifier | `power=off, level=high` |
| bedroom | `bedroom_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=50` |
| bedroom | `bedroom_light_1` | light | `power=on` |
| dining_room | `dining_room_air_conditioner_1` | air_conditioner | `power=off, mode=dry, target_temperature_c=20.0` |
| dining_room | `dining_room_curtain_1` | curtain | 原始 `open_pct=100`；加载后 `status=open` |
| dining_room | `dining_room_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=65` |
| living_room | `living_room_air_conditioner_1` | air_conditioner | `power=on, mode=auto, target_temperature_c=27.0` |
| living_room | `living_room_air_purifier_1` | air_purifier | `power=off, level=medium` |
| living_room | `living_room_curtain_1` | curtain | 原始 `open_pct=100`；加载后 `status=open` |
| living_room | `living_room_dehumidifier_1` | dehumidifier | `power=on, level=medium` |
| living_room | `living_room_heater_1` | heater | `power=on, target_temperature_c=23.0` |
| living_room | `living_room_humidifier_1` | humidifier | `power=on, level=low` |
| living_room | `living_room_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=93` |
| study | `study_air_conditioner_1` | air_conditioner | `power=off, mode=auto, target_temperature_c=24.0` |
| study | `study_curtain_1` | curtain | 原始 `open_pct=40`；加载后 `status=partial` |
| study | `study_light_1` | light | `power=off` |
| study | `study_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=77` |

关键能力差异：

- `bedroom_light_1` 是 `light`，命令只有 `turn_on`、`turn_off`，状态只有 `power`；
- `bedroom_dimmable_light_1` 才有 `set_brightness` 与 `brightness_pct`；
- instruction 点名的是前者，不能擅自替换目标。

## 3. Setup 具体流程

1. 创建单设备 runtime `home_0`；
2. `smarthome.reset` 通过 episode config ref 读取上述 `initial_home_config`；
3. 嵌套房间设备被展开并实例化，窗帘补出派生 `status`；
4. 加载后的完整 Home 被记录为 baseline；
5. observation 暴露完整状态，action space 允许 `get_device_capabilities` 和 `report_infeasible`，但不开放 advance time/write attribute；
6. 没有 GUI、文件或消息注入。

参考脚本会先查询 `bedroom_light_1` 的 capabilities，再报告不可行。查询只是帮助确认，evaluator 并不强制要求这一步。

## 4. 正确操作应该是什么

推荐先做只读能力查询：

```json
{
  "device_id": "home_0",
  "type": "smarthome.get_device_capabilities",
  "parameters": {"device_id": "bedroom_light_1"}
}
```

然后提交一条报告：

```json
{
  "device_id": "home_0",
  "type": "smarthome.report_infeasible",
  "parameters": {
    "category": "missing_capability",
    "reason": "bedroom_light_1 is a plain light and does not support brightness control.",
    "target": "bedroom_light_1.brightness_pct"
  }
}
```

## 5. Evaluator：评测方式与具体评测点

本题有 2 个等权计分 evaluator：不可行报告占 50%，家庭无变更占 50%。只有两项都得 1.0，整体才通过；一项失败时总分 0.5、`success=false`。

### 5.1 不可行报告：数量严格等于一

最终 `infeasible_reports` 必须恰好有 1 条。配置中的 category 别名为：

```text
missing_capability
missing capability
unsupported capability
no dimming capability
```

推荐 `missing_capability`。但与 Core 191 相同，`require_category_alias` 没有开启：源码不强制 category 命中别名，只拒绝空值、明确表示成功/可行的 category，以及可识别但与 expected family 冲突的类别族。一个不属于任何内置类别族的任意非空 category，配合正确 target/reason，也可能通过。

### 5.2 目标别名

拼接后的 report 必须命中下面至少一个 target 别名：

```text
bedroom_light_1.brightness_pct
bedroom light 1 brightness
bedroom light 1
```

匹配忽略大小写和多数分隔符，因此下划线、点号和空格可被规范成相同 token。显式 target 若不是 `request`、`task` 等通用泛称，它自身也必须匹配上述别名。推荐写完整的 `bedroom_light_1.brightness_pct`，这样设备和缺失属性都清楚。

### 5.3 原因关系

实体要求是 `bedroom_light_1` 或 `bedroom light 1`；同时必须命中以下任意肯定原因短语：

```text
does not support brightness
cannot be dimmed
no dimming
plain light
```

允许作为正常能力否定的短语是：

```text
does not support brightness
cannot be dimmed
no dimming
```

冲突短语是：

```text
supports brightness
was set to 35 percent
dimming is available
```

这里没有 clause 分组要求。Evaluator 把 category、target、reason、details 拼成一份文本；设备实体可在 target，原因短语可在 reason，只要全文关系成立即可。它不是 JSON 全等匹配，也不要求逐字复刻 Oracle。

下列写法清楚且能通过：

```text
target: bedroom_light_1.brightness_pct
reason: bedroom light 1 is a plain light and cannot be dimmed.
```

下列写法会失败：

```text
target: bedroom_light_1
reason: bedroom light 1 supports brightness and was set to 35 percent.
```

任何不确定、提问、撤回或反向表述也会失败，例如 `maybe`、`possibly`、`uncertain`、`unknown`、`?`、`cancelled`、`wrong` 等。问号在显式 target 中会先被去掉再做关系判断，但不要依赖这个特例；reason/details 里的问号仍会触发失败。

### 5.4 家庭无变更 evaluator

第二项要求：

- 全部 20 个 baseline 设备的 ID 集合和完整 state 均保持不变；
- 四个房间的环境值保持不变；
- schedules/workflows 仍为空；
- current time 仍为 `2026-06-09T19:00:00`。

它允许新增本题所需的 `infeasible_reports`，且没有配置保留 `answer_reports` 或 `history`。对普通灯发一个不支持的 `set_brightness` 通常不会成功改状态，但 evaluator 也不要求先故意触发失败命令；最稳妥的是只读查询后直接报告。

## 6. 当前 evaluator 没检查什么

- 不强制调用 capability 查询；
- 不检查报告是否提到具体目标值 35%，只检查缺少调光能力；
- 不强制 category 等于 `missing_capability`；
- 不检查最后给用户的聊天回复；
- 不检查 `answer_reports` 和 `history`；
- 不要求说明同房间还有一盏可调光灯。

## 7. 常见失败方式

- 把 `bedroom_dimmable_light_1` 调到 35%：改错设备，且家庭无变更项失败；
- 把普通灯关掉来模拟“变暗”：目标不是 35%，状态也被改动；
- 只写自然语言解释，不调用 `report_infeasible`：报告数为 0；
- 写两条报告：严格数量检查失败；
- reason 只写 `unsupported`，没有设备实体和配置中的任一正向短语：关系不成立；
- 写 `dimming is available`：命中冲突表达。

## 8. Cleanup

cleanup 对 `home_0` 执行无参数 reset，移除本题加载的全部家庭状态和报告。
