# Core 056 — `linux_android_1863`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1863.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`；拓扑 `2A+2L`
- 限制：最多 70 步，最长 600 秒

## 1. Instruction

### 英文原文（逐字）

```text
We need a release-readiness packet for the current case. Reconcile the release note in Markor, the latest approval SMS, and `/tmp/release/readiness.csv` on the first Linux desktop. Use the visible `/tmp/release/release_packet.pdf` there as the template for `/tmp/release/packet.pdf` on the second Linux desktop, keeping the current case, approval, owner, route, site, time, readiness decision, and their sources together in the completed packet.
```

### 中文翻译

为当前 case 制作 release-readiness packet。核对 Markor release note、最新 approval SMS 和第一台 Linux 的 readiness.csv；用可见 PDF 模板在第二台 Linux 生成 packet.pdf，把 case/code/owner/route/site/time/readiness 及来源放在一起。

## 2. 输入、附件与 Setup

Markor：CASE-1863、Maya Chen、Harbor Gate 12/RT-63；短信补 FB-1863 与 `2026-07-08 09:30`；CSV current 行给 status ready 和 included `rt-63_photo_a.jpg`。模板标题 `Release Readiness Packet`，有 Case/Approval/Owner/Route/Site/Scheduled/Status placeholders 和 `Source: Markor • SMS • readiness.csv`。

## 3. Evaluator 与通过标准

唯一 evaluator 要求真实、非空、可由 pdftotext 提取的 PDF。所有 placeholder 必须替换，且按同一提取段落分别关联：CASE-1863+FB-1863+Maya Chen；RT-63+Harbor Gate 12；时间+ready；Source+Markor+SMS+readiness.csv。禁止 CASE-OLD/HOLD-42 等干扰。只把文字随便散落各页不能满足段落关系。

