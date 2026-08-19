# Core 079 — `linux_android_smarthome_466`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 79 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_466.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与时间计算

第一部手机 OsmAnd favorite 坐标匹配 Linux CSV 第一行，得到 guest room、lead=15、light=45、curtain=50。第二部手机 Calendar arrival 从 19:45 开始，所以 preparation time 是 19:45−15 分钟=19:30。要创建一条 19:30 active workflow，再在第二部手机现有短信线程回复入口名、19:30 和 19:45。

## 1. Instruction

### 英文原文（逐字）

```text
Match the first phone's OsmAnd favorite coordinates to `/tmp/home_ops/service-notes/source/location_map.csv`. Use the second phone's calendar start time and the matched row's lead rule to schedule the SmartHome entry scene, then reply in the existing thread with the entrance name, preparation time, and arrival time.
```

### 中文翻译

把第一部手机 OsmAnd favorite 的坐标与 `/tmp/home_ops/service-notes/source/location_map.csv` 匹配。使用第二部手机 Calendar 的 start time 和匹配行的 lead rule 来安排 SmartHome entry scene，然后在现有短信线程中回复 entrance name、preparation time 与 arrival time。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机 OsmAnd favorite

```xml
<wpt lat="47.656600" lon="-122.376600">
  <name>East Accessible Entrance</name>
</wpt>
```

### 2.2 Linux `location_map.csv`

```csv
latitude,longitude,room,light_device_id,curtain_device_id,arrival_basis,lead_minutes,light_pct,curtain_pct
47.6566,-122.3766,guest room,guest_room_dimmable_light_1,guest_room_curtain_1,event_start,15,45,50
37.7812,-122.4018,living room,living_room_dimmable_light_1,living_room_curtain_1,event_start,10,25,30
```

坐标与第一行精确匹配；第二行是另一地点的干扰映射。

### 2.3 第二部手机 Calendar

```text
Title: Accessible arrival
Start: 2026-06-16 19:45
End: 2026-06-16 20:15
Location: accessible entry
Description: Arrival time for the mapped accessible entrance.
```

### 2.4 第二部手机现有 SMS thread

来自 `+1555000466`：

```text
Please confirm when the accessible entry scene is prepared.
```

### 2.5 SmartHome 初始相关状态

- current_time=`2026-06-16T18:00:00`
- guest_room light：power=off、brightness=10
- guest_room curtain：open_pct=0、status=closed
- 初始 workflows 为空

## 3. Setup 具体流程

### `linux_0`

- 创建 service-notes/source 目录，删除旧 location_map.csv。
- 上传新的 CSV。

### `android_0`

- 确保 OsmAnd 可用并初始化 favorites。
- 上传只含 East Accessible Entrance 的 favorites.gpx。

### `android_1`

- 确保 Calendar 可用并清空，然后添加 arrival event。
- 确保 SMS 可用并清空，然后注入现有询问线程。

### `home_0`

- 用 episode_config 重置 SmartHome，加载设备初态与空 workflows。

## 4. Evaluator：评测方式与具体评测点

本题有 2 个 evaluation 单元：Owner-facing SMS 与 SmartHome workflow。

### 4.1 SmartHome workflow

- active workflow 总数必须恰好为 1。
- run_at 必须精确为 `2026-06-16T19:30:00`。
- 规范化 effects 必须精确为：

```json
{
  "guest_room_dimmable_light_1": {
    "power": "on",
    "brightness_pct": 45
  },
  "guest_room_curtain_1": {
    "open_pct": 50
  }
}
```

一条 workflow 中要包含两个设备 effect；额外 active workflow 或额外 effect 都失败。Workflow ID/name 不固定，inactive workflow 不计入 active count。

### 4.2 回复现有 SMS thread

推荐：

```text
East Accessible Entrance is scheduled for preparation at 19:30 before the 19:45 arrival.
```

规则：

- sent box 地址 `+1555000466`，最近 30 分钟内。
- 必须含 `East Accessible Entrance`。
- preparation time 接受 `19:30`、`7:30 PM`、`7:30PM`。
- arrival time 接受 `19:45`、`7:45 PM`、`7:45PM`。
- 必须含 `prepared`、`ready`、`scheduled` 中任意一个。
- 不能含 `not prepared`、`cancelled`、`pending`、`wrong entrance`、`19:00`、`7:00 PM`。
- 问句、不确定或否定式结果失败；未配置 clause 绑定。

## 5. 常见失败与评测边界

- 用第二行 lead=10 或 living-room devices：workflow time/effects 均错误。
- 写 19:45 workflow：没有减 15 分钟。
- 分成两条 active workflows：active count 失败。
- 回信只说 scene ready，却漏入口名或任一时间：SMS 项失败。
- 为说明修正而写 “not 19:00”：仍命中 conflict `19:00`。

“Existing thread” 在实现上通过相同地址 `+1555000466` 体现；getter 只查询 sent message，并不检查 UI thread object 或引用原消息。Android/CSV 输入也不直接评分，最终以 workflow 与 reply 为准。

## 6. Cleanup

- Linux 删除 location_map.csv 并清理空目录。
- 第一部手机删除 OsmAnd favorites/backup。
- 第二部手机清空 Calendar 和 SMS，并重复执行一次 SMS clear。
- SmartHome reset。
