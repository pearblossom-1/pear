# Core 079 — `linux_android_smarthome_466`

- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_466.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`；拓扑 `2A+1L+1H`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Match the first phone's OsmAnd favorite coordinates to `/tmp/home_ops/service-notes/source/location_map.csv`. Use the second phone's calendar start time and the matched row's lead rule to schedule the SmartHome entry scene, then reply in the existing thread with the entrance name, preparation time, and arrival time.
```

### 中文翻译

按 OsmAnd 坐标匹配 location_map.csv；用日历 start 与 lead rule 安排 entry scene，并在现有线程回复 entrance、prep time、arrival time。

## 2. 数据与评测

Favorite East Accessible Entrance `47.6566,-122.3766` 匹配 guest room 行：lead 15、light 45、curtain 50。日历 arrival 19:45，因此 prep 19:30。

两项评分：唯一 active workflow 在 19:30，精确打开客房调光灯至45%、窗帘50%；向 `+1555000466` 发短信含 East Accessible Entrance、19:30、19:45，禁止 not prepared/cancelled/pending/wrong entrance。推荐：`East Accessible Entrance will be prepared at 19:30 for the 19:45 arrival.`

