# Core 106 — linux_smarthome_454

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 106 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_454.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：hard
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

当前时间 22:00，正处于 21:30–06:30 安静时段。图片把 Bedroom 标成 quiet area；Home 中 bedroom robot 正在 cleaning，22:30 还有 active schedule，23:00 还有 active workflow，三项都会在安静房间造成冲突。

所以必须：

1. pause 当前 bedroom robot，保留 power=on、battery=64；
2. cancel 22:30 schedule，保留记录但状态改为 cancelled；
3. cancel 23:00 workflow，保留记录但状态改为 cancelled；
4. HTML 表单选择 paused / cancelled / cancelled / 64%，再点击 Submit。

## 1. Instruction

### 英文原文（逐字）

~~~text
Enforce the quiet-cleaning rules using `/tmp/cleaning/map.png` and `/home/user/cleaning/quiet.html`. Resolve the current and future bedroom cleaning conflicts in SmartHome, record each outcome and the current vacuum battery level in the form, then submit the page.
~~~

### 中文翻译

使用 /tmp/cleaning/map.png 和 /home/user/cleaning/quiet.html 执行安静清洁规则。解决 SmartHome 中当前及未来的卧室清洁冲突，在表单中记录每项结果和当前吸尘器电量，然后提交页面。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 map.png 的详细视觉内容

图片标题为 Quiet cleaning map。平面图从左到右是：

- Nursery：红色阴影；
- Bedroom：红色阴影；
- Hallway：白色；
- Living room：白色。

底部红框文字为 Quiet area 21:30-06:30。也就是说 Nursery 和 Bedroom 属于安静区，Hallway 和 Living room 未标成安静区。本题实际存在冲突的是 Bedroom。

### 2.2 quiet.html 的完整业务内容

页面标题和 H1：Quiet cleaning rule。

页面列出：

- Quiet area 21:30-06:30.
- Pause current conflict cleaning.
- Cancel future schedule or workflow that targets quiet rooms.

表单四个字段及选项：

| 字段 | 可选项 |
|---|---|
| Current cleaning | Left unchanged / Paused |
| Future schedule | Kept active / Cancelled |
| Future workflow | Kept active / Cancelled |
| Current vacuum battery | 55% / 64% / 82% |

Submit 按钮会把四个选择写入 URL query，并添加 #submitted-quiet-cleaning。

### 2.3 SmartHome 初始状态

当前时间：2026-06-16 22:00。

bedroom_robot_vacuum_1：

    power = on
    status = cleaning
    battery_pct = 64

唯一 schedule：

    schedule_id = bedroom_clean_2230
    run_at = 2026-06-16T22:30:00
    device_id = bedroom_robot_vacuum_1
    command = start_cleaning
    args = {}
    status = active

唯一 workflow：

    workflow_id = bedroom_night_clean
    run_at = 2026-06-16T23:00:00
    steps = bedroom_robot_vacuum_1 / start_cleaning / {}
    status = active

初始 history 为空。

## 3. Setup 具体流程

### linux_0

1. 删除旧 map.png 和 quiet.html；
2. 创建 /tmp/cleaning 与 /home/user/cleaning；
3. 上传图片和 HTML。

### home_0

从 episode_config.json 重置 Home，恢复 22:00、正在 cleaning 的 bedroom robot、22:30 schedule、23:00 workflow 和空 history。

Setup 不会自动在浏览器中打开图片或 HTML。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

Home 最终要显示 robot paused、电量仍为 64，两个未来计划都从 active 变成 cancelled；浏览器中恰好打开提交后的完整 URL；直接设备命令总数恰好 1。

### 4.1 当前 robot 状态

bedroom_robot_vacuum_1 必须满足：

    power = on
    status = paused
    battery_pct = 64

pause 是正确动作。关机或 return to dock 都不满足。

### 4.2 schedule 状态

必须保留并匹配同一条记录：

    bedroom_clean_2230
    2026-06-16T22:30:00
    bedroom_robot_vacuum_1
    start_cleaning
    args={}
    status=cancelled

删除记录而不是 cancel 会失败。

### 4.3 workflow 状态

必须保留：

    workflow_id=bedroom_night_clean
    run_at=2026-06-16T23:00:00
    step=bedroom_robot_vacuum_1 / start_cleaning / {}
    status=cancelled

### 4.4 提交后的浏览器 URL

忽略浏览器默认 tab 后，非默认 tab 列表必须匹配这一条完整 URL：

    file:///home/user/cleaning/quiet.html?current=paused&future_schedule=cancelled&future_workflow=cancelled&battery=64#submitted-quiet-cleaning

评测会保留 query 和 fragment；字段顺序、值、加号/百分号编码形式都应由原页面 Submit 按钮生成。只在表单里选择但不点击 Submit，会缺 query/hash，失败。

同时，非默认 tab 数量也必须与期望列表相同；额外打开另一个普通 tab 可能导致失败。

### 4.5 全局命令数

Home command history 总数必须恰好为 1，即 pause robot。cancel_schedule 和 cancel_workflow 是计划管理操作，不计入直接设备 command history。

本任务没有 schedule/workflow 总数检查，只查指定记录的 cancelled 状态；因此额外创建其他计划理论上可能不被发现，但违反任务要求。

## 5. 常见失败与真实评测边界

- 把 robot 关机而不是 paused：失败。
- 删除 22:30 schedule 或 23:00 workflow：找不到 cancelled 记录，失败。
- 表单 battery 选 55 或 82：URL 不匹配。
- 选择正确但没点 Submit：URL 不匹配。
- 手工编辑 URL 时调换 query 顺序：当前 URL 比较保留 query 字符串，可能失败。
- 对 robot 发 pause 以外的额外命令：history 不再等于 1。

图片中 Nursery 也属于 quiet area，但本题没有 nursery cleaning 计划；Evaluator 只检查 bedroom 相关结果。

## 6. Cleanup

- Linux 删除 map.png 和 quiet.html，并尝试删除空目录；
- Home reset。
