# Core 091 — `linux_android_smarthome_002`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 91 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_002.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

Calendar 把业务对象确定为 Guest room、入住时间 18:00；CSV 直接规定 `ready_by=17:30`，并列出 heater 22°C、purifier high、light on、通知 Maya；联系人再把 Maya 映射到 `+1555010202`。因此要建立唯一一条 17:30 active workflow，完整产生三台设备的五个目标字段，并向该号码发送包含 Guest room、17:30 和肯定 ready/prepared 状态的短信。

## 1. Instruction

### 英文原文（逐字）

```text
Use the Guest check-in Calendar event, the Maya Front Desk contact, and /tmp/guest-ready/guest_standard.csv to schedule one active Guest room readiness workflow. The workflow must make every listed device state ready, and Maya must receive a concise confirmation with the readiness time.
```

### 中文翻译

使用日历中的 `Guest check-in` 事件、`Maya Front Desk` 联系人和 `/tmp/guest-ready/guest_standard.csv`，安排一个处于启用状态的客房准备 workflow。该 workflow 必须把表格列出的每项设备状态都设置好，并向 Maya 发送一条简短确认，写明准备时间。

## 2. 输入、附件与初始业务数据

### 2.1 Linux CSV 原文

文件路径：`/tmp/guest-ready/guest_standard.csv`

```csv
room,ready_by,temp_c,purifier,light,notify
Guest room,17:30,22,high,on,Maya Front Desk
```

这行数据的意思是：客房要在 `17:30` 准备好；温度设为 `22°C`，空气净化器设为 `high`，普通灯打开，并通知 `Maya Front Desk`。

### 2.2 Android 日历与联系人

- 日历事件：`Guest check-in`
- 时间：2026-06-16 18:00–18:30
- 地点：`Guest room`
- 描述：`Prepare the guest room from the Linux standard.`
- 联系人：`Maya Front Desk`
- 电话：`+1555010202`
- 备注：`Front desk notification contact`

注意：入住事件是 18:00，但 CSV 要求房间在 17:30 就准备好，所以 workflow 的执行时间是 17:30。

### 2.3 SmartHome 初始状态

SmartHome 当前时间为 `2026-06-16 16:00`，初始没有 schedule 或 workflow。与任务直接相关的状态是：

- `guest_room_heater_1`：关闭，目标温度 19°C；
- `guest_room_air_purifier_1`：关闭，档位 low；
- `guest_room_light_1`：关闭。

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/guest-ready`，把唯一的 CSV 附件上传到上述路径。

### `android_0`

清空日历后写入 `Guest check-in`；清空联系人后写入 Maya；清空短信。确保 Simple Calendar Pro、Contacts 和 Simple SMS Messenger 可用。

### `home_0`

用该任务的 `episode_config.json` 重置 SmartHome，得到上面的当前时间、设备状态和空 workflow 列表。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占一半。

### 4.0 先说人话：怎样才算通过

必须同时完成两件事：

1. 建立唯一一个启用中的 workflow，在 `2026-06-16 17:30` 把客房暖气打开并设为 22°C、把净化器打开并设为 high、把客房灯打开；
2. 向 `+1555010202` 发一条肯定语气的短信，同时写出 `Guest room`、`17:30` 和“已经 ready/prepared/scheduled”。

最稳妥的短信示例：

```text
The Guest room readiness workflow is scheduled and ready for 17:30.
```

### 4.1 短信 evaluator

- 只查看最近 30 分钟内发往 `+1555010202` 的已发送短信。
- 不是整句绝对匹配；正文要出现 `Guest room`、`17:30` 或 `5:30 PM`，以及 `ready` 或 `prepared`。
- 还必须至少出现 `ready`、`prepared`、`scheduled` 之一。
- 出现 `not ready`、`pending` 或 `cancelled` 会失败。
- 疑问句、不确定语气或否定关系会失败。
- 没有要求短信正文写出 Maya 的名字；收件号码才是实际匹配项。

### 4.2 SmartHome workflow evaluator

- 启用中的 workflow 总数必须恰好为 1；多建一个启用 workflow 也会失败。
- 执行时间必须精确为 `2026-06-16T17:30:00`。
- 该 workflow 合并后的效果必须精确为：

```text
guest_room_heater_1       power=on, target_temperature_c=22
guest_room_air_purifier_1 power=on, level=high
guest_room_light_1        power=on
```

- workflow ID 没有被 evaluator 固定；关键是时间、启用状态、唯一数量和完整效果。
- 给 workflow 加入别的设备或额外状态，会使效果集合不再精确相等而失败。

## 5. 常见失败与真实评测边界

- 把 Calendar 的 18:00 check-in 当成准备时间，而忽略 CSV 的 `ready_by=17:30`：失败。
- 只安排 heater target=22、purifier level=high，却没有让两者形成 power=on：精确 effects 缺字段，失败。
- 为三台设备各建一个 workflow：即使动作都正确，active workflow 总数不是 1。
- 给联系人名 Maya 发错号码，或短信没有 Guest room/17:30/肯定 ready 结论：SMS 失败。

SMS evaluator 不要求正文列出 22°C、purifier high、light on，也不要求写 Maya；这些具体设备值只由 workflow evaluator 保证。它只要求 sent box 最近 30 分钟内存在一条发往精确号码的合格消息，不限制短信总数。Evaluator 不检查 Calendar、联系人、CSV 或其他 SmartHome 设备的最终保留状态。

## 6. Cleanup

- Linux 删除 `guest_standard.csv`，并尝试移除 `/tmp/guest-ready`。
- Android 清空 Calendar、Contacts 与 SMS。
- SmartHome reset。
