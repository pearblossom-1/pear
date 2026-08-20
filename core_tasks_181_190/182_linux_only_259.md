# Core 182 — `linux_only_259`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 182 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_259.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的 CSV 是函数规格，第二台 Linux 有一份故意写坏的 `index_images.py` 和 10 项公开测试。需要修复三个函数行为：

1. `include(path)`：只接收 png/jpg/jpeg，扩展名大小写不敏感；
2. `label_for(path)`：取文件 basename，去掉扩展名，再去掉末尾的 `_宽x高`；
3. `row_for(path, width, height)`：返回包含 `file`、`width`、`height`、`label` 的精确字典。

最后要真实运行 `tests.py`，把控制台输出保存为 `test.log`。仅伪造 `10 passed` 不够，因为另一个 evaluator 会直接导入修复后的模块并跑更广的隐藏行为用例。

## 1. Instruction

### 英文原文（逐字）

```text
The media catalog import is blocked by the image-index helper on the second Linux machine. Use `/tmp/img/spec.csv` on the first machine to repair `/tmp/img/project/index_images.py`, run the supplied `/tmp/img/project/tests.py`, and save its console output as `/tmp/img/project/test.log`.
```

### 中文翻译

第二台 Linux 机器上的图片索引辅助程序阻塞了媒体目录导入。请使用第一台机器上的 `/tmp/img/spec.csv` 修复 `/tmp/img/project/index_images.py`，运行随附的 `/tmp/img/project/tests.py`，并把它的控制台输出保存为 `/tmp/img/project/test.log`。

## 2. 输入、附件与初始代码

本题没有短信、邮件或真实图片。输入附件是一份 CSV 规格和两份 Python 文件。

### 2.1 `linux_0`：`spec.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_259/source/linux_0/tmp/img/spec.csv`
- 注入路径：`/tmp/img/spec.csv`
- 完整原文：

```csv
requirement,value
supported_extensions,png|jpg|jpeg
extension_matching,case_insensitive
index_columns,file|width|height|label
label_rule,basename_without_extension_and_trailing_width_x_height
```

通俗解释：

- 支持 `.png`、`.jpg`、`.jpeg`；
- `.JPG`、`.Jpeg` 等大小写变化也要支持；
- 不能因为文件名中间出现 `.png` 就接收，例如 `fake.png.txt` 最终扩展名是 `.txt`，必须拒绝；
- label 只看文件名，不保留目录；
- label 末尾若是 `_400x200` 这种尺寸后缀，要一起去掉。

### 2.2 `linux_1`：初始 `index_images.py`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_259/source/linux_1/tmp/img/project/index_images.py`
- 注入路径：`/tmp/img/project/index_images.py`
- 完整原文：

```python
def label_for(path):
    return path.split('.')[0]

def include(path):
    return True
```

初始问题：

- `include()` 对任何文件都返回 `True`；
- `label_for()` 从第一个点号切开，会破坏 `archive.photo_123x45.PNG`，也保留路径前缀；
- 完全缺少 `row_for()`，所以公开测试在 import 阶段就会失败。

### 2.3 `linux_1`：随附 `tests.py`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_259/source/linux_1/tmp/img/project/tests.py`
- 注入路径：`/tmp/img/project/tests.py`
- 完整原文：

```python
from index_images import include, label_for, row_for


CASES = [
    (include("asset_a.png"), True),
    (include("PHOTO.JPG"), True),
    (include("scan.Jpeg"), True),
    (include("notes.txt"), False),
    (include("fake.png.txt"), False),
    (include("no_extension"), False),
    (label_for("kitchen_400x200.png"), "kitchen"),
    (label_for("/incoming/north_gate_640x480.JPG"), "north_gate"),
    (label_for("portrait.jpeg"), "portrait"),
    (row_for("/incoming/north_gate_640x480.JPG", 640, 480), {
        "file": "/incoming/north_gate_640x480.JPG",
        "width": 640,
        "height": 480,
        "label": "north_gate",
    }),
]


def main():
    failures = [str(index) for index, pair in enumerate(CASES, 1) if pair[0] != pair[1]]
    if failures:
        print("failed cases: " + ", ".join(failures))
        raise SystemExit(1)
    print(f"{len(CASES)} passed")


if __name__ == "__main__":
    main()
```

公开测试成功时输出：

```text
10 passed
```

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/img`；
2. 删除并上传 `spec.csv`。

### `linux_1`

1. 创建 `/tmp/img/project`；
2. 删除并上传坏掉的 `index_images.py`；
3. 删除并上传 `tests.py`；
4. 删除旧 `test.log`。

任务开始时没有图片目录，也不要求建立实际索引文件；评测目标只是修复模块函数并留下测试运行证据。

## 4. 正确实现的形状

下面是符合规格的一种实现思路，不要求逐字相同：

```python
import os
import re


def include(path):
    return os.path.splitext(path)[1].lower() in {".png", ".jpg", ".jpeg"}


def label_for(path):
    basename = os.path.basename(path)
    stem = os.path.splitext(basename)[0]
    return re.sub(r"_\d+x\d+$", "", stem)


def row_for(path, width, height):
    return {
        "file": path,
        "width": width,
        "height": height,
        "label": label_for(path),
    }
```

然后在 `/tmp/img/project` 下运行 `tests.py`，把标准输出保存到：

```text
/tmp/img/project/test.log
```

日志中必须有一整行 `10 passed`。

## 5. Evaluator：评测方式与具体评测点

本题有 2 个计分 evaluator，默认等权：直接函数行为占 50%，`test.log` 占 50%。整体成功要求两项都通过。

### 5.1 行为 evaluator 会直接导入你的 Python 文件

Evaluator 使用 `importlib` 从固定路径导入：

```text
/tmp/img/project/index_images.py
```

导入时报语法错误、抛异常，或缺少任一函数，都会整项失败。它不会调用公开的 `tests.py`，而是自己执行 15 个检查。

### 5.2 `include()` 的 6 个隐藏检查

| 输入 | 必须返回 |
|---|---|
| `asset.png` | `True` |
| `PHOTO.JPG` | `True` |
| `scan.Jpeg` | `True` |
| `notes.txt` | `False` |
| `fake.png.txt` | `False` |
| `map.gif` | `False` |

代码使用的是 `module.include(name) is expected`，所以返回值必须是真正的布尔单例 `True`/`False`。返回整数 `1` 或 `0` 虽然 truthy/falsy 相同，但 `1 is True` 为假，会失败。

### 5.3 `label_for()` 的 6 个精确字符串检查

| 输入 | 精确期望 |
|---|---|
| `/drop/kitchen_400x200.png` | `kitchen` |
| `/drop/north_gate_640x480.JPG` | `north_gate` |
| `portrait.jpeg` | `portrait` |
| `/drop/archive.photo_123x45.PNG` | `archive.photo` |
| `site.v2_99x101.jpeg` | `site.v2` |
| `a.b.c_7x11.jpg` | `a.b.c` |

这些返回值用 Python 字符串 `==` 精确比较，大小写和路径残留都会影响结果。中间的点号必须保留，只有最后扩展名和最后一个尺寸后缀要移除。

### 5.4 `row_for()` 的 3 个精确字典检查

Evaluator 调用：

```python
row_for("north_gate_640x480.JPG", 640, 480)
row_for("archive.photo_123x45.PNG", 123, 45)
row_for("tiny.v3_7x11.jpeg", 7, 11)
```

分别必须等于：

```python
{"file": "north_gate_640x480.JPG", "width": 640, "height": 480, "label": "north_gate"}
{"file": "archive.photo_123x45.PNG", "width": 123, "height": 45, "label": "archive.photo"}
{"file": "tiny.v3_7x11.jpeg", "width": 7, "height": 11, "label": "tiny.v3"}
```

字典键顺序不重要，但键和值必须精确；多一个键也会导致字典不相等。`file` 要保留传入的原字符串，不能擅自只留 basename。

### 5.5 `test.log` evaluator 是行级正则

它先要求日志存在且非空，然后执行相当于：

```regex
^10[[:space:]]+passed$
```

也就是日志中至少有一整行：数字 `10`、一个或多个空白、单词 `passed`。标准输出 `10 passed` 正好通过。

日志允许有其他行；Evaluator 不检查测试进程的退出码，也不确认日志生成时间。但函数行为有独立 evaluator，所以伪造日志不能掩盖错误代码。

### 5.6 公开测试与隐藏行为的关系

- 公开 `tests.py` 有 10 项，并额外检查 `no_extension=False`；
- 直接行为 evaluator 不检查 `no_extension`，但增加了 `map.gif`、多点文件名和更多 `row_for`；
- 要两项都通过，最简单就是按 `spec.csv` 做通用实现，而不是只为某几个字符串硬编码。

## 6. 当前 evaluator 没检查什么

- 不检查代码风格、函数注释或具体算法；
- 不要求使用 Pillow，也不读取真实图片尺寸；`width`、`height` 只是传入参数；
- 不检查 `test.log` 是否同时包含 stderr；
- 不在评测时重新读取 `spec.csv` 或公开 `tests.py`，隐藏期望已经写在 evaluator 中；
- 不要求创建媒体索引 CSV/JSON，只有模块与日志是输出。

## 7. 常见失败示例

- 使用 `path.lower().endswith(("png", "jpg", "jpeg"))`：可能把没有点号的 `notjpg` 误判；应检查最终扩展名。
- 用 `path.split(".")[0]`：会丢掉 `archive.photo` 中的 `.photo`，也保留目录。
- `include()` 返回 `1`/`0`：布尔身份检查失败。
- `row_for()` 把 `file` 改成 basename：隐藏字典比较失败。
- 日志写 `All 10 tests passed`：没有一整行精确形状 `10 passed`，日志项失败。
- 代码正确但忘记生成 `test.log`：只能得到行为项的半分，整体仍失败。

## 8. Cleanup

- `linux_0` 删除 `spec.csv`；
- `linux_1` 删除修复后的 `index_images.py`、`tests.py` 和 `test.log`。

