# Core 070 — `linux_android_1234`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 70 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1234.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与映射结论

同一手机号码先发来 09:00 的延误状态，后发来 10:45 的到场卸货状态。Instruction 要 latest，所以取第二条；去掉时间戳、主语 `truck` 和句号后，raw phrase 是 `arrived and unloading`。它在 status_map 中映射到 canonical=`onsite`、rule=`RULE-ARRIVED`。

## 1. Instruction

### 英文原文（逐字）

```text
Take the latest phone status text, map it through `/tmp/status/status_map.csv`, and create `/tmp/status/normalized_status.json` for the downstream status importer. Use exactly four string fields: `message_timestamp`, `raw_phrase`, `canonical_status`, and `matched_rule`.
```

### 中文翻译

取手机中最新的状态文本，通过 `/tmp/status/status_map.csv` 进行映射，并为下游 status importer 创建 `/tmp/status/normalized_status.json`。必须且只能使用四个字符串字段：`message_timestamp`、`raw_phrase`、`canonical_status`、`matched_rule`。

## 2. 输入、附件与初始业务数据

### 2.1 手机 SMS

发送者均为 `5551201234`。先收到：

```text
2026-07-21T09:00:00 truck running late.
```

随后收到最新一条：

```text
2026-07-21T10:45:00 truck arrived and unloading.
```

旧短信会映射到 delayed，但不能使用，因为不是 latest。

### 2.2 Linux `status_map.csv`

```csv
rule_id,phrase,canonical
RULE-ARRIVED,arrived and unloading,onsite
RULE-DELAY,running late,delayed
```

映射后的四个值为：

```text
message_timestamp = 2026-07-21T10:45:00
raw_phrase        = arrived and unloading
canonical_status  = onsite
matched_rule      = RULE-ARRIVED
```

## 3. Setup 具体流程

### `linux_0`

- 删除旧 status_map.csv 与 normalized_status.json，创建 `/tmp/status`。
- 上传新的 status_map.csv。

### `android_0`

- 确保 Simple SMS Messenger 可用并清空 SMS。
- 注入 09:00 旧状态，等待 5 秒。
- 注入 10:45 最新状态，确保对话线程中有明确先后次序。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 `check_json_exact_object` evaluator。完整目标为：

```json
{
  "message_timestamp": "2026-07-21T10:45:00",
  "raw_phrase": "arrived and unloading",
  "canonical_status": "onsite",
  "matched_rule": "RULE-ARRIVED"
}
```

### 4.1 JSON 结构

- 顶层必须是一个 object，不能是数组或 `{ "statuses": [...] }` wrapper。
- key 集合必须精确等于上面四个 key；多 key、少 key均失败。
- 四个值都必须是 JSON string。数字、null、boolean 即使显示相似也失败。
- JSON object 的 key 排列顺序不重要。
- JSON 必须能严格解析；重复 key、非法常量等失败。

### 4.2 值比较

- 四个字符串做精确、大小写敏感比较，不是关键词或别名匹配。
- `raw_phrase` 只能是 `arrived and unloading`，不能带 `truck`、时间戳或句号。
- timestamp 必须来自最新短信，不能写 09:00。
- canonical_status 必须取 map 的 `onsite`，不能自己改成 arrived、on-site 或 ready。
- matched_rule 必须是 `RULE-ARRIVED`，大小写不能变。

## 5. 常见失败与评测边界

- 使用旧短信生成 delayed/RULE-DELAY：四值精确比较失败。
- raw_phrase 写整条短信：失败。
- 增加 `sender`、`source` 或 `confidence`：顶层 key 不精确，失败。
- 把结果写成一元素数组：类型错误。
- 只让 JSON 在视觉上类似但存在重复 key：parser 的 duplicate-key guard 会失败。

Evaluator 不检查 JSON 缩进、换行或 key 顺序，也不检查你是否真的通过 SMS UI 读取；它检查最终文件解析后的精确对象。Cleanup 中 SMS clear 在任务配置里重复列了两次，结果只是再次清空，不改变评测含义。

## 6. Cleanup

- Linux 删除 status_map.csv 和 normalized_status.json，并清理空目录。
- 手机执行两次 SMS clear（配置重复，但效果相同）。
