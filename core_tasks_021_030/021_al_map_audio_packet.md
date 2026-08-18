# Core 021 — `al_map_audio_packet`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 21 项
- 任务文件：`tasks/cross_device/real300/al_map_audio_packet.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步，最长 300 秒

## 1. Instruction

### 英文原文（逐字）

```text
Android OsmAnd has three site favorites for today: `North gate`, `Pump shed`, and `Service yard`. Record a 2-5 second Audio Recorder memo for each one and name them `north_gate_memo.m4a`, `pump_shed_memo.m4a`, and `service_yard_memo.m4a`. Then create `/tmp/sites/packet.odt` in Linux LibreOffice Writer with one line per site relating its name, coordinates, and memo filename, and export `/tmp/sites/packet.pdf` as the field record.
```

### 中文翻译

Android OsmAnd 中有今天的三个站点收藏：`North gate`、`Pump shed` 和 `Service yard`。请为每个站点用 Audio Recorder 录制一段 2–5 秒的备忘录，并分别命名为 `north_gate_memo.m4a`、`pump_shed_memo.m4a` 和 `service_yard_memo.m4a`。然后在 Linux LibreOffice Writer 中创建 `/tmp/sites/packet.odt`，每个站点一行，把站点名称、坐标和备忘录文件名关联起来，并导出 `/tmp/sites/packet.pdf` 作为现场记录。

## 2. 输入、附件与初始业务数据

### 2.1 OsmAnd GPX 附件

- 仓库源文件：`tasks/cross_device/real300_assets/al_map_audio_packet/source/site_favorites.gpx`
- Android 路径：`/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`
- 三个 waypoint：

| 名称 | 纬度 | 经度 | 描述 | 要创建的录音名 |
|---|---:|---:|---|---|
| North gate | 47.3769 | 8.5417 | Main access point | `north_gate_memo.m4a` |
| Pump shed | 47.3782 | 8.5441 | Pump service shed | `pump_shed_memo.m4a` |
| Service yard | 47.1510 | 9.5320 | Equipment service yard | `service_yard_memo.m4a` |

### 2.2 Android 录音目标路径

三个目标都位于：

```text
/storage/emulated/0/Android/data/com.dimowner.audiorecorder/files/Music/records/
```

Setup 会删除这三个同名旧文件，初始不提供可直接复用的录音。

### 2.3 Linux 输出关系

ODT 与 PDF 都应明确给出三行关系，例如：

```text
North gate — 47.3769, 8.5417 — north_gate_memo.m4a
Pump shed — 47.3782, 8.5441 — pump_shed_memo.m4a
Service yard — 47.1510, 9.5320 — service_yard_memo.m4a
```

不要求把音频本身嵌入 ODT/PDF，只要求文档中正确关联其文件名。

## 3. Setup 具体流程

### `android_0`

1. 创建录音目录并删除三个目标文件及相关媒体记录。
2. 确保 Audio Recorder 和 OsmAnd 可用。
3. 初始化 OsmAnd favorites 环境。
4. 上传上述 GPX 为 OsmAnd 收藏文件。

### `linux_0`

创建 `/tmp/sites`。没有预置 Writer 模板。

## 4. Evaluator：评测方式与具体评测点

本任务有 5 个 evaluator，各占 `1/5`：三段录音、ODT、PDF。

### 4.0 先说人话：怎样才算通过

必须真正录三段不同的 2–5 秒 M4A，分别保存为三个精确文件名。然后创建真实 ODT，并从它导出真实 PDF；两个文档都用“一站点一行”的方式写全名称、两项坐标和对应录音名。

把同一个录音复制成三个文件会失败，因为 evaluator 要求三份音频字节彼此不同。

### 4.1 三段录音（合计权重 `3/5`）

每个目标路径各有一个 `android_audio_file_state` 检查，并且每次都会联查三条路径：

- 文件必须位于精确的 Audio Recorder 目录和精确文件名下。
- 文件必须可解析为 `mov/mp4/m4a` 容器之一。
- 至少有真实音频流，codec 为 AAC 或 ALAC。
- 时长必须在 2 秒到 5 秒之间。
- 三个文件的 SHA-256 必须互不相同，用来确认不是同一字节文件的三份副本。
- 不做语音识别，不要求录音中说出站点名称。

任一文件缺失、损坏、时长越界或三份中有重复字节，相关 getter 返回 `invalid`。

### 4.2 `packet.odt`（权重 `1/5`）

- 必须是有效 ODF text 包。
- 全文必须包含三个站点、六个坐标值和 `memo`，不得包含 `failed` 或 `error`。
- 更严格的是段落关系：每个站点名称、它的纬度、经度和对应完整录音文件名必须出现在同一个可见段落中，并以肯定方式陈述。
- 三个站点的信息不能跨行拼凑，也不能把 A 站点的文件名配给 B 站点。

### 4.3 `packet.pdf`（权重 `1/5`）

- 文件必须非空并以 `%PDF-` 开头。
- `pdftotext` 必须能成功提取文字。
- 提取结果必须包含三站点、六个坐标和三个完整文件名，且没有 `failed/error/missing/invalid`。
- 与 ODT 一样，每组站点、坐标和文件名必须位于同一提取段落中。
- evaluator 不比较 ODT 与 PDF 的像素版式，也不检查 PDF 中是否嵌入音频。

