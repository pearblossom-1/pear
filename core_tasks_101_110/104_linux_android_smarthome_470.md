# Core 104 — linux_android_smarthome_470

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 104 项
- 任务文件：tasks/cross_device/linux_android_smarthome/linux_android_smarthome_470.json
- 运行配置：configs/cross_device/local_2android_linux_smarthome.json
- 难度：hard
- 设备拓扑：2A+1L+1H（android_0、android_1、linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台手机的 OsmAnd favorite 名叫 Office；第二台手机日历也给出 Office arrival 上下文。Linux CSV 是最终映射依据：Office favorite 对应 Home 的 study 房间，20:30 运行，灯亮度 45%、窗帘 50%。

所以要在 Home 创建 20:30 的 active workflow，包含 study dimmable light 开机、亮度 45、study curtain 50 三步；然后回复 +1555000470，消息中要有 Office、20:30，以及 prepared/ready/scheduled 等已准备完成的肯定表达。

## 1. Instruction

### 英文原文（逐字）

~~~text
Prepare the Office arrival scene. Confirm the Office favorite in OsmAnd on the first phone and the arrival context in Simple Calendar Pro on the second phone. Use `/tmp/home_ops/operations-log/source/location_map.csv` as the source of truth to schedule the SmartHome entry scene, then reply in the existing Simple SMS Messenger thread with the location, scheduled time, and confirmation that it is prepared.
~~~

### 中文翻译

准备 Office 到达场景。在第一台手机的 OsmAnd 中确认 Office 收藏点，并在第二台手机的 Simple Calendar Pro 中确认到达情境。以 /tmp/home_ops/operations-log/source/location_map.csv 为事实来源安排 SmartHome 入场场景，然后在现有 Simple SMS Messenger 会话中回复地点、安排时间，并确认场景已经准备好。

## 2. 输入、附件与初始业务数据

本任务有短信，没有邮件。

### 2.1 第一台 Android：OsmAnd favorite

setup 上传 favorites.gpx，内容只有一个 waypoint：

| 字段 | 内容 |
|---|---|
| name | Office |
| latitude | 47.657000 |
| longitude | -122.377000 |

运行时文件位于 OsmAnd 私有外部目录的 favorites/favorites.gpx。

### 2.2 第二台 Android：日历事件

| 字段 | 内容 |
|---|---|
| title | Office arrival |
| start | 2026-06-16 20:30 UTC |
| end | 2026-06-16 21:00 UTC |
| location | Office |
| description | Use the mapped entry scene. |

### 2.3 第二台 Android：收到的短信

| 字段 | 内容 |
|---|---|
| 对方号码 | +1555000470 |
| 正文 | Reply here when the Office SmartHome entry scene is prepared. |

### 2.4 Linux CSV

运行时路径：/tmp/home_ops/operations-log/source/location_map.csv

~~~csv
favorite,room,run_at,light_pct,curtain_pct
Office,study,2026-06-16T20:30:00,45,50
~~~

注意：用户说的地点是 Office，但 Home 设备房间 ID 是 study。不能去找 office_* 设备。

### 2.5 SmartHome 初始状态

当前时间：2026-06-16 18:00；schedules、workflows、history 都为空。

| 设备 | 初始状态 |
|---|---|
| study_dimmable_light_1 | off，brightness_pct=10 |
| study_curtain_1 | open_pct=0，status=closed |

## 3. Setup 具体流程

### linux_0

1. 删除旧 location_map.csv；
2. 创建 source 目录；
3. 上传 CSV。

### android_0

1. 确保 OsmAnd 已安装；
2. 初始化 favorites 环境；
3. 上传只含 Office waypoint 的 favorites.gpx。

### android_1

1. 确保 Simple Calendar Pro 已安装并清空旧事件；
2. 新增 Office arrival；
3. 确保 Simple SMS Messenger 已安装并清空短信；
4. 注入 +1555000470 的请求。

### home_0

从 episode_config.json 重置 Home，写入 study 设备和空计划状态。

Setup 不会自动打开 OsmAnd、日历、CSV 或短信会话。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

需要同时有：

1. OsmAnd 中正确的 Office favorite；
2. 发给 +1555000470 的确认短信，包含 Office、20:30 和“已经准备好”；
3. 一条 20:30 active workflow，严格执行 study 灯光 45% 和窗帘 50%。

### 4.1 CSV 来源守护

Evaluator 要求 CSV 文本仍包含以下大小写敏感子串：

    favorite,room,run_at,light_pct,curtain_pct
    Office,study,2026-06-16T20:30:00,45,50

它不要求修改 CSV；该项 enable_score_calc=false。

### 4.2 OsmAnd favorite

Getter 检查名为 Office、坐标为 47.657/-122.377 的 favorite 是否 present。外层 exact_match 比较的是 present 状态，不是把 GPX XML 整份逐字比较。

这一数据在 setup 时已经注入；不要删除或改动它。

### 4.3 短信回复

Evaluator 在 sent box 中查找发给 +1555000470 的消息。正文必须：

- 出现 Office；
- 出现 20:30；
- 至少出现 prepared、ready、scheduled、set up、configured 中一个；
- 不得出现 pending、not prepared、not ready、cancelled、failed、could not、cannot。

可通过示例：

    The Office entry scene is prepared and scheduled for 20:30.

不是整句绝对匹配。

### 4.4 SmartHome workflow

必须找到一条：

    run_at = 2026-06-16T20:30:00
    step 1 = study_dimmable_light_1 / turn_on / {}
    step 2 = study_dimmable_light_1 / set_brightness / {brightness_pct: 45}
    step 3 = study_curtain_1 / set_open_pct / {open_pct: 50}
    status = active

workflow_id 没有固定。前两步修改同一设备且效果字段重叠，因此当前 evaluator 会要求上述步骤顺序。

### 4.5 没有检查的部分

- Calendar 本身没有 evaluator，是输入上下文；
- 没有 workflow 总数守护，额外 workflow 理论上不会被拒绝；
- 没有即时设备状态或 command history 检查，因为目标是未来场景。

## 5. 常见失败与真实评测边界

- 把 Office 当成 Home room，尝试操作 office 设备：目标 workflow 不匹配。
- 创建三个独立 schedule 而不是一个三步 workflow：失败。
- 时间写成日历结束时间 21:00：失败。
- 回复只写 ready、不写 Office 或 20:30：失败。
- 回复 pending/not ready：冲突词导致失败。
- 删除 OsmAnd favorite：即使 workflow 正确，favorite evaluator 仍失败。

最稳妥做法是只创建一条目标 workflow，并在同号码会话中发送一条简洁肯定回复。

## 6. Cleanup

- Linux 删除 location_map.csv 并尝试删除空目录；
- android_0 删除 OsmAnd favorites 文件；
- android_1 清空日历和短信；
- Home reset。
