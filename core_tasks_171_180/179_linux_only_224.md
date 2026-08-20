# Core 179 — `linux_only_224`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 179 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_224.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：easy
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 给出路线的 stop→site，第二台 Linux 给出 site→地址/联系人/联系人状态。按 site 做左连接后，生成第二台机器上的真实 XLSX：

| stop | address | contact | status |
|---|---|---|---|
| Stop 03 | 44 North Pier | Nia Cross | ready |
| Stop 06 |  |  | missing_address |
| Stop 08 | 9 South Yard | Inactive Rex | blocked_contact |

行顺序可以调整，列顺序也可以调整；为了适配当前 evaluator 实现，第一列表头请直接写 `stop`，不要写配置中虽声明但实际活跃路径未识别的别名 `Stop order`。

## 1. Instruction

### 英文原文（逐字）

```text
Create `/tmp/routes/dispatch.xlsx` on the second Linux machine by joining the route table on the first machine with `address_book.csv` on the second. Include stop order, address, contact, and status. Use `ready` for an active contact, `blocked_contact` for an inactive contact, and `missing_address` when the route's site is absent from the address book.
```

### 中文翻译

把第一台 Linux 机器上的 route table 与第二台机器上的 `address_book.csv` 连接，在第二台机器创建 `/tmp/routes/dispatch.xlsx`。结果要包含站点顺序、地址、联系人和状态。联系人 active 时状态写 `ready`，inactive 时写 `blocked_contact`；当路线中的 site 在 address book 中不存在时写 `missing_address`。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片或音频。输入是两份 CSV。

### 2.1 `linux_0`：`route_table.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_224/source/linux_0/tmp/routes/route_table.csv`
- 注入路径：`/tmp/routes/route_table.csv`
- 完整原文：

```csv
stop,site
Stop 03,North Pier
Stop 06,West Yard
Stop 08,South Yard
```

### 2.2 `linux_1`：`address_book.csv`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_224/source/linux_1/tmp/routes/address_book.csv`
- 注入路径：`/tmp/routes/address_book.csv`
- 完整原文：

```csv
site,address,contact,status
North Pier,44 North Pier,Nia Cross,active
South Yard,9 South Yard,Inactive Rex,inactive
```

Join 结果：North Pier 有 active 联系人；West Yard 在地址簿中没有行；South Yard 有 inactive 联系人。

### 2.3 输出初态

目标路径：

```text
/tmp/routes/dispatch.xlsx
```

Setup 会先删除旧文件，没有提供 XLSX 模板。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/routes`；
2. 删除并上传 `route_table.csv`。

### `linux_1`

1. 创建 `/tmp/routes`；
2. 删除并上传 `address_book.csv`；
3. 删除旧 `dispatch.xlsx`。

## 4. 正确输出

必须创建一个 openpyxl 能解析的真实 `.xlsx`。最稳妥的首行和三行数据是：

```text
stop     address          contact       status
Stop 03  44 North Pier    Nia Cross      ready
Stop 06                                  missing_address
Stop 08  9 South Yard     Inactive Rex   blocked_contact
```

`Stop 06` 的 address、contact 应留为空单元格或空字符串；不要填 `N/A`、`missing` 或 site 名。

## 5. Evaluator：评测方式与具体评测点

本任务只有 1 个计分 evaluator：`check_xlsx_cells`。它用 openpyxl 读取真实工作簿并寻找逻辑表，不是搜索二进制字符串，也不是比较 oracle 文件哈希。

### 5.1 必须有唯一的四列表头窗口

当前活跃实现寻找连续四个表头：

```text
stop, address, contact, status
```

比较大小写不敏感，并折叠连续空白。表可以从任意可见工作表、任意行列开始；sheet 名不固定。但整个工作簿必须只找到一个符合的表头窗口。

允许列重排，例如 `status, contact, stop, address` 也可以，后续每行会按识别出的物理列映射回逻辑列。

表头所在行在这四列之外不能有其他非空单元格；表头列或表头行若隐藏，不会成为有效候选。

### 5.2 `Stop order` 别名配置与实际实现不一致

Task JSON 在 `header_aliases` 中声明：

```json
{"stop": ["Stop order"]}
```

但当前 `_score_xlsx_logical_table` 活跃路径在搜索表头时只比较 canonical `headers`，没有读取 `header_aliases`；读取别名的是文件中另一段当前未被调用的 flexible helper。因此按现有实现，表头写 `Stop order` 找不到目标表，实际会失败。请写 `stop`。

这是配置意图与实现的真实差异，不应把它转述成“两个都能通过”。

### 5.3 三行内容：行可换序，值按文本归一化匹配

必须恰好包含这三条逻辑记录：

```text
Stop 03 | 44 North Pier | Nia Cross    | ready
Stop 06 |               |              | missing_address
Stop 08 | 9 South Yard  | Inactive Rex | blocked_contact
```

`order_sensitive: false` 表示三行顺序不重要。每个非空值比较时大小写不敏感并折叠空白，所以 `READY` 或多余空格从纯 evaluator 角度可通过；建议仍照业务指定小写写状态。

空单元格的规则没有开启 raw-None 严格模式，因此真正空白和内容为 `""` 的单元格都会归一化为空。`N/A`、`-` 或 `West Yard` 不是空值，会失败。

### 5.4 表的连续范围与额外内容

读取从表头下一行开始，遇到第一行四个目标单元格全空就停止：

- 在终止空行之前多一条或少一条记录，会因实际/预期行集合不等而失败；
- 数据行在四个表列之外不能有额外非空单元格；
- 数据行隐藏会失败；
- 表外若形成另一块“密集数据区域”会失败，不能把旧结果或草稿表藏在其他/隐藏 sheet；
- 稀疏标题或说明通常允许；名为 `Notes` 的辅助工作表被显式放行，评测扫描额外区域时会跳过它。

最稳妥的做法是只保留一张结果表，不添加第二张业务表。

### 5.5 值和公式的读取方式

工作簿以 `data_only=False` 打开，逻辑比较读取单元格的原始 value。若用公式生成 `ready` 等结果，评测看到的可能是公式字符串而不是 Excel 缓存显示值，从而失败；直接写入文本值最稳。

当前规则没有检查字体、颜色、边框、列宽、筛选器、工作表名称或固定坐标，也没有开启严格可见性/显示值等价选项。

### 5.6 当前 evaluator 没检查什么

- 输出表不需要包含 join key `site`；反而目标逻辑表只有四列；
- 不在评测时重新读取两份 CSV，三条结果已经写死；
- 不要求排序按 Stop 03→06→08；
- 不要求使用公式或保留数据来源；
- 不要求 Notes sheet，但若使用这个精确名称可作为被允许的辅助 sheet。

## 6. 常见失败示例

- 表头写 `Stop order, address, contact, status`：按当前活跃代码无法识别别名，失败。
- 把 CSV 直接改扩展名为 `.xlsx`：openpyxl 无法解析，失败。
- Stop 06 的 address 写 `West Yard`、contact 写 `N/A`：预期是两个空值，失败。
- 结果表正确，但旁边又保留一份完整的 source/join 草稿表：额外密集区域可能使 evaluator 失败。
- 用公式产生状态、只依赖本机 LibreOffice 显示缓存：评测读取原始公式值，可能失败。

## 7. Cleanup

- `linux_0` 删除 `route_table.csv`；
- `linux_1` 删除 `address_book.csv` 和 `dispatch.xlsx`。

