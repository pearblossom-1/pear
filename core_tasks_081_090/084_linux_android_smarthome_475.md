# Core 084 — `linux_android_smarthome_475`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 84 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_475.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 难度：hard
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

第一台手机的 `Quiet Piano` playlist 含 `quiet_piano_one` 和 `quiet_piano_two`；CSV 的 `required_tracks` 与这两个 track 完全对应，并把它们映射为“取消 20:00 旧 vacuum plan、打开房间灯”；第二台手机的同名 Calendar scene 把房间确定为 bedroom。于是应取消 `old_music_vacuum_475`、立即打开 `bedroom_light_1`，并在第二台手机的 Markor 写出这次变更。

## 1. Instruction

### 英文原文（逐字）

```text
Please set up the bedroom for the `Quiet Piano` scene. Match the playlist on the first phone to its Calendar event on the second using `/tmp/home_ops/comfort-checks/source/music_scene.csv`. Retire the obsolete music-vacuum workflow, turn on the bedroom light requested by the scene, and leave a short record of what changed in Markor on the second phone as `Quiet Piano decision.md`.
```

### 中文翻译

为卧室设置 `Quiet Piano` 场景。利用 Linux 上的 CSV，把第一台手机中的 playlist 与第二台手机的日历事件对应起来；停用已经过时的音乐—吸尘 workflow，打开场景要求的卧室灯，并在第二台手机的 Markor 中创建 `Quiet Piano decision.md`，简短记录做了哪些变更。

## 2. 输入、附件与初始业务数据

### 2.1 第一台 Android：音乐数据

Retro Music 在 setup 时会被清空，然后推入两首测试音频：

```text
quiet_piano_one
quiet_piano_two
```

并创建 playlist：

- playlist 名称：`Quiet Piano`
- 曲目：`quiet_piano_one`、`quiet_piano_two`

资产目录中的 `Quiet Piano.txt` 也逐行列出同样两个 track ID，但 setup 没有把这个文本文件上传到任何设备；执行者实际可见的输入是 Retro Music 中的 playlist。评测不听音频内容，只把 playlist 名称和成员当作跨设备匹配线索。

### 2.2 第二台 Android：日历与 Markor

- 日历事件：`Quiet Piano scene`
- 时间：2026-06-16 20:30–21:00
- 地点：`bedroom`
- 描述：`Use the playlist scene.`
- 目标笔记：`/storage/emulated/0/Documents/Markor/Quiet Piano decision.md`

目标笔记在 setup 时会被删除，必须重新创建。

### 2.3 Linux CSV 原文

路径：`/tmp/home_ops/comfort-checks/source/music_scene.csv`

```csv
required_tracks,previous_vacuum_time,decision,light_command
quiet_piano_one + quiet_piano_two,20:00,cancel old vacuum plan,turn on room light
```

它把两首歌的组合映射为：取消 20:00 的旧 vacuum plan，并打开对应房间的灯。

### 2.4 SmartHome 初始状态

当前时间 `2026-06-16 18:00`：

- `bedroom_light_1`：off；
- `bedroom_robot_vacuum_1`：power=on、status=docked、battery=75；
- 旧 workflow：

```text
workflow_id=old_music_vacuum_475
run_at=2026-06-16T20:00:00
step=bedroom_robot_vacuum_1 start_cleaning
status=active
```

初始无 schedule。

## 3. Setup 具体流程

### `linux_0`

创建 CSV 所在目录并上传 `music_scene.csv`。

### `android_0`

确保 Retro Music 可用，清空音乐库，推入两首音频并建立 `Quiet Piano` playlist。

### `android_1`

清空日历后加入 `Quiet Piano scene`；确保 Markor 可用并删除旧目标笔记。

### `home_0`

重置为卧室灯关闭、旧吸尘 workflow 仍启用的状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator。

### 4.0 先说人话：怎样才算通过

1. 取消 `old_music_vacuum_475`；
2. 立即把 `bedroom_light_1` 打开；
3. 在第二台手机建立指定 Markor 笔记，写清 Quiet Piano 对应卧室、旧 vacuum 已取消、灯已经打开。

最稳妥的笔记：

```text
Quiet Piano bedroom decision applied: the old music vacuum workflow was cancelled and the bedroom light turned on.
```

### 4.1 Markor 笔记 evaluator

- 只读取第二台手机上的精确文件路径。
- 正文必须分别含：
  - `Quiet Piano`；
  - `bedroom`；
  - `old vacuum` 或 `music vacuum`；
  - `light on` 或 `light turned on`；
  - `applied/complete` 中至少一个；
  - `cancelled/retired` 中至少一个。
- 出现 `pending`、`proposed`、`light not on` 或 `vacuum remains active` 会失败；问句、不确定或否定关系也会失败。
- 不要求逐字照抄示例，也不要求笔记写出两首 track ID 或 20:00。

### 4.2 旧 workflow evaluator

查找 `workflow_id=old_music_vacuum_475`，最终状态必须是 `cancelled`。

### 4.3 卧室灯 evaluator

直接读取 `bedroom_light_1` 的最终状态，要求 `power=on`。这里要求的是立即改变设备状态，不是再建立一个开灯 workflow。

## 5. 常见失败与真实评测边界

- 在第一台手机而非第二台手机创建 Markor 文件，或文件名不精确：笔记 getter 找不到，失败。
- 让吸尘器立即停止，却没有取消 `old_music_vacuum_475`：旧 workflow 仍 active，失败。
- 新建一个未来开灯 workflow，而未把灯立即改为 on：灯状态 evaluator 仍看到 off，失败。
- 笔记只提 Quiet Piano 和灯，没有提 old/music vacuum 与 cancelled/retired：失败。

Evaluator 不重新核验 Retro Music playlist 的最终内容，也不核验 Calendar 事件；它们只提供跨设备推导线索。它没有限制全局 active workflow 总数，只检查指定旧 workflow 已 cancelled，因此额外无关 workflow 未必被发现。它也不要求改变吸尘器的当前设备状态，只要求取消 20:00 的启动计划。

## 6. Cleanup

- Linux 删除 `music_scene.csv`，并尝试移除其 `source` 目录。
- 第一台 Android 清空 Retro Music 数据。
- 第二台 Android 清空 Calendar，并删除 `Quiet Piano decision.md`。
- SmartHome reset。
