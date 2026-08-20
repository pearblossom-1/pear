# Core 181 — `linux_only_218`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 181 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_218.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 记录了两个人实际参加的必修场次：Alma Reid 参加 `S-31`，Dev Ban 参加 `S-28`。第二台 Linux 的证书清单里只有 Dev Ban 的旧场次 `S-20` 证书。因此要在第二台机器交付两个文件：

1. `certificate_gaps.xlsx`：只列两条异常——Alma 缺证书，Dev 的现有证书场次不对；
2. `email_notes.md`：分别说明 Alma 为什么需要 `S-31` 证书，以及 Dev 的 `S-20` 证书为什么不能覆盖所需的 `S-28`。

最容易误解的点是：Dev 不是“没有任何证书”，而是“只有 S-20 证书，但需要 S-28，所以现有证书无效”。

## 1. Instruction

### 英文原文（逐字）

```text
The training coordinator needs a clean exception handoff before issuing completion certificates. Reconcile `/tmp/training/attendance.csv` on the first Linux machine with `/tmp/training/certificates.csv` on the second. On the second machine, create `/tmp/training/certificate_gaps.xlsx` with one row per attendance exception, keeping each attendee, required session, and a plain-language certificate disposition together. Also create `/tmp/training/email_notes.md` with one concise section or table record per attendee that repeats the required session and explains why a certificate is needed or why the available certificate is not valid for it.
```

### 中文翻译

培训协调员在签发结业证书之前，需要一份清楚的异常交接。请核对第一台 Linux 机器上的 `/tmp/training/attendance.csv` 与第二台机器上的 `/tmp/training/certificates.csv`。在第二台机器上创建 `/tmp/training/certificate_gaps.xlsx`，每条出勤异常占一行，并把参训人、所需场次和用通俗语言写出的证书处置结论放在一起。同时创建 `/tmp/training/email_notes.md`，为每位参训人写一个简短小节或一条表格记录，重复写明所需场次，并解释为什么需要证书，或者为什么现有证书对该场次无效。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或图片附件。输入是两份 CSV；输出是一个 XLSX 和一份 Markdown。

### 2.1 `linux_0`：`attendance.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_218/source/linux_0/tmp/training/attendance.csv`
- 注入路径：`/tmp/training/attendance.csv`
- 完整原文：

```csv
person,session,attended_at
Alma Reid,S-31,2026-06-20
Dev Ban,S-28,2026-06-18
```

业务含义：

- Alma Reid 已于 2026-06-20 参加 `S-31`，所以她需要能证明 `S-31` 的证书；
- Dev Ban 已于 2026-06-18 参加 `S-28`，所以他需要能证明 `S-28` 的证书；
- `attended_at` 日期不进入最终 evaluator 的必检内容，但它解释了为什么这两行都属于应处理的出勤记录。

### 2.2 `linux_1`：`certificates.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_218/source/linux_1/tmp/training/certificates.csv`
- 注入路径：`/tmp/training/certificates.csv`
- 完整原文：

```csv
person,session,certificate_id
Dev Ban,S-20,CERT-OLD
```

对照结果：

| 人员 | 所需场次 | 现有证书 | 正确结论 |
|---|---|---|---|
| Alma Reid | S-31 | 没有任何对应记录 | 需要证书 |
| Dev Ban | S-28 | `CERT-OLD`，但只对应 S-20 | 现有证书场次不匹配，对 S-28 无效 |

### 2.3 目标输出

两个目标都位于 `linux_1`：

```text
/tmp/training/certificate_gaps.xlsx
/tmp/training/email_notes.md
```

Setup 会先删除这两个旧输出，不会提供半成品工作簿或笔记模板。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/training`；
2. 删除旧 `/tmp/training/attendance.csv`；
3. 上传本题固定的 `attendance.csv`。

### `linux_1`

1. 创建 `/tmp/training`；
2. 删除旧 `/tmp/training/certificates.csv`；
3. 上传本题固定的 `certificates.csv`；
4. 删除旧 `certificate_gaps.xlsx`；
5. 删除旧 `email_notes.md`。

Setup 不会启动 LibreOffice，也不会替你跨机器复制 CSV；任务执行者需要自行读取两台机器上的输入并在第二台交付结果。

## 4. 正确输出应该是什么

### 4.1 推荐的 `certificate_gaps.xlsx`

最简单的工作表可以只有下面三列和两条数据：

| attendee | required session | certificate disposition |
|---|---|---|
| Alma Reid | S-31 | certificate needed |
| Dev Ban | S-28 | invalid certificate; the available certificate covers S-20, not the required session |

工作簿中不要求写 `attended_at` 或 `certificate_id`；可以增加无关列，但不建议增加额外数据行或额外工作表，因为 evaluator 会把表头之后的非空行都当成候选记录。

### 4.2 推荐的 `email_notes.md`

一种可通过且易读的写法是：

```markdown
## Alma Reid

Required session S-31: certificate needed because no certificate is available for this attendance.

## Dev Ban

Required session S-28: the available S-20 certificate is an invalid certificate for the required session.
```

也可以使用一张表格，每个人一行。关键不是逐字照抄，而是每个人只出现一次，并在各自记录范围内把姓名、所需场次和肯定的处置原因写清楚。

## 5. Evaluator：评测方式与具体评测点

本题有 2 个计分 evaluator，默认等权平均：XLSX 占 50%，Markdown 占 50%。任一项失败都会使整体 `success=false`；若一项通过、一项失败，数值分数为 0.5。

### 5.1 XLSX evaluator：不是整张表逐字匹配，而是表头别名加记录集合匹配

Evaluator 把 `.xlsx` 当 ZIP 打开，读取所有名为 `xl/worksheets/sheet*.xml` 的工作表 XML，并处理 shared string、inline string 和普通单元格。它没有验证完整 Excel 包、样式、公式、列宽或工作表名称，所以任务语义要求的是“真实 XLSX”，但当前代码的核心只在意能从工作表 XML 中读出目标记录。

它逐行寻找一个可识别表头，三类字段分别允许：

| 规范字段 | 可用表头（忽略大小写和标点） |
|---|---|
| person | `person`、`name`、`attendee` |
| session | `session`、`session id`、`required session` |
| status | `status`、`disposition`、`certificate status`、`certificate disposition` |

同一表头行中，每类必须恰好匹配一列。比如同时放 `person` 和 `attendee` 会让 person 类出现两次，反而无法选定表头。

找到表头后，Evaluator 会把其后的所有非空行——包括后续工作表中的行——都当作数据。最终必须恰好有 2 条互不重复的记录，顺序不限：

```text
Alma Reid | S-31 | need
Dev Ban   | S-28 | invalid
```

姓名和场次会转小写，并把标点、连字符折叠成空格，所以 `S-31` 与 `s 31` 等价。

### 5.2 XLSX 中的处置结论如何判定

Alma 的状态必须只被归为 `need`。下面这些肯定表达会触发 need：

```text
certificate needed
needs a certificate
need certificate
required certificate missing
no certificate
```

Dev 的状态必须只被归为 `invalid`。下面这些表达会触发 invalid：

```text
invalid certificate
no valid certificate
wrong session certificate
certificate mismatch
does not cover the required session
```

以下细节很重要：

- `maybe`、`pending`、`uncertain`、`unknown`、`question` 会让状态无法归类；
- Alma 如果写成“valid certificate for S-31”或“does not need a certificate”，会被判冲突；
- Dev 如果肯定地写“valid certificate for S-28”，会被判冲突；`no valid certificate for S-28` 不属于该肯定冲突；
- 同一状态单元格同时命中 need 和 invalid 会返回空分类并失败。因此不要给 Alma 同时写“certificate needed and invalid certificate”，也不要给 Dev同时写“invalid certificate and needs a certificate”。

### 5.3 Markdown evaluator：按每个人在全文中的位置划定记录范围

Evaluator 读取 UTF-8 文本，转小写，并把 `_`、`-` 替换为空格。因此 `S-31` 会变为可匹配的 `s 31`。

它要求：

- `Alma Reid` 在全文恰好出现 1 次；
- `Dev Ban` 在全文恰好出现 1 次；
- 两个姓名出现的位置决定两段记录范围：从一个姓名开始，到下一个姓名开始为止；
- 姓名先后顺序不限；文本开头在第一个姓名之前的内容不属于任何人的记录。

这不是严格的“同一句 clause”匹配。只要 Alma 自己的记录范围内同时存在 `S-31` 和 need 表达，Dev 自己的范围内同时存在 `S-28`、`S-20` 和 invalid 表达，就能建立关系。

### 5.4 Alma 记录的硬性内容

Alma 的记录范围必须包含：

1. `S-31`；
2. 一条 need 肯定表达，例如 `certificate needed` 或 `needs a certificate`；
3. 不能出现“valid certificate for S-31”或“does not need a certificate”。

### 5.5 Dev 记录的硬性内容

Dev 的记录范围必须包含：

1. 所需场次 `S-28`；
2. 现有但错误的场次 `S-20`；
3. 一条 invalid 肯定表达，例如 `invalid certificate`、`wrong session certificate`、`certificate mismatch` 或 `does not cover the required session`；
4. 不能肯定声称存在“valid certificate for S-28”。

`S-20` 只在 Markdown evaluator 中是硬要求；XLSX evaluator 的 Dev 行不检查 `S-20`。

### 5.6 全文冲突、标题和额外人员规则

以下任一不确定或撤回词出现在全文任何位置都会失败：

```text
maybe / perhaps / possibly / pending / uncertain / unknown / unconfirmed
withdrawn / retracted / cancelled
```

任何 `?` 也会失败。因此不要写成“Does Alma need a certificate?”。

额外结构检查包括：

- `##` 到 `######` 的每个 Markdown 标题，规范化后必须恰好是 `alma reid` 或 `dev ban`；所以 `## Certificate Notes` 会失败；
- 表格行第一格如果看起来像两个纯英文字组成的人名，则它必须是 Alma 或 Dev；
- 这套额外人员检查并不完备：普通段落里写第三个人名未必被识别，但仍不符合“一人一条异常记录”的 instruction，不应这样做。

## 6. 当前 evaluator 没检查什么

- 不检查工作簿样式、列宽、工作表名称或日期列；
- 不要求 XLSX 逐字等于 Oracle，行顺序也不限；
- 不在评测时重新读取两份 CSV，人员、场次和目标结论已写死在 evaluator 中；
- Markdown 不要求固定标题形式或固定句子，只要求上述实体和极性关系；
- 不检查是否真的发送邮件，`email_notes.md` 只是供协调员使用的笔记。

## 7. 常见失败示例

- 只写 Alma，漏掉 Dev：两项输出都无法形成精确的两人异常集。
- Dev 写成 `S-20 certificate is valid`，却没有说明它不覆盖 `S-28`：缺 invalid 结论。
- Dev 笔记只写 `S-28 certificate mismatch`，不写 `S-20`：Markdown evaluator 失败。
- 在 XLSX 增加第三条“总计”数据行：表头后的非空记录数变成 3，失败。
- Markdown 使用 `## Certificate Notes` 总标题：它属于 H2，且不是允许的人名标题，失败。
- 写 `Maybe Alma needs a certificate`：全局出现 `maybe`，失败。

## 8. Cleanup

- `linux_0` 删除 `attendance.csv`；
- `linux_1` 删除 `certificates.csv`、`certificate_gaps.xlsx` 和 `email_notes.md`。

