# Android Human-Facing Surface Guide

更新日期：2026-08-24  
适用范围：冻结的 Core200 / Human Validation 1000 Android surface  
边界：本文描述普通用户能看到和操作的对象，不替代 setup/evaluator 指南，也不修改任务。

## 证据等级

- `VERIFIED_RUNTIME`：本轮或仍可追溯的当前人工会话直接观察到。
- `VERIFIED_EXISTING_REPORT`：已有 real-UI 报告记录了屏幕驱动操作和证据路径，未用 oracle/solution 创建结果。
- `CODE_INFERRED`：由 runtime/setup/storage 实现推断，未当作强制批量修复规则。
- `NOT_VERIFIED`：当前证据没有回答；不得据此强制批量修改任务。

## 全局结论

1. App-native object 默认用 App 名和对象名引用；provider、SQLite、私有目录和 hydration 文件不进入 instruction。
2. Android 公共文件用用户可见目录名和 filename 引用，例如 `"report.csv" in Downloads on the second phone`。只有在文件定位确实需要时才给绝对路径。
3. 两台 Android 的同名 `/sdcard/...` 是两个独立 namespace；绝对路径必须绑定 `first phone` 或 `second phone`。
4. exact filename 是任务要求时，应把 filename 明确告诉用户；不要用 backend path 暗示 filename。
5. Android 文件列表常显示扩展名，App 编辑器可能隐藏扩展名。因此 title、displayed filename 和 backend filename 要分开记录。

## Filename / title / extension 总表

| Surface | User enters | UI displays | Backend stores | Instruction recommendation | Confidence |
| --- | --- | --- | --- | --- | --- |
| Markor | 新建对话框是否必须输入 `.md`：`NOT_VERIFIED` | 文件列表显示 `Launch checklist.md`；编辑器标题显示 `Launch checklist` | `x.md` | 默认说 note title；若 exact filename 是公开合同，再补充 `save it as x.md` | `VERIFIED_EXISTING_REPORT` / input detail `NOT_VERIFIED` |
| Audio Recorder | 录制后输入 recording name/stem；导出 filename 带 `.m4a` | Recorder 显示 name/format；Files 显示完整 `x.m4a` | 私有 recording + public exported file | 先说 recording name；若需公共文件，明确 `Recordings/x.m4a` 并允许 Files move | `VERIFIED_EXISTING_REPORT` |
| Gallery rename | Rename dialog 已确认存在；是否应输入 extension：`NOT_VERIFIED` | viewer 标题显示完整 `breaker_lockout.jpg` | 公共图片文件 | 说 album + displayed filename；不要猜 Rename dialog 的 extension 行为 | dialog `VERIFIED_EXISTING_REPORT`; input detail `NOT_VERIFIED` |
| Writer Save As | 见 Linux 指南 | 见 Linux 指南 | `.odt`/`.docx` | 见 Linux 指南 | `VERIFIED_EXISTING_REPORT` |

## Files（Android DocumentsUI）

### 1. 用户看到的对象是什么

- App 首页 / 主要页面：最近文件或系统文件选择器；可从抽屉进入 Downloads、Documents、Images、Audio 等位置。
- source 常表现为：某目录中的完整 filename；例如 `pickup_request.txt`、`dock.csv`。
- output 常表现为：新建、移动、复制、重命名或删除后的公共文件。
- UI 实际显示：完整 filename，通常含 extension；H01 显示 `confirm_ORD-2026-42.m4a`。
- 内部 path：普通列表不以 `/storage/emulated/0/...` 为主要标签；目录名和面包屑更接近用户心智。
- title / filename / display name：Files 的 primary label 是 filename；媒体详情可能另有宽泛 type label。

### 2. 普通用户如何打开已有 source

1. 打开 Files，进入 instruction 指定的可见目录，如 Downloads 或 Recordings。
2. 按完整 filename 定位对象；必要时使用搜索。
3. 点文件；若系统询问应用，选择 Markor、Chrome、Gallery 等实际 viewer。

格式实测边界：

| Format | 当前可见行为 | Confidence |
| --- | --- | --- |
| `.md` | 可从用户可见文件流交给 Markor；Files 本身是否内建 preview 未证实 | `VERIFIED_EXISTING_REPORT` / native preview `NOT_VERIFIED` |
| `.txt`, `.csv` | filename 可见；`android_only_235` 的 CSV 通过可见打开流程读到 header/row | `VERIFIED_EXISTING_REPORT` |
| `.json` | filename 和公共目录可见；默认 viewer 未记录 | `NOT_VERIFIED` |
| `.html` | Downloads 中可见后可选择 Chrome，页面以渲染结果打开 | `VERIFIED_EXISTING_REPORT` |
| image | 可交给 Gallery，Gallery viewer 显示完整 filename | `VERIFIED_EXISTING_REPORT` |
| audio | Files 显示完整 filename；type label 可能把 M4A 误标成 `MP3 audio` | `VERIFIED_EXISTING_REPORT` |
| `.pdf`, `.docx`, `.xlsx`, `.zip` | 当前 Android 报告没有逐格式记录默认 preview/open-with app | `NOT_VERIFIED` |

### 3. 普通用户如何创建/编辑 output

1. 通常先由对应 App 创建，再用 Files 检查公共结果。
2. 长按文件或使用菜单执行 Move、Copy、Rename、Delete。
3. 在目标目录确认完整 filename；媒体结果还需能被目标 App/MediaStore 看见。

说明：Files 不提供 App-native title。用户操作完整 filename；是否自动补 extension 取决于创建它的 App。Audio Recorder 的 `Save as...` 可能直接导出到上一次 Files 目录，随后需要 Files 二次 move。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Open `dock.csv` in Downloads on the second phone. | Open `/data/media/0/Download/dock.csv`. |
| Move `confirm_ORD-2026-42.m4a` into Recordings on the second phone. | Move the file in Android's media provider row. |
| Check whether `gate_brief_missing.mp3` is present in Recordings. | Inspect the Audio Recorder private package directory. |

### 5. Path 暴露规则

- backend examples：`/storage/emulated/0/Download/x.csv`、`/data/media/0/Download/x.csv`。
- policy：`user_visible_if_device_scoped`。优先说 `Downloads/x.csv`；exact absolute path 仅在任务确实要求路径操作时使用。
- `/storage/emulated/0/Android/data/...` 和 `/data/data/...`：`backend_only`；普通任务不得把它们当作 Files 导航步骤。DocumentsUI 对 Android/data 的普通访问能力未做本轮独立 smoke，故其具体 UI 文案为 `NOT_VERIFIED`，但项目合同不依赖该路径作为 user-facing channel。

### 6. 真实 UI 限制

- onboarding / permissions：viewer App 可能首次询问权限或 Open with。
- hidden storage：Android/data/private App paths 不作为普通用户入口。
- rename constraints：逐格式 extension 行为未完整验证。
- indexing：HTML、CSV 等公共文件可能物理存在但 Files 仍显示空目录；需要任务 setup 做可见索引/scan。
- known flaky：文件类型副标签不等于真实 codec；以 Recorder Information/真实解码为准。

### 7. Runtime smoke 证据

- `android_only_235`：Files 显示两个现有文件、一个缺失文件，并打开 CSV；`VERIFIED_EXISTING_REPORT`。
- `android_smarthome_510`：Downloads HTML 经 scan 后从 Files → Chrome 打开；`VERIFIED_EXISTING_REPORT`。
- `android_only_090`：Files 中显示完整 M4A filename、大小和错误的宽泛 type label；`VERIFIED_EXISTING_REPORT`。
- evidence：`docs/android_surface_real_ui_audit/real_operation_report.md`、`docs/android_surface_real_ui_audit/human_validation1000_real_operation_report.md`。

## Markor

### 1. 用户看到的对象是什么

- 首页：Markor Files 列表、To-Do、QuickNote、More。
- source / output：Markdown 或 text note。
- 文件列表实际显示完整 filename，例如 `Launch checklist.md`。
- 编辑器标题栏显示 stem，例如 `Launch checklist`；正文中的 Markdown H1 是内容，不是稳定文件 identity。
- backend path：常为 `/storage/emulated/0/Documents/Markor/<name>.md`，不应成为普通 instruction 的对象名。

### 2. 普通用户如何打开已有 source

1. 打开 Markor 的 Files 页面。
2. 按显示的 filename 定位 note。
3. 点开；用编辑器标题 stem 和正文确认是目标 note。

### 3. 普通用户如何创建/编辑 output

1. 在 Markor 文件列表点 `+`，选择新建文本/Markdown note。
2. 输入 note 名并编辑正文；当前截图未捕获新建对话框，因此是否必须手输 `.md` 为 `NOT_VERIFIED`。
3. 保存并返回列表，确认完整 filename 位于正确 Markor 根目录，而不是同名嵌套目录。

Recommendation：

- 默认写 `Create a note called Route status in Markor`。
- exact file artifact 确实重要时，写 `Create a Markor note and save it as Route status.md`。
- 永远不要写 Markor storage absolute path。
- 同名/近似 note 用 device + displayed filename + visible context 区分；同一列表的 stem 相同但 extension 不同时必须说完整 filename。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Create a note called `Route status` in Markor on the second phone. | Write `/storage/emulated/0/Documents/Markor/Route status.md`. |
| Open the `Call handoff` note in Markor on the first phone. | Read the Markor backing file with ADB. |
| Save the exact artifact as `recording request status.md` in Markor. | Put the evaluator text in the Markor directory. |

### 5. Path 暴露规则

- backend path：`/storage/emulated/0/Documents/Markor/<name>.md`。
- policy：`backend_only` when Markor is the named surface。
- exception：若任务本身是 Android file-management，而非 Markor note 操作，可把公共 filename/path 当文件 artifact；仍需 device scope。

### 6. 真实 UI 限制

- onboarding：首次启动/缓存可能让新上传 note 暂不出现在列表；visible-note preflight 或刷新可恢复。
- file picker：进入已有同名 `Markor` 子目录会把 output 保存到错误路径；`android_only_305` 首次操作真实发生过。
- extension：列表显示，编辑器标题隐藏；新建输入行为未独立验证。
- app version：当前证据来自受支持镜像上的 Markor 版本。

### 7. Runtime smoke 证据

- B08：列表显示 `Launch checklist.md`，编辑器标题显示 `Launch checklist`；`VERIFIED_EXISTING_REPORT`。
- `android_only_305`：普通 UI 创建目标 note；错误嵌套目录被 evaluator 拒绝，正确根目录重跑通过；`VERIFIED_EXISTING_REPORT`。
- evidence：`runs/linux_surface_real_ui_audit/B08_a2l2_vscode_android0_markor_attempt2/`、`docs/android_surface_real_ui_audit/real_operation_report.md`。

## OsmAnd

### 1. 用户看到的对象是什么

- 首页：地图；用户对象为 Favorites/My Places 中的 favorite，而不是 GPX。
- source / output：带 name、coordinates，可选 description/address 的 favorite。
- UI primary label：favorite name；详情页同时显示地图位置、名称、坐标/地址相关信息。
- backend GPX 和私有 hydration 文件不是用户对象。

### 2. 普通用户如何打开已有 source

1. 打开 OsmAnd。
2. Menu → My Places → Favorites。
3. 选择 favorite，进入详情并读取同一项的 name 和 coordinates。

### 3. 普通用户如何创建/编辑 output

1. 在地图选定位置或从 Favorites 入口新增。
2. 填写 name；按当前合同可填写 coordinates、description、address。
3. 保存后在 Favorites 列表和详情中确认；更新时应编辑原 favorite，而不是追加同名项。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Open the `Depot Gate` favorite in OsmAnd on the second phone. | Open `favorites.gpx`. |
| Update the `Depot Gate` favorite with the corrected coordinates. | Patch the matching `<wpt>` node. |
| Keep the existing `Reference Depot` favorite unchanged. | Preserve `/data/data/net.osmand/files/favourites_bak.gpx`. |

### 5. Path 暴露规则

- backend：`/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`、`/data/data/net.osmand/files/favourites_bak.gpx`。
- policy：`backend_only`，在 instruction 中默认永不暴露。

### 6. 真实 UI 限制

- onboarding/permissions/map initialization 必须完成。
- 第一帧可能忽略 Menu tap；重复相同可见动作后可进入 My Places。
- 当前 helper 的 favorite add 实际会 append；setup/evaluator 必须处理重复，但 instruction 仍按一个 user-visible favorite 描述。
- route / turn-by-turn 状态没有稳定合同：不要生成此类目标。

### 7. Runtime smoke 证据

- A01/A07：Menu → My Places → Favorites，读取/使用命名 favorite；`VERIFIED_EXISTING_REPORT`。
- 当前未完成的 1034 人工会话仅证明 setup 后 `Reference Depot` 详情可见，尚无 participant/result，不计 task pass；`VERIFIED_RUNTIME`（setup visibility only）。
- evidence：`docs/android_surface_real_ui_audit/real_operation_report.md`。

## Simple Gallery Pro

### 1. 用户看到的对象是什么

- 首页：album 列表；进入后为图片缩略图。
- source / output：album 中的 image/video；album 在当前任务通常对应公共 filesystem directory + MediaStore grouping。
- viewer 标题显示完整 filename，如 `breaker_lockout.jpg`；Properties 显示 filename、size、location 等。
- album name（如 `Receipts`）比 `/sdcard/Pictures/Receipts` 更自然。

### 2. 普通用户如何打开已有 source

1. 打开 Gallery，选择命名 album。
2. 点缩略图；viewer 顶部核对完整 filename。
3. 需要 metadata 时打开 Properties/Details。

### 3. 普通用户如何创建/编辑 output

1. 长按或从 viewer 菜单选择 Rename、Move、Copy、Delete。
2. Rename dialog 在当前版本真实存在；输入是否包含 extension 为 `NOT_VERIFIED`。
3. 返回 album 确认集合；是否进入 Trash/Recycle 而非立即删除为 `NOT_VERIFIED`，因此需要结果侧检查。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Open the `Receipts` album in Simple Gallery Pro. | Browse `/data/media/0/Pictures/Receipts`. |
| Rename the photo shown as `breaker_lockout.jpg`. | Rename the MediaStore row with this `_display_name`. |
| Keep only the images named in the `Album rule` note. | Delete every inode not listed by the evaluator. |

### 5. Path 暴露规则

- backend example：`/storage/emulated/0/Pictures/Receipts/x.jpg` + MediaStore row。
- policy：album/object tasks use `backend_only`; pure Files tasks may use `Pictures/Receipts/x.jpg` with device scope。

### 6. 真实 UI 限制

- seeded media needs MediaScanner/MediaStore visibility。
- Properties size uses binary scaling while showing KB/MB-like labels。
- move/copy controls exist in task surface inventory, but exact dialog path was not independently recorded：`NOT_VERIFIED`。
- rename extension and trash semantics remain `NOT_VERIFIED`。

### 7. Runtime smoke 证据

- A03：album → photo，viewer 标题显示 full filename；`VERIFIED_EXISTING_REPORT`。
- A13：Properties shows filename, size, Camera path；`VERIFIED_EXISTING_REPORT`。
- gallery rename preflight establishes Rename dialog presence；`VERIFIED_EXISTING_REPORT`。

## Camera

### 1. 用户看到的对象是什么

- 首页：live preview、mode selector、shutter、filmstrip。
- output：新拍摄 image/video；Camera 自己生成 filename。
- 当前镜像 image 实际发布到 `/sdcard/Pictures`，video 到 `/sdcard/Movies`。

### 2. 普通用户如何打开已有 source

1. Camera 通常不是 existing-file source viewer；从 filmstrip 打开最近 capture。
2. 旧文件用 Gallery/Files 定位更自然。
3. instruction 如要检查 filename，应转到 Gallery/Files。

### 3. 普通用户如何创建/编辑 output

1. 选择 Photo 或 Video，使用 shutter/record 控件。
2. 在 filmstrip 确认新 capture。
3. exact filename/目录要求通常需要 Gallery 或 Files 二次 rename/move；Camera 内 exact filename 控制未观察到。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Take a new photo with Camera on the first phone. | Write a JPEG into Camera's database. |
| Rename the captured photo to `training_setup_photo.jpg` using Gallery or Files. | Make Camera emit this exact backend filename directly. |
| Leave the newly recorded video visible in Camera's filmstrip. | Save it under `/sdcard/DCIM/Camera` on this image. |

### 5. Path 暴露规则

- backend/runtime output：images `/sdcard/Pictures`; videos `/sdcard/Movies` on supported image。
- policy：Camera instruction normally `backend_only`; final user-visible file may use filename/folder with device scope。

### 6. 真实 UI 限制

- Camera can show preview but fail to persist if image/video AppOps are denied。
- output directory is image/version dependent; do not assume DCIM/Camera。
- Camera cannot reliably satisfy exact filename without a second App。

### 7. Runtime smoke 证据

- A06：visible photo capture persisted under Pictures after AppOps repair；`VERIFIED_EXISTING_REPORT`。
- A17：visible 4.406 s video persisted under Movies；`VERIFIED_EXISTING_REPORT`。

## Audio Recorder

### 1. 用户看到的对象是什么

- 首页：Records list / record control；首次启动有 onboarding 和 format defaults。
- source：imported recording shown by name，Information displays name、format、size、Location filename。
- output：new recording；Recorder 内 label is recording name/stem，Files public result displays full filename。
- private package path 完全 backend-only。

### 2. 普通用户如何打开已有 source

1. 打开 Recorder；若 public file 尚未进入 library，使用 Import → DocumentsUI。
2. 选择 recording。
3. 打开 Information，读取 name、format、size、location filename。

### 3. 普通用户如何创建/编辑 output

1. 完成 onboarding；确认 desired format（H01 默认 M4A/AAC）。
2. Record → Stop → rename recording name。
3. `Save as...` 导出；当前版本可能直接用 Files 的上一次目录而不弹 picker，再用 Files move 到 Recordings。

说明：

- 新录音默认命名规律未单独记录：`NOT_VERIFIED`。
- H01 中用户把 recording 改名为 `confirm_ORD-2026-42`，Files 最终显示 `.m4a`。
- M4A/WAV 均为当前 helper 支持格式；真实 output smoke 直接验证 M4A/AAC。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Record a short M4A memo named `confirm_ORD-2026-42`. | Create an AAC row in the Recorder database. |
| Export it to Recordings as `confirm_ORD-2026-42.m4a`. | Save it in `/storage/emulated/0/Android/data/com.dimowner...`. |
| Open the `field_voice_168` recording and check Information. | Read its private destination file directly. |

### 5. Path 暴露规则

- private backend：`/storage/emulated/0/Android/data/com.dimowner.audiorecorder/...`。
- public user artifact：`Recordings/<filename>.m4a`。
- policy：private path `backend_only`; public path `user_visible_if_device_scoped`。

### 6. 真实 UI 限制

- onboarding 未总由 setup 消除，但可见操作可完成。
- `Save as...` 复用上次目录；exact public location 需要 Files move。
- visible Trash 可保留 `.del` tombstone 和 placeholder；不要把私有目录绝对为空等同于 UI 空。
- Files 的 type label 可错，codec 以 Recorder Information/decoder 为准。

### 7. Runtime smoke 证据

- H01 `android_only_090`：3 s recording、rename、Save as、Files move、M4A/AAC accepted；`VERIFIED_EXISTING_REPORT`。
- A13：public M4A Import → Information；`VERIFIED_EXISTING_REPORT`。
- A04：visible Delete 后 Records 空，但 private tombstone/placeholder 存在；`VERIFIED_EXISTING_REPORT`。

## Contacts

### 1. 用户看到的对象是什么

- 首页：contact list；primary label 是 display name。
- detail：name、formatted phone、email（若有）、Notes 等。
- source/output：existing card、new card 或 edit-in-place card；不存在 user-facing path。

### 2. 普通用户如何打开已有 source

1. 打开 Contacts，按姓名搜索或滚动。
2. 点唯一 contact card。
3. 在同一详情页读取 phone/email/Notes；号码可能自动显示连字符。

### 3. 普通用户如何创建/编辑 output

1. existing contact 用 Edit，不要以新建同名卡代替。
2. 修改 name/phone/email/Notes。
3. Save，返回列表确认仍是一张卡。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Open Priya Nair in Contacts on the phone. | Query the contacts provider for Priya. |
| Update Priya Nair's phone and append the visible patch note. | Replace the raw-contact row. |
| Create one contact named `Mira Patel 904`. | Insert exactly one provider identity. |

### 5. Path 暴露规则

- backend：Android Contacts provider/raw_contact IDs。
- policy：`never`。

### 6. 真实 UI 限制

- phone formatting：`5550464` 可显示为 `555-0464`。
- create duplicate vs edit existing：必须从 instruction 区分。
- email display/edit 作为 UI 字段存在；旧 capability catalog 的 getter 限制不等于 UI 不支持。

### 7. Runtime smoke 证据

- H02：visible edit-in-place，号码/Notes 更新且只保留一张 Priya Nair card；`VERIFIED_EXISTING_REPORT`。
- H03：详情显示 formatted number 和 role note；`VERIFIED_EXISTING_REPORT`。
- A03：Dana Ortiz detail used as source；`VERIFIED_EXISTING_REPORT`。

## Simple Calendar Pro

### 1. 用户看到的对象是什么

- 首页：calendar/day/list；event primary label 是 title。
- detail：title、local date/time、location、description；可见 recurrence/reminder 字段的精确版本行为未逐项记录。
- source/output：existing event、created/edited event；不存在 user-facing backend path。

### 2. 普通用户如何打开已有 source

1. 打开 Calendar，按日期浏览或搜索 title。
2. 点匹配事件。
3. 在详情页读取 title/time/location/description。

### 3. 普通用户如何创建/编辑 output

1. `+` 新建，或打开 existing event 后 Edit。
2. 输入 title、start/end、location、description；按任务设置 reminder/recurrence。
3. Save 并重新打开确认 local wall-clock time。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Open the `Focus sprint` event in Simple Calendar Pro. | Read the `events.db` row. |
| Correct the second phone's `Site briefing` event to match the current one. | Set `start_ts=...` and `end_ts=...`. |
| Create the meeting at 10:30–11:00 in `Electrical bay`. | Store these UTC epoch values. |

### 5. Path 暴露规则

- backend：Calendar DB/event IDs/epoch values。
- policy：`never`。

### 6. 真实 UI 限制

- current AVD timezone is UTC；UI may display 12h/24h according to device setting，not instruction serialization。
- wrong timezone epoch caused a correct 10:30 GUI event to fail before task repair。
- recurrence/reminder create controls and exact wording：`NOT_VERIFIED` for the supported app version；do not impose UI label wording from code alone。

### 7. Runtime smoke 证据

- A03：created, saved, reopened 10:30–11:00 event；`VERIFIED_EXISTING_REPORT`。
- A09：searched `Focus sprint` and read duration from description；`VERIFIED_EXISTING_REPORT`。
- `android_only_218` has current Core200 edit-existing wording but was not separately executed for this collection；task-level `NOT_VERIFIED`。

## Tasks

### 1. 用户看到的对象是什么

- 首页：task list；primary label 是 title，checkbox 表示 completion。
- detail/edit：Notes、due date/time；importance/hide-until 的当前 UI label 未在 evidence 中逐项记录。
- source/output：existing task、new task、edit-in-place task；不存在 path。

### 2. 普通用户如何打开已有 source

1. 打开 Tasks，在列表按 title 定位。
2. 点 task 进入 detail/edit。
3. 读取 Notes、due、completion 等可见字段。

### 3. 普通用户如何创建/编辑 output

1. `+` 新建，title 是必需的 primary label；或打开 existing task Edit。
2. 填 Notes/due 等任务明确要求的字段。
3. Save；需要完成时使用 checkbox，更新任务不要制造 duplicate。

自由命名规则：instruction 未规定 exact title 时，evaluator 不能隐藏一个 exact title/Notes 模板。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Add one incomplete task for each receipt filename. | Insert one database row per image. |
| Update the existing `Dinner scene request` task; do not create another. | Preserve `_id` while mutating the row. |
| Create an incomplete follow-up task describing the missing waiver. | Use the evaluator's exact hidden title and Notes. |

### 5. Path 暴露规则

- backend：Tasks SQLite rows/IDs。
- policy：`never`。

### 6. 真实 UI 限制

- title is user-visible identity，但相同 title 可能重复；必要时用 visible context/due 区分。
- due time UI is verified；hide-until/importance labels are `NOT_VERIFIED`。
- H04 proved a semantically valid free-title task can be rejected by an undisclosed exact-title evaluator；这是 task design defect。

### 7. Runtime smoke 证据

- H04 `linux_android_1871`：visible create + due time，semantic task rejected only by hidden exact title/Notes；`VERIFIED_EXISTING_REPORT`。
- A08：edit original task, update note, complete without duplicate；`VERIFIED_EXISTING_REPORT`。
- A10：edit task Notes and preserve unrelated task；`VERIFIED_EXISTING_REPORT`。

## Simple SMS Messenger

### 1. 用户看到的对象是什么

- 首页：conversation/thread list，按 contact name/number 和 message preview 定位。
- detail：incoming/sent bubbles and timestamps；source/output 是 message in a conversation。
- user-facing identity：recipient/sender + visible body + thread context，不是 provider box path。

### 2. 普通用户如何打开已有 source

1. 打开 SMS app，按 contact/number 找 thread。
2. 点 conversation。
3. 通过 bubble position/style 读取 incoming request 或已发送 history。

### 3. 普通用户如何创建/编辑 output

1. 在 existing thread 直接 Reply，或新建到 visible contact/number。
2. 输入正文；多行正文由 provider/helper 支持，但当前 UI line-break 输入细节未单独截图。
3. Tap Send；回到 thread 确认一个 sent bubble。

“send exactly one SMS”在任务明确要求单次通知时可观察且自然；不要把 provider 全局 count 的实现细节写进 instruction。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Reply to the existing message from Status Contact. | Insert one row into the sent box. |
| Send Air Quality Lead only the highest-priority alert. | Make `sent_box_count == 1`. |
| Do not send a message if the phone numbers conflict. | Leave the SMS provider unchanged. |

### 5. Path 暴露规则

- backend：SMS provider inbox/sent/thread IDs。
- policy：`never`。

### 6. 真实 UI 限制

- formatted phone number may differ from raw digits。
- injected sent message needs a real thread_id to appear in UI。
- exact body/one-message requirements must be visibly stated, not hidden evaluator preferences。

### 7. Runtime smoke 证据

- H03：existing contact → Text action → exactly one sent alert bubble；`VERIFIED_EXISTING_REPORT`。
- A05：sent reply on wrong phone rejected, correct thread on target phone passed；`VERIFIED_EXISTING_REPORT`。
- A07：natural-language reply accepted；`VERIFIED_EXISTING_REPORT`。

## Clock — Alarm

### 1. 用户看到的对象是什么

- Alarm tab card：time、label、enabled toggle；repeat summary may appear。
- source/output：existing or newly created alarm。

### 2. 普通用户如何打开已有 source

1. Open Clock → Alarm。
2. Locate by time + label。
3. Inspect enabled toggle and edit panel if needed。

### 3. 普通用户如何创建/编辑 output

1. `+` → time picker。
2. Set label and enabled state；repeat only when instruction supports it。
3. Save and confirm visible card。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Add an enabled 07:28 alarm labeled `CASE-1828 RT-28`. | Insert hour 7/minute 28 into Clock DB. |
| Keep the 06:28 fallback alarm enabled. | Preserve the provider recurrence row. |
| Set a one-time alarm only if the UI visibly supports that request. | Require hidden `one_time=true`. |

### 5. Path 暴露规则

- backend：Alarm provider/Google Clock DB。
- policy：`never`。

### 6. 真实 UI 限制

- label/time/enabled are stable visible fields。
- exact recurrence must not be inferred when UI cannot show it。
- 12h/24h display is device setting；instruction should use an unambiguous human time。

### 7. Runtime smoke 证据

- A14：existing 06:28 + new 07:28 alarm，both enabled and visible；`VERIFIED_EXISTING_REPORT`。
- A11：existing 06:45 labeled alarm visible；`VERIFIED_EXISTING_REPORT`。

## Clock — Timer

### 1. 用户看到的对象是什么

- Timer tab：configured duration and changing remaining time；current surface has no supported label contract。
- source/output：running timer；state is transient。

### 2. 普通用户如何打开已有 source

1. Open Clock → Timer。
2. Locate timer by duration。
3. Distinguish configured duration from remaining countdown。

### 3. 普通用户如何创建/编辑 output

1. Enter hours/minutes/seconds on visible keypad。
2. Start timer。
3. Confirm running card immediately；do not use it as a long-lived source guard。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Start a 25-minute timer on the second phone. | Create a timer labeled `Focus`. |
| Leave the timer running when you finish. | Schedule a timer for a future date. |
| Check the current Timer tab immediately. | Require the remaining value to stay exactly 25:00. |

### 5. Path 暴露规则

- backend：Clock preferences/provider/UI state。
- policy：`never`。

### 6. 真实 UI 限制

- no verified timer label support。
- running state changes and can expire；duplicate durations are ambiguous。
- evaluator should bind initial configured duration, not exact remaining seconds。

### 7. Runtime smoke 证据

- A09：entered 25:00，started，UI showed `25m Timer` and 24:59 remaining；`VERIFIED_EXISTING_REPORT`。
- A22：10/15-minute source timers expired during human work；`VERIFIED_EXISTING_REPORT`。

## Retro Music

### 1. 用户看到的对象是什么

- main surfaces：Songs、Playlists、playlist detail、now-playing queue。
- primary labels：song title and playlist name；filename may differ from ID3 song title。
- durable output：playlist；playing queue is transient and not the same object。

### 2. 普通用户如何打开已有 source

1. Open Retro Music → Playlists or Songs。
2. Select named playlist。
3. Read visible track titles and order。

### 3. 普通用户如何创建/编辑 output

1. Create playlist and enter playlist name。
2. Add visible songs；order only if requested。
3. Reopen playlist and confirm membership/order。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Create a playlist named `Morning Commute`. | Write rows to `playlist.db`. |
| Add the three commute tracks in catalog order. | Hydrate the SongEntity list. |
| Read the current `Launch audio` playlist on the second phone. | Treat the playing queue JSON as the playlist. |

### 5. Path 暴露规则

- backend：Music files、MediaStore、Retro playlist/current-queue DB。
- policy：App task `backend_only`; a pure Files task may refer to Music folder filenames。

### 6. 真实 UI 限制

- short MP3 may be filtered from library。
- stale/obsolete injected queue DB can crash app；current queue should be created via real UI。
- queue is transient；durable task goals should prefer playlist。

### 7. Runtime smoke 证据

- A02：Roadtrip Mix and ordered tracks visible；`VERIFIED_EXISTING_REPORT`。
- A11：created/reopened `Morning Commute` with exact ordered tracks；`VERIFIED_EXISTING_REPORT`。
- A16：app-created current queue verified after obsolete DB repair；`VERIFIED_EXISTING_REPORT`。

## Broccoli

### 1. 用户看到的对象是什么

- homepage：recipe list，primary label title；detail/edit exposes description、servings、preparation time、source、ingredients、directions、favorite。
- source/output：recipe object；没有 path。

### 2. 普通用户如何打开已有 source

1. Open Broccoli and locate recipe title。
2. Tap recipe detail。
3. Read visible fields and favorite state。

### 3. 普通用户如何创建/编辑 output

1. `+` create or Edit existing recipe。
2. Fill required fields；ingredients/directions retain meaningful order。
3. Save and confirm list has one intended recipe，not duplicate。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Open the `Evening Prep Snack` recipe in Broccoli. | Query the `recipes` table. |
| Rename that recipe to `Evening Guest Snack` and add lemon. | Change the matching recipeId row. |
| Mark the recipe as a favorite. | Set `favorite=1` in SQLite. |

### 5. Path 暴露规则

- backend：Broccoli native recipe DB。
- policy：`never`。

### 6. 真实 UI 限制

- ingredient separators may serialize differently；instruction should describe facts/order, not DB encoding。
- edit-existing tasks need visible original title and must avoid duplicate creation。

### 7. Runtime smoke 证据

- A05：recipe list showed exact present/absent recipes；`VERIFIED_EXISTING_REPORT`。
- A08：opened, edited same recipe, renamed, added ingredient, no duplicate；`VERIFIED_EXISTING_REPORT`。

## Simple Draw Pro

### 1. 用户看到的对象是什么

- homepage：drawing canvas and drawing tools。
- output：saved bitmap file；canvas itself has no stable app-native title。
- final filename/format/folder are selected through save flow。

### 2. 普通用户如何打开已有 source

1. Typical tasks use a visible brief in another App，not an existing Draw project。
2. Open Draw to a blank canvas。
3. Existing editable project workflow is not supported：`NOT_VERIFIED`。

### 3. 普通用户如何创建/编辑 output

1. Draw visibly on canvas。
2. Tap Save，select PNG/JPEG and target folder。
3. Enter/confirm filename and reopen via Files/Gallery；automatic extension behavior was not separately captured。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Draw a simple road-and-sun cover in Simple Draw Pro. | Set exact hidden pixel values. |
| Save it as `roadtrip_cover.png` in Pictures. | Write a PNG directly with ADB. |
| Make the drawing visibly non-blank and use the requested colors. | Reproduce an evaluator-only geometry. |

### 5. Path 暴露规则

- backend：public bitmap + MediaStore。
- policy：final filename/folder `user_visible_if_device_scoped`; internal storage implementation `backend_only`。

### 6. 真实 UI 限制

- no stable native semantic evaluator；creative meaning requires human visual review。
- exact format/folder is selected at save time。
- exact extension auto-append：`NOT_VERIFIED`。

### 7. Runtime smoke 证据

- A02：visible two-color drawing，Save flow chose PNG/Pictures and produced `roadtrip_cover.png`；`VERIFIED_EXISTING_REPORT`。

## Chrome（Android）

### 1. 用户看到的对象是什么

- user object：rendered local page identified by visible page content/title or URL。
- Core/HV source role only；current Android contract has no stable Chrome output getter。

### 2. 普通用户如何打开已有 source

1. In Files, locate the HTML in Downloads。
2. Tap and choose Chrome when prompted。
3. Read rendered content，not HTML source。

### 3. 普通用户如何创建/编辑 output

1. Chrome can fill local forms or navigate，but arbitrary `file://` pages cannot write arbitrary local files。
2. Android current frozen scope uses Chrome as source viewer，then writes output in another App。
3. localhost accessibility on the supported Android image was not independently tested：`NOT_VERIFIED`。

### 4. Instruction 推荐说法

| GOOD | BAD |
| --- | --- |
| Open `guest_arrival_guide.html` from Downloads in Chrome. | Read the uploaded HTML bytes with shell. |
| Use the visible `Guest arrival guide` table in Chrome. | Treat Chrome history as the task result. |
| Enter the visible URL only when the URL itself is the user-facing locator. | Require Chrome to create `/sdcard/result.json` from a file page. |

### 5. Path 暴露规则

- public HTML path：user-visible when device scoped；prefer Downloads filename。
- browser cache/history/profile：`backend_only`。

### 6. 真实 UI 限制

- HTML upload needs Files-visible indexing/scan。
- no external network/login dependency should be required。
- local missing relative resources make page unusable。
- current generation catalog omits Chrome while runtime/frozen task supports it；catalog drift is not a UI failure。

### 7. Runtime smoke 证据

- A12 `android_smarthome_510`：Files → Chrome rendered local preset table after targeted scan；`VERIFIED_EXISTING_REPORT`。

## Android task-level spot-check index

详细判定见 `human_surface_collection_report.md`。本指南采用的代表任务至少包括：

- Markor：`android_only_305`、`android_smarthome_407`、`linux_android_1034`。
- Files：`android_only_267`、`android_only_305`、`a2l_media_manifest`。
- OsmAnd：`a2_route_media_status`、`android_only_270`、`linux_android_1034`。
- Tasks：`a2_gallery_album_to_tasks`、`android_only_223`、`linux_android_smarthome_696`。
- Calendar：`a2_alarm_conflict_log`、`android_only_218`、`linux_android_1368`。
- SMS：`android_smarthome_464`、`a2_missing_media_status`、`android_only_267`。
- Audio/Gallery：`al_request_audio`、`a2l_audio_thunderbird_draft`、`a2_gallery_cleanup_log`、`a2_gallery_album_to_tasks`。
