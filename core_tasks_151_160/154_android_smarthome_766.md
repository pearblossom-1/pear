# Core 154 — android_smarthome_766

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 154 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_766.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：hard
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台手机的 scene manifest 把 `FocusScene` 映射为：20:00、Focus Mix、office light 30%、office purifier low。Retro Music 中 `Focus Mix` 包含 Quiet One 和 Deep Work。第二台手机 Markor 政策说明 FocusScene 可执行，但必须取消 20:00 较低优先级的 noisy cleaning。

需要：

1. 取消 Home 的 `focus_conflict_cleaning`；
2. 创建 20:00 的 active workflow，把 office light 设 30%、purifier 设 low；
3. 在第二台手机创建唯一、未完成的 `Scene conflict result` Tasks 项，记录 playlist 已验证、scene/time/settings，以及 cleaning plan 已取消。

## 1. Instruction

### 英文原文（逐字）

~~~text
Please set up `FocusScene` from `scene_code_manifest.csv` and the named Retro Music playlist on the first phone. Before scheduling it in Home, follow the scene conflict policy in Markor on the second phone so the lower-priority plan is handled correctly. Leave a Tasks item titled `Scene conflict result` on the second phone summarizing the verified playlist, scene time and settings, and what happened to the conflicting plan.
~~~

### 中文翻译

请根据第一台手机上的 `scene_code_manifest.csv` 和指定的 Retro Music playlist 设置 `FocusScene`。在 Home 中安排它之前，遵循第二台手机 Markor 中的场景冲突政策，正确处理低优先级计划。最后在第二台手机留下标题为 `Scene conflict result` 的 Tasks 项，总结已验证的 playlist、场景时间与设置，以及冲突计划的处理结果。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。输入涉及 Retro Music、CSV、Markor 和 Home 现有 schedule。

### 2.1 android_0：Retro Music

Setup 会：

1. 清空 Retro Music；
2. 推入两首以标题标识的 MP3：`Quiet One`、`Deep Work`；
3. 创建 playlist `Focus Mix`，曲目顺序为 Quiet One、Deep Work。

资产目录还包含 `retro/Focus Mix.txt`，全文是：

~~~text
Quiet One
Deep Work
~~~

Task JSON 不把这份 TXT 上传到手机；它直接使用同样的两个歌名生成媒体并创建 playlist。因此没有需要听辨的真实音频内容。

### 2.2 android_0：scene manifest

`scene_code_manifest.csv` 上传到：

~~~text
/storage/emulated/0/Download/home/scene_code_manifest.csv
~~~

全文：

~~~csv
scene code,playlist,run at,office light brightness,office purifier level
FocusScene,Focus Mix,20:00,30%,low
~~~

### 2.3 android_1：冲突政策

`Scene conflict policy.md` 上传到：

~~~text
/storage/emulated/0/Documents/Markor/Scene conflict policy.md
~~~

全文：

~~~text
conflict policy: FocusScene allowed; cancel lower-priority noisy cleaning at 20:00.
~~~

Tasks 会被清空。

### 2.4 home_0：相关初始状态

当前时间：`2026-06-16T19:00:00`。

| 设备 | 初始状态 |
|---|---|
| office_dimmable_light_1 | power=on，brightness_pct=70 |
| office_air_purifier_1 | power=on，level=high |
| living_room_robot_vacuum_1 | power=off，status=docked，battery=80 |

冲突 schedule：

~~~text
schedule_id: focus_conflict_cleaning
run_at: 2026-06-16T20:00:00
device_id: living_room_robot_vacuum_1
command: start_cleaning
args: {}
status: active
~~~

初始 workflows 和 history 为空。

## 3. Setup 具体流程

### android_0

初始化 Retro Music 的两首曲目和 `Focus Mix` playlist；确保 Android Files 可用并上传 manifest CSV。

### android_1

上传 `Scene conflict policy.md`；确保 Tasks 可用并清空 Tasks。

### home_0

使用 `android_smarthome_766/episode_config.json` reset Home，写入 office 设备和冲突 schedule。

## 4. 正确输出

### 4.1 取消冲突 schedule

`focus_conflict_cleaning` 保留原字段，但 status 变为 `cancelled`。

### 4.2 FocusScene workflow

时间：`2026-06-16T20:00:00`，active。Oracle steps：

| 设备 | command | args |
|---|---|---|
| office_dimmable_light_1 | set_brightness | brightness_pct=30 |
| office_air_purifier_1 | set_level | level=low |

Oracle workflow_id 是 `focus_scene_safe`，但 evaluator 不检查 ID。

### 4.3 Tasks

在 android_1 创建唯一一条未完成任务：

~~~text
title: Scene conflict result
completed: false
~~~

Oracle notes：

~~~text
Focus Mix was verified. FocusScene is scheduled for 20:00 with the office light at 30% and the office purifier at low; the conflicting cleaning plan is cancelled.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 3 个 evaluator，全部必须成功：

1. Tasks 结果；
2. cleaning schedule 的 cancelled 记录；
3. 唯一 active workflow 的时间和规范化效果。

### 5.1 Tasks 标题、数量、状态与 notes

标题默认大小写敏感，`Scene conflict result` 必须恰好一条，且 `completed=false`。

Notes 必须命中全部实体组：

- `Focus Mix`；
- `verified`；
- `FocusScene`；
- `20:00` / `8:00 PM`；
- `office light`；
- `30` / `30%`；
- `office purifier` / `purifier`；
- `low`；
- `cleaning plan`；
- `cancelled` / `canceled`。

还需至少出现 `scheduled`、`applied`、`active` 之一；不能出现 `pending`、`not verified`、`not scheduled`、`cleaning plan remains active`、`not cancelled`、`not canceled`。

`cancelled/canceled` 被列为允许的 reversal term，所以必要的取消说明不会被通用撤销检测误拒。Notes 不是 Oracle 整句绝对匹配。

### 5.2 Cleaning schedule

`smarthome.check_schedule_count` 要求：

- 与 `focus_conflict_cleaning`、20:00、robot、`start_cleaning`、args={}、cancelled 全字段匹配的记录恰好 1 条；
- Home 全部 schedules 中 active 状态总数恰好为 0。

直接删除 schedule 会失败；保留 active 也会失败。

### 5.3 Workflow 按规范化效果精确比较

`smarthome.check_workflow_effects` 要求：

- active workflow 总数恰好 1；
- run_at 精确为 20:00；
- effects 精确等于：
  - office light：power=on、brightness_pct=30；
  - office purifier：level=low。

注意 purifier 的期望效果只有 `level=low`。如果在 workflow 中额外加入 `turn_on`，规范化 effects 会多出 `power=on`，与期望字典不再相等而失败；它在 setup 中本来已是 on。多加其他设备或效果也会失败。

Evaluator 不检查 workflow_id。

### 5.4 没有直接检查的媒体和当前设备状态

- 没有 evaluator 重新打开 Retro Music 核对 playlist 曲目；setup 已保证 playlist 存在，Tasks notes 只要求写 `Focus Mix was verified`。
- 没有 hard guard 检查 19:00 时 office light/purifier 保持 70/high；当前评分只看计划记录和 Tasks。
- 不会把 workflow 推进到 20:00 检查执行后的设备状态。

## 6. 常见失败与真实评测边界

- 只创建 FocusScene、不取消 cleaning：schedule active count 失败。
- 删除 cleaning 记录而不是取消：找不到 cancelled 记录，失败。
- Workflow 给 purifier 额外加入 turn_on：effects 多字段，失败。
- Tasks 漏写 playlist verified 或 cleaning plan cancelled：失败。
- 不需要播放音乐；需要验证的是预置 playlist 名称和两首曲目。

## 7. Cleanup

- android_0 清空 Retro Music，并删除 manifest CSV；
- android_1 删除 policy note，并清空 Tasks；
- home_0 reset。
