# Core 095 — `linux_android_smarthome_005`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 95 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_005.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Use the Sleep block Calendar event, /tmp/quiet-hours/quiet_hours.xlsx, and the current SmartHome workflows to enforce quiet hours. Cancel the conflicting late-washer workflow, keep the compatible bedroom lights-out workflow active, and record both final decisions in Markor as Quiet Hours Audit.md.
```

### 中文翻译

使用日历中的 `Sleep block` 事件、`/tmp/quiet-hours/quiet_hours.xlsx` 和当前 SmartHome workflows 来执行安静时段规则。取消冲突的深夜洗衣 workflow，保持兼容的卧室熄灯 workflow 为启用状态，并把这两个最终决定记录到 Markor 的 `Quiet Hours Audit.md` 中。

## 2. 输入、附件与初始业务数据

### 2.1 XLSX 附件的完整表格内容

文件：`/tmp/quiet-hours/quiet_hours.xlsx`，工作表 `Sheet1`：

| Window | Cancel if noisy | Keep if quiet | Audit |
|---|---|---|---|
| `22:00-06:00` | `washer;dryer;vacuum` | `lights off` | `Markor quiet-hours audit` |

### 2.2 Android 日历事件

- 标题：`Sleep block`
- 时间：2026-06-16 22:00 至 2026-06-17 06:00
- 地点：`Bedroom`
- 描述：`Quiet hours apply.`

### 2.3 SmartHome 初始 workflows

当前时间为 `2026-06-16 19:00`。已有两条 active workflow：

| workflow ID | 时间 | 动作 | 与安静时段的关系 |
|---|---|---|---|
| `bedroom_lights_out` | 22:10 | 关闭 `bedroom_light_1` | 安静动作，应保留 |
| `late_washer` | 23:15 | `laundry_room_washer_1` 启动 normal cycle | 噪声动作，应取消 |

## 3. Setup 具体流程

- `linux_0`：创建 `/tmp/quiet-hours` 并上传 XLSX。
- `android_0`：清空日历后写入 Sleep block；确保 Markor 可用并删除旧的 `Quiet Hours Audit.md`。
- `home_0`：重置到上述两个 workflow 都处于 active 的状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，通常各占 `1/3`。

### 4.0 先说人话：怎样才算通过

只取消 `late_washer`，不要取消或重建 `bedroom_lights_out`。最终后者仍是唯一 active workflow。再创建指定 Markor 笔记，肯定地写明“late washer 已取消，bedroom lights-out 仍 active”。

最稳妥的正文：

```text
Quiet hours audit: late washer cancelled and bedroom lights-out remains active.
```

### 4.1 Markor 笔记 evaluator

- 精确路径：`/storage/emulated/0/Documents/Markor/Quiet Hours Audit.md`。
- 必须出现 `Quiet hours`、`late washer/late_washer`、`bedroom lights-out/bedroom_lights_out`。
- 必须同时包含 `cancelled/retired` 和 `active/kept` 两组结论。
- `cancelled` 被允许用于旧 workflow 的决定。
- 出现 `pending`、`late washer active` 或 `lights-out cancelled` 会失败；疑问、不确定和否定关系也会失败。

### 4.2 `late_washer` 状态 evaluator

按固定 workflow ID `late_washer` 查找记录，要求其状态是 `cancelled`。直接删除它不能替代取消。

### 4.3 active workflow 数量 evaluator

- `bedroom_lights_out` 必须仍是 active；
- 匹配该 ID 和状态的记录必须恰好 1 条；
- 整个 SmartHome 中 active workflow 总数必须恰好为 1；
- 已取消的 `late_washer` 记录可以继续存在，额外 active workflow 不可以。

日历与 XLSX 是做出选择的输入，evaluator 不单独检查你是否打开过它们；最终笔记和两条 workflow 状态才直接计分。

