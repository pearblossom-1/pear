# Core 030 — `a2_gallery_album_to_tasks`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 30 项
- 任务文件：`tasks/cross_device/real300/a2_gallery_album_to_tasks.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 设备拓扑：`2A`（`android_0`、`android_1`）
- 限制：最多 50 步，最长 300 秒

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

1. 确保 Simple Gallery Pro 和 Tasks 可用。
2. 创建 Receipts 目录，删除三个同名旧文件和旧 MediaStore 记录。
3. 上传三张 PNG。
4. 逐一触发媒体扫描。

### `android_1`

1. 确保 Simple Gallery Pro 和 Tasks 可用。
2. 清空 Tasks。

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

