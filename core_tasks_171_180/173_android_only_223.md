# Core 173 — `android_only_223`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 173 项
- 任务文件：`tasks/cross_device/android_only/android_only_223.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：easy
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机的 CSV 是当前照片清单；第二台手机的 Tasks 里是一份相反且过时的旧清单。需要把 `Site photo checklist` 的 notes 改成：

```text
north_gate.jpg present
meter_panel.jpg present
old_gate.jpg missing
```

三个文件名和各自状态必须绑定清楚。最稳妥的完整正文是 oracle：

```text
PHOTO-223: north_gate.jpg present; meter_panel.jpg present; old_gate.jpg missing.
```

## 1. Instruction

### 英文原文（逐字）

```text
The first phone's Downloads folder has the current photo manifest. Use it to fix the Site photo checklist task on the second phone.
```

### 中文翻译

第一台手机的 Downloads 文件夹里有当前的照片清单。请用它修正第二台手机上的 `Site photo checklist` 任务。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或真实 JPG 图片；所谓 photo manifest 是一个 CSV 文本附件，任务只要求把其内容同步到 Tasks notes。

### 2.1 `android_0`：`site_photo_manifest.csv`

- 仓库文件：`tasks/cross_device/android_only_assets/android_only_223/android_0/files/site_photo_manifest.csv`
- 注入路径：`/sdcard/Download/site_photo_manifest.csv`
- 完整原文：

```csv
file,status,code
north_gate.jpg,present,PHOTO-223
old_gate.jpg,missing,PHOTO-223
meter_panel.jpg,present,PHOTO-223
```

所以当前正确事实是：north gate 和 meter panel 的照片存在，old gate 的照片缺失；三行共享代码 `PHOTO-223`。

### 2.2 `android_1`：过时的 Tasks 任务

Setup 清空 Tasks 后添加：

| 字段 | 初始值 |
|---|---|
| title | `Site photo checklist` |
| notes | `Old list: old_gate.jpg present; north_gate.jpg missing.` |
| dueDate | `0` |
| completed | `0`，未完成 |

旧 notes 把 `old_gate.jpg` 和 `north_gate.jpg` 的状态都写反了，而且完全没有 `meter_panel.jpg`。

## 3. Setup 具体流程

### `android_0`

1. 确保 Files 可用；
2. 上传 CSV 到 Download 根目录。

### `android_1`

1. 确保 Tasks 可用；
2. 清空 Tasks 数据库；
3. 添加第 2.2 节的未完成旧任务。

Cleanup 会删除 CSV 并再次清空 Tasks。

## 4. 正确输出

应编辑第二台手机上现有的 `Site photo checklist`，保持未完成状态，并用当前 CSV 事实替换旧 notes。Oracle notes 为：

```text
PHOTO-223: north_gate.jpg present; meter_panel.jpg present; old_gate.jpg missing.
```

`PHOTO-223` 可以保留，也可以不写；当前 evaluator 没把它列为必需实体。

## 5. Evaluator：评测方式与具体评测点

本任务只有 1 个计分 evaluator。Tasks getter 先判断是否存在唯一且合格的任务，返回 `present`/`missing`，外层再精确要求 `present`。不是把 notes 与 oracle 全文绝对匹配。

### 5.1 标题唯一和完成状态

- 标题必须是 `Site photo checklist`；默认区分大小写，但折叠连续空白；
- `require_exactly_one: true` 表示这个标题在整个 Tasks 数据库中必须恰好有 1 条；
- 该条任务必须保持未完成，即 `completed == false`；
- 其他标题的无关任务允许存在。

保留旧任务再新建一条同名正确任务，会因同名任务共两条而失败。

### 5.2 三个文件名都要出现一次

Notes 的关系规则要求：

- `north_gate.jpg`
- `meter_panel.jpg`
- `old_gate.jpg`

三个实体都必须出现。`unique_entities: true` 要求每个文件名只匹配一次；任何额外的 `*.jpg` 文件名会被 closed-list 正则拒绝。

### 5.3 正确状态必须和对应文件处在同一 clause

三个 relation group 分别要求：

| 文件 | 同一 clause 内允许的正确状态 |
|---|---|
| `north_gate.jpg` | `present` 或 `available` |
| `meter_panel.jpg` | `present` 或 `available` |
| `old_gate.jpg` | `missing`、`absent` 或 `not found` |

Clause 按分号、竖线、换行或句末标点后的空白切分。各写一行或用分号分隔最稳。

### 5.4 状态还必须离文件名足够近

除了同 clause 关系，`nearest_relations` 还要求：

- 每个文件名与其正确状态之间最多 4 个关联 token；
- 如果附近还出现相反状态，正确状态必须比相反状态更近；相反状态同样近或更近会失败。

所以 `north_gate.jpg — after checking several unrelated details — is present` 可能因为距离太远失败。`north_gate.jpg present` 是最稳的形式。

### 5.5 全局冲突

以下内容会直接失败：

```text
cancelled
withdrawn
old_gate.jpg is present
north_gate.jpg is missing
meter_panel.jpg is missing
```

这意味着不能在新 notes 后面保留或引用旧正文，例如 `Old value was north_gate.jpg is missing`；即使随后写了正确值，错误短语仍在全文中。

通用关系 scorer 还拒绝问句、不确定表达和否定/撤回语义。

### 5.6 当前 evaluator 没检查什么

- 不要求 `PHOTO-223`；
- 不检查 due date、importance 或任务修改时间；
- 不检查第一台手机上的 CSV 是否仍存在；
- 不读取或检查真实 JPG 文件，因为 Setup 根本没有提供图片；
- 不要求 notes 逐字等于 oracle，也不要求三项按 CSV 行顺序排列。

## 6. 常见失败示例

- `north_gate.jpg; meter_panel.jpg present; old_gate.jpg missing.`：north gate 所在 clause 没有 present/available，失败。
- `north_gate.jpg present; meter_panel.jpg present; old_gate.jpg missing; spare.jpg missing.`：出现未列出的 JPG，失败。
- 在旧 notes 后追加正确事实：旧的明确错误短语仍存在，失败。
- 三项都写对但把任务勾为完成：`completed=false` 不满足，失败。

## 7. Cleanup

- `android_0` 删除 `/sdcard/Download/site_photo_manifest.csv`；
- `android_1` 清空 Tasks。
