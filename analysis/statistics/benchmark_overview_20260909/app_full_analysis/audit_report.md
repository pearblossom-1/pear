# 抽检范围与系统性修正记录

本记录由 Codex 编写，不是人工标注报告，也不是逐条设备执行验证。

## 本轮检查对象

全量解析 5,897 条实际任务的 instruction、setup 应用别名/启动命令、原生应用记录、上传资源路径及可提取的来源文字。每条生成一条标注，不以“有一个应用已确认”代表任务全部应用已确认。旧 100 条试标只在内容版本一致、且不与当前指令冲突时保留阳性关系。

另外逐条查看了进入疑点队列的指令和直接相关来源；其中 174 条保存了具体 Codex 决定，见 semantic_decisions.mjs。未涉及这些具体决定的记录使用有任务对象和实例身份支持的确定性规则，不称全部人工或逐条模型语义标注。

抽检包括以下几组，完整 ID 及当前结果由 audit_sample.json 保存：

- 自动确认：直接命名应用、功能名结合配置、原生记录关联；覆盖双Android、双Linux、Mobile/Desktop/IoT混合任务。另核对全部19条通用“PDF reader”→Evince映射，都有真实Evince配置绑定。
- Codex具体核对：命名请求/联系人角色/时间锚点/短信来源、真实分支、被保护但不需操作的应用、文档中的应用要求。
- 无具体应用：按6种存在零应用结果的环境组合，取组内有序列表首条、约1/3、约2/3和末条，共24条；其中混合环境样本暴露漏计，随后全量修正规则并重算，没有把该样本的原始零应用结论机械保留。
- 争议：5条Gallery绑定缺失和1条Contacts身份冲突均保留partial。
- 配置但不使用：全部9条包含xfce4-terminal、Thunar或Nautilus后台启动的任务单独核对；不因启动命令就增加3种应用。

## 发现的问题与全范围修正

| 模式 | 实际证据例 | 处理范围与最终口径 |
| --- | --- | --- |
| 信息来源未写产品名 | linux_android_740 的 Alex Team Sync 请求来自原生SMS；742的“mobile address book”来自联系人 | 对所有原生短信、联系人、事件、Tasks等记录检查实例字段与指令的关联；未关联记录先列疑点，再查看，不直接按helper计应用 |
| 只有笔记文件名或业务描述 | linux_android_1022 的 West Annex observation 实为 Markor 文件；android_smarthome_968 的 restore-only rule 位于 Markor | 全量检查确切被引用文件名与Markor所属路径，语义描述不直接匹配文件名的情况逐条读内容；新增的是必需来源，不是任意Markdown文件 |
| 应用指示藏在原生记录/文档 | android_only_176 的 Tasks 记录要求 Simple Draw Pro；linux_android_622 的 Thunderbird 正文要求Contacts和Retro；1455 PDF要求两条未完成行动项 | 上传文本、PDF、ODF/OOXML、ZIP内说明、原生记录文字、静态heredoc/printf来源都进入遗漏检查；没有执行任何嵌入命令 |
| 发送动作没有SMS字样 | 1003发送各行confirmation body；949“text the response”；Home任务“notify duty contact” | 全量关联明确发送/通知动作与已配置的手机短信渠道。排除mail/Thunderbird场景、仅保护状态及禁止发送分支；短信名词不当成发送动词 |
| 句法漏项与跨句误连 | “draft selects/identifies”“note describes”“reconcile”“submit”“Task”单数 | 扩展源/动作表达，并按句/分号隔开保护条件。每次规则修正均重处理全量实例，不只补样例 |
| Camera相册不等于拍摄应用 | android_only_014只要求任意合法JPEG放入Camera文件夹；linux_android_615使用既有证据截图 | 全量Camera候选要求真正的capture/take/record语义；既有相册、文件名和照片不直接计Camera |
| 产品词只是文件/格式标签 | linux_only_233的Writer report是上传ODT；245的GIMP export manifest是CSV/PNG；357的Task ID是表头 | 不将ODT/PNG/CSV及表头当应用；只有实际要求应用读/写才确认。Linux代码任务不会自动计VS Code/Terminal |
| 禁止操作与只读来源要分开 | android_only_301缺失收藏点，不能建Calendar；307必须先在Calendar确认事件缺失；linux_android_1072须读tentative event但不能创建确认事件 | 按实际指令及选中来源分支判断。不能一概排除所有出现“do not”的应用，也不能把禁止创建当输出证据 |
| “保持不变”并非实际参与 | 1034缺坐标，只保护OsmAnd；1057短缺来源为Tasks和CSV，Broccoli配方仅不许修改 | 读取真实应用状态有必要才计来源；纯guard排除；不额外添加核验动作证明使用 |
| 软件启动≠任务必须用该软件 | linux_android_410/496/499 的终端，414/481 的Thunar，585/587/589/593 的Nautilus | 任务要求脚本/文件操作，不要求这些具体产品，因此不计；Android Settings、gedit、GNOME Terminal的正例另有明确操作要求及绑定 |

## 无具体应用的边界

纯Home任务不使用本轮具体桌面/手机应用，但仍进入分母。仅要求操作通用文件、生成PDF/CSV/HTML或执行脚本，且没有指定具体软件的任务，可以complete且无具体应用；任务恰好预装某个文件管理器不改变这一结论。相反，确切应用中的业务记录作为必需来源时，即使无需修改也计应用。

无应用抽检中 linux_only_001、138、250、371 及 linux_smarthome_001、315、647、999 未发现必须计入某具体软件的依据；Markor来源缺失及1455行动项、949短信通知已修正。不是删除困难样本或减少分母。

## 尚未确定

linux_android_861、862、951、960、972要求Gallery，但具体产品的唯一绑定不足；android_smarthome_1013的Contacts与“simple contacts pro”配置冲突。未知不等于不存在或任务失败，不强行映射到旧实体。详细字段与证据见 unresolved_cases.csv。

两份PDF提取失败：linux_only_007 的 gamma.pdf用于按文件名/清单处理，linux_only_231 的 report.pdf是空输出种子。应用判定不依赖这两份文件的内部应用指示，因此没有把它们误报为身份缺失或执行bug。全量媒体没有做OCR/转录或图像内容有效性审查；本工作只核对应用参与。

## 输出验证的用途

聚合检查检测漏任务、重复任务—应用关系、错分母、CSV截断、设备层级不对账等具体失败；若出现则停止生成汇总并修正统计脚本，不改任务。source_preservation_check.json检测本轮是否改变原任务/资源/运行配置；若出现变化则报告，不覆盖他人的修改。

实际结果：每个任务恰好一条标注；状态数对账；应用计数从阳性关系重算；两种范围的设备统计与旧JSONL及旧CSV一致；4份CSV经电子表格库生成并回读逐值一致。未把HTML、网页类别、文件格式、IoT端点或仅启动的工具加入具体应用列表。未使用模型成败决定标注。
