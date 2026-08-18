# Core 036 — `linux_android_1078`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 36 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1078.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`
- 限制：最多 50 步，最长 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
Before submitting `/tmp/form/request_form.html` in Linux Chrome, check whether the latest Simple SMS Messenger message actually provides the required form code for the approved case. Use `/tmp/form/request_table.csv` and `/tmp/form/handoff_policy.md` as the source records. If the required form code is unavailable, leave the form unsubmitted and add a Markor handoff note at `/storage/emulated/0/Documents/Markor/1078-A_blocked.md` explaining the approved case, approval code, owner, and blocked status.
```

### 中文翻译

在 Linux Chrome 中提交 `/tmp/form/request_form.html` 之前，检查 Simple SMS Messenger 的最新消息是否真的给出了 approved case 所需的表单 code。以 `/tmp/form/request_table.csv` 和 `/tmp/form/handoff_policy.md` 为源记录。如果所需 code 不可用，就不要提交表单，并在 `/storage/emulated/0/Documents/Markor/1078-A_blocked.md` 创建交接笔记，说明批准的 case、approval code、owner 和 blocked 状态。

## 2. 输入、附件与初始业务数据

同一号码 `+1555011887` 有两条短信：

```text
Older request 1078-D code DNX07877
Blocked request 1078-A: required code unavailable. Owner Owen Park.
```

第二条是最新消息；它明确说 required form code unavailable。CSV 中决定性的批准行是：

```csv
1078-A,Owen Park,+1555011887,blocked,NX07877,Form code absent from SMS,2026-07-11 11:30,high
```

`1078-D` 是 hold 干扰行，`DNX07877` 也不是批准 code。Policy 明确：缺少短信 form code 会阻止提交，只记录 `1078-A / NX07877 / Owen Park / blocked reason`。

HTML 表单有两个 required 输入：`Case ID` 与 `SMS form code`，按钮为 `Submit request`。任务运行时会把 form action 替换成 evaluator 的接收地址，因此页面现在可以正常打开和提交；但本 case 的正确动作仍是不提交。

## 3. Setup 具体流程

- `android_0`：清空短信后按先旧后新的顺序注入两条消息，清理旧 Markor 输出。
- `linux_0`：上传 table、policy、HTML；运行时补上有效 form action，并启动提交接收器。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占一半。

### 4.0 先说人话：怎样才算通过

绝对不要点 Submit，也不要在输入框中按 Enter 触发表单 POST。只创建笔记：

```text
1078-A / NX07877 / Owen Park: blocked because the required SMS form code is unavailable.
```

### 4.1 Markor 笔记

必须在精确路径出现 `1078-A`、`NX07877`、`Owen Park`，并肯定表达 blocked。写 ready、submitted、not blocked，或用疑问/不确定/否定说法，会失败。

### 4.2 表单状态

Host evaluator 要求 `not_submitted`。实现上只要接收器看到任何 POST 尝试，就把 `_attempted=true`，无论 code 对不对都会失败。打开页面、查看内容或仅输入而不触发提交不会记为 POST；点击 Submit 或按 Enter 提交都会失败。

