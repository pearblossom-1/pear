# Core 021 — `al_map_audio_packet`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 21 项
- 任务文件：`tasks/cross_device/real300/al_map_audio_packet.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步，最长 300 秒

## 0. 任务链与设备分工

这不是“看见三个收藏后随便写一份报告”的任务，而是一条必须全部闭合的跨设备链路：

| 设备 | 读取什么 | 需要留下什么 |
|---|---|---|
| `android_0` | OsmAnd 中三个收藏的名称和坐标 | Audio Recorder 目录中的三份新 M4A 录音 |
| `linux_0` | 从 Android 读取到的站点信息和录音文件名 | 一份真实 ODT 和一份可提取文字的 PDF |

五个输出分别计分，因此只完成文档或只完成录音都不能让整个任务通过。

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

1. 创建精确目录 `/storage/emulated/0/Android/data/com.dimowner.audiorecorder/files/Music/records`。
2. 只删除 `north_gate_memo.m4a`、`pump_shed_memo.m4a`、`service_yard_memo.m4a` 三个同名旧文件，并删除对应 MediaStore 音频记录。
3. 确保 Audio Recorder 和 OsmAnd 可用。
4. 执行 OsmAnd favorites 初始化。
5. 把唯一的 GPX 附件上传为 `/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`。

### `linux_0`

只创建 `/tmp/sites` 目录。没有预置 Writer 模板，也没有预置 `packet.odt` 或 `packet.pdf`；两份文件都必须在任务过程中产生。

### Setup 不会代做的事情

- 不会预录三段音频。
- 不会把 Android 文件自动复制到 Linux。
- 不会创建 ODT/PDF，也不会打开一份半成品模板。
- GPX 中的 `<desc>` 只是辅助查看，最终 evaluator 不要求把描述写进文档。

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

## 5. 具体判定例子与边界

### 可以通过的文档行

以下标点形式不同，但每一行都把正确的四项信息放在同一段落，因而满足关系检查：

```text
North gate | 47.3769, 8.5417 | north_gate_memo.m4a
Pump shed: 47.3782 / 8.5441 — pump_shed_memo.m4a
Service yard (47.1510, 9.5320): service_yard_memo.m4a
```

### 会失败的情况

- 把 `North gate`、它的坐标和文件名拆到三个不同段落；关键词虽然都在全文里，但同段关系不成立。
- 写成 `North gate ... pump_shed_memo.m4a`；站点与录音名配错。
- 录音为 1.9 秒或 5.1 秒；时长边界是包含 2 秒和 5 秒的闭区间。
- 将同一个合法 M4A 复制并改成三个文件名；三份字节摘要不唯一。
- 创建名为 `packet.pdf` 的文本文件；文件头和 `pdftotext` 检查都会失败。

### 明确不检查

- 不做语音转文字，也不判断录音里说了什么。
- 不限定 ODT 的字体、字号、标题或页面样式。
- 不要求文档嵌入录音，也不比较 ODT 与 PDF 的视觉版式。

## 6. Cleanup

任务清理会定向删除三个录音及其 MediaStore 记录、OsmAnd 的 favorites 文件，以及 `/tmp/sites/packet.odt`、`packet.pdf` 和 LibreOffice 锁文件；随后在目录为空时移除 `/tmp/sites`。
