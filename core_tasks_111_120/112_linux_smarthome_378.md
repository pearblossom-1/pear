# Core 112 — `linux_smarthome_378`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 112 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_378.json`
- 运行配置：`configs/cross_device/local_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1L+1H`（`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

HTML 要求把 bedroom 降到 21°C，明确禁止使用 heater，并要求设备同时支持 cool mode 和目标温度控制。Home 中 bedroom 同时有空调和 heater，因此必须选择空调：打开 `bedroom_air_conditioner_1`，设为 cool、21°C，完全不改变 heater；然后在 HTML 表单选出同一结论并点击 Submit。

## 1. Instruction

### 英文原文（逐字）

```text
Review the bedroom request on `/home/user/climate/cooling.html`, choose an available SmartHome device that can provide the requested cooling without using the forbidden device type, apply the setting, record the choice on the page, and submit the form.
```

### 中文翻译

查看 `/home/user/climate/cooling.html` 中的 bedroom 请求，选择一台现有且能提供所需制冷、同时不使用被禁止设备类型的 SmartHome 设备，应用设置，在页面上记录选择并提交表单。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 HTML 附件完整业务内容

运行时路径：`/home/user/climate/cooling.html`

页面标题：`Bedroom cooling choice`。页面列出：

```text
Target temperature: 21 C.
Forbidden device type: heater.
Use only a device that supports cool mode and target temperature control.
```

表单有四个下拉框：

| 字段 | 可选值 |
|---|---|
| Selected device type | Heater / Air conditioner |
| Mode | Heat / Cool |
| Target | 24 C / 21 C |
| Forbidden-device check | Heater used / Heater not used |

点击 Submit 后，页面 JavaScript 会把选择写入 URL query，并追加 `#submitted-cooling-choice`。

### 2.2 SmartHome 初始状态

当前时间：`2026-06-16 19:00`；bedroom 当前 occupied=true。

直接相关设备：

```text
bedroom_air_conditioner_1:
  power=off, mode=auto, target_temperature_c=24

bedroom_heater_1:
  power=off, target_temperature_c=20
```

Bedroom 另有 humidifier 和 light；其他房间还有净化器、灯、窗帘、除湿机和扫地机器人，它们不是本题目标。

## 3. Setup 具体流程

### `linux_0`

1. 删除旧 `cooling.html`；
2. 创建 `/home/user/climate`；
3. 上传 HTML 页面。

Setup 不会自动打开 Chrome，执行者需要手动打开本地文件。

### `home_0`

从 episode config 重置 Home，写入上述 bedroom 空调、heater 以及其他干扰设备；初始 schedules、workflows、history 均为空。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator。

### 4.0 先说人话：怎样才算通过

必须同时满足：

1. bedroom 空调最终为 `on / cool / 21°C`；
2. bedroom heater 与 setup 初态逐字段完全相同；
3. Chrome 中只留下一个非默认目标 tab，其 URL 表示已选择 `air conditioner + cool + 21 + heater not used` 并提交。

### 4.1 空调状态

`bedroom_air_conditioner_1` 必须满足：

```text
power = on
mode = cool
target_temperature_c = 21
```

### 4.2 heater 不得变化

`check_no_device_change` 会把 bedroom heater 的整个 state 与 setup baseline 比较。因此最终仍须是：

```text
power = off
target_temperature_c = 20
```

先误操作 heater 再改回原值，在这个 evaluator 看来最终 state 可通过；任务意图仍是不使用 heater。

### 4.3 浏览器提交 URL

期望 URL 为：

```text
file:///home/user/climate/cooling.html?selected=air+conditioner&mode=cool&target=21&forbidden=heater+not+used#submitted-cooling-choice
```

这不是检查页面文本，而是检查当前非默认 Chrome tabs 的 URL 列表。比较会保留 query 和 fragment，因此最稳妥的方式是按页面下拉框选择后点击 Submit，不要手工改参数名、参数值、顺序或 hash。

`ignore_default_tabs=true` 只忽略浏览器默认 tab；多留另一个普通网页 tab 可能让 URL 列表数量不等而失败。

## 5. 常见失败与真实评测边界

- 选择 heater、heat 或 24°C：URL 和/或 Home 状态失败。
- 空调设置正确但没点击 Submit：浏览器仍停在无 query/hash 的页面，失败。
- 表单选正确但没有实际操作 SmartHome：空调状态失败。
- 改动 heater 后没有恢复：no-device-change 失败。

Evaluator 没有全局命令数检查，也没有检查其他房间设备、schedule 或 workflow；这些不代表允许乱改，只是当前评测边界。

## 6. Cleanup

- 删除 HTML；
- 尝试删除空的 `/home/user/climate`；
- Home reset。

