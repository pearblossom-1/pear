# Core 015 — `a2l_media_manifest`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 15 项
- 任务文件：`tasks/cross_device/real200/a2l_media_manifest.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 45 步，最长 360 秒

## 1. Instruction

### 英文原文（逐字）

```text
The first phone just took a field photo, and Audio Recorder on the second phone has a field voice recording. Please create `/tmp/media/manifest.json` on Linux with the filename, file type, and size of both media files as shown in each file's Details view. Use `photo` and `audio` objects, each with `filename`, `type`, and `size`; common labels such as `PNG`, `M4A`, or a MIME type are fine, and keep the displayed size unit.
```

### 中文翻译

第一部手机刚拍了一张现场照片，第二部手机的 Audio Recorder 中有一段现场录音。请在 Linux 上创建 `/tmp/media/manifest.json`，记录两个媒体文件在各自 Details 视图中显示的文件名、文件类型和大小。使用 `photo` 和 `audio` 两个对象，每个对象包含 `filename`、`type` 和 `size`；可以使用 `PNG`、`M4A` 或 MIME type 等常见类型标签，并保留显示的大小单位。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的照片

- 仓库源文件：`tasks/cross_device/real200_assets/a2l_media_manifest/source/site_photo.png`
- Android 路径：`/storage/emulated/0/DCIM/Camera/incident_scene_168.png`
- 文件名：`incident_scene_168.png`
- 格式：PNG，2048×1536，RGB
- 精确大小：`5,113,544` bytes
- 画面内容：树林小径旁的徒步标志牌。画面内容本身不参与本任务评分，Details 中的元数据才是输入。

### 2.2 第二部手机的录音

- 仓库源文件：`tasks/cross_device/real200_assets/a2l_media_manifest/source/field_voice_168.m4a`
- Android 路径：`/storage/emulated/0/Android/data/com.dimowner.audiorecorder/files/Music/records/field_voice_168.m4a`
- 文件名：`field_voice_168.m4a`
- 容器/编码：M4A/MP4 容器，AAC，单声道，44.1 kHz
- 时长：2 秒
- 精确大小：`25,633` bytes
- evaluator 不做语音识别，不检查录音说了什么。

### 2.3 Linux 输出

Setup 创建空目录 `/tmp/media` 并确保 `manifest.json` 不存在。一个最稳妥的输出是：

```json
{
  "photo": {
    "filename": "incident_scene_168.png",
    "type": "PNG",
    "size": "5113544 bytes"
  },
  "audio": {
    "filename": "field_voice_168.m4a",
    "type": "M4A",
    "size": "25633 bytes"
  }
}
```

如果照抄 Android Details 的舍入显示，类似 `5.1 MB` 和 `25.6 KB` 也在 evaluator 的舍入容差内。

## 3. Setup 具体流程

### `android_0`

1. 确保 Camera 可用。
2. 删除同名旧照片及其 MediaStore 记录。
3. 上传源 PNG 到 Camera 目录并触发媒体扫描。

### `android_1`

1. 确保 Audio Recorder 可用。
2. 删除同名旧录音。
3. 上传 `field_voice_168.m4a` 到录音目录。

### `linux_0`

1. 删除并重建 `/tmp/media`。
2. 删除旧的 `/tmp/media/manifest.json`。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

创建有效 JSON，并让 `photo`、`audio` 下的三个字段分别对应正确文件。文件名必须完全正确；类型允许常见等价写法；大小必须是带单位的字符串并与真实字节数相符。

纯数字大小如 `5113544` 会失败，因为 evaluator 要求字符串中包含 `bytes/B/KB/KiB/MB/MiB` 单位。

### 4.1 自定义 JSON 检查

evaluator 在 Linux 上运行 Python 脚本读取 `/tmp/media/manifest.json`，然后输出 `pass` 或 `fail`：

- `photo.filename` 必须严格等于 `incident_scene_168.png`。
- `photo.type` 归一化后必须是 `image/png`、`png`、`png image` 或 `image png`。
- `photo.size` 解析后必须等价于 `5,113,544` bytes。
- `audio.filename` 必须严格等于 `field_voice_168.m4a`。
- `audio.type` 必须是 `audio/m4a`、`audio/mp4`、`audio/x-m4a`、`m4a` 或 `m4a audio`。
- `audio.size` 解析后必须等价于 `25,633` bytes。
- 如果顶层存在 `status` 且值为 `failed`，直接失败。

大小比较会根据小数位和单位计算合理的显示舍入区间，而不是要求固定字符串。额外 JSON 字段没有被禁止，但不会帮助通过。

