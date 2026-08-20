# Core 162 — android_only_234

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 162 项
- 任务文件：`tasks/cross_device/android_only/android_only_234.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：medium
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机的照片清单列出三张照片。第二台手机的 Site 文件夹实际只有 `north_gate.png` 和 `meter_panel.png`，没有 `old_notice.png`。要在第二台手机的 Markor 中创建精确名为 `photo_status.md` 的报告，分别写：

~~~text
north_gate.png: present
meter_panel.png: present
old_notice.png: missing
~~~

不要拍照、生成 `old_notice.png` 或加入其他图片。除报告语义外，evaluator 还把 Site 文件夹的两张原图作为 hard guard 检查。

## 1. Instruction

### 英文原文（逐字）

~~~text
The first phone's photo manifest lists the site photos to verify. Check the Site folder on the second phone and leave the field coordinator a present/missing report named `photo_status.md` in Markor. Do not take or create replacement photos.
~~~

### 中文翻译

第一台手机的照片清单列出了需要核验的现场照片。检查第二台手机的 Site 文件夹，并在 Markor 中给现场协调员留下一个名为 `photo_status.md` 的“存在/缺失”报告。不要拍摄或创建替代照片。

## 2. 输入、附件与初始业务数据

本任务没有邮件或短信。输入是一份 Markdown 清单和两张真实 PNG；输出是一份新的 Markor Markdown 报告。

### 2.1 android_0：`photo_manifest.md`

上传路径：

~~~text
/storage/emulated/0/Documents/Markor/photo_manifest.md
~~~

文件原文：

~~~text
Expected site photos:
north_gate.png - gate overview
meter_panel.png - meter panel
old_notice.png - notice board
~~~

### 2.2 android_1：Site 文件夹中的图片

目录：

~~~text
/sdcard/Pictures/Site
~~~

实际附件和画面内容：

| 文件 | 像素尺寸 | 画面内容 | 初始状态 |
|---|---:|---|---|
| `north_gate.png` | 1727×911 | 阴天中的工业场地入口：黑色金属/链网大门关闭，前方是铺装车道，旁边有门禁控制箱和黄色防撞柱，后方可见树木与工业设施 | 存在 |
| `meter_panel.png` | 1536×1024 | 米色建筑外墙上的灰色电表柜，六个圆形电表按 3×2 排列，下方有线管，左侧可见室外空地和树木 | 存在 |
| `old_notice.png` | — | 清单称其应为 notice board 照片，但没有提供该图片资产 | 缺失 |

两张现有图均为可解码 PNG。仓库中不存在 `old_notice.png`，这正是要报告的缺项，不是要补造的附件。

### 2.3 输出初态

android_1 会确保 Markor 可用，并在开始前删除：

~~~text
/storage/emulated/0/Documents/Markor/photo_status.md
~~~

因此报告必须由执行者新建。

## 3. Setup 具体流程

### android_0

1. 确保 Markor 可用；
2. 把 `photo_manifest.md` 上传到 Markor 文档目录。

### android_1

1. 确保 Android Files 可用；
2. 创建 Site 目录，删除三个清单文件名的旧文件及旧 MediaStore 图片记录；
3. 上传 `north_gate.png` 和 `meter_panel.png`；
4. 为两张图发送媒体扫描广播；
5. 确保 Markor 可用；
6. 删除旧的 `photo_status.md`。

## 4. 正确输出

必须创建：

~~~text
/storage/emulated/0/Documents/Markor/photo_status.md
~~~

Oracle 示例全文：

~~~text
Photo audit from photo_manifest:
- north_gate.png: present
- meter_panel.png: present
- old_notice.png: missing
No replacement photo was created.
~~~

标题、列表符号和最后一句不是强制逐字匹配；三个文件名与各自状态才是关键。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

有 2 个 evaluator，两个都必须成功：

1. `photo_status.md` 的三条 present/missing 关系；
2. Site 目录的精确图片库存、格式和像素尺寸。

第二项虽然设置了 `enable_score_calc=false`，仍是 hard guard：它不贡献分项分数，但失败会让整项任务不通过。

### 5.1 报告路径是精确的

Getter 会直接读取：

~~~text
/storage/emulated/0/Documents/Markor/photo_status.md
~~~

所以文件名或目录写错就读不到内容。任务 metadata 中“按内容搜索而不要求隐藏文件名”的说明与当前 getter 实现不一致；本任务 instruction 本身明确给了文件名，应以实际 `path` evaluator 为准。

### 5.2 三个状态关系如何匹配

报告必须各出现一次并形成正确关系：

| 实体 | 要判定的状态 |
|---|---|
| `north_gate.png` | present |
| `meter_panel.png` | present |
| `old_notice.png` | missing |

`require_one_relation_per_entity=true` 的实际效果是：

- 每个文件名在整份报告中只能匹配一次；
- 每个文件名只能落入一个包含状态词的 clause；
- 该 clause 的最终状态必须唯一且正确。

Present 可由 `present`、`exists`、`available`、`found`、`located`、`is there` 等表达；missing 可由 `missing`、`absent`、`unavailable`、`not found`、`does not exist`、`not present` 等表达。大小写和连续空白会规范化。

状态 clause 会按换行、分号、竖线、逗号，以及特定句子边界切分。一个 clause 同时断言 present 和 missing 会被判为 invalid；问句、不确定表达（如 maybe、unknown、cannot confirm）或含混反向否定也会失败。

任何匹配 `*.png` 但不在上述三项中的额外图片文件名，都会触发 `reject_unlisted_entity_pattern`。

### 5.3 图片目录 hard guard

`android_image_album_state` 直接列出 Site 目录第一层的普通文件，并要求文件名集合精确等于：

~~~text
meter_panel.png
north_gate.png
~~~

随后逐个拉取并解码，要求：

- `north_gate.png`：PNG，恰好 1727×911；
- `meter_panel.png`：PNG，恰好 1536×1024。

因此：

- 新建 `old_notice.png` 会因目录多出文件而失败；
- 删除或改名现有图会失败；
- 多放其他普通文件也会失败；
- 换成 JPG、无法解码的伪 PNG，或尺寸不同会失败。

此 guard 没有配置 SHA-256，也不比较画面语义或逐字节原图；没有启用 `require_media_store_visible`，所以它检查文件系统中的可解码图片，不额外要求 Gallery/MediaStore 可见。`find -type f` 只精确限制普通文件，子目录本身不计入文件名集合。

### 5.4 当前 evaluator 没有检查什么

- 不要求报告逐字等于 oracle；
- 不要求特定 Markdown 标题或列表格式；
- 不检查 android_0 的 manifest 最终是否仍存在；
- 不用图像识别核对“门”或“电表柜”的画面内容；
- 不检查报告是否真的“发给”某个联系人，因为输出只是本地 Markor 文件。

## 6. 常见失败与真实评测边界

- 报告写成 `old_notice.png: maybe missing`：不确定语义，失败。
- 三项用逗号写在一行仍可能被拆成三个 clause；为避免误关联，推荐每项单独一行。
- 在正文说明“no replacement_photo.png was created”：会出现未列出的 PNG 名，失败。
- 只写“2 present, 1 missing”而不逐项命名：失败。
- 正确报告做好了，但另外创建了一张替代照片：图片库存 guard 失败。

## 7. Cleanup

- android_0 删除 `photo_manifest.md`；
- android_1 删除三张目标文件名、对应 MediaStore 项，并在可行时移除 Site 目录；
- android_1 删除 `photo_status.md`。
