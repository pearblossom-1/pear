# Core 072 — `linux_android_1312`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 72 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1312.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与最终要做的事

OsmAnd favorite 给出 active site 的名称和坐标，Linux CSV 给出同一 site code 的地址与 checklist。要在 Linux 从零创建一份真实 ODT visit brief，把四组信息分成清晰段落，并排除 archived row。

## 1. Instruction

### 英文原文（逐字）

```text
Use the OsmAnd favorite and `/tmp/site/site_data.csv` to create `/tmp/site/visit_brief.odt`. Make it a readable visit brief that relates the active site code and name, coordinates, address, and visit checklist; do not include the archived site.
```

### 中文翻译

使用 OsmAnd favorite 与 `/tmp/site/site_data.csv` 创建 `/tmp/site/visit_brief.odt`。它应是一份可读的 visit brief，能关联 active site 的 code 和 name、coordinates、address 与 visit checklist；不要包含 archived site。

## 2. 输入、附件与初始业务数据

### 2.1 手机 OsmAnd favorite

`favorites.gpx` 中只有一个 waypoint：

```xml
<wpt lat="37.910100" lon="-122.510100">
  <name>Depot Ridge</name>
</wpt>
```

因此 active site name=`Depot Ridge`，coordinates=`37.9101, -122.5101`。

### 2.2 Linux `site_data.csv`

```csv
site_code,address,checklist,status
SITE-1312,44 Ridge Road,bring vest,current
SITE-1312B,archived,skip,archived
```

current 行给出 code、address 和 checklist；SITE-1312B 是明确要求排除的 archived 行。

### 2.3 是否有 ODT 模板

没有。Setup 只上传 site_data.csv，并未提供 visit_brief template。执行者需要在 `/tmp/site/visit_brief.odt` 从零创建 ODF text 文档。

## 3. Setup 具体流程

### `linux_0`

- 删除旧 site_data.csv 与 visit_brief.odt，创建 `/tmp/site`。
- 上传 site_data.csv。

### `android_0`

- 确保 OsmAnd 可用并初始化 favorites。
- 上传只含 Depot Ridge 的 favorites.gpx。

## 4. Evaluator：评测方式与具体评测点

本题只有 1 个 ODT evaluator。

### 4.0 推荐正文

```text
Visit Brief
Site: SITE-1312 — Depot Ridge
Coordinates: 37.9101, -122.5101
Address: 44 Ridge Road
Checklist: bring vest
```

### 4.1 ODF package

- 路径必须是 `/tmp/site/visit_brief.odt`。
- 必须是可解析的有效 ODF text package，不能把普通文本改扩展名。
- 至少 5 个可见段落；上面的标题加四个字段正好满足。

### 4.2 全文条件

大小写不敏感地要求出现：SITE-1312、Depot Ridge、37.9101、-122.5101、44 Ridge Road、bring vest。

配置的排除词只有：

```text
SITE-OLD
PLACEHOLDER
```

### 4.3 四个逐段关系

以下每组必须在一个段落内共同出现，并且每组恰好匹配一个不同段落：

1. SITE-1312 + Depot Ridge
2. Coordinates + 37.9101 + -122.5101
3. Address + 44 Ridge Road
4. Checklist + bring vest

把所有信息压到同一段会因四组复用同一段落而失败；完整重复某一字段段落也可能因同组有两个候选而失败。

## 5. 常见失败与真实评测边界

- 输出纯文本而不是 ODT：package 校验失败。
- 地址或 checklist 只散落在别处，没有与标签同段：paragraph relation 失败。
- 只有四个字段段落、没有第五个可见段落：`min_paragraphs=5` 失败，建议保留标题。
- 坐标少负号或精度改成别的值：include/关系失败。

Archived 排除存在配置错误：真实 archived code 是 `SITE-1312B`，但 evaluator 排除的是不存在于 source 的 `SITE-OLD`，也没有排除单词 `archived` 或值 `skip`。所以按实现，把 SITE-1312B archived 行写进文档仍可能通过；这没有真正落实 instruction 的 “do not include the archived site”。正确成品仍应完全省略该行。

与 Core 61 类似，task JSON 的 `paragraph_relations_require_affirmative` 当前未被 `check_odf_text` 实现消费；这里主要是字段共段检查。Evaluator 也不检查字体、页面布局或标题文本，只以有效 package、段落数和可见文字间接约束“readable”。

## 6. Cleanup

- Linux 删除 site_data.csv 与 visit_brief.odt，并清理空目录。
- 手机删除 OsmAnd favorites 与 backup 文件。
