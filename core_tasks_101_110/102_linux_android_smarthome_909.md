# Core 102 — linux_android_smarthome_909

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 102 项
- 任务文件：tasks/cross_device/linux_android_smarthome/linux_android_smarthome_909.json
- 运行配置：configs/cross_device/local_android_2linux_smarthome.json
- 难度：hard
- 设备拓扑：1A+2L+1H（android_0、linux_0、linux_1、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

短信报告 kitchen air incident。实时 SmartHome 中 kitchen PM2.5=82，而政策规定大于等于 75 就是 critical，必须立刻打开 kitchen purifier 并设为 high。

因此要完成四件事：

1. 只操作 kitchen_air_purifier_1：off/low → on/high；
2. 在 work_register.xlsx 的 B2 填 kitchen、C2 填 Purifier high；
3. 另存为指定的 work_register_done.xlsx；
4. 在 +155500909 的既有短信会话中回复，说明 kitchen purifier 已开启并处于 high。

## 1. Instruction

### 英文原文（逐字）

~~~text
A kitchen air incident was reported in Simple SMS Messenger. Check the current kitchen reading in SmartHome against `/tmp/kitchen-air-incident/policy/policy.txt`. If the policy calls for action, apply it without changing devices in other rooms. Fill the existing register's `Room` and `Action` fields in `/tmp/kitchen-air-incident/register/work_register.xlsx`, save the completed copy as `/tmp/kitchen-air-incident/result/work_register_done.xlsx`, and reply in the existing message thread with what was done.
~~~

### 中文翻译

Simple SMS Messenger 中报告了一起厨房空气事件。将 SmartHome 中当前的厨房读数与 /tmp/kitchen-air-incident/policy/policy.txt 对照。如果政策要求处理，就执行处理，但不要改变其他房间的设备。在现有登记表 /tmp/kitchen-air-incident/register/work_register.xlsx 中填写 Room 和 Action 字段，将完成后的副本保存为 /tmp/kitchen-air-incident/result/work_register_done.xlsx，并在原短信会话中回复所做的处理。

## 2. 输入、附件与初始业务数据

本任务有短信，没有邮件。

### 2.1 收到的短信

应用：Simple SMS Messenger

| 字段 | 内容 |
|---|---|
| 对方号码 | +155500909 |
| 收件箱正文 | Kitchen air incident. Use SmartHome and reply when recorded. |

Setup 会先清空短信，再注入这一条消息。回复必须发送到同一号码。

### 2.2 Linux 0：政策文本

运行时路径：/tmp/kitchen-air-incident/policy/policy.txt

~~~text
Kitchen air policy: a PM2.5 reading at or above 75 is critical. For a critical reading, turn the kitchen purifier on at high immediately and record a follow-up. Do not change devices in other rooms.
~~~

关键条件是 at or above 75，所以 75 本身也触发；本题实时值 82 明确触发。

### 2.3 Linux 1：源工作簿

运行时路径：/tmp/kitchen-air-incident/register/work_register.xlsx

源工作簿有 Sheet1 和 Completion Guide。

Sheet1 修改前：

| Incident | Room | Action |
|---|---|---|
| kitchen air incident | 空 | 空 |

Completion Guide：

- Room：填写受影响的 SmartHome 房间；
- Action：critical-air policy 触发时选择 Purifier high，否则选择 No action。

最终必须另存为：

    /tmp/kitchen-air-incident/result/work_register_done.xlsx

### 2.4 SmartHome 初始状态

当前时间：2026-06-16 18:00；初始 schedules、workflows、history 均为空。

- kitchen 实时 air_quality_pm25=82；
- kitchen_air_purifier_1：power=off、level=low；
- 其他房间还存在 bathroom、bedroom、guest_room、laundry_room、living_room、office、entry、hallway 等设备，政策要求不动。

## 3. Setup 具体流程

### linux_0

1. 删除旧 policy.txt；
2. 创建 policy 目录；
3. 上传政策文本。

### linux_1

1. 删除旧源工作簿和旧输出工作簿；
2. 创建 register、result 目录；
3. 只上传源 work_register.xlsx。

### android_0

1. 确保 Simple SMS Messenger 已安装；
2. 清空短信；
3. 从 +155500909 注入上述事件短信并等待 5 秒。

### home_0

从 episode_config.json 重置 Home，建立 PM2.5=82、净化器 off/low 和空历史状态。

Setup 不会自动打开政策、工作簿或短信会话。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

必须同时满足：

1. kitchen purifier 最终为 on + high；
2. Home 直接命令历史恰好 2 条；
3. 输出工作簿 A2:C2 正好是 kitchen air incident / kitchen / Purifier high；
4. 已向 +155500909 发送一条肯定说明 kitchen purifier 已开到 high 的短信。

最自然的两条 Home 命令是 turn_on 和 set_level high。多操作任何 Home 设备都会使历史数超过 2。

### 4.1 政策来源守护

Evaluator 对政策文件做大小写敏感的文本子串检查，要求仍有：

- PM2.5 reading at or above 75 is critical
- turn the kitchen purifier on at high
- Do not change devices in other rooms

它不要求修改 policy.txt；该项 enable_score_calc=false。

### 4.2 短信回复

Evaluator 在 sent box 中查找发给 +155500909 的消息，不要求整句绝对匹配。正文必须：

- 含 kitchen；
- 含 purifier 或 air cleaner；
- 含 high、maximum 或 max；
- 至少含一个肯定动作短语：is on、turned on、running、now at、set to；
- 不能含 off、low、medium、failed、could not、cannot、not applied、not changed。

可通过示例：

    The kitchen purifier is on and set to high.

外层 exact_match 只比较 relation getter 是否返回 present，不是把回复正文与一条标准答案逐字比较。

### 4.3 SmartHome 最终状态与命令数

kitchen_air_purifier_1 必须至少满足：

    power = on
    level = high

这是字段子集检查。与此同时，整个 Home history 中命令记录总数必须恰好为 2。历史计数是全局的，所以额外操作其他房间，即使后来改回，也会失败。

### 4.4 输出工作簿

Evaluator 从固定路径读取 XLSX 的第一个 sheet，并逐格精确比较：

| 单元格 | 必须值 |
|---|---|
| A2 | kitchen air incident |
| B2 | kitchen |
| C2 | Purifier high |

边界：

- 文本大小写、空格必须与上表一致；
- 没有固定 sheet 名；
- 没有 reject_extra_nonempty_cells，额外单元格不会被这一项主动拒绝；
- Completion Guide 是否保留、其内容如何，不参与检查；
- 字体、颜色、列宽不评分。

asset 目录还存在 expected/policy_result/decision.json，但 setup 没有部署它，instruction 不要求它，evaluation 也不检查它；它不是本题运行时输出。

## 5. 常见失败与真实评测边界

- 只开机但档位还是 low：设备状态失败。
- 只把 level 设 high 而净化器仍 off：设备状态失败。
- 回复“not changed”或“medium”：触发冲突词，失败。
- 把工作簿覆盖回 register 路径而没有生成 result/work_register_done.xlsx：找不到输出，失败。
- B2 写 Kitchen 或 C2 写 purifier high：逐格大小写不一致，失败。
- 操作其他房间后再改回：最终状态可能看不出，但全局历史超过 2，失败。

Evaluator 没有单独检查 schedule/workflow 数量；本题也不需要创建计划。

## 6. Cleanup

- Linux 0 删除 policy.txt；
- Linux 1 删除源和输出工作簿；
- Android 清空短信；
- Home reset；
- 尝试删除空目录。
