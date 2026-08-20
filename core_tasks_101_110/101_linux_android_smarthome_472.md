# Core 101 — linux_android_smarthome_472

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 101 项
- 任务文件：tasks/cross_device/linux_android_smarthome/linux_android_smarthome_472.json
- 运行配置：configs/cross_device/local_2android_linux_smarthome.json
- 难度：hard
- 设备拓扑：2A+1L+1H（android_0、android_1、linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

这题要把三个来源拼在一起：

1. 第一台手机 Retro Music 中实际存在的播放列表是 Sleep Sounds，歌曲为 sleep_sounds_one 和 sleep_sounds_two；
2. 第二台手机日历中的 Sleep Sounds scene 是 guest room 场景，时间戳对应 2026-06-16 20:10–20:40 UTC；
3. Linux CSV 中有两行同一房间、同一运行时间的候选场景，必须靠播放列表名称选中 Sleep Sounds 那一行。

正确结果是：在 20:10 创建一个 active SmartHome workflow，依次打开 guest-room dimmable light、把亮度设为 35%、把 curtain 设为 50%；同时在第二台手机新建 Sleep Sounds result.md，写清播放列表、房间、20:10 和已经 scheduled。

## 1. Instruction

### 英文原文（逐字）

~~~text
Set up tonight's guest-room music scene. Use the actual playlist in Retro Music on the first phone together with the guest-room time in Simple Calendar Pro on the second phone to select the matching row in `/tmp/home_ops/room-updates/source/music_scene.csv`, then schedule that SmartHome scene. On the second phone, create a Markor note titled `Sleep Sounds result` recording the playlist, room, and scheduled result.
~~~

### 中文翻译

设置今晚的客房音乐场景。使用第一台手机 Retro Music 中的实际播放列表，并结合第二台手机 Simple Calendar Pro 中客房事件的时间，在 /tmp/home_ops/room-updates/source/music_scene.csv 中选择匹配行，然后安排对应的 SmartHome 场景。在第二台手机上创建标题为 Sleep Sounds result 的 Markor 笔记，记录播放列表、房间和已安排结果。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 Linux CSV

运行时路径：/tmp/home_ops/room-updates/source/music_scene.csv

~~~csv
playlist,room,run_at,light_pct,curtain_pct
Sleep Sounds,guest_room,20:10,35,50
Evening Wind Down,guest_room,20:10,20,0
~~~

两行的 room 和 run_at 相同，不能只看“客房 + 20:10”；必须用 Retro Music 中实际播放列表 Sleep Sounds 选第一行。

### 2.2 第一台 Android：Retro Music

Setup 会：

- 清空 Retro Music；
- 推入 sleep_sounds_one、sleep_sounds_two 两个音频条目；
- 创建唯一同名播放列表 Sleep Sounds，并把这两首歌加入其中。

asset 目录中另有 Sleep Sounds.txt，内容也是上述两个曲名，但当前 task setup 没有把这个 TXT 上传到手机或 Linux。它不是运行时附件，评测也不读取它。

### 2.3 第二台 Android：日历事件

Simple Calendar Pro 会被清空并加入：

| 字段 | 内容 |
|---|---|
| title | Sleep Sounds scene |
| start | 2026-06-16 20:10 UTC |
| end | 2026-06-16 20:40 UTC |
| location | guest room |
| description | Use the playlist scene. |

日历只提供上下文；最终运行时间仍以匹配到的 CSV 行和 evaluator 中的 20:10 为准。

### 2.4 第二台 Android：Markor 输出

要求新建的实际文件路径是：

    /storage/emulated/0/Documents/Markor/Sleep Sounds result.md

初始没有这个文件。内容不用逐字照抄固定句子，但必须表达 Sleep Sounds、guest room、20:10 和“已经安排”。

### 2.5 SmartHome 初始状态

当前时间：2026-06-16 18:00；初始 schedules、workflows、history 都为空。

相关设备：

| 设备 | 初始状态 |
|---|---|
| guest_room_dimmable_light_1 | off，brightness_pct=10 |
| guest_room_curtain_1 | open_pct=100，status=open |

同一 Home 还有 bedroom 和 living-room 设备，但本题不要求操作它们。

## 3. Setup 具体流程

### linux_0

1. 删除旧 music_scene.csv；
2. 创建 /tmp/home_ops/room-updates/source；
3. 上传上述 CSV。

### android_0

1. 确保 Retro Music 已安装；
2. 清空旧媒体/播放列表；
3. 推入两首测试音频；
4. 创建 Sleep Sounds 播放列表并加入两首歌。

### android_1

1. 确保 Simple Calendar Pro 已安装并清空旧事件；
2. 加入 Sleep Sounds scene；
3. 确保 Markor 已安装，但不会自动创建结果笔记。

### home_0

从 episode_config.json 重置 Home，写入 18:00 的房间、设备状态，以及空的 schedule/workflow/history。

Setup 不会自动打开 CSV、日历或 Markor。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

必须同时满足：

1. Sleep Sounds 播放列表仍存在，且歌曲集合正好是两首指定歌曲；
2. Markor 中存在准确文件名 Sleep Sounds result.md，正文说清 Sleep Sounds、guest room、20:10 和 scheduled；
3. Home 中存在一条 20:10 的 active workflow，步骤与 CSV 第一行完全对应。

### 4.1 CSV 来源守护

Evaluator 对 CSV 文本做大小写敏感的子串检查，要求仍能找到：

    playlist,room,run_at,light_pct,curtain_pct
    Sleep Sounds,guest_room,20:10,35,50

它没有检查 Evening Wind Down 行，也不要求修改 CSV。这一项 enable_score_calc=false，作用主要是确认来源仍在。

### 4.2 Retro Music 播放列表

Getter 会：

- 对播放列表名做大小写不敏感、连续空白归一化匹配；
- 要求恰好有一个匹配 Sleep Sounds 的播放列表；
- 要求歌曲多重集合恰好为 sleep_sounds_one 和 sleep_sounds_two；
- 不要求歌曲顺序；
- 允许存在其他不同名称的播放列表。

外层 exact_match 比较的只是 getter 返回的 present，不是要求界面文本逐字匹配。

### 4.3 Markor 笔记

Evaluator 读取上述固定路径，并做语义关系检查：

- 必须出现 Sleep Sounds；
- 必须出现 guest room 或 guest_room；
- 必须出现 20:10；
- 必须至少出现 scheduled、arranged、planned 中一个；
- 出现 not scheduled、cancelled 或 pending 会失败；
- 疑问、明显不确定或反转语义也会失败。

可通过示例：

    Sleep Sounds for the guest room is scheduled for 20:10.

不是整段绝对匹配，大小写和自然措辞可以变化；但文件名和路径必须准确。

### 4.4 SmartHome workflow

必须找到一条满足以下内容的 active workflow：

    run_at = 2026-06-16T20:10:00
    step 1 = guest_room_dimmable_light_1 / turn_on / {}
    step 2 = guest_room_dimmable_light_1 / set_brightness / {brightness_pct: 35}
    step 3 = guest_room_curtain_1 / set_open_pct / {open_pct: 50}
    status = active

workflow_id 没有被 evaluator 固定。因为前两步作用于同一灯且状态字段有重叠，当前实现会要求这三步保持上述顺序。

### 4.5 没有检查的部分

- 没有 Calendar evaluator；日历是用于推理的输入上下文。
- 没有 workflow 总数检查，因此额外 workflow 理论上不会被这一项拒绝。
- 没有直接设备命令历史或即时设备状态检查；目标是创建未来 workflow，不是立刻改变房间。

## 5. 常见失败与真实评测边界

- 选到 Evening Wind Down 行，亮度写 20、窗帘写 0：workflow 失败。
- 只创建三个独立 schedule，而不是一个含三步的 workflow：失败。
- 笔记写“pending”或“not scheduled”：失败。
- 笔记写对但文件名不是 Sleep Sounds result.md：固定路径读取不到，失败。
- 改了播放列表歌曲或留下两个同名 Sleep Sounds：playlist getter 失败。

最稳妥做法是只创建一条目标 workflow，不添加其他计划。

## 6. Cleanup

- Linux 删除 music_scene.csv 并尝试删除空目录；
- android_0 清空 Retro Music；
- android_1 清空日历并删除 Sleep Sounds result.md；
- Home reset。
