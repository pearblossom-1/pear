# E2：气候控制——已定位，原始目录尚待补入

已定位为 **Gemini 3.1 Pro Preview／direct LLM** 的 `linux_smarthome_656`，主实验运行：

```text
runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656
```

[main_experiment_selection.json](main_experiment_selection.json) 保留 pear 既有执行结果表的对应行，来源为该批次正式 run_01 summary.records；[existing_analysis_record.json](existing_analysis_record.json) 原样保留该案例 G-R17 的分析记录与事件定位。两者相互对应到同一模型、任务、批次与目录。

该索引记录 FAIL、score=0.5、5 步、223.687 秒、主动 done。既有 G-R17 分析按零基 step 记录：s0 读取 `/tmp/climate/fallback_matrix.md`；s1、s2 查询相关设备能力；s3 写 `/tmp/climate/fallback_result.json`；s4 done。分析指出 JSON 的 office/study 状态标记 applied，JSON 检查通过，但 office AC 仍 off/auto/26、study heater 仍 off，Home history 为空。

**这些是已有分析所保存的结论与索引，本次尚未取得原始命令载荷、JSON 原文件和 evaluator 原件。** 目前不能把上述分析条目充作完整动作复核，也不能据此生成一个 fallback_result.json 冒充本次产物。

收到原始目录后，应保留全部 cli.execute 代码、Home 调用和工作流载荷，确认是否存在等效控制；并将生成 JSON、评测时设备状态和结束声明放在一起。需要的是该次评测时、cleanup 前的状态。Home 可以用原始结构化状态展示，不需要补造 GUI 截图。

已发现本机另有同任务 Gemini 旧记录，其为 8 步、score=0、不同批次，**不属于本例，未复制**。也未使用 GPT-5.5 或 Claude 的同任务轨迹。待补材料的具体入口见 [run/README.md](run/README.md) 和总目录 [missing_materials.md](../missing_materials.md)。
