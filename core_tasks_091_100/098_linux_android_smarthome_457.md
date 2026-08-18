# Core 098 — `linux_android_smarthome_457`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 98 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_457.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Please prepare for the upcoming arrival. On the first phone, check the saved entrance in OsmAnd. On the second phone, use the arrival event in Simple Calendar Pro for the room and arrival time, and use the existing Simple SMS Messenger thread for the reply. The lighting, curtain, and lead-time settings are in `/tmp/home_ops/phone-handoff/source/location_map.csv` on the Linux desktop. Schedule the room-preparation workflow, then reply in that thread with the entrance, preparation time, arrival time, and confirmation that the room will be ready.
```

### 中文翻译

请为即将到来的访客做好准备。在第一部手机的 OsmAnd 中查看已保存的入口。在第二部手机上，使用 Simple Calendar Pro 中的到达事件获取房间和到达时间，并在现有 Simple SMS Messenger 会话中回复。照明、窗帘和提前量设置位于 Linux 桌面的 `/tmp/home_ops/phone-handoff/source/location_map.csv`。安排房间准备 workflow，然后在该短信会话中回复入口、准备时间、到达时间，并确认房间会准备好。

## 2. 输入、附件与初始业务数据

### 2.1 OsmAnd 收藏 GPX

第一部手机的 favorites 文件包含一个 waypoint：

Android 目标路径：`/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`

```xml
<wpt lat="47.655700" lon="-122.375700">
  <name>East Accessible Entrance</name>
</wpt>
```

### 2.2 Linux CSV 原文

路径：`/tmp/home_ops/phone-handoff/source/location_map.csv`

```csv
action,light_pct,curtain_pct,lead_minutes
prepare_entry,45,50,15
```

也就是：灯光 45%，窗帘开启比例 50%，提前 15 分钟准备。

### 2.3 第二部手机日历与短信

日历事件：

- 标题：`East Accessible Entrance arrival`
- 时间：2026-06-16 19:45–20:15
- 地点：`Guest room`
- 描述：`Use the mapped accessible entrance scene.`

现有短信来自 `+1555000457`：

```text
Reply here with the accessible entrance preparation and arrival times when the scene is ready.
```

由到达时间 19:45 减去 15 分钟，准备时间为 19:30。

### 2.4 SmartHome 初始状态

当前时间为 `2026-06-16 18:00`。客房调光灯初始关闭、亮度 10%；客房窗帘初始为关闭、open_pct=0；没有 workflow。

## 3. Setup 具体流程

- `linux_0`：创建目录并上传 CSV。
- `android_0`：初始化 OsmAnd favorites，再上传包含 East Accessible Entrance 的 GPX。
- `android_1`：清空并写入到达事件；清空短信后注入来自 `+1555000457` 的现有消息。
- `home_0`：重置 SmartHome 到客房灯和窗帘的上述状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占一半。

### 4.0 先说人话：怎样才算通过

建立唯一 active workflow，在 `2026-06-16 19:30` 打开客房调光灯并设为 45%，同时把客房窗帘设为 50%。然后向 `+1555000457` 回复，明确写出入口名称、19:30 准备、19:45 到达以及房间 ready/prepared。

最稳妥的短信：

```text
East Accessible Entrance is prepared at 19:30 for the 19:45 arrival.
```

### 4.1 短信 evaluator

- 查找发往 `+1555000457` 的 sent 短信；没有设置最近多少分钟的窗口，也没有要求同一号码只能发一条。
- 正文不是绝对整句匹配，但必须出现 `East Accessible Entrance`、`19:30/7:30 PM`、`19:45/7:45 PM`、`prepared/ready`。
- 还要含 `prepared`、`ready` 或 `scheduled` 中至少一个。
- `not prepared`、`pending`、`cancelled`、疑问、不确定或否定表达会失败。
- evaluator 通过号码确认回复对象，不直接验证 UI 中是否点击了原会话线程。

### 4.2 SmartHome workflow evaluator

- active workflow 总数必须恰好为 1；
- 时间必须为 `2026-06-16T19:30:00`；
- 合并后的效果必须精确为：

```text
guest_room_dimmable_light_1 power=on, brightness_pct=45
guest_room_curtain_1        open_pct=50
```

- workflow ID 未固定；额外设备或额外效果会失败。
- OsmAnd 收藏本身不作为最终输出计分；它提供短信中要使用的入口名称。
