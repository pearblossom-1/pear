# linux_android_smarthome_338 × GPT-5.5

来客前卧室与茶点准备：Linux、两部 Android 手机及 SmartHome，共三类环境、四个设备实例。

采用论文已纳入统计的七次独立子任务测试及对应主实验 E2E 运行。七项原始结果均为 PASS；E2E 中食谱未更新、第二部手机的待办未完成，整体 FAIL。未重跑、未人工改判，原始运行文件名和层级保留。

| 完整轨迹入口 | 记录步数 | 采用结果 | 原始截图数 |
|---|---:|---|---:|
| [S01](independent_subtasks/S01/trajectory.json) | 2 | PASS | 4 |
| [S02](independent_subtasks/S02/trajectory.json) | 1 | PASS | 2 |
| [S03](independent_subtasks/S03/trajectory.json) | 2 | PASS | 4 |
| [S04](independent_subtasks/S04/trajectory.json) | 2 | PASS | 0 |
| [S05](independent_subtasks/S05/trajectory.json) | 12 | PASS | 16 |
| [S06](independent_subtasks/S06/trajectory.json) | 14 | PASS | 24 |
| [S07](independent_subtasks/S07/trajectory.json) | 2 | PASS | 0 |
| [E2E](e2e/trajectory.json) | 49 | FAIL | 198 |

独立测试合计 35 步，7/7 通过，All-Subtask = PASS。E2E 记录 49 步，因时间限制终止，3 项环境检查中仅灯光设置通过。

## 先看这些材料

- [案例核对说明](案例核对说明.md)：任务目标、七项拆分、E2E 失败证据和论文解读边界。
- [来源及运行选择](selection.json)：八个原运行目录与本目录的映射，以及六张重点截图的原始位置。
- [产物保存情况](artifact_availability.json)：原生应用数据库与结构化状态证据的实际保存范围。
- [凭据处理记录](credential_redaction.json)：文本凭据检查及副本中实际移除的项目。

## 完整记录在哪里

- independent_subtasks/S01—S07/：每项独立测试的完整原运行目录。
- e2e/：同模型、同原任务主实验的完整原运行目录。
- 每次运行的 trajectory.json 包含 reset 初始观测、逐轮动作、目标设备、执行反馈及最后观测；execution_history.jsonl 保留执行事件。
- config/、prompts/、stage_runtime_manifest.json 和 materialized_inputs/ 保留实际指令、可见上下文、初始化与预算。S01—S04 另有信息报告及语义判定文件。
- evaluator_trace.json、stage_result.json、result.json 保留对应评估；SmartHome 查询和调用返回位于轨迹与评估记录中。
- 各运行的 artifacts/ 保存全部原始截图与 Android UI 元素；screenshots/ 另外集中六张完整原图副本，方便比较。
- reference_inputs/ 附现有协调文件及住宅配置供阅读；历史初始化以每次运行保存的配置与 reset 观测为准。

## 直接比较原始全屏截图

| 目标 | 独立测试 | E2E |
|---|---|---|
| 食谱改名并增加 lemon | [S05 已保存](screenshots/s05_recipe_saved_step015.png) | [旧食谱仍未改变](screenshots/e2e_recipe_unchanged_step085.png) |
| 待办备注回填并完成 | [S06 备注](screenshots/s06_note_updated_step017.png) · [S06 已完成](screenshots/s06_task_completed_step023.png) | [最终仍未完成](screenshots/e2e_task_incomplete_step049.png) |

[E2E 最终食谱截图](screenshots/e2e_recipe_final_step093.png) 同样保留旧名称和配料。用于主图的稳定详情页是 step_085.png；对应模型 step_index=44，截图文件编号并不是模型动作编号。

## 独立测试与 E2E 的区别

S01—S07 各自重置，前序条件由参考构造提供，不使用前序模型的实际输出。S06 的“灯已设为 55%”来自参考前置状态，业务上对应 S07 的目标效果；编号不表示七段日志连续执行。不能将这些独立成功轨迹拼成一次成功的 E2E。

每个独立子任务上限 30 步/600 秒；E2E 上限 50 步/1800 秒。35 与 49 为实际记录步数，不是相同总预算下的直接对照。三个操作子任务 S05—S07 的评估配置与 E2E 对应检查一致。

共包含八个运行目录的 **731 个原始文件、248 张原始截图**，另附 6 张重点截图副本及说明/输入文件。应用数据库没有单独导出；截图、操作反馈和原生评估记录均保留。SmartHome 使用结构化接口，没有以重跑的 GUI 画面替代。日志内部原始绝对路径未重写，跨机器阅读时可依据 selection.json 在本目录中定位同名相对路径。
