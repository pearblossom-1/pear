# Core 075 — `linux_android_1354`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1354.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`；拓扑 `1A+2L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Take the Markor note, apply `/tmp/summary/summary_template.md`, and write `/tmp/summary/summary.md` on the second Linux machine.
```

### 中文翻译

读取 Markor note，套用 summary_template.md，在第二台 Linux 写 summary.md。

## 2. 数据与评测

Markor：Owner Neve；Date 2026-08-26；Active `inspect valves; call depot`；Archived old route。模板字段：Summary/Owner/Date/Actions/Footer。

唯一 evaluator 要求输出肯定关联 Neve、日期、inspect valves、call depot；禁止 old route/archived route/do not inspect/do not call，且不能触发 missing 哨兵。推荐保留模板结构，只把 active 内容填入，不复制 Archived 行。

