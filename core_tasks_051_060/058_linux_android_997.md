# Core 058 — `linux_android_997`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 58 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_997.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步，最长 420 秒

## 0. 任务链与时间计算

第一部手机 Calendar 开始于 11:00，latest SMS 批准时间是 11:30；policy 容差为 15 分钟。绝对差为 30 分钟，超过容差，因此第二部手机必须添加 08:45 fallback alarm，并写一份完整 note。

## 1. Instruction

### 英文原文（逐字）

```text
The calendar time for 997-A may not match the latest approved time. Compare the Simple Calendar Pro event with the latest approval SMS using `/tmp/alarms/handoff_policy.md`. If the difference is outside the allowed tolerance, add the enabled `997-A time check` fallback alarm at 08:45 in Clock on the second phone. Leave `/storage/emulated/0/Documents/Markor/997-A time check.md` with the case and approval details, both source times, their difference, and the alarm you added.
```

### 中文翻译

997-A 的 calendar time 可能与最新 approved time 不一致。请使用 `/tmp/alarms/handoff_policy.md` 比较 Simple Calendar Pro 事件和最新 approval SMS。如果差异超出允许容差，请在第二部手机 Clock 中添加启用的 `997-A time check` fallback alarm，时间为 08:45；并在 `/storage/emulated/0/Documents/Markor/997-A time check.md` 中写明 case/approval 信息、两个来源时间、差值和已添加的 alarm。

## 2. 输入、附件与初始业务数据

### 第一部手机 Calendar

```text
Title: 997-A source event
Start: 11:00
End: 11:45
Location: Field Office
Description: NX99792; Priya Shah
```

### 第一部手机 latest SMS

```text
From: +1555011886
Latest approval 997-A / NX99792 for Priya Shah: requested time 11:30.
```

### Linux policy

Policy 明确：current row 997-A、code NX99792、owner Priya Shah；Calendar 与 SMS 时间差“大于 15 分钟”时，添加 enabled alarm `997-A time check` at 08:45，并把 case/code/owner、两时间、差值、fallback 汇总成自然说明。

`alarm_policy.csv` 还包含 12 行请求；997-A 行 status=`blocked`，947-D 式 hold 干扰在本任务为 `997-D`。它用于身份佐证，但 instruction 主要指定 handoff_policy。

## 3. Setup 具体流程

- `android_0`：确保 Calendar/SMS 可用并清空；写入事件和一条 latest SMS。
- `android_1`：确保 Markor/Clock 可用，清空所有 alarm，删除旧 note。
- `linux_0`：创建 `/tmp/alarms`，删除旧输入，上传 alarm_policy.csv 和 handoff_policy.md。

## 4. Evaluator：评测方式与具体评测点

本任务 2 项，通常各占 `1/2`。

### 4.0 推荐结果

Alarm：08:45、label=`997-A time check`、enabled。

Note：

```text
997-A / NX99792 for Priya Shah: 11:00 differs from approved 11:30 by 30 minutes, outside tolerance; enabled fallback alarm 997-A time check is set for 08:45.
```

### 4.1 Clock alarm（权重 `1/2`）

- hour=8、minute=45、label 精确匹配、enabled=true。
- 至少存在一条匹配 alarm 即可；没有全 alarm-set 精确约束，额外 alarm 不一定失败。
- label 的文本规范化由 Android alarm getter 处理，最稳妥是逐字命名。

### 4.2 Markor note（权重 `1/2`）

- 必需实体：997-A、NX99792、Priya Shah、11:00、11:30、30、08:45。
- 差异 required group：mismatch/difference/differs/outside。
- alarm required group：alarm is/set、fallback alarm、added alarm、enabled alarm 等。
- 必须命中一个肯定 alarm outcome。
- 冲突：times match、no mismatch、alarm not set/do not set、blocked、removed/deleted/cancelled/disabled。

## 5. 常见失败与边界

- 差值写 15 或 0：entity `30` 缺失。
- alarm 创建正确但 disabled：alarm evaluator 和 note 语义都失败。
- note 写 “case blocked”：`blocked` 在 conflict list，尽管 alarm_policy 行状态确实是 blocked；note 应描述 time mismatch 与已应用 fallback。
- 只创建 alarm 不写 note，或反之，均只能通过一项。

Evaluator 不验证如何计算 30，也不要求 note 中出现 tolerance 数字 15、Calendar/location 或 sender phone。

## 6. Cleanup

清理会清空第一部手机 Calendar/SMS、第二部手机 Clock、删除 note，并删除 Linux 两份 policy 文件。
