# Core 142 — android_smarthome_336

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 142 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_336.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

这是一项“只读审计”任务：

1. 读取 Home 中所有房间的实时 PM2.5；
2. 从高到低选前三名：kitchen 92、study 71、bedroom 58；
3. 把每个房间的净化器状态和已有计划按 Markor 模板写入 `Home air audit.md`；
4. 加一条非空的 follow-up recommendation；
5. 不能改变任何净化器，也不能改变现有 study 20:00 high 计划。

## 1. Instruction

### 英文原文（逐字）

~~~text
Use the Air audit format in Markor to review the live Home air quality. Create a Markor note named `Home air audit` that ranks the three rooms with the highest PM2.5 readings, records their purifier situation and any existing purifier plan, and recommends follow-up. Do not change any purifier or purifier plan.
~~~

### 中文翻译

使用 Markor 中的 Air audit 格式审查 Home 的实时空气质量。创建名为 `Home air audit` 的 Markor note，列出 PM2.5 最高的三个房间及排名，记录各自的净化器情况和已有净化器计划，并给出后续建议。不要改变任何净化器或净化器计划。

## 2. 输入、附件与初始业务数据

本任务没有短信、联系人、邮件、日历或表格附件。唯一手机附件是 Markor 模板；其余输入是 Home 实时状态。

### 2.1 Markor 模板原文

`Air audit format.md` 上传到：

~~~text
/storage/emulated/0/Documents/Markor/Air audit format.md
~~~

全文：

~~~text
# Home air audit format

- Rank the three rooms with the highest live PM2.5 readings, highest first.
- Use one line per room: `RANK. ROOM — PM2.5 VALUE; purifier: STATE; plan: DETAILS; status: STATUS`.
- Record `plan: none; status: none` when the room has no purifier plan.
- For an existing plan, include its time and level, then record whether it is active.
- Recommend a follow-up action.
- Do not change purifier settings or purifier plans.
~~~

### 2.2 Home 的全部 PM2.5 排名输入

当前时间：`2026-06-16T19:00:00`。

| 排名 | 房间 | PM2.5 |
|---:|---|---:|
| 1 | kitchen | 92.0 |
| 2 | study | 71.0 |
| 3 | bedroom | 58.0 |
| 4 | bathroom | 53.0 |
| 5 | living_room | 44.0 |

### 2.3 相关净化器与计划

| 房间 | purifier 初始状态 | 现有 purifier plan |
|---|---|---|
| kitchen | off / low | 无 |
| study | on / medium | 20:00 设为 high，status=active |
| bedroom | on / medium | 无 |
| bathroom | on / low | 无 |

现有计划完整记录：

~~~text
schedule_id: study_air_plan_2000
run_at: 2026-06-16T20:00:00
device_id: study_air_purifier_1
command: set_level
args: {level: high}
status: active
~~~

初始 workflows 和 history 为空。Setup 会先删除旧的结果文件 `Home air audit.md`。

## 3. Setup 具体流程

### android_0

1. 确保 Markor 可用；
2. 上传 `Air audit format.md`；
3. 删除旧的 `/storage/emulated/0/Documents/Markor/Home air audit.md`。

### home_0

使用 `android_smarthome_336/episode_config.json` reset Home，装入上述房间读数、四台净化器状态和一个 active schedule。

Setup 不会生成审计结果，也不会替你修改 Home。

## 4. 正确输出

结果文件的精确路径：

~~~text
/storage/emulated/0/Documents/Markor/Home air audit.md
~~~

Oracle 示例全文：

~~~text
# Home air audit
1. kitchen — PM2.5 92; purifier: off; plan: none; status: none
2. study — PM2.5 71; purifier: running; plan: 20:00 high; status: active
3. bedroom — PM2.5 58; purifier: running; plan: none; status: none
Recommendation: review kitchen ventilation and purifier use with the household; no purifier or plan was changed during this audit.
~~~

可改写 recommendation，但三条业务记录要服从下面的逐行正则。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 3 个 evaluator，全部必须成功：

1. 结果文件的 shell/grep 内容检查；
2. 四台净化器保持原状态；
3. study purifier plan 保持原状，并且 Home 中 active schedule 总数仍为 1。

后两项都设置了 `enable_score_calc=false`：它们不进入平均分，但仍是 hard guard；任一失败都会令整体失败并把总分置 0。

### 5.1 结果文件是“逐行正则”，不是整篇绝对匹配

Evaluator 先检查精确路径上的文件存在，然后以大小写不敏感的 `grep -E` 分别查找：

1. 某一行中按这个先后顺序出现：独立数字 `1` → `kitchen` → `92` → `purifier: off` → `plan: none` → `status: none`；
2. 某一行中按顺序出现：独立数字 `2` → `study` → `71` → `purifier: on` 或 `purifier: running` → `plan: 20:00` → `high` → `status: active`；
3. 某一行中按顺序出现：独立数字 `3` → `bedroom` → `58` → `purifier: on` 或 `purifier: running` → `plan: none` → `status: none`；
4. 另有一行必须从 `Recommendation:` 开头，冒号后至少有一个非空字符。

这里的 `.*` 不跨换行，所以每个房间的全部字段必须在同一行，不能把 `plan` 或 `status` 拆到下一行。破折号、分号和空格形式不要求与 Oracle 完全一致，但字段顺序不能颠倒。

另有负面检查：全文只要出现以下形式就失败：

- `purifier: not...` 或 `purifier: never...`；
- `plan: no plan...` 或 `plan: not...`；
- `status: not...`、`status: inactive...` 或 `status: cancel...`。

正则不要求整篇只能有这三条，也不检查标题行原文；真正固定的是文件路径、三条行模式和 recommendation 行。

### 5.2 四台净化器不能改变

`smarthome.check_multi_condition` 按子集检查：

- bathroom：on / low；
- bedroom：on / medium；
- kitchen：off / low；
- study：on / medium。

这些必须与 setup 相同。该 evaluator 不检查房间环境读数是否改变。

### 5.3 study 计划不能改变

`smarthome.check_schedule_count` 要求：

- 与 `study_air_plan_2000`、20:00、study purifier、`set_level(high)`、`active` 全字段匹配的 schedule 恰好 1 条；
- Home 全部 schedules 中，active 状态的总数恰好为 1。

所以取消、改时、改档、复制该计划或新增另一条 active schedule 都会失败。实现并不是要求 schedules 列表总长度严格为 1；额外的非匹配且非 active 记录理论上不会触发这条计数规则。

## 6. 常见失败与真实评测边界

- 把 bathroom 53 错排进前三：结果行匹配失败。
- 把一条记录拆成多行：`grep` 的单行正则无法跨行，失败。
- study 写当前档位 high：错误；当前是 medium，20:00 的计划才是 high。
- 写 `status: inactive` 或 `plan: no plan`：命中负面正则，失败；无计划必须写 `none`。
- 为了“改善空气”而打开 kitchen purifier：Home hard guard 失败。

## 7. Cleanup

- android_0 删除输入模板与 `Home air audit.md`；
- home_0 reset。
