# Core 001 — `a2l2_meeting_packet_full`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 1 项
- 任务文件：`tasks/cross_device/real100/a2l2_meeting_packet_full.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 36 步，最长 360 秒

## 1. Instruction

### 英文原文（逐字）

```text
Help me connect the meeting materials across four devices: the first phone's Simple Calendar Pro has the meeting details, the second phone's Android Contacts app has the attendees, and `/tmp/meeting/template.docx` on the first Linux machine is the template. On the second Linux machine, use that template to create `/tmp/meeting/agenda.docx` and fill its `Title:`, `Time:`, `Location:`, and `Attendees:` fields. Format the time as `YYYY-MM-DD HH:MM-HH:MM` and separate attendee names with commas. Finally, use Simple SMS Messenger on the second phone to send each attendee a confirmation whose body includes `Release planning` and `confirmed`.
```

### 中文翻译

请帮我把四台设备上的会议材料衔接起来：第一部手机的 Simple Calendar Pro 中有会议详情，第二部手机的 Android Contacts 应用中有参会者，第一台 Linux 机器上的 `/tmp/meeting/template.docx` 是模板。请在第二台 Linux 机器上使用该模板创建 `/tmp/meeting/agenda.docx`，并填写其中的 `Title:`、`Time:`、`Location:` 和 `Attendees:` 字段。时间采用 `YYYY-MM-DD HH:MM-HH:MM` 格式，参会者姓名以逗号分隔。最后，在第二部手机上使用 Simple SMS Messenger 向每位参会者发送确认短信，正文中包含 `Release planning` 和 `confirmed`。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机：Calendar 事件

Setup 直接向 `android_0` 的 Simple Calendar Pro 写入以下事件：

```json
{
  "title": "Release planning",
  "start_ts": 1803038400,
  "end_ts": 1803042000,
  "location": "Room 9",
  "description": "Full meeting packet"
}
```

在任务使用的 UTC 日历时间口径下，时间为 `2027-02-19 12:00-13:00`。`source/calendar_event.json` 保存了同样的数据，但 setup 并不上传该 JSON，而是直接调用 Calendar fixture 写入。

### 2.2 第二部手机：Contacts 与短信目标

Setup 在 `android_1` 中写入两位联系人：

| 姓名 | 电话号码 |
|---|---|
| Priya Nair | `5550820` |
| Omar Patel | `5550821` |

`source/attendees.json` 是上述数据的文件镜像；它不被 setup 上传。任务开始前会清空联系人和短信数据库，因此没有预置收件短信或已发短信。

任务变量给出了一个标准确认正文：

```text
Release planning confirmed.
```

这只是可直接采用的正文；evaluator 并不要求整句逐字相等，详见第 4 节。

### 2.3 第一台 Linux：DOCX 模板附件

- 仓库源文件：`tasks/cross_device/real100_assets/a2l2_meeting_packet_full/source/template.docx`
- 注入路径：`linux_0:/tmp/meeting/template.docx`
- 文件类型：有效的 Word OOXML 包
- 页面：纵向 Letter，四周 1 英寸页边距
- 标题：`Meeting Packet Template`，Calibri、20 pt、粗体、蓝色 `#2E74B5`
- 主表：1 个带网格的 4 行 × 2 列表格

模板的全部可见文字和表格结构如下：

```text
Meeting Packet Template
Complete every field from the authoritative meeting and contact sources.

Title:      [[TITLE]]
Time:       [[TIME]]
Location:   [[LOCATION]]
Attendees:  [[ATTENDEES]]

Confirmation
After completing the packet, confirm the meeting with every attendee through the requested channel.
```

左侧标签单元格为粗体并带浅灰底色；OOXML 的表格网格为等宽两列。由于本机没有 LibreOffice，本次对附件采用 OOXML 包结构和系统文本提取核对，没有把未渲染的版式判断冒充为视觉渲染结果。

### 2.4 预期输出

- `linux_1:/tmp/meeting/agenda.docx`
- `android_1` 发件箱中发给 `5550820` 的确认短信
- `android_1` 发件箱中发给 `5550821` 的确认短信

## 3. Setup 具体流程

### `android_0`

1. `ensure_app`：确保 `simple calendar pro` 可用。
2. `androidworld_calendar_clear`：清空现有 Calendar 事件。
3. `androidworld_calendar_event_add`：写入第 2.1 节的 `Release planning` 事件。

### `android_1`

1. 确保 `contacts` 和 `simple sms messenger` 可用。
2. 清空 Contacts 和 SMS 数据。
3. 写入 Priya Nair（`5550820`）与 Omar Patel（`5550821`）。

### `linux_0`

1. 执行 `rm -rf /tmp/meeting && mkdir -p /tmp/meeting`。
2. 将模板附件上传为 `/tmp/meeting/template.docx`。

### `linux_1`

1. 执行 `rm -rf /tmp/meeting && mkdir -p /tmp/meeting`。
2. 不预置模板或结果文件；用户必须把第一台 Linux 上的模板内容用于第二台 Linux 的输出。

Cleanup 会清空两个 Android 数据面并删除两台 Linux 上的 `/tmp/meeting`。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个默认启用计分的 evaluator。总分为三项分数的算术平均，每项权重 `1/3`；任务级 `success` 只有在三项全部为 1 时才为真。

### 4.0 先说人话：怎样才算通过

如果你只是手工跑任务，看这一段即可。要完整通过，必须同时完成三件事：

1. 在第二台 Linux 上做出填写正确的 `agenda.docx`。
2. 在第二部手机上给 Priya（`5550820`）发一条确认短信。
3. 再给 Omar（`5550821`）发一条确认短信。

两条短信最稳妥的正文都是：

```text
Release planning confirmed.
```

短信评测不是比较全文是否一模一样，而是分别检查：

- 是否发到了正确号码；
- 是否在评测前 5 分钟内发出；
- 正文里是否出现 `Release planning` 和 `confirmed`；
- 整句话是否在明确肯定“会议已确认”，而不是提问、猜测或否定。

以下写法可以通过：

```text
Release planning confirmed.
Release planning is confirmed.
Hi Priya, Release planning has been confirmed.
```

以下写法不能通过：

```text
Is Release planning confirmed?          （这是问题）
Release planning may be confirmed.      （不确定）
Release planning is not confirmed.      （是否定）
Release planning confirmed, but it was cancelled.  （同一条短信最后又取消）
```

只给一个人发送时，只能通过其中一个短信检查，整个任务仍然不通过。发件箱可以有其他短信，也不要求这两条短信全文完全相同。

### 4.1 `agenda.docx`（权重 `1/3`）

- `device_id`：`linux_1`
- `func`：`check_docx_text`
- getter：`vm_file`，读取 `/tmp/meeting/agenda.docx`
- 匹配性质：不是文件字节绝对相等，也不要求沿用某个编辑历史；它解析 DOCX ZIP 包、OOXML 可见文本、表格和格式结构。

必须同时满足：

1. 包结构有效：包含 `[Content_Types].xml`、`_rels/.rels`、`word/document.xml`、`word/styles.xml`，主文档 content type 与关系正确，ZIP 成员名无冲突。
2. 可见文本以不区分大小写方式包含：
   - `Meeting Packet Template`
   - `Release planning`
   - `2027-02-19 12:00-13:00`
   - `Room 9`
   - `Priya Nair`
   - `Omar Patel`
3. 可见文本不得包含 `[[TITLE]]`、`[[TIME]]`、`[[LOCATION]]`、`[[ATTENDEES]]`。
4. 正文区域必须恰好保留以下 4 个非表格段落，顺序和文字不变：模板标题、说明句、`Confirmation`、末尾确认说明句。
5. 必须恰好有 1 个可见表格；标题必须只有一个、至少 15 pt 并带强调；页面必须为纵向。
6. 表格必须存在可解析的可见网格，两列宽度比例各约 50%，允许每列比例误差 `0.15`。
7. 表格必须恰好为以下 4 行 × 2 列：

| 左单元格 | 右单元格要求 |
|---|---|
| `Title:` | `Release planning` |
| `Time:` | `2027-02-19 12:00-13:00`，这是空白折叠后、忽略大小写的整格相等，不只是包含 |
| `Location:` | `Room 9` |
| `Attendees:` | 逗号分隔的精确集合 `{Priya Nair, Omar Patel}`；顺序可交换，但不能漏人、加人或重复 |

隐藏样式、删除/插入的修订容器和隐藏祖先中的文字不计为可见内容。

### 4.2 发给 Priya Nair 的短信（权重 `1/3`）

- getter：`androidworld_sms_message`
- 位置：`android_1` 的 `sent` 发件箱
- 地址：`5550820`（比较时会忽略号码中的空格和连字符）
- 时间窗口：评测时最近 5 分钟
- 正文要求：`Release planning` 与 `confirmed`
- `func`：`exact_match`，但这里绝对匹配的是 getter 最终返回的状态字符串 `present`，不是短信全文。

getter 会先按发件箱、地址和时间窗口筛选，再做不区分大小写、带词边界的正文语义判断。两个必需短语必须构成最终的肯定确认；问句、不确定表达，或后续出现 `cancelled`、`retracted`、`ignore`、`not confirmed` 等撤销/否定语义时返回 `missing`。不要求发件箱中对该地址只有一条短信，只要至少有一条合格短信即可。

### 4.3 发给 Omar Patel 的短信（权重 `1/3`）

逻辑与 4.2 完全相同，唯一变化是地址为 `5550821`。

### 4.4 不评测的内容

- 不检查两条短信是否逐字等于变量中的 `Release planning confirmed.`。
- 不检查短信的标点、称呼或额外礼貌用语。
- 不检查 DOCX 的文件哈希或是否通过复制原模板生成；只检查上述可见内容、包结构与版式合同。
