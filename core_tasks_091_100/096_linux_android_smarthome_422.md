# Core 096 — `linux_android_smarthome_422`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 96 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_422.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

第一台手机的 Client Call alarm 是 08:10，CSV 将其映射到 study，第二台手机文件说明让 study robot vacuum 在 alarm 时 pause。当前时间是前一天 18:00，所以下一次是 6 月 17 日 08:10。要建立唯一一条未来 pause schedule；不能立即暂停。随后完成现有唯一 follow-up，并在 notes 中写全 Client Call、08:10、study vacuum 和 scheduled。

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

## 5. 常见失败与真实评测边界

- 把 robot vacuum 现在立刻 pause：这不能替代 schedule，而且 notes 若写 `paused immediately/already paused` 会命中冲突短语。
- 使用当天已过去的 08:10，或把日期/时区算错：精确 run_at 失败。
- 建 workflow 而不是 schedule，或 schedule 的命令不是精确 `pause`+空参数：失败。
- 建立第二条 active schedule：即使无关，`exact_active_count=1` 失败。
- 完成 Task 但 notes 漏 Client Call、08:10、study、vacuum、scheduled 中任一组：失败。

Task getter 只保证精确同名项恰好一条，不保存原 row ID，其他标题 Task 也不在唯一性范围内。Schedule evaluator 不检查当前 vacuum 是否继续 cleaning、不检查其电量，也不保护其他设备。Clock/CSV/note 都是输入，不是最终计分对象。

## 6. Cleanup

- Linux 删除 `clock_rule.csv`，并尝试移除其 `source` 目录。
- 第一台 Android 清空 Clock。
- 第二台 Android 删除 `clock_422.txt` 并清空 Tasks。
- SmartHome reset。
