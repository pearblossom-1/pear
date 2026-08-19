# Core 025 — `a2_gallery_cleanup_log`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 25 项
- 任务文件：`tasks/cross_device/real300/a2_gallery_cleanup_log.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 设备拓扑：`2A`（`android_0`、`android_1`）
- 限制：最多 50 步，最长 300 秒

## 0. 任务链与设备分工

第一部手机只提供删除规则，第二部手机才是被修改对象。正确结果不是“建立一个只显示两张图的新相册”，而是让第二部手机上精确目录 `/sdcard/Pictures/Cleanup Review` 的顶层文件集合只剩两张指定原图。

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
2. 创建 Markor 文档目录，并将上述全文写入精确路径 `/storage/emulated/0/Documents/Markor/Album rule.md`。

### `android_1`

1. 确保 Simple Gallery Pro 和 Android Files 可用。
2. 删除并重建 `Cleanup Review` 目录，同时清理旧 MediaStore 记录。
3. 上传四张 PNG。
4. 对四张文件触发媒体扫描，使其在 Gallery 中可见。

Setup 先删除整个同名目录，因此不会混入上一轮残留照片；随后上传的是四份固定 PNG 源文件。第二部手机虽然也确保了 Android Files 可用，但最终状态并不要求必须用某一个指定 UI 完成删除。

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

## 5. 具体通过与失败例子

### 通过所需的最终文件树

```text
/sdcard/Pictures/Cleanup Review/
├── site_a_overview.png   （原始字节不变）
└── site_c_storage.png    （原始字节不变）
```

### 会失败的变体

- 四张图都还在，只是在 Gallery 里选择了筛选视图。
- 把 B、D 移入 `Cleanup Review/Archive/`：这不符合 instruction 所说的“删除”。需要特别说明的是，当前 getter 只执行 `find ... -maxdepth 1 -type f`，不会检查子目录，所以这种做法可能在当前 evaluator 下漏过；这是评测覆盖范围的真实缺口，不能把它描述成正确完成方式。
- 将 A 重命名为 `site_a_overview_1.png`；精确文件名集合不匹配。
- 删除了 C，或保留了 B/D 中任意一张。
- 对 A/C 做旋转后覆盖保存；即使肉眼看起来相同，固定源字节检查会失败。

### 不评测

- 不通过 OCR 判断图片画面。
- 不检查回收站中是否还有被删除图片。
- 不要求修改或删除第一部手机上的规则笔记。

## 6. Cleanup

任务结束时会删除第一部手机的 `Album rule.md`，删除第二部手机整个 `Cleanup Review` 目录，并按该 relative path 清理 MediaStore 图片记录。
