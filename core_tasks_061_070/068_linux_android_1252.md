# Core 068 — `linux_android_1252`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 68 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1252.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与最终判断

第一台 Linux 的 manifest 要求 `signed_form.pdf` 和 `field_photo.jpg`。手机 evidence 文件夹中有签名表和旧照片 `field_photo_old.jpg`，却没有精确要求的 `field_photo.jpg`。因此这是 missing 分支：第二台 Linux 只能生成一行 missing report，并且绝不能创建 evidence_package.zip。

## 1. Instruction

### 英文原文（逐字）

```text
Compare `/tmp/evidence/required_manifest.csv` on the first Linux desktop with the phone's Download/evidence folder. If a required file is missing, use the second Linux desktop for the result: do not create `/tmp/evidence/evidence_package.zip` there, and write `/tmp/evidence/missing_report.csv` there with columns `package_id`, `missing_filename`, and `decision`, one row per missing required file.
```

### 中文翻译

比较第一台 Linux 的 `/tmp/evidence/required_manifest.csv` 与手机的 Download/evidence 文件夹。如果缺少 required 文件，请在第二台 Linux 上处理结果：不要创建 `/tmp/evidence/evidence_package.zip`；创建 `/tmp/evidence/missing_report.csv`，使用 `package_id`、`missing_filename`、`decision` 三列，每个缺失的 required 文件写一行。

## 2. 输入、附件与初始业务数据

### 2.1 第一台 Linux `required_manifest.csv`

```csv
package_id,filename,required
PKG-1252,signed_form.pdf,yes
PKG-1252,field_photo.jpg,yes
PKG-1252,field_photo_old.jpg,no
```

只有前两项是 required。第三项即使存在，也不能替代第二项，因为文件名不同且它明确标为 `no`。

### 2.2 手机 `signed_form.pdf`

- 路径：`/storage/emulated/0/Download/evidence/signed_form.pdf`
- 一页 PDF，标题为 `Field Evidence Form`，副标题为 `Package PKG-1252 · Evidence completeness approval`。
- Evidence Record 表格写有：Package=`PKG-1252`；Required file=`signed_form.pdf`；Required file=`field_photo.jpg`；Disposition=`Approved for evidence package review`；Owner=`Field Operations`。
- Authorization 区域由 `Morgan Alvarez` 签名，Approval Date=`2026-07-08`，并写明 `Approval valid for PKG-1252`。

这份 PDF 自己也再次证明应该存在 `field_photo.jpg`，但当前手机目录并没有它。

### 2.3 手机 `field_photo_old.jpg`

- 路径：`/storage/emulated/0/Download/evidence/field_photo_old.jpg`
- 835×916 JPEG。
- 画面是围栏旁的灰白色旧 utility cabinet 和一只褪色橙色交通锥。
- 它是 manifest 中 `required=no` 的旧版本，只能作为干扰项；名称中多出的 `_old` 不能忽略。

### 2.4 手机目录的实际清单

```text
signed_form.pdf
field_photo_old.jpg
```

缺失项只有：

```text
field_photo.jpg
```

## 3. Setup 具体流程

### `linux_0`

- 删除旧 required_manifest.csv，创建 `/tmp/evidence`。
- 上传 manifest；第一台 Linux 不承载最终 report。

### `linux_1`

- 删除旧 missing_report.csv 和 evidence_package.zip。
- 创建 `/tmp/evidence`，等待本次输出。

### `android_0`

- 确保 Files 可用。
- 删除并重建 `/storage/emulated/0/Download/evidence`。
- 从两个 fixture suite 分别上传 signed_form.pdf 与 field_photo_old.jpg。
- 不上传 field_photo.jpg，从 setup 层面真实制造缺失状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluation 单元：missing_report.csv 的内容，以及 ZIP 的不存在状态。

### 4.1 missing_report.csv

最直接的目标：

```csv
package_id,missing_filename,decision
PKG-1252,field_photo.jpg,missing required file
```

评测不是随便搜关键词，而是按三列语义记录解析：

- 必须恰好能映射出 package_id、missing_filename、decision 三列，不能有额外列。
- 表头允许别名：
  - package_id：`package id`
  - missing_filename：`missing filename` 或 `missing file`
  - decision：`status` 或 `disposition`
- 必须恰好有上面一条逻辑记录；额外、重复、缺失记录都失败。
- decision 的标准值是 `missing required file`，还接受：`missing`、`required file missing`、`missing file`、`blocked`、`incomplete`。
- 文本比较会做大小写与常见分隔符规范化，因此不是逐字节 CSV 比较；但 package 与缺失文件指向必须仍是 PKG-1252 和 field_photo.jpg。
- 列顺序和记录顺序不敏感；本题只有一行。

### 4.2 evidence_package.zip 必须不存在

Evaluator 在第二台 Linux 执行等价于：

```sh
test ! -e /tmp/evidence/evidence_package.zip
```

只有路径不存在才得到 expected=`missing`。创建空 ZIP、零字节文件或同名目录都会被视为存在并失败。

## 5. 常见失败与评测边界

- 把 field_photo_old.jpg 当成 field_photo.jpg：会错误得出无缺失，两个评测点都可能失败。
- Report 写两行，把非 required 的旧照片也列为 missing：精确记录集合失败。
- Report 正确但顺手创建空 evidence_package.zip：第二项失败。
- 只确保 ZIP 不存在却没写 report：只能通过 absence 项。

Evaluator 不会逐字检查手机 PDF 或图片内容，也不要求把 signed_form.pdf 复制到第二台 Linux；它只评分一条报告记录和目标 ZIP 的不存在。PDF/照片细节是帮助人工确认输入含义，实际 missing 判断依赖 manifest 的 required 列和手机文件名清单。

## 6. Cleanup

- 第一台 Linux 删除 manifest。
- 第二台 Linux 删除 report 与 ZIP（如果错误创建），并清理空目录。
- 手机删除三个可能的 evidence 文件并尝试移除 evidence 目录。
