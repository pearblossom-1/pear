# Core 148 — android_smarthome_877

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 148 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_877.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

CSV 中有三行目标，必须与 Home 当前 AC 设置逐行比较：

- office：有 drift，允许 auto repair，且 priority=1，所以修成 cool / 23 C；
- bedroom：有 drift，但 auto_repair=false，是 manual 行，保持 dry / 27 C；
- living room：已经是 cool / 25 C，属于 compliant 行，保持不变。

完成后在 Tasks 创建唯一一条未完成任务 `Climate drift`，说明修了 office，并指出 bedroom/manual 与 living room/compliant 都没有改。

## 1. Instruction

### 英文原文（逐字）

~~~text
`climate_targets.csv` in Android Files contains the current targets. Compare it with the live Home air-conditioning settings and repair only the highest-priority drift marked for automatic repair. Then create a Tasks item titled `Climate drift` that records the repaired room and settings and identifies the manual and already-compliant rows left unchanged.
~~~

### 中文翻译

Android Files 中的 `climate_targets.csv` 包含当前目标。将其与 Home 的实时空调设置比较，只修复被标记为自动修复且优先级最高的偏差。然后创建标题为 `Climate drift` 的 Tasks 项，记录修复的房间和设置，并指出保持不变的 manual 行和原本已经 compliant 的行。

## 2. 输入、附件与初始业务数据

本任务没有短信、联系人或邮件。输入文件是 CSV，输出是 Android Tasks 项和 Home 最终状态。

### 2.1 CSV 附件完整内容

`climate_targets.csv` 上传到：

~~~text
/storage/emulated/0/Download/home/climate_targets.csv
~~~

全文：

~~~csv
room,target_mode,target_temp,auto_repair,priority
office,cool,23,true,1
bedroom,cool,24,false,2
living room,cool,25,true,3
~~~

### 2.2 Home 三台 AC 初始状态

当前时间：`2026-06-16T19:00:00`。

| 房间/设备 | 初始状态 | CSV 目标 | 判断 |
|---|---|---|---|
| office_air_conditioner_1 | on / auto / 26 C | cool / 23 C，auto=true，priority=1 | 自动修复的最高优先级 drift |
| bedroom_air_conditioner_1 | on / dry / 27 C | cool / 24 C，auto=false，priority=2 | manual drift，不改 |
| living_room_air_conditioner_1 | on / cool / 25 C | cool / 25 C，auto=true，priority=3 | 已 compliant，不改 |

初始 schedules、workflows 和 history 均为空。Setup 会清空 Tasks。

## 3. Setup 具体流程

### android_0

1. 确保 Android Files 可用；
2. 上传 `climate_targets.csv`；
3. 确保 Tasks 可用；
4. 清空 Tasks。

### home_0

使用 `android_smarthome_877/episode_config.json` reset Home，装入三台 AC 的初始状态。

Setup 不会修复 AC，也不会创建结果 task。

## 4. 正确输出

### 4.1 Home

只改变 office：

~~~text
office_air_conditioner_1:
  power: on
  mode: cool
  target_temperature_c: 23.0
~~~

Bedroom 必须仍是 on/dry/27，living room 必须仍是 on/cool/25。

### 4.2 Tasks

创建一条未完成任务，标题精确为 `Climate drift`。Oracle notes：

~~~text
Office drift was repaired from auto at 26 C to cool at 23 C. Bedroom is manual and unchanged; living room is compliant and unchanged.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 3 个 evaluator，全部必须成功：

1. 唯一的 `Climate drift` Tasks 项；
2. office AC 最终状态；
3. bedroom 和 living-room AC 保持原状态的 hard guard。

第三项 `enable_score_calc=false`，不进入平均分，但失败仍会令整体失败并把总分置 0。

### 5.1 Tasks 标题、数量和完成状态

`androidworld_task` 默认对标题做大小写敏感的 NFC/空白规范化等值比较。`require_exactly_one=true` 表示：

- 标题为 `Climate drift` 的任务必须恰好 1 条；
- 该条任务必须 `completed=false`；
- 若复制出两个同名任务，即使其中一条完全正确也失败。

其他标题的 task 理论上不影响这个 getter，但 setup 已先清空 Tasks。

### 5.2 Tasks notes 的语义要求

Notes 必须命中全部实体组：

- `office`；
- `cool`；
- `23` 或 `23 C`；
- `bedroom`；
- `manual`；
- `living room`；
- `compliant`。

还必须：

- 至少出现 `repaired`、`corrected`、`applied` 之一；
- 至少出现 `unchanged`、`left alone`、`not changed` 之一；
- 不得出现 `pending`、`not repaired`、`repair not applied`、`bedroom was changed`、`manual row changed`、`living room was changed`、`compliant row changed`。

它不是 Oracle notes 的整句绝对匹配，也没有 relation group，所以 evaluator 没有要求每组关键词都在同一个 clause。稳妥写法仍应明确分别说“bedroom manual and unchanged”“living room compliant and unchanged”。Evaluator 不要求记录 office 原来的 auto/26，也不要求正文出现 priority=1。

### 5.3 Office 最终状态

`smarthome.check_device_state` 对 office 做子集匹配：

- power=`on`；
- mode=`cool`；
- target_temperature_c=`23.0`。

### 5.4 Bedroom 与 living room 的 hard guard

`smarthome.check_multi_condition` 要求最终：

- bedroom：power=on、mode=dry、target=27.0；
- living room：power=on、mode=cool、target=25.0。

这是最终状态检查，不是 command-history 检查；实现不会判断你是否曾改动后又改回，也不保护未列出的其他 Home 设备。

## 6. 常见失败与真实评测边界

- 同时把 bedroom 修成 cool/24：hard guard 失败，因为其 `auto_repair=false`。
- 把 living room 再“修”一次到别的温度：hard guard 失败；它本来已 compliant。
- Tasks 标题写成 `Climate Drift`：大小写不同，失败。
- 把 Tasks 标为已完成：失败；要求 incomplete。
- Notes 只写 office 修复，不写 bedroom/manual 和 living room/compliant：语义 evaluator 失败。

## 7. Cleanup

- android_0 删除 `climate_targets.csv` 并清空 Tasks；
- home_0 reset。
