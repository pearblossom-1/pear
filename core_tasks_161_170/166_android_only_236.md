# Core 166 — android_only_236

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 166 项
- 任务文件：`tasks/cross_device/android_only/android_only_236.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：medium
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机 CSV 期待三位联系人及号码末四位。第二台手机实际情况是：

- Dock Liaison 的末四位 `0236` 正确：present；
- Gate Runner 本应为 `0237`，实际是 `0999`：phone mismatch；
- Night Medic 应为 `0238`，但联系人不存在：missing。

不要修改 Contacts。只在第二台手机 Markor 创建 `contact_audit.md`，把以上三种结果写清楚。

## 1. Instruction

### 英文原文（逐字）

~~~text
`expected_contacts.csv` on the first phone is the audit checklist. Check Contacts on the second phone and leave the roster coordinator a Markor report named `contact_audit.md` covering present, missing, and phone-mismatch entries, including expected and actual final four digits where they differ. Do not edit Contacts.
~~~

### 中文翻译

第一台手机上的 `expected_contacts.csv` 是审计清单。检查第二台手机上的 Contacts，并在 Markor 中给名册协调员留下一份名为 `contact_audit.md` 的报告，覆盖“存在”“缺失”和“电话号码不匹配”的条目；对于不匹配项，要同时写出预期和实际的末四位。不要编辑 Contacts。

## 2. 输入、附件与初始业务数据

本任务没有邮件或短信。CSV 和第二台手机 Contacts 是输入；Markor 报告是输出。

### 2.1 android_0：`expected_contacts.csv`

上传路径：

~~~text
/sdcard/Download/expected_contacts.csv
~~~

文件原文：

~~~csv
name,phone_fragment
Dock Liaison,0236
Gate Runner,0237
Night Medic,0238
~~~

`phone_fragment` 是预期号码的末四位，不是完整电话号码。

### 2.2 android_1：Contacts 实际数据

Contacts 会先清空，然后只创建：

| name | number | notes | 对照 CSV |
|---|---|---|---|
| Dock Liaison | 5550236 | primary | 末四位 0236，匹配 |
| Gate Runner | 5550999 | wrong phone | 实际 0999，预期 0237，不匹配 |

`Night Medic` 不会被创建，所以清单中的 `0238` 没有对应联系人。

### 2.3 Markor 输出初态

Setup 会删除：

~~~text
/storage/emulated/0/Documents/Markor/contact_audit.md
~~~

## 3. Setup 具体流程

### android_0

1. 确保 Android Files 可用；
2. 上传 `expected_contacts.csv` 到 Download。

### android_1

1. 确保 Contacts 可用并清空；
2. 创建 Dock Liaison 和 Gate Runner 两条联系人；
3. 不创建 Night Medic；
4. 确保 Markor 可用；
5. 删除旧的 `contact_audit.md`。

## 4. 正确输出

在 android_1 创建：

~~~text
/storage/emulated/0/Documents/Markor/contact_audit.md
~~~

Oracle 全文：

~~~text
Dock Liaison: present (0236)
Gate Runner: mismatch; expected 0237; actual 0999
Night Medic: missing
Source: expected_contacts.csv
~~~

最后的 Source 行不属于 evaluator 必填项；前三行的实体与关系是关键。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 4 个 evaluator：

1. 计分项：Markor 报告语义正确；
2. hard guard：Dock Liaison/5550236 仍存在；
3. hard guard：Gate Runner/5550999 仍存在；
4. hard guard：Night Medic/5550238 这一身份组合仍缺失。

后三项设置了 `enable_score_calc=false`，但仍必须通过；它们用于落实“不要编辑 Contacts”。

### 5.1 报告路径

Getter 直接读取精确路径 `/storage/emulated/0/Documents/Markor/contact_audit.md`。另存成其他文件名不会通过。metadata 中“只按内容搜索”的文字与当前精确路径 getter 不一致，应以 evaluator 实现为准。

### 5.2 六个实体都必须只出现一次

`unique_entities=true` 要求：

- `Dock Liaison`；
- `0236`；
- `Gate Runner`；
- `0237`；
- `0999`；
- `Night Medic`

每个顶层实体组在全文恰好匹配一次。推荐只写末四位，不要又附完整号码并重复末四位。

`reject_unlisted_entity_pattern=(?<!\d)\d{4}(?!\d)` 还会提取所有独立的四位数字；除 `0236`、`0237`、`0999` 外再写 `0238`、年份或其他四位编号，都会失败。特别注意：虽然 CSV 中有 `0238`，evaluator 的报告实体列表没有要求它，Night Medic 行只需写 missing。

### 5.3 五组关系必须成立

每一组都要在一个 clause 内成立，并且默认只能匹配一个 clause：

1. `Dock Liaison` + `0236` + `present`/`found`；
2. `Gate Runner` + `mismatch`/`does not match` 等；
3. `0237` + `expected`；
4. `0999` + `actual`；
5. `Night Medic` + `missing`/`absent`/`not found`。

Gate Runner 的后三组可以都在同一行：

~~~text
Gate Runner: mismatch; expected 0237; actual 0999
~~~

因为分号会切成多个 clause，所以 `Gate Runner` 只在第一段；但 `0237 expected` 和 `0999 actual` 各自仍形成独立组。Oracle 已验证这种格式可通过。

### 5.4 全局正向词和冲突词

全文还必须至少覆盖以下每类词：

- present/found；
- mismatch/does not match/wrong actual number；
- expected；
- actual；
- missing/absent/not found。

不得出现 `pending`、`uncertain`、`cancelled`、`withdrawn`、`all match`、`no mismatch`。`wrong` 被列为允许的 reversal term，因此短语 `wrong actual number` 可以合法表达 mismatch。

问句、明显不确定、否定正确结论或后文撤销结论也会失败。

### 5.5 Contacts hard guard 的真实范围

Guard 检查标准化姓名和清理格式后的电话号码：

- 至少有一个 Dock Liaison + 5550236 匹配记录；
- 至少有一个 Gate Runner + 5550999 匹配记录；
- 找不到 Night Medic + 5550238 匹配记录。

它们没有设置 `require_exactly_one`、`require_unique_name` 或精确 Contacts 全集，所以并不证明整个联系人数据库逐字不变。例如单纯存在一个“Night Medic + 其他号码”并不会命中被要求缺失的 `Night Medic + 5550238` 组合。Instruction 明确禁止编辑 Contacts，正确操作仍是什么都不要改。

### 5.6 当前 evaluator 没有检查什么

- 不检查 CSV 最终是否仍存在；
- 不要求 Source 行；
- 不要求报告逐字等于 oracle；
- 不检查联系人 notes 字段；
- 不要求报告包含完整七位号码。

## 6. 常见失败与真实评测边界

- 在 Night Medic 行写 `expected 0238, missing`：业务上合理，但 `0238` 是 evaluator 未允许的四位实体，会失败。
- 把 `0237` 和 `0999` 写成没有 expected/actual 标签的数字列表：关系组失败。
- 为了“修复”审计结果而改掉 Gate Runner 号码：Contacts guard 失败。
- 创建 Night Medic 5550238：missing guard 失败。
- 重复姓名作为 Markdown 标题和正文：`unique_entities` 失败。

## 7. Cleanup

- android_0 删除 `expected_contacts.csv`；
- android_1 清空 Contacts；
- android_1 删除 `contact_audit.md`。
