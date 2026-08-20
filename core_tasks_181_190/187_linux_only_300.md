# Core 187 — `linux_only_300`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 187 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_300.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的 manifest 指定三张证据照片中，`case18.jpg` 和 `case21.jpg` 已批准，`case99.jpg` 被拒绝。需要在第二台机器制作一张 1200×800 的联系表图片，只放两张批准照片并清楚标注 `CASE-18`、`CASE-21`；同时输出三行 CSV，说明两张 included、一张 excluded_rejected。

图片 evaluator 不是只找文件名或颜色关键词，它会在输出像素中寻找原始照片内容；但当前配置没有启用 OCR caption 合同，所以“标签清楚”是 instruction 的真实要求，却没有被自动 evaluator 实际核验。

## 1. Instruction

### 英文原文（逐字）

```text
The case-review handoff needs one visual sheet of approved evidence cards. Use `/tmp/sheet/evidence_manifest.csv` on the first Linux machine to select from `/tmp/sheet/photos/` on the second, then create a real 1200×800 PNG contact sheet at `/tmp/sheet/contact_sheet.png` containing every approved card and no rejected card. Label the approved entries clearly and write `/tmp/sheet/contact_index.csv` alongside it with one included/excluded disposition for every manifest row.
```

### 中文翻译

案件审查交接需要一张由已批准证据卡组成的可视化表单。请使用第一台 Linux 机器上的 `/tmp/sheet/evidence_manifest.csv`，从第二台机器的 `/tmp/sheet/photos/` 中进行选择，然后在 `/tmp/sheet/contact_sheet.png` 创建一张真实的 1200×800 PNG 联系表，其中包含每一张已批准卡片，并且不包含任何被拒绝的卡片。请清楚标注已批准条目，并在旁边写出 `/tmp/sheet/contact_index.csv`，对 manifest 的每一行给出 included/excluded 处置。

## 2. 输入、附件与实际图片内容

### 2.1 `linux_0`：`evidence_manifest.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_300/source/linux_0/tmp/sheet/evidence_manifest.csv`
- 注入路径：`/tmp/sheet/evidence_manifest.csv`
- 完整原文：

```csv
file,case_code,status
case18.jpg,CASE-18,approved
case21.jpg,CASE-21,approved
case99.jpg,CASE-99,rejected
```

### 2.2 `linux_1`：`case18.jpg`

- 注入路径：`/tmp/sheet/photos/case18.jpg`
- 文件规格：575×377，JPEG，RGB/3 components，JFIF 1.01，72×72 dpi。
- 实际画面：仓库室内墙面上挂着一个红色灭火器；画面右侧是仓库通道、黄色防撞柱、货架和托盘货物。
- manifest 状态：`approved`；case code：`CASE-18`。

### 2.3 `linux_1`：`case21.jpg`

- 注入路径：`/tmp/sheet/photos/case21.jpg`
- 文件规格：575×377，JPEG，RGB/3 components，JFIF 1.01，72×72 dpi。
- 实际画面：工业装卸区域的黄色安全护栏，护栏沿混凝土高台延伸；右侧地面有黄色通道线，背景是装卸门。
- manifest 状态：`approved`；case code：`CASE-21`。

### 2.4 `linux_1`：`case99.jpg`

- 注入路径：`/tmp/sheet/photos/case99.jpg`
- 文件规格：575×377，JPEG，RGB/3 components，JFIF 1.01，72×72 dpi。
- 实际画面：仓库中的木托盘和纸箱；前景空木托盘上覆盖/缠绕着透明塑料膜，后方有包膜货物。
- manifest 状态：`rejected`；case code：`CASE-99`。

这张照片不能出现在 contact sheet 中，但必须在 CSV 中留下排除记录。

### 2.5 目标输出

都在 `linux_1`：

```text
/tmp/sheet/contact_sheet.png
/tmp/sheet/contact_index.csv
```

Setup 还会删除 `/tmp/sheet/.contact_sheet.b64`，这是防止旧的辅助 base64 文件干扰，不是任务要求产物。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/sheet`；
2. 删除并上传 `evidence_manifest.csv`。

### `linux_1`

1. 创建 `/tmp/sheet/photos`；
2. 分别删除并上传三张 JPEG；
3. 删除旧 `contact_sheet.png` 和 `.contact_sheet.b64`；
4. 删除旧 `contact_index.csv`。

## 4. 正确输出

### 4.1 `contact_sheet.png`

推荐做成白色或浅色背景的 1200×800 画布，例如左右并排放置两张批准照片：

```text
+----------------------------------------------------------+
|  CASE-18                         CASE-21                  |
|  [灭火器原图内容]                [黄色护栏原图内容]       |
|                                                          |
+----------------------------------------------------------+
```

照片可以等比缩放，保留主要内容；不要放 `case99.jpg`，也不要重复批准照片。Instruction 要求清楚标签，建议标签同时写 case code 和文件名，例如 `CASE-18 — case18.jpg`。

### 4.2 `contact_index.csv`

最直接的完整内容是：

```csv
file,case_code,status
case18.jpg,CASE-18,included
case21.jpg,CASE-21,included
case99.jpg,CASE-99,excluded_rejected
```

行顺序和列顺序不必固定；也允许部分表头/状态同义词，具体见 evaluator。

## 5. Evaluator：评测方式与具体评测点

本题有 2 个计分 evaluator，默认各占 50%：图片内容占 50%，CSV 索引占 50%。

### 5.1 图片首先按真实像素解码并检查尺寸

Evaluator 用 Pillow 打开 `/tmp/sheet/contact_sheet.png`，转成 RGB 像素数组，然后要求：

```text
宽度 = 1200
高度 = 800
```

损坏图片、空文件或尺寸不是精确 1200×800 都失败。

需要注意：任务明确要求“real PNG”，但当前 evaluator 没有配置 `required_format=PNG`。它会按文件内容让 Pillow 自动识别格式，甚至包含一套对 JPEG 输出的兼容检查。因此一个 JPEG 内容即使命名为 `.png`，理论上仍可能被当前评分代码接受。正确执行仍应输出真实 PNG；本文把“格式要求”和“当前自动检测边界”分开说明。

### 5.2 两张批准照片必须各出现恰好一次

图片 evaluator 对每个批准源进行灰度与边缘模板匹配，并继续做源内容一致性检查，不是 OCR 文件名匹配。当前规则：

- `case18.jpg` 必须找到恰好 1 个独立匹配区域；
- `case21.jpg` 必须找到恰好 1 个独立匹配区域；
- 两个匹配框不能有 0.45 或以上的 IoU 重叠；
- `case99.jpg` 必须找不到任何匹配区域。

默认会在约 45% 到 110% 的缩放范围内搜索，并对普通像素舍入尺寸做局部细化；灰度和边缘相关分数组合阈值为 `0.69`。这允许合理等比缩放，但大幅裁掉照片、严重改色、遮住主要内容或用文字代替照片会失败。

### 5.3 必须只有两个真实的大型视觉卡片

除源照片匹配外，Evaluator 还：

- 检查未被两张批准照片解释的额外视觉区域；
- 把较大、具有饱和度的连通视觉面板计为 card；
- 要求 card 总数精确为 2；默认显著面板面积阈值约为画布的 4%，饱和度阈值为 45。

因此重复 case18、增加第三张其他照片、把 case99 做成缩略图面板，或加入另一个大色块卡片，都可能失败。普通白边、文字标签和少量装饰通常不会被当成第三张照片卡。

### 5.4 当前图片 evaluator 不检查标签文字

虽然 instruction 明确要求 “Label the approved entries clearly”，本题 `approved_sources` 规则只提供 `path`，没有 `caption_text`、`caption_entity_relation` 或 `layout_contract`。因此执行路径不会启动 OCR 标签关系检查。

实际含义：

- 标签缺失可能仍通过自动图片 evaluator；
- 标签写错也未必被发现；
- 图片左右顺序也未设置 `order_sensitive=true`，所以不要求 CASE-18 在左、CASE-21 在右。

这属于当前自动覆盖范围的缺口，不是任务要求的取消。人工正确执行仍应把两项清楚标为 `CASE-18`、`CASE-21`。

### 5.5 CSV 表头支持受控同义词

CSV 用 `utf-8-sig` 读取。必须恰好有 3 列，每个规范字段恰好匹配一列，不能有额外列。

| 规范字段 | 允许表头 |
|---|---|
| `file` | `file`、`filename`、`source file` |
| `case_code` | `case_code`、`case`、`case id`、`code` |
| `status` | `status`、`disposition`、`decision` |

表头大小写和标点会被归一化，列顺序不敏感。例如：

```csv
Decision,Case ID,Filename
```

可以被映射为同一三列。若同时存在 `file` 和 `filename`，规范字段会匹配到两列，失败。

### 5.6 CSV 状态支持同义词，记录集合必须精确

`included` 可写成：

```text
included / approved / selected / include
```

`excluded_rejected` 可写成：

```text
excluded_rejected / rejected / excluded / not included / exclude rejected
```

文本会转小写，并把非字母数字折叠为下划线，所以 `CASE-18`、`case 18`、`case_18` 在这一 evaluator 中等价。

规范化后必须恰好得到下面三条唯一记录，行顺序不限：

```text
case18.jpg | CASE-18 | included
case21.jpg | CASE-21 | included
case99.jpg | CASE-99 | excluded_rejected
```

不能重复、漏行、多行或使用未列出的状态词；三个字段之外也不能加 `notes` 等额外列。

## 6. 当前 evaluator 没检查什么

- 不实际 OCR/核验 CASE-18、CASE-21 标签；
- 不要求两张照片固定左右顺序；
- 没有严格验证文件容器必须是 PNG，尽管 instruction 明确要求；
- 不要求照片使用固定尺寸、边距、字体或背景；
- CSV evaluator 与图片 evaluator 相互独立，不会拿 CSV 状态去动态决定图片源；
- 评测时不重新读取 manifest，三条期望已写在 task JSON 中。

## 7. 常见失败示例

- 输出 1200×799：尺寸必须精确，失败。
- 只把 `case18.jpg` 和 `case21.jpg` 的文件名写在画布上：没有真实照片像素匹配，失败。
- 两张批准照片正确，但又放入 case99 缩略图：rejected source 被找到，失败。
- 重复放两次 case18：该 approved source 找到两个独立区域，不是恰好一次。
- CSV 只写批准项、不写 case99：不是每个 manifest row 一条，记录集合失败。
- CSV 加第四列 `reason`：semantic evaluator 要求恰好三列，失败。

## 8. Cleanup

- `linux_0` 删除 `evidence_manifest.csv`；
- `linux_1` 删除三张源照片、contact sheet、辅助 base64 文件和 CSV 索引。

