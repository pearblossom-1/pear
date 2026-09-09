# DevicesWorld Benchmark Overview 统计准备

统计日期：2026-09-09。**最终发布清单尚未确认；本报告完整提供当前候选配置统计，以及条件性5,894条范围的汇总。不得把后者冒充已发布的正式清单。**

## 主要结果与分母

| scope | 任务数 | 设备实例总数 | 平均设备数 | 最大设备数 |
| --- | --- | --- | --- | --- |
| candidate_all | 5897 | 14683 | 2.4899 | 4 |
| proposed_release | 5894 | 14677 | 2.4902 | 4 |
| supported_cross_device | 5614 | 14397 | 2.5645 | 4 |

- candidate_all：statistics/scope_manifest.json 的当前5,897条，来源为6个编号目录加280条 generated SmartHome。
- proposed_release：条件性排除 android_smarthome_123、124、129，保留280条单Home；对应历史参考5,894。排除建议未写入任何已有manifest。
- supported_cross_device：现有静态证据与上一轮轻量复核支持的5,614条。前5,367为规则证据、247为Codex语义复核；不等同逐条执行验证，也不声称全部声明设备不可替代。
- 对照当前目录清单，无新增/丢失文件；无重复ID或同路径重复。完整对账、精确重复指令及内容组见scope_record.json。不同ID不因文本相似合并。

## 范围来源与冲突

源码worktree：/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826。Git branch：codex/core200-runtime-fixes-20260828；HEAD：5d8ee017d8319f0b640b215d435d583c64098ced。当前工作树原本不干净，读取当前文件而非HEAD快照。

README.md:21–45明确主任务目录，但无最终全量manifest；tests/test_task_catalog_release.py:16–32又把320条legacy目录保留为published catalog。core/task_config.py与runner只加载用户传入的--task，不能从入口反推出唯一最终集合。历史迁移表证明1194条历史迁移，其中300条来自real100/200/300；它不是最终发布清单。未把real副本、real20、examples、fake、stage specs、实验日志或生成候选并入本次范围，也未按source_original_id合并现有不同任务。

来源清单SHA-256：6bb118fe668b53cc1b8d9ba5bcf3aeb723192f91cd879c5558f75d2df1e3213e；规范化 task_id TAB task_path LF 有序清单SHA-256：c3edf5b6774cfe9554467c342dbfdf5eb8ce7e05cd27f3f2306c56d1a66ac7f3。每任务当前内容SHA-256见task_inventory.jsonl。按本次用户明确要求记录hash，不修改实验逻辑。

## (a) 配置中的独立设备组合

以下表的分母是proposed_release=5894；三个scope的全部层级和比例均在device_distribution.csv中。Android=Mobile、Linux=Desktop、一个Home=一个IoT环境，不把房间灯/空调数量加入设备实例。

| 环境类型组合 | 任务数 | 占比 |
| --- | --- | --- |
| Desktop | 371 | 6.29% |
| Desktop + IoT | 1010 | 17.14% |
| IoT | 280 | 4.75% |
| Mobile | 372 | 6.31% |
| Mobile + Desktop | 1876 | 31.83% |
| Mobile + Desktop + IoT | 970 | 16.46% |
| Mobile + IoT | 1015 | 17.22% |

| 具体配置 | 任务数 | 占比 |
| --- | --- | --- |
| 1 Desktop + 1 IoT | 680 | 11.54% |
| 1 IoT | 280 | 4.75% |
| 1 Mobile + 1 Desktop | 849 | 14.40% |
| 1 Mobile + 1 Desktop + 1 IoT | 523 | 8.87% |
| 1 Mobile + 1 IoT | 831 | 14.10% |
| 1 Mobile + 2 Desktop | 314 | 5.33% |
| 1 Mobile + 2 Desktop + 1 IoT | 97 | 1.65% |
| 2 Desktop | 371 | 6.29% |
| 2 Desktop + 1 IoT | 330 | 5.60% |
| 2 Mobile | 372 | 6.31% |
| 2 Mobile + 1 Desktop | 502 | 8.52% |
| 2 Mobile + 1 Desktop + 1 IoT | 350 | 5.94% |
| 2 Mobile + 1 IoT | 184 | 3.12% |
| 2 Mobile + 2 Desktop | 211 | 3.58% |

外层配置已对账回对应内层组合。设备数分布含单Home；最大值与平均值不能用IoT端点数替代。原始type及归一化type逐任务保留。没有发现未知type。

## (c) 应用、HTML用途类别与IoT端点

应用总表已同步后续全量核对及用户确认的操作归类 v2，不再使用原100条试标的77条覆盖下界作为当前结果。沿用28个应用分类；指令/配置证据确认的关系与按操作/身份授权补充的归属分别保留。本轮只汇总已保存标注，不重新判断任务、不读取模型结果。

| scope | 任务数 | 有应用归属 | 无应用归属 | 任务—应用关系 |
| --- | --- | --- | --- | --- |
| candidate_all | 5897 | 5617 | 280 | 9917 |
| proposed_release | 5894 | 5614 | 280 | 9911 |
| supported_cross_device | 5614 | 5614 | 0 | 9911 |

5,897条候选中，2,170条归属一个应用、3,447条归属多个应用，280条纯Home不强行归入app。原有6条待定身份已按用户授权归入已有项：5条Gallery归Simple Gallery Pro、1条Contacts归Google Contacts；这不声称已经运行核实具体包名。

下表同时给出当前候选和条件性发布范围；百分比沿用本报告的proposed_release分母5,894。完整三个scope及task IDs见 application_coverage.csv。

| 应用 | 候选5897归属任务数 | 条件5894归属任务数 | 占条件范围比例 |
| --- | --- | --- | --- |
| Tasks.org | 1248 | 1248 | 21.17% |
| Markor | 1119 | 1116 | 18.93% |
| Simple SMS Messenger | 984 | 984 | 16.69% |
| LibreOffice Calc | 958 | 958 | 16.25% |
| Simple Calendar Pro | 780 | 778 | 13.20% |
| Visual Studio Code | 774 | 774 | 13.13% |
| Android Files | 737 | 737 | 12.50% |
| Google Contacts | 680 | 679 | 11.52% |
| Google Clock | 320 | 320 | 5.43% |
| OsmAnd | 266 | 266 | 4.51% |
| Broccoli | 244 | 244 | 4.14% |
| Google Chrome | 226 | 226 | 3.83% |
| Retro Music | 217 | 217 | 3.68% |
| Simple Gallery Pro | 211 | 211 | 3.58% |
| LibreOffice Writer | 202 | 202 | 3.43% |
| gedit | 163 | 163 | 2.77% |
| Mozilla Thunderbird | 143 | 143 | 2.43% |
| GIMP | 133 | 133 | 2.26% |
| Evince / Document Viewer | 113 | 113 | 1.92% |
| Archive Manager (File Roller) | 99 | 99 | 1.68% |
| Audio Recorder | 70 | 70 | 1.19% |
| VLC | 69 | 69 | 1.17% |
| Simple Draw Pro | 66 | 66 | 1.12% |
| LibreOffice Impress | 66 | 66 | 1.12% |
| Mozilla Firefox | 16 | 16 | 0.27% |
| Camera | 8 | 8 | 0.14% |
| GNOME Terminal | 4 | 4 | 0.07% |
| Android Settings | 1 | 1 | 0.02% |

多应用任务可进入多行，同一任务—应用只计一次，各行比例不归一化到100%。代码、Office文档等按用户同意的操作规则归入已有应用，不把文件格式本身新增为应用。该指标是应用归属，不是唯一必需软件或模型实际使用频次；纯IoT仍不计app。

[操作归类规则与逐任务明细](app_full_analysis/operation_attribution_v2/README.md)保存本次补归类依据；[旧严格证据报告](app_full_analysis/README.md)及试标文件保留作历史对照。此前已有明确应用的其他任务保留原关系，本轮未额外推定它们每一个文件的可选打开软件。

### HTML用途类别：不是独立网站实体数

恢复了上一轮全部17类用途映射。实际HTML资源460条（458实体文件+2内联片段），关联417个任务；按精确内容bytes去重后460种，不做标点/模板语义去重。程序化构造页与待编辑HTML产物不当作网站交互；因此网站用途主覆盖关联416个任务，不与417个资源关联任务混用。

| 用途类别 | 任务覆盖数 | 占全量比例 | 相关HTML资源 |
| --- | --- | --- | --- |
| 通用请求审批与审核 | 24 | 0.41% | 32 |
| 食谱与烹饪准备 | 3 | 0.05% | 3 |
| 财务、发票与价格 | 13 | 0.22% | 14 |
| 地点与坐标登记 | 19 | 0.32% | 26 |
| SmartHome 状态与能力盘点 | 7 | 0.12% | 7 |
| SmartHome 计划与工作流 | 57 | 0.97% | 59 |
| 房间设备变更与审批 | 73 | 1.24% | 75 |
| 洗衣、清扫与家电维护 | 28 | 0.48% | 28 |
| 身份、验证码与访问确认 | 13 | 0.22% | 14 |
| 登记、调查与信息采集 | 10 | 0.17% | 10 |
| 服务器与配置运维 | 10 | 0.17% | 11 |
| 物流、库存与配送 | 34 | 0.58% | 39 |
| 营销与图像制作需求 | 11 | 0.19% | 11 |
| 音频、播放与转录 | 17 | 0.29% | 17 |
| 运营、派工与资料交接 | 42 | 0.71% | 56 |
| 软件研发、发布与 QA | 32 | 0.54% | 33 |
| 日程、预约与值班 | 25 | 0.42% | 25 |

html_resource_audit.jsonl保留资源路径、内容哈希和关联ID；website_coverage.csv保留全部17类、task IDs及资源数。资源关联表与实际网站交互是不同口径。独立网站产品数量仍unknown；不能写成460个网站或28+17个应用实体。

### IoT端点

iot_coverage.csv将configured_only_not_usage与confirmed_interaction_lower_bound分开。前者只反映初始化存在的类型；后者为试标中明确交互对象，仍不完整，不能将配置出现当任务使用。缺失而被请求的设备不是已存在交互实例，未知类型需求保留待核实，不计入应用数。

## (b) 任务特征：100条试标，非完整分布

试标覆盖14种设备配置、48个来源标签，seed=20260909；算法与完整ID在pilot_sample.json。选择为覆盖多样性而非按比例抽样，不向全库外推。标注者为Codex，不是人工标注。

proposed_release中检查100条，其中12条七个标签均已判定；其余试标保留部分unknown。另5794条尚未语义判断。task_characteristics.jsonl为每个task保存positive/negative/unknown/not_reviewed和来源。

| 特征 | 确认包含 | 确认不含 | unknown | 尚未检查 | 已确认全量覆盖 |
| --- | --- | --- | --- | --- | --- |
| direct_information_transfer | 45 | 6 | 49 | 5794 | 0.76% |
| information_extraction_transformation | 90 | 4 | 6 | 5794 | 1.53% |
| multi_source_integration | 77 | 17 | 6 | 5794 | 1.31% |
| conditional_constraints | 65 | 14 | 21 | 5794 | 1.10% |
| synchronization_consistency | 11 | 18 | 71 | 5794 | 0.19% |
| verification_correction_conflict | 26 | 17 | 57 | 5794 | 0.44% |
| device_control_scheduling | 33 | 59 | 8 | 5794 | 0.56% |

每任务确认标签数及尚未判断数量在task_feature_counts.jsonl；characteristic_cooccurrence.csv是共同确认positive的下界，并列双方均有确定判断的数量。未审任务的positive=0表示尚无确认，不表示实际零特征。

F1/F2会因“原样字段转入新表示”重叠，F3/F4会因“多来源政策决定动作”重叠；这些是真实现象，不调整事实来压低共现。设备控制/调度较易说明；模板是否构成第二来源、查找是否构成条件判断需严格边界。100条试标不足以判断哪类几乎覆盖全库。

**建议图(b)暂不采用主文；试标规则和边界可入附录。** (a)在最终范围确认后可用于主文；(c)可按已确认的“应用归属”口径准备图，不能标成实际使用频次。17类HTML用途不变。应用统计更新不代表任务特征或IoT使用统计也完成了全量标注。

## 已有标签与当前内容

| metadata字段 | 当前覆盖候选任务数 | 不同原始值数量 |
| --- | --- | --- |
| category | 5617 | 34 |
| topology_view | 1846 | 3 |
| difficulty | 670 | 4 |
| motif | 175 | 8 |
| surfaces | 5606 | 469 |
| visible_sources | 937 | 2 |
| native_content_outputs | 3662 | 10 |
| device_topology | 4623 | 14 |
| source_origin_kind | 1051 | 17 |
| source_origin_label | 1050 | 76 |
| capability_tags | 145 | 8 |
| sh_type | 280 | 6 |
| case | 280 | 2 |

metadata_fields.json保存完整原标签与关联任务。task_pattern/task_family等没有作为统一顶层字段出现；motif M1–M8共175条，未恢复可直接适用全库的统一字典；capability_tags共145条，混合平台、模态、负例和工作流，其中information_transfer在145条中全有，不自动映射为F1。sh_type共280条，SH1–SH6是构造类型，不代表当前分支真的控制设备。difficulty含Simple/Medium/Complex/Hard混合，不归并到本次特征。

发现明确需要另行确认的边界：sh2_implicit_intent_bedroom_airflow_infeasible_0009指令要求空气流动，初始AC有fan模式，evaluator却要求缺失bedroom_fan_1。相关标签unknown，详见review_queue；未读模型结果、未改任务、未改判。试标sh1_state_inquiry_kitchen_air_quality_feasible_0023仅读PM2.5，七类不适用，区别于unknown。

## 历史数字对照

| 历史参考 | 本轮 | 解释 |
| --- | --- | --- |
| 总数5,894 | candidate=5,897；proposed=5,894 | 3条排除仅为条件，需确认最终清单 |
| 跨设备5,614 | 证据支持5,614 | 继承清洗证据且核对当前instruction/devices，非本轮全量有效性复审 |
| 单Home280 | 280 | 一个独立Home环境，未加入IoT端点 |
| 应用25 / 网站17类 | 28个应用分类 / 17用途类别 | 应用归属已同步v2；候选5617条有app，条件范围5614条有app；不是45个独立应用网站 |
| HTML460 / 417任务 | 460 / 417 | 精确内容去重460；网站交互覆盖与资源关联另列 |

## 文件、命令与复现

- README.md：本报告；scope_record.json：来源/范围/commit/清单hash/重复与差异。
- task_inventory.jsonl：原始清单/试标快照，scope明确三个统计范围，设备/网站/IoT统计仍使用它；其中旧应用字段不代表最新应用归属。
- device_distribution.csv：内层类型、外层配置与设备数量分布；scope/count/denominator/percentage齐全。百分比用0–100。
- application_coverage.csv / website_coverage.csv / iot_coverage.csv：完整列表，非Top-N；task IDs不截断。
- task_characteristics.jsonl / characteristic_distribution.csv / characteristic_cooccurrence.csv / task_feature_counts.jsonl：标签与共现。
- annotation_rules.md / pilot_annotations.jsonl / pilot_application_annotations.jsonl / pilot_sample.json：固定试标定义、特征和应用决定、抽样。
- review_queue.csv/jsonl：历史初筛/试标队列，不是待删除任务表。其中应用配对及task_inventory中的application_discovery_status保留为旧流程记录，不能再当作当前应用待审队列；当前应用依据见app_full_analysis/operation_attribution_v2。特征unknown/未审状态不变。
- protected_files_before.json / preservation_check.json：本次用户要求的原任务/资源/配置及实现内容前后核对。出现变化时先报告，不改回他人文件。
- 本轮前后核对33,433个原始任务、资源、配置及实现文件，内容变化0；CSV额外回读检查见csv_validation.json。

正常重算只读取已保存清单和标注，不重新判断语义：

~~~bash
cd /Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826
/Users/lht/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node analysis/benchmark_overview_20260909/summarize.mjs
~~~

collect.mjs为一次性只读来源快照（检测已存在快照时拒绝覆盖）；select_pilot.mjs为显式试标选择，不应在已有决定后任意重选；annotate_static.mjs显式应用已记录的直接名称规则与固定pilot决定，仅写本目录。普通聚合不调用它们。

CSV按Spreadsheets技能使用artifact-tool矩形值表生成并逐值对照，未创建多余XLSX或正式图。本轮仅更新应用汇总，没有启动设备、任务生成器或模型实验；原任务、实验配置与其他统计未修改。上传状态见pear目录的PUBLICATION.md。

### 需要确认/尚未完成

1. 提供或确认最终发布清单（是否为现有候选减3条且含280单Home）。当前final_release_membership全为unknown，不伪造正式任务名单。
2. 本轮应用归属口径已按用户确认完成并接入总表；若论文要声明唯一必需应用或实际运行使用频次，仍需另行证据，不能从归属推断。IoT任务使用仍只有部分确认。
3. 完整特征语义标注尚未完成，不把100条试标比例外推。若要正式图(b)，需补充其余标签和独立review。
4. 单独确认airflow任务可见语义与evaluator边界；本轮不做修复或实验重跑。
