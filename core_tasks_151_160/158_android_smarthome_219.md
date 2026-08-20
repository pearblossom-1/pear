# Core 158 — android_smarthome_219

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 158 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_219.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：easy
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

Markor 请求把 bedroom light 设为蓝色、亮度 40%。Home 安装的是普通 `dimmable_light`：支持亮度，但不支持 color control，所以完整请求不可执行。不能只完成 40% 这一半，也不能改变现有灯状态。

正确输出是 SmartHome 中恰好一条 unsupported-capability infeasible report，说明 bedroom light 不支持 color control；灯保持 on/70%。

## 1. Instruction

### 英文原文（逐字）

~~~text
Markor has a bedroom light request. Check whether the installed Home light supports the complete request and report the unsupported capability without changing the light.
~~~

### 中文翻译

Markor 中有一条 bedroom light 请求。检查已安装的 Home 灯是否支持完整请求，在不改变灯的情况下报告不支持的能力。

## 2. 输入、附件与初始业务数据

本任务没有短信、联系人或邮件。输入是 Markor 文件和 Home 设备能力；输出是 SmartHome infeasible report。

### 2.1 Markor 附件

`Color Light Request.md` 上传到：

~~~text
/storage/emulated/0/Documents/Markor/Color Light Request.md
~~~

全文：

~~~text
Bedroom light should turn blue at 40%. If color control is not available, report the unsupported capability.
~~~

### 2.2 Home 设备

当前时间：`2026-06-16T19:00:00`。

唯一相关设备：

~~~text
device_id: bedroom_dimmable_light_1
device_type: dimmable_light
state:
  power: on
  brightness_pct: 70
~~~

该设备 state/schema 中没有 color 字段或 color-control 能力。初始 infeasible_reports、schedules、workflows 和 history 均为空。

## 3. Setup 具体流程

### android_0

确保 Markor 可用并上传 `Color Light Request.md`。

### home_0

使用 `android_smarthome_219/episode_config.json` reset Home。Episode 标记为 `case=infeasible`。

## 4. 正确输出

Oracle：

~~~text
type: smarthome.report_infeasible
category: unsupported_capability
target:
  room: bedroom
  device: bedroom_dimmable_light_1
  capability: color_control
reason: The installed bedroom light does not support color control, so the complete request cannot be applied.
details: {}
~~~

灯最终仍必须是 power=on、brightness=70。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 2 个 evaluator，全部必须成功：

1. infeasible_reports 中恰好一条匹配报告；
2. `bedroom_dimmable_light_1` 的完整 state 与 setup 相同的 hard guard。

第 2 项 `enable_score_calc=false`，不进入平均分，但失败会令整体失败并把总分置 0。

### 5.1 Infeasible report 数量和 category

`exact_report_count=1`：只能有一条 infeasible report。

Category aliases 是：

- `unsupported_capability`；
- `unsupported capability`；
- `feature unavailable`。

实现拒绝空/成功类 category，并在可识别类别族上要求不与 unsupported 类别冲突。Contract 未启用严格 alias 等值开关，但用 `unsupported_capability` 最稳妥。

### 5.2 Target

报告整体和显式 target 必须语义匹配以下目标之一：

- `bedroom light color`；
- `bedroom light color control`；
- 或结构化 target 同时包含 room=bedroom、device=bedroom_dimmable_light_1、capability=color_control。

### 5.3 Reason relation

必须包含：

- `bedroom light` 或 `installed bedroom light`；
- `color control`、`color setting` 或 `color change`；
- 至少一个不支持表达：
  - `does not support`、`unsupported`；
  - `cannot change color`、`color control is unavailable`。

不得出现相反结论：

- `supports color control`；
- `color was changed`；
- `request is complete`。

`does not support` 和 `cannot change color` 是显式允许的 negative-capability phrases，不会因必要否定而失败。当前 reason contract 不要求出现 `blue` 或 `40%`。

### 5.4 No-device-change hard guard

`smarthome.check_no_device_change` 未指定 fields，因此把该设备完整 state dictionary 与 setup baseline 比较。最终必须仍是：

- power=on；
- brightness_pct=70。

把亮度先改成 40%，即使无法改颜色，也会失败。

## 6. 常见失败与真实评测边界

- 只完成亮度 40%：完整请求不可行且 no-change guard 失败。
- 创建 Android note 而不提交 `report_infeasible`：失败。
- 报告写“color was changed”：命中冲突。
- 提交两条相同报告：exact count 失败。
- Reason 不必逐字抄 Oracle，但必须明确 bedroom light 与 color-control 不支持。

## 7. Cleanup

- android_0 删除 `Color Light Request.md`；
- home_0 reset。
