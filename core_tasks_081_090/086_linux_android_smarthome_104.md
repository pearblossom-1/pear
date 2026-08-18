# Core 086 — `linux_android_smarthome_104`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 86 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_104.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Prepare the Living room for Sam's visit. Derive the visit time and reply number from Calendar, the requested settings from /tmp/guest/card.png, and the mapping and lead-time rule from /tmp/guest/standards.xlsx. Schedule one active SmartHome workflow for the preparation and send Sam a concise confirmation with the preparation time and settings.
```

### 中文翻译

为 Sam 的来访准备客厅。从 Calendar 取得来访时间和回复号码，从 `card.png` 读取所需设备设置，再用 `standards.xlsx` 的映射与提前量规则计算准备时间。建立一个启用中的 SmartHome 准备 workflow，并向 Sam 发送简短确认，写明准备时间和设置。

## 2. 输入、附件与初始业务数据

### 2.1 Linux 图片：Guest preference card

路径：`/tmp/guest/card.png`。图片上可读文字为：

```text
Guest preference card
Room: Living room
Temperature: 23 C
Light: 60%
Air: purifier high
```

这里的目标设备是 Living room heater、dimmable light 和 air purifier。

### 2.2 Linux 规则表

路径：`/tmp/guest/standards.xlsx`，`Sheet1`：

| Rule | Value |
|---|---|
| preparation lead | 30 minutes before the visit |
| temperature | use the preference card value |
| light | use the preference card value |
| air purifier | use the preference card value |

因此三项设置都取图片值；准备时间是来访开始前 30 分钟。

### 2.3 Android 日历与短信

- 日历事件：`Sam visit`
- 开始：2026-06-16 19:30
- 结束：2026-06-16 21:00
- 地点：`Living room`
- 描述：`Contact: +1555020401`
- 短信数据库在 setup 时被清空。

计算结果：19:30 减 30 分钟，workflow 必须安排在 `19:00`；回复号码是 `+1555020401`。

### 2.4 SmartHome 初始状态

当前时间 `2026-06-16 18:00`，Living room 温度 19°C、PM2.5=66。相关设备：

- `living_room_heater_1`：off、target=20°C；
- `living_room_dimmable_light_1`：on、brightness=65%；
- `living_room_air_purifier_1`：off、level=low；
- 初始无 schedule 或 workflow。

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/guest`，将图片和 XLSX 上传到精确路径。

### `android_0`

清空日历后加入 Sam visit；清空短信，等待执行者发送新确认。

### `home_0`

重置到上述时间、传感器读数、设备状态以及空 workflow 列表。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator。

### 4.0 先说人话：怎样才算通过

1. 建立唯一 active workflow，在 `2026-06-16 19:00` 让 heater on/23°C、dimmable light on/60%、air purifier on/high；
2. 最近 30 分钟内向 `+1555020401` 发短信，写清 Living room、19:00、23°C、60%、purifier high，并肯定地说已 scheduled/ready/prepared。

最稳妥的短信：

```text
Living room preparation is scheduled for 19:00: 23 C, light 60%, purifier high.
```

### 4.1 短信 evaluator

- 只查 sent box 中最近 30 分钟内发往 `+1555020401` 的消息。
- 正文不是整句绝对匹配；必须分别含：
  - `Living room`；
  - `19:00` 或 `7:00 PM`；
  - `23 C` 或 `23 degrees`；
  - `60%` 或 `60 percent`；
  - `purifier high` 或 `high purifier`；
  - `scheduled`、`ready`、`prepared` 至少一个。
- `not ready`、`cancelled`、`pending` 会失败；问句、不确定和否定关系也会失败。
- evaluator 不要求正文出现 Sam 的名字，只用收件号码确认对象；也没有要求匹配短信恰好一条。

### 4.2 SmartHome workflow evaluator

- active workflow 总数必须恰好为 1。
- 执行时间精确为 `2026-06-16T19:00:00`。
- 步骤规范化并合并后的效果必须精确为：

```text
living_room_heater_1         power=on, target_temperature_c=23
living_room_dimmable_light_1 power=on, brightness_pct=60
living_room_air_purifier_1   power=on, level=high
```

- workflow ID 和合法步骤顺序不固定；关键是合并后的效果完全相同。
- 加入额外设备或额外效果会导致效果字典不相等；建立第二个 active workflow 也会失败。
