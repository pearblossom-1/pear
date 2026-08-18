# Core 029 — `al_sms_web_download_statement`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 29 项
- 任务文件：`tasks/cross_device/real300/al_sms_web_download_statement.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步，最长 300 秒

## 1. Instruction

### 英文原文（逐字）

```text
The latest Android Simple SMS Messenger message contains the statement download code. Please enter the code in `/home/user/download/portal.html` in Linux Chrome and download the statement, saving it to `/home/user/download/statement.pdf` for later reconciliation.
```

### 中文翻译

Android Simple SMS Messenger 的最新消息包含账单下载代码。请在 Linux Chrome 的 `/home/user/download/portal.html` 中输入该代码并下载账单，把它保存为 `/home/user/download/statement.pdf`，供后续对账使用。

## 2. 输入、附件与初始业务数据

### 2.1 Android 短信

| 字段 | 值 |
|---|---|
| 地址 | `5550102` |
| 正文 | `Statement download code: 4829` |

### 2.2 Linux 下载门户

- 源文件：`tasks/cross_device/real300_assets/al_sms_web_download_statement/source/download_portal.html`
- 注入路径：`/home/user/download/portal.html`
- 页面标题：`Statement Download Portal`
- 唯一输入字段：`download_code`
- 页面说明：有效提交后会提供 statement 下载链接。

### 2.3 服务器提供的 PDF

- 源文件：`tasks/cross_device/real300_assets/al_sms_web_download_statement/source/statement_source.pdf`
- 单页 PDF，可见文本只有：

```text
Statement ST-4829 - code 4829 - approved for reconciliation
```

- SHA-256：`9f9b617de4e2a7390790449eff25d6eabfd7ae6b77d6572e3303a6787774f74e`
- 下载目标名：`statement.pdf`

## 3. Setup 具体流程

### `android_0`

清空短信后注入下载代码短信。

### `linux_0`

1. 删除并重建 `/home/user/download`。
2. 上传门户为 `portal.html`。
3. runtime 启动本次运行专属表单/下载服务，把表单 action 占位符改为有效 POST 地址，并加载固定 PDF 作为下载内容。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，各占 `1/2`。

### 4.0 先说人话：怎样才算通过

在门户中输入 `4829` 并提交。成功页面出现下载链接后，还必须实际点击该链接；只看到“Submission received”还不够。最后把下载到的原始 PDF 保存或移动到：

```text
/home/user/download/statement.pdf
```

### 4.1 表单和下载请求状态（权重 `1/2`）

- 表单字段集合必须恰好为 `download_code`，值必须精确为字符串 `4829`。
- 规范提交对象为 `{"download_code":"4829"}`。
- 成功 POST 之后，接收器会显示下载链接；`require_download_get=true` 要求浏览器对该链接实际发起一次 GET。
- 未点击下载链接时，即使代码提交正确，getter 仍返回 `fail`。
- 新的错误 POST 会撤销此前有效提交及下载状态。

### 4.2 本地 PDF 文件（权重 `1/2`）

- 精确路径 `/home/user/download/statement.pdf` 必须存在且非空。
- 前五个字节必须是 `%PDF-`。
- 文件 SHA-256 必须与服务器源 PDF完全相同；打印成 PDF、另存为重编码版本或创建同名文本都会失败。
- `pdftotext` 必须可成功读取，并分别包含：
  - `Statement ST-4829`
  - `code 4829`
  - `approved for reconciliation`
- 浏览器默认下载到别处不会自动通过；最终文件必须位于任务指定路径。

