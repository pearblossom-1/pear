# 仍待补入的原始运行目录：E2

E1a、E1b 的完整原始运行已整理；E3 已于 2026-09-24 从原运行机器补齐并校验。**当前只剩 E2 的原始目录待提供。** E3 的终态文件归档边界单列在下方，不再将整个 E3 运行标为缺失。

无需全部模型日志，也无需重跑。提供以下 E2 目录的原始内容即可。

## E2：Gemini 气候控制

相对于保存主实验结果的工程根目录：

```text
runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656/
```

对应批次的采用来源：

```text
runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/summary.json
runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/run_metadata.json
```

额外保留当次 `/tmp/climate/fallback_matrix.md` 输入和 `/tmp/climate/fallback_result.json` 输出的运行专属存档（如有）。没有输出存档时保留原始写入代码、反馈和评测 actual 即可，注明未归档；不能用现在共享缓存的文件补替。

## E3：原始目录已补齐，终态文件的归档边界

既有索引中的绝对路径：

```text
/Users/Admin/home/MDC_Benchmark_lite_ufo3/runs/ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/run_01/004_al_calendar_schedule_conflict/attempts/attempt_001/
```

对应正式采用来源：

```text
/Users/Admin/home/MDC_Benchmark_lite_ufo3/runs/ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/final_merged_status_after_infrastructure_repairs.json
```

上述整个 attempt 已复制到 [E3_calendar_sync/run/](E3_calendar_sync/run/)：410 个原始文件、149 张截图，包含完整 `ufo3/calls/`、调用账本、轨迹、配置和 evaluator。每个文件均保留原名和 SHA-256；见 [校验清单](E3_calendar_sync/material_integrity.json)。规则和初始 CSV 已按正式 benchmark revision 恢复到 `E3_calendar_sync/task/resources/`，来源与哈希另有记录。

E3 原件没有单独的 `execution_history.jsonl`、`prompts/` 或 Android 应用数据库导出，其框架原生记录已全部保留。没有运行专属的终态 `week.csv`；evaluator 的 actual 是共享缓存路径、分数为 0。`log.json` 的 actual 为 null，没有可归档的生成文件。**未从当前缓存、其他运行或重新实验中补造这两份输出。** 这不影响确认原始运行目录已完整交付；但终态文件的逐字节独立复核仍受原存档限制。

E2 补入时沿用内部文件名和截图索引，将目录内容放入 `E2_climate_control/run/`，对应输入资源放入 `task/`；日志中的真实密钥、令牌等凭据仅在交付副本中删除。
