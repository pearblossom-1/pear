# DevicesWorld 真实失败案例

## 证据口径与阅读范围

本文只使用三套 canonical 合并结果指定的 selected attempt。路径别名如下：

- `U/`：`runs/ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/run_01/`
- `Q/`：`runs/qwen3.7-plus-core200-20260829/mdcbench_lite_v1/run_01/`
- `V/`：`worker-worktrees/ui-venus-core200-20260905/runs/ui-venus-1.5-30b-a3b-adapted-direct-core200-delay3s/mdcbench_lite_v1/`

本轮定向核实 8 个失败任务的三系统 selected attempts：共 24 次运行，其中 20 次为正式 FAIL、4 次为同任务 PASS 对照；另核实 1 个成功任务的 3 次 PASS 运行。对 27 次运行均核对 task snapshot、`result.json`、轨迹和 evaluator trace；涉及下述 Android 界面结论的截图也已实际查看。这个样本用于解释机制，不是随机样本，不能计算失败原因占比。

| Case | task_id | UFO³ + GPT-5.5 | Qwen3.7-plus | UI-Venus | 用途 |
|---|---|---:|---:|---:|---|
| C01 | `al_calendar_schedule_conflict` | FAIL / 0.000 | FAIL / 0.000 | FAIL / 0.000 | 正文 |
| C02 | `l2_csv_to_json` | PASS / 1.000 | PASS / 1.000 | FAIL / 0.000 | 正文 |
| C03 | `android_smarthome_202` | PASS / 1.000 | FAIL / 0.000 | FAIL / 0.000 | 正文 |
| C04 | `linux_android_1798` | FAIL / 0.000 | PASS / 1.000 | FAIL / 0.000 | 正文 |
| C05 | `linux_android_smarthome_161` | FAIL / 0.000 | FAIL / 0.500 | FAIL / 0.000 | 附录 |
| C06 | `linux_android_904` | FAIL / 0.000 | FAIL / 0.333 | FAIL / 0.000 | 附录 |
| C07 | `a2_alarm_conflict_log` | FAIL / 0.333 | FAIL / 0.333 | FAIL / 0.333 | 附录 |
| C08 | `a2l2_vscode_web_music_final_gate` | FAIL / 0.000 | FAIL / 0.000 | FAIL / 0.000 | 附录 |
| SC01 | `linux_android_smarthome_474` | PASS / 1.000 | PASS / 1.000 | PASS / 1.000 | 成功反例 |

分数仅复述正式结果，不把 partial score 当作已完成 stage。C01–C08 的 task snapshot 在三组运行中逐字节相同，且没有沿用已被 canonical repair 替代的原始无效 attempt。

## C01：局部探索耗尽全局预算

- **模型与 attempt**：UFO³ + GPT-5.5，Lite 004，`U/004_al_calendar_schedule_conflict/attempts/attempt_001`；正式 FAIL，score 0，评分无争议。
- **公开目标与设备角色**：从 `android_0` 的 Simple Calendar Pro 取得权威会议信息；在 `linux_0` 依规则更新 `week.csv`，并生成变更日志 `log.json`。
- **已完成的局部工作**：规划器把 Android 日历读取、Linux 规则读取以及更新/记录拆成三个子任务，并开始日历子任务。

| 步骤/区间 | 设备 | 可观察事实 | 原始证据 |
|---|---|---|---|
| 初始 constellation | Android / Linux | 日历子任务为 RUNNING，两个 Linux 子任务仍为 PENDING | `U/004.../trajectory.json:42-75` |
| 1–49 | `android_0` | 49 次 device-agent 环境动作全部落在 Android；没有 Linux 动作 | `U/004.../trajectory.json` 中全部 `agent_step.target_device_id`；`result.json:30-35` |
| 最后观测 | `android_0` | 实际查看的 `artifacts/android_0/screenshots/step_098.png` 仍停在月历界面，没有进入 Linux 处理 | 同路径截图；`trajectory.json:6014-6024` |
| 结束 | 全局 | 第 50 次 policy call 触发 step limit；0 次 replan | `result.json:20-38`；`trajectory.json:6030-6035` |
| 评估 | `linux_0` | `log.json` 不存在，`week.csv` 仍是旧内容，两项均为 0 | `U/004.../evaluator_trace.json:30-47,91-120` |

**未满足要求与机制。** 必要的 Linux 更新和日志都未发生。这里可观察到的机制是串行调度在局部 Android 探索没有收敛时仍持续投入全部动作预算，未把资源切换给独立可执行的 Linux 规则读取，也未触发动态重规划。不能由这一例推出所有 UFO³ 失败都来自调度；Qwen 和 UI-Venus 在同任务也失败，但本案例不把它们未经同等展开的轨迹归入相同机制。

**恢复、下游与改进边界。** 本次无恢复，两个下游产物均被阻断。可尝试为长时间无新信息的子任务设置 progress watchdog，并允许独立节点先行；这是案例启发的设计方向，不是已验证修复。

## C02：读取到了数据，却没有跨设备搬运

- **模型与 attempt**：UI-Venus，Lite 007，`V/run_01/007_l2_csv_to_json`；正式 FAIL，score 0，评分无争议。UFO³ `attempt_001` 与 Qwen `run_01` 均 PASS，作为同任务对照。
- **公开目标与设备角色**：读取 `linux_0:/tmp/orders/orders.csv`，在 `linux_1:/tmp/orders/orders.json` 生成 JSON。
- **已完成的局部工作**：UI-Venus 在 `linux_0` 看到了三条订单及完整字段，并正确描述需要转到 `linux_1`。

| 步骤/区间 | 设备 | 可观察事实 | 原始证据 |
|---|---|---|---|
| 1–3 | `linux_0`→`linux_1` | 已读出 ORD-100/101/102，并打开目标机终端 | `V/run_01/007.../trajectory.json:241-315` |
| 4 | `linux_1` | 命令仍尝试打开目标机上的 `/tmp/orders/orders.csv`，明确返回 `FileNotFoundError` | 同文件 `:317-371` |
| 5–49 | `linux_1` | 在已知同一错误后重复同一目标机本地读取，没有嵌入已读数据或采用传输路径 | 同文件中间步骤及 `:3870-3971` |
| 结束/评估 | `linux_1` | 50 步 `max_steps`；目标 JSON 不存在，score 0 | `result.json`；`evaluator_trace.json:64,114-115` |
| 成功对照 | `linux_0`→`linux_1` | Qwen 将已观察的 CSV 数据嵌入目标机脚本并写出 JSON，evaluator 通过 | `Q/007.../trajectory.json:125-180`；`evaluator_trace.json:114-115` |

**未满足要求与机制。** 失败不在 CSV→JSON 转换知识，而在 source/target 隔离：模型知道数据来自第一台机器，却让第二台机器按相同路径重新读源文件；错误反馈也没有改变策略。成功对照说明任务和 evaluator 在该版本可完成。

**恢复、下游与改进边界。** 本次没有恢复，目标产物缺失。可在 action feedback 中突出设备命名空间，并在重复相同错误后强制生成替代传输计划；本例不能证明哪一种 memory 或 planner 实现一定有效。

## C03：计划存在，但缺少完整的原子效果

- **模型与 attempts**：Qwen Lite 157 `Q/157_android_smarthome_202` 与 UI-Venus `V/run_01/157_android_smarthome_202` 均正式 FAIL；UFO³ `U/157.../attempt_001` PASS。评分无争议。
- **公开目标与设备角色**：从 `android_0` 最新短信取得 19:30 的 living-room 请求；在 `home_0` 安排空气净化器开机并调到 high，同时关闭窗帘。
- **已完成的局部工作**：Qwen 读到短信并创建了正确时间的 workflow；UI-Venus 也创建了 19:30 schedule。

| 运行 | 可观察结果 | 原始证据 |
|---|---|---|
| Qwen | workflow 含 purifier `set_level(high)` 和 curtain `close`，但没有 purifier `turn_on`；初态 power=off，因此预期 power=on 不成立 | `Q/157.../evaluator_trace.json:245-300`；已查看 `artifacts/android_0/screenshots/step_016.png` |
| UI-Venus | schedule 只含 purifier `set_level(high)`，同时缺少显式开机和 curtain close | `V/run_01/157.../evaluator_trace.json:254-289` |
| UFO³ 对照 | 同一 workflow 含 `turn_on`、`set_level(high)`、`close` 三个动作并通过 | `U/157.../attempts/attempt_001/evaluator_trace.json:255-305` |

**未满足要求与机制。** 正确时间与部分设备字段不足以实现用户要求的联合最终效果。该案例显示，计划型任务需要把设备前置状态和多设备动作视为一个必须完整满足的效果集合，而不是把一个显著参数更新当作整体完成。

**恢复、下游与改进边界。** 两个失败运行均主动 `done`，没有补查 planned effects。可在提交前依据初态模拟 workflow 的合成效果并检查每个必要设备；这里的证据只证明该动作集合不完整，不证明模型为何在内部遗漏动作。

## C04：完成声明与环境提交脱节，另有内容融合错误

- **模型与 attempts**：UFO³ Lite 034 `U/034_linux_android_1798/attempts/attempt_001`、UI-Venus `V/run_01/034_linux_android_1798` 正式 FAIL；Qwen `Q/034_linux_android_1798` PASS。评分无争议。
- **公开目标与设备角色**：比较 `android_0` 的 `Route review set` 播放列表与 `linux_0` manifest，使用 `linux_1` template 生成完整四行 audit CSV。
- **已完成的局部工作**：UFO³ 三个读取子任务得到了正确播放列表、manifest 和表头，并合成了正确的四行文本；UI-Venus也同时看到了三首 playlist tracks 与三条 manifest rows。

| 运行/步骤 | 可观察事实 | 原始证据 |
|---|---|---|
| UFO³ step 5 | device agent 返回了正确 `cat > ...` 命令和四行 CSV，却把 action 状态置为 `FINISH` | `U/034.../trajectory.json:1758-1833` |
| UFO³ step 5 后 | runner 记录 `subtask_status=COMPLETED`，但实际环境 `action` 为 `null` | 同文件 `:1835-1840` |
| UFO³ 评估 | `/tmp/music/playlist_audit.csv` 的 actual 为 null，score 0 | `U/034.../evaluator_trace.json:105-109,201-205` |
| UI-Venus steps 2–3 | 已看见 playlist-only 的 `route closeout` 和 manifest-only 的 `evening signature cue`，却只写三行，把后者标为 `extra` 并漏掉前者 | `V/run_01/034.../trajectory.json:227-269,313-356` |
| Qwen 对照 | 写出四条正确 semantic records 并通过 | `Q/034.../evaluator_trace.json:105-109,201-205` |

**未满足要求与机制。** UFO³ 分支是协议层的“声称已写入”与环境提交脱节：正确命令只存在于模型响应，从未执行。UI-Venus 分支是已经取得两侧事实后的集合差异融合错误。这两条机制都由最终状态支持，不依赖逐字格式偏好。

**恢复、下游与改进边界。** UFO³ 没有因空环境 action 驳回 COMPLETED；UI-Venus 也未回读完整记录。适合增加“完成必须伴随已执行动作或状态回读”的协议约束，以及对集合差的行数/覆盖检查；两种失败不能合并为同一个模型原因。

## C05：核心设备状态成功，用户交付仍缺失

- **模型与 attempt**：Qwen Lite 077，`Q/077_linux_android_smarthome_161`；正式 FAIL，score 0.5。UFO³/UI-Venus 同任务也 FAIL，但本案例机制以 Qwen 轨迹为准。
- **公开目标与设备角色**：结合短信联系人角色和 Linux 授权表，将 guest-room heater 调到允许值，并向请求人回复房间、22°C target 和最终开机状态。
- **已完成的局部工作**：Qwen 正确把 `guest_room_heater_1` 设置为 on / 22°C。

| 步骤/区间 | 设备 | 可观察事实 | 原始证据 |
|---|---|---|---|
| 状态设置后 | `home_0` | 最终 heater 为 on、target 22°C，该 evaluator 通过 | `Q/077.../evaluator_trace.json:68-98` |
| 后段 | `android_0` | SMS 搜索页已显示 Alex Morgan，但多次点击仍停留在搜索结果和键盘 | `trajectory.json:12040-12890`；已查看 `artifacts/android_0/screenshots/step_083.png` |
| 结束/评估 | `android_0` | 44 步后 time limit；sent box 中要求的回复为 missing | `result.json:14-32`；`evaluator_trace.json:4-66` |

**未满足要求与机制。** 用户要求的是状态变更加通知的联合交付；家居状态成功不能替代短信。这里是下游 handoff 在联系人线程导航上停滞，而不是授权推理或目标温度错误。

**恢复、下游与改进边界。** 轨迹知道尚需发信但没能打开线程，未恢复。partial score 只反映一项 evaluator 已满足，不能据此推断完整阶段划分。可在跨 app 任务中维护未关闭交付清单，并把“已发出”绑定到 sent-state 回读。

## C06：设备角色混淆与过晚切换目标设备

- **模型与 attempts**：UI-Venus Lite 031 `V/run_01/031_linux_android_904`、Qwen `Q/031_linux_android_904` 均正式 FAIL；UFO³同任务也 FAIL。UI-Venus score 0，Qwen score 0.333。
- **公开目标与设备角色**：在 `android_0` 打开 `904-A_source.md`，结合 `linux_0` 的 register/policy 创建 DOCX；在 `android_1` 添加 Mira Patel 联系人；在 `linux_1` 留 handoff 文本。
- **已完成的局部工作**：Qwen 的 DOCX 真实存在且内容 evaluator 通过；它也在末段回读了两个 Linux 文件。UI-Venus知道缺的是 Android Downloads 文件，但没有建立正确的设备边界。

| 运行/区间 | 可观察事实 | 原始证据 |
|---|---|---|
| UI-Venus 后段 | 明知 source 应在 `android_0`，仍多次让 `linux_0` 执行 `find / -name '904-A_source.md'`，Android source、联系人和两个 Linux 输出最终都未满足 | `V/run_01/031.../trajectory.json:3486-4014` 及后续；`evaluator_trace.json` |
| Qwen steps 45–46 | 回读 `linux_1` handoff 和 `linux_0` DOCX；DOCX evaluator 为 1 | `Q/031.../trajectory.json:4781-4938`；`evaluator_trace.json:28-111` |
| Qwen steps 47–49 | 到第 47 步才回到 `android_1`，依次 home、尝试打开 Contacts、打开 app drawer，未进入创建流程即到 50 步 | `Q/031.../trajectory.json:4982-5254` |
| Qwen 评估 | Mira Patel 联系人为 missing | `Q/031.../evaluator_trace.json:4-26` |

**未满足要求与机制。** UI-Venus 的明确问题是把 Android source 当作可在 Linux 本地文件系统搜索；Qwen 的明确问题是预算分配过晚，必要联系人直到最后三步才开始处理。Qwen 的 `handoff.txt` evaluator 也为 0，但 actual 文本含 source-derived 的字面词 `missing`，恰与 evaluator exclude 词冲突；本案例不靠这一项判失败，也不在本轮改分。联系人缺失本身已经是独立、无争议的必要结果失败。

**改进边界。** 可显式维护 artifact 所属设备、并为尚未启动的独立交付保留最低预算；不能从这一例判断 Qwen 的 handoff 文本最终是否应经评分审计改判。

## C07：来源时间已获取，Clock 提交仍未完成

- **模型与 attempts**：Lite 016；UFO³ `U/016.../attempts/attempt_001`、Qwen `Q/016...`、UI-Venus `V/repair_01/016...` 均正式 FAIL / 0.333。评分无争议。
- **公开目标与设备角色**：从 `android_0` Calendar 读取实际 08:20 departure，在 `android_1` 保留 07:50 preparation alarm 并新增启用的 08:20 `Depot departure`，再在 `android_0` 写两闹钟说明 note。
- **已完成的局部工作**：三组最终都保留了既有 07:50 alarm，因此只获得对应 guard/outcome 的分数；Qwen 明确读到了正确的 08:20。

| 步骤/区间 | 可观察事实 | 原始证据 |
|---|---|---|
| Qwen 前段 | Calendar 观测明确显示 `Depot departure` 08:20；Clock 显示原 07:50 已启用 | `Q/016.../trajectory.json:1008-1059` |
| Qwen 中段 | 多次点击错误坐标未打开加闹钟界面；轨迹持续承认无进展 | 同文件 `:1096-2029` |
| Qwen 结束 | time limit 时才出现仍为 15:00 的 time picker，尚未设置 08:20、label 或保存 | 同文件 `:2056-2102`；已查看 `artifacts/android_1/screenshots/step_043.png` |
| 最终评估 | 07:50 present，但 08:20 alarm missing，Markor note 为空 | `Q/016.../evaluator_trace.json:20-53,137-150` |
| UFO³视觉核对 | 最后 Clock 截图仍只显示 07:50 `Depot preparation` | `U/016.../artifacts/android_1/screenshots/step_040.png`（已查看） |

**未满足要求与机制。** 此例不是跨设备传值错误：至少在 Qwen 轨迹中，正确时间已经显式取得。失败发生在本地 Clock GUI 的控件定位与最终提交，导致依赖新 alarm 的 note 也没有产生。不能把三模型的相同最终分数解释为完全相同的内部原因；这里只把共同的最终缺项与 Qwen 的详细过程分开陈述。

**改进边界。** 可使用 UI element bounds/坐标尺度校验，并在保存后回读 label/time/enabled；这只是假设性改进，不证明问题一定由视觉模型本身导致。

## C08：上游 source 导航停滞造成级联未交付

- **模型与 attempts**：Lite 019；UFO³ `U/019.../attempts/attempt_001`、Qwen `Q/019...`、UI-Venus `V/repair_01/019...` 均正式 FAIL / 0。评分无争议。
- **公开目标与设备角色**：读取两台 Android 上的 checklist 与 playlist，修复 `linux_0` 的 validator，复制到 `linux_1`，并在 Chrome 留下三项 true 的可见结果。
- **已完成的局部工作**：三个运行都取得了 playlist；Qwen/UI-Venus 的主要停滞点是第一台手机的 Markor source。UFO³取得了两组 approved values，但其原始 `linux_0` 编辑子任务发生 framework/tool-routing 失败。

| 运行/区间 | 可观察事实 | 原始证据 |
|---|---|---|
| Qwen steps 10–15 | 反复在 `Current handoff` 和文件列表之间切换；虽然看见 `Launch checklist.md`，点击却持续打开错误 note | `Q/019.../trajectory.json:1100-1154,1308-1576`；已查看 `artifacts/android_0/screenshots/step_029.png` |
| UI-Venus 后段 | Markor 一直停在 More 页，从约 step 43 到 49 重复点击同一个 index 119，没有返回 Files | `V/repair_01/019.../trajectory.json:2668-3044` |
| UFO³ 中段 | 分配给 `linux_0` 的编辑子任务报告当前 session 没有 Linux command/GUI tooling，因而被标 FAILED | `U/019.../trajectory.json:2380-2432,2811-2841` |
| UFO³ 重规划 | replanner 改为在 `linux_1` 直接重建 target；它没有修复原始 `linux_0` 文件，最终源文件仍是 stub，源/目标不一致 | 同文件 `:2685-2728,2923-3127`；`evaluator_trace.json:38-40,75-77,105-109` |
| 最终评估 | UFO³ 四项均为 0；Qwen/UI-Venus 也未留下要求的修复、复制和可见 true 状态 | 各 selected attempt 的 `evaluator_trace.json` |

**未满足要求与机制。** Qwen/UI-Venus 展示的是上游 source navigation 停滞：后续修改、复制和最终 UI 状态随之未开始。UFO³ 展示的是工具可用性判断与任务重规划的边界：重规划绕到目标机重建，但没有恢复“先修复源文件、再复制”的用户要求，因而不能形成一致的两端状态。

**恢复、下游与改进边界。** UI-Venus无恢复；Qwen在列表与错误 note 间短暂切换但未取得 source；UFO³的 replan 有局部进展却没有闭合原任务。可让重规划显式检查不可变用户约束，并让 source 导航在重复动作后切换到语义 UI 元素定位。不能由本例断言所有长链任务都因第一步失败。

## SC01：四设备成功反例

- **模型与 attempts**：Lite 076 `linux_android_smarthome_474`；UFO³ `attempt_001`、Qwen `run_01`、UI-Venus `repair_01` 均 PASS / 1。
- **公开目标**：综合第一台手机的 playlist、第二台手机的 Calendar、Linux CSV 规则，在 SmartHome 按 lead time 创建完整 workflow。
- **事实证据**：Qwen 读取到 2-track `Workout Mix`、living room、20:30，再读 CSV 得到 lead=20、light=35、curtain=50，并在 20:10 创建两动作 workflow（`Q/076.../trajectory.json:216-278,477-555`）；UI-Venus执行同样的数据融合与 workflow（`V/repair_01/076.../trajectory.json:226-281,481-552`）。三组 evaluator 均为 score 1（各 `evaluator_trace.json:70-71`）。
- **排除的过强解释**：四设备或跨三类环境本身不必然导致失败。当 source 事实立即可见、映射规则明确且最终动作集合紧凑时，三种 baseline 均能闭合任务。它不能反过来证明设备数量完全没有影响，因为任务内容没有受控。

## 未采用为能力失败证据的记录

- `sh1_state_inquiry_bedroom_energy_query_infeasible_0012`（Qwen）：轨迹中有语义上合理的 infeasible report，但 evaluator 的 category alias/开关存在解释冲突；保持正式 FAIL，不用于 4.4，也不改分。
- `android_only_305`（UFO³）：截图中存在 Markor note，而固定 `.md` 路径读取为空；note 本身是否包含足够文件身份信息也有争议。保持正式结果，不用于 4.4。
- C06 的 Qwen `handoff.txt` outcome：实际文本与 evaluator 的 `missing` 排除词发生字面冲突。本轮只采用无争议的联系人缺失作为该案例失败证据。
