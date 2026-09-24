# Evidence Sources and Claim Boundaries

## 来源索引

详细逐文件来源见 [evidence_source_index.json](original_evidence_source_index.json)。复制文件保留原文；原始记录中的旧状态/历史做法不因被复制而获得本轮认可。

| 编号 | 来源 | 支持的内容 |
| --- | --- | --- |
| S1 | 本包 A1_task_specification/task/config/task.json + evidence/original_provenance.json | 正式实验使用的日历同步任务完整规格 |
| S2 | 本包 A1_task_specification/task/resources/ + evidence/historical_source_read.json | 真实源资源；Linux 两份资源与 agent 第一次读取结果一致 |
| S3 | `mdcbench/tasks/generation/engine/pipeline.py` | Stage0–Stage8 的控制流、模型调用、阶段校验与失败停止 |
| S4 | `mdcbench/tasks/generation/profiles/linux_android/stage0.py` | 六种轮转设备组合、13/14 surfaces、seed、distractor 概率 |
| S5 | 同 profile 的 surface_capabilities.yaml、prompts/；engine/prompts.py、pattern_catalog.py | 设计/实现能力边界、提示词与模式目录 |
| S6 | `runs/generation_engine_probe/stress_gpt5mini/R01/result.json` 中 sample_000014 | 历史阶段产物、revise 判定、修复调用及静态完成状态 |
| S7 | R01_R35_selected_manifest.json 指向的 R01/sample_000014 配置与资源 | 后续 selected 快照；不能代替最初阶段产物 |
| S8 | `docs/R01-R35生成任务真机smoke测试记录.md` 与对应 scripts | 代表性 runtime setup smoke 的范围和实际问题，不是全量 agent 成功证明 |
| S9 | `docs/paperdossier2/MDCBench_task_construction_pipeline.md` | 已有长篇构建说明、5,897 口径和流程图文字设计；本轮以源码/配置交叉约束其声明 |
| S10 | 实验工作树 `tasks/mdcbench_lite/mdcbench_lite_v1.json` 及 selection/replacement/smoke 报告 | 配额、选取标签/理由、替换和历史 QA 状态 |
| S11 | `analysis/chatgpt+claude/failure_pattern_validation/sampling_manifest.json` 的 GPT 正式 attempt 列表 | 解析 200 个冻结 task config 的入口；本轮不使用评分裁决或 failure 标签作为选取依据 |
| S12 | 两份工作树 tasks 库存、`scripts/organize_cross_device_topology_views.py` 与 topology_views_report.md | 设备目录统计、旧 real 集合/组织后视图的关系及宽口径重复计数风险 |

S3–S5、S8–S9 和 topology-view 相关文档/代码已保存在本包 `A2_task_construction_pipeline/source_snapshots/` 对应目录。S10 的较小报告位于 `A3_dataset_composition/selection_evidence/`，清单政策/状态与逐任务选取字段分别提取为 JSON。S6 位于 `A2_task_construction_pipeline/stage_example/`，保存所选样本完整记录而不是整个生成批次；S1 保存一个任务配置而不是整套运行日志。原始证据索引里的旧包路径通过根目录的 `material_inventory.json` 映射到上传版。

## 已解决的口径问题

- 正式示例使用 frozen config，不拿根工作树中的同名任务代替；Linux fixture 又与历史 stdout 直接比较。
- A.1 的用户要求、初始化与隐藏评测目标分开展示；没有把答案当作 agent 可见资源。
- A.2 的“独立审查调用”不夸大成独立 reviewer 模型或人工审查。
- historical result.json 与 later selected config 分开保存，避免将后续人工/脚本维护归功于最初生成阶段。
- real100/200/300 在主表中归并到设备组合，只在选取溯源表保留原名。
- 5,897 是实验工作树的七目录库存；6,240 是包含旧集合/示例的宽口径；5,197 是另一个根工作树。
- Lite 设备分布来自正式冻结配置；42/108/50 难度分布来自 manifest，明确不混用。

## 必须保留的限制

1. **统一 pipeline 并未证明覆盖全部构造来源。** SmartHome profiles 目前仍 planned；专用 builder 路线与旧 seed/import 路线实际存在。
2. **原始选取算法未完整定位。** 不填造 quality_score 公式、随机种子或“均匀随机”声明；能够核实的是配额、名单、选取理由和明确替换。
3. **旧验收报告与后续维护状态不一致。** 本轮不自动改旧状态、不推定任何正式主实验无效；发布级验收比例需另有对应 release 证据。
4. **阶段示例包含真实的历史缺陷。** R01/sample_000014 的 title 隐藏条件与 approved 产品范围问题说明结构完成不等于语义彻底修好；后续显式 slide_request 是另外的维护快照。
5. **统计单位是配置/端点。** 不保证场景语义完全去重，不把 home 端点数量当物理智能设备数，不从多标签频次推断互斥能力分布。
6. **源码快照与历史运行不一定同 revision。** 资料包分别用“当前实现”与“历史记录”措辞；不声称本轮已复现当时模型输出。

## 本轮操作范围

前一轮只生成本地资料。本次根据用户的上传要求，按附录 E 结构重新组织为 `appendix_A_materials` 并提交到 pear；仅调整材料入口与说明文档链接，追加用户原 PDF 与预览。没有修改任何源任务、模型执行记录、runtime、evaluator 或评分，也未运行生成器、oracle、设备操作或主实验。

`local_collection_scripts/build_materials.mjs` 负责原本地包的库存和正式配置索引；`collect_evidence.mjs` 负责只读复制与历史来源对应。原样保留这些本机整理脚本用于追溯，不是其他机器无需原工程即可运行的 benchmark 工具，也不是在上传版目录原地重建文件的脚本。
