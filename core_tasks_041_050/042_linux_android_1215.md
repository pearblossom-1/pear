# Core 042 — `linux_android_1215`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1215.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`；拓扑 `2A+1L`
- 限制：最多 50 步；未单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Check `/tmp/portal/request.html` for the requester's required ID. If it is missing, write a clear blocked note at `/storage/emulated/0/Documents/Markor/Portal Request Blocked.md` on the first phone and send the requester a concise blocked-status text from the second phone.
```

### 中文翻译

检查 `/tmp/portal/request.html` 中 requester 的 required ID。如果缺失，在第一部手机指定路径创建清楚的 blocked note，并从第二部手机向 requester 发送简短 blocked-status 短信。

## 2. 输入、附件与 Setup

HTML 完整内容：

```html
<html><body><div>requester=5551201215</div><div>required_id=</div><div>decoy_id=REQ-COMPLETE</div></body></html>
```

`required_id` 为空；`REQ-COMPLETE` 只是 decoy_id，不能当 required ID。Linux 上传该 HTML；第一部手机删除旧 Markor 输出；第二部手机 SMS 清空。

## 3. Evaluator 与通过标准

本任务 2 项评分。笔记可写：`The required ID is missing, so the portal request is blocked.`；向 `5551201215` 可发同义短信。

- Markor 路径必须精确；正文要出现 required ID、missing/not present/absent，以及 blocked/cannot proceed/cannot be processed。
- 短信检查最近 30 分钟的 sent message；要把 required/requester ID 与 missing/unavailable 及 blocked/cannot proceed 等肯定关联起来。
- 写 `ID present`、submitted、processed、approved、ready 会失败。
- 两项都不是全文绝对匹配，但疑问、冲突或否定 blocked 语义不能通过。

