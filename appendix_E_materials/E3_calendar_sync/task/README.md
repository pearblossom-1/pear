# 当次配置与初始化输入

`config/` 是此次 UFO³ `attempt_001` 保存的四份配置快照，与 `../run/config/` 逐字节相同；包含完整任务指令、设备、setup、cleanup、evaluation、agent 与环境配置。

`canonical_selected_attempt.json` 直接摘录原机器的正式合并索引行，并记录该索引的 SHA-256。上一级 `main_experiment_selection.json` 保留 pear 原来的分析采用行，两者均指向同一 attempt。

`resources/source/week.csv` 与 `resources/source/rule.txt` 是 setup 所引用的两份 Linux 初始化输入，已核对与正式记录中的 benchmark revision `54a48d4611afc88f8f3b9bd97e45a8eb2d99b787` 一致。来源和哈希见 `resources/provenance.json`；它们不是本次 Linux 输出或共享缓存的终态文件。

Android 的日历清空和事件写入参数直接保留在 `config/task.json` 的 setup 中；没有额外的日历数据库导出。正式运行实际使用 50 次 policy call／1800 秒预算，以 `../run/attempt_status.json` 的命令行及 `../run/result.json` 为准，不以任务快照中未覆盖的 limits 代替。
