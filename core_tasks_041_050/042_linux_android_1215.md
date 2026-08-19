# Core 042 — `linux_android_1215`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 42 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1215.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与分支判断

Linux HTML 中 `required_id` 的值为空，所以任务进入 blocked 分支。第一部手机负责留下可审计的 Markor note，第二部手机负责向 HTML 中给出的 requester 号码发送 blocked 状态。`decoy_id=REQ-COMPLETE` 不能代替空的 required ID。

## 1. Instruction

### 英文原文（逐字）

```text
Check `/tmp/portal/request.html` for the requester's required ID. If it is missing, write a clear blocked note at `/storage/emulated/0/Documents/Markor/Portal Request Blocked.md` on the first phone and send the requester a concise blocked-status text from the second phone.
```

### 中文翻译

检查 `/tmp/portal/request.html` 中 requester 的 required ID。如果该 ID 缺失，请在第一部手机的 `/storage/emulated/0/Documents/Markor/Portal Request Blocked.md` 写一份清楚的 blocked 笔记，并从第二部手机向 requester 发送简短的 blocked-status 短信。

## 2. 输入、附件与初始业务数据

唯一附件：

- 仓库源文件：`tasks/cross_device/linux_android_assets/linux_android_1215/source/tmp/portal/request.html`
- 注入路径：`linux_0:/tmp/portal/request.html`
- 文件全部内容是一行：

```html
<html><body><div>requester=5551201215</div><div>required_id=</div><div>decoy_id=REQ-COMPLETE</div></body></html>
```

逐字段解释：

| 字段 | 值 | 含义 |
|---|---|---|
| `requester` | `5551201215` | 短信目标号码 |
| `required_id` | 空字符串 | 决定 blocked 分支 |
| `decoy_id` | `REQ-COMPLETE` | 明确不是 required ID |

任务没有 Contacts 输入，也没有真实网页表单提交；这里只需读取本地 HTML 的可见/源文字。

## 3. Setup 具体流程

### `linux_0`

删除旧 `/tmp/portal/request.html`，创建目录，再上传上面的固定 HTML。

### `android_0`

确保 Markor 可用并删除旧目标 `/storage/emulated/0/Documents/Markor/Portal Request Blocked.md`。

### `android_1`

确保 Simple SMS Messenger 可用并清空 SMS；setup 不预置 requester 联系人，但 instruction 已从 HTML 提供号码。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占 `1/2`。

### 4.0 先说人话：怎样才算通过

Markor 可写：

```text
The required ID is missing, so the portal request is blocked.
```

再从第二部手机向 `5551201215` 发送：

```text
Your required ID was not provided, so the request is blocked and cannot proceed.
```

### 4.1 Markor note（权重 `1/2`）

- 路径必须精确为 `/storage/emulated/0/Documents/Markor/Portal Request Blocked.md`。
- 必须出现 `required ID`（大小写变体允许）。
- 必须命中 missing / not present / absent 中至少一个缺失表达。
- 必须命中 blocked / cannot proceed / cannot be processed 中至少一个肯定结果。
- `ID present`、`id is present`、`not blocked`、`ready`、`approved` 会冲突失败。
- 通用关系检查还拒绝问句、不确定、局部否定或后续撤销。
- 当前 note 规则没有要求写 requester 号码或 `REQ-COMPLETE`；最稳妥是完全不引用 decoy。

### 4.2 requester SMS（权重 `1/2`）

- 只查看 `android_1` 最近 30 分钟内发往 `5551201215` 的 sent SMS。
- body relation 的 ID 实体可写 required/requester ID、identifier 或 identification。
- 缺失组接受 missing、not present、absent、not provided、unavailable。
- blocked 结果接受 blocked、cannot/unable to proceed/process/submit。
- 规则专门允许 `required ID was not provided` 这种必要的否定能力表达，也允许 `not approved`、`not ready`，不会把它们误当作冲突。
- 写成 `request submitted`、`request processed`、`approved`、`ready` 或声称 ID present 会失败。
- 只要至少有一条近期合格消息即可；没有 exact-count 或“禁止给其他号码发信”的 guard。

## 5. 通过与失败例子

可以通过：

```text
Required identifier unavailable; the request cannot be processed.
The requester ID is absent, so submission is blocked.
```

不能通过：

```text
Is the required ID missing?                 （只有问题，没有肯定 blocked 结果）
REQ-COMPLETE is present, request approved.  （使用 decoy 并声称 approved）
The ID is missing, but the request is ready.（结尾冲突）
```

Evaluator 不检查 HTML 是否被修改，也不要求在笔记里逐字复制一整句；决定性证据是两个 Android 输出。

## 6. Cleanup

清理会删除 Linux HTML、第一部手机 blocked note，并清空第二部手机 SMS；空 `/tmp/portal` 会被移除。
