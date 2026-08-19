# Core 062 — `linux_android_905`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 62 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_905.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 50 步，最长 420 秒

## 0. 任务链与最终要做的事

先用手机 source 与第一台 Linux 的 setlist/policy 确认批准的是 `905-A / NX90530 / Jon Bell`，再在手机 Retro Music 中按顺序创建两首歌的 playlist，最后到第二台 Linux 写 ready handoff。Playlist 和 handoff 是两个独立评测点。

## 1. Instruction

### 英文原文（逐字）

```text
Prepare the approved event playlist handoff. The phone has `/sdcard/Download/905-A_source.md`; Linux has `/tmp/event/setlist.csv` and `/tmp/event/handoff_policy.md`. Create the Retro Music playlist `905-A route set` in the track order given by the setlist, then leave a concise ready handoff at `/tmp/event/handoff.txt` on the second Linux desktop. The handoff should clearly relate the selected case, approval code, owner, and ready status.
```

### 中文翻译

准备已批准的 event playlist 交接。手机上有 `/sdcard/Download/905-A_source.md`，Linux 上有 `/tmp/event/setlist.csv` 和 `/tmp/event/handoff_policy.md`。请按照 setlist 中给出的歌曲顺序，在 Retro Music 中创建名为 `905-A route set` 的播放列表；然后在第二台 Linux 的 `/tmp/event/handoff.txt` 写一份简洁的 ready handoff。Handoff 要清楚地关联选中的 case、approval code、owner 和 ready 状态。

## 2. 输入、附件与初始业务数据

### 2.1 手机 source

`/sdcard/Download/905-A_source.md` 只有三行：

```text
905-A
NX90530
Jon Bell
```

### 2.2 第一台 Linux 的 `setlist.csv`

```csv
case_id,owner,status,code,playlist,track_order,track
905-A,Jon Bell,approved,NX90530,905-A route set,1,track_905_alpha
905-A,Jon Bell,approved,NX90530,905-A route set,2,track_905_bravo
905-D,Jon Bell,hold,D9057,905-D draft set,1,track_905_draft
```

因此当前 playlist 必须是 `905-A route set`，歌曲次序为：

1. `track_905_alpha`
2. `track_905_bravo`

`905-D` 是 hold 状态的 draft 干扰行，不能加入 playlist 或 handoff。

### 2.3 第一台 Linux 的 `handoff_policy.md`

```text
# Retro playlist event draft handoff policy

Current approved source row: 905-A
Approval code: NX90530
Owner: Jon Bell (Field coordinator)
Required decision: Match the playlist name to the approved source and preserve the ordered tracks from the setlist.
The second-desktop handoff must relate the case id, owner, approval code, and whether the playlist is ready. Natural concise prose is preferred.
Authority note: row 905-D is a draft on hold; use the current approved set.
```

### 2.4 手机初始音乐库

Setup 清空 Retro Music 后，向曲库推入两首可用歌曲：`track_905_alpha` 和 `track_905_bravo`。没有推入 `track_905_draft`。

## 3. Setup 具体流程

### `android_0`

- 确保 Files 可用并上传 905-A_source.md。
- 确保 Retro Music 可用，清空其播放列表/音乐状态。
- 推入 alpha、bravo 两首测试音轨；目标 playlist 尚不存在。

### `linux_0`

- 创建 `/tmp/event`，删除旧 setlist 与 policy。
- 上传 setlist.csv 和 handoff_policy.md。

### `linux_1`

- 创建 `/tmp/event`。
- 删除旧的 `/tmp/event/handoff.txt`，留给执行者创建。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluation 单元：手机 playlist 与第二台 Linux handoff。两项都过才是完整通过。

### 4.1 Retro Music playlist

- 必须恰好找到一个名称规范化后等于 `905-A route set` 的 playlist。名称比较忽略大小写差异和多余连续空白，但仍建议逐字命名。
- 该 playlist 的歌曲列表必须恰好等于 `[track_905_alpha, track_905_bravo]`。
- `order_sensitive=true`：bravo 在前、alpha 在后会失败。
- 数量也严格：漏歌、重复一首或加入其他歌曲都会失败。
- Getter 默认允许存在名称不同的无关 playlist；它不要求整个 Retro Music 中只能有这一张 playlist。不过 Setup 已清空状态，没有理由创建额外列表。

### 4.2 第二台 Linux 的 handoff.txt

一份稳妥内容是：

```text
905-A / NX90530 for Jon Bell is approved and ready.
```

实际匹配规则：

- 全文必须出现 `905-A`、`NX90530`、`Jon Bell`。
- 必须至少出现 `ready`、`approved`、`prepared` 中的一个。
- 不能出现 `not ready`、`pending`、`blocked` 或 `905-D`。
- 不能出现小写子串 `missing`、`placeholder`；文件不存在时读取命令会输出 `missing`，自然失败。
- 问句、不确定表述和否定关系会失败，例如 “Is 905-A ready?” 或 “905-A may be ready”。
- 没有 clause/近邻规则，程序按整份文件寻找实体与状态词；推荐把四项写进同一个肯定句，便于人工理解。

## 5. 常见失败与评测边界

- Playlist 名正确但歌曲反序：playlist 项失败。
- Playlist 中额外加入 `track_905_draft`：精确歌曲列表失败。
- Handoff 写 `905-D` 作为“已忽略的干扰项”：仍会命中 conflict phrase，失败。
- Handoff 只写 “playlist ready”：缺 case/code/owner，失败。
- 只完成手机 playlist，不在第二台 Linux 写文件：只能通过一项。

Handoff evaluator 不要求出现 playlist 名、alpha/bravo 歌名或 `Field coordinator`；这些信息由 Retro Music 项和 source/policy 提供。反过来，playlist evaluator 也不读取 handoff 文本来推断歌曲是否正确。

## 6. Cleanup

- 手机删除 source 并清空 Retro Music。
- 第一台 Linux 删除 setlist 与 policy。
- 第二台 Linux 删除 handoff.txt；两个 Linux 的空目录随后尝试移除。
