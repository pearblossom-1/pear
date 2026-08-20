# Core 172 — `android_only_274`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 172 项
- 任务文件：`tasks/cross_device/android_only/android_only_274.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：hard
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机有一张文件分拣清单。第二台手机的 `Download/incoming` 中只有前三个文件，第四个 `missing_gamma.txt` 根本不存在。正确结果是：

| 清单文件 | 规则 | 实际动作/状态 |
|---|---|---|
| `keep_alpha.txt` | keep | 移到 `Download/Keep` |
| `review_beta.txt` | review | 移到 `Download/Review` |
| `skip_notes.txt` | skip | 留在 `Download/incoming` |
| `missing_gamma.txt` | review | 文件缺失，不创建；在总结中写 missing |

同时要在第二台手机创建精确路径为 `Sort summary.md` 的 Markor 笔记，四个文件最好各写一行。

## 1. Instruction

### 英文原文（逐字）

```text
`sort_manifest.csv` on the first phone defines keep, review, and skip rules. Sort the available files from Download/incoming on the second phone into Keep and Review. Leave a `Sort summary` note in Markor for the intake coordinator, listing every manifest filename and whether it was moved, left in incoming, or missing.
```

### 中文翻译

第一台手机上的 `sort_manifest.csv` 定义了 keep、review 和 skip 规则。把第二台手机 `Download/incoming` 中实际存在的文件分拣到 Keep 和 Review。然后在 Markor 中给接收协调员留一份 `Sort summary` 笔记，列出清单中的每个文件名，并说明它是已移动、仍留在 incoming，还是缺失。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。输入是第一台手机的 CSV 附件，以及第二台手机预置的三个文本文件。

### 2.1 `android_0`：`sort_manifest.csv`

- 仓库文件：`tasks/cross_device/android_only_assets/android_only_274/android_0/files/sort_manifest.csv`
- 注入路径：`/sdcard/Download/sort_manifest.csv`
- 完整原文：

```csv
filename,action
keep_alpha.txt,keep
review_beta.txt,review
skip_notes.txt,skip
missing_gamma.txt,review
```

### 2.2 `android_1`：incoming 初始文件

| 路径 | 完整内容 |
|---|---|
| `/sdcard/Download/incoming/keep_alpha.txt` | `alpha` 加结尾换行 |
| `/sdcard/Download/incoming/review_beta.txt` | `beta` 加结尾换行 |
| `/sdcard/Download/incoming/skip_notes.txt` | `skip` 加结尾换行 |

`missing_gamma.txt` 不会被 Setup 创建。`Download/Keep` 和 `Download/Review` 目录会预先建立，但目标文件会先被删除，避免继承旧结果。

### 2.3 预期输出笔记

目标路径严格为：

```text
/storage/emulated/0/Documents/Markor/Sort summary.md
```

Setup 会先删除旧的同名笔记，不会预置正文。

## 3. Setup 具体流程

### `android_0`

1. 确保 Files 可用；
2. 还执行了 `ensure_app: markor`；
3. 上传 `sort_manifest.csv` 到 Download 根目录。

### `android_1`

1. 确保 Files 可用；
2. 创建 `incoming`、`Keep`、`Review` 三个目录；
3. 删除三个 incoming 目标、两个正确输出、错误的 `Review/missing_gamma.txt` 以及旧 `Sort summary.md`；
4. 重新写入内容为 `alpha`、`beta`、`skip` 的三个 incoming 文件。

一个需要注意的配置事实：JSON 把 `ensure_app: markor` 放在了 `android_0`，而笔记输出实际要求在 `android_1`。`android_1` 的 Setup 没有显式 ensure Markor，只通过 shell 清理其 Markor 路径；文档这里按真实配置记录，不把它误写成“第二台手机已显式确保 Markor”。

## 4. 正确输出

文件最终应为：

```text
/sdcard/Download/Keep/keep_alpha.txt       内容 alpha
/sdcard/Download/Review/review_beta.txt    内容 beta
/sdcard/Download/incoming/skip_notes.txt   内容 skip
```

以下路径应不存在：

```text
/sdcard/Download/incoming/keep_alpha.txt
/sdcard/Download/incoming/review_beta.txt
/sdcard/Download/Review/missing_gamma.txt
```

Oracle 笔记正文为：

```text
keep_alpha.txt: moved to Keep
review_beta.txt: moved to Review
skip_notes.txt: left in incoming
missing_gamma.txt: missing
```

## 5. Evaluator：评测方式与具体评测点

本任务有 2 个计分 evaluator，默认各占一半。总分是两项平均值，而任务 `success` 要求两项都成功。

### 5.1 文件分拣结果

第一个 evaluator 在 `android_1` 执行一段 shell，只有下列条件全部成立才输出 `present`：

1. `incoming/keep_alpha.txt` 不存在；
2. `incoming/review_beta.txt` 不存在；
3. `Keep/keep_alpha.txt` 的命令替换结果精确等于 `alpha`；
4. `Review/review_beta.txt` 的命令替换结果精确等于 `beta`；
5. `incoming/skip_notes.txt` 的命令替换结果精确等于 `skip`；
6. `Review/missing_gamma.txt` 不存在。

shell 的 `$(cat ...)` 会去掉结尾换行，所以正常的 `alpha\n`、`beta\n`、`skip\n` 可以通过；正文中有其他字符或额外非尾部行则会失败。

实际边界：

- 不检查目录中是否还有其他无关文件；
- 不检查 `keep_alpha.txt` 是否又被复制到 Review 等未列路径；
- 只检查 `missing_gamma.txt` 没出现在 `Review`，并不全盘搜索它是否被错误创建在其他目录；
- 不检查第一台手机的 CSV 是否仍存在。

### 5.2 `Sort summary.md` 的语义关系

第二个 evaluator `cat` 精确路径 `/storage/emulated/0/Documents/Markor/Sort summary.md`，再把正文交给关系 scorer。它不是整篇逐字等于 oracle，但要求很具体。

#### 四个文件名

下面四个实体都必须出现，而且 `unique_entities: true` 要求各只匹配一次：

- `keep_alpha.txt`
- `review_beta.txt`
- `skip_notes.txt`
- `missing_gamma.txt`

大小写不敏感，并按词/文件名边界匹配。正文中任何额外的 `*.txt` 文件名都会被 `reject_unlisted_entity_pattern` 拒绝。

#### 每个文件与状态必须在同一个 clause 中

关系规则要求：

1. `keep_alpha.txt` 所在 clause 同时含 `moved to Keep` 或 `in Keep`，且不能含 `not moved` 或 `Review`；
2. `review_beta.txt` 所在 clause 同时含 `moved to Review` 或 `in Review`，且不能含 `not moved` 或 `Keep`；
3. `skip_notes.txt` 所在 clause 同时含 `incoming`、`skipped` 或 `left in incoming` 中至少一个，且不能含 `deleted` 或 `moved`；
4. `missing_gamma.txt` 所在 clause 同时含 `missing`、`absent` 或 `not found` 中至少一个，且不能含 `present` 或 `exists`。

Clause 会按分号、竖线、换行，或者句号/问号/感叹号后面的空白切分。四个文件各写一行最稳。如果把所有内容写成一个没有分隔符的长句，keep 的 clause 会同时看到 `Review`，review 的 clause 会同时看到 `Keep`，从而失败。

#### 全文冲突词

正文任何位置出现以下词组都会失败：

```text
not moved
deleted
present
wrong folder
cancelled
withdrawn
```

因此不要写 `missing_gamma.txt was not moved because it was missing`；虽然语义自然，但 `not moved` 是全局冲突词。

通用关系 scorer 还会拒绝问句、`maybe/perhaps` 等不确定表达，以及撤回/否定语义。

### 5.3 当前 evaluator 没检查什么

- 不检查笔记正文是否写了 `intake coordinator`；
- 不检查 Markdown 标题，`Sort summary` 主要由固定文件路径体现；
- 不要求四行顺序与 CSV 相同；
- 不要求正文逐字等于 oracle；
- 不会重新读取 CSV 推导动作，正确文件名和状态已经写死在 evaluator 中。

## 6. 常见失败示例

- `keep_alpha.txt in Keep; review_beta.txt in Review; skip_notes.txt moved nowhere and left in incoming; missing_gamma.txt missing`：含全局冲突词 `moved` 的 skip clause，失败。
- 只移动文件，不创建总结笔记：第一项通过、第二项失败，整个任务失败。
- 笔记正确但 `skip_notes.txt` 被删除：笔记项通过，文件项失败。
- 在总结末尾附加 `source: sort_manifest.txt`：出现未列出的 `.txt` 文件名，失败。

## 7. Cleanup

- `android_0` 删除 `/sdcard/Download/sort_manifest.csv`；
- `android_1` 删除三个 incoming 路径、两个正确输出、错误的 missing 输出和总结笔记；
- 尝试移除已经为空的 `incoming`、`Keep`、`Review` 目录。

