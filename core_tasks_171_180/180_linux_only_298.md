# Core 180 — `linux_only_298`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 180 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_298.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：easy
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的 CSV 有一条 archived session 和一条 active session。需要选择 active 的 `S-84`，在第二台机器写一份播放交接笔记：

```text
Session: S-84
Clip: long_audio_A.wav
Reviewer: Mara
```

不应写入旧 session `S-71`、旧音频 `old_session.wav` 或旧 reviewer `Iris`。

## 1. Instruction

### 英文原文（逐字）

```text
Prepare a playback handoff on the second Linux machine. Use `current_session.csv` on the first machine to identify the active session, then write `/tmp/media/playback_review.md` with that session, its clip filename, and its assigned reviewer.
```

### 中文翻译

在第二台 Linux 机器上准备一份播放交接。使用第一台机器上的 `current_session.csv` 找出 active session，然后写入 `/tmp/media/playback_review.md`，其中包含该 session、它的音频文件名和指定 reviewer。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。输入是一份 CSV；第二台机器还会由 Setup 生成两份可播放 WAV。

### 2.1 `linux_0`：`current_session.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_298/source/linux_0/tmp/media/current_session.csv`
- 注入路径：`/tmp/media/current_session.csv`
- 完整原文：

```csv
session,status,clip,reviewer
S-71,archived,old_session.wav,Iris
S-84,active,long_audio_A.wav,Mara
```

只有 `S-84` 的 status 是 active。

### 2.2 `linux_1`：生成的音频文件

Setup 用 Python `wave` 生成：

| 路径 | 格式与具体内容 |
|---|---|
| `/tmp/media/clips/long_audio_A.wav` | 1 秒、单声道、16-bit PCM、16000 Hz；振幅约 9000 的 440 Hz 正弦波 |
| `/tmp/media/clips/old_session.wav` | 1 秒、单声道、16-bit PCM、16000 Hz；振幅约 9000 的 660 Hz 正弦波 |

每份包含 16000 个采样帧。音频没有语音、元数据说明或需要转录的内容；它们只是稳定的可播放 fixture。

### 2.3 输出初态

目标路径：

```text
/tmp/media/playback_review.md
```

Setup 会先删除旧文件。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/media`；
2. 删除并上传 `current_session.csv`。

### `linux_1`

1. 创建 `/tmp/media/clips`；
2. 删除旧同名 WAV 后，生成 440 Hz 和 660 Hz 两份音频；
3. 删除旧 `playback_review.md`。

## 4. 正确输出

Oracle 的完整 Markdown 文本是：

```markdown
Session: S-84
Clip: long_audio_A.wav
Reviewer: Mara
```

不要求 Markdown 标题、表格或额外说明；三行 label:value 是最稳妥的写法。

## 5. Evaluator：评测方式与具体评测点

本任务只有 1 个计分 evaluator。它在 `linux_1` 执行 `cat /tmp/media/playback_review.md`，再用 `check_include_exclude` 中的 entity-relation 规则检查文本。

### 5.1 三个核心实体必须恰好出现一次

必须包含：

- `S-84`；
- `long_audio_A.wav`；
- `Mara`。

`unique_entities: true` 要求每个实体只形成一次匹配。因此不要在标题、摘要和正文中反复写同一个 session 或 reviewer。

### 5.2 三个关系必须分别说清楚

关系规则按 clause 检查：

1. 含 `S-84` 的 clause 还要有 `session` 或 `playback`；
2. 含 `long_audio_A.wav` 的 clause 还要有 `clip`、`uses` 或 `audio`；
3. 含 `Mara` 的 clause 还要有 `reviewer` 或 `assigned`。

全文同时要求三个词组类别各至少出现一个，所以 oracle 的三个标签 `Session`、`Clip`、`Reviewer` 正好满足。

Clause 会按分号、竖线、换行，或句末标点后的空白切分。三个 label:value 各写一行最直观。一个句子也可能同时满足多组关系，但重复完整关系会因“匹配 clause 不唯一”或实体重复失败。

### 5.3 全局冲突与额外 WAV

以下任一内容出现都会失败：

```text
withdrawn
retracted
cancelled / canceled
archived
old_session.wav
Iris
not assigned
wrong
```

`reject_unlisted_entity_pattern` 还会扫描任何 `*.wav` 文件名；允许清单中只有 `long_audio_A.wav`，所以写入其他 WAV 文件名也会失败。通用关系 scorer 还拒绝问句、不确定语气和否定/撤回语义。

### 5.4 匹配不是整篇绝对相等

正文不需要逐字等于 oracle，大小写匹配也较宽松；例如：

```text
Playback session S-84 uses audio clip long_audio_A.wav; assigned reviewer Mara.
```

只要实体各一次、关系 clause 和冲突规则满足，就可以通过。

### 5.5 当前 evaluator 没检查什么

- 不检查是否真的用 VLC 或其他播放器播放过音频；
- 不检查 WAV 文件是否仍存在、能否解码、时长、频率或声音内容；
- 不重新读取 CSV，active session 的三个目标值已写死在 evaluator；
- 不检查笔记创建工具、Markdown 标题或固定行顺序；
- 不检查 archived 行完全未被操作，只禁止在最终笔记中出现其关键信息。

因此 instruction 中的“playback handoff”最终以交接笔记为唯一计分产物，播放状态本身不计分。

## 6. 常见失败示例

- `S-84 / long_audio_A.wav / Mara`：三个实体都有，但缺少 session、clip、reviewer 等关系词，失败。
- `Session S-84 replaces archived S-71; clip long_audio_A.wav; reviewer Mara.`：出现全局冲突词 `archived`，失败。
- `Session S-84; clips long_audio_A.wav and backup.wav; reviewer Mara.`：出现额外 WAV 文件名，失败。
- 笔记正确但写在 `/tmp/media/clips/playback_review.md`：固定目标路径读不到，失败。

## 7. Cleanup

- `linux_0` 删除 `current_session.csv`；
- `linux_1` 删除两份 WAV 和 `playback_review.md`。

