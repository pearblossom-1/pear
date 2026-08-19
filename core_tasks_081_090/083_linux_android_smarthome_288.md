# Core 083 — `linux_android_smarthome_288`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 83 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_288.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：hard
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

联系人确认短信号码属于 guest-room routine 的 Owner；规则表明确 Owner SMS 优先，目标时间 21:30，动作是客房灯 on、窗帘 closed，而 20:00 的 Old Calendar 仅是 fallback。SmartHome 中恰有对应旧 workflow `old_guest_room_routine`。因此要取消旧 workflow，建立唯一一条 21:30 active workflow，并在 Markor 把来源、时间、两项动作及旧转新的状态写清楚。

## 1. Instruction

### 英文原文（逐字）

```text
The Owner has sent an updated guest-room routine that may supersede the Calendar fallback. Confirm the authority and timing with the Owner contact, the Owner SMS, and `/tmp/conflicts/rules_288.xlsx`. Retire the old guest-room workflow, schedule the authorized replacement with the requested light and curtain settings, and leave a concise account of the change in Markor as `Guest room decision 288.md`.
```

### 中文翻译

Owner 发来一项更新后的客房 routine，它可能取代日历备用方案。结合 Owner 联系人、Owner 短信和 `rules_288.xlsx` 确认权限与时间；停用旧客房 workflow，按获授权的新请求建立包含灯光和窗帘设置的替代 workflow，并在 Markor 的 `Guest room decision 288.md` 中简短记录这次变更。

## 2. 输入、附件与初始业务数据

### 2.1 Linux 规则表

路径：`/tmp/conflicts/rules_288.xlsx`，`Sheet1`：

| Source | Priority | Target time | Action | Use when |
|---|---|---|---|---|
| Owner SMS | highest | 21:30 | Turn on the guest-room light and close the guest-room curtain. | Use this source for the updated routine. |
| Old Calendar | fallback | 20:00 | Existing guest-room routine only; cancel it if another source wins. | Fallback only. |

所以应选 Owner 行：21:30、客房灯打开、客房窗帘关闭；旧 Calendar 行只作 fallback。

### 2.2 Android 日历、短信与联系人

- 日历事件：`Guest-room routine update`
- 时间：2026-06-16 20:30–21:00
- 地点：`Guest room`
- 描述：`Old calendar routine source; use only as fallback if the priority sheet selects Old Calendar.`
- 来自 `+1555000288` 的短信原文：

```text
Owner SMS: use the updated guest-room routine at 21:30; turn on the light and close the curtain.
```

- 联系人：`Guest routine owner`
- 电话：`+1555000288`
- 备注：`Role: Owner for guest-room routine decisions.`

目标 Markor 文件会在 setup 时被删除：

```text
/storage/emulated/0/Documents/Markor/Guest room decision 288.md
```

### 2.3 SmartHome 初始状态

当前时间 `2026-06-16 19:00`。已有：

```text
workflow_id=old_guest_room_routine
run_at=2026-06-16T20:00:00
effect=guest_room_light_1 turn_on
status=active
```

相关设备初始值：

- `guest_room_light_1`：off；
- `guest_room_curtain_1`：open_pct=80；
- 初始无 schedule。

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/conflicts` 并上传规则表。

### `android_0`

依次准备 Simple Calendar Pro、Simple SMS Messenger、Contacts 和 Markor：清空对应数据，写入上面的旧日历源、Owner 来信和 Owner 联系人，并删除旧目标笔记。

### `home_0`

重置 SmartHome，使旧 workflow 仍处于 active，等待执行者显式取消。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator。

### 4.0 先说人话：怎样才算通过

- 取消 `old_guest_room_routine`；
- 新建唯一 active workflow，时间为 `2026-06-16 21:30`，效果只有客房灯 on 和客房窗帘 0%；
- 创建指定 Markor 笔记，明确写 Owner、21:30、旧 fallback 已取消、新 workflow 已启用、灯开、窗帘关。

最稳妥的笔记：

```text
Owner rule applied: the old fallback is cancelled and the 21:30 new guest-room workflow is active with the light on and curtain closed.
```

### 4.1 Markor 笔记 evaluator

- 文件路径必须精确匹配。
- 正文不是固定整句，但以下 6 组实体都必须各命中一种说法：
  - `Owner`；
  - `21:30` 或 `9:30 PM`；
  - `old fallback` 或 `old guest-room workflow`；
  - `new workflow` 或 `guest-room workflow`；
  - `light on` 或 `turn on the light`；
  - `curtain closed` 或 `close the curtain`。
- 还必须含 `applied/active` 中至少一个，以及 `cancelled/retired` 中至少一个。
- `pending`、`proposed`、`new workflow cancelled`、`old fallback remains` 会失败；问句、不确定或否定关系也会失败。
- 这些只是关键词/短语组的自然语言关系匹配，不要求完全照抄示例句，也没有配置 clause-level relation group。

### 4.2 旧 workflow evaluator

要求列表中存在 `workflow_id=old_guest_room_routine` 且状态为 `cancelled`。保留取消记录即可，不是删除记录。

### 4.3 替代 workflow evaluator

- active workflow 总数恰好为 1。
- 执行时间精确为 `2026-06-16T21:30:00`。
- 步骤合并后的效果必须精确为：

```text
guest_room_light_1   power=on
guest_room_curtain_1 open_pct=0
```

- workflow ID 没有固定。
- 可以用 `close` 或能规范化为 `open_pct=0` 的合法命令；最终 canonical effect 才是比对对象。
- 加入第三个设备、额外效果，或留下第二个 active workflow，都会失败。

## 5. 常见失败与真实评测边界

- 采用 Old Calendar 的 20:00 fallback，而不是 Owner SMS/规则表的 21:30：新 workflow evaluator 失败。
- 只更新原 workflow 的时间/步骤，却没有让 `old_guest_room_routine` 形成 cancelled 记录：旧 workflow status 项失败。
- 窗帘写成 100% open 或只开灯不关窗帘：精确 effects 不相等。
- 笔记没有同时说明旧方案已取消和新方案已启用，或写成 `proposed/pending`：语义 evaluator 失败。

联系人、SMS 和规则表是用来推导授权与值的输入，最终 evaluator 不回查这些输入是否被保留。旧 workflow 只按固定 ID+cancelled 查找；新 workflow 的 ID 可自定。笔记实体是对全文做自然语言关系匹配，没有配置“这些词必须位于同一个 clause”的额外 contract，但问句、不确定、冲突短语和被否定的结果仍会失败。

## 6. Cleanup

- Linux 删除 `rules_288.xlsx` 并尝试移除 `/tmp/conflicts`。
- Android 清空 Calendar、SMS、Contacts，删除 `Guest room decision 288.md`。
- SmartHome reset。
