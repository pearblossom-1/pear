# 三 baseline 失败模式补充核查（v3）

本目录发布 Kimi K2.6、Doubao-Seed-2.0-Pro、GUI-Owl-1.5-32B-Instruct 直跑的补充分析，整理日期为 2026-09-09。GUI-Owl 直跑不是 Mobile-Agent framework baseline。

- [pattern_synthesis.md](pattern_synthesis.md)：主要结论、支持范围、反例与论文 4.4 修改建议。
- [sampling_manifest.json](sampling_manifest.json)：精读前固定的候选池、排除理由、随机种子及每 baseline 50 条名单。
- [additional_reviews.jsonl](additional_reviews.jsonl)：150 条逐运行核查及证据边界。
- [pattern_support.csv](pattern_support.csv)：248 条运行—机制关系，分开旧定向案例与新增随机核查。

每个 baseline 原有随机样本为 0，本轮新增并核查 50 条，共 150 次运行、111 个不同 task_id；另复用旧 14 条定向记录。114 条有独立执行失败支持，30 条保留评分/合同疑点，6 条机制未确定。后两组不换样本、不自动改分。计数是本轮证据覆盖，不是失败原因占比或模型排名。

## 路径与发布边界

四份交付从原分析机器原样复制。历史 task、trajectory、截图、UI、结果和 metadata 引用以原 MDCBench 仓库根目录为基准：

```text
/Users/Admin/home/MDC_Benchmark_2
```

历史实验的相对位置为：

```text
worker-worktrees/all-task-update-intergration-sync-20260826/runs/
```

这些历史原始材料、分析要求文档以及 `_support/` 分批笔记、脚本与验证文件留在原机器，**本次没有上传到 Pear**。因此报告中的本地证据链接不一定能在 GitHub 打开；不得用 Pear 当前任务、其他 attempt 或当前 cache 替代历史证据。相邻的上一轮 [execution_failure_analysis](../execution_failure_analysis/) 已发布，可直接阅读。

`sampling_manifest.json` 中的 `review_status=not_reviewed` 是冻结名单当时的状态，最终状态在 `additional_reviews.jsonl`；没有重抽或覆盖原抽样设计。

本机验证已确认名单可复现、三模型各 50 条、记录与正式 selected attempt 对齐、CSV 回读一致，以及本地历史引用可定位。本次发布只含四份分析交付及本说明，不含任务、benchmark/runtime 代码、原始实验日志、截图、运行配置、凭据或依赖。没有新增实验、评分裁决或正式结果变更。
