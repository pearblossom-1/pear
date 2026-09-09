# DevicesWorld 应用归属统计（操作归类口径 v2）

按用户确认的新口径，将原有 6 条身份待定任务和 1,388 条未限定具体软件的非纯 Home 任务归入已有应用项。一个任务可对应多个应用，同一任务多次或跨设备使用同一应用仅计一次。保留原证据口径，不修改任务文件、实验集合或历史结果。

这是一层应用归属统计，不是“任务只能使用该软件”或“模型实际使用了该软件”的运行结论。此前已经有明确应用的其他任务保留原关系，本轮不额外推定其中每一个文件的可选打开软件。

## 汇总

| 范围 | 任务数 | 旧口径有已确认应用 | 新口径有应用归属 | 无应用 | 任务—应用关系 |
| --- | --- | --- | --- | --- | --- |
| candidate_all_provisional | 5897 | 4225 | 5617 | 280 | 9917 |
| proposed_release_conditional | 5894 | 4222 | 5614 | 280 | 9911 |

沿用 28 个应用分类，不新增应用。候选任务总数仍为 5897；5894 仅是既有三条排除建议生效后的条件性范围，未宣称最终发布规模已确定。

旧口径有 4,223 条 complete 且有应用，另有 2 条 partial 已确认部分应用，故旧覆盖总数为 4225。其余 4 条 partial 加上 1,388 条非纯 Home 无应用任务是新增覆盖对象。

新增 2466 个任务—应用关系。280 条纯 Home 任务继续只作为 IoT，不强行归入 app。

## 多标签分布

| 每任务应用数 | 旧证据口径任务数 | 新归属口径任务数 |
| --- | --- | --- |
| 0 | 1672 | 280 |
| 1 | 1672 | 2170 |
| 2 | 1941 | 2680 |
| 3 | 555 | 688 |
| 4 | 53 | 72 |
| 5 | 4 | 7 |

各应用覆盖率均以本范围全部任务为分母，主范围百分比之和为 168.17%，不归一化为100%。

## 完整应用表

| 应用 | 旧确认任务数 | 本轮新增归属 | 新任务数 | 覆盖率 |
| --- | --- | --- | --- | --- |
| Tasks.org | 1246 | 2 | 1248 | 21.16% |
| Markor | 1119 | 0 | 1119 | 18.98% |
| Simple SMS Messenger | 984 | 0 | 984 | 16.69% |
| LibreOffice Calc | 80 | 878 | 958 | 16.25% |
| Simple Calendar Pro | 780 | 0 | 780 | 13.23% |
| Visual Studio Code | 52 | 722 | 774 | 13.13% |
| Android Files | 625 | 112 | 737 | 12.50% |
| Google Contacts | 679 | 1 | 680 | 11.53% |
| Google Clock | 319 | 1 | 320 | 5.43% |
| OsmAnd | 265 | 1 | 266 | 4.51% |
| Broccoli | 244 | 0 | 244 | 4.14% |
| Google Chrome | 107 | 119 | 226 | 3.83% |
| Retro Music | 217 | 0 | 217 | 3.68% |
| Simple Gallery Pro | 206 | 5 | 211 | 3.58% |
| LibreOffice Writer | 53 | 149 | 202 | 3.43% |
| gedit | 2 | 161 | 163 | 2.76% |
| Mozilla Thunderbird | 138 | 5 | 143 | 2.42% |
| GIMP | 39 | 94 | 133 | 2.26% |
| Evince / Document Viewer | 19 | 94 | 113 | 1.92% |
| Archive Manager (File Roller) | 8 | 91 | 99 | 1.68% |
| Audio Recorder | 68 | 2 | 70 | 1.19% |
| VLC | 67 | 2 | 69 | 1.17% |
| Simple Draw Pro | 65 | 1 | 66 | 1.12% |
| LibreOffice Impress | 43 | 23 | 66 | 1.12% |
| Mozilla Firefox | 16 | 0 | 16 | 0.27% |
| Camera | 8 | 0 | 8 | 0.14% |
| GNOME Terminal | 1 | 3 | 4 | 0.07% |
| Android Settings | 1 | 0 | 1 | 0.02% |

## 归类规则与边界

- 代码/项目修改归 VS Code。JSON、配置、Markdown 等结构化或技术文本归 VS Code；普通 TXT 阅读/编辑归 gedit。程序自身的测试夹具、日志不自动额外计 Calc 或 gedit。
- 表格内容处理归 LibreOffice Calc；Word/ODT 内容处理归 LibreOffice Writer；演示文稿归 LibreOffice Impress。PDF 来源阅读归 Evince，单纯从 Office 导出 PDF 不额外计 PDF 阅读器。
- Linux 图像阅读/编辑按已有 GIMP 归属。浏览网页/提交表单归 Chrome；仅生成 HTML 或读取浏览器导出文件，不自动算浏览器。归档内容操作归 File Roller。
- Android 文件访问归 Android Files。它不是 Linux 文件管理器，不把平台混淆。纯 Linux 文件/命令操作可按已有 GNOME Terminal 的功能归属。
- 五条 Gallery 按用户确认归 Simple Gallery Pro；android_smarthome_1013 的 Contacts 归已有 Google Contacts 统计项。这是用户授权身份归属，不冒称已通过运行核实具体包名。该任务原有 Calendar 关系保留。
- 指令指名的对象/操作与直接关联来源支持本轮规则；未引用的 setup 文件、安装列表和 evaluator 关键词不直接增加应用。补归类是静态规则及具体任务复核，不是重新逐条执行验证。

## 六条原待定任务

| 任务 | 归属后应用 |
| --- | --- |
| linux_android_861 | Android Files、GIMP、Simple Gallery Pro、Visual Studio Code |
| linux_android_862 | GIMP、LibreOffice Calc、Simple Gallery Pro |
| linux_android_951 | Android Files、LibreOffice Calc、Simple Gallery Pro、Visual Studio Code |
| linux_android_960 | Android Files、LibreOffice Calc、OsmAnd、Simple Gallery Pro、Visual Studio Code |
| linux_android_972 | LibreOffice Calc、Simple Gallery Pro、Visual Studio Code |
| android_smarthome_1013 | Google Contacts、Simple Calendar Pro |

## 文件

- application_coverage.csv：全部 28 个应用在两种范围下的旧计数、新增归属、新计数、覆盖率及完整 task IDs。
- task_application_mapping.csv：全部 5,897 条任务的旧应用、补充应用、合并应用列表和原因。
- task_application_attribution.jsonl：逐任务保存归属依据、证据和原标注引用，未覆盖旧证据文件。
- summary.json：两范围及多标签分布。复现：使用原分析环境的 Node 运行上一级 attribute_operations.mjs。

设备、网站/HTML 与任务范围统计均沿用原结果，未修改。CSV 使用 Spreadsheets 技能的 artifact-tool 生成并回读核对。未自动提交或上传。
