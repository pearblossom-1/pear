# DevicesWorld 主实验执行结果与定性失败分析

## 1. 分析输入与结果口径

本轮分析的是同一套 MDCBench Lite v1 Core-200 任务上的三个完整 baseline system，而不是把三者视为只更换了模型的严格消融：

| 分析名 | 实际 framework / model | canonical 结果 | 正式运行日期（Asia/Shanghai） | 合并报告时间 |
|---|---|---|---|---|
| `ufo3-gpt-5.5` | UFO³ / GPT-5.5 | `runs/ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/final_merged_status_after_infrastructure_repairs.json` | 2026-08-26 22:51 至 2026-08-29 08:49 | 2026-08-29 08:55 |
| `qwen3.7-plus` | direct LLM / qwen3.7-plus | `runs/qwen3.7-plus-core200-20260829/mdcbench_lite_v1/final_merged_status_after_infrastructure_repairs.json` | 2026-08-29 16:21 至 2026-09-01 21:28 | 2026-09-01 21:32 |
| `ui-venus-1.5-30b-a3b` | adapted direct LLM / ui-venus | `worker-worktrees/ui-venus-core200-20260905/runs/ui-venus-1.5-30b-a3b-adapted-direct-core200-delay3s/mdcbench_lite_v1/final_merged_status_after_infrastructure_repairs.json` | 2026-09-06 11:09 至 2026-09-07 13:44 | 2026-09-07 13:51 |

运行日期取 canonical 结果所选 `result.json` 的本地文件时间范围；单任务结果没有内嵌 wall-clock 起止字段，因此它不是更高精度的事件时间。合并报告时间取各 canonical JSON 的 `generated_at`。

结果表严格采用 canonical 合并文件指定的 selected attempt，不挑选最佳重试，也不混入 smoke、diagnostic 或旧实验。UFO³、Qwen、UI-Venus 分别有 3、5、22 条原始 pre-agent/infrastructure-invalid 记录被已有正式 repair attempt 替换；其余记录保持 primary attempt。`execution_results.csv` 同时保留 `raw_result`、`adopted_result`、`result_basis` 和原始证据路径。本轮没有新增改判，也没有把已被 repair 替代的无效记录当作失败案例。

三组结果均包含 200 个唯一 task_id，生命周期、逐任务结果和必要 artifacts 完整。对 600 个入选结果中的 `config/task.json` 做 SHA-256 核对后，三组 200 个任务逐一相同；因此同任务 outcome 可以配对描述。需要同时披露的是，三个 baseline 的 framework/runtime commit 并不完全相同：UFO³ primary 记录为 `54a48d4611afc88f8f3b9bd97e45a8eb2d99b787`，其三条 repair 只包含已记录的 preflight 修复；Qwen 为 `b67d88004f2949be510e2385a2e023804d4ae97e`，UI-Venus 为 `72d5fffea2405dd61ee76db1f10fb0fbe00d1936`。所以以下是 baseline-system 比较，不能归结为纯模型能力排名。

## 2. 总体结果

均值和中位数均以各模型 200 条 adopted selected attempts 为分母；score 沿用该次运行的原始 evaluator score。

| baseline | 有效运行 | PASS | 成功率 | mean score | steps 均值 / 中位数 | 时长均值 / 中位数（秒） |
|---|---:|---:|---:|---:|---:|---:|
| UFO³ + GPT-5.5 | 200 | 47 | 23.5% | 0.4460 | 26.07 / 22 | 847.75 / 685.20 |
| qwen3.7-plus | 200 | 39 | 19.5% | 0.4248 | 28.70 / 33 | 925.47 / 776.58 |
| ui-venus-1.5-30b-a3b | 200 | 12 | 6.0% | 0.1884 | 44.35 / 50 | 382.01 / 395.62 |

日志中的显式终止方式如下；`done` 只是 agent 主动结束，不等于 evaluator PASS。

| baseline | done | max_steps | time_limit | replanner_fail |
|---|---:|---:|---:|---:|
| UFO³ + GPT-5.5 | 132 | 40 | 22 | 6 |
| qwen3.7-plus | 83 | 69 | 48 | 0 |
| ui-venus-1.5-30b-a3b | 27 | 173 | 0 | 0 |

UI-Venus 的较短时长不能解释为更高执行效率：其 173/200 条以 `max_steps` 结束，中位数正好是 50 步；它与另外两组还使用不同 policy class 和动作适配层。类似地，Qwen 的 48 条 `time_limit` 不能在不读轨迹的情况下自动标成循环或推理错误。

## 3. 有依据的任务分组

### 3.1 按实际设备类型组合

设备类型直接读取每条任务的 `task.devices`。表中每格为“PASS 数 / 成功率；mean score”，同一行 N 对三个 baseline 相同。

| 设备类型组合 | N | UFO³ + GPT-5.5 | qwen3.7-plus | ui-venus |
|---|---:|---:|---:|---:|
| Android | 20 | 1 / 5.0%；0.204 | 0 / 0.0%；0.154 | 0 / 0.0%；0.154 |
| Android + Home | 25 | 3 / 12.0%；0.587 | 0 / 0.0%；0.407 | 0 / 0.0%；0.250 |
| Android + Home + Linux | 30 | 5 / 16.7%；0.525 | 1 / 3.3%；0.403 | 1 / 3.3%；0.111 |
| Android + Linux | 67 | 14 / 20.9%；0.338 | 11 / 16.4%；0.283 | 2 / 3.0%；0.136 |
| Home | 10 | 3 / 30.0%；0.550 | 4 / 40.0%；0.600 | 3 / 30.0%；0.500 |
| Home + Linux | 30 | 12 / 40.0%；0.542 | 11 / 36.7%；0.685 | 4 / 13.3%；0.280 |
| Linux | 18 | 9 / 50.0%；0.574 | 12 / 66.7%；0.782 | 2 / 11.1%；0.139 |

在这套固定任务中，三个 baseline 的 Android-only 组都弱于各自 Linux-only 组；包含 Android 的多环境组合也普遍低于相应的 Linux 或 Home 组。这只是任务组合与结果的描述性关联：各组任务内容、应用交互难度和 evaluator 数量并未受控，不能据此声称“加入 Android”具有独立因果效应。

### 3.2 按设备实例数

| 实例数 | N | UFO³：PASS / rate；score | Qwen：PASS / rate；score | UI-Venus：PASS / rate；score |
|---:|---:|---:|---:|---:|
| 1 | 10 | 3 / 30.0%；0.550 | 4 / 40.0%；0.600 | 3 / 30.0%；0.500 |
| 2 | 95 | 32 / 33.7%；0.483 | 30 / 31.6%；0.483 | 7 / 7.4%；0.200 |
| 3 | 66 | 9 / 13.6%；0.397 | 4 / 6.1%；0.373 | 0 / 0.0%；0.142 |
| 4 | 29 | 3 / 10.3%；0.399 | 1 / 3.4%；0.290 | 2 / 6.9%；0.149 |

三、四设备组的成功率在本数据中较低，但实例数与任务 family、Android 比例和链路长度混杂。成功对照 SC01 是四设备任务且三个 baseline 均通过，直接排除了“只要有四台设备就必然失败”的过强解释。

### 3.3 同任务配对

| 配对 | 两者都 PASS | 仅左侧 PASS | 仅右侧 PASS | 两者都 FAIL |
|---|---:|---:|---:|---:|
| UFO³ vs Qwen | 28 | 19 | 11 | 142 |
| UFO³ vs UI-Venus | 10 | 37 | 2 | 151 |
| Qwen vs UI-Venus | 11 | 28 | 1 | 160 |

三模型共同 PASS 10 条、共同 FAIL 141 条；另有 UFO³/Qwen/UI-Venus 独有 PASS 分别为 19/10/1 条，UFO³+Qwen 共同 PASS 而 UI-Venus FAIL 为 18 条，UFO³+UI-Venus 共同 PASS 而 Qwen FAIL 为 1 条。配对结果说明同任务对照是可行的，也说明少量案例不能代表全部 FAIL。

## 4. 案例选取与实际阅读范围

本轮对 8 个 task-level 失败案例的三模型 selected attempts 做了定向复核，共涉及 24 个运行：20 个正式 FAIL 和 4 个同任务 PASS 对照；另复核了 1 个四设备成功任务的 3 个 PASS 运行。每个入选案例至少核对当前 task snapshot、`result.json`、完整轨迹结构、关键步骤区间、`evaluator_trace.json`；涉及 Android UI 结论时还实际查看了相应历史截图。没有把旧 AI 摘要当作事实证据。

- 正文候选：C01 `al_calendar_schedule_conflict`、C02 `l2_csv_to_json`、C03 `android_smarthome_202`、C04 `linux_android_1798`。
- 附录候选：C05 `linux_android_smarthome_161`、C06 `linux_android_904`、C07 `a2_alarm_conflict_log`、C08 `a2l2_vscode_web_music_final_gate`。
- 成功对照：SC01 `linux_android_smarthome_474`。

旧的 `docs/paper_dossier/MDCBench_failure_analysis*.md` 只用于定位候选。它们包含其他模型或更早 UFO³ 运行，故所有写入本报告的关键结论均回查到上述 canonical selected attempt。未发现一份可以合法覆盖这三组 canonical 结果的新 `reconciled_task_results.csv`，因此本轮没有叠加新的评分裁决。

## 5. 轨迹支持的有限机制

1. **局部探索停滞可阻断尚未启动的下游。** C01 中 UFO³ 将 49 次设备动作全部投给 Android 日历子任务，独立可执行的 Linux 读取任务一直是 PENDING；这说明该次串行调度没有在局部进展不足时转移资源。C08 的 Qwen/UI-Venus 则在 Markor 导航上持续停滞，后续 HTML 修复和复制没有发生。
2. **跨设备边界被理解，但数据没有真正搬运。** C02 的 UI-Venus 已读出 linux_0 的完整 CSV，却在 linux_1 上反复读取只存在于 linux_0 的同一路径，直到 50 步；同任务 UFO³/Qwen 均成功，排除了任务本身不可完成。
3. **目标状态需要原子化动作集合，单个字段更新不等价于完成。** C03 中 Qwen 调度了 `set_level(high)` 与 `close`，但漏掉 purifier 的 `turn_on`；UI-Venus 只调度 `set_level`，又漏掉 curtain。UFO³ 的对照 workflow 同时包含三步并通过。
4. **“我已完成”的协议状态与环境提交可能脱节。** C04 中 UFO³ 子代理在同一 `FINISH` 响应里给出正确写文件命令和文本结果，但轨迹记录的环境 `action` 为 null，最终文件不存在。UI-Venus 的同任务则确实产生了文件，却把 manifest-only 项标成 extra 并漏掉 playlist-only 项；Qwen 的成功对照说明 evaluator 接受正确语义记录。
5. **局部成功不保证完整交付。** C05 中 Qwen 已正确设置 heater，却没有发出要求的 SMS；C06 中 Qwen 完成 DOCX，但联系人缺失，UFO³/UI-Venus 也因不同的 Android 导航与设备角色问题未完成全部交付。这里的 partial score 只能证明特定 evaluator outcome，不能自动解释为完成了一个独立 stage。

这些案例不支持计算机制占比，也不能证明所有失败都来自跨设备协调。C07 是本地 Clock UI 的提交失败；C04 的 UI-Venus 分支包含内容分类错误；它们在单个设备操作层已经足以造成失败。

## 6. 目前不成立或证据不足的解释

- 不能从设备数分组推出因果关系；SC01 是明确反例。
- 不能把 `max_steps` 一律称为循环，也不能把 `done` 一律称为正确完成；正文只对实际读过的轨迹作机制判断。
- 不能由正 partial score 推断跨设备 composition gap 的具体阶段边界。
- 三个 baseline 的 policy、adapter 和 runtime commit 不同，不能把差异全部归因于基础模型。
- 本轮是定向定性阅读，不是随机抽样或人工双标；案例数量不得用于估计总体失败原因比例。

## 7. 偶然发现但未处理的评分疑点

以下记录保持 canonical 原分，不改判，也不用于正文能力缺陷证据：

- `sh1_state_inquiry_bedroom_energy_query_infeasible_0012` 的 Qwen 运行实际调用了 `smarthome.report_infeasible`，reason 和 target 均说明 bedroom kWh 数据未暴露，但 `check_infeasible_report` 仍为 0。其 category 为 `unavailable_source_data`，与规则列出的 aliases 不同，而规则又声明 `require_category_alias=false`；需要独立 evaluator 审计才能判定，当前仅记录疑点。
- `android_only_305` 的 UFO³ 历史截图显示 Markor 中确有 `recording request status` note，但固定 `.md` 路径的 evaluator 返回空；同时 note 没有明确写出已存在的 `gate_brief_east.mp3` 文件名。这里同时存在路径/扩展名评分边界与内容是否充分的争议，故未作为正文真实失败案例，也未改分。
- C06 `linux_android_904` 的 Qwen `handoff.txt` 实际存在，但正文包含 source-derived 的字面词 `missing`，恰与 evaluator 的 exclude 词相撞。本轮不判断该项是否应通过，只使用同一任务中独立且明确的 `Mira Patel` 联系人缺失作为失败证据。

## 8. 结论边界与缺项

现有记录足以支持 4.4 的四个正文机制和一个反例，不需要继续精读剩余全部 FAIL。仍然阻碍更强结论的具体问题只有三类：缺少统一 runtime/framework 的纯模型消融；案例不是概率抽样，不能形成失败原因分布；上述评分边界尚未独立审计。Diagnostic-60 或其他远端 baseline 未纳入本轮，也不影响对当前三个主实验的有限结论。
