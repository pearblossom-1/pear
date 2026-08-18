# Core 037 — `linux_android_1255`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 37 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1255.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`
- 限制：最多 50 步；任务文件没有单独设置最长秒数

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

- `linux_0`：上传 role_rule.csv。
- `android_0`：清空并重建两位联系人，清空 SMS，准备 Markor 输出位置。

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

最近 30 分钟内发往 `5551201255` 的 sent 短信必须同时包含 `MSG-1255` 和 `North dispatch window confirmed`，并呈肯定关系。不是完整字符串绝对匹配。

### 4.2 Markor 笔记

- 精确路径：`/storage/emulated/0/Documents/Markor/Dispatch Contact Log.md`。
- 必须出现 Ava Lane、dispatch、north、MSG-1255，并含 selected/confirmed/dispatch 等肯定语义。
- 禁止 `Ava Lane South`、`MSG-0000`、south，以及 wrong/not selected/do not send 等冲突说法。

