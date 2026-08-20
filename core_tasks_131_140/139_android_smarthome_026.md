# Core 139 — android_smarthome_026

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 139 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_026.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

Calendar 规则是：bedroom 温度高于 24 C，或者亮度高于 100 lux，就在 sleep 前 40 分钟安排修正 workflow。Home 当前 bedroom=25.8 C、160 lux，两项都触发。Sleep=20:20，所以 workflow 时间是 19:40。

应创建三步 workflow：开启 bedroom AC、设为 22 C、把 dimmable light 调到 15%。这是未来计划，当前 19:00 不能立刻改变 AC 或 light。

## 1. Instruction

### 英文原文（逐字）

~~~text
Simple Calendar Pro has tonight's sleep rule. Check the live bedroom conditions, schedule the prescribed bedtime prep if the rule triggers, and write a Markor note titled `Sleep Decision` recording the decision, scheduled time, temperature, and light setting (or why no change was needed).
~~~

### 中文翻译

Simple Calendar Pro 中有今晚的 sleep rule。检查 bedroom 的实时条件；如果规则触发，就安排规定的 bedtime prep；并创建标题为 `Sleep Decision` 的 Markor note，记录决定、计划时间、温度和灯光设置（若无需改变，则记录原因）。

本次初始状态明确会触发，所以不能走“no change needed”分支。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片、音频或独立文件附件；主要输入是一条 setup 注入的 Calendar event。

### 2.1 Simple Calendar Pro 事件

| 字段 | 精确内容 |
|---|---|
| title | Sleep |
| start_ts | 1781641200（2026-06-16T20:20:00Z） |
| end_ts | 1781676000（2026-06-17T06:00:00Z） |
| location | Home |
| description | Sleep starts at 20:20. If the bedroom is above 24 C or brighter than 100 lux, create the fix workflow 40 minutes before sleep: cool to 22 C and dim the bedroom light to 15%. |

规则中的逻辑是 OR：温度超阈值或亮度超阈值任一成立就触发。

### 2.2 Markor 初始状态

旧的 `/storage/emulated/0/Documents/Markor/Sleep Decision.md` 会被删除，setup 不提供结果模板。

### 2.3 Home 初始状态

当前时间：2026-06-16 19:00。

| 项目 | 初始值 | 判断 |
|---|---|---|
| bedroom temperature | 25.8 C | >24，触发 |
| bedroom brightness | 160 lux | >100，触发 |
| bedroom_air_conditioner_1 | power=off，mode=cool，target_temperature_c=24.0 | 当前不能立即改 |
| bedroom_dimmable_light_1 | power=on，brightness_pct=80 | 当前不能立即改 |

初始 schedules、workflows、history 均为空。

## 3. Setup 具体流程

### android_0

1. 确保 Simple Calendar Pro 可用。
2. 清空 Calendar。
3. 添加上述 `Sleep` event。
4. 确保 Markor 可用。
5. 删除旧的 `Sleep Decision.md`。

### home_0

使用 `android_smarthome_026/episode_config.json` reset Home。

Setup 不会创建 workflow 或结果 note。

## 4. 正确输出

### 4.1 时间计算

~~~text
20:20 - 40 minutes = 19:40
~~~

### 4.2 Home workflow

run_at=`2026-06-16T19:40:00`，status=active，三步：

| 设备 | command | args |
|---|---|---|
| bedroom_air_conditioner_1 | turn_on | {} |
| bedroom_air_conditioner_1 | set_target_temperature | temperature_c=22.0 |
| bedroom_dimmable_light_1 | set_brightness | brightness_pct=15 |

Oracle workflow_id 是 `sleep_condition_fix`，但 evaluator 不检查 ID。

### 4.3 Markor note

Oracle 示例：

~~~text
The bedroom rule triggered. Bedtime prep is scheduled for 19:40: cool to 22 C and dim the light to 15%.
~~~

文件路径：

~~~text
/storage/emulated/0/Documents/Markor/Sleep Decision.md
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

四项都必须成功：

1. Sleep Decision note；
2. active workflow；
3. AC 没有提前变化的 hard guard；
4. light 没有提前变化的 hard guard。

### 5.1 Note 的语义条件

Evaluator 从精确路径读取 note。正文必须包含：

- `bedroom`；
- `19:40`；
- `22 C` 或 `22C`；
- `15%` 或 `15 percent`；
- `scheduled`、`triggered`、`applied` 至少一个。

不能出现：

- `not scheduled`
- `no change needed`
- `cancelled`
- `pending`

这是 entity-relation，不是全文精确匹配；没有 relation group，所以各实体不必在同一个 clause，行序也不固定。问句、不确定、否定或撤销语义仍可能被通用规则拒绝。

### 5.2 Workflow

必须存在一条 run_at=19:40、status=active、steps 恰好为上述三项的 workflow。

Steps 长度必须为 3；配置没有要求 `steps_ordered`，且当前三步没有触发同一效果字段冲突，因此实现按无序方式匹配。Evaluator 不检查 workflow_id，也不检查总 workflow 数或 schedule 数。

### 5.3 两个 no-change hard guard

评测时以下完整 device state 必须与 setup baseline 相同：

- bedroom_air_conditioner_1：仍为 off、cool、target 24；
- bedroom_dimmable_light_1：仍为 on、brightness 80。

这证明 workflow 只被安排到未来，没有在 19:00 立即执行。

### 5.4 没有检查的内容

- 不单独检查 Calendar event 是否仍存在；
- 不检查 workflow_id；
- 不检查 workflow 唯一性或额外 plan；
- 不检查 note 版式或与 Oracle 逐字相等；
- 不检查 Home command history。

## 6. 常见失败与真实评测边界

- 把 OR 当成 AND：本例两项都超阈值，仍应触发。
- 用 sleep time 20:20 作为 workflow time：应为 19:40，失败。
- 只安排调光，漏掉 AC turn_on 或 set temperature：steps 长度/内容失败。
- 写 `no change needed`：明确冲突，失败。
- 立刻把 AC 和 light 调到目标：两个 no-change guard 失败。
- Note 保存为 `Sleep decision.md` 或其他目录：精确路径失败。

## 7. Cleanup

- android_0 清空 Calendar，并删除 `Sleep Decision.md`。
- home_0 reset。

