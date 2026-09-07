# 本机三模型主实验分析

本目录发布 Kimi K2.6、Doubao-Seed-2.0-Pro、GUI-Owl-1.5-32B-Instruct 的既有 Core200 主实验分析，整理日期为 2026-09-08。

- [execution_results.csv](execution_results.csv)：三个模型各 200 条 selected attempts，共 600 条结果。
- [execution_analysis.md](execution_analysis.md)：选取口径、总体结果、设备分组与比较限制。
- [failure_cases.md](failure_cases.md)：5 条已核实失败案例、1 条成功对照及候选排除说明。
- [section4_4_draft.md](section4_4_draft.md)：论文 4.4 中文草稿及案例表占位。

## 结果与证据边界

沿用正式主实验及既有指定恢复运行，没有按最高分挑选重试，没有在本轮重新评分。Kimi 的记录启动版本及 temperature 与另外两组存在差异，配对结果只作带限制的描述性对照。

这四份文件从分析机器原样复制，CSV 和文档中的历史任务、轨迹、截图、metadata、summary 路径以原 MDCBench 仓库根目录为基准。发布到 Pear **不意味着这些历史证据已经上传或能在 GitHub 点击访问**；不要把 Pear 当前任务文件当成运行当时的任务快照。

原本机根目录：

```text
/Users/Admin/home/MDC_Benchmark_2
```

历史实验所在相对位置：

```text
worker-worktrees/all-task-update-intergration-sync-20260826/runs/
```

完整轨迹、截图、历史快照、原分析要求文档及分析辅助目录 `_support/` 留在原机器。本次只发布四份分析交付与此说明，不包含原始实验日志、截图、运行配置、凭据、本地依赖或 benchmark/task 代码。

评分疑点或历史材料不足的候选仅从案例解释中排除，仍保留在完整主实验分母中；没有据此新增改判。本分析不估计失败原因占比，也不声称完成了全部失败轨迹的人工审计。
