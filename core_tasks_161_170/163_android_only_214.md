# Core 163 — android_only_214

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 163 项
- 任务文件：`tasks/cross_device/android_only/android_only_214.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：medium
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机 Calendar 的 `Depot meet` 事件告诉你：

- 收藏点旧坐标：`47.6100,-122.3300`；
- 当前正确坐标：`47.6205,-122.3493`。

第二台手机 OsmAnd 中现有 `Depot Gate` 收藏点仍在旧坐标。要把唯一收藏点改到新坐标，同时在 Markor 创建精确名为 `Depot Gate coordinate repair.md` 的交接说明，写明收藏点名、old、new 和来源 Calendar。

## 1. Instruction

### 英文原文（逐字）

~~~text
The Depot meet event in Calendar on the first phone has the current coordinates. Use them to fix the Depot Gate favorite on the second phone, then leave the field team a Markor handoff named `Depot Gate coordinate repair.md` recording the favorite name, old and new coordinates, and Calendar as the source.
~~~

### 中文翻译

第一台手机 Calendar 中的 Depot meet 事件包含当前坐标。用这些坐标修正第二台手机上的 Depot Gate 收藏点，然后在 Markor 中给现场团队留下一个名为 `Depot Gate coordinate repair.md` 的交接文档，记录收藏点名称、旧坐标、新坐标，以及 Calendar 这一来源。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。输入是一个 Calendar 事件和一份 OsmAnd GPX；输出是修正后的 OsmAnd 收藏点及一份 Markor 文档。

### 2.1 android_0：Calendar 事件

| 字段 | 内容 |
|---|---|
| title | Depot meet |
| start | `1783159200`（任务时区换算为 2026-07-04 10:00） |
| end | `1783161000`（2026-07-04 10:30） |
| location | Depot Gate |
| description | `Canonical coordinates: 47.6205,-122.3493; old favorite was 47.6100,-122.3300.` |

真正用于修正的是 description 中明确给出的 old/new 坐标，而不是根据事件 location 做地理编码。

### 2.2 android_1：初始 OsmAnd GPX

路径：

~~~text
/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx
~~~

初始文件原文：

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="OsmAnd" xmlns="http://www.topografix.com/GPX/1/1"><wpt lat="47.6100" lon="-122.3300"><name>Depot Gate</name></wpt></gpx>
~~~

它只有一个 waypoint：`Depot Gate`，位于旧坐标。

### 2.3 仓库中的正向结果 GPX

Oracle 使用的结果资产原文：

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="OsmAnd" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="47.620500" lon="-122.349300"><name>Depot Gate</name></wpt>
</gpx>
~~~

它展示了预期语义，但 evaluator 不要求 XML 缩进或浮点小数位逐字一致。

### 2.4 Markor 输出初态

Setup 会删除：

~~~text
/storage/emulated/0/Documents/Markor/Depot Gate coordinate repair.md
~~~

## 3. Setup 具体流程

### android_0

1. 确保 Simple Calendar Pro 可用；
2. 清空 Calendar；
3. 创建上述 `Depot meet` 事件。

### android_1

1. 确保 OsmAnd 可用并准备 favorites 存储；
2. 上传含旧坐标的 `favorites.gpx`；
3. 确保 Markor 可用；
4. 删除旧的交接文档。

## 4. 正确输出

### 4.1 OsmAnd

最终应只有一个收藏点：

| name | latitude | longitude |
|---|---:|---:|
| Depot Gate | 47.6205 | -122.3493 |

### 4.2 Markor

创建精确路径的文档。Oracle 内容：

~~~text
Depot Gate
old 47.6100,-122.3300
new 47.6205,-122.3493
source Calendar
~~~

这不是整份文本绝对匹配；也可以用一行 `from ... to ...`、箭头或 old/new 表格，只要 scorer 能识别为唯一且肯定的旧→新关系。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

有 2 个计分 evaluator，必须同时成功：

1. OsmAnd 收藏点集合精确正确；
2. Markor 交接文档表达正确的坐标变化。

### 5.1 OsmAnd 收藏点集合

`osmand_favorite_set` 解析 GPX waypoint，而不是比较 GPX 原始字节。要求：

- 收藏点名称规范化后等于 `Depot Gate`；名称比较大小写不敏感并折叠连续空白；
- 纬度与 `47.6205` 的误差不超过 `0.00005`；
- 经度与 `-122.3493` 的误差不超过 `0.00005`；
- 每个预期收藏点必须唯一匹配；
- `allow_unrelated` 未开启，所以实际收藏点总数必须恰好为 1，不能保留旧点或增加其他点。

GPX 中 waypoint 顺序、XML 缩进、坐标写成 4 位还是 6 位小数不重要。该 contract 没有要求 description 或 address。

### 5.2 Markor 文档路径

Getter 直接读取：

~~~text
/storage/emulated/0/Documents/Markor/Depot Gate coordinate repair.md
~~~

文件名、空格或目录不对，都会因读取不到目标文件而失败。

### 5.3 坐标变化语义

`android_change_note_state` 要求文档被识别成恰好 1 条一致的 old→new relation：

- relation 的上下文包含 `Depot Gate`；
- old 一侧同时含 `47.6100` 和 `-122.3300`；
- new 一侧同时含 `47.6205` 和 `-122.3493`；
- 全文包含 `Calendar` 或 `calendar event`；
- 是肯定陈述。

Scorer 能识别的常见形式包括：

- 分开的 `old ...` 和 `new ...` 行；
- `from OLD to NEW`；
- `OLD -> NEW`；
- `changed/updated/corrected to`；
- 带 old/new 列的 Markdown 表格。

它会拒绝问号，以及 maybe、possibly、pending、proposed、suggested 等不确定语义；也拒绝 unchanged、撤销更新、回退到旧值，或一份文档中出现多条可解析的变化关系。新坐标写到 old 一侧、旧坐标写到 new 一侧也会失败。

### 5.4 当前 evaluator 没有检查什么

- 不检查 android_0 的 Calendar 事件最终是否保持不变；
- 不要求文档逐字等于 oracle；
- 不检查是谁或何时编辑 GPX；
- 不要求 GPX 的 creator、缩进或字节与结果资产一致；
- 不对坐标进行反向地理编码。

## 6. 常见失败与真实评测边界

- 只改 Markor、不改 OsmAnd：收藏点 evaluator 失败。
- 在 OsmAnd 新增正确点但保留旧点：集合不是精确一个，失败。
- 写 `Depot Gate now 47.6205,-122.3493`：没有 old→new 对照，文档 evaluator 失败。
- 写 `old 47.6100,-122.3300; new 47.6205,-122.3493`，但不写 Depot Gate 或 Calendar：缺上下文，失败。
- 坐标小数格式可变化，但数值必须落在很小的容差内。

## 7. Cleanup

- android_0 清空 Calendar；
- android_1 删除 OsmAnd favorites GPX 和备份 GPX；
- android_1 删除 Markor 交接文档。
