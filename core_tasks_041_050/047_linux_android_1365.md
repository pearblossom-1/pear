# Core 047 — `linux_android_1365`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 47 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1365.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与分支判断

Linux 要求 role=`safety_reviewer`，第一部手机 Contacts 只有 `safety_observer`。这是相似字符串但不是 exact role，因此进入 blocked 分支：第二部手机不能向目标号码发送任何 SMS，只能留下说明 required role 与 available role 的 Markor note。

## 1. Instruction

### 英文原文（逐字）

```text
Before sending the review text, make sure the contact has the exact reviewer role required by `/tmp/review/reviewer_roles.csv`. If Contacts only has the similar role, do not send anything. On the second phone, leave `/storage/emulated/0/Documents/Markor/Reviewer blocked REV-1365.md` explaining which role was required, which role was available, and why the review is blocked.
```

### 中文翻译

在发送 review 短信前，确认联系人拥有 `/tmp/review/reviewer_roles.csv` 要求的精确 reviewer role。如果 Contacts 中只有相似 role，则不要发送任何内容。在第二部手机的 `/storage/emulated/0/Documents/Markor/Reviewer blocked REV-1365.md` 中说明所需 role、实际可用 role，以及 review 被阻止的原因。

## 2. 输入、附件与初始业务数据

### 2.1 Linux reviewer_roles.csv 全文

```csv
request,eligible_role
REV-1365,safety_reviewer
```

### 2.2 第一部手机 Contacts

| 字段 | 值 |
|---|---|
| Name | `Rina Role` |
| Number | `5551201365` |
| Notes | `role safety_observer email rina@example.test` |

`safety_observer` 不等于 `safety_reviewer`；CSV 没有声明别名或相似匹配。

### 2.3 第二部手机初态

- Simple SMS Messenger sent 数据被清空。
- 目标 Markor note 被删除。
- Contacts 不在第二部手机上；必须跨设备读取第一部手机的 role 信息再决定第二部手机动作。

## 3. Setup 具体流程

### `linux_0`

删除旧 reviewer_roles.csv，创建 `/tmp/review`，上传唯一 CSV。

### `android_0`

确保 Contacts 可用，清空联系人，添加 Rina Role 记录。

### `android_1`

确保 Markor 与 Simple SMS Messenger 可用，清空 SMS，删除旧 `/storage/emulated/0/Documents/Markor/Reviewer blocked REV-1365.md`。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占 `1/2`。

### 4.0 先说人话：怎样才算通过

不要向 `5551201365` 发任何 SMS。在指定路径写：

```text
REV-1365 is blocked: safety_reviewer was required, but only safety_observer was found and available; there is no exact role match.
```

### 4.1 blocked note（权重 `1/2`）

- 三个 entity 全部必需：`REV-1365`、`safety_reviewer`、`safety_observer`。
- required phrase 组 1：required 或 needed。
- required phrase 组 2：found、available 或 only。
- positive outcome：blocked、cannot proceed 或 no exact role match。
- conflict：not blocked、exact match、ready、approved、review sent。
- 因 conflict 中有连续短语 `exact match`，不要写 `an exact match was found`；示例中的 `no exact role match` 并不包含连续的 `exact match`，且同时有 blocked，能够表达正确结论。
- 问句、不确定、局部否定或后续反转会由通用关系逻辑拒绝。

### 4.2 sent SMS 必须不存在（权重 `1/2`）

- getter 查看 `android_1` 的 sent box、地址 `5551201365`、`any_body=true`。
- `recent_within_mins=0` 表示没有近期窗口限制；setup 后该号码的任何 sent 记录都会失败。
- 正文是什么不重要，空洞问候、道歉或“不要发送”说明只要真的发出也会失败。
- 只禁止这个精确号码；对其他号码的 SMS 不在该 evaluator 合同内。

## 5. 常见失败与不评测项

- 向 Rina 发一条说明“review blocked”的短信：内容正确也违反 no-send 分支。
- 笔记只写 `role mismatch`，不逐字给出 required 与 available role：实体不足。
- 写 `safety_observer is an exact match`：命中冲突。
- 将 note 写在第一部手机：evaluator 只读 `android_1` 精确路径。

Evaluator 不检查 Contacts 是否最终保持不变，也不要求 note 包含 Rina 的姓名、号码或 email；这些是来源上下文，不是硬性 note entity。

## 6. Cleanup

清理会删除 Linux CSV、清空第一部手机 Contacts，并删除第二部手机 note、清空 SMS。
