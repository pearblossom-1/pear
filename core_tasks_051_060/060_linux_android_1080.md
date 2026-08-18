# Core 060 — `linux_android_1080`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1080.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`；拓扑 `2A+1L`
- 限制：最多 50 步，最长 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
Before sending the confirmation SMS, compare the current row in `/tmp/contact_mismatch_blocks_sms/request_table.csv` with the exact-name Contacts entry on the first phone and follow `/tmp/contact_mismatch_blocks_sms/handoff_policy.md`. If the numbers differ, do not send to the request number; explain the case, owner, both numbers, and blocked reason in `/storage/emulated/0/Documents/Markor/1080-A_blocked.md` on the second phone.
```

### 中文翻译

发 confirmation SMS 前，比较 request table current 行与第一部手机 exact-name 联系人，并遵循 policy。号码不同时不要给 request number 发信，在第二部手机指定笔记解释 case、owner、两个号码及 blocked 原因。

## 2. 输入、Setup 与评测

CSV current 行：1080-A/NX08091/Mira Patel/request phone `+1555011991`/blocked。Contacts 精确名 Mira Patel 的号码是 `+1555011881`。Policy 明确 mismatch blocks SMS。

本任务 2 项。笔记可写：`1080-A / NX08091 for Mira Patel is blocked: request number +1555011991 conflicts with contact number +1555011881; do not send.` 必须含全部实体、mismatch 与 blocked/do not send；numbers match/safe/message sent 失败。另一项要求第二部手机对 request number `+1555011991` 完全没有 sent SMS。Evaluator 没有单独 guard 联系人号码，但 instruction 的正确动作是两个号码都不要发送。

