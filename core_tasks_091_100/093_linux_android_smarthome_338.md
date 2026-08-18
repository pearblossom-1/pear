# Core 093 — `linux_android_smarthome_338`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 93 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_338.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Prepare the bedroom for tonight's guest using `/tmp/home_ops/status-reports/source/coordination_note.txt`, the existing Evening Prep Snack recipe in Broccoli on the first phone, and the incomplete Bedroom lighting item in Tasks on the second phone. Rename the saved recipe to Evening Guest Snack and add the guest's requested tea accompaniment without changing its directions or preparation time. Set the bedroom light to the requested level, then complete the existing Bedroom lighting task with a brief outcome note. Do not create duplicate recipes or tasks.
```

### 中文翻译

使用 `/tmp/home_ops/status-reports/source/coordination_note.txt`、第一部手机 Broccoli 中现有的 `Evening Prep Snack` 食谱，以及第二部手机 Tasks 中未完成的 `Bedroom lighting` 项目，为今晚的客人准备卧室。把已保存食谱重命名为 `Evening Guest Snack`，加入客人要求的茶饮搭配，但不要改变步骤或准备时间。把卧室灯设到要求的亮度，然后给现有 `Bedroom lighting` 任务补一条简短结果说明并将其完成。不要创建重复食谱或任务。

## 2. 输入、附件与初始业务数据

### 2.1 Linux 协调笔记原文

路径：`/tmp/home_ops/status-reports/source/coordination_note.txt`

```text
Guest room note

Tonight's guest would like lemon with the tea and crackers already in the
saved snack recipe. Please set the bedroom reading light to 55% before arrival
and close out the existing Bedroom lighting task once the room is ready.
```

关键要求：在原有 `tea; crackers` 中加 `lemon`，卧室阅读灯设为 55%，完成现有任务。

### 2.2 第一部手机的初始食谱

| 字段 | 初始值 | 最终要求 |
|---|---|---|
| 标题 | `Evening Prep Snack` | `Evening Guest Snack` |
| ingredients | `tea; crackers` | `tea; crackers; lemon` |
| directions | `Prepare while the room is set up.` | 保持不变 |
| preparationTime | `20 minutes` | 保持不变 |

### 2.3 第二部手机的初始任务

- 标题：`Bedroom lighting`
- notes：`Set the dimmable light to 55 percent before marking lighting done.`
- completed：`0`（未完成）

### 2.4 SmartHome 初始状态

当前时间为 `2026-06-16 18:00`。`bedroom_dimmable_light_1` 初始为关闭、亮度 10%。没有 schedule 或 workflow。

## 3. Setup 具体流程

- `linux_0`：创建目录并上传唯一的协调笔记。
- `android_0`：清空 Broccoli 食谱，再写入上面的唯一初始食谱。
- `android_1`：清空 Tasks，再写入上面的唯一未完成任务。
- `home_0`：重置 SmartHome 到卧室灯关闭且亮度为 10% 的状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，通常各占 `1/3`。

### 4.0 先说人话：怎样才算通过

最终 Broccoli 中只能有这一份食谱，内容为 `Evening Guest Snack / tea; crackers; lemon / 原步骤 / 20 minutes`；Tasks 中也只能有一个 `Bedroom lighting`，它必须已完成，notes 要肯定地写明 55% 已完成；SmartHome 的卧室调光灯必须是打开且 55%。

稳妥的任务 notes：

```text
Bedroom lighting complete: brightness 55 percent applied.
```

### 4.1 食谱集合 evaluator

- 使用 `androidworld_recipe_set`，预期状态是 `exact`。
- 整个食谱集合必须只有 1 条；多一个无关食谱或保留旧标题副本都会失败。
- 标题、directions 和 preparationTime 做大小写/空白归一化后匹配。
- ingredients 按成分集合匹配，最终必须正好是 tea、crackers、lemon，不能漏项或多项。
- evaluator 只看最终集合，不验证你究竟是“编辑原记录”还是“删除后重建”；但最终不能重复。

### 4.2 Tasks 集合 evaluator

- 整个 Tasks 集合必须正好只有一个 `Bedroom lighting`；额外任务也会导致集合不精确。
- `completed` 必须为 true。
- notes 不是绝对整句匹配，但必须包含 `55%` 或 `55 percent`，并包含 `applied`、`complete` 或 `done` 中至少一个。
- 出现 `pending` 或 `not applied` 会失败，疑问、不确定或否定表达也会失败。

### 4.3 SmartHome 设备状态 evaluator

直接读取 `bedroom_dimmable_light_1` 的最终状态，要求：

```text
power=on
brightness_pct=55
```

该项检查最终状态，不要求创建 schedule/workflow，也不检查命令历史。

