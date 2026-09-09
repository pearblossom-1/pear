# DevicesWorld 全量应用覆盖核对

本轮覆盖全部 **5,897 条现有候选任务**。未发现已确认的最终发布 manifest，因此结果标为 **provisional**。5,894 是沿用现有清洗建议排除三条后的条件性范围，不是本轮凑出的正式规模。所有文件均新增在本子目录，未覆盖旧报告。

## 范围与完成程度

| 范围 | 任务数 | complete | partial | unreviewed | complete 有具体应用 | complete 无具体应用 |
| --- | --- | --- | --- | --- | --- | --- |
| candidate_all_provisional | 5897 | 5891 | 6 | 0 | 4223 | 1668 |
| proposed_release_conditional | 5894 | 5888 | 6 | 0 | 4220 | 1668 |

- 主清单来自 `statistics/scope_manifest.json` 的六个编号目录与280条单Home任务；逐任务路径、当前内容SHA-256、原始设备及统计范围保存在 `task_scope.jsonl`。不合并相似但不同ID，不加入历史副本、backup、子任务或运行日志。
- 条件性排除依据是既有 `analysis/statistics/cross_device_light_review.jsonl` 的非跨设备记录：android_smarthome_123、124、129；按路径和ID共同匹配。原manifest没有改动。最终发布仍需用户确认。
- 源版本 HEAD：`5d8ee017d8319f0b640b215d435d583c64098ced`，分支 `codex/core200-runtime-fixes-20260828`。工作树原有未提交修改已记录于 `scope_provenance.json`，实际读的是当前文件，不是假称clean的HEAD版本；与上轮5897条内容快照相比变更0条。
- `complete` 是本轮静态应用核对完成，不代表任务执行成功或质量完全验证；确认无具体软件、仅IoT也可complete。6条partial仍保留在所有适用分母里。

## 完整应用覆盖

当前确认 **28 个应用实体**，4225条任务有至少一个已确认应用，共7451个去重任务—应用关系。CSV完整列出28个实体在两个范围下的统计，不仅Top-N；每行保存完整task IDs。

| 应用 | 候选5897：确认任务数 | 已确认覆盖下界 | 条件5894：确认任务数 |
| --- | --- | --- | --- |
| Tasks.org | 1246 | 21.13% | 1246 |
| Markor | 1119 | 18.98% | 1116 |
| Simple SMS Messenger | 984 | 16.69% | 984 |
| Simple Calendar Pro | 780 | 13.23% | 778 |
| Google Contacts | 679 | 11.51% | 678 |
| Android Files | 625 | 10.60% | 625 |
| Google Clock | 319 | 5.41% | 319 |
| OsmAnd | 265 | 4.49% | 265 |
| Broccoli | 244 | 4.14% | 244 |
| Retro Music | 217 | 3.68% | 217 |
| Simple Gallery Pro | 206 | 3.49% | 206 |
| Mozilla Thunderbird | 138 | 2.34% | 138 |
| Google Chrome | 107 | 1.81% | 107 |
| LibreOffice Calc | 80 | 1.36% | 80 |
| Audio Recorder | 68 | 1.15% | 68 |
| VLC | 67 | 1.14% | 67 |
| Simple Draw Pro | 65 | 1.10% | 65 |
| LibreOffice Writer | 53 | 0.90% | 53 |
| Visual Studio Code | 52 | 0.88% | 52 |
| LibreOffice Impress | 43 | 0.73% | 43 |
| GIMP | 39 | 0.66% | 39 |
| Evince / Document Viewer | 19 | 0.32% | 19 |
| Mozilla Firefox | 16 | 0.27% | 16 |
| Camera | 8 | 0.14% | 8 |
| Archive Manager (File Roller) | 8 | 0.14% | 8 |
| gedit | 2 | 0.03% | 2 |
| Android Settings | 1 | 0.02% | 1 |
| GNOME Terminal | 1 | 0.02% | 1 |

同一任务多次或跨设备使用同一实体只计一次；多个应用分别计入。主范围覆盖比例之和为126.35%，未归一化成100%。纯IoT的280条任务始终在全量分母中。

**正式完整应用分布图尚不宜定稿。** 可以画明确标注“当前候选范围、已确认覆盖下界”的预备图，但应先确认发布清单并解决6条身份疑点后再称完整分布。本轮不生成图或修改论文声明。

## 与旧100条试标的区别

旧流程扫描了5897条，但应用主count仅来自100条Codex试标，其中77条有应用、25个实体。全量名称候选没有被当成最终语义标注。本轮重新处理5897条实际实例；旧阳性仅在内容版本一致且不与当前证据冲突时保留，不能作为该任务全部应用已经核完的凭据。

保留原25个实体粒度，新增 Android Settings、gedit、GNOME Terminal（分别1、2、1条）。新增来自实际要求及唯一配置绑定，不来自安装清单。xfce4-terminal、Thunar、Nautilus只作启动便利，不计入应用覆盖。OsmAnd、Retro Music、Audio Recorder、Files、Camera的旧runtime alias补充为已有运行时代码中明确的包名，不改变实体。Chrome跨平台合并方式沿用旧清单；Calc/Writer/Impress仍分开。

## 判定与证据

批量规则先关联实际指令中的应用对象/动作，再用该实例setup别名、原生记录、已引用资源确定身份；安装或配置存在本身不能确认参与。原生短信正文、联系人/待办/事件字段、Markor文件、PDF/Office/ZIP文本一起检查信息来源和输出去向。固定174条任务的Codex具体决定在 `semantic_decisions.mjs` / `semantic_overrides.json`，不称人工标注，不按家族无条件传播。

依据和规则名保存在每个任务—应用关系的support中，带task JSON字段或来源路径。角色包括source_read、process_edit、result_output；仅可确定读/操作但方向未进一步区分时标read_or_operate_required_object。device_ids是配置中的可能实例，不声称这些实例全都必需；应用按task ID计数。

未限定具体产品的通用文件操作不映射到Files/VS Code/Terminal；生成HTML不自动算浏览器，格式不算Office软件；Camera相册不等于相机拍摄；仅保护不变不算使用。但必须读真实Calendar/Clock来判断不存在时，仍计信息来源。确切Markor目录与被引用笔记内容能证明来源时，不因为指令没写Markor而漏计。详见 `audit_report.md`。

## 尚待确认的6条

| 任务 | 问题 |
| --- | --- |
| linux_android_861 | 指令要求Gallery，但未找到能唯一确定具体Gallery产品的配置绑定 |
| linux_android_862 | 指令要求Gallery，但未找到能唯一确定具体Gallery产品的配置绑定 |
| linux_android_951 | 指令要求Gallery，但未找到能唯一确定具体Gallery产品的配置绑定 |
| linux_android_960 | 指令要求Gallery，但未找到能唯一确定具体Gallery产品的配置绑定 |
| linux_android_972 | 指令要求Gallery，但未找到能唯一确定具体Gallery产品的配置绑定 |
| android_smarthome_1013 | 指令Contacts、setup simple contacts pro 与原生联系人helper身份冲突 |

这6条不是缺陷或失败标签。若5条Gallery最终确认为Simple Gallery Pro，该应用最多增加5个任务；联系人若确认为Google Contacts则其计数增加1，若为另一具体产品则需要新增实体。不能仅为了完成表格而猜测映射。

两份原生PDF文字提取报错（linux_only_007 gamma.pdf、linux_only_231 report.pdf）已逐任务核对为文件清单/空产物种子，不承载必需的应用指示，不因此增加应用疑点；不把它们宣布为任务执行bug。图片/音频未作全量OCR或内容有效性审计。

## 设备统计对账与HTML边界

| 范围 | 设备实例总数 | 平均设备数 | 最大设备数 |
| --- | --- | --- | --- |
| candidate_all_provisional | 14683 | 2.489910 | 4 |
| proposed_release_conditional | 14677 | 2.490159 | 4 |

设备与应用使用完全相同的task IDs和分母。每任务恰归入一个具体配置，14种具体配置对账回7种环境组合，设备数量层级也等于范围总数。一个Home只计一个IoT环境，灯/空调/房间等端点不增加设备实例。与旧JSONL及 `../device_distribution.csv` 两种范围逐项一致，**不需要修正旧设备计数**。

HTML结果保留原处：460条资源、17类用途、关联417个任务；实际网站用途交互统计416条任务。它们不加入28个应用实体。本轮范围与旧对应范围一致，无需重新归类网站或改变其计数。

## 复现、续跑与文件

只汇总当前保存标注（不会改语义标签）：

```bash
cd /Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826
/Users/lht/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node analysis/benchmark_overview_20260909/app_full_analysis/aggregate.mjs
```

显式重新应用已记录规则/具体决定：先运行 `semantic_decisions.mjs`，再运行 `review.mjs --all`；仅中断续跑、规则未变时运行 `review.mjs --resume`。24个250条以内的batch与progress.json保存进度。更新规则/决定后不能用resume跳过旧batch。最后再运行aggregate。

`prepare.mjs`只读源任务并保存一次快照，已有快照时拒绝覆盖；`extract_sources.mjs`只做本地原生文档文字提取。二者不运行setup、生成器或agent。原文中的命令只作为数据读取。

- task_scope.jsonl：5897条范围和版本；task_application_annotations.jsonl：5897条标注。
- application_coverage.csv：完整应用计数/分母/百分比/ID；application_identity_map.csv：别名、实体与变更、两类未决身份。
- unresolved_cases.csv：6条任务及全部问题证据；device_distribution.csv：两范围的组合/配置/设备数。
- summary.json：机器可读汇总；csv_validation.json：电子表格工具生成与回读逐值核对。
- evidence_packs.jsonl / extracted_source_text.jsonl：来源快照及只读文字提取；audit_report.md / audit_sample.json：抽检与系统性修正记录。
- source_preservation_before.json / source_preservation_check.json：本轮原任务、资源、运行配置与实现前后核对。

CSV依照Spreadsheets技能通过artifact-tool表格生成并回读；PDF技能用于只读提取关联文档文字。本轮没有修改任务、资源、已有实验配置或evaluator，没有运行设备/模型，没有读取密钥或调用收费API；没有自动commit或push。

已完成源文件保护核对：33433个原始任务/资源/配置/实现文件未变化，5897条任务内容哈希一致。现有Git未提交修改为本轮开始前已有修改，未覆盖。
