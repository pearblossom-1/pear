# Core 189 — `linux_only_327`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 189 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_327.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 40 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的 XLSX 有 8 条发布候选记录，其中只有两行 `approved=yes`：

```text
Alpha_Report_v2.pdf
Beta_Summary_v1.pdf
```

第二台 Linux 的源 ZIP 同时包含这两份 PDF、六份未批准 PDF 和一个 `notes.txt`。正确任务结果应当是：

1. 在第二台机器创建只含上述两份原始 PDF 的 `release_candidate.zip`；
2. 在第一台机器原工作簿的 E 列增加 `packaged`，两条批准且实际入包的行写 `yes`，其余六行写 `no`。

但是当前 evaluator 存在一个已经验证的实现缺陷：即使 ZIP 精确含这两份原始 PDF，归档评分函数仍返回 `0.0`。因此本任务在当前 worktree 中不能取得完整成功；工作簿项可以通过，但归档项会失败，理论最高数值分数是 0.5，整体 `success=false`。详细原因见 5.2。

## 1. Instruction

### 英文原文（逐字）

```text
Assemble `/home/user/releases/release_candidate.zip` on the second Linux machine from the approved rows in `/home/user/manifests/release_manifest.xlsx` on the first and the original files in `/home/user/incoming/reports_bundle.zip` on the second. Then add only a `packaged` column to the workbook, marking every row yes or no according to actual archive membership.
```

### 中文翻译

请根据第一台 Linux 机器上 `/home/user/manifests/release_manifest.xlsx` 中已批准的行，以及第二台机器上 `/home/user/incoming/reports_bundle.zip` 中的原始文件，在第二台机器组装 `/home/user/releases/release_candidate.zip`。然后只向该工作簿增加一个 `packaged` 列，根据文件是否实际属于归档，为每一行标记 yes 或 no。

## 2. 输入、附件与详细内容

本题没有短信或邮件。输入是一份 XLSX manifest 和一份包含 8 个 PDF 加 1 个说明文本的 ZIP。

### 2.1 `linux_0`：`release_manifest.xlsx`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_327/source/release_manifest.xlsx`
- 注入路径：`/home/user/manifests/release_manifest.xlsx`
- 工作表：只有 `Sheet1`，可见；使用区域 `A1:D9`；没有公式、合并单元格、冻结窗格、筛选器或隐藏工作表。
- 样式：所有源单元格都是默认 Calibri 11、General 格式，无填充、无边框和特殊对齐。

全部单元格数据：

| 行 | record_id | file_name | version | approved |
|---:|---|---|---|---|
| 1 | `record_id` | `file_name` | `version` | `approved` |
| 2 | R-201 | Alpha_Report_v2.pdf | v2 | yes |
| 3 | R-202 | Alpha_Report_v1.pdf | v1 | no |
| 4 | R-203 | Beta_Summary_v1.pdf | v1 | yes |
| 5 | R-204 | Beta_Summary_v2.pdf | v2 | no |
| 6 | R-205 | Gamma_Overview_v1.pdf | v1 | no |
| 7 | R-206 | Delta_Report_v1.pdf | v1 | no |
| 8 | R-207 | Gamma_Summary_v2.pdf | v2 | no |
| 9 | R-208 | Epsilon_Note_v1.pdf | v1 | no |

### 2.2 `linux_1`：`reports_bundle.zip`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_327/source/reports_bundle.zip`
- 注入路径：`/home/user/incoming/reports_bundle.zip`
- ZIP 中共有 9 个根级文件，无目录前缀。

#### 8 份 PDF 的完整可见正文

每份 PDF 都只有 1 页白色页面，左上方为较大标题，下面两行是 source file 和 `Review copy`；没有表格、图片、页眉或隐藏的额外业务内容。

| ZIP 成员 | 原始字节数 | 页面可见正文 |
|---|---:|---|
| `Alpha_Report_v2.pdf` | 1168 | `Alpha Report Version 2`；`Source file: Alpha_Report_v2.pdf`；`Review copy` |
| `Alpha_Report_v1.pdf` | 1168 | `Alpha Report Version 1`；`Source file: Alpha_Report_v1.pdf`；`Review copy` |
| `Beta_Summary_v1.pdf` | 1166 | `Beta Summary Version 1`；`Source file: Beta_Summary_v1.pdf`；`Review copy` |
| `Beta_Summary_v2.pdf` | 1166 | `Beta Summary Version 2`；`Source file: Beta_Summary_v2.pdf`；`Review copy` |
| `Gamma_Overview_v1.pdf` | 1188 | `Gamma Overview Version 1`；`Source file: Gamma_Overview_v1.pdf`；`Review copy` |
| `Delta_Report_v1.pdf` | 1169 | `Delta Report Version 1`；`Source file: Delta_Report_v1.pdf`；`Review copy` |
| `Gamma_Summary_v2.pdf` | 1186 | `Gamma Summary Version 2`；`Source file: Gamma_Summary_v2.pdf`；`Review copy` |
| `Epsilon_Note_v1.pdf` | 1186 | `Epsilon Note Version 1`；`Source file: Epsilon_Note_v1.pdf`；`Review copy` |

这里不能根据“版本越新越好”自行选择。例如 Beta v2 虽然版本号更高，但 manifest 明确批准的是 Beta v1。

#### `notes.txt`

字节数 71，完整原文：

```text
Release source bundle. Use the first-device manifest as authoritative.
```

它只是说明文件，不在 manifest 的八行文件记录中，也没有 approved=yes，因此不能进入发布候选 ZIP。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/home/user/manifests`；
2. 删除旧 `release_manifest.xlsx`；
3. 上传原始工作簿到同一路径。

### `linux_1`

1. 创建 `/home/user/incoming` 和 `/home/user/releases`；
2. 删除旧 `reports_bundle.zip` 和旧 `release_candidate.zip`；
3. 上传源 ZIP 到 `/home/user/incoming/reports_bundle.zip`。

工作簿会在原路径上被编辑；任务没有要求另存副本。源 ZIP 应保持不变，输出另写到 releases 目录。

## 4. 按 instruction 应生成的正确结果

### 4.1 `release_candidate.zip`

应该只有两个根级文件：

```text
Alpha_Report_v2.pdf
Beta_Summary_v1.pdf
```

两个文件必须从 `reports_bundle.zip` 原样复制，不能重新导出、重新打印 PDF 或改 metadata。

### 4.2 更新后的 `release_manifest.xlsx`

只增加 E 列：

| 单元格 | 精确值 |
|---|---|
| E1 | packaged |
| E2 | yes |
| E3 | no |
| E4 | yes |
| E5 | no |
| E6 | no |
| E7 | no |
| E8 | no |
| E9 | no |

完整逻辑表应成为：

| record_id | file_name | version | approved | packaged |
|---|---|---|---|---|
| R-201 | Alpha_Report_v2.pdf | v2 | yes | yes |
| R-202 | Alpha_Report_v1.pdf | v1 | no | no |
| R-203 | Beta_Summary_v1.pdf | v1 | yes | yes |
| R-204 | Beta_Summary_v2.pdf | v2 | no | no |
| R-205 | Gamma_Overview_v1.pdf | v1 | no | no |
| R-206 | Delta_Report_v1.pdf | v1 | no | no |
| R-207 | Gamma_Summary_v2.pdf | v2 | no | no |
| R-208 | Epsilon_Note_v1.pdf | v1 | no | no |

## 5. Evaluator：配置意图、实际实现与评测点

本题有 2 个默认计分 evaluator，按全局规则等权平均：归档 50%，工作簿 50%。

### 5.1 归档 evaluator 在配置层想检查什么

任务配置使用 `check_archive_contents`，声明两个精确成员：

```text
Alpha_Report_v2.pdf -> reports_bundle.zip 内同名成员
Beta_Summary_v1.pdf -> reports_bundle.zip 内同名成员
```

通用归档逻辑的设计目标是：

- 输出 ZIP 的普通文件名集合精确为上述两个；
- 不允许额外文件、额外目录 entry 或重复成员；
- 文件必须位于 ZIP 根目录；
- 每个成员大小和内容摘要必须与指定源文件精确一致；
- 压缩方式、成员顺序和 ZIP 时间戳不作为业务内容。

如果实现正常，这会准确保证只打包两份批准原件。

### 5.2 当前归档 evaluator 的真实缺陷：正确 ZIP 也固定得 0

本任务的每个源成员在 JSON 中写成对象：

```json
{
  "archive": "${repo_root}/tasks/cross_device/linux_only_assets/linux_only_327/source/reports_bundle.zip",
  "member": "Alpha_Report_v2.pdf"
}
```

仓库其实已有 `_rule_source_bytes()`，能正确处理这种“从另一个 ZIP 取 member”的对象。但 `_score_check_archive_contents()` 当前静态 `members` 分支没有调用它，而是执行相当于：

```python
source_path = _repo_rule_path(source_object)
```

`_repo_rule_path()` 会先 `str(source_object)`，最终把整个字典文本当作一个普通文件路径。这个路径不存在，于是后续 `source_path.is_file()` 必然为假，评分返回 0。

我做了针对性验证：从源 ZIP 原样提取 `Alpha_Report_v2.pdf` 和 `Beta_Summary_v1.pdf`，生成一个只含这两个根级成员的候选 ZIP，再用当前 task 的真实 rules 直接调用 `_score_check_archive_contents()`；返回值为：

```text
0.0
```

所以这不是“如何压缩”的问题，而是 evaluator 目前无法解析自己配置的 archive-member source。修复 evaluator 或把期望源改为它能读取的实际文件路径之前，归档项不可通过。

### 5.3 当前缺陷对总分的影响

两个 evaluator 都默认 `enable_score_calc=true`：

- 归档项：当前固定失败，0；
- 工作簿项：正确编辑时可得 1；
- 平均数值分数最高为 `(0 + 1) / 2 = 0.5`；
- 全局 `success` 要求所有 evaluator 成功，所以始终为 `false`。

本题应被标记为 evaluator blocker，不能把运行失败误判为执行者未按 manifest 打包。

### 5.4 工作簿 evaluator：允许变化的单元格只有 E1:E9

`check_xlsx_cells` 会用 openpyxl 同时打开源工作簿和执行后的工作簿。它首先要求：

- 工作表名列表完全相同，即仍只有 `Sheet1`；
- 每个 sheet 的 visible/hidden 状态相同；
- 合并单元格集合相同；
- 除允许区域外，所有非空单元格坐标集合和 Python 值都与源文件相同；
- 相关行列的 hidden 状态相同。

允许变化列表精确为：

```text
Sheet1!E1
Sheet1!E2
...
Sheet1!E9
```

因此 A1:D9 不能改，不能新增其他非空单元格、其他列内容或第二张工作表。

### 5.5 E1:E9 的值如何比较

每个值会：

- 转为字符串；
- 折叠连续空白；
- 去掉首尾空白；
- 默认区分大小写。

然后要求精确为 `packaged`、`yes/no`。所以 `YES`、`No`、布尔 `TRUE/FALSE` 或 `included` 都失败。

### 5.6 “保留工作簿”的当前格式边界

本任务配置没有设置 `preserve_layout=true`，因此 evaluator 不比较：

- 字体、填充、边框、数字格式；
- 列宽和行高；
- freeze panes、auto filter、gridlines。

也就是说，只要工作表名、状态、合并、隐藏状态和非空单元格内容满足，重新构造的外观不同工作簿也可能通过当前工作簿项。Instruction 仍要求“add only a packaged column”，最正确做法是在原工作簿上增加 E 列，不要重排或重做格式。

## 6. 当前 evaluator 没检查或无法检查什么

- 归档项因实现缺陷无法接受正确输出；
- 工作簿项不检查视觉格式和列宽；
- 工作簿 evaluator 不动态打开输出 ZIP 来生成 E 列，而是硬编码期望 yes/no；
- 归档 evaluator 与工作簿 evaluator 相互独立；
- 不要求使用特定压缩工具或表格应用；
- 源 ZIP 本身没有独立不变性 guard。

## 7. 常见错误与缺陷区分

- 把 Beta v2 放进 ZIP：这是执行错误，manifest 批准的是 Beta v1。
- 把 `notes.txt` 放进 ZIP：这是额外成员错误。
- 重新导出两份 PDF：即使看起来一样，设计上的字节检查会拒绝。
- 把 E3 写成空白而不是 `no`：工作簿项失败。
- 完全正确地打包两份文件但归档项仍失败：这是本节记录的 evaluator 缺陷，不应归咎于任务执行。

## 8. Cleanup

- `linux_0` 删除已编辑的 `release_manifest.xlsx`；
- `linux_1` 删除源 ZIP 和输出 `release_candidate.zip`。

