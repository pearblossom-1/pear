# 真实执行失败案例与证据边界

日期：2026-09-08。采用口径见 [执行分析](execution_analysis.md)。**5 条失败案例、1 条成功对照**；C01–C04 为正文候选，C05 为附录候选。另列 8 条排除项，不改动它们的主实验结果。

记号：`s0` 表示轨迹的 `step_index=0`，不是截图文件的编号。`trajectory.json` 含 reset、step、结束事件，按明确的 `step_index` 定位；Home 初态引用 `events[0].observation.observations.home_0`。截图编号是历史观测编号，不能拿来统计模型步数。表中 T、E 分别链接该案例的原始 trajectory、evaluator_trace；链接对应同一 selected attempt，不使用其他 run、当前 cache 或 live 状态。

各案例已从头到尾检查动作/反馈，并检查适用的最终状态；关键截图实际打开查看。结果均为既有自动评分，未找到对这些记录已生效的改判。这里的“没有独立评分争议”仅指所分析的具体未满足要求，不声称全部 evaluator 已审计。`info.ok=true` 仅表示动作接口受理，不自动证明 UI 子目标成功。

## C01：反复点击未打开会议内容，四设备交付未开始

**GUI-Owl-1.5-32B-Instruct / `a2l2_meeting_packet_full`**。Selected attempt：[001 主实验运行][c01-r]；既有 FAIL，score=0，50 步，578.706 秒，`max_steps`。正文候选。

公开目标与角色：[历史 instruction][c01-task] 要求第一手机 Calendar 提供会议详情，第二手机 Contacts 提供参会人，第一 Linux 提供确认码，第二 Linux 提供模板并生成 `agenda.docx`；最后在第二手机向两位参会人发送确认短信。缺少文档内容及确认短信是独立于格式偏好的必要结果。

| 步骤/区间 | 设备 | 动作、实际观测与反馈 | 证据 |
|---|---|---|---|
| s0–s1 | 第一手机 | 打开 Simple Calendar Pro 并等待，进入月历界面；这是已完成的局部工作。 | [T][c01-t]；[图 004][c01-s4] |
| s2 | 第一手机 | 开始执行 `click(index=0)`；该观测的 UI 元素 0 是工具栏搜索图标，不是会议日期单元格。 | [UI 004][c01-u4]；T 的 s2 |
| s2–s49 | 第一手机 | 连续 48 个动作均为 `click(index=0)`。反馈受理，但没有输入搜索词、有效改换操作或打开会议详情。中段仍是月历，末段为搜索获得焦点的月历。 | [T][c01-t]；[图 050][c01-s50]、[图 100][c01-s100] |
| 结束 | 全部设备 | 没有对第二手机和两台 Linux 执行动作；文档读取为 null、两条目标短信为 missing。 | T 全序列；[E][c01-e] 的 evaluators[0–2] |

**未满足与机制：** 持续点击未推进到所需信息，直至步数耗尽仍未恢复；上游获取停滞使文档和通知流程没有开始。不能仅用“调用成功”衡量进展。

**解释边界：** 关键界面并非每一像素都不变，搜索焦点发生了变化；本例判断的是必要状态没有推进。不能从下游没开始推出模型不会生成文档或发送短信，也不能由单次轨迹判定 Calendar 本身不可用。坐标/元素定位、界面反馈利用与模型策略的独立贡献未被实验隔离。

**改进假设：** 将预期的“打开事件详情”与下一观测比对，反复未达成时换用检索或重新定位；本轮未测试这种改进。

## C02：已形成无替代结论，但结果 Tasks 条目没有创建

**Kimi K2.6 / `android_smarthome_854`**。Selected attempt：[138 主实验运行][c02-r]；既有 FAIL，score=0.75，35 步，1867.647 秒，`time_limit`。正文候选。

公开目标与角色：[历史 instruction][c02-task] 要求手机读取清单，在 Retro Music 检查精确歌单，遵守禁止替代规则，然后创建未完成的 Tasks 条目 `Playlist routine result`，说明可用性、是否替代、是否安排 Home routine。不是要求在歌单缺失时仍强行调度 Home。

| 步骤/区间 | 设备 | 动作、实际观测与反馈 | 证据 |
|---|---|---|---|
| reset | 手机 | Markor 明文清单列出 `Evening Wind Down Kids`、近似歌单 `Evening Wind Down` 和 no-substitution 规则。 | [图 000][c02-s0] |
| s0–s5 | 手机 | 打开 Retro Music、返回/浏览歌单后，模型明确写出精确歌单不可用、不能替代，并转向 Tasks；列表截图显示一个名称被截断的近似歌单卡片。 | [T][c02-t] 的 thought/action；[图 010][c02-s10] |
| s7–s15 | 手机 | 多次改变点击坐标尝试新增任务；截图仍为 My Tasks 的空列表，没有进入目标条目的编辑/输入。 | T；[图 016][c02-s16]、[图 032][c02-s32] |
| s16–s34 | 手机 | 转向 Files、重新导航和搜索清单；最后搜索界面启用了 Images 过滤且没有匹配。全序列没有输入目标 Tasks 标题或正文。 | T；[图 070][c02-s70] |
| 结束 | 手机 + Home | Tasks 结果为 MISSING；没有 Home schedule/workflow，近似歌单保持。 | [E][c02-e] 的 evaluators[0–3] |

**未满足与机制：** 对约束的可见表述没有落实为用户要求的记录；尝试创建记录但交互没有成功，并在回到源文件搜索后耗尽时间，未恢复。缺条目不是同义词或字段顺序导致的评分失败。

**解释边界：** 截图中的歌单名有截断，不单凭该图声称已经完成音乐库可用性审计；所分析失败是结果条目确实缺失。0.75 主要反映保留约束，而非完成了三个独立阶段。本例 1792.746 秒记录为模型请求时间，超时还受调用延迟影响；不能把整段时长等同于 GUI 循环成本或纯推理缺陷。

**改进假设：** 维护待交付的记录子目标，并在点击之后检查是否进入编辑状态；无法证明仅增加 planner 或 verifier 就能解决具体输入定位问题。

## C03：目标手机文件导航未完成，照片状态交付为空

**Doubao-Seed-2.0-Pro / `android_only_234`**。Selected attempt：[162 主实验运行][c03-r]；既有 FAIL，score=0.5，33 步，1810.624 秒，`time_limit`。正文候选。

公开目标与角色：[历史 instruction][c03-task] 要求第一手机 Markor 提供照片清单；第二手机 Files 检查 `Pictures/Site`，并在第二手机 Markor 创建 `photo_status.md`，逐项报告 present/missing，不创建替代照片。虽然 family 名称包含 only，实际是 **两部 Android 手机**。

| 步骤/区间 | 设备 | 动作、实际观测与反馈 | 证据 |
|---|---|---|---|
| reset | 第一手机 | 清单实际显示 north_gate.png、meter_panel.png、old_notice.png 三个文件及说明。 | [图 000][c03-s0] |
| s0–s13 | 第二手机 | 打开 Files、等待，多次尝试侧栏、文件夹和搜索入口，没有形成逐项照片检查结果。 | [T][c03-t] |
| s14–s29 | 第二手机 | 改变点击位置、滑动、重开 Files，继续寻找内部存储/图片位置；这不是整段完全相同的动作循环。 | T 的完整中段 |
| s30–s32 | 第二手机 | 再次打开 Files、等待并点击；最后仍在 Downloads，显示 home 文件夹与 contacts.vcf，而非目标 Pictures/Site 内容。 | [图 066][c03-s66]；T |
| 结束 | 第二手机 | 全序列没有输入状态 note 或切换到 Markor 撰写。历史读取的 photo_status.md 状态内容为空；保留现存照片、不创建缺失照片的约束通过。 | [E][c03-e] 的 evaluators[0–2] |

**未满足与机制：** 有正确目标手机上的操作，但目录导航没有推进到必要结果，最终状态报告为空。不是“选错手机”，也不是信息已经获取后传错；上游文件检查/访问受阻，下游 note 没有形成。

**解释边界：** 源截图可见不等于模型已经准确读出每个文件名。多次点击中有界面变化与恢复尝试，因此不用“界面完全冻结”或“所有点击无效”描述。历史证据没有隔离 UI 输入映射、应用状态与模型定位策略的贡献。

**改进假设：** 以明确目录路径和逐项核对状态作为进展条件，并在当前目录不符时修正导航；效果尚未验证。

## C04：排程已写入，但遗漏关机设备的开机前置条件

**GUI-Owl-1.5-32B-Instruct / `android_smarthome_202`**。Selected attempt：[157 主实验运行][c04-r]；既有 FAIL，score=0，3 步，48.253 秒，`done`。正文候选，与 S01 对照。

公开目标与角色：[历史 instruction][c04-task] 要求读取手机最新客厅短信并按消息时间安排 Home 调整。历史 SMS 的 UI 文本为 “At 19:30, set living room purifier high and close the curtain.” 手机截图预览有省略，但当时 [UI 元素文本][c04-u0] 及 [s0 提示输入][c04-p0] 保留完整消息；不能把截图省略部分称为肉眼已显示全文。该提示中的命令说明分别列出 turn_on/turn_off 和 set_level。Home 初始时间 19:00，目标净化器为 off/low，窗帘开启 90%。

| 步骤/区间 | 设备 | 动作、实际观测与反馈 | 证据 |
|---|---|---|---|
| reset | 手机 + Home | 短信提供 19:30、净化器 high、关窗帘；Home 观测明确净化器 power=off，初始无计划。 | [图 000][c04-s0]、[UI 000][c04-u0]；[T][c04-t] 的 events[0] |
| s0 | Home | 成功写入 19:30 净化器 `set_level(high)` 的 schedule。 | T 的 s0/info 及后继 Home 计划列表 |
| s1 | Home | 成功写入同一时间的窗帘 `close` schedule。 | T 的 s1/info 及后继 Home 计划列表 |
| s2 / 结束 | Home | 主动 done；已有计划只有调档与关帘，没有立即开机或未来 `turn_on`。 | T 全序列；[E][c04-e] 的历史计划状态 |

**未满足与机制：** 用户要安排净化器高档运行，但已写入的动作集合没有让初始关闭的设备开机。时间与目标动作部分正确，接口也受理成功；遗漏的是使预期工作状态成立的前置动作，结束前没有修补。

**解释边界：** 本例历史轨迹没有执行 `advance_time`，因此只断言**计划内容不完整**，不声称已经观察到 19:30 的真实设备效果。计划任务也不必在 agent 运行时提前推进时间。失败解释不依赖 schedule ID、两个 schedule 与一个 workflow 的区别或动作是否以某种固定文本顺序记录；也不要求严格模仿 S01。

**改进假设：** 从初态和命令语义检查计划的可达终态，明确区分“设置档位”和“设备通电”。尚未通过干预实验验证改进收益。

## C05：用可调光家电替代用户指定的普通灯

**GUI-Owl-1.5-32B-Instruct / `sh3_explicit_control_plain_light_dimming_infeasible_0013`**。Selected attempt：[192 主实验运行][c05-r]；既有 FAIL，score=0，2 步，4.965 秒，`done`。附录候选。

公开目标：[历史 instruction][c05-task] 为 “It's almost bedtime—could you dim bedroom light 1 to 35%?”。本任务只有一个 Home 环境，初态清单同时列出 `bedroom_light_1`（普通 light）和 `bedroom_dimmable_light_1`（dimmable_light）。所分析偏离是实际改动了另一家电，不以不可行报告必须包含某个关键词为证据。

| 步骤/区间 | 设备 | 动作、实际观测与反馈 | 证据 |
|---|---|---|---|
| reset | Home 内的两盏灯 | 原生 inventory 区分普通灯与可调光灯；后者 brightness=50。 | [T][c05-t] 的 events[0].observation |
| s0 | Home / 可调光灯 | 对 `bedroom_dimmable_light_1` 执行 set_brightness(35)，反馈 before=50、after=35。 | T 的 s0/info |
| s1 / 结束 | Home | done；普通灯依旧只有 power 状态，可调光灯已被修改，且没有解释指定普通灯不支持调光。 | T；[E][c05-e] 的 devices、history、infeasible_reports |

**未满足与机制：** 所请求对象的动作不可用时，执行转向了同房间另一个支持该动作的对象，未恢复。动作本身真实生效，但生效于不同 appliance。

**解释边界：** 这是同一 Home 内实体匹配问题，不是跨手机/跨 Linux 路由错误。名称的自然语言映射来自公开 inventory 与请求，仍保留命名可读性的限制；不从一例推断普遍的实体绑定能力，也不分析不可行报告的具体评分措辞。

**改进假设：** 先确认用户指定实体，再检查其能力；能力不足时说明限制而非悄然替换。该策略在本轮没有实测。

## S01：同任务成功对照，不计入失败案例

**Kimi K2.6 / `android_smarthome_202`**。Selected attempt：[157 主实验运行][s01-r]；既有 PASS，score=1，2 步，62.962 秒，`done`。

| 步骤/区间 | 事实 | 证据 |
|---|---|---|
| reset | 同任务的短信目标及净化器 off/low 初态；不借用其他运行产物。 | [T][s01-t] 的 events[0] |
| s0 | 一次 schedule_workflow 在 19:30 安排净化器 turn_on、set_level(high)、窗帘 close；原生计划中保存这三个动作。 | T 的 s0/action、info 和后继 Home 状态 |
| s1 / 结束 | 主动 done，既有 evaluator 通过。 | T；[E][s01-e] |

这个对照支持“C04 缺少开机前置动作”的有限解释，反对“读短信后安排 Home 调整在本地一概不可执行”的过强说法。它不证明只能用一个 workflow，也不构成两模型统一 runtime、延迟和采样条件下的因果比较；没有把本次成功状态当作 C04 的执行证据。

## 排除项证据入口

以下编号与 [执行分析](execution_analysis.md#6-排除项与偶然评分疑点) 对应。所有结果保持原样；不加入上述失败机制证据集合。

| 编号 | 历史 selected attempt / 关键材料 | 本轮实际核对边界 |
|---|---|---|
| X01 | [Kimi 183 linux_only_295][x01]：trajectory.json 的归档/CSV 命令与读回，evaluator_trace.json | 核对实际写出记录与检查口径；不将明细行数疑点升格为能力失败。 |
| X02 | [Doubao 051 linux_android_1858][x02]：trajectory.json、evaluator_trace.json | 核对冲突和状态文件内容，保留表述关系疑点。 |
| X03 | [Kimi 065 linux_android_1314][x03]：trajectory.json 的 s5 错误与 s6 MATCH 回读、evaluator_trace.json | 已查看完整动作恢复链；不以早期 shell 错误归因，未使用当前 archive/cache 重新评分。 |
| X04 | [Doubao 177 linux_only_305][x04]：trajectory.json、evaluator_trace.json | 检查命令/尺寸/回读与 OCR 失败字段；**没有**取得独立归档的最终历史图像。 |
| X05 | [Kimi 006 a2_missing_media_status][x05]：artifacts/android_1/screenshots/step_020.png、step_021.png | 实际查看已写 note，不由保存图标状态推定未保存。 |
| X06 | [Kimi 024 a2l_osmand_calc_visit][x06]：artifacts/linux_0/screenshots/step_015.png、step_016.png | 实际查看最后 Calc 行；早期打开应用超时已恢复。 |
| X07 | [Doubao 141 android_smarthome_149][x07]：artifacts/android_1/screenshots/step_034.png、step_048.png、step_051.png | 实际查看草稿到已发送气泡的变化；没有将局部解析错误和重复点击当作最终发送失败。 |
| X08 | [Kimi 137 android_smarthome_409][x08]：trajectory.json 全部 48 步、artifacts/android_0/screenshots/step_096.png、evaluator_trace.json | 已查看末端 Files 列表中的 CSV 文件名，但不是正文。能确认导航没有完成及没有 Home 动作；不从评分 expected 反推未保存的历史源正文，证据不足不采用。 |

以上筛选不是抽样频率统计，也不是新的审批清单。已经得到足够的正文证据后停止扩大候选范围。

[c01-r]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full
[c01-task]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/config/task.json
[c01-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/trajectory.json
[c01-e]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/evaluator_trace.json
[c01-u4]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/artifacts/android_0/ui_elements/step_004.json
[c01-s4]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/artifacts/android_0/screenshots/step_004.png
[c01-s50]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/artifacts/android_0/screenshots/step_050.png
[c01-s100]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/001_a2l2_meeting_packet_full/artifacts/android_0/screenshots/step_100.png
[c02-r]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854
[c02-task]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/config/task.json
[c02-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/trajectory.json
[c02-e]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/evaluator_trace.json
[c02-s0]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/artifacts/android_0/screenshots/step_000.png
[c02-s10]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/artifacts/android_0/screenshots/step_010.png
[c02-s16]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/artifacts/android_0/screenshots/step_016.png
[c02-s32]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/artifacts/android_0/screenshots/step_032.png
[c02-s70]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/138_android_smarthome_854/artifacts/android_0/screenshots/step_070.png
[c03-r]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/162_android_only_234
[c03-task]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/162_android_only_234/config/task.json
[c03-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/162_android_only_234/trajectory.json
[c03-e]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/162_android_only_234/evaluator_trace.json
[c03-s0]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/162_android_only_234/artifacts/android_0/screenshots/step_000.png
[c03-s66]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/162_android_only_234/artifacts/android_1/screenshots/step_066.png
[c04-r]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/157_android_smarthome_202
[c04-task]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/157_android_smarthome_202/config/task.json
[c04-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/157_android_smarthome_202/trajectory.json
[c04-e]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/157_android_smarthome_202/evaluator_trace.json
[c04-s0]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/157_android_smarthome_202/artifacts/android_0/screenshots/step_000.png
[c04-u0]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/157_android_smarthome_202/artifacts/android_0/ui_elements/step_000.json
[c04-p0]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/157_android_smarthome_202/prompts/step_000_prompt.txt
[c05-r]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013
[c05-task]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/config/task.json
[c05-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/trajectory.json
[c05-e]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/evaluator_trace.json
[s01-r]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/157_android_smarthome_202
[s01-t]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/157_android_smarthome_202/trajectory.json
[s01-e]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/157_android_smarthome_202/evaluator_trace.json
[x01]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/183_linux_only_295
[x02]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/051_linux_android_1858
[x03]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/065_linux_android_1314
[x04]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/177_linux_only_305
[x05]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/006_a2_missing_media_status
[x06]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/024_a2l_osmand_calc_visit
[x07]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/141_android_smarthome_149
[x08]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/137_android_smarthome_409
