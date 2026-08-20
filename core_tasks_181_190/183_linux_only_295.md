# Core 183 — `linux_only_295`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 183 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_295.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的 JSON 明确规定：补丁 ZIP 只打包第二台机器项目目录里的 `normalizer.py` 和 `test_output.txt`，而且 ZIP 内必须直接使用这两个根级文件名。缓存目录和未列入清单的 `scratch.txt` 都不能进 ZIP，但需要在旁边的 CSV 中逐项说明为什么排除。

最终在 `linux_1` 创建：

```text
/tmp/patch/patch_bundle.zip
/tmp/patch/bundle_manifest.csv
```

ZIP 内只有两个文件；CSV 则有五条 disposition，覆盖两个 included 项、两个 cache 排除项和一个 unlisted 排除项。

## 1. Instruction

### 英文原文（逐字）

```text
I need a patch bundle created. Use `patch_manifest.json` on the first Linux machine, including its archive-path and bundle-manifest rules, to package the selected source and test output from the second into `/tmp/patch/patch_bundle.zip`, and write `/tmp/patch/bundle_manifest.csv`.
```

### 中文翻译

我需要创建一个补丁包。请使用第一台 Linux 机器上的 `patch_manifest.json`，包括其中关于归档路径和包清单的规则，把第二台机器上选定的源代码和测试输出打包到 `/tmp/patch/patch_bundle.zip`，并写出 `/tmp/patch/bundle_manifest.csv`。

## 2. 输入、附件与初始数据

本题没有短信、邮件或图片。输入是一个 JSON 规则文件、一个 Python 源文件、一个测试输出文本、一个未列入清单的文本，以及 Setup 动态生成的两个缓存占位文件。

### 2.1 `linux_0`：`patch_manifest.json`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_295/source/linux_0/tmp/patch/patch_manifest.json`
- 注入路径：`/tmp/patch/patch_manifest.json`
- 完整原文：

```json
{
  "include": [
    "normalizer.py",
    "test_output.txt"
  ],
  "exclude": [
    "__pycache__",
    ".pytest_cache",
    "scratch.txt"
  ],
  "archive_path_mode": "relative_to_project_root",
  "archive_members": [
    "normalizer.py",
    "test_output.txt"
  ],
  "bundle_manifest_schema": {
    "columns": [
      "file",
      "status"
    ],
    "statuses": {
      "included": "file is included in the patch archive",
      "excluded_cache": "cache directory is intentionally excluded",
      "excluded_unlisted": "unlisted file is intentionally excluded"
    }
  }
}
```

`relative_to_project_root` 的含义是：ZIP 内应该是 `normalizer.py`，而不是 `/tmp/patch/project/normalizer.py`、`project/normalizer.py` 或其他带目录前缀的名字。

### 2.2 `linux_1`：项目文件

#### `/tmp/patch/project/normalizer.py`

```python
def normalize(value):
    return value.strip().lower()
```

#### `/tmp/patch/project/test_output.txt`

```text
2 passed
```

#### `/tmp/patch/project/scratch.txt`

```text
scratch
```

`scratch.txt` 是真实存在的干扰文件，但 manifest 没把它列入 include，所以要排除并在 CSV 中标成 `excluded_unlisted`。

### 2.3 Setup 动态生成的缓存干扰项

第二台机器还会创建：

```text
/tmp/patch/project/__pycache__/normalizer.pyc
/tmp/patch/project/.pytest_cache/README.md
```

两个文件的字节内容都为：

```text
cache placeholder
```

末尾带换行。它们不是仓库附件，而是 Setup 用 shell 生成的真实缓存目录占位物。ZIP 中不能包含目录或其中的文件；CSV 中以目录名 `__pycache__`、`.pytest_cache` 各记录一次即可。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/patch`；
2. 删除并上传 `patch_manifest.json`。

### `linux_1`

1. 创建 `/tmp/patch/project`；
2. 删除并上传 `normalizer.py`；
3. 删除并上传 `test_output.txt`；
4. 创建 `__pycache__` 和 `.pytest_cache`，写入两个 `cache placeholder` 文件；
5. 删除并上传 `scratch.txt`；
6. 删除旧 `patch_bundle.zip`；
7. 删除旧 `bundle_manifest.csv`。

Setup 不会运行测试，也不会修改源文件；`test_output.txt` 已经是要原样打包的测试结果附件。

## 4. 正确输出

### 4.1 `patch_bundle.zip`

非目录成员必须精确为：

```text
normalizer.py
test_output.txt
```

每个成员的字节必须分别与 `/tmp/patch/project/normalizer.py`、`/tmp/patch/project/test_output.txt` 完全相同。

### 4.2 `bundle_manifest.csv`

推荐完整内容：

```csv
file,status
normalizer.py,included
test_output.txt,included
__pycache__,excluded_cache
.pytest_cache,excluded_cache
scratch.txt,excluded_unlisted
```

五行顺序可以变化，但列名、文件名和状态值不要改写。

## 5. Evaluator：评测方式与具体评测点

本题有 2 个计分 evaluator，默认各占 50%。ZIP 与 CSV 都要通过，整体才成功。

### 5.1 ZIP evaluator：成员名、数量和字节都检查

Python `zipfile` 打开 `/tmp/patch/patch_bundle.zip` 后，只收集非目录成员名。该列表必须是下面两种顺序之一：

```python
["normalizer.py", "test_output.txt"]
["test_output.txt", "normalizer.py"]
```

然后继续要求：

- 非目录成员总数精确为 2；
- 两个名字互不重复；
- `archive.read("normalizer.py")` 与当前项目源文件字节完全相同；
- `archive.read("test_output.txt")` 与当前测试输出字节完全相同。

因此：

- ZIP 压缩算法、时间戳和成员顺序不重要；
- 根路径名必须精确，`project/normalizer.py` 会失败；
- 改一个换行、重新格式化 Python、把 `2 passed` 改为 `2 tests passed` 都会因字节不同失败；
- 额外普通文件一定失败；
- 当前代码只把非目录项计入成员列表，单独的空目录 entry 不会进入这个列表，但 manifest 明确要求只打包两个成员，仍不应添加额外目录。

### 5.2 CSV evaluator：表头绝对匹配，数据行按集合匹配

Evaluator 用 `utf-8-sig` 读取 CSV，所以普通 UTF-8 或带 BOM 的 UTF-8 都可以。表头必须精确且按此顺序：

```python
["file", "status"]
```

以下表头都会失败：

```text
status,file
File,Status
file,status,reason
```

数据行 `.strip()` 后必须恰好形成下面 5 个唯一二元组：

```text
normalizer.py   | included
test_output.txt | included
__pycache__     | excluded_cache
.pytest_cache   | excluded_cache
scratch.txt     | excluded_unlisted
```

行顺序不限，但：

- 必须正好 5 行；
- 不能重复；
- 大小写和状态拼写是敏感的；
- 不能用 manifest 中的英文解释句代替状态代码。

### 5.3 两个产物相互独立评分

CSV evaluator 不会打开 ZIP 来验证 disposition 是否与实际成员一致；ZIP evaluator 也不读取 CSV。因此代码通过两份硬编码期望分别约束它们。要完整通过，两个文件都必须独立正确。

## 6. 当前 evaluator 没检查什么

- 不要求 ZIP 文件名之外的 metadata、注释或固定压缩级别；
- 不验证 `normalizer.py` 的函数行为，只验证打包字节等于输入源文件；
- 不在评测时读取 `patch_manifest.json`，期望成员和状态已写死；
- 不要求 CSV 行顺序；
- 不检查是否真的通过某个 GUI 创建压缩包。

## 7. 常见失败示例

- 用 `zip -r` 直接压缩整个 `project`：会包含 `project/` 前缀、缓存和 scratch，失败。
- ZIP 里只有正确两个文件，但 `normalizer.py` 被格式化过：字节比较失败。
- CSV 把缓存文件写成 `__pycache__/normalizer.pyc`：期望的是目录名 `__pycache__`，失败。
- CSV 使用 `excluded` 代替 `excluded_cache`：状态不精确，失败。
- CSV 正确但 ZIP 多一个 `scratch.txt`：ZIP 项失败，最多半分。

## 8. Cleanup

- `linux_0` 删除 `patch_manifest.json`；
- `linux_1` 删除三个上传文件、两个缓存占位文件、`patch_bundle.zip` 和 `bundle_manifest.csv`。

