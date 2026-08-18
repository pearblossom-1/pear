# Core 005 — `a2l_agenda_from_two_phones`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 5 项
- 任务文件：`tasks/cross_device/real100/a2l_agenda_from_two_phones.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 30 步，最长 300 秒

## 1. Instruction

### 英文原文（逐字）

```text
I need a timed agenda for the `Partner planning` meeting. The first phone's Simple Calendar Pro has the meeting details, and the second phone's Markor note `Partner planning topics` has the ordered topics and timeboxes. On Linux, use `/tmp/meeting/template.docx` to create `/tmp/meeting/agenda.docx`, fill the meeting fields, and complete the topic table in the note's order. Include the total number of agenda minutes and keep it consistent with the meeting duration.
```

### 中文翻译

我需要一份用于 `Partner planning` 会议的计时议程。第一部手机的 Simple Calendar Pro 中有会议详情，第二部手机的 Markor 笔记 `Partner planning topics` 中有按顺序排列的议题及其时间框。在 Linux 上，请使用 `/tmp/meeting/template.docx` 创建 `/tmp/meeting/agenda.docx`，填写会议字段，并按照笔记中的顺序完成议题表。请包含议程总分钟数，并使其与会议时长保持一致。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机：Calendar 事件

```json
{
  "title": "Partner planning",
  "start_ts": 1802952000,
  "end_ts": 1802955600,
  "location": "Room 5",
  "description": "Planning agenda"
}
```

任务使用的 UTC 时间口径为 `2027-02-18 12:00-13:00`，总时长 60 分钟。`source/calendar_event.json` 是同一数据的镜像，setup 直接写 Calendar 而不上传该文件。

### 2.2 第二部手机：Markor 议题附件

- 仓库源文件：`tasks/cross_device/real100_assets/a2l_agenda_from_two_phones/source/topics.md`
- 注入路径：`/storage/emulated/0/Documents/Markor/Partner planning topics.md`
- 完整内容：

```markdown
# Partner planning topics

Use these topics in order:

1. Introductions — 10 minutes
2. Delivery risks — 20 minutes
3. Next steps — 30 minutes
```

三项合计 `10 + 20 + 30 = 60` 分钟，与 Calendar 事件时长一致。

### 2.3 Linux：DOCX 模板附件

- 仓库源文件：`tasks/cross_device/real100_assets/a2l_agenda_from_two_phones/source/template.docx`
- 注入路径：`/tmp/meeting/template.docx`
- 页面：纵向 Letter，四周 1 英寸页边距
- 标题：`Timed Agenda Template`，Calibri、20 pt、粗体、蓝色 `#2E74B5`
- 可见结构：3 个正文段落，2 个带网格表格

全部可见文字与表格占位结构：

```text
Timed Agenda Template
Build the agenda from the Calendar event and the ordered topic note.

Title:     [[TITLE]]
Time:      [[TIME]]
Location:  [[LOCATION]]

Agenda

Topic            Minutes
[[TOPIC_1]]      [[MINUTES_1]]
[[TOPIC_2]]      [[MINUTES_2]]
[[TOPIC_3]]      [[MINUTES_3]]
[[TOTAL]]        （最后一行在 OOXML 中为跨两列的单元格）
```

第一张表为 3 行 × 2 列。第二张表有表头、3 个议题行和 1 个跨两列的总计行。源文件还包含 `source/attendees.json`（Iris Stone、Marek Vale），但该文件既未被 setup 使用，也不属于当前 instruction/evaluator；不能把它误当成本任务输入。

由于本机没有 LibreOffice，模板采用 OOXML 结构和系统文本提取核对，没有声称做过视觉渲染。

### 2.4 预期输出

- `linux_0:/tmp/meeting/agenda.docx`

本任务没有短信或邮件输出。

## 3. Setup 具体流程

### `android_0`

1. 确保 Simple Calendar Pro 可用。
2. 清空 Calendar。
3. 写入第 2.1 节的 `Partner planning` 事件。

### `android_1`

1. 确保 Markor 可用。
2. 创建 Markor 目录并删除同名旧笔记。
3. 上传 `topics.md`，目标文件名改为 `Partner planning topics.md`。

### `linux_0`

1. 执行 `rm -rf /tmp/meeting && mkdir -p /tmp/meeting`。
2. 上传 `template.docx`。
3. 不预置 `agenda.docx`。

Cleanup 清空 Calendar、删除 Markor 议题笔记并删除 `/tmp/meeting`。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

最终的 `agenda.docx` 必须还是那份模板的样子，但所有空位都填好：

- 会议：`Partner planning`
- 时间：`2027-02-18 12:00-13:00`
- 地点：`Room 5`
- 议题顺序不能变：
  1. `Introductions` — `10`
  2. `Delivery risks` — `20`
  3. `Next steps` — `30`
- 最后一行要明确写总计 `60 minutes`。

最常见的失败是：只把文字随便写进文档、没有放在正确表格单元格；改变议题顺序；漏掉总计；只写裸数字 `60`；留下模板占位符；或者把模板的两张表删掉重做成普通段落。

- `func`：`check_docx_text`
- getter：`vm_file`，读取 `/tmp/meeting/agenda.docx`
- 匹配性质：解析 DOCX 包、可见文本、正文段落、表格和部分格式；不是字节级模板相等。

### 4.1 DOCX 包与整体模板结构

必须同时满足：

1. 有效 OOXML 包，包含正确主文档关系以及 `word/styles.xml`。
2. 至少有 2 个表格和 6 个 OOXML 段落节点。
3. 可见文本不区分大小写地包含 `Timed Agenda Template`、`Partner planning`、`Room 5`、`Introductions`、`Delivery risks`、`Next steps`。
4. 可见文本不得包含 `[[TITLE]]`、`[[TOPIC_1]]`、`[[TOTAL]]`；其他占位符虽然未在顶层 exclude 中逐一列出，但会因后续整格合同不匹配而失败。
5. 正文区域必须恰好保留以下 3 个非表格段落，顺序不变：
   - `Timed Agenda Template`
   - `Build the agenda from the Calendar event and the ordered topic note.`
   - `Agenda`
6. 必须恰好有 2 个可见表格；页面纵向；标题至少 15 pt 且被强调。
7. 两张表都必须有可解析的可见网格，OOXML 列网格比例约为 50%/50%，每列容差 `0.15`。

### 4.2 第一张会议信息表

必须恰好为以下 3 行 × 2 列：

| 左单元格 | 右单元格要求 |
|---|---|
| `Title:` | 整格等于 `Partner planning` |
| `Time:` | 同一单元格中解析出日期 `2027-02-18`，并且恰好解析出时间范围 `12:00`、`13:00` |
| `Location:` | 整格等于 `Room 5` |

时间单元格不是固定字符串绝对匹配：日期解析器接受等价的自然日期写法，时钟解析器接受等价 12/24 小时写法；但日期必须正确，且去除日期表达后不能多出第三个时钟时间。

### 4.3 第二张议题表

必须恰好为以下 5 行，且顺序敏感：

| 行 | 单元格要求 |
|---|---|
| 1 | `Topic`；`Minutes` |
| 2 | `Introductions`；`10` |
| 3 | `Delivery risks`；`20` |
| 4 | `Next steps`；`30` |
| 5 | 恰好 1 个可见单元格，表示总计 60 分钟 |

总计单元格接受例如 `60 minutes`、`60 mins`、`60 minutes total`、`Total: 60 minutes`；只写裸数字 `60` 不满足 duration 语义模式。

所有普通精确单元格都会折叠空白并忽略大小写。隐藏样式、隐藏祖先及修订插入/删除容器中的内容不计为可见结果。

### 4.4 不评测的内容

- 不要求使用某个特定 Word/LibreOffice 编辑步骤。
- 不检查 `source/attendees.json` 中的姓名。
- 不需要发送通知消息。
