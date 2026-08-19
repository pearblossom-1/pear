# Core 049 — `linux_android_1185`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 49 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1185.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与选择逻辑

第一台 Linux workbook 给出候选 attendee rows，第二台 Linux policy 要求选择 current meeting 的 rows；第二部手机 Calendar 提供 current title/code，第一部手机 Contacts 把选中姓名映射到号码。最终从第二部手机分别给 Avery 和 Lena 发确认。

这里存在一个真实输入不一致：policy 说“Do not use the archived attendee row”，但 workbook 三行的 `status` 都是 `attend`，没有任何一行标为 archived。实际只能通过与 Calendar code `MTG-Q3-OPS` 对齐来排除 `MTG-Q3-FIN` 行，不能声称 workbook 自己明确标出了 archived。

## 1. Instruction

### 英文原文（逐字）

```text
Use `/tmp/meetings/attendees.xlsx` on the first Linux machine and `/tmp/meetings/reminder_policy.md` on the second to select the current attendees. Match them to Contacts on the first phone, then send each selected attendee a concise confirmation from the second phone using its Calendar meeting title and code.
```

### 中文翻译

使用第一台 Linux 的 `/tmp/meetings/attendees.xlsx` 和第二台 Linux 的 `/tmp/meetings/reminder_policy.md` 选择 current attendees。将他们与第一部手机中的 Contacts 匹配，然后从第二部手机向每位选中的 attendee 发送一条简短确认，内容使用第二部手机 Calendar 中的 meeting title 和 code。

## 2. 输入、附件与初始业务数据

### 2.1 第一台 Linux：attendees.xlsx

- 有效 XLSX，唯一工作表名 `Sheet1`
- 四列和全部三行：

| name | organization | meeting_code | status |
|---|---|---|---|
| Avery Stone | Northwind Ops | `MTG-Q3-OPS` | attend |
| Lena Ortiz | Northwind Ops | `MTG-Q3-OPS` | attend |
| Avery Stone | Northwind Finance | `MTG-Q3-FIN` | attend |

第三行与 Avery 同名但 organization/code 不同，是干扰行；其 status 实际也是 attend。

### 2.2 第二台 Linux：reminder_policy.md 原文

```markdown
# Meeting reminder policy

Use the current attendee rows from the workbook. Send each listed attendee one concise reminder that positively confirms meeting code `MTG-Q3-OPS` and title `Q3 Ops Review`. Do not use the archived attendee row.
```

### 2.3 第一部手机：Contacts

| Name | Number | Notes |
|---|---|---|
| Avery Stone | `5551201185` | `Northwind Ops primary attendee` |
| Lena Ortiz | `5551201186` | `Northwind Ops attendee` |

### 2.4 第二部手机：Calendar 与 SMS

| 字段 | 值 |
|---|---|
| Title | `Q3 Ops Review MTG-Q3-OPS` |
| Start / End | 时间戳 `1783659600`–`1783663200` |
| Location | `Room 4` |
| Description | `Meeting code MTG-Q3-OPS` |

SMS 在 setup 时清空；任务不要求把时间或地点写入确认。

## 3. Setup 具体流程

### `linux_0`

删除旧 attendees.xlsx，创建 `/tmp/meetings`，上传 workbook。

### `linux_1`

删除旧 policy，创建同名目录，上传 Markdown。

### `android_0`

确保 Contacts 可用，清空并新增 Avery 与 Lena。

### `android_1`

确保 Simple Calendar Pro 可用，清空日历并添加唯一 meeting；确保 Simple SMS Messenger 可用并清空 SMS。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，各对应一个 attendee，通常各占 `1/2`。

### 4.0 先说人话：怎样才算通过

分别发送：

```text
To 5551201185: Q3 Ops Review (MTG-Q3-OPS) is confirmed.
To 5551201186: Q3 Ops Review (MTG-Q3-OPS) is confirmed.
```

### 4.1 Avery SMS（权重 `1/2`）

- `android_1` sent box，地址 `5551201185`。
- 最近 30 分钟内至少一条正文同时含 `MTG-Q3-OPS` 与 `Q3 Ops Review`。
- `require_positive_relation=true`，最终必须是肯定确认；问句、不确定、否定、取消或反转失败。

### 4.2 Lena SMS（权重 `1/2`）

逻辑完全相同，地址改为 `5551201186`。

正文不是全文绝对匹配，不要求两个人收到逐字相同的文本，也不要求出现姓名、organization、time、location。

## 5. 评测覆盖边界与来源缺口

- 两个 getter 都是“至少一条合格短信”，没有 exact-count；重复给同一人发两条不会自动失败。
- 没有禁止向其他号码发送短信的 guard，也没有针对 `MTG-Q3-FIN` 的负向正文检查。只要两条目标确认存在，额外误发可能不影响分数，但不符合 instruction。
- Evaluator 不读取 XLSX、policy、Contacts 或 Calendar 的最终状态；它们是做出号码和正文决定的输入。
- Policy 所说 archived row 在 workbook 中没有对应 status 标记。当前任务仍可借 Calendar code 推断 OPS 两行，但 source schema 与文字 policy 不一致，后续修复应把第三行明确标成 archived，或改写 policy 为“select rows matching current meeting code”。

## 6. Cleanup

清理会删除两台 Linux 的附件、清空第一部手机 Contacts，并清空第二部手机 Calendar 与 SMS。
