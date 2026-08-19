# Core 056 — `linux_android_1863`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 56 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1863.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 70 步，最长 600 秒

## 0. 任务链与字段来源

Markor release note 给 owner/route/site；latest SMS 给 case/code/time；readiness.csv 给 ready 状态和 current included item；第一台 Linux PDF 提供可见模板。第二台 Linux 必须生成一份真实 PDF，把这些来源按段落关系填完整。

## 1. Instruction

### 英文原文（逐字）

```text
We need a release-readiness packet for the current case. Reconcile the release note in Markor, the latest approval SMS, and `/tmp/release/readiness.csv` on the first Linux desktop. Use the visible `/tmp/release/release_packet.pdf` there as the template for `/tmp/release/packet.pdf` on the second Linux desktop, keeping the current case, approval, owner, route, site, time, readiness decision, and their sources together in the completed packet.
```

### 中文翻译

我们需要为 current case 制作 release-readiness packet。核对 Markor 中的 release note、最新 approval SMS 和第一台 Linux 上的 `/tmp/release/readiness.csv`。使用同机可见的 `/tmp/release/release_packet.pdf` 作为模板，在第二台 Linux 创建 `/tmp/release/packet.pdf`，并在完成的 packet 中把 current case、approval、owner、route、site、time、readiness decision 及其来源放在一起。

## 2. 输入、附件与初始业务数据

### Android Markor release_note.md

```markdown
# Release readiness compact capstone

Current source: CASE-1863
Owner: Maya Chen
Site: Harbor Gate 12 (RT-63) at 37.707, -122.5
Decision rule: combine this owner/site context with the latest approval SMS and
the current readiness row; archived and hold rows are not authorized.
Missing item for blocked or partial branches: rt-63_photo_missing.jpg
Included item: rt-63_photo_a.jpg
```

### 第二部手机 SMS

```text
Archived request OLD-17; ignore this older message.
Latest approval CASE-1863 uses approval FB-1863 at 2026-07-08 09:30.
```

### 第一台 Linux readiness.csv 关键完整行

```csv
CASE-1863,ready,,,,,,,,rt-63_photo_a.jpg,yes,readiness row; details come from Markor and SMS
CASE-OLD,archived,OLD-17,Archived Owner,+15550000000,old@example.test,RT-00,Old Yard,2026-06-01 08:00,old_photo.jpg,no,inactive archive
CASE-HOLD,hold,HOLD-42,Hold Owner,+15550009999,,RT-63,Harbor Gate 12 Annex,2026-07-08 09:30,rt-63_hold.jpg,no,similar-name hold
CASE-1863,missing,FB-1863,Maya Chen,+15552001827,maya.chen@example.test,RT-63,Harbor Gate 12,2026-07-08 09:30,rt-63_photo_missing.jpg,required_missing,visible gap row
```

表头为 `case,status,code,owner,phone,email,route,site,time,filename,include,notes`。第一行 ready/yes 是 current readiness；细节按 notes 指示来自 Markor/SMS。

### PDF 模板可见内容

标题 `Release Readiness Packet`，字段为 Case、Approval、Owner、Route、Site、Scheduled、Status；正文还有同字段汇总、`SOURCE EVIDENCE`、`Source: Markor • SMS • readiness.csv`、release check 与文控文字。所有字段初始为 `[[CASE]]` 等 placeholder。

## 3. Setup 具体流程

- `android_0`：确保 Markor 可用，上传 release_note.md。
- `android_1`：确保 SMS 可用并清空，按先 archived 后 latest 注入两条消息。
- `linux_0`：创建 `/tmp/release`，上传 readiness.csv 与模板 `release_packet.pdf`。
- `linux_1`：创建 `/tmp/release` 并删除旧 `packet.pdf`；模板不会自动复制过去。

## 4. Evaluator：评测方式与具体评测点

唯一 evaluator 读取 `linux_1:/tmp/release/packet.pdf`，权重 100%。

### 4.0 文件真实性

- 文件必须非空，前五字节为 `%PDF-`。
- Linux 必须有 `pdftotext`，且能成功提取文字；伪 PDF 或扫描图无文字会失败。

### 4.1 必需与禁止文字

必须包含标题、CASE-1863、FB-1863、Maya Chen、RT-63、Harbor Gate 12、ready。不得包含 missing、PLACEHOLDER、任一 `[[...]]`、CASE-OLD、HOLD-42、rt-63_hold.jpg。

### 4.2 同段关系

四组各自必须出现在同一提取段落且为肯定关系：

1. CASE-1863 + FB-1863 + Maya Chen
2. RT-63 + Harbor Gate 12
3. 时间三种别名之一 + ready/approved for release
4. Source + Markor + SMS + readiness.csv

## 5. 常见失败与边界

- 只在 PDF 不同页面散落所有关键词：全文 include 可能满足，但 paragraph relation 失败。
- 保留模板 placeholder 再旁边加答案：exclude 失败。
- 写 status `missing` 或引用 hold filename：明确禁止。
- 从原 PDF 打印出图片型 PDF而无可提取文字：失败。

Evaluator 不比较模板/输出的像素布局、页数、字体或 PDF 字节，也不要求写坐标和 included filename；instruction 要“use template”，但硬合同是可提取文字及关系。

## 6. Cleanup

清理会删除 Markor source、清空 SMS，删除两台 Linux 的 CSV/template/output 和空目录。
