# Core 030 — `a2_gallery_album_to_tasks`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 30 项
- 任务文件：`tasks/cross_device/real300/a2_gallery_album_to_tasks.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 设备拓扑：`2A`（`android_0`、`android_1`）
- 限制：最多 50 步，最长 300 秒

## 0. 任务链与设备分工

第一部手机是只读来源：从 Receipts 相册读取三个精确文件名。第二部手机是唯一输出面：Tasks 最终必须恰好有三条未完成任务。图片中的商户、日期、商品和金额只是帮助区分图片，不是要抄入任务标题的内容。

## 1. Instruction

### 英文原文（逐字）

```text
The first phone's Simple Gallery Pro has a `Receipts` album with three receipt images. Please add each image filename as a separate review to-do in the Tasks app on the second phone.
```

### 中文翻译

第一部手机的 Simple Gallery Pro 中有一个 `Receipts` 相册，其中包含三张收据图片。请把每个图片文件名作为一条独立的 review 待办，添加到第二部手机的 Tasks 应用中。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的 Receipts 相册

目录：`/sdcard/Pictures/Receipts`

| 文件名 | 图片中的收据详情 |
|---|---|
| `receipt_march_01.png` | OFFICE CENTRAL；日期 03/01/24 10:12 AM；Staples、Pilot G2 Pen、Post-it Notes；总额 11.33 |
| `receipt_march_15.png` | RIVERBEND CAFE；日期 03/15/24 12:47 PM；Iced Latte、Turkey Sandwich、Chocolate Chip Cookie；总额 18.13 |
| `receipt_march_28.png` | HILLTOP HARDWARE；日期 03/28/24 4:05 PM；Lumber、Deck Screws、Painter’s Tape；总额 19.44 |

本任务要求复制的是三个完整文件名，而不是商户名、日期或金额。

### 2.2 第二部手机的 Tasks

Setup 会清空第二部手机的 Tasks 数据库，所以初始没有任务。

## 3. Setup 具体流程

### `android_0`

1. 确保 Simple Gallery Pro 和 Tasks 可用；Tasks 虽安装在第一部手机，但本任务不在这里写待办。
2. 创建 Receipts 目录，删除三个同名旧文件和旧 MediaStore 记录。
3. 上传三张 PNG。
4. 逐一触发媒体扫描。

### `android_1`

1. 确保 Simple Gallery Pro 和 Tasks 可用。
2. 清空 Tasks。

第二部手机也确保 Simple Gallery Pro 可用，但 setup 不把三张收据复制过来；跨设备传递的是文件名信息，不是图片文件。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

在第二部手机的 Tasks 中建立下面三条，并保持未完成：

```text
receipt_march_01.png
receipt_march_15.png
receipt_march_28.png
```

必须包含 `.png` 扩展名。不能用图片内的商户名代替，也不能在一个任务里把三个文件名合并起来。

### 4.1 Android 任务集合

- `result.type`：`androidworld_task_set`
- 三个标题必须各出现一次，`completed=false`。
- `allow_unrelated=false`，所以第二部手机不能存在额外任务。
- 标题比较忽略大小写并折叠空白，但标点、下划线和扩展名仍属于标题内容。
- 漏项、重复、额外项或勾选为已完成都会返回 `mismatch`。
- evaluator 不读取图片 OCR 内容，也不重新检查第一部手机相册；图片是提供文件名的输入来源。

## 5. 标题匹配的实际边界

标题先折叠连续空白并做大小写不敏感比较，因此 `RECEIPT_MARCH_01.PNG` 可以与规范标题匹配；但下划线、日期、点号和扩展名仍必须存在。以下对比更直观：

| Tasks 中的标题 | 是否能匹配 | 原因 |
|---|---|---|
| `receipt_march_01.png` | 是 | 精确规范标题 |
| `RECEIPT_MARCH_01.PNG` | 是 | 默认忽略大小写 |
| `Review receipt_march_01.png` | 否 | 多了 `Review` |
| `receipt march 01.png` | 否 | 下划线被改为空格 |
| `receipt_march_01` | 否 | 缺少扩展名 |
| 一条标题含三个文件名 | 否 | 不能分别匹配三份任务合同 |

`allow_unrelated=false` 表示任务总集合就是规范三项；例如额外创建 `Review receipts`，即使三条规范任务都在也会失败。三条均要求 `completed=false`，先创建再勾选完成同样失败。

Evaluator 不检查任务说明、截止日期、列表名或优先级，也不要求按 01、15、28 的顺序显示；它只检查未完成状态和精确标题集合。

## 6. Cleanup

清理会定向删除第一部手机三张 PNG、对应 MediaStore 记录，并在目录为空时删除 Receipts；同时清空第二部手机 Tasks。
