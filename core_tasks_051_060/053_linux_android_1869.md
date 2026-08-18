# Core 053 — `linux_android_1869`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1869.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`；拓扑 `2A+2L`
- 限制：最多 70 步，最长 600 秒

## 1. Instruction

### 英文原文（逐字）

```text
The current support case needs to be escalated to its assigned lead. Use the support SMS on the first phone, the matching lead contact on the second phone, and `/tmp/support/kb.xlsx` on the first Linux desktop to prepare the message. In Thunderbird on the second Linux desktop, leave the lead an unsent draft that brings together the current case and approval, priority, lead role, route, site, and scheduled time.
```

### 中文翻译

当前 support case 要升级给 assigned lead。使用第一部手机的 SMS、第二部手机匹配 lead contact 和第一台 Linux 的 kb.xlsx 准备消息；在第二台 Linux Thunderbird 留一封未发送草稿，汇总 case/code、priority、lead role、route/site/time。

## 2. 输入、Setup 与评测

最新短信：CASE-1869 / FB-1869 / priority P1 / 2026-07-14 09:30。Contact：Maya Chen，邮箱 `maya.chen@example.test`，role Escalation lead。XLSX current 行补充 RT-69、Harbor Gate 18；其余 archived/hold/missing 行是干扰。Thunderbird profile 重建，Drafts/Sent 为空。

本任务 2 项。草稿 To 必须只含 Maya 邮箱；正文可写：`Escalation lead handoff: CASE-1869 / FB-1869 is P1 for RT-69, Harbor Gate 18, scheduled 2026-07-14 09:30.`

- 同一草稿必须含所有事实组；额外收件人不允许；主题/附件不查。
- cancelled/not an escalation/wrong route/do not send 等冲突会失败。
- Sent 文件夹必须保持精确为空，不能发送。

