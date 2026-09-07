# Execution failure cases

2026-09-07；AI 离线轨迹复核，非独立人工标注。7 条失败、1 条成功对照；定向选样，不代表错误发生频率。C01–C04 为正文候选，C05–C07 为附录候选。七条失败均为原自动评测 FAIL，且具有独立执行证据；成功对照原自动评测为 PASS。本目录主实验按裁决前口径统计，补充裁决不改写主实验结果。

下文 sN 均指原 trajectory.json 的零基 step_index=N，截图文件编号不等于步号。每条先给正式 selected attempt；表内相对标签的链接均指该目录下的原始证据。只引用历史截图、stdout、结构化状态与原 trace，没有读取今天的复用 cache 产物或 live 设备。任务中的虚拟机路径是历史目标位置，不是本机证据文件。

## C01 · 日历摘要说明被写成会议地点

模型：Claude Opus 4.8；task_id：`al_calendar_schedule_conflict`。正文候选。

Selected attempt：[/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict>)。

结果：原自动评测 FAIL/0；裁决前主表 FAIL/0；9 steps，终止 done。本例两层结果一致，不依赖补充裁决得出失败／成功结论。以 model + task_id + selected_attempt 在 [execution_results.csv](execution_results.csv) 定位，原评分来源为 [result.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/result.json>) :: success / score。

公开目标与设备角色：android_0 的 Calendar 是来源；linux_0 的 week.csv 是待同步表，log.json 是变更记录。公开 rule.txt 要求匹配会议同步 date/start/end/location，非匹配会议保持不变。 见 [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/config/task.json>) :: instruction / devices。

已完成的局部工作：成功读取规则与原 CSV；改用搜索后找到 Vendor planning；保存并回读了 CSV 和变更日志。Vendor 的 15:00–16:00 被正确同步，Ops sync 保持原值。

| 步骤/区间 | 具体设备 | 动作或观测 | 实际结果 | 可回查证据 |
| --- | --- | --- | --- | --- |
| s0 | linux_0 | 读取 rule.txt 与 week.csv | 输出明确要求从 Android 同步 location；原地点 Room 2。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/trajectory.json>) :: step_index=0 :: info.stdout |
| s1–6 | android_0 | 启动 Calendar；年视图点击后改用搜索 | s5 搜索卡片显示时间及说明 Source of truth for schedule correction；没有打开事件详情。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/trajectory.json>) :: step_index=1..6<br>[artifacts/android_0/screenshots/step_011.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/artifacts/android_0/screenshots/step_011.png>) :: s5 后截图，已查看 |
| 历史字段定义 | android_0 | 查看本次冻结 setup（分析者只读） | calendar_event_add 将 Room 8 放入 location，将上述说明放入 description；这是字段来源说明，不是模型已经看见详情的证据。 | [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/config/task.json>) :: setup[0].config :: androidworld_calendar_event_add |
| s7–8 | linux_0 | 写入并回读 CSV、JSON，随后 done | 两份实际回读均把说明文本放入 location，后续无修正；原 trace 两条件 FAIL。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/trajectory.json>) :: step_index=7 :: info.stdout; step_index=8<br>[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_rerun_20260828_run_01/004_al_calendar_schedule_conflict/evaluator_trace.json>) :: evaluators[0..1] |

未满足要求／对照结论：必要的会议地点同步未正确完成。不是日志 JSON 排版偏好：实际 CSV location 与其所引用的字段含义已经不一致。

机制：来源字段语义误绑定。恢复与下游影响：日历搜索已经恢复了早期导航失误，但地点字段的误识别未恢复；同一错误继续进入变更日志。

事实与解释边界：截图只证明摘要说明可见，不能声称模型曾正确读到 Room 8 后忘记。Room 8 来自历史 setup；没有把今天设备或缓存文件当成旧详情。旧 UI-tree 的年视图标签与实际搜索截图不一致，本例以已查看截图为准。

改进方向（假设）：需要区分“读到了文本”和“核实了对应字段”，尤其在摘要页缺少明确字段标签时进入详情确认；这是待验证的改进假设，不代表新增模块已证明有效。

复核深度：本轮核对该 selected attempt 的完整动作/反馈链及所引原 trace；表中标明“已查看”的关键截图均实际打开核实，未逐张查看全部截图。

## C02 · 号码已明确识别，联系人落地时却遗漏

模型：GPT-5.5；task_id：`linux_android_904`。正文候选。

Selected attempt：[/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904>)。

结果：原自动评测 FAIL/0.6666666666666666；裁决前主表 FAIL/0.6666666666666666；37 steps，终止 done。本例两层结果一致，不依赖补充裁决得出失败／成功结论。以 model + task_id + selected_attempt 在 [execution_results.csv](execution_results.csv) 定位，原评分来源为 [result.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/result.json>) :: success / score。

公开目标与设备角色：android_0 提供 904-A_source.md；linux_0 的 approved 登记行和 policy 规定 case/owner/code 及联系人号码；android_1 创建 Mira Patel 联系人；两台 Linux 分别交付 DOCX、TXT。政策明确联系人必须使用 approved 行的号码。 见 [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/config/task.json>) :: instruction / devices。

已完成的局部工作：s0/s23 CSV 回读提供 +1555011881；s10/s26 模型文字明确选用了这个号码，不仅是数字恰好出现在截图。Linux TXT 有保存后回读，DOCX 创建反馈和原条件通过支持局部交付。

| 步骤/区间 | 具体设备 | 动作或观测 | 实际结果 | 可回查证据 |
| --- | --- | --- | --- | --- |
| s0、s10 | linux_0 → android_1 | 读取 approved 登记行和政策，准备联系人 | 原 stdout 给出 +1555011881；s10 明确声明将使用该号码。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/trajectory.json>) :: step_index=0 :: info.stdout; step_index=10 :: thought |
| s7–9 | linux_0、linux_1 | 创建两份 handoff | s7 缺少 docx 库；s8 改用 ZIP 包构造成功；s9 TXT 保存后全文回读。原 DOCX/TXT 条件均 PASS。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/trajectory.json>) :: step_index=7..9 :: info<br>[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/evaluator_trace.json>) :: evaluators[1..2] |
| s23–31 | linux_0 → android_1 | 重新读取号码并再次进入联系人表单 | s26 再次明确号码；s28–31 只输入 Mira/Patel，没有 phone 字段输入。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/trajectory.json>) :: step_index=23..31 |
| s32–36 | android_1 | 保存联系人，再查 Linux 后 done | s33 与 s36 截图都显示 Mira Patel / Add phone number；没有后续补填。 | [artifacts/android_1/screenshots/step_055.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/artifacts/android_1/screenshots/step_055.png>) :: s33 后，已查看<br>[artifacts/android_1/screenshots/step_057.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/artifacts/android_1/screenshots/step_057.png>) :: s36 后，已查看<br>[trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/031_linux_android_904/trajectory.json>) :: step_index=32..36 |

未满足要求／对照结论：保存的是无号码的联系人，公开政策要求的 approved 联系号码缺失。不是联系人姓名别名或格式的隐式评分要求。

机制：已获取信息未完整写入目标。恢复与下游影响：创建 DOCX 的依赖报错已经恢复，联系人表单导航也最终恢复到可保存状态；未恢复的是必要号码字段。不能拿早期库报错解释最终联系人失败。

事实与解释边界：不推断内部遗忘或记忆容量；只能确认已明确识别的字段没有进入最终联系人。两份 Linux 条件通过不是独立 stage 成功，更不是完整流程成功。DOCX 原生全文未独立逐字复核，局部结论明确依赖原 trace。

改进方向（假设）：把来源记录和下游必填字段保持对应关系可能有帮助；需另做实验检验，不能由个案断定 memory 模块必然解决。

复核深度：本轮核对该 selected attempt 的完整动作/反馈链及所引原 trace；表中标明“已查看”的关键截图均实际打开核实，未逐张查看全部截图。

## C03 · 提交页面的目标值替代了设备实际设置

模型：GPT-5.5；task_id：`linux_smarthome_378`。正文候选。

Selected attempt：[/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378>)。

结果：原自动评测 FAIL/0.5；裁决前主表 FAIL/0.5；7 steps，终止 done。本例两层结果一致，不依赖补充裁决得出失败／成功结论。以 model + task_id + selected_attempt 在 [execution_results.csv](execution_results.csv) 定位，原评分来源为 [result.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/result.json>) :: success / score。

公开目标与设备角色：linux_0 的 cooling.html 要求卧室制冷到 21℃，禁止使用 heater；须在 home_0 实施设置，再记录选择并提交页面。 见 [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/config/task.json>) :: instruction / devices。

已完成的局部工作：正确选中 bedroom_air_conditioner_1，成功开机；表单操作经历窗口/坐标恢复后，提交 URL 的确记录 air conditioner/cool/21/heater not used。

| 步骤/区间 | 具体设备 | 动作或观测 | 实际结果 | 可回查证据 |
| --- | --- | --- | --- | --- |
| s0、s2 | linux_0 | 打开页面并读取 HTML | 公开页面写明目标 21℃、禁用 heater；源代码回读也说明空调需开机并应用目标温度。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/trajectory.json>) :: step_index=0; step_index=2 :: info.stdout |
| s1 | home_0 | 仅执行 turn_on | 动作真实成功，但 before/after 显示 mode=auto、target_temperature_c=24 未改变。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/trajectory.json>) :: step_index=1 :: info.before/after |
| s3–5 | linux_0 | 尝试填表，切换窗口后重新填表提交 | s5 后真实截图 URL 含 cool、21 和 submitted 锚点。页面重新加载后下拉框回到默认值，不应据此否认提交。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/trajectory.json>) :: step_index=3..5<br>[artifacts/linux_0/screenshots/step_011.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/artifacts/linux_0/screenshots/step_011.png>) :: s5 后，已查看 |
| s6 / evaluation | home_0、linux_0 | 依据页面提交结束，没有其他 Home 命令 | 最终空调仍 on/auto/24；Home history 唯一命令 turn_on；页面条件 PASS，实际设备条件 FAIL。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/trajectory.json>) :: step_index=6<br>[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/112_linux_smarthome_378/evaluator_trace.json>) :: evaluators[0].actual.devices/history; evaluators[1].actual |

未满足要求／对照结论：设备没有设置为 cool/21℃。报告或页面上的期望值不能代替 Home 的实际状态变化。

机制：记录完成与环境状态完成脱节。恢复与下游影响：表单局部错误已恢复且提交被记录；缺少 set_mode 和 set_target_temperature 的实际效果，直到结束未恢复。

事实与解释边界：不是“没有最终检查所以失败”的推断，证据是已保存的 Home before/after 和终局状态。不能说空调命令失败：执行过的开机命令成功，另外两项必要设置未执行。

改进方向（假设）：结束条件应同时包含环境效果和记录交付，而非只检查报告；S01 是同任务可行路径的局部反例，但不隔离模型或运行环境的因果效应。

复核深度：本轮核对该 selected attempt 的完整动作/反馈链及所引原 trace；表中标明“已查看”的关键截图均实际打开核实，未逐张查看全部截图。

## C04 · 完成调度后在错误手机持续寻找待办

模型：Claude Opus 4.8；task_id：`linux_android_smarthome_439`。正文候选。

Selected attempt：[/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439>)。

结果：原自动评测 FAIL/0.5；裁决前主表 FAIL/0.5；50 steps，终止 max_steps。本例两层结果一致，不依赖补充裁决得出失败／成功结论。以 model + task_id + selected_attempt 在 [execution_results.csv](execution_results.csv) 定位，原评分来源为 [result.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/result.json>) :: success / score。

公开目标与设备角色：android_0 的 Guest Wake 闹钟、linux_0 的房间映射及 android_1 的湿度文件共同定义次日 09:35 卧室加湿器 medium 调度；更新并完成已有 Guest Wake follow-up，不得新建重复任务。已有待办实际在 android_1。 见 [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/config/task.json>) :: instruction / devices。

已完成的局部工作：读取房间 CSV；前期文件打开困难后改用 Markor，s19 实际打开湿度说明；s20 调度成功，终局保留对应 active workflow。

| 步骤/区间 | 具体设备 | 动作或观测 | 实际结果 | 可回查证据 |
| --- | --- | --- | --- | --- |
| reset | android_1 | 历史初始观测 | 屏幕明确显示未勾选的 Guest Wake follow-up 及 bedroom humidity recovery 说明；不是仅由 evaluator 设备 ID 反推。 | [artifacts/android_1/screenshots/step_000.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/artifacts/android_1/screenshots/step_000.png>) :: reset 截图，已查看<br>[config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/config/task.json>) :: setup android_1 task_add/preflight/identity_snapshot |
| s0–19 | linux_0、android_1 | 读映射并打开湿度说明 | s0/s12 CSV 显示 Guest Wake→bedroom；s19 文件真实显示卧室加湿器 medium。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/trajectory.json>) :: step_index=0..19<br>[artifacts/android_1/screenshots/step_038.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/artifacts/android_1/screenshots/step_038.png>) :: s19 后，已查看 |
| s20 | home_0 | schedule_workflow | 成功反馈及终局 active workflow：2026-06-17 09:35，turn_on + set_level medium。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/trajectory.json>) :: step_index=20 :: info/observation<br>[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/evaluator_trace.json>) :: evaluators[1].actual |
| s21–45 | android_0 | 打开 Tasks，改变查询和列表寻找待办 | 实际 s43 搜索 Guest 为空；始终未返回有目标记录的 android_1 Tasks。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/trajectory.json>) :: step_index=21..45<br>[artifacts/android_0/screenshots/step_067.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/artifacts/android_0/screenshots/step_067.png>) :: s43 后，已查看 |
| s46–49 / evaluation | android_0 | 一次解析错误后恢复动作，但继续同机搜索 | 终局仍是空列表；达到 max_steps。原目标待办条件 missing，已调度的 workflow 仍 PASS。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/trajectory.json>) :: step_index=46..49<br>[artifacts/android_0/screenshots/step_077.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/artifacts/android_0/screenshots/step_077.png>) :: s49 后，已查看<br>[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439/evaluator_trace.json>) :: evaluators[0..1] |

未满足要求／对照结论：没有更新并完成已有 follow-up。已有目标初始可见，完整后半链没有在其所属手机上进行待办修改；不是仅凭 getter 的 missing 声称记录不存在。

机制：后续对象与具体设备实例未保持绑定。恢复与下游影响：文件打开和 s46 解析错误均出现后续有效动作，不能当成持续 helper 故障。恢复策略只在错误手机调整查询/列表，具体设备绑定未恢复；调度成果没有被破坏。

事实与解释边界：任务文字没有直接说 follow-up 属于第二手机，但其初始画面明确提供该位置。模型是否当时注意到未知，不能写“看见后忘记”。这是 Android endpoint 选择问题，不是 SmartHome appliance 混淆。

改进方向（假设）：定位目标时保留“对象—应用—设备实例”信息；连续空搜索后重新核对设备可能有益，但个案不能证明特定 planner 的收益。

复核深度：本轮核对该 selected attempt 的完整动作/反馈链及所引原 trace；表中标明“已查看”的关键截图均实际打开核实，未逐张查看全部截图。

## C05 · 最高温排序遗漏“房间必须有空调”的资格条件

模型：GPT-5.5；task_id：`linux_smarthome_576`。附录候选。

Selected attempt：[/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/118_linux_smarthome_576](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/118_linux_smarthome_576>)。

结果：原自动评测 FAIL/0；裁决前主表 FAIL/0；3 steps，终止 done。本例两层结果一致，不依赖补充裁决得出失败／成功结论。以 model + task_id + selected_attempt 在 [execution_results.csv](execution_results.csv) 定位，原评分来源为 [result.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/118_linux_smarthome_576/result.json>) :: success / score。

公开目标与设备角色：linux_0 cooling.md 和公开 instruction 要求：在当前有人且有空调的房间中，选最高温且超过 27℃的一间制冷至 24℃；写四字段 decision.json。home_0 提供房间温度、占用状态和 appliance inventory。 见 [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/118_linux_smarthome_576/config/task.json>) :: instruction / devices。

已完成的局部工作：正确读到 cooling.md 的四字段格式与受控 reason 值，成功保存并回读 decision.json。

| 步骤/区间 | 具体设备 | 动作或观测 | 实际结果 | 可回查证据 |
| --- | --- | --- | --- | --- |
| reset / s0 | home_0、linux_0 | 读取房间、设备清单与规则 | office 30℃且有空调；nursery 31℃但清单只有 nursery_light_1。规则限定 occupied rooms with air conditioners。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/118_linux_smarthome_576/trajectory.json>) :: event=reset :: observation.observations.home_0; step_index=0 :: info.stdout |
| s1 | linux_0 | 保存并重新载入 JSON | 实际 stdout 为 selected_room=nursery、observed_temperature_c=31；这不是未执行的构造参数。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/118_linux_smarthome_576/trajectory.json>) :: step_index=1 :: info.stdout |
| s2 / evaluation | home_0 | done；全链无 Home 控制动作 | office 空调仍 off/auto/26；Home history 为空，两必要结果 FAIL。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/118_linux_smarthome_576/trajectory.json>) :: step_index=2<br>[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/118_linux_smarthome_576/evaluator_trace.json>) :: evaluators[0].actual.devices/history |

未满足要求／对照结论：选错不具备制冷能力的房间，且没有实际执行制冷。格式正确、可读的 JSON 不构成正确设施决策。

机制：资格条件遗漏并伴随控制子目标未执行。恢复与下游影响：没有后续修正；资格筛选和实际控制两项问题同时存在，不强行确定哪项是唯一主要原因。

事实与解释边界：不假设 nursery 的所有设备清单之外还存在隐藏空调；分析基于该次真实结构化 inventory。不能把未执行 Home 控制自动等同为命令接口不可用。

改进方向（假设）：先筛选资格再排序，并单独追踪操作效果可作为改进方向；需要对照验证，不由三步轨迹推断所有推理过程。

复核深度：本轮核对该 selected attempt 的完整动作/反馈链及所引原 trace；关键状态以历史 stdout、Home 结构化观测和命令 before/after 核实，不需要重绘截图。

## C06 · 以能调光的相似灯替代指定普通灯

模型：GPT-5.5；task_id：`sh3_explicit_control_plain_light_dimming_infeasible_0013`。附录候选。

Selected attempt：[/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013>)。

结果：原自动评测 FAIL/0；裁决前主表 FAIL/0；2 steps，终止 done。本例两层结果一致，不依赖补充裁决得出失败／成功结论。以 model + task_id + selected_attempt 在 [execution_results.csv](execution_results.csv) 定位，原评分来源为 [result.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/result.json>) :: success / score。

公开目标与设备角色：用户指定 bedroom light 1 调到 35%。home_0 同时提供 bedroom_light_1（普通 light）和 bedroom_dimmable_light_1（dimmable_light），两者是不同对象；此任务只有一个 runtime endpoint。 见 [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/config/task.json>) :: instruction / devices。

已完成的局部工作：对可调光灯的 set_brightness 命令执行成功，亮度从 50 改为 35。局部命令有效不等于操作对象正确。

| 步骤/区间 | 具体设备 | 动作或观测 | 实际结果 | 可回查证据 |
| --- | --- | --- | --- | --- |
| 公开目标 / s0 before | home_0 | 匹配用户指定灯与设备清单 | 指定 bedroom light 1；实际操作却选择 bedroom_dimmable_light_1。 | [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/config/task.json>) :: instruction<br>[trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/trajectory.json>) :: step_index=0 :: action.parameters/observation |
| s0 | home_0 | 对相似可调光灯 set_brightness=35 | 反馈明确 target_device_id=bedroom_dimmable_light_1，before=50，after=35。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/trajectory.json>) :: step_index=0 :: info |
| s1 / evaluation | home_0 | done，无撤销或不可行报告 | 最终 history 记录其他灯发生变更；指定普通灯未获得调光，infeasible_reports 为空。原自动评测为 FAIL。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/trajectory.json>) :: step_index=1<br>[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/evaluator_trace.json>) :: evaluators[0].actual; evaluators[1].actual.history |

未满足要求／对照结论：更改了不同于用户指定的灯。即使不讨论不可行报告的措辞，也有独立的错误对象变更证据。

机制：同一环境内 appliance 身份替换。恢复与下游影响：没有回退；最终确认的仍是替代灯的亮度。

事实与解释边界：这是单 Home 内的 appliance identity，不计作“跨设备实例混淆”。机制依据实际对象变更，不以补充裁决作为失败证据，也不对公开自然语言的歧义重新进行评分审计。

改进方向（假设）：在判断动作能力前保持指定对象身份，不应通过替换对象让操作变得可行；需要额外实验证明对象绑定策略的效果。

复核深度：本轮核对该 selected attempt 的完整动作/反馈链及所引原 trace；关键状态以历史 stdout、Home 结构化观测和命令 before/after 核实，不需要重绘截图。

## C07 · 来源目录核查停滞，短信交付始终未启动

模型：GPT-5.5；task_id：`android_only_267`。附录候选。

Selected attempt：[/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267>)。

结果：原自动评测 FAIL/0；裁决前主表 FAIL/0；50 steps，终止 max_steps。本例两层结果一致，不依赖补充裁决得出失败／成功结论。以 model + task_id + selected_attempt 在 [execution_results.csv](execution_results.csv) 定位，原评分来源为 [result.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/result.json>) :: success / score。

公开目标与设备角色：android_0 Downloads 的 audio_manifest.csv 是三条录音清单；android_1 用 Files 检查 Recordings，再从该机短信告知 Maya Chen 清单名、实际存在数量及缺失文件。 见 [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/config/task.json>) :: instruction / devices。

已完成的局部工作：初始 android_0 截图已展示 brief_a.mp3、brief_b.mp3、brief_c.mp3；模型后续文字准确复述这些文件名。没有证据表明缺少来源清单本身。

| 步骤/区间 | 具体设备 | 动作或观测 | 实际结果 | 可回查证据 |
| --- | --- | --- | --- | --- |
| reset | android_0 | 查看已打开的 manifest | 真实屏幕显示三条文件名；s13 等文字准确复述。 | [artifacts/android_0/screenshots/step_000.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/artifacts/android_0/screenshots/step_000.png>) :: reset，已查看<br>[trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/trajectory.json>) :: step_index=13 :: thought |
| s0–28 | android_1 | 反复进入 Files、抽屉、存储目录并返回 | s6 实际位于 DCIM，列表为 Camera 文件夹，并非 Recordings；导航尝试持续。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/trajectory.json>) :: step_index=0..28<br>[artifacts/android_1/screenshots/step_014.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/artifacts/android_1/screenshots/step_014.png>) :: s6 后，已查看 |
| s29–48 | android_1 | 尝试搜索 Recordings、退出选择态、重开 Files | 有策略调整，但没有进入短信应用或输入/发送短信；目录核查未形成可用下游交付。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/trajectory.json>) :: step_index=29..48 |
| s49 / evaluation | android_1 | 停留存储根目录并达到 max_steps | 终局截图是 sdk_gphone64_arm64 根目录列表；原 E1 无匹配已发短信，E2 源文件保持通过。 | [artifacts/android_1/screenshots/step_100.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/artifacts/android_1/screenshots/step_100.png>) :: s49 后，已查看<br>[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/evaluator_trace.json>) :: evaluators[0..1]<br>[result.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/161_android_only_267/result.json>) :: termination_reason=max_steps |

未满足要求／对照结论：要求的核查状态短信没有完成。全部 50 个动作都停留 android_1 的 Files/导航流程，无短信动作。

机制：局部 GUI 导航停滞阻断后续交付。恢复与下游影响：出现搜索、返回、重开等恢复尝试，但直到预算耗尽未推进到短信交付；不把某一个点击强定为唯一最早不可恢复错误。

事实与解释边界：只针对这条完整链与关键截图判断区间停滞；并非由 steps=50 推断循环。下游未开始不证明模型不会发短信或忘记要发，而是上游核查持续未推进。

改进方向（假设）：将路径/当前目录与来源核查进度结合，并在反复无进展时更换定位策略值得测试；不能把复杂 GUI 操作简化成纯跨设备规划问题。

复核深度：本轮核对该 selected attempt 的完整动作/反馈链及所引原 trace；表中标明“已查看”的关键截图均实际打开核实，未逐张查看全部截图。

## S01 · 同任务对照：实际设置与页面提交均完成

模型：Claude Opus 4.8；task_id：`linux_smarthome_378`。成功对照（不计入失败案例）。

Selected attempt：[/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/112_linux_smarthome_378](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/112_linux_smarthome_378>)。

结果：原自动评测 PASS/1；裁决前主表 PASS/1；11 steps，终止 done。本例两层结果一致，不依赖补充裁决得出失败／成功结论。以 model + task_id + selected_attempt 在 [execution_results.csv](execution_results.csv) 定位，原评分来源为 [result.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/112_linux_smarthome_378/result.json>) :: success / score。

公开目标与设备角色：与 C03 相同的冻结任务 JSON；公开目标同为卧室空调 cool/21℃、不使用 heater，并提交 Linux 表单。 见 [config/task.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/112_linux_smarthome_378/config/task.json>) :: instruction / devices。

已完成的局部工作：s0 成功读取相同 HTML 需求；s1–3 连续完成开机、模式、目标温度；s4–9 完成页面提交。

| 步骤/区间 | 具体设备 | 动作或观测 | 实际结果 | 可回查证据 |
| --- | --- | --- | --- | --- |
| s0 | linux_0 | 读取 HTML | 输出包含 21℃、禁用 heater、需实际应用空调目标。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/112_linux_smarthome_378/trajectory.json>) :: step_index=0 :: info.stdout |
| s1–3 | home_0 | turn_on → set_mode cool → set_target_temperature 21 | 每步有成功 before/after 回读，最终 on/cool/21。 | [trajectory.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/112_linux_smarthome_378/trajectory.json>) :: step_index=1..3 :: info |
| s4–10 / evaluation | linux_0、home_0 | 填表提交并 done | s9 截图 URL 记录目标参数；两个原条件均 PASS，Home history 保留三条命令。 | [artifacts/linux_0/screenshots/step_017.png](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/112_linux_smarthome_378/artifacts/linux_0/screenshots/step_017.png>) :: s9 后，已查看<br>[evaluator_trace.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/retry_run_01/112_linux_smarthome_378/evaluator_trace.json>) :: evaluators[0..1] |

未满足要求／对照结论：无本轮新增失败判断；沿用原 PASS/1。

机制：用于约束 C03 的过强解释。恢复与下游影响：目标设备的 mode 和温度实际更新，不能将 C03 解释为任务只要求页面报告或所需操作根本不存在。

事实与解释边界：这是另一条正式 selected attempt，不是 GPT 的重试或独立 stage。两次运行的完整 Home inventory 不相同；目标空调初始 off/auto/24、需求与命令效果可回查，但不能声称像素、所有背景设备和运行时完全相同。

改进方向（假设）：仅提供具体可行执行链；不用于估计模型差异的原因，也不证明追加验证模块能改善总体成绩。

复核深度：本轮核对该 selected attempt 的完整动作/反馈链及所引原 trace；表中标明“已查看”的关键截图均实际打开核实，未逐张查看全部截图。

## 选样与排除边界

评分疑点或补充分析认为已完成的记录，不被本轮用作模型能力失败案例；这是定性选样边界，不是从主实验删行或改分。七个入选失败均有未完成公开要求的轨迹证据。Claude linux_only_218 是既有 pending 评分疑点，无独立明确失败要求，未选入；主实验仍保留原 FAIL/0.5。此前 GPT linux_android_1859 的候选论述没有最终原生 ODT 全文、字段语义也不如 C02 清楚，本轮不用于正文。GPT linux_android_smarthome_614 的既有计时分析显示请求等待占用大量预算，但未隔离服务端/网络/生成原因，故不作为“模型协调失误”案例；不因此删掉超时结果。Claude android_only_267 的已读恢复线索未扩成第二个同题失败样本，以保留任务多样性。没有重新审计或改分。

七条失败覆盖五种实际设备类型组合；其中 Home-only 和双 Android 案例明确限制了“所有问题都是异构跨设备协调”的解释。成功对照 S01 只核对一条具体可行链，不替代其他模型的 E2E 证据。
