# Core 055 — `linux_android_1274`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 55 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1274.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与分支判断

CSV 要求 `Rae Lin / 5551201274`。Contacts 中 exact-name Rae Lin 的号码却是 `5550001274`；另一个号码正确的联系人叫 `Ray Lin`，不能用近名替代。名称与号码无法在同一联系人上同时匹配，因此 blocked，两个号码都不能发送。

## 1. Instruction

### 英文原文（逐字）

```text
Check `/tmp/outreach/request.csv` against the contact on the first phone, verifying both name and phone number. If the name matches but the number does not, explain the mismatch in `/storage/emulated/0/Documents/Markor/Outreach Blocked 1274.md` on the second phone and do not send a text to either number.
```

### 中文翻译

将 `/tmp/outreach/request.csv` 与第一部手机上的联系人核对，同时验证姓名和电话号码。如果姓名匹配但号码不匹配，请在第二部手机的 `/storage/emulated/0/Documents/Markor/Outreach Blocked 1274.md` 中解释 mismatch，并且不要向任一号码发送短信。

## 2. 输入、附件与初始业务数据

### Linux request.csv 全文

```csv
name,phone,message
Rae Lin,5551201274,Confirm appointment
```

### 第一部手机 Contacts

| Name | Number | Notes | 判断 |
|---|---|---|---|
| Rae Lin | `5550001274` | Same name wrong phone. | 姓名对，号码错 |
| Ray Lin | `5551201274` | Near-name wrong contact. | 号码对，姓名错 |

### 第二部手机初态

SMS 清空；目标 Markor note 不存在。

## 3. Setup 具体流程

- `linux_0`：删除旧 request.csv，创建 `/tmp/outreach` 并上传唯一请求行。
- `android_0`：确保 Contacts 可用，清空并添加上述两位联系人。
- `android_1`：确保 Markor 与 SMS 可用，清空 SMS，删除旧 note。

## 4. Evaluator：评测方式与具体评测点

本任务 3 个 evaluator，通常各占 `1/3`。

### 4.0 先说人话

```text
Rae Lin outreach is blocked: requested 5551201274 conflicts with contact 5550001274; do not send.
```

并且两个号码都不要发 SMS。

### 4.1 Markor note（权重 `1/3`）

- 精确路径：`/storage/emulated/0/Documents/Markor/Outreach Blocked 1274.md`。
- 必需实体：Rae Lin、`5551201274`、`5550001274`。
- 必须出现 mismatch/does not match/different/conflicts。
- 必须肯定表达 blocked/do not send/must not send。
- 禁止近名实体 `Ray Lin`。
- 冲突：not blocked、numbers/phones match、safe to send、message sent。

### 4.2 request number 无短信（权重 `1/3`）

`android_1` sent box 对 `5551201274` 使用 `any_body=true`、无时间窗口；任何 sent SMS 都失败。

### 4.3 contact number 无短信（权重 `1/3`）

同样要求 `5550001274` 完全没有 sent SMS。两项分别检查，所以只避开一个号码仍不能整体通过。

## 5. 常见失败与边界

- 选择 Ray Lin 以获得 request number：note 禁止 Ray Lin，而且违背 exact-name 要求。
- 给任一号码发 blocked 通知：内容再正确也破坏 no-send 项。
- note 只写“phones mismatch”而漏一个号码：实体不足。
- 对其他无关号码发送短信不在这两个 guard 内；正确执行仍不需要任何短信。

Evaluator 不要求 note 包含 message=`Confirm appointment`，也不检查 Contacts 最终状态。

## 6. Cleanup

清理会删除 Linux CSV、清空第一部手机 Contacts，并删除第二部手机 note、清空 SMS。
