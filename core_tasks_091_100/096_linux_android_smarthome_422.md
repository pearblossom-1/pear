# Core 096 — `linux_android_smarthome_422`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 96 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_422.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
I need the study quiet before the client call. Use the `Client Call` alarm on the first phone as the start time, confirm its room in `/tmp/home_ops/room-updates/source/clock_rule.csv`, and use the pause note on the second phone to schedule the study robot vacuum to pause at the alarm's next occurrence. Record the scheduled time and result in the existing `Client Call follow-up` task and mark it complete; don't create another task.
```

### 中文翻译

我需要在客户通话前让书房保持安静。把第一部手机上的 `Client Call` 闹钟作为开始时间，通过 `/tmp/home_ops/room-updates/source/clock_rule.csv` 确认对应房间，并按第二部手机上的暂停说明，安排书房扫地机器人在该闹钟下一次响起时暂停。在现有 `Client Call follow-up` 任务中记录计划时间和结果并将任务标为完成；不要新建另一个任务。

## 2. 输入、附件与初始业务数据

### 2.1 Linux CSV 原文

路径：`/tmp/home_ops/room-updates/source/clock_rule.csv`

```csv
alarm_label,room
Client Call,study
```

### 2.2 两部手机的数据

第一部手机 Clock：`Client Call` 闹钟，时间 `08:10`。

第二部手机文件 `/storage/emulated/0/Download/clock_422.txt` 原文：

```text
Pause the study robot vacuum when the Client Call alarm occurs so the room is quiet.
```

第二部手机现有任务：

- 标题：`Client Call follow-up`
- notes：`Arrange the study vacuum pause before the client call, then close this follow-up.`
- 状态：未完成

### 2.3 SmartHome 初始状态

- 当前时间：`2026-06-16 18:00`，因此闹钟下一次发生在 `2026-06-17 08:10`；
- `study_robot_vacuum_1`：电源 on、状态 cleaning、电量 34%；
- 初始没有 schedule 或 workflow。

## 3. Setup 具体流程

- `linux_0`：创建目录并上传房间映射 CSV。
- `android_0`：清空 Clock 后添加 08:10 的 `Client Call` 闹钟。
- `android_1`：上传暂停说明；清空 Tasks 后添加现有 follow-up。
- `home_0`：重置到扫地机器人正在清扫且没有计划的状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占一半。

### 4.0 先说人话：怎样才算通过

安排一条 active schedule，在 `2026-06-17 08:10` 对书房扫地机器人执行 `pause`；不是现在立刻暂停。然后把原来的 `Client Call follow-up` 标为完成，并在 notes 中肯定地写明 Client Call、08:10、study robot vacuum 和 scheduled。

最稳妥的 notes：

```text
Client Call: study robot vacuum pause scheduled for 08:10; follow-up complete.
```

### 4.1 Tasks evaluator

- 标题 `Client Call follow-up` 必须恰好只有 1 条，且 completed；重复同名任务会失败。
- notes 必须出现 `Client Call`、`08:10/8:10 AM`、`study`、`robot vacuum/vacuum` 和 `scheduled/schedule`。
- `pending`、`not scheduled`、`paused immediately`、`already paused` 或 `cancelled` 会失败。
- 疑问句、不确定语气和否定关系也会失败。
- 无关标题的额外 Tasks 项目不在这个 getter 的唯一性范围内。

### 4.2 SmartHome schedule evaluator

- 所有 active schedule 总数必须恰好为 1；
- 必须恰好有一条满足：时间 `2026-06-17T08:10:00`、设备 `study_robot_vacuum_1`、命令 `pause`、空参数、状态 active；
- schedule ID 没有被固定；
- 评测的是将来计划，不是扫地机器人的即时最终状态。

