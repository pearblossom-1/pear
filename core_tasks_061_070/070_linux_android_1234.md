# Core 070 — `linux_android_1234`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1234.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Take the latest phone status text, map it through `/tmp/status/status_map.csv`, and create `/tmp/status/normalized_status.json` for the downstream status importer. Use exactly four string fields: `message_timestamp`, `raw_phrase`, `canonical_status`, and `matched_rule`.
```

### 中文翻译

取最新手机 status text，经 status_map 映射后为下游创建 JSON，精确使用四个字符串字段。

## 2. 数据与精确输出

旧短信 09:00 `truck running late`；最新 10:45 `truck arrived and unloading`。Map：arrived and unloading→onsite/RULE-ARRIVED。

唯一 exact-object evaluator 要求 JSON 顶层正好四键且全为字符串：

```json
{"message_timestamp":"2026-07-21T10:45:00","raw_phrase":"arrived and unloading","canonical_status":"onsite","matched_rule":"RULE-ARRIVED"}
```

用旧短信、增加键、漏键、数组包装或非字符串值都会失败。

