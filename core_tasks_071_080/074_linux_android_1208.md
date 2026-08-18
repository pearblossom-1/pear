# Core 074 — `linux_android_1208`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1208.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Submit the ready request in `/home/user/forms/request_rows.csv` through `/home/user/forms/request.html` in Chrome. Use the current approval code from the phone message and ignore non-ready rows.
```

### 中文翻译

在 Chrome 表单提交 CSV 的 ready request，approval code 取手机当前消息，忽略非-ready 行。

## 2. 数据与评测

CSV：`REQ-508,APP-5088,ready`；REQ-509 同 code 但 pending。短信：`Today's request approval code is APP-5088.`。表单字段是 request_code 与 approval_code，runtime 注入有效 action。

唯一 host evaluator 检查一次提交的真实字段值，必须填 `REQ-508` 和 `APP-5088`。提交 pending REQ-509、错误 code 或未提交失败。

