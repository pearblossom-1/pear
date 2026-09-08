# DevicesWorld 跨设备发布范围轻量语义复核

日期：2026-09-08。性质：静态语义复核与发布建议，**不是完整执行验证，也不是全量任务质量审计**。

## 1. 结论与数量对账

已逐条阅读本轮 **247 条 unresolved** 的当前 instruction，并结合 setup 定位来源/目标环境；必要时继续读取指令直接引用的笔记、规则、资源或工作簿。另重新核实原先 3 条非跨设备任务的实际冲突材料。

| 本轮对象 | 数量 | cross_device | not_cross_device | unresolved |
|---|---:|---:|---:|---:|
| 原 unresolved 队列，逐条语义复核 | 247 | 247 | 0 | 0 |
| 原 3 条非跨设备，重新核实依据 | 3 | 0 | 3 | 0 |
| **语义复核合计** | **250** | **247** | **3** | **0** |
| 单 Home 范围核对，不做逐条完整语义审查 | 280 | 0 | 280 | 0 |
| 本次机读记录合计 | 530 | 247 | 283 | 0 |

因此：语义队列建议保留 247、明确排除 3、因跨设备关系未知而暂缓 0。另将 280 条单 Home 分离为补充任务。**283 是 3 + 280，不是新发现 283 条问题任务。**

机读详单：[cross_device_light_review.jsonl](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/analysis/statistics/cross_device_light_review.jsonl>)。每行包含任务路径、原判定、本轮判定、环境作用、短理由、证据、各实验交集及建议处理方式。用 `review_scope=semantic_review` 查看 250 条语义记录；用 `single_home_scope_only` 查看另外 280 条完整身份清单。原始 verdict 名称保留为 `confirmed_non_cross_device` / `unresolved`，本轮结果统一使用用户要求的三分类。

未删除、修改任何任务或共享资源；未修改 Core-200、Diagnostic-60、人工分配、实验分母或历史结果；未启动设备、重新运行 agent 或使用模型成败作分类依据。现有工作树本来存在未提交改动，本报告反映当前文件，不将 HEAD 当作内容完全一致的快照。

## 2. 本轮对象如何定位

首先阅读已上传报告对应的本地 `analysis/statistics/summary.md` 副本：
`/private/tmp/pear-statistics-upload.q6V8ao/analysis/statistics/summary.md`。
该副本与当前实验工作树的 [statistics/summary.md](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/statistics/summary.md>) 内容一致；逐任务材料实际位于该工作树的 `statistics/`，而非新输出目录。

本轮依据：

- [task_device_audit.jsonl](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/statistics/task_device_audit.jsonl>)：仅取 `verdict=unresolved` 的 247 条，再加已有 3 条手机非跨设备；当前 250 条顶层指令与初筛记录一致。
- [pending_device_review.md](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/statistics/pending_device_review.md>)：辅助定位；没有把里面另 467 条“至少两环境已明确、全部设备作用未核定”的记录误加进队列。
- [review_decisions.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/statistics/review_decisions.json>)：复核既有三个冲突型反例。
- [scope_manifest.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/statistics/scope_manifest.json>)：维持原 5,897 条候选范围，不拼接历史 real 目录。
- 当前 `tasks/smarthome/generated/` 中对应的 280 条规格：范围核对确认均只配置一个 `home_0`。同一 Home 的灯、空调等端点不拆成独立环境。

所有证据路径在 JSONL 中默认相对工作树根：
`/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826`。
`#/instruction`、`#/setup/N` 表示任务 JSON 指针；来源文件路径表示实际读取的补充依据。一般条目用完整顶层要求建立关系、setup 绑定设备，不声称读过所有被列出的资源正文或执行过 evaluator。

## 3. 判定边界与几个容易误判的例子

至少两个独立环境实际服务同一目标即保留；环境可以只提供必需信息。两台 Android、两台 Linux 均算跨设备。只确认至少两个参与者，不把这些记录当作全部 required-device topology 的最终审核。

- `linux_android_351`：Linux 指派表把 ORD-42 明确交给第一部手机；第二部手机是相似照片干扰源。Linux + 第一部手机已足够，不必证明第三环境不可替代。
- `linux_android_1803`、`1804`、`1805`：核对两手机的通讯录、日历或 Tasks 当前内容。禁止修改手机仍须读取实际内容，因此保留。
- `linux_smarthome_650`、`658`、`778`：第一台 Linux 的规则/时长资料指导第二台的队列/交接文档。即使 Home 不参与，也有两个独立 Linux 环境。
- `linux_smarthome_047`：顶层要求登记一条 **Home exception**，不仅是写 Linux 解释、保持 Home 不变；这是明确需要的 Home 输出，不能沿用三条手机反例的排除逻辑。
- `linux_smarthome_861`：直接引用的结果工作簿 `Guest Result Handling Guide` 要求检查客房实际设备，并在缺失时提交 missing_device。即便不能预热，Home 的盘点仍必需。依据：[result.xlsx](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/tasks/cross_device/linux_smarthome_assets/linux_smarthome_861/source/tmp/guest/result.xlsx>)，`Guest Result Handling Guide!A1:B5`。
- `linux_smarthome_866`：请求确实缺绝对开始时间，规则禁止猜时间、建计划或发设备命令；但顶层还明确引用 [air-handover-spec.md](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/tasks/cross_device/linux_smarthome_assets/linux_smarthome_866/source/tmp/handoff/air-handover-spec.md>)，要求从当前证据填写 `state_at_review.kitchen_air_purifier_1.power` 和 `level`。因此 Home 当前状态仍必需。并非为了算跨设备额外增加核验，也不是用 evaluator 的隐藏要求补足。
- `linux_smarthome_878`：新鲜度规则明确要求以 live Home state 复核旧快照，不能把旧高湿值或工作表提示直接当作真实状态检查的替代。

少量直接相关工作簿按 Spreadsheets 技能做只读内容提取；未修改或导出工作簿。这里只判断环境依赖，不判断提示难度、任务总体质量或 evaluator 宽严。

## 4. 明确排除、补充保留与暂缓名单

### 4.1 原三条：维持 not_cross_device

| 任务 | 当前材料中的决定性依据 | 发布建议 | 已知实验关联 |
|---|---|---|---|
| android_smarthome_123 | 同机 Markor 禁止今晚改变卧室；同机日历要求 21:00 调灯至 20%。冲突和报告事实都在手机，Home 仅保持不变。 | 移出正式跨设备清单，保留原文件 | 已分配 Non-Core 人工样本；是否已进入统计 unknown |
| android_smarthome_124 | 联系人偏好 90%、夜间规则 25%、访问 19:20 均在同机。判断固定冲突不需要 Home 当前状态。 | 同上 | 不在已核实 Core/Diagnostic/人工分配清单；已统计人工样本交集 unknown |
| android_smarthome_129 | 同机笔记同时要求开灯和关灯；要求只记录冲突并不执行。 | 同上 | 同上 |

直接材料：

- [123：Protected Bedroom.md](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/tasks/cross_device/android_smarthome_assets/android_smarthome_123/android/android_0/markor/Protected Bedroom.md>)；另见任务 setup 的 Calendar 事件。
- [124：Night Low Light Rule.md](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/tasks/cross_device/android_smarthome_assets/android_smarthome_124/android/android_0/markor/Night Low Light Rule.md>)；另见任务 setup 的 Contacts 和 Calendar。
- [129：Conflicting Bedtime Plan.md](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/tasks/cross_device/android_smarthome_assets/android_smarthome_129/android/android_0/markor/Conflicting Bedtime Plan.md>)。

它们可以是有效的单手机冲突识别任务；“排除”只表示不符合本轮跨至少两环境的发布目标，不表示任务有缺陷。Home reset、安装或 evaluator 的 unchanged 检查不构成执行必需环境。

### 4.2 单 Home：280 条全部建议分离为补充任务

范围为原统计中 `tasks/smarthome/generated/` 的 280 条，完整 task_id/task_path 已逐条列入 JSONL 的 `single_home_scope_only`，没有仅凭总数猜身份。仅核实一个 Home 的范围及实验交集，不逐条扩展语义审查。建议保留原文件与共享资源，但不混入正式跨设备清单。

### 4.3 unresolved 暂缓发布

本轮剩余 `unresolved` **0 条，名单为空**。这不等于实验交集也完全已知：人工“已进入统计”的成员身份仍有独立不确定性，见下节。

## 5. 与实际实验集合的交集

### 5.1 成员依据

| 集合 | 实际成员证据 | 本轮使用方式 |
|---|---|---|
| Core-200 | [当前 mdcbench_lite_v1.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/tasks/mdcbench_lite/mdcbench_lite_v1.json>)，以及 [GPT baseline run_metadata.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/gpt-5.5-lite/mdcbench_lite_v1/core200_rerun_20260826_run_01/run_metadata.json>) 的 manifest 字段 | 200 个 ID；该 run 保存的 config/task.json 共 201 份、200 个唯一 ID，与当前清单一致。只核实配置身份，不读成功率/结果。 |
| Diagnostic-60 原任务 | [diagnostic60_final.jsonl](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/experiments/diagnostic60/diagnostic60_final.jsonl>)；[GPT formal run_manifest](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/diagnostic60/gpt-5.5/formal_v1/run_manifest.json>) 指向 executable specs；[Gemini formal run_manifest](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/diagnostic60/gemini-3.1-pro-preview/formal_v1/run_manifest.json>) 的 stage_ids | Gemini manifest 的 241 个 stage ID 还原为 60 个原任务，与 final 清单一致；不把 stage 数当原任务数，不读取成败。 |
| 人工已分配 | [core200_manifest.jsonl](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/experiments/human_validation1000/core200_manifest.jsonl>)、[noncore800_manifest.jsonl](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/experiments/human_validation1000/noncore800_manifest.jsonl>)、[annotator_assignments.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/experiments/human_validation1000/annotator_assignments.json>) | 200 Core + 800 Non-Core；这能证明分配，不能自动证明已执行或已计入正式人工统计。 |
| 人工已进入统计 | README 指定的主数据库；当前可读副本位于 integration worktree，见下文 | 完整成员无法核实，所有条目的此项交集记为 unknown。 |

没有把名称含 real200 的目录当作 Core-200，也没有把共享历史来源 ID 直接当作同一当前任务。

### 5.2 直接交集对账

| 对象 | Core-200 | Diagnostic-60 原任务 | 人工已分配 Core | 人工已分配 Non-Core | 人工已进入统计 |
|---|---:|---:|---:|---:|---|
| 247 条复核后保留 | 3 | 0 | 3 | 37 | unknown |
| 3 条手机非跨设备 | 0 | 0 | 0 | 1 | unknown |
| 280 条单 Home | 10 | 0 | 10 | 0 | unknown |

Core-200 直接相交且建议保留的三条为：
`linux_android_1313`、`linux_smarthome_433`、`linux_smarthome_670`。实验身份只用于安排优先复核，不改变标准。

人工 Non-Core 已分配且建议保留的 37 条：

- android_only：`android_only_185`
- linux_only：`linux_only_027`、`linux_only_133`
- linux_android：`linux_android_1115`、`linux_android_1128`、`linux_android_1195`、`linux_android_1281`、`linux_android_1295`、`linux_android_1301`、`linux_android_1379`、`linux_android_1447`、`linux_android_1451`、`linux_android_1464`、`linux_android_1483`、`linux_android_1498`、`linux_android_1543`、`linux_android_1548`、`linux_android_1556`、`linux_android_1575`、`linux_android_1669`、`linux_android_1757`、`linux_android_712`、`linux_android_772`、`linux_android_844`、`linux_android_882`、`linux_android_897`
- android_smarthome：`android_smarthome_021`、`android_smarthome_565`、`android_smarthome_804`
- linux_smarthome：`linux_smarthome_047`、`linux_smarthome_191`、`linux_smarthome_297`、`linux_smarthome_354`、`linux_smarthome_599`
- linux_android_smarthome：`linux_android_smarthome_579`、`linux_android_smarthome_582`、`linux_android_smarthome_661`

人工 Non-Core 已分配且建议排除的唯一直接交集是 `android_smarthome_123`。人工分配总直接交集为 51 条：3 + 37 + 1 + 10，Core/人工 Core 重叠不重复当作两条任务。

### 5.3 拟分离且属于 Core-200 的 10 条单 Home

这 10 条也均在人工 Core 分配清单。**全部等待用户决定实验关联的后续说明/处理，不自动替换或改分母。**

- `sh1_state_inquiry_bathroom_humidity_feasible_0001`
- `sh1_state_inquiry_bedroom_energy_query_infeasible_0012`
- `sh2_implicit_intent_nursery_air_comfort_infeasible_0011`
- `sh3_explicit_control_close_living_curtain_feasible_0001`
- `sh3_explicit_control_plain_light_dimming_infeasible_0013`
- `sh4_time_schedule_living_ac_temperature_feasible_0032`
- `sh4_time_schedule_missing_balcony_light_infeasible_0014`
- `sh4_time_schedule_study_focus_sequence_feasible_0030`
- `sh5_event_schedule_plain_light_dim_after_dryer_infeasible_0016`
- `sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016`

加上 `android_smarthome_123`，共有 **11 条已知实验或人工分配关联的拟移出任务**。不是 10 + 10 + 1 = 21；两份清单中的相同 Core 任务只计一次。

### 5.4 历史迁移关联，不当成相同当前版本

历史 [topology_views_manifest.json](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/tasks/cross_device/_manifests/topology_views_manifest.json>) 给出以下映射。本轮又比较当前任务内容，结果是有明确历史关联但版本不同：

| 当前编号任务 | Core-200 中关联任务 | 内容核实 |
|---|---|---|
| linux_android_168 | a2l_browser_dual_phone_code | 双手机验证码/账户 ID 的验证流程相近，但账户笔记名称与当前内容不同。 |
| linux_android_203 | al_camera_web_upload_form | 当前 Asset Intake 标签图、四字段 intake 页面，不同于 Core 的 Camera 图片和三字段 upload 表单。 |
| linux_android_221 | al_map_audio_packet | 同组三站点，但录音命名/时长要求及 ODT/PDF 交付路径已不同。 |

JSONL 将其标为 `related_migrated_variant`，`direct_match=false`，不加入上表 Core 直接交集 3 条，也不冒称完全无关。这三条本轮均保留，因此没有新增排除风险。对应 Core 版本均不在 Diagnostic-60；当前 530 条与已核实 Diagnostic-60 原任务清单无直接或上述迁移关联交集。

### 5.5 人工已统计样本：unknown，不能声称无交集

[human_validation1000 README](</Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/experiments/human_validation1000/README.md>) 指向 `experiments/human_validation1000/human_validation.sqlite3`。
实验 worktree 中未找到该主库；可读的 integration 副本是：

`/Users/lht/home/MDCBench/workflow/integration_worktrees/all-task-update-intergration/experiments/human_validation1000/human_validation.sqlite3`

仅以 SQLite read-only 模式查询记录身份/完成状态；其中 `core_execution_records`、`noncore_review_records` 的 completed 记录数均为 0。这不能证明外部机器、导出或最终合并统计中没有人工样本。少量局部 manual-UI 运行目录也不等价于完整已计入人工统计的清单。

因此，本轮无法准确恢复“已经纳入正式人工统计”的完整成员；JSONL 为所有 530 条将 `human_counted.status` 设为 `unknown`。需要用户提供最终人工统计使用的 task_id/manifest/合并数据库或导出位置，才能关闭该项。已知分配交集只能作为可能影响实验的提示，不冒充 completed 样本。

## 6. 候选集数量：条件性计算，不是最终发布规模

原范围继续是 **5,897**：

`5,367（原静态规则支持）+ 247（本轮逐条确认跨设备）+ 3（手机非跨设备）+ 280（单 Home）= 5,897`

若全部发布建议生效：

`5,897 - 280 - 3 - 0（仍 unresolved）= 5,614`

等价于 `5,367 + 247 = 5,614`。**5,614 是同一候选范围下建议保留的跨设备数量，不是宣称最终 DevicesWorld 发布规模已确定**；其中原 5,367 条没有在本轮重新逐条语义审查。另 467 条全部角色尚未核定的问题也未扩展处理。

已知需用户决定的实验关联拟移出项为 11 条，已包含在上面的 283 条减项中，不再二次扣减：

| 条件性场景 | 计算 | 数量 |
|---|---|---:|
| 本轮未实施任何移出，当前原候选范围 | 原范围 | 5,897 |
| 仅为决策展示：先保留已知 11 条实验关联项不处理，其余建议生效 | 5,897 - (283 - 11) | 5,625 |
| 全部建议生效，含 11 条关联项 | 5,625 - 11，或直接 5,897 - 283 | 5,614 |

5,625 **不满足全部任务均为跨设备的最终目标**，只是保留 11 条待决定项的过渡记账示例。其余 272 条也不能声称“确定不涉及任何人工结果”，因为 human_counted 交集未知；该不确定性影响后续发布操作授权，不改变任务的跨设备分类。

没有把 `real20/100/200/300` 再拼进候选范围，没有为恢复 6,140 凑数。没有将 Core-200 自动改为 190，也没有改动 Diagnostic-60 或人工统计分母。

## 7. 静态规则漏判模式

本轮确认的主要模式：

- 自然语言用岗位/设备角色指代环境，例如 field phone、review tablet、reporting workstation，旧规则未充分将其和 setup 绑定。
- 只读来源与输出端之间的依赖，例如另一手机配方、联系人、当前播放或 Linux 政策，不能要求所有环境都发生修改。
- 真正要求藏在明确引用的来源/交接材料中；`linux_smarthome_866` 的当前状态字段说明为什么不能只看顶层简写或“不得控制”。
- Home 的实际盘点、计划查询/编辑、明确要求的原生异常记录，不等于“Home 仅保持不变”。
- 只需两个环境成立，不能因第三/第四环境是干扰或作用未核定而把整个任务继续记为 unresolved。

这些只是对本轮队列的解释，未据此启动新的全量审查，也未修改静态分类脚本。

## 8. 需要用户决定

1. 是否采纳发布层面的 280 条单 Home 分离及 3 条手机非跨设备排除建议；原文件继续保留。
2. 对已知关联的 10 条 Core 单 Home 和 `android_smarthome_123`，如何说明“历史实验集合”与“新的跨设备发布范围”的差别。当前所有实验与历史结果保持原样，任何重新统计或替换另行授权。
3. 提供最终已计入人工统计的成员清单/数据位置，核实尚未关闭的交集 unknown。
4. 最终 release manifest 尚未指定，本轮仅完成当前候选范围的这次发布语义收尾，不宣布最终规模。

## 附录：247 条建议保留的完整名单

下列清单仅为本轮复核后保留任务，不包括原先已由静态规则支持的 5,367 条。每条的具体环境作用、理由与证据见同名 JSONL；本轮没有将未读任务批量沿用自动分类。

### android_only（2 条）

`android_only_185`、`android_only_322`

### linux_only（9 条）

`linux_only_027`、`linux_only_110`、`linux_only_133`、`linux_only_174`、`linux_only_293`、`linux_only_307`

`linux_only_316`、`linux_only_351`、`linux_only_359`

### linux_android（146 条）

`linux_android_108`、`linux_android_125`、`linux_android_127`、`linux_android_168`、`linux_android_177`、`linux_android_200`

`linux_android_203`、`linux_android_220`、`linux_android_221`、`linux_android_223`、`linux_android_225`、`linux_android_261`

`linux_android_274`、`linux_android_280`、`linux_android_295`、`linux_android_299`、`linux_android_318`、`linux_android_351`

`linux_android_484`、`linux_android_632`、`linux_android_638`、`linux_android_653`、`linux_android_656`、`linux_android_660`

`linux_android_671`、`linux_android_687`、`linux_android_690`、`linux_android_710`、`linux_android_712`、`linux_android_719`

`linux_android_729`、`linux_android_736`、`linux_android_742`、`linux_android_745`、`linux_android_771`、`linux_android_772`

`linux_android_826`、`linux_android_844`、`linux_android_848`、`linux_android_882`、`linux_android_897`、`linux_android_898`

`linux_android_906`、`linux_android_927`、`linux_android_933`、`linux_android_964`、`linux_android_983`、`linux_android_998`

`linux_android_1027`、`linux_android_1033`、`linux_android_1038`、`linux_android_1055`、`linux_android_1058`、`linux_android_1065`

`linux_android_1086`、`linux_android_1097`、`linux_android_1102`、`linux_android_1114`、`linux_android_1115`、`linux_android_1123`

`linux_android_1128`、`linux_android_1134`、`linux_android_1135`、`linux_android_1137`、`linux_android_1139`、`linux_android_1158`

`linux_android_1168`、`linux_android_1171`、`linux_android_1188`、`linux_android_1195`、`linux_android_1213`、`linux_android_1218`

`linux_android_1223`、`linux_android_1228`、`linux_android_1238`、`linux_android_1246`、`linux_android_1259`、`linux_android_1268`

`linux_android_1271`、`linux_android_1281`、`linux_android_1283`、`linux_android_1294`、`linux_android_1295`、`linux_android_1301`

`linux_android_1304`、`linux_android_1313`、`linux_android_1316`、`linux_android_1318`、`linux_android_1323`、`linux_android_1326`

`linux_android_1335`、`linux_android_1338`、`linux_android_1350`、`linux_android_1379`、`linux_android_1385`、`linux_android_1387`

`linux_android_1390`、`linux_android_1391`、`linux_android_1398`、`linux_android_1403`、`linux_android_1415`、`linux_android_1422`

`linux_android_1424`、`linux_android_1427`、`linux_android_1433`、`linux_android_1441`、`linux_android_1444`、`linux_android_1447`

`linux_android_1451`、`linux_android_1457`、`linux_android_1460`、`linux_android_1464`、`linux_android_1466`、`linux_android_1473`

`linux_android_1474`、`linux_android_1479`、`linux_android_1481`、`linux_android_1483`、`linux_android_1491`、`linux_android_1493`

`linux_android_1495`、`linux_android_1498`、`linux_android_1536`、`linux_android_1543`、`linux_android_1548`、`linux_android_1555`

`linux_android_1556`、`linux_android_1559`、`linux_android_1563`、`linux_android_1575`、`linux_android_1588`、`linux_android_1621`

`linux_android_1643`、`linux_android_1669`、`linux_android_1677`、`linux_android_1743`、`linux_android_1752`、`linux_android_1753`

`linux_android_1757`、`linux_android_1760`、`linux_android_1803`、`linux_android_1804`、`linux_android_1805`、`linux_android_1823`

`linux_android_1834`、`linux_android_1845`

### android_smarthome（22 条）

`android_smarthome_021`、`android_smarthome_085`、`android_smarthome_098`、`android_smarthome_113`、`android_smarthome_153`、`android_smarthome_389`

`android_smarthome_395`、`android_smarthome_532`、`android_smarthome_563`、`android_smarthome_565`、`android_smarthome_576`、`android_smarthome_785`

`android_smarthome_789`、`android_smarthome_793`、`android_smarthome_804`、`android_smarthome_808`、`android_smarthome_817`、`android_smarthome_934`

`android_smarthome_945`、`android_smarthome_968`、`android_smarthome_981`、`android_smarthome_992`

### linux_smarthome（60 条）

`linux_smarthome_047`、`linux_smarthome_166`、`linux_smarthome_173`、`linux_smarthome_191`、`linux_smarthome_203`、`linux_smarthome_297`

`linux_smarthome_341`、`linux_smarthome_354`、`linux_smarthome_365`、`linux_smarthome_367`、`linux_smarthome_377`、`linux_smarthome_386`

`linux_smarthome_388`、`linux_smarthome_400`、`linux_smarthome_412`、`linux_smarthome_432`、`linux_smarthome_433`、`linux_smarthome_443`

`linux_smarthome_476`、`linux_smarthome_522`、`linux_smarthome_569`、`linux_smarthome_599`、`linux_smarthome_604`、`linux_smarthome_609`

`linux_smarthome_617`、`linux_smarthome_621`、`linux_smarthome_629`、`linux_smarthome_631`、`linux_smarthome_636`、`linux_smarthome_639`

`linux_smarthome_641`、`linux_smarthome_645`、`linux_smarthome_649`、`linux_smarthome_650`、`linux_smarthome_652`、`linux_smarthome_654`

`linux_smarthome_658`、`linux_smarthome_659`、`linux_smarthome_660`、`linux_smarthome_667`、`linux_smarthome_669`、`linux_smarthome_670`

`linux_smarthome_674`、`linux_smarthome_675`、`linux_smarthome_680`、`linux_smarthome_695`、`linux_smarthome_748`、`linux_smarthome_756`

`linux_smarthome_777`、`linux_smarthome_778`、`linux_smarthome_852`、`linux_smarthome_861`、`linux_smarthome_866`、`linux_smarthome_878`

`linux_smarthome_901`、`linux_smarthome_911`、`linux_smarthome_916`、`linux_smarthome_921`、`linux_smarthome_931`、`linux_smarthome_956`

### linux_android_smarthome（8 条）

`linux_android_smarthome_114`、`linux_android_smarthome_306`、`linux_android_smarthome_320`、`linux_android_smarthome_551`、`linux_android_smarthome_579`、`linux_android_smarthome_582`

`linux_android_smarthome_661`、`linux_android_smarthome_766`

