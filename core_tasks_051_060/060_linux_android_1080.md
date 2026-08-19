# Core 060 — `linux_android_1080`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 60 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1080.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步，最长 420 秒

## 0. 任务链与最终判断

这是一个“号码冲突时阻止短信”的任务：Linux 请求表中的当前号码是 `+1555011991`，但第一部手机中 exact-name 联系人 Mira Patel 的号码是 `+1555011881`。两者不同，所以不要给请求号码发 confirmation SMS；要在第二部手机写一份 blocked note，列清 case、code、owner、两个号码和号码不一致这一原因。

## 1. Instruction

### 英文原文（逐字）

```text
Before sending the confirmation SMS, compare the current row in `/tmp/contact_mismatch_blocks_sms/request_table.csv` with the exact-name Contacts entry on the first phone and follow `/tmp/contact_mismatch_blocks_sms/handoff_policy.md`. If the numbers differ, do not send to the request number; explain the case, owner, both numbers, and blocked reason in `/storage/emulated/0/Documents/Markor/1080-A_blocked.md` on the second phone.
```

### 中文翻译

发送确认短信之前，先将 `/tmp/contact_mismatch_blocks_sms/request_table.csv` 中的当前行与第一部手机 Contacts 里姓名完全匹配的联系人进行比较，并遵循 `/tmp/contact_mismatch_blocks_sms/handoff_policy.md`。如果号码不同，不要向请求表中的号码发送短信；请在第二部手机的 `/storage/emulated/0/Documents/Markor/1080-A_blocked.md` 中说明 case、owner、两个号码和被阻止的原因。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机 Contacts

Setup 清空联系人后，只添加这一位：

```text
Name: Mira Patel
Number: +1555011881
Notes: 1080-A; NX08091; Release reviewer
```

`exact-name Contacts entry` 指的就是姓名完全为 `Mira Patel` 的这条记录；联系人号码是 `+1555011881`。

### 2.2 Linux 的 `request_table.csv`

完整内容如下：

```csv
case_id,owner,phone,status,code,target,due_time,priority
1080-00,Mira Patel,+1555011881,pending,D10800,Contact mismatch SMS confirmation,2026-07-10 08:30,normal
1080-01,Jon Bell,+1555011882,pending,D10801,Contact mismatch SMS confirmation,2026-07-11 09:30,normal
1080-02,Nadia Ross,+1555011883,pending,D10802,Contact mismatch SMS confirmation,2026-07-12 10:30,normal
1080-A,Mira Patel,+1555011991,blocked,NX08091,Contact mismatch SMS confirmation,2026-07-13 11:30,high
1080-04,Elena Cruz,+1555011885,pending,D10804,Contact mismatch SMS confirmation,2026-07-14 12:30,normal
1080-05,Priya Shah,+1555011886,pending,D10805,Contact mismatch SMS confirmation,2026-07-15 13:30,normal
1080-06,Owen Park,+1555011887,pending,D10806,Contact mismatch SMS confirmation,2026-07-16 14:30,normal
1080-D,Mira Patel,+1555011888,hold,D10807,Contact mismatch SMS confirmation,2026-07-17 15:30,normal
1080-08,Mira Patel,+1555011881,pending,D10808,Contact mismatch SMS confirmation,2026-07-18 16:30,normal
1080-09,Jon Bell,+1555011882,pending,D10809,Contact mismatch SMS confirmation,2026-07-19 08:30,normal
1080-10,Nadia Ross,+1555011883,pending,D108010,Contact mismatch SMS confirmation,2026-07-20 09:30,normal
1080-11,Tao Lin,+1555011884,pending,D108011,Contact mismatch SMS confirmation,2026-07-21 10:30,normal
```

当前业务行是 `1080-A`：owner `Mira Patel`，request phone `+1555011991`，status `blocked`，approval code `NX08091`。不要因为表中另有 Mira Patel 或相似号码就改选其他行；`1080-D` 还是明确的 hold 干扰项。

### 2.3 Linux 的 `handoff_policy.md`

完整业务内容如下：

```text
# Contact mismatch SMS confirmation handoff policy

Current approved source row: 1080-A
Approval code: NX08091
Owner: Mira Patel (Release reviewer)
Required decision: Contact mismatch blocks Android SMS confirmation.
When the current request phone and exact-name contact phone differ, do not send the confirmation. Record the case, approval code, owner, both phone values, and blocked reason in the named Markor note.
Authority note: row 1080-D is on hold. Similar owner details do not supersede
the current approved request.
```

计算过程很直接：`+1555011991` 不等于 `+1555011881`，因此进入 blocked 分支，而不是发送分支。

## 3. Setup 具体流程

### `android_0`（第一部手机，联系人来源）

- 确保 Contacts 可用。
- 清空原有联系人。
- 添加上面的 Mira Patel 联系人以及 notes。

### `android_1`（第二部手机，输出位置）

- 确保 Markor 和 Simple SMS Messenger 可用。
- 清空 SMS 数据，所以测试开始时 sent box 没有历史短信。
- 删除旧的 `/storage/emulated/0/Documents/Markor/1080-A_blocked.md`。

### `linux_0`

- 创建 `/tmp/contact_mismatch_blocks_sms`。
- 删除旧的 request_table.csv 和 handoff_policy.md。
- 上传本任务的新 CSV 与 policy。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluation 单元：一个检查 blocked note，一个检查没有向请求号码发送短信。要拿满分必须两项都通过。

### 4.0 一份稳妥的 note 示例

```text
1080-A / NX08091 for Mira Patel is blocked: request number +1555011991 is different from contact number +1555011881, so do not send the confirmation SMS.
```

### 4.1 第二部手机的 Markor blocked note

- 路径必须精确是 `/storage/emulated/0/Documents/Markor/1080-A_blocked.md`。
- 全文必须包含五个实体：`1080-A`、`NX08091`、`Mira Patel`、`+1555011991`、`+1555011881`。
- 必须从差异短语组中至少命中一个：`mismatch`、`does not match`、`different`、`conflicts`。
- 必须至少有一个肯定 blocked 结果：`blocked`、`do not send`、`must not send`。
- 出现任何冲突短语都会失败：`not blocked`、`numbers match`、`phones match`、`safe to send`、`message sent`。
- 通用语义规则还会拒绝问句、不确定语气、撤销或 false 状态表达。
- 这里也没有配置 clause/近邻约束：程序在整份 note 中寻找这些实体和短语，不会要求两个号码与 `different` 一定处于同一句。推荐示例把它们写在一个自然句中，是为了让人也能清楚读懂。

这不是整篇逐字匹配。可以换句式，但五个实体、一个“不同”表达和一个“禁止发送/blocked”表达缺一不可。

### 4.2 request number 的 sent-SMS absence

第二项直接查询第二部手机原生 SMS provider 的 `sent` box：

- 目标地址固定为 `+1555011991`，即 CSV 中的 request phone。
- `any_body=true`，所以短信正文写什么都不重要；只要 sent box 中存在发往这个地址的任何短信，就失败。
- `recent_within_mins=0` 表示不限制时间窗口，不是“只查刚刚几分钟”。
- 预期值是 `missing`：找不到匹配的 sent message 才通过。
- Setup 已经清空第二部手机 SMS，因此最直接的正确操作就是完全不向这个号码发送。

## 5. 常见失败与评测边界

- 只写 “numbers differ, blocked”，但漏掉任一 case/code/owner/两个号码：note 项失败。
- 写成 “numbers match” 或 “safe to send”：即使其他词都齐，也会命中冲突短语而失败。
- note 完全正确，但仍给 `+1555011991` 发了一条测试短信：absence 项失败，正文无论是什么都一样。
- 没发短信但没创建 note：只能通过 absence 项。
- 给别的号码发短信：当前 absence evaluator 只守卫 request number `+1555011991`，不会因此项直接失败。

最后一条是实现边界，不是行动建议。Instruction 字面只明确说“不要发给 request number”，所以 evaluator 与这一禁止项一致；它并没有额外检查是否给 Contacts 号码 `+1555011881` 发过短信，也没有要求向任何号码发送。任务要求的交付物就是 blocked note 加上 request-number 的未发送状态。

## 6. Cleanup

- 第一部手机清空 Contacts。
- 第二部手机删除 blocked note，并再次清空 SMS。
- Linux 删除 CSV 与 policy，并在目录为空时删除目录。
