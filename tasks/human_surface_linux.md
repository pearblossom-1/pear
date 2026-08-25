# Linux Human-Facing Surface Guide

更新日期：2026-08-24  
适用范围：冻结 Core200 / Human Validation 1000 的 Ubuntu VMware surface  
边界：本文只描述用户可见对象、真实 GUI 路径和自然 instruction；不修改 task、setup、evaluator 或 oracle。

## 证据等级

- `VERIFIED_RUNTIME`：本轮当前会话直接观察。
- `VERIFIED_EXISTING_REPORT`：已有 screen-driven real-UI 报告和截图/事件。
- `CODE_INFERRED`：由 runtime/config 推断，不能单独用于批量修复。
- `NOT_VERIFIED`：当前证据没有回答。

## 全局 path semantics

| Path root | 用户语义 | 当前结论 | Confidence |
| --- | --- | --- | --- |
| `/tmp/...` | task-local file/directory；可通过 Files location entry、应用 file picker、Terminal、VS Code、LibreOffice 打开 | 一般是可用的 user-facing task path；但 Snap Chromium/Firefox 无法看到 host `/tmp` 文件 | `VERIFIED_EXISTING_REPORT` |
| `/home/user/...` | 当前 Ubuntu 用户的 Home 下持久目录 | Files、Chrome/Chromium、VS Code、LibreOffice 可正常使用；浏览器本地 HTML 优先放这里 | `VERIFIED_EXISTING_REPORT` |
| `/home/oai/...` | 不是当前镜像的稳定用户 Home 约定 | `linux_android_1005` 的 `/home/oai/...` 在两台授权 VM 上不可写；除非逐 VM 实测，不应作为新任务默认路径 | one failure `VERIFIED_EXISTING_REPORT`; general support `NOT_VERIFIED` |
| `~/.thunderbird/...` | Thunderbird profile implementation | 永远 backend-only；用户按 folder/subject/sender 操作 | `VERIFIED_EXISTING_REPORT` |

多 Linux 规则：`linux_0:/tmp/x` 与 `linux_1:/tmp/x` 不是同一文件。只写 `/tmp/x` 且不说明设备，在两台 Linux 下通常是 underspecified。统一用 `on the first Linux machine` / `on the second Linux machine`。

## File Manager（Ubuntu Files）

### 1. User-facing object

- 主要对象：folder、file、filename、size、hidden state；extension 通常显示。
- 用户不需要理解 setup upload 或 evaluator getter。

### 2. Existing source 的正常打开方式

1. 打开 Files。
2. 使用位置输入（`Ctrl+L` 或 file picker 的 Location）进入 `/tmp/...` 或 `/home/user/...`。
3. 双击或用 **Open With Other Application** 选择正确 viewer。

当前关联行为：CSV 通常进入 Calc；JSON/HTML 可能默认进入 Firefox/Chromium；在 `/tmp` 下该默认浏览器会失败，Text Editor 是文本 source 的可见 fallback。Markdown 可用 Text Editor。逐版本的所有默认关联不是合同。

### 3. Output 的正常创建方式

1. 由目标 App Save/Export，或 Files 新建 folder。
2. 用 Rename/Move/Copy 整理到 exact path。
3. 双击重开确认 persistence。

### 4. Path semantics

- `/tmp`：Files 可定位且大量 real-UI run 成功；浏览器例外见 Chrome。
- `/home/user`：Home 下自然路径。
- `/home/oai`：不要默认使用；已出现不可写任务。
- hidden files：F01 显示 hidden cache directories；可通过可见设置/Files 显示。
- 多机：同名路径必须绑定 first/second machine。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Open `/tmp/orders/orders.csv` on the first Linux machine. | Open `/tmp/orders/orders.csv` when two Linux machines exist. |
| In Files, move the new statement to `/home/user/download/statement.pdf`. | Move whichever numbered statement looks newest. |
| Open the JSON with Text Editor if the default browser cannot access it. | Assume every default file association is usable. |

### 6. Save / Save As / Export

- 默认目录取决于当前 App/上次 picker，不应暗中假设。
- full filename 和 extension 应出现在 instruction when exact path is scored。
- overwrite dialog/version behavior：`NOT_VERIFIED` as a general rule；task-specific flows succeeded without hidden overwrite dependency。

### 7. Runtime limits

- Snap-confined browser cannot see host `/tmp`。
- shared `init_state` 有 stale LibreOffice window/recovery state，可能抢焦点。
- underscore bulk input 曾被控制桥丢失；真人可用 `Shift+-` 修正，属于 transport limitation。

### 8. Runtime evidence

- C03/F01/F02/F04/D01/P01 等通过 Files 定位、打开和重开；`VERIFIED_EXISTING_REPORT`。
- evidence：`docs/linux_surface_real_ui_audit/test_matrix.md`、`findings.md`。

## Text Editor

### 1. User-facing object

- 主要对象：plain-text file、完整 path/filename、文本内容、line/column。
- extension 显示在 Files/window title；编辑器不是结构化 CSV/JSON evaluator，但适合可见读取或小型文本输出。

### 2. Existing source 的正常打开方式

1. Files 定位文本/Markdown/JSON/HTML。
2. Double-click；若默认 browser 失败，Open With Other Application → Text Editor。
3. 按可见内容读取，不把 HTML source 当渲染页面使用。

### 3. Output 的正常创建方式

1. 新建或打开 existing text。
2. 编辑/append，Save。
3. 完全关闭并从 Files 重新打开确认。

### 4. Path semantics

- `/tmp`、`/home/user` 都真实可用。
- 多 Linux 必须说哪台；F04 在 second Linux 编辑 `/home/user/notes/play_request.md`。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Append one final status line to `play_request.md` on the second Linux machine. | Mutate the file returned by `vm_file_text`. |
| Open `patch_manifest.json` with a text editor if Firefox cannot read it. | Treat a browser error page as the JSON source. |
| Preserve the original six logical lines. | Preserve the editor's visual wrapping exactly. |

### 6. Save / Save As / Export

- plain Save preserves text file path；Save As 可选 path。
- visual wrapping does not create new logical newline；F04 verified via line indicator。
- encoding edge cases未要求，不在本轮范围；current fixtures are ordinary UTF-8 text。

### 7. Runtime limits

- Text Editor is valid fallback only when task asks to read text, not when browser rendering/interaction itself is required。
- metadata warnings may appear but saved body can remain correct（G02 CSV index）。

### 8. Runtime evidence

- F01/F02/I01/F04 and 1034 H04 source reading；`VERIFIED_EXISTING_REPORT`。

## Terminal

### 1. User-facing object

- 主要对象：visible command、cwd、stdout/stderr、created files、exit result。
- exact shell implementation in every VM session was not recorded：`NOT_VERIFIED`；tasks use ordinary local commands through visible Terminal。

### 2. Existing source 的正常打开方式

1. Open Terminal on the specified Linux machine。
2. `cd` to visible project/path or run a fully specified local command。
3. Read stdout only when instruction/source tells the user what command is relevant。

### 3. Output 的正常创建方式

1. Run deterministic local command or project test。
2. Redirect/tee output only when the task naturally asks for a log/artifact。
3. Reopen the result in Text Editor/Files/target App。

### 4. Path semantics

- cwd is device-local；the same `cd /tmp/project` on another VM is a different project。
- Terminal is natural for code/test, archive, local HTTP transfer, and format validation；not natural for a Writer/Calc task whose goal is normal document editing。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| In the project terminal, run `python3 test_suite.py` and save the visible result to `test.txt`. | Use Terminal for every file operation regardless of the requested App. |
| Start a temporary HTTP server on the first Linux machine to transfer the file. | Assume the two VMs share `/tmp`. |
| Use the supplied tests to verify the local fix. | Run a hidden command not mentioned by any visible source. |

### 6. Save / Save As / Export

- output filename/path comes from command；no GUI extension auto-append。
- use exact path only when publicly required。

### 7. Runtime limits

- network commands must be local/deterministic；no external internet dependency。
- terminal use is human-facing only when command intent is part of task, not an evaluator backdoor。

### 8. Runtime evidence

- D02 visible failing/passing test runs；F01 visible ZIP creation；B08/G01 visible HTTP transfer；`VERIFIED_EXISTING_REPORT`。

## Chrome / Chromium

### 1. User-facing object

- 主要对象：rendered page identified by URL, visible page title/content, tab, fragment, form state, download。
- task says Chrome, current launcher is Snap Chromium on the audited image。

### 2. Existing source 的正常打开方式

1. For local files, prefer `/home/user/...` and open `file:///home/user/...` or use Files。
2. For interactive local service, open `http://127.0.0.1:<port>/...` or the visible VM address when cross-VM。
3. Confirm real content, not `ERR_FILE_NOT_FOUND`。

### 3. Output 的正常创建方式

1. Fill visible form / click link / leave required tab state。
2. Downloads may need visible override for insecure HTTP and then Files rename/move。
3. `file://` HTML cannot create arbitrary local `/tmp` output unless another visible mechanism provides it。

### 4. Path semantics

- `/home/user` local HTML：works。
- `/tmp` local HTML：Snap Chromium resolves a different namespace and shows `ERR_FILE_NOT_FOUND` despite host file existing。
- page title vs URL：use title for human identification; use URL/path only where the locator/fragment is part of task。
- multi Linux：URL or page path must bind device；localhost always means that browser's own VM。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Open `/home/user/meetings/index.html` in Chrome on the second Linux machine. | Open `/tmp/form/request_form.html` in Snap Chromium. |
| Leave the `MID-42` anchored page open. | Make the evaluator's `open_tabs_info` true. |
| Download the visible statement, then rename it in Files to the requested path. | Assume one click always completes an HTTP download. |

### 6. Save / Save As / Export

- download default observed under `/home/user` with numbered duplicates from stale baseline。
- form submission is page/receiver state，not a generic local file write。
- bookmark state is user-facing but an error-page URL can still be bookmarked；page readability must be separately ensured。

### 7. Runtime limits

- BR-001：24 frozen `/tmp` browser-contract candidates require review；B02/B06/B07 failed this exact boundary。
- insecure HTTP download needed **Download insecure file** visible override。
- stale download history adds filename ambiguity。

### 8. Runtime evidence

- B01/B03/B04/B05/B08 pass；B02/B06/B07 fail；all `VERIFIED_EXISTING_REPORT`。

## VS Code

### 1. User-facing object

- 主要对象：file, folder/workspace/project, Explorer tree, editor buffer, Problems count, integrated terminal。
- project/folder 是用户概念；backend evaluator file getter不是。

### 2. Existing source 的正常打开方式

1. File → Open Folder，或 Files → Open With VS Code。
2. Select `/tmp/project` or `/home/user/project`。
3. Use Explorer to open exact file；confirm seeded content, not an empty unsaved buffer。

### 3. Output 的正常创建方式

1. Edit visible source/config。
2. Save and resolve visible syntax/Problems errors。
3. Run task-local tests in integrated terminal if requested；restart/reopen when persistence matters。

### 4. Path semantics

- `/tmp` project is feasible in ordinary `/usr/share/code` VS Code；not Snap-confined in the audited image。
- device scope remains mandatory in 2L tasks。
- instruction `open /tmp/project in VSCode on the second Linux machine` is natural and verified。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Open `/tmp/code/project` in VS Code on the second Linux machine. | Edit the `vm_file` result. |
| Fix `validator.html` in the first Linux machine's VS Code project. | Open `/tmp/launch` without saying which Linux machine. |
| Run the supplied local tests in the integrated terminal. | Use hidden evaluator expectations as the fix specification. |

### 6. Save / Save As / Export

- normal Save persists exact file；no format conversion。
- folder/workspace trust prompt may appear；allowing the explicitly requested local tests worked。
- reopening project verified settings persistence。

### 7. Runtime limits

- Restricted Mode did not block settings edit；Workspace Trust appeared for test execution。
- shared baseline could show unrelated Calc window and steal focus。
- an early B08 setup observation lacked files, but exclusive rerun did not reproduce；not a current blocker。

### 8. Runtime evidence

- D01 workspace settings, D02 Python project, B08 HTML/JS project：`VERIFIED_EXISTING_REPORT`。

## LibreOffice Writer

### 1. User-facing object

- 主要对象：document, title/body/table/template placeholders, visible filename/window title。
- extension is part of file artifact；ODT/DOCX are distinct formats。

### 2. Existing source 的正常打开方式

1. Open Writer，File → Open，or double-click ODT/DOCX in Files。
2. Navigate to the device-scoped path。
3. Inspect document content/table and read-only state before editing。

### 3. Output 的正常创建方式

1. New document or edit supplied template。
2. File → Save As, select `.odt` or `.docx` exact path。
3. Close Writer fully and reopen target；Export as PDF when explicitly requested。

### 4. Path semantics

- `/tmp` and `/home/user` both passed create/edit flows。
- multi Linux path must bind device；template and output may intentionally be on different VMs only if a real transfer channel exists or both local assets are seeded。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Use the Writer template on the first Linux machine to create `/tmp/meeting/agenda.docx`. | Edit the OOXML XML directly. |
| Preserve the template's title and single table. | Preserve every ZIP byte after normal GUI save. |
| Export the completed document as `/tmp/sites/packet.pdf`. | Produce the evaluator's hidden text anchors. |

### 6. Save / Save As / Export

- ODT create/reopen verified；DOCX edit/table preservation verified。
- exact auto-extension checkbox behavior was not separately recorded：`NOT_VERIFIED`; safest instruction gives full filename and format。
- format confirmation prompts can occur when saving non-native format；exact prompt path `NOT_VERIFIED` for these runs。
- lock/read-only behavior未独立 smoke；stale recovery prompt is confirmed but not a read-only lock。

### 7. Runtime limits

- LO-001 stale `template.docx` recovery prompt exists in both VM snapshots；person can Discard and continue。
- setup can avoid it with clean task-owned profile, but this collection did not modify baseline。

### 8. Runtime evidence

- W01 new ODT, W02 template ODT, W03 DOCX table：all `VERIFIED_EXISTING_REPORT`。

## LibreOffice Calc

### 1. User-facing object

- 主要对象：CSV table/import preview, workbook, worksheet tabs/names, cell values/formulas。
- CSV and XLSX/ODS are visibly different formats/workflows。

### 2. Existing source 的正常打开方式

1. Open file through Files/Calc picker。
2. CSV: inspect Text Import dialog and choose actual delimiter。
3. XLSX/ODS: open workbook directly and identify relevant sheet/cells。

### 3. Output 的正常创建方式

1. Edit cells or create table。
2. Save / Save As exact `.csv`, `.xlsx`, or `.ods` path。
3. Close Calc and reopen output；for CSV, pass import dialog again and confirm rows/columns。

### 4. Path semantics

- `/tmp` and `/home/user` both verified。
- same workbook path on two Linux machines is not shared。
- first/second Linux wording is required。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Open `/tmp/pay/run.csv` on the first Linux machine in Calc. | Read whichever `/tmp/pay/run.csv` exists. |
| Save the completed workbook as `/tmp/pay/fixed.csv`. | Change the cells expected by `check_csv`. |
| Preserve all unrelated cells in `inventory.xlsx`. | Rebuild the workbook from evaluator metadata. |

### 6. Save / Save As / Export

- CSV import dialog is real and delimiter matters。
- XLSX create/edit and ODS native save/reopen passed。
- saving XLSX vs ODS may show format prompt；exact UI text was not separately logged：`NOT_VERIFIED`。
- sheet names are user-visible and can be required when task source/template exposes them。
- workbook lock/read-only behavior：`NOT_VERIFIED`；stale recovery is separate。

### 7. Runtime limits

- stale recovery prompt and unrelated blank Calc window can interrupt。
- concurrent runner once removed `/tmp/pay`; exclusive rerun passed, so not a task defect。

### 8. Runtime evidence

- C01 new XLSX, C02 edit XLSX, C03 CSV Save As, C04 ODS：`VERIFIED_EXISTING_REPORT`。

## LibreOffice Impress

### 1. User-facing object

- 主要对象：presentation/deck, slides, template, slide count/order, visible text/images。
- ODP/PPTX filename identifies artifact；normal GUI save may normalize internal XML serialization。

### 2. Existing source 的正常打开方式

1. Open supplied `.odp`/`.pptx` template in Impress。
2. Dismiss unrelated recovery prompt if shown。
3. Inspect slide count/layout before editing。

### 3. Output 的正常创建方式

1. Create/edit slides from visible sources。
2. Save As `.odp`/`.pptx` as requested。
3. Export PDF through visible dialog；close/reopen deck and PDF。

### 4. Path semantics

- `/tmp` and `/home/user` template/output flows verified。
- source/output on different VMs need device scope and factual transfer, not assumed shared path。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Use `/tmp/train/template.odp` on the second Linux machine to create `deck.odp`. | Edit `content.xml` to satisfy text anchors. |
| Create exactly four slides in the supplied template. | Preserve byte-identical ODP serialization. |
| Export the finished deck as `/tmp/train/training_deck.pdf`. | Let the evaluator infer where the PDF was saved. |

### 6. Save / Save As / Export

- new ODP + PDF export and template edit/reopen verified。
- ODP/PPTX format confirmation behavior not separately recorded：`NOT_VERIFIED`。
- normal GUI can rewrite XML/package ordering；semantic evaluator should not require byte identity unless task explicitly requires exact copy。

### 7. Runtime limits

- LO-001 recovery prompt。
- template source must be concrete file，not an unexplained directory。

### 8. Runtime evidence

- I01 three-slide ODP + three-page PDF；I02 four-slide template output：`VERIFIED_EXISTING_REPORT`。

## Thunderbird

### 1. User-facing object

- Inbox source：folder + subject + sender/body/attachment。
- Draft source/output：Drafts folder + subject + recipient/body/attachment；not an mbox file。
- Standalone `.eml`：file artifact opened in Thunderbird message view/compose depending on headers。
- Folder move：visible message moved from Inbox to named folder。
- Sent：current benchmark has no remote mail-server state contract；do not equate that with Thunderbird being unable to send in general。

### 2. Existing source 的正常打开方式

1. Inbox/Drafts: open Thunderbird → Local Folders/account folder → select by subject/sender。
2. Attachment: open message，use visible attachment bar/Save control。
3. Standalone EML: from Files double-click/Open With Thunderbird；a complete RFC-style message rendered as readable message view。

### 3. Output 的正常创建方式

1. New Message，fill To/Subject/body，attach through visible picker。
2. Save (`Ctrl+S` or Save)，close compose，open Drafts and reopen subject。
3. Do not Send when task requests local draft；remote server delivery is not supported by current task contract。

Observed draft state：after Save, compose remains editable；after close, Drafts shows one row labeled by recipient and subject；reopen retains fields and attachment。

### 4. Path semantics

- profile/mbox path：never user-facing。
- attachment source path may be user-visible, e.g. `/tmp/audio_thunderbird_draft/client-call.wav` on the named Linux machine。
- two Linux machines：folder/mailbox belongs to the Thunderbird instance on one specific VM。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Open the `Tasks for today` message in Thunderbird Inbox. | Read `~/.thunderbird/.../Inbox`. |
| Leave an unsent draft with subject `Client call recording`. | Write the message into the Drafts mbox. |
| Save the attached `tasks.csv` through Thunderbird's attachment control. | Pull the MIME part from the profile. |

### 6. Save / Save As / Export

- Draft save/reopen and attachment persistence verified。
- Attachment Save chooser works；M07 then opened saved CSV in Calc。Default destination was not recorded as a stable rule：`NOT_VERIFIED`。
- standalone EML must contain complete headers/CRLF/content type for reliable display；minimal `X-Unsent` file opened blank compose body。
- Sent tasks unsupported because current environment lacks a remote mail server/evaluator contract，not because local draft cannot be detected。

### 7. Runtime limits

- local profiles can be usable without remote account；M01–M03 passed profile/compose classes。
- first-run/account wizard depends on profile setup；M05 showed usable Local Folders, not a blocking wizard。
- TB-001：`linux_only_074` seeded invalid Drafts mbox (missing envelope separator), so UI showed 0 Messages。
- current draft getter evaluates real profile Drafts；standalone sidecar `.eml` is a different artifact class。

### 8. Runtime evidence

- M04 Inbox/folder moves；M05 draft with attachment；M07 Inbox attachment Save；F03 standalone EML；M06 invalid seeded Drafts failure：all `VERIFIED_EXISTING_REPORT`。

## VLC

### 1. User-facing object

- 主要对象：current media filename/window title, video frame, play/pause state, position, repeat state。
- playlist/current playback is transient；future schedule is not supported。

### 2. Existing source 的正常打开方式

1. Files locate media on specified Linux machine。
2. Open With VLC。
3. Confirm exact filename/title and pause icon/progress。

### 3. Output 的正常创建方式

1. Start requested media now。
2. If task must remain active and clip is short, enable visible repeat。
3. Leave VLC open at finish；pair with a durable report when task needs lasting evidence。

### 4. Path semantics

- expected file is device-local；same basename elsewhere is not current playback。
- user normally identifies basename/media title, not VLC HTTP interface/backend。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Play `song_harbor.wav` in VLC on the first Linux machine. | Make `vlc_playing_file` return true. |
| Leave the clip playing; enable repeat if needed. | Schedule VLC to start later. |
| Record the currently visible basename without changing playback. | Infer playback from file existence. |

### 6. Save / Save As / Export

- VLC is viewer/player，not durable output editor in current contracts。
- playlist save content evaluator not supported。

### 7. Runtime limits

- 4 s/10 s clips end before cross-device work completes；visible repeat makes state sustainable。
- no schedule evaluator；no stable native playlist-content evaluator。

### 8. Runtime evidence

- V01 looped WAV, V02 user-started WAV, V03 MP4：`VERIFIED_EXISTING_REPORT`。

## GIMP

### 1. User-facing object

- 主要对象：bitmap image, canvas dimensions, layers, text layer, export filename。
- editable XCF project is not part of current stable task contract；final PNG/JPEG is user-visible artifact。

### 2. Existing source 的正常打开方式

1. Files/Image Viewer inspect source bitmap。
2. Open base image in GIMP。
3. Import additional image as layer when task requires composition。

### 3. Output 的正常创建方式

1. Perform visible layer/scale/text edits。
2. Use Export/Export As for PNG/JPEG；GIMP Save is for project format。
3. Close and reopen exported bitmap in Image Viewer。

### 4. Path semantics

- final path `/home/user/...png` or `/tmp/...png` must be device scoped。
- cross-VM source image requires real channel；G01 used visible temporary HTTP transfer。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Export the final banner as `/home/user/images/event_banner_final.png`. | Save the bitmap with GIMP's project Save and assume PNG. |
| Add the visible text `Organizer: ACME Labs`. | Satisfy hidden OCR anchors. |
| Use only the approved images from the visible manifest. | Import files from another VM's same path. |

### 6. Save / Save As / Export

- PNG export path and reopened render verified。
- exact dimensions can be visibly set and checked；JPEG/PNG quality dialog specifics not generalized。
- editable XCF behavior：`NOT_VERIFIED` and outside current stable contract。

### 7. Runtime limits

- subjective visual quality is human review；dimensions/text/source membership may be machine checked if public。
- OCR unreliable for tiny/low-contrast text。

### 8. Runtime evidence

- G01 banner composition + text + cross-VM logo；G02 1200×800 contact sheet：`VERIFIED_EXISTING_REPORT`。

## Image Viewer

### 1. User-facing object

- bitmap file and rendered image at a zoom level；filename/window title。

### 2. Existing source 的正常打开方式

1. Double-click image in Files。
2. Inspect full render/zoom。
3. Use filename and visible content together。

### 3. Output 的正常创建方式

1. Image Viewer does not create task bitmap output。
2. Reopen exported image from GIMP/other App for persistence check。
3. Use Details/Terminal only when task explicitly asks metadata。

### 4. Path semantics

- path is user-visible file artifact and must be device scoped。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Open `logo_B.jpg` in Image Viewer on the second Linux machine. | Read pixels through evaluator only. |
| Reopen the exported contact sheet and inspect it at 100%. | Assume GIMP export succeeded because a path exists. |
| Identify the visible source photo by filename. | Refer to another VM's identical path as the same image. |

### 6. Save / Save As / Export

- viewer only；no stable output save contract。

### 7. Runtime limits

- open/render proves readability，not semantic correctness by itself。

### 8. Runtime evidence

- G01/G02 source and output images reopened；`VERIFIED_EXISTING_REPORT`。

## PDF / Document Viewer

### 1. User-facing object

- PDF filename, rendered pages, visible text/images, page indicator。

### 2. Existing source 的正常打开方式

1. Files locate PDF on named Linux machine。
2. Double-click/open in Document Viewer。
3. Navigate pages and read visible content。

### 3. Output 的正常创建方式

1. Writer/Impress or another source App exports PDF。
2. Confirm exact output filename in Files。
3. Open in Document Viewer and inspect page count/content。

### 4. Path semantics

- `/tmp` PDF is normally viewer-accessible；browser confinement is irrelevant to Document Viewer。
- multi Linux path must bind device。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Open `/tmp/review/policy.pdf` on the first Linux machine. | Extract the evaluator's PDF text silently. |
| Export the deck as `training_deck.pdf` and reopen it. | Assume an ODP save also created a PDF. |
| Go to page 3 in Document Viewer. | Read page XML/object IDs. |

### 6. Save / Save As / Export

- viewer does not save source；PDF produced by Office Export。
- exact rendering comparison is evaluator concern only when public visual contract exists。

### 7. Runtime limits

- scanned/image PDF may not expose selectable text；current visible read still works if content legible。
- default viewer is Document Viewer on audited image。

### 8. Runtime evidence

- P01 one-page seeded PDF；I01 three-page exported PDF；B04 downloaded statement PDF：`VERIFIED_EXISTING_REPORT`。

## ZIP / Archive Manager

### 1. User-facing object

- ZIP archive file and visible member list/path；extracted folder/files。

### 2. Existing source 的正常打开方式

1. Double-click ZIP in Files。
2. Archive Manager lists members without extraction。
3. Select/extract when task needs files；完整 GUI extract flow未独立记录：`NOT_VERIFIED`。

### 3. Output 的正常创建方式

1. For deterministic manifest-driven packaging, visible Terminal `zip` is natural。
2. Reopen ZIP in Archive Manager。
3. Verify visible member names and paths。

### 4. Path semantics

- archive and source members are local to one VM；same `/tmp` on second VM is unrelated。
- if inputs span VMs, transfer them via a real user-facing channel before packaging。

### 5. Instruction wording

| GOOD | BAD |
| --- | --- |
| Create `/tmp/patch/patch_bundle.zip` on the second Linux machine from the selected local files. | Zip files from the first VM's `/tmp` without transferring them. |
| Reopen the archive and confirm the two root members. | Compare internal timestamps manually. |
| Keep archive member paths relative to the project root. | Use evaluator archive ordering as user instructions. |

### 6. Save / Save As / Export

- visible Terminal creation + Archive Manager reopen verified。
- archive metadata timestamps/order are not natural user goals unless explicitly required。

### 7. Runtime limits

- File Manager can browse via Archive Manager；GUI extract exact flow remains `NOT_VERIFIED`。
- terminal unzip/zip is often more natural for exact manifest-driven packaging than many GUI selections。

### 8. Runtime evidence

- F01 manifest-driven ZIP creation and Archive Manager member view：`VERIFIED_EXISTING_REPORT`。

## Linux task-level spot-check index

详细判定见 `human_surface_collection_report.md`。代表任务包括：

- Thunderbird：`a2l_audio_thunderbird_draft`、`l2_mail_rule_foldering`、`al_thunderbird_attachment_to_tasks`。
- Writer：`al_writer_from_note_gui`、`a2l_agenda_from_two_phones`、`linux_only_313`。
- Calc：`al2_data_transform_sync`、`l2_csv_to_json`、`a2l_osmand_calc_visit`。
- Impress：`a2l2_training_deck_notify`、`a2l2_training_media_deck_email`。
- VS Code：`l2_vscode_settings_update`、`a2l2_vscode_web_music_final_gate`。
- Chrome：`a2l_browser_dual_phone_code`、`al_camera_web_upload_form`、`linux_only_313`。
- PDF/ZIP/GIMP：`linux_android_1217`、`linux_only_295`、`linux_only_300`、`linux_only_305`、`linux_only_327`。

