# Core 026 — `l2_mail_rule_foldering`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 26 项
- 任务文件：`tasks/cross_device/real300/l2_mail_rule_foldering.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 设备拓扑：`2L`（`linux_0`、`linux_1`）
- 限制：最多 50 步，最长 300 秒

## 0. 任务链与设备分工

第一台 Linux 只保存分类规则，第二台 Linux 才保存待分类邮件和最终 Thunderbird 文件夹状态。规则中的关键词用于操作者作出决定；evaluator 最终不重新跑规则引擎，而是按三封邮件的稳定身份字段检查它们是否恰好出现在规定文件夹。

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

1. 创建 `/tmp/mail`。
2. 把仓库中的唯一规则附件原样上传为 `/tmp/mail/rules.json`。
3. 不预置任何 Thunderbird profile；这台机器仅是规则来源。

### `linux_1`

1. 重建 Thunderbird 本地 profile `~/.thunderbird/mail.default-release`。
2. 写入本地账户配置。
3. 上传并复制 `inbox_seed.mbox` 为 Inbox。
4. 创建空的 `Vendors`、`Field`、`Urgent` 文件夹文件。

Inbox 初始恰好是三封未分类邮件。目标文件夹用 mbox 文件表示；setup 不创建同名子文件夹或预先分类副本。

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

## 5. 匹配身份、删除标记与失败例子

每封预期邮件的身份合同如下：

| 文件夹 | Message-ID | Subject | From |
|---|---|---|---|
| Vendors | `<supplier-invoice-batch@mdcbench.test>` | `supplier invoice batch` | `sender@example.com` |
| Field | `<north-gate-route-update@mdcbench.test>` | `north gate route update` | `field@example.com` |
| Urgent | `<urgent-same-day-repair@mdcbench.test>` | `urgent same day repair` | `ops@example.com` |

Thunderbird mbox 中带删除标记的邮件不算当前可见邮件。因而“复制到目标文件夹并在 Inbox 中真正删除原件”和标准的 Move 操作都可形成目标状态；只复制不删原件则 Inbox 仍非空。

会失败的典型情况：

- 仅创建 Vendors/Field/Urgent 三个文件夹但没有移动邮件。
- 三封邮件都移走了，但把 `north gate route update` 放入 Urgent。
- Vendors 中有正确邮件又多出一份重复；目标列表要求精确一封。
- 直接删除全部三封；Inbox 虽为空，但三个目标文件夹不满足。

邮件正文不参与最终身份比较；规则文件本身也不要求保持未修改。其他未列入 evaluator 的 Thunderbird 文件夹不计入精确集合。

## 6. Cleanup

清理会删除第一台 Linux 的 `/tmp/mail`，并删除第二台 Linux 的 `/tmp/mail`、任务 Thunderbird profile 及 `profiles.ini`。
