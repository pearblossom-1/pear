# Core 073 — `linux_android_1270`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 73 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1270.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与逐项比较

手机 Broccoli recipe 是需求侧，第一台 Linux pantry_plan.csv 是库存侧，第二台 Linux 承载结果 workbook。需要取两边 ingredient 的并集：beans 与 cilantro 数量一致；rice 数量不一致；lime 只在 pantry 中。

## 1. Instruction

### 英文原文（逐字）

```text
Compare the Broccoli recipe with `/tmp/pantry/pantry_plan.csv` and write `/tmp/pantry/recipe_check.xlsx` on the second Linux machine. Create one complete visible table with columns `ingredient`, `recipe_amount`, `pantry_amount`, and `status`; include every relevant ingredient exactly once.
```

### 中文翻译

比较 Broccoli recipe 与 `/tmp/pantry/pantry_plan.csv`，并在第二台 Linux 上写入 `/tmp/pantry/recipe_check.xlsx`。创建一张完整、可见的表格，列为 `ingredient`、`recipe_amount`、`pantry_amount`、`status`；每个相关 ingredient 恰好出现一次。

## 2. 输入、附件与初始业务数据

### 2.1 手机 Broccoli recipe

Setup 创建唯一 recipe：

```text
Title: Beans and Rice
Ingredients: beans 2 cups; rice 2 cups; cilantro 1 bunch
Directions: Cook together.
Preparation time: [empty]
```

### 2.2 第一台 Linux `pantry_plan.csv`

```csv
ingredient,normalized_qty
beans,2 cups
rice,1 cup
cilantro,1 bunch
lime,2
```

### 2.3 比较结论

- beans：recipe 2 cups；pantry 2 cups → matched。
- rice：recipe 2 cups；pantry 1 cup → quantity mismatch。
- cilantro：recipe 1 bunch；pantry 1 bunch → matched。
- lime：recipe 中没有；pantry 2 → pantry-only。

## 3. Setup 具体流程

### `linux_0`

- 删除旧 pantry_plan.csv，创建 `/tmp/pantry`。
- 上传 pantry_plan.csv；第一台 Linux 不生成输出。

### `linux_1`

- 删除旧 recipe_check.xlsx，创建 `/tmp/pantry`。
- 最终 workbook 必须在这台机器上创建。

### `android_0`

- 确保 Broccoli app 可用并清空 recipes。
- 添加 Beans and Rice recipe。

## 4. Evaluator：评测方式与具体评测点

本题只有 1 个 `check_xlsx_cells` evaluator，使用 logical-table contract。

### 4.1 目标表格

行顺序也应按下面保持：

| ingredient | recipe_amount | pantry_amount | status |
|---|---|---|---|
| beans | 2 cups | 2 cups | matched |
| rice | 2 cups | 1 cup | quantity mismatch |
| cilantro | 1 bunch | 1 bunch | matched |
| lime | missing | 2 | pantry-only |

### 4.2 Workbook 与表头

- 路径精确为第二台 Linux 的 `/tmp/pantry/recipe_check.xlsx`。
- 必须是能被 XLSX parser 打开的 workbook。
- 必须恰好找到一处完整、连续且位于可见 sheet/行/列的四列表头。
- 表头顺序必须是 ingredient、recipe_amount、pantry_amount、status；没有启用列重排。
- 表头行在这四列以外不能有其他非空 cell。

### 4.3 数据行

- 四行必须连续紧跟表头；遇到全空行即停止读取表格。
- 行内容必须与目标四行匹配，且由于 contract 未关闭默认顺序敏感，beans、rice、cilantro、lime 的顺序也要一致。
- 每行在四列外不能有其他非空 cell。
- 多行、漏行、重复 ingredient 或额外 dense table region 都会失败。
- 值比较会规范化空白并忽略大小写。

### 4.4 JSON 中声明但当前未生效的值别名

Task JSON 在 logical_table 内声明了这些 aliases：

- recipe_amount 的 missing：`N/A`、`not in recipe`、`none`、空 cell
- matched：`match`、`available`、`sufficient`、`same`
- quantity mismatch：`quantity_mismatch`、`mismatch`、`short`、`short by 1 cup`、`insufficient`
- pantry-only：`pantry only`、`extra in pantry`、`not in recipe`

但当前实际调用链 `check_xlsx_cells → _score_xlsx_logical_table` 没有读取 `value_aliases`；读取该字段的是另一套未被此 evaluator 调用的 flexible logical-table scorer。因此不能按 task JSON 表面断言这些 aliases 会通过。当前稳妥且与实现一致的要求是：四行全部使用目标表中的 canonical 值，尤其 lime 的 recipe_amount 必须写 `missing`，三个 status 分别写 `matched`、`quantity mismatch`、`pantry-only`。

## 5. 常见失败与评测边界

- 只写 recipe 中三项，漏掉 pantry-only lime：失败。
- 将 rice 写成 matched：状态和 pantry 数量关系错误。
- 使用 JSON 中列出的 `match`、`short` 或 `not in recipe` 等 alias：按当前实际 scorer 仍会因不等于 canonical 值而失败。
- 调换行次序：虽然 instruction 未强调排序，但当前 logical-table evaluator 默认 order-sensitive，会失败。
- 在表右侧加 notes cell：目标表格同一行外有非空内容，可能失败。
- 把结果创建在第一台 Linux：getter 只查看 linux_1。

Evaluator 检查 workbook 的单元格逻辑，不检查公式来源，也没有启用严格字体可读性、颜色或列宽评分；“complete visible table”主要通过 visible sheet/row/column 和唯一表头区域实现。正确 workbook 仍应实际把文字显示完整，而不是依赖这种格式宽松度。

## 6. Cleanup

- 第一台 Linux 删除 pantry_plan.csv。
- 第二台 Linux 删除 recipe_check.xlsx。
- 手机清空 Broccoli recipes；Linux 空目录随后清理。
