# Core 033 — `linux_android_1313`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 33 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1313.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Please build `/tmp/evidence/evidence_package.zip` on the second Linux machine from the approved package in the phone evidence manifest, the approval SMS, and the staged files on the first Linux machine. Include only the two selected evidence files and an `evidence_index.csv` with the manifest columns `package,filename,selected` and one `yes` row for each included evidence file; keep those three files at the ZIP root.
```

### 中文翻译

请根据手机上的 evidence manifest、批准短信和第一台 Linux 上的暂存文件，在第二台 Linux 创建 `/tmp/evidence/evidence_package.zip`。只包含两个被选中的证据文件和一个 `evidence_index.csv`；索引列必须是 `package,filename,selected`，每个纳入文件各有一行 `yes`。三个文件都要直接放在 ZIP 根目录。

## 2. 输入、附件与初始业务数据

手机 manifest 原文：

```csv
package,filename,selected
PKG-1313,form_a.pdf,yes
PKG-1313,photo_a.jpg,yes
PKG-0000,old_case.txt,no
```

批准短信来自 `5551201313`：

```text
Approval for PKG-1313 package.
```

第一台 Linux 暂存：

- `form_a.pdf`：一页 `PKG-1313 EVIDENCE INTAKE FORM`，明确要求包含 form_a.pdf 与 photo_a.jpg、排除无关/归档/替代文件，并核对源字节；
- `photo_a.jpg`：碎石路旁的围栏设施现场照片，可见灰色设备柜、电杆和乡村背景；
- `old_case.txt`：内容为 `old`，manifest 标成 no，不得纳入。

两个选中源文件的 evaluator 固定摘要分别为：

```text
form_a.pdf  16c00d9bfff6ed6314bdd6214bf7842796303e3bff645d8f2edd0913ad3893ee
photo_a.jpg 1df5dc21193dca3cd74e1e894c5ccc0d51bd2d066bc8d2038272caa708dfd3b1
```

## 3. Setup 具体流程

- `linux_0`：暂存两份正确证据和一个干扰文件。
- `android_0`：上传 evidence manifest。
- `android_1`：清空短信并注入 PKG-1313 批准消息。
- `linux_1`：创建输出目录并删除旧 ZIP。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个严格 ZIP evaluator。

### 4.0 先说人话：怎样才算通过

ZIP 根目录只能有 `form_a.pdf`、`photo_a.jpg`、`evidence_index.csv` 三项。索引内容只能是：

```csv
package,filename,selected
PKG-1313,form_a.pdf,yes
PKG-1313,photo_a.jpg,yes
```

### 4.1 精确检查

- ZIP namelist 长度必须正好为 3，且三项都不能位于子目录。
- 两个证据文件按摘要核对原始字节；同名替代文件不通过。
- CSV 可带 UTF-8 BOM，但列名与顺序必须精确为 `package,filename,selected`。
- 数据行正好两行，行顺序不敏感；selected 大小写不敏感地等于 yes。
- 任何额外目录、隐藏文件、`old_case.txt`、漏项或重复项都会失败。

