# Core 188 — `linux_only_251`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 188 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_251.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第二台 Linux 的 `merge_config.py` 把优先级写反了，而且只做浅层 `dict.update()`。第一台 Linux 的规格要求按：

```text
base < environment < override
```

逐层深度合并。字典对字典要递归；后层的 `None` 表示删除键；列表、标量或类型发生变化时，后层值整体替换前层值；三个输入对象都不能被修改。

修好后运行公开 `tests.py`，把 `7 passed` 保存到 `test.txt`。隐藏 evaluator 会额外执行更复杂的 4 组递归与类型替换用例。

## 1. Instruction

### 英文原文（逐字）

```text
The deployment config merger on the second Linux machine is applying layers in the wrong order. Use `/tmp/config/spec.json` on the first machine to repair `/tmp/config/project/merge_config.py`, run the supplied `/tmp/config/project/tests.py`, and save its console output as `/tmp/config/project/test.txt`.
```

### 中文翻译

第二台 Linux 机器上的部署配置合并器正在以错误顺序应用配置层。请使用第一台机器上的 `/tmp/config/spec.json` 修复 `/tmp/config/project/merge_config.py`，运行随附的 `/tmp/config/project/tests.py`，并把它的控制台输出保存为 `/tmp/config/project/test.txt`。

## 2. 输入、附件与初始代码

本题没有短信、邮件或媒体附件。

### 2.1 `linux_0`：`spec.json`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_251/source/linux_0/tmp/config/spec.json`
- 注入路径：`/tmp/config/spec.json`
- 完整原文：

```json
{"order":["base","environment","override"],"override_null":"remove_key","nested":"preserve_and_merge"}
```

含义：

- base 最低优先级；
- environment 覆盖 base；
- override 最高，覆盖前两层；
- 后层 `null`/Python `None` 删除对应键；
- 嵌套字典不能整块丢弃，要保留未被覆盖的子键并递归合并。

### 2.2 `linux_1`：初始 `merge_config.py`

```python
def merge(base, environment, override):
    result = dict(override)
    result.update(environment)
    result.update(base)
    return result
```

初始代码的问题：

- 最后 `update(base)`，导致 base 反而最高优先级；
- 对嵌套字典只做浅替换；
- 不处理 `None` 删除；
- 虽然顶层 result 是新字典，但嵌套对象仍可能与输入共享引用。

### 2.3 `linux_1`：随附 `tests.py`

完整原文：

```python
from merge_config import merge


def main():
    base = {"debug": True, "db": {"host": "base", "port": 1}, "keep": "yes"}
    environment = {"db": {"host": "env", "pool": 4}, "region": "west"}
    override = {"debug": None, "db": {"port": 9}, "region": "east"}
    merged = merge(base, environment, override)
    cases = [
        (merged.get("debug", "missing"), "missing"),
        (merged["db"], {"host": "env", "port": 9, "pool": 4}),
        (merged["region"], "east"),
        (merged["keep"], "yes"),
        (base["db"], {"host": "base", "port": 1}),
        (merge({"a": {"b": 1}}, {}, {"a": {"b": None}}), {"a": {}}),
        (merge({"mode": "base"}, {"mode": "env"}, {}), {"mode": "env"}),
    ]
    failures = [str(index) for index, pair in enumerate(cases, 1) if pair[0] != pair[1]]
    if failures:
        print("failed cases: " + ", ".join(failures))
        raise SystemExit(1)
    print(f"{len(cases)} passed")


if __name__ == "__main__":
    main()
```

成功时输出：

```text
7 passed
```

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/config`；
2. 删除并上传 `spec.json`。

### `linux_1`

1. 创建 `/tmp/config/project`；
2. 删除并上传错误版 `merge_config.py`；
3. 删除并上传 `tests.py`；
4. 删除旧 `test.txt`。

## 4. 正确实现应满足的算法

一种稳妥做法是：

1. 深拷贝 base 作为新结果；
2. 递归应用 environment；
3. 再递归应用 override；
4. 后层值为 `None` 时从当前字典删除该键；
5. 当前值和后层值都是 dict 时递归；
6. 其他情况用后层值的深拷贝整体替换。

伪代码：

```python
def apply_layer(target, layer):
    for key, value in layer.items():
        if value is None:
            target.pop(key, None)
        elif isinstance(value, dict) and isinstance(target.get(key), dict):
            apply_layer(target[key], value)
        else:
            target[key] = deepcopy(value)
```

最后真实运行公开测试并把输出写到：

```text
/tmp/config/project/test.txt
```

## 5. Evaluator：评测方式与具体评测点

本题有 2 个计分 evaluator，默认各占 50%：隐藏函数行为与测试日志各一半。

### 5.1 行为 evaluator 会直接导入并调用 `merge`

它从固定路径导入修复后的模块。语法错误、import 副作用异常、缺少 `merge` 都会失败。随后执行下面 4 组完整用例，每组还会深拷贝输入，调用后确认三个输入完全没变。

### 5.2 隐藏用例 1：基本优先级、递归合并和顶层删除

输入：

```python
base = {
    "debug": True,
    "db": {"host": "base", "port": 1},
    "keep": "yes",
}
environment = {
    "db": {"host": "env", "pool": 4},
    "region": "west",
}
override = {
    "debug": None,
    "db": {"port": 9},
    "region": "east",
}
```

精确期望：

```python
{
    "db": {"host": "env", "port": 9, "pool": 4},
    "keep": "yes",
    "region": "east",
}
```

解释：`debug` 被删除；db.host 取 environment，db.port 取 override，db.pool 保留 environment；region 取 override；keep 保留 base。

### 5.3 隐藏用例 2：多层嵌套、列表替换、标量变字典

输入：

```python
base = {
    "service": {"db": {"host": "base", "options": {"ssl": False, "timeout": 10}}},
    "features": ["base"],
    "mode": "base",
}
environment = {
    "service": {"db": {"options": {"ssl": True}, "pool": 4}},
    "features": ["environment"],
}
override = {
    "service": {"db": {"host": "override", "options": {"timeout": None}}},
    "features": ["override"],
    "mode": {"kind": "safe"},
}
```

精确期望：

```python
{
    "service": {
        "db": {
            "host": "override",
            "options": {"ssl": True},
            "pool": 4,
        }
    },
    "features": ["override"],
    "mode": {"kind": "safe"},
}
```

重点：

- `timeout=None` 只删除 timeout，不能删掉整个 options；
- list 不做拼接，最高层列表整体替换；
- base 的字符串 mode 可以被最高层字典整体替换。

### 5.4 隐藏用例 3：深层 `None` 删除但保留兄弟键

```python
merge(
    {"a": {"b": {"c": 1, "keep": 2}}},
    {},
    {"a": {"b": {"c": None}}},
)
```

必须得到：

```python
{"a": {"b": {"keep": 2}}}
```

### 5.5 隐藏用例 4：类型不断变化时最后一层整体获胜

```python
merge(
    {"value": {"nested": 1}},
    {"value": ["replacement"]},
    {"value": "final"},
)
```

必须得到：

```python
{"value": "final"}
```

不能试图把 dict、list、string 进行某种混合合并。

### 5.6 每一组都检查输入未被修改

Evaluator 在调用前对 `(base, environment, override)` 做 `copy.deepcopy()`，调用后要求原三个对象与拷贝仍完全相等。

所以即使返回结果正确，只要函数：

- 在 base 上原地写入；
- `pop()` 了 environment/override；
- 复用嵌套引用，随后改动导致输入变化；

都会失败。返回值中的嵌套 list/dict 最好也来自深拷贝。

### 5.7 `test.txt` 是非空文件加整行正则

日志必须存在且非空，并至少有一整行匹配：

```regex
^7[[:space:]]+passed$
```

标准的 `7 passed` 通过。额外输出行允许；Evaluator 不检查测试进程退出码或日志时间，但独立行为项会阻止错误实现靠伪造日志满分。

## 6. 当前 evaluator 没检查什么

- 不要求使用特定函数拆分、递归写法或 `copy.deepcopy` 本身，只看行为；
- 不评测非常规对象、自定义 Mapping、循环引用或 JSON 之外的特殊类型；
- 不检查测试日志与代码运行之间的因果关系；
- 不在评分时读取 `spec.json` 或公开测试文件；
- 不要求输出合并后的配置文件，只有修复代码和日志。

## 7. 常见失败示例

- `result = base | environment | override`：顶层优先级对，但仍是浅合并，嵌套 db/options 用例失败。
- 遇到任何 `None` 就返回空字典：会误删兄弟键。
- 列表用 `extend()` 合并：期望是最高层列表整体替换。
- 在 base 上递归修改：返回可能正确，但输入未变检查失败。
- 日志写 `All 7 tests passed`：没有精确的一整行 `7 passed`，日志项失败。

## 8. Cleanup

- `linux_0` 删除 `spec.json`；
- `linux_1` 删除修复代码、公开测试和 `test.txt`。

