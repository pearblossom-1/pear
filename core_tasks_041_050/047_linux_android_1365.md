# Core 047 — `linux_android_1365`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1365.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`；拓扑 `2A+1L`
- 限制：最多 50 步；未单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Before sending the review text, make sure the contact has the exact reviewer role required by `/tmp/review/reviewer_roles.csv`. If Contacts only has the similar role, do not send anything. On the second phone, leave `/storage/emulated/0/Documents/Markor/Reviewer blocked REV-1365.md` explaining which role was required, which role was available, and why the review is blocked.
```

### 中文翻译

发送 review 短信前，确认联系人拥有 CSV 要求的精确 reviewer role。如果 Contacts 只有相似 role，不要发送任何内容；在第二部手机指定 Markor 文件中解释 required role、available role 以及 blocked 原因。

## 2. 输入、附件与 Setup

CSV：`REV-1365,safety_reviewer`。第一部手机联系人 `Rina Role / 5551201365` 的 notes 实际是 `role safety_observer`。第二部手机 SMS 清空，目标笔记删除。

## 3. Evaluator 与通过标准

本任务 2 项。笔记可写：`REV-1365 is blocked: safety_reviewer was required, but only safety_observer was found and available; no exact role match.`

- Note 必须含 REV-1365、safety_reviewer、safety_observer；表达 required/needed、found/available/only 和 blocked/cannot proceed/no exact role match。
- 写 exact match、ready、approved、review sent 等冲突内容失败。
- 另一 evaluator 要求第二部手机 sent box 中对 `5551201365` 的任何短信都不存在；不只是最近 30 分钟，而是 setup 后全部 sent 记录。

