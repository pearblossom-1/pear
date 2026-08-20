# Core 155 — android_smarthome_231

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 155 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_231.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：easy
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

Markor 请求今晚校准 nursery air monitor。Home 中有 nursery 房间和 `nursery_light_1`，但没有任何 nursery air-monitor 设备，所以请求不可完成。

正确输出不是新建手机 note，而是向 SmartHome 提交且只提交一条 infeasible report：类别为 missing device，目标为 nursery air monitor，原因说明 nursery 没有 air monitor、无法校准。

## 1. Instruction

### 英文原文（逐字）

~~~text
Check the Home against the nursery air-monitor calibration request in Markor and report whether the required equipment is available.
~~~

### 中文翻译

根据 Markor 中的 nursery air-monitor 校准请求检查 Home，并报告所需设备是否可用。

## 2. 输入、附件与初始业务数据

本任务没有短信、联系人或邮件。唯一手机附件是 Markor 请求；输出存在于 SmartHome 的 infeasible_reports。

### 2.1 Markor 附件原文

`Nursery air request.md` 上传到：

~~~text
/storage/emulated/0/Documents/Markor/Nursery air request.md
~~~

全文：

~~~text
Run the nursery air monitor calibration tonight.
~~~

### 2.2 Home 设备可用性

当前时间：`2026-06-16T19:00:00`。

- Home 有 `nursery` 房间；
- nursery 中只有 `nursery_light_1`，状态 off；
- Home 设备列表中不存在 nursery air monitor；
- 初始 infeasible_reports、schedules、workflows 和 history 均为空。

这不是“房间缺失”，而是“目标房间存在，但所需 air monitor 设备缺失”。

## 3. Setup 具体流程

### android_0

确保 Markor 可用并上传 `Nursery air request.md`。

### home_0

使用 `android_smarthome_231/episode_config.json` reset Home。Episode 被标记为 `case=infeasible`，但 setup 不会预先提交报告。

## 4. 正确输出

Oracle 使用：

~~~text
type: smarthome.report_infeasible
category: missing_device
target:
  room: nursery
  need: air_monitor
reason: The nursery has no air monitor, so the calibration request cannot be completed.
details: {}
~~~

然后结束任务。无需创建 Android 文件、Tasks 项或短信。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

本任务只有 1 个 evaluator：`smarthome.check_infeasible_report`。Home 的 infeasible_reports 列表必须恰好有 1 条，并且这 1 条通过语义 contract。多报一条别的问题也会因总数不是 1 而失败。

### 5.1 Category

Contract 提供的 category aliases：

- `missing_device`、`missing device`；
- `equipment unavailable`、`unavailable equipment`。

实现会先拒绝空 category 和 `success`、`available`、`feasible` 等矛盾类别；当 category 能识别出类别族时，不能与预期的 missing 类别族冲突。当前 contract 没有 `require_category_alias=true`，所以不是对这四个字符串做严格等号；但用 Oracle 的 `missing_device` 最清楚、最稳妥。

### 5.2 Target

整条 report 必须语义匹配以下任一种目标表达：

- `nursery air monitor`；
- `air monitor in nursery`；
- 或结构化 target 同时含 `room=nursery`、`need=air_monitor`。

若提供了非通用的显式 target，该 target 自身也必须匹配这些 aliases。Oracle 的结构化 target 可直接满足。

### 5.3 Reason relation

Evaluator 把 category、target、reason、details 组合成关系文本。必须包含：

- `nursery` 或 `nursery room`；
- `air monitor` 或 `air-monitor`；
- 至少一个不可用/不可完成表达：
  - `no air monitor`、`missing`、`unavailable`；
  - `cannot be completed`、`cannot calibrate`。

不得表达相反结论：

- `is available`、`exists`、`can be completed`、`can proceed`。

`no air monitor`、`cannot be completed`、`cannot calibrate` 被列为允许的 negative-capability phrases，因此这些必要的否定不会被通用 relation scorer 当作错误否定。

### 5.4 没有检查的 Home 变化

当前任务没有 `check_no_device_change` 或 `check_no_home_mutation`。Evaluator 只检查 infeasible report；不过 instruction 仅要求检查和报告，正确做法是不改 Home。

## 6. 常见失败与真实评测边界

- 创建 Markor 结果 note 而不调用 `report_infeasible`：报告列表仍空，失败。
- 写“nursery equipment unavailable”但完全不提 air monitor：reason relation 失败。
- 报告“air monitor is available”：命中冲突，失败。
- 连续提交两条等价报告：exact_report_count=1，失败。
- 不要把 `nursery_light_1` 当作 air monitor。

## 7. Cleanup

- android_0 删除 `Nursery air request.md`；
- home_0 reset。
