# Android 全 APP Setup 与 Evaluator 审查指南

更新日期：2026-08-22  
适用范围：冻结的 Human Validation 1000 中所有含 Android 设备的任务

## 1. 文档用途与结论边界

这份文档用于审查和修改 Android 任务，重点回答两件事：

1. setup 预期写入的状态，是否真的写进了目标 App 使用的存储，并能被普通用户从真实 UI 中看到、找到和打开；
2. evaluator 是否从正确设备、正确存储、正确路径和正确记录读取结果，并能接受普通 GUI 操作产生的有效结果、拒绝无操作和现实错误结果。

它不是任务文案设计评分表，也不是“所有任务已经逐条通过”的证明。目前冻结范围包含：

- 1,000 个 manifest 任务；
- 775 个实际声明 Android 设备的任务；
- 15 个规范化 Android APP/surface；
- 69 个生成的合同标签，其中 5 个是父级聚合标签，实际覆盖分母为 64 个非冗余合同。

截至本指南编写时，真实 UI 代表任务已建立 63/64 个非冗余合同的证据。尚未建立的一个合同是 `artifact_eval.owned_delta`：其通用实现按配置正常工作，但代表任务 `linux_android_1871` 把未向用户公开的精确 Tasks 标题和 Notes 当成接受条件，属于任务级 evaluator 设置不合理，不是 getter 读错存储。

因此，应准确理解当前状态：合同机制已被广泛覆盖，但不能据此声称 775 个任务全部逐条真机执行过，或每个任务的具体参数都必然正确。

权威清单和运行证据：

- [human_validation1000_inventory_summary.md](human_validation1000_inventory_summary.md)
- [human_validation1000_task_inventory.jsonl](human_validation1000_task_inventory.jsonl)
- [continuation_state.md](continuation_state.md)
- [human_validation1000_real_operation_report.md](human_validation1000_real_operation_report.md)
- [real_operation_report.md](real_operation_report.md)

## 2. 必须区分的四类问题

审查时先判断问题属于哪一类，修复范围完全不同。

| 类型 | 判定标准 | 典型例子 | 应修改的位置 |
| --- | --- | --- | --- |
| Setup 配置/落地错误 | 配置声称已准备数据，但目标 App 实际看不到或读到的是另一份数据 | 音频只复制进 Recorder 私有目录却没有进入 App 索引；OsmAnd 只写公共 GPX，私有加载状态仍是旧数据 | setup action、目标路径、权限、索引、App hydration 或 UI preflight |
| Evaluator 读取/绑定错误 | Agent 已通过 GUI 正确完成，但 getter 读错设备、路径、表、消息箱、记录或字段 | 检查错 SMS box；读取旧 SQLite 主文件而漏掉 WAL；把不同 waypoint 的名称和坐标拼成一次成功 | getter/evaluator 实现或任务中的 result 参数 |
| 任务级 evaluator 设计不合理 | getter 正确执行了配置，但配置要求了 instruction/可见来源没有公开的精确答案 | 自由命名 Tasks 项目，却要求一个隐藏精确标题和隐藏 Notes 模板 | 任务 evaluator 合同；改成公开的精确要求或合理的语义合同 |
| 基础设施/会话问题 | 与任务数据合同无关，导致环境未启动、设备被占用、输入中断等 | AVD 未预启动、外部进程占用 VM、ADB 连接被沙箱拒绝 | run config、会话所有权或执行环境；不要误改任务 |

关键判断：

- “evaluator 按一个不合理的精确标题拒绝结果”是设计问题；
- “evaluator 本来要读这条 Tasks 记录，却读了错误设备或错误数据库”才是 evaluator 配置/读取问题；
- “setup JSON 中有数据，但 App UI 里没有”仍然是 setup 问题，不能因为磁盘上存在文件就算成功。

## 3. 全局审查闭环

每个独立合同都应按以下顺序验证。一个 APP 名称不能替代这个闭环。

```text
ensure_app / 权限和首次启动
        ↓
写入正确原生存储或公共文件
        ↓
必要的 MediaStore / 私有库 / SQLite hydration
        ↓
真实 App UI 中可发现、可打开、内容可读
        ↓
setup/no-op 不得提前满足 scored evaluator
        ↓
人或 screen-driven agent 通过普通 UI 完成任务
        ↓
当前 evaluator 接受有效结果并拒绝现实错误结果
        ↓
cleanup 只移除任务拥有的状态并恢复隔离快照
```

### 3.1 Setup 通用要求

1. `ensure_app` 必须先于依赖该 App 的 helper。它只证明安装和基础初始化，不证明业务数据已经可见。
2. `device_id` 必须从 setup、instruction、evaluator 到 cleanup 保持一致。多 Android 设备任务尤其不能靠“第一台/第二台”的人工猜测替代 ID 检查。
3. 公共存储优先使用任务中公开的绝对路径。`/sdcard/...` 和 `/storage/emulated/0/...` 在系统层通常是别名，但 evaluator、MediaStore `relative_path` 和 App 展示名称仍要逐项一致。
4. 上传文件前应创建父目录并删除同名任务目标；媒体文件还要删除对应的精确 MediaStore 行并重新扫描。
5. provider/数据库写入后必须做 UI preflight；UI preflight 不能只重复同一个 provider getter。
6. 不要用全库清空处理本来只拥有一个对象的任务。可独占的测试快照可用 `clear`；共享状态应使用精确删除或 isolate/restore。
7. setup 不能创建 scored evaluator 所要求的最终结果。作为来源的对象应设为非评分 guard，输出在 participant 开始前必须缺失或处于明确的待处理状态。

### 3.2 Evaluator 通用要求

1. getter 必须读取用户操作真正持久化的源：provider、App 原生数据库、公共文件、MediaStore 或完整 UI，而不是“看起来相关”的替代源。
2. 同一对象的字段必须绑定在同一记录上。不能用联系人 A 的名字配联系人 B 的号码，也不能用 waypoint A 的名称配 waypoint B 的坐标。
3. 更新任务应同时验证“目标正确”和“没有复制出第二份”：使用 `require_exactly_one`、name/count guard、identity snapshot 或 exact set。
4. 集合任务要明确 `allow_unrelated` 的含义。若 instruction 要求“仅有这些”，必须关闭无关项并检查完整集合；若设备原有状态要保留，则使用隔离基线或精确 preservation guard。
5. evaluator 无法可靠读取时应返回 `unknown`、`invalid`、`mismatch` 等失败状态，不能把读取失败当成对象不存在或成功。
6. 文件扩展名、文件非空或目录中有一个文件，通常不足以证明结果正确。按任务目标选择真实解析：CSV、JSON、ZIP、图片解码、音频 codec/duration、语义文本等。
7. 精确字节摘要仅用于确实要求字节不变的来源/复制结果；用户创作或可等价表达的结果应使用结构或语义 evaluator。

### 3.3 时间、文本和集合的统一约定

- Calendar 的 `start_ts`、`end_ts` 是 10 位 epoch seconds。
- Tasks 的 `dueDate`、`hideUntil`、`created`、`modified` 是 epoch milliseconds，或允许值 `0`。
- Clock Alarm 使用 24 小时制 `hour`/`minute`；UI 可显示 12 小时制，但 getter 会规范化比较。
- 电话号码 provider identity 会清理常见显示标点；普通名称、Notes、正文不要随意放宽。
- 多数结构化文本比较会进行 Unicode/空白/大小写规范化，但“行顺序”“精确行”“字段关系”是否重要必须在合同中明确。
- `allow_unrelated: false` 表示闭合集合；不要在设备还有非任务原生项时直接使用，除非 setup 已隔离或完整声明它们。

### 3.4 当前 schema catalog 漂移

任务审查不能只依赖生成阶段的静态白名单：

- `stage5_setup.py` 的 `SUPPORTED_ANDROID_APPS` 当前没有 `chrome`，但冻结任务 `android_smarthome_510` 使用并已真实 UI 通过；
- Stage 5/6 的 action/getter 集合也落后于当前 Android runtime 和冻结任务，例如若干 media isolate/restore、audio/image/file evaluator；
- Android runtime 才是当前实际执行能力的直接来源，冻结 inventory 则是当前任务使用情况的直接来源。

在修复这些 catalog 前，若生成阶段报告“不支持”，要先核对 runtime 和冻结任务，不要直接删除有效 setup/evaluator。同时，任何新合同都应同步更新 runtime、Fake runtime、生成校验和 inventory 识别规则。

## 4. 冻结范围 APP 总表

| 分类 | APP/surface | 任务数 | 主要 setup 来源 | 主要 evaluator |
| --- | --- | ---: | --- | --- |
| 结构化 provider | Contacts | 155 | 原生联系人 provider | contact / name count / total count |
| 结构化数据库 | Simple Calendar Pro | 179 | `events.db` 原生事件 | event / event set |
| 结构化数据库 | Tasks | 251 | Tasks 原生行 | task / task status / task set / identity |
| 结构化 provider | Simple SMS Messenger | 226 | Android SMS provider | message / box count |
| 结构化 App DB | Broccoli App | 43 | `recipes` 表 | recipe / recipe set / identity |
| 时钟原生状态 | Clock | 56 | Alarm intent/DB、Timer intent/preferences/UI | alarm / alarm set / timer / timer set |
| 地图文件状态 | OsmAnd | 50 | 公共 GPX + 私有 hydration | favorite / favorite set |
| 媒体库 + App DB | Retro Music | 43 | Music 文件、MediaStore、playlist DB | playlist / count / playing queue |
| 文档文件 | Files | 249 | 公共存储文件/目录 | presence、size、digest、CSV、JSON、count、snapshot |
| 文本文件 | Markor | 252 | `Documents/Markor` 文件 | semantic note、checklist、status、exact bytes |
| 本地网页查看 | Chrome | 1 | Files 中本地 HTML | 无 Chrome 输出 getter；检查下游结果 |
| 录音 | Audio Recorder | 9 | UI import 或真实录音导出 | decoded audio file、私有副本 absence |
| 图片库 | Simple Gallery Pro | 36 | 图片文件 + MediaStore | image file / exact album |
| 拍照 | Camera | 5 | Camera UI 输出 + MediaStore | fresh decoded image/media capture |
| 绘图 | Simple Draw Pro | 6 | Draw UI 保存文件 | decoded/substantial image |

下面逐一说明。

## 5. Contacts

### 5.1 Setup 操作

推荐顺序：

1. `ensure_app: contacts`，授予 `READ_CONTACTS`、`WRITE_CONTACTS`、`GET_ACCOUNTS`；
2. 独占状态使用 `androidworld_contacts_clear`，共享状态使用 `androidworld_contacts_delete_by_number` 或 `androidworld_contact_delete`；
3. 用 `androidworld_contact_add` 写入 `name`、`number`，可选 `email`、`notes`；
4. 需要证明可见时使用 `androidworld_contact_preflight`，最后可把联系人详情页留给 participant。

`androidworld_contact_add` 的身份是“规范化姓名 + 规范化电话号码”。helper 会拒绝重复身份，并把 email/notes 写到同一个 `raw_contact_id`，随后验证 provider 与 UI helper 都只出现一个稳定身份。

### 5.2 内容注意事项

- `name`、`number` 不能为空；号码在 UI 中可能从 `5550464` 显示成 `555-0464`。
- `notes` 如果是多行或带分隔符，instruction/可见来源必须公开最终需要保留、替换或追加的规则。
- 编辑既有联系人时使用 `androidworld_contact_update` 或让 participant 打开原卡片编辑；不要删除再新建，也不要创建同名第二张卡。
- 更新允许字段为 `name`、`number`、`email`、`notes`，且 setup helper 要求匹配唯一原记录并保持数据库身份。
- 若 instruction 要求“保留旧 note 并追加”，evaluator 应检查完整最终 note 或明确的 relation，而不只检查追加片段。

### 5.3 UI preflight

`androidworld_contact_preflight` 先用 provider getter 证明记录存在，再打开 Contacts 查找精确姓名并验证可见片段。

已修复的真实问题：

- Android 会给号码加显示标点，旧 preflight 对原始数字做普通子串匹配，导致 setup 假失败；现在只对“等于合同号码的那个片段”忽略标点，姓名和 Notes 仍严格匹配。
- 连续预检两个联系人时，第二次启动可能仍停留在第一张详情页；现在只有严格等待第二个姓名失败后才 Back 一次并重试。

审查新任务时，`required_visible_text` 应包含用户实际需要读到的姓名、号码和关键 Notes；不要只放姓名。

### 5.4 Evaluator

- `androidworld_contact`：同一原生联系人上绑定姓名、号码、email、notes。
- `require_exactly_one: true`：目标身份只能有一份。
- `require_unique_name: true`：该显示姓名只能有一个原始联系人。
- `notes_exact`：规范化空白/大小写后完整匹配。
- `notes_exact_lines`：要求可见行及顺序。
- `notes_contains` / `notes_relation`：仅在 instruction 允许自然表达时使用。
- `numbers_exact`、`emails_exact`：关闭完整集合。
- `androidworld_contact_name_count`：防止编辑任务复制出同名卡。
- `androidworld_contact_count`：只在 setup 明确拥有完整联系人集合时使用。

错误读取时 provider getter 应失败关闭；不能把 provider 不可读解释为联系人数量 `0`。

### 5.5 Cleanup

独占快照可 clear；共享设备按号码或完整身份删除任务联系人。更新既有联系人时，cleanup 应恢复原字段，不能简单删除用户原联系人。

## 6. Simple Calendar Pro

### 6.1 Setup 操作

1. `ensure_app: simple calendar pro`，授予日历读写权限；
2. 独占快照用 `androidworld_calendar_clear`，共享状态用 `androidworld_calendar_events_delete_by_title` 或 `androidworld_calendar_event_delete`；
3. `androidworld_calendar_event_add` 写入 `title`、`start_ts`、`end_ts`，可选 `location`、`description`、repeat/reminder 字段；
4. 对用户要读取的事件使用 `androidworld_calendar_event_preflight`。

首次安装时数据库可能尚不存在；clear helper 会建立可用空 schema。不能把“数据库文件不存在”直接当成清理成功后可写。

### 6.2 时间与内容注意事项

- `start_ts`/`end_ts` 必须是 epoch seconds，不是 milliseconds。
- instruction 的日期、时区和 epoch 必须在 AVD 当前时区下显示为同一个本地时间。不要从另一时区直接换算后只改 evaluator。
- 已有真实故障：任务希望 UI 显示 10:30，却把 evaluator 写成了在基准 UTC AVD 中显示 02:30 的 epoch；修复必须同步 task、episode config、正负 oracle，而不是放宽 getter。
- 标题是常见 identity，但同标题不同时间的事件很常见。集合 evaluator 的 `identity_fields` 通常至少使用 `title + start_ts`。
- location、description 中的坐标、订单号等完整事实应直接出现在可见来源里。
- 搜索 preflight 的 `search_text` 只能使用适合 `input text` 的 `[A-Za-z0-9._-]+`；它只是进入事件的方式，不应替代完整字段验证。

### 6.3 UI preflight

`androidworld_calendar_event_preflight` 要求数据库中标题、开始时间、地点和描述的精确记录数为 1；随后打开 Calendar 搜索，要求列表中显示标题和描述，进入详情后再次核对标题、地点、描述并确认日期非空。

如果 provider/数据库正确而 UI 日期错误，应先查 epoch/时区；如果 UI 完全找不到，再查 App 数据库路径、强停/重开和搜索文本。

### 6.4 Evaluator

- `androidworld_calendar_event`：验证一条事件；可用完整 description、contains 或 relation。
- `androidworld_calendar_event_set`：对多事件做一对一匹配，拒绝重复 expected identity 或重复实际 identity。
- `allow_unrelated: false`：要求完整事件集合闭合。
- `forbidden_events`：明确禁止错误时间、旧标题或不应创建的事件。
- `unique_identity_fields` / `identity_fields`：必须能够唯一定位每条事件。

更新任务应验证旧版本不存在、新版本恰好一条；仅检查新标题“存在”会放过复制。

### 6.5 Cleanup

共享状态按标题+时间删除；只有任务明确独占日历快照时才全 clear。重复事件必须先判明身份，不能模糊删除所有同标题日程。

## 7. Tasks

### 7.1 Setup 操作

1. `ensure_app: tasks`；
2. 独占状态使用 `androidworld_tasks_clear`，共享状态先 `androidworld_tasks_delete_by_title`；
3. `androidworld_task_add` 写入 title、notes、importance、dueDate、hideUntil、completed 等；
4. 更新原对象的任务可先 `androidworld_task_identity_snapshot`，再让 participant 编辑，或在 setup 阶段用 `androidworld_task_update`；
5. 来源任务使用 `androidworld_task_record_preflight`；空状态/删除状态可用 `androidworld_task_backend_preflight`。

### 7.2 字段与内容注意事项

- `dueDate`、`hideUntil`、`created`、`modified` 使用 epoch milliseconds 或 `0`。
- `completed` 在任务 JSON 中常见 `0/1`，evaluator 可按布尔语义检查；保持同一任务内一致。
- importance、due time、hidden time 等只有 instruction 或可见来源提出时才应评分。
- 编辑现有任务时必须保持 `_id`/`remoteId` 身份；不要新建同标题对象代替。
- Notes 中“requested → completed”之类状态迁移应拒绝旧状态残留和互相冲突的两行。

### 7.3 UI preflight

`androidworld_task_record_preflight` 先通过 backend getter 要求唯一任务，再打开 Tasks，找到标题、必要时进入详情并核对 `required_visible_text`。

`androidworld_task_backend_preflight` 使用一个应已删除的 sentinel 标题确认 backend 可读且目标真的不存在。`NOT_FOUND` 与 backend/schema/timeout 错误是不同状态，不能混为“没有任务”。

### 7.4 Evaluator

- `androidworld_task`：单任务字段或语义状态。
- `androidworld_task_status`：区分 `FOUND`、`NOT_FOUND` 和基础设施错误。
- `androidworld_task_set`：完整或允许无关项的任务集合；支持 forbidden tasks。
- `identity_snapshot`：更新必须仍是 setup 的同一行。
- `notes_exact`/`notes_contains`：只适合公开的精确模板或短片段。
- `notes_relation`/`record_relation`/`whole_text_lines`：用于公开事实允许自然措辞、但仍需绑定状态和字段关系的任务。

审查重点：不要把 evaluator 内部偏好的标题或 Notes 模板当成“唯一正确答案”。`linux_android_1871` 的普通 GUI 结果被拒绝，就是因为 task-set 和 owned-delta 都要求未公开的精确标题/notes；getter 本身没有读错。

### 7.5 Cleanup

新建任务按精确标题删除；更新原任务应恢复快照。若标题本身允许自由表达，不要用标题作为 cleanup 唯一身份，应该在设计阶段提供公开稳定 ID 或隔离完整 Tasks store。

## 8. Simple SMS Messenger

### 8.1 Setup 操作

1. `ensure_app: simple sms messenger`；setup 会授予 SMS/Contacts 权限、AppOps，并把它设为默认 SMS role holder；
2. 独占状态用 `androidworld_sms_clear`，共享状态按 address 或完整 message 精确删除；
3. incoming 来源用 `androidworld_sms_receive`，sent 来源用 `androidworld_sms_send`；
4. 用 `androidworld_sms_message_preflight` 从 thread list 进入会话并核对正文。

### 8.2 写入注意事项

- `address` 和 `body` 必须非空。
- inbox 与 sent 是不同 box；instruction 的“收到”和“发送”必须与 setup/evaluator 一致。
- Simple SMS 的 sent 消息必须有原生 `thread_id`。裸插入一个 `thread_id = null` 的 sent provider 行可能被 getter 看到，却不会出现在 App 对话列表；当前 helper 会先解析或建立规范 thread。
- 多行正文不能只注入首行。当前 receive helper 会建立 anchor 后把 provider body 更新为完整精确多行文本。
- 地址显示可能带空格/连字符；aliases 要明确、非空、互不重叠，不能让一个号码同时命中两个合同。

### 8.3 UI preflight

preflight 先验证 provider 行，再打开 App；若 thread list 已显示正文可直接通过，否则点开精确 address 的 thread，再要求所有关键正文片段可见。

只在 provider 中存在但没有 thread/card 的 setup 应判失败，这一点与 Audio Recorder 的“私有文件存在但库中不可见”是同一类问题。

### 8.4 Evaluator

- `androidworld_sms_message`：按 box、address 和同一行 body 匹配。
- `body`：精确正文；`body_contains`：公开固定片段；`body_relation`：自然语言事实与关系。
- `body_prefix`：大小写敏感的开头 ownership marker，不能与其他正文匹配方式混用。
- `any_address` 只能和受控 prefix ownership 一起使用；不要做无边界全 SMS 搜索。
- sent 消息默认 recent window 为 5 分钟，使用设备时钟并容忍约 60 秒未来偏差。
- `require_exactly_one_per_address`、`require_exactly_one_in_box`、`exact_count` 用于“只发一次”。
- `androidworld_sms_box_count` 可检查 all/inbox/sent 的全局数量；只有 setup 已清空或隔离对应 box 时才可靠。

对于 `send_highest_only` 一类任务，既要检查正确收件人/正文，又要检查 sent box 总数恰好 1；否则发对一条再多发错误消息也会通过。

### 8.5 Cleanup

独占状态可 clear；共享设备按 address 或精确消息删除。cleanup 后应同时检查 SMS provider 和 thread 展示不残留任务会话。

## 9. Broccoli App（Recipes）

### 9.1 Setup 操作

1. `ensure_app: broccoli app`；
2. 独占状态用 `androidworld_recipes_clear`，共享状态用 `androidworld_recipe_delete_by_title` 或内容范围更窄的 delete；
3. `androidworld_recipe_add` 写入原生 `recipes` 表；
4. 更新任务可使用 `androidworld_recipe_identity_snapshot` 和 `androidworld_recipe_update`；
5. 来源 recipe 用 `androidworld_broccoli_recipe_preflight` 打开详情。

### 9.2 字段与内容注意事项

原生字段包括：

- `title`
- `description`
- `servings`
- `preparationTime`
- `source`
- `ingredients`
- `directions`
- `favorite`

`favorite` 必须是 `0` 或 `1`。这里的 favorite 是 recipe 收藏状态，不要与 OsmAnd favorite 混淆。

Ingredients 通常以分号或换行序列化。若任务关心配料事实而不关心排版，使用 `normalize_ingredient_facts`，保留 quantity/unit/name 的事实并允许分数和常见单位别名；若 instruction 规定原样模板才使用精确字符串。

Directions 的步骤顺序通常有业务含义；实现可规范化编号、项目符号和分号，但 evaluator 不应忽略顺序。`preparationTime` 可在明确启用时规范化 `min/mins/minute`。

### 9.3 UI preflight 与 evaluator

preflight 先要求数据库中恰好一个匹配 recipe，再打开 Broccoli，点入标题并验证详情关键片段。

- `androidworld_recipe`：单 recipe，并可 `require_exactly_one`；
- `androidworld_recipe_set`：标题唯一的一对一集合，可配置 forbidden recipes 和 `allow_unrelated`；
- identity snapshot：重命名/更新后仍必须是同一个 `recipeId`。

更新任务要验证旧标题消失、目标只剩一个、无关 recipes 原样保留。仅“新标题存在”不够。

### 9.4 Cleanup

共享状态按唯一 title/内容合同删除或恢复 identity snapshot；不要清空用户整个 recipe 库。

## 10. Clock

Alarm 和 Timer 是两个不同 surface，必须分开审查。

### 10.1 Alarm setup

1. `ensure_app: clock`；
2. 独占状态用 `androidworld_clock_clear`，共享状态用 `androidworld_alarm_delete`；
3. `androidworld_alarm_add` 通过 `SET_ALARM` 写入 `hour`、`minute`、`label`，可选 `enabled`；
4. 多 alarm 来源使用 `androidworld_clock_alarm_set_preflight`。

规则：

- hour 为 0–23，minute 为 0–59；
- label 会按大小写和连续空白规范化，但不要故意制造近似标签；
- `enabled` 必须是 boolean；显式 disabled 时 helper 会同步 Google Clock 原生 DB，并验证唯一 row 和 one-shot recurrence；
- 同时间、同标签的重复 alarm 是歧义，应由 `reject_identity_duplicates` 拒绝。

### 10.2 Alarm evaluator

- `androidworld_alarm`：一条 alarm；
- `androidworld_alarm_count`：同一 identity 数量；
- `androidworld_alarm_set`：完整集合、一对一匹配、forbidden alarms、enabled、one-time；
- `allow_unrelated: false` 通常只关闭当前相关集合；`exact_user_visible_set: true` 才表示完整 UI 卡片集合；
- `one_time: true` 需要 provider/DB 明确报告 recurrence。UI 看不到 recurrence 时必须 `unknown`，不能猜。

getter 优先读取 provider/Google Clock DB，失败时才完整扫描 Alarm UI。UI 只看到部分卡片或滚动不完整时不得断言不存在。

### 10.3 Timer setup/evaluator

- `androidworld_timer_add` 使用 hours/minutes/seconds 计算正总秒数并通过 `SET_TIMER` 创建；
- minutes 和 seconds 应在 0–59，时长必须大于 0；
- `androidworld_timer_delete` 只能删除 duration 唯一匹配的 timer；重复相同时长应判歧义；
- `androidworld_timer` 和 `androidworld_timer_set` 先明确导航到 Timer tab，并遍历完整计时器列表；不能因 Clock 共用 `DeskClock` Activity，就把 Alarm 标签 `25m Timer` 误认成 timer；
- evaluator 比较配置的初始 duration identity，而不是不断变化的剩余秒数。

真实审查经验：不要用会在人工操作期间自然到期的 running timer 作为长任务的稳定 source guard。`android_only_243` 的计时器 source guards 因自然到期返回 `unknown`，后来保留稳定 Markor 来源并移除了时间敏感 guard；这属于 evaluator 选择不稳定，不是 Timer getter 读错。

### 10.4 Cleanup

优先精确删除 alarm/timer；全 clear 只用于独占 Clock 状态。cleanup 需考虑 disabled factory templates，不要把 App 固有模板当成任务残留。

## 11. OsmAnd Favorites

这是 setup 最容易出现“文件写了，但 App 没加载同一份状态”的 APP。

### 11.1 实际存储

规范公共文件：

`/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`

OsmAnd 4.6.x 使用的私有加载/备份文件：

`/data/data/net.osmand/files/favourites_bak.gpx`

evaluator 会按顺序尝试公共 `/storage/emulated/0`、其 `/data/media/0` 别名和私有备份。但 setup 的成功标准不是“其中任一文件存在”，而是公共数据、私有 hydration 和真实 Favorites UI 一致。

### 11.2 GPX 写入格式

一个 favorite 必须是同一个 `<wpt>` 中绑定的 name、coordinates 和可选描述/地址：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1"
     creator="Field Planner"
     xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="47.6205" lon="-122.3493">
    <name>Depot Gate</name>
    <desc>Corrected from 47.6100,-122.3300 using Calendar</desc>
    <extensions>
      <osmand:address xmlns:osmand="https://osmand.net">100 Depot Way</osmand:address>
    </extensions>
  </wpt>
</gpx>
```

写入注意事项：

- latitude 必须在 `[-90, 90]`，longitude 必须在 `[-180, 180]`，且为有限数；
- name 去掉首尾空白后不能为空；
- name、lat/lon、description、address 必须在同一 waypoint 中；
- XML 特殊字符必须转义；
- 不要只在文件其他位置出现目标字符串来“满足” getter；
- 同名 favorite 默认应唯一。若已有同名不同坐标，应明确更新/删除旧项，而不是再追加一个。

### 11.3 Setup 方式

方式 A：完整来源 GPX。

1. `ensure_app: osmand` 完成地图、权限和 onboarding；
2. 需要保留用户状态时先 `androidworld_osmand_favorites_isolate`；
3. `androidworld_osmand_favorites_setup` 创建空公共 GPX 并同步空私有备份；
4. `upload_file` 把完整 GPX 放到规范公共路径；
5. 强停/重开并执行 `androidworld_osmand_favorites_preflight`，让 App 实际加载并验证私有 store 与 UI。

方式 B：setup helper 添加一项。

1. 先隔离，或精确删除任务同名项；
2. `androidworld_osmand_favorite_add` 写 name、lat/lon，可选 description/address；
3. helper 强停 App，并把公共 GPX 原子 hydration 到私有备份；
4. 如该 favorite 是用户来源，再执行 UI preflight。

当前实现有一个必须知道的路由细节：Android runtime 中存在两个同名 `androidworld_osmand_favorite_add` 分支，后一个唯一性保护实现不可达；实际执行的是前面的 append 实现。它支持 description/address，但会直接追加。因此，在修复 runtime 分支前，任务必须通过 isolate/empty setup 或精确 delete 保证没有旧同名项，并用 exact-set evaluator/preflight 拒绝重复。

### 11.4 UI preflight

`androidworld_osmand_favorites_preflight` 做三层检查：

1. 打开 OsmAnd 后读取私有 `favourites_bak.gpx`，要求完整 expected set、精确 name 和约 `1e-7` 坐标；
2. 从 Menu → My Places → Favorites 展开收藏列表，要求每个 name 可见；
3. 逐项进入详情，要求同一项显示 name 和坐标，可接受十进制或 N/S/E/W 表达。

已修复的真实问题：OsmAnd 第一帧可能忽略 Menu tap；preflight 现在使用 tap-and-wait retry。新 UI 版本如果菜单名或资源 ID 改变，不能只因为公共 GPX 正确就跳过 UI 失败。

### 11.5 Evaluator

- `osmand_favorite`：兼容型单项检查；name 使用相似度阈值，coordinates 容差默认 0.001°。同时给 name 和 coordinates 时必须由同一 waypoint 满足。
- `osmand_favorite_set`：首选严格合同。name 规范化后精确、coordinates 在 `coordinate_tolerance` 内，并可要求同一 waypoint 的 `description_exact`/`description_contains`、`address_exact`/`address_contains`。
- description 的 exact 和 contains 不能同时配置；address 同理。
- 每个 expected favorite 必须唯一匹配一个 actual waypoint；`allow_unrelated: false` 要求完整集合数量和内容相等。

对“修改 favorite”任务，应至少检查：旧坐标不再作为同名项存在、正确坐标恰好一项、描述/来源若被要求则绑定在同一项。

### 11.6 Cleanup

优先使用 `androidworld_osmand_favorites_restore` 恢复隔离前公共和私有状态。若任务明确拥有空库，可删除公共 `favorites.gpx` 和私有 `favourites_bak.gpx`；不要只删其中一个。

## 12. Retro Music

### 12.1 Music library setup

1. `ensure_app: retro music`；
2. 独占状态可 `androidworld_retro_music_clear`；
3. `androidworld_mp3_push` 向 `/storage/emulated/0/Music/<title>.mp3` 写入真实可解析 MP3；
4. 对每个文件发送 MediaScanner broadcast，并触发 Retro Music 扫描；
5. `androidworld_retro_music_library_preflight` 同时验证 MediaStore 和 Songs UI。

Retro Music 会过滤过短音频。默认 helper 使用音乐长度的真实 MP3（通常约 60 秒）；不要用几百毫秒 smoke clip 作为可见歌曲。文件名、ID3 title 和 preflight 的 song title 必须一致。

### 12.2 Playlist setup

- `androidworld_retro_playlist_add` 写 App 的 `playlist.db`，playlist name 规范化后必须唯一；
- 若同名 playlist 恰好一个，helper 更新其 membership，而不是再建一个；若同名多份则失败；
- SongEntity 中 title、顺序、data path 应对应已存在的 Music 文件；
- 共享 playlist store 使用 `androidworld_retro_music_playlists_isolate/restore`，或按 name/完整 songs 精确删除。

SQLite 可能有 WAL/SHM。setup 和 evaluator 都要读取一致快照、checkpoint 后发布完整数据库，不能只复制旧 main file。

### 12.3 UI preflight

preflight 首先要求 MediaStore 中每首歌恰好一行：filename、`relative_path: Music/`、title、`audio/mpeg` 一致；然后打开 Retro Music Songs 页面，完整滚动并确认 required songs、forbidden songs。

它还可：

- 验证 playlist 创建入口存在；
- 打开 required playlist 并要求每首歌恰好可见一次；
- 激活一首歌后核对完整 playing queue 顺序；
- 拒绝 forbidden playlist names。

### 12.4 Evaluator

- `retro_music_playlist`：playlist name 唯一；可按顺序比较歌曲，或按 multiset 比较。
- `order_sensitive: true` 仅当 instruction 提到顺序、播放序列或源列表顺序时使用。
- `allow_unrelated: false` 要求整个 playlist store 只有该列表。
- `retro_music_playlist_count`：数据库可读时返回原生 playlist 数量，否则 `unknown`。
- `retro_music_playing_queue`：按顺序比较当前 queue；queue 是瞬态/易变状态，只有任务真正要求播放状态时才评分。

### 12.5 Cleanup

删除精确 Music 文件后还要更新 MediaStore；playlist DB 用 isolate/restore 或精确 playlist 删除。不要只删 MP3 留下空 playlist，也不要只清 playlist 留下任务音乐污染后续 UI。

## 13. Files（Android DocumentsUI）

### 13.1 Setup 操作

`android files`、`android file` 会规范化为 `files`。典型顺序：

1. `ensure_app: files`；
2. 创建公开父目录并删除精确任务文件；
3. `upload_file` 写入完整本地 asset；
4. 媒体文件执行精确 MediaStore 清理和 scanner；普通文档通常可直接由 DocumentsUI 读取；
5. 使用 `androidworld_files_directory_preflight` 证明目录、完整文件名和可选正文可见。

### 13.2 Source 可见性

Files preflight 会先在文件系统验证 expected files 存在、missing files 不存在，然后用 DocumentsUI directory URI 打开目录，要求每个 expected filename 在当前视口合同中恰好一次。若指定 `open_filename`，它会打开文件并验证 `required_visible_text`；出现“选择打开方式”时可选择一次。

因此：

- source 文件“上传成功”不等于用户能从 Files 找到；
- 目录名、文件名和 instruction 中路径必须逐字一致；
- 若文件实际由 Markor/Chrome 等 viewer 展示，仍要验证从 Files 的普通点击路径可达；
- 对长列表要确认 preflight 是否完整滚动，不能只检查当前首屏。

### 13.3 Evaluator 选择

| 目标 | 应用 getter | 注意事项 |
| --- | --- | --- |
| 存在/缺失，或可选原文 | `android_file_state` | 精确绝对路径；`include_content` 才返回正文 |
| 非空/空/缺失 | `android_file_size_state` | 只适合目标确实只关心存在和非空 |
| 精确字节复制/来源保留 | `android_file_sha256_state` | 只用于字节身份；路径必须是受支持公共存储 |
| 文件数量 | `android_file_count` | 明确 recursive、suffix 和大小写规则；目录必须由任务拥有或先快照 |
| CSV | `android_csv_state` | header 精确规范化且只能出现一次；所有行列数一致；声明顺序是否重要 |
| JSON | `android_json_file` + `json_semantic_match` | 读取精确 path；解析失败返回 `None`，不能退化为文本包含 |
| 目录/文件保留或移动 | `android_filesystem_snapshot_state` | setup 与 evaluator 必须在同一 runtime/episode 使用同一 snapshot_id |
| ZIP 内容 | `android_archive_file_state` | 比较完整 member set 和 member bytes，而不是压缩顺序/元数据 |

文件输出的 path、device_id、instruction 公开路径必须完全一致。一个常见错误是 setup 上传到 `/sdcard/Download/...`，evaluator 却读取另一个设备或 `/Documents/...`。

### 13.4 Cleanup

删除精确任务文件和任务创建的空目录。若移动/复制任务要求保留来源，用 filesystem snapshot guard；cleanup 不应删除来源。媒体文件同时清理精确 MediaStore 行。

## 14. Markor

### 14.1 Setup 操作

1. `ensure_app: markor`，授予读写公共存储和 `MANAGE_EXTERNAL_STORAGE`；helper 对首次启动有可见 UI 恢复路径；
2. 来源笔记上传到 `/storage/emulated/0/Documents/Markor/...`；
3. 输出笔记开始前删除精确目标，或使用 owned-artifact snapshot；
4. `androidworld_markor_note_preflight` 先 `cat` 精确 path，再通过 Markor file URI 打开并验证可见片段。

preflight 支持 `.md`、`.markdown`、`.txt`。路径必须在 `/storage/emulated/0/` 下；只在错误目录放一个同名文件不算成功。

### 14.2 内容设计

- instruction 明确给定文件名时，evaluator 可要求精确 path；若允许自由命名，应使用任务拥有目录/内容发现机制，而不是隐藏文件名。
- 公开模板要求精确行时可用 exact lines/whole-text lines；自然语言交接应使用 entity/relation evaluator。
- entity 出现不代表关系正确。订单号、旧值、新值、来源和状态应在同一语义段或 relation group 中绑定。
- 对更新状态的笔记，要设置 conflict/forbidden phrases，拒绝同时保留 `requested` 和 `completed`。
- Markdown 标题、项目符号和标签分隔符是否严格，必须由可见来源决定；不要把 evaluator 内部偏好变成隐藏格式要求。

### 14.3 Evaluator

- `android_entity_relation_note`：实体、关系组、正向/冲突短语、required/conflict patterns，并可通过 `section_start`/`section_end` 限定段落。
- `android_change_note_state`：语义上的旧值→新值变化。
- `android_named_status_note`：命名对象和状态关系。
- `android_markdown_checklist_state`：复选框结构与状态。
- `android_file_sha256_state`：仅用于要求来源字节原样保留。
- `androidworld_owned_artifact_delta`：可限制仅允许明确 Markor paths 发生变化。

读取精确 path 失败时语义 getter应失败，不能在整个 Markor 目录里找一段相似文本代替。

### 14.4 Cleanup

删除精确任务笔记，或用 owned-artifact restore 保留允许路径的 participant 结果并恢复其他 Markor 文件。不要递归清空整个 `Documents/Markor`，除非任务运行在明确的独占快照。

## 15. Chrome（Android）

冻结范围只有一个 Chrome surface：`android_smarthome_510`。Chrome 是本地 HTML 来源 viewer，不是最终输出存储。

### 15.1 Setup 与可见性

1. 上传完整 HTML 到 instruction 公开的 Downloads 路径；
2. 让 Files/MediaScanner 能发现文件；
3. `ensure_app: chrome`；
4. 真机从 Files 点击 HTML，在 Chrome 中确认表格、文本和本地资源可读；
5. 最终 evaluator 检查 Tasks 和 SmartHome 结果，不应把 Chrome 来源本身计为得分。

注意：

- `ensure_app` 依赖 AndroidWorld 的 Chrome mapping，但当前 Stage 5 静态 APP 白名单缺少 `chrome`，属于 catalog 漂移；
- 不要让本地 HTML 依赖外网、登录态或未上传的相对资源；
- 如果任务要求从 Files 打开，setup 不能直接把 Chrome 留在已打开答案页面而绕过 discoverability；
- 目前没有 Android Chrome 专用结果 getter，所以不要设计书签、历史、下载状态等输出，除非先新增并真机验证相应合同。

## 16. Audio Recorder

需要区分“setup 导入一个可见录音来源”和“participant 新录音输出”。

### 16.1 导入可见来源

正确流程：

1. `ensure_app: audio recorder`；
2. `androidworld_audio_recorder_delete_by_name` 清理同名 App row、trash row、公共 source、私有 destination 和 MediaStore row；
3. 上传真实 `.m4a` 或 `.wav` 到公共 `/sdcard/Recordings/...`；
4. 触发 audio MediaStore scan；
5. `androidworld_audio_recorder_import_preflight` 通过 Recorder 的 Import → DocumentsUI 选择文件；
6. 打开 Recorder Information，验证 name、format、带单位的 size、Location filename，并确认私有 destination 非空。

合同必须严格一致：

- `filename` 是纯 basename；
- `name` 等于 filename stem；
- source_path 和 destination_path 的 basename 都等于 filename；
- format 仅为当前 helper 支持的 `m4a` 或 `wav`，并与后缀一致。

只把文件复制到
`/storage/emulated/0/Android/data/com.dimowner.audiorecorder/files/Music/records/`
并不能证明 App 列表可见。已有真实任务曾出现“私有文件在磁盘上存在，但 Audio Recorder UI 没有该录音”；来源必须走真实 Import 或建立并验证完整 App 索引。

### 16.2 Participant 新录音输出

推荐流程：

1. 用 `androidworld_media_isolate`，`kind: audio_recorder`，保存并隐藏已有私有录音；
2. 精确删除目标公共路径和对应 MediaStore row；
3. 打开 Audio Recorder，participant 通过 UI 录制、停止、命名、`Save as...`；
4. 必要时再通过 Files 把导出文件移动到 instruction 指定公共路径；
5. evaluator 解码真实文件并检查 format、codec、duration、exact path；
6. cleanup 删除目标并 `androidworld_media_restore`。

真实 UI 注意事项：

- 当前 `ensure_app` 不总能预先消除 Audio Recorder onboarding；首次输出任务必须在真实环境确认 onboarding 可完成，最好增加稳定初始化/preflight，而不是默认直接出现录音按钮。
- `Save as...` 可能直接使用 Files 的上一次目录而不弹目的地选择；instruction 给定精确路径时要确认 participant 有可见的二次 move 流程。
- Files 曾把 `.m4a` 显示为 `MP3 audio`，而 Recorder Information 和实际解码确认是 M4A/AAC。不要用 Files 的宽泛类型标签替代 codec evaluator。

### 16.3 Evaluator

`android_audio_file_state` 应至少配置：

- exact `path`；
- `allowed_formats`，M4A 常接受容器探测名 `mov/mp4/m4a`；
- `allowed_codecs: [aac]`；
- 合理 `min_duration_s`/`max_duration_s`；
- 必要时 `exact_parent_basenames`、`distinct_paths` 和 `require_regular_file_no_symlink`。

evaluator 会实际 pull 并用 ffprobe 或 Mutagen 解码，要求有真实 audio stream、packet/sample、非空和时长。改扩展名、零字节 placeholder 或无音轨容器不能通过。

除非 instruction 明确要求录音内容，不要转写或评价声音语义；冻结任务通常只要求真实短录音、路径、格式、时长和数量。

### 16.4 私有库 absence 与 cleanup

不要用“Recorder 私有目录总文件数为 0”证明用户已删除录音。真实 App 会留下 `.m4a.del` tombstone，并预创建零字节下一录音 placeholder。正确做法是检查目标私有 basename 不存在，或检查可见 Records 列表，而不是把 App 自有文件当成用户残留。

## 17. Simple Gallery Pro

### 17.1 Seeded media setup

1. `ensure_app: simple gallery pro`；
2. 精确删除目标文件和匹配 `_display_name + relative_path` 的 MediaStore row；
3. 上传真实 PNG/JPEG 到公共图片目录；
4. 对每个文件发送 `MEDIA_SCANNER_SCAN_FILE`，等待索引；
5. 用 Properties、OCR text 或 album UI preflight 证明 App 可见。

`relative_path` 必须带尾 `/`，例如 `DCIM/Camera/Delivery Receipts/`。MIME 与后缀要一致：PNG 对 `image/png`，JPG/JPEG 对 `image/jpeg`。

### 17.2 三类 preflight

- `androidworld_gallery_media_details_preflight`：要求 MediaStore 恰好一行，打开 Gallery Properties，显示完整 filename、非零 size 和带单位的大小；MIME 由同一 MediaStore row 绑定。
- `androidworld_gallery_image_text_preflight`：只支持 PNG；先证明 Gallery 打开，再在 host 对同一文件 OCR，要求每个公开短语可识别且字高占比达到 `min_text_height_ratio`。用于 setup 来源可读性，不是 participant 输出的隐藏文字答案。
- `androidworld_gallery_rename_preflight`：建立临时 probe，确认当前 Gallery 版本真的有 Rename dialog，然后清理 probe。只在任务要求 Gallery rename 时使用。

### 17.3 Evaluator

- `android_image_file_state`：精确 path，真实解码、format、dimensions，可选 freshness 和非空视觉约束。
- `android_image_album_state`：目录的完整直接子文件集合必须等于 `files`；逐个解码，可选 digest、递归和 `require_media_store_visible`。
- 若任务声称结果必须在 Gallery 可见，必须启用 MediaStore visibility 或做真实 UI 结果检查；仅文件系统存在不够。
- source album guard 应为 non-scoring，避免 setup 文件贡献任务得分。

### 17.4 Cleanup

同时删除任务文件和精确 MediaStore rows。共享 album 不能整目录删除；可用 media isolate/restore 或 exact album guard 保留其他图片。

## 18. Camera

### 18.1 Setup

`ensure_app: camera` 除安装外还必须把 `WRITE_MEDIA_IMAGES` 和 `WRITE_MEDIA_VIDEO` AppOps 设为 allow。真实审查曾发现 Camera 能预览却无法持久化，原因就是这两个 AppOps 被拒绝；当前共享 setup 已修复。

若任务要求新拍摄：

1. 隔离 Camera 实际输出目录，或建立任务-owned freshness marker；
2. 删除精确目标文件和 MediaStore row；
3. 打开 Camera，participant 通过可见 shutter 操作；
4. 通过 Files/Gallery 完成可见 move/rename；
5. evaluator 验证新文件而不是任一旧图。

不要假设所有镜像都保存到 `/sdcard/DCIM/Camera`。一次真实运行中受支持 Camera 实际发布到 `/sdcard/Pictures`，任务的 isolation、cleanup 和 evaluator 必须与该镜像的真实输出同步。若 participant 随后移动到公开目标，则 evaluator 检查最终目标，并用 marker/隔离证明它是本轮新捕获。

### 18.2 Evaluator

- 已知文件名目标：`android_image_file_state`，配置 format、最小尺寸、`newer_than_path` 和必要的非空像素约束。
- App 自选文件名：`android_media_capture_state`，要求与 isolation namespace/kind 对应、exact count、MediaStore 完整可见、文件比 capture marker 新且真实解码。
- 普通 creative photo 不应由机器识别主题；机器检查新鲜度、格式、尺寸和非空，主题/构图由人类视觉审查。

## 19. Simple Draw Pro

### 19.1 Setup 与保存

1. `ensure_app: simple draw pro`；
2. 创建公开目标父目录，精确删除目标文件和可能的 MediaStore row；
3. participant 通过可见 canvas 绘制，使用 Save/Save As 选择公开路径和格式；
4. 必要时由 Files/Gallery 证明最终路径可见。

不要在 setup 上传一个接近答案的图片作为画布并让 scored evaluator 只检查它仍存在；setup baseline 不得满足输出。

### 19.2 Evaluator 与视觉范围

`android_image_file_state` 应检查：

- exact path；
- 真实 PNG/JPEG 格式，不只看扩展名；
- 最小 width/height；
- `min_opaque_fraction`；
- 对“需要明显绘制”的任务，可用 `min_distinct_colors`、`min_foreground_fraction`、grid cells 拒绝空白画布和角落小点。

这些像素阈值只能证明有实质、分布合理的视觉内容，不能暗中要求特定词语、图标、颜色、构图或主题。开放式设计的语义质量仍需 human visual check；若可见 brief 明确要求文字，可另外使用公开文本 OCR 合同。

### 19.3 Cleanup

删除精确输出文件和 MediaStore row，不清空整个 Pictures。若有用户原图作为输入，加入 non-scoring preservation guard。

## 20. 跨 APP 的 Owned Artifact Delta

`androidworld_owned_artifact_snapshot` / `androidworld_owned_artifact_delta` 当前支持：

- Tasks；
- Markor；
- sent SMS。

setup 在 participant 开始前以 `snapshot_id` 保存原始状态；evaluator 允许只有 `allowed_task_titles`、`allowed_markor_paths` 和 `allowed_sent_sms` 发生声明内变化，其余状态必须与 baseline 相同。sent SMS 使用完整原生行区分 baseline 和新增记录，并要求新增记录与允许合同一对一匹配。

注意事项：

- snapshot 和 evaluator 必须在同一 runtime episode；进程重启后内存 snapshot 不存在；
- allowed task title/path/address/body 必须由 instruction 或可见来源公开；
- 允许列表是 ownership 边界，不应被当成隐藏答案模板；
- 自由命名输出不适合用 exact title 作为唯一 allowlist，除非先改变任务设计，提供公开稳定名称；
- generic delta 返回 `changed` 不等于实现故障，要先看是非任务状态真被改了，还是 task evaluator 的 allowlist 设计得过窄。

## 21. 当前已知问题与历史修复

| 状态 | APP/层 | 发现 | 审查含义 |
| --- | --- | --- | --- |
| 已修复 | Contacts setup preflight | UI 电话标点导致假缺失；连续详情页停留 | 新任务仍要包含 provider + UI 双证据 |
| 已修复 | OsmAnd setup preflight | 第一帧 Menu tap 被忽略 | 使用 tap-and-wait retry，不放宽数据合同 |
| 已修复 | Calendar task 参数 | epoch 按错误时区生成，GUI 10:30 被 evaluator 当成错误 | instruction、setup、eval、oracle 必须共享 AVD 时区 |
| 已修复 | Camera setup | AppOps 阻止持久化；任务还假定错误输出目录 | 真机确认权限和实际发布目录 |
| 已修复 | Audio Recorder evaluator | 私有目录 tombstone/placeholder 导致“目录非空”假失败 | 检查目标副本或可见库，不检查目录绝对为空 |
| 已修复 | SMS setup | sent provider row 缺 thread_id 时 App 不可见 | setup 必须建立原生 thread |
| 已修复 | 跨设备 setup | `linux_android_1005` 的 Linux `/home/oai/...` 不可写 | 这是来源路径 setup 错误，不是 Android Contacts 错误 |
| 尚存设计问题 | Tasks + owned delta | `linux_android_1871` 要求未公开精确标题/notes | 改 task evaluator 设计，不改 getter |
| 尚存执行注意 | Audio Recorder setup | `ensure_app` 不总能消除 onboarding；Save as 可能复用上次目录 | 增加真实初始化/可见性验证，保留 Files move 路径 |
| 尚存 catalog 问题 | generation validators | Stage 5/6 白名单落后于 runtime/冻结任务，含 Chrome 和媒体合同 | 不以旧白名单单独判定 task 无效；后续应同步 catalog |
| 尚存 runtime 路由问题 | OsmAnd setup | 重复 `favorite_add` 分支使唯一性实现不可达，实际为 append | add 前隔离/删除，并用 exact set 拒绝重复 |

## 22. 单个任务的审查记录模板

对每个任务复制以下模板填写。没有证据的项不要写“通过”。

```markdown
### <task_id>

- Android devices / serial binding:
- APP/surface:
- setup mechanism:
- evaluator mechanism:
- cleanup mechanism:

#### Setup 落地

- 预期写入对象：
- 实际 provider/DB/path/MediaStore：
- 权限、默认角色、首次启动：
- backend 精确状态：
- App UI 中的查找路径：
- UI 中实际可见的字段：
- setup 是否提前满足 scored evaluator：否 / 问题说明

#### Participant 真机操作

- 仅使用普通 UI 的操作：
- 最终 UI 状态：
- 未使用 oracle/脚本/ADB 创建结果：是 / 否

#### Evaluator

- getter 读取的 device/source/path：
- 同记录字段绑定：
- 唯一性/集合闭合：
- 有效 GUI 结果：pass / fail
- setup/no-op：reject / 错误
- 现实负例：reject / 错误
- 失败分类：setup / evaluator plumbing / evaluator design / infra

#### Cleanup

- 删除或恢复的任务-owned 状态：
- 无关状态保留证据：
- cleanup_ok：
- evidence paths：
```

## 23. 最终放行标准

一个 Android task 只有在以下条件同时成立时，才能标记为 setup/evaluator 合同通过：

1. 目标 App 能在指定 Android 设备打开，必要权限、默认 role 和 onboarding 已处理；
2. setup 状态不仅存在于后端，而且能从 instruction 指定 App 的正常 UI 被发现、打开和读取；
3. setup/no-op 不会得到 scored success；
4. 人或 screen-driven agent 能在不知道 evaluator 隐藏参数的情况下，通过正常 UI 完成任务；
5. evaluator 从相同设备和真实持久化源读取，并把同一对象的字段绑定在一起；
6. 有效结果通过，至少一个有意义的无操作或现实错误结果被拒绝；
7. evaluator 的精确性全部来自 instruction 或可见来源，不包含隐藏答案；
8. cleanup 只处理任务拥有的状态，保留或恢复无关数据；
9. 运行证据记录了真实 UI 步骤、结果、失败边界和当前 task hash/attempt，而不是 oracle 或 parse-only 检查。

如果第 2 项失败，是 setup；第 5 项失败，是 evaluator plumbing；第 7 项失败，是 evaluator 设计。三者不能互相替代，也不能用“整体 score 为 0”笼统归因。
