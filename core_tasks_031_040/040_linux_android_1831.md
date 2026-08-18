# Core 040 — `linux_android_1831`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 40 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1831.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`
- 限制：最多 60 步，最长 480 秒

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

- `android_0`：确保 OsmAnd 可用并初始化为空 favorites 环境。
- `linux_0`：创建 `/tmp/android_targets` 并上传上述 CSV。
- setup 没有向用户可见位置提供另一份坐标附件。

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

### 4.1 当前配置问题：任务从公开输入不可解

Instruction 要求“use that row's site name and coordinates”，metadata 和隐藏 `expected_data.json` 确实保存了 `37.749,-122.416`，scripted solution 也直接写入这两个值；但是操作者实际能看到的 `site_row.csv` 没有任何坐标列，也没有别的可见附件提供坐标。

因此，正常人工执行只能从 CSV 推出名称，不能推出 evaluator 要求的坐标。若不知道隐藏 expected 数据，就无法可靠完成。这不是措辞问题，而是 setup 漏字段。合理修复应是在 current approved 行增加 `lat,lon` 两列和值；无需改变 instruction 或 evaluator。

