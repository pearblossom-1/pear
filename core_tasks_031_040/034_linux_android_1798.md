# Core 034 — `linux_android_1798`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 34 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1798.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`
- 限制：最多 60 步，最长 480 秒

## 0. 任务链与设备分工

Android 提供“播放列表实际有什么”，第一台 Linux 提供“manifest 要求有什么”，第二台 Linux 的模板只定义输出列。操作者要做的是求二者的并集并为每首歌标出 present、missing 或 extra。

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

### `android_0`

确保 Retro Music 可用，清空旧播放列表，定向删除三首旧 MP3 及 MediaStore 记录，重新推入三首歌，然后建立 `Route review set`，顺序为 north gate、harbor loop、old archive。

### `linux_0`

创建 `/tmp/music`，清除旧 manifest，再上传完整 `track_manifest.csv`。

### `linux_1`

创建 `/tmp/music`，删除旧输出和模板，再把只有表头的模板上传为 `/tmp/music/playlist_audit_template.csv`。输出 `playlist_audit.csv` 初始不存在。

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

## 5. 语义 CSV 是怎样归一化的

- 文件按 UTF-8 with optional BOM 读取。
- 表头必须一一映射到五个规范列；本任务没有配置表头别名，所以只允许标点、大小写和空白归一化后的等价写法，不能加第六列。
- 普通文本使用 `legacy_alnum`：转小写，把连续非字母数字变为下划线并去掉两端下划线。
- 三个枚举列随后按第 4.1 节的显式别名折叠成规范值。
- 实际记录必须无重复，排序后与四条规范记录完全相等；所以行顺序不重要，但额外、遗漏和重复都失败。

例如 `Required and present` 在 `category` 中等价于 `present`，但把 `old archive outro` 的 `manifest_required` 写成 `yes` 仍然失败。`missing signature cue` 必须作为一行出现，不能因为 Android 没有这首歌就省略。

不评测 CSV 行的视觉颜色、引号风格或是否由模板另存而来；决定性内容是逻辑表结构与四条记录。

## 6. Cleanup

清理会清空 Retro Music、删除三首任务 MP3 与媒体记录，并删除两台 Linux 的 manifest、template、output 和空目录。
