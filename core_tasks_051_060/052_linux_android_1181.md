# Core 052 — `linux_android_1181`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 52 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1181.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配键

SMS 给出 sender number、名字提示和 case code；Contacts 把号码确认成 Mira Chen；tickets.csv 必须同时按 phone=`5551201181` 与 case=`CASE-4187` 选中第一行。只按近似姓名或只按 case 会遇到故意设置的干扰行。

## 1. Instruction

### 英文原文（逐字）

```text
A customer texted from the support phone. Match the sender and case code against `/tmp/support/tickets.csv`, then reply with the matching case status and next step.
```

### 中文翻译

一位客户从 support phone 发来短信。请用 sender 和 case code 在 `/tmp/support/tickets.csv` 中匹配记录，然后回复该 case 对应的 status 和 next step。

## 2. 输入、附件与初始业务数据

### 2.1 Android SMS 与 Contact

收到的消息：

```text
From: 5551201181
Body: This is Mira. Please check CASE-4187 before lunch.
```

Contacts 中唯一设置记录：

```text
Mira Chen / 5551201181
Notes: Support customer; verify case code from text.
```

### 2.2 Linux tickets.csv 全文

```csv
row_id,customer,phone,case_code,status,next_step
8,Mira Chen,5551201181,CASE-4187,parts allocated,Depot pickup Friday
9,Mira Cheng,5551201199,CASE-4187,waiting,Call back
10,Mira Chen,5551201181,CASE-4180,closed,No action
11,Noah Patel,5551201110,CASE-4100,queued,Triage
```

正确行同时满足号码和 case，输出事实是：

```text
status: parts allocated
next step: Depot pickup Friday
```

## 3. Setup 具体流程

### `linux_0`

删除旧 tickets.csv，创建 `/tmp/support`，上传四行表格。

### `android_0`

确保 Simple SMS Messenger 可用并清空 SMS，注入请求后等待 5 秒；再确保 Contacts 可用，清空并添加 Mira Chen。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 SMS body-relation evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

向 `5551201181` 回复：

```text
CASE-4187: parts are allocated. Depot pickup is Friday.
```

### 4.1 地址与时间窗口

- 只查看 sent box、地址 `5551201181`。
- 消息必须在评测时最近 30 分钟内。
- 至少一条匹配即可，没有 exact-count。

### 4.2 必需实体与关系 clause

全局必须出现：

- `CASE-4187`
- parts 或 components
- `Depot`
- `Friday`

还必须有两组关系：

1. 同一个 clause 中，parts/components 与 allocated/assigned/reserved/set aside 关联。
2. 同一个 clause 中，Depot、Friday 与 pickup/pick up/collection/collect 关联。

Clause 通常由句号、分号、换行等边界切分。示例用两个句子，分别满足两组关系；不是要求所有词放在一个句子。

### 4.3 冲突内容

出现 backordered、not allocated、unavailable、cancelled、closed、is false、obsolete，或 Monday/Tuesday/Wednesday/Thursday/Saturday/Sunday 任一错误星期，会失败。问句、不确定、否定或后续反转同样不能构成最终肯定状态。

## 5. 通过与失败例子

可以通过：

```text
CASE-4187 components are reserved; collect them at the Depot on Friday.
```

不能通过：

```text
CASE-4187 parts. Allocated. Depot pickup Friday.  （parts 与 allocated 被拆开）
CASE-4187 parts allocated; Depot pickup Thursday.（错误星期）
Are CASE-4187 parts allocated for Depot pickup Friday?（问题）
```

Evaluator 不要求回复包含 Mira Chen、row_id=8 或“before lunch”，也不检查 Contacts/tickets 最终状态。只要合格回复存在，额外不匹配短信通常不影响通过。

## 6. Cleanup

清理会删除 Linux tickets.csv，并清空 Android Contacts 与 SMS。
