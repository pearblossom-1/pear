# Core 174 — `android_only_247`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 174 项
- 任务文件：`tasks/cross_device/android_only/android_only_247.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：medium
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机的 Markor 清单给出三场活动要求的提醒分钟数；第二台手机 Calendar 的事件描述记录当前分钟数。正确审计结果是：

| 项目 | 要求分钟 | 当前分钟 | 结论 |
|---|---:|---:|---|
| Dock review | 30 | 30 | matches |
| Gate call | 15 | 5 | mismatch |
| Crew bus | 10 | 无事件 | missing |

需要在第二台手机创建 `/storage/emulated/0/Documents/Markor/Reminder audit.md`，同时不要改 Calendar。

## 1. Instruction

### 英文原文（逐字）

```text
The reminder checklist note on the first phone is the audit source. Check the reminder minutes in Calendar event descriptions on the second phone and create a `Reminder audit` note in Markor for the scheduling team. For every checklist item, record the required minutes, the current minutes or that the event is missing, and whether it matches. Do not change Calendar.
```

### 中文翻译

第一台手机上的 reminder checklist 笔记是审计来源。检查第二台手机 Calendar 事件描述中的提醒分钟数，并在 Markor 中为排班团队创建一份 `Reminder audit` 笔记。对清单中的每一项，都记录要求的分钟数、当前分钟数（或者说明事件缺失），以及两者是否匹配。不要修改 Calendar。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。输入是一份 Markdown 清单和两条 Calendar 事件；第三条事件有意缺失。

### 2.1 `android_0`：`reminder checklist.md`

- 仓库文件：`tasks/cross_device/android_only_assets/android_only_247/android_0/markor/reminder checklist.md`
- 注入路径：`/storage/emulated/0/Documents/Markor/reminder checklist.md`
- 完整原文：

```markdown
Dock review needs reminder 30 minutes
Gate call needs reminder 15 minutes
Crew bus needs reminder 10 minutes

For each item, report the required minutes, the current minutes shown in the
event description (or that the event is missing), and whether the two values
match.
```

### 2.2 `android_1`：Calendar 当前状态

Setup 清空 Calendar 后加入两条事件：

| title | start/end epoch | 按 UTC 解读 | location | description |
|---|---|---|---|---|
| Dock review | `1784192400`–`1784194200` | 2026-07-16 09:00–09:30 | `Dock 8` | `reminder minutes: 30` |
| Gate call | `1784196000`–`1784196900` | 2026-07-16 10:00–10:15 | `Gate 2` | `reminder minutes: 5` |

设备 Calendar 界面显示会受模拟器时区影响；evaluator 比较的是 epoch 秒。Setup 没有创建标题为 `Crew bus` 的事件。

这里没有调用 Calendar 的真实 reminder 字段；任务明确把分钟数放在 description 中，因此需要读描述文字。

### 2.3 输出笔记初态

目标路径：

```text
/storage/emulated/0/Documents/Markor/Reminder audit.md
```

Setup 会先删除这个文件，不预置任何结果。

## 3. Setup 具体流程

### `android_0`

1. 确保 Markor 可用；
2. 上传第 2.1 节的 checklist 笔记。

### `android_1`

1. 确保 Simple Calendar Pro 可用；
2. 清空 Calendar；
3. 添加 Dock review 和 Gate call；
4. 确保 Markor 可用；
5. 删除旧的 `Reminder audit.md`。

## 4. 正确输出

Oracle 笔记正文为：

```markdown
# Reminder audit

Dock review: required 30 minutes; current 30 minutes; matches.
Gate call: required 15 minutes; current 5 minutes; mismatch.
Crew bus: required 10 minutes; event missing.
```

标题行不是 evaluator 的硬性文本要求；固定文件路径才指定了笔记名。正文可以改写，但项目、数字和结论必须保持近距离关联。

## 5. Evaluator：评测方式与具体评测点

本任务共 4 个 evaluator：1 个笔记 evaluator 参与平均分，另外 3 个 Calendar evaluator 设置了 `enable_score_calc: false`。需要特别注意：当前全局汇总实现仍要求所有 evaluator 的 `success` 都为真；任何一个非计分 Calendar guard 失败，也会让任务失败并把总分归零。它们不是可以忽略的日志项。

### 5.1 计分项：`Reminder audit.md`

getter 会 `cat` 精确路径，再运行 entity-relation scorer。必须出现以下全部实体：

```text
Dock review
Gate call
Crew bus
30
15
5
10
```

这里没有 `unique_entities: true`，所以像 Dock review 一行中把 `30` 写两次是允许的；也没有 closed-list 数字正则，出现其他数字不会仅因“额外数字”自动失败。

#### Dock review

- `Dock review` 距离 `30` 最多 16 个关联 token；
- `Dock review` 距离 `matches`、`present`、`correct` 中至少一个最多 20 token；
- 若附近有 `mismatch` 或 `missing`，且它与项目同样近或更近，会失败。

因为要求值和当前值都是 30，evaluator 只要求 `30` 与项目足够近，并不强制分别出现两个 30，也不强制写 `required`/`current` 标签。

#### Gate call

- `Gate call` 距离要求值 `15` 最多 16 token；
- 距离当前值 `5` 最多 20 token；
- 距离 `mismatch` 或 `different` 最多 24 token；
- `matches` 或 `missing` 若在附近同样近或更近，会失败。

因此只写 `Gate call: 15, mismatch` 仍缺少当前值 `5`，不会通过。

#### Crew bus

- `Crew bus` 距离 `10` 最多 16 token；
- 距离 `missing`、`not found` 或 `absent` 最多 20 token；
- `present` 或 `matches` 若在附近同样近或更近，会失败。

`not found` 被配置为允许的负向能力短语，不会被通用否定检测误伤。

#### 关系匹配的实际宽松与限制

- 规则没有要求单独的 relation clause，也没有强制固定行格式；核心是实体存在和 token 距离；
- 不要求 `required`、`current`、`minutes` 这些标签逐字存在；instruction 要求它们的业务含义，但 evaluator 主要靠数字与结论的距离；
- 通用 scorer 仍拒绝问句、`maybe/perhaps` 等不确定语气、撤回和明显否定关系；
- 文件必须在指定路径，创建同内容但不同文件名不会被发现。

### 5.2 Hard guard：Dock review 必须保持原样可找到

Calendar getter 要找到一条同时满足以下字段的事件：

```text
title       Dock review
start_ts    1784192400
end_ts      1784194200
location    Dock 8
description reminder minutes: 30
```

文本字段默认区分大小写、折叠连续空白；时间是整数精确匹配。这里没有唯一性要求，只要至少一条完整匹配的事件仍存在即可。

### 5.3 Hard guard：Gate call 必须保持原样可找到

同理，必须仍能找到：

```text
title       Gate call
start_ts    1784196000
end_ts      1784196900
location    Gate 2
description reminder minutes: 5
```

### 5.4 Hard guard：Crew bus 必须仍然缺失

Getter 只按标题查找 `Crew bus`，期望返回 `missing`。如果用户为了“补齐”清单而新建任意一条标题完全相同的 Crew bus 事件，guard 会失败。

### 5.5 Calendar 保持检查的真实边界

- 修改原事件后再创建一条字段完全等于原值的替代事件，getter 仍可找到匹配项；它不追踪原数据库行 ID；
- 给 Dock review 或 Gate call 新增一个同名副本不会因唯一性自动失败，只要原样匹配项仍存在；
- 新增其他无关标题的事件不在这些 guard 的检查范围内；
- 所以它们具体保护的是“两条原状态仍可找到、Crew bus 标题仍找不到”，不是整个 Calendar 数据库字节级不变。

## 6. 常见失败示例

- `Dock review 30 correct; Gate call 15 mismatch; Crew bus 10 missing.`：Gate call 缺少当前值 5，失败。
- 写对笔记后把 Gate call 的 description 改为 15：笔记可能通过，但原状态 hard guard 失败，整个任务失败。
- 为 Crew bus 新建事件再在笔记中写 present：笔记关系和缺失 guard 都失败。
- 只在第一台手机编辑源 checklist，而没有创建第二台手机的目标笔记：失败。

## 7. Cleanup

- `android_0` 删除 `reminder checklist.md`；
- `android_1` 清空 Calendar，并删除 `Reminder audit.md`。

