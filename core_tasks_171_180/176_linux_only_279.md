# Core 176 — `linux_only_279`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 176 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_279.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的 CSV 中有三份 west 区域的 missing evidence，但只有两份同时标为 required。第二台 Linux 的 JSON 给出 west lead 邮箱。因此要在第二台机器创建一封 `.eml` 草稿，只请求：

- `EV-17 photo`
- `EV-22 signed form`

不要请求非必需的 `EV-30 map`。最稳妥的完整邮件是：

```text
To: field-review@example.test
Subject: Missing evidence

Please provide the following missing required evidence: EV-17 photo; EV-22 signed form.
```

## 1. Instruction

### 英文原文（逐字）

```text
Create `/tmp/site/missing_evidence.eml` on the second Linux machine as an unsent email draft to the west lead, with a clear subject. Use `missing_evidence.csv` on the first machine and the team contact JSON on the second; request only evidence that is both required and missing.
```

### 中文翻译

在第二台 Linux 机器上创建 `/tmp/site/missing_evidence.eml`，作为一封发给 west lead、尚未发送的邮件草稿，并使用清楚的主题。结合第一台机器上的 `missing_evidence.csv` 和第二台机器上的团队联系人 JSON，只请求同时满足“必需”和“缺失”的证据。

## 2. 输入、附件与初始业务数据

### 2.1 `linux_0`：`missing_evidence.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_279/source/linux_0/tmp/site/missing_evidence.csv`
- 注入路径：`/tmp/site/missing_evidence.csv`
- 完整原文：

```csv
evidence,region,required,status,due
EV-17 photo,west,yes,missing,2026-07-01
EV-22 signed form,west,yes,missing,2026-07-01
EV-30 map,west,no,missing,2026-07-01
```

筛选条件是 `required=yes` 且 `status=missing`，所以 EV-17、EV-22 入选，EV-30 因 `required=no` 排除。三行 due 都是 2026-07-01，但 evaluator 不要求在邮件中写日期。

### 2.2 `linux_1`：`team.json`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_279/source/linux_1/tmp/site/team.json`
- 注入路径：`/tmp/site/team.json`
- 完整原文：

```json
{"west_lead":"field-review@example.test"}
```

### 2.3 输出文件

目标是第二台机器的：

```text
/tmp/site/missing_evidence.eml
```

Setup 会先删除旧文件。任务没有预置 Thunderbird 邮箱、已有邮件或业务短信；输出是一个独立 RFC 风格 EML 文件。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/site`；
2. 删除旧 `missing_evidence.csv`；
3. 上传 CSV。

### `linux_1`

1. 创建 `/tmp/site`；
2. 删除并重新上传 `team.json`；
3. 删除旧 `missing_evidence.eml`。

Setup 没有启动或配置邮件客户端；可以用文本编辑器或命令行生成 EML，只要最终文件能被 Python 标准库 email parser 解析。

## 4. 正确输出

Oracle 直接写入的 EML 原文是：

```eml
To: field-review@example.test
Subject: Missing evidence

Please provide the following missing required evidence: EV-17 photo; EV-22 signed form.
```

不要求必须逐字采用这段正文，但请使用明确肯定的请求句，不要写成问句或不确定语气。

## 5. Evaluator：评测方式与具体评测点

本任务只有 1 个计分 evaluator。它在 `linux_1` 上运行 Python，解析 `/tmp/site/missing_evidence.eml`；所有条件成立时打印 `present`，外层再精确要求 `present`。

### 5.1 收件人集合必须精确

Evaluator 合并解析 `To`、`Cc`、`Bcc` 的全部地址，忽略显示名并转小写，然后要求地址集合精确等于：

```text
field-review@example.test
```

因此：

- 可以写 `To: West Lead <field-review@example.test>`；
- 不能再加任何其他地址；
- 地址放在 Cc 而不是 To，从纯代码上也可能通过，因为三类头被合并成一个集合；instruction 仍明确要求发给 west lead，最自然是写 To；
- 重复同一地址会因集合去重而不增加额外收件人。

### 5.2 Subject 实际只检查“非空”

Subject 会 `.strip()`，必须非空，且解析后的字符串不能含换行或回车。Evaluator 没有检查主题是否包含 `missing`、`evidence` 或任何业务关键词，所以“clear subject”在实现上只是非空；为符合 instruction，建议使用 `Missing evidence`。

### 5.3 正文中的证据 ID 是集合精确匹配

正文先转小写并把连续空白折叠成一个空格，然后用正则提取所有 `EV-数字`。提取结果集合必须恰好是：

```text
ev-17
ev-22
```

所以：

- 少任何一个失败；
- 出现 `EV-30` 或其他 EV ID 失败；
- 同一个 EV ID 重复两次不会因 ID 集合本身失败，但没有必要这样写。

### 5.4 ID 和证据名称必须相互靠近

正文还必须满足两条近邻正则，顺序可前可后：

- `EV-17` 与 `photo` 之间最多 64 个字符；
- `EV-22` 与 `signed form` 之间最多 64 个字符。

换行在前一步已经被折叠为空格，所以分行不会天然破坏关系。只写 ID、不写名称会失败。

### 5.5 必须是肯定请求，不得问询或含冲突语气

正文至少包含下面任一请求动词：

```text
request
provide
send
supply
attach
share
```

前面可以带 `please`。以下任一冲突表达会失败：

```text
do not / don't
no need
already present / already provided / already supplied
cancelled / canceled / withdrawn / retracted
pending
maybe / perhaps / uncertain
```

只要正文任何位置有 `?` 就失败；正文开头是 `could`、`would`、`can`、`should`、`may` 也失败。因此 `Could you send EV-17 photo and EV-22 signed form?` 看起来礼貌，但 evaluator 会判失败。使用 `Please provide ...` 最稳。

### 5.6 MIME 正文如何读取

- 非 multipart 邮件直接读取该消息体；
- multipart 邮件只拼接 `text/plain` 且 disposition 不是 attachment 的部分；
- 纯 HTML 的 multipart 邮件没有可评分的 plain-text body，会失败；
- 附件文本不会作为正文计分。

### 5.7 “未发送草稿”的实际评测边界

Evaluator 只读取目标 `.eml` 文件，没有连接 Thunderbird，也没有检查 Drafts/Sent 文件夹、`Message-ID`、`Date`、`From` 或发送状态头。因此“unsent draft”由“生成这个本地 EML、不要实际发送”这一操作语义体现，不是邮箱状态数据库检查。

它也不会在评测时重新读取 CSV 和 JSON；EV-17、EV-22 和邮箱地址已经硬编码在脚本中。

## 6. 常见失败示例

- `Can you provide EV-17 photo and EV-22 signed form?`：正文以 `can` 开头且有问号，失败。
- `Please provide EV-17 and EV-22.`：缺少 `photo`、`signed form` 的近邻关系，失败。
- `Please provide EV-17 photo, EV-22 signed form, and EV-30 map.`：提取到额外 EV-30，失败。
- 收件人正确但 Subject 为空：失败。
- 邮件正文正确但保存为 `/tmp/site/missing_evidence.txt`：目标路径不存在，失败。

## 7. Cleanup

- `linux_0` 删除 CSV；
- `linux_1` 删除 `team.json` 和输出 EML。

