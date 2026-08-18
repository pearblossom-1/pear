# Core 023 — `al_camera_web_upload_form`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 23 项
- 任务文件：`tasks/cross_device/real300/al_camera_web_upload_form.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步，最长 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
The Android Camera folder contains `asset_tag_photo.jpg`. Inspect the shelf/location shown in the photo, then open `/home/user/upload/form.html` in Linux Chrome, upload that photo, enter asset id `AT-4172`, use the shown shelf/location as the condition note, and submit the form.
```

### 中文翻译

Android Camera 文件夹中有 `asset_tag_photo.jpg`。请查看照片中显示的货架/位置，然后在 Linux Chrome 中打开 `/home/user/upload/form.html`，上传该照片，输入资产 ID `AT-4172`，把照片中显示的货架/位置写作 condition note，并提交表单。

## 2. 输入、附件与初始业务数据

### 2.1 Android 照片

- 仓库源文件：`tasks/cross_device/real300_assets/al_camera_web_upload_form/source/asset_tag_photo.jpg`
- Android 路径：`/sdcard/DCIM/Camera/asset_tag_photo.jpg`
- 画面：蓝色设备箱，标签为 `AT-4172`；箱子放在标有 `NORTH SHELF` 的货架上。
- 因而 location/condition 的规范答案是 `north shelf`。
- 源照片 SHA-256：`8056acfdfe060d0a8ff864421bbdb05fa784aefc006d35a9ebc5a510b42bd39b`

### 2.2 Linux HTML 表单

- 源文件：`tasks/cross_device/real300_assets/al_camera_web_upload_form/source/photo_upload_form.html`
- 注入路径：`/home/user/upload/form.html`
- 页面标题：`Asset Photo Intake`
- 表单编码：`multipart/form-data`

| 标签 | 字段名 | 类型/规则 | 目标值 |
|---|---|---|---|
| Asset ID | `asset_id` | 文本，HTML pattern `AT-[0-9]{4}` | `AT-4172` |
| Condition or location note | `condition` | 文本 | `north shelf` 或合格等价表达 |
| Photo | `photo` | JPEG 文件 | 原始 `asset_tag_photo.jpg` |

## 3. Setup 具体流程

### `android_0`

1. 删除 Camera 目录中的同名旧照片和 MediaStore 记录。
2. 确保 Camera 可用。
3. 上传源 JPEG 并触发媒体扫描。

### `linux_0`

1. 删除并重建 `/home/user/upload`。
2. 上传表单为 `form.html`。
3. runtime 启动本次运行专属的表单接收器，并把 HTML 中唯一的 `__MDCBENCH_FORM_ACTION__` 替换为实际地址。

照片不会自动复制到 Linux；提交前需要把 Android 上的原文件传到 Linux，使 Chrome 文件选择器能够选中它。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

表单这样填最稳妥：

```text
Asset ID: AT-4172
Condition: north shelf
Photo: asset_tag_photo.jpg（第一部手机上的原文件）
```

然后点击 Submit。只输入文字但不上传文件、上传截图/重编码后的照片、写成 south/east/west shelf，都会失败。

### 4.1 文本字段

- 接收器要求文本字段集合恰好为 `asset_id` 和 `condition`。
- `asset_id` 没有语义规则，必须精确为 `AT-4172`。
- `condition` 会转小写并把非字母数字归一化为空格，然后要求同时出现独立 token `north` 和 `shelf`。
- `North shelf`, `located on the north shelf` 等肯定表达可归一化为规范值 `north shelf`。
- 包含 `south shelf`、`east shelf`、`west shelf`，带问号，或含 not/no/maybe/uncertain 等否定不确定词会失败。
- 归一化后的结构化字段会与规范对象 `{"asset_id":"AT-4172","condition":"north shelf"}` 比较。

### 4.2 文件字段

- 文件字段集合必须恰好为 `photo`。
- 上传文件名必须为 `asset_tag_photo.jpg`（大小写不敏感）。
- MIME type 必须为 `image/jpeg`。
- 上传字节必须非空，且 SHA-256 必须与源照片完全相同。
- 因此在 Linux 中另存、压缩、裁剪或截图后即使画面相同，也不能替代原附件。
- 如果正确提交后又进行一次错误提交，最新一次 POST 会清除先前成功状态。

