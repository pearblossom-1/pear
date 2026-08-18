# Core 058 — `linux_android_997`

- 任务文件：`tasks/cross_device/linux_android/linux_android_997.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`；拓扑 `2A+1L`
- 限制：最多 50 步，最长 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
The calendar time for 997-A may not match the latest approved time. Compare the Simple Calendar Pro event with the latest approval SMS using `/tmp/alarms/handoff_policy.md`. If the difference is outside the allowed tolerance, add the enabled `997-A time check` fallback alarm at 08:45 in Clock on the second phone. Leave `/storage/emulated/0/Documents/Markor/997-A time check.md` with the case and approval details, both source times, their difference, and the alarm you added.
```

### 中文翻译

比较 997-A 日历时间和最新 approved SMS 时间；若差值超过 policy 容差，在第二部手机添加启用的 08:45 fallback alarm，并在指定 Markor 笔记记录 case/code/owner、两个时间、差值和已加 alarm。

## 2. 输入、Setup 与评测

Calendar 为 11:00；最新 SMS：997-A/NX99792/Priya Shah requested 11:30。Policy 允许 15 分钟，实际差 30 分钟，因此要加 alarm。CSV 也标记该 current case blocked。

本任务 2 项：Clock 中必须存在 enabled `997-A time check`，精确 08:45；Note 必须含 997-A、NX99792、Priya Shah、11:00、11:30、30、08:45，并表达 mismatch/difference/outside 和 alarm set/enabled。写 times match、alarm not set/disabled/cancelled/blocked 会失败。推荐：`997-A / NX99792 for Priya Shah: 11:00 differs from approved 11:30 by 30 minutes, outside tolerance; enabled fallback alarm 997-A time check is set for 08:45.`

