# Core 050 — `linux_android_1217`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 50 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1217.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与分支判断

第一台 Linux policy 指定缺失 reviewer 的姓名和 role，第二台 Linux Markdown 指定缺失时要创建的 task title。Android Contacts 只有近名、错误 role 的 Casey Harper，因此 Casey Hart / Safety approver 仍然缺失；正确动作是在 Android Tasks 创建一条未完成 follow-up。

## 1. Instruction

### 英文原文（逐字）

```text
Read `/tmp/review/policy.pdf` on the first Linux machine and `/tmp/review/followup_task.md` on the second, then check Contacts. If the required reviewer is missing, create the incomplete follow-up task described by those sources.
```

### 中文翻译

阅读第一台 Linux 的 `/tmp/review/policy.pdf` 和第二台 Linux 的 `/tmp/review/followup_task.md`，然后检查 Contacts。如果 required reviewer 缺失，就创建这些来源所描述的未完成 follow-up task。

## 2. 输入、附件与初始业务数据

### 2.1 第一台 Linux：policy.pdf

- 源文件：`tasks/cross_device/linux_android_assets/linux_android_1217/source/tmp/review/policy.pdf`
- 注入路径：`linux_0:/tmp/review/policy.pdf`
- 单页 PDF，提取到的全部业务文字：

```text
REVIEW OPERATIONS
Reviewer Contact Policy
Incomplete contact follow-up
MISSING REVIEWER
Casey Hart
ROLE
Safety approver
REQUIRED FOLLOW-UP
Create one incomplete reviewer contact task.
Internal operations reference
Page 1
```

### 2.2 第二台 Linux：followup_task.md 原文

```markdown
# Reviewer follow-up task

When the policy identifies a missing reviewer, create one incomplete task titled `Create reviewer contact`. The native task list is the handoff; do not create an audit report.
```

### 2.3 Android Contacts 与 Tasks 初态

Contacts 只有：

| Name | Number | Notes |
|---|---|---|
| Casey Harper | `5551201217` | `near-name decoy; role observer` |

它既不是 `Casey Hart`，role 也不是 `Safety approver`。Tasks 在 setup 时完全清空。

## 3. Setup 具体流程

### `linux_0`

删除旧 policy.pdf，创建 `/tmp/review`，上传固定 PDF。

### `linux_1`

删除旧 followup_task.md，创建同名目录，上传 Markdown。

### `android_0`

确保 Contacts 可用，清空并添加 Casey Harper；确保 Tasks 可用并清空任务列表。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 `androidworld_task_set` evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

在 Android Tasks 中只创建一条任务：

```text
Title: Create reviewer contact
Completed: false（不要勾选）
```

### 4.1 精确 task-set 逻辑

- 规范标题集合只有 `{Create reviewer contact}`。
- `completed=false`：匹配任务必须处于未完成状态。
- `allow_unrelated=false`：清空后的最终任务总集合不能有任何额外 task。
- 标题默认做大小写不敏感和连续空白折叠；标点与额外词仍有意义。
- 要求集合精确，因此漏建、重复建两条、加另一个 task 或把唯一 task 标为完成，都会返回 `mismatch`。
- 不检查 notes、description、due date、priority 或 task list/category。

## 5. 通过与失败例子、评测边界

| 最终 Tasks 状态 | 结果 |
|---|---|
| 一条未完成 `Create reviewer contact` | 通过 |
| 一条未完成 `CREATE REVIEWER CONTACT` | 可通过，大小写忽略 |
| `Create Casey Hart reviewer contact` | 失败，标题多词 |
| 正确 task + `Write audit report` | 失败，存在额外 task |
| 正确 task 但已勾选完成 | 失败 |
| 两条同名未完成 task | 失败，集合有重复记录 |

Evaluator 不直接验证 Contacts 中确实缺少 Casey Hart，也不读取 PDF/Markdown 是否被修改；它把这些作为决定分支的输入，最终只检查完整 Tasks 集合。Instruction 只要求 incomplete task，所以未评测字段不需要额外填写。

## 6. Cleanup

清理会删除两台 Linux 的 policy/follow-up 文件，并清空 Android Contacts 和 Tasks；空目录会被移除。
