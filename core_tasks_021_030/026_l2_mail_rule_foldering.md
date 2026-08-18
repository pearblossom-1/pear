# Core 026 — `l2_mail_rule_foldering`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 26 项
- 任务文件：`tasks/cross_device/real300/l2_mail_rule_foldering.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 设备拓扑：`2L`（`linux_0`、`linux_1`）
- 限制：最多 50 步，最长 300 秒

## 1. Instruction

### 英文原文（逐字）

```text
`/tmp/mail/rules.json` on the first Linux machine contains the mail classification rules. Please move each matching message into the corresponding folder in Thunderbird on the second Linux machine, leaving no classified message in Inbox.
```

### 中文翻译

第一台 Linux 机器上的 `/tmp/mail/rules.json` 包含邮件分类规则。请在第二台 Linux 机器的 Thunderbird 中，把每封匹配邮件移动到相应文件夹，并确保 Inbox 中不再留下任何已分类邮件。

## 2. 输入、附件与初始业务数据

### 2.1 第一台 Linux 的规则文件

```json
{
  "rules": [
    {"folder": "Vendors", "contains": ["invoice", "supplier"]},
    {"folder": "Field", "contains": ["gate", "route"]},
    {"folder": "Urgent", "contains": ["urgent", "same day"]}
  ]
}
```

### 2.2 第二台 Linux 的 Inbox 邮件

邮件 1：

```text
From: sender@example.com
Message-ID: <supplier-invoice-batch@mdcbench.test>
Subject: supplier invoice batch

Please file this invoice with the supplier messages.
```

邮件 2：

```text
From: field@example.com
Message-ID: <north-gate-route-update@mdcbench.test>
Subject: north gate route update

Gate route notes for the morning check.
```

邮件 3：

```text
From: ops@example.com
Message-ID: <urgent-same-day-repair@mdcbench.test>
Subject: urgent same day repair

Urgent repair notice for same day response.
```

规则对应关系为：

| 邮件主题 | 目标文件夹 |
|---|---|
| supplier invoice batch | Vendors |
| north gate route update | Field |
| urgent same day repair | Urgent |

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/mail` 并上传 `rules.json`。

### `linux_1`

1. 重建 Thunderbird 本地 profile `~/.thunderbird/mail.default-release`。
2. 写入本地账户配置。
3. 上传并复制 `inbox_seed.mbox` 为 Inbox。
4. 创建空的 `Vendors`、`Field`、`Urgent` 文件夹文件。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

把三封邮件分别移动到 Vendors、Field、Urgent，Inbox 最终为空。不能只新建副本后让原邮件留在 Inbox，也不能直接删除，因为三个目标文件夹都必须各有正确邮件。

### 4.1 Thunderbird 文件夹状态

- `result.type`：`thunderbird_folder_state`
- evaluator 读取指定 profile 的 Inbox 和三个目标文件夹。
- Inbox 必须恰好有 0 封未删除邮件。
- Vendors、Field、Urgent 必须各恰好有 1 封预期邮件。
- 每封邮件按 `Message-ID`、Subject、From 三项联合匹配；比较忽略大小写并折叠空白。
- 任一目标文件夹中出现额外邮件、重复邮件，或邮件被放错文件夹都会失败。
- 正文不参与最终身份匹配；规则文件和正文是用于做分类决定的输入。
- evaluator 只读取 Inbox 和这三个命名文件夹，其他无关 Thunderbird 文件夹不在此合同内。

