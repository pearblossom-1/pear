# pear 上传说明

上传日期：2026-09-09。

本目录是 MDCBench 本地 `analysis/benchmark_overview_20260909/app_full_analysis/` 的完整统计快照，发布在 pear 的 `analysis/statistics/benchmark_overview_20260909/app_full_analysis/`。

- 阅读入口：[全量应用统计报告](README.md)、[完整应用覆盖表](application_coverage.csv)、[待确认记录](unresolved_cases.csv)。
- 本轮已遍历5,897条候选任务：5,891条complete、6条partial、0条unreviewed；确认28个应用实体。另附条件性5,894条范围，尚未把候选清单声明为正式发布清单。
- 应用计数和比例仍按报告标为已确认覆盖下界。此次上传不重算或修改标注，不改变统计范围及结论。
- 保留上级目录此前的100条试标报告；本子目录是后续全量应用核对，不能与旧试标计数混用。
- README中的“没有提交或推送”描述本地分析完成时的状态；此后的上传以本说明为准。
- `aggregate.mjs`只汇总已保存标注，需要Node.js及`@oai/artifact-tool`，且依赖上级目录已上传的`task_inventory.jsonl`和`device_distribution.csv`等对照材料。不包含本机`node_modules`。
- 原始采集/核对脚本保留MDCBench的目录布局。重新采集须在源MDCBench仓库执行，不应在pear镜像目录直接运行。证据路径相对`scope_provenance.json`中的源仓库。
- 没有上传新的原任务版本或修改运行配置、evaluator、实验集合；没有重新运行设备或模型实验。
