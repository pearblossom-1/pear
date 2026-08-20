# Core 113 — `linux_smarthome_063`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 113 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_063.json`
- 运行配置：`configs/cross_device/local_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1L+1H`（`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

这是一个很直接的状态设置题。HTML 明确说 kitchen 的 PM2.5 高，需要把 kitchen purifier 打开并设为 high。最终只评测这台净化器是否为 `on + high`。

## 1. Instruction

### 英文原文（逐字）

```text
The recovery note is in /tmp/home/pages/kitchen-recovery.html; apply the kitchen air instruction.
```

### 中文翻译

恢复说明位于 `/tmp/home/pages/kitchen-recovery.html`；请执行其中关于 kitchen 空气处理的指令。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 HTML 原文

运行时路径：`/tmp/home/pages/kitchen-recovery.html`

```html
<h1>Kitchen recovery</h1><p>PM2.5 is high. Turn on the kitchen purifier at high level.</p>
```

大白话就是：打开 kitchen 空气净化器，并把档位设为 high。

### 2.2 SmartHome 初始状态

当前时间：`2026-06-16 19:00`。Kitchen 当前 occupied=true，PM2.5=54.8。

目标设备：

```text
kitchen_air_purifier_1: power=off, level=low
```

Kitchen 还有除湿机、两盏灯和正在 cleaning 的扫地机器人；其他房间也有多台干扰设备。初始 schedules、workflows、history 均为空。

## 3. Setup 具体流程

### `linux_0`

1. 删除旧 HTML；
2. 创建 `/tmp/home/pages`；
3. 上传 `kitchen-recovery.html`。

Setup 不会自动打开该页面。

### `home_0`

使用任务 episode config 重置 Home 到上述环境和设备初态。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator：读取 `kitchen_air_purifier_1` 的最终 state，并要求：

```text
power = on
level = high
```

这是字段子集匹配，不是检查操作步骤，也不要求生成 Linux 文件或提交浏览器页面。

### 4.0 先说人话：怎样才算通过

最终 kitchen purifier 同时开机且为 high 即通过。只开机仍为 low 不通过；只写说明、不操作 Home 也不通过。

## 5. 常见失败与真实评测边界

- 操作 bedroom purifier：目标设备 ID 不对，失败。
- kitchen purifier 设为 medium 或 low：失败。
- 只把 level 设为 high 但 power 仍 off：失败。

当前 evaluator 不检查全局 command history、不保护其他设备，也不检查 schedules/workflows 或浏览器 tab。这是实际评测边界，不是任务允许修改其他设备。

## 6. Cleanup

- 删除 HTML；
- 尝试移除空的 `/tmp/home/pages` 和 `/tmp/home`；
- Home reset。

