# pear 上传说明

上传日期：2026-09-09。

本目录是 MDCBench 本地 `analysis/benchmark_overview_20260909/` 的统计快照，发布在 pear 的 `analysis/statistics/benchmark_overview_20260909/`。本次按用户要求更新总览中的应用汇总，并一并发布已完成的操作归类 v2；不包含本机 `node_modules`，不修改任务。

- 总报告：[README.md](README.md)，当前应用总表：[application_coverage.csv](application_coverage.csv)。
- 统计口径不因上传而改变：5,897 条候选、条件性 5,894 条范围及证据支持的 5,614 条跨设备子集分别保存；最终发布清单仍待确认。
- 应用汇总已接入 [操作归类 v2](app_full_analysis/operation_attribution_v2/README.md)：28个应用分类，候选范围5,617条有归属、9,917个任务—应用关系、280条纯Home。证据确认与用户授权的操作/身份归属分列，不称模型实际使用频次。
- 设备、HTML、IoT和任务特征的7份输出与更新前逐字节一致。任务特征和IoT使用仍保留原来的标注覆盖程度，不因应用更新而视为全量完成。
- `summarize.mjs` 只读取本目录保存的数据与标注；运行需要 Node.js 以及 `@oai/artifact-tool`，原本机依赖路径见 README。
- `collect.mjs`、`annotate_static.mjs` 等原始采集脚本按原 MDCBench 目录布局保留，不应在 pear 的这个镜像目录直接重新采集。原任务及资源证据路径相对 `scope_record.json` 中的源仓库，而非本目录。
- 未修改任务、运行环境、实验配置、评估器或已有 manifest。本次只重算应用聚合，不重新判断v2标签，不运行设备或模型实验。旧试标文件和严格证据统计保留为历史对照。
