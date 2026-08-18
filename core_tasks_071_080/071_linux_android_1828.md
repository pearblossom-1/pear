# Core 071 — `linux_android_1828`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1828.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：60 步 / 480 秒

## 1. Instruction

### 英文原文（逐字）

```text
The phone already has the early `CASE-1828 preparation fallback` alarm, which should remain enabled. Use `/tmp/android_targets/alarm_request.csv` to add the enabled actual-departure alarm for the ready CASE-1828 row, so both the fallback and actual alarm are available.
```

### 中文翻译

保留手机已有且启用的 early fallback alarm；按 CSV ready 行添加启用的 actual-departure alarm，使两者都存在。

## 2. 数据与评测

CSV：fallback `06:28 / CASE-1828 preparation fallback` 已存在；ready actual `07:28 / CASE-1828 RT-28` 要添加；CASE-OLD archived 跳过。

两个 alarm evaluator 分别检查标签、时间和 enabled=true。不能删除/禁用 fallback，也不能把 actual 时间写成 06:28 或 08:00。

