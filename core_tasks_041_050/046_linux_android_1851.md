# Core 046 — `linux_android_1851`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 46 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1851.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 60 步，最长 480 秒

## 0. 任务链与信息拼接

Linux current row 给出 case/code/owner/route/site/time，但把 phone/email 留空；Android Contacts 补 phone/email；Android Markor context 补 role 与 readiness decision。最终必须把三处来源拼成同一份 `handoff_note.md`，不能从 CSV 的 missing 干扰行偷取“看似完整”的联系信息而忽略 current-row 规则。

## 1. Instruction

### 英文原文（逐字）

```text
Please prepare the phone handoff for the current approved case. Reconcile `/tmp/thunderbird_message_and_cont/source.csv` on Linux with the matching Contacts entry and the visible Markor context note, then write `/storage/emulated/0/Documents/Markor/handoff_note.md`. Keep the case and approval code, owner and contact details, route, site, time, role, and readiness decision together in the note.
```

### 中文翻译

请为当前 approved case 准备手机 handoff。把 Linux `/tmp/thunderbird_message_and_cont/source.csv` 与匹配的 Contacts 记录和可见 Markor context note 对齐，然后写入 `/storage/emulated/0/Documents/Markor/handoff_note.md`。在笔记中把 case 与 approval code、owner 与联系方式、route、site、time、role 和 readiness decision 放在一起。

## 2. 输入、附件与初始业务数据

### 2.1 Linux source.csv 全文

```csv
case,status,code,owner,phone,email,route,site,time,filename,include,notes
CASE-1851,current,FB-1851,Maya Chen,,,RT-51,Harbor Gate 17,2026-07-16 09:30,rt-51_photo_a.jpg,yes,approved source row; contact details are in Android Contacts
CASE-OLD,archived,OLD-17,Archived Owner,+15550000000,old@example.test,RT-00,Old Yard,2026-06-01 08:00,old_photo.jpg,no,inactive archive
CASE-HOLD,hold,HOLD-42,Hold Owner,+15550009999,,RT-51,Harbor Gate 17 Annex,2026-07-16 09:30,rt-51_hold.jpg,no,similar-name hold
CASE-1851,missing,FB-1851,Maya Chen,+15552001827,maya.chen@example.test,RT-51,Harbor Gate 17,2026-07-16 09:30,rt-51_photo_missing.jpg,required_missing,visible gap row
```

应选择第一行：status=`current`、include=`yes`。第四行虽有 phone/email，但 status=`missing`、include=`required_missing`，不是 current approval。

### 2.2 Android Contacts

| 字段 | 值 |
|---|---|
| Name | `Maya Chen` |
| Number | `+15552001827` |
| Notes | `maya.chen@example.test; current handoff contact` |

邮箱存放在 notes，而不是独立 email 字段。

### 2.3 Android Markor context 原文

路径：`/storage/emulated/0/Documents/Markor/contact_handoff_context.md`

```markdown
# Thunderbird message and Contacts create Markor handoff

Current source: CASE-1851
Role: North region lead
Readiness decision: approved and ready for handoff.
Decision rule: use the current CSV row and matching Contacts entry; archived
and hold rows are not current approvals.
```

### 2.4 唯一输出

`/storage/emulated/0/Documents/Markor/handoff_note.md` 在 setup 时被删除；没有 Linux 输出，也不需要真的创建 Thunderbird 消息，任务名中的 thunderbird 只是 source 目录命名。

## 3. Setup 具体流程

### `android_0`

确保 Contacts 可用并清空，然后添加 Maya；确保 Markor 可用，删除旧 handoff note，再上传完整 context note。

### `linux_0`

创建 `/tmp/thunderbird_message_and_cont`，上传 `source.csv`。Setup 没有先删除同名 source，但 upload 会把任务输入写到精确路径；cleanup 会定向移除。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 `android_entity_relation_note` evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

最稳妥正文：

```text
CASE-1851 / FB-1851 for Maya Chen (+15552001827, maya.chen@example.test), North region lead: RT-51 at Harbor Gate 17 on 2026-07-16 09:30 is approved and ready for handoff.
```

### 4.1 必需实体

以下九组全部必须出现：

1. `CASE-1851`
2. `FB-1851`
3. `Maya Chen`
4. `+15552001827`
5. `maya.chen@example.test`
6. `RT-51`
7. `Harbor Gate 17`
8. 时间三种别名之一：`2026-07-16 09:30`、`July 16, 2026 at 9:30 AM`、`7/16/2026 9:30 AM`
9. `North region lead`

还必须至少命中 ready、approved、ready for handoff 中一个肯定结论。

### 4.2 禁止与冲突

- 禁止实体：`CASE-OLD`、`CASE-HOLD`、`HOLD-42`、`Harbor Gate 17 Annex`。
- 冲突短语：not ready、blocked、pending、on hold、wrong。
- 通用关系规则拒绝问句、不确定、否定、false assignment 和后续撤销。
- 比较做文本规范化，不是全文绝对匹配。

## 5. 评测覆盖边界

Instruction 说把信息“together”放在笔记中，但当前规则只有全局 entities + positive phrase，没有 `same_clause`、`relation_groups` 或最大行数合同。因此把实体分散到多行仍可能通过；示例单句更符合真实任务意图。

Evaluator 不要求提到 filename、include、source.csv 文件名，也不检查 context note/Contacts 是否被修改。它也不验证 phone/email 是否来自同一联系人记录；最终笔记中的九类文字才是计分面。

## 6. Cleanup

清理会清空 Contacts，删除 context note 与 handoff note，并删除 Linux source.csv 和空目录。
