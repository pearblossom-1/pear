# E3：日历同步——已定位，原始目录尚待补入

已定位为 **UFO³／GPT-5.5** 的 `al_calendar_schedule_conflict`，主实验 attempt 为 `attempt_001`：

```text
/Users/Admin/home/MDC_Benchmark_lite_ufo3/runs/ufo3-gpt-5.5-core200-rerun-20260826/mdcbench_lite_v1/run_01/004_al_calendar_schedule_conflict/attempts/attempt_001
```

[main_experiment_selection.json](main_experiment_selection.json) 原样保留 pear 的采用索引行，依据是 `final_merged_status_after_infrastructure_repairs.json` 的 selected attempt；[existing_analysis_excerpt.md](existing_analysis_excerpt.md) 为原案例分析 C01 摘录。该索引为 FAIL、score=0、result.steps=50、532.996 秒、termination_reason=`max_steps`。

原分析明确区分：**50 次 policy call；49 次 device-agent 环境动作全部在 `android_0`；第 50 次 policy call 触发上限；replan=0。** 所以正文的“49 次环境动作”不等于 result.steps=49，也不能在未保留计数口径时直接写成“50 次环境操作”。当前这些数字均来源于既有分析，收到原件后还需核对是否有失败／无效动作以及 step 索引起点。

原始计划据分析包含 Android 日历读取、Linux 规则读取、Linux 更新／日志三个子任务；初始日历任务为 RUNNING，两个 Linux 任务为 PENDING。末帧为 `artifacts/android_0/screenshots/step_098.png`，仍在月历界面。原分析指出 `week.csv` 保持旧内容、`log.json` 不存在，两项检查均失败。

**当前尚无本次原始计划、完整 49 次动作、原图及 evaluator 原件。** 保留上述原始目录定位，未从其他 baseline 的日历截图或任务脚本重建该计划，也未把分析中的“已查看”描述当作本次复查原图的结论。

需补入完整 attempt_001，包括原始 `ufo3/` 调用、规划／子任务输出、prompts、trajectory、执行历史（如有）、screenshots 和 evaluator，并保留该运行专属的输入／输出存档。详细位置见 [run/README.md](run/README.md) 和 [missing_materials.md](../missing_materials.md)。
