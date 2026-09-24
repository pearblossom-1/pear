# A.1 Task Specification and Cross-Device Dependencies

## 1. 真实任务与材料

选用 **`al_calendar_schedule_conflict`，Lite 索引 4**。它属于 Android + Linux，不把历史来源 real100 当作设备类别。

- [完整冻结配置](task/config/task.json)：逐字节复制自正式 GPT-5.5 执行目录的 `config/task.json`，没有修改 setup、评测或指令。
- [初始日程表](task/resources/linux/week.csv)、[同步规则](task/resources/linux/rule.txt)。
- [Android Calendar 初始化](task/resources/android/android_calendar_setup.json)：从上述冻结配置提取；这是环境构造材料，不是 agent prompt。
- [历史源文件读取证据](evidence/historical_source_read.json)：正式执行第 0 步的命令结果，完整包含两个 Linux 源文件。复制资源与该 stdout 内容一致。
- [来源说明](evidence/original_provenance.json)。

这是一条真实存在、真实执行过的 benchmark 任务，不是本轮设计的示例。此处解释其任务规格，不分析模型是否成功，也不引用额外评分裁决。

## 2. 用户目标

原始 instruction：

> This week's meeting schedule has conflicts: Android Simple Calendar Pro and Linux `/tmp/schedule/week.csv` disagree on details for meetings with the same names. Follow `/tmp/schedule/rule.txt`: synchronize each matching meeting's date, start, end, and location from Android, leave non-matching meetings unchanged, then write `/tmp/schedule/log.json` with every field that changed and its old and new values.

中文概括：按规则以 Android 日历为权威，修正 Linux 表格中的同名会议；不修改没有对应日历事件的会议；另外保存记录旧值与新值的变更日志。

## 3. 设备分工与初始资源

| 位置 | 初始资源/状态 | 对任务的作用 |
| --- | --- | --- |
| Android `android_0` | Simple Calendar Pro 的 `Vendor planning` 事件 | 提供权威日期、开始/结束时间和地点 |
| Linux `linux_0` | `/tmp/schedule/week.csv` | 提供待纠正的旧值及需要保留的非匹配会议 |
| Linux `linux_0` | `/tmp/schedule/rule.txt` | 明确权威来源、按标题匹配、更新字段、非匹配项保留与日志要求 |
| Linux `linux_0` | `/tmp/schedule/log.json` 初始不存在 | agent 需要创建的变更记录，不是预置答案 |

Android 初始化先确保应用存在、清理日历，再加入一个事件：`Vendor planning`，时间戳 `1802530800` 至 `1802534400`，地点 `Room 8`。在本任务配置/评测采用的时间语义下，它对应 **2027-02-13，15:00–16:00**。跨设备时间解释应沿用任务与设备约定，不能擅自用宿主机本地时区换算后替代。

初始 CSV 的全部内容：

```text
title,date,start,end,location
Vendor planning,2027-02-13,09:00,10:00,Room 2
Ops sync,2027-02-14,11:00,11:30,Room 4
```

规则文件明确 Simple Calendar Pro 是 source of truth，匹配标题后同步 `date/start/end/location`，其余会议不动；`log.json` 记录每个变化字段的 old/new。

Linux setup 清理并创建该任务目录、上传两个源文件、检查输入可读与输出位置可写，并检查日志不存在；cleanup 清理日历及该任务目录。这里只说明既有配置，未执行这些命令。

## 4. 必要的跨设备依赖

```text
Android Calendar：权威事件 ───────────┐
                                   ├─ 按标题匹配并按权威规则纠正
Linux rule.txt：匹配/同步/保留规则 ───┤          │
Linux week.csv：旧值和其他会议 ──────┘          ├─ Linux week.csv：更新后的完整表
                                              └─ Linux log.json：old → new
```

Android 并非一个只出现在配置里的“装饰设备”：仅看 Linux 初始 CSV 无法得知目标时间和地点。Linux 也不能被省略，因为它同时提供旧值、范围与交付位置。最终产物都在 Linux，不代表这是一条 Linux-only 任务；设备依赖应按信息来源和操作关系识别，而不是只按输出位置识别。

这条任务同时包含权威来源判断、同名实体匹配、冲突纠正、非目标保留及多产物一致性；这里是对本条任务的解释，不是给整个数据集重新冻结一套分类。

## 5. 用户要求与实际评测的对应

配置含两个计分 evaluation 项，均读取 Linux 上最终持久化文件。

| 用户要求 | 可见依据 | 评测配置及范围 |
| --- | --- | --- |
| 同名会议采用 Android 的日期/时间/地点 | 日历事件 + `rule.txt` | `evaluation[1]`：`check_csv` 检查 `Vendor planning` 的五列目标值 |
| 不修改未匹配会议 | 初始 `Ops sync` 行 + 保留规则 | 同一 CSV 检查要求 `Ops sync` 保持原日期、时间与地点 |
| 保存完整更新表，不随意添加/丢失会议 | 初始两行及同步目标 | `exact_logical_rows: true`，期望两条逻辑记录；`order_sensitive: false`，不要求行顺序 |
| 记录每个实际变化字段及 old/new | 初始 CSV + Android 目标值 | `evaluation[0]`：`check_semantic_change` 检查 JSON 日志中实体 `Vendor planning` 的 old/new 时间和地点关系 |

正确的表格结果是：

| title | date | start | end | location |
| --- | --- | --- | --- | --- |
| Vendor planning | 2027-02-13 | 15:00 | 16:00 | Room 8 |
| Ops sync | 2027-02-14 | 11:00 | 11:30 | Room 4 |

日志的语义目标为同一个 `Vendor planning` 的三个变化：`start: 09:00 → 15:00`、`end: 10:00 → 16:00`、`location: Room 2 → Room 8`。日期没有改变，所以这里不应凭空增加日期变化。

这里的目标表和 old/new 对照是给论文读者的解释，不是初始资源，也未注入设备。`check_semantic_change` 是既有的规则式关系检查，不应因名称含 semantic 就写成 LLM 主观打分。完整格式处理边界由对应版本的 evaluator 实现决定，本轮没有重做评分审计。

配置检查结果状态，不检查模型有没有采用某条指定操作路线；没有额外检查“Android 日历被修改”。任务要求 Android 作为只读权威来源。不能把上述两个结果条件推成“评测证明模型一定阅读了日历”——必要依赖是任务的信息设计，而不是对执行因果的直接证明。

## 6. 论文展示建议

建议主图放四块内容：精简用户目标、Android 权威事件、Linux 初始表+规则、Linux 目标表+三项日志变化。`Ops sync` 原样保留这一行值得保留，能直观说明任务不是简单覆盖整个文件。

建议图注：

> **Task specification and cross-device dependency.** The Android calendar supplies authoritative meeting details, while the Linux schedule supplies the conflicting values and the reconciliation rule. The agent must update the matching row, preserve the unmatched meeting, and persist an old-to-new change log. Evaluation checks the resulting schedule and change relations, rather than a prescribed action sequence.

补充边界：冻结任务里 `limits` 是 26 步/260 秒；这不等于主实验 runner 的有效预算。不要直接拿任务内默认值代替实验协议中的实际限制。
