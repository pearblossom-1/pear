# Core 054 — `linux_android_943`

- 任务文件：`tasks/cross_device/linux_android/linux_android_943.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：最多 50 步，最长 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
Please prepare the transcript-status record for the current approved audio case. Match the phone evidence in `/sdcard/Download/943-A_source.md` to the current row in `/tmp/audio/request_table.csv`, follow the public schema and decision rule in `/tmp/audio/handoff_policy.md`, and save the completed CSV as `/tmp/audio/status.csv`.
```

### 中文翻译

为当前 approved audio case 准备 transcript-status 记录。把手机 evidence 与 request_table 当前行匹配，按公开 policy 的 schema/decision rule 保存 status.csv。

## 2. 输入、Setup 与评测

手机文件原文三行：`943-A / NX94305 / Grace Kim`。CSV current approved 行是 943-A、Grace Kim、`+1555011888`、title `Audio manifest produces transcript status`，但 code 刻意留空；policy 要求从手机 evidence 取 code，并规定八列表头与 decision `Match by filename and recording date fields.`

唯一 evaluator 要求输出恰好一条语义记录：

```csv
case_id,title,owner,phone,approval_code,selected_source,status,decision
943-A,Audio manifest produces transcript status,Grace Kim,+1555011888,NX94305,/tmp/audio/request_table.csv,ready,Match by filename and recording date fields.
```

行序不相关但这里只能一行；列完整、无重复/额外记录。status 可用 approved 作为 ready 别名。Decision 不是死字符串：必须肯定表达 match/compare，并同时提到 filename 与 recording date；ignore/do not match 会失败。

