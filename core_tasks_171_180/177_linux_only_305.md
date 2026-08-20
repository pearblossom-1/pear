# Core 177 — `linux_only_305`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 177 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_305.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的 CSV 指定横幅尺寸、案件代码、输出名和标签；第二台 Linux 提供一张同尺寸的冬季仓库照片。需要在第二台机器上生成：

1. `/tmp/banner/banner_CASE-500.png`：1600×500，保留源照片，肉眼/OCR 能看到 `CASE-500` 和 `Winter readiness`；
2. `/tmp/banner/brief.pdf`：可解析的 PDF，文本中写出 `CASE-500`、`banner_CASE-500.png`、`Winter readiness`。

横幅最稳妥的做法是在原照片上加大号、高对比文字，尽量不要裁掉、替换或大面积遮住原图。

## 1. Instruction

### 英文原文（逐字）

```text
Create `/tmp/banner/banner_CASE-500.png` on the second Linux machine using `source.png` there and `banner_spec.csv` on the first machine. The banner must use the specified dimensions and visibly show the case code and label. Then create `/tmp/banner/brief.pdf` referencing the banner filename, case code, and label.
```

### 中文翻译

使用第二台 Linux 机器上的 `source.png` 和第一台机器上的 `banner_spec.csv`，在第二台机器创建 `/tmp/banner/banner_CASE-500.png`。横幅必须使用指定尺寸，并清晰显示案件代码和标签。然后创建 `/tmp/banner/brief.pdf`，其中引用横幅文件名、案件代码和标签。

## 2. 输入、附件与初始业务数据

### 2.1 `linux_0`：`banner_spec.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_305/source/linux_0/tmp/banner/banner_spec.csv`
- 注入路径：`/tmp/banner/banner_spec.csv`
- 完整原文：

```csv
case_code,output,width,height,label
CASE-500,banner_CASE-500.png,1600,500,Winter readiness
```

只有一条规格：案件代码 `CASE-500`，输出文件名 `banner_CASE-500.png`，宽 1600、高 500，标签 `Winter readiness`。

### 2.2 `linux_1`：`source.png`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_305/source/linux_1/tmp/banner/source.png`
- 注入路径：`/tmp/banner/source.png`
- 文件属性：PNG、1600×500、8-bit RGB、非隔行。

图片的具体画面：冬季黄昏的工业仓储/物流场地。画面右侧是一排深色大型仓库和亮着暖黄色灯光的装卸口，停着多辆带铲斗或货斗的工程卡车；前景是一条积雪、结冰的宽阔车道，左侧有推起的雪堆、树林和橙黄色落日天空。原图本身没有 `CASE-500` 或 `Winter readiness` 文字。

### 2.3 输出初态

Setup 会删除：

```text
/tmp/banner/banner_CASE-500.png
/tmp/banner/.banner_CASE-500.b64
/tmp/banner/brief.pdf
```

`.banner_CASE-500.b64` 是 oracle 可能使用的临时文件名，不是用户要求的交付物。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/banner`；
2. 删除旧 `banner_spec.csv`；
3. 上传规格 CSV。

### `linux_1`

1. 创建 `/tmp/banner`；
2. 删除并重新上传 `source.png`；
3. 删除旧横幅和临时 base64 文件；
4. 删除旧 PDF brief。

Setup 不预置任何编辑软件状态。可以使用图像编辑器、文档工具或命令行，只看最终两个文件。

## 4. 正确输出

### 4.1 横幅

必须保留源照片的主要视觉内容，并叠加可被英文 OCR 识别的：

```text
CASE-500
Winter readiness
```

两个文本不要求固定位置、字体、颜色或同一行，但需要足够大且与背景有明显对比。输出路径和像素尺寸必须正确。

### 4.2 PDF brief

PDF 的可提取文本至少应有：

```text
CASE-500
banner_CASE-500.png
Winter readiness
```

例如：

```text
Brief for CASE-500
Banner file: banner_CASE-500.png
Label: Winter readiness
```

## 5. Evaluator：评测方式与具体评测点

本任务有 4 个计分 evaluator，默认各占四分之一。分数是四项平均值，但任务 `success` 要求四项全部成功。

### 5.1 横幅像素尺寸

`check_image_dimensions` 用 Pillow 打开目标文件，并要求：

```text
width  = 1600
height = 500
```

不是看 CSS 尺寸、页面尺寸或文件名中的数字，而是解码后的真实像素宽高。路径错误、文件不存在、图片无法解码都会失败。

这条规则没有配置 `required_format`，后面的 source-similarity 也没有配置 `required_image_format`；因此当前实现没有单独验证文件内部格式一定是 PNG，主要依靠目标 `.png` 路径和图片可解码性。符合 instruction 时仍应生成真正 PNG。

### 5.2 横幅可见文字 OCR

`check_image_text_relation` 会先再次要求 1600×500，然后：

1. 把图放大 2 倍；
2. 分别用灰度自动对比、RGB、红/绿/蓝通道、红色差分共 6 种图像版本；
3. 用 EasyOCR 英文模型识别文本；
4. 只要某一种版本，或所有版本去重后合并的文本，通过关系规则即可。

OCR 文本必须含：

- `CASE-500`，也接受常见 OCR 误识别 `CASE-5OO`；
- `Winter readiness`。

同时不能含 `CASE-501` 或 `Summer readiness`。关系匹配大小写不敏感，不要求两项在固定坐标或同一行，也没有 `unique_entities`，所以 OCR 重复识别本身不会因“出现两次”失败。问句、不确定、否定或撤回语义会被通用关系 scorer 拒绝。

“肉眼看得到但字太小、对比度太低，导致六种 OCR 都读不到”会失败。因此不要只写几像素高的角标。

### 5.3 与源照片的相似度

`check_image_source_similarity` 把输出与仓库内固定的 `source.png` 做视觉像素/边缘比较，不是文件哈希或字节完全一致。任务配置阈值是：

| 指标 | 最低要求 |
|---|---:|
| 全图匹配比例 `min_total_match` | 0.30 |
| 显著区域匹配比例 `min_salient_match` | 0.48 |
| 源图边缘保留比例 `min_edge_match` | 0.38 |
| RGB 颜色距离容差 | 58 |

实现会对图像做轻度模糊后比较颜色距离，并检测显著区域和边缘；还带有完整性检查，防止把源图大块替换、挪位或只保留少量片段。这个 legacy 非 strict 路径允许有结构化文字覆盖，因此“保留照片并加文字”是预期用法；但大面积实色底、严重裁剪、整图换色、加边框/单轴留白或替换成完全不同图片都可能失败。

最实用的理解是：不是要求原图一像素不改，而是要求照片主体仍明显来自指定源图。

### 5.4 PDF 文件和文本

评测脚本对 `/tmp/banner/brief.pdf` 依次做：

1. 文件必须存在且非空；
2. 前 5 个字节必须精确为 `%PDF-`；
3. 系统必须有 `pdftotext`，并且该命令能成功提取文本；
4. 对提取文本做大小写不敏感的子串检查。

必须包含：

```text
CASE-500
banner_CASE-500.png
Winter readiness
```

不得包含：

```text
CASE-501
banner_CASE-501.png
Summer readiness
missing
invalid
```

这里不是整篇 PDF 绝对匹配，也不检查页面数量、布局、字号、横幅图片是否嵌入 PDF，或三项是否在同一行。扫描图片型 PDF 如果没有可提取文本，会失败。

### 5.5 当前 evaluator 没检查什么

- 不检查使用了哪款编辑软件或具体操作步骤；
- 不检查文字具体位置、字体和配色，只通过 OCR 间接要求可见；
- 不要求 PDF 内嵌横幅图，只要求可提取文本引用；
- 不在评测时重新解析 `banner_spec.csv`，目标值已经写入 evaluator；
- 不要求删除 `source.png`，也不比较输出文件创建时间。

## 6. 常见失败示例

- 只把 `source.png` 复制成目标，不加文字：尺寸和相似度通过，但 OCR 文字项失败。
- 创建 1600×500 的纯色图并写对文字：尺寸/OCR可能通过，但源图相似度失败。
- 横幅全部正确，PDF 只有图片没有文本层：`pdftotext` 提取不到三项，PDF evaluator 失败。
- PDF 写成 `CASE-500 / Winter readiness`，漏了完整文件名：PDF evaluator 失败。
- 横幅文件是 800×250，但在查看器中放大显示：真实像素不符，失败。

## 7. Cleanup

- `linux_0` 删除规格 CSV；
- `linux_1` 删除源图、横幅、临时 base64 文件和 PDF。

