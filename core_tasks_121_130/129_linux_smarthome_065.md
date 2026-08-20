# Core 129 — linux_smarthome_065

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 129 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_065.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：easy
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

ODS 只有一句业务要求：Start washer on quick cycle。

Home 的 washer 当前 off / idle，cycle 已是 quick。正确操作是对 laundry_room_washer_1 执行 start_cycle(cycle="quick")。最终必须是 power=on、status=running、cycle=quick。

不需要修改 ODS，也不需要创建 Linux 输出文件。

## 1. Instruction

### 英文原文（逐字）

~~~text
Start the laundry load according to the sheet at `/tmp/home/sheets/laundry.ods`.
~~~

### 中文翻译

按照 /tmp/home/sheets/laundry.ods 中的表格要求启动这次洗衣。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片、音频、DOCX 或 PDF 附件。

### 2.1 laundry.ods 的完整可见内容

工作簿只有 Sheet1，两行非空内容：

| 行 | A 列 |
|---|---|
| 1 | Laundry sheet |
| 2 | Start washer on quick cycle. |

该 ODS 包非常简单，只包含 mimetype、content.xml 和 manifest.xml；没有公式、额外 sheet 或嵌入媒体。

### 2.2 Home 初始相关状态

当前时间：2026-06-16 19:00。

laundry_room_washer_1：

    power = off
    cycle = quick
    remaining_min = 0
    status = idle

同一房间的 laundry_room_dryer_1 正在运行：

    power = on
    cycle = quick
    remaining_min = 9
    status = running

dryer 不是本题目标，不应操作。

washer 支持的 cycle 为 quick、normal、heavy、delicate。start_cycle("quick") 会把 washer 设为 on/running/quick，并把 remaining_min 设为 30。

## 3. Setup 具体流程

### linux_0

1. 删除旧 /tmp/home/sheets/laundry.ods。
2. 创建 /tmp/home/sheets。
3. 上传 ODS。

### home_0

从 linux_smarthome_065/episode_config.json reset 完整 Home，恢复上述 washer/dryer 状态、19:00 时钟以及空 schedules/workflows/history。

Setup 不会自动打开 ODS，也不会启动 washer。

## 4. 标准操作

对 home_0 执行：

~~~text
device_id = laundry_room_washer_1
command = start_cycle
args = {"cycle": "quick"}
~~~

不需要先 set_cycle，因为 start_cycle 自身接受 cycle 参数；虽然初始 cycle 已是 quick，但单纯 set_cycle 不会把机器启动。

## 5. Evaluator：评测方式与具体评测点

本题只有一个 Home 状态 evaluator。laundry_room_washer_1 最终必须同时满足：

    power = on
    status = running
    cycle = quick

这是字段子集匹配。Evaluator 没有检查 remaining_min，但正常 start_cycle quick 会得到 30。

Evaluator 也没有检查：

- ODS 是否被打开或修改；
- Linux 输出文件，因为本题没有 Linux output；
- dryer 是否保持不变；
- command history 数量；
- schedules/workflows；
- 其他 Home 设备。

因此通过的决定性条件就是 washer 的三个最终字段。业务上不要操作 dryer 或题外设备。

## 6. Core manifest 元数据提示

Core manifest 的 apps_or_surfaces 把该项标成含 smarthome_schedule 和 smarthome_workflow，但任务文件实际只有即时 home_command，setup/evaluator 也没有计划或 workflow。任务本地 metadata.surfaces 的 linux_gui_source、home_command 更符合真实内容。

## 7. 常见失败

- 只设置 cycle=quick，不调用 start_cycle：仍 idle/off，失败。
- 启动 dryer 而非 washer：washer 状态不变，失败。
- 启动 washer 的 normal/heavy/delicate：cycle 不等于 quick，失败。
- 只 turn_on（washer 本身没有通用 turn_on 命令）：无法得到 running 状态。
- 修改 ODS 作为“完成记录”没有任何加分，也不能代替 Home 操作。

## 8. Cleanup

- linux_0 删除 laundry.ods，并从 /tmp/home 下尝试删除空目录。
- home_0 reset。

