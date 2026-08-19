# Core 097 — `linux_android_smarthome_439`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 97 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_439.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

第一台手机的 Guest Wake alarm 是 09:35，CSV 映射到 bedroom，第二台手机 note 给出 humidifier on/medium；当前时间已过当天 09:35，因此下一次为 6 月 17 日 09:35。要建立唯一 active workflow，在该时刻同时产生 power=on、level=medium，并完成原 follow-up，notes 写全 Guest Wake、时间、bedroom humidifier、medium 和已安排状态。

## 1. Instruction

### 英文原文（逐字）

```text
The guest bedroom gets too dry overnight. Use the `Guest Wake` alarm on the first phone as the humidity-recovery time, confirm the bedroom mapping in `/tmp/home_ops/plan-revisions/source/clock_rule.csv`, and follow the humidifier note on the second phone to schedule a Home workflow that starts the bedroom humidifier at medium when the alarm next occurs. Update and complete the existing `Guest Wake follow-up` task with the time and setting; don't create a duplicate.
```

### 中文翻译

客用卧室夜间会变得太干燥。把第一部手机上的 `Guest Wake` 闹钟作为湿度恢复时间，通过 `/tmp/home_ops/plan-revisions/source/clock_rule.csv` 确认卧室映射，并按照第二部手机上的加湿器说明，安排一个 Home workflow，在该闹钟下一次响起时启动卧室加湿器并设为 medium。更新并完成现有的 `Guest Wake follow-up` 任务，写明时间和档位；不要创建重复任务。

## 2. 输入、附件与初始业务数据

### 2.1 Linux CSV 原文

```csv
alarm_label,room
Guest Wake,bedroom
```

路径：`/tmp/home_ops/plan-revisions/source/clock_rule.csv`。

### 2.2 两部手机的数据

第一部手机 Clock：`Guest Wake` 闹钟，时间 `09:35`。

第二部手机 `/storage/emulated/0/Download/clock_439.txt` 原文：

```text
Start the bedroom humidifier at medium when the Guest Wake alarm occurs.
```

第二部手机现有 Tasks 项目：

- 标题：`Guest Wake follow-up`
- notes：`Arrange the bedroom humidity recovery for guest wake time, then close this follow-up.`
- 状态：未完成

### 2.3 SmartHome 初始状态

当前时间为 `2026-06-16 18:00`，所以闹钟下一次发生在 `2026-06-17 09:35`。`bedroom_humidifier_1` 初始关闭、档位 low；没有现有 schedule 或 workflow。

## 3. Setup 具体流程

- `linux_0`：上传闹钟与房间映射 CSV。
- `android_0`：清空 Clock 后添加 09:35 的 Guest Wake 闹钟。
- `android_1`：上传 humidifier note；清空 Tasks 后加入唯一的未完成 follow-up。
- `home_0`：重置到加湿器关闭、无 workflow 的初始状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占一半。

### 4.0 先说人话：怎样才算通过

建立唯一一个 active workflow，在 `2026-06-17 09:35` 把 `bedroom_humidifier_1` 打开并设为 medium。再把已有 follow-up 标为完成，notes 中写全 Guest Wake、09:35、bedroom、humidifier、medium，并肯定地说计划已经生效。

最稳妥的 notes：

```text
Guest Wake: bedroom humidifier medium recovery scheduled and active at 09:35.
```

### 4.1 Tasks evaluator

- `Guest Wake follow-up` 同名任务必须恰好 1 条并已完成。
- notes 必须含 `Guest Wake`、`09:35/9:35 AM`、`bedroom`、`humidifier/humidity`、`medium/medium level`。
- 还必须含 `scheduled`、`applied` 或 `active` 中至少一个。
- `pending`、`not scheduled`、`cancelled`、疑问、不确定和否定表达会失败。

### 4.2 SmartHome workflow evaluator

- active workflow 总数必须恰好为 1；
- 执行时间必须精确为 `2026-06-17T09:35:00`；
- 合并后的效果必须精确为：

```text
bedroom_humidifier_1 power=on, level=medium
```

- workflow ID 没有固定；
- 增加别的设备或额外效果会导致效果集合不再精确相等。

## 5. 常见失败与真实评测边界

- 使用当天已过去的 09:35，而非次日 `2026-06-17 09:35`：失败。
- 建单条 schedule 而不是 Home workflow：workflow getter 找不到，失败。
- Workflow 只 turn_on、不 set_level medium，或只 set_level、不 turn_on：精确 effects 缺字段。
- 把 power 与 level 拆到两个 active workflows：active workflow 总数变成 2。
- 新建同名 follow-up 或 notes 漏 Guest Wake/时间/房间/设备/medium/肯定状态任一组：Task 项失败。

新 workflow ID 与合法步骤顺序不固定，但合并后的唯一设备效果必须精确。Task getter 不保存原 row ID，唯一性只针对同名项；其他标题 Task 未被拒绝。Alarm、CSV、note 和加湿器即时状态不被最终回查，评测只确认未来 workflow 与 Task 记录。

## 6. Cleanup

- Linux 删除 `clock_rule.csv`，并尝试移除其 `source` 目录。
- 第一台 Android 清空 Clock。
- 第二台 Android 删除 `clock_439.txt` 并清空 Tasks。
- SmartHome reset。
