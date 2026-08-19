# Core 081 — `linux_android_smarthome_897`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 81 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_897.json`
- 运行配置：`configs/cross_device/local_android_2linux_smarthome.json`
- 难度：hard
- 设备拓扑：`1A+2L+1H`（`android_0`、`linux_0`、`linux_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

Android 原 Task 说明要执行“已批准的 Linux fallback”；`linux_0` 的 PDF 把 fallback 定义为卧室空调 cool 25°C、除湿机 medium，`linux_1` 的工作簿又以 `Fallback Approved=yes` 确认这项方案并预留 Cooling、Humidity、Status 三格。因此完整结果是：立即应用两台 SmartHome 设备的设置，完成唯一的原 Task 并写明两项结果，再从源工作簿另存一份完成登记表，把 B2/C2/E2 填成对应设置和 `Applied`。

## 1. Instruction

### 英文原文（逐字）

```text
Please carry out the approved bedroom comfort fallback requested in the existing Android task. The settings are in `/tmp/bedroom-comfort-fallback/policy/mode_policy.pdf` on one Linux machine, and `/tmp/bedroom-comfort-fallback/register/comfort_order.xlsx` on the other is the record to complete. Apply those settings in SmartHome, mark the original Android task complete with a short note of what was applied, and save the completed register as `/tmp/bedroom-comfort-fallback/result/comfort_order_done.xlsx`, preserving the workbook and setting its status to `Applied`.
```

### 中文翻译

执行现有 Android 任务中已经批准的卧室舒适度备用方案。一台 Linux 机器上的 PDF 给出要应用的设置，另一台 Linux 机器上的 Excel 是需要填写的登记表。把设置应用到 SmartHome，完成原有 Android 任务并用简短备注说明实际执行内容；保留原工作簿结构，将完成后的副本保存到指定结果路径，并把状态写成 `Applied`。

## 2. 输入、附件与初始业务数据

### 2.1 `linux_0`：PDF policy 的完整业务内容

路径：`/tmp/bedroom-comfort-fallback/policy/mode_policy.pdf`

- 标题：`BEDROOM COMFORT — Approved Fallback`
- Air conditioner：`AC cool 25`
- Dehumidifier：`Medium`
- Restriction：`Do not run any alternate mode.`

说白了：卧室空调要开机、切到 cool、目标 25°C；卧室除湿机要开机并设为 medium，而且不要改成其他备用模式。

### 2.2 `linux_1`：原始登记表

路径：`/tmp/bedroom-comfort-fallback/register/comfort_order.xlsx`，工作表 `Sheet1`：

| 单元格 | 原始值 |
|---|---|
| A1–E1 | `Room`、`Cooling`、`Humidity`、`Fallback Approved`、`Status` |
| A2 | `bedroom` |
| B2 | 空 |
| C2 | 空 |
| D2 | `yes` |
| E2 | 空 |

目标不是覆盖源文件，而是另存为：

```text
/tmp/bedroom-comfort-fallback/result/comfort_order_done.xlsx
```

### 2.3 Android 文件和原始 Task

下载目录中的 `bedroom-comfort.txt` 原文：

```text
Bedroom request: reduce heat and humidity using the approved Linux fallback.
```

Tasks 中预先只有一条相关任务：

- title：`Bedroom comfort fallback`
- notes：`Update after the SmartHome fallback is applied.`
- completed：0，即未完成

要求是修改并完成这条原任务，不能再新建一条同名任务。

### 2.4 SmartHome 初始状态

当前时间为 `2026-06-16 18:00`。卧室温度 29°C、湿度 70%；与任务直接相关的设备为：

- `bedroom_air_conditioner_1`：power=off、mode=auto、target=27°C；
- `bedroom_dehumidifier_1`：power=off、level=low；
- 初始无 schedule 或 workflow。

## 3. Setup 具体流程

### `linux_0`

创建 policy 目录，将唯一的 PDF 上传到精确路径。

### `linux_1`

创建 register 和 result 目录，先删除可能残留的结果文件，再上传原始 XLSX。

### `android_0`

确保 Files 和 Tasks 可用；上传说明文本；清空 Tasks 后加入上面那条未完成任务。

### `home_0`

用任务自己的 `episode_config.json` 重置 SmartHome，得到上述房间读数、设备状态以及空计划列表。

## 4. Evaluator：评测方式与具体评测点

本任务有 4 个 evaluator；满分需要四项都通过。

### 4.0 先说人话：怎样才算通过

1. 把空调最终变成 on/cool/25°C；
2. 把除湿机最终变成 on/medium；
3. 仍然只有原来那一个 `Bedroom comfort fallback` Task，把它勾选完成，并在 notes 里明确写出 cool 25、dehumidifier medium 和已完成含义；
4. 保存有效 XLSX 到精确结果路径，只补 B2、C2、E2，其他结构和数据保持不变。

最稳妥的 Task notes：

```text
Bedroom fallback applied: AC cool 25 C and dehumidifier medium.
```

### 4.1 Android Task evaluator

- title 必须精确为 `Bedroom comfort fallback`，并且同名任务恰好 1 条。
- `completed` 必须为 1。
- notes 不是整句绝对匹配，但必须同时包含：
  - `cool 25` 或 `25 C`；
  - `dehumidifier medium` 或 `medium dehumidifier`；
  - `applied`、`approved`、`complete` 至少一个。
- 出现 `pending` 或 `not applied` 会失败；问句、不确定语气以及对上述关系的否定也会失败。

### 4.2 空调状态 evaluator

直接读取 `bedroom_air_conditioner_1` 的最终状态，要求至少满足：

```text
power=on
mode=cool
target_temperature_c=25
```

检查的是最终状态，不限制三条命令的先后顺序。

### 4.3 除湿机状态 evaluator

直接读取 `bedroom_dehumidifier_1`，要求 `power=on` 且 `level=medium`。

### 4.4 XLSX evaluator

- 输出路径必须精确为 `/tmp/bedroom-comfort-fallback/result/comfort_order_done.xlsx`，且文件必须是真实、可解析的 XLSX。
- 以源工作簿为保留基线，唯一允许变化的格子是 `Sheet1!B2`、`C2`、`E2`。
- `A2` 必须仍为 `bedroom`，`D2` 因为不在允许变化列表中必须仍为 `yes`。
- B2 可写 `AC cool 25`、`cool 25`、`cool 25 C`、`cool 25C`、`25 C`、`25C` 或 `25`。
- C2 可写 `dehumidifier medium`、`medium dehumidifier` 或 `medium`。
- E2 必须精确为 `Applied`。
- 不能新增业务行、改表名、移动已有数据或把 CSV 改扩展名冒充 XLSX。

## 5. 常见失败与真实评测边界

- 只设空调 target=25，却没有 `turn_on` 或没有把 mode 改成 cool：空调状态 evaluator 失败。
- 除湿机只开机但仍是 low，或只改成 medium 但仍关机：除湿机 evaluator 失败。
- 新建第二条同名 Task 而保留原项：`require_exactly_one=true`，同名数量变成 2，失败。
- Task 已完成但 notes 少了 cool 25、dehumidifier medium 或肯定完成词中的任意一组：失败。
- 在源路径上改表、输出错路径、把 E2 写成小写 `applied`，或改了允许列表外的非空单元格：XLSX evaluator 失败。

“完成原来的 Task”并没有用数据库 row ID 锁定。Evaluator 只看最终是否恰好有一条精确同名、completed=1 且 notes 合格的 Task；因此删除原项后重建唯一合格同名项，技术上也可能通过，但不符合 instruction。

XLSX 的 `preserve_from` 会保留 sheet 名单与顺序、sheet 可见状态、合并区域、允许单元格之外的非空坐标和值，以及相关行列的 hidden 状态；本任务没有设置 `preserve_layout=true`，因此字体、填充、列宽、行高、冻结窗格等版式并不全部受评。正确操作仍应真正另存并保留外观。SmartHome evaluator 也只检查指定空调和除湿机，没有全屋 no-change guard；应遵守 PDF restriction，不碰其他设备。

## 6. Cleanup

- `linux_0` 删除 policy PDF，并尝试移除空的 policy 目录。
- `linux_1` 删除源登记表和结果登记表，并尝试移除 register/result 目录。
- Android 删除 `bedroom-comfort.txt`，再清空 Tasks。
- SmartHome reset。
