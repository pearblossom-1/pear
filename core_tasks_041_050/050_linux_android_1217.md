# Core 050 — `linux_android_1217`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1217.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`；拓扑 `1A+2L`
- 限制：最多 50 步；未单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Read `/tmp/review/policy.pdf` on the first Linux machine and `/tmp/review/followup_task.md` on the second, then check Contacts. If the required reviewer is missing, create the incomplete follow-up task described by those sources.
```

### 中文翻译

阅读第一台 Linux 的 policy.pdf 和第二台 Linux 的 followup_task.md，再检查 Contacts。如果 required reviewer 缺失，创建来源中描述的未完成 follow-up task。

## 2. 输入、附件与 Setup

PDF 指明 missing reviewer=`Casey Hart`、role=`Safety approver`、要求创建一个 incomplete reviewer contact task。Markdown 明确标题必须为 `Create reviewer contact`，不要创建 audit report。

Contacts 只有近名 `Casey Harper / 5551201217`，role observer；这不等于 Casey Hart / Safety approver。Tasks 初始清空。

## 3. Evaluator 与通过标准

唯一 evaluator 使用完整 task-set 精确匹配：最终 Tasks 中只能有 1 条，标题精确为 `Create reviewer contact`，completed=false。多余任务、重复任务或把它标完成都会失败。Notes、due date 不评测。

