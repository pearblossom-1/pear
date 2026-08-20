# Core 144 — android_smarthome_144

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 144 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_144.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：medium
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台手机的 Markor 指定：19:20 关闭 bedroom curtain，并把 bedroom light 调到 15%。第二台手机联系人备注指定了确认短信的写法。因此要：

1. 在 Home 创建一条 19:20 的 active workflow，同时关闭 curtain、把 dimmable light 设为 15%；
2. 在第二台手机向 `5551440` 发短信，明确 bedtime 已安排在 19:20、curtain 将关闭、light 将 dim 到 15%。

## 1. Instruction

### 英文原文（逐字）

~~~text
The first phone has a bedtime plan in Markor. Schedule that Home bedtime routine, then use the confirmation style requested in the saved bedtime contact's note to send the scheduled time and settings from the second phone in Simple SMS Messenger.
~~~

### 中文翻译

第一台手机的 Markor 中有一份 bedtime plan。为 Home 安排该 bedtime routine，然后按照已保存 bedtime 联系人备注中要求的确认风格，在第二台手机的 Simple SMS Messenger 中发送计划时间和设置。

## 2. 输入、附件与初始业务数据

本任务没有邮件或预置短信。输入是一份 Markor 文件和联系人备注；短信是输出。

### 2.1 android_0：Bedtime Plan

`Bedtime Plan.md` 上传到：

~~~text
/storage/emulated/0/Documents/Markor/Bedtime Plan.md
~~~

全文：

~~~text
At 19:20, close the bedroom curtain and dim the bedroom light to 15% for bedtime.
~~~

### 2.2 android_1：联系人

Contacts 会先清空，再加入：

| 字段 | 内容 |
|---|---|
| name | Bedtime Updates |
| number | 5551440 |
| notes | Send bedtime routine summaries here in this style: Bedtime at TIME: curtain will close; light will dim to LEVEL%. |

Simple SMS Messenger 的短信在 setup 中会被清空。

### 2.3 home_0：相关初始状态

当前时间：`2026-06-16T19:00:00`。

| 设备 | 初始状态 |
|---|---|
| bedroom_curtain_1 | open_pct=80，status=partial |
| bedroom_dimmable_light_1 | power=on，brightness_pct=70 |

初始 schedules、workflows 和 history 均为空。

## 3. Setup 具体流程

### android_0

确保 Markor 可用并上传 `Bedtime Plan.md`。

### android_1

1. 确保 Contacts 可用并清空联系人；
2. 创建 `Bedtime Updates`；
3. 确保 Simple SMS Messenger 可用并清空 SMS。

### home_0

使用 `android_smarthome_144/episode_config.json` reset Home。

Setup 不会创建 bedtime workflow，也不会发送确认短信。

## 4. 正确输出

### 4.1 Home workflow

计划时间：`2026-06-16T19:20:00`。正确效果：

| 设备 | command | args | 规范化效果 |
|---|---|---|---|
| bedroom_curtain_1 | close | {} | open_pct=0 |
| bedroom_dimmable_light_1 | set_brightness | brightness_pct=15 | power=on，brightness_pct=15 |

Oracle workflow_id 是 `two_phone_bedtime`，但 evaluator 不检查 ID。

### 4.2 短信

发送到 `5551440`。Oracle 示例：

~~~text
Bedtime is scheduled for 19:20: the bedroom curtain will close and the light will dim to 15%.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 2 个 evaluator，两个都必须成功：

1. android_1 的 sent SMS；
2. Home 中唯一 active workflow 的时间和效果。

### 5.1 短信采用语义匹配

Evaluator 在 sent box 中寻找发给 `5551440`、最近 30 分钟内的短信。正文必须命中每个实体组：

- `bedtime`；
- `19:20` / `7:20 PM` / `7.20 PM`；
- `curtain`；
- `close` / `closed`；
- `light`；
- `15` / `15%`。

还需要：

- 至少一个肯定完成/计划表达：`scheduled`、`will close`、`will dim`、`routine is active`；
- 必须出现 `dim` 或 `dimmed`；
- 不能出现 `pending`、`cancelled`、`canceled`、`not scheduled`、`not active`、`will not close`、`will not dim`。

这不是联系人备注整句的绝对匹配，也不强制冒号、分号或完全相同的语序。本规则没有 relation group，信息可以跨句，但问句、明显不确定、否定和撤销语义会被拒绝。只要求至少一条匹配短信，不要求恰好一条。

### 5.2 Workflow 按“规范化效果”检查

`smarthome.check_workflow_effects` 要求：

- Home 全部 workflows 中 active workflow 的总数必须恰好为 1；
- 该 workflow 的 `run_at` 精确为 `2026-06-16T19:20:00`；
- steps 规范化后形成的效果字典必须精确等于：
  - bedroom_curtain_1：`open_pct=0`；
  - bedroom_dimmable_light_1：`power=on`、`brightness_pct=15`。

Evaluator 不检查 workflow_id，也不要求一定使用 Oracle 的命令表示；只要是实现支持且规范化成同样效果的步骤即可。多出其他设备或额外效果字段会使效果字典不相等而失败。

### 5.3 当前状态没有 hard guard

虽然这是未来 workflow，当前 evaluator 没有单独确认 curtain/light 在 19:00 保持初始状态，也没有检查 command history。通过条件只看 workflow 记录和短信。

## 6. 常见失败与真实评测边界

- 创建两个独立 schedules：workflow evaluator 不会把它们当作一条 workflow。
- 计划时间写成 19:00 或 19:15：失败；必须是 19:20。
- 只在短信写“bedtime scheduled”，缺少 curtain、light、15 或 dim：失败。
- Workflow 多加一台设备：规范化 effects 不再精确相等，失败。
- 短信可自然改写，无需逐字复制联系人 note。

## 7. Cleanup

- android_0 删除 `Bedtime Plan.md`；
- android_1 清空 Contacts 和 SMS；
- home_0 reset。
