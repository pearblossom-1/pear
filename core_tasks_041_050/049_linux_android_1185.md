# Core 049 — `linux_android_1185`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1185.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`；拓扑 `2A+2L`
- 限制：最多 50 步；未单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Use `/tmp/meetings/attendees.xlsx` on the first Linux machine and `/tmp/meetings/reminder_policy.md` on the second to select the current attendees. Match them to Contacts on the first phone, then send each selected attendee a concise confirmation from the second phone using its Calendar meeting title and code.
```

### 中文翻译

使用第一台 Linux 的 attendees.xlsx 和第二台 Linux 的 reminder_policy.md 选择当前 attendees，与第一部手机 Contacts 匹配，再从第二部手机向每位选中人员发送包含其日历 meeting title 和 code 的简短确认。

## 2. 输入、附件与 Setup

XLSX 四列为 name/organization/meeting_code/status：Avery Stone 与 Lena Ortiz 属于 Northwind Ops、code MTG-Q3-OPS、status attend；另有 Avery Stone / Northwind Finance / MTG-Q3-FIN 干扰行。

Policy 要求使用 current rows，肯定确认 `MTG-Q3-OPS` 和 `Q3 Ops Review`，不使用 archived row。Contacts：Avery `5551201185`，Lena `5551201186`。第二部手机日历标题 `Q3 Ops Review MTG-Q3-OPS`，地点 Room 4；SMS 清空。

## 3. Evaluator 与通过标准

两项评分分别要求给两个号码各发送最近 30 分钟内的肯定短信；正文同时 contains `MTG-Q3-OPS` 与 `Q3 Ops Review`。例如：`Q3 Ops Review (MTG-Q3-OPS) is confirmed.`

不要求整句一致，也不检查短信中时间/地点。Evaluator 没有“不得给其他号码发送”的 guard；正确执行仍应只通知两位当前参会者。

