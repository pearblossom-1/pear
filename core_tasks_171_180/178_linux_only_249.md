# Core 178 — `linux_only_249`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 178 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_249.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的 bug note 规定 approval code 必须严格是大写 `APP-` 加 4 个 ASCII 数字。第二台机器的旧实现过于宽松，需要修复 `validator.py`，运行随附的 12 项测试，并把输出保存为 `test_output.txt`。

一个直接正确的实现是：

```python
import re


def is_approval_code(value):
    if not isinstance(value, str):
        return False
    return re.fullmatch(r"APP-[0-9]{4}", value, flags=re.ASCII) is not None
```

然后在 `/tmp/form/app` 执行：

```text
python3 validator_tests.py > test_output.txt
```

预期输出为 `12 passed`。

## 1. Instruction

### 英文原文（逐字）

```text
The Python approval-code validator on the second Linux machine needs fixing. Use `bug_notes.md` on the first machine, update `/tmp/form/app/validator.py` on the second, then run the supplied `/tmp/form/app/validator_tests.py` there and save its console output as `/tmp/form/app/test_output.txt`.
```

### 中文翻译

第二台 Linux 机器上的 Python approval-code validator 需要修复。参考第一台机器上的 `bug_notes.md`，更新第二台机器的 `/tmp/form/app/validator.py`，然后在那里运行随附的 `/tmp/form/app/validator_tests.py`，并把控制台输出保存为 `/tmp/form/app/test_output.txt`。

## 2. 输入、附件与初始业务数据

### 2.1 `linux_0`：`bug_notes.md`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_249/source/linux_0/tmp/form/bug_notes.md`
- 注入路径：`/tmp/form/bug_notes.md`
- 完整原文：

```markdown
Approval code must be exactly APP- followed by four ASCII digits (0-9). Reject lowercase or mixed-case prefixes, the wrong number of digits, non-digits, Unicode lookalike digits, and surrounding whitespace.
```

中文含义：只能接受完全大写的 `APP-`，后接恰好四个 ASCII `0`–`9`；小写/混合大小写、位数错误、非数字、Unicode 相似数字和首尾空白都必须拒绝。

### 2.2 `linux_1`：初始 `validator.py`

- 注入路径：`/tmp/form/app/validator.py`
- 完整原文：

```python
import re


def is_approval_code(value):
    return re.fullmatch(r"app-\d{3,4}", str(value), flags=re.IGNORECASE) is not None
```

它的问题很具体：

- `re.IGNORECASE` 错误接受 `app-1234`、`App-1234`；
- `{3,4}` 错误接受三位数字；
- `\d` 会接受不少 Unicode 数字；
- `str(value)` 会把非字符串强制转成字符串，而规则要求非字符串直接拒绝。

### 2.3 `linux_1`：`validator_tests.py`

- 注入路径：`/tmp/form/app/validator_tests.py`
- 完整原文：

```python
import importlib.util
from pathlib import Path


CASES = [
    ("APP-0000", True),
    ("APP-1234", True),
    ("APP-9999", True),
    ("app-1234", False),
    ("App-1234", False),
    ("APP-123", False),
    ("APP-12345", False),
    ("APP-12A4", False),
    (" APP-1234", False),
    ("APP-1234 ", False),
    ("APP-１２３４", False),
    (1234, False),
]


def load_validator():
    path = Path(__file__).with_name("validator.py")
    spec = importlib.util.spec_from_file_location("approval_validator", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.is_approval_code


def main():
    check = load_validator()
    failures = [
        repr(value)
        for value, expected in CASES
        if check(value) is not expected
    ]
    if failures:
        print("failed values: " + ", ".join(failures))
        raise SystemExit(1)
    print(f"{len(CASES)} passed")


if __name__ == "__main__":
    main()
```

### 2.4 资产目录里存在、但本任务 Setup 没有上传的旧文件

资产目录还含 `form.html`、`tests.py`、`validator.js`。它们是旧的 JavaScript 版本材料，但当前 task JSON 的 Setup 只上传 `validator.py` 和 `validator_tests.py`；运行环境里不能把这三份仓库文件当成本题附件。当前 evaluator 也只导入 Python 文件。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/form`；
2. 删除旧 bug note；
3. 上传 `bug_notes.md`。

### `linux_1`

1. 创建 `/tmp/form/app`；
2. 删除并上传初始 `validator.py`；
3. 删除并上传 `validator_tests.py`；
4. 删除旧 `test_output.txt`。

## 4. 正确输出

需要同时完成：

1. 修复 `/tmp/form/app/validator.py` 中可调用的 `is_approval_code`；
2. 生成非空 `/tmp/form/app/test_output.txt`，其中有独立一行：

```text
12 passed
```

Oracle 使用第 0 节的正则实现，并实际运行随附测试生成输出。

## 5. Evaluator：评测方式与具体评测点

本任务有 2 个计分 evaluator，默认各占一半。两个都成功才算任务通过。

### 5.1 主 evaluator：直接导入并调用函数

评测脚本通过 `importlib` 从固定路径导入 `validator.py`，取得 `is_approval_code`。导入异常、没有函数、函数不可调用、任一测试调用抛异常，都会返回 `missing`。

#### 所有 10,000 个合法代码

Evaluator 生成：

```text
APP-0000
APP-0001
...
APP-9999
```

共 10,000 个字符串，每一个调用结果都必须是单例布尔值 `True`，代码使用的是 `check(value) is True`，仅返回 truthy 的 `1` 或自定义对象不够。

#### 22 个明确非法值

以下每一个都必须返回单例布尔值 `False`：

```python
None
True
False
1234
12.34
b"APP-1234"
""
"APP-"
"APP-00000"
"APP-123"
"APP-12A4"
"app-1234"
"App-1234"
" APP-1234"
"APP-1234 "
"XAPP-1234"
"APP-1234X"
"APP-１２３４"   # 全角数字
"APP-١٢٣٤"     # 阿拉伯-印度数字
"APP-１２34"   # 混合 Unicode/ASCII 数字
"APP-0000\n"
"ＡＰＰ-1234"  # 全角前缀
```

这里同样使用 `is False`，不是普通 falsy 判断。

#### 实际边界

- 不比较源代码文本、正则写法或文件哈希；行为正确即可；
- 合法空间被 10,000 项完整枚举；非法空间不是数学上的全部字符串，而是上述 22 个高价值反例；
- 不能只修改随附测试来“让它绿”，主 evaluator 独立导入 `validator.py` 并运行更完整的用例。

### 5.2 第二 evaluator：测试输出文本

Shell 条件是：

```text
test -s /tmp/form/app/test_output.txt
grep -Eq '^12[[:space:]]+passed$' /tmp/form/app/test_output.txt
```

含义：

- 文件必须存在且非空；
- 至少有一整行是 `12`、一个或多个空白、`passed`；
- 该行开头不能有额外字符，`passed` 后也不能有额外字符；
- 文件可以还有其他行，因为 grep 会逐行查找；
- evaluator 不验证文件创建时间、测试进程退出码或这行是否真由测试程序生成。

所以手写 `12 passed` 可以骗过第二项，但骗不过第一项的实际函数行为检查。按 instruction 正常运行测试即可同时满足。

### 5.3 当前 evaluator 没检查什么

- 不要求使用 `re`，手写长度/字符判断也可以；
- 不检查 bug note 或测试文件是否被修改；
- 不检查 `validator.py` 对上述集合之外所有可能输入的行为；
- 不检查 stdout 之外的 stderr，也不要求 `test_output.txt` 只能有一行。

## 6. 常见失败示例

- `re.fullmatch(r"APP-\d{4}", value)`：Python `\d` 仍接受 Unicode 数字，失败。
- `value.upper()` 后再匹配：会错误接受小写或混合前缀，失败。
- 函数返回 `1`/`0`：虽然真假性正确，但不是 `is True`/`is False`，失败。
- 函数正确但忘记生成 `test_output.txt`：主项通过、输出项失败，任务失败。
- 只把输出文件写成 `9 passed`：正则不匹配，失败。

## 7. Cleanup

- `linux_0` 删除 bug note；
- `linux_1` 删除 `validator.py`、`validator_tests.py` 和 `test_output.txt`。

