# Core 076 — `linux_android_smarthome_474`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 76 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_474.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与时间计算

第一部手机 playlist 有 2 首歌，第二部手机 Calendar 指向 living room、20:30 开始。Linux CSV 中 living_room + track_count=2 的规则要求提前 20 分钟，并把 light 调到 35%、curtain 调到 50%。所以 SmartHome workflow 应安排在 2026-06-16 20:10。

## 1. Instruction

### 英文原文（逐字）

```text
Use the approved playlist on the first phone, the room and start time in the second phone's calendar, and `/tmp/home_ops/approval-forms/source/music_scene.csv` to schedule the SmartHome preparation scene at the listed lead time before the session.
```

### 中文翻译

使用第一部手机上的 approved playlist、第二部手机 Calendar 中的 room 与 start time，以及 `/tmp/home_ops/approval-forms/source/music_scene.csv`，按照其中列出的 lead time，在 session 开始前安排 SmartHome preparation scene。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机 Retro Music

Setup 推入并放入 `Workout Mix` playlist 的歌曲顺序为：

```text
workout_mix_one
workout_mix_two
```

因此 track_count=2。

### 2.2 第二部手机 Calendar

```text
Title: Media session
Start: 2026-06-16 20:30
End: 2026-06-16 21:00
Location: living room
Description: Room and start time for the approved media session.
```

### 2.3 Linux `music_scene.csv`

```csv
room,track_count,lead_minutes,light_pct,curtain_pct
living_room,2,20,35,50
```

只有这一行。匹配 room 和 track_count 后得到 lead=20、light=35、curtain=50。

### 2.4 SmartHome 初始相关状态

- current_time=`2026-06-16T18:00:00`
- `living_room_dimmable_light_1`：power=off，brightness=10
- `living_room_curtain_1`：open_pct=100，status=open
- 初始 schedules/workflows 均为空

Workflow 是未来计划，不要求现在立刻把设备改成目标状态。

## 3. Setup 具体流程

### `linux_0`

- 创建 `/tmp/home_ops/approval-forms/source`，删除旧 music_scene.csv。
- 上传新的 CSV。

### `android_0`

- 确保 Retro Music 可用并清空。
- 推入两首音轨并创建 Workout Mix playlist。

### `android_1`

- 确保 Simple Calendar Pro 可用并清空 Calendar。
- 添加 Media session 事件。

### `home_0`

- 用本任务 episode_config 重置完整 SmartHome，加载设备初态与空 workflow 列表。

## 4. Evaluator：评测方式与具体评测点

本题只有 1 个 `smarthome.check_workflow_effects` evaluator。

### 4.1 时间与状态

- workflow `run_at` 必须精确为 `2026-06-16T20:10:00`。
- 必须是 active workflow。
- active workflow 总数必须恰好为 1。

### 4.2 精确 effects

规范化后的 effect map 必须精确等于：

```json
{
  "living_room_dimmable_light_1": {
    "power": "on",
    "brightness_pct": 35
  },
  "living_room_curtain_1": {
    "open_pct": 50
  }
}
```

- Light effect 既要表示 power on，也要是 brightness 35。
- Curtain 必须是 50，不是 close/open 的 0/100。
- 多控制一个设备、给目标设备多一个不需要的 effect，都会使精确 map 不相等。
- Workflow 名称和 ID 不固定，step 的等价命令会先规范化成 effects 再比较。

## 5. 常见失败与评测边界

- 把 scene 安排在 Calendar start 20:30：没减 lead，失败。
- 误把 20 minutes 当成 20:00：run_at 错误。
- 创建两条 active workflow 分别控制灯和窗帘：active count=2，失败；应是一条 workflow 含两个 effects。
- 立即改设备状态却不创建 workflow：evaluator 查看 workflows，不看即时状态。

Evaluator 不直接评分 playlist 名、歌曲顺序、Calendar 或 CSV；这些只是计算 workflow 的公开来源。它只要求 active workflow 数恰好为 1，未禁止额外 inactive/cancelled workflows。Instruction 称 playlist 为 approved，但 fixture 本身没有额外 approval 字段，只通过已预置的 Workout Mix 体现该前提。

## 6. Cleanup

- Linux 删除 music_scene.csv 并清理空目录。
- 第一部手机清空 Retro Music。
- 第二部手机清空 Calendar。
- SmartHome reset，移除本次 workflow 与状态变化。
