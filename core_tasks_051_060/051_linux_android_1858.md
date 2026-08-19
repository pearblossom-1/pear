# Core 051 — `linux_android_1858`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 51 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1858.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 60 步，最长 480 秒

## 0. 任务链与分支判断

Android latest SMS 与 Linux current row 在 case/code/owner/time 上一致，但 phone 不一致：SMS sender 是 `+15552001828`，current row 是 `+15552009928`。因此必须走 blocked/no-reply 分支，在第二台 Linux 写报告，并让 Android sent box 对 sender 号码保持完全为空。

## 1. Instruction

### 英文原文（逐字）

```text
Cross-check the latest Simple SMS Messenger request against the current row in `/tmp/contacts/recipient_table.csv`. If their phone values conflict, write the case, both phone values, and the blocked reason to `/tmp/blocked/blocked_comm.md` on the second Linux desktop, and do not send a reply.
```

### 中文翻译

将 Simple SMS Messenger 中最新的请求与 `/tmp/contacts/recipient_table.csv` 的 current 行交叉核对。如果两边 phone 值冲突，请在第二台 Linux 的 `/tmp/blocked/blocked_comm.md` 中写明 case、两个 phone 值和 blocked 原因，并且不要发送回复。

## 2. 输入、附件与初始业务数据

### 2.1 Android SMS 时间顺序

两条消息都来自 `+15552001828`，先旧后新注入：

```text
Archived request OLD-17; ignore this older message.
Latest approval CASE-1858 FB-1858 for Leo Martin at 2026-07-23 09:40.
```

最新消息不在正文中重复 sender phone；号码来自 SMS address 字段。

### 2.2 Linux recipient_table.csv 全文

```csv
case,status,code,owner,phone,email,route,site,time,filename,include,notes
CASE-1858,current,FB-1858,Leo Martin,+15552009928,leo.martin@example.test,RT-58,Harbor Gate 7,2026-07-23 09:40,rt-58_photo_a.jpg,yes,approved source row
CASE-OLD,archived,OLD-17,Archived Owner,+15550000000,old@example.test,RT-00,Old Yard,2026-06-01 08:00,old_photo.jpg,no,inactive archive
CASE-HOLD,hold,HOLD-42,Hold Owner,+15550009999,,RT-58,Harbor Gate 7 Annex,2026-07-23 09:40,rt-58_hold.jpg,no,similar-name hold
CASE-1858,missing,FB-1858,Leo Martin,+15552009928,leo.martin@example.test,RT-58,Harbor Gate 7,2026-07-23 09:40,rt-58_photo_missing.jpg,required_missing,visible gap row
```

应选第一行，因为 status=`current`、include=`yes`。决定性差异：

```text
SMS phone:         +15552001828
current-row phone: +15552009928
```

## 3. Setup 具体流程

### `android_0`

确保 Simple SMS Messenger 可用，清空 SMS，再以 0.1 秒间隔注入 old 和 latest 两条消息。

### `linux_0`

创建 `/tmp/contacts`，上传 `recipient_table.csv`。

### `linux_1`

创建 `/tmp/blocked` 并删除旧 `blocked_comm.md`；没有报告模板。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占 `1/2`。

### 4.0 先说人话：怎样才算通过

报告可写：

```text
CASE-1858 / FB-1858 for Leo Martin is blocked: SMS phone +15552001828 conflicts with current-row phone +15552009928; no reply was sent.
```

不要在 Android 回复 sender。

### 4.1 blocked_comm.md（权重 `1/2`）

- 通过 `cat` 读取精确路径；缺失时输出 `missing`，会被 exclude 拒绝。
- 顶层 include 明确要求 `CASE-1858` 和两个号码。
- entity relation 进一步要求 `FB-1858`、`Leo Martin`，以及上述三项。
- 第一组 required phrase：conflicts / does not match / mismatch / different。
- 第二组 required phrase：no reply / reply was not sent / do not reply。
- positive outcome：blocked、do not reply 或 reply was not sent。
- conflict：not blocked、phones/numbers match、reply sent、safe to reply。
- 禁止 missing、PLACEHOLDER、CASE-OLD、HOLD-42、rt-58_hold.jpg。

### 4.2 no-reply SMS（权重 `1/2`）

- 查看 `android_0` sent box、地址 `+15552001828`、`any_body=true`。
- `recent_within_mins=0`，所以没有时间窗口；该地址只要存在任何 sent SMS 就失败。
- 对 CSV 号码 `+15552009928` 没有单独 guard。Instruction 说“do not send a reply”，通常指 sender；符合 blocked 逻辑的稳妥做法是两个号码都不发送。

## 5. 常见失败与评测边界

- 报告只说号码不同但没写 no reply 决定：缺 required group。
- 把 hold row 号码当作第二个号码：实体与 exclude 都失败。
- 发一条“你的请求已 blocked”的解释短信：任何正文都破坏 no-reply 项。
- 把五个 entity 分散到多段：该 evaluator 没有 same-clause/paragraph relation，可能仍通过；单句写法更符合 handoff 意图。

Evaluator 不要求报告 route/site/time/email，也不检查源 CSV 或 inbox 最终状态。

## 6. Cleanup

清理会清空 Android SMS，删除两台 Linux 的 input/report，并收拢空目录。
