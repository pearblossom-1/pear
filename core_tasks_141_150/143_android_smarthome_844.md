# Core 143 — android_smarthome_844

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 143 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_844.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：hard
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

默认规则会为 front entrance 准备 living-room light，但第二台手机当天的 CSV 明确给出 `SIDE-GATE`，因此当天路线覆盖默认入口。Guest 20:40 到达，CSV 要求提前 20 分钟准备，所以要：

1. 取消 Home 中 20:10 的默认 front-entry schedule；
2. 新建 20:20 打开 `hallway_light_1` 的 active schedule；
3. 在第二台手机的 Simple Calendar Pro 新建 `Route prep result`，时间段为 20:20–20:40。

## 1. Instruction

### 英文原文（逐字）

~~~text
The first phone's Markor note describes the default entrance. On the second phone, Android Files has today's route code and Simple Calendar Pro has the guest arrival. Use the current route to cancel the default front-entry prep, schedule the correct entrance 20 minutes before arrival, and add `Route prep result` to Simple Calendar Pro for that prep window.
~~~

### 中文翻译

第一台手机的 Markor note 描述了默认入口。第二台手机的 Android Files 中有今天的路线代码，Simple Calendar Pro 中有访客到达事件。使用当前路线取消默认的前门准备，在到达前 20 分钟安排正确入口的准备，并在 Simple Calendar Pro 中为这段准备窗口添加 `Route prep result`。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。输入包括一份 Markor 文件、一份 CSV、一个预置日历事件和 Home 中的一条默认 schedule。

### 2.1 android_0：默认入口 note

`Default entrance.md` 上传到：

~~~text
/storage/emulated/0/Documents/Markor/Default entrance.md
~~~

全文：

~~~text
Default arrival prep uses front living room light unless a same-day route code overrides it.
~~~

即：同日 route code 优先于默认 front living-room light。

### 2.2 android_1：路线 CSV

`today_route_code.csv` 上传到：

~~~text
/storage/emulated/0/Download/home/today_route_code.csv
~~~

完整内容：

~~~csv
route_code,entrance,prep_offset_min
SIDE-GATE,side hallway,20
~~~

### 2.3 android_1：预置 Calendar 事件

Calendar 会先被清空，再加入：

| 字段 | 内容 |
|---|---|
| title | Guest arrival via side gate |
| start | 2026-06-16 20:40（`1781642400`） |
| end | 2026-06-16 21:00（`1781643600`） |
| location | Home |
| description | Use route code SIDE-GATE from Files. |

因此 prep window 是到达前 20 分钟，即 20:20–20:40。

### 2.4 home_0：默认计划

Home 当前时间：`2026-06-16T19:00:00`。

| 项目 | 初始值 |
|---|---|
| living_room_light_1 | power=off |
| hallway_light_1 | power=off |

现有 schedule：

~~~text
schedule_id: front_default_prep
run_at: 2026-06-16T20:10:00
device_id: living_room_light_1
command: turn_on
args: {}
status: active
~~~

初始 workflows 和 history 为空。

## 3. Setup 具体流程

### android_0

确保 Markor 可用并上传 `Default entrance.md`。

### android_1

1. 确保 Android Files 可用并上传 `today_route_code.csv`；
2. 确保 Simple Calendar Pro 可用；
3. 清空 Calendar；
4. 创建 `Guest arrival via side gate` 输入事件。

### home_0

使用 `android_smarthome_844/episode_config.json` reset Home，写入两盏灯和默认 active schedule。

Setup 不会创建结果事件，不会取消默认计划，也不会创建 side route 计划。

## 4. 正确输出

### 4.1 Calendar 结果事件

| 字段 | 正确值 |
|---|---|
| title | Route prep result |
| start | `1781641200` = 2026-06-16 20:20 |
| end | `1781642400` = 2026-06-16 20:40 |
| location | Home |

Oracle description 是：

~~~text
Default front entrance ignored; route SIDE-GATE selected; side hallway prep active at 20:20.
~~~

但 description 不在 evaluator 的检查字段中。

### 4.2 Home schedules

- `front_default_prep` 保留记录但 status 变为 `cancelled`；
- 新建 20:20 的 active schedule，目标 `hallway_light_1`，command=`turn_on`，args={}。

Oracle 给新计划使用 `side_route_prep`，但 evaluator 不检查新计划的 schedule_id。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 3 个 evaluator，全部必须成功：

1. Calendar 结果事件；
2. 默认 front schedule 已取消；
3. 正确 side schedule 存在且全 Home 恰好只有一个 active schedule。

### 5.1 Calendar 是字段精确匹配

Evaluator 以 `title` 作为唯一身份字段：

- Calendar 中标题规范化后等于 `Route prep result` 的事件必须恰好 1 条；
- 该事件的 title、start_ts、end_ts、location 必须分别匹配上表。

Calendar 文本默认大小写敏感，但会做 NFC 和连续空白规范化，所以 `route prep result` 会失败，额外空格通常不会。时间戳是秒级整数，必须精确；不能写成 20:20–21:00。

不检查 description、reminder 或 repeat 字段，也不要求 Calendar 只有这一条事件。Evaluator 也没有检查原始 `Guest arrival via side gate` 是否仍保留。

### 5.2 默认 schedule 的取消状态

`smarthome.check_schedule_status` 在 schedules 列表中寻找一条同时匹配：

- schedule_id=`front_default_prep`；
- run_at=`2026-06-16T20:10:00`；
- device_id=`living_room_light_1`；
- command=`turn_on`；
- args={}；
- status=`cancelled`。

实现把 `canceled` 和 `cancelled` 规范为同一状态。

### 5.3 新 side schedule 与 active 总数

`smarthome.check_schedule_count` 要求：

- 匹配 20:20、`hallway_light_1`、`turn_on`、args={}、active 的 schedule 恰好 1 条；
- 全部 schedules 中 active 状态总数恰好为 1。

新 schedule 的 ID 不在 match 中，所以不必叫 `side_route_prep`。默认计划若仍 active，active 总数会变成 2，导致失败。额外的非匹配 cancelled 记录不受这条规则的总长度约束。

### 5.4 没有检查的 Home 状态

Evaluator 没有检查两盏灯当前的 power，也没有 command-history guard；真正检查的是计划记录，不是 19:00 时已经把 hallway light 打开。

## 6. 常见失败与真实评测边界

- 按默认入口创建 living-room 计划：side schedule 失败。
- 用 arrival=20:40 直接作为 prep 时间：应提前 20 分钟，正确时间是 20:20。
- 只新增 side schedule、不取消默认：active 总数为 2，失败。
- Calendar 结束时间写成 21:00：结果事件失败；prep window 到 20:40 截止。
- Calendar description 可以自由写，甚至留空也不影响当前 evaluator。

## 7. Cleanup

- android_0 删除 `Default entrance.md`；
- android_1 删除 CSV 并清空 Calendar；
- home_0 reset。
