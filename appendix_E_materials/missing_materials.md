# 材料完整性与剩余归档边界

E1a、E1b 的完整原始运行已整理；E2、E3 均于 2026-09-24 从各自原运行机器补齐并核对。**四个案例的原始运行目录均已到位，没有整例仍待提供。** 下文保留 E2、E3 终态文件的实际归档边界，不将缺少单独输出导出误写成缺少整次运行。

本次补档没有调用模型、启动设备、重跑任务或改分；无需为补齐材料而重新实验。

## E2：Gemini 气候控制——原始目录已补齐

相对于保存主实验结果的工程根目录：

```text
runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656/
```

对应批次的采用来源：

```text
runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/summary.json
runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/run_metadata.json
```

上述原机目录的全部 **27 个原始文件、8 张 Linux 截图、5 轮 prompt／messages 与回复** 已复制到 [E2_climate_control/run/](E2_climate_control/run/)。正式 summary 对应记录和批次元数据保存在 `E2_climate_control/task/`；输入矩阵与 episode 配置保存在 `task/resources/`，已对照原始 CLI stdout 和 reset 观测直接核对。见 [材料清单](E2_climate_control/material_inventory.json) 和 [案例说明](E2_climate_control/notes.md)。

E2 没有单独的 `execution_history.jsonl`、应用数据库导出或运行专属终态 `/tmp/climate/fallback_result.json` 文件。原始 `trajectory.json` 的 `events[4]`（s3）保留完整写入命令和 `exit_code=0`；历史 evaluator 的 JSON 检查通过，但 `actual` 只记录共享缓存路径。Home 的评估终态完整保留在 `evaluators[0].actual`，两台设备仍关闭，history 为空。**未使用当前缓存、其他运行产物或重建 JSON 冒充终态原件。** 原始运行材料已完整交付，但终态 JSON 的逐字节独立复核受原存档限制。

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

E2 沿用全部原始文件名、截图索引与日志中的历史绝对路径；交付时以文件字节和结构化内容直接比较，没有新增 Hash 校验字段。既有 redacted messages 的图片占位保持原样；未读取或上传 `.env`，扫描未检出需要额外删除的真实密钥或令牌。
