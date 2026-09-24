# E2：气候控制——交付记录与实际设备状态脱节

2026-09-24 已从原 Windows 运行机器补齐 **Gemini 3.1 Pro Preview／direct LLM** 的 `linux_smarthome_656` 主实验材料。原始目录为：

```text
runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/122_linux_smarthome_656
```

本例只采用正式 `run_01/summary.json.records` 指定的这一条记录，不使用同题旧批次、其他模型或重新执行的结果。[正式采用记录](task/main_experiment_selection.json) 是原汇总对应条目的完整摘录；[批次元数据](task/run_metadata.json) 保留该批次的配置与创建／更新时间，不能将批次时间直接当作本题开始时间。原 pear [分析索引](main_experiment_selection.json) 和 [G-R17 分析记录](existing_analysis_record.json) 保留供交叉核对。

## 材料与结果

- [完整原始运行](run/README.md)：27 个原始文件，13,083,519 字节，含全部 5 轮模型输入文本、5 份脱敏 messages、原始回复、动作、反馈、配置、评测和日志。
- 原样保留 `linux_0` 的 8 张完整截图 `step_000.png`–`step_007.png`。没有生成、裁切或替换截图。
- [原始结果](run/result.json)：FAIL，score **0.5**，`steps=5`，`termination_reason=done`，时长 **223.687 秒**。5 次模型调用，40,219 input tokens、3,804 output tokens，共 44,023 tokens，记录的 transport retries 为 0。
- 5 步包括 **4 个设备动作＋1 个全局 done**。其中 Linux 读／写文件各一次，SmartHome 两次动作均为能力查询；没有控制或调度动作。
- [文件清单](material_inventory.json) 区分原始文件与本次新增说明；交付副本与原机逐文件直接比较字节，不新增 checksum／task hash。

## 任务要求与设备关系

[当次任务](task/config/task.json) 要求读取 Linux 上的 [fallback_matrix.md](task/resources/source/tmp/climate/fallback_matrix.md)，检查列出的房间和实时能力，**实际应用**各房间允许的气候控制方案，再把 room-by-room handoff 写入 `/tmp/climate/fallback_result.json`。不是只编写控制方案或状态报告。

`linux_0` 负责读取矩阵和保存 JSON；`home_0` 是独立 SmartHome runtime。矩阵与当次状态对应 office 的空调、study 的取暖器，以及没有气候设备的 guest room。输出 JSON 使用 `applied` 描述前两间房，guest room 则应记录 `unavailable / no climate device`。

矩阵来自正式采用命令所指工作树，对应任务资源版本 `1e053e2cf7955b4a2c4aafbe5136ea918276eaec`。矩阵全文与 s0 的原始 stdout 一致；[episode_config.json](task/resources/episode_config.json) 的初始状态与轨迹 reset 观测一致。资源来源和验证边界见 [provenance.json](task/resources/provenance.json)。这些是当次输入资源，不是后补的终态输出。

## 完整动作链与证据定位

所有 `sN` 都是 [trajectory.json](run/trajectory.json) 中零基 `step_index=N`；`events[0]` 是 reset，所以 sN 对应 `events[N+1]`。截图索引不是动作步号。

| 步号 | 原始动作 | 执行结果与意义 |
|---|---|---|
| s0 / events[1] | `linux_0`：`cli.execute`，读取 `/tmp/climate/fallback_matrix.md` | `exit_code=0`；`info.stdout` 保存完整矩阵和 JSON schema，要求应用 fallback，而非仅报告 |
| s1 / events[2] | `home_0`：`smarthome.get_device_capabilities`，查询 `office_air_conditioner_1` | 查询成功；支持 `turn_on`、`set_mode` 和 `set_target_temperature`，当前仍 off／auto／26°C |
| s2 / events[3] | `home_0`：同一查询，目标 `study_heater_1` | 查询成功；支持开关和温度控制，当前仍 off／22°C；这两步都没有修改设备 |
| s3 / events[4] | `linux_0`：`cli.execute`，用 heredoc 写入 `/tmp/climate/fallback_result.json` | `exit_code=0`；原始命令包含完整 JSON，把 office 和 study 标记为 `applied`，guest room 标记为 `unavailable` |
| s4 / events[5] | 全局 `done` | 模型明确声明配置已评估并写入文件、任务完成；没有先执行控制，也没有补充动作验证实际状态 |

全部四个设备动作的 `ok=true`，两次 CLI 的 exit code 都是 0。完整命令与参数均在原始轨迹中；两条 CLI 仅执行上述文件读写，没有通过 CLI、脚本或其他等效渠道控制 SmartHome。四个设备动作之后直接 done，也没有被框架拒绝的控制批次。

## 终态核对：文件写对了，设备没改变

[原始 evaluator](run/evaluator_trace.json) 保存评估时的实际值；以下引用的是 cleanup 前评估取得的状态，不是当前机器状态或清理后的状态。

| 对象 | 要求／handoff 声明 | 原始评估实际值 |
|---|---|---|
| Office 空调 | 开启、cool、24°C；JSON 为 `applied` | `power=off`、`mode=auto`、`target_temperature_c=26.0` |
| Study 取暖器 | 开启；JSON 为 `applied`、22°C | `power=off`，温度设定原本已经是 22°C；温度相同不等于已开启 |
| Guest room | 无可用气候设备，JSON 写 `unavailable` | 当次配置确实没有该房间的气候设备 |

`evaluators[0]` 的 `smarthome.check_allowed_state_diff` 得分 0；actual 中 Home `history=[]`，schedules、workflows 也为空。`evaluators[1]` 的 `check_json_exact_object` 得分 1。原始整体得分因此为 0.5，任务仍失败。本次不重新运行 evaluator、不改分。

## 附录展示建议与解释边界

适合并列展示三段真实文本：s3 原始写入命令中 `status=applied` 的 JSON、evaluator 中仍关闭的两台设备状态、s4 的完成声明。这个案例支持的是 **跨设备交付一致性与完成验证不足**：模型把能力核查和文档交付误当作真实控制已经落实。它不是房间／设备识别错误，也不是控制调用被拒绝；不能仅凭该个案推出所有 Gemini 失败都由同一原因造成。

Linux 截图主要是桌面背景，因为操作通过 CLI 完成；[首张](run/artifacts/linux_0/screenshots/step_000.png)和[末张](run/artifacts/linux_0/screenshots/step_007.png)均为真实完整截图。它们不能独立证明 JSON 内容或 Home 状态。SmartHome 原始证据是结构化观察和 API 返回，不存在需要补造的家居 GUI 截图。

归档边界：

- 原件没有单独的运行专属 `fallback_result.json` 文件，也没有 `execution_history.jsonl` 或应用数据库导出。**没有从当前共享缓存提取、重建或伪造终态文件。** s3 保留完整写入载荷与成功反馈；历史 JSON 检查确实通过，但 evaluator 的 `actual` 仅为 `cache\\mdcbench_linux_0_reset\\fallback_result.json` 路径，不是原文件字节。独立逐字节核对终态 JSON 仍受这个边界限制。
- [stderr.txt](run/stderr.txt) 保留缺少 proxy 配置以及两条 VMware 启动超时警告，不能声称这次运行完全没有环境告警。但随后模型和四个设备动作正常完成、两项评测均返回结果；没有证据显示某个 SmartHome 控制动作因这些告警被拒绝。缺少控制动作的判断来自完整轨迹，不是忽略环境日志。
- `run/prompts/` 为原运行保存的审计文本与 redacted messages，不是本次重新构造的输入。既有图片脱敏占位保留，真实图片在 `run/artifacts/`；没有读取或上传 `.env`。交付前未检出新增凭据泄露，原件无需再次脱敏。
- 本次只补充 Appendix E 材料，不更改 benchmark、任务、模型配置或历史评分，不重跑实验。
