# Core 031 — `linux_android_904`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 31 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_904.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`
- 限制：最多 50 步，最长 420 秒

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

`transcripts.csv` 有 12 行候选；唯一同时匹配上述 case、code、owner 且状态为 approved 的行是：

```csv
904-A,Mira Patel,+1555011881,approved,NX90423,Audio memo file list missing,2026-07-17 11:30,high
```

干扰项包括同 owner 的 pending 行，以及 `904-D` hold 行；都不能授权交接。

Policy 原意完整概括如下：case ID、approval code、owner 必须与手机请求一致；登记行必须为 `approved`；联系人号码必须来自该 approved 行；pending/hold 无权交接；DOCX 和 TXT 都要写明 case、owner、code、来源登记表及肯定的 ready 决定。

第二部手机 Contacts 初始被清空。两个输出文件初始不存在。

## 3. Setup 具体流程

- `android_0`：上传 `904-A_source.md` 到精确 Download 路径。
- `linux_0`：创建 `/tmp/audio`，上传完整 transcripts CSV 和 policy；目标 DOCX 清理后等待创建。
- `android_1`：清空 Contacts。
- `linux_1`：创建 `/tmp/audio` 并清理目标 TXT。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，通常各占 `1/3`。

### 4.0 先说人话：怎样才算通过

添加联系人 `Mira Patel 904 / +1555011881`；创建真实有效的 DOCX；创建 TXT。两个文档都可直接写：

```text
904-A / NX90423 / Mira Patel is approved and ready for handoff from transcripts.csv.
```

### 4.1 Contacts

要求联系人名称与号码精确对应；错误号码、漏联系人或同名重复导致目标集合不匹配。

### 4.2 DOCX 与 TXT

- DOCX 必须是可解析的真实 Office Open XML 文档，不能只是改扩展名；TXT 通过 Linux `cat` 读取。
- 两者都必须包含 `904-A`、`NX90423`、`Mira Patel`、`ready`。
- DOCX 禁止 `DRAFT ONLY`、`904-D`、`placeholder`；TXT 禁止 `missing`、`placeholder`。
- 关系 evaluator 要同时识别三个身份实体及肯定的 ready/approved 结论；`not ready`、`do not hand off`、`blocked` 等冲突说法会失败。
- 不要求整段逐字匹配，安全做法是用上面的单句。

