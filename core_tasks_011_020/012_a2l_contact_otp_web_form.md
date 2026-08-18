# Core 012 — `a2l_contact_otp_web_form`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 12 项
- 任务文件：`tasks/cross_device/real200/a2l_contact_otp_web_form.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 70 步，最长 540 秒

## 1. Instruction

### 英文原文（逐字）

```text
The latest Simple SMS Messenger message on the first phone contains a web form OTP, and the Android Contacts app on the second phone has the client details. Please open `/home/user/web/client.html` in Linux Chrome, fill in the client details and OTP, and submit it.
```

### 中文翻译

第一部手机上 Simple SMS Messenger 的最新消息包含网页表单 OTP，第二部手机的 Android Contacts 应用中保存着客户资料。请在 Linux Chrome 中打开 `/home/user/web/client.html`，填写客户资料和 OTP，然后提交。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的短信

短信箱先被清空，再收到：

| 字段 | 值 |
|---|---|
| 发件地址 | `5551002` |
| 正文 | `OTP for web form: 481269` |

需要提取的 OTP 是 `481269`。

### 2.2 第二部手机的联系人

联系人数据库先被清空，再新增：

| 字段 | 值 |
|---|---|
| 名称 | `North Pier Labs` |
| 电话 | `555-0169` |
| 备注 | `Web form client` |

### 2.3 Linux HTML 表单

- 仓库源文件：`tasks/cross_device/real200_assets/a2l_contact_otp_web_form/source/visible/5f3aa9f8_client.html`
- 注入路径：`linux_0:/home/user/web/client.html`
- 页面标题和主标题：`Client verification`
- 页面提示：使用第二部手机的客户联系人和第一部手机最新的 web-form OTP。

表单有且只有三个文本字段：

| 页面标签 | HTML 字段名 | 正确值 |
|---|---|---|
| Client name | `client_name` | `North Pier Labs` |
| Phone | `phone` | `555-0169` |
| OTP | `otp` | `481269` |

源 HTML 的 action 是运行时占位符 `__MDCBENCH_FORM_ACTION__`。

## 3. Setup 具体流程

### `android_0`

1. 确保 Simple SMS Messenger 可用。
2. 清空短信。
3. 注入上述 OTP 短信并等待 5 秒。

### `android_1`

1. 确保 Contacts 可用。
2. 清空联系人。
3. 新增 `North Pier Labs` 联系人。

### `linux_0`

1. 删除并重建 `/home/user/web`。
2. 上传 `client.html`。
3. Linux runtime 启动本次运行专属的本地表单接收器，并把 HTML 中唯一的 action 占位符替换为真实提交地址。因此必须打开 setup 后的这份文件，不能另写一个没有连接接收器的页面。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

在 Chrome 中按下面内容原样填写并点击 Submit：

```text
Client name: North Pier Labs
Phone: 555-0169
OTP: 481269
```

这不是关键词检测。三个字段会组成一个结构化对象并进行精确核对，所以电话号码写成 `5550169`、OTP 多空格、客户名少一个词都会失败。

### 4.1 表单接收与字段匹配

- `result.type`：`host_form_submission_state`
- `func`：`exact_match`
- 接收器只接受字段集合恰好为 `client_name`、`phone`、`otp` 的一次表单负载；缺字段、重复字段或多字段都无效。
- 字段值不做语义归一化，而是按提交后的字符串构造排序 JSON：

```json
{"client_name":"North Pier Labs","otp":"481269","phone":"555-0169"}
```

- evaluator 对该规范化 JSON 的摘要与任务中的预期摘要比较；上面的值已经核对为匹配值。
- 有效提交后 getter 返回 `pass`。如果之后又提交一次错误值，最新一次 POST 会撤销先前的成功状态，因此最后一次提交必须正确。
- 不检查浏览器最后停留在哪个页面，也不检查联系人或短信是否被修改；它们是信息来源。

