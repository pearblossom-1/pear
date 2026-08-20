# Core 124 — linux_smarthome_348

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 124 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_348.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：medium
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

heating.json 和 cooling.json 都针对 guest room，但一个要求 heat 24°C，一个要求 cool 20°C。priority.docx 的规则是“选择批准时间更新的请求”：

- heating 批准于 18:10；
- cooling 批准于 18:40；
- 因此 cooling.json 胜出。

必须把 guest-room AC 设为 on / cool / 20°C，并新建 conflict.json 记录 selected、ignored、mode 和 target_temperature_c。

## 1. Instruction

### 英文原文（逐字）

~~~text
There's a conflict between `/tmp/climate/heating.json` and `/tmp/climate/cooling.json` — use `/tmp/climate/priority.docx` to resolve it, apply the winner, and save the result to `/tmp/climate/conflict.json`.
~~~

### 中文翻译

/tmp/climate/heating.json 与 /tmp/climate/cooling.json 之间存在冲突——使用 /tmp/climate/priority.docx 解决冲突，应用胜出的请求，并将结果保存到 /tmp/climate/conflict.json。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或音频附件。

### 2.1 heating.json

~~~json
{
  "room": "guest room",
  "mode": "heat",
  "target": 24,
  "approved_at": "18:10"
}
~~~

### 2.2 cooling.json

~~~json
{
  "room": "guest room",
  "mode": "cool",
  "target": 20,
  "approved_at": "18:40"
}
~~~

### 2.3 priority.docx 的完整可见文字

~~~text
Priority rule
When heating and cooling conflict, use the newer approved request.
Save conflict.json with keys selected, ignored, mode, and target_temperature_c.
~~~

该 DOCX 共 1 页，无表格、页眉、页脚、批注、脚注、尾注或修订痕迹。

### 2.4 Home 初始相关状态

当前时间：2026-06-16 19:00。

guest_room_air_conditioner_1：

    power = off
    mode = auto
    target_temperature_c = 22

Home 还包含其他房间和设备，但三个 evaluator 断言只涉及 guest-room AC 与 conflict.json。

## 3. Setup 具体流程

### linux_0

1. 删除旧 heating.json、cooling.json、priority.docx 和 conflict.json。
2. 创建 /tmp/climate。
3. 上传前三个输入文件。
4. conflict.json 不会预先存在，需由任务执行者创建。

### home_0

从 linux_smarthome_348/episode_config.json reset Home，恢复 19:00 的完整 Home 状态、空 schedules/workflows/history。

## 4. 标准操作与输出

Home 应执行：

    guest_room_air_conditioner_1.turn_on()
    guest_room_air_conditioner_1.set_mode(mode="cool")
    guest_room_air_conditioner_1.set_target_temperature(temperature_c=20)

推荐 conflict.json：

~~~json
{
  "selected": "cooling.json",
  "ignored": "heating.json",
  "mode": "cool",
  "target_temperature_c": 20
}
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

两个 evaluator 都计分且都必须通过：Home 最终状态正确，conflict.json 的四个指定值正确。

### 5.1 Home 状态

guest_room_air_conditioner_1 必须同时满足：

    power = on
    mode = cool
    target_temperature_c = 20

这是字段子集匹配；未列出的状态字段不会参与比较。

### 5.2 conflict.json

check_json 解析有效 JSON 后，按 key 精确比较：

| key | 必须等于 |
|---|---|
| selected | cooling.json |
| ignored | heating.json |
| mode | cool |
| target_temperature_c | 数字 20 |

字符串区分大小写，文件名也必须包含 `.json`。数字 20 不应写成字符串 `"20"`。

该 evaluator 只检查四个 key 的值；没有禁止额外字段，也不在意 JSON object 的书写顺序或空白缩进。

## 6. 常见失败与真实评测边界

- 按“更早批准”选择 heating：Home 和 JSON 都失败。
- 只把 mode 改为 cool，但 AC 仍 off 或 target 仍 22：失败。
- Home 正确但 selected 写成 `cooling`：失败。
- JSON 正确但路径不是 /tmp/climate/conflict.json：失败。
- 本题未检查其他 Home 设备、command history、schedule 或 workflow 是否变化；不要因此进行题外操作。

## 7. Cleanup

- linux_0 删除四个 climate 文件，并尝试删除空的 /tmp/climate。
- home_0 reset。

