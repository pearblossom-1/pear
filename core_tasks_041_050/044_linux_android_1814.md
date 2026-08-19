# Core 044 — `linux_android_1814`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 44 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1814.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 60 步，最长 480 秒

## 0. 任务链与设备分工

第一部手机的最新 SMS 提供 case、code、approver、action、timestamp、phone、status；第二部手机匹配联系人补上 role 与 company；Linux DOCX 模板决定字段、顺序、时间显示格式和版式。唯一 evaluator 同时检查内容与模板结构。

## 1. Instruction

### 英文原文（逐字）

```text
Complete every visible field in `/tmp/change/change_form.docx` on Linux using the latest approval SMS from the first phone and the matching approver contact from the second phone. Preserve the form's visible layout and use its displayed timestamp format.
```

### 中文翻译

使用第一部手机上的最新 approval SMS 和第二部手机中匹配的 approver 联系人，填写 Linux `/tmp/change/change_form.docx` 的每一个可见字段。保留表单的可见布局，并使用表单显示的时间戳格式。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机：两条 SMS 及时间顺序

两条消息都来自 `+15552001781`，按下列顺序注入，每条间隔 0.1 秒：

```text
Old request RC-284 from yesterday; action: ignore archived timestamp.
CASE-314 RC-284: requester Grace Kim; action prepare site readiness follow-up; timestamp 2026-06-27 18:40; phone +15552001781; status approved.
```

第二条是 latest approval SMS。第一条故意复用 `RC-284`，但缺少 current case，且明确是 old/archived timestamp 干扰。

### 2.2 第二部手机：Contacts

| Name | Number | Notes | 作用 |
|---|---|---|---|
| Grace Kim | `+15552001781` | `RC-284; CASE-314; role release reviewer; company Orchard Supply; packet ready` | 正确记录 |
| Grace Archive | `+15550009999` | `similar name without memo code` | 近名干扰 |

role 与 company 只在正确联系人的 notes 中出现。

### 2.3 Linux：change_form.docx

- 源文件：`tasks/cross_device/linux_android_assets/linux_android_1814/source/change_form.docx`
- 注入及保存路径：`/tmp/change/change_form.docx`（原地编辑）
- 有效 Word OOXML 包，包含 `word/styles.xml`
- 页面：portrait
- 四个表格外可见段落：

```text
Approval Change Form
Complete each field from the latest approval message and matching approver contact.
Review
Use the approved values shown above for the follow-up.
```

- 中间恰好一个 9 行 × 2 列可见网格表；左列依次是 Case、Approval code、Approver、Phone、Role、Company、Action、Approved at、Status，右列初始为对应 `[[...]]` placeholder。

## 3. Setup 具体流程

### `android_0`

确保 Simple SMS Messenger 可用，清空 SMS，先注入 old 消息，再注入 current 消息。

### `android_1`

确保 Contacts 可用，清空联系人，添加 Grace Kim 和 Grace Archive 两条记录。

### `linux_0`

创建 `/tmp/change`，删除旧文件，再上传原始模板到最终同一路径。任务要求在此文件上填写并保存，而不是另建一个不同文件名。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 `check_docx_text` evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

右列九项必须填写为：

| Label | Value |
|---|---|
| Case: | `CASE-314` |
| Approval code: | `RC-284` |
| Approver: | `Grace Kim` |
| Phone: | `+15552001781` |
| Role: | `Release reviewer` |
| Company: | `Orchard Supply` |
| Action: | `Prepare site readiness follow-up` |
| Approved at: | `2026-06-27 18:40` |
| Status: | `Approved` |

### 4.1 文件与文字合法性

- 必须仍是可解析 DOCX，不能把纯文本改名为 `.docx`。
- 必须包含 `Approval Change Form` 与 `word/styles.xml`，至少一个表格、至少四个段落。
- 不得出现 blocked、PLACEHOLDER、mismatch 或九个原始 `[[...]]`。
- 内容比较不区分大小写，但标点与字段边界仍由表格合同约束。

### 4.2 模板结构与版式

- 表格外四个 body paragraph 必须按模板保留。
- 可见表格数量必须恰好为 1；表格必须恰好 9 行、每行恰好 2 列。
- 左右单元格要逐行匹配上表，不允许调换字段顺序、合并行或增加说明行。
- 页面方向必须 portrait；标题 `Approval Change Form` 至少 30 half-points，即 15 pt。
- 表格必须有可见网格，两列宽度比例目标 50%/50%，每列容差 `0.15`。

## 5. 常见失败与不评测项

- 使用旧短信的 archived timestamp：无法得到规范 `2026-06-27 18:40`。
- 从 Grace Archive 推断 role/company：会填错联系人字段。
- 文字都正确，但另建第二个表或把表格改成三列：结构失败。
- 在右列保留 placeholder 后另加答案：exclude 仍会命中 placeholder。
- 时间写成 `June 27, 2026 6:40 PM`：没有值别名，表格 cell 不精确。
- 标题和表格正确，但删除模板末尾 Review 段落：body paragraph 合同失败。

Evaluator 不比较整个 DOCX 字节，不要求特定编辑历史，也没有检查发送消息或创建其他输出；唯一结果就是原路径上最终 DOCX 的可见内容和结构。

## 6. Cleanup

清理会清空两部手机的 SMS/Contacts，删除 `/tmp/change/change_form.docx`，并在目录为空时移除 `/tmp/change`。
