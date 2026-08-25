# Core200 human surface information collection report

## Summary

本轮按 `docs/plan/core200_human_surface_information_collection_spec.md` 汇总 human-facing app/surface、设备寻址和跨设备信息传递规则。本轮只生成资料与报告，**没有修改** `tasks/cross_device/` 下的任务，也没有修改 setup、evaluator 或 oracle。

| 项目 | 结果 | 证据口径 |
| --- | --- | --- |
| Android app | 15 个 app；Clock 分成 Alarm / Timer 两个行为章节，共 16 个章节 | 每个 app 至少有一条已有 real-UI observation；不等于每个细粒度操作均已验证 |
| Linux surface | 14 个 surface；Thunderbird 在章节内继续区分 Inbox / Draft / standalone EML / attachment / folder move / Sent | 每个 surface 至少有代表性已有 real-UI observation；细粒度未知项单列 |
| 多设备拓扑 | 1A、2A、1L、2L、A+L、2A+L、A+2L、2A+2L 均建立统一命名和 path namespace | `CODE_INFERRED`，并由已有多设备任务与报告交叉支持 |
| transfer | cognitive/factual transfer 与 file/binary transfer 已分开 | binary channel 只记录实际已有证据的方向 |
| Core200 spot check | 覆盖 Android 关键 surface、Linux 关键 surface、2A、2L、2A+2L | task instruction 判定主要为 `CODE_INFERRED`；真实 UI 能力引用现有报告 |
| 任务修改 | 0 | 本轮资料生成范围约束 |

证据标签统一如下：

- `VERIFIED_RUNTIME`：本轮可见的实时设备/VM 状态或人工运行状态；只证明明确观察到的部分。
- `VERIFIED_EXISTING_REPORT`：已有真机/VM 操作报告、截图或 UI log 已记录该行为。
- `CODE_INFERRED`：可以从当前 task/config/setup/instruction 文本直接判断，但本轮没有重新操作 UI。
- `NOT_VERIFIED`：当前资料不足；不会把推测写成能力。

本轮没有为“证明报告正确”重新跑一遍完整 benchmark。已有证据能定论的直接定论；会影响任务写法但没有 real-UI 证据的项目留作 `NOT_VERIFIED`。

### Source alignment

规范提到的两个输入在当前 integration worktree 中不位于规范写的路径：

- `tasks/android_app_setup_evaluator_review_guide.md` 的当前等价资料是 `docs/android_surface_real_ui_audit/android_app_setup_evaluator_review_guide.md`。
- `tasks/surface_capabilities.yaml` 的当前等价能力表是 `mdcbench/tasks/generation/profiles/linux_android/surface_capabilities.yaml`。

两份当前等价资料均已纳入；这属于路径漂移，不是 surface failure。其他主要依据包括：

- `docs/android_surface_real_ui_audit/README.md`
- `docs/android_surface_real_ui_audit/human_validation1000_inventory_summary.md`
- `docs/android_surface_real_ui_audit/human_validation1000_test_matrix.md`
- `docs/android_surface_real_ui_audit/human_validation1000_real_operation_report.md`
- `docs/linux_surface_real_ui_audit/README.md`
- `docs/linux_surface_real_ui_audit/findings.md`
- `docs/linux_surface_real_ui_audit/test_matrix.md`
- `docs/linux_surface_real_ui_audit/inventory_summary.md`

已有 Android frozen inventory 覆盖 775 个 Android-bearing tasks、15 个 app；已有 Linux inventory 覆盖 702 个 Linux-bearing tasks、13 个 canonical app 和 35 个 file/media surface。这些 inventory 数量是已有报告的范围说明，不是本轮重新运行数量。

## Key global rules

1. **Instruction 优先指向用户可识别对象，而不是 backend locator。** 例如 Markor 使用 note title，Thunderbird 使用 subject/folder，Calendar 使用 event title，OsmAnd 使用 favorite/track name。
2. **Android public path 与 app-private path 不同。** `Downloads`、`Documents`、`Pictures` 等可作为 Files 中的用户可见位置；`/storage/emulated/0/Android/data/...` 只适合作为 setup/evaluator locator，不应进入普通 participant instruction。
3. **Linux path 可以 user-facing，但必须带设备作用域。** `/tmp/x` 在单 Linux 中通常可直接给出；2L 中必须写成 “on the first/second Linux machine”。
4. **先判断对象类型，再决定是否需要传输。** 读取另一设备上的事实并在目标设备输入，是 cognitive/factual transfer；只有目标必须取得源文件 bytes 时才是 file/binary transfer。
5. **App object 与 file artifact 不等价。** Markor note、Tasks task、Calendar event、Thunderbird draft 都是 app object；即使 evaluator 最终读取 backend file，也不意味着 instruction 应暴露该文件。
6. **扩展名是否写入要按 surface 决定。** Files/Linux file manager/VS Code 通常显示扩展名；Markor 编辑器标题会隐藏 `.md`；Tasks/Calendar/Contacts/SMS/OsmAnd favorite 不使用文件扩展名。
7. **暂态状态必须在 instruction 中有明确可观察时点。** Timer、VLC 播放位置、临时 download override 等不能假定永远保持。

## Path exposure summary

| Surface | Instruction 中首选写法 | Backend path 是否可暴露 | Confidence |
| --- | --- | --- | --- |
| Android Files | `Downloads` / `Documents` 中的完整文件名 | public shared-storage path 可在需要时给出；app-private path 不给 | `VERIFIED_EXISTING_REPORT` |
| Markor | “a Markor note called `<title>`” | 否；`.../Documents/Markor/...` 是 backend-style | `VERIFIED_EXISTING_REPORT` |
| OsmAnd | favorite/track 名称与 app 内动作 | GPX/import backend path 不作为最终对象描述 | `VERIFIED_EXISTING_REPORT` |
| Gallery | album + visible media filename | database/private path 不给 | `VERIFIED_EXISTING_REPORT` |
| Tasks / Calendar / Contacts / SMS | title/name/thread/phone/date 等 app identity | 否 | `VERIFIED_EXISTING_REPORT` |
| Linux File Manager / Text Editor / Terminal / VS Code | device-scoped absolute path | 是 | `VERIFIED_EXISTING_REPORT` |
| Chrome / Chromium | visible URL、page name 或 device-scoped accessible file path | profile/backend DB 不给 | `VERIFIED_EXISTING_REPORT` |
| LibreOffice | device-scoped template/output path + app name | 是 | `VERIFIED_EXISTING_REPORT` |
| Thunderbird | subject、folder、recipient、attachment visible name | profile/mbox path 不给 | `VERIFIED_EXISTING_REPORT` |
| VLC / GIMP / Image Viewer / PDF / ZIP | device-scoped media/document/archive path | 是 | `VERIFIED_EXISTING_REPORT` |

### Current Core200 Markor path exposure candidates

当前 Core200 instruction 扫描发现 10 个任务直接给出 Markor backend-style absolute path，属于 `NEEDS_REWORDING` 候选：

1. `linux_android_1034`
2. `linux_android_1078`
3. `linux_android_1215`
4. `linux_android_1289`
5. `linux_android_1851`
6. `linux_android_1365`
7. `linux_android_1274`
8. `linux_android_997`
9. `linux_android_1080`
10. `linux_android_1037`

其中 `linux_android_1078` 还命中已知 Snap Chromium `/tmp` local-file failure；该 failure 有 `VERIFIED_EXISTING_REPORT`。其余 path exposure 是 task wording 的 `CODE_INFERRED` 结论，不把它误写成任务运行失败。

## Multi-device addressing

### Canonical device names

| Topology | Canonical wording |
| --- | --- |
| 1 Android | `the phone` / `the Android phone` |
| 2 Android | `the first phone`、`the second phone` |
| 1 Linux | `the Linux machine` |
| 2 Linux | `the first Linux machine`、`the second Linux machine` |
| mixed | 分别使用 phone 与 Linux machine；不要只写 first/second device |

同一任务中设备别名必须稳定。角色名（例如 dispatcher phone）只有在开头明确映射到 first/second 后才可继续使用。

### Namespace rule

- Android path 只属于它所在的 phone。
- Linux absolute path 只属于它所在的 Linux VM。
- 两台 Linux 都出现 `/tmp/foo` 时，这是两个不同文件；不能因字符串相同而视为共享。
- 2A/2L 中每一个 path 第一次出现时必须带 device scope；后续仅在上下文唯一时可省略。
- “the other phone/machine” 只在前一个设备已经唯一确定时成立。

### Definite ambiguity found

`linux_android_1034` 的两个 Linux source path 没有明确说明位于 first Linux 还是 second Linux。因为任务同时存在两台 Linux，这不是风格偏好，而是会改变 participant 去哪台机器找文件的真实歧义，判定为 `CODE_INFERRED / NEEDS_REWORDING`。

## Transfer matrix

`allowed` 表示当前有足够证据可以把 channel 写进 task；`facts only` 表示可以人工读取并重新输入事实，但不能据此声称文件 bytes 已传输；`NOT_VERIFIED` 表示不应在批量任务中假定存在通道。

| From | To | Cognitive / factual | File / binary | Current decision |
| --- | --- | --- | --- | --- |
| Android 1 | Android 2 | allowed by visible read/re-entry | `NOT_VERIFIED` | 默认只生成 facts transfer |
| Android | Linux | allowed by visible read/re-entry | `NOT_VERIFIED` | target-local counterpart 可用时要明确写出，而不是假装复制成功 |
| Linux | Android | allowed by visible read/re-entry | `NOT_VERIFIED` | 默认只生成 facts transfer |
| Linux 1 | Linux 2 | allowed | temporary visible HTTP channel 已有证据 | binary channel 为 `VERIFIED_EXISTING_REPORT`，但 task 必须指明可操作 channel |
| Android app object | same-phone Files | 依 app 的 export/share/save 能力 | 按具体 surface | Audio 可显式 export；其他 app 不一概类推 |
| Files artifact | same-device app | allowed when app supports open/import | same-device open/import | 不属于跨设备 transfer |

当前 Core200 没有发现一个可以直接定论为“强制 Android↔Linux 或 Android↔Android binary transfer，同时没有 target-local source 或已验证 channel”的任务。结论是 **0 个已证实 impossible binary-transfer task**，不是“0 个 transfer 风险”。

代表性判断：

- `a2l2_vscode_web_music_final_gate`：Linux 1→Linux 2 的 corrected HTML 是 binary transfer；已有 temporary HTTP 证据，但当前 instruction 只写 “Copy”，channel 仍应在后续 task repair 时明确。
- `a2l_audio_thunderbird_draft`：Android 只传录音事实；Linux setup 已有 local WAV，因此不要求 Android→Linux bytes。
- `a2l2_training_media_deck_email`：传递 Camera filename 与 contact email，不要求照片 bytes。
- `al_map_audio_packet`：传递名称、坐标和 memo filename，不要求 Android audio bytes。
- `linux_only_295`、`linux_only_300`：跨 VM 读取 manifest facts；目标文件已在目标 VM，不是 binary copy。

## High-risk surfaces

| Risk | Current finding | Impact | Confidence |
| --- | --- | --- | --- |
| Markor absolute backend path | 10 个当前 Core200 候选 | instruction 不像真实用户说法，也可能把 evaluator locator 当成 participant object | `CODE_INFERRED` |
| Snap Chromium + host `/tmp/file://` | B02/B06/B07 类 case 失败 | 页面打不开；不能用 Text Editor 代替浏览器 render 验证 | `VERIFIED_EXISTING_REPORT` |
| Thunderbird Drafts mbox | M06 fixture 缺少合法 `From ` envelope line，Drafts 显示 0 | setup artifact 无法被 Thunderbird 识别 | `VERIFIED_EXISTING_REPORT` |
| Thunderbird draft semantics | Save 后仍停在 compose；Drafts list/reopen 才证明持久化 | evaluator 不应只把 compose 仍可编辑当失败或成功 | `VERIFIED_EXISTING_REPORT` |
| Audio Recorder filename/export | Save As 入口、onboarding、导出位置会影响精确文件名 | instruction 应区分 app recording name 与 exported public filename | `VERIFIED_EXISTING_REPORT`；部分默认行为 `NOT_VERIFIED` |
| LibreOffice stale recovery | 启动时可能出现恢复 UI | participant 需要按 visible UI 处理；不要把恢复文档误当目标 | `VERIFIED_EXISTING_REPORT` |
| VLC short clip / Timer | 状态短暂 | 截图和 evaluator observation timing 可能错过目标状态 | `VERIFIED_EXISTING_REPORT` |
| Gallery / Markor extension display | 列表与 editor/viewer 显示规则不同 | instruction 和 evaluator 不应强制每个 UI 都显示同一扩展名 | `VERIFIED_EXISTING_REPORT` |
| 2L unscoped path | `linux_android_1034` | participant 无法唯一选择 VM | `CODE_INFERRED` |

## Core200 spot checks

这些 spot check 回答“当前 instruction 是否符合已整理的 surface contract”。`PASS` 不代表本轮重新跑过完整任务；除特别标注外，task-level verdict 是 `CODE_INFERRED`。

| Surface / topology | Representative tasks | Finding |
| --- | --- | --- |
| Markor | `android_only_305`、`android_smarthome_407`、`linux_android_1034` | 前两项以 note/object 为中心，无新增问题；`1034` 暴露 backend path 且 filename 泄露结论，`NEEDS_REWORDING` |
| Android Files | `android_only_267`、`android_only_305`、`a2l_media_manifest` | 文件名与 public folder 作为用户对象，符合 contract |
| OsmAnd | `a2_route_media_status`、`android_only_270`、`linux_android_1034` | 前两项用 favorite/track 的可见对象；`1034` 保留 `Reference Depot` 本身自然，但预先告诉“无坐标”泄露来源结论 |
| Tasks | `a2_gallery_album_to_tasks`、`android_only_223`、`linux_android_smarthome_696` | 用 task title/list/date 等 app identity，未发现 backend-path 问题 |
| Calendar | `a2_alarm_conflict_log`、`android_only_218`、`linux_android_1368` | event title/date/time 是合适 contract；细粒度 recurrence wording 仍未统一验证 |
| SMS | `android_smarthome_464`、`a2_missing_media_status`、`android_only_267` | thread/contact/message facts 可见，未要求后台数据库 locator |
| Audio Recorder | `al_request_audio`、`a2l_audio_thunderbird_draft`、`a2l_media_manifest` | app recording 与 public export 基本分开；跨设备例子使用 facts 或 Linux-local WAV |
| Gallery | `a2_gallery_cleanup_log`、`a2_gallery_album_to_tasks`、`android_smarthome_407` | album/media visible identity 合适；rename extension/trash 细节仍是未知项 |
| Thunderbird | `a2l_audio_thunderbird_draft`、`l2_mail_rule_foldering`、`al_thunderbird_attachment_to_tasks` | draft/folder/rule/attachment 都用 UI object；保存草稿是可检查的本地结果，不需真实发送 |
| Writer | `al_writer_from_note_gui`、`a2l_agenda_from_two_phones`、`linux_only_313` | device-scoped template/output path + Writer 对象自然 |
| Calc | `al2_data_transform_sync`、`l2_csv_to_json`、`a2l_osmand_calc_visit` | CSV/table/sheet 与 device path 唯一；注意 CSV import dialog 是 surface 一部分 |
| Impress | `a2l2_training_deck_notify`、`a2l2_training_media_deck_email` | 当前 Core200 可用的两个代表例子均以 deck/output path 为中心；没有强制虚构第三个代表任务 |
| VS Code | `l2_vscode_settings_update`、`a2l2_vscode_web_music_final_gate` | `/tmp` project 可在 VS Code 中工作；后者的 Linux→Linux copy channel 需要明确 |
| Chrome / Chromium | `a2l_browser_dual_phone_code`、`al_camera_web_upload_form`、`linux_only_313` | visible page/form 合适；不要把 Snap Chromium 的 `/tmp/file://` 当普遍可用输入 |
| PDF / ZIP / GIMP | `linux_android_1217`、`linux_only_295`、`linux_only_300`、`linux_only_305`、`linux_only_327` | visible document/archive/image path 合适；ZIP GUI exact extract flow 仍未验证 |
| 2A | `a2_route_media_status`、`a2_gallery_album_to_tasks` | first/second phone 寻址清楚；主要是 facts transfer |
| 2L | `l2_mail_rule_foldering`、`l2_csv_to_json`、`a2l2_vscode_web_music_final_gate` | first/second Linux 基本清楚；binary copy 必须有 channel |
| 2A+2L | `linux_android_1034` | 四设备对象都存在，但 Linux source path 未分配到具体 VM，是本轮明确寻址 failure |

## `linux_android_1034` sanity review

### Current live-session status

发现一个此前中断后仍存在的 manual session：

- task：`tasks/cross_device/linux_android/linux_android_1034.json`
- result dir：`/private/tmp/mdcbench_manual_linux_android_1034_preflight_20260824_3`
- 已记录：session started、environment started、setup completed
- 未记录：participant action、task completion、`result.json`

当前设备截图可见 first phone home、second phone OsmAnd 中的 `Reference Depot` 详情和两台 Linux 桌面。这只证明 setup/UI 可见性，标记为 `VERIFIED_RUNTIME`；**不证明任务通过，也不证明 participant 能正确完成**。本轮没有抢占输入、没有继续点击，也没有终止该 session。

### Five required judgments

1. **两条 Linux source path 是否唯一？否。** 任务为 2L，但 source path 没有 first/second Linux scope。`CODE_INFERRED / NEEDS_REWORDING`。
2. **Markor 是否应使用 absolute path？不应。** Participant 应看到 “a Markor note called `1034-A route decision`”；exact backend filename 若 evaluator 需要，可留在 evaluator contract。`VERIFIED_EXISTING_REPORT` 支持 title-vs-path 语义。
3. **是否提前泄露 source conclusion？是。** “selected site has no coordinates” 在 participant 读取 site register 之前已经告诉答案。`CODE_INFERRED / NEEDS_REWORDING`。
4. **是否由 filename 泄露 outcome？是。** `1034-A_blocked.md` 把 route decision 预写为 blocked。`CODE_INFERRED / NEEDS_REWORDING`。
5. **是否像真实同事请求？当前更像 SOP/eval spec。** 它同时给 backend paths、推导结论和 expected outcome，降低了真实信息整理任务的性质。`CODE_INFERRED / NEEDS_REWORDING`。

仅作为后续 repair 的 human-facing wording 方向，可以写成：

> Review the approved route request in Downloads on the first phone together with the site register and handoff policy on the first Linux machine. Keep the `Reference Depot` favorite unchanged in OsmAnd on the second phone. Record the route decision in a Markor note called `1034-A route decision` on the second phone, and write the dispatcher handoff to `/tmp/sites/1034-A_handoff.txt` on the second Linux machine.

这段方向故意不告诉 participant “无坐标”或 “blocked”；真实结论必须来自 source。正式修任务时仍需先把两条 source path 与 setup 的实际 VM 对齐。

## Core200 implications

### Can be generated safely now

- 以 app object 为中心的 Android 任务：Markor note title、OsmAnd favorite/track、Tasks title、Calendar event、Contact、SMS thread。
- 使用 public folder/full filename 的 Android Files 任务。
- device-scoped Linux file/office/editor 任务。
- 跨设备只传 visible facts 的任务。
- Linux→Linux binary transfer，只在 instruction 明确采用已有可操作 channel 时生成。
- Thunderbird local draft 任务：保存到 Drafts 后通过 folder list/reopen 检查；不要求真实发送。

### Needs wording repair before regeneration

- 上述 10 个 Markor absolute-path candidates。
- `linux_android_1034` 的 2L source addressing、source conclusion leak 和 outcome-bearing filename。
- `a2l2_vscode_web_music_final_gate` 中没有说明 channel 的 “Copy”。
- 任何把 Snap Chromium 指向 host `/tmp/file://` 的 instruction/setup 组合。

### Not enough evidence to bulk-generate

- Android↔Android、Android↔Linux、Linux→Android 的 general binary transfer。
- 未验证的 app extension/default-export behavior。
- 依赖 Gallery trash/rename、LibreOffice format prompt、ZIP GUI extract 等未确认 exact UI flow 的任务变体。

## Remaining unknowns

以下未知项会改变任务 instruction 或 evaluator 写法，因而保留；没有为不会发生的边界情况扩展清单。

1. **Markor**：新建 note 时用户输入带不带 `.md` 的稳定行为；精确 auto-extension 规则。`NOT_VERIFIED`。
2. **Android Files**：原生 preview 是否稳定支持 `.md`、JSON、PDF、DOCX、XLSX、ZIP；当前只能按已验证 app/open-with 路径写。`NOT_VERIFIED`。
3. **Gallery**：rename dialog 是否要求/保留扩展名；trash 的 exact persistence；move/copy dialog wording。`NOT_VERIFIED`。
4. **Tasks / Calendar**：importance、hide-until、recurrence/reminder 的当前 UI label 与边界语义。`NOT_VERIFIED`。
5. **Android Chrome**：模拟器中 `localhost`/loopback 页面访问的稳定支持范围。`NOT_VERIFIED`。
6. **Simple Draw Pro**：Save/Export 是否自动补扩展名以及默认 public directory。`NOT_VERIFIED`。
7. **LibreOffice**：Writer/Calc/Impress 的 auto-extension、foreign-format confirmation、read-only/lock exact flows。`NOT_VERIFIED`。
8. **Thunderbird**：Save Attachment 的当前默认目录与重复文件名行为。`NOT_VERIFIED`。
9. **ZIP / Archive Manager**：GUI exact extract flow；已有 archive member view，但不能据此补写未观察的按钮序列。`NOT_VERIFIED`。
10. **Linux home path**：`/home/oai` 是否应成为跨所有 VM/task 的一般 participant contract；当前仅按 task/setup 的实际路径使用。`NOT_VERIFIED`。

## Completion checklist answers

- Markor 应写 note title 还是 absolute path？**note title**；backend path 不写进普通 participant instruction。
- Markor 用户是否应输入 `.md`？**尚未定论**；editor title 已观察到隐藏 `.md`，Files list 会显示完整扩展名。
- Files 能否直接阅读 `.md`？通过 Markor 打开已有证据；DocumentsUI native preview **未验证**。
- Android 哪些 path 是 user-facing？shared public folder/path 可用；`Android/data` 等 app-private path 是 backend-only。
- OsmAnd 的 GPX/backend path 是否应暴露？通常不应；写 visible favorite/track/import action。
- Audio exact public filename 如何形成？按已验证的 record/name/export + Files public artifact 分阶段写；未验证默认行为不猜。
- Gallery rename 是否含扩展名？**未验证**。
- Tasks、Calendar、Contacts、SMS 是否有 user-facing identity？有，分别用 title/date/list、event/date/time、contact name/phone、thread/recipient/message。
- 2L 中 path 是否必须 scope？是。
- Linux `/tmp` 是否 user-facing？在 File Manager/Text Editor/Terminal/VS Code 中可作为 device-scoped path；不能推导出 Snap Chromium 可打开其 `file://` URL。
- VS Code 是否能使用 `/tmp` project？是，`VERIFIED_EXISTING_REPORT`。
- Thunderbird draft 为何保存而非发送？本地 Drafts 状态可重复检查，不依赖真实外部邮件投递；保存、list、reopen、attachment 均有 UI 证据。
- Thunderbird mbox 是否任意文本即可？否；M06 已证明缺失合法 envelope line 会导致 Drafts 为空。
- LibreOffice 是否完全验证？核心 open/edit/save/export surface 有证据；extension/format/read-only/lock 细节仍有未知项。
- Chrome local file 是否统一可用？否；Snap Chromium 对 host `/tmp` 是已知 failure。
- 哪些跨设备 file transfer 可直接写？当前只有有明确操作 channel 的 Linux→Linux binary；其他方向默认 facts only。
- 是否已有统一 machine-readable mapping？有，见 `tasks/human_surface_contracts.yaml`。

## Generated deliverables

- `tasks/human_surface_android.md`
- `tasks/human_surface_linux.md`
- `tasks/cross_device_addressing_transfer.md`
- `tasks/human_surface_contracts.yaml`
- `tasks/human_surface_collection_report.md`
