# Phase 1 数据清单

范围：本机更新后 Core200 的 GPT-5.5 与 Claude Opus 4.8 主实验。采集日期 2026-09-06。旧 Gemini 主实验、Diagnostic60 的独立 stage 运行、其他设备模型均不并入分母。本目录只存分析派生文件，没有修改任务、执行日志、结果或 runtime。

## 1. 权威数据与结果选择

实验工作树为 [gpt55-core200-rerun-20260826](/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826)。以下用 `BASE` 指代该绝对路径，并非要求其他设备使用相同路径。

固定清单在 [mdcbench_lite_v1.json](/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/tasks/mdcbench_lite/mdcbench_lite_v1.json)。清单的 200 个 task_id 与两模型所选结果完全对应。历史 instruction、setup、evaluation 使用每次运行的 `config/task.json`，不是今天工作树里的任务文件。两模型对应的 200 份任务 JSON 快照逐字段相同；今天工作树中 14 个任务与实验快照有差异，其中 12 个仅 evaluation 不同。详见 [任务快照比较](/Users/lht/home/MDCBench/analysis_phase1/task_snapshot_comparison.csv)。此比较没有生成哈希。

**JSON 配置相同不等于所有 live 输入相同**：setup 引用的源资产未全部逐次复制，前景应用、残余文件、运行时状态和重试时间可能不同。因此这里只确认同一任务配置，不宣称两个模型的每张初始屏幕逐像素相同。

GPT 根目录为 `BASE/runs/gpt-5.5-lite/mdcbench_lite_v1`：

| 选用批次 | 有效结果数 | 选择依据 |
|---|---:|---|
| core200_rerun_20260826_run_01 | 183 | 原始已有 result.json 的有效结果 |
| core200_rerun_20260828_env_helper14_run_01 | 13 | 替代原始无有效评分的基础设施失败 |
| core200_rerun_20260828_task145_contact_fix_run_01 | 1 | 已记录的联系人 setup 修复重跑 |
| core200_rerun_20260830_task041_clean_e2e_run_01 | 1 | 041 的干净完整 E2E 重跑 |
| core200_rerun_20260901_missing2_run_01 | 2 | 077、105 原先缺失有效结果的补跑 |

不是在多个有效结果中选择最佳分数。生成脚本检查了替代前的目录没有有效 `result.json`。

Claude 根目录为 `BASE/runs/claude-opus-4-8/mdcbench_lite_v1`。以 [effective_core200/summary.json](/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/effective_core200/summary.json) 和同目录 provenance 为选择依据，追溯到原始运行 85 条、`core200_recovery_20260829/retry_run_01` 115 条。115 条原始无效尝试中的原因是 31 个上游 503、82 个 API connection、2 个 setup/helper，见 [原有 recovery report](/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/runs/claude-opus-4-8/mdcbench_lite_v1/core200_recovery_20260829/core200_recovery_report.md)。它们不能再次混入最终 125 条失败的原因分布。

## 2. 实际日志结构

每个 task-level CSV 行给出完整绝对路径，两个模型主体结构一致。

| 文件 | 格式/作用 | GPT | Claude |
|---|---|---:|---:|
| result.json | success、score、steps、duration_s、termination_reason、token_usage、timings | 200 | 200 |
| trajectory.json | events；含 step 与 reset/evaluate 等事件 | 200 | 200 |
| execution_history.jsonl | 生命周期事件、请求和执行时间、失败事件 | 200 | 200 |
| evaluator_trace.json | 按 evaluation 顺序的原始条件与实际输出 | 200 | 200 |
| config/task.json | 该次原始任务快照 | 200 | 200 |
| config/materialized_task.json | 路径展开后的 setup/evaluation 快照 | 200 | 200 |
| config/agent_config.yaml | agent 实际配置 | 200 | 200 |
| config/run_config.json | 启动配置及设备配置 | 200 | 200 |
| step events | 包含 done 和解析失败的 turn | 4,200 | 4,089 |
| history events | 完整读取的 JSONL 行数 | 27,597 | 26,638 |

每一步实际可用字段：`step_index`、`action`、`device_id`（解析失败可无）、`observation_description`、`thought`、`model_response`、`ok/error/info`、`model_latency_s`、`environment_action_s`、`request_attempts`、`prompt_metrics`、usage。解析失败的 action/feedback 可为 null，不能当作一次成功空操作。

`observation_description` 是模型对动作前输入的描述，`thought` 是模型输出的简短说明，不是内部思维的完整记录。`event.observation` 是动作后的真实观测；前后要分清。Android 有 screenshot、UI element JSON；Linux 有截图，accessibility_tree/terminal 可能是 null，CLI 输出在 `info.stdout/stderr`；Home 有结构化 rooms/devices/plans/last_action_result。

**step_index 从 0 开始；截图名 step_055.png 不一定是 trajectory 第 55 步。** 每条 annotation 和 evidence packet 都保留准确映射。没有把模型“已完成”的自述当成真实状态证据。

在 step observation 引用范围内，GPT 9,279 个不同截图路径、6,002 个 UI 文件路径；Claude 9,136 个截图路径、5,737 个 UI 文件路径，均可找到。其中 GPT 的 041 补跑原日志用实验 worktree 相对路径（45 个截图、30 个 UI 引用），派生 evidence packet 已展开为绝对路径并保留 original_artifact_refs，原日志未变。该统计不包括仅由非 step reset 事件引用的文件，也不代表所有图片都已经逐张视觉审核。未发现评分汇总与顶层 trace、step 数之间的不一致。

**文件存在不等于 UI 文本可用。** 上述唯一 post-step UI 文件中，GPT 3,914/6,002、Claude 3,105/5,737 没有可用文本标签；例如 android_only_267 的原始 UI JSON 是空列表，但截图存在。不能从空 UI 文件推断没有显示内容，也不能仅凭模型 observation_description 替代图像证据。Claude android_smarthome_219 初始截图有 accessibilityforwarder 崩溃弹窗，但源请求仍可见、Home capability 查询和报告成功，故该弹窗不能自动归为任务主要失败。

## 3. 评分字段与缺失

`success/partial_score` 保留原始 result，不覆盖。`adjudicated_success/adjudicated_score` 仅反映既有的 GPT `linux_android_smarthome_288` 人工复核，来源为 [evaluator 调整文档](/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/experiments/diagnostic60/evaluator调整文档.md)。虽然文档位于 diagnostic60 下，该记录明确讨论主实验 E2E；其余 stage 成绩不混入本表。本轮没有新增人工改判。

总评逻辑：所有顶层 evaluator 必须通过才 success；partial score 是开启计分的 evaluator 分数均值，但任一不计分的 hard guard 失败可把总分归零。参考 [global_eval.py](/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826/mdcbench/evaluation/global_eval.py:69)。因此另列 `scoring_evaluators`、`satisfied_scoring_evaluators`、`failed_guards`。保留原有术语，但不要把“计分条件”误认为只有正向输出：不发送、不改设备等条件也可能计分。

每个顶层条件的 pass/fail、actual、expected、getter 和完整 spec 已展开到 [evaluator_conditions.csv](/Users/lht/home/MDCBench/analysis_phase1/evaluator_conditions.csv)。嵌套 relation、同一 workbook 内每个 cell 的逐项 verdict 通常未记录，`nested_condition_results=NA`。`missing` 可能表示没有匹配到满足全部条件的记录，**不等于原始记录不存在**。

| 字段 | 可获得性/处理 |
|---|---|
| task_version、task_hash | 快照未提供，均 NA；不新建 hash |
| runtime 源码完整逐运行快照 | 不齐全；操作记录中的现成 commit lineage 可辅助，不能替代逐运行源码快照 |
| device_count/types/topology | 从 task.devices 稳定计算；home 表示 SmartHome runtime |
| task_category | 每模型 190/200 有，10 个 Home 任务 NA |
| metadata.device_topology | 每模型 136/200 有；与从 task.devices 计算的实际拓扑分开保留 |
| difficulty、motif | 各 30/200 有；其余 170 NA，不用当前 manifest 补填历史属性 |
| workflow_pattern | 全部 NA，不自行发明分类 |
| single_output_vs_multi_output | 全部 NA；少数 native_content_outputs 等不构成统一完整字段 |
| token usage | result.token_usage 有输入/输出/总 token 等；两供应商口径不保证完全一致 |
| source asset 原始字节 | setup 引用路径可得，部分内容在 stdout/UI 或 setup assertion 可回查；不是所有源资产都有运行内副本 |
| 历史输出文件 | 部分 vm_file 只记复用 cache 路径，不能将今天该路径内容当作历史证据 |

特别注意，10 个 Home-only task metadata.device_count 可能表示屋内 appliance 数，不是 runtime endpoint 数。本表统一用 `len(task.devices)`。两台 Android 属于 2 devices、1 environment type，不能与 Android+Linux 的两环境混淆。

## 4. 执行预算与可比性

所选记录采用实际运行有效上限 50 steps、agent wall time 1,800s，部分重试有 outer watchdog/辅助字段。以记录的 `effective_limits`、`result.termination_reason` 和 `time_limited` 为准，不拿任务模板 limits 或时长大于 1,800 的简单判断覆盖终止原因。共同配置记录还包含 current-only 图片输入、最多 4 张图、短文本历史；模型调用与设备交互均消耗 wall time。

CLI 一步可以批量写多份文件，Android 一个 tap 也是一步。不同设备路径的平均步数不能直接解释为统一的操作效率。长模型延迟、反复合法尝试和动作 timeout 是三个不同事实。

## 5. 分析派生资料与复核覆盖

[task_level_results.csv](task_level_results.csv) 有 400 行；[trajectory_annotations.jsonl](trajectory_annotations.jsonl) 对 268 条原始失败各有一行，包含 1 条已人工复核通过的特殊记录。400 个 evidence packet 保存完整步骤、反馈、两份任务快照、顶层 trace、UI 文本与原始图像引用。

本轮全量机器读取和统计覆盖 400 条；逐步因果精读与针对性图像核对的覆盖，单独记录在 [causal_review_status.csv](/Users/lht/home/MDCBench/analysis_phase1/causal_review_status.csv)。**机器读取不等于每条已完成独立语义复核。** `full_machine_index_causal_review_pending` 条目保留 uncertain，禁止把它们当作“已经确认没有该现象”。最终报告明确区分完整量化与探索性因果样本，不将样本标签占比包装为全体失败 taxonomy 分布。

源文件只读；脚本输出限制在此 analysis_phase1 目录。没有重跑设备、调用 baseline API、执行日志中的命令、重新评估原任务或进行 Git 提交/推送。
