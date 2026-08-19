# Core 071 — `linux_android_1828`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 71 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1828.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 60 步，最长 480 秒

## 0. 任务链与最终要做的事

手机 Clock 已经有一条 06:28 的 early fallback alarm。Linux CSV 的 ready 行要求再加一条 07:28 的 actual-departure alarm。正确结果是保留 fallback，同时新增 actual alarm，而不是用新 alarm 替换旧 alarm。

## 1. Instruction

### 英文原文（逐字）

```text
The phone already has the early `CASE-1828 preparation fallback` alarm, which should remain enabled. Use `/tmp/android_targets/alarm_request.csv` to add the enabled actual-departure alarm for the ready CASE-1828 row, so both the fallback and actual alarm are available.
```

### 中文翻译

手机上已经有一条较早的 `CASE-1828 preparation fallback` alarm，它应继续保持启用。请使用 `/tmp/android_targets/alarm_request.csv`，为 ready 的 CASE-1828 行添加已启用的实际出发 alarm，使 fallback 与 actual alarm 同时可用。

## 2. 输入、附件与初始业务数据

### 2.1 Linux `alarm_request.csv`

```csv
case,status,route,alarm_time,alarm_label,role,notes
CASE-1828,reference,RT-28,06:28,CASE-1828 preparation fallback,early fallback,already enabled; keep this alarm
CASE-1828,ready,RT-28,07:28,CASE-1828 RT-28,actual departure,add this enabled alarm
CASE-OLD,archived,RT-00,08:00,CASE-OLD RT-00,archived,do not schedule
```

逐行解释：

- 第一行是 reference，用来确认现有 fallback，不是要重建或删除的目标。
- 第二行是唯一 ready 行，要新建 `CASE-1828 RT-28` at 07:28。
- 第三行 archived，不能创建 08:00 alarm。

### 2.2 手机 Clock 初始状态

Setup 清空 Clock 后添加：

```text
Time: 06:28
Label: CASE-1828 preparation fallback
```

`androidworld_alarm_add` 创建的 fixture 默认是启用状态。07:28 actual alarm 初始不存在。

## 3. Setup 具体流程

### `android_0`

- 确保 Clock 可用。
- 清空原有 Clock/alarm 数据。
- 添加 06:28 fallback alarm。

### `linux_0`

- 创建 `/tmp/android_targets`。
- 上传 alarm_request.csv；Linux 没有输出文件。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 Android alarm evaluator。

### 4.1 Fallback alarm 仍存在

检查目标：

```text
Hour: 6
Minute: 28
Label: CASE-1828 preparation fallback
Expected: present
```

删除它、改时间或改 label 都会使这一项失败。

### 4.2 Actual-departure alarm 已添加

检查目标：

```text
Hour: 7
Minute: 28
Label: CASE-1828 RT-28
Expected: present
```

只保留 fallback 而不新建这条，会使第二项失败。

### 4.3 Presence getter 的真实范围

- 两项都是“至少找到一条匹配 alarm”的 presence 检查，不是整个 alarm set 的精确比较。
- Getter 没有传 `enabled` 字段，所以 evaluator 实际不区分匹配 alarm 是启用还是禁用。
- 没有检查 alarm 总数；额外 alarm 或重复匹配项不一定失败。
- Instruction 仍明确要求两条都 enabled，正确执行时应遵守，而不能利用 evaluator 的缺口。

## 5. 常见失败与评测边界

- 把 fallback 的 06:28 改成 07:28：第一项失败，即使新时间存在。
- 新 alarm label 写成 fallback label：07:28 的目标 label 不匹配。
- 使用 archived CASE-OLD 08:00：既不能替代 07:28，也会产生无关 alarm。
- 新建 07:28 但关闭它：按 instruction 错；当前 getter 因未指定 enabled，技术上仍可能报 present。

Evaluator 不检查 CSV 是通过哪个应用读取，也不要求在 Linux 写 confirmation。它也没有显式 guard 08:00 archived alarm；真正评分集中在两条目标 alarm 的存在。

## 6. Cleanup

- 手机清空 Clock。
- Linux 删除 alarm_request.csv，并在目录为空时删除目录。
