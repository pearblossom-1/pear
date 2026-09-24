# 原始运行目录已补齐

准确定位：

```text
runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656
```

2026-09-24 从上述原机目录复制全部 **27 个原始文件（13,083,519 字节）**，内部相对路径、文件名与字节保持不变。本 README 是附录说明，不计入 27 个原始文件。

- `trajectory.json`：reset 观测及 5 轮完整模型回复、动作和反馈。
- `result.json`、`evaluator_trace.json`、`stdout.txt`、`stderr.txt`：历史结果、两项评估和原始日志。
- `config/`：4 个当次配置文件。
- `prompts/`：5 轮 prompt 文本和 5 份 redacted messages；沿用原有图片占位与审计格式。
- `artifacts/linux_0/screenshots/`：8 张完整原始截图 `step_000.png`–`step_007.png`，不裁切、不替换。

原始绝对路径没有改写。跨机器查看时，将原路径中 `122_linux_smarthome_656/` 后的部分对应到本目录即可；逐文件相对路径见 [材料清单](../material_inventory.json)。SmartHome 状态在轨迹和 evaluator 中，没有独立 GUI 截图。

原机没有单独的 `execution_history.jsonl`、终态 `fallback_result.json` 导出或应用数据库导出；没有补造这些文件。完整输出写入命令在轨迹 `events[4]`，终态 Home 状态在 evaluator 的 `evaluators[0].actual`。案例解读和归档边界见 [notes.md](../notes.md)。
