# Core 088 — `linux_android_smarthome_113`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 88 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_113.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Jordan is visiting, so please prepare the Guest room using the saved contact preferences, Calendar timing, current SmartHome state, and `/tmp/visit/standard.xlsx`. Schedule the preparation workflow and send Jordan a concise confirmation of the room, time, and settings. Also create `/tmp/visit/record.docx` titled `Visitor record` with a readable two-column summary labeled `Visitor`, `Room`, `Workflow time`, `Temperature`, `Light`, and `Air purifier`.
```

### 中文翻译

Jordan 将来访。使用联系人中保存的偏好、日历时间、SmartHome 当前状态和 `standard.xlsx` 准备客房；安排准备 workflow，向 Jordan 简短确认房间、时间和设置。同时创建 `/tmp/visit/record.docx`，标题为 `Visitor record`，其中用可读的两列表格汇总 Visitor、Room、Workflow time、Temperature、Light 和 Air purifier。

## 2. 输入、附件与初始业务数据

### 2.1 Android 联系人与日历

联系人：

- 名称：`Jordan Visitor`
- 电话：`+1555021301`
- notes：`Preference: cool, soft, clean`

日历：

- 事件：`Jordan visit`
- 开始：2026-06-16 20:00
- 结束：2026-06-16 22:00
- 地点：`Guest room`
- 描述：`Use visitor standard.`

短信数据库在 setup 时清空。

### 2.2 Linux 标准表

路径：`/tmp/visit/standard.xlsx`，`Sheet1`：

| Preference | Setting |
|---|---|
| cool | turn on AC to 24 C |
| soft | 35% |
| clean | turn on purifier low when PM2.5 high |
| lead time | 25 minutes |

联系人偏好 `cool, soft, clean` 分别映射为 AC 24°C、light 35%、空气质量高时 purifier low。来访开始时间 20:00 减 25 分钟，得到 workflow 时间 `19:35`。

### 2.3 SmartHome 初始状态

当前时间 `2026-06-16 18:00`；Guest room PM2.5=62，满足表中“PM2.5 high”的条件。相关设备：

- `guest_room_air_conditioner_1`：off、mode=cool、target=26°C；
- `guest_room_dimmable_light_1`：on、brightness=70%；
- `guest_room_air_purifier_1`：off、level=low；
- 初始无 schedule 或 workflow。

### 2.4 目标 DOCX 的具体结构

输出路径：

```text
/tmp/visit/record.docx
```

evaluator 内附的正向成品内容是一个独立标题段落和一张 6 行 × 2 列表格：

| 左列 | 右列 |
|---|---|
| Visitor | Jordan |
| Room | Guest room |
| Workflow time | 19:35 |
| Temperature | 24 C |
| Light | 35% |
| Air purifier | low |

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/visit`，删除旧 `record.docx`，上传 `standard.xlsx`。

### `android_0`

清空并写入联系人 Jordan；清空并写入日历事件；清空短信。

### `home_0`

重置到上述 PM2.5、设备状态和空 workflow 列表。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator。

### 4.0 先说人话：怎样才算通过

1. 建立唯一 active workflow，在 `2026-06-16 19:35` 把 Guest room AC 开到 24°C、灯调到 35%、净化器开机并保持 low；
2. 最近 30 分钟内向 `+1555021301` 发短信，明确写 Jordan、Guest room、19:35、24°C、35%、purifier low，并说已 prepared/ready/scheduled；
3. 创建一个真实 DOCX：正文只有标题 `Visitor record`，再放一张恰好 6×2 的表，行列内容与上表一致。

最稳妥的短信：

```text
Jordan, the Guest room is prepared for 19:35 at 24 C, light 35%, purifier low.
```

### 4.1 短信 evaluator

- 查找 sent box 中最近 30 分钟内发往 `+1555021301` 的短信。
- 正文必须分别含 `Jordan`、`Guest room`、`19:35/7:35 PM`、`24 C/24 degrees`、`35%/35 percent`、`purifier low/low purifier`。
- 还要含 `scheduled/ready/prepared` 至少一个。
- `not ready`、`cancelled`、`pending`、问句、不确定或否定关系会失败。
- 不要求短信恰好一条；只要存在一条收件号码、时间窗口和正文都匹配的 sent 消息即可。

### 4.2 SmartHome workflow evaluator

- active workflow 总数恰好为 1，执行时间精确为 `2026-06-16T19:35:00`。
- canonical effects 必须精确为：

```text
guest_room_air_conditioner_1 power=on, target_temperature_c=24
guest_room_dimmable_light_1   power=on, brightness_pct=35
guest_room_air_purifier_1     power=on, level=low
```

- evaluator 没要求在 workflow 中重设 AC mode，因为基线已经是 cool；如果额外加入 mode=cool，效果字典会多一个字段而失败。
- workflow ID 不固定；额外设备、额外字段或第二个 active workflow 会失败。

### 4.3 DOCX evaluator

- 文件必须存在于精确路径，并且是包含必要 OOXML 部件的有效 DOCX，不能拿纯文本改扩展名。
- 文本匹配不区分大小写，必须含 `Visitor record`，不能含 `placeholder`。
- body 顶层非空段落必须恰好只有 1 个，内容为 `Visitor record`；标题放进表格而不作为正文段落会失败。
- 可见表格必须恰好 1 张。
- 该表必须恰好 6 行、每行恰好 2 列，行顺序固定；左列标签必须与 instruction 一致。
- 右列允许的自然格式：
  - Jordan；
  - Guest room；
  - `19:35`、`7:35 PM` 或 `7:35PM`；
  - `24 C`、`24°C`、`24 degrees C` 或 `24 degrees`；
  - `35%` 或 `35 percent`；
  - `low`。
- evaluator 检查有效包、可见文字和表格结构，但没有逐项比较字体、颜色、边框等视觉样式。
