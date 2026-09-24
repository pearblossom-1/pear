# 还需要的两个原始运行目录

E1a、E1b 的完整原始运行已整理；下面两例已从 pear 的主实验采用索引和案例分析定位。当前 pear 主分支只有分析材料，没有索引指向的 runs 目录；本机亦未找到这两次运行。

无需全部模型日志，也无需重跑。提供以下两个目录的原始内容即可。

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

## E3：UFO³ 日历同步

既有索引中的绝对路径：

```text
/Users/Admin/home/MDC_Benchmark_lite_ufo3/runs/ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/run_01/004_al_calendar_schedule_conflict/attempts/attempt_001/
```

对应正式采用来源：

```text
/Users/Admin/home/MDC_Benchmark_lite_ufo3/runs/ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/final_merged_status_after_infrastructure_repairs.json
```

整个 attempt 目录应包含框架自己的 `ufo3/` 规划与 device-agent 调用记录（如原来存放在父目录，则一并提供）。额外保留当次电脑规则和初始 `week.csv`，以及评测时保存的 `week.csv`／`log.json` 证据；没有生成 log.json 也是需要保留的原始评测结果。

内部文件名与截图索引均沿用原来的即可。将两个目录的内容分别放入 `E2_climate_control/run/`、`E3_calendar_sync/run/`，相应输入资源放入各自 `task/`；日志中的真实密钥、令牌等凭据仅在交付副本中删除。
