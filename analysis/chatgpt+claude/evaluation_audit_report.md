# DevicesWorld 评分争议离线核查报告

日期：2026-09-06。对象仅为本机更新后 Core200 的 GPT-5.5、Claude Opus 4.8 selected attempts。

本报告是技术审计建议，不是已经批准的改分。未修改任务、setup、资源、evaluator、原始 result/轨迹/统计；未连接设备、未重跑任务、未调用外部模型，未 commit/push。

## 1. 范围与计数口径

先读取 Phase 1 的 data_inventory.md、phase1_report.md、candidate_analysis_schema.md、400 行 task_level_results.csv、trajectory_annotations.jsonl 和 focused case notes，再以疑点为线索回查原件。

- 起始候选：45 条 model-task-selected-attempt run，去重为 26 个 unique task、16 个相关规则组。47 条 reviewed_uncertain 中的两条 android_smarthome_095 是导航停滞，非评分规则疑点，未纳入本轮；没有把其算成证据不足。
- 加入同任务另一模型（包括原 PASS）7 条，得到 52 条 run。
- 对实际使用 SmartHome infeasible/answer 规则的本地任务做配置定向扩展：新增索引 191、192、199 两模型共 6 条，其中 199 为两条原 PASS。
- 加入索引 083 两模型共 2 条：与 082 的 note relation 配置相关，且用于保留既有 GPT 人工改判并审查 Claude 对照。
- 最终实际核查：60 条 run（GPT 30、Claude 30），30 个 unique task，按“函数＋相关配置”归为 17 个规则组。
- 条件记录：146 个原 evaluator condition，另有 2 个明确标注的内容子条件，共 148 行 JSONL。父子条件不重复计为两个独立得分项。
- 起始及扩展范围全部 reviewed；本轮范围内 not_reviewed=0。其余 340 条本地主实验 run 未接受本轮审计，保持原记录。没有扩展到其他 baseline 或 6K 集合。
- 仅按同一大类 getter 不足以扩展：XLSX preserve_from 的其他任务只做相关性清点，没有证据确认共享保持性缺陷，未将其余任务纳入或臆断成误判。

## 2. 历史证据与代码边界

每条记录均绑定 Phase 1 已选的 result_path 所在运行目录，保留 selection_reason/source；未重选 attempt。正文优先用 evaluator 实际值、成功后的 readback、历史截图/UI 和操作反馈，不采用 reasoning 自述作为最终产物。

冻结 config/task.json 与 evaluator_trace 中的嵌入命令可明确对应本次运行。外部评分代码引用 Git `8c6d163f1`：与实验 worktree HEAD `5d8ee017d` 的相关已提交文件一致；但没有每次运行完整的未提交 runtime 快照，故不能绝对证明当时进程没有额外未提交变化。当前 dirty 改动（XLSX validation、Home target/negation、entity relation）只作版本对照，不当作历史实现。

对 20 条 SmartHome report 条件，用保存的 report/state 和上述版本的纯函数做无副作用检查，复现原始判分；另对 43/51 的四条保存正文做纯 entity relation 检查。这不是运行 getter、不是重建文件、不是重跑任务。186/183 的关键抽取规则直接在冻结命令中；其余相关代码位置逐条写入 JSONL。

已清点候选 selected-attempt 目录及 trace 指向的产物类型：保存了 JSON/JSONL、文本、prompt、UI 与设备截图，但没有这些候选的独立最终 XLSX/ODT/DOCX/EML/应用数据库或 contact-sheet 输出文件副本。**不等于所有条件都无法判断**：可靠 readback 可以证明独立的内容、格式和状态。对于 Excel 保持性、Thunderbird/Markor 持久化及 contact sheet 像素内容，缺口则确实阻止了更强结论。跨运行缓存的当前内容未被采用。

源模板引用采用 Git 版本内容与当时 Guide readback 交叉对照，不以当前任务文件补写历史要求；114 的受控下拉为 Supported/Protected/Missing/No Action，121 的 Guide 明确指向 dropdown，不能忽略这些公开 schema。

## 3. 条件级结果

下表单位为原 evaluator condition（不含内容子条件）：

| 条件判定 | 数量 |
|---|---:|
| original_judgment_supported | 97 |
| scoring_mismatch_supported | 34 |
| contract_ambiguous | 6 |
| historical_evidence_insufficient | 9 |

另有 2 个内容子条件支持 scoring mismatch，但其父 XLSX 条件仍为历史证据不足。原 FAIL 条件中有 17 个支持原判，疑点被排除；这与通过的保持性条件分开计算。

- original_judgment_supported 涉及 52 条 run / 26 个 unique task（组间可重叠，不能相加当成总 run）。
- scoring_mismatch_supported 涉及 36 条 run / 19 个 unique task（组间可重叠，不能相加当成总 run）。
- contract_ambiguous 涉及 6 条 run / 4 个 unique task（组间可重叠，不能相加当成总 run）。
- historical_evidence_insufficient 涉及 9 条 run / 7 个 unique task（组间可重叠，不能相加当成总 run）。

共 36 个已核查条件/子条件有评分不一致证据，涉及 36 条 run；其中 3 条 run 即使修正该项仍明确失败，5 条 run 因其他缺口仍不能判断整项，另有 1 条为既有 GPT 人工 PASS。

上述 36 项包含 GPT `_288` 的 1 项既有改判依据；扣除它，本轮新增技术建议为 35 个条件/子条件，不计为已经批准。

发现一例错误接受：GPT `linux_android_smarthome_271` 的 planned-effects 条件原 PASS，但 21:00 不满足公开要求的 20:30。其整项原本已 FAIL，因此不是任务级 PASS→FAIL。对本轮检查的原 PASS 对照（Claude 295、两模型 dryer/plain-light 0016）未发现错误接受。

## 4. 任务级影响（仍待批准）

| 模型 | FAIL→PASS 候选 | PASS→FAIL 候选 | 明确仍失败 | unchanged_pass | undetermined |
|---|---:|---:|---:|---:|---:|
| gpt-5.5 | 13 | 0 | 8 | 2 | 7 |
| claude-opus-4-8 | 14 | 0 | 6 | 2 | 8 |

这里相对于 existing_adopted_result 判断新增影响。GPT `_288` raw FAIL → adopted PASS 是此前结果，本轮记 unchanged_pass，不再加一次。partial_score_effect 另列在 CSV；修正原有通过但错误的时间条件也可能降低部分分，而不是所有候选都提高得分。

### 全部新增 FAIL→PASS 候选

| task_id | 模型 | 核心依据 |
|---|---|---|
| linux_android_1320 | gpt-5.5, claude-opus-4-8 | 两部手机初始截图分别给出 Harbor Rice Bowl 的 rice/cooking oil/cucumber 和 Emily Carter 的 sesame allergy；两 Linux CSV 与最终文件 readback 完整闭环，supplier_order.csv 未创建。 |
| linux_android_1858 | gpt-5.5, claude-opus-4-8 | 最终 communication_status.md 回读包含 CASE-1858/FB-1858/Leo Martin、请求号码 +15552001828 和当前行 +15552009928、冲突理由及不能回复的结论；两条 no-SMS 检查均通过且链中没有发送动作。 |
| linux_android_1312 | gpt-5.5, claude-opus-4-8 | 实际保存 ODT 的有效包/内容回读涵盖 SITE-1312、Depot Ridge、37.9101°N/122.5101°W、44 Ridge Road、bring vest，且不含 archived site。 |
| linux_android_1270 | gpt-5.5, claude-opus-4-8 | Broccoli 配方和 pantry CSV 的并集为 beans/rice/cilantro/lime；成功保存后回读恰有四列四行，数量及匹配/短缺/配方外状态正确。执行代码建立单个可见工作表，无隐藏表或额外记录。 |
| linux_android_smarthome_288 | claude-opus-4-8 | 同任务对照：Claude 的 Markor 最终 UI 正文完整、Save disabled；旧 workflow cancelled，新 21:30 workflow active 且效果正确。 |
| linux_smarthome_567 | gpt-5.5, claude-opus-4-8 | Home 只把 entry curtain 改到 50、light 不变；成功保存的 DOCX 记录已完成和不能调整的原因。 |
| android_smarthome_231 | gpt-5.5, claude-opus-4-8 | nursery 有房间但没有 air monitor，只有灯，无法 calibration；不替代、不改 Home。 缺 monitor 与 calibration 能力，并非缺 nursery 房间。 |
| android_smarthome_219 | gpt-5.5, claude-opus-4-8 | bedroom_dimmable_light_1 可调亮度但无 color control，无法满足 blue at 40%；保持 on/70 不变。 设备 ID 是合法目标；报告清晰绑定 blue 与不支持颜色控制。 |
| android_smarthome_233 | gpt-5.5, claude-opus-4-8 | kitchen 没有 aroma diffuser，无法设置 lavender；无替代、无 SMS、无 Home 改动。 missing diffuser 与 lavender 设置失败的关系明确。 |
| linux_only_283 | gpt-5.5, claude-opus-4-8 | 选定 maintainer、单一 To/无 Cc/Bcc、plain-text RFC 5322、失败摘要主题、仅真正失败的 parser.py::test_parse_dates、指定 .eml 保存及未发送，均有执行后回读支持。 |
| sh1_state_inquiry_bedroom_energy_query_infeasible_0012 | gpt-5.5, claude-opus-4-8 | 卧室公开状态/属性没有 energy kWh 读数；报告不能提供该值，不编造用电量。 未提供 energy 字段是实际能力事实，不应将否定读数可用性当成事实自相矛盾。 |
| sh4_time_schedule_missing_balcony_light_infeasible_0014 | gpt-5.5, claude-opus-4-8 | balcony_light_1 不在 Home inventory，无法安排两小时后开启；没有成功建立错误 schedule。 GPT 的首次非法 schedule 请求被拒，随后有效报告；不是未纠正的 Home mutation。 |
| sh1_state_inquiry_bathroom_humidity_feasible_0001 | gpt-5.5, claude-opus-4-8 | bathroom humidity_pct=49.3，报告通过 smarthome.report_answer 被接受，明确给出 49.3%。 保存的 prompt 第 32/87 行要求 report_answer，但没有规定 answer 对象内部键；示例甚至使用字符串。 |
| sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016 | gpt-5.5, claude-opus-4-8 | Home 没有 guest_room，不能排今晚 21:00 的灯/窗帘；两模型报告缺房间且不创建替代计划。 正确否定 guest-room exists，不是声称该房间存在。 |

任务级 PASS→FAIL 候选：0。以上只列已核查范围内、有完整必要要求证据的变化，不计算或发布一个“已更新”的 200 任务排行榜。

### 支持原判的代表性记录

- `_1368`：GPT 新增重复事件而不是更新原事件；Claude 未完成日历和 Markor。getter 的 missing 不是这里的误判证据。
- `_796` GPT：Actual 列把 basic light 的实际能力写成 set_brightness，把缺失 heater 写成 set_target_temperature；Notes 正确不能抵消同一输出的错误字段。
- `_932` Claude：Final 填 65、Decision 填 no repair，与公开 Guide 的字段含义不同。对照 GPT 目标格正确，但无法证明全文件保持性。
- nursery 0011 / plain-light 0013：两模型没有有效不可行报告，且确实修改其他房间/另一台灯。不能归入共享 matcher 漏判。
- `a2l_osmand_calc_visit`：保存内容的坐标/日期可以接受，但公开 instruction 指定在 Calc 完成，历史模型使用约定也要求 Office GUI；两模型只用 openpyxl 写文件。单项内容修正不等于整项合格。

### 为什么部分条目不能改为整项 PASS

- `_1000`/`_796` Claude：具体内容句式误拒已可确认，然而复合 XLSX 的保持性没有历史最终文件可检验；partial_score_effect=undetermined。
- `_300` 两模型：CSV 的 source_filename 表头是可独立确认的误拒，故部分分可变；PNG 尺寸成功不能证明所有卡片和标签正确。
- `_271` Claude：20:30 workflow 应接受；最终 Markor 仍缺保存证据。与 `_288` 的 Save disabled 历史 UI 不同，不共用改判结论。
- `_1853`：GPT 只有 compose 窗口；Claude 写入不同 profile。都不应将正确正文参数等同目标 Thunderbird 中已存在合格草稿。

## 5. 需要人工确认的最小清单

1. 是否批准第 4 节逐项列出的新增 FAIL→PASS 建议，以及 `_271` 双向时间条件、`_300` CSV、两项 XLSX 内容子条件的技术结论。批准条件修正不自动批准整项 PASS。
2. 四个公开口径待裁决：`_606` AutoFix 是资格还是实际修复；`_1000` Capability 是实际支持能力还是请求所需能力类型；`_982` After 是最终状态还是单请求结果；`_295` manifest 是否允许递归列出缓存子文件。暂不替用户补充规则。
3. 如仍希望定案历史缺口，只需查找：GPT `_932`/Claude `_851`、`_1000`、`_796` 的最终 XLSX；两模型 `_1853` 的目标 Drafts/profile；Claude `_271` 的最终 Markor 文件/保存状态；两模型 `_300` 的最终 contact_sheet.png。若没有保存，就维持 undetermined，不能拿当前状态或新产物替代。歧义任务若获口径裁决，可能仍需要其 XLSX 保持性证据。

## 6. 后续其他 baseline 的统一核查范围（本轮未执行）

应按冻结配置而非模型补专属别名：

- SmartHome 同一 semantic_report 的目标过滤、否定/冲突词袋、allowed-negative 处理；同时保留没有报告、对象错误、Home mutation 的真实失败，并复核同规则原 PASS。
- answer_report 的字段提取与当时模型可见接口文档；不能只因 API 接受便放行公开文档明确禁止的包装。
- `_271` 的 offset expected，以及 `_288`/相关 note 条件中未公开的状态关键词、实体短语限制。不能把保存问题一并豁免。
- meal/communication/DOCX/ODT 的文档级实体与否定关系、186 的失败测试提取和标题+列表语义、logical-table 的数值/方向/日期/状态同义表达。
- `_300` 的 CSV 列别名应与公开字段对齐；图像 scorer 是否有问题仍需对应最终图像，尚未确认共享图像 bug。
- 没有确认 preserve_layout 的具体共享实现缺陷：不能因当前工作树曾移除 allowBlank 比较，就反推这些旧失败都是该问题。公开模板枚举仍应保留。

这些是定向审计发现，不能用候选中的问题比例推断全部 200 或 6,140 个任务的评分错误率。

## 7. 可回查文件和完成名单

- [condition_review.jsonl](condition_review.jsonl)：每个条件含实际证据、原配置引用、代码版本/行号、建议与具体缺口。
- [task_level_audit.csv](task_level_audit.csv)：每条 selected attempt 保留 raw/adopted/proposed 三套结果、独立未完成要求、Diagnostic-60 overlap 和证据 ID。Diagnostic 名单仅用于交集，不混入 isolated 成绩。
- 本目录两个只读查看脚本和 build_audit.py 为轻量审计辅助；不接入 benchmark，不修改正式运行。

以下每个任务均核查两模型；未完成名单为空。

| 索引 | task_id | GPT 任务影响 | Claude 任务影响 | 规则组 |
|---:|---|---|---|---|
| 024 | a2l_osmand_calc_visit | still_fail | still_fail | logical_table_coordinate_datetime |
| 035 | linux_android_1368 | still_fail | still_fail | calendar_identity_and_note_persistence |
| 043 | linux_android_1320 | candidate_fail_to_pass | candidate_fail_to_pass | entity_relation_semantics |
| 048 | linux_android_1853 | undetermined | undetermined | thunderbird_extraction_and_persistence |
| 051 | linux_android_1858 | candidate_fail_to_pass | candidate_fail_to_pass | entity_relation_semantics |
| 072 | linux_android_1312 | candidate_fail_to_pass | candidate_fail_to_pass | odf_document_relations_and_coordinates |
| 073 | linux_android_1270 | candidate_fail_to_pass | candidate_fail_to_pass | logical_table_enum_aliases |
| 082 | linux_android_smarthome_271 | still_fail | undetermined | workflow_offset_and_note_persistence |
| 083 | linux_android_smarthome_288 | unchanged_pass | candidate_fail_to_pass | note_relation_public_contract |
| 111 | linux_smarthome_606 | undetermined | undetermined | xlsx_public_field_contract |
| 114 | linux_smarthome_851 | still_fail | undetermined | xlsx_controlled_fields_and_preservation |
| 116 | linux_smarthome_1000 | undetermined | undetermined | xlsx_semantic_fields_and_preservation |
| 117 | linux_smarthome_796 | still_fail | undetermined | xlsx_semantic_fields_and_preservation |
| 119 | linux_smarthome_932 | undetermined | still_fail | xlsx_controlled_fields_and_preservation |
| 121 | linux_smarthome_983 | still_fail | still_fail | xlsx_controlled_fields_and_preservation |
| 123 | linux_smarthome_982 | undetermined | undetermined | xlsx_public_field_contract |
| 125 | linux_smarthome_567 | candidate_fail_to_pass | candidate_fail_to_pass | docx_completion_relations |
| 155 | android_smarthome_231 | candidate_fail_to_pass | candidate_fail_to_pass | infeasible_report_semantics |
| 158 | android_smarthome_219 | candidate_fail_to_pass | candidate_fail_to_pass | infeasible_report_semantics |
| 159 | android_smarthome_233 | candidate_fail_to_pass | candidate_fail_to_pass | infeasible_report_semantics |
| 183 | linux_only_295 | undetermined | unchanged_pass | archive_manifest_row_contract |
| 186 | linux_only_283 | candidate_fail_to_pass | candidate_fail_to_pass | rfc5322_failed_test_extraction |
| 187 | linux_only_300 | undetermined | undetermined | contact_sheet_content_and_csv_aliases |
| 191 | sh2_implicit_intent_nursery_air_comfort_infeasible_0011 | still_fail | still_fail | infeasible_report_semantics |
| 192 | sh3_explicit_control_plain_light_dimming_infeasible_0013 | still_fail | still_fail | infeasible_report_semantics |
| 194 | sh1_state_inquiry_bedroom_energy_query_infeasible_0012 | candidate_fail_to_pass | candidate_fail_to_pass | infeasible_report_semantics |
| 195 | sh4_time_schedule_missing_balcony_light_infeasible_0014 | candidate_fail_to_pass | candidate_fail_to_pass | infeasible_report_semantics |
| 198 | sh1_state_inquiry_bathroom_humidity_feasible_0001 | candidate_fail_to_pass | candidate_fail_to_pass | answer_report_field_extraction |
| 199 | sh5_event_schedule_plain_light_dim_after_dryer_infeasible_0016 | unchanged_pass | unchanged_pass | infeasible_report_semantics |
| 200 | sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016 | candidate_fail_to_pass | candidate_fail_to_pass | infeasible_report_semantics |

审计到此停止，等待人工确认；不继续修改评分器、改分、重跑或上传。
