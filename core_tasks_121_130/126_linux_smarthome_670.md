# Core 126 — linux_smarthome_670

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 126 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_670.json
- 运行配置：configs/cross_device/local_2linux_smarthome.json
- 难度：hard
- 设备拓扑：2L+1H（linux_0、linux_1、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

当前时间是 08:30，保护窗口是 08:30–10:30：

- bedroom 在窗口内受保护，且 allowed_exception=none；
- kids room 也受保护，但允许 quiet routine；
- office 不在保护清单中。

Home 有三个未来计划：

1. bedroom 09:00 开灯：命中保护窗口且无例外，必须 cancel；
2. kids room 09:10 的 quiet exception workflow：属于允许例外，保留 active；
3. office 09:05 开灯：房间不受保护，保留 active。

然后在第二台 Linux 的 plan-audit.xlsx 中把三行分别填为 Cancel/Cancelled、Keep/Active、Keep/Active。不要立即改变任何设备。

## 1. Instruction

### 英文原文（逐字）

~~~text
`/tmp/protection/current-diagram.png` and `/tmp/protection/current-manifest.json` on the first Linux machine list the current protected rooms and active window; `/tmp/protection/plan-audit.xlsx` on the second Linux machine is for auditing future plans. Please query SmartHome, cancel any item inside the window that would change a protected room without an exception, and complete the audit.
~~~

### 中文翻译

第一台 Linux 机器上的 /tmp/protection/current-diagram.png 与 /tmp/protection/current-manifest.json 列出了当前受保护房间和生效窗口；第二台 Linux 机器上的 /tmp/protection/plan-audit.xlsx 用于审计未来计划。请查询 SmartHome，取消窗口内会改变受保护房间且没有例外的任何项目，并完成审计。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、音频或 DOCX/PDF 附件。

### 2.1 linux_0：current-diagram.png 的可见内容

图片标题：SmartHome policy diagram。

图片上方还写有：

~~~text
Policy record label: current.csv
Legacy source path: /tmp/protection/current.csv
~~~

表格内容：

| room | effective_from | effective_to | allowed_exception |
|---|---|---|---|
| bedroom | 2026-06-26 08:30 | 2026-06-26 10:30 | none |
| kids_room | 2026-06-26 08:30 | 2026-06-26 10:30 | quiet routine |

其中 current.csv 是图片里的 legacy 标签；Setup 并不会上传这个 CSV，真实输入是 PNG 与下方 JSON。

### 2.2 linux_0：current-manifest.json 的完整内容

~~~json
{
  "protected_rooms": [
    {
      "room": "bedroom",
      "effective_from": "2026-06-26 08:30",
      "effective_to": "2026-06-26 10:30",
      "allowed_exception": "none"
    },
    {
      "room": "kids room",
      "effective_from": "2026-06-26 08:30",
      "effective_to": "2026-06-26 10:30",
      "allowed_exception": "quiet routine"
    }
  ]
}
~~~

PNG 使用 kids_room，JSON 使用 kids room；它们表示同一个房间。

### 2.3 linux_1：plan-audit.xlsx 初始内容

工作簿有 Audit、Completion Guide 两个 sheet。

Audit 列：

| 列 | 标题 |
|---|---|
| A | Object Type |
| B | Room |
| C | Run At |
| D | Matched Rule |
| E | Decision |
| F | Final Status |

初始行：

| 行 | Object Type | Room | Run At | D:F |
|---|---|---|---|---|
| 2 | schedule | bedroom | 2026-06-26 09:00 | 空 |
| 3 | workflow | kids room | 2026-06-26 09:10 | 空 |
| 4 | schedule | office | 2026-06-26 09:05 | 空 |

下拉列表：

- E2:E4：Cancel / Keep；
- F2:F4：Cancelled / Active。

Completion Guide 说明：命中 protected-time rule 的计划应 Cancel；规则外的计划应 Keep；Final Status 记录原生计划的最终状态。

### 2.4 Home 初始计划与设备

当前时间：2026-06-26 08:30。

设备初始都为 off：

- bedroom_light_1；
- kids_room_dimmable_light_1，brightness_pct=0；
- office_light_1。

Schedules：

~~~text
schedule_id: bedroom_light_protected
run_at: 2026-06-26T09:00:00
device_id: bedroom_light_1
command: turn_on
args: {}
status: active
~~~

~~~text
schedule_id: office_light_regular
run_at: 2026-06-26T09:05:00
device_id: office_light_1
command: turn_on
args: {}
status: active
~~~

Workflow：

~~~text
workflow_id: kids_room_quiet_exception
run_at: 2026-06-26T09:10:00
steps:
  - kids_room_dimmable_light_1 / set_brightness / {"brightness_pct": 20}
status: active
steps_done: 0
error: null
~~~

初始 command history 为空。

## 3. Setup 具体流程

### linux_0

1. 删除旧 current-diagram.png 与 current-manifest.json。
2. 创建 /tmp/protection。
3. 上传 PNG 与 JSON。

### linux_1

1. 删除旧 plan-audit.xlsx。
2. 创建 /tmp/protection。
3. 上传预填工作簿。

### home_0

从 linux_smarthome_670/episode_config.json reset Home，建立上述三台设备、两个 schedule、一个 workflow、08:30 时钟和空 history。

Setup 不会上传 /tmp/protection/current.csv，也不会自动取消任何计划。

## 4. 标准操作与推荐审计结果

Home 只执行计划管理操作：

    cancel_schedule(schedule_id="bedroom_light_protected")

不要 cancel office schedule 或 kids workflow，也不要对任何灯执行直接 command。

建议完整填写 Audit：

| Object Type | Room | Run At | Matched Rule | Decision | Final Status |
|---|---|---|---|---|---|
| schedule | bedroom | 2026-06-26 09:00 | protected room window | Cancel | Cancelled |
| workflow | kids room 或 kids_room | 2026-06-26 09:10 | allowed quiet exception | Keep | Active |
| schedule | office | 2026-06-26 09:05 | not protected | Keep | Active |

Oracle 把第二行 Room 规范化成 kids_room；Evaluator 不检查 B/D 列，所以保留输入中的 kids room 也可通过。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有五个 evaluator。前两个参与平均分；后三个虽然 enable_score_calc=false，却都是硬性 guard，任何一个失败都会使总分为 0。因此五项都必须通过。

### 5.1 bedroom schedule 必须被取消

必须找到一条完整匹配的 schedule 记录：

~~~text
schedule_id = bedroom_light_protected
run_at = 2026-06-26T09:00:00
device_id = bedroom_light_1
command = turn_on
args = {}
status = cancelled
~~~

cancel 是“保留记录并把状态变成 cancelled”；如果把记录删除，Evaluator 找不到这条 cancelled 记录，会失败。状态拼写 canceled 会被通用状态规范化视为 cancelled，但正常 API 产生 cancelled。

### 5.2 plan-audit.xlsx

必须存在 Audit sheet，以下单元格精确、区分大小写地相等：

| 单元格 | 必须是 |
|---|---|
| E2 | Cancel |
| F2 | Cancelled |
| E3 | Keep |
| F3 | Active |
| E4 | Keep |
| F4 | Active |

Evaluator 不检查 D2:D4 的 Matched Rule，也不拒绝其他非空单元格或额外 sheet；格式不参与比较。

### 5.3 office schedule 必须保持 active

硬性 guard 只要求 Home 中存在一条：

    schedule_id = office_light_regular
    status = active

该 guard 本身没有重复核对时间、设备和命令；这些数据来自固定 setup。取消它会失败。

### 5.4 kids workflow 必须完整保持 active

硬性 guard 要求完整匹配：

~~~text
workflow_id = kids_room_quiet_exception
run_at = 2026-06-26T09:10:00
steps = [
  {
    "device_id": "kids_room_dimmable_light_1",
    "command": "set_brightness",
    "args": {"brightness_pct": 20}
  }
]
status = active
~~~

steps 的长度必须恰好为 1；删除、取消或改变 brightness 都会失败。

### 5.5 不得执行任何即时设备命令

最后一个硬性 guard 检查 command history 中匹配任意记录的数量必须恰好为 0。

cancel_schedule 属于计划管理，不算直接设备 command；对灯执行 turn_on、turn_off 或 set_brightness 会使 history 非零并失败。

本题没有 schedule/workflow 总数检查。因此额外创建其他未来计划理论上可能不被这些断言发现，但违反 instruction，也不应这样做。

## 6. 配置中需要知道的真实不一致

- 实际 Setup 上传 3 个 Linux 源文件：PNG、JSON、XLSX；metadata.readiness.linux_sources_present 却写成 2。这是元数据计数错误，不影响真实上传。
- PNG 显示 legacy source path=/tmp/protection/current.csv，但该文件不在 Setup 中；JSON 已提供同一政策数据。
- Cleanup 会额外尝试删除 /tmp/protection/current.csv，即使 Setup 从未创建它。因为使用 rm -f，这一步无害。

这些都不是执行者需要补建 current.csv 的信号。

## 7. 常见失败

- 删除 bedroom schedule 而不是 cancel：失败。
- 误把 kids quiet routine 当作无例外并取消：workflow guard 失败。
- 取消 office schedule：office guard 失败。
- 为验证状态而直接开灯：command-history guard 失败。
- 表格写 `Canceled` 而非 `Cancelled`：精确单元格比较失败。
- 只填 Matched Rule 而不填 E/F：失败。

## 8. Cleanup

- linux_0 删除 PNG、JSON，并额外对 legacy current.csv 执行 rm -f；随后尝试删除空目录。
- linux_1 删除 plan-audit.xlsx。
- home_0 reset。

