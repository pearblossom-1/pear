# DevicesWorld 计数审计（范围待确认的初步版）

日期：2026-09-08。依据 `docs/plan1/devicesworld_counting_protocol_for_codex.md`。

**本报告尚不是 6,140 条最终发布集的完成统计，不能直接把初筛数填进论文比较表。** 当前有两项未完成：最终全量发布范围未确认；部分设备关系与匿名 HTML 的应用身份尚待语义审阅。以下数值仅对应本报告附带的候选范围。

## 1. 当前结果

| 指标 | 当前数值 | 口径与限制 |
|---|---|---|
| 候选任务规格 | 5897 | 6 类编号目录 + generated SmartHome；不是声称最终发布集 |
| 明确命名且有使用证据的应用 | 25 | 按产品/组件去重；包含 3 个 LibreOffice 应用组件；不含 OS 类别 |
| 已经完成独立身份确认的网站 | 0 | 表示目前没有确认项，不表示 benchmark 实际没有网站 |
| HTML 功能标签类型 | 4 | 补充描述，不与应用数量相加 |
| 匿名交互 HTML 待归并组 | 140 | 以任务页面组建待审队列；不是已经去重的网站实体数 |
| 静态证据规则支持跨设备 | 5367 | 初筛；不是逐条人工审阅完成后的正式总量 |
| 确认非跨设备 | 283 | 280 个单 Home + 3 个 Home 仅保留不变的手机任务 |
| 自动证据不足、待核对 | 247 | 包括别名设备、源文件内隐含指令、关系用语未覆盖；不代表任务设计有问题 |

对账：5367 + 283 + 247 = 5897。

初筛跨设备占候选范围 91.01%；此比例不能作为最终 benchmark 跨设备比例。另有 467 条已支持至少两设备参与、但尚未确定全部声明设备作用的任务，不能据此宣称已完成精确 required-topology 审计。

## 2. 范围与版本

工作树：`/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826`。HEAD：`5d8ee017d8319f0b640b215d435d583c64098ced`。

读取的是当前工作树文件，包括原先未提交的修改；没有把 HEAD 当作所有任务当前内容的不可变快照。本轮不新增 hash、不改写任务、不启动设备、不读取模型执行结果。

| 候选目录 | 任务数 |
|---|---|
| android_only | 372 |
| linux_only | 371 |
| linux_android | 1876 |
| android_smarthome | 1018 |
| linux_smarthome | 1010 |
| linux_android_smarthome | 970 |
| generated | 280 |

仓库 `tasks/` 中带 instruction + devices 的规格共 6240 个：候选 5897 个、legacy real20/100/200/300 共 320 个、示例/自检/fake 等 23 个。直接计所有 JSON 会额外混入方案、manifest 等非任务文件。

历史 `topology_views_manifest.json` 记录 real100/200/300 的 300 条复制迁移，不能把这些原目录再整体加到编号目录上。real20 的 20 条虽然被发布测试保留，但是否仍属于最终发布范围未有全量 manifest 证明，因此列为范围待定而未悄悄加入。

协议预期 6,140 条，与候选范围相差 243 条；原始含副本/示例的 6,240 也不是 6,140。不能推断“缺失了 243 条任务”，必须先指定最终 release manifest 或等价目录清单。完整目录计数和历史迁移记录见 `scope_evidence.json`。

编号任务按唯一 task ID 保留，不按 source_original_id 盲目合并。例如 android_only_037 与 _062 共享历史生成来源，但当前指令/交付不同；来源相同不等于重复发布副本。

## 3. 应用 / 网站口径

| 平台 | 已确认应用 |
|---|---|
| Android | Markor、Simple Calendar Pro、Simple SMS Messenger、Google Contacts、Tasks.org、Google Clock、OsmAnd、Simple Gallery Pro、Retro Music、Broccoli、Audio Recorder、Simple Draw Pro、Android Files、Camera |
| Linux / 跨平台 | Google Chrome、Mozilla Firefox、LibreOffice Calc、LibreOffice Writer、LibreOffice Impress、Visual Studio Code、GIMP、VLC、Mozilla Thunderbird、Evince / Document Viewer、Archive Manager (File Roller) |

同一应用在两台设备、不同账号、版本和任务数据中只计一次。Chrome 的跨平台身份归并为同一产品；Chromium 不是 Chrome，只因备用启动命令出现而不纳入。LibreOffice Calc、Writer、Impress 是三个有独立任务界面的应用组件；若论文改用“软件套件”口径，此处应用数应减 2，不能混用。

未把 CSV/PDF/JSON/HTML 等格式当应用。通用 shell/Python/文件管理操作归为一个 OS-operations 类别，主统计排除；若另计 OS 类别，应清楚写为应用数 + 1。

Linux 通用 Text Editor 的 setup 为 gedit / xed / mousepad 回退选择，当前不凭可能安装项增加三个应用。SmartHome 的环境 API 与 IoT 端点不计为独立应用产品；仅在输出中构造 Google Maps 链接的任务也不意味着使用过 Google Maps 网站。

HTML 发现数、部署/使用证据与功能必须分开：发现 461 条资源记录（459 文件 + 2 内联 setup 片段），排除 linux_only_249 的未部署旧 form.html 后，当前纳入 460 条。

| 源码可见功能标签 | 资源记录数（可多标签） |
|---|---|
| information_display | 460 |
| form_entry | 130 |
| submit_confirm_handler | 67 |
| download_export | 6 |

information_display 为资料展示；form_entry 为可输入表单控件；submit_confirm_handler 为可见提交/确认事件处理；download_export 为下载链接/导出实现。仅有 `<form>` 或“Submit”按钮不证明后端可用。未运行网页，不把这些静态功能线索宣称为真实提交验证。

140 个交互页面组目前只是待审分组，不能写作“140 个网站”；随机标题、端口、文件名也不是网站身份。320 个静态资料资源暂列 task-specific HTML assets。未完成跨任务应用家族归并，因此实际网站实体数仍为待定。

## 4. 跨设备的实际判定与例外

静态规则保留：instruction 中的设备指称、与 setup 绑定的源路径/记录名、明确的输出路径及其目标设备、同一目标的信息使用关系。只有安装、reset、后台工具或 evaluator 存在，不单独产生必需设备。规则不能覆盖所有自然语言关系，因此有明确的待审队列，而不是把所有声明设备直接计数。

人工复核的反例：

- android_smarthome_123：保护规则、冲突 Calendar 日程、Markor 报告都在 android_0；Home 只保持不变。
- android_smarthome_124：联系人 90%、夜间规则 25%、访问时间 19:20 与报告都在 android_0；固定冲突不需要 Home 读取或操作。
- android_smarthome_129：同一 Markor 来源明确要求同时开/关灯，任务要求报告冲突且不执行；Home 不构成第二个必需环境。
- linux_only_046：顶层 instruction 只提第一台 Linux，但它指定的 run_report.md 明确要求读取第二台 Linux 的 J-304 日志，再回第一台写报告，因此是跨设备。

原始指令、来源与判定理由见 `review_decisions.json`。这些只是统计裁决，没有修改原任务或 evaluator。

### 声明拓扑（不是最终 required topology）

| 拓扑 | 任务数 |
|---|---|
| 2A | 372 |
| 2L | 371 |
| 2A+2L | 211 |
| 2A+1L | 502 |
| 1A+2L | 314 |
| 1A+1L | 849 |
| 1A+1H | 834 |
| 2A+1H | 184 |
| 1L+1H | 680 |
| 2L+1H | 330 |
| 1A+1L+1H | 523 |
| 2A+1L+1H | 350 |
| 1A+2L+1H | 97 |
| 1H | 280 |

A=Android 实例，L=Linux 实例，H=一个 SmartHome 环境。2A、2L 属于同类设备；A/L/H 混合为异类。完整必需设备尚未核定时，不把声明的混合拓扑强行当作最终实际拓扑。

## 5. 待完成项目与论文填表建议

1. 指定最终发布 manifest/分支与目录范围，解决 6,140、6,240 原始规格与 5,897 候选范围的差异。
2. 复核 task_device_audit.jsonl 中 verdict=unresolved 的任务，以及 required_devices_complete=false 的任务。pending_device_review.md 列出了完整队列与原始指令。
3. 审阅 html_inventory.csv 的匿名交互组，结合页面/生成器/状态逻辑判断独立应用身份并跨任务归并。现有 140 是审阅组数，最终网站候选实体数尚不能确定。
4. 完成静态判定规则支持项的语义复核，尤其 Home 只保留不变、设备角色别名和共享资料中的额外要求；不能把初筛证据当成逐任务人工确认。

**现阶段比较表：#Apps / websites 写“待最终范围确认（已确认 25 个应用实体；网站待审）”；Cross-device 写“待完整审计”。不要填 6,140、5,617 或当前初筛数为最终值。**

可用表注草案：“Apps/websites counts canonical application and website entities; task-specific HTML assets and OS operations are excluded. Cross-device requires actual participation of at least two independent device environments; a SmartHome environment counts as one.”

## 6. 输出与复现

- app_website_inventory.csv：应用实体证据、排除项与待确认页面组；counted=true 才进入应用主计数。
- html_inventory.csv：所有发现资源、功能线索、应用身份待定项和未部署资源排除。
- task_device_audit.jsonl：逐任务指令、声明/必需设备、来源指针、规则或人工判断。
- summary_data.json、scope_manifest.json、scope_evidence.json：可机读汇总与范围依据。
- review_decisions.json：基于指令与真实初始化材料的人工统计裁决；不依据模型表现。

```bash
cd /Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826
python3 statistics/count_benchmark.py
node statistics/export_inventories.mjs
# 确认全量清单后：python3 statistics/count_benchmark.py --manifest /absolute/final_manifest.json
```

manifest 支持 task_path 对象列表、路径列表或带 tasks 字段的对象；所有相对路径以工作树为根。CSV 导出使用已配置的 artifact-tool；其他环境可设置 ARTIFACT_TOOL_MODULE 到其安装模块。所有写入限制在 statistics。

本轮检查用于发现任务重复/数量对账缺口、未使用资源误计、CSV 序列化丢失；若失败，修正统计脚本/记录，不修改任务以凑数。
