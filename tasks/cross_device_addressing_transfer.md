# Cross-Device Addressing & Transfer Semantics

更新日期：2026-08-24  
适用范围：Core200 / Human Validation 1000 多设备 instruction 生成与二次审查。

## 1. 设备命名 convention

统一推荐如下。用户 instruction 使用自然称呼，task/config 内仍使用稳定 device ID。

| Topology | Instruction wording | Internal binding |
| --- | --- | --- |
| 1 Android | `the phone`；需要强调平台时用 `the Android phone` | `android_0` |
| 2 Android | `the first phone` / `the second phone` | `android_0` / `android_1` |
| 1 Linux | `the Linux machine` | `linux_0` |
| 2 Linux | `the first Linux machine` / `the second Linux machine` | `linux_0` / `linux_1` |
| Android + Linux | `the phone` / `the Linux machine` | corresponding IDs |
| 2 Android + 2 Linux | first/second phone and first/second Linux machine；不得只说 `the other device` | four explicit IDs |

`desktop` 可以描述 UI，但不作为 device identity。统一用 `Linux machine`，避免把 desktop session、VM 和物理主机混为一谈。

角色名（例如 `booking-status workstation`）只有在屏幕或 instruction 能让用户把角色唯一映射到某台设备时才可替代 first/second。否则同时给角色与 ordinal：`the first Linux machine (the booking-status workstation)`。

## 2. Device-local path namespace

以下对象彼此不同：

```text
android_0:/sdcard/Download/report.csv
android_1:/sdcard/Download/report.csv
```

```text
linux_0:/tmp/report.csv
linux_1:/tmp/report.csv
```

规则：

1. 两台同类设备下，只给 absolute path 而不说明设备，通常判为 instruction underspecified。
2. setup、instruction、evaluator、cleanup 必须绑定同一个 device ID；自然文案用 ordinal，配置用 ID。
3. path 在一个设备存在，不代表另一个设备存在、可读或已经同步。
4. `localhost`、`127.0.0.1` 和 `file://` 都绑定当前浏览器所在 Linux VM。
5. App-native object 不通过 path 定位；例如 Calendar event、Task、SMS、Contact、OsmAnd favorite、Retro playlist、Thunderbird draft。

GOOD:

- Open `/tmp/sites/rules.csv` on the first Linux machine.
- Open `home_alert_config.json` on the first phone.
- Create the `Route status` note in Markor on the second phone.

BAD:

- Open `/tmp/sites/rules.csv`.（2 Linux）
- Read `/sdcard/Download/source.md`.（2 Android）
- Edit `/data/data/.../events.db` on the phone.

## 3. Cognitive information transfer vs file transfer

### 3.1 始终允许的认知层传递

Agent/人可以：

```text
在设备 A 的可见 UI 读到名字、号码、时间、坐标、代码或少量文本事实
→ 记住/手工抄录
→ 在设备 B 的可见 UI 输入
```

这不是 file transfer。它不要求共享 clipboard、共享目录、ADB 或后台 API。

适合认知传递的对象：

- contact name/email/phone；
- Calendar title/time/location；
- OsmAnd favorite name/coordinates；
- SMS code/body facts；
- Markor note facts；
- filename、row selection、status、short structured records；
- image 上能由人观察的少量 label/scene facts。

当信息量大到普通人无法合理手工重输（大型文档、图片、音频、ZIP、完整代码树），必须改用真实 file/binary channel 或重新设计任务。

### 3.2 文件/二进制本体传递

必须满足：

1. source 文件在设备 A 的用户 UI 中可定位；
2. instruction 指明或允许一个真实用户能操作的 channel；
3. 设备 B 能通过其用户 UI 接收/保存；
4. 传递后用户能在设备 B 重新打开目标文件；
5. task 不把 setup 预先复制的 counterpart 伪装成 participant 已完成 transfer。

`A local export copy is available on Linux at ...` 表示 setup 已提供一个 Linux-local source；它可以让后续 Thunderbird attachment task 可执行，但不能作为 Android → Linux transfer channel 的验证证据。

## 4. Transfer matrix

| Source → Target | text facts | copied text manually | file/binary transfer | verified user-facing channel |
| --- | ---: | ---: | --- | --- |
| Android → Android | YES | YES（读后在另一台手机重输） | **NO** as a general contract | 当前没有已验证的 share/nearby/cloud/USB channel；同名 `/sdcard` 不共享 |
| Android → Linux | YES | YES | **NO** as a general contract | 当前任务只验证认知传递或 setup 预置 Linux-local counterpart；没有 participant 完成的通用 binary channel |
| Linux → Android | YES | YES | **NO** as a general contract | 当前没有已验证的 browser upload、USB、cloud 或 share channel；setup upload 是 backend，不是用户 channel |
| Linux → Linux | YES | YES | **CONDITIONAL** | visible Terminal temporary HTTP server on source VM + visible Terminal/Chrome download on target VM；B08/G01 已验证 |

Confidence：

- Linux → Linux temporary HTTP：`VERIFIED_EXISTING_REPORT`。
- Android↔Android / Android↔Linux lack of general channel：这是当前已验证 capability 的边界；具体新 channel 若未来加入，必须重新 runtime smoke，不可从此表推导“永远不可能”。

### 4.1 Linux → Linux verified channel

已验证流程：

1. source Linux 用 visible Terminal 在 task-owned directory 启动临时 HTTP server。
2. 读取 source VM 的可见地址。
3. target Linux 用 visible Terminal 或 Chrome 请求 exact filename。
4. HTTP 200、保存字节数和 source GET 日志可见。
5. target 用目标 App 打开文件；完成后停止 server。

证据：

- B08：first Linux `/tmp/launch/validator.html` → second Linux `/home/user/launch/validator.html`。
- G01：second Linux `logo_B.jpg` → first Linux GIMP composition。
- `docs/linux_surface_real_ui_audit/test_matrix.md`。

限制：网络可达、端口和 source VM 生命周期必须真实存在；不能把未说明的 host-side copy、shared path 或 setup upload 当成这条 channel。

## 5. App object vs file artifact

### 5.1 App-native object

| Object | Preferred reference | Backend locator policy |
| --- | --- | --- |
| Calendar event | `the "<title>" event in Simple Calendar Pro` | never expose DB/event ID |
| Task | `the "<title>" task in Tasks` | never expose row/ID |
| SMS | `the conversation with <contact>` / `the latest message from <sender>` | never expose provider box/thread ID |
| Contact | `<name> in Contacts` | never expose provider/raw-contact ID |
| OsmAnd favorite | `the "<name>" favorite in OsmAnd` | GPX/private path backend-only |
| Retro playlist | `the "<name>" playlist in Retro Music` | DB/media paths backend-only |
| Thunderbird draft | `the draft with subject "<subject>" in Drafts` | profile mbox path never expose |
| Broccoli recipe | `the "<title>" recipe in Broccoli` | DB path backend-only |

### 5.2 User-visible file artifact

可合理暴露 filename/path，但必须 device-scoped：

- `report.csv in Downloads on the second phone`；
- `/tmp/report.csv on the first Linux machine`；
- `/home/user/documents/brief.odt on the second Linux machine`；
- exported Writer/Calc/Impress/GIMP/PDF/ZIP artifacts。

Android 优先目录名 + filename；Linux 的 exact absolute path 在 task-local workflows 中通常自然。

### 5.3 Backend-only file

默认不得进入 user-facing instruction：

- OsmAnd `favorites.gpx` / `favourites_bak.gpx`；
- Markor storage implementation path when task names Markor；
- Thunderbird Inbox/Drafts mbox and `.msf`；
- Contacts/SMS/Calendar/Tasks/Recipes SQLite/provider；
- Audio Recorder private package files；
- Android `Android/data` and `/data/data` internals。

## 6. 多设备 instruction 生成规则

1. 先列 source device + surface + user-visible object，再列 output device + surface + object。
2. 在 2A/2L topology 中，每个首次出现的 path/object 都绑定 ordinal device。
3. 后续代词只有在 antecedent 唯一时使用；不要写 `there`、`the other machine` 让路径重新变得含糊。
4. 认知 transfer 说“read X, then enter those values in Y”；不要使用 `copy the file`。
5. binary transfer 说清 channel 或至少提供一个真实可选 channel；如果没有，重构为事实传递或在 target 预置明确的 local copy。
6. target App 的 normal workflow 决定 output wording；evaluator path 不应倒推 instruction。

### 6.1 2 Android example

GOOD:

> Read the `Site Manager` contact on the first phone. On the second phone, open the `Dock West` favorite in OsmAnd and create a Markor note called `Dock West handoff` with the visible contact and favorite details.

BAD:

> Read Contacts and OsmAnd, then write `/storage/emulated/0/Documents/Markor/Dock West handoff.md`.

### 6.2 2 Linux example

GOOD:

> Read `/tmp/orders/orders.csv` on the first Linux machine and create `/tmp/orders/orders.json` on the second Linux machine.

BAD:

> Convert `/tmp/orders/orders.csv` to `/tmp/orders/orders.json`.

### 6.3 2 Android + 2 Linux example

GOOD:

> Read the request in Downloads on the first phone and the policy files on the first Linux machine. Keep the `Reference Depot` favorite in OsmAnd on the second phone unchanged. Create a Markor note called `1034-A route decision` on the second phone and write the dispatcher handoff to `/tmp/sites/1034-A_handoff.txt` on the second Linux machine.

BAD:

> Reconcile `/sdcard/Download/1034-A_source.md` with `/tmp/sites/...`, preserve OsmAnd, write `/storage/emulated/0/Documents/Markor/1034-A_blocked.md`, and create `/tmp/sites/1034-A_handoff.txt`.

## 7. Core200 transfer spot checks

| Task | What crosses devices | Classification | Finding |
| --- | --- | --- | --- |
| `a2l2_vscode_web_music_final_gate` | corrected HTML from Linux 1 to Linux 2 | binary | feasible via verified temporary HTTP channel；current instruction says “Copy” but does not name channel |
| `a2l_audio_thunderbird_draft` | Android recording facts + Linux-local WAV | facts + preseeded counterpart | no Android→Linux participant binary transfer is required；wording correctly says local export copy exists |
| `a2l2_training_media_deck_email` | Camera filename and contact email into Linux deck/draft | facts | no photo binary transfer is requested；deck records filename only |
| `al_map_audio_packet` | names/coordinates/memo filenames into Linux document | facts | cognitive transfer only；Linux document does not embed Android audio bytes |
| `linux_only_295` | manifest facts from first Linux; archive inputs on second | facts | no cross-VM file copy required by current wording |
| `linux_only_300` | manifest facts from first Linux; images/output on second | facts | no cross-VM image transfer required |

当前 Core200 instruction 扫描没有发现一个可直接定论为“要求 Android↔Linux/Android↔Android binary transfer 且没有任何 target-local source”的任务。不要为了交差制造 impossible count；后续逐任务审查若发现真实例子再加入。

## 8. Review decision rules

- `PASS`：对象、设备和路径唯一；操作可由真实 UI 完成；传递类型与可用 channel 一致。
- `NEEDS_REWORDING`：动作可行，但 path/device/backend wording 不自然或含糊。
- `UNSUPPORTED_TRANSFER`：确实要求 file/binary 跨设备，且没有 verified user-facing channel 或 target-local copy。
- `NOT_VERIFIED`：可能存在 channel，但尚未 real-UI smoke；不得批量修复成某个假定 channel。

