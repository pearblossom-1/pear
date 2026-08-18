# Core 045 — `linux_android_1289`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1289.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：最多 50 步；未单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Check `/tmp/music/required_tracks.csv` against the Retro Music library. If an exact required track is unavailable, do not create the requested playlist; write the missing track and any near match clearly in `/storage/emulated/0/Documents/Markor/Blue Harbor Set gap.md`.
```

### 中文翻译

把 required_tracks.csv 与 Retro Music 曲库比较。若缺少精确 required track，不要创建请求的 playlist；在指定 Markor 文件中清楚写出缺失曲目和近似匹配。

## 2. 输入、附件与 Setup

CSV 要求 `Blue Harbor Set` 包含 `Blue Harbor Extended`、`Last Light`。实际曲库/已有 `Blue Harbor Library` 只有 `Blue Harbor`、`Last Light`。因此 `Blue Harbor` 是近似名，不是 `Blue Harbor Extended` 的 exact match。目标 playlist 和 gap note 初始不存在。

## 3. Evaluator 与通过标准

本任务 2 项评分。推荐笔记：

```text
Blue Harbor Set is blocked and the playlist was not created: Blue Harbor Extended is missing; near match found: Blue Harbor.
```

- 笔记必须出现 Blue Harbor Set、Blue Harbor Extended、missing/unavailable，以及 blocked/playlist not created/do not create。
- `not missing`、exact match found、playlist created、ready 会失败。
- 第二项直接要求名为 `Blue Harbor Set` 的 playlist 为 missing；创建后即失败。
- 评测边界：instruction 要求写近似曲目，实际 note evaluator 没把 `Blue Harbor` 列为必需实体。推荐文本仍写出它，才是真正完成 instruction。

