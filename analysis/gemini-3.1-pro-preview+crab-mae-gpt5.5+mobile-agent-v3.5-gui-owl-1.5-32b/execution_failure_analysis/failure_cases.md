# 既有主实验的真实执行失败案例

分析日期：2026-09-08。本文件为 AI 辅助的定向轨迹核验，不是独立人工标注，也不估计失败原因比例。

## 阅读范围与引用约定

使用三组正式 `run_01/summary.json` 已选取的记录；不重新选择重试，不改写分数。下列六个失败案例均为已保存自动结果 `FAIL / score=0`，本机检索范围内未发现适用于它们的已确认改判。这里的“无已知争议”不是重新审计通过。

完整核对六个失败案例、两个成功对照的动作/执行反馈序列，并查看必要的历史截图或结构化状态；相同重复命令用直接文本比较归并检查，没有逐张查看所有中间截图。另筛查四条记录后排除，见末尾。没有读取其他全部失败轨迹。

下文证据根目录均相对仓库 `D:/MDC_Benchmark_2`。在各自根目录内：`Q=config/task.json`，`T=trajectory.json`，`E=evaluator_trace.json`，`R=result.json`，`F=framework_metadata.json`。`T.events[i]`、`E.evaluators[i]` 和 `step_index` 都是 **零基索引**；截图编号不能直接当作模型步数。这些引用定位的是历史 selected attempt，不是当前 VM 或共享 cache。

## G1：打开了错误笔记，并将其内容传播到 Linux 文档（正文候选）

- 模型：Gemini 3.1 Pro Preview。
- task_id：`al_writer_from_note_gui`；selected attempt：`017_al_writer_from_note_gui`。
- 证据根目录：`runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/017_al_writer_from_note_gui`。
- [历史轨迹](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/017_al_writer_from_note_gui/trajectory.json)。原始/采用结果均为 FAIL，5 步，458.906 秒，`done`；无已知裁决冲突。
- 公开目标：读取 `android_0` 的 Markor 笔记 `Memo draft`，在 `linux_0` 用 LibreOffice 创建 `/tmp/memo/memo.odt`，包含其标题与正文。Q 的初始化材料为 “Dock schedule change” 及徽章领取/北侧服务台时间通知；这只是来源说明，目标笔记的实际存在还由历史列表截图佐证。
- 局部完成：Markor 可以打开，Linux 文档转换成功；并非无法生成 ODT。

| 事件/步骤 | 设备 | 动作与实际反馈 | 可回查证据 |
|---|---|---|---|
| e1 / s0 | android_0 | 打开 Markor；列表同时有 `Color Light Request.md` 和 `Memo draft.md` | T.events[1]；`artifacts/android_0/screenshots/step_002.png`，已看图 |
| e2–e3 / s1–s2 | android_0 | 第一次点击后仍是列表；第二次打开的是 `Color Light Req...`，正文为厨房香氛不受支持 | T.events[2:4]；`step_004.png`、`step_006.png`，均已看图 |
| e4 / s3 | linux_0 | 声称已提取 Memo，但写入的是 `Color Light Request` 及香氛说明；转换返回 `memo.txt -> memo.odt`、exit 0 | T.events[4].action.command、.info.stdout、.info.exit_code |
| e5 / s4 | global | 发出 done；没有回到目标笔记或重写文档 | T.events[5]；R；E.evaluators[0] |

明确未满足的是“采用指定笔记的内容”，不是隐含的 ODT 字符串格式。错误发生在同一 Android 环境中的来源文档绑定，并传播到另一设备；不是把 `android_0` 和 `android_1` 对调。完整后续仅有转换和 done，没有恢复。

证据边界：错误笔记截图和实际执行的写入/转换反馈共同支持结论；没有把 E 中共享 cache 的 `memo.odt` 路径当成已读取的历史文件字节。也不因用了 headless 转换就额外判失败。可考虑对“指定笔记名—当前打开标题—目标文档内容”做一致性检查，但本案例没有测试某个 verifier 的效果。

## C1：用另一盏可调光灯替代了指定普通灯（正文候选）

- 模型：Crab-MAE（GPT-5.5）。
- task_id：`sh3_explicit_control_plain_light_dimming_infeasible_0013`；selected attempt：`192_sh3_explicit_control_plain_light_dimming_infeasible_0013`。
- 证据根目录：`runs/core200-rerun-20260826/crab-mae-gpt55-core200/PC-20260130VLZZ/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013`。
- [历史轨迹](../../../runs/core200-rerun-20260826/crab-mae-gpt55-core200/PC-20260130VLZZ/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/trajectory.json)。原始/采用 FAIL，2 步、2 协调轮，35.922 秒，`done`；无已知裁决冲突。
- 公开目标：将 “bedroom light 1” 调到 35%。唯一 benchmark 设备实例为 `home_0`；其中同时存在普通灯 `bedroom_light_1` 和可调光灯 `bedroom_dimmable_light_1`。
- 局部完成：确实成功调暗了一盏灯，但不是所指对象。

| 事件/步骤 | 设备/家电 | 动作与实际反馈 | 可回查证据 |
|---|---|---|---|
| e0 | home_0 | 初始观测列出两个不同 ID/类型：普通灯仅有 power，可调光灯 brightness=50 | T.events[0].observation.observations.home_0.devices；Q.instruction |
| e1–e2 / s0 | home_0 / bedroom_dimmable_light_1 | main agent 指派可调光灯；动作 set_brightness(35) 成功，反馈 before=50、after=35 | T.events[1].diagnostics.main_agent_output；T.events[2].action、.info |
| e3–e4 / s1 | root/global | main agent 认为已完成，随后 done；没有报告指定普通灯不支持调光 | T.events[3:5] |
| 终态 | home_0 | 指定普通灯仍仅为 power=on；另一灯被改到 35；infeasible_reports 为空 | E.evaluators[0].actual；E.evaluators[1].actual.devices |

机制是**同一 Home 环境内的家电对象替换**，不能写成跨设备实例路由错误。请求不可执行时，应保留目标并报告能力边界，不能将附近可执行对象视作等价完成。未发现后续恢复；缺少的不是某种固定措辞，而是对指定对象的正确处理。S2 为同任务成功对照。

边界与启发：状态列表和实际 before/after 足以确认对象替换；不推断是主代理还是某种 memory 实现造成。可以检验“先锁定目标 ID，再查能力”的策略，不能声称已证明有效。

## M1：跨 Linux 转换中，语法错误持续重复而未修复（正文候选）

- 模型：Mobile-Agent-v3.5（GUI-Owl-1.5-32B-Instruct；服务模型标识为 `gui-owl`）。
- task_id：`l2_csv_to_json`；selected attempt：`007_l2_csv_to_json`。
- 证据根目录：`runs/core200-rerun-20260826/mobile-agent-v3.5-gui-owl15-32b/PC-20260130VLZZ/run_01/007_l2_csv_to_json`。
- [历史轨迹](../../../runs/core200-rerun-20260826/mobile-agent-v3.5-gui-owl15-32b/PC-20260130VLZZ/run_01/007_l2_csv_to_json/trajectory.json)。原始/采用 FAIL，50 步、50 协调轮，598.156 秒，显式 `max_steps`；无已知裁决冲突。
- 公开目标：将 `linux_0:/tmp/orders/orders.csv` 转成 `linux_1:/tmp/orders/orders.json`。两个具体 Linux 实例，不是一个设备。
- 局部完成：读到三条订单，且后续命令确实携带这三条数据到正确的 `linux_1`；不是来源数据完全未取得。

| 事件/步骤 | 设备 | 动作与实际反馈 | 可回查证据 |
|---|---|---|---|
| e2 / s0 | linux_0 | cat 成功，返回 ORD-100/101/102 三条 CSV 记录 | T.events[2].info.stdout，exit_code=0 |
| e4 / s1 | linux_1 | 单行 `python3 -c` 在分号后放 `with open(...)`；Python 明确返回 SyntaxError，exit 1 | T.events[4].action.command、.info.stderr、.info.exit_code |
| e6 / s2 | linux_1 | 将变量 data 改为 rows，但保留错误结构；仍 SyntaxError | T.events[6] |
| e6–e100 / s2–s49 | linux_1 | 48 次完全相同的命令；逐条反馈均 info.ok=false、exit 1，没有成功写入事件 | T 中这一范围的 step 事件；直接比较命令全文，不用摘要判同 |
| 终态 | linux_1 | 达到动作预算；评估读取 JSON 的 actual=null，得分 0 | R.termination_reason；E.evaluators[0].actual |

语法失败发生在文件写入之前，完整动作序列没有修正或另一路径的交付；这独立支持目标 JSON 未产生。命令还对列表调用 `.split`，但它尚未执行，不能把潜在异常写成实际发生的第二类错误。S1 显示同一任务存在成功的跨设备写入路径。

这里的“循环”有区间级重复和连续失败反馈支撑，不是从 50 步标签猜测。注意外层 `step.ok=true` 与内层 `info.ok=false` 同时存在：前者只说明调用返回，不能冒充命令成功。记录支持“整个执行回路未形成有效修复”，但未保存完整逐次 API 请求体，不能进一步断言模型看到了全部 stderr 后有意忽略，或唯一归因于 memory。可考虑明确呈现子进程结果、改变重试策略；本轮不修改适配器。

## C2：正确子目标被反复组成不合法动作批次，未落到 Home 执行（正文候选）

- 模型：Crab-MAE（GPT-5.5）。
- task_id：`android_smarthome_251`；selected attempt：`146_android_smarthome_251`。
- 证据根目录：`runs/core200-rerun-20260826/crab-mae-gpt55-core200/PC-20260130VLZZ/run_01/146_android_smarthome_251`。
- [历史轨迹](../../../runs/core200-rerun-20260826/crab-mae-gpt55-core200/PC-20260130VLZZ/run_01/146_android_smarthome_251/trajectory.json)。原始/采用 FAIL，50 步、37 协调轮，1083.312 秒，显式 `max_steps`；无已知裁决冲突。
- 公开目标：从 `android_0` 的短信读取卧室设置，再读 Contacts 的 `Bedroom Updates` 确认格式；修改 `home_0` 灯光和窗帘，然后回复短信。
- 局部完成：短信中的 20%/关帘已进入 main agent 的指令；联系人样式后来也显示在历史观测中。不能笼统写成“从未读到请求”。

| 事件/区间 | 设备/层级 | 动作与实际反馈 | 可回查证据 |
|---|---|---|---|
| e4–e5 / 协调轮2 | android_0、main | 短信列表可见 “20% and curtain closed”；main 已正确指定亮度20和关帘 | T.events[4:6]；`artifacts/android_0/screenshots/step_004.png`，已看图 |
| e5 / 协调轮2 | home_0 适配接口 | 同一轮返回灯光、窗帘两个 Home 动作，被标为 `multiple_actions_same_environment`；没有对应 Home step | T.events[5].model_response、.diagnostics.coordination_errors；F.max_actions_per_environment_per_round=1 |
| e12–e57 | 多代理协调 | 同类双动作批次多次重现；main 又反复要求回读短信/联系人，并非一直推进执行 | T.events[12]、[25]、[33]、[52]、[57]；对应 main_agent_output 与 coordination_errors |
| e47、e62 | android_0、main | 联系人页已显示回复样式；main 也引用 `Bedroom light is at LEVEL%; curtain is closed.` | `artifacts/android_0/screenshots/step_047.png`，已看图；T.events[62].diagnostics.main_agent_output |
| e64–e87 | home_0、android_0 | 双动作拒绝一直延续至协调轮36；全部50个 step 是36次 Android动作、14次全局wait，无一次 Home动作 | T.events[64]、[65]、[81]、[86] 的拒绝；完整 step 序列；末图 `step_086.png` 已看 |
| 终态 | home_0、android_0 | 灯仍70%，窗帘仍80%开；所需回复 missing | E.evaluators[0:3].actual；R |

全程共10轮出现上述 Home 双动作拒绝，均有具体事件记录；这是**该案例内部次数**，不是总体原因占比。F 保存的 patched environment-agent 模板明确要求 “Return exactly one function call.”。因此有证据支持“子目标正确，但动作编排未遵守当前执行协议且未有效拆分恢复”。短信/Contacts 来回切换是共现现象，不足以证明 history 丢失。

必要 Home 状态明确未满足，独立于回复文本的匹配细节。未执行的 Home 动作中还有不同窗帘命令名，不能当成已实际发生的 Home命令异常。该例是模型、框架与 benchmark 适配接口组成的系统失败，不应单独归因于 GPT-5.5 的调光能力，亦不能证明 Windows 是原因。可研究合法串行化和反馈闭环，但本轮不改变动作预算或 runtime。

## G2：字段填写后来恢复，但提交动作仍未命中（附录候选）

- 模型：Gemini 3.1 Pro Preview。
- task_id：`a2l_browser_dual_phone_code`；selected attempt：`028_a2l_browser_dual_phone_code`。
- 证据根目录：`runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/028_a2l_browser_dual_phone_code`。
- [历史轨迹](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/028_a2l_browser_dual_phone_code/trajectory.json)。原始/采用 FAIL，35 步，1325.312 秒，`done`；无已知裁决冲突。
- 目标：取得 `android_0` 短信代码和 `android_1` Markor账号，在 `linux_0` 的 `/home/user/account/verify.html` 完成验证。局部完成：浏览器打开，最终两个字段的值正确显示。

| 事件/区间 | 设备 | 动作与实际结果 | 可回查证据 |
|---|---|---|---|
| e1–e15 / s0–s14 | 两部手机 | 有等待、重新打开和非法元素索引等早期问题；后来 Linux命令使用 ACC-28491 与4829 | T.events[1:16]；T.events[16].action.code |
| e16–e31 / s15–s30 | linux_0 | 多次点 x约400–500 的输入位置；历史1920×1080截图中输入框位于 x715 起；经历空字段、账号框误入4829等状态 | T.events[16:32]；`artifacts/linux_0/screenshots/step_017.png`、`step_047.png`，已看图 |
| e32 / s31 | linux_0 | 改用 xdotool，实际返回 not found、exit 127，未恢复 | T.events[32].info |
| e33–e34 / s32–s33 | linux_0 | 向本地 HTML 追加赋值脚本并刷新；代码仍点击 (393,382)，而实际 Submit按钮约在 x715–795、y394–433 | T.events[33:35].action；终态截图 |
| e35 / s34 | global/linux_0 | 声称已提交并done；末图账号/代码正确，但仍在原始表单；保存的提交状态为fail | `artifacts/linux_0/screenshots/step_054.png`，已看图；T.events[35]；E.evaluators[0].actual |

早期“填不进去”**后来已经恢复**，不能用它解释最终失败；未完成的是实际提交。最终原始分辨率截图与最后点击坐标可直接对照，并非仅凭缺少最后验证步骤。没有证据把此例归为验证码获取失败或 Linux键盘普遍坏掉；“键盘失败”是轨迹中的 agent 猜测，不是分析结论。

边界：本例记录了 HTML 源文件改写，因此不宜作为最干净的正文示例；这里不因该操作本身新增违规评分。未独立查看服务器原始请求体，但最终点击未命中、页面状态和历史提交检查相互支持。可考虑基于实际屏幕尺寸的目标定位、区分“已填入”和“已提交”的状态，本轮不验证其效果。

## M2：连续不合法输入调用触发适配器结束，网页未打开（附录候选）

- 模型：Mobile-Agent-v3.5（GUI-Owl-1.5-32B-Instruct）。
- task_id：`a2l_contact_otp_web_form`；selected attempt：`012_a2l_contact_otp_web_form`。
- 证据根目录：`runs/core200-rerun-20260826/mobile-agent-v3.5-gui-owl15-32b/PC-20260130VLZZ/run_01/012_a2l_contact_otp_web_form`。
- [历史轨迹](../../../runs/core200-rerun-20260826/mobile-agent-v3.5-gui-owl15-32b/PC-20260130VLZZ/run_01/012_a2l_contact_otp_web_form/trajectory.json)。原始/采用 FAIL，4 步、6 协调轮，335.891 秒；R 记录 `done`，但由适配器协议错误阈值触发，不是模型自然完成。
- 目标：`android_0` 取 OTP、`android_1` 取联系人，在 `linux_0` 打开 `/home/user/web/client.html` 填写并提交。局部完成仅能确认打开 Contacts并两次点击；不据点击本身声称已成功读取完整联系人。

| 事件/区间 | 设备/层级 | 动作与实际结果 | 可回查证据 |
|---|---|---|---|
| e1–e6 / s0–s2 | android_1 | 打开Contacts，两次点击；没有 android_0 或Linux的已执行step | T.events[1:7] |
| e7 / 协调轮3 | Linux工具接口 | `computer_use` 的 action=type，却只传 keys=[ctrl,l]；缺少文本，被拒绝 | T.events[7].model_response、.diagnostics.coordination_errors |
| e8–e9 / 协调轮4–5 | Linux工具接口 | 将路径放入keys，仍缺文本，连续报 `mobile_agent_computer_type_text_missing` | T.events[8:10] |
| e9–e10 / s3 | adapter/global | 第三次拒绝后出现 `protocol_error_limit_reached_requesting_evaluation`，生成done | T.events[9].diagnostics.coordination_errors；T.events[10] |
| 终态 | linux_0 | Chrome仍为 about:blank，并非已提交的客户表单；提交检查fail | `artifacts/linux_0/screenshots/step_004.png`，已看图；E.evaluators[0].actual |

必要网页交付明确未执行，不能把所有 `done` 都解释成模型过早宣布成功，也不能以4步推断高效率。原因定位到模型输出与适配协议之间，不是网络请求/API额度问题。未保存每轮完整输入schema，因此不宣称接口文档已被模型充分理解；可研究输入错误的可恢复转换，但不在本轮修改协议或重跑。

## 成功对照（不计入失败案例）

### S1：Gemini，l2_csv_to_json

证据根目录：`runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/007_l2_csv_to_json`；[轨迹](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/007_l2_csv_to_json/trajectory.json)。原始/采用 PASS，score=1，3步。

T.events[1] 从 linux_0 读到同样三条订单；events[2] 在linux_1执行多行Python写JSON，exit 0；events[3] done；E.evaluators[0]保存PASS。完整动作序列已读，没有使用共享cache中的当前 orders.json 冒充历史产物。它排除“该同任务跨Linux写入必然不可行”的过强解释；不证明两次运行的系统状态完全一致，也不作为Mobile运行已完成的证据。

### S2：Gemini，sh3_explicit_control_plain_light_dimming_infeasible_0013

证据根目录：`runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013`；[轨迹](../../../runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/trajectory.json)。原始/采用PASS，score=1，2步。

T.events[1]针对准确的 `bedroom_light_1` 报告不支持调光，反馈记录报告已创建；events[2] done；E.evaluators[0]保留相同报告并PASS。它说明本任务完成不等同于“找任意一盏灯调到35%”，而可以正确处理不可执行请求。没有把这个单例扩展为模型的普遍安全性优势。

## 排除记录与有限疑点记录

这些记录仍保留在完整200条分母和CSV中，原始/采用分数不变。排除仅指不把它们作为能力失败证据。

| ID | 模型、task_id、selected attempt | 实际看过的材料与排除理由 |
|---|---|---|
| X1 | Gemini，`linux_only_249`，`178_linux_only_249` | 读过完整5步动作/反馈：bug_notes要求APP-加4位ASCII数字；修复命令采用 `APP-[0-9]{4}`；T.events[4].info.stdout为 `12 passed`，但R=FAIL/0。存在具体评分疑点，无独立真实失败证据。不读共享cache补证，不新增改判。 |
| X2 | Gemini，`linux_android_1320`，`043_linux_android_1320` | 完整4步及E显示写入“Recipe blocked…”和芝麻油过敏理由，supplier_order absent；得分0.5。未发现与公开必要结果独立矛盾的事实，失败涉及名称/语义短语要求，不作为真实能力失败，不重新审计。 |
| X3 | Crab，`sh4_time_schedule_study_focus_sequence_feasible_0030`，`193_sh4_time_schedule_study_focus_sequence_feasible_0030` | 完整8步/10轮及E：最初3轮双动作拒绝，后来已经分两步创建21:20灯光、21:40净化器计划。初始错误已恢复；未来亮度命令是否同时实现开灯，现有执行回读未独立确认。不把早期拒绝或等待直接当最终原因。 |
| X4 | Crab，`linux_smarthome_028`，`132_linux_smarthome_028` | 完整20步及E：所需late_vacuum计划已取消；又停烘干机、降低净化器档位，触发保护性检查。额外修改有事实依据，但“必要目标未完成”不够干净，且涉及范围约束解释；本轮不采用、不改分。 |

X1/X2的根目录使用上述Gemini前缀，X3/X4使用Crab前缀，末级目录如表。每条完整路径也在 `execution_results.csv` 的 `run_ref`、`trajectory_ref`、`evaluator_trace_ref` 中。未发现的裁决不能被假设为不存在；若之后补充明确适用的历史裁决，应更新独立分析采用层，而非把这些疑点自动改成PASS。
