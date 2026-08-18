# Core 002 — `al2_data_transform_sync`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 2 项
- 任务文件：`tasks/cross_device/real100/al2_data_transform_sync.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 28 步，最长 280 秒

## 1. Instruction

### 英文原文（逐字）

```text
I need the CSV organized into a delivery spreadsheet according to the handoff rule. The Android Markor note `Transform rule` explains how to process `/tmp/data/input.csv` on the first Linux machine. Please create `/tmp/data/result.xlsx` on the second Linux machine and write `/tmp/data/status.json` on the first Linux machine.
```

### 中文翻译

我需要按照交接规则把 CSV 整理为交付用电子表格。Android 上的 Markor 笔记 `Transform rule` 说明了如何处理第一台 Linux 机器上的 `/tmp/data/input.csv`。请在第二台 Linux 机器上创建 `/tmp/data/result.xlsx`，并在第一台 Linux 机器上写入 `/tmp/data/status.json`。

## 2. 输入、附件与初始业务数据

### 2.1 Android Markor 规则笔记

- 路径：`/storage/emulated/0/Documents/Markor/Transform rule.md`
- Setup 写入的完整原文：

```markdown
# Transform rule
Keep rows where status is ready.
Output columns: item, owner, priority.
Sort by priority ascending.
Write status.json with row_count and source: android_markor_transform_rule.
```

含义：仅保留 `status=ready` 的行；输出列为 `item, owner, priority`；按 priority 升序；状态 JSON 要包含行数和固定 source 值。资产目录中的 `source/Transform rule.md` 与上述内容相同，但 setup 实际使用内联 shell 写入，而不是上传该文件。

### 2.2 第一台 Linux 的 CSV 附件

- 仓库源文件：`tasks/cross_device/real100_assets/al2_data_transform_sync/source/input.csv`
- 注入路径：`linux_0:/tmp/data/input.csv`
- 完整内容：

```csv
item,owner,status,priority
alpha,Lina,ready,2
beta,Marek,draft,1
gamma,Priya,ready,1
```

根据规则，`beta` 应被过滤，输出顺序应为 `gamma`、`alpha`。

### 2.3 预期输出

- `linux_1:/tmp/data/result.xlsx`
- `linux_0:/tmp/data/status.json`

没有短信、邮件、图片或音频输入。

## 3. Setup 具体流程

### `android_0`

1. `ensure_app`：确保 Markor 可用。
2. 创建 `/storage/emulated/0/Documents/Markor`。
3. 以 heredoc 覆盖写入第 2.1 节的 `Transform rule.md`。

### `linux_0`

1. 执行 `rm -rf /tmp/data && mkdir -p /tmp/data`，清理旧输入、状态文件及同目录内容。
2. 上传 `input.csv` 到 `/tmp/data/input.csv`。

### `linux_1`

1. 同样重建 `/tmp/data`。
2. 不预置 `result.xlsx`；用户需要依据 Android 规则和第一台 Linux 的 CSV 在此生成结果。

Cleanup 删除 Android 的规则笔记，并删除两台 Linux 的 `/tmp/data`。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个默认启用的 evaluator，各占 `1/2`。总分是两项平均值；任务级 `success` 要求两项同时通过。

### 4.0 先说人话：怎样才算通过

要做出两个文件，而且两个都正确：

1. 第二台 Linux 的 `result.xlsx` 中要有下面这张结果表，顺序不能换：

```text
item   owner   priority
gamma  Priya   1
alpha  Lina    2
```

`beta` 是 draft，不能出现在结果里。表可以放在任意 sheet、任意位置，但不要再放第二份结果表或额外数据行。

2. 第一台 Linux 的 `status.json` 至少要写出：

```json
{
  "row_count": 2,
  "source": "android_markor_transform_rule"
}
```

只做对 XLSX 或只做对 JSON 都只能得到一半分数，整个任务不算通过。

### 4.1 `result.xlsx` 逻辑表（权重 `1/2`）

- `device_id`：`linux_1`
- `func`：`check_xlsx_cells`
- getter：`vm_file`，路径 `/tmp/data/result.xlsx`
- 实现：使用 `openpyxl` 解析真实工作簿单元格，不是搜索 ZIP 内字符串，也不是文件哈希比较。

目标逻辑表为：

| item | owner | priority |
|---|---|---|
| gamma | Priya | 1 |
| alpha | Lina | 2 |

具体匹配逻辑：

1. 在所有可见工作表中寻找连续的表头窗口 `item, owner, priority`；大小写不敏感并折叠多余空白。
2. 必须只找到一个这样的可见表头。工作表名称、表格起始行列和表头上方的稀疏标题不固定。
3. 表头所在行在该三列之外不得还有非空单元格。
4. 从表头下一行连续读取，遇到第一行全空时停止。两行数据必须按 `gamma` 后 `alpha` 的顺序精确相等；不能多行、少行或交换顺序。
5. 每个数据行在目标三列之外不得有额外非空单元格；隐藏的数据行会失败。
6. 其他区域若形成额外的“密集表格”会失败。隐藏工作表也会被扫描，因此不能把旧结果、草稿表或重复表藏到隐藏 sheet；普通稀疏标题/说明文字仍可存在。
7. 本任务没有指定 sheet 名、单元格坐标、颜色、字体或公式要求。

### 4.2 `status.json`（权重 `1/2`）

- `device_id`：`linux_0`
- `func`：`check_json`
- getter：`vm_file`，路径 `/tmp/data/status.json`
- 实现：用 JSON 解析器读取文件，再按 OSWorld 的 key-path 规则检查值。

必须满足：

```json
{
  "row_count": 2,
  "source": "android_markor_transform_rule"
}
```

精确规则为：

- 顶层 `row_count` 必须用 `eq` 与数字 `2` 相等；字符串 `"2"` 不等于数字 `2`。
- 顶层 `source` 必须逐值等于 `android_markor_transform_rule`。
- 另有一条 `unexpect` 规则禁止 `row_count == 3`；在已要求等于 2 的前提下，这是一条显式反例保护。
- 这里不是“整个 JSON 对象绝对相等”：额外顶层字段不会因这两条规则本身而失败。
- 此通用 `check_json` 路径使用普通 `json.load`，并没有启用 Core 007 那种重复 JSON key 的专门拒绝逻辑。

### 4.3 不评测的内容

- XLSX 的 sheet 名、视觉格式、公式和创建工具不计分。
- `status.json` 不要求固定缩进、字段顺序或只含两个字段。
- evaluator 分别读取两台 Linux 的最终文件；不会因为一端正确而自动推断另一端正确。
