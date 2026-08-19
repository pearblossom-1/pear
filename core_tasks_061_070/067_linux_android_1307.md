# Core 067 — `linux_android_1307`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 67 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1307.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与最终要做的事

手机同一短信线程先出现旧 code，后出现最新 code。要取后收到的 `CODE-1307`，在 Linux Chrome 打开本地 HTML，把它填入唯一输入框并按 Verify。最终评分看 host-side form receiver 是否收到准确字段，不看浏览器画面上的关键词。

## 1. Instruction

### 英文原文（逐字）

```text
Use the latest code in the phone's message thread to submit the verification form at `/home/user/form/submit.html` in Chrome. Ignore the older code in the same thread.
```

### 中文翻译

使用手机短信线程中的最新 code，在 Chrome 中提交 `/home/user/form/submit.html` 的 verification form。忽略同一线程中较早的 code。

## 2. 输入、附件与初始业务数据

### 2.1 手机 SMS 线程

发送者均为 `5551201307`，按 setup 顺序收到：

```text
Old code CODE-OLD.
```

随后收到：

```text
Latest form code CODE-1307.
```

所以应该提交 `CODE-1307`，不是 `CODE-OLD`。

### 2.2 Linux 表单 `submit.html`

完整 HTML：

```html
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Current verification</title></head>
<body><main><h1>Current verification</h1><form method="post" action="__MDCBENCH_FORM_ACTION__"><label>Latest code <input name="code" required autocomplete="off"></label><button type="submit">Verify</button></form></main></body></html>
```

表单只有一个 required text field，字段名是 `code`；按钮文本是 Verify。

## 3. Setup 具体流程

### `linux_0`

- 创建 `/home/user/form`，删除旧 submit.html。
- 上传上述 HTML。
- 因为 evaluator 类型是 `host_form_submission_state`，Linux runtime 还会为本次 run 启动一个临时 host receiver，并把 HTML 中唯一的 `__MDCBENCH_FORM_ACTION__` 替换成本次 run 专属的 HTTP POST URL。
- 因此执行时打开的不是一个“提交无效的静态页面”；其 action 已被动态接好。

### `android_0`

- 确保 Simple SMS Messenger 可用。
- 清空 SMS。
- 先注入旧 code 短信，等待 5 秒，再注入最新 code 短信，保证消息顺序可见。

## 4. Evaluator：评测方式与具体评测点

本题只有 1 个 host form state evaluator。

### 4.1 实际要提交的字段

```text
Field name: code
Field value: CODE-1307
```

Receiver 会把收到的文字字段整理成下面的规范 JSON：

```json
{"code":"CODE-1307"}
```

任务中的 expected SHA-256 确实对应这一精确 JSON，因此不是泛化的关键词检查。

### 4.2 什么才算通过

- 必须向本次 run 动态生成的 action URL 发起 POST。
- 文字字段集合必须精确只有 `code`；缺字段或额外字段都无效。
- 值必须精确是 `CODE-1307`。本题没有 field normalization rule，所以大小写、前后空格都不是允许的别名。
- 不需要上传文件，也没有下载步骤。
- Receiver 当前状态必须是“最后一次收到的提交有效”。

### 4.3 多次提交的实际行为

本任务没有配置 `submission_attempt_contract`，所以并不要求“恰好只提交一次”：

- 先错填 CODE-OLD，随后改成 CODE-1307 再提交，最终状态可以通过。
- 先正确提交，随后又提交错误值，后一请求会覆盖状态，最终失败。

## 5. 常见失败与评测边界

- 按短信列表第一条填 CODE-OLD：receiver 内容不匹配，失败。
- 填 `code-1307`、`CODE-1307.` 或带首尾空格：精确字段值不符。
- 只在输入框中填写但不点 Verify：没有 POST，失败。
- 直接打开源仓库里的 HTML，而不是 setup 后 `/home/user/form/submit.html`：源文件 action 仍是 placeholder，无法向本次 receiver 提交。

Evaluator 只证明 host receiver 收到了正确 POST，不验证用户一定通过 Chrome UI 完成；用其他方式发送相同 POST 也可能满足技术状态，但不符合 instruction。它也不读取浏览器成功页面文本作为答案。

## 6. Cleanup

- Linux 删除 submit.html，并尝试移除空的 `/home/user/form`。
- 手机清空 SMS。
- Run 结束时 runtime 停止本次专属 form receiver。
