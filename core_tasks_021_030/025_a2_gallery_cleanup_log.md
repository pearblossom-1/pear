# Core 025 — `a2_gallery_cleanup_log`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 25 项
- 任务文件：`tasks/cross_device/real300/a2_gallery_cleanup_log.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 设备拓扑：`2A`（`android_0`、`android_1`）
- 限制：最多 50 步，最长 300 秒

## 1. Instruction

### 英文原文（逐字）

```text
The first phone's Markor note `Album rule` says which pictures to keep in the `Cleanup Review` album in Simple Gallery Pro on the second phone. Please clean up the second phone according to the rule: keep only the images named in the note and delete the other images from the same album.
```

### 中文翻译

第一部手机的 Markor 笔记 `Album rule` 说明了第二部手机 Simple Gallery Pro 的 `Cleanup Review` 相册中应该保留哪些图片。请按照该规则清理第二部手机：只保留笔记中点名的图片，并删除同一相册中的其他图片。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的规则笔记

```markdown
# Album rule

Album: Cleanup Review

Keep these photos on the second phone:
- site_a_overview.png
- site_c_storage.png

Remove every other photo from the same album.
```

### 2.2 第二部手机的初始相册

目录：`/sdcard/Pictures/Cleanup Review`

| 文件 | 画面概述 | 最终动作 |
|---|---|---|
| `site_a_overview.png` | 工业设施全景，灰色建筑和围栏设备区 | 保留 |
| `site_b_entrance.png` | 带铁门的入口道路 | 删除 |
| `site_c_storage.png` | 有托盘、货架和电柜的有顶储存区 | 保留 |
| `site_d_parking.png` | 多辆车停放的停车区域 | 删除 |

四张图片由 setup 原样上传并逐一触发 MediaStore 扫描。

## 3. Setup 具体流程

### `android_0`

1. 确保 Markor 可用。
2. 写入上述 `Album rule.md`。

### `android_1`

1. 确保 Simple Gallery Pro 和 Android Files 可用。
2. 删除并重建 `Cleanup Review` 目录，同时清理旧 MediaStore 记录。
3. 上传四张 PNG。
4. 对四张文件触发媒体扫描，使其在 Gallery 中可见。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

第二部手机的这个目录最终必须只剩：

```text
site_a_overview.png
site_c_storage.png
```

而且必须是 setup 放入的原始两张 PNG。仅从 Gallery 的某个视图隐藏、移动到同目录的子目录、重命名或重新保存图片，都不是等价通过方式。

### 4.1 相册文件集合

- `result.type`：`android_image_album_state`
- evaluator 用文件系统读取 `Cleanup Review` 目录顶层文件名，并要求集合精确等于两个保留文件。
- `site_b_entrance.png`、`site_d_parking.png` 或任何其他额外顶层文件仍在目录中都会失败。
- 缺少任一应保留图片也会失败。

### 4.2 图片真实性和字节

- 两个保留文件都必须能实际解码为 PNG。
- `site_a_overview.png` 的 SHA-256 必须为 `d4b92f7649880f7370ab1107c856e8d31a758fd2fec03d948dda18e3d7643abd`。
- `site_c_storage.png` 的 SHA-256 必须为 `0662355213acbbcd97c3b2326889c1a73e6dd8defbfb294cfbd8706c5eea8e9d`。
- 因而裁剪、标注或重新导出保留图片会改变字节并失败。
- 本任务没有启用额外的 MediaStore 可见性检查；决定性结果是目录文件集合和源图片字节。第一部手机的笔记本身不评分。

