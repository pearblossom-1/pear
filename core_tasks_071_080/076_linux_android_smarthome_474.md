# Core 076 — `linux_android_smarthome_474`

- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_474.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`；拓扑 `2A+1L+1H`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Use the approved playlist on the first phone, the room and start time in the second phone's calendar, and `/tmp/home_ops/approval-forms/source/music_scene.csv` to schedule the SmartHome preparation scene at the listed lead time before the session.
```

### 中文翻译

使用第一部手机 approved playlist、第二部手机日历 room/start time 和 CSV，在 session 前按 lead time 安排 SmartHome preparation scene。

## 2. 数据与评测

Playlist Workout Mix 有两首；Calendar `Media session` 在 living room，20:30 开始；CSV：track_count=2、lead=20、light=35、curtain=50。因此 workflow 在 20:10。

唯一 SmartHome evaluator：active workflow 总数恰好 1；run_at `2026-06-16T20:10:00`；精确效果为 living_room_dimmable_light_1 power on/brightness 35，living_room_curtain_1 open_pct 50。Workflow ID 不固定，额外效果/active workflow 失败。

