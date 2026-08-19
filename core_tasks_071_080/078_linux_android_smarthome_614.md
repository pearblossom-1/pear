# Core 078 — `linux_android_smarthome_614`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 78 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_614.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`
- 设备拓扑：`2A+1L+1H`（`android_0`、`android_1`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与冲突决策

第一部手机的图片记录“昨天继续清扫”，第二部手机今天收到已认证 Owner 的 stop+dock 请求。Linux priority policy 明确规定最新 authenticated Owner request 优先；若请求冲突，停止清扫并 dock。最终要改变 living-room robot 状态，并向 Owner 回复 dock 结果。

## 1. Instruction

### 英文原文（逐字）

```text
The first phone has yesterday's continue-cleaning photo; the second phone has today's authenticated Owner stop request and contact. Use `/tmp/home_ops/approval-forms/source/priority.pdf` to resolve the conflict, dock the SmartHome robot, and reply to the Owner with the actual result.
```

### 中文翻译

第一部手机有昨天的 continue-cleaning 照片；第二部手机有今天已认证的 Owner stop request 与 contact。请使用 `/tmp/home_ops/approval-forms/source/priority.pdf` 解决冲突，让 SmartHome robot 回到 dock，并向 Owner 回复实际结果。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机旧照片

- 文件：`/sdcard/DCIM/Camera/continue_cleaning_old_614.png`
- 尺寸：1536×1024 PNG。
- 顶部写有 `Yesterday`、`Continue cleaning`。
- 主体标题是 `Quiet cleaning map`，显示 Nursery、Bedroom、Hallway、Living room；Nursery 与 Bedroom 被红色标出。
- 底部写 `Quiet area 21:30-06:30`。

它代表昨天的旧意图，不是当前操作指令。

### 2.2 第二部手机 SMS 与 Contact

SMS 来自 `+1555061401`：

```text
Owner today: stop cleaning and return the robot to dock.
```

联系人：

```text
Name: Owner
Number: +1555061401
Notes: Authorized owner for cleaning changes
```

### 2.3 Linux `priority.pdf`

一页 `Cleaning Request Priority` / `Conflict handling policy`，三个规则框：

```text
AUTHORITY
Latest authenticated Owner request has priority.

CONFLICT RESPONSE
If requests conflict, stop cleaning and dock the robot.

REQUIRED REPLY
Reply to the authenticated Owner with the actual result.
```

### 2.4 SmartHome 初始相关状态

- current_time=`2026-06-16T18:00:00`
- `living_room_robot_vacuum_1`：power=on、status=cleaning、battery_pct=44
- 另有 bedroom/study robot，但本任务目标明确是 living-room 正在 cleaning 的 robot。

## 3. Setup 具体流程

### `linux_0`

- 创建 approval-forms/source 目录并删除旧 priority.pdf。
- 上传新的 policy PDF。

### `android_0`

- 确保 Simple Gallery Pro 可用。
- 清理旧同名文件，上传 yesterday photo，并触发 media scan。

### `android_1`

- 确保 SMS 可用并清空，注入今日 stop request。
- 确保 Contacts 可用并清空，添加同号码 Owner 联系人。

### `home_0`

- 用 episode_config 重置，建立 living-room robot 正在 cleaning 的初态。

## 4. Evaluator：评测方式与具体评测点

本题有 2 个 evaluation 单元：robot final state 与 Owner reply。

### 4.1 SmartHome robot state

`living_room_robot_vacuum_1` 最终必须至少满足：

```json
{
  "power": "off",
  "status": "docked"
}
```

Battery 等其他字段不在 expected subset 中。只 pause、只 turn off 或只写 report 都不够。

### 4.2 发给 Owner 的 SMS

推荐：

```text
The cleaning robot stopped and is docked.
```

要求：

- sent box 地址必须为 `+1555061401`，最近 30 分钟内。
- 必须出现 `cleaning robot`、`robot`、`vacuum` 中任意一个。
- 必须出现 `docked`、`at the charging station`、`back at the charging station` 中任意一个。
- 不能出现 `not docked`、`undocked`、`away from the dock`、`still cleaning`、`continue cleaning`。
- 问句、不确定或否定结果失败。

Evaluator 没有单独要求 reply 含 `stopped` 或 `off`；`robot is docked` 已满足短信项，但 home state 仍独立要求 power=off。

## 5. 常见失败与评测边界

- 只把 robot pause：home 状态不是 off/docked。
- 正确 dock 但不回信：SMS 项失败。
- 回信为了解释冲突而写 “Yesterday said continue cleaning, but now docked”：仍命中 conflict phrase `continue cleaning`，短信项失败。
- 给第一部手机或其他号码回复：地址不匹配。
- 操作 bedroom_robot_vacuum_1：目标 device state 不变，失败。

Photo、PDF 和 Contact 都是公开决策依据，但 evaluator 不直接读取它们；最终只评分目标 robot state 与一条匹配的 recent sent SMS。SMS getter 不要求 sent box 中恰好一条消息，只要存在符合条件的一条。

## 6. Cleanup

- Linux 删除 priority.pdf 并清理空目录。
- 第一部手机删除旧照片。
- 第二部手机清空 SMS/Contacts，并再次清空 SMS。
- SmartHome reset。
