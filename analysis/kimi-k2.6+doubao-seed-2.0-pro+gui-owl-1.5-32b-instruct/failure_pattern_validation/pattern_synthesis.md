# DevicesWorld：三 baseline 失败模式补充核查（v3）

本机组：Kimi K2.6、Doubao-Seed-2.0-Pro、GUI-Owl-1.5-32B-Instruct **直跑**。依据 [v3 核查要求](../../../docs/plan9/DevicesWorld_failure_pattern_validation_prompt_v3_50_per_baseline.md)，完成各 50 条事前固定随机名单的历史轨迹核查，另复用上一轮 14 条定向记录。本文是本机证据汇总，不是全 benchmark 失败模式排名。

结论：H1 的局部状态推进受阻、H3 的必要动作或交付缺项获得跨任务重复证据；两者经常是同一条执行链的上游与下游，不能当作两个独立原因相加。H2 也有新增实例，但必须拆开来源记录、家电、表格字段和手机访问角色；具体“手机弄反”仍只是一条实例。系统/接口异常、已恢复错误以及评分/历史产物疑点均保留，不为凑齐主题补抽样本。

## 1. 范围、抽样与实际完成

沿用 [上一轮结果口径](../execution_failure_analysis/execution_analysis.md) 和 [600 条正式运行表](../execution_failure_analysis/execution_results.csv) 的 selected attempt，不选最高分重试。原报告为每模型 200 条；既有 PASS 分别为 Kimi 43、Doubao 46、GUI-Owl 20，本轮不重新计算成绩或改判。GUI-Owl 不是 Mobile-Agent framework baseline。

| Baseline | 合格未精读 FAIL 池 | 原有随机样本 | 本轮新增 / 固定目标 | 已完成核查 | 有独立执行失败支持 | 仅评分/合同疑点 | 机制未确定 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Kimi K2.6 | 151 | 0 | 50 / 50 | 50 | 33 | 16 | 1 |
| Doubao-Seed-2.0-Pro | 150 | 0 | 50 / 50 | 50 | 38 | 11 | 1 |
| GUI-Owl-1.5-32B-Instruct | 177 | 0 | 50 / 50 | 50 | 43 | 3 | 4 |
| 合计 | 478 | 0 | 150 / 150 | 150 | 114 | 30 | 6 |

这些列是**本轮审阅状态与证据覆盖**，不是失败原因分布。114 条指至少一个明确未满足要求有执行证据，绝不表示其所有 evaluator 均已审计。其余 36 条仍保留正式 FAIL、仍计入固定 50 条核查，不补抽也不自动改 PASS。审阅状态为 `reviewed` 143 条、`reviewed_evidence_limited` 7 条、`not_reviewed` 0 条；7 条含上述 6 条机制未确定及 O13 的历史 EML 内容缺口。

新增 150 次模型—任务运行对应 **111 个不同 task_id**；旧 14 次与新样本按 `baseline_id + task_id + selected_attempt` 去重后，共 164 次、117 个不同 task_id。旧记录为 C01–C05 五条失败、S01 一条成功对照、X01–X08 八条排除/未定记录，复用旧核查，不冒称本轮重看了它们的截图。

抽样在新内容精读前于 `2026-09-09T13:19:47.437802+00:00` 固定。使用 CPython 3.11.9，候选全局唯一键排序后，分别以 `DevicesWorld-pattern-validation-v3|<baseline_id>` 为字符串种子执行 `random.Random(seed).sample(..., 50)`，无放回。没有发现既有 v1/v2 随机名单，未换种子或替换样本。Kimi 157 条记录性 FAIL 中排除 6 条旧精读记录；Doubao 154 中排除 4；GUI-Owl 180 中排除 3。已记录 PASS 和旧成功对照亦不进入 FAIL 池。所有候选、排除理由和原抽取顺序保存在 [sampling_manifest.json](sampling_manifest.json)。该文件的 `review_status=not_reviewed` 是**冻结名单时状态**；最终审阅状态以 [additional_reviews.jsonl](additional_reviews.jsonl) 为准。

该池排除了既有定向精读、已知争议等记录，是“可获得基础材料的未精读记录性失败池”，不是全部失败的简单随机样本。三模型等额抽取也不等于按失败总量比例抽取。

### 抽中样本的实际覆盖

| 历史 devices 类型组合 | Kimi | Doubao | GUI-Owl |
| --- | ---: | ---: | ---: |
| Android + Linux | 12 | 13 | 8 |
| Android + Home + Linux | 11 | 9 | 11 |
| Home + Linux | 8 | 8 | 9 |
| Android + Home | 8 | 11 | 8 |
| Android（可能为双手机） | 7 | 5 | 7 |
| Linux（可能为双实例） | 4 | 2 | 4 |
| Home | 0 | 2 | 3 |

按实例数 1/2/3/4，Kimi 为 0/21/16/13，Doubao 2/20/20/8，GUI-Owl 3/23/20/4；按既有 `time_limit / max_steps / done`，分别为 31/2/17、17/20/13、1/40/9。终止原因只描述执行边界，不用于推定机制、模型能力排名或“超时都是循环造成”。

150 条历史 task snapshot 均没有所采用显式字段中的可靠 task-family 标签，全部填 `unknown`；不把 ID 前缀、metadata.category 或名字不同当成独立任务族。后文的日历、媒体、权限表等只是可核实任务内容/执行表面，不是恢复出的 family taxonomy；也不能排除模板集中。

## 2. 模式支持：计数按运行去重，不按 CSV 行数

[pattern_support.csv](pattern_support.csv) 共 248 条“运行—具体关系”，包括失败支持、恢复反例、成功对照、替代解释和未确定项。每个高层主题先筛选 `evidence_role=failure_support`，再按三元唯一键去重；不同主题之间允许重叠，绝不可求和为总体原因数。下表顺序沿用 H1–H3，不表示频率排名。

| 主题 | 旧失败支持：运行 / 不同任务 / baseline | 新失败支持：运行 / 不同任务 / baseline | 合并去重：运行 / 不同任务 | 处理意见 |
| --- | --- | --- | --- | --- |
| H1 局部执行未推进必要状态 | 3 / 3 / Kimi、Doubao、Owl | 104 / 83 / 三者 | 107 / 84 | 适合正文；分别描述 source 导航、目标输入/提交、CLI 修复、接口拒绝，不解释为同一内部根因 |
| H2 来源、实体、字段或设备对应错误 | 1 / 1 / Owl | 8 / 7 / 三者 | 9 / 8 | 保留但拆分对象层级；来源记录有两任务/两模型，跨手机角色访问仅一任务/一模型 |
| H3 必要动作或交付缺项 | 2 / 2 / Kimi、Owl | 56 / 50 / 三者 | 58 / 52 | 适合正文；设备前置动作、未执行必要操作、结果交付分别说明；与 H1 的因果重叠不能重复归因 |

旧支持记录为 H1=C01/C02/C03，H2=C05，H3=C02/C04。完整新增支持清单可在 CSV 按主题和来源筛选；每行保留实际 task_id、selected attempt、原证据路径和限制，JSONL 则保留先写事实后的整条执行链。不存在“出现两次就普遍”的判定门槛。

### H1：重复现象增强，但不是单一根因

- **来源访问受阻**：Kimi [K05]（`client_call_pause.txt` 明明在 Files 列表，但筛选/点击未打开）、Doubao [D45]（到达 Calendar 详情停滞）、Owl [O17]（可见 DryAirRule 文件未打开）。这类下游未开始不代表模型不会完成下游。
- **交付界面没有进入必要输入状态**：Kimi [K44] 与 Owl [O04] 都把确认文字放到了短信 Search；Doubao [D26] 停在联系人界面，尚未进入正文输入。这些不能都写成“已发送但丢失”，也不能都叫错误手机。
- **Linux 本地执行/提交**：[K22] 正确字段仍停在未提交的浏览器表单；[D31] 文件替换脚本报错后未更新目标；[O47] 同一 shell 引号错误重复 45 次，manifest 一直没有形成。GUI 坐标失配与明确 shell 语法失败是不同子类型。
- **重复查询与决策落地**：[O29] 对不存在的 balcony 在相同 inventory 上来回查询，未形成所需不可行结果；反过来 [O14] 虽也有重复报告，但实际 native 报告已有正确“不存在”语义，仅剩匹配疑点，不能用重复次数单独证明 H1。

既有 C03 与新增 [K08]、[O30] 是**同一个 `android_only_234`** 的三模型复现，不是三个独立任务。另有不同任务的 Markor、Calendar、SMS、浏览器、CLI 案例，才支持跨任务的有限归纳。Kimi [K24]、Doubao [D17] 的 Camera 异常，以及 Owl [O46] 的 Calendar splash/Alarm 画面没有被混入明确模型停滞支持；[K02]、[O40] 等可定位阶段但有接口混杂的条目仍明确带限定。

### H2：要保留层级差异，不能统称“跨设备混淆”

| 具体层级 | 证据 | 不同任务 / baseline 范围 | 可以与不可以说什么 |
| --- | --- | --- | --- |
| 源记录选择与传播 | [K34] `android_only_218`；[D18] `a2l_audio_thunderbird_draft` | 2 / Kimi、Doubao | 分别把另一个 request code、无关旧 note 的 reference 带入目标编辑内容；不能宣称错误内容都已持久保存 |
| 单 Home 房间/家电选择 | 旧 C05；[D32]、[O16] 同 nursery 任务；[O15] 洗衣机/烘干机 | 3 / Doubao、Owl（含旧证据） | nursery 两模型是同 task；O16 对本就 on 的设备 turn_on 无实际属性变化；都不是跨手机路由 |
| 同一 workbook 目标字段 | [O10] `linux_only_327`；[O27] `linux_smarthome_606` | 2 / 仅 Owl | 实际截图显示写入身份列/错位单元格；不推广为三模型共同表格问题 |
| 指定手机的 app 访问角色互换 | [O49] `linux_android_1080` | 1 / 仅 Owl | 应 first Contacts/second Markor，实际反过来开 app；没有证据表明错误手机上成功写出目标 note |

`android_smarthome_407` 的 [D28]、[O40] 试图调用不存在的 `linux_0`，反馈拒绝。这两条只作为 **OTHER：当前接口的非法设备请求**，不计 H2 原生实例错配支持。Kimi [K17] 的搜索/编辑器上下文错位合并到 H1，避免把任何 UI 定位都扩成 H2。Owl [O03] 曾在目标 Linux 访问源本地路径失败，但后来复制源并改用 PIL，属于**已恢复反例**，不能当最终跨 Linux 路径混淆。

因此，原来单 Home 错灯的 C05 可继续做附录；新增 K34 可做 H2 正文候选，但“错误手机写入”“跨 Linux 路径普遍错误”仍缺足够重复、未恢复的证据。

### H3：动作前置条件与交付缺项应拆开

- **前置开机动作**：旧 C04 外，Doubao [D22] 与 Owl [O25]、[O41] 的未来计划遗漏初始关闭设备的开机；Owl [O38] 则直接观察到 heater 设为 24°C 后仍 `power=off`。连同旧 C04 是 5 个不同任务、2 个 baseline 的前置动作证据，不声称 Kimi 也有同型缺项。前三个新增未来计划没有 advance_time，不能虚构已观测到未来效果失败。
- **必要 Home 动作根本未执行**：[O19] 已读 policy 和状态并生成“已执行”内容，却只查询，原生 curtain 仍 10、AC 仍 off/20；[O24] 修改 CSV 后结束，living curtain 仍 80。两例都是 Owl，只能支持该组的有限子主题，不能写成三模型都把报告代替环境操作。
- **正确 native 工作之后交付缺失**：[K07] heater on/22、[D29] purifier on/high、[O42] bedtime workflow 正确，但要求的短信没有送出；[O47] 两项计划正确，manifest 被 CLI 错误阻断。这部分常是 H1 的下游，不一律诊断为“缺全局 verifier”。[K21]、[O44] 在同一 task 将 Home 内部报告代替 Owner 沟通，则是特定收件人交付渠道的边界；不推广到只要求泛泛 report 的任务。
- **多条记录只完成一部分**：[D06] 八行 CSV 只形成前三个 Tasks 标题，[D36] 三张 receipt 仅形成一项 review task。是两任务、仅 Doubao 的重复，适合作为有界补充，不当跨模型普遍现象。

反例不可省略：旧 S01 在 `android_smarthome_202` 安排了 on/high/close 且既有 PASS；[K07] heater 实际开机，[D14] purifier 初态已 on，[O47] 计划明确含 on/high，均限制“设参数必定缺开机”或机械要求 turn_on 的说法。旧 X07 和新增 [K15]、[D04] 有真实已发送气泡，不能再当“没发短信”的支持；D04 的独立失败支持只限后续 log 缺失。

合并时进一步收窄 H3：K08、K09、D41 仅能确认 app 导航或初态保留，没有足够实质性正确结果，因此只计 H1；它们的下游缺项仍保留在逐条事实中。打开 app、拿到保留约束分数或看到源文件名，本身不构成 H3 所说的正确部分结果。

## 3. 不符合预期主题的记录、恢复与材料缺口

以下完整列出不计入失败模式支持的 36 条，仍在随机名单中。`scoring_question` 只表示现存证据不宜用于能力归因，**不等于评分错误已证实，更不等于待批准 PASS 清单**。

| 记录 | 保留原因与具体缺口 |
| --- | --- |
| [K03]、[K04]、[K06]、[K13]、[K26]、[K28]、[K30]、[K37]、[K47] | 有正确源/原生状态/输出回读，但历史完整 workbook/DOCX 包、布局或受控字段合同未独立取得；不能仅依据词面差异或 cache 路径确定机制 |
| [D05]、[D21]、[D23]、[D34]、[D38]、[D42]、[D46] | 相似的历史产物/合同边界；不少已真实回读关键值，但不补造包级、布局或全部 schema 证据 |
| [K15]、[K31]、[D39] | 实际 UI 已出现目标内容，部分伴随 sent/native 证据，getter 却为空/缺失；持久化及采集路径关系未核实，不以保存图标或未点击固定按钮推断失败 |
| [K33]、[K49]、[D47]、[O13] | EML/正文读取与解析结果关系不明；尤其 O13 只有创建/存在性反馈，没有独立全文回读，不能借 Kimi/Doubao 的同 task 输出证明 Owl 正确 |
| [K39]、[K42]、[D01]、[O14]、[D16]、[O31] | 正确不可行/blocked 语义与具体 native sink、关键词或字段匹配存在疑点；未重审完整工具提示合同，不将正确拒绝解释成执行失败 |
| [K41] | 保存目的 Linux 的公开指定有歧义，未确定有可见下游约定；不当错误设备路由实例 |
| [K24]、[D17]、[O46] | Camera 黑屏/隐私提示，或 Calendar splash 和 Alarm 异常画面；缺可分离的历史服务/可用性证据，只记录未确定的系统/应用条件 |
| [O03]、[O22]、[O39] | 缺对应历史最终 contact sheet/index、workbook 实体或关键输出回读；动作脚本、现存 mutable cache 和 evaluator FAIL 不足以证明特定语义错误 |

另有运行在一部分评分字段上存疑，但有**另一个独立明确缺项**，仍可分析后者，例如 [D04] 已发送 SMS 但 log 没写、[K20] Home 正确但 Tasks 未完成、[K16]/[D43] 计划判断有边界但目标 note 从未输入。JSONL 将两者分开，不因局部疑点停掉整轮分析。

旧 X01–X08 全保留为排除/恢复/未定证据，不加入旧失败支持。没有因为这些缺口去连 live 设备、重跑任务、使用当前 cache、调用 judge，或启动全量评分审计。新增样本的 150 份 instruction、150 条完整动作/反馈序列及适用 native getter 均已核查，关键截图/UI 引用逐条注明实际方式；不是逐张查看全部历史图像。

## 4. 正文展示候选与可用原始素材

每个有支持的高层主题选一个主展示候选，不要求三模型平均露出。以下均为**本轮实际核查**；旧 C01/C04 可作为已核查的替代展示，不需要把更多截图塞入正文。

### H1 主例：K44，正确排程后的回复落入搜索框

Kimi / `linux_android_smarthome_470`：[完整轨迹][K44]。s0 实际读取场景规则，s5 原生保存 Office 20:30、灯 45、帘 50 的计划；s24 输入确认文字，但 [后继真实图][K44-img] 中末尾 `will be prepared then` 在 **Search** 框，页面为 `No items found`，不是会话正文。后续至终止未送达，native SMS 为 missing。可以写“有正确计划却没有把消息送入正确 UI 状态”，不能写“已经发送被系统丢失”。

其他支持：[D26] 联系人到短信入口、[O04] 另一场景同 Search 问题；Linux 子类型可用 [O47] 的 s5–49 实际 `exit_code=2` 与 `Syntax error: "then" unexpected` 做状态片段。反例为旧 X07、[D04] 的真实 sent 气泡。图占位建议：原 Search 框截图局部 + 原生计划/短信状态摘录，不重绘为虚假对话。

### H2 主例：K34，按标题取错 request code

Kimi / `android_only_218`：[完整轨迹][K34]。要求用第二手机既有事件的 request code 匹配第一手机当前事件；[源手机初图][K34-source] 打开的是 RC-99/East Lot，而 [目标初图][K34-target] 是 RC-42/Old Yard。s0–s3 把 East Lot 和 RC-99 输入目标，[末端目标编辑图][K34-after] 确认错误 code 已进入实际编辑器，旧时间仍在。证据支持“错误记录被用于目标编辑”，不声称已把正确 RC-42 内容读出后传错，也不声称错改已持久保存。

不同任务的支持为 [D18]：无关旧 note reference 进入 Thunderbird 实际正文；具体手机角色互换 [O49] 则另作附录。图占位建议：三张实际 Calendar 图中 code/location 区域的对照。D18 源正文缺口保留，不用 evaluator expected 补造正确 reference。

### H3 主例：O38，设温正确而暖气仍关闭

GUI-Owl / `android_smarthome_147`：[完整轨迹][O38] 与 [原生终态][O38-state]。第二手机 [联系人偏好图][O38-source] 写 heater 24°C、light 45；动作使灯 `off/0 → on/45`，heater 仅 `off/22 → off/24`，到结束没有开机。这里有**实际当前状态**，无需假定未来时间推进；不要把灯的自动开机语义套到 heater。另一个缺项是 [SMS Search 图][O38-sms] 显示回复没有发送，这与 heater 漏开机分开解释。

不同任务的计划前置证据见旧 C04、[D22]、[O25]、[O41]；成功/边界对照见旧 S01、[K07]、[D14]、[O47]。图占位建议：联系人偏好局部 + 原生 heater before/after 两行；不绘制不存在的室温变化曲线。

## 5. 对上一轮 4.4 草稿的具体修改意见

不覆盖 [section4_4_draft.md](../execution_failure_analysis/section4_4_draft.md)。供合并时采用的修改如下：

1. **替换范围段**：“五条定向失败及一条成功对照”改为“复用旧 14 条记录，补充每 baseline 50 条固定随机记录性失败，共 150 次、111 个 task_id；其中有独立失败支持 114 条，30 条评分/合同疑点和 6 条机制未定保留但不归因”。紧接说明条件化抽样池及不是总体原因分布，不能把 164 次都写成随机失败。
2. **保留并收窄‘局部操作停滞’段**：C01/C03 的事实可保留；新增 K44/O47 分别说明 GUI 输入位置与 shell 语法未恢复，不把它们归为统一“缺乏协调”。不能以 time_limit 直接诊断循环，也不能把应用异常全部算模型能力。
3. **合并‘形成结论不等于交付’与 H1 的重叠解释**：C02 仍是正确的 missing record 案例，但更多同类证据不证明独立于 GUI 的“全局验证缺失”。用“必要交付未落地”描述结果，用具体导航/输入证据解释机制。
4. **加强‘动作受理与前置条件’段**：新增 O38 当前 off/24 的原生状态展示；保留 C04/S01 的未来计划对照，同时明确前者没有 advance_time。不得写成所有 schedule 都要额外开机，D14 的初态 on 是反例。
5. **有条件新增 H2 段**：用 K34 与 D18 讨论来源记录/引用错配；明确 H2 子类型尚不均衡。旧 C05 仍可放附录，不能升级为跨手机路由共性。O49 是仅一条手机访问角色互换，D28/O40 是被接口拒绝的不存在设备调用，分列。
6. **保留干预限制、替换展示表**：原“未做干预、不能保证 planner/verifier 有效”的结尾保留；表 4.X 建议缩为上述 H1/H2/H3 三个主例，原 C01/C03/C02/C04 作为扩展证据。Caption 加入“同一运行可支持相连主题；不是互斥原因或频率图”。不制作原因占比柱状图/饼图。

可用的新版正文短段（尚待其他机器结果合并）：

> 对三组直跑 baseline 的补充历史核查表明，必要状态的局部推进与跨环境交付之间可以出现可观察断点。例如，Kimi 在安排正确场景后将回复内容输入短信搜索框，后续并未送达；GUI-Owl 也有正确排程之后持续重复失败 shell 命令、未形成清单的记录。两者分别涉及 UI 状态定位与命令修复，不能合称同一内部根因。另一些实例保留了局部正确参数，却遗漏让设备进入工作状态的必要动作：GUI-Owl 将暖气目标温度设为 24°C 后，原生 power 仍为 off。来源对应关系也需要单独处理；在双手机日历任务中，另一个 request code 的内容进入了目标编辑器。上述现象在本机存在不同任务的例证，但具体跨手机访问角色互换仍只是单例，且部分未完成运行伴随应用状态或接口问题。我们据此提出有界的执行机制假设，而不推断模型内部认知原因或总体失败占比。

## 6. 交接与停止边界

主要交接文件为本报告、[固定名单](sampling_manifest.json)、[150 条逐运行核查](additional_reviews.jsonl)、[248 条证据关系](pattern_support.csv)。`_support/` 保留分批笔记、合并脚本和验证结果，便于追溯；短号 K/D/O 是本报告内固定抽样顺序，不是 lite_index。跨机器合并务必使用 baseline/task/attempt 三元键，旧 Case ID 只作来源标识。

CSV 按 spreadsheet skill 的表格流程生成并回读核验，未添加频率、百分比或排名列。验证直接比较所选记录、JSON 语义及证据路径，不引入新的 task/evaluator/checksum hash。旧分析、实验、任务、evaluator、运行时未被改写；没有新实验、设备连接、judge 请求、commit 或 push。

本机建议：H1 与具体 H3 前置/交付主题可进入跨机器正文候选；H2 来源绑定可保留但限定，手机角色互换与单模型表格错位作为局部补充；接口拒绝和异常应用条件单列。最终三四个全局重点主题由其他机器证据合并后决定。本轮到固定 150 条和四个文件完成为止，不再按主题追加确认性样本。

<!-- Resolved local historical evidence references. -->
[D01]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/trajectory.json "Doubao-Seed-2.0-Pro · sh3_explicit_control_plain_light_dimming_infeasible_0013"
[D04]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/037_linux_android_1255/trajectory.json "Doubao-Seed-2.0-Pro · linux_android_1255"
[D05]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/125_linux_smarthome_567/trajectory.json "Doubao-Seed-2.0-Pro · linux_smarthome_567"
[D06]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/013_al_thunderbird_attachment_to_tasks/trajectory.json "Doubao-Seed-2.0-Pro · al_thunderbird_attachment_to_tasks"
[D14]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/154_android_smarthome_766/trajectory.json "Doubao-Seed-2.0-Pro · android_smarthome_766"
[D16]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/043_linux_android_1320/trajectory.json "Doubao-Seed-2.0-Pro · linux_android_1320"
[D17]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/027_a2l2_training_media_deck_email/trajectory.json "Doubao-Seed-2.0-Pro · a2l2_training_media_deck_email"
[D18]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/022_a2l_audio_thunderbird_draft/trajectory.json "Doubao-Seed-2.0-Pro · a2l_audio_thunderbird_draft"
[D21]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/116_linux_smarthome_1000/trajectory.json "Doubao-Seed-2.0-Pro · linux_smarthome_1000"
[D22]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/086_linux_android_smarthome_104/trajectory.json "Doubao-Seed-2.0-Pro · linux_android_smarthome_104"
[D23]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/121_linux_smarthome_983/trajectory.json "Doubao-Seed-2.0-Pro · linux_smarthome_983"
[D26]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/144_android_smarthome_144/trajectory.json "Doubao-Seed-2.0-Pro · android_smarthome_144"
[D28]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/140_android_smarthome_407/trajectory.json "Doubao-Seed-2.0-Pro · android_smarthome_407"
[D29]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/100_linux_android_smarthome_877/trajectory.json "Doubao-Seed-2.0-Pro · linux_android_smarthome_877"
[D31]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/119_linux_smarthome_932/trajectory.json "Doubao-Seed-2.0-Pro · linux_smarthome_932"
[D32]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/191_sh2_implicit_intent_nursery_air_comfort_infeasible_0011/trajectory.json "Doubao-Seed-2.0-Pro · sh2_implicit_intent_nursery_air_comfort_infeasible_0011"
[D34]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/134_linux_smarthome_361/trajectory.json "Doubao-Seed-2.0-Pro · linux_smarthome_361"
[D36]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/030_a2_gallery_album_to_tasks/trajectory.json "Doubao-Seed-2.0-Pro · a2_gallery_album_to_tasks"
[D38]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/128_linux_smarthome_373/trajectory.json "Doubao-Seed-2.0-Pro · linux_smarthome_373"
[D39]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/095_linux_android_smarthome_005/trajectory.json "Doubao-Seed-2.0-Pro · linux_android_smarthome_005"
[D42]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/117_linux_smarthome_796/trajectory.json "Doubao-Seed-2.0-Pro · linux_smarthome_796"
[D43]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/139_android_smarthome_026/trajectory.json "Doubao-Seed-2.0-Pro · android_smarthome_026"
[D45]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/098_linux_android_smarthome_457/trajectory.json "Doubao-Seed-2.0-Pro · linux_android_smarthome_457"
[D46]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/131_linux_smarthome_372/trajectory.json "Doubao-Seed-2.0-Pro · linux_smarthome_372"
[D47]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/doubao-seed-2.0-pro-lite/core200_20260830/run_01/186_linux_only_283/trajectory.json "Doubao-Seed-2.0-Pro · linux_only_283"
[K02]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/098_linux_android_smarthome_457/trajectory.json "Kimi K2.6 · linux_android_smarthome_457"
[K03]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/128_linux_smarthome_373/trajectory.json "Kimi K2.6 · linux_smarthome_373"
[K04]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/117_linux_smarthome_796/trajectory.json "Kimi K2.6 · linux_smarthome_796"
[K05]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/post_repair_retry_20260830/per_task/096_linux_android_smarthome_422/096_linux_android_smarthome_422/trajectory.json "Kimi K2.6 · linux_android_smarthome_422"
[K06]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/123_linux_smarthome_982/trajectory.json "Kimi K2.6 · linux_smarthome_982"
[K07]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/recovery_20260829/per_task/077_linux_android_smarthome_161/077_linux_android_smarthome_161/trajectory.json "Kimi K2.6 · linux_android_smarthome_161"
[K08]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/162_android_only_234/trajectory.json "Kimi K2.6 · android_only_234"
[K13]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/125_linux_smarthome_567/trajectory.json "Kimi K2.6 · linux_smarthome_567"
[K15]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/042_linux_android_1215/trajectory.json "Kimi K2.6 · linux_android_1215"
[K16]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/recovery_20260829/per_task/139_android_smarthome_026/139_android_smarthome_026/trajectory.json "Kimi K2.6 · android_smarthome_026"
[K17]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/056_linux_android_1863/trajectory.json "Kimi K2.6 · linux_android_1863"
[K20]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/recovery_20260829/per_task/081_linux_android_smarthome_897/081_linux_android_smarthome_897/trajectory.json "Kimi K2.6 · linux_android_smarthome_897"
[K21]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/recovery_20260829/per_task/090_linux_android_smarthome_185/090_linux_android_smarthome_185/trajectory.json "Kimi K2.6 · linux_android_smarthome_185"
[K22]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/106_linux_smarthome_454/trajectory.json "Kimi K2.6 · linux_smarthome_454"
[K24]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/027_a2l2_training_media_deck_email/trajectory.json "Kimi K2.6 · a2l2_training_media_deck_email"
[K26]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/179_linux_only_224/trajectory.json "Kimi K2.6 · linux_only_224"
[K28]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/111_linux_smarthome_606/trajectory.json "Kimi K2.6 · linux_smarthome_606"
[K30]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/121_linux_smarthome_983/trajectory.json "Kimi K2.6 · linux_smarthome_983"
[K31]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/101_linux_android_smarthome_472/trajectory.json "Kimi K2.6 · linux_android_smarthome_472"
[K33]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/176_linux_only_279/trajectory.json "Kimi K2.6 · linux_only_279"
[K34]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/168_android_only_218/trajectory.json "Kimi K2.6 · android_only_218"
[K37]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/126_linux_smarthome_670/trajectory.json "Kimi K2.6 · linux_smarthome_670"
[K39]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/159_android_smarthome_233/trajectory.json "Kimi K2.6 · android_smarthome_233"
[K41]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/185_linux_only_275/trajectory.json "Kimi K2.6 · linux_only_275"
[K42]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/158_android_smarthome_219/trajectory.json "Kimi K2.6 · android_smarthome_219"
[K44]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/104_linux_android_smarthome_470/trajectory.json "Kimi K2.6 · linux_android_smarthome_470"
[K47]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/102_linux_android_smarthome_909/trajectory.json "Kimi K2.6 · linux_android_smarthome_909"
[K49]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/186_linux_only_283/trajectory.json "Kimi K2.6 · linux_only_283"
[O03]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/187_linux_only_300/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_only_300"
[O04]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/098_linux_android_smarthome_457/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_android_smarthome_457"
[O10]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/189_linux_only_327/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_only_327"
[O13]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/186_linux_only_283/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_only_283"
[O14]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/200_sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016/trajectory.json "GUI-Owl-1.5-32B-Instruct · sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016"
[O15]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/133_linux_smarthome_999/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_smarthome_999"
[O16]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/191_sh2_implicit_intent_nursery_air_comfort_infeasible_0011/trajectory.json "GUI-Owl-1.5-32B-Instruct · sh2_implicit_intent_nursery_air_comfort_infeasible_0011"
[O17]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/147_android_smarthome_265/trajectory.json "GUI-Owl-1.5-32B-Instruct · android_smarthome_265"
[O19]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/116_linux_smarthome_1000/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_smarthome_1000"
[O22]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/181_linux_only_218/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_only_218"
[O24]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/114_linux_smarthome_851/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_smarthome_851"
[O25]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/080_linux_android_smarthome_696/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_android_smarthome_696"
[O27]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/111_linux_smarthome_606/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_smarthome_606"
[O29]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/195_sh4_time_schedule_missing_balcony_light_infeasible_0014/trajectory.json "GUI-Owl-1.5-32B-Instruct · sh4_time_schedule_missing_balcony_light_infeasible_0014"
[O30]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/162_android_only_234/trajectory.json "GUI-Owl-1.5-32B-Instruct · android_only_234"
[O31]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/051_linux_android_1858/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_android_1858"
[O38]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/160_android_smarthome_147/trajectory.json "GUI-Owl-1.5-32B-Instruct · android_smarthome_147"
[O39]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/134_linux_smarthome_361/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_smarthome_361"
[O40]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/140_android_smarthome_407/trajectory.json "GUI-Owl-1.5-32B-Instruct · android_smarthome_407"
[O41]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/136_android_smarthome_357/trajectory.json "GUI-Owl-1.5-32B-Instruct · android_smarthome_357"
[O42]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/144_android_smarthome_144/trajectory.json "GUI-Owl-1.5-32B-Instruct · android_smarthome_144"
[O44]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/090_linux_android_smarthome_185/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_android_smarthome_185"
[O46]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/016_a2_alarm_conflict_log/trajectory.json "GUI-Owl-1.5-32B-Instruct · a2_alarm_conflict_log"
[O47]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/127_linux_smarthome_359/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_smarthome_359"
[O49]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/060_linux_android_1080/trajectory.json "GUI-Owl-1.5-32B-Instruct · linux_android_1080"
[K44-img]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/104_linux_android_smarthome_470/artifacts/android_1/screenshots/step_048.png
[K34-source]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/168_android_only_218/artifacts/android_0/screenshots/step_000.png
[K34-target]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/168_android_only_218/artifacts/android_1/screenshots/step_000.png
[K34-after]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/kimi-k2.6-lite/core200_20260826/run_01/168_android_only_218/artifacts/android_1/screenshots/step_028.png
[O38-state]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/160_android_smarthome_147/evaluator_trace.json
[O38-source]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/160_android_smarthome_147/artifacts/android_1/screenshots/step_048.png
[O38-sms]: ../../../worker-worktrees/all-task-update-intergration-sync-20260826/runs/gui-owl-1.5-32b-instruct-lite/core200_20260905/run_01/160_android_smarthome_147/artifacts/android_0/screenshots/step_094.png
