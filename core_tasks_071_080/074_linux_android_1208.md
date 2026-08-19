# Core 074 — `linux_android_1208`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 74 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1208.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与最终选择

Linux CSV 有两条使用同一 approval code 的 request，但只有 REQ-508 是 ready；手机短信确认 current approval code 为 APP-5088。要在 Chrome 表单中提交这两个精确值：REQ-508 + APP-5088。

## 1. Instruction

### 英文原文（逐字）

```text
Submit the ready request in `/home/user/forms/request_rows.csv` through `/home/user/forms/request.html` in Chrome. Use the current approval code from the phone message and ignore non-ready rows.
```

### 中文翻译

通过 Chrome 中的 `/home/user/forms/request.html`，提交 `/home/user/forms/request_rows.csv` 里的 ready request。Approval code 使用手机短信中的当前 code，忽略非 ready 行。

## 2. 输入、附件与初始业务数据

### 2.1 Linux `request_rows.csv`

```csv
request_code,approval_code,status
REQ-508,APP-5088,ready
REQ-509,APP-5088,pending
```

两行 approval_code 相同，不能仅凭 code 决定 request；还要查看 status，选择 REQ-508。

### 2.2 手机 SMS

来自 `5551201208`：

```text
Today's request approval code is APP-5088.
```

### 2.3 Linux `request.html`

```html
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Ready request approval</title></head><body><main><h1>Ready request approval</h1><form method="post" action="__MDCBENCH_FORM_ACTION__"><label>Request code <input name="request_code" required></label><label>Approval code <input name="approval_code" required></label><button type="submit">Submit approval</button></form></main></body></html>
```

它有两个 required text field：`request_code` 与 `approval_code`。

## 3. Setup 具体流程

### `linux_0`

- 创建 `/home/user/forms`，删除旧 HTML/CSV。
- 上传 request.html 和 request_rows.csv。
- Runtime 因 host-form evaluator 启动本次 run 专属 receiver，并把 HTML 中唯一的 `__MDCBENCH_FORM_ACTION__` 替换为真实 POST URL。

### `android_0`

- 确保 Simple SMS Messenger 可用并清空 SMS。
- 注入 APP-5088 短信。

## 4. Evaluator：评测方式与具体评测点

本题只有 1 个 `host_form_submission_state` evaluator。

### 4.1 目标提交

```text
request_code  = REQ-508
approval_code = APP-5088
```

Receiver 规范化字段 key 顺序后比较的对象是：

```json
{"approval_code":"APP-5088","request_code":"REQ-508"}
```

Task JSON 中的 expected SHA-256 已核实正好对应这个精确对象。

### 4.2 通过条件

- 必须向本次 run 的 receiver 发出 POST；只填不提交不算。
- 字段集合必须精确为 request_code 与 approval_code；多、少字段都失败。
- 两个值没有 alias/normalization，大小写与空格都必须精确。
- 不需要文件上传或后续下载。
- 没有 submission-attempt count 限制；最终 receiver 状态取决于最后一次提交是否有效。

因此先误交 REQ-509、再正确交 REQ-508 可以最终通过；正确提交后又发错误请求，则最终失败。

## 5. 常见失败与评测边界

- 选择 pending 的 REQ-509：内容摘要不匹配。
- 使用正确 request 但把 approval 写 APP-508：失败。
- 打开仓库源 HTML 而非 setup 后路径：action 还是 placeholder，不能提交到本次 receiver。
- 只在页面看到输入值却未点击 Submit approval：receiver 没有有效状态。

Evaluator 评分 host-side 字段，不直接检查 CSV 行状态、短信来源或 Chrome UI；这些 source 共同决定 expected fields。以其他客户端发出相同 POST 可能满足技术状态，但不符合 instruction 指定的 Chrome 操作。

## 6. Cleanup

- Linux 删除 request.html 与 request_rows.csv，并尝试移除 forms 目录。
- 手机清空 SMS。
- Run 结束时关闭临时 receiver。
