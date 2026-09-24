# R01-R35 生成任务真机 Smoke 测试记录

记录对象：`runs/generation_engine_probe/stress_gpt5mini` 中 R01-R35 selected task 的代表性真机 setup smoke。

测试命令使用 `scripts/smoke/run_generated_setup_smoke.py`。该 smoke 只验证真实 runtime 上的 `start -> reset/setup -> evaluate -> cleanup`，不注入正例 oracle。合理结果是 runtime 能执行，且 setup 后任务目标仍未完成：`before_success=false`，score-enabled goal evaluator 的 `before_score=0.0`。

## 已通过样本

| 样本 | task_id | 拓扑 | 覆盖点 | 结果 |
| --- | --- | --- | --- | --- |
| R15/sample_000001 | `generated_create_a_requested_simple_draw_image_from_an_audio_brief_and_record_confirmation_001` | A+A | Audio Recorder、Android Files、Simple Draw Pro | `runtime_ok=true`，setup 后 `before_success=false`，`before_score=0.0` |
| R09/sample_000017 | `generated_collect_order_photos_into_confirmed_album_and_record_them_in_the_orders_spreadsheet_001` | A+A+L | Android Gallery/file copy、Linux xlsx evaluator、guard 不计分 | `runtime_ok=true`，setup 后 `before_success=false`，`before_score=0.0` |
| R06/sample_000001 | `generated_create_osmand_favorite_from_sms_and_confirm_by_reply_001` | A+A | OsmAnd favorite、Simple SMS Messenger | `runtime_ok=true`，setup 后 `before_success=false`，`before_score=0.0` |
| R04/sample_000001 | `generated_create_a_tasks_app_task_summarizing_a_retro_music_playlist_001` | A+A | Retro Music 多 playlist source、Tasks | 修复 Retro helper 后 `runtime_ok=true`，setup 后 `before_success=false`，`before_score=0.0` |
| R20/sample_000001 | `generated_create_a_potluck_sized_broccoli_recipe_from_a_family_recipe_001` | A+A | Broccoli source recipe、自然语言请求 recipe、目标 recipe evaluator | 修复可见 source 中的 evaluator/spec 痕迹后 `runtime_ok=true`，setup 后 `before_success=false`，`before_score=0.0` |
| R35/sample_000007 | `generated_create_an_osmand_favorite_for_a_delivery_photo_001` | A+A | Simple Gallery Pro 图片 source、OsmAnd injected favorite、目标 OsmAnd favorite/marker | `runtime_ok=true`，setup 后 `before_success=false`，`before_score=0.0`；日志中有 OsmAnd `chcon Permission denied`，但 runtime 已兼容并完成评估 |
| R22/sample_000005 | `generated_create_requested_badge_drawings_and_save_to_specified_android_devices_001` | A+A | Android Files source 入口、Simple Draw Pro 图片输出、negative guard 不计分 | 明确 Android Files 入口并把拼错 badge missing 检查改为非计分 guard 后 `runtime_ok=true`，setup 后 `before_success=false`，`before_score=0.0` |
| R27/sample_000013 | `generated_create_a_simple_draw_sketch_listing_the_top_three_songs_from_a_retro_music_playlist_001` | A+A | Retro Music playlist source、Markor 文本输出、Simple Draw Pro 图片输出 | 修复 Simple Draw 文本产物误用和 MP3 文件名 `&` shell quoting 问题后 `runtime_ok=true`，setup 后 `before_success=false`，`before_score=0.0` |

结果目录：

- `runs/generated_setup_smoke_r01_r35_selective/round1/`
- `runs/generated_setup_smoke_r01_r35_selective/round1_rerun/`
- `runs/generated_setup_smoke_r01_r35_selective/round2_unique/`
- `runs/generated_setup_smoke_r01_r35_selective/round3_r20_broccoli/`
- `runs/generated_setup_smoke_r01_r35_selective/round4_r35_gallery_osmand/`
- `runs/generated_setup_smoke_r01_r35_selective/round5_r22_simpledraw_files/`
- `runs/generated_setup_smoke_r01_r35_selective/round6_r27_retro_draw_markor_rerun/`

## 发现并修复的问题

1. `scripts/smoke/run_generated_setup_smoke.py` 原来按 `sample_000001` 这类目录名写结果，不同轮次同名 sample 会互相覆盖。已改成 `sample__task_id` 形式，后续 smoke 记录可追溯。
2. `androidworld_retro_playlist_add` helper 原来每次添加 playlist 都会先清空 Retro Music DB，导致同一 setup 中多个 playlist 只保留最后一个。已改成按 `playlist_name` 覆盖/新增单个 playlist，清空只由 `androidworld_retro_music_clear` 负责。
3. VMware 命令默认超时 20 秒对双 Linux 启动偏短，已把默认 `vmware_command_timeout_s` 调整为 60 秒。
4. selected 700 task 的静态 gate 又清理了一轮：修复了媒体扩展名与真实格式不一致、文本伪造 MP3、`/tmp` 可见路径、Broccoli setup 顺序、metadata 中的 stage/value_trace 构造痕迹，以及一个容易与生成流程 manifest 混淆的本地 fixture 文件名。
5. R20/sample_000001 暴露出一种更细的 source 质量问题：即使 app-visible source 能支撑任务，也不能把 `Exact description text`、`copy verbatim`、`deterministic` 这类 evaluator/spec 语言写给 agent 看。该任务已改成自然请求，并通过真实 Android setup smoke。
6. R22/sample_000005 说明 Android 路径 source 需要自然入口 app。只写 `/sdcard/DrawRequests/` 不够，应在 instruction/setup 中对齐 Android Files、Simple Gallery Pro、Markor 等真实入口。该任务已补 Android Files 入口，并确认 setup smoke 通过。
7. R27/sample_000013 暴露两类问题：Simple Draw Pro 不能当作文本 note surface；`androidworld_mp3_push` 对带 `&` 的 song filename 在 AndroidWorld chmod 阶段会被 shell 拆开。该任务已把文字输出改到 Markor，并把 `Coffee & Radio` 改为 `Coffee and Radio`，重跑通过。

最新静态 gate 结果：`missing_uploads=0`、`fake_media=0`、`fake_audio_text=0`、`visible_leaks=0`、`bad_linux_path=0`、`metadata_trace=0`、`clear_before_ensure_setup=0`、`single_device_topology=0`。该结果针对 `runs/generation_engine_probe/stress_gpt5mini/R01_R35_selected_manifest.json` 中的 700 个当前 selected task，不把历史 rerun 旧版本计入。

## 环境阻塞项

双 Linux 样本目前没有计入任务失败：

- R26/sample_000014：`A+A+L+L`，失败在 `Ubuntu-arm-1` 的 VMware 启动。
- R06/sample_000016：`A+L+L`，失败在 Linux VM 启动/停止阶段。

定位结果：

- `Ubuntu-arm-1` 首次 headless 启动触发 VMware “moved or copied” 交互确认，`vmrun` 无法回答，导致 OSWorld provider 反复 `Starting VM...`。
- 已给 `Ubuntu-arm-1/Ubuntu.vmx` 添加 `uuid.action = "keep"` 并把 `displayName` 改为 `Ubuntu1`，同时把残留 `.lck` 目录改名为 stale 备份。
- 后续仍需单独恢复/验证两台 Linux VM 的宿主状态，再继续双 Linux smoke。该问题属于 VMware/Fusion 环境状态，不是生成任务 JSON 的直接质量问题。

## 当前判断

本轮 smoke 覆盖了 Android-only 高风险 app state、Android+Linux 文件/表格、OsmAnd、Retro Music、Audio Recorder、Simple Draw Pro 等机制。代表样本显示：当前 selected task 的 setup/evaluator 基本能在真实 Android runtime 上运行，且 setup 后不会误拿 goal 分。

仍不能据此宣称 700 个 R01-R35 任务都达到 real1-300 的全量真机验证水平。下一步应继续按 surface 分层抽样，尤其是 Chrome HTML、VLC、Office/PDF、GIMP/Gallery、双 Linux 拓扑。

## R01-R08 修复后建议补测样本

R01-R08 已完成一轮深度静态审查和 Critical/High/FIX 修复，并通过 selected gate 与格式抽查；以下样本仍建议作为后续真机 smoke 候选。这里不把它们记为已通过，只记录补测优先级。

| 样本 | 覆盖点 | 建议原因 |
| --- | --- | --- |
| R02/sample_000006 | Audio Recorder + Simple Draw Pro + Linux VLC | 同时涉及录音文件命名、绘图输出、跨设备复制和 VLC 播放，runtime 链条较长 |
| R04/sample_000016 | Simple Draw Pro + Thunderbird draft | 绘图 evaluator 主要检查非空文件，适合用 smoke 验证真实 app 输出路径 |
| R06/sample_000008 | ZIP 图片 + LibreOffice Impress ODP | 已修复 ZIP 内真实图片和 ODP 检查，应验证 Office 产物链路 |
| R06/sample_000012 | OsmAnd favorite + Calendar event + PDF source | 涉及 OsmAnd source、PDF 文本和 Calendar 写入 |
| R06/sample_000019 | Contacts update + SMS confirmation | 验证联系人更新、note 保留和发送短信三者闭环 |
| R07/sample_000018 | PDF/JSON source + OsmAnd favorite + Clock alarm | 涉及双 Linux source、OsmAnd 写入和 30 分钟提前 alarm |
| R08/sample_000016 | ZIP 内 MP4 + VLC playback | 已修复假 MP4，应验证 unzip 后 VLC 当前播放状态 getter |
| R08/sample_000018 | OsmAnd nearest selection + Android Download JSON | 涉及距离选择、OsmAnd 目标 favorite 和 Android 文件写出 |

## R09-R16 修复后建议补测样本

R09-R16 已完成深度静态审查和必须修复项处理，并通过增强后的 selected gate。以下样本建议作为下一轮分层真机 smoke 候选；尚未记录为已通过。

| 样本 | 覆盖点 | 建议原因 |
| --- | --- | --- |
| R09/sample_000002 | ZIP 内 MP4 + Linux VLC | 已修复 0-byte MP4，需要验证真实 VLC 当前播放 getter |
| R10/sample_000003 | OsmAnd favorites + CSV 全量 active rows | 已补全 all active 范围，适合验证 OsmAnd 写入和 CSV 写回 |
| R10/sample_000011 | Broccoli recipe + Android Files CSV copy | 曾有隐藏目标文件名，修复后应验证普通 agent 可见路径和复制行为 |
| R12/sample_000004 | VLC now-playing source | 已处理 dummy source 可见性风险，仍需 runtime smoke 确认 observation/evaluator 一致 |
| R12/sample_000005 | Simple Gallery Pro album | 已对齐 DeliveryPhotos 路径，需验证 Gallery UI/MediaScanner 可见 |
| R12/sample_000013 | Audio Recorder 干扰录音 + count/path | 已去除伪 3GP，需验证真实录音文件和 count evaluator |
| R13/sample_000018 | Inventory workbook + Tasks + Markor | 已补 P-1006 全量低库存项，需验证 Tasks/Markor 三项闭环 |
| R14/sample_000002 | Chrome bookmark | 已修 `folder_name` schema，需验证真实 Chrome bookmark getter |
| R14/sample_000009 | Chrome bookmark + Retro Music | 本地 file URL 与 bookmark folder 修复后应 smoke |
| R14/sample_000011 | HTML request +真实 dish photo + Broccoli | 已补真实照片和 cleanup，需验证 Android/recipe 链路 |
| R16/sample_000019 | OsmAnd GPX + Markor note | 已修 GPX source 与 expected，对 OsmAnd getter/UI 敏感 |
| R16/sample_000010 | ODP 图片嵌入 | 已增强 banner 图片插入检查，需验证 LibreOffice/ODP media entry |
| R16/sample_000005 | Gallery delivery photos + ODP | 已替换真实交付照片，适合验证 Gallery 可见和 deck 输出 |

## R17-R24 修复后建议补测样本

R17-R24 已完成深度静态审查和必须修复项处理，并通过包含 Office/PDF 真实格式检查的 selected gate。以下样本建议作为后续分层真机 smoke 候选；尚未记录为已通过。

| 样本 | 覆盖点 | 建议原因 |
| --- | --- | --- |
| R17/sample_000017 | VLC playback + Android output | 曾存在动态 playback position hidden expected，应验证真实 VLC getter 只依赖可稳定观察状态 |
| R18/sample_000018 | DOCX source + Android Contacts + report | 已修 DOCX package 格式，适合验证办公文档读取和联系人写入闭环 |
| R19/sample_000019 | Retro Music playlist + Tasks dueDate/importance | 曾存在 hidden dueDate/importance，需验证可见 source 足够支撑 agent 完成 |
| R21/sample_000002 | XLSX source + ZIP/order update | 已重建真实 XLSX，应验证 LibreOffice/openpyxl 可读和全量行更新 |
| R21/sample_000016 | Thunderbird draft + Calc workbook + Tasks | 已重建 workbook，且跨 email/table/task 三路，适合测试多 source 任务 |
| R22/sample_000010 | MP4 source + Android/Gallery flow | 已替换真实 MP4，需验证媒体上传、可见性和 evaluator 稳定性 |
| R22/sample_000020 | ZIP 内视频/图片 | 已修 ZIP 内部真实格式，适合验证解压后媒体处理链路 |
| R23/sample_000014 | XLSX source + OsmAnd marker/favorite | 已重建 sites workbook，且涉及 OsmAnd 写入，runtime 风险较高 |
| R23/sample_000018 | XLSX source + row-level evaluator | 曾有行号/全量检查问题，已重建 employees workbook，适合验证表格读取和输出行覆盖 |
| R24/sample_000005 | OsmAnd GPX source | 已补 Pine Hill GPX，需验证 OsmAnd source 注入和 getter/agent 可见性 |
| R24/sample_000012 | XLSX schedule + Android task/alarm | 已重建 deploy schedule workbook，且涉及时间字段和 Android app state |

## R25-R35 修复后建议补测样本

R25-R35 已完成深度静态审查、必须项修复和增强 selected gate 回归。以下样本建议作为后续真机 smoke 候选；尚未记录为已通过。

| 样本 | 覆盖点 | 建议原因 |
| --- | --- | --- |
| R25/sample_000001 | Contacts + Linux project files | 曾有联系人 hidden expected 和 setup 预置过近，需验证真实联系人更新语义 |
| R25/sample_000013 | Android Download PDF/ZIP + Linux report | 已替换真实 PDF/ZIP source，适合验证 Android Files 可见性和打包/报告链路 |
| R25/sample_000020 | Linux setup shell + cookbook project | 曾有 setup shell 语法错误，修复后应跑 setup smoke |
| R26/sample_000005 | Android ZIP PDF + Thunderbird draft | 涉及 ZIP 内真实 PDF、Thunderbird Drafts cleanup 和邮件 evaluator |
| R26/sample_000007 | 双 Android Clock alarms | 曾 setup 预置目标 alarm，修复后需验证 setup 后 goal 不通过、agent 创建后通过 |
| R26/sample_000018 | Calc catalog + VLC playback | 已替换真实媒体并调整 source guard，适合验证 VLC getter |
| R27/sample_000004 | VLC MP3 playback | 曾为 0-byte MP3 和相对路径 evaluator，修复后需验证真实播放 |
| R27/sample_000011 | ZIP 内 MP3 + Audio Recorder | 已修真实 MP3 和 Recordings 路径，需验证 Android recorder/output 路径 |
| R27/sample_000014 | 双 Linux VLC 状态 | 曾使用假 JSON 伪装 VLC，修复后应验证真实 VLC path |
| R27/sample_000018 | VLC source guard + Android task | 已修 fake MP4 和 source guard 计分，适合 before-score smoke |
| R28/sample_000146 | VLC MP4 playback | 曾随机字节伪造 MP4，需验证真实 MP4 播放和 evaluator |
| R28/sample_000156 | XLSX + Clock + OsmAnd + image | 多 surface 闭环，曾有 sheet/label 不一致 |
| R29/sample_000162 | VLC setup 后不预播 | 曾 setup 预置 playback goal，需验证 before score 为 0 |
| R29/sample_000173 | Audio Recorder + Retro Music playlist | 跨 Android app/设备导入逻辑最敏感 |
| R29/sample_000179 | Calendar 多事件 + CSV 写回 | 曾漏全量 O-206/O-207，需验证多事件和 CSV 原地更新 |
| R30/sample_000185 | Audio Recorder + Linux ZIP | 已改 `/sdcard/Recordings`，需验证真机路径 |
| R30/sample_000200 | ZIP evaluator + cleanup | 曾有恒失败 unzip evaluator，适合正负例 smoke |
| R31/sample_000008 | VSCode project + HTML source | 已删除 project manifest 和 hidden key，需验证项目测试/页面可用 |
| R32/sample_000014 | ZIP 内 invoice JSON | 已修合法 JSON，需验证 archive filtering/report |
| R33/sample_000012 | ZIP 内 m4a + VLC/Android chain | 已替换真实 media bundle，runtime 风险高 |
| R33/sample_000015 | OsmAnd preserve existing favorites | 曾 guard 与 setup 冲突，需验证新建 favorite 后不丢旧 favorite |
| R34/sample_000014 | VLC playlist evaluator | 曾行数 expected 写错，适合快速 evaluator smoke |
| R34/sample_000019 | Markor time -> Calendar event | 曾 timestamp 晚一天，需验证时区/日期解析 |
| R35/sample_000011 | VSCode project JSON + manifest cleanup | 已修合法 JSON 并删除 generator manifest，适合项目测试 smoke |
| R35/sample_000016 | Android photo -> Linux image | 已修尺寸 evaluator 和 cleanup，需验证 Gallery/Files 可见性 |
| R35/sample_000018 | OsmAnd + ODP/image/log | 曾有 hidden expected 和尺寸规则问题，surface 链较长 |
