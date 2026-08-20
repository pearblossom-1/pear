# Core 194 — `sh1_state_inquiry_bedroom_energy_query_infeasible_0012`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 194 项
- 任务文件：`tasks/smarthome/generated/sh1_state_inquiry_bedroom_energy_query_infeasible_0012.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh1_state_inquiry_bedroom_energy_query_infeasible_0012.json`
- 参考脚本：`tasks/smarthome/scripted/sh1_state_inquiry_bedroom_energy_query_infeasible_0012_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：easy
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH1 state inquiry，infeasible，原因码 `unsupported_state_query`
- Evaluator 函数：`smarthome.check_infeasible_report`、`smarthome.check_no_home_mutation`
- 限制：最多 50 步

## 0. 任务链与直白结论

用户询问卧室当前能耗，单位 kWh。卧室确实存在，但当前 SmartHome 暴露的房间环境字段只有温度、湿度、亮度、PM2.5、噪声和 occupancy；各设备状态也没有累计能耗字段。因此不能根据开机设备猜一个 kWh 数字。

正确结果是写入一条不可行报告，明确说明 bedroom energy use/kWh 没有被系统暴露，同时完全不改变家庭状态。

## 1. Instruction

### 英文原文（逐字）

```text
As I'm planning the evening, I'm closing out my notes for the night; what is the bedroom energy use in kWh right now?
```

### 中文翻译

在规划今晚安排时，我正在收尾今晚的笔记；卧室当前的能耗是多少 kWh？

## 2. 输入、附件与初始业务数据

### 2.1 “notes”是不是便签附件

不是。本题没有便签正文、任务列表、短信、邮件、表格、图片或文件附件。manifest 虽包含 `tasks_notes` surface，但 task 只配置了 `home_0`，setup 没有注入任何 notes app 数据。instruction 中“closing out my notes”只是场景描述。

episode 顶层 `user_location=bedroom` 不会被 reset 读入 Home，也不参与评测。

### 2.2 时间与初始集合

- `base_time` / `current_time`：`2026-06-08T21:00:00`；
- `tick_interval=1.0` 在当前 initializer 中被忽略；
- schedules、workflows、history、infeasible reports、answer reports 初始全为空。

### 2.3 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bedroom` | `temperature_c=24.0`；`humidity_pct=49.8`；`brightness_lux=945.0`；`air_quality_pm25=28.3`；`noise_level_db=28.6`；`occupied=true` |
| `living_room` | `temperature_c=24.2`；`humidity_pct=45.0`；`brightness_lux=180.0`；`air_quality_pm25=29.0`；`noise_level_db=29.9`；`occupied=true` |

关键事实：这里没有 `energy_use_kwh`、`energy`、`kwh` 或功率字段。

### 2.4 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bedroom | `bedroom_air_purifier_1` | air_purifier | `power=off, level=low` |
| bedroom | `bedroom_curtain_1` | curtain | 原始 `open_pct=40`；加载后 `status=partial` |
| bedroom | `bedroom_dehumidifier_1` | dehumidifier | `power=on, level=high` |
| bedroom | `bedroom_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=65` |
| bedroom | `bedroom_heater_1` | heater | `power=on, target_temperature_c=27.0` |
| bedroom | `bedroom_light_1` | light | `power=on` |
| living_room | `living_room_air_conditioner_1` | air_conditioner | `power=off, mode=fan, target_temperature_c=26.0` |
| living_room | `living_room_air_purifier_1` | air_purifier | `power=on, level=low` |
| living_room | `living_room_curtain_1` | curtain | 原始 `open_pct=60`；加载后 `status=partial` |
| living_room | `living_room_humidifier_1` | humidifier | `power=on, level=high` |
| living_room | `living_room_light_1` | light | `power=off` |
| living_room | `living_room_robot_vacuum_1` | robot_vacuum | `power=on, status=paused, battery_pct=98` |

即使可以看到哪些设备开着，也没有每台设备功率、运行时长或累计电量，无法从这些状态推算可信 kWh。

## 3. Setup 具体流程

1. 创建 `home_0`；
2. `smarthome.reset` 打开 episode config，只加载 `initial_home_config`；
3. `base_time` 转为 current time，设备被展开、实例化、规范化；
4. 加载后状态成为 baseline；
5. observation 直接给出完整家庭状态，允许查询房间/设备属性和提交报告；
6. 没有 notes 应用、附件或隐藏 energy 数据源。

## 4. 正确操作应该是什么

参考脚本直接提交：

```json
{
  "device_id": "home_0",
  "type": "smarthome.report_infeasible",
  "parameters": {
    "category": "unsupported_state_query",
    "reason": "The bedroom SmartHome state does not expose energy use in kWh.",
    "target": "bedroom.energy_use_kwh"
  }
}
```

不得调用 `report_answer` 编造一个数值；本题 evaluator 要的是不可行报告。

## 5. Evaluator：评测方式与具体评测点

本题两个 evaluator 各占 50%：语义不可行报告和家庭无变更。两项必须全过。

### 5.1 报告数量与 category

最终必须恰好有一条 infeasible report。category aliases 为：

```text
unsupported_state_query
unsupported state query
measurement unavailable
unavailable data
unsupported query
```

推荐 `unsupported_state_query`。但源码没有开启 `require_category_alias`，因此 category 并非绝对别名匹配；任意非空、非明确成功类、且不形成已知类别族冲突的 category 也可能通过。规范任务解法仍应使用配置里的 canonical category。

### 5.2 target 别名

报告拼接文本必须命中至少一个：

```text
bedroom.energy_use_kwh
bedroom energy
bedroom energy use
bedroom kwh
```

匹配忽略大小写，并会把点、下划线等分隔为 token。若填写了具体 target，target 字段自身必须匹配其中一个别名；推荐 `bedroom.energy_use_kwh`。

### 5.3 原因必须表达“数据不提供”

实体是 `bedroom` 或 `bedroom energy`；同时必须命中下面任一正向短语：

```text
does not expose
no energy
unavailable
not available
unsupported
```

允许的正常否定能力短语是 `does not expose`、`no energy`、`not available`。冲突短语是：

```text
is available
reading is available
reports energy
```

本题没有 clause 约束：实体可在 target，原因短语可在 reason，代码对四个 report 字段拼接后的整体做关系判断。不要使用 `maybe`、`unknown`、`possibly`、问号、撤回语义或同时声称 reading available。

可通过的清楚写法：

```text
target: bedroom.energy_use_kwh
reason: Bedroom energy use is not available because this state does not expose kWh.
```

失败写法：

```text
target: bedroom energy
reason: The bedroom energy reading is available.
```

### 5.4 家庭状态必须完全保留

第二项要求：

- 全部 12 台设备 ID 集合和完整 state 与 baseline 相同；
- 两个房间环境完全相同；
- schedules/workflows 保持空；
- current time 仍为 `2026-06-08T21:00:00`。

它不比较 infeasible reports，因此允许新增所需报告；当前配置也没有保护 answer reports/history。提交一条错误的 answer report 不会被这项单独发现，但不属于任务要求。

## 6. 当前 evaluator 没检查什么

- 不检查是否先实际查询 bedroom；
- 不要求提到所有缺失的计算变量，只需表达 energy/kWh 不可用；
- 不要求 category 严格等于配置别名；
- 不检查 notes，因为根本没有 notes fixture；
- 不检查最终聊天回复、history 或额外 answer report；
- 不检查 user location/tick interval。

## 7. 常见失败方式

- 根据“开了三台设备”猜测一个 kWh：没有可信数据，也没有正确 infeasible report；
- 调用 `report_answer` 而不是 `report_infeasible`：第一项报告数仍为 0；
- 只写 `unsupported`，完全不提 bedroom/energy 目标：target/entity 不成立；
- reason 写 `reading is available`：命中冲突；
- 写 `Maybe the bedroom energy is unavailable?`：不确定词和问号导致失败；
- 查询时顺手改变设备或推进时间：无变更项失败。

## 8. Cleanup

cleanup 对 `home_0` 执行无参数 reset，清空家庭和报告。
