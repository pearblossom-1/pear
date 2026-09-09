# Task characteristics v1 (2026-09-09)

这是探索性“任务特征覆盖”，不是正式 task-family、业务领域或互斥任务分类。标注者为 Codex，不称为人工标注；不使用模型表现、轨迹或额外收费 API。

## 范围与状态

尚未找到最终发布 manifest。当前按 candidate_all（5,897）、proposed_release（条件性排除3条，5,894）和 supported_cross_device（既有证据支持，5,614）分别统计，不能把后两者宣称已生效发布清单。100条试标为14种配置每种先4条，再补来源多样性，seed=20260909、xorshift32，具体选择算法及顺序见 select_pilot.mjs / pilot_sample.json。不是比例样本，不能向全库外推。

每个标签四种状态：positive（确认包含）、negative（检查后确认定义不适用）、unknown（已读指令但直接资源/初始状态/边界尚不足）、not_reviewed（尚未判断）。同一任务可有多个特征；unknown 不算 negative。task_characteristics.jsonl 覆盖整个候选清单，只有100条做本轮 Codex 语义试标，其余保留 not_reviewed，不凭旧 family 自动扩散标签。正向判断仅采用明确足以支持的当前要求；未全文阅读的外部材料可能带来更多标签，不能声称已排除全部其他特征。

## 标签定义及边界

| code | 定义与纳入条件 | 排除条件 | 实例 |
|---|---|---|---|
| direct_information_transfer | 指定来源的具体值、完整字段或真实文件需原样用于另一独立环境 | 只因跨设备、只传自己算出的新答案、同一Home内部 | linux_android_146：文件时间/标签转手机alarm |
| information_extraction_transformation | 筛选、计算、字段映射、摘要、重组或格式表达转换 | 单纯读一个状态值；只复制整个固定列表 | android_only_033：日历时间减30分钟 |
| multi_source_integration | 联合多个不可缺少的事实或规则来源 | 多设备、多输出、只提供版式的空模板均不足以成立 | linux_android_035：供应商短信、发票与付款记录 |
| conditional_constraints | 根据可见规则、实时状态或许可决定允许操作/结果 | 固定文件名/输出格式；精确ID普通查找；普通完成回执 | linux_smarthome_764：风险最高且允许修复 |
| synchronization_consistency | 明确要求源/目标或多个结果之间保持指定一致关系 | 多输出、普通转抄、新建单个派生产物本身 | android_only_036：跨手机日历各字段同步 |
| verification_correction_conflict | 比较来源/既有状态，识别或修正冲突、不一致、缺失、重复，或明确验收gate | 普通完成后自检；仅按ID联查来源 | android_only_004：逐项检查文件present/missing |
| device_control_scheduling | 实际修改设备控制状态、创建/更新/取消Home计划或真实alarm/Calendar时间安排 | 仅文件里写计划、普通Tasks due字段、只读设备、因设备不存在而拒绝 | linux_android_smarthome_945：取消旧计划并建新计划 |

两个澄清：原样字段转入新表示可同时有 direct transfer 与 extraction；只提供格式的模板不自动算第二信息源。保留真实重叠，不为了减少重叠改标签。没有将7类合并成互斥体系。

单Home不可执行分支以当前可见能力为准，不按 case=infeasible 自动判负；若任务和evaluator边界不一致，相关标签unknown。sh2_implicit_intent_bedroom_airflow_infeasible_0009 是具体例子：instruction未指定standalone fan，但初始空调存在fan模式，evaluator要求 missing bedroom_fan_1。只记录冲突，未改任务/评估。

试标 sh1_state_inquiry_kitchen_air_quality_feasible_0023 只读一个PM2.5值，七类均不适用；这不是低质量任务，也不同于证据不足。

## 应用与网站统计规则

- 先恢复原25应用实体及runtime alias，不因为类似功能合并产品；Calc/Writer/Impress按独立组件计。
- 应用主覆盖只采用100条试标中Codex确认的指定读取/操作对象，决定保存在pilot_application_annotations.jsonl；count是已确认下界，不是全量实际使用精确频次。未确认的应用配对保留unknown/未审，空列表也不代表不用应用。
- 全量名称筛查单列为application_named_rule_candidates和CSV中的rule_supported_named_reference_count，不进入语义确认的主count。该辅助规则核对旧引用并扫描当前instruction中的已知实体与别名，过滤路径、Camera album、格式名称和明确替代工具。Android通用名称需setup绑定具体产品；PDF阅读器/Archive Manager通过实际打开命令绑定Evince/File Roller。setup本身不产生使用结论，名称命中也不证明复杂分支中必须使用该应用。
- 保存当前instruction摘录、旧引用、setup身份绑定与判定来源。外部来源、产品不明、尚未语义审查的名称候选不能当作已确定使用，也不能当作不存在。未开展全库应用语义穷尽复核。
- Browser是应用；HTML用途类别单列，可与Browser在同一task重叠。网站类别沿用上一轮已逐项复核17类，不把HTML数量当网站实体数量。
- 网页用途主覆盖仅计阅读、交互或下载用途；程序化HTML构造器和待编辑HTML产物不自动当网站使用。每类按task_id去重。真实独立网站数量仍unknown。
- IoT端点类型从实际交互要求单列，不并入应用数。全量初始化类型仅作为configured inventory辅助视图，不能替代required-interaction覆盖。

## 已有metadata的使用

metadata_fields.json完整保存实际字段、标签与task IDs。motif只出现M1—M8编码，未定位足以无歧义恢复全部含义的统一字典，因此不强制映射。capability_tags混合平台能力、模态、工作流和负例处理；information_transfer在145个带标签任务中全部出现，不能当全部最终任务的direct transfer结论。sh_type有可定位的生成实现，但示例说明type意图与当前可执行分支并不相同，必须结合当前内容。category混合来源、平台、场景；device_topology有字符串、device ID列表及对象等多种表示，不用于覆盖devices实测配置。

## 本轮采用建议

(a) 设备配置可用于主文，前提是确认最终清单范围；声明配置不证明所有设备均必需。
(c) 完整HTML用途表可作覆盖说明；应用主count仅为试标中的语义确认下界，全量名称筛查另列，不能画成完整实际使用频次图。
(b) 暂不采用主文分布图。100条试标与未审范围必须分开；F1/F2与F3/F4有真实重叠，控制/调度较易界定，模板与多源、lookup与条件判断边界易混淆。共现仅报告已确认下界，不把小样本比例当精确全库比例。
