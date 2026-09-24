# 附录 E：四个案例的运行与材料索引

整理日期：2026-09-24。对应第七版正文 `iclr2027_conference.tex` 中 Execution failure analysis 段的四个例子。每例仅对应下表的一次主实验运行。

**E1a、E1b 已保留完整原始运行目录，共 682 个原始文件、292 张完整屏幕截图；E2、E3 已定位到具体主实验运行，但原始运行目录尚待提供。** 后两例现有的是 pear 中的采用记录和案例分析，不能作为已收齐的原始轨迹、截图或产物。

| 编号与材料入口 | 任务 ID | 模型／框架 | 主实验运行 | 材料状态 |
|---|---|---|---|---|
| [E1a：晚餐准备](E1a_dinner/notes.md) | `linux_android_smarthome_696` | GPT-5.5／direct LLM | `core200_rerun_20260826_run_01/080_linux_android_smarthome_696` | 原始运行 228 文件、94 图；规则与食谱初始化齐备 |
| [E1b：加湿调度与待办更新](E1b_humidification/notes.md) | `linux_android_smarthome_439` | Claude Opus 4.8／direct LLM | `core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439` | 原始运行 454 文件、198 图；保留两台手机的 device_id |
| [E2：气候控制](E2_climate_control/notes.md) | `linux_smarthome_656` | Gemini 3.1 Pro Preview／direct LLM | `core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656` | 采用记录和 G-R17 分析已保存；原始目录未到位 |
| [E3：日历同步](E3_calendar_sync/notes.md) | `al_calendar_schedule_conflict` | UFO³／GPT-5.5 | `ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/run_01/004_al_calendar_schedule_conflict/attempts/attempt_001` | 采用记录和 C01 分析已保存；原始目录未到位 |

## 结果与步数口径

| 案例 | 任务成功 | 部分得分 | result.steps | 环境动作口径 | 时长（秒） | 终止原因 | 数据依据 |
|---|---|---:|---:|---|---:|---|---|
| E1a | FAIL | 0.0 | 31 | 31 个已解析设备动作；32 次模型调用 | 1996.103 | `time_limit` | 原始 result、trajectory、execution_history |
| E1b | FAIL | 0.5 | 50 | 49 个已解析设备动作；另有 1 个未解析出动作的 step | 996.466 | `max_steps` | 原始 result、trajectory、execution_history |
| E2 | FAIL | 0.5 | 5 | 既有分析记载 4 个设备动作＋1 个 `done`，待原件复核 | 223.687 | `done` | 既有主实验索引与 G-R17 分析 |
| E3 | FAIL | 0.0 | 50 | 既有分析记载 50 次 policy call、49 次环境动作，全在 `android_0` | 532.996 | `max_steps` | 既有主实验索引与 C01 分析 |

E1a、E1b 的时长为 result.json 的完整生命周期时间，包含初始化、评估和清理；不能等同于纯交互用时。E2、E3 时长原样摘自既有索引，详细计时边界待原始记录确认。所有步号 `sN` 指 `trajectory.json` 中零基的 `step_index=N`；截图文件的 `step_NNN` 是截图索引，不能直接当作动作步号。

## 阅读入口

- `task/config/task.json`：当次完整用户指令、设备列表、setup、cleanup 与 evaluation。`task/resources/` 为相关输入资源。
- `task/main_experiment_selection.json`：E1a、E1b 在正式汇总中的原始采用记录摘录。E2、E3 的采用索引在各案例目录的 `main_experiment_selection.json`。
- `run/trajectory.json`：reset 初始观测及完整逐轮模型输出、动作、设备、参数／代码和执行反馈。
- `run/execution_history.jsonl`、`run/prompts/`：运行事件和保存的逐轮模型输入。
- `run/artifacts/<device_id>/`：完整原始截图与 UI 元素记录；不裁切、不重命名。
- `run/evaluator_trace.json`、`run/result.json`：逐项原始评测、实际值／预期值及整体结果。
- 各例 `notes.md`：少量关键帧和事件定位、设备关系、产物保存情况与解释边界。
- [尚需补入的两个原始目录](missing_materials.md)：可直接据此在运行机器上找到并复制目录，无需重新实验。

保留原文件名与内部层级，未制作压缩包或安装包。原日志中的绝对路径未重写，跨机器阅读时用 [material_inventory.json](material_inventory.json) 的原目录—本地目录对应关系定位。SmartHome 原始证据是结构化观测和 API 返回，没有补造家居界面截图。

E1a、E1b 未单独保存应用数据库导出，真实结果由原始界面、UI 记录、动作及评测共同呈现。没有用清理后的状态、共享缓存当前文件或其他运行产物替代终态。
