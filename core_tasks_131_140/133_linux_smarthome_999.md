# Core 133 — linux_smarthome_999

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 133 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_999.json`
- 运行配置：`configs/cross_device/local_2linux_smarthome.json`
- 难度：medium
- 设备拓扑：2L+1H（`linux_0`、`linux_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台 Linux 上是处理政策，第二台 Linux 上是四项设备请求。正确结果是：

| 行 | 请求 | 判断 | Home 操作 | 最终结果 |
|---|---|---|---|---|
| R1 | 空闲的 laundry washer 启动 delicate | idle approved | 启动 | running delicate |
| R2 | 正在运行的 laundry dryer 紧急停止 | emergency running | 停止 | stopped |
| R3 | 正在 normal cycle 的 utility washer 改 delicate | busy cycle change | 延后，不控制 | 仍为 running normal |
| R4 | 启动 guest-room dryer | 设备不存在 | 不替代 | no action |

只应对 R1 和 R2 执行 Home command。

## 1. Instruction

### 英文原文（逐字）

~~~text
Triage the four appliance service requests in `/tmp/lifecycle/board.xlsx` on the second Linux machine using `/tmp/lifecycle/policy.html` on the first. Check the live SmartHome devices, perform only the actions that should happen now, and complete each row's decision and after-state in the workbook.
~~~

### 中文翻译

使用第一台 Linux 上的 `/tmp/lifecycle/policy.html`，处理第二台 Linux 上 `/tmp/lifecycle/board.xlsx` 中的四项家电服务请求。核对实时 SmartHome 设备，只执行现在应该执行的动作，并在工作簿中完成每一行的 decision 和 after-state。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片或音频附件。

### 2.1 linux_0：policy.html 的完整业务内容

页面标题：`Lifecycle Request Policy`。

| case | handling |
|---|---|
| idle approved | start requested cycle |
| emergency running | stop cycle |
| busy cycle change | defer until idle |
| missing device | record missing and do not substitute |

页面只是这张政策表；CSS 负责普通边框和字体，不含表单或脚本。

### 2.2 linux_1：board.xlsx 初始内容

工作簿有 `Board` 和 `Completion Guide` 两个 sheet。

Board 列为：

| 列 | 标题 |
|---|---|
| A | Row |
| B | Device |
| C | Request |
| D | Observed |
| E | Policy |
| F | Evidence |
| G | Decision |
| H | After |

初始请求：

| 行 | Row | Device | Request | 初始 Policy/Evidence |
|---|---|---|---|---|
| 2 | R1 | laundry washer | start delicate | E2=idle approved |
| 3 | R2 | laundry dryer | emergency stop | E3=emergency running |
| 4 | R3 | utility washer | change cycle to delicate | E4=busy cycle change |
| 5 | R4 | guest dryer | start quick | E5=missing device；F5=do not substitute other rooms |

D 列、G 列、H 列初始为空，F2:F4 也为空。

下拉列表：

- G2:G5：Start、Stop、Defer、Missing；
- H2:H5：running delicate、stopped、running normal、no action。

Completion Guide 对 Decision 的说明是：

~~~text
Start an approved idle appliance; Stop an emergency-running appliance; Defer an unsafe mid-cycle change; Missing when the requested room/device is absent.
~~~

### 2.3 Home 初始状态

当前时间：2026-07-15 13:50。

| 设备 | 初始状态 | 对应请求 |
|---|---|---|
| laundry_room_washer_1 | power=off，cycle=normal，remaining_min=0，status=idle | 可以启动 delicate |
| laundry_room_dryer_1 | power=on，cycle=heavy，remaining_min=26，status=running | 应紧急停止 |
| utility_room_washer_1 | power=on，cycle=normal，remaining_min=21，status=running | 忙碌中，不能中途改 cycle |
| guest-room dryer | 不存在 | 不得拿其他房间设备替代 |

初始 schedules、workflows、history 均为空。

## 3. Setup 具体流程

### linux_0

1. 删除旧的 `/tmp/lifecycle/policy.html`。
2. 创建 `/tmp/lifecycle`。
3. 上传政策页面。

### linux_1

1. 删除旧的 `/tmp/lifecycle/board.xlsx`。
2. 创建 `/tmp/lifecycle`。
3. 上传预填工作簿。

### home_0

使用 `linux_smarthome_999/episode_config.json` reset Home。

Setup 不会自动打开 HTML 或 XLSX，也不会填写空白结果列。

## 4. 推荐填写后的完整 Board

Oracle 的完整表格为：

| Row | Device | Request | Observed | Policy | Evidence | Decision | After |
|---|---|---|---|---|---|---|---|
| R1 | laundry washer | start delicate | idle | approved start delicate | live idle washer | Start | running delicate |
| R2 | laundry dryer | emergency stop | running heavy | emergency stop approved | live running dryer | Stop | stopped |
| R3 | utility washer | change cycle to delicate | running normal | cycle changes deferred | busy live washer | Defer | running normal |
| R4 | guest dryer | start quick | not found | do not substitute | no guest-room dryer in Home | Missing | no action |

Home 操作：

~~~text
laundry_room_washer_1.start_cycle(cycle="delicate")
laundry_room_dryer_1.stop_cycle()
~~~

R3 与 R4 不执行任何 Home command。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

两个 evaluator 都必须成功：一个检查工作簿，一个检查 Home 最终状态。

### 5.1 board.xlsx 的精确单元格

评测函数：`check_xlsx_cells`；读取 `linux_1:/tmp/lifecycle/board.xlsx`，并明确要求 `Board` sheet。

| 单元格 | 必须是 |
|---|---|
| G2 | Start |
| H2 | running delicate |
| G3 | Stop |
| H3 | stopped |
| G4 | Defer |
| H4 | running normal |
| G5 | Missing |
| H5 | no action |

这些是区分大小写的精确字符串，不是关键词匹配。`start`、`Defer until idle` 或 `no actions` 都会失败。

Evaluator 只断言 G/H；D/E/F 没有进入机器断言。额外单元格和格式也没有被禁止。为了真正完成“triage”，仍建议按第 4 节填写 D:H，而不是只填过测单元格。

### 5.2 Home 最终状态

`smarthome.check_multi_condition` 要求：

| 设备 | 必须满足的字段 |
|---|---|
| laundry_room_washer_1 | power=on，status=running，cycle=delicate |
| laundry_room_dryer_1 | power=off，status=stopped，remaining_min=0 |
| utility_room_washer_1 | power=on，status=running，cycle=normal |

这是字段子集匹配：例如 evaluator 不检查 washer 的 remaining_min，也不检查 dryer 最终 cycle。

### 5.3 没有检查的内容

- 没有 command-history 数量检查；
- 没有独立断言“guest dryer 不存在”；
- 不检查 D/E/F 文本；
- 不检查额外 schedule/workflow；
- 不要求操作顺序，只看最终工作簿和最终 Home 状态。

## 6. 常见失败与真实评测边界

- R1 表格写 Start，但 washer 没启动：Home 检查失败。
- R2 没停止 dryer：Home 检查失败。
- 对 R3 强行改成 delicate：utility washer 必须仍为 normal，失败。
- 用 laundry dryer 替代不存在的 guest dryer：会破坏 dryer 最终状态，失败。
- D/E/F 写得完整，但 G/H 留空：工作簿检查失败。
- G/H 含正确意思但不是精确下拉值：失败。

## 7. Cleanup

- linux_0 删除 policy.html，并尝试删除空目录。
- linux_1 删除 board.xlsx，并尝试删除空目录。
- home_0 reset。

