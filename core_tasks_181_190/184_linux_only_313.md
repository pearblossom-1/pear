# Core 184 — `linux_only_313`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 184 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_313.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 40 步、300 秒

## 0. 任务链与直白结论

第二台 Linux 的本地 HTML 列出三场会议，其中只有 `MID-42` 的 Publish 是 `yes`。需要在 Chrome 打开并停留在该行的锚点 URL，同时把第一台 Linux 的 Writer/DOCX 模板填写成 `MID-42` 的会议纪要。

最终状态包括两部分：

1. `linux_0` 上存在 `/home/user/documents/meeting_minutes_MID-42.docx`，保留标题 `Meeting Brief` 和一张 8×2 网格表，所有占位符换成 MID-42 数据；
2. `linux_1` 的 Chrome 只保留目标非默认页面 `file:///home/user/meetings/index.html#MID-42`。

## 1. Instruction

### 英文原文（逐字）

```text
Complete `meeting_minutes_MID-42.docx` on the first Linux machine from the published meeting at `/home/user/meetings/index.html` on the second. Leave the selected anchored page open in Chrome, preserve the Writer template's title and single table, and replace all fields with the meeting details and agenda.
```

### 中文翻译

请根据第二台 Linux 机器上 `/home/user/meetings/index.html` 中已发布的会议，在第一台 Linux 机器完成 `meeting_minutes_MID-42.docx`。在 Chrome 中保持选中的锚点页面处于打开状态，保留 Writer 模板的标题和唯一一张表格，并把所有字段替换为该会议的详情和议程。

## 2. 输入、附件与完整内容

本题没有短信或邮件。输入是一个 DOCX 模板和一份本地 HTML 页面。

### 2.1 `linux_0`：`meeting_minutes_template.docx`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_313/source/meeting_minutes_template.docx`
- 注入路径：`/home/user/templates/meeting_minutes_template.docx`

模板结构经 DOCX OOXML 读取后为：

- 1 个 section；
- US Letter 纵向页面（8.5×11 英寸）；
- 上下边距 1 英寸，左右边距 1.25 英寸；
- 正文只有一个非空段落：`Meeting Brief`，样式为 `Heading 1`；
- 正好 1 张 `Table Grid` 表，8 行×2 列；
- 两列各约 3 英寸。

表格原始内容完整如下：

| Field | Value |
|---|---|
| Meeting ID | `{{Meeting ID}}` |
| Title | `{{Title}}` |
| Time | `{{Time}}` |
| Presenter | `{{Presenter}}` |
| Agenda 1 | `{{Agenda 1}}` |
| Agenda 2 | `{{Agenda 2}}` |
| Agenda 3 | `{{Agenda 3}}` |

### 2.2 `linux_1`：`index.html`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_313/source/index.html`
- 注入路径：`/home/user/meetings/index.html`
- 完整原文：

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Team Meetings</title></head>
<body><h1>Team Meetings</h1><p>Select the unique row whose Publish value is yes.</p>
<table><thead><tr><th>Meeting ID</th><th>Title</th><th>Time</th><th>Presenter</th><th>Publish</th></tr></thead><tbody>
<tr id="MID-42"><td><a href="#MID-42">MID-42</a></td><td>Vendor Onboarding</td><td>2026-07-05 09:30</td><td>Priya Patel</td><td>yes</td></tr>
<tr id="MID-41"><td><a href="#MID-41">MID-41</a></td><td>Q3 Planning</td><td>2026-07-02 14:00</td><td>Jamie Lee</td><td>no</td></tr>
<tr id="MID-40"><td><a href="#MID-40">MID-40</a></td><td>Dev Sync</td><td>2026-07-01 10:00</td><td>Alex Kim</td><td>no</td></tr>
</tbody></table>
<section><h2>MID-42 agenda</h2><ol><li>Confirm vendor access</li><li>Review billing setup</li><li>Assign launch owners</li></ol></section>
</body></html>
```

唯一 `Publish=yes` 的会议详情是：

| 字段 | 值 |
|---|---|
| Meeting ID | MID-42 |
| Title | Vendor Onboarding |
| Time | 2026-07-05 09:30 |
| Presenter | Priya Patel |
| Agenda 1 | Confirm vendor access |
| Agenda 2 | Review billing setup |
| Agenda 3 | Assign launch owners |

`MID-41` 和 `MID-40` 是明确干扰项，不能选。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/home/user/templates` 和 `/home/user/documents`；
2. 删除旧模板和旧输出 `meeting_minutes_MID-42.docx`；
3. 上传模板到 `/home/user/templates/meeting_minutes_template.docx`。

### `linux_1`

1. 创建 `/home/user/meetings`；
2. 删除并上传 `index.html`。

Setup 不会自动打开 Chrome，也不会打开 Writer。输出文件也不会预创建；需要从模板另存为指定的新路径。

## 4. 正确输出

### 4.1 DOCX 的目标表格

输出路径必须是：

```text
/home/user/documents/meeting_minutes_MID-42.docx
```

标题仍是：

```text
Meeting Brief
```

唯一一张表必须精确为：

| Field | Value |
|---|---|
| Meeting ID | MID-42 |
| Title | Vendor Onboarding |
| Time | 2026-07-05 09:30 |
| Presenter | Priya Patel |
| Agenda 1 | Confirm vendor access |
| Agenda 2 | Review billing setup |
| Agenda 3 | Assign launch owners |

### 4.2 Chrome 的最终 URL

在第二台机器点击 `MID-42` 链接或直接打开：

```text
file:///home/user/meetings/index.html#MID-42
```

锚点 `#MID-42` 是评分内容的一部分，不能只停在无锚点的 `index.html`。

## 5. Evaluator：评测方式与具体评测点

本题有 2 个计分 evaluator，默认各占 50%：DOCX 结构/内容一项，Chrome tabs 一项。

### 5.1 DOCX 必须是可读取的有效包

Evaluator 从 `linux_0` 下载固定输出文件，用 `zipfile` 和 XML 解析 `word/document.xml`。`require_valid_package=true` 要求它是一个基本有效的 DOCX 包，而不是把纯文本文件改成 `.docx` 后缀。

它还要求至少一张表；后续结构合同进一步把数量限定为正好一张。

### 5.2 可见全文的包含/排除检查是大小写敏感的

可见文本必须包含以下原样字符串：

```text
Meeting Brief
Meeting ID
MID-42
Title
Vendor Onboarding
Time
Presenter
Priya Patel
Agenda 1
Confirm vendor access
Agenda 2
Review billing setup
Agenda 3
Assign launch owners
```

同时不得包含：

```text
{{Meeting ID}}
MID-41
Q3 Planning
```

这些 include/exclude 默认区分大小写，所以 `vendor onboarding` 不能代替表格合同中的 `Vendor Onboarding`。

### 5.3 模板外形合同：一个标题段落、一张可见网格表

`template_structure` 实际要求：

- body 直属、非空、可见段落精确只有一个：`Meeting Brief`；
- 可见表格精确为 1 张；
- `Meeting Brief` 必须表现为被强调的标题：可由足够大的标题样式、粗体或大字号满足；原模板的 Heading 1 可以满足；
- 第 0 张表必须有可见网格边框；原模板 `Table Grid` 满足。

因此把标题删掉、改成普通小字号，或把表格边框完全隐藏，都可能失败。额外空段落会被忽略，但额外非空正文段落会让段落数量不再精确。

### 5.4 表格合同是行列精确匹配

第 0 张表必须：

- 正好 8 行；
- 每行正好 2 列；
- 除 Time 外，每个单元格在折叠连续空白后与期望文本精确相等；
- 行顺序不可改变。

不能加“Notes”行、第三列或第二张表，也不能把 Agenda 三项合并到一个单元格。

### 5.5 Time 单元格是语义日期/时间匹配

Time 单元格不是必须逐字写成 `2026-07-05 09:30`。Evaluator 会提取日期和时钟时间，并要求：

- 日期规范化后为 `2026-07-05`；
- 去掉日期表达后，恰好提取到一个 `09:30` 时刻。

所以常见的 `2026-07-05 09:30` 最稳；可识别的 `July 5, 2026 9:30 AM` 也可能通过。写成 `09:30–10:30` 会提取两个时间，不满足“恰好一个时刻”。

### 5.6 Chrome tabs 是“非默认标签页列表精确相等”

`open_tabs_info` 会读取所有 page 类型标签页，并因 `ignore_default_tabs=true` 过滤：

```text
about:blank
chrome://newtab
```

过滤后，实际 URL 列表长度必须和期望列表一样，且能匹配：

```text
file:///home/user/meetings/index.html#MID-42
```

因此：

- 目标页可以不是视觉上的第一个标签页；列表比较不要求顺序；
- 但只能有这一张非默认页面，多开普通网页、另一个本地会议页或无锚点页面都会因列表长度/内容不符而失败；
- 文件路径和 fragment 必须精确；
- 页面是否滚动到目标行不是通过截图判断，而是靠 URL 中的 `#MID-42`。

## 6. 当前 evaluator 没检查什么

- 不比较输出 DOCX 与模板的字节或编辑历史，只检查最终可见结构、部分格式和内容；
- 不要求原模板文件保持不变；instruction 的正确操作仍应另存输出而不是覆盖模板；
- 不检查 DOCX 作者、创建时间、页眉页脚或具体字体；
- 不检查 Chrome 页面正文是否被修改，页面来源由固定本地文件和 URL 状态间接确定；
- 不要求使用 LibreOffice Writer 的特定菜单，只看最终文件。

## 7. 常见失败示例

- 保存到模板目录而不是 `/home/user/documents/meeting_minutes_MID-42.docx`：固定输出路径找不到。
- 正确填写内容，但删掉标题或新增说明段落：模板结构失败。
- 把三条 agenda 放成项目符号列表而不是表格三行：表格合同失败。
- Chrome 只打开 `file:///home/user/meetings/index.html`：缺 `#MID-42`，tabs 项失败。
- Chrome 同时开着目标页和一个普通网页：非默认标签页数量多于 1，失败。
- 选择 MID-41：DOCX 出现 `MID-41` 或 `Q3 Planning`，明确失败。

## 8. Cleanup

- `linux_0` 删除模板与输出 DOCX；
- `linux_1` 删除本地 `index.html`。

