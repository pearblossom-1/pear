# Core 152 — android_smarthome_875

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 152 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_875.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

CSV 规则只处理“无人且亮度高于 700 lux”的房间，并把 curtain 调到 25% open。Home 中：

- guest room：840 lux、unoccupied，符合条件，curtain 从 100% 调到 25%；
- living room：920 lux 但 occupied，必须跳过并保持 100%；
- bedroom 和 office 未超过阈值。

还要创建 `Daylight log.md`，记录 guest room 的 100→25，以及 living room 因 occupied 而 skipped。

## 1. Instruction

### 英文原文（逐字）

~~~text
`daylight_policy.csv` in Android Files describes the rule for unoccupied rooms that are too bright. Apply it to the live Home rooms, adjust the matching curtain, and create a Markor note named `Daylight log` for the next home check that records the room selected, its before and target opening, and why any other bright room was skipped.
~~~

### 中文翻译

Android Files 中的 `daylight_policy.csv` 描述了针对过亮且无人房间的规则。把规则应用到 Home 实时房间，调整符合条件的窗帘，并为下次家庭检查创建名为 `Daylight log` 的 Markor note，记录选中的房间、调整前和目标开合百分比，以及其他过亮房间被跳过的原因。

## 2. 输入、附件与初始业务数据

本任务没有短信、联系人或邮件。输入是 CSV 和 Home 实时状态，输出是 Home 调整和 Markor 文件。

### 2.1 CSV 附件原文

`daylight_policy.csv` 上传到：

~~~text
/storage/emulated/0/Download/home/daylight_policy.csv
~~~

全文：

~~~csv
occupied_rule,brightness_threshold,target_open_pct
unoccupied only,700,25
~~~

即：只处理 unoccupied 房间；亮度阈值 700；目标 curtain opening=25%。

### 2.2 Home 房间筛选

当前时间：`2026-06-16T19:00:00`。

| 房间 | brightness_lux | occupied | 判断 |
|---|---:|---|---|
| guest_room | 840.0 | false | 符合规则 |
| living_room | 920.0 | true | 虽亮，但因 occupied 跳过 |
| bedroom | 60.0 | true | 未超过阈值 |
| office | 279.1 | true | 未超过阈值 |

两条相关 curtain 初始均为 `open_pct=100`、`status=open`。初始 schedules、workflows 和 history 为空。Setup 会删除旧 `Daylight log.md`。

## 3. Setup 具体流程

### android_0

1. 确保 Android Files 可用并上传 CSV；
2. 确保 Markor 可用；
3. 删除旧结果 `/storage/emulated/0/Documents/Markor/Daylight log.md`。

### home_0

使用 `android_smarthome_875/episode_config.json` reset Home，写入四个房间读数和两条 curtain 状态。

## 4. 正确输出

### 4.1 Home

- `guest_room_curtain_1.open_pct=25`；
- `living_room_curtain_1.open_pct=100`，保持不变。

Oracle 对 guest room 执行 `set_open_pct(25)`。

### 4.2 Markor

精确路径：

~~~text
/storage/emulated/0/Documents/Markor/Daylight log.md
~~~

Oracle 示例：

~~~text
# Daylight log
The guest room was unoccupied and above the daylight threshold, so its curtain moved from 100% open to the 25% target.
The living room was also bright, but it was occupied and therefore skipped.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 3 个 evaluator，全部必须成功：

1. `Daylight log.md` 的语义；
2. guest-room curtain 最终为 25%；
3. living-room curtain 仍为 100% 的 hard guard。

第 3 项设置 `enable_score_calc=false`，不进入平均分，但失败会令整体失败并把总分置 0。

### 5.1 Markor note 的语义条件

Evaluator 读取精确路径全文，要求每个实体组都命中：

- `guest room`；
- `unoccupied`；
- `curtain`；
- `100` / `100%`；
- `25` / `25%`；
- `living room`；
- `occupied`；
- `skipped` / `unchanged` / `left unchanged`。

还必须：

- 至少出现 `moved`、`adjusted`、`applied`、`set` 之一；
- 出现 `from`；
- 出现 `to` 或 `target`；
- 不得出现 `pending`、`not applied`、`25 to 100`、`living room changed`、`living room was changed`、`not skipped`、`guest room unchanged`。

这不是整篇绝对匹配，也没有 `relation_groups`，所以这些词不要求全部在同一 clause。不过 `from`、100、`to/target`、25 应写成明确的 100→25 关系；反向 `25 to 100` 会被显式拒绝。文件名和路径必须精确。

### 5.2 Guest-room curtain

`smarthome.check_device_state` 只要求 `guest_room_curtain_1.open_pct=25`。它没有同时检查 `status`。

### 5.3 Living-room hard guard

`smarthome.check_multi_condition` 只要求 `living_room_curtain_1.open_pct=100`。这是最终状态子集检查；不检查 command history，也不检查 `status=open`。

## 6. 常见失败与真实评测边界

- 因 living room 更亮而调整它：忽略了 `unoccupied only`，hard guard 失败。
- Note 只写 guest room，不解释 living room occupied/skipped：失败。
- 把方向写成 25→100：命中冲突短语，失败。
- 保存为 `Daylight Log.md`：精确路径大小写不同，读取失败。
- 不需要改 bedroom 或 office。

## 7. Cleanup

- android_0 删除 CSV 和 `Daylight log.md`；
- home_0 reset。
