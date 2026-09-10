# DevicesWorld 失败模式补充验证（本机三 baseline）

## 1. 范围、方法与完成情况

本轮严格沿用三套正式 canonical selected attempts：UFO³ + GPT‑5.5、Qwen3.7‑plus、UI‑Venus‑1.5‑30B‑A3B。没有重跑任务、连接设备、调用外部 judge、修改 evaluator 或改变正式成绩。抽样前先从每个 baseline 当前记录为 FAIL 的 selected attempts 中排除上一轮已实质精读案例、已知评分争议和不合格历史 attempt，再以固定种子无放回抽取 50 条；三份名单在查看新增轨迹内容前一次性冻结。

本轮共完成 150/150 条随机核查。每条均读取冻结 task snapshot、result、完整动作/反馈序列和 evaluator trace；仅对两个拟用展示案例额外复看了保存截图，其他记录没有伪称逐张看图。上一轮 8 个定向失败任务、同任务 PASS 对照、三系统共同成功对照及两条已知评分疑点按原审阅证据复用，并与新随机样本分开标记。

- `ufo3-gpt-5.5`：旧随机样本 0，本轮新抽样 50，目标 50，实际完成 50；其中 supported_failure=42、scoring_question=8、uncertain=0。
- `qwen3.7-plus`：旧随机样本 0，本轮新抽样 50，目标 50，实际完成 50；其中 supported_failure=41、scoring_question=9、uncertain=0。
- `ui-venus-1.5-30b-a3b`：旧随机样本 0，本轮新抽样 50，目标 50，实际完成 50；其中 supported_failure=49、scoring_question=1、uncertain=0。

合计有 18 条标为 `reviewed_evidence_limited`，均为新增 `scoring_question`。最后一轮校正把能够从完整动作序列和产物读回定位到具体评分契约疑点的记录从 `uncertain` 转为 `scoring_question`；同时把确实未写入工作簿的 UI‑Venus `linux_smarthome_796` 确认为 supported failure。本轮最终没有保留无法说明边界的 `uncertain`，但这不等于对 18 条疑点完成了重新评分。这些条目仍占原 50 条配额，不替换、不改分，也不计作某个失败模式的支持。

抽样框是“未被上一轮实质精读且材料可检查的记录性 FAIL”，不是全部 FAIL 的简单概率样本；三个 baseline 等额抽取也不是按失败总量配比。因此下表的 runs/tasks 数只描述当前证据覆盖，不能转换为失败率、原因占比或模型排名。

## 2. 模式支持与处理意见

| 候选主题 | 旧定向证据（运行/任务/baseline） | 新随机证据（运行/任务/baseline） | 处理意见 |
| --- | --- | --- | --- |
| H1：局部执行未推进必要状态 | 6 runs / 5 tasks / qwen3.7-plus, ufo3-gpt-5.5, ui-venus-1.5-30b-a3b | 78 runs / 66 tasks / qwen3.7-plus, ufo3-gpt-5.5, ui-venus-1.5-30b-a3b | 适合正文重点讨论，但正文需保留导航停滞、重复失败动作和单设备预算固着等子类型边界。 |
| H2：信息、对象与设备对应关系出错 | 3 runs / 3 tasks / ui-venus-1.5-30b-a3b | 2 runs / 2 tasks / ufo3-gpt-5.5, ui-venus-1.5-30b-a3b | 仅限缩保留：新增支持只有两个不同任务且子类型不同，适合作为有边界的 binding 案例，不足以声称三 baseline 的共同模式。 |
| H3：部分结果正确但必要动作或交付未闭合 | 4 runs / 3 tasks / qwen3.7-plus, ui-venus-1.5-30b-a3b | 48 runs / 41 tasks / qwen3.7-plus, ufo3-gpt-5.5, ui-venus-1.5-30b-a3b | 适合正文重点讨论；以明确通过的局部 outcome 与缺失交付之间的对照为证据。 |
| S1：UI-Venus adapter／动作契约特定故障 | 0 runs / 0 tasks / — | 26 runs / 26 tasks / ui-venus-1.5-30b-a3b | 重复证据很强，但只应作为 UI‑Venus baseline-system 的 adapter／动作契约问题单列。 |
| S2：UFO³ 完成提交／重规划接口特定故障 | 2 runs / 2 tasks / ufo3-gpt-5.5 | 0 runs / 0 tasks / — | 保留为 UFO³ 的系统个例或附录，不与 S1 合并，也不外推到所有任务。 |

### H1：局部无进展阻断后续

新增样本在不同任务中重复观察到三种可区分的表象：持续重试同一无效 GUI 动作、长时间固着于一个设备而其他必要设备未启动、以及已收到明确错误反馈后仍没有切换策略。清楚例证包括 `ufo3-gpt-5.5 / linux_android_1264 / attempt_001`、`qwen3.7-plus / linux_android_1264 / run_01`、`qwen3.7-plus / android_only_267 / run_01`、`ui-venus-1.5-30b-a3b / android_smarthome_265 / run_01`、`ui-venus-1.5-30b-a3b / linux_android_943 / run_01` 与 `ui-venus-1.5-30b-a3b / linux_only_249 / run_01`。它们共同支持“必要状态没有推进并造成下游缺失”这一阶段级描述，但不支持把坐标问题、元素索引失效、命令错误和全局调度都说成同一个内部根因。

上一轮 UFO³ 的 `al_calendar_schedule_conflict` 仍是调度型主案例：49 次环境动作全部留在 Android，独立 Linux 产物未开始。新增 Qwen `linux_android_1264` 更适合作为普通 policy 的本地 Calendar 导航停滞补充；UI‑Venus 的大量循环则必须同时受 S1 边界约束。

### H2：信息／对象／设备绑定错误

H2 的新增支持比初稿更窄。UFO³ `sh2_implicit_intent_nursery_air_comfort_infeasible_0011` 把 bedroom 当作不存在的 nursery 后直接改变设备；UI‑Venus `sh3_explicit_control_plain_light_dimming_infeasible_0013` 把 plain light 请求绑定到另一个 dimmable light。它们分别是房间身份与设备对象身份错误，与旧 C02 的源/目标文件命名空间错误、C06 的 Android source 被当作 Linux 文件也不是同一具体机制。

Qwen `linux_android_1312` 不再用作 H2 支持：其 ODT 包含 active site 的全部主要事实，`122.51010° W` 与 `-122.5101` 语义等价，归档 ID 只出现在“已排除”的说明句中。该记录更适合登记为 coordinate/exclude-token 评分契约疑点，不能据此声称选错了 site。因此正文若保留高层“binding”主题，必须逐例注明对象身份、房间身份或设备/文件命名空间，并明确新增随机证据只有两个任务。

### H3：局部结果已完成，但联合交付未闭合

新增证据跨越 Home+SMS、Home+Markor、文件+浏览器、归档+清单等不同结果组合，清楚例证包括 `ufo3-gpt-5.5 / android_smarthome_251 / attempt_001`、`ufo3-gpt-5.5 / linux_only_313 / attempt_001`、`qwen3.7-plus / linux_android_smarthome_025 / run_01`、`qwen3.7-plus / android_smarthome_147 / run_01`、`ui-venus-1.5-30b-a3b / android_smarthome_147 / run_01` 与 `ui-venus-1.5-30b-a3b / linux_only_327 / run_01`。其中 UFO³ `android_smarthome_251` 的 Home 灯光和窗帘三项最终检查通过，但 SMS 仍缺失；本轮实际查看的末段截图也显示线程中只有来信、composer 为空。Qwen `linux_android_smarthome_025` 的 Home restore workflow 通过，而 Markor note 未保存，末段截图停在文件浏览器。

这一主题适合正文，但措辞应是“可观察的 joint closure failure”。partial score 本身不是机制证据；只有当具体局部 outcome 与具体缺失 outcome 都被终态或轨迹支持时才纳入。

### S1/S2：系统与接口特定机制

UI‑Venus 新样本反复出现 adapter/动作契约层的可观察错误，包括 Linux 设备收到不受支持的裸 `click`/`type`、Android 元素索引在当前 control set 无效、缺失 device envelope，以及无效 schedule shape 被原样重试。代表例 `linux_android_943` 在 linux_0 上连续 50 次提交不允许的 `click`，每次反馈均为 `invalid_action_type`，其他设备与目标产物均未推进。这可作为系统特定主展示案例，但不能据此写成 UI‑Venus 基础模型的一般跨设备推理缺陷。

UFO³ 的旧 C04（`linux_android_1798`）仍是另一种接口问题：正确写文件命令与 `FINISH` 同返却没有形成环境 action。C08 则是重规划绕过了源端修改约束。二者可以保留为附录或框架实现讨论，但目前不应与 UI‑Venus 的 action-schema 拒绝合并成一个“大模型不会操作工具”主题。

## 3. 不符合原主题、未确定项与新发现

- 新增评分疑点共 18 条。UFO³ 8 条：`sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016`、`linux_smarthome_361`、`linux_android_1312`、`sh1_state_inquiry_bathroom_humidity_feasible_0001`、`a2l_osmand_calc_visit`、`sh5_event_schedule_plain_light_dim_after_dryer_infeasible_0016`、`linux_smarthome_567`、`linux_android_1863`。Qwen 9 条：`linux_android_1312`、`linux_smarthome_932`、`linux_smarthome_361`、`android_smarthome_219`、`sh5_event_schedule_plain_light_dim_after_dryer_infeasible_0016`、`linux_android_1859`、`linux_smarthome_372`、`sh6_coordinated_schedule_missing_guest_room_workflow_infeasible_0016`、`linux_only_224`。UI‑Venus 1 条：`android_smarthome_219`。
- 疑点主要有三类：语义合理的 SmartHome answer/infeasible report 因 category alias 或报告通道未被接受；自然等价的坐标、时间、表头或业务措辞不在 evaluator alias 中；轨迹写入并读回了与 expected cells/anchors 表面一致的 DOCX/XLSX/ODT 内容，但 evaluator 仍返回零。完整逐条依据在 `additional_reviews.jsonl`，本轮只登记、不改分，也不用这些记录支持能力失败机制。
- 最后一轮不再保留 `uncertain`。这只是说明每条已被放入“有直接执行失败证据”或“有具体评分疑点”之一，不表示完成了原始产物级评分审计。尤其 18 条疑点仍需要另一个只读 scoring audit 才能决定是否改判。
- UI‑Venus `linux_smarthome_796` 经动作级复核后确认为真实失败：轨迹把 audit.xlsx 转成 CSV 并打印出四行空白 Actual/Notes/Decision，随后未执行任何 workbook write/save 就结束。该条保留为 OTHER，不为了增加主题支持而硬塞进 H1–H3。
- 若干 supported FAIL 也没有被映射到候选主题：它们能确认必要结果缺失，却没有足够的过程证据支持一个重复机制。保留在 `additional_reviews.jsonl` 与 `pattern_support.csv` 的 OTHER 行，防止只报告确认性案例。
- UI‑Venus 的高重复动作是最明确的新机制，但它同时说明“终态部分失败”不能直接用于跨 baseline 比较：相同 task_id 在不同系统可能由完全不同执行链失败。

## 4. 建议的正文主题与案例

1. **保留 H1 为正文主题**。主案例继续使用旧 C01（UFO³ / `al_calendar_schedule_conflict`），新增 Qwen `linux_android_1264` 与 UI‑Venus `android_smarthome_265` 作为不同子类型支持。若展示 UI‑Venus，图注必须写明 adapter/action-contract 边界。
2. **限缩保留 H2**。主案例继续使用旧 C02（UI‑Venus / `l2_csv_to_json`）；新增 UFO³ nursery 与 UI‑Venus plain-light 两例只能作为不同层级的对象绑定支持。Qwen `linux_android_1312` 已移入评分疑点，不再作为 H2 案例。不要把 Home 内部对象选错自动称为跨设备路由。
3. **保留 H3 为正文主题**。建议将 UFO³ `android_smarthome_251` 作为新主展示：Home 最终状态 3/3 通过而 SMS 缺失，且有本轮复看的真实末段截图；旧 C03/C05 及 Qwen `linux_android_smarthome_025` 作补充。
4. **新增 S1 为系统特定小节或 limitation**。主案例 UI‑Venus `linux_android_943`；其他支持条目列于 CSV。不要将其与基础模型能力或所有跨设备 agent 混写。
5. **S2 降为框架实现个例/附录**。UFO³ C04 与 C08 机制不同且证据仍集中在少数任务，不宜单独宣称为广泛失败类型。
6. **不采用 OTHER 作为正文 taxonomy**。它只保存无法安全归类或本轮深度不足的记录，不是一个语义一致的失败机制。

可用真实素材：UFO³ `android_smarthome_251` 的 `artifacts/android_0/screenshots/step_086.png`（空 composer）；Qwen `linux_android_smarthome_025` 的 `artifacts/android_0/screenshots/step_066.png`（Markor 文件浏览器）；UI‑Venus `linux_android_943/trajectory.json` 的连续 `invalid_action_type` 反馈更适合做简短 step timeline，而不是用生成图替代原始记录。

## 5. 对上一轮 `section4_4_draft.md` 的具体修改建议

- 保留“可观察执行机制、不是互斥分类或原因占比”的方法声明，并补入本轮固定样本、排除条件和等额抽样边界。
- 保留原四段案例论证，但将第二段从单一的“数据未跨设备搬运”上收为 H2 的一个具体子类型；只新增有直接对象误绑定证据的 Home 案例，并把 Qwen ODT 移到评分边界说明。
- 将原第三段“计划对象存在不等于目标效果完整”纳入更广的 H3，但保留 C03 的原子计划效果子类型，不把所有缺失短信/文件都解释成计划校验问题。
- 原第一段不能再仅由 C01 暗示统一调度根因；新增样本支持的是更宽的“局部无进展阻断后续”，正文必须列出不同子类型和 adapter 特定边界。
- 在正文或 limitation 中单列 UI‑Venus S1。删除任何可能把非法 action schema、失效 element index 直接归因于基础模型认知能力的措辞。
- UFO³ C04 的 `FINISH`/未提交 action 保留，但降为 S2 个例；不要与 UI‑Venus action rejection 合并。
- 保留 SC01 的四设备成功对照，继续只用于否定“设备数量本身足以导致失败”，不要扩大为设备数量完全无影响。
- 新增一段评分边界：本轮 18 条 scoring questions 维持正式 FAIL、未计入模式支持，后续若单独评分审计应引用它们而不是在 4.4 中暗中改判。

## 6. 汇总边界

这份材料只代表本机三套 baseline 的旧定向案例与各 50 条固定随机核查。旧案例集与新增样本目标不同、抽样框不同，不能合算失败原因占比；相同 task_id 跨模型出现也只能算一个不同任务。当前结果支持在跨机器汇总时优先检验 H1、收窄后的 H2、H3，以及系统特定 S1；全 benchmark 最终保留哪三四个主题，仍应由四组机器的同协议结果合并后决定。
