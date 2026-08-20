# Core 160 — android_smarthome_147

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 160 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_147.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：medium
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台手机收到 guest 消息，号码 `5551470`，说大约 20:15 到达。第二台手机同号码联系人备注给出偏好：living-room warm soft light 45%，heater 24 C。

需要立即准备 living room：

1. dimmable light 打开并设 45%；
2. heater 打开并设 24 C；
3. 从第一台手机向 `5551470` 回复 living room 已 ready/prepared，并写明 light 45%、heater 24 C。

## 1. Instruction

### 英文原文（逐字）

~~~text
The first phone received a guest message in Simple SMS Messenger, and the second phone has the guest preference in Contacts. Please prepare the living room and reply from the first phone.
~~~

### 中文翻译

第一台手机在 Simple SMS Messenger 中收到了访客消息，第二台手机的 Contacts 中有访客偏好。请准备 living room，并从第一台手机回复。

## 2. 输入、附件与初始业务数据

本任务没有文件附件或邮件。输入是一条 received SMS 和第二台手机联系人备注；输出是一条 sent SMS 与 Home 最终状态。

### 2.1 android_0：访客消息

Simple SMS Messenger 会先清空，然后从 `5551470` 注入：

~~~text
I will arrive around 20:15.
~~~

Setup 等待 5 秒。这条是 received/inbox 消息。

### 2.2 android_1：访客联系人

Contacts 会先清空，再加入：

| 字段 | 内容 |
|---|---|
| name | Reply Guest |
| number | 5551470 |
| notes | Prefers warm soft light at 45% and heater at 24 C. |

### 2.3 home_0：初始状态

当前时间：`2026-06-16T19:00:00`。

| 设备 | 初始状态 |
|---|---|
| living_room_dimmable_light_1 | power=off，brightness_pct=0 |
| living_room_heater_1 | power=off，target_temperature_c=22.0 |

初始 schedules、workflows 和 history 均为空。

## 3. Setup 具体流程

### android_0

确保 Simple SMS Messenger 可用，清空 SMS，注入 guest 到达消息。

### android_1

确保 Contacts 可用，清空联系人，创建 `Reply Guest` 及完整偏好备注。

### home_0

使用 `android_smarthome_147/episode_config.json` reset Home。

Setup 不会准备房间，也不会发送回复。

## 4. 正确输出

### 4.1 Home

| 设备 | 正确最终状态 |
|---|---|
| living_room_dimmable_light_1 | power=on，brightness_pct=45 |
| living_room_heater_1 | power=on，target_temperature_c=24.0 |

### 4.2 回复短信

必须从 android_0 发往 `5551470`。Oracle 示例：

~~~text
The living room is ready: the light is on at 45% and the heater is on at 24 C.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 3 个 evaluator，全部必须成功：

1. android_0 的 sent SMS；
2. living-room dimmable light 最终状态；
3. living-room heater 最终状态。

### 5.1 SMS 语义匹配

Evaluator 在 sent box 中查找发给 `5551470`、最近 30 分钟内的消息。正文必须命中每个实体组：

- `living room` 或 `living-room`；
- `ready` 或 `prepared`；
- `light`；
- `45` 或 `45%`；
- `heater` 或 `heat`；
- `24`、`24 C` 或 `24°C`。

还需至少出现 `ready`、`prepared`、`complete` 之一。

不得出现：

- `pending`、`cancelled`、`canceled`；
- `not ready`、`not prepared`、`not complete`；
- `light is off`、`heater is off`。

这不是 Oracle 整句绝对匹配，也无 clause 绑定。Evaluator 只要求至少一条匹配 sent SMS，不要求恰好一条。号码比较忽略空格和连字符。

### 5.2 Light 最终状态

`smarthome.check_device_state` 按子集要求：

- power=`on`；
- brightness_pct=`45`。

### 5.3 Heater 最终状态

另一个状态 evaluator 要求：

- power=`on`；
- target_temperature_c=`24.0`。

两个 Home evaluator 都只检查最终状态，不检查命令顺序或 command history。

### 5.4 没有要求写入回复的输入信息

当前 SMS evaluator 不要求正文出现：

- 到达时间 20:15；
- `warm` 或 `soft`；
- 联系人姓名 `Reply Guest`。

这些是输入上下文；通过所需的回复核心是 living room ready、light 45、heater 24。正确操作仍应按联系人偏好完成设置。

## 6. 常见失败与真实评测边界

- 从第二台手机发送回复：evaluator 查询 android_0，失败。
- 只设亮度或温度而没有开机：对应 Home 状态失败。
- 回复只写“room ready”，缺 light/heater 数值：短信失败。
- 把 20:15 误当作温度或计划时间：设备要求是立即设置到 24 C，不创建未来 workflow。
- 不需要在回复中逐字写 `warm soft`。

## 7. Cleanup

- android_0 清空 SMS；
- android_1 清空 Contacts；
- home_0 reset。
