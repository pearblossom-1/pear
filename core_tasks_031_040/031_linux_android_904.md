# Core 031 — `linux_android_904`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 31 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_904.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`
- 限制：最多 50 步，最长 420 秒

## 0. 任务链与设备分工

| 设备 | 权威输入/输出 |
|---|---|
| `android_0` | 三行请求：case、approval code、owner |
| `linux_0` | 完整登记表和 policy；输出真实 `handoff.docx` |
| `android_1` | 输出协调员联系人 |
| `linux_1` | 输出纯文本 `handoff.txt` |

手机请求本身不能证明 approved；必须用三个身份字段锁定 CSV 中唯一批准行，再按 policy 把该行的电话和 handoff 决定写到三个输出面。

## 1. Instruction

### 英文原文（逐字）

```text
The approved audio transcript case is ready to hand off. Verify `/sdcard/Download/904-A_source.md` on the first phone against `/tmp/audio/transcripts.csv` and `/tmp/audio/handoff_policy.md` on the first Linux desktop. Following that policy, prepare `/tmp/audio/handoff.docx` on the first Linux desktop, add the coordinator as `Mira Patel 904` in Contacts on the second phone, and leave the receiving team a short handoff at `/tmp/audio/handoff.txt` on the second Linux desktop.
```

### 中文翻译

已批准的音频转录 case 可以交接。把第一部手机的 `/sdcard/Download/904-A_source.md` 与第一台 Linux 的 `/tmp/audio/transcripts.csv`、`/tmp/audio/handoff_policy.md` 核对。按 policy 在第一台 Linux 创建 `/tmp/audio/handoff.docx`，在第二部手机 Contacts 中把协调员添加为 `Mira Patel 904`，并在第二台 Linux 的 `/tmp/audio/handoff.txt` 给接收团队留下简短交接说明。

## 2. 输入、附件与初始业务数据

第一部手机的 source 原文：

```text
904-A
NX90423
Mira Patel
```

`transcripts.csv` 的完整内容如下；它不是只有正确行的简化表：

```csv
case_id,owner,phone,status,code,target,due_time,priority
904-00,Mira Patel,+1555011881,pending,D9040,Audio memo file list missing,2026-07-14 08:30,normal
904-01,Jon Bell,+1555011882,pending,D9041,Audio memo file list missing,2026-07-15 09:30,normal
904-02,Nadia Ross,+1555011883,pending,D9042,Audio memo file list missing,2026-07-16 10:30,normal
904-A,Mira Patel,+1555011881,approved,NX90423,Audio memo file list missing,2026-07-17 11:30,high
904-04,Elena Cruz,+1555011885,pending,D9044,Audio memo file list missing,2026-07-18 12:30,normal
904-05,Priya Shah,+1555011886,pending,D9045,Audio memo file list missing,2026-07-19 13:30,normal
904-06,Owen Park,+1555011887,pending,D9046,Audio memo file list missing,2026-07-20 14:30,normal
904-D,Mira Patel,+1555011888,hold,D9047,Audio memo file list missing,2026-07-21 15:30,normal
904-08,Mira Patel,+1555011881,pending,D9048,Audio memo file list missing,2026-07-22 16:30,normal
904-09,Jon Bell,+1555011882,pending,D9049,Audio memo file list missing,2026-07-23 08:30,normal
904-10,Nadia Ross,+1555011883,pending,D90410,Audio memo file list missing,2026-07-24 09:30,normal
904-11,Tao Lin,+1555011884,pending,D90411,Audio memo file list missing,2026-07-10 10:30,normal
```

其中唯一同时匹配 `904-A / NX90423 / Mira Patel` 且状态为 `approved` 的行给出协调员号码 `+1555011881`。同 owner、同号码的 pending 行和 `904-D` hold 行都不能授权交接。

Policy 原文的规则是：case ID、approval code、owner 必须与手机请求一致；对应登记行必须为 `approved`；联系人号码必须来自该 approved 行；pending/hold 无权交接，即使 owner 相同；DOCX 和 TXT 都要识别所选 case、owner、approval code、source register，并给出肯定的 ready 决定。

第二部手机 Contacts 初始被清空。两个输出文件初始不存在。

## 3. Setup 具体流程

### `android_0`

确保 Android Files 可用，把请求附件上传为精确路径 `/sdcard/Download/904-A_source.md`。

### `linux_0`

创建 `/tmp/audio`，先删除旧 `transcripts.csv`、`handoff_policy.md`、`handoff.docx`，再上传本轮完整 CSV 和 policy。不存在 DOCX 模板，输出必须新建。

### `android_1`

确保 Contacts 可用并清空全部联系人；setup 不预建 Mira。

### `linux_1`

创建 `/tmp/audio` 并删除旧 `handoff.txt`；不传入任何模板或半成品。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，通常各占 `1/3`。

### 4.0 先说人话：怎样才算通过

添加联系人 `Mira Patel 904 / +1555011881`；创建真实有效的 DOCX；创建 TXT。两个文档都可直接写：

```text
904-A / NX90423 / Mira Patel is approved and ready for handoff from transcripts.csv.
```

### 4.1 Contacts

Getter 查找规范化名称为 `Mira Patel 904`、清洗后号码为 `+1555011881` 的联系人，至少找到一个即返回 `present`。这里没有配置 `require_exactly_one`、`require_unique_name` 或全联系人集合检查：额外无关联系人以及重复的完全相同联系人，当前 evaluator 可能不会拒绝。这是实际覆盖边界，不应误写成“联系人集合必须精确只有一条”。

### 4.2 DOCX 与 TXT

- DOCX 必须是可解析的真实 Office Open XML 文档，不能只是改扩展名；TXT 通过 Linux `cat` 读取。
- 两者都必须包含 `904-A`、`NX90423`、`Mira Patel`、`ready`。
- DOCX 禁止 `DRAFT ONLY`、`904-D`、`placeholder`；TXT 禁止 `missing`、`placeholder`。
- 关系 evaluator 要同时识别三个身份实体及肯定的 ready/approved 结论；`not ready`、`do not hand off`、`blocked` 等冲突说法会失败。
- 不要求整段逐字匹配，安全做法是用上面的单句。

## 5. 文档关系逻辑、例子与不评测项

`include` 先要求四个字面锚点都存在；`entity_relation` 再要求三个身份实体都出现，并至少出现 `ready` 或 `approved` 之一。通用关系逻辑还会拒绝问句、不确定说法、局部否定以及后续撤销词。

可通过：

```text
Selected from transcripts.csv: 904-A, NX90423, owned by Mira Patel, is approved and ready for handoff.
```

不可通过：

```text
Is 904-A / NX90423 for Mira Patel ready?       （问句）
904-A / NX90423 / Mira Patel is not ready.     （否定）
904-A is ready, but the handoff is blocked.    （冲突词）
904-D / NX90423 / Mira Patel is ready.         （DOCX 还命中禁止项 904-D）
```

Evaluator 不检查 DOCX 的页面样式、TXT 的固定句式，也没有强制正文逐字写出 `transcripts.csv`；虽然 policy 要求识别 source register，但当前规则只硬性检查三个实体和 ready/approved，这是一个真实的合同宽松点。

## 6. Cleanup

清理会删除第一部手机的 source、清空第二部手机 Contacts，删除两台 Linux 的输入和输出；DOCX 锁文件也会定向移除，目录为空时再删除 `/tmp/audio`。
