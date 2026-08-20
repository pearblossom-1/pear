# Core 136 — android_smarthome_357

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 136 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_357.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：hard
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

需要把两台手机上的信息拼起来：

1. android_0 的 Tasks 告诉你 Mira 20:30 到达，提前 30 分钟准备，所以 workflow 时间是 20:00。
2. android_0 的 OsmAnd favorite 告诉你入口叫 `Guest Entrance`。
3. android_1 的联系人告诉你 Mira 使用 guest room，偏好 23 C、灯光 48%，号码是 5550357。
4. 在 Home 创建 20:00 的三步 guest-room workflow。
5. 在 android_1 创建 `Mira guest prep log` Markor note，并向 5550357 发送 guest room + 20:00 的短信。

Workflow 是未来计划，当前 19:00 时不能立刻改变 heater 或 light。

## 1. Instruction

### 英文原文（逐字）

~~~text
The first phone has Mira's arrival task and OsmAnd favorite, and the second has her contact and room preferences. Schedule the guest-room prep 30 minutes before arrival, record the entrance, scheduled time, temperature, and light setting in a Markor note titled `Mira guest prep log`, then text Mira the room and prep time.
~~~

### 中文翻译

第一台手机上有 Mira 的到达任务和 OsmAnd 收藏点，第二台手机上有她的联系人与房间偏好。把 guest-room 准备安排在到达前 30 分钟；在标题为 `Mira guest prep log` 的 Markor note 中记录入口、计划时间、温度和灯光设置，然后给 Mira 发短信，告诉她房间和准备时间。

## 2. 输入、附件与初始业务数据

本任务没有邮件，也没有预置的输入短信。短信是任务要求创建的输出。

### 2.1 android_0：Tasks 输入

Tasks 在 setup 前会被清空，然后加入：

| 字段 | 内容 |
|---|---|
| title | Mira arrival HOME-G |
| notes | Route code HOME-G arrives 2026-06-16T20:30:00. Prepare 30 minutes before. |
| dueDate | 0 |
| completed | 0 |

所以 arrival=20:30，prep=20:00。

### 2.2 android_0：OsmAnd favorite

上传的 `favorites.gpx` 完整业务内容只有一个 waypoint：

| 字段 | 内容 |
|---|---|
| name | Guest Entrance |
| latitude | 47.621100 |
| longitude | -122.350100 |

GPX version=1.1，creator=OsmAnd。

### 2.3 android_1：联系人

Contacts 会先被清空，然后加入：

| 字段 | 内容 |
|---|---|
| name | Mira Visitor |
| number | 5550357 |
| notes | Prefers guest room 23 C and light 48%. |

该 note 同时给出房间、温度和灯光参数。

### 2.4 android_1：Markor 与 SMS 初始状态

- 旧的 `/storage/emulated/0/Documents/Markor/Mira guest prep log.md` 会被删除；
- Simple SMS Messenger 的短信数据库会被清空；
- 因此 setup 后没有现成的结果 note，也没有可误用的旧 sent SMS。

### 2.5 Home 初始状态

当前时间：2026-06-16 19:00。

| 项目 | 初始值 |
|---|---|
| guest_room | temperature=21.9 C，brightness=500 lux，occupied=false |
| guest_room_heater_1 | power=off，target_temperature_c=20.0 |
| guest_room_dimmable_light_1 | power=off，brightness_pct=0 |

初始 schedules、workflows、history 均为空。

## 3. Setup 具体流程

### android_0

1. 确保 Tasks 可用并清空 Tasks。
2. 创建 Mira arrival task。
3. 确保 OsmAnd 可用并初始化 favorites。
4. 上传 `favorites.gpx` 到 OsmAnd favorites 目录。

### android_1

1. 确保 Contacts 可用并清空 Contacts。
2. 创建 `Mira Visitor` 联系人。
3. 确保 Markor 可用并删除旧结果 note。
4. 确保 Simple SMS Messenger 可用并清空短信。

### home_0

使用 `android_smarthome_357/episode_config.json` reset Home。

Setup 不会替你创建 workflow、结果 note 或输出短信。

## 4. 正确输出

### 4.1 Home workflow

计划时间：`2026-06-16T20:00:00`，状态 active。

三步：

| 设备 | command | args |
|---|---|---|
| guest_room_heater_1 | turn_on | {} |
| guest_room_heater_1 | set_target_temperature | temperature_c=23.0 |
| guest_room_dimmable_light_1 | set_brightness | brightness_pct=48 |

Oracle 使用 workflow_id `mira_guest_prep`，但 evaluator 不检查这个 ID。

### 4.2 Markor note

Oracle 示例：

~~~text
Mira guest-room prep is scheduled for 20:00 at Guest Entrance.
Set the room to 23 C with the light at 48%.
~~~

文件必须保存为：

~~~text
/storage/emulated/0/Documents/Markor/Mira guest prep log.md
~~~

### 4.3 输出短信

收件号码：`5550357`。Oracle 示例正文：

~~~text
guest room prep is scheduled for 20:00
~~~

不要求逐字照抄，但必须同时说清 guest room、20:00 和准备已安排。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 5 个 evaluator，全部必须成功：

- Markor note；
- sent SMS；
- Home workflow；
- heater 没有立即改变的硬性 guard；
- dimmable light 没有立即改变的硬性 guard。

最后两项 `enable_score_calc=false` 仍会参与 success，失败会把总分置为 0。

### 5.1 Markor note 的语义匹配

Evaluator 直接读取精确路径 `Mira guest prep log.md`，然后执行 entity-relation，不是整篇逐字匹配。

正文必须包含：

- `Guest Entrance`；
- `20:00`；
- `23 C` 或 `23C`；
- `48%` 或 `48 percent`；
- `scheduled`、`prepared`、`planned` 至少一个。

不能出现 `not scheduled`、`cancelled`、`pending`。问句、明显不确定、否定或撤销表达也可能被通用规则拒绝。

本规则没有 relation group，所以这些值可以分行出现，不要求同一个 clause，也不要求 Oracle 的句序。匹配会做大小写/空白规范化，但文件路径和文件名本身必须精确。

### 5.2 sent SMS

Evaluator 在 sent box 中查找地址为 5550357 的消息。号码比较会规范化电话号码字符。

正文必须包含：

- `guest room`、`guest-room`、`guest bedroom` 之一；
- `20:00`；
- `prep`、`preparation`、`prepared`、`ready`、`scheduled` 之一。

不能出现 `pending`、`not prepared`、`not ready`、`cancelled`、`failed`。

它只要求“至少有一条匹配短信”，不要求 sent box 中恰好只有一条，也不要求 Oracle 正文逐字一致。

### 5.3 Home workflow

Home 的 workflow 列表中必须存在一条：

- run_at=`2026-06-16T20:00:00`；
- status=`active`；
- steps 恰好为上述 3 项。

Steps 列表长度必须是 3。当前规则没有 `steps_ordered`，而这三步没有触发实现中的同字段顺序冲突，所以 evaluator 把它们作为无序集合匹配。正常操作仍应按“开 heater → 设温度 → 调灯”创建。

Evaluator 不检查 workflow_id，也不检查 workflow 总数；额外字段可以存在。

### 5.4 当前设备不能提前变化

两个 hard guard 分别把下列完整 state dictionary 与 setup baseline 比较：

- guest_room_heater_1；
- guest_room_dimmable_light_1。

所以 19:00 评测时 heater 必须仍是 off/20 C，light 必须仍是 off/0%。创建 future workflow 不应立即执行这些步骤。

### 5.5 没有检查的输入

Evaluator 不再单独检查 arrival task、OsmAnd favorite 或 contact 是否仍存在；它们是 setup 保证的输入源。没有 schedule-count、workflow-count 或 SMS exact-count 检查。

## 6. 常见失败与真实评测边界

- 把 20:30 当成 prep time：note、SMS、workflow 都会错。
- 忘记 `Guest Entrance`：note 失败。
- 短信发给联系人名字但实际号码不是 5550357：SMS 失败。
- 只创建三个独立 schedule，而不是一条三步 workflow：workflow 失败。
- 立即把 heater/light 改到目标值：两个 no-change guard 失败。
- Note 标题看起来相同，但保存到其他目录或没有 `.md`：精确路径读取失败。

## 7. Cleanup

- android_0 清空 Tasks，并删除 OsmAnd favorites 文件及备份。
- android_1 清空 Contacts、删除结果 note、清空 SMS。
- home_0 reset。

