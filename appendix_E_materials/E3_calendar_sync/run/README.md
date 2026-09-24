# 原始运行目录已补齐

准确定位：

```text
/Users/Admin/home/MDC_Benchmark_lite_ufo3/runs/ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/run_01/004_al_calendar_schedule_conflict/attempts/attempt_001
```

2026-09-24 已逐字节复制上述目录的全部 410 个文件。本 README 是附加说明，不计入原始文件数量。

- `trajectory.json`：103 个事件，含初始观测、规划、49 次设备动作及最后的 step limit。
- `ufo3/calls/`：50 次模型调用，每次均有 `messages.json`、`response.txt`、`call.json`。此处保存原始 prompt，不另造 `prompts/`。
- `model_calls.json`：完整调用账本和 token 汇总。
- `artifacts/android_0/`：99 张截图、99 份 UI 元素记录；`artifacts/linux_0/`：50 张截图。
- `config/`：当次四份配置快照；`attempt_status.json`：正式 attempt 的命令行和生命周期。
- `result.json`、`summary.json`、`evaluator_trace.json`、`stdout.txt`、`stderr.txt`：保留原件，包括运行警告。

该次原件没有 `execution_history.jsonl`；未补入其他运行的文件或当前共享缓存产物。终态 CSV 未独立归档，日志检查 actual 为 null，详见 [案例说明](../notes.md)。

文件名、图片和内部绝对路径保持原样。逐文件字节数和 SHA-256 见 [material_integrity.json](../material_integrity.json)，可用 [verify_materials.py](../verify_materials.py) 校验。
