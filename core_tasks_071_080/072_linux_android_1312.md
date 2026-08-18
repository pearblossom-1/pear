# Core 072 — `linux_android_1312`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1312.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Use the OsmAnd favorite and `/tmp/site/site_data.csv` to create `/tmp/site/visit_brief.odt`. Make it a readable visit brief that relates the active site code and name, coordinates, address, and visit checklist; do not include the archived site.
```

### 中文翻译

用 OsmAnd favorite 和 site_data.csv 创建可读 visit brief ODT，关联 active site code/name、coordinates、address、checklist，并排除 archived site。

## 2. 数据与评测

Favorite：Depot Ridge `37.9101,-122.5101`。CSV current：SITE-1312、44 Ridge Road、bring vest；SITE-1312B archived。

唯一 ODT evaluator 要求有效 ODF，包含六项值、不含 SITE-OLD/PLACEHOLDER；分别在同一段落关联 SITE-1312+Depot Ridge、Coordinates+两坐标、Address+44 Ridge Road、Checklist+bring vest。

