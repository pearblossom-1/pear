# Core 024 — `a2l_osmand_calc_visit`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 24 项
- 任务文件：`tasks/cross_device/real300/a2l_osmand_calc_visit.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步，最长 300 秒

## 0. 任务链与设备分工

| 设备 | 提供的信息 |
|---|---|
| `android_0` | OsmAnd 收藏名称 `Clinic` 与坐标 `47.151, 9.532` |
| `android_1` | Calendar 事件的开始时间 `2027-02-16 10:00` |
| `linux_0` | 汇总上述信息的新建 XLSX |

这里取的是日历事件开始时间，不是结束时间，也不是在 OsmAnd 中推断一个访问时间。

## 1. Instruction

### 英文原文（逐字）

```text
The first phone's OsmAnd has a `Clinic` favorite, and the second phone's Simple Calendar Pro has the visit time. Please use the visit time from Calendar on the second phone to create `/tmp/visit/visit.xlsx` in Linux LibreOffice Calc, recording the favorite name, address/coordinates, and visit time.
```

### 中文翻译

第一部手机的 OsmAnd 中有一个 `Clinic` 收藏，第二部手机的 Simple Calendar Pro 中有就诊时间。请使用第二部手机 Calendar 中的就诊时间，在 Linux LibreOffice Calc 中创建 `/tmp/visit/visit.xlsx`，记录收藏名称、地址/坐标和就诊时间。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的 OsmAnd 收藏

Setup 写入的 GPX 内容是：

```xml
<wpt lat="47.151" lon="9.532">
  <name>Clinic</name>
  <desc>Clinic visit point</desc>
</wpt>
```

因此要记录的名称和坐标是：

```text
Clinic
47.151, 9.532
```

### 2.2 第二部手机的 Calendar 事件

| 字段 | 值 |
|---|---|
| 标题 | `Clinic visit` |
| 开始时间 | `2027-02-16 10:00`（任务设备时间） |
| 结束时间 | `2027-02-16 11:00` |
| 地点 | `Clinic` |
| 描述 | `Visit time for Clinic` |

### 2.3 Linux 目标工作簿

目标为新建的 `/tmp/visit/visit.xlsx`，没有模板。推荐内容：

| Name | Address | Visit Time |
|---|---|---|
| Clinic | 47.151, 9.532 | 2027-02-16 10:00 |

## 3. Setup 具体流程

### `android_0`

1. 确保 OsmAnd 可用。
2. 执行 OsmAnd favorites 初始化。
3. 在 favorites 目录直接写入完整 GPX；该输入不是一个另外上传给 Linux 的附件。

### `android_1`

1. 确保 Simple Calendar Pro 可用。
2. 清空已有事件。
3. 新增唯一的 `Clinic visit` 事件，Unix 时间戳为 `1802772000` 到 `1802775600`，并写入地点和描述。

### `linux_0`

只创建 `/tmp/visit`；不上传模板，也不预建 `visit.xlsx`。cleanup 会删除结果文件和 LibreOffice 锁文件。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

创建一个真正的 XLSX，其中有一张三列表格和唯一一条业务记录：

```text
Clinic | 47.151, 9.532 | 2027-02-16 10:00
```

工作表名和表格起始单元格不固定，但表头和值必须能被逻辑表 evaluator 唯一识别。最稳妥的方法就是从 A1 开始只放这张表。

### 4.1 逻辑表结构

- `func`：`check_xlsx_cells`，使用 `logical_table` 模式。
- 三个规范表头为 `Name`、`Address`、`Visit Time`，比较不区分大小写并折叠空白。
- `Address` 也可写成 `Coordinates` 或 `Address / Coordinates`。
- `Visit Time` 也可写成 `Date and time` 或 `Visit date and time`。
- evaluator 在所有可见工作表中寻找唯一匹配表头；多个同样的候选表会失败。

### 4.2 唯一数据行

- 名称必须为 `Clinic`。
- 坐标文本应为 `47.151, 9.532`；这里没有配置坐标值别名，建议保持逗号和空格写法。
- 时间规范值为 `2027-02-16 10:00`，也接受：
  - `2/16/2027 10:00 AM`
  - `02/16/2027 10:00 AM`
  - `2027-02-16T10:00`
  - `2027-02-16T10:00:00`
  - `2027-02-16 10:00:00`
- 逻辑表要求实际记录集合与这一行相等；额外业务行、漏列或错配值会失败。
- 不要求特定字体、颜色或工作表名，也不评测是否通过 Calc GUI 创建。

## 5. XLSX 判定例子与边界

### 可通过

```text
Name | Coordinates | Date and time
Clinic | 47.151, 9.532 | 02/16/2027 10:00 AM
```

这里两个表头和时间都使用了配置中明确列出的别名。

### 不通过

- 写 `2027-02-16 11:00`：这是结束时间，不是 visit time 的规范开始时间。
- 坐标写成 `47.151 / 9.532`：坐标列没有配置这种值别名。
- 同一工作簿中复制两份都带规范表头的表格：evaluator 无法得到唯一逻辑表。
- 加入第二条业务记录或空占位记录：实际行集合不再等于唯一规范行。
- 把 CSV 或纯文本改名为 `.xlsx`：无法作为有效工作簿解析。

Evaluator 不要求表格从 A1 开始，也不要求行顺序（本任务本来就只有一条业务行），更不检查字体、边框、列宽或公式。

## 6. Cleanup

清理会移除 OsmAnd 的 `favorites.gpx`、清空第二部手机日历，并删除 Linux 的 `visit.xlsx`、LibreOffice 锁文件；目录为空时再删除 `/tmp/visit`。
