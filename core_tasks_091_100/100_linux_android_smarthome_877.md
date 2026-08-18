# Core 100 — `linux_android_smarthome_877`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 100 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_877.json`
- 运行配置：`configs/cross_device/local_android_2linux_smarthome.json`
- 设备拓扑：`1A+2L+1H`（`android_0`、`linux_0`、`linux_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Please close out the current kitchen air incident. Follow `/tmp/kitchen-air-incident/policy/policy.txt`, use the existing Android reply thread, and apply only the authorized kitchen purifier change in SmartHome; the unrelated bathroom dehumidifier must stay as it is. Reply with what was applied, then complete `/tmp/kitchen-air-incident/register/work_register.xlsx` and save the preserved copy as `/tmp/kitchen-air-incident/result/work_register_done.xlsx` with the authorized action recorded and its status set to `Applied`.
```

### 中文翻译

请结束当前的厨房空气事件。遵循 `/tmp/kitchen-air-incident/policy/policy.txt`，使用 Android 中现有的回复会话，并且只在 SmartHome 中执行获授权的厨房净化器变更；无关的浴室除湿机必须保持原样。回复说明执行了什么，然后完成 `/tmp/kitchen-air-incident/register/work_register.xlsx`，把保留原结构的副本保存为 `/tmp/kitchen-air-incident/result/work_register_done.xlsx`，记录获授权的动作并将其状态设为 `Applied`。

## 2. 输入、附件与初始业务数据

### 2.1 第一台 Linux 的 policy 原文

路径：`/tmp/kitchen-air-incident/policy/policy.txt`

```text
Current rule: kitchen critical air issues require purifier high now and a follow-up note. Do not touch other rooms.
```

### 2.2 第二台 Linux 的原始 XLSX

路径：`/tmp/kitchen-air-incident/register/work_register.xlsx`，工作表 `Sheet1`：

| Incident | Room | Action | Status |
|---|---|---|---|
| `kitchen air incident` | `kitchen` | 空 | 空 |

需要在副本中只补：

- `C2`：`purifier high now`
- `D2`：`Applied`

### 2.3 Android 现有短信会话

来自 `+155500877` 的消息：

```text
Kitchen air incident. Use SmartHome and reply when recorded.
```

### 2.4 SmartHome 初始状态

当前时间为 `2026-06-16 18:00`：

- `kitchen_air_purifier_1`：power=off，level=low；
- `bathroom_dehumidifier_1`：power=off，level=low；
- 初始无 schedule 或 workflow。

## 3. Setup 具体流程

### `linux_0`

创建 policy 目录并上传 `policy.txt`。

### `linux_1`

创建 register/result 目录，删除旧输出，再上传原始 `work_register.xlsx`。

### `android_0`

清空短信后注入来自 `+155500877` 的现有会话消息。

### `home_0`

重置到厨房净化器和浴室除湿机都处于上述初始状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 4 个 evaluator，通常各占 `1/4`。

### 4.0 先说人话：怎样才算通过

- 立即把厨房净化器打开并设成 high；
- 浴室除湿机的 power 和 level 必须仍是 off/low；
- 回复 `+155500877`，明确说 kitchen purifier high 已 applied/recorded/complete；
- 从原 XLSX 保存一个有效副本到精确输出路径，只在 C2、D2 分别填 `purifier high now`、`Applied`，不要改其他单元格或表结构。

最稳妥的短信：

```text
Kitchen purifier high was applied and recorded for the kitchen incident.
```

### 4.1 短信 evaluator

- 查找最近 30 分钟内发往 `+155500877` 的 sent 短信。
- 不是整句绝对匹配，但必须出现 `kitchen`、连续含义为 `purifier high` 或 `purifier at high`，以及 `applied/recorded/complete`。
- 还要含这三个完成词中的至少一个。
- `not applied`、`pending`、`cancelled`、疑问、不确定或否定关系会失败。

### 4.2 厨房净化器状态 evaluator

直接读取 `kitchen_air_purifier_1` 的最终状态，要求至少满足：

```text
power=on
level=high
```

它不检查命令执行顺序；先设 high 再开机或先开机再设 high 都可以，只要最终状态正确。

### 4.3 浴室除湿机不变 evaluator

把 `bathroom_dehumidifier_1` 的最终 `power`、`level` 与 setup 基线比较，两项都必须没有变化，即仍为 off/low。

### 4.4 XLSX evaluator

- 输出路径必须精确为 `/tmp/kitchen-air-incident/result/work_register_done.xlsx`，并且必须是可解析的真实 XLSX。
- `preserve_from` 会把输出与源工作簿对比：工作表名称与顺序、工作表可见状态、合并区域，以及除允许单元格外的所有非空单元格位置和值都必须保留。
- 唯一允许变化的是 `Sheet1!C2` 和 `Sheet1!D2`。
- 最终 `A2` 必须精确为 `kitchen air incident`，`B2` 为 `kitchen`，`C2` 为 `purifier high now`，`D2` 为 `Applied`；默认大小写敏感。
- 不能把输出做成 CSV 后改扩展名，也不能新增业务行或把内容移到别的单元格。
- 该任务没有启用 `preserve_layout=true`，所以 evaluator 不要求所有样式字节完全一样；它要求的是工作簿结构和非授权单元格内容保持一致。

### 4.5 当前评测边界

Instruction 和 policy 都说只能改厨房、不要碰其他房间。实际 SmartHome 防误改 evaluator 只专门保护了 `bathroom_dehumidifier_1` 的 power/level；其他非厨房设备若被误改，当前四项评分不一定能发现。这是实际覆盖缺口。正确操作仍应遵守原 instruction：除厨房净化器外，任何 SmartHome 设备都不要改。

