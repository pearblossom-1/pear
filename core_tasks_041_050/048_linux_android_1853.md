# Core 048 — `linux_android_1853`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 48 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1853.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 60 步，最长 480 秒

## 0. 任务链与设备分工

第一部手机 Calendar 提供 case、route、location、scheduled time；第二部手机 Contacts 提供 attendee email 与 role；Linux CSV 把 current case 与 approval code/required role 绑定。Linux Thunderbird 是唯一输出设备，必须留下草稿且 Sent 继续为空。

## 1. Instruction

### 英文原文（逐字）

```text
Create a Thunderbird draft for the current meeting handoff using the Simple Calendar Pro event on the first phone, the matching Contacts attendee on the second phone, and `/tmp/attend/attendee_roles.csv` on Linux. Address the matching attendee and include the meeting case and approval code, route, location, and scheduled time. Leave it as a draft; do not send it.
```

### 中文翻译

使用第一部手机的 Simple Calendar Pro 事件、第二部手机中匹配的 Contacts attendee，以及 Linux `/tmp/attend/attendee_roles.csv`，创建 current meeting handoff 的 Thunderbird 草稿。把邮件发给匹配 attendee，并写入 meeting case、approval code、route、location 和 scheduled time。把它留作草稿，不要发送。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机 Calendar

| 字段 | 值 |
|---|---|
| Title | `CASE-1853 source event` |
| Start | `2026-07-18 09:50`；时间戳 `1784368200` |
| End | `2026-07-18 10:35`；时间戳 `1784370900` |
| Location | `Harbor Gate 2` |
| Description | `RT-53 current meeting handoff` |

### 2.2 第二部手机 Contacts

| 字段 | 值 |
|---|---|
| Name | `Ari Singh` |
| Number | `+15552001829` |
| Notes | `ari.singh@example.test; Support owner` |

邮箱和 role 都来自 notes。

### 2.3 Linux attendee_roles.csv 全文

```csv
case,approval_code,attendee_role,status
CASE-1853,FB-1853,Support owner,current
CASE-OLD,OLD-17,Archived owner,archived
CASE-HOLD,HOLD-42,Hold owner,hold
```

current 行把 `CASE-1853`、`FB-1853`、`Support owner` 绑定起来；其他两行是身份干扰。

### 2.4 Thunderbird 初态

- profile：`~/.thunderbird/mail.default-release`
- 发件身份：`agent@example.test`
- Local Folders 的 Drafts 与 Sent 都是空 mbox
- 没有配置外部收件服务器；Inbox 也没有注入邮件

## 3. Setup 具体流程

### `android_0`

确保 Simple Calendar Pro 可用，清空 Calendar，写入唯一 source event。

### `android_1`

确保 Contacts 可用，清空联系人，添加 Ari Singh。

### `linux_0`

删除旧 attendee_roles.csv 和整个任务 Thunderbird profile，重建 `/tmp/attend`、默认 profile、Local Folders、prefs.js、空 Drafts 和空 Sent，再上传 CSV。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占 `1/2`。

### 4.0 先说人话：怎样才算通过

在 Thunderbird 保存一封未发送草稿：

```text
To: ari.singh@example.test
Subject: Meeting handoff

CASE-1853 / FB-1853, RT-53 meeting handoff is scheduled at Harbor Gate 2 on 2026-07-18 09:50.
```

### 4.1 Drafts 内容（权重 `1/2`）

- evaluator 解析指定 profile 的当前未删除 Drafts，而不是检查编辑窗口。
- 收件人地址集合必须恰好为 `{ari.singh@example.test}`；额外 To/Cc/Bcc/Resent 地址会使该草稿不匹配。
- 正文必须肯定包含 `CASE-1853`。
- 四个 fact group 各需命中一个：`FB-1853`、`RT-53`、`Harbor Gate 2`、以及三种时间写法之一：
  - `2026-07-18 09:50`
  - `July 18, 2026 at 9:50 AM`
  - `7/18/2026 9:50 AM`
- 每个事实都要通过正向事实判断；正文出现 cancelled/canceled、wrong time、wrong location、do not send 会失败。
- 主题、附件、签名不检查；没有 `exact_total_drafts`，所以额外无关草稿不一定失败。

### 4.2 Inbox/Sent 状态（权重 `1/2`）

`thunderbird_folder_state` 要求：

```text
Inbox: 0 封未删除邮件
Sent:  0 封未删除邮件
```

发送草稿会使 Sent 非空，因而即使 Drafts 还保留副本也不能完整通过。Evaluator 只列出 Inbox 与 Sent；其他无关本地文件夹不在该精确状态合同内。

## 5. 常见失败与评测边界

- 收件人写成电话或 `Ari Singh` 而没有 email：recipient address 不匹配。
- 正文只写 CASE-1853，其他四组事实在主题里：body fact groups 不看主题。
- 写 `scheduled at the wrong location Harbor Gate 2`：命中 conflict。
- 先发送再另存一份草稿：Sent guard 仍失败。
- 草稿中额外附文件：当前附件没有合同，可能仍通过；instruction 也没有要求附件。

当前 evaluator 没要求正文出现 attendee 名字或 role `Support owner`，也没检查结束时间 10:35；它们用于匹配来源，但硬性正文事实只有上述五组。

## 6. Cleanup

清理会清空 Calendar/Contacts，删除 CSV、任务 Thunderbird profile 和 `profiles.ini`，并收拢空 `/tmp/attend`。
