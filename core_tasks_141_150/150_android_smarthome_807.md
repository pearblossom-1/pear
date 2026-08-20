# Core 150 — android_smarthome_807

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 150 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_807.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

Android Files 的 policy 规定：living-room robot 在清扫时电量低于 25%，应立即回 dock；Markor 说明 21:00 的 `safe_pause_schedule` 与此无关，必须保持 active。Home 显示机器人正在 cleaning、电量 18%，所以要：

1. 立即让 robot vacuum 回 dock；
2. 不取消也不修改 `safe_pause_schedule`；
3. 创建精确文件 `Vacuum battery action result.md`，记录 battery=18、robot 已 dock，以及 safe pause schedule 仍 active。

## 1. Instruction

### 英文原文（逐字）

~~~text
The battery policy in the Android Files app says the robot should return to dock now, and Markor says the safe pause schedule is unrelated and should be left alone. Please handle the robot and write `Vacuum battery action result` in Markor.
~~~

### 中文翻译

Android Files app 中的电池政策说明机器人现在应返回充电座，Markor 则说明 safe pause schedule 与此无关、应保持不动。请处理机器人，并在 Markor 中写一份 `Vacuum battery action result`。

## 2. 输入、附件与初始业务数据

本任务没有短信、联系人或邮件。输入是一个 TXT policy、一份 Markor note 和 Home 状态。

### 2.1 Android Files：battery policy

`vacuum_battery_policy.txt` 上传到：

~~~text
/storage/emulated/0/Download/home/vacuum_battery_policy.txt
~~~

全文：

~~~text
If living room robot battery is below 25 percent while cleaning, return to dock now. Do not cancel safe pause schedule.
~~~

### 2.2 Markor：schedule note

`Vacuum schedule note.md` 上传到：

~~~text
/storage/emulated/0/Documents/Markor/Vacuum schedule note.md
~~~

全文：

~~~text
safe_pause_schedule at 21:00 is unrelated and should remain active.
~~~

Setup 会删除旧的结果文件：

~~~text
/storage/emulated/0/Documents/Markor/Vacuum battery action result.md
~~~

### 2.3 home_0：机器人与 schedule

当前时间：`2026-06-16T19:00:00`。

| 项目 | 初始值 |
|---|---|
| living_room_robot_vacuum_1 | power=on，status=cleaning，battery_pct=18 |

现有计划：

~~~text
schedule_id: safe_pause_schedule
run_at: 2026-06-16T21:00:00
device_id: living_room_robot_vacuum_1
command: pause
args: {}
status: active
~~~

初始 workflows 和 history 为空。

## 3. Setup 具体流程

### android_0

1. 确保 Android Files 可用并上传 battery policy；
2. 确保 Markor 可用并上传 `Vacuum schedule note.md`；
3. 删除旧的 `Vacuum battery action result.md`。

### home_0

使用 `android_smarthome_807/episode_config.json` reset Home，写入 cleaning/18% 的机器人和 active safe-pause schedule。

Setup 不会让机器人回 dock，也不会创建结果 note。

## 4. 正确输出

### 4.1 Home

`living_room_robot_vacuum_1` 最终：

~~~text
power: off
status: docked
~~~

Oracle 执行 `return_to_dock`。

### 4.2 Markor 结果

精确路径：

~~~text
/storage/emulated/0/Documents/Markor/Vacuum battery action result.md
~~~

Oracle 示例全文：

~~~text
# Vacuum battery action result
Battery was 18 percent. The robot returned to the dock.
The safe_pause_schedule remained active.
~~~

### 4.3 Home schedule

`safe_pause_schedule` 必须保留原字段和 active 状态。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 3 个 evaluator，全部必须成功：

1. 精确路径上的 Markor 结果 note；
2. robot 最终 docked；
3. safe pause schedule 保持为唯一 active schedule 的 hard guard。

第 3 项 `enable_score_calc=false`，不进入平均分，但失败会令整体失败并把总分置 0。

### 5.1 Markor note 是 entity-relation 匹配

Evaluator 直接读取精确路径的全文，并要求结果为 `pass`。正文必须命中每个实体组：

- `battery`；
- `18` 或 `18 percent`；
- `robot` 或 `vacuum`；
- `dock` 或 `docked`；
- `safe pause schedule` 或 `safe_pause_schedule`；
- `active`。

还必须：

- 至少出现 `returned`、`sent to`、`is docked`、`docked` 之一；
- 必须出现 `remains`、`remained`、`kept`、`left` 之一；
- 不得出现 `pending`、`cancelled`、`canceled`、`inactive`、`not active`、`not docked`、`did not return`。

这不是整篇绝对匹配，不要求 Oracle 的标题行或句序。本规则没有 relation group，所以信息可以分行，也不要求全部在同一个 clause；但文件名与路径必须精确。通用 scorer 仍会拒绝问句、不确定、否定和撤销语义。

### 5.2 Robot 最终状态

`smarthome.check_device_state` 按子集检查：

- power=`off`；
- status=`docked`。

Evaluator 不检查最终 battery_pct 是否仍为 18，也不检查必须调用哪个命令。

### 5.3 Schedule 保留 hard guard

`smarthome.check_schedule_count` 要求：

- 与 `safe_pause_schedule`、21:00、robot、`pause`、args={}、active 全字段匹配的记录恰好 1 条；
- Home 全部 schedules 中 active 状态总数恰好为 1。

因此取消、改时、删除、复制该 schedule，或新增另一条 active schedule，都会失败。实现不要求 schedules 总列表只能有一条；额外非 active、非匹配记录理论上不影响该规则。

## 6. 常见失败与真实评测边界

- 因为机器人已经 dock 就顺手取消 21:00 pause：hard guard 失败。
- 只停止 cleaning 但 status 不是 docked：设备状态失败。
- Note 写“battery low”但不写 18：失败。
- Note 写 schedule `inactive` 或 `cancelled`：冲突短语直接失败。
- 结果 note 保存为相似文件名或其他目录：精确路径读取不到，失败。

## 7. Cleanup

- android_0 删除 battery policy、输入 schedule note 和结果 note；
- home_0 reset。
