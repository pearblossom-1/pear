# Core 059 — `linux_android_947`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 59 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_947.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 50 步，最长 420 秒

## 0. 任务链与最终要做的事

这是一个“一份批准记录，分别交给两个下游操作员”的任务：

1. 手机文件给出 case、approval code 和 owner；
2. 第一台 Linux 的 CSV 和 policy 说明哪一行被批准，以及 JSON 必须怎样写；
3. 第一台 Linux 要生成机器可读的 `decision.json`；
4. 手机要给 recording operator 留 Markor note；
5. 第二台 Linux 要给 transfer operator 留 `handoff.txt`。

三个输出分别评测，缺少任何一个都不能拿满分。

## 1. Instruction

### 英文原文（逐字）

```text
The approved recording case needs to be handed to both the phone recording operator and the second-Linux transfer operator. Reconcile `/sdcard/Download/947-A_source.md` with `/tmp/audio_file_list_creates_reco/request_table.csv` and follow `/tmp/audio_file_list_creates_reco/handoff_policy.md`. Save the routing decision to `/tmp/audio_file_list_creates_reco/decision.json`, leave the phone operator a `947-A recording handoff` note in Markor, and write the transfer handoff to `/tmp/audio_file_list_creates_reco/handoff.txt` on the second Linux machine.
```

### 中文翻译

已批准的录音 case 需要同时交接给手机端录音操作员和第二台 Linux 上的传输操作员。请核对 `/sdcard/Download/947-A_source.md` 与 `/tmp/audio_file_list_creates_reco/request_table.csv`，并遵循 `/tmp/audio_file_list_creates_reco/handoff_policy.md`。将路由决定保存到 `/tmp/audio_file_list_creates_reco/decision.json`；在 Markor 中给手机操作员留下名为 `947-A recording handoff` 的笔记；并在第二台 Linux 的 `/tmp/audio_file_list_creates_reco/handoff.txt` 中写下传输交接信息。

## 2. 输入、附件与初始业务数据

### 2.1 手机文件 `947-A_source.md`

Setup 把下面三行原样放到第一部也是唯一一部手机的 `/sdcard/Download/947-A_source.md`：

```text
947-A
NX94733
Tao Lin
```

它只提供身份三元组，没有状态、目标路径或 JSON schema；这些要到 Linux 输入中确认。

### 2.2 第一台 Linux 的 `request_table.csv`

完整内容如下：

```csv
case_id,owner,phone,status,code,target,due_time,priority
947-00,Mira Patel,+1555011881,pending,D9470,Audio file list recording handoff,2026-07-12 08:30,normal
947-01,Jon Bell,+1555011882,pending,D9471,Audio file list recording handoff,2026-07-13 09:30,normal
947-02,Nadia Ross,+1555011883,pending,D9472,Audio file list recording handoff,2026-07-14 10:30,normal
947-A,Tao Lin,+1555011884,approved,NX94733,Audio file list recording handoff,2026-07-15 11:30,high
947-04,Elena Cruz,+1555011885,pending,D9474,Audio file list recording handoff,2026-07-16 12:30,normal
947-05,Priya Shah,+1555011886,pending,D9475,Audio file list recording handoff,2026-07-17 13:30,normal
947-06,Owen Park,+1555011887,pending,D9476,Audio file list recording handoff,2026-07-18 14:30,normal
947-D,Tao Lin,+1555011888,hold,D9477,Audio file list recording handoff,2026-07-19 15:30,normal
947-08,Mira Patel,+1555011881,pending,D9478,Audio file list recording handoff,2026-07-20 16:30,normal
947-09,Jon Bell,+1555011882,pending,D9479,Audio file list recording handoff,2026-07-21 08:30,normal
947-10,Nadia Ross,+1555011883,pending,D94710,Audio file list recording handoff,2026-07-22 09:30,normal
947-11,Tao Lin,+1555011884,pending,D94711,Audio file list recording handoff,2026-07-23 10:30,normal
```

大白话：只选 `947-A`。它是唯一的 `approved`/`high` 行，并且与手机文件中的 `947-A / NX94733 / Tao Lin` 完全一致。`947-D` 虽然 owner 也是 Tao Lin，但状态是 `hold`、code 是 `D9477`，不能拿来交接。

### 2.3 第一台 Linux 的 `handoff_policy.md`

完整业务内容是：

```text
# Audio file list recording handoff handoff policy

Current approved source row: 947-A
Approval code: NX94733
Owner: Tao Lin (Inventory owner)
Required decision: List files with missing transcript or failed processing.
The `recording-handoff-router` consumes `/tmp/audio_file_list_creates_reco/decision.json`; the phone note is for the Android recording operator and `handoff.txt` is for the second-Linux transfer operator.

The JSON must contain exactly one handoff record with this complete minimal schema (an array or a `handoffs` array is accepted):
`{"case_id":"947-A","approval_code":"NX94733","owner":"Tao Lin","selected_source":"/tmp/audio_file_list_creates_reco/request_table.csv","status":"ready"}`
Authority note: row 947-D is on hold and is not authorized for transfer.
```

这里最重要的是：policy 不只是告诉你“选谁”，还直接公开了 `decision.json` 的完整最小记录、允许的两种顶层形状，以及两个文本交接分别给谁。

## 3. Setup 具体流程

### `android_0`

- 确保 Files 和 Markor 可用。
- 删除旧的 `/storage/emulated/0/Documents/Markor/947-A recording handoff.md`，避免旧答案残留。
- 上传 `947-A_source.md` 到 `/sdcard/Download/947-A_source.md`。

### `linux_0`

- 创建 `/tmp/audio_file_list_creates_reco`。
- 删除旧的 `request_table.csv`、`handoff_policy.md` 和 `decision.json`。
- 上传新的 CSV 与 policy；`decision.json` 留给执行者创建。

### `linux_1`

- 创建同名目录 `/tmp/audio_file_list_creates_reco`。
- 删除旧的 `handoff.txt`；该机没有输入附件，交接内容必须由前两端的信息整理而来。

## 4. Evaluator：评测方式与具体评测点

任务有 3 个 evaluation 单元，未单列自定义权重，目标是三项全部通过。

### 4.0 一组稳妥的结果示例

手机 note 可以写：

```text
947-A / NX94733 for Tao Lin is approved and ready for the recording handoff.
```

第一台 Linux 的 `decision.json` 可以写：

```json
[
  {
    "case_id": "947-A",
    "approval_code": "NX94733",
    "owner": "Tao Lin",
    "selected_source": "/tmp/audio_file_list_creates_reco/request_table.csv",
    "status": "ready"
  }
]
```

第二台 Linux 的 `handoff.txt` 可以写：

```text
947-A / NX94733 for Tao Lin is ready for recording handoff by the second-Linux transfer operator.
```

### 4.1 手机 Markor note

- 文件路径必须是 `/storage/emulated/0/Documents/Markor/947-A recording handoff.md`。文件名和目录都属于 getter 的定位条件。
- 全文必须出现：`947-A`、`NX94733`、`Tao Lin`、`recording handoff`。
- 还必须至少命中一个肯定短语：`ready`、`approved` 或 `prepare handoff`。
- 全文不能出现冲突短语：`not ready`、`blocked`、`do not hand off`、`placeholder`。
- 通用语义评分还会拒绝问句、不确定表达和撤销式说法，例如 “maybe ready?”。
- 本任务没有配置 clause/近邻绑定；实现上是在整份 note 中检查这些实体与短语，不要求它们严格落在同一句。但用一条自然的肯定句最不容易产生歧义。

### 4.2 第一台 Linux 的 `decision.json`

这是严格的结构化比较，不是“检测几个关键词”。

- JSON 必须能正常解析；重复 JSON key 直接失败。
- 只接受两种顶层形状：直接数组 `[...]`，或者仅含一个 `handoffs` key 的对象 `{"handoffs":[...]}`。
- 必须恰好有 1 条记录；多一条、少一条都失败。
- 该记录必须完整匹配五个值：
  - case：`947-A`
  - approval code：`NX94733`
  - owner：`Tao Lin`
  - selected source：`/tmp/audio_file_list_creates_reco/request_table.csv`
  - status：`ready`
- 值比较为大小写敏感；连续空白会被压成一个空格，但不能把 `ready` 写成 `Ready`。
- ID key 技术上允许 `case_id` 或 `id` 二选一；不能两个同时出现。其他四个业务字段仍不可缺少。
- 未声明的额外字段、额外顶层 key、额外记录都会失败。最稳妥做法就是照 policy 给出的五字段 schema 写。

### 4.3 第二台 Linux 的 `handoff.txt`

- 首先做大小写敏感的子串包含检查，必须出现 `947-A`、`NX94733`、`Tao Lin`。
- 不能出现小写子串 `missing` 或 `placeholder`；如果文件不存在，读取命令会返回 `missing`，因此自然失败。
- 语义检查还要求出现 `recording handoff`，以及 `second Linux`、`second-Linux`、`transfer operator` 三种说法中的任意一种。
- 肯定短语接受 `ready`、`prepared` 或 `handoff`；冲突短语是 `not ready`、`blocked`、`do not hand off`。
- 同样没有 clause/近邻绑定，按全文匹配。并且因为必需实体 `recording handoff` 自身已经含有 positive 词 `handoff`，严格按代码来说，只要其他实体齐全且没有冲突，即使不另写 `ready` 也可能通过；不过 policy 的真实结果是 ready，建议明确写出。

## 5. 常见失败与评测边界

- 把 `947-D / D9477` 写入任何输出：JSON 精确记录会失败；文本若缺少 947-A/NX94733 也失败。
- JSON 写成一个裸对象 `{...}`：失败，因为此任务只接受数组或 `handoffs` 数组。
- `{"handoffs":[正确记录],"comment":"ok"}`：失败，因为 wrapper 有额外顶层字段。
- 只写手机 note 和 JSON，不在第二台 Linux 写 `handoff.txt`：第三项失败。
- 在文本里同时写 “ready” 和 “not ready”：冲突短语会让该文本项失败。

Evaluator 没有检查手机 note 是否真的通过 Markor UI 创建，也不检查 `handoff.txt` 的固定句式；它检查的是指定路径处最终可读内容。`Required decision: List files with missing transcript or failed processing.` 是输入中的业务说明，但三个 evaluator 并没有要求输出逐字包含这句话。

## 6. Cleanup

- 手机删除 source 文件和 Markor note。
- 第一台 Linux 删除 CSV、policy、decision.json，并在目录为空时删除目录。
- 第二台 Linux 删除 handoff.txt，并在目录为空时删除目录。
