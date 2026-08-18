# Core 018 — `al_playlist_from_csv`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 18 项
- 任务文件：`tasks/cross_device/real200/al_playlist_from_csv.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 45 步，最长 360 秒

## 1. Instruction

### 英文原文（逐字）

```text
`/tmp/music/playlist.csv` on Linux lists songs for the drive. Please create a `Work drive` playlist in the Android Retro Music app and add every song listed in the CSV.
```

### 中文翻译

Linux 上的 `/tmp/music/playlist.csv` 列出了驾车时要播放的歌曲。请在 Android Retro Music 应用中创建一个名为 `Work drive` 的播放列表，并加入 CSV 中列出的所有歌曲。

## 2. 输入、附件与初始业务数据

### 2.1 Linux CSV 附件

- 仓库源文件：`tasks/cross_device/real200_assets/al_playlist_from_csv/source/playlist.csv`
- 注入路径：`linux_0:/tmp/music/playlist.csv`
- 完整内容：

| order | title | artist | note |
|---|---|---|---|
| 1 | Northbound Signal | Road Crew | morning start |
| 2 | Coffee at Dawn | Road Crew | highway segment |
| 3 | Last Exit Home | Road Crew | arrival note |

### 2.2 Android 音乐库

Setup 向 `/sdcard/Music/` 放入三首可被 Retro Music 索引的 MP3：

```text
Northbound Signal
Coffee at Dawn
Last Exit Home
```

Retro Music 的播放列表数据库在 setup 中被清空；三首歌存在于音乐库，但初始没有 `Work drive` 播放列表。

## 3. Setup 具体流程

### `android_0`

1. 确保 Retro Music 可用。
2. 删除三首同名旧 MP3 及其 MediaStore 记录。
3. 清空 Retro Music 任务状态。
4. 注入三首 MP3，使歌曲可在应用中选择。

### `linux_0`

1. 删除并重建 `/tmp/music`。
2. 上传 `playlist.csv`。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

在 Retro Music 中创建 `Work drive`，其中恰好放入：

```text
Northbound Signal
Coffee at Dawn
Last Exit Home
```

这三首在列表中的顺序不评分，但不能漏、不能重复，也不能把其他歌曲加入 `Work drive`。

### 4.1 播放列表数据库检查

- `result.type`：`retro_music_playlist`
- evaluator 读取 Retro Music 的播放列表数据库。
- 规范化后的播放列表名必须唯一匹配 `Work drive`；比较忽略大小写并折叠空白。
- 歌曲使用精确“多重集合”比较：三首目标各一次，顺序不敏感。
- 在目标播放列表内，额外歌曲、重复歌曲或缺歌都会失败。
- 本任务没有设置 `allow_unrelated=false`，所以应用中存在其他不同名称的播放列表不会单独导致失败。
- 不检查 artist、CSV 的 `order` 和 `note`，也不检查当前播放状态。

