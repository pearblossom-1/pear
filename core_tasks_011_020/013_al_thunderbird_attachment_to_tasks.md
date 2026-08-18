# Core 013 — `al_thunderbird_attachment_to_tasks`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 13 项
- 任务文件：`tasks/cross_device/real200/al_thunderbird_attachment_to_tasks.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 70 步，最长 540 秒

## 1. Instruction

### 英文原文（逐字）

```text
Linux Thunderbird has an email titled `Tasks for today` with a task-list CSV attachment. In the Android Tasks app, add one incomplete task using the `title` from every CSV row.
```

### 中文翻译

Linux Thunderbird 中有一封标题为 `Tasks for today` 的邮件，附件是一份任务列表 CSV。请在 Android Tasks 应用中，为 CSV 的每一行各新增一项未完成任务，并使用该行的 `title` 作为任务标题。

## 2. 输入、附件与初始业务数据

### 2.1 Thunderbird 邮件原文

- 仓库源文件：`tasks/cross_device/real200_assets/al_thunderbird_attachment_to_tasks/source/message.eml`
- 发件人：`scheduler@example.test`
- 收件人：`agent@example.test`
- 主题：`Tasks for today`
- 正文：`The attached CSV contains today's task list for Android Tasks.`
- 附件名：`tasks.csv`
- 附件 MIME：`text/csv`

### 2.2 `tasks.csv` 的完整内容

| task_id | title | notes | priority | owner | due_date | source_email | copy_to_android |
|---|---|---|---|---|---|---|---|
| T155-01 | Stage route labels | owner=Mina; due=2026-06-10; priority=high | high | Mina | 2026-06-10 | Tasks for today | yes |
| T155-02 | Check cold-chain seal | owner=Noah; due=2026-06-11; priority=normal | normal | Noah | 2026-06-11 | Tasks for today | yes |
| T155-03 | Call receiving desk | owner=Ivy; due=2026-06-12; priority=high | high | Ivy | 2026-06-12 | Tasks for today | yes |
| T155-04 | Print driver manifest | owner=Owen; due=2026-06-13; priority=normal | normal | Owen | 2026-06-13 | Tasks for today | yes |
| T155-05 | Confirm spare scanner battery | owner=Lina; due=2026-06-14; priority=low | low | Lina | 2026-06-14 | Tasks for today | yes |
| T155-06 | Label priority return bin | owner=Ravi; due=2026-06-15; priority=normal | normal | Ravi | 2026-06-15 | Tasks for today | yes |
| T155-07 | Update dock handoff board | owner=Tess; due=2026-06-16; priority=high | high | Tess | 2026-06-16 | Tasks for today | yes |
| T155-08 | Verify outbound pallet photo | owner=Uma; due=2026-06-17; priority=normal | normal | Uma | 2026-06-17 | Tasks for today | yes |

只有 `title` 列需要复制到 Android Tasks；其他列不要求写入任务备注或日期。

## 3. Setup 具体流程

### `android_0`

1. 确保 Tasks 应用可用。
2. 清空现有任务，因此初始任务列表为空。

### `linux_0`

1. 重建 `/tmp/mail` 并上传 `message.eml`。
2. 重建 Thunderbird 本地 profile `~/.thunderbird/local.default-release`。
3. 创建本地账户 `Task Agent <agent@example.test>`。
4. 将该 EML 写入本地 `Inbox`，删除旧索引以便 Thunderbird 重新读取。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

在 Android Tasks 中建立下面 8 项，并全部保持“未完成”：

```text
Stage route labels
Check cold-chain seal
Call receiving desk
Print driver manifest
Confirm spare scanner battery
Label priority return bin
Update dock handoff board
Verify outbound pallet photo
```

不能漏项、不能重复，也不能留下第 9 个无关任务。只要求标题和未完成状态，不要求复制 owner、priority、due date 或 notes。

### 4.1 Android 任务集合

- `result.type`：`androidworld_task_set`
- evaluator 直接读取 Tasks 应用数据库，而不是看截图。
- 标题比较会忽略大小写差异并折叠连续空白，但词语内容必须一致。
- 期望集合是上述 8 个标题各出现一次，`completed=false`。
- `allow_unrelated=false`，因此额外任务、重复任务、漏任务或任何目标任务被勾选完成都会返回 `mismatch`。
- CSV 中其他字段和 Thunderbird 邮件最终所在状态不评分。

