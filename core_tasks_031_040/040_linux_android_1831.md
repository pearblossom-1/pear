# Core 040 — `linux_android_1831`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 40 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1831.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`
- 限制：最多 60 步，最长 480 秒

## 0. 任务链与预期分支

Linux CSV 负责选择唯一 `current` 且 `include=yes` 的 row；Android OsmAnd 初始 favorites 为空，最终应只新建该 row 对应的一个收藏。Archived、hold、missing-photo 三类行是必须跳过的干扰项。

## 1. Instruction

### 英文原文（逐字）

```text
Open `/tmp/android_targets/site_row.csv` on the Linux desktop and create an OsmAnd favorite on the phone from the current approved site row — use that row's site name and coordinates, and skip anything marked archived, hold, or missing-photo.
```

### 中文翻译

在 Linux 桌面打开 `/tmp/android_targets/site_row.csv`，使用其中 current approved 的 site 行在手机 OsmAnd 中创建一个收藏点——使用该行的 site name 和 coordinates，跳过标为 archived、hold 或 missing-photo 的内容。

## 2. 输入、附件与初始业务数据

可见 CSV 原文：

```csv
case,status,code,owner,phone,email,route,site,time,filename,include,notes
CASE-1831,current,FB-1831,Theo Brooks,+15552001831,theo.brooks@example.test,RT-31,Harbor Gate 14,2026-07-16 09:10,rt-31_photo_a.jpg,yes,approved source row
CASE-OLD,archived,OLD-17,Archived Owner,+15550000000,old@example.test,RT-00,Old Yard,2026-06-01 08:00,old_photo.jpg,no,inactive archive
CASE-HOLD,hold,HOLD-42,Hold Owner,+15550009999,,RT-31,Harbor Gate 14 Annex,2026-07-16 09:10,rt-31_hold.jpg,no,similar-name hold
CASE-1831,missing,FB-1831,Theo Brooks,+15552001831,theo.brooks@example.test,RT-31,Harbor Gate 14,2026-07-16 09:10,rt-31_photo_missing.jpg,required_missing,visible gap row
```

按状态应选第一行，名称为 `Harbor Gate 14`。但该 CSV 的表头和数据中根本没有 lat/lon 或 coordinates 字段。

## 3. Setup 具体流程

### `android_0`

确保 OsmAnd 可用，执行 `androidworld_osmand_favorites_setup`，把本轮 favorites 环境初始化为空。Setup 没有预建 Harbor Gate favorite。

### `linux_0`

创建 `/tmp/android_targets`，把唯一附件上传为 `/tmp/android_targets/site_row.csv`。没有第二个 source 文件，也没有网页、地图链接或可见 expected 数据。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 OsmAnd favorite-set evaluator。

### 4.0 evaluator 实际要求

OsmAnd 最终收藏集合必须精确只有一项：

```text
name: Harbor Gate 14
lat: 37.749
lon: -122.416
```

名称按归一化文本匹配，坐标容差为 `0.0001`。多余收藏、缺收藏、近似名称 `Harbor Gate 14 Annex` 或错误坐标都会失败。

`osmand_favorite_set` 检查的是完整收藏集合，不是“至少存在目标收藏”：最终必须恰好一项。坐标分别在绝对误差 `0.0001` 内即可，不要求 GPX 字节或 waypoint 排列固定。

### 4.1 当前配置问题：任务从公开输入不可解

Instruction 要求“use that row's site name and coordinates”，metadata 和隐藏 `expected_data.json` 确实保存了 `37.749,-122.416`，scripted solution 也直接写入这两个值；但是操作者实际能看到的 `site_row.csv` 没有任何坐标列，也没有别的可见附件提供坐标。

因此，正常人工执行只能从 CSV 推出名称，不能推出 evaluator 要求的坐标。若不知道隐藏 expected 数据，就无法可靠完成。这不是措辞问题，而是 setup 漏字段。合理修复应是在 current approved 行增加 `lat,lon` 两列和值；无需改变 instruction 或 evaluator。

## 5. 隐藏值从哪里来，以及为什么不能算公开输入

仓库内部的以下非任务输入确实包含坐标：

- `linux_android_1831/expected/expected_data.json`：`lat=37.749`、`lon=-122.416`；
- `scripted_solution.json` 与 `oracle_positive.json`：直接把同一坐标写入 GPX；
- task metadata 的 `expected_data_trace`：再次记录相同坐标。

这些文件没有通过 setup 上传到任何受测设备，也不在 instruction 指定路径中；正常操作者在任务界面不应依靠隐藏 evaluator/oracle 数据。`triage.json` 声称已经让 Linux site row 成为可见来源，但当前实际 `site_row.csv` 仍没有坐标，因此该 repair 声明与可见附件不一致。

如果人为知道隐藏坐标，favorite 名称/坐标正确且没有任何额外 favorite 就能通过；但这不能证明任务从公开输入可解。文档在这里必须如实记录缺口，不能给出仿佛从 CSV 能推导 `37.749,-122.416` 的操作说明。

## 6. Cleanup

清理会删除 OsmAnd 的 `favorites.gpx` 与 backup favorites 文件，并删除 Linux 的 `site_row.csv`；目录为空时移除 `/tmp/android_targets`。
