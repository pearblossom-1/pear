# Core 191 — `sh2_implicit_intent_nursery_air_comfort_infeasible_0011`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 191 项
- 任务文件：`tasks/smarthome/generated/sh2_implicit_intent_nursery_air_comfort_infeasible_0011.json`
- 家庭快照：`tasks/smarthome/episode_configs/sh2_implicit_intent_nursery_air_comfort_infeasible_0011.json`
- 参考脚本：`tasks/smarthome/scripted/sh2_implicit_intent_nursery_air_comfort_infeasible_0011_solution.json`
- 运行配置：`configs/smarthome/local_smarthome.json`
- 难度：easy
- 设备拓扑：1H（只有 `home_0`）
- 任务类型：SH2 implicit intent，infeasible，原因码 `missing_room`
- Evaluator 函数：`smarthome.check_infeasible_report`、`smarthome.check_no_home_mutation`
- 限制：最多 50 步

## 0. 任务链与直白结论

用户没有直接点名设备，而是说婴儿房睡前又闷又干，要求“让房间更舒适”。如果婴儿房存在，通常需要检查空气净化器、加湿器等设备；但本题家庭只有 `bedroom`、`kitchen` 和 `living_room`，根本没有 `nursery`。

因此这不是“找一个最接近的卧室来调节”，也不是“什么都不做然后口头解释”。正确结果是：向 SmartHome 写入**恰好一条不可行报告**，明确说 `nursery` 不存在，同时不得改变任何家庭设备、房间环境、计划、工作流或当前时间。

## 1. Instruction

### 英文原文（逐字）

```text
As I'm planning the evening, I want the nursery to feel less stuffy and dry before bedtime; make that room more comfortable.
```

### 中文翻译

在规划今晚安排时，我希望婴儿房在睡前不那么闷、也不那么干；请把那个房间调得更舒适一些。

## 2. 输入、附件与初始业务数据

### 2.1 实际有没有附件

本题**没有短信、邮件、便签、表格文件、图片或其他磁盘附件**。Core manifest 虽把 surface 标成 `smarthome_control` 和 `tables`，但 task 的 `devices` 只有 `home_0`，setup 也只执行一次 SmartHome reset；没有任何表格被注入。这里的 `tables` 不是一份需要读取的附件。

实际输入只有家庭快照 JSON。episode 文件还写有 `user_location: living_room`，但 reset 实现只读取其中的 `initial_home_config`，所以 `user_location` 不会成为运行时家庭状态，也不参与 evaluator。

### 2.2 时间与初始集合

- `base_time`：`2026-06-08T20:00:00`，加载后成为 `current_time`；
- `tick_interval`：`1.0`，虽然存在于 episode JSON，但当前 initializer 不把它复制进 Home，实际评测不使用；
- 初始 `schedules`、`workflows`、`history`、`infeasible_reports`、`answer_reports` 全部是空数组。

### 2.3 完整房间环境

| 房间 | 初始环境值 |
|---|---|
| `bedroom` | `temperature_c=25.4`；`humidity_pct=38.7`；`brightness_lux=400.0`；`air_quality_pm25=47.6`；`noise_level_db=58.0`；`occupied=true` |
| `kitchen` | `temperature_c=22.8`；`humidity_pct=47.9`；`brightness_lux=1000.0`；`air_quality_pm25=62.9`；`noise_level_db=42.4`；`occupied=true` |
| `living_room` | `temperature_c=25.5`；`humidity_pct=46.7`；`brightness_lux=680.0`；`air_quality_pm25=27.8`；`noise_level_db=35.0`；`occupied=false` |

这里没有 `nursery` 或 `nursery room`。这是本题不可行的根本证据。

### 2.4 完整设备清单与初始状态

| 房间 | 设备 ID | 类型 | 初始状态 |
|---|---|---|---|
| bedroom | `bedroom_air_purifier_1` | air_purifier | `power=on, level=high` |
| bedroom | `bedroom_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=80` |
| bedroom | `bedroom_robot_vacuum_1` | robot_vacuum | `power=on, status=cleaning, battery_pct=87` |
| kitchen | `kitchen_air_purifier_1` | air_purifier | `power=off, level=low` |
| kitchen | `kitchen_dehumidifier_1` | dehumidifier | `power=on, level=high` |
| kitchen | `kitchen_dimmable_light_1` | dimmable_light | `power=on, brightness_pct=100` |
| kitchen | `kitchen_light_1` | light | `power=on` |
| kitchen | `kitchen_robot_vacuum_1` | robot_vacuum | `power=off, status=docked, battery_pct=61` |
| living_room | `living_room_air_conditioner_1` | air_conditioner | `power=off, mode=cool, target_temperature_c=25.0` |
| living_room | `living_room_air_purifier_1` | air_purifier | `power=on, level=low` |
| living_room | `living_room_curtain_1` | curtain | 原始 `open_pct=60`；加载后派生 `status=partial` |
| living_room | `living_room_dehumidifier_1` | dehumidifier | `power=on, level=medium` |
| living_room | `living_room_humidifier_1` | humidifier | `power=on, level=high` |
| living_room | `living_room_light_1` | light | `power=on` |

## 3. Setup 具体流程

1. Runner 创建单一 SmartHome runtime `home_0`；
2. task 的 setup 调用 `smarthome.reset`，参数只是 episode config 的仓库相对路径；
3. initializer 打开 episode JSON，但只取 `initial_home_config`；
4. `base_time` 转成 Home 的 `current_time`，嵌在各房间里的设备被展开为统一设备列表；
5. 设备类会规范化状态，例如窗帘根据 `open_pct=60` 派生出 `status=partial`；
6. reset 完成后，整个 Home 状态被深拷贝为 evaluator 的 baseline；
7. run config 会把完整家庭状态放进 observation，并开放查询、控制、建计划、建工作流、`report_answer` 和 `report_infeasible` 等动作；它没有开放 `smarthome.advance_time` 或 `smarthome.write_attribute`。

Setup 不会打开任何 GUI，也不会补充隐藏表格或消息。cleanup 最后会再次执行无参数 reset，把家庭恢复为空 Home。

## 4. 正确操作应该是什么

规范且最稳妥的动作就是参考脚本中的这一条：

```json
{
  "device_id": "home_0",
  "type": "smarthome.report_infeasible",
  "parameters": {
    "category": "missing_room",
    "reason": "The nursery room is not present in this home.",
    "target": "nursery"
  }
}
```

随后结束任务。只在普通聊天回复里说“没有婴儿房”不够，因为 evaluator 读取的是 Home 内的 `infeasible_reports` 列表。

## 5. Evaluator：评测方式与具体评测点

本题有 2 个计分 evaluator，二者都启用计分，默认各占 50%。一项通过、一项失败时数值分数是 0.5，但整体 `success=false`；必须两项都通过才算任务通过。本题没有额外的非计分 hard guard。

### 5.1 第一项：不可行报告必须恰好一条

Getter 读取 `smarthome_infeasible_reports`。初始列表为空，最终列表长度必须**严格等于 1**，而且这一条必须通过语义匹配；0 条或 2 条都会直接失败。

配置给出的 category 别名是：

```text
missing_room
missing room
room unavailable
unavailable room
unknown room
```

推荐直接使用 `missing_room`。但当前源码有一个重要放宽：本题没有设置 `require_category_alias=true`，所以 category 并不要求逐字命中上述别名。它只会：

- 拒绝空 category；
- 拒绝 category 恰为 `accepted`、`approved`、`available`、`complete`、`completed`、`done`、`feasible`、`success`、`successful` 或 `supported`；
- 如果实际 category 和期望 category 都能被归入内置类别族，则拒绝互相冲突的类别族。

因此像 `category: "foo"` 这样的无已知类别族字符串，配合正确 target/reason，在当前代码中也能通过。这是 evaluator 的实际边界，不是建议写法。

### 5.2 target/实体怎样匹配

目标别名是：

```text
nursery
nursery room
```

Evaluator 会把 report 的 `category`、`target`、`reason`、`details` 拼起来找目标别名，忽略大小写，并把下划线和多数标点规范为空格。别名既可作为连续短语命中，也可由对应 token 集合命中。

如果显式填写了非通用的 `target`，那么 **target 字段自身**也必须匹配 `nursery` 或 `nursery room`。若 target 写成泛称 `request`、`task`、`requested action` 等，目标词可以放到 reason/details 里；若省略 target，也可以靠 reason/details 命中。最清楚的写法仍是 `target: "nursery"`。

### 5.3 reason 必须肯定说明“不存在”

关系规则要求全文同时含实体 `nursery`/`nursery room`，以及下面任意一条肯定原因短语：

```text
not present
does not exist
no nursery
missing
unavailable
cannot be adjusted
```

它不是整段报告逐字匹配，也没有为本题启用 clause 分组。也就是说，实体和原因短语可以分别出现在 target、reason 或 details 中，只要拼接后的整份报告同时满足关系规则即可。

下面这些冲突表达一旦命中会失败：

```text
is present
exists
available
can be adjusted
```

`not present`、`does not exist`、`no nursery` 和 `cannot be adjusted` 被列为允许的否定能力短语，不会被通用“局部否定”逻辑误杀。报告中出现 `maybe`、`perhaps`、`possibly`、`might`、`uncertain`、`unknown`、`unconfirmed`、`unsure` 等不确定词，出现撤回/取消/改口语义，出现 false/failed/invalid 一类否定赋值，或在 category/reason/details 中出现问号，都会失败。

可通过示例：

```text
target: nursery
reason: The nursery room does not exist in this home.
```

失败示例：

```text
target: nursery
reason: The nursery is available and can be adjusted.
```

### 5.4 第二项：不能改动原生家庭状态

`check_no_home_mutation` 把最终状态与 setup 后的 baseline 比较，要求：

- baseline 中全部 14 个设备仍存在，设备 ID 集合完全相同；
- 每台设备的整个 `state` 字典与 baseline 完全相同；
- `schedules` 完全相同，仍为空；
- `workflows` 完全相同，仍为空；
- `current_time` 仍为 `2026-06-08T20:00:00`；
- 三个房间的环境状态完全相同。

它有意**不比较 `infeasible_reports`**，否则无法提交本题所需报告。当前配置也没有要求保留 `answer_reports` 或 `history`，所以这两类额外变化不由本项检查；但它们不属于任务要求，不应添加。

## 6. 当前 evaluator 没检查什么

- 不要求先调用 `list_rooms` 或查询设备能力；只看最终状态和报告；
- 不要求 category 严格等于 `missing_room`；
- 不要求报告逐字等于参考脚本，也不检查最终自然语言聊天回复；
- 不要求解释“如果有婴儿房本来应该开哪些设备”；
- 不检查 `user_location` 和 `tick_interval`；
- 不检查 `history` 或额外 `answer_reports`。

## 7. 常见失败方式

- 把卧室当成婴儿房并开启设备：家庭状态变化，第二项失败，而且缺正确报告；
- 只回复用户、不调用 `report_infeasible`：报告数为 0；
- 连续提交两条不同解释：报告数为 2；
- 写 `The nursery is available`：命中冲突短语；
- 写 `Maybe the nursery is missing?`：同时含不确定词和问号；
- 为婴儿房新建 schedule/workflow：计划集合改变，第二项失败。

## 8. Cleanup

任务 cleanup 对 `home_0` 执行无参数 `smarthome.reset`，清空本题加载的房间、设备、计划、工作流和报告。
