# Core 067 — `linux_android_1307`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1307.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Use the latest code in the phone's message thread to submit the verification form at `/home/user/form/submit.html` in Chrome. Ignore the older code in the same thread.
```

### 中文翻译

使用手机消息线程中的最新 code，在 Chrome 提交指定 verification form；忽略旧 code。

## 2. 数据与评测

先收到 `CODE-OLD`，后收到 `Latest form code CODE-1307.`。HTML 只有一个 required 字段 `code`，运行时 action 会接到 host evaluator。

唯一 evaluator 检查一次成功 POST 的字段内容摘要；实际应填 `CODE-1307` 后提交。填旧 code、漏字段、多次/错误提交均不会得到 pass。它不通过关键词读取浏览器画面，而检查接收器记录的提交值。

