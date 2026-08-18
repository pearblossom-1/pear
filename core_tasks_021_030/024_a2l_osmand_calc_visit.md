# Core 024 — `a2l_osmand_calc_visit`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 24 项
- 任务文件：`tasks/cross_device/real300/a2l_osmand_calc_visit.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步，最长 300 秒

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

确保 OsmAnd 可用，初始化 favorites，并写入上述 `Clinic` GPX。

### `android_1`

确保 Simple Calendar Pro 可用，清空日历，再新增 `Clinic visit` 事件。

### `linux_0`

创建 `/tmp/visit`；旧 `visit.xlsx` 没有作为输入模板。

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

