# A.3 Dataset Composition and DevicesWorld-Lite Selection

## 1. 先固定统计对象与版本

本资料采用两个明确的对象，不能把两者都称为同一个“最终冻结版本”：

1. **全池目录库存**：2026-09-24 读取实验工作树 `/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826` 中按设备组织的七类目录。该口径与既有构建说明中的 5,897 对得上；不是本轮从 GitHub 拉取或发布认证。
2. **Lite-200 实验用配置**：沿用已有正式执行选择记录中的 200 个 task ID，逐条读取其正式 GPT-5.5 attempt 的冻结 `config/task.json`，按真实 `devices` 字段分组。Lite manifest 提供选取家族、理由与历史标签。该操作不使用模型得分决定任务入选，不引入评分改判。

可复查材料：[汇总统计](data/dataset_statistics.json)、[Lite 逐任务索引](data/lite200_task_index.json)、[两份工作树的任务库存](data/task_pool_inventory.json)。

## 2. 统计口径：为什么是 5,897，而不是 6,240

纳入七个正式设备目录：`cross_device/android_only`、`linux_only`、`linux_android`、`android_smarthome`、`linux_smarthome`、`linux_android_smarthome`，以及 `smarthome/generated`。

本轮识别“任务配置”的文件条件为 JSON 中有字符串 `id/instruction` 和数组 `devices/evaluation`。资源目录、episode 配置、scripted solution 和清单不计入。此规则只做配置库存识别，**不是重新验证全部任务 schema 或真机可执行性**。

该实验工作树得到 **5,897 个配置、5,897 个不同 ID**。这不等价于 5,897 个经过语义去重的独立用户场景；本轮没有把模板派生任务的语义独立性作为已证实事实。

宽口径扫描共有 6,240 个 task-shaped JSON。差出的 343 个为：旧 real100/200/300 集合 300 个、real20 20 个、cross_device 根目录 7 个、其他 android/linux/example/fake/SmartHome 示例 16 个。旧 real* 集合还作为 topology views 的来源被复制到设备目录，不能再次加进同一正式任务数。

根工作树 `/Users/lht/home/MDCBench` 对应七类目录只有 **5,197** 个，Android+Linux 为 1,176，而实验工作树为 1,876；净差 700。其余类别计数相同不代表逐条内容相同。论文不能把这两个副本的统计拼在一起，本轮也没有尝试同步或覆盖任一副本。

## 3. 主要分布表：一律按设备组合

SmartHome 在配置中的 device type 为 `home`。下面统计运行端点/设备类别，而非灯、传感器、房间等实体数量。

| 设备组合 | 全池配置数（实验工作树） | Lite-200 数量 | Lite 占比 |
| --- | ---: | ---: | ---: |
| Android only | 372 | 20 | 10.0% |
| Linux only | 371 | 18 | 9.0% |
| Android + Linux | 1,876 | 67 | 33.5% |
| Android + SmartHome | 1,018 | 25 | 12.5% |
| Linux + SmartHome | 1,010 | 30 | 15.0% |
| Android + Linux + SmartHome | 970 | 30 | 15.0% |
| SmartHome only | 280 | 10 | 5.0% |
| **合计** | **5,897** | **200** | **100.0%** |

| 配置中的设备端点数量 | 全池 | Lite-200 |
| --- | ---: | ---: |
| 1 | 280 | 10 |
| 2 | 3,106 | 95 |
| 3 | 1,853 | 66 |
| 4 | 658 | 29 |
| **合计** | **5,897** | **200** |

Lite 的 Android-only 与 Linux-only 均为双设备任务，“only”限制的是设备类别，不是只用一台设备。200 条里有 190 条配置了至少两个运行端点；10 条 SmartHome-only 各配置一个 home 端点。一个 home 端点可以管理多个智能家居实体，不能把端点数解释为实际 IoT 设备数量。

范围上，材料支持三种环境类别、七种组合及 1–4 个运行端点。Android/Linux 引擎的 13/14 类可选 surfaces 见 A.2；这些 sampler 类型不能直接代替全池实际 app 数、每个 surface 真机覆盖率或去重后的能力数。

## 4. Lite-200 的实际选取方式

现存证据支持 **配额约束 + 质量筛选 + 覆盖/多样性考虑 + 审查修复/替换**，不是全池均匀随机抽样。按可追溯记录，可描述为：

1. 从当时可用的不同任务来源家族建立候选；来源既包括旧 seed collections，也包括按设备组织的任务与 SmartHome scripted 集合。
2. 固定家族配额，总数 200。要求自然用户指令、声明的 setup/assets 完整、非空且面向结果的 evaluation、可 smoke 条目的 oracle/scripted-solution 依据，以及家族内 surface/capability 多样性。
3. 逐条保存 task ID/path、family、难度/覆盖标签、`selection_reason` 和 `quality_score` 等选取记录。
4. 对入选任务进行审查与维护：可以原 ID 修复或重设计；必要时替换重复性较高的任务并维持配额/覆盖。任务保存在原始任务路径，Lite 目录保存引用清单，不是再复制 200 个任务。
5. 后续实验使用这套身份集合的维护后任务配置。**选取身份、选取时标签、后来任务内容和运行快照是不同层级。** 当前工作树的 5,897 数量不能反推出初始选取时也恰好有 5,897 个候选。

### 家族配额只用于溯源，不作为主要设备分组

| 历史选取来源家族 | 配额/入选数 |
| --- | ---: |
| real100 | 8 |
| real200 | 10 |
| real300 | 12 |
| linux_android | 45 |
| linux_android_smarthome | 30 |
| linux_smarthome | 30 |
| android_smarthome | 25 |
| android_only | 15 |
| linux_only | 15 |
| smarthome_generated_scripted | 10 |
| **合计** | **200** |

real100/200/300 是历史集合名称；既有 selection report 明确说明它们是 mechanically generated seed tasks，不是“真实用户采集”或“人工编写”的证明。其中 30 条在主要分布中已经并入实际设备组合，所以最终 Android-only 是 20 而非 15、Linux-only 是 18 而非 15、Android+Linux 是 67 而非 45。

### 可直接引用的替换实例

既有 selection report 记录了三条 Linux-only 替换：

| Lite 索引 | 旧任务 → 新任务 | 当时记录的原因 |
| --- | --- | --- |
| 184 | `linux_only_248` → `linux_only_313` | 减少重复的 Python 修复/测试/日志任务，引入 browser → Writer 会议纪要 |
| 189 | `linux_only_261` → `linux_only_327` | 引入跨设备表格与发布归档核对 |
| 190 | `linux_only_260` → `linux_only_331` | 引入 VLC 当前状态验证与非破坏性的跨设备交接 |

这支持“覆盖导向策展”的描述。另有大量原 ID 修复，不应把每次修复算成新增任务，也不应把同 ID 当作内容从未变化的证据。

## 5. 难度和 surface 标签的正确用法

清单难度分布是 **easy 42（21%）、medium 108（54%）、hard 50（25%）**。这是 **manifest 的选取/维护标签**，不是本轮依据轨迹测得的难度，也不等于冻结任务 JSON 的 `metadata.difficulty`：后者仅 30 条有 Simple/Medium/Complex 标签，其余 170 条没有该字段。

原清单 surface 标签是多标签且命名粒度不统一，例如 `tables` 和 `csv/xlsx`、`documents` 和 `pdf`、`media_audio` 和 `audio` 并存。本轮保留原标签和频次，未擅自合并或把其计数和说成任务总量。可以定性说明覆盖文件/表格/文档、消息/联系人/日历、浏览器/代码、图片/音频、地图以及智能家居控制/状态/计划等；若论文要报告“覆盖 N 个 apps/surfaces”，还需要统一命名后逐条确认实际配置支持。

不采用旧 selection report 的 surface 总表作为新统计：其 `files=162` 等与当前清单实际计数（`files=147`）并不一致。这是记录版本/标签漂移，不应静默拼接。

## 6. 已有发布记录的时间边界与尚缺材料

旧 selection/smoke 报告标为 final，并记录其当时版本 200/200 lifecycle/oracle smoke 通过；当前 manifest 却标为 `maintenance_pending_calendar_osmand_and_evaluator_revalidation`，并保存 2026-08-11 的日历时间戳问题与 8 条待完整复跑记录。不能仅凭旧报告写“本次统计的全部配置已经再次验收通过”。后来的正式实验冻结配置又是另一层证据，旧 pending 文本本身也不能反过来证明后续主实验无效。

本轮仅说明这个状态差异，不重做主实验评分审计，不执行新的 smoke，不修改旧清单状态。若投稿要写精确的 release QA 通过比例，应先指定公开 release 与匹配的验收记录；本资料不代替该发布决定。

尚未定位到最初 Lite 选择器的完整可执行实现或 `quality_score` 公式，因而不能补写随机种子、排名权重、贪心算法或全池入选概率。现存记录足以复原最终入选列表、配额、逐条理由与替换实例，**不足以从任意候选池一键重演初始选取**。未找到 train/dev/test 划分依据，也不应自行补充这种划分。

## 7. 可直接用于正文的中文概括

> 在所分析的实验工作树中，按设备组织的七个正式任务目录包含 5,897 个不同任务 ID。我们采用设备组合而非历史来源集合进行主要统计，避免把旧集合及其组织后的任务视图重复计入。用于主实验的 DevicesWorld-Lite 包含 200 个策展式选取并持续修复的任务，覆盖 Android、Linux 和 SmartHome 七种组合；其中 190 个任务涉及至少两个运行端点。Lite 的选取采用来源家族配额，并兼顾用户指令质量、资源和评测完整性、以及 surface/capability 多样性，而非对当前全任务池作均匀随机抽样。

使用上述文字时，论文发布的数据包应与本节统计对象对齐；本轮的库存识别不构成全量可行性认证。
