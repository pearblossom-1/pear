# 当次任务配置与输入资源

2026-09-24 从 Gemini 正式采用运行 `122_linux_smarthome_656` 补入；没有以其他模型、其他日期或当前工作区的任务替代。

- [main_experiment_selection.json](main_experiment_selection.json)：正式 `run_01/summary.json.records` 的对应完整记录，含实际 `--task` 来源；与 `../run/result.json` 核对一致。
- [run_metadata.json](run_metadata.json)：原批次元数据，描述整个 run_01，不是本题单独的起止时间。
- `config/`：原运行自己的 task、materialized_task、run_config 和 agent_config，原样复制；同样保留在 `../run/config/`。
- [resources/source/tmp/climate/fallback_matrix.md](resources/source/tmp/climate/fallback_matrix.md)：正式执行工作树中的矩阵输入，与 s0 实际读出的全文一致。
- [resources/episode_config.json](resources/episode_config.json)：当次 SmartHome 初始化资源，状态与 reset 观测直接核对一致。
- [resources/provenance.json](resources/provenance.json)：输入资源来源、任务版本和验证方法。

没有单独归档终态 `/tmp/climate/fallback_result.json`。原始写入载荷在 `../run/trajectory.json` 的 `events[4].action.command`；历史评测通过 JSON 检查，但只记录共享缓存路径。没有从当前缓存补入输出，也没有用预期结果重建产物。上述 setup／cleanup 命令仅作为历史配置保存，本次没有执行。
