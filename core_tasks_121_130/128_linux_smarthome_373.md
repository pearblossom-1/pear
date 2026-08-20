# Core 128 — linux_smarthome_373

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 128 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_373.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：easy
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

CSV 指定要检查 guest room、bedroom、study。根据 Home 里的设备 capability：

| 房间 | 设备 | Heat Capable | Cool Capable |
|---|---|---|---|
| guest room | heater | yes | no |
| bedroom | air conditioner，模式支持 heat 与 cool | yes | yes |
| study | heater + air conditioner | yes | yes |

把这六个 yes/no 写入已有 capability.xlsx 的 B2:C4 即可。此题不需要改变任何 Home 状态，也不创建新的 Linux 输出文件；原工作簿本身就是输出。

## 1. Instruction

### 英文原文（逐字）

~~~text
Use `/tmp/climate/rooms.csv` as the checklist, query the live SmartHome capabilities, and fill the preformatted Heat Capable and Cool Capable columns in `/tmp/climate/capability.xlsx`.
~~~

### 中文翻译

使用 /tmp/climate/rooms.csv 作为检查清单，查询 SmartHome 的实时 capability，并填写 /tmp/climate/capability.xlsx 中预先格式化好的 Heat Capable 与 Cool Capable 两列。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片、音频、DOCX 或 PDF 附件。

### 2.1 rooms.csv 的完整内容

~~~csv
room,question,output
guest room,heat capable,capability.xlsx
bedroom,cool capable,capability.xlsx
study,heat capable and cool capable,capability.xlsx
~~~

注意：CSV 对 bedroom 只直接问 cool，但目标工作簿为每个房间都提供 Heat 和 Cool 两列，instruction 要填写这两个预格式列；Evaluator 也会检查 bedroom 的两个格子。

### 2.2 capability.xlsx 初始内容

工作簿有 Capability Review、Completion Guide 两个 sheet。

Capability Review：

| 行 | Room | Heat Capable | Cool Capable |
|---|---|---|---|
| 2 | guest room | 空 | 空 |
| 3 | bedroom | 空 | 空 |
| 4 | study | 空 | 空 |

B2:C4 的数据验证下拉只允许 yes / no。

Completion Guide 说明：只有当该房间的某个设备暴露相应 heat/cool capability 时才选择 yes，否则选 no。

### 2.3 Home 中与答案相关的设备

当前时间：2026-06-16 19:00。

- guest_room_heater_1：heater 支持 turn_on、turn_off、set_target_temperature，因此只能提供 heat。
- bedroom_air_conditioner_1：air_conditioner 的 set_mode 枚举包含 auto、cool、dry、fan、heat，因此 heat/cool 都支持。
- study_heater_1：提供 heat。
- study_air_conditioner_1：模式同时支持 heat/cool。

Home 还含 living room 设备，但不在 CSV/工作簿的三行清单内，不应新增一行。

## 3. Setup 具体流程

### linux_0

1. 删除旧 rooms.csv 和 capability.xlsx。
2. 创建 /tmp/climate。
3. 上传两个预置文件。

### home_0

从 linux_smarthome_373/episode_config.json reset Home，建立 bedroom、guest_room、living_room、study 及其设备；初始 schedules/workflows/history 均为空。

Setup 不会预填 B2:C4，也不会自动打开工作簿。

## 4. 最终应填写的单元格

| 单元格 | 值 | 原因 |
|---|---|---|
| B2 | yes | guest room 有 heater |
| C2 | no | guest room 没有支持 cool 的设备 |
| B3 | yes | bedroom AC 支持 heat mode |
| C3 | yes | bedroom AC 支持 cool mode |
| B4 | yes | study 有 heater，AC 也支持 heat |
| C4 | yes | study AC 支持 cool |

不要改变 A 列房间顺序，也不要把 yes/no 写到 Completion Guide。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

本题只有一个 evaluator：check_xlsx_cells，读取 /tmp/climate/capability.xlsx。只要该 evaluator 成功，任务评分通过。

### 5.1 单元格是精确匹配

必须精确满足：

~~~text
B2=yes  C2=no
B3=yes  C3=yes
B4=yes  C4=yes
~~~

比较区分大小写。因此 `Yes`、`NO`、`true`、`supported` 都会失败；应使用下拉中的小写 yes/no。

规则没有指定 sheet 名，Evaluator 会读取工作簿的第一个 sheet。初始第一个 sheet 是 Capability Review；如果把 Completion Guide 调到第一位，检查会在错误 sheet 上读取 B2:C4，可能失败。重命名第一个 sheet 本身不会失败。

规则没有开启 reject_extra_nonempty_cells，因此其他单元格和额外 sheet 不会被此断言拒绝；字体、颜色、列宽和下拉验证本身也不参与最终比较。

### 5.2 什么没有被检查

- 没有 Home state evaluator；
- 没有查询 capability 的操作历史 evaluator；
- 没有 no-device-change guard；
- 没有检查 CSV 是否被修改。

因此实际评分只看最终 XLSX 六个格子。业务上仍应通过查询能力得出答案，并保持 Home 不变。

## 6. 常见失败

- 只按 CSV 的字面 question 填 C3，却把 B3 留空：B3 evaluator 失败。
- 把 guest room 的 C2 写 yes：失败。
- 使用大写 Yes/No：失败。
- 另建 capability-new.xlsx 而不保存原路径：失败。
- 重排 sheet，使 Capability Review 不再是第一个：可能失败。

## 7. Cleanup

- linux_0 删除 rooms.csv 与填写后的 capability.xlsx，并尝试删除空的 /tmp/climate。
- home_0 reset。

