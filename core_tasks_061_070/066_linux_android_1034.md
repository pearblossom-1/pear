# Core 066 — `linux_android_1034`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1034.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`；拓扑 `2A+2L`
- 限制：50 步 / 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
The field team needs a route decision for the current approved request. Reconcile `/sdcard/Download/1034-A_source.md` with `/tmp/sites/missing_coordinate.csv` and `/tmp/sites/handoff_policy.md`. Because the selected site has no coordinates, preserve OsmAnd and its existing reference favorite. Leave a blocked note at `/storage/emulated/0/Documents/Markor/1034-A_blocked.md` and a dispatcher handoff at `/tmp/sites/1034-A_handoff.txt` on the second Linux desktop; both should identify the case and approval code, owner, site, and missing-coordinate reason.
```

### 中文翻译

核对当前 route request；因选中站点无坐标，保留 OsmAnd 现有 reference favorite，并分别创建手机 blocked note 与第二台 Linux dispatcher handoff，写全身份和缺坐标原因。

## 2. 数据与评测

Source：1034-A/NX03460/Nadia Ross；CSV 对应 North Annex Access，lat/lon 空，status blocked_missing_coordinates。OsmAnd 基线唯一 `Reference Depot,37.7,-122.3`。

三项评分：favorite-set 必须仍精确只有 Reference Depot；两份文本都要含 case/code/owner/site 并肯定表达 missing coordinates/blocked。Markor 禁止 coordinates present/route ready/not blocked；Linux TXT 还禁止 `missing` 作为文件读取哨兵，但正文需要用自然缺坐标措辞，推荐 `coordinates are absent`，避免输出字面 `missing` 被 include/exclude 规则误杀。

