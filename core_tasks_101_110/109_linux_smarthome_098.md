# Core 109 — linux_smarthome_098

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 109 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_098.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：medium
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

CSV 只有两条 living-room 设置：

- dimmable light brightness → 35；
- curtain open percent → 40。

Home 初始是 light on/80、curtain 100/open，所以两项都需要改变。最终 evaluator 只看这两台设备的目标字段，不要求 Linux 输出文件。

## 1. Instruction

### 英文原文（逐字）

~~~text
The room-prep sheet at `/tmp/home/actions/room_prep.csv` has the living-room settings; please apply them.
~~~

### 中文翻译

/tmp/home/actions/room_prep.csv 中的房间准备表包含客厅设置，请应用这些设置。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 room_prep.csv

运行时路径：/tmp/home/actions/room_prep.csv

~~~csv
room,setting,value
living room,dimmable light brightness,35
living room,curtain open percent,40
~~~

没有第三条设置，也不要求修改或另存 CSV。

### 2.2 SmartHome 初始状态

当前时间：2026-06-16 19:00；初始 schedules、workflows、history 均为空。

| 设备 | 初始状态 | 目标 |
|---|---|---|
| living_room_dimmable_light_1 | power=on，brightness_pct=80 | on，35 |
| living_room_curtain_1 | open_pct=100，status=open | open_pct=40 |

Home 还有 bedroom、guest_room、study 等无关设备。

## 3. Setup 具体流程

### linux_0

1. 删除旧 room_prep.csv；
2. 创建 /tmp/home/actions；
3. 上传 CSV。

### home_0

从 episode_config.json 重置 Home，恢复 living-room 两台设备和其他初始设备状态。

Setup 不会自动打开 CSV。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

最终只要 evaluator 看到：

    living_room_dimmable_light_1: power=on, brightness_pct=35
    living_room_curtain_1: open_pct=40

两项都满足即可。标准操作是 set_brightness 35 和 set_open_pct 40。

### 4.1 Living-room dimmable light

设备状态必须至少包含：

    power = on
    brightness_pct = 35

这是子集匹配；设备记录中的其他字段不影响。

### 4.2 Living-room curtain

设备状态必须至少包含：

    open_pct = 40

Evaluator 没有显式检查 status，但正常 set_open_pct 40 会使状态成为 partial。

### 4.3 真实评测边界

本任务只有上述两个 device-state evaluator：

- 没有 command history 数量或命令身份检查；
- 没有 no-device-change 守护；
- 没有 schedule/workflow 检查；
- 没有 CSV 内容或文件存在性 evaluator；
- 没有 Linux 输出文件。

因此纯 evaluator 只保证这两个最终字段正确。额外操作其他设备、先改错再改回，理论上可能仍通过，但违反 instruction，不能视为正确完成。

## 5. 常见失败与真实评测边界

- 把 35 当成在原 80 上减少 35，设成 45：失败。
- 把 curtain 设成关闭 40%，即 open_pct=60：失败。
- 只调灯不调窗帘，或反之：对应设备 evaluator 失败。
- 创建未来 schedule 而不改变当前设备：最终 state 仍不对，失败。

不需要保存任何结果文件，也不需要在 CSV 中打勾。

## 6. Cleanup

- Linux 删除 room_prep.csv，并尝试删除空的 /tmp/home/actions 与 /tmp/home；
- Home reset。
