# Core 008 — `al_request_audio`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 8 项
- 任务文件：`tasks/cross_device/real100/al_request_audio.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 22 步，最长 220 秒

## 1. Instruction

### 英文原文（逐字）

```text
`/tmp/brief/request.txt` on Linux gives the filename for a voice memo. Please use Android Audio Recorder to record a short audio clip and save it with the name specified in the request.
```

### 中文翻译

Linux 上的 `/tmp/brief/request.txt` 给出了语音备忘录的文件名。请使用 Android Audio Recorder 录制一段简短音频，并使用请求中指定的名称保存。

## 2. 输入、附件与初始业务数据

### 2.1 Linux 请求附件

- 仓库源文件：`tasks/cross_device/real100_assets/al_request_audio/source/request.txt`
- 注入路径：`linux_0:/tmp/brief/request.txt`
- 完整原文：

```text
Packet: field visit 418
Required voice memo filename: briefing.m4a
Please record a short memo on the phone and save it with the filename above.
```

指定文件名为 `briefing.m4a`。

### 2.2 Android 目标路径

任务配置把该名称解析为 Audio Recorder 的应用文件路径：

```text
/storage/emulated/0/Android/data/com.dimowner.audiorecorder/files/Music/records/briefing.m4a
```

Setup 只删除这一确切旧文件，不清空整个录音目录。没有预置音频，也没有短信或邮件。

## 3. Setup 具体流程

### `android_0`

1. 确保 `audio recorder` 可用。
2. 通过 ADB 删除目标 `briefing.m4a`，防止旧录音直接通过。

### `linux_0`

1. 执行 `rm -rf /tmp/brief && mkdir -p /tmp/brief`。
2. 上传第 2.1 节的 `request.txt`。

Cleanup 再次删除目标录音并删除 Linux 的 `/tmp/brief`。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

在 Android Audio Recorder 中真正录一小段声音，并把文件保存成请求指定的 `briefing.m4a`。文件必须最终出现在任务规定的录音目录中。

评测只关心它是不是一段真实、能解码、至少 0.25 秒的 AAC/ALAC 音频；不关心你说了什么。空文件、文本文件改后缀、损坏的 M4A，或者同名文件保存在别的目录，都不能通过。

- `result.type`：`android_audio_file_state`
- `func`：`exact_match`
- getter 成功时返回字符串 `valid`，最终要求与 `valid` 绝对相等。

### 4.1 文件位置与读取

1. 配置中的确切路径必须能通过 Android 的 `test -f` 文件测试；仅在别的目录保存同名文件不会通过。
2. evaluator 把该文件从 Android 拉到临时本地文件后进行媒体探测。
3. 文件不存在返回 `missing`；路径存在但不是合格音频返回 `invalid`。

### 4.2 音频真实性检查

优先使用 `ffprobe`，要求：

- 文件非空且能被媒体解析器读取；
- 容器的 `format_name` 至少与允许集合 `{mov, mp4, m4a, 3gp}` 之一相交；
- 至少有一条 `codec_type=audio` 的流；
- 音频 codec 为 `aac` 或 `alac`；
- 该音频流的可读 packet 数大于 0；
- 音频时长至少 `0.25` 秒。

若环境没有 `ffprobe`，实现回退到 Mutagen，并对 MP4/M4A 结构额外确认存在声音轨、非零 sample table 和媒体数据，而不是只信扩展名。

因此，把文本、空文件或伪 ZIP 重命名为 `.m4a` 都不会通过。

### 4.3 不评测的内容

- 不做语音识别，不检查录音里说了什么。
- 不要求某个固定音量、采样率、声道数或精确时长；本任务也没有最大时长。
- 不要求音频字节与 oracle 样本相同，只要求是符合上述合同的真实录音文件。
