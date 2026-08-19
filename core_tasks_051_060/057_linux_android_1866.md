# Core 057 — `linux_android_1866`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 57 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1866.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 70 步，最长 600 秒

## 0. 任务链与字段来源

Calendar 给 case/time/location/route，Contacts 给 attendee 三项联系方式和 role，Linux matrix 给 approval/status，ODT template 给 labeled layout。第二台 Linux 输出一份完整 packet.odt。

## 1. Instruction

### 英文原文（逐字）

```text
Create `/tmp/attendees/packet.odt` on the second Linux desktop using the Simple Calendar Pro event, the matching Android contact, and the Linux files `/tmp/attendees/attendee_matrix.csv` and `/tmp/agenda/agenda_template.odt`. Complete every visible template field, including the attendee role, while preserving the labeled layout.
```

### 中文翻译

使用 Simple Calendar Pro 事件、匹配的 Android 联系人，以及 Linux 文件 `/tmp/attendees/attendee_matrix.csv` 和 `/tmp/agenda/agenda_template.odt`，在第二台 Linux 创建 `/tmp/attendees/packet.odt`。填写模板中的每一个可见字段，包括 attendee role，同时保留带标签的布局。

## 2. 输入、附件与初始业务数据

### 第一部手机 Calendar

```text
Title: CASE-1866 source event
Start: 2026-07-11 09:00 (1783760400)
End:   2026-07-11 09:45 (1783763100)
Location: Harbor Gate 15
Description: RT-66 current event
```

### 第二部手机 Contact

```text
Nora Alvarez / +15552001830
Notes: nora.alvarez@example.test; Release coordinator
```

### 第一台 Linux attendee_matrix.csv

ready 行：

```csv
CASE-1866,ready,FB-1866,,,,,,,rt-66_photo_a.jpg,yes,approval and readiness row; attendee and event details are on the phones
```

另有 CASE-OLD archived、CASE-HOLD/HOLD-42 近名 `Harbor Gate 15 Annex`、以及 CASE-1866 missing/required_missing 干扰行。

### ODT 模板全部九段

```text
Calendar Attendee Packet
Case: [[CASE]] / [[APPROVAL]]
Attendee: [[NAME]] / [[PHONE]] / [[EMAIL]]
Role: [[ROLE]]
Event: [[TIME]] / [[LOCATION]] / [[ROUTE]]
Status: [[STATUS]]
Notes: complete from Calendar, Contacts, and attendee matrix
Review: confirm all sections before handoff
Handoff: second Linux desktop
```

## 3. Setup 具体流程

- `android_0`：清空 Calendar 后写入唯一 source event。
- `android_1`：清空 Contacts 后写入 Nora。
- `linux_0`：创建 `/tmp/agenda` 与 `/tmp/attendees`，上传 matrix 和 template。
- `linux_1`：创建 `/tmp/attendees`，删除旧 packet；模板不自动复制。

## 4. Evaluator：评测方式与具体评测点

唯一 `check_odf_text` evaluator，权重 100%。

### 4.0 推荐完整内容

```text
Calendar Attendee Packet
Case: CASE-1866 / FB-1866
Attendee: Nora Alvarez / +15552001830 / nora.alvarez@example.test
Role: Release coordinator
Event: 2026-07-11 09:00 / Harbor Gate 15 / RT-66
Status: ready
Notes: complete from Calendar, Contacts, and attendee matrix
Review: confirm all sections before handoff
Handoff: second Linux desktop
```

### 4.1 文件与全文合同

- 必须是有效 ODF text 包，含 styles.xml、meta.xml，至少 9 个段落。
- 必须包含标题及十项业务锚点；所有 placeholder 与 PLACEHOLDER 禁止残留。
- 禁止 CASE-OLD、HOLD-42、rt-66_hold.jpg。

### 4.2 五组同段关系

1. Case + CASE-1866 + FB-1866
2. Attendee + Nora Alvarez + phone + email
3. Role + Release coordinator
4. Event + 时间别名之一 + Harbor Gate 15 + RT-66
5. Status + ready

时间允许 ISO、`July 11, 2026 at 9:00 AM` 或 `7/11/2026 9:00 AM`。比较不区分大小写，且关系必须是肯定表达。

## 5. 常见失败与边界

- 漏填 role：全文 include 与 Role 关系均失败。
- 联系人字段拆到不同段落：Attendee 同段关系失败。
- 用 missing 干扰行虽然值相似，但 `rt-66_hold.jpg`/HOLD-42 被禁止，Status 也应为 ready。
- 额外增加无冲突段落可能仍通过，因为是 min_paragraphs，不是 exact structure；页面几何和字体不检查。

Evaluator 不要求把 ODT 字节与模板一致，也没硬性要求 Notes/Review/Handoff 三段原文完全保留；但按模板保留最符合 instruction。

## 6. Cleanup

清理会清空 Calendar/Contacts，并删除两台 Linux 的 template、matrix、packet 和空目录。
