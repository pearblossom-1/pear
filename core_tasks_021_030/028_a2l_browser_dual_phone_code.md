# Core 028 — `a2l_browser_dual_phone_code`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 28 项
- 任务文件：`tasks/cross_device/real300/a2l_browser_dual_phone_code.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步，最长 300 秒

## 0. 任务链与设备分工

两个字段来自两部不同手机：`account_id` 只能从第二部手机的 Markor 笔记读取，`code` 来自第一部手机短信。Linux 页面只是收集和提交这两个值；页面源代码不是另一个业务数据来源。

## 1. Instruction

### 英文原文（逐字）

```text
The first phone's Simple SMS Messenger received a one-time code, and the second phone's Markor note `Account note` has the account id. Please enter the account id and code in `/home/user/account/verify.html` in Linux Chrome to complete the two-step verification.
```

### 中文翻译

第一部手机的 Simple SMS Messenger 收到了一次性代码，第二部手机的 Markor 笔记 `Account note` 中有账户 ID。请在 Linux Chrome 的 `/home/user/account/verify.html` 中输入账户 ID 和代码，以完成两步验证。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的短信

| 字段 | 值 |
|---|---|
| 地址 | `5550102` |
| 正文 | `Code: 4829` |

### 2.2 第二部手机的 Markor 笔记

```markdown
# Account note

Account ID: ACC-28491

Use this ID together with the verification code to complete two-step authentication.
```

### 2.3 Linux HTML 表单

- 源文件：`tasks/cross_device/real300_assets/a2l_browser_dual_phone_code/source/verify.html`
- 注入路径：`/home/user/account/verify.html`
- 页面标题：`Account Verification`

| 标签 | 字段名 | 正确值 |
|---|---|---|
| Account ID | `account_id` | `ACC-28491` |
| One-time code | `code` | `4829` |

## 3. Setup 具体流程

### `android_0`

1. 确保 Simple SMS Messenger 可用。
2. 清空短信数据库。
3. 模拟从 `5550102` 收到正文 `Code: 4829`，并等待 5 秒让数据稳定可见。

### `android_1`

确保 Markor 可用，创建 Markor 文档目录，并把第 2.2 节全文写到 `/storage/emulated/0/Documents/Markor/Account note.md`。

### `linux_0`

1. 创建 `/home/user/account`。
2. 上传 `verify.html`。
3. runtime 启动本次运行的表单接收器，并替换 HTML 中唯一的 action 占位符。

表单服务和随机 run id 属于当前运行。setup 不预填账号或验证码，也不会把手机内容自动复制到剪贴板。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

在 setup 提供的页面中原样输入：

```text
Account ID: ACC-28491
One-time code: 4829
```

然后点击 Submit。这里是字段精确匹配，不是“包含关键词”就行。

### 4.1 表单提交状态

- `result.type`：`host_form_submission_state`
- 接收器要求字段集合恰好为 `account_id` 和 `code`；缺少、增加或重复字段都失败。
- 两个字段没有语义别名或格式归一化，提交字符串必须精确匹配。
- evaluator 构造的规范对象是：

```json
{"account_id":"ACC-28491","code":"4829"}
```

- 正确 POST 后状态为 `pass`。之后再提交错误值会重置为失败，所以最终一次提交必须正确。
- 不检查短信或 Markor 文件是否被改动，也不要求浏览器最后停留在成功页。

## 5. “精确匹配”具体是什么意思

接收器解析请求后先要求文本字段名集合精确为 `{account_id, code}`，再把字段对象按键排序、序列化并与任务中的规范对象比较。没有大小写折叠、空白修剪或数字转换：

| 提交值 | 结果 | 原因 |
|---|---|---|
| `ACC-28491` / `4829` | 通过 | 两个字符串精确 |
| `acc-28491` / `4829` | 失败 | account id 大小写不同 |
| `ACC-28491 ` / `4829` | 失败 | 尾随空格也是值的一部分 |
| `ACC-28491` / `04829` | 失败 | code 不是数值比较 |
| 正确两项外再带一个字段 | 失败 | 字段集合不精确 |
| 同名字段提交两次 | 失败 | 重复表单字段被拒绝 |

接收器以最后一次 POST 为准：一次正确提交之后再误提交，会把状态改回失败。是否通过与 Chrome 最终显示哪个页面、输入框是否还保留文字无关。

## 6. Cleanup

清理会清空第一部手机短信、删除第二部手机的 `Account note.md`，并删除 Linux 的 `verify.html`；目录为空时移除 `/home/user/account`。
