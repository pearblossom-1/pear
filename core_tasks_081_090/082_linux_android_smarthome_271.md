# Core 082 — `linux_android_smarthome_271`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 82 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_271.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：hard
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

联系人把 `+1555027101` 确认为 Owner，XLSX 把 Owner SMS 标为 `highest`、Calendar 标为 `fallback`，所以应选短信中的新请求。短信直接给出 21:00、客厅灯 off、客厅窗帘 closed；SmartHome 中仍有 20:00 的 `old_evening_mode`。因此要取消旧 workflow，建立唯一一条 21:00 active workflow，并在 Markor 说明“Owner 新方案已生效、旧 fallback 已取消”。

## 1. Instruction

### 英文原文（逐字）

```text
The Owner has sent an evening-mode update that may replace the Calendar fallback. Use the Owner contact and SMS with `/tmp/conflicts/priority.xlsx` to confirm which request has priority. Retire the outdated evening workflow, schedule the authorized replacement at the requested time with its light and curtain settings, and summarize the old-to-new decision in Markor as `Evening priority decision.md`.
```

### 中文翻译

Owner 发来一项 evening mode 更新，它可能取代日历中的备用方案。结合 Owner 联系人、Owner 短信和优先级表确认哪一个请求优先；停用旧 evening workflow，按获授权请求的时间和灯光/窗帘设置建立替代 workflow，并在 Markor 的 `Evening priority decision.md` 中简要记录从旧方案切换到新方案的决定。

## 2. 输入、附件与初始业务数据

### 2.1 Linux 优先级表

路径：`/tmp/conflicts/priority.xlsx`，`Sheet1` 内容：

| Source | Priority | Offset |
|---|---|---|
| Owner SMS | highest | 30 minutes before |
| Calendar | fallback | 30 minutes before |

真正决定优先级的是 `Owner SMS = highest`、`Calendar = fallback`。本任务 evaluator 最终固定要求的新 workflow 时间是 Owner 短信直接指定的 `21:00`；表中的 Offset 不会把它改评为 20:30。

### 2.2 Android 日历、短信与联系人

- 日历事件：`Evening mode`
- 时间：2026-06-16 20:30–21:00
- 地点：`Home`
- 描述：`Old evening mode source.`
- 收到来自 `+1555027101` 的短信：

```text
Owner update: at 21:00, turn off the living-room light and close the living-room curtain.
```

- 联系人：`House Owner`
- 电话：`+1555027101`
- 备注：`Role: Owner`

Markor 中的目标文件在 setup 时会被删除，必须重新创建在：

```text
/storage/emulated/0/Documents/Markor/Evening priority decision.md
```

### 2.3 SmartHome 初始状态

当前时间 `2026-06-16 19:30`。已有一个启用中的旧 workflow：

```text
workflow_id=old_evening_mode
run_at=2026-06-16T20:00:00
effect=living_room_light_1 turn_off
status=active
```

相关设备初始值：

- `living_room_light_1`：on；
- `living_room_curtain_1`：open_pct=75；
- 初始无 schedule。

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/conflicts` 并上传 `priority.xlsx`。

### `android_0`

清空并写入日历事件；清空短信并注入 Owner 的来信；清空联系人并加入 `House Owner`；确保 Markor 可用并删除旧的目标笔记。

### `home_0`

重置为上述时间、设备状态以及仍处于 active 的 `old_evening_mode`。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator；满分需要笔记、旧 workflow、新 workflow 三项都通过。

### 4.0 先说人话：怎样才算通过

- 把 `old_evening_mode` 的状态改为 cancelled；
- 新建唯一一个 active workflow，在 `2026-06-16 21:00` 关闭客厅普通灯并把客厅窗帘关到 0%；
- 创建指定 Markor 文件，用肯定语气写清 Owner 方案已启用、21:00、新 workflow 已生效、旧 fallback 已取消。

最稳妥的笔记：

```text
Owner priority applied: the old fallback is cancelled and the 21:00 replacement evening workflow is active.
```

### 4.1 Markor 笔记 evaluator

- 路径必须精确为 `/storage/emulated/0/Documents/Markor/Evening priority decision.md`。
- 不是整篇绝对匹配，但正文必须分别匹配：
  - `Owner`；
  - `21:00` 或 `9:00 PM`；
  - `old fallback` 或 `old evening`；
  - `evening workflow` 或 `replacement workflow`；
  - `applied` 或 `active` 至少一个；
  - `cancelled` 或 `retired` 至少一个。
- `pending`、`proposed`、`old fallback remains`、`replacement workflow cancelled` 会失败。
- 问句、不确定表达、否定这些已应用关系会失败；`cancelled` 被专门允许用来说明旧方案已取消。
- 笔记 evaluator 本身不要求写出 light off 或 curtain closed；这两个动作由 SmartHome evaluator 单独保证。

### 4.2 旧 workflow evaluator

在 workflow 列表中查找 `workflow_id=old_evening_mode`，要求其最终 `status=cancelled`。它是按 ID 与状态查找，不要求删除旧记录。

### 4.3 新 workflow evaluator

- active workflow 总数必须恰好为 1；取消后的旧 workflow 不计入 active 数。
- 唯一 active workflow 的执行时间必须精确为 `2026-06-16T21:00:00`。
- workflow 步骤合并后的效果必须精确为：

```text
living_room_light_1   power=off
living_room_curtain_1 open_pct=0
```

- 新 workflow 的 ID 没有写死，可以自定。
- 多建一个 active workflow，或向这个 workflow 加入额外设备/额外效果，都会使“active 数量”或“精确效果集合”不匹配。

## 5. 常见失败与真实评测边界

- 把 Owner 行的 `30 minutes before` 套到短信的 21:00，建立 20:30 workflow：失败。Evaluator 和正向 oracle 都固定要求 21:00；这是当前输入表中真实存在的歧义/误导字段。
- 删除旧 workflow 而不是把 `old_evening_mode` 留成 cancelled 记录：status evaluator 找不到该 ID，失败。
- 新 workflow 时间和动作正确，但旧 workflow 仍 active：旧状态项失败，而且 active 总数通常也会变成 2。
- 只立即关灯/关窗帘、不建立 workflow：设备终态不是评分目标，失败。
- 笔记只写“done”，没有 Owner、21:00、旧 fallback、新 workflow 等实体：失败。

新 workflow 的 ID 不固定，步骤顺序也不固定；`close` 与 `set_open_pct(0)` 都会被规范化成相同窗帘效果。笔记不直接检查 light/curtain 两个动作，SmartHome workflow 项负责检查它们。Evaluator 没有检查 Calendar、SMS、联系人和 XLSX 在执行后是否仍保持原样。

## 6. Cleanup

- Linux 删除 `/tmp/conflicts/priority.xlsx`，并尝试移除空目录。
- Android 清空 Calendar、SMS、Contacts，并删除目标 Markor 笔记。
- SmartHome reset。
