# Core 068 — `linux_android_1252`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1252.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`；拓扑 `1A+2L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Compare `/tmp/evidence/required_manifest.csv` on the first Linux desktop with the phone's Download/evidence folder. If a required file is missing, use the second Linux desktop for the result: do not create `/tmp/evidence/evidence_package.zip` there, and write `/tmp/evidence/missing_report.csv` there with columns `package_id`, `missing_filename`, and `decision`, one row per missing required file.
```

### 中文翻译

比较 manifest 与手机 evidence 文件夹；若 required 文件缺失，不创建 ZIP，并在第二台 Linux 写 missing_report.csv，每个缺失 required 文件一行。

## 2. 数据与评测

Manifest：signed_form.pdf=yes、field_photo.jpg=yes、field_photo_old.jpg=no。手机只有 signed_form.pdf 与 old 版本，精确 required `field_photo.jpg` 缺失。

两项评分：CSV 只能有一条逻辑记录 `PKG-1252,field_photo.jpg,missing required file`，允许表头别名与 decision 的 missing/blocked 等别名；`evidence_package.zip` 必须完全不存在，空 ZIP 也失败。

