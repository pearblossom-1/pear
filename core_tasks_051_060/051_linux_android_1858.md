# Core 051 — `linux_android_1858`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1858.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`；拓扑 `1A+2L`
- 限制：最多 60 步，最长 480 秒

## 1. Instruction

### 英文原文（逐字）

```text
Cross-check the latest Simple SMS Messenger request against the current row in `/tmp/contacts/recipient_table.csv`. If their phone values conflict, write the case, both phone values, and the blocked reason to `/tmp/blocked/blocked_comm.md` on the second Linux desktop, and do not send a reply.
```

### 中文翻译

把最新短信请求与 recipient_table.csv 的 current 行交叉核对。若电话号码冲突，在第二台 Linux 的 blocked_comm.md 写出 case、两个号码及 blocked 原因，并且不要回复。

## 2. 输入、Setup 与评测

最新短信来自 `+15552001828`：`Latest approval CASE-1858 FB-1858 for Leo Martin at 2026-07-23 09:40.`；更早 OLD-17 要忽略。CSV current 行是 CASE-1858/FB-1858/Leo Martin，但号码为 `+15552009928`，另含 RT-58、Harbor Gate 7 等干扰行。

本任务 2 项。最稳妥报告：`CASE-1858 / FB-1858 for Leo Martin is blocked: SMS phone +15552001828 conflicts with current-row phone +15552009928; no reply was sent.`

- 报告必须包含 case、code、owner、两个号码；表达 conflicts/mismatch 与 no reply，并肯定 blocked。
- 禁止 CASE-OLD/HOLD-42 等干扰、phones match/reply sent/safe to reply。
- Android sent box 对 `+15552001828` 必须完全没有任何回复（不限时间窗口）。

