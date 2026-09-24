# E3：日历同步中的局部探索与共享预算耗尽

任务 `al_calendar_schedule_conflict`（Lite 004），**UFO³／GPT-5.5**，正式采用 `attempt_001`。2026-09-24 已从原运行机器补入完整原始目录：**410 个文件、149 张完整截图、全部 50 次模型调用**。没有重跑、重判或替换为其他 baseline 的轨迹。

[main_experiment_selection.json](main_experiment_selection.json) 保留原 pear 分析采用行；[canonical_selected_attempt.json](task/canonical_selected_attempt.json) 是本次从正式合并索引直接摘出的对应记录。任务快照 SHA-256 与两处索引的 `255c8d69…ca2941` 一致。原件在 [run/](run/)，逐文件校验在 [material_integrity.json](material_integrity.json)。

## 任务要求与设备角色

| 对象 | 要求／已归档输入 | 原始入口 |
|---|---|---|
| `android_0` | Simple Calendar Pro 是会议详情的权威来源；读取同名会议的 date、start、end、location | [当次任务快照](task/config/task.json) 的 instruction、setup；[初始规划输出](run/ufo3/calls/001_constellation_create/response.txt) |
| `linux_0` 规则 | 用 Android 信息同步同名会议；非匹配会议不变；逐字段记录 old/new | [rule.txt](task/resources/source/rule.txt) |
| `linux_0` 初始 CSV | Vendor planning 为 2027-02-13、09:00–10:00、Room 2；Ops sync 为 2027-02-14、11:00–11:30、Room 4 | [week.csv](task/resources/source/week.csv) |
| 所需交付物 | 修正 `/tmp/schedule/week.csv`，并生成 `/tmp/schedule/log.json` | [evaluator_trace.json](run/evaluator_trace.json) |

两份 Linux 输入资源按正式记录中的 benchmark revision 恢复并核对 SHA-256，**是初始化源文件，不是终态输出**。Android 初始化事件直接保存在当次 `task/config/task.json`；没有单独的日历数据库导出。资源来源见 [provenance.json](task/resources/provenance.json)。

## 原始计划与实际执行

初始 `constellation` 事件的三个节点均为 PENDING：

1. `task-1`：在 Android 提取会议信息。
2. `task-2`：在 Linux 读取 CSV 和规则；它不依赖 `task-1`。
3. `task-3`：等待前两项后，在 Linux 同步 CSV 并写日志。

随后唯一一个 `subtask_started` 事件启动 `task-1`。最终 `task-1` 仍为 RUNNING、attempts=49，两个 Linux 节点仍为 PENDING、attempts=0。计划与终态分别见 [trajectory.json](run/trajectory.json) 的 `constellation.state`、`orchestration.final_constellation`。

| 定位 | 可核实的执行事实 | 证据入口 |
|---|---|---|
| policy call 1 | 生成三个节点和两条依赖；无初始解析 fallback | [规划 messages／response／call](run/ufo3/calls/001_constellation_create/) |
| `s0` / policy call 2 | 在 Android 执行 `open_app(simple calendar pro)`，返回 `ok=true`；动作后仍是启动画面 | [动作响应](run/ufo3/calls/002_device_action_android_android_0/response.txt)；[step_002.png](run/artifacts/android_0/screenshots/step_002.png) |
| `s0–s48` / policy calls 2–50 | 49 次有实际映射的设备动作全部在 `android_0`；没有 Linux 动作；49 次反馈均为 `ok=true`，但不代表读到了所需会议 | [完整 trajectory](run/trajectory.json)；[model_calls.json](run/model_calls.json) |
| `s48` / policy call 50 | 最后一次动作是 `click(index=5)`；动作后截图仍为 August 月历，没有会议详情 | [最后动作响应](run/ufo3/calls/050_device_action_android_android_0/response.txt)；[最后原始截图 step_098.png](run/artifacts/android_0/screenshots/step_098.png) |
| `step_limit` | 最后一次动作完成后，50 次 policy call 预算已用尽；没有第 51 次调用；replan=0 | [result.json](run/result.json)；trajectory 最后事件 |

`sN` 是零基 `agent_step.step_index=N`。截图文件号不是动作步号；末帧 `step_098.png` 对应 `s48` 后。**50 次调用 = 1 次规划 + 49 次设备代理调用，不是 50 次设备操作。** 原始任务快照的 `limits` 不是此次命令行实际采用的预算：本次 [attempt_status.json](run/attempt_status.json) 明确传入 `--max-steps 50`、`--max-duration-s 1800.0`。

## 评测与证据边界

| 检查 | 原始 actual | 结果 |
|---|---|---|
| `check_semantic_change`：Linux `log.json` | `null`，未取得日志内容 | 0，FAIL |
| `check_csv`：Linux `week.csv` | `cache/mdcbench_linux_0_reset/week.csv`，记录的是共享缓存路径而非 CSV 内容 | 0，FAIL |

总体 `success=false`、score=0、`termination_reason=max_steps`；50 次模型调用、499,586 个记录 token、532.996 秒。时长是 `result.duration_s` 的完整生命周期口径，包含初始化、评测和清理。`initialization_success`、`evaluation_success`、`cleanup_success` 均为 true；**评测执行成功不等于任务通过**。

本次没有运行专属的终态 `week.csv` 文件，也没有生成可归档的 `log.json`；未使用现在的共享缓存或重新执行任务来补造产物。可以确认两项评测失败、整个策略轨迹没有 Linux 动作；“CSV 保持旧内容”与这些证据一致，但现有缓存路径本身不足以做终态文件的逐字节核验。[既有 C01 分析摘录](existing_analysis_excerpt.md) 原样保留，引用时以这里对原件的核查边界为准。

此例直接展示：串行调度持续执行尚未完成的 Android 子任务，独立可执行的 Linux 规则读取没有启动，最终共享预算耗尽。它不能单独证明只调整调度就必然成功，也不能将所有返回 `ok=true` 的点击视为有效信息获取。

## 材料完整性与阅读方式

- `run/` 包含全部 410 个源文件；另加的 README 仅是阅读说明。99 张 Android 截图、50 张 Linux 截图均保留原名、原尺寸及设备目录；Linux 截图的存在不表示曾执行 Linux 动作。
- 逐轮 prompt 在 `run/ufo3/calls/*/messages.json`，原始输出在 `response.txt`，调用统计在 `call.json`；本次原运行没有单独的 `prompts/` 或 `execution_history.jsonl`，没有虚构这两种文件。
- 未裁切、压缩、重命名截图，未重写原日志的绝对路径；按 [material_inventory.json](material_inventory.json) 的原目录映射到本地 `run/`。
- 可运行 `python3 verify_materials.py` 复核原件 SHA-256、索引、动作计数、截图和证据链接；该脚本只读材料，不调用模型或设备。
