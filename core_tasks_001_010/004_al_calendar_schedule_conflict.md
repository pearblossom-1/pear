# Core 004 — `al_calendar_schedule_conflict`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 4 项
- 任务文件：`tasks/cross_device/real100/al_calendar_schedule_conflict.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 26 步，最长 260 秒

## 1. Instruction

### 英文原文（逐字）

```text
This week's meeting schedule has conflicts: Android Simple Calendar Pro and Linux `/tmp/schedule/week.csv` disagree on times for meetings with the same names. `/tmp/schedule/rule.txt` says Android Simple Calendar Pro is authoritative. Please correct the CSV and write `/tmp/schedule/log.json` on Linux with each meeting's old and new times.
```

### 中文翻译

本周的会议日程存在冲突：Android Simple Calendar Pro 与 Linux 上的 `/tmp/schedule/week.csv` 对同名会议的时间记录不一致。`/tmp/schedule/rule.txt` 说明 Android Simple Calendar Pro 是权威来源。请更正 CSV，并在 Linux 上写入 `/tmp/schedule/log.json`，记录每场会议的旧时间和新时间。

## 2. 输入、附件与初始业务数据

### 2.1 Android Calendar 权威事件

Setup 在 Simple Calendar Pro 中写入：

```json
{
  "title": "Vendor planning",
  "start_ts": 1802530800,
  "end_ts": 1802534400,
  "location": "Room 8",
  "description": "Source of truth for schedule correction"
}
```

任务使用的 UTC 时间口径为 `2027-02-13 15:00-16:00`。资产目录的 `source/calendar_event.json` 是同一数据的镜像，但 setup 直接写 Calendar，并不上传该 JSON。

### 2.2 Linux `week.csv`

- 仓库源文件：`tasks/cross_device/real100_assets/al_calendar_schedule_conflict/source/week.csv`
- 注入路径：`/tmp/schedule/week.csv`
- 完整初始内容：

```csv
title,date,start,end,location
Vendor planning,2027-02-13,09:00,10:00,Room 2
Ops sync,2027-02-14,11:00,11:30,Room 4
```

应将 `Vendor planning` 更正为 `15:00-16:00` 且地点为 `Room 8`；`Ops sync` 保持不变。

### 2.3 Linux `rule.txt`

- 注入路径：`/tmp/schedule/rule.txt`
- 完整内容：

```text
Source of truth: Simple Calendar Pro
```

### 2.4 预期输出

- 原地修改后的 `/tmp/schedule/week.csv`
- 新文件 `/tmp/schedule/log.json`

没有短信、邮件或媒体附件。

## 3. Setup 具体流程

### `android_0`

1. 确保 `simple calendar pro` 可用。
2. 清空 Calendar。
3. 写入第 2.1 节的 `Vendor planning` 事件。

### `linux_0`

1. 执行 `rm -rf /tmp/schedule && mkdir -p /tmp/schedule`。
2. 上传 `week.csv` 和 `rule.txt` 到上述路径。
3. 不预置 `log.json`。

Cleanup 清空 Calendar 并删除整个 `/tmp/schedule`。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个默认启用的 evaluator，各占 `1/2`；任务级 `success` 要求两项都通过。

### 4.0 先说人话：怎样才算通过

要同时改对 CSV 和写对日志：

1. `week.csv` 最后必须只有这两场会议：
   - `Vendor planning`：`2027-02-13 15:00-16:00`，`Room 8`
   - `Ops sync`：仍是 `2027-02-14 11:00-11:30`，`Room 4`
2. `log.json` 必须清楚说明 `Vendor planning` 的时间从 `09:00-10:00` 改成了 `15:00-16:00`。

日志不要求固定字段名，最稳写法是：

```json
{
  "meeting": "Vendor planning",
  "old": {"start": "09:00", "end": "10:00"},
  "new": {"start": "15:00", "end": "16:00"}
}
```

CSV 里多一行、少一行、时间或地点没改全都会失败。日志里写成“可能改”“没有改”，或者又记录第二条无关变更，也会失败。

### 4.1 `log.json` 的语义变更关系（权重 `1/2`）

- `func`：`check_semantic_change`
- getter：`vm_file`，路径 `/tmp/schedule/log.json`
- 文件必须是有效 JSON；不是固定 JSON schema 的整对象绝对匹配。

必须表达恰好一条与 `Vendor planning` 绑定的旧值 → 新值关系：

```json
{
  "meeting": "Vendor planning",
  "old": {"start": "09:00", "end": "10:00"},
  "new": {"start": "15:00", "end": "16:00"}
}
```

上面是可通过的典型形状，不是唯一允许的字段名。实现还可识别：

- 含 `old/previous/before/from` 与 `new/corrected/after/to` 标记的结构；
- 带 `state/phase/status/kind/role` 的 old/new 记录对；
- Markdown 表格式 old/new 数据；
- `A -> B`、`from A to B`、`changed to`、`moved to`、`replaced with` 等叙述字符串。

严格点包括：

1. 整个 JSON 中最终只能收集出 1 条关系；重复记录或额外会议变更会失败。
2. 该关系的上下文必须出现完整实体名 `Vendor planning`。
3. old 侧必须同时包含 `09:00` 与 `10:00`，new 侧必须同时包含 `15:00` 与 `16:00`。
4. old 侧不能混入 new 的专属值，new 侧不能混入 old 的专属值。
5. 结构化 old/new 侧的原始值数必须与两个期望时间值一致；添加无关结构化值可能失败。
6. `unchanged`、`no change`、撤销/回滚/改回旧值、取消更新等全局或最终状态矛盾会失败。

日志 evaluator 只要求时间 old/new；地点从 `Room 2` 更正为 `Room 8` 由 CSV evaluator 检查，并不要求也写入日志。

### 4.2 更正后的 `week.csv`（权重 `1/2`）

- `func`：`check_csv`
- 使用本项目的 `exact_logical_rows` 路径，以 Python `csv.DictReader` 解析。

目标逻辑记录为：

| title | date | start | end | location |
|---|---|---|---|---|
| Vendor planning | 2027-02-13 | 15:00 | 16:00 | Room 8 |
| Ops sync | 2027-02-14 | 11:00 | 11:30 | Room 4 |

匹配规则：

1. 列集合必须恰好为 `title,date,start,end,location`，列的物理顺序可以变化，不能多列或少列。
2. 记录集合必须恰好为上述两行；`order_sensitive=false`，所以两行前后可交换。
3. 表头和单元格比较会折叠连续空白并忽略大小写。
4. 多余列值、缺失尾部单元格、额外记录、缺少记录均失败。

### 4.3 不评测的内容

- 不要求 `log.json` 使用示例中的固定字段顺序、缩进或唯一 schema。
- 不要求 CSV 保留原行顺序或原始大小写。
- 不检查用户通过哪种工具编辑文件。
