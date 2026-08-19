# Core 037 — `linux_android_1255`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 37 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1255.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与设备分工

Linux CSV 同时给出 north 与 south 两行，Android Contacts 又有两个相近联系人。必须先按 role=`dispatch`、region=`north` 选中 CSV 第一行，再用同一身份找到号码 `5551201255`。最终输出都在 Android：一条 sent SMS 和一份 Markor selection log。

## 1. Instruction

### 英文原文（逐字）

```text
Use `/tmp/contacts/role_rule.csv` to choose the north-region dispatch contact on the phone, send that row's message text and message code to the matching Contacts entry, and write `Dispatch Contact Log.md` in Markor with the selected contact, role, region, and message code.
```

### 中文翻译

使用 `/tmp/contacts/role_rule.csv` 选择手机中 north region 的 dispatch 联系人，把该行的 message text 和 message code 发给匹配的 Contacts 联系人，并在 Markor 的 `Dispatch Contact Log.md` 中记录所选联系人、role、region 和 message code。

## 2. 输入、附件与初始业务数据

CSV 原文：

```csv
name,role,region,message_code,message
Ava Lane,dispatch,north,MSG-1255,North dispatch window confirmed
Ava Lane,dispatch,south,MSG-0000,wrong region
```

手机联系人：

- `Ava Lane`，号码 `5551201255`，notes 为 role dispatch / region north；
- `Ava Lane South`，号码 `5551201295`，notes 为 role dispatch / region south。

短信初始清空；旧目标 Markor 笔记被删除。

## 3. Setup 具体流程

### `linux_0`

删除旧 `/tmp/contacts/role_rule.csv`、创建目录并上传完整两行 CSV。

### `android_0`

1. 确保 Contacts 可用并清空联系人。
2. 新增 `Ava Lane / 5551201255 / role dispatch region north`。
3. 新增 `Ava Lane South / 5551201295 / role dispatch region south`。
4. 确保 Simple SMS Messenger 可用并清空 SMS。
5. 确保 Markor 可用，删除旧 `/storage/emulated/0/Documents/Markor/Dispatch Contact Log.md`。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占一半。

### 4.0 先说人话：怎样才算通过

向 north 联系人的 `5551201255` 发送：

```text
MSG-1255: North dispatch window confirmed.
```

并在 `Dispatch Contact Log.md` 写：

```text
Selected dispatch contact: Ava Lane, dispatch, north region, message code MSG-1255.
```

### 4.1 短信

最近 30 分钟内发往 `5551201255` 的 sent 短信必须同时包含完整短语 `MSG-1255` 和 `North dispatch window confirmed`，并呈最终肯定关系。号码按 phone-number 规则归一化，正文大小写不敏感、短语有边界；不是完整字符串绝对匹配，也没有要求精确只有一条匹配短信。

### 4.2 Markor 笔记

- 精确路径：`/storage/emulated/0/Documents/Markor/Dispatch Contact Log.md`。
- 必须出现 Ava Lane、dispatch、north、MSG-1255，并含 selected/confirmed/dispatch 等肯定语义。
- 禁止 `Ava Lane South`、`MSG-0000`、south，以及 wrong/not selected/do not send 等冲突说法。

## 5. 通过/失败例子与 evaluator 缺口

可通过短信：

```text
MSG-1255 — North dispatch window confirmed.
For Ava: North dispatch window confirmed (MSG-1255).
```

不可通过短信：

```text
Is MSG-1255 the North dispatch window confirmed?  （疑问）
MSG-1255: North dispatch window not confirmed.    （否定）
MSG-0000: North dispatch window confirmed.        （缺少正确 code）
```

Markor 要同时包含四个 entity，并至少命中 selected/confirmed/dispatch 中一个肯定词。因为 `dispatch` 本身既是 entity 又在 positive list 中，写明四项且无冲突通常即可。

需要如实说明：短信 evaluator 只查正确号码是否至少有一条合格 sent SMS，没有负向检查 `5551201295`。因此额外误发一条给 south 联系人，当前短信项可能仍通过；Markor 则明确禁止 south 身份。符合 instruction 的正确做法仍是只发给 north 联系人。

## 6. Cleanup

清理会删除 Linux CSV 和空目录，并清空 Android Contacts/SMS、删除目标 Markor 笔记。
