# Core 132 — linux_smarthome_028

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 132 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_028.json`
- 运行配置：`configs/cross_device/local_linux_smarthome.json`
- 难度：easy
- 设备拓扑：1L+1H（`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

规则规定 22:00–07:00 是安静时段，处在这个时段内的 noisy vacuum plan 必须取消。Home 只有一项现有计划：living-room robot vacuum 在 22:30 开始清扫。因此正确操作就是取消 schedule `late_vacuum`，不是删除 Markdown，也不是改到其他时间。

## 1. Instruction

### 英文原文（逐字）

~~~text
Apply the quiet-hours rule from `/tmp/home_plan/noise_quiet_hours.md` to the existing plans.
~~~

### 中文翻译

把 `/tmp/home_plan/noise_quiet_hours.md` 中的安静时段规则应用到现有计划。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片或音频附件。

### 2.1 noise_quiet_hours.md 的完整原文

~~~markdown
Quiet hours: 22:00-07:00. Cancel noisy vacuum plans inside that window.
~~~

意思是：22:00 到次日 07:00 之间的吸尘器噪声计划要取消。

### 2.2 Home 初始计划

当前时间：2026-06-16 19:00。

| 字段 | 初始值 |
|---|---|
| schedule_id | late_vacuum |
| run_at | 2026-06-16T22:30:00 |
| device_id | living_room_robot_vacuum_1 |
| command | start_cleaning |
| args | {} |
| status | active |

22:30 落在 22:00–07:00 内，所以该计划命中取消规则。

Home 初始有 1 个 schedule、0 个 workflow、空 history。设备本身当前为 power=off、status=docked、battery_pct=80。

## 3. Setup 具体流程

### linux_0

1. 删除旧的 `/tmp/home_plan/noise_quiet_hours.md`。
2. 创建 `/tmp/home_plan`。
3. 上传规则文件到该路径。

### home_0

使用 `linux_smarthome_028/episode_config.json` reset Home，创建上述 active schedule 和初始设备状态。

Setup 不会自动打开 Markdown。Linux 上没有要求创建任何输出文件。

## 4. 正确操作

对 Home 执行：

~~~text
cancel_schedule(schedule_id="late_vacuum")
~~~

取消后该记录应继续存在，但 `status` 变为 `cancelled`。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

只有一个 Home evaluator：`smarthome.check_schedule_status`。它必须成功。

### 5.1 匹配的完整 schedule 条件

Home 的 schedule 列表中必须能找到一条同时满足以下字段的记录：

| 字段 | 必须匹配 |
|---|---|
| schedule_id | late_vacuum |
| run_at | 2026-06-16T22:30:00 |
| device_id | living_room_robot_vacuum_1 |
| command | start_cleaning |
| args | {} |
| status | cancelled |

这是结构化字段匹配，不是扫描关键词。字符串字段按实际值匹配；状态实现会把 `canceled` 规范成 `cancelled`，所以这两个英文拼法在状态字段上等价。

### 5.2 没有检查的内容

- 不检查 Linux 文件是否被阅读或保留；
- 不检查取消操作的文字说明；
- 不检查 schedule 总数；
- 不检查是否额外创建了别的 schedule/workflow；
- 不检查 robot vacuum 的即时设备状态或 command history。

因此 evaluator 的核心只有一件事：原 `late_vacuum` 记录必须变成已取消状态。正常完成任务时不应额外创建替代计划。

## 6. 常见失败与真实评测边界

- 只关闭 robot vacuum，而不取消 schedule：失败。
- 删除 schedule 记录而不是把它取消：找不到匹配记录，失败。
- 把计划改到 21:30、保留 active：失败。
- 取消了另一条计划：失败。
- 正确取消后没有创建 Linux 输出文件：不影响，因为本任务本来就没有 Linux 输出 evaluator。

## 7. Cleanup

- linux_0 删除 Markdown，并尝试删除空的 `/tmp/home_plan`。
- home_0 reset。

