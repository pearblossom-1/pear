# Core 046 — `linux_android_1851`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1851.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：最多 60 步，最长 480 秒

## 1. Instruction

### 英文原文（逐字）

```text
Please prepare the phone handoff for the current approved case. Reconcile `/tmp/thunderbird_message_and_cont/source.csv` on Linux with the matching Contacts entry and the visible Markor context note, then write `/storage/emulated/0/Documents/Markor/handoff_note.md`. Keep the case and approval code, owner and contact details, route, site, time, role, and readiness decision together in the note.
```

### 中文翻译

为当前 approved case 准备手机交接。把 Linux source.csv 与匹配 Contacts 记录及可见 Markor context note 对齐，再写 handoff_note.md；在笔记中把 case/code、owner/contact、route/site/time、role 和 readiness 决定放在一起。

## 2. 输入、附件与 Setup

CSV current 行：`CASE-1851 / FB-1851 / Maya Chen / RT-51 / Harbor Gate 17 / 2026-07-16 09:30`，电话和邮箱留空并说明来自 Contacts。archived、hold、missing 行是干扰。

Contacts：`Maya Chen / +15552001827`，notes 含 `maya.chen@example.test`。Context note 指明 role=`North region lead`，current source CASE-1851，决定 approved and ready for handoff。Setup 清理目标笔记。

## 3. Evaluator 与通过标准

唯一 evaluator 检查指定 Markor 文件。最稳妥正文：

```text
CASE-1851 / FB-1851 for Maya Chen (+15552001827, maya.chen@example.test), North region lead: RT-51 at Harbor Gate 17 on 2026-07-16 09:30 is approved and ready for handoff.
```

必须包含上述九类实体及 ready/approved；禁止 CASE-OLD、CASE-HOLD、HOLD-42、Harbor Gate 17 Annex，以及 not ready/blocked/pending/on hold/wrong。不是整句绝对匹配。

