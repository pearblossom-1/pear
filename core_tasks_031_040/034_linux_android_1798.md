# Core 034 — `linux_android_1798`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 34 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1798.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`
- 限制：最多 60 步，最长 480 秒

## 1. Instruction

### 英文原文（逐字）

```text
Can you compare the Android Retro Music playlist `Route review set` against `/tmp/music/track_manifest.csv` on the first Linux desktop, then use `/tmp/music/playlist_audit_template.csv` on the second Linux desktop to write the complete audit to `/tmp/music/playlist_audit.csv`?
```

### 中文翻译

请把 Android Retro Music 的 `Route review set` 播放列表与第一台 Linux 的 `/tmp/music/track_manifest.csv` 比较，然后使用第二台 Linux 的 `/tmp/music/playlist_audit_template.csv`，把完整审计写到 `/tmp/music/playlist_audit.csv`。

## 2. 输入、附件与初始业务数据

Android 播放列表实际包含：

```text
north gate brief
harbor loop cue
old archive outro
```

Manifest：

```csv
playlist,track_title,required
Route review set,north gate brief,yes
Route review set,harbor loop cue,yes
Route review set,missing signature cue,yes
```

模板只有表头：

```csv
playlist,track_title,manifest_required,android_playlist,category
```

## 3. Setup 具体流程

- `android_0`：清空并建立指定 Retro Music 播放列表及三首实际歌曲。
- `linux_0`：上传 manifest。
- `linux_1`：上传 audit template，并清理目标输出 CSV。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个语义 CSV evaluator。

### 4.0 先说人话：怎样才算通过

输出必须完整写出四行：两首 required 且 present、一首 required 但 missing、一首不在 manifest 的 extra。

```csv
playlist,track_title,manifest_required,android_playlist,category
Route review set,north gate brief,yes,present,present
Route review set,harbor loop cue,yes,present,present
Route review set,missing signature cue,yes,missing,missing
Route review set,old archive outro,no,present,extra
```

### 4.1 匹配细节

- 五列必须齐全且不能有额外列；四条逻辑记录必须精确，行顺序不敏感，重复行失败。
- 表头和普通文本做大小写、空白及标点归一化。
- `yes` 可写 required/true/1，`no` 可写 not required/optional/false/0。
- `present` 可写 found/in playlist/included/yes/true；`missing` 可写 absent/not found/not in playlist/no/false。
- category 的 present 可写 match/matched/in both；missing 可写 absent/required but missing；extra 可写 unexpected/unlisted/playlist only/additional。
- 模板中的表头要保留，但不能漏写四条业务记录。

