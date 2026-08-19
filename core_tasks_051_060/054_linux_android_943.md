# Core 054 — `linux_android_943`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 54 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_943.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步，最长 420 秒

## 0. 任务链与字段来源

手机 evidence 给 case/code/owner；Linux current approved row 给 title/phone/status，但故意把 code 留空；policy 说明 code 必须回到手机取，并公开输出八列表头与 decision 规则。最终唯一输出是 Linux status.csv。

## 1. Instruction

### 英文原文（逐字）

```text
Please prepare the transcript-status record for the current approved audio case. Match the phone evidence in `/sdcard/Download/943-A_source.md` to the current row in `/tmp/audio/request_table.csv`, follow the public schema and decision rule in `/tmp/audio/handoff_policy.md`, and save the completed CSV as `/tmp/audio/status.csv`.
```

### 中文翻译

请为当前 approved audio case 准备 transcript-status 记录。把 `/sdcard/Download/943-A_source.md` 中的 phone evidence 与 `/tmp/audio/request_table.csv` 的 current 行匹配，遵循 `/tmp/audio/handoff_policy.md` 公开的 schema 和 decision rule，并把完成的 CSV 保存为 `/tmp/audio/status.csv`。

## 2. 输入、附件与初始业务数据

### 2.1 Android source 原文

```text
943-A
NX94305
Grace Kim
```

### 2.2 request_table.csv

表头：

```csv
case_id,owner,phone,status,code,target,due_time,priority
```

决定性 current approved 行：

```csv
943-A,Grace Kim,+1555011888,approved,,Audio manifest produces transcript status,2026-07-11 11:30,high
```

另有 11 条 pending/hold 干扰，其中 `943-D,Grace Kim,+1555011888,hold,D9437,...` 与 owner/phone 相似。正确行的 code cell 刻意为空。

### 2.3 handoff_policy.md 的完整业务合同

- Current approved source row：`943-A`
- Approval code：取 matching phone evidence 中的 code
- Owner：`Grace Kim (Quality reviewer)`
- Required decision：`Match by filename and recording date fields.`
- 完整表头：`case_id,title,owner,phone,approval_code,selected_source,status,decision`
- `943-D` 在 hold，不能因 owner 相同而选择。

### 2.4 规范输出

```csv
case_id,title,owner,phone,approval_code,selected_source,status,decision
943-A,Audio manifest produces transcript status,Grace Kim,+1555011888,NX94305,/tmp/audio/request_table.csv,ready,Match by filename and recording date fields.
```

## 3. Setup 具体流程

- `android_0`：确保 Files 可用，把 source 上传到 `/sdcard/Download/943-A_source.md`。
- `linux_0`：创建 `/tmp/audio`，删除旧 request/policy/status，上传 CSV 与 policy；status.csv 不预置。

## 4. Evaluator：评测方式与具体评测点

唯一 evaluator 为 `check_csv_semantic_records`，权重 100%。

### 4.0 表结构

- 文件必须能按 UTF-8 with optional BOM 解析为 CSV。
- 八个规范列必须一一存在；没有配置列别名，不能增删列。
- 实际记录必须无重复，排序后与唯一规范记录完全相等；额外或空占位行失败。
- 普通文本使用 alnum/underscore 归一化，大小写和常见标点差异通常被折叠。

### 4.1 字段值

- case/title/owner/phone/approval_code/selected_source 必须对应规范值。
- `status=ready`，显式接受 `approved` 作为别名。
- decision 是 semantic column，不要求逐字相同，但必须：
  - 同时提到 filename/file name 与 recording date/date；
  - 出现 match/matching/compare/comparison；
  - 不出现 ignore filename、ignore date、do not match。

可接受 decision 示例：

```text
Compare the file name with the recording date.
Matching uses filenames and dates.
```

## 5. 常见失败与边界

- 从空 Linux code cell输出空 approval_code：失败，必须跨设备取 NX94305。
- 选择 `943-D`：case/code/status 不符。
- decision 只写 `matched records`，未出现 filename 与 date：失败。
- 多加 `notes` 列或复制两条相同行：失败。

Evaluator 不检查 source/policy 最终内容，也不要求 status.csv 的物理行顺序以外观保持模板样式；这里没有输出模板，只有公开 schema。

## 6. Cleanup

清理会删除 Android source，以及 Linux request_table.csv、handoff_policy.md、status.csv 和空目录。
