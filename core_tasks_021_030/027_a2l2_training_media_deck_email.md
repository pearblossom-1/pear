# Core 027 — `a2l2_training_media_deck_email`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 27 项
- 任务文件：`tasks/cross_device/real300/a2l2_training_media_deck_email.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 50 步，最长 300 秒

## 0. 任务链与设备分工

| 设备 | 权威输入或产物 | 与下一步的关系 |
|---|---|---|
| `android_0` | 本轮新拍的 `training_setup_photo.jpg` | 文件名写入幻灯片；照片本身不要求嵌入 |
| `android_1` | Trainer 的邮箱 `trainer@example.com` | 写入幻灯片并作为草稿唯一收件人 |
| `linux_0` | `template.odp` | 必须转移到第二台 Linux 后制作 deck |
| `linux_1` | `deck.odp`、导出的 PDF、Thunderbird 草稿 | 三项都由独立 evaluator 检查 |

四个 evaluator 等权；任何一环缺失，任务都不会整体通过。

## 1. Instruction

### 英文原文（逐字）

```text
I'm putting together a setup-photo slide for the trainer. Take a new photo with Camera on the first phone and save it as `training_setup_photo.jpg`; the `Trainer` contact on the second phone has the email address. On the second Linux machine, use `/tmp/train/template.odp` from the first Linux machine to create `/tmp/train/deck.odp`, replacing the template fields with the photo filename, trainer email, and purpose `Training setup photo`, then export it as `/tmp/train/training_deck.pdf`. Leave an unsent Thunderbird draft to the trainer with that PDF attached and mention `training_deck.pdf` in the message.
```

### 中文翻译

我正在为培训师制作一张 setup-photo 幻灯片。请在第一部手机上用 Camera 新拍一张照片并保存为 `training_setup_photo.jpg`；第二部手机的 `Trainer` 联系人中有邮箱地址。在第二台 Linux 机器上，使用第一台 Linux 的 `/tmp/train/template.odp` 创建 `/tmp/train/deck.odp`，把模板字段替换为照片文件名、培训师邮箱和用途 `Training setup photo`，然后导出为 `/tmp/train/training_deck.pdf`。给培训师留一封未发送的 Thunderbird 草稿，附上该 PDF，并在邮件中提到 `training_deck.pdf`。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的新照片要求

- 目标路径：`/sdcard/DCIM/Camera/training_setup_photo.jpg`
- 必须在本次 setup 创建的起始标记之后新生成。
- 必须是可解码 JPEG，至少 320×240。
- 没有提供固定源图片，照片实际拍摄内容可以自由选择。

### 2.2 第二部手机的联系人

| 字段 | 值 |
|---|---|
| 名称 | Trainer |
| 电话 | `5550101` |
| 邮箱 | `trainer@example.com` |
| 备注 | Training deck reviewer |

### 2.3 第一台 Linux 的 ODP 模板

- 源文件：`tasks/cross_device/real300_assets/a2l2_training_media_deck_email/source/template.odp`
- 注入路径：`linux_0:/tmp/train/template.odp`
- 包含 `mimetype`、`styles.xml`、`content.xml`、`meta.xml`、`META-INF/manifest.xml`。
- 一张横向 4:3 幻灯片、一个文本 frame，四个可见段落：

```text
Training Media Deck
Photo: [[PHOTO_FILENAME]]
Trainer: [[TRAINER_EMAIL]]
Purpose: [[PURPOSE]]
```

- frame 几何：x=0.8in、y=0.7in、width=8.4in、height=6.0in。

### 2.4 第二台 Linux 的邮件环境

- profile：`~/.thunderbird/mail.default-release`
- 本地身份：`agent@example.test`
- Drafts 初始为空
- `/tmp/train` 初始为空；模板不会自动复制到第二台 Linux，必须从第一台 Linux 传过来。

## 3. Setup 具体流程

### `android_0`

1. 确保 Camera 可用。
2. 删除目标旧照片和 MediaStore 记录。
3. 创建隐藏起始标记 `.mdcbench_l027_started`，用于判断照片是否是本次新拍。

### `android_1`

清空联系人并新增 Trainer。

### `linux_0`

创建 `/tmp/train`，把固定源模板上传为 `/tmp/train/template.odp`。这里没有 `deck.odp` 或 PDF。

### `linux_1`

1. 重建 `/tmp/train` 和 Thunderbird profile。
2. 写入本地账户配置并创建空 Drafts。

第二台 Linux 初始没有模板；需要通过跨设备文件传递获得它。Thunderbird 使用本轮重建的本地 profile，发件身份为 `agent@example.test`，不依赖外部邮件服务器。

## 4. Evaluator：评测方式与具体评测点

本任务有 4 个 evaluator，各占 `1/4`。

### 4.0 先说人话：怎样才算通过

要同时完成四项：

1. 第一部手机新拍并保存合格的 `training_setup_photo.jpg`。
2. 第二台 Linux 的 `deck.odp` 保持模板的一页一框结构，把三个占位符替换为准确值。
3. 导出内容一致的 `training_deck.pdf`。
4. 在 Thunderbird Drafts 留信给 `trainer@example.com`，正文提到 `training_deck.pdf`，且只附这一份刚导出的 PDF。

### 4.1 新照片（权重 `1/4`）

- `android_image_file_state` 检查精确路径。
- 文件修改时间必须晚于 setup 起始标记；复用 setup 前旧文件失败。
- 必须能解码为 JPEG，宽至少 320、高至少 240。
- 不比较固定字节，也不识别照片画面内容。

### 4.2 `deck.odp`（权重 `1/4`）

- 必须是有效 presentation ODF 包，并含 `styles.xml`、`meta.xml`。
- 必须恰好 1 页、1 个 frame、4 个可见段落，三个字段与标题在同一 frame。
- 标题必须为 `Training Media Deck`。
- 字段值精确为：
  - `Photo: training_setup_photo.jpg`
  - `Trainer: trainer@example.com`
  - `Purpose: Training setup photo`
- 三个 `[[...]]` 占位符不得残留，也不得出现 `failed/error`。
- 页面须为横向，宽高比约 1.3333（容差 0.08）。frame 的相对 x、y、宽、高必须落在模板允许范围，明显重排模板会失败。
- evaluator 只要求 Photo 字段记录文件名；没有检查照片图像是否实际嵌入幻灯片。

### 4.3 `training_deck.pdf`（权重 `1/4`）

- 必须是非空、可由 `pdftotext` 读取的真实 PDF。
- 必须包含标题、用途、邮箱和照片文件名，不得含 `missing/failed/error/invalid`。
- Photo、Trainer、Purpose 各自的标签和值必须在同一提取段落中形成肯定关系。

### 4.4 Thunderbird 草稿（权重 `1/4`）

- 收件人集合必须恰好为 `{trainer@example.com}`。
- 正文必须肯定地包含 `training_deck.pdf`；主题不检查。
- 必须恰好附加一份名为 `training_deck.pdf`、MIME `application/pdf` 的附件。
- 附件字节必须与第二台 Linux 当前 `/tmp/train/training_deck.pdf` 完全一致；附另一份同名 PDF 不通过。
- 草稿必须保持未发送状态。

## 5. 四项评测怎样互相绑定

- 照片 evaluator 只验证 Android 精确路径、创建时间和 JPEG 尺寸；ODP evaluator 只要求写入该文件名，并不比较照片字节，也不要求嵌图。
- PDF evaluator 检查可见文字关系，但不直接要求它由当前 `deck.odp` 导出。
- 邮件附件 evaluator 会在评测时计算 `/tmp/train/training_deck.pdf` 的当前字节摘要，再与草稿附件比较。这一项真正把磁盘上的 PDF 和邮件附件绑在一起。

最稳妥的正文：

```text
To: trainer@example.com

Please find training_deck.pdf attached.
```

典型失败：

- 使用 setup 前就存在的同名照片；它不晚于 `.mdcbench_l027_started`。
- ODP 新增第二页、第二个文本框，或保留任何 `[[...]]` 占位符。
- ODP 文字正确，但把页面改成纵向或明显改变唯一 frame 的位置/大小。
- PDF 只是同名文本、无法由 `pdftotext` 解析，或字段标签和值被拆到不同段落。
- 先把 PDF 附到草稿，之后又重新导出覆盖磁盘 PDF；两者字节不再一致。
- 给 Trainer 发送了邮件却没有在 Drafts 留下匹配草稿。

不评测照片画面内容、邮件主题、幻灯片中是否嵌入照片，也不要求特定 PDF 视觉布局。

## 6. Cleanup

清理会删除新照片和时间标记并清 MediaStore、清空 Trainer 联系人、删除两台 Linux 的 `/tmp/train`，同时移除第二台 Linux 的任务 Thunderbird profile 和 `profiles.ini`。
