# Core 053 — `linux_android_1869`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 53 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1869.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 70 步，最长 600 秒

## 0. 任务链与设备分工

第一部手机 latest SMS 给 case/code/priority/time；第二部手机 Contacts 给 lead email/role；第一台 Linux workbook 给 route/site/current-row 归属；第二台 Linux Thunderbird 留最终草稿。Sent 必须保持为空。

## 1. Instruction

### 英文原文（逐字）

```text
The current support case needs to be escalated to its assigned lead. Use the support SMS on the first phone, the matching lead contact on the second phone, and `/tmp/support/kb.xlsx` on the first Linux desktop to prepare the message. In Thunderbird on the second Linux desktop, leave the lead an unsent draft that brings together the current case and approval, priority, lead role, route, site, and scheduled time.
```

### 中文翻译

当前 support case 需要升级给 assigned lead。使用第一部手机的 support SMS、第二部手机匹配的 lead contact，以及第一台 Linux 的 `/tmp/support/kb.xlsx` 准备消息。在第二台 Linux 的 Thunderbird 中给 lead 留一封未发送草稿，把 current case 与 approval、priority、lead role、route、site 和 scheduled time 汇总在一起。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机 SMS

```text
Archived request OLD-17; ignore this older message.
Latest approval CASE-1869 FB-1869 has priority P1 at 2026-07-14 09:30.
```

两条都来自 `+15552001827`，第二条稍晚。

### 2.2 第二部手机 Contact

```text
Maya Chen / +15552001827
Notes: maya.chen@example.test; Escalation lead
```

### 2.3 第一台 Linux kb.xlsx

工作表 `Source`，完整业务行：

| case | status | code | owner | route | site | time | include/notes |
|---|---|---|---|---|---|---|---|
| CASE-1869 | current | FB-1869 | Maya Chen | RT-69 | Harbor Gate 18 | 2026-07-14 09:30 | yes / approved source row |
| CASE-OLD | archived | OLD-17 | Archived Owner | RT-00 | Old Yard | 2026-06-01 08:00 | no / archived decoy |
| CASE-HOLD | hold | HOLD-42 | Hold Owner | RT-69 | Harbor Gate 18 Annex | 2026-07-14 09:30 | no / near-name decoy |
| CASE-1869 | missing | FB-1869 | Maya Chen | RT-69 | Harbor Gate 18 | 2026-07-14 09:30 | required_missing / visible gap row |

current/yes 第一行才是权威记录。

### 2.4 Thunderbird 初态

第二台 Linux 重建 `~/.thunderbird/mail.default-release`，身份为 `agent@example.test`，Drafts 与 Sent 都为空。

## 3. Setup 具体流程

- `android_0`：确保 SMS 可用，清空后按先 old 后 latest 注入两条消息。
- `android_1`：确保 Contacts 可用，清空并添加 Maya Chen。
- `linux_0`：创建 `/tmp/support`，上传 kb.xlsx。
- `linux_1`：删除旧 profile，重建本地 Thunderbird、空 Drafts 与 Sent。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占 `1/2`。

### 4.0 先说人话

```text
To: maya.chen@example.test

Escalation lead handoff: CASE-1869 / FB-1869 is P1 for RT-69, Harbor Gate 18, scheduled 2026-07-14 09:30.
```

保存到 Drafts，不发送。

### 4.1 草稿内容（权重 `1/2`）

- 收件人集合必须恰好为 `{maya.chen@example.test}`；额外收件人不允许。
- 正文必须肯定包含 `CASE-1869`。
- 六个 fact group 各需出现：
  - `FB-1869`
  - P1 / priority 1 / high priority
  - Escalation lead / escalation owner
  - `RT-69`
  - `Harbor Gate 18`
  - 三种时间别名之一：ISO、`July 14, 2026 at 9:30 AM`、`7/14/2026 9:30 AM`
- cancelled/canceled、not an escalation、wrong route、do not send 会失败。
- 主题与附件不检查；没有要求 Drafts 总数恰好一封。

### 4.2 Sent 必须为空（权重 `1/2`）

`thunderbird_folder_state` 要求 Sent 当前未删除邮件列表精确为空。它没有同时配置 Inbox，因此只守 Sent；发送后即使保留草稿也失败。

## 5. 常见失败与边界

- 把 `Harbor Gate 18 Annex` 写进正文：site fact 不匹配，且来源是 hold 行。
- 只在主题写 P1/route/time：fact groups 只看 body。
- To 正确又加 Cc：收件人集合不精确。
- 多留一封无关草稿：当前 getter 仍可能找到合格草稿；但 Sent 仍必须为空。

Evaluator 不要求出现 lead 姓名/phone、workbook 文件名或结束时间；这些不是硬性正文组。

## 6. Cleanup

清理会清空两部手机数据，删除 kb.xlsx，并移除第二台 Linux 的 Thunderbird profile 与 profiles.ini。
