# Core 085 — `linux_android_smarthome_792`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 85 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_792.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Use the Hallway daylight preference note on Android, the 120-lux SmartHome reading, and `/tmp/home_ops/room-updates/source/curtain.csv` to choose and apply the curtain setting. Record the reading, preference, and setting you applied in Markor as `Hallway daylight decision.md`.
```

### 中文翻译

结合 Android 上的 Hallway daylight 偏好笔记、SmartHome 的 120 lux 读数以及 Linux 上的 `curtain.csv`，选择并应用正确的窗帘开度。然后在 Markor 中创建 `Hallway daylight decision.md`，记录读数、偏好和已经应用的设置。

## 2. 输入、附件与初始业务数据

### 2.1 Android 原始偏好笔记

路径：`/storage/emulated/0/Documents/Markor/Hallway daylight.md`

```text
Preference: moderate daylight. Use curtain.csv and SmartHome brightness before changing the curtain.
```

输出文件是另一个文件 `Hallway daylight decision.md`，setup 会先删除可能残留的输出。

### 2.2 Linux CSV 原文

路径：`/tmp/home_ops/room-updates/source/curtain.csv`

```csv
preference,brightness_rule,curtain
moderate daylight,below 180 lux,65 percent open
moderate daylight,180-350 lux,45 percent open
```

当前亮度是 120 lux，满足 `below 180 lux`，因此应选第一行的 `65 percent open`，而不是 45%。

### 2.3 SmartHome 初始状态

当前时间 `2026-06-16 11:00`：

- hallway brightness：120 lux；
- `hallway_curtain_1`：open_pct=10、status=partial；
- 初始无 schedule 或 workflow。

## 3. Setup 具体流程

### `linux_0`

创建 CSV 所在目录并上传 `curtain.csv`。

### `android_0`

确保 Markor 可用，把源偏好笔记上传到 Documents/Markor，并删除旧的目标 decision 文件。

### `home_0`

重置到 hallway=120 lux、窗帘开度 10% 的基线。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator。

### 4.0 先说人话：怎样才算通过

- 立即把 `hallway_curtain_1` 调到 65% open；
- 创建指定 Markor 文件，肯定地写出 Hallway、120 lux、moderate daylight、65% 和 curtain，并说明已经 applied/set/opened。

最稳妥的笔记：

```text
Hallway was 120 lux, so the moderate-daylight preference was applied by setting the curtain to 65 percent open.
```

### 4.1 Markor 笔记 evaluator

- 文件路径必须精确为 `/storage/emulated/0/Documents/Markor/Hallway daylight decision.md`。
- 正文不是绝对整句匹配，但以下各组必须命中：
  - `Hallway`；
  - `120 lux` 或 `120-lux`；
  - `moderate daylight` 或 `moderate-daylight`；
  - `65 percent` 或 `65%`；
  - `curtain` 或 `curtains`；
  - `applied`、`set`、`opened` 至少一个。
- `pending`、`not applied`、`unchanged` 会失败；问句、不确定或否定关系也会失败。
- 这里没有 clause-level relation group；这些实体可以用一两句自然文字表达，不要求冒号格式。

### 4.2 窗帘状态 evaluator

直接读取 `hallway_curtain_1` 的最终状态，要求 `open_pct=65`。不检查具体用了哪条命令，也不要求建立 schedule/workflow。

### 4.3 当前评测边界

evaluator 不检查源偏好笔记是否仍保持原样，也不检查其他 SmartHome 设备是否被误改。正确执行应只改 hallway curtain，并保留源笔记。
