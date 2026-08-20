# Core 186 — `linux_only_283`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 186 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_283.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：easy
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的测试输出只有一个失败：`parser.py::test_parse_dates`；`parser.py::test_basic_ok` 已通过。第二台 Linux 的联系人 CSV 指定 parser.py 的维护者是 `maintainer@example.test`。

要在第二台机器创建一封本地 `.eml` 草稿，收件人只有该维护者，主题非空，正文只总结失败测试。最稳妥的正文是一句：

```text
parser.py::test_parse_dates failed.
```

不要提已通过的 `test_basic_ok`，也不要使用问句或 `passed` 一词。

## 1. Instruction

### 英文原文（逐字）

```text
The parser maintainer needs a triage-ready summary before the next test rerun. Use `/tmp/code/test_output.txt` on the first Linux machine and `/tmp/code/maintainer.csv` on the second to create an unsent RFC 5322 email draft at `/tmp/code/test_failure_summary.eml` on the second machine. Address the responsible maintainer and summarize only the failed tests, including the module and test name; do not send it.
```

### 中文翻译

在下一次重新运行测试之前，parser 维护者需要一份可直接用于分诊的摘要。请使用第一台 Linux 机器上的 `/tmp/code/test_output.txt` 和第二台机器上的 `/tmp/code/maintainer.csv`，在第二台机器的 `/tmp/code/test_failure_summary.eml` 创建一封尚未发送、符合 RFC 5322 的邮件草稿。邮件应发给负责的维护者，并且只总结失败的测试，包含模块名和测试名；不要发送邮件。

## 2. 输入、附件与完整内容

### 2.1 `linux_0`：`test_output.txt`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_283/source/linux_0/tmp/code/test_output.txt`
- 注入路径：`/tmp/code/test_output.txt`
- 完整原文：

```text
FAILED parser.py::test_parse_dates
PASSED parser.py::test_basic_ok
```

真正要汇报的失败集合只有：

```text
parser.py::test_parse_dates
```

### 2.2 `linux_1`：`maintainer.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_283/source/linux_1/tmp/code/maintainer.csv`
- 注入路径：`/tmp/code/maintainer.csv`
- 完整原文：

```csv
module,email
parser.py,maintainer@example.test
```

### 2.3 目标输出

```text
/tmp/code/test_failure_summary.eml
```

它是一个独立 EML 文件，不是 Thunderbird profile 中的 Drafts 消息。Setup 不会配置邮箱客户端，也没有现有邮件线程。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/code`；
2. 删除并上传 `test_output.txt`。

### `linux_1`

1. 创建 `/tmp/code`；
2. 删除并上传 `maintainer.csv`；
3. 删除旧 `test_failure_summary.eml`。

## 4. 正确输出

一种简单、有效、符合 instruction 的完整 EML 是：

```eml
To: maintainer@example.test
Subject: Parser test failure summary

parser.py::test_parse_dates failed.
```

不要求 `From`、`Date`、`Message-ID` 或 MIME multipart。必须有邮件头与正文之间的空行，确保 Python email parser 能把正文解析出来。

## 5. Evaluator：评测方式与具体评测点

本题只有 1 个计分 evaluator。它用 Python 标准库 `BytesParser(policy=policy.default)` 解析固定 EML 路径，全部条件成立才输出 `present`。

### 5.1 收件人只读取 `To`，而且列表精确匹配

Evaluator 只调用：

```python
message.get_all("to", [])
```

解析出的地址列表转小写后必须精确等于：

```python
["maintainer@example.test"]
```

所以：

- `To: Parser Maintainer <maintainer@example.test>` 可以通过；
- 多一个 To 地址失败；
- 同一地址重复两次也会因列表长度变成 2 而失败；
- 当前代码完全不读取 Cc/Bcc，因此额外 Cc/Bcc 在实现上可能不影响评分，但不符合“Address the responsible maintainer”的干净草稿要求，不应添加。

### 5.2 Subject 的实际要求只是非空

Subject 会转成字符串并 `.strip()`，只检查结果是否为真。Evaluator 并没有检查 `failure`、`parser`、`triage` 等关键词。

也就是说，任务元数据所说的“failure-oriented subject”没有被代码实现；从实际评分看，任何非空主题都能满足这一项。仍建议写清楚的 `Parser test failure summary`。

### 5.3 正文如何提取

- 非 multipart 邮件：直接使用 `message.get_content()`；
- multipart 邮件：拼接所有 `Content-Type: text/plain` 且 disposition 不是 attachment 的部分；
- 纯 HTML multipart、没有 plain-text body 时会缺失所需关系；
- 文本附件不会被当作正文。

### 5.4 测试名集合必须恰好只有 `test_parse_dates`

正文转小写后，用下面形状的正则提取测试名：

```regex
\btest_[a-z0-9_]+\b
```

提取结果转成集合后必须精确等于：

```text
test_parse_dates
```

因此：

- 漏写 `test_parse_dates` 失败；
- 写入 `test_basic_ok` 或任何其他 `test_*` 名称失败；
- `test_parse_dates` 重复出现不会因集合检查本身失败，但可能产生多条关系 clause，仍不建议重复。

### 5.5 模块、测试名和失败极性必须在同一个 clause 中

正文按以下边界切成 clause：

- 换行或回车；
- 句号、感叹号或问号后面跟空白的位置。

Evaluator 找同时包含以下三类内容的 clause：

1. 字面字符串 `parser.py`；
2. 完整测试名 `test_parse_dates`；
3. 失败词 `fail`、`failed`、`failing`、`failure` 或 `error`。

这种 clause 必须恰好有 1 个。

可通过：

```text
parser.py::test_parse_dates failed.
```

会失败：

```text
Module: parser.py
Failed test: test_parse_dates
```

因为模块与测试名被换行分到两个 clause，没有一条同时包含两者。

### 5.6 全局冲突词和问号

正文任何位置出现以下表达就失败：

```text
passed / passing / successful
not failing / did not fail / no failure
maybe / perhaps / pending / uncertain
withdrawn / retracted
```

正文中任何 `?` 也会失败。因此不要写 `Could you check why test_parse_dates failed?`。

### 5.7 当前实现与任务元数据存在一处明确不一致

任务 metadata 声称 `test_basic_ok` 在明确标注 passed 时可以出现；实际 evaluator 同时：

- 要求测试名集合只能是 `test_parse_dates`；
- 全局禁止 `passed`。

所以当前实现下，`test_basic_ok passed` 必然失败。本文以实际执行代码为准：正文只写失败测试，不要提通过项。这也正好符合 instruction 的 “summarize only the failed tests”。

### 5.8 “未发送草稿”的评测边界

Evaluator 只读取本地 EML 文件，不检查 Thunderbird Drafts/Sent、SMTP、发送状态、网络请求或邮件账户。因此“do not send”需要执行者遵守；自动评分只能确认草稿文件存在且内容正确。

## 6. 当前 evaluator 没检查什么

- 不要求 Subject 含失败关键词，只要求非空；
- 不检查 `From`、`Date`、`Message-ID`、签名或优先级头；
- 不检查 Cc/Bcc；
- 不重新读取测试输出和联系人 CSV，目标值已写死；
- 不验证邮件是否出现在某个邮件客户端中；
- 不要求逐字等于示例，只要唯一 clause 关系和冲突规则满足。

## 7. 常见失败示例

- `parser.py failed. test_parse_dates failed.`：没有一条 clause 同时包含模块、测试名和失败词。
- `parser.py::test_parse_dates failed. parser.py::test_parse_dates error.`：形成两条关系 clause，失败。
- `parser.py::test_parse_dates failed; test_basic_ok passed.`：出现额外测试名和 `passed`，失败。
- `Is parser.py::test_parse_dates failing?`：有问号，失败。
- 主题为空：即使正文正确也失败。
- 保存为 `.txt` 或放在第一台机器：固定路径读取不到。

## 8. Cleanup

- `linux_0` 删除 `test_output.txt`；
- `linux_1` 删除 `maintainer.csv` 和输出 EML。

