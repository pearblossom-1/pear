# Core 089 — `linux_android_smarthome_025`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 89 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_025.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
After the `Dinner Guests` event ends, return the living room to the baseline described in `/tmp/guest/restore.docx`. Schedule the restore workflow for the required time, and leave a `Dinner Restore.md` note in Markor with that time and the final light, curtain, purifier, and heater settings.
```

### 中文翻译

在 `Dinner Guests` 事件结束后，按 `restore.docx` 描述的 baseline 恢复客厅。把 restore workflow 安排在规则要求的时间，并在 Markor 创建 `Dinner Restore.md`，写出该时间以及灯、窗帘、净化器和暖气的最终设置。

## 2. 输入、附件与初始业务数据

### 2.1 Linux DOCX 规则原文

路径：`/tmp/guest/restore.docx`

```text
Guest restore rule
Ten minutes after Dinner Guests ends, restore living room baseline: light 20%, curtain closed, purifier off, heater 20 C.
```

业务含义：活动结束后 10 分钟执行；调光灯 20%、窗帘 0%、净化器 off、heater target 20°C。

### 2.2 Android 日历与 Markor

- 日历事件：`Dinner Guests`
- 开始：2026-06-16 18:30
- 结束：2026-06-16 21:00
- 地点：`Living room`
- 描述：`Restore room after guests leave.`
- 目标笔记：`/storage/emulated/0/Documents/Markor/Dinner Restore.md`

21:00 结束后 10 分钟，所以 workflow 时间是 `21:10`。目标笔记在 setup 时会被删除。

### 2.3 SmartHome 初始状态

当前时间 `2026-06-16 19:00`。相关设备：

- `living_room_dimmable_light_1`：on、brightness=60%；
- `living_room_curtain_1`：open_pct=70；
- `living_room_air_purifier_1`：on、level=high；
- `living_room_heater_1`：on、target=23°C；
- 初始无 schedule 或 workflow。

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/guest` 并上传源 `restore.docx`。

### `android_0`

清空日历后加入 Dinner Guests；确保 Markor 可用并删除旧目标笔记。

### `home_0`

重置到上述当前设备状态和空 workflow 列表。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator。

### 4.0 先说人话：怎样才算通过

- 建立唯一 active workflow，时间 `2026-06-16 21:10`；
- 该 workflow 的效果恰好是 dimmable light on/20%、curtain 0%、purifier off、heater target 20°C；
- 创建指定 Markor 笔记，写明 Dinner restore、21:10 和四项最终值，并肯定地说计划已 active/scheduled/applied。

最稳妥的笔记：

```text
Dinner restore is active at 21:10: light 20%, curtain closed, purifier off, heater 20 C.
```

### 4.1 Markor 笔记 evaluator

- 文件路径必须精确匹配。
- 正文必须分别命中：
  - `Dinner restore`；
  - `21:10` 或 `9:10 PM`；
  - `light 20%` 或 `light 20 percent`；
  - `curtain closed` 或 `close curtain`；
  - `purifier off` 或 `air purifier off`；
  - `heater 20 C` 或 `heater 20 degrees`；
  - `active/scheduled/applied` 至少一个。
- `pending`、`cancelled`、`not active` 会失败；问句、不确定或否定已生效关系也会失败。
- 不是整篇逐字匹配，也没有 clause-level relation group。

### 4.2 SmartHome workflow evaluator

- active workflow 总数必须恰好为 1。
- 执行时间必须精确为 `2026-06-16T21:10:00`。
- workflow 步骤合并后的效果必须精确为：

```text
living_room_dimmable_light_1 power=on, brightness_pct=20
living_room_curtain_1        open_pct=0
living_room_air_purifier_1   power=off
living_room_heater_1         target_temperature_c=20
```

- workflow ID 不固定；用 `close` 或 `set_open_pct(0)` 均可，只要 canonical effect 相同。
- heater 这一项只要求设置 target=20°C，不要求 workflow 再包含 `turn_on`。由于基线 heater 已经 on，额外写 `turn_on` 反而会让 canonical effect 多出 `power=on`，与精确效果不相等而失败。
- 加入任何其他设备/效果，或留下第二个 active workflow，也会失败。

### 4.3 当前评测边界

evaluator 不检查源 `restore.docx` 是否被改动；正确执行只需读取它，不应覆盖源文件。它也只评估计划内容，不等待 21:10 实际执行后再检查设备终态。
