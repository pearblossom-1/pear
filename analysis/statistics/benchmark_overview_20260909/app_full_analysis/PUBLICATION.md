# pear 上传说明

上传日期：2026-09-09。

本目录是 MDCBench 本地 `analysis/benchmark_overview_20260909/app_full_analysis/` 的完整统计快照，发布在 pear 的 `analysis/statistics/benchmark_overview_20260909/app_full_analysis/`。

- 最新归属口径入口：[操作归类v2](operation_attribution_v2/README.md)、[归属覆盖表](operation_attribution_v2/application_coverage.csv)、[全部任务对应应用](operation_attribution_v2/task_application_mapping.csv)。
- 当前沿用28个应用分类，候选5,897条中5,617条有应用归属、280条为纯Home。原6条身份待定已按用户确认归入已有应用项，不声称运行验证具体产品身份。
- 本目录根部的 [README.md](README.md)、[application_coverage.csv](application_coverage.csv)、[unresolved_cases.csv](unresolved_cases.csv) 保留原严格证据口径：5,891条complete、6条partial、0条unreviewed。它们是历史对照，不是当前归属口径下又有6条未处理。
- 上级Benchmark Overview的应用汇总已同步v2，不再以100条试标覆盖77条作为当前总表。旧试标标注文件保留；不得把它与全量核对或操作归属混用。
- README中的“没有提交或推送”描述本地分析完成时的状态；此后的上传以本说明为准。
- `aggregate.mjs`只汇总旧严格证据标注；`attribute_operations.mjs`应用用户授权归属规则，写入operation_attribution_v2；上一级`summarize.mjs`从已保存v2标签重算当前总表。它们需要Node.js及`@oai/artifact-tool`，不包含本机`node_modules`。
- 原始采集/核对脚本保留MDCBench的目录布局。重新采集须在源MDCBench仓库执行，不应在pear镜像目录直接运行。证据路径相对`scope_provenance.json`中的源仓库。
- 没有上传新的原任务版本或修改运行配置、evaluator、实验集合；没有重新运行设备或模型实验。
