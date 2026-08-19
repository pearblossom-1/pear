# Core 094 — `linux_android_smarthome_423`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 94 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_423.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

第一台手机的 `Kitchen Filter Service` alarm 是 09:15，CSV 把该标签映射到 kitchen，第二台手机文件说明动作是关闭 kitchen air purifier。SmartHome 当前时间已是 6 月 16 日 18:00，所以“下一次发生”是 6 月 17 日 09:15。要建立唯一一条该时刻的 `turn_off` schedule，再完成唯一同名 follow-up，并在 notes 写出时间、厨房净化器和 shutdown 已安排。

## 1. Instruction

### 英文原文（逐字）

```text
The `Kitchen Filter Service` alarm on my first phone is the maintenance cutoff for the kitchen air purifier. Confirm the room mapping in `/tmp/home_ops/schedule-changes/source/clock_rule.csv` and the shutdown note on the second phone, then schedule the purifier to turn off when the alarm next occurs. Update and complete the existing `Kitchen Filter Service follow-up` task on the second phone with the scheduled time and action; don't create a duplicate.
```

### 中文翻译

第一部手机上的 `Kitchen Filter Service` 闹钟是厨房空气净化器的维护截止时间。先用 `/tmp/home_ops/schedule-changes/source/clock_rule.csv` 确认房间映射，再查看第二部手机上的关机说明；然后安排净化器在该闹钟下一次响起时关闭。在第二部手机中更新并完成现有的 `Kitchen Filter Service follow-up` 任务，写明计划时间和动作；不要创建重复任务。

## 2. 输入、附件与初始业务数据

### 2.1 Linux CSV 原文

```csv
alarm_label,room
Kitchen Filter Service,kitchen
```

路径：`/tmp/home_ops/schedule-changes/source/clock_rule.csv`。

### 2.2 两部手机上的数据

第一部手机 Clock：

- 闹钟标签：`Kitchen Filter Service`
- 时间：09:15

第二部手机文件 `/storage/emulated/0/Download/clock_423.txt` 原文：

```text
Turn off the kitchen air purifier before filter service begins.
```

第二部手机现有 Tasks 项目：

- 标题：`Kitchen Filter Service follow-up`
- notes：`Schedule the kitchen purifier shutdown before filter service, then close this follow-up.`
- 状态：未完成

### 2.3 SmartHome 初始状态

当前时间为 `2026-06-16 18:00`，所以 09:15 的下一次发生是 `2026-06-17 09:15`。厨房净化器当前已开启、档位 high；初始没有 schedule。

## 3. Setup 具体流程

- `linux_0`：创建目录并上传 `clock_rule.csv`。
- `android_0`：清空 Clock 后添加唯一的 09:15 闹钟。
- `android_1`：上传关机说明；清空 Tasks 后添加唯一的未完成 follow-up。
- `home_0`：重置 SmartHome，得到上述当前时间和净化器状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占一半。

### 4.0 先说人话：怎样才算通过

建立一个 active schedule，在 `2026-06-17 09:15` 对 `kitchen_air_purifier_1` 执行 `turn_off`。然后更新原来的 follow-up：标题不变，标为完成，并在 notes 中明确写出 09:15、厨房净化器、关闭动作和“已经 scheduled”。

稳妥的 notes：

```text
Kitchen Filter Service: kitchen air purifier shutdown scheduled for 09:15.
```

### 4.1 Tasks evaluator

- 查找标题精确对应 `Kitchen Filter Service follow-up` 的任务。
- 同一标题必须恰好只有 1 条，因此复制一个同名任务会失败；无关标题的额外任务不会被这一 getter 拒绝。
- 任务必须 completed。
- notes 必须出现 `09:15` 或 `9:15 AM`、`kitchen`、`purifier/air purifier`、`turn off/off/shutdown/power off/switch off`。
- 还要包含 `scheduled`、`applied` 或 `set` 中至少一个。
- `pending`、`not scheduled`、`cancelled`、疑问、不确定或否定表达会失败。

### 4.2 SmartHome schedule evaluator

- 所有 active schedule 的总数必须恰好为 1。
- 必须恰好有一条满足：`2026-06-17T09:15:00`、设备 `kitchen_air_purifier_1`、命令 `turn_off`、参数为空、状态 active。
- schedule ID 没有固定，名称可以自定。
- 它检查的是计划是否存在，不要求等到 09:15 后净化器已经实际关闭。

## 5. 常见失败与真实评测边界

- 安排到当天 `2026-06-16 09:15`：该时刻相对 18:00 已过去，下一次应是次日，失败。
- 立即关掉净化器但没建 schedule：设备终态不计分，schedule 项失败。
- 创建 workflow 而非单条 schedule：getter 读取的是 schedules，失败。
- Notes 写“filter service scheduled”但漏了 09:15、kitchen、purifier 或 off 动作中的任一组：失败。
- 新建同名 follow-up 而保留原项：精确同名数为 2，失败。

Task getter 的唯一性只针对精确标题 `Kitchen Filter Service follow-up`，其他标题的额外 Task 不会被该项发现；它也不保存原 row ID。Alarm、CSV 与下载 note 是推导输入，最终 evaluator 不回查它们。Schedule evaluator 不要求当前 purifier 保持 on，也不等待计划执行。

## 6. Cleanup

- Linux 删除 `clock_rule.csv`，并尝试移除其 `source` 目录。
- 第一台 Android 清空 Clock。
- 第二台 Android 删除 `clock_423.txt` 并清空 Tasks。
- SmartHome reset。
