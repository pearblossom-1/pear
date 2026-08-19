# Core 045 — `linux_android_1289`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 45 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1289.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与分支判断

Linux CSV 要求精确曲目 `Blue Harbor Extended`，Android 音乐库只有近名 `Blue Harbor`。`Last Light` 虽然存在，也不能补偿第一首的精确缺失。因此正确分支是：不要创建 `Blue Harbor Set`，写 gap note 记录 missing track 和 near match。

## 1. Instruction

### 英文原文（逐字）

```text
Check `/tmp/music/required_tracks.csv` against the Retro Music library. If an exact required track is unavailable, do not create the requested playlist; write the missing track and any near match clearly in `/storage/emulated/0/Documents/Markor/Blue Harbor Set gap.md`.
```

### 中文翻译

把 `/tmp/music/required_tracks.csv` 与 Retro Music 曲库进行核对。如果精确要求的曲目不可用，不要创建请求的 playlist；请在 `/storage/emulated/0/Documents/Markor/Blue Harbor Set gap.md` 中清楚写出缺失曲目和任何近似匹配项。

## 2. 输入、附件与初始业务数据

### 2.1 Linux required_tracks.csv 全文

```csv
playlist,exact_track
Blue Harbor Set,Blue Harbor Extended
Blue Harbor Set,Last Light
```

`exact_track` 的含义是标题精确匹配；`Blue Harbor` 不是 `Blue Harbor Extended`。

### 2.2 Android 音乐库与已有 playlist

Setup 实际推入：

```text
/sdcard/Music/Blue Harbor.mp3
/sdcard/Music/Last Light.mp3
```

并建立一个已有 playlist：

```text
Blue Harbor Library
1. Blue Harbor
2. Last Light
```

这个 playlist 是查看曲库的输入，不是 requested `Blue Harbor Set`。目标 playlist 与目标 gap note 在 setup 后均不存在。

## 3. Setup 具体流程

### `linux_0`

删除旧 `/tmp/music/required_tracks.csv`，创建目录并上传两行 CSV。

### `android_0`

1. 确保 Retro Music 可用并清空其业务数据。
2. 定向删除两首旧 MP3 和对应 MediaStore 音频记录，同时删除旧 gap note。
3. 推入 `Blue Harbor`、`Last Light` 两首 MP3。
4. 创建 `Blue Harbor Library` 并按上述顺序加入两首歌。
5. 确保 Markor 可用。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占 `1/2`。

### 4.0 先说人话：怎样才算通过

保持 `Blue Harbor Set` 不存在，并写：

```text
Blue Harbor Set is blocked and the playlist was not created: Blue Harbor Extended is missing; near match found: Blue Harbor.
```

### 4.1 gap note（权重 `1/2`）

- 精确路径：`/storage/emulated/0/Documents/Markor/Blue Harbor Set gap.md`。
- 必须出现两个 entity：`Blue Harbor Set`、`Blue Harbor Extended`。
- 必须出现 missing / unavailable / not available 中至少一个。
- 必须肯定表达 blocked、playlist was/is not created 或 do not create。
- `not missing`、`exact match found`、`playlist created`、`ready` 会失败；通用关系逻辑还拒绝问句、不确定和后续撤销。
- 实际 evaluator 没把近似曲目 `Blue Harbor` 配成必需 entity。这意味着不写 near match 也可能通过 note 项，但不满足 instruction；完整执行应像示例一样写出它。
- `Last Light` 也不是必需 note entity，因为它不是 gap。

### 4.2 requested playlist 必须缺失（权重 `1/2`）

- `retro_music_playlist` 只查 playlist name `Blue Harbor Set`，expected=`missing`。
- 只要创建了该名称的 playlist 就失败，即使列表为空或曲目不完整。
- 已有 `Blue Harbor Library` 不会与目标名混淆，也不要求保留它的最终内容。

## 5. 常见失败与评测边界

- 创建 `Blue Harbor Set`，只加入 Last Light，再写 missing note：note 可对，但 playlist 项失败。
- 写 `Blue Harbor Extended exact match found`：与实际曲库相反，并命中 conflict。
- 只写 `Blue Harbor is missing`：漏掉 required exact title。
- 写 `Should we block Blue Harbor Set?`：疑问而非肯定结果。

Evaluator 不检查 MP3 字节、播放时长或 existing library 的最终状态；决定性结果是目标 playlist 缺失和 Markor 关系说明。

## 6. Cleanup

清理会删除 Linux CSV，清空 Retro Music，删除两首任务 MP3、MediaStore 记录和 gap note，并收拢空目录。
