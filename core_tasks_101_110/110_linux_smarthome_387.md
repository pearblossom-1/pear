# Core 110 — linux_smarthome_387

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 110 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_387.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：medium
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

HTML 列出三条空调 mode 请求：

- living room → cool：受支持，执行；
- bedroom → eco：SmartHome 空调模式不含 eco，不支持，保持不变；
- study → auto：受支持，执行。

因此 living-room AC 最终 on/cool，study AC 最终 on/auto，bedroom AC 必须完整保持 off/cool/24；然后在网页三个下拉框记录 supported/unsupported 结果并点击 Submit。

## 1. Instruction

### 英文原文（逐字）

~~~text
Review each request on `/home/user/climate/mode-check.html` against the available SmartHome capabilities. Apply only supported mode changes, record the outcome for every row using the page's choices, and submit the form.
~~~

### 中文翻译

将 /home/user/climate/mode-check.html 上的每条请求与可用 SmartHome 能力进行核对。只执行受支持的模式更改，使用页面提供的选项记录每一行结果，然后提交表单。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 mode-check.html 的完整业务内容

页面标题和 H1：Climate mode check。

说明：

- Check supported mode for each row.
- Rows: living room cool, bedroom eco, study auto.
- Execute only supported mode requests.

表单：

| 请求 | 下拉选项 |
|---|---|
| Living room — cool | Unsupported — kept unchanged / Supported — executed |
| Bedroom — eco | Supported — executed / Unsupported — kept unchanged |
| Study — auto | Unsupported — kept unchanged / Supported — executed |

注意各字段默认显示的第一个选项并不都正确，必须逐行选择。

Submit 会将三个字段写入 URL query，并添加 #submitted-mode-check。

### 2.2 SmartHome 初始状态与能力结论

当前时间：2026-06-16 19:00；初始 schedule、workflow、history 为空。

| 设备 | 初始状态 | 请求 | 结论 |
|---|---|---|---|
| living_room_air_conditioner_1 | off、auto、24°C | cool | 支持，执行后 on/cool |
| bedroom_air_conditioner_1 | off、cool、24°C | eco | 不支持，整台设备保持不变 |
| study_air_conditioner_1 | off、cool、24°C | auto | 支持，执行后 on/auto |

系统允许的空调模式集合是 auto、cool、dry、fan、heat，不含 eco。

## 3. Setup 具体流程

### linux_0

1. 删除旧 mode-check.html；
2. 创建 /home/user/climate；
3. 上传 HTML。

### home_0

从 episode_config.json 重置 Home，写入三个房间和三台空调的上述初态。

Setup 不会自动打开 HTML。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

要同时满足：

1. living-room AC 为 on/cool；
2. study AC 为 on/auto；
3. bedroom AC 的完整 state 与 setup 一样；
4. 提交后的浏览器 URL 准确记录三行判断。

### 4.1 Living-room AC

必须至少满足：

    power = on
    mode = cool

target_temperature_c 没有被这一项检查。

### 4.2 Study AC

必须至少满足：

    power = on
    mode = auto

target_temperature_c 没有被这一项检查。

### 4.3 Bedroom AC 完整不变

check_no_device_change 会把 bedroom_air_conditioner_1 当前整个 state 与 setup baseline 比较，而不是只看 mode：

    power = off
    mode = cool
    target_temperature_c = 24

任何字段改变都失败。不能尝试 set_mode eco，也不能把它打开后再只恢复 mode。

### 4.4 提交后的 URL

忽略默认 tab 后，浏览器非默认 tab 必须匹配：

    file:///home/user/climate/mode-check.html?living_room=cool+supported+executed&bedroom=eco+unsupported+kept&study=auto+supported+executed#submitted-mode-check

含义分别是：

- living_room：cool supported executed；
- bedroom：eco unsupported kept；
- study：auto supported executed。

query、fragment 和字段值都参与 URL 比较；应通过原页面下拉框和 Submit 按钮生成。额外非默认 tab 也可能使 tab 列表数量不一致。

### 4.5 真实评测边界

- 没有 command history 数量或命令身份检查；
- 没有其他设备 no-change 守护；
- 没有 schedule/workflow 检查；
- living/study 的 target temperature 不评分。

因此 evaluator 只严格保护 bedroom，并检查两台目标空调的 power/mode。额外操作其他设备理论上可能仍通过，但违反“only supported mode changes”。

## 5. 常见失败与真实评测边界

- 把 bedroom eco 当成支持并执行：no-device-change 和 URL 都失败。
- living room 只设 mode=cool 但仍 off：power evaluator 失败。
- study 只开机但 mode 仍 cool：mode evaluator 失败。
- 三台 Home 状态正确但网页没 Submit：缺完整 query/hash，失败。
- 只改 URL 不操作 Home：设备 evaluator 失败。
- 额外打开普通网页 tab：可能导致 tab 列表不等，失败。

## 6. Cleanup

- Linux 删除 mode-check.html，并尝试删除空目录；
- Home reset。
