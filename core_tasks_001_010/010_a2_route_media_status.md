# Core 010 — `a2_route_media_status`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 10 项
- 任务文件：`tasks/cross_device/real200/a2_route_media_status.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 设备拓扑：`2A`（`android_0`、`android_1`）
- 限制：最多 100 步，最长 780 秒

## 1. Instruction

### 英文原文（逐字）

```text
The first phone's OsmAnd favorites list contains today's route, and each favorite name should correspond to a route photo with the same name in Simple Gallery Pro on the second phone. Please check the Gallery photo for each favorite name and create a `Route media status` note in Markor on the second phone marking each route point as present or missing.
```

### 中文翻译

第一部手机的 OsmAnd 收藏列表中包含今天的路线，每个收藏点名称都应当对应第二部手机 Simple Gallery Pro 中一张同名路线照片。请检查每个收藏点名称对应的 Gallery 照片，并在第二部手机的 Markor 中创建一篇 `Route media status` 笔记，把每个路线点标记为 present 或 missing。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机：OsmAnd favorites GPX

Setup 最终写入：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Route Planner" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="47.151" lon="9.532"><name>North gate</name></wpt>
  <wpt lat="47.152" lon="9.533"><name>Dock lane</name></wpt>
  <wpt lat="47.153" lon="9.534"><name>Fuel shed</name></wpt>
</gpx>
```

路径为 `/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`。三项 favorite 名称是后续照片匹配的业务 key。

### 2.2 第二部手机：图库图片附件

目标目录：`/sdcard/Pictures/Routes/`。

| 最终文件名 | 仓库源附件 | 尺寸 | 画面内容 | 初始状态 |
|---|---|---:|---|---|
| `North gate.png` | `source/site_photo.png` | 4032 × 3024 | 白色金属仓库/厂房，蓝色门和雨棚，大型敞开装卸门，门前黄色防撞柱 | present |
| `Dock lane.png` | `source/inspection_a.png` | 1920 × 1080 | 穿过山地荒野的双车道公路，远处山谷、蓝天和云层 | present |
| `Fuel shed.png` | 无上传附件 | — | — | missing |

两张上传图片都是可解码 RGB PNG。Setup 上传后对目录中的 PNG 发送 `MEDIA_SCANNER_SCAN_FILE` 广播，使 Simple Gallery Pro 可见。任务开始前会同时删除这三个文件名的旧文件及其 MediaStore 记录。

### 2.3 第二部手机：Markor 输出

- 路径：`/storage/emulated/0/Documents/Markor/Route media status.md`
- Setup 删除同名旧笔记。
- 期望业务结论：

```text
North gate: present
Dock lane: present
Fuel shed: missing
```

上面是最直接写法，但 evaluator 允许其他明确的自然句式。

没有短信或邮件输入/输出。

## 3. Setup 具体流程

### `android_0`

1. 确保 OsmAnd 可用。
2. `androidworld_osmand_favorites_setup`：停止 OsmAnd，创建 favorites 目录和一个可写的空 GPX，并进行应用私有状态 hydration。
3. 通过 ADB 将第 2.1 节的三点 GPX 覆盖写入标准 favorites 路径。

### `android_1`

1. 确保 Simple Gallery Pro 和 Markor 可用。
2. 创建 Routes 与 Markor 目录。
3. 删除三个候选图片、旧 status 笔记以及对应 MediaStore 行。
4. 上传 `site_photo.png` 为 `North gate.png`。
5. 上传 `inspection_a.png` 为 `Dock lane.png`。
6. 不创建 `Fuel shed.png`。
7. 扫描现有 PNG 进入 MediaStore。

Cleanup 删除 OsmAnd GPX、Markor 笔记、三个候选图片及其 MediaStore 行；Routes 目录仅在为空时删除。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

最稳妥的 Markor 笔记就是：

```text
# Route media status
North gate: present
Dock lane: present
Fuel shed: missing
```

这四行写对，基本就能通过。三个地点不能漏，也不能把状态写反。

以下写法会失败：

```text
North gate: maybe present       （不确定）
Is Dock lane present?           （问题）
Fuel shed: not missing          （与 missing 相反）
```

还有一个非常重要的事实：评测时只读这篇 Markor 笔记，不会再去图库检查图片。因此，从“拿分”的角度看，关键是笔记最终写对；图片是你做任务时用于判断答案的输入。

- `result.type`：`android_named_status_note`
- getter 读取 `Route media status.md`，解析成功返回 `pass`，否则返回 `fail`。
- `func`：`exact_match`，最终比较的是状态字符串 `pass`，不是整篇 Markdown 的绝对文本。

### 4.1 标题要求

必须有独立标题行 `Route media status`。允许普通行、Markdown `#` 标题或 `Title: Route media status`，但普通正文中的子串不算标题行。

### 4.2 三个实体关系

必须分别得到：

| 精确实体名 | 期望状态 |
|---|---|
| `North gate` | present |
| `Dock lane` | present |
| `Fuel shed` | missing |

实体匹配不区分大小写，名称内部空白可折叠；名称两侧使用字母/数字/下划线/点/连字符边界，因此更长名称不能冒充目标实体。

present 同义模式包括 `present`、`exists/exist`、`available`、`found`、`located`。missing 同义模式包括 `missing`、`absent`、`unavailable`、`not found`、`couldn't find`、`does not exist`、`not present`、`not available` 等。

### 4.3 Clause 与极性规则

1. 文本先按换行、分号 `;`、竖线 `|` 切分，再按部分句号/问号/感叹号句界切分，最后总是按逗号切分。
2. 每个实体必须至少出现在一个 clause 中；包含该实体的 clause 会整体判定 present、missing、invalid 或无状态。
3. 对每个实体，至少要有一个明确状态断言，所有明确断言的状态集合必须恰好等于期望状态。
4. 同一 clause 同时出现 present 与 missing 词会判 invalid。因此把三个结论无标点地连在一整句里，通常会因 `present` 与 `missing` 混合而失败。
5. 问句，或含 `maybe`、`possibly`、`might`、`unknown`、`unconfirmed`、`not sure`、`cannot confirm` 等不确定表达的相关 clause 会失败。
6. `not missing`、`never absent`、`no longer present/missing` 等反转/含混否定会失败。
7. 本任务未设置 `require_one_relation_per_entity`，所以同一实体重复多次且所有有效断言极性一致时，不会仅因重复而失败；出现任一相反或 invalid 断言则失败。

### 4.4 关键评测边界

Evaluator **不会再次读取 Simple Gallery Pro、文件系统或 MediaStore 来独立验证三张图片的 present/missing 状态**。两张图片和一个缺失位是 setup 输入，唯一计分产物是 Markor 笔记。

这与 Core 006 不同：Core 006 另有独立 `android_file_state` evaluator，而本任务没有图片状态 guard。因此，只要最终笔记语义满足上述合同，本项便返回 1；图库检查过程、图片字节和实际文件状态在评测阶段不再单独计分。
