# Core 149 — android_smarthome_846

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 149 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_846.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：hard
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台手机的消息说 scene bright boost 已被过早宣称成功；第二台手机 CSV 的当前政策要求 quiet rollback。Home 中 living-room dimmable light 仍亮在 90%，并有一条 20:30 重复设到 90% 的错误计划。因此要：

1. 把 living-room dimmable light 关掉并使 brightness=0；
2. 取消 `bad_scene_repeat`；
3. 在第二台手机创建唯一、未完成的 `Rollback correction result` Tasks 项，解释早先 success message、rollback policy、关灯和取消计划；
4. 不要从第一台手机再向 `5550846` 发送 SMS。

## 1. Instruction

### 英文原文（逐字）

~~~text
A success message was sent from the first phone too early, and the current policy in Android Files on the second phone says the change must be rolled back quietly. Correct Home, cancel the mistaken plan, and leave an incomplete Tasks item titled `Rollback correction result` on the second phone explaining the earlier message, the rollback rule, and what you corrected. Do not send another SMS.
~~~

### 中文翻译

第一台手机过早发出了成功消息，而第二台手机 Android Files 中的当前政策要求安静地回滚该更改。修正 Home，取消错误计划，并在第二台手机留下一个标题为 `Rollback correction result` 的未完成 Tasks 项，解释之前的消息、回滚规则和你做的修正。不要再发送 SMS。

## 2. 输入、附件与初始业务数据

本任务没有邮件。输入包括一条手机短信记录、一份 CSV 和 Home 状态。

### 2.1 android_0：预置短信记录

Simple SMS Messenger 会先清空，然后 setup 调用 `androidworld_sms_receive` 注入：

| 字段 | 内容 |
|---|---|
| address | 5550846 |
| body | Success reply sent: scene bright boost completed. |

精确地说，这条 provider 记录位于 received/inbox 侧；它的正文报告“success reply sent”，并不是 setup 预置的一条 sent-box 消息。

### 2.2 android_1：rollback CSV

`rollback_policy.csv` 上传到：

~~~text
/storage/emulated/0/Download/home/rollback_policy.csv
~~~

完整内容：

~~~csv
target,rollback_state,reason
living room dimmable light,off,quiet rollback
~~~

Tasks 会在 setup 中被清空。

### 2.3 home_0：错误现场

当前时间：`2026-06-16T19:00:00`。

| 项目 | 初始值 |
|---|---|
| living_room_dimmable_light_1 | power=on，brightness_pct=90 |

错误 schedule：

~~~text
schedule_id: bad_scene_repeat
run_at: 2026-06-16T20:30:00
device_id: living_room_dimmable_light_1
command: set_brightness
args: {brightness_pct: 90}
status: active
~~~

初始 workflows 和 history 为空。

## 3. Setup 具体流程

### android_0

1. 确保 Simple SMS Messenger 可用；
2. 清空 SMS；
3. 注入上述 received SMS，并等待 5 秒。

### android_1

1. 确保 Android Files 可用并上传 `rollback_policy.csv`；
2. 确保 Tasks 可用并清空 Tasks。

### home_0

使用 `android_smarthome_846/episode_config.json` reset Home，写入 90% 亮灯和错误 active schedule。

## 4. 正确输出

### 4.1 Home

最终：

~~~text
living_room_dimmable_light_1:
  power: off
  brightness_pct: 0
~~~

`bad_scene_repeat` 的其余字段保持不变，但 status 变成 `cancelled`。

### 4.2 Tasks

在 android_1 创建唯一一条未完成任务：

~~~text
title: Rollback correction result
completed: false
~~~

Oracle notes：

~~~text
Correction applied: the earlier success message conflicts with the quiet rollback policy, so the living-room light is off and the repeat plan is cancelled.
~~~

### 4.3 SMS

不要创建新的 sent SMS。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 4 个 evaluator，全部必须成功：

1. android_1 的 Tasks 项；
2. android_0 没有向 `5550846` 发送任何 SMS 的 hard guard；
3. light 最终 off/0；
4. 错误 schedule 已取消且 active schedule 总数为 0。

第 2 项 `enable_score_calc=false`，不进入平均分，但失败会令整体失败并把总分置 0。

### 5.1 Tasks 标题、数量和完成状态

标题 `Rollback correction result` 默认大小写敏感并做 NFC/空白规范化。`require_exactly_one=true` 要求同名 task 恰好一条；它必须 `completed=false`。

Notes 必须命中每个实体组：

- `earlier success message` 或 `success message`；
- `quiet rollback policy` 或 `rollback policy`；
- `living room light` 或 `living-room light`；
- `off` 或 `turned off`；
- `repeat plan` 或 `mistaken plan`；
- `cancelled` 或 `canceled`。

还必须至少出现 `correction applied`、`rollback applied`、`corrected` 之一。

不能出现 `pending`、`not applied`、`light remains on`、`light is on`、`repeat plan remains active`、`plan remains active`、`not cancelled`、`not canceled`。

`cancelled/canceled` 被列入 `allowed_reversal_terms`，所以通用 scorer 不会因为这两个必要词本身表示撤销而拒绝。Notes 不是 Oracle 整句绝对匹配，也没有 clause 绑定要求。

### 5.2 “不要再发 SMS”的实际实现

Evaluator 查询 android_0 的：

- box=`sent`；
- address=`5550846`；
- `any_body=true`；
- `recent_within_mins=0`；
- 期望 `missing`。

这里 0 不是“最近 0 分钟”，而是关闭时间窗口过滤。因此只要 sent box 中存在任何时间、任何正文、发往 `5550846` 的消息就失败。Setup 注入的是 received SMS，不会触发这个检查。

当前 guard 只限定目标号码 `5550846`，不是对所有号码的 sent-box 总数检查；但按 instruction 应当完全不要再发 SMS。

### 5.3 Light 最终状态

`smarthome.check_device_state` 按子集要求：

- power=`off`；
- brightness_pct=`0`。

### 5.4 Schedule 取消与数量

`smarthome.check_schedule_count` 要求：

- 与 `bad_scene_repeat`、20:30、living-room dimmable light、`set_brightness(90)`、status=cancelled 全字段匹配的记录恰好 1 条；
- 全部 schedules 中 active 状态总数恰好为 0。

所以删除该 schedule 而不保留 cancelled 记录会失败；只关灯但让计划 active 也会失败。额外的非匹配 cancelled 记录不受总列表长度约束。

## 6. 常见失败与真实评测边界

- 创建正确 Tasks 后再发一条“rollback completed”短信：SMS hard guard 失败。
- 只把亮度设 0，但设备 state 仍显示 power=on：设备状态失败。
- 直接删除 `bad_scene_repeat`：计数找不到 cancelled 记录，失败。
- Tasks 标为完成：失败；明确要求 incomplete。
- Notes 缺少 earlier success message 或 rollback policy：语义检查失败。

## 7. Cleanup

- android_0 清空 SMS；
- android_1 删除 `rollback_policy.csv` 并清空 Tasks；
- home_0 reset。
