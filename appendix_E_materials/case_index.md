# 附录 E：四个案例的运行与材料索引

整理日期：2026-09-24。对应第七版正文 `iclr2027_conference.tex` 中 Execution failure analysis 段的四个例子。每例仅对应下表的一次主实验运行。

**E1a、E1b、E2、E3 均已保留完整原始运行目录，共 1,119 个原始文件、449 张完整屏幕截图。** E3 于 2026-09-24 补齐 410 个原始文件、149 张截图与全部 50 次模型调用；E2 同日从原 Windows 运行机器补齐 27 个原始文件、8 张截图与全部 5 次模型调用的输入、输出和反馈。完整运行目录已收齐不代表每个终态文件都有独立导出，E2、E3 的具体归档边界仍予保留。

| 编号与材料入口 | 任务 ID | 模型／框架 | 主实验运行 | 材料状态 |
|---|---|---|---|---|
| [E1a：晚餐准备](E1a_dinner/notes.md) | `linux_android_smarthome_696` | GPT-5.5／direct LLM | `core200_rerun_20260826_run_01/080_linux_android_smarthome_696` | 原始运行 228 文件、94 图；规则与食谱初始化齐备 |
| [E1b：加湿调度与待办更新](E1b_humidification/notes.md) | `linux_android_smarthome_439` | Claude Opus 4.8／direct LLM | `core200_recovery_20260829/retry_run_01/097_linux_android_smarthome_439` | 原始运行 454 文件、198 图；保留两台手机的 device_id |
| [E2：气候控制](E2_climate_control/notes.md) | `linux_smarthome_656` | Gemini 3.1 Pro Preview／direct LLM | `core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656` | 原始运行 27 文件、8 图、5 次调用；矩阵与初始 Home 状态已核对 |
| [E3：日历同步](E3_calendar_sync/notes.md) | `al_calendar_schedule_conflict` | UFO³／GPT-5.5 | `ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/run_01/004_al_calendar_schedule_conflict/attempts/attempt_001` | 原始运行 410 文件、149 图、50 次调用；逐文件 SHA-256 已核对 |

## 结果与步数口径

| 案例 | 任务成功 | 部分得分 | result.steps | 环境动作口径 | 时长（秒） | 终止原因 | 数据依据 |
|---|---|---:|---:|---|---:|---|---|
| E1a | FAIL | 0.0 | 31 | 31 个已解析设备动作；32 次模型调用 | 1996.103 | `time_limit` | 原始 result、trajectory、execution_history |
| E1b | FAIL | 0.5 | 50 | 49 个已解析设备动作；另有 1 个未解析出动作的 step | 996.466 | `max_steps` | 原始 result、trajectory、execution_history |
| E2 | FAIL | 0.5 | 5 | 4 个设备动作＋1 个 `done`；Home 仅有 2 次能力查询，无控制动作 | 223.687 | `done` | 原始 result、trajectory、evaluator 与正式采用记录 |
| E3 | FAIL | 0.0 | 50 | 1 次规划＋49 次设备代理调用；49 次映射动作全在 `android_0`，反馈均为 `ok=true` | 532.996 | `max_steps` | 原始 result、trajectory、model_calls、evaluator 与正式采用索引 |

四例的时长均为 result.json 的完整生命周期时间，包含初始化、评估和清理；不能等同于纯交互用时。E2 的 timings 原件已保留，模型请求合计 54.423 秒，完整生命周期 223.687 秒。所有步号 `sN` 指 `trajectory.json` 中零基的 `step_index=N`；截图文件的 `step_NNN` 是截图索引，不能直接当作动作步号。E3 的 49 次设备动作是 `s0–s48`，最后截图为 Android `step_098.png`；动作 `ok=true` 不等于实现任务目标。

## 阅读入口

- `task/config/task.json`：当次完整用户指令、设备列表、setup、cleanup 与 evaluation。`task/resources/` 为相关输入资源。
- `task/main_experiment_selection.json`：E1a、E1b、E2 在正式汇总中的原始采用记录摘录。E2、E3 的原分析采用索引在各案例目录的 `main_experiment_selection.json`；E3 另保存直接从原机器正式索引摘录的 `task/canonical_selected_attempt.json`。
- `run/trajectory.json`：reset 初始观测及完整逐轮模型输出、动作、设备、参数／代码和执行反馈。
- `run/execution_history.jsonl`、`run/prompts/`：E1a、E1b 的运行事件和逐轮模型输入。E2 原生记录包含 `run/prompts/` 与完整 trajectory，但没有独立 execution_history；未后补重建。E3 原生格式为 `run/ufo3/calls/*/{messages.json,response.txt,call.json}` 与 `run/model_calls.json`，没有额外生成前两种文件。
- `run/artifacts/<device_id>/`：完整原始截图与 UI 元素记录；不裁切、不重命名。
- `run/evaluator_trace.json`、`run/result.json`：逐项原始评测、实际值／预期值及整体结果。
- 各例 `notes.md`：少量关键帧和事件定位、设备关系、产物保存情况与解释边界。
- [材料完整性与剩余归档边界](missing_materials.md)：四例原始运行目录均已补齐；E2、E3 保留确实未单独归档的终态文件边界，无需重新实验。

保留原文件名与内部层级，未制作压缩包或安装包。原日志中的绝对路径未重写，跨机器阅读时用 [material_inventory.json](material_inventory.json) 的原目录—本地目录对应关系定位。SmartHome 原始证据是结构化观测和 API 返回，没有补造家居界面截图。

各例均未单独保存应用数据库导出，真实结果由原始界面、UI 记录、动作及评测共同呈现。E2 没有运行专属的终态 JSON 副本，但完整写入命令、成功反馈、历史 JSON 检查通过记录及 Home 终态均已保留。E3 没有运行专属的终态 CSV 副本，其 evaluator 仅记录共享缓存路径与检查失败；log.json 的 actual 为 null。没有用清理后的状态、共享缓存当前文件或其他运行产物替代终态。
