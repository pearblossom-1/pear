# Core 099 — `linux_android_smarthome_609`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 99 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_609.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
The Owner has changed the Guest arrival time. Verify the update against the saved contact and `/tmp/home_ops/plan-revisions/source/priority.pdf`, then replace the old Calendar event on the first phone with the authorized time. Retire the old preparation workflow, schedule its replacement for the newly derived preparation time, and reply to the Owner with the old and new timing.
```

### 中文翻译

Owner 已更改 Guest 的到达时间。用已保存联系人和 `/tmp/home_ops/plan-revisions/source/priority.pdf` 核实更新，然后在第一部手机上用获授权的新时间替换旧日历事件。停用旧准备 workflow，按新计算出的准备时间安排替代 workflow，并向 Owner 回复旧时间和新时间。

## 2. 输入、附件与初始业务数据

### 2.1 Linux PDF 的完整业务内容

路径：`/tmp/home_ops/plan-revisions/source/priority.pdf`，标题 `Owner Priority Notice`。正文给出：

- `AUTHORITY`：最新、已认证的 Owner 消息优先于旧日历时间；
- `PREVIOUS PLAN`：旧准备时间 18:40，对应到达时间 19:00；
- `REVISED PLAN`：Owner 新到达时间为 19:40，所以准备从 19:20 开始；
- `REQUIRED CLEANUP`：取消旧 workflow。

### 2.2 第一部手机的旧日历事件

- 标题：`Guest arrival`
- 时间：2026-06-16 19:00–19:30
- 地点：`Guest room`
- 描述：`Old arrival time; confirm against Owner message.`

### 2.3 第二部手机的联系人和短信

联系人：

- 名称：`Owner`
- 电话：`+1555060901`
- 备注：`Authorized household owner`

收到的短信原文：

```text
Owner update: guest arrives 19:40; use the usual 20-minute guest room prep.
```

### 2.4 SmartHome 旧 workflow

- ID：`guest_prep_old_1840`
- 时间：`2026-06-16 18:40`
- 状态：active
- 效果：客房暖气设为 23°C，客房灯打开

## 3. Setup 具体流程

- `linux_0`：上传一页 priority PDF。
- `android_0`：清空日历后加入唯一的旧 Guest arrival 事件。
- `android_1`：清空短信后注入 Owner 更新；清空联系人后加入 Owner。
- `home_0`：重置到旧准备 workflow active、当前时间 `2026-06-16 18:00` 的状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 4 个 evaluator，通常各占 `1/4`。

### 4.0 先说人话：怎样才算通过

1. 日历最终只能保留一个标题为 `Guest arrival` 的事件，改为 19:40–20:10，地点仍为 Guest room；
2. 把 `guest_prep_old_1840` 标为 cancelled；
3. 建立唯一 active workflow，在 19:20 打开客房灯，并把暖气打开、设为 23°C；
4. 向 Owner 回复一条肯定短信，至少写出 19:20、19:40、Owner 和 updated/replaced。

最稳妥且兼顾 instruction 的短信：

```text
Owner update applied: old prep at 18:40 for the 19:00 arrival was replaced by prep at 19:20 for the new 19:40 arrival.
```

### 4.1 日历 evaluator

- 按标题 `Guest arrival` 做唯一身份匹配，因此同标题必须恰好只有一个；旧事件与新事件同时保留会失败。
- 最终开始时间必须是 19:40，结束时间 20:10，地点 `Guest room`。
- 描述字段不评测；额外的其他标题事件不在该唯一性范围内。

### 4.2 短信 evaluator

- 查找最近 30 分钟内发往 `+1555060901` 的短信。
- 正文必须出现 `19:20/7:20 PM`、`19:40/7:40 PM`、`replaced/updated`、`Owner/owner`。
- 还要含 `replaced`、`updated` 或 `applied` 中至少一个。
- `not replaced`、`pending`、`cancelled`、疑问、不确定或否定关系会失败。

### 4.3 两个 SmartHome evaluator

- 固定旧 ID `guest_prep_old_1840` 必须仍可查到且状态为 cancelled；直接删除不通过。
- active workflow 总数必须恰好为 1。
- 唯一 active workflow 必须在 `2026-06-16T19:20:00` 产生精确效果：

```text
guest_room_heater_1 power=on, target_temperature_c=23
guest_room_light_1  power=on
```

- 新 workflow ID 不固定；额外 active workflow 或额外效果会失败。

### 4.4 当前评测边界

Instruction 说短信要回复“old and new timing”，PDF 中旧数字是 18:40/19:00；但短信 evaluator 实际只强制出现新准备时间 19:20、新到达时间 19:40，以及“已替换”的关系，并没有强制旧数字 18:40 或 19:00。也就是说，只写 `old prep replaced by 19:20 for 19:40` 也可能得分。上面的推荐短信仍把新旧四个时间都写全，才能真正完成 instruction，而不只是满足较窄的 evaluator。

