# Core 016 — `a2_alarm_conflict_log`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 16 项
- 任务文件：`tasks/cross_device/real200/a2_alarm_conflict_log.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 设备拓扑：`2A`（`android_0`、`android_1`）
- 限制：最多 100 步，最长 780 秒

## 1. Instruction

### 英文原文（逐字）

```text
The Clock app on the second phone already has an enabled `Depot preparation` alarm at 07:50 as an early fallback, and it should stay. The first phone's Simple Calendar Pro event gives the actual departure time. Add an enabled `Depot departure` alarm at that calendar time on the second phone. Then write an `Alarm fix` note in Markor on the first phone that summarizes the two-alarm sequence from the preparation fallback to the actual departure, including both alarm labels and times.
```

### 中文翻译

第二部手机的 Clock 应用中已经有一个启用的 `Depot preparation` 闹钟，时间为 07:50，它是提前准备的后备闹钟，应当保留。第一部手机的 Simple Calendar Pro 事件给出了实际出发时间。请在第二部手机上按该日历时间新增一个启用的 `Depot departure` 闹钟。然后在第一部手机的 Markor 中写一篇 `Alarm fix` 笔记，总结从准备后备闹钟到实际出发闹钟的两闹钟顺序，并包含两个闹钟的标签和时间。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的 Calendar 事件

| 字段 | 值 |
|---|---|
| 标题 | `Depot departure` |
| 开始时间 | `2026-06-18 08:20`（任务设备时间） |
| 结束时间 | `2026-06-18 09:20` |
| 地点 | `Depot Gate 4` |
| 描述 | `Actual departure time for the Depot departure alarm. Keep the existing early preparation alarm on the other phone.` |

### 2.2 第二部手机的已有闹钟

| 标签 | 时间 | 状态 | 含义 |
|---|---|---|---|
| `Depot preparation` | `07:50` | 已启用 | 提前准备用的 fallback，必须保留 |

### 2.3 目标 Markor 笔记

- 路径：`/storage/emulated/0/Documents/Markor/Alarm fix.md`
- Setup 会先删除同名旧文件。

## 3. Setup 具体流程

### `android_0`

1. 确保 Simple Calendar Pro 和 Markor 可用。
2. 清空日历并新增上述 `Depot departure` 事件。
3. 创建 Markor 目录并删除旧的 `Alarm fix.md`。

### `android_1`

1. 确保 Clock 可用。
2. 清空闹钟。
3. 新增并启用 `Depot preparation`、`07:50`。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，各占 `1/3`；完整通过要求三项都成功。

### 4.0 先说人话：怎样才算通过

第二部手机最终至少要同时存在这两个已启用闹钟：

```text
Depot preparation — 07:50
Depot departure — 08:20
```

第一部手机创建 `Alarm fix.md`，最稳妥的一句话是：

```text
Depot departure: from Depot preparation 07:50 to Depot departure 08:20.
```

不能删除或关闭 07:50 的后备闹钟，也不能把笔记写成“建议改”“尚未确认”或相反方向。

### 4.1 两个闹钟（各占 `1/3`）

- 两项均使用 `androidworld_alarm` 直接读取 Clock 数据。
- 第一项要求标签 `Depot preparation`、07:50、`enabled=true`。
- 第二项要求标签 `Depot departure`、08:20、`enabled=true`。
- 标签、小时、分钟或启用状态任一不符都会失败。
- evaluator 是两个“必须存在”检查，没有声明闹钟总数，所以无关额外闹钟不会单独导致失败。

### 4.2 `Alarm fix.md`（权重 `1/3`）

- `result.type`：`android_change_note_state`
- evaluator 读取指定路径的全文，并要求恰好表达一条一致的 old→new 关系。
- old 侧必须同时关联 `Depot preparation` 与 `07:50`。
- new 侧必须同时关联 `Depot departure` 与 `08:20`。
- 关系上下文还必须包含实体 `Depot departure`。
- 可使用 `from ... to ...`、`old/new`、箭头或等价的更改表达；但写出多条相互独立的变更关系、把新旧值混到同一侧、声称 unchanged、否定或后文反转都会失败。

