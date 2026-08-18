# Core 044 — `linux_android_1814`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1814.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`；拓扑 `2A+1L`
- 限制：最多 60 步，最长 480 秒

## 1. Instruction

### 英文原文（逐字）

```text
Complete every visible field in `/tmp/change/change_form.docx` on Linux using the latest approval SMS from the first phone and the matching approver contact from the second phone. Preserve the form's visible layout and use its displayed timestamp format.
```

### 中文翻译

使用第一部手机最新 approval SMS 和第二部手机匹配的 approver 联系人，填写 Linux 上 change_form.docx 的每个可见字段；保留表单可见布局，并使用显示的时间格式。

## 2. 输入、附件与 Setup

最新短信：`CASE-314 RC-284: requester Grace Kim; action prepare site readiness follow-up; timestamp 2026-06-27 18:40; phone +15552001781; status approved.` 旧短信只说忽略 archived timestamp。

正确联系人 `Grace Kim / +15552001781`，notes：`RC-284; CASE-314; role release reviewer; company Orchard Supply; packet ready`；近名干扰是 Grace Archive。

DOCX 有标题、说明、一个 9 行×2 列可见网格表，字段依次为 Case、Approval code、Approver、Phone、Role、Company、Action、Approved at、Status；表后还有 Review 两段。每个 value 初始为 `[[...]]`。

## 3. Evaluator 与通过标准

本任务 1 个严格 DOCX evaluator。必须在原路径保存有效 DOCX，完整表格值为：

```text
CASE-314 | RC-284 | Grace Kim | +15552001781 | Release reviewer
Orchard Supply | Prepare site readiness follow-up | 2026-06-27 18:40 | Approved
```

- 9 行、2 列、标签和值精确匹配，表数恰好 1；所有 placeholder 禁止残留。
- 必须保留四个指定 body paragraphs、portrait 方向、可见表格网格、近似 50/50 列宽和标题字号要求。
- 大小写文本匹配不敏感，但不要依赖这一点；时间格式按模板精确写。

