# Core 134 — linux_smarthome_361

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 134 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_361.json`
- 运行配置：`configs/cross_device/local_linux_smarthome.json`
- 难度：easy
- 设备拓扑：1L+1H（`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

floor.png 上有 7 个房间，Home 里也有 7 个房间，但两边不是同一组：

- 两边都有：living room、kitchen、study、bedroom、laundry room、guest room；
- floor.png 有 garage，但 Home 没有，所以 garage=Missing；
- Home 有 bathroom，但 floor.png 没有，所以 bathroom=Extra；
- Home 的实际 room count 仍是 7。

任务只要求完成工作簿，不需要控制设备。

## 1. Instruction

### 英文原文（逐字）

~~~text
Compare the floor-plan rooms in `/tmp/home_reports/floor.png` with the live SmartHome room list, follow `/tmp/home_reports/brief.txt`, and complete `/tmp/home_reports/rooms.xlsx`. For each room, choose the comparison result and add brief evidence as described in the workbook's Completion Guide; record the actual SmartHome room count in the final row.
~~~

### 中文翻译

比较 `/tmp/home_reports/floor.png` 中的平面图房间与实时 SmartHome 房间列表，遵照 `/tmp/home_reports/brief.txt`，完成 `/tmp/home_reports/rooms.xlsx`。每个房间都要按工作簿 Completion Guide 选择比较结果并填写简短证据，最后一行记录 SmartHome 的实际房间数量。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或音频附件。

### 2.1 floor.png

- 路径：`/tmp/home_reports/floor.png`
- 格式与尺寸：PNG，1536×1024，RGB。
- 标题：`Floor rooms to verify`。
- 图中明确标注的 7 个房间：
  - Living room
  - Kitchen
  - Study
  - Bedroom
  - Laundry room
  - Guest room
  - Garage

### 2.2 brief.txt 的完整原文

~~~text
Compare the labeled rooms in floor.png with the actual SmartHome room list. Complete the prefilled rooms.xlsx template with Present, Missing, and Extra results, then enter the actual SmartHome room count in its summary row.
~~~

### 2.3 rooms.xlsx 初始内容

工作簿有 `Room Comparison` 和 `Completion Guide` 两个 sheet。

第一张表：

| 行 | A：Result | B：Room or count | C：Evidence |
|---|---|---|---|
| 2 | 空 | living room | 空 |
| 3 | 空 | kitchen | 空 |
| 4 | 空 | study | 空 |
| 5 | 空 | bedroom | 空 |
| 6 | 空 | laundry room | 空 |
| 7 | 空 | guest room | 空 |
| 8 | 空 | garage | 空 |
| 9 | 空 | bathroom | 空 |
| 10 | Actual room count | 空 | 空 |

下拉列表：

- A2:A9：Present、Missing、Extra；
- C2:C9：actual、not in SmartHome、not on floor.png。

Completion Guide 的完整业务说明：

| Field | Business meaning |
|---|---|
| Result | Present = listed on the floor plan and in Home; Missing = on the plan but absent from Home; Extra = in Home but absent from the plan. |
| Room or count | Rows 2-9 contain room names. The final row records the actual SmartHome room count. |
| Evidence | Choose the controlled evidence value: actual, not in SmartHome, or not on floor.png. |

### 2.4 Home 房间列表

当前时间：2026-06-16 19:00。

Home 的 7 个 room ID：

~~~text
bathroom
bedroom
guest_room
kitchen
laundry_room
living_room
study
~~~

下划线是 Home 内部 ID；工作簿使用空格形式。初始 schedules、workflows、history 均为空。

## 3. Setup 具体流程

### linux_0

1. 删除旧的 `floor.png`、`brief.txt` 和 `rooms.xlsx`。
2. 创建 `/tmp/home_reports`。
3. 把三个预置附件上传到该目录。

### home_0

使用 `linux_smarthome_361/episode_config.json` reset Home，恢复七个房间及其设备。

Setup 不会自动打开图片、brief 或工作簿，也不会填写空白单元格。

## 4. 正确填写结果

| Result | Room or count | Evidence |
|---|---|---|
| Present | living room | actual |
| Present | kitchen | actual |
| Present | study | actual |
| Present | bedroom | actual |
| Present | laundry room | actual |
| Present | guest room | actual |
| Missing | garage | not in SmartHome |
| Extra | bathroom | not on floor.png |
| Actual room count | 7 |  |

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

只有一个 `check_xlsx_cells` evaluator，它必须成功。

### 5.1 文件与 worksheet 选择

Evaluator 读取 `linux_0:/tmp/home_reports/rooms.xlsx`。规则没有写 `sheet` 或 `sheets`，所以实现读取工作簿中的第一张 worksheet；第一张表叫什么名字不影响得分。源模板第一张表叫 `Room Comparison`。

### 5.2 17 个精确单元格

| 单元格 | 必须是 |
|---|---|
| A2 | Present |
| C2 | actual |
| A3 | Present |
| C3 | actual |
| A4 | Present |
| C4 | actual |
| A5 | Present |
| C5 | actual |
| A6 | Present |
| C6 | actual |
| A7 | Present |
| C7 | actual |
| A8 | Missing |
| C8 | not in SmartHome |
| A9 | Extra |
| C9 | not on floor.png |
| B10 | 7 |

这些值是区分大小写的精确字符串比较，不是关键词检测。数值单元格 7 和文本单元格 `7` 在 XLSX XML 中都会被读成 `7`，均可满足 B10。

### 5.3 没有检查的内容

- 不检查 B2:B9 的房间名；它们由模板预填；
- 不检查 A10 是否仍为 `Actual room count`；
- 不检查 sheet 名；
- 不检查 Completion Guide、格式、颜色或下拉列表是否保留；
- 不拒绝其他非空单元格或额外 sheet；
- 没有 Home evaluator，也不检查 command history。

业务上应保留模板并完整填写；机器实际只硬断言上表 17 个单元格。

## 6. 常见失败与真实评测边界

- 认为“图和 Home 都是 7 个，所以全部 Present”：garage 和 bathroom 两行会失败。
- 把 garage 写 Extra、bathroom 写 Missing：概念颠倒，失败。
- 写 `present` 或 `Not in SmartHome`：大小写不同，失败。
- 把 7 写到 C10：B10 仍为空，失败。
- 修改第二张 sheet 而第一张表没完成：Evaluator 读取第一张表，失败。
- 正确填写但没有控制 Home：可以通过，因为本任务本来就是只读比较。

## 7. Cleanup

- linux_0 删除三个附件，并尝试删除空的 `/tmp/home_reports`。
- home_0 reset。

