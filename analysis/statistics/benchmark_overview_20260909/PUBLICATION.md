# pear 上传说明

上传日期：2026-09-09。

本目录是 MDCBench 本地 `analysis/benchmark_overview_20260909/` 的统计快照，发布在 pear 的 `analysis/statistics/benchmark_overview_20260909/`。原报告、数据与脚本均保留；不包含本机 `node_modules` 链接，也不替换既有统计报告或任务。

- 总报告：[README.md](README.md)。其中“尚未推送”描述的是本地统计完成时的状态，后续上传以本说明为准。
- 统计口径不因上传而改变：5,897 条候选、条件性 5,894 条范围及证据支持的 5,614 条跨设备子集分别保存；最终发布清单仍待确认。
- 应用覆盖和任务特征仍是报告中明确说明的部分语义标注，不因上传而视为全量完成。
- `summarize.mjs` 只读取本目录保存的数据与标注；运行需要 Node.js 以及 `@oai/artifact-tool`，原本机依赖路径见 README。
- `collect.mjs`、`annotate_static.mjs` 等原始采集脚本按原 MDCBench 目录布局保留，不应在 pear 的这个镜像目录直接重新采集。原任务及资源证据路径相对 `scope_record.json` 中的源仓库，而非本目录。
- 未修改任务、运行环境、实验配置、评估器或已有 manifest；未重新运行统计标注或模型实验。
