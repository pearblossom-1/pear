# Core 120 — `linux_smarthome_062`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 120 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_062.json`
- 运行配置：`configs/cross_device/local_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1L+1H`（`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

夜间说明只要求两件事：把 bedroom curtain 完全关上，把已经打开的 bedroom dimmable light 从 80% 调低到 20% 并保持开着。最终必须正好产生两条 Home command，不能顺手调整其他房间或其他 bedroom 设备。

## 1. Instruction

### 英文原文（逐字）

```text
Set up the bedroom for the night — the note in `/tmp/home/docs/night-note.txt` has the details.
```

### 中文翻译

为夜间使用布置 bedroom——具体要求写在 `/tmp/home/docs/night-note.txt` 中。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 `night-note.txt` 原文

```text
Night setup note

Please get the bedroom ready without changing the rest of the home:

- Close the bedroom curtain all the way for privacy.
- Leave the bedroom dimmable light on, but lower it to 20% so it is comfortable for sleep.
```

### 2.2 SmartHome 初始状态

当前时间：`2026-06-16 19:00`，bedroom occupied=true。

直接目标：

```text
bedroom_curtain_1:
  open_pct=75, status=partial

bedroom_dimmable_light_1:
  power=on, brightness_pct=80
```

Bedroom 另有已经开启的 AC（heat 21°C）和 humidifier（low）；其他房间还有窗帘、灯、净化器、dryer 等干扰设备。初始 schedules、workflows、history 均为空。

## 3. Setup 具体流程

### `linux_0`

1. 删除旧 night-note.txt；
2. 创建 `/tmp/home/docs`；
3. 上传说明文件。

Setup 不会自动打开文本文件。

### `home_0`

使用 episode config 重置 Home，写入 bedroom 和其他房间设备初态。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator。

### 4.0 先说人话：怎样才算通过

最终 bedroom dimmable light 必须 `on + 20%`，bedroom curtain 必须 `open_pct=0`，并且 Home command history 总数恰好为 2。

### 4.1 Bedroom light

```text
bedroom_dimmable_light_1:
  power=on
  brightness_pct=20
```

灯不能关掉；要求是“保持开着，但调暗到 20%”。

### 4.2 Bedroom curtain

```text
bedroom_curtain_1:
  open_pct=0
```

Evaluator 只显式检查 `open_pct`，没有单独检查 status 文本；正常 close/set_open_pct 0 会同步得到 closed。

### 4.3 全局命令数

Home command history 总数必须恰好为 2。最直接的两条命令是：

1. 关闭 bedroom curtain；
2. 把 bedroom dimmable light brightness 设为 20。

目标灯本来已经开着，不需要再额外 turn_on；否则 history 会超过 2。

## 5. 常见失败与真实评测边界

- 灯调到 20%但 power=off：失败。
- 窗帘只关到 10%或 20%：不是完全关闭，失败。
- 先 turn_on 已经开启的灯，再调亮度、再关窗帘：三条命令，失败。
- 顺手修改 bedroom AC、humidifier 或其他房间：通常会增加 command history，失败。

Evaluator 没有显式比较其他设备的最终 state，也没有 schedule/workflow count；两条 command 的全局上限约束的是直接设备操作，不等于对计划对象的完整守护。

## 6. Cleanup

- 删除 night-note.txt；
- 尝试移除空的 `/tmp/home/docs` 和 `/tmp/home`；
- Home reset。

