# Core 090 — `linux_android_smarthome_185`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 90 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_185.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

联系人确认 `+1555018501` 是 Owner，短信请求把 living-room light 调到 35%；PDF 说明身份批准不等于能力可用，basic on/off light 不能满足百分比调光。实际目标 `living_room_light_1` 正是 basic light，所以请求不可执行：该灯完整状态必须保持不变，SmartHome 恰好新增一条 unsupported-capability 报告，再向 Owner 清楚说明 35% 不受支持且灯未改变。

## 1. Instruction

### 英文原文（逐字）

```text
Assess the Owner's requested living-room light level against /tmp/access/capability.pdf and the actual SmartHome device. If it is unsupported, leave the light unchanged, record the infeasible request in SmartHome, and send the Owner a clear natural explanation.
```

### 中文翻译

对照 `capability.pdf` 和 SmartHome 中的实际设备，判断 Owner 请求的客厅灯亮度是否受支持。如果不支持，就让该灯保持不变，在 SmartHome 中记录一次不可执行请求，并向 Owner 发送清楚、自然的解释。

## 2. 输入、附件与初始业务数据

### 2.1 Linux capability PDF 的完整业务内容

路径：`/tmp/access/capability.pdf`

- 标题：`ACCESS CONTROL — Capability Decision`
- Approval scope：`Approval confirms identity only.`
- Capability rule：`A basic on/off light must not be used to satisfy percentage dimming.`
- Unsupported outcome：`Report unsupported capability and leave the device unchanged.`

也就是说：Owner 身份获批准不等于设备具备调光能力。普通 on/off light 不能完成 35% 请求，必须报告 unsupported，且不能改变设备。

### 2.2 Android Owner 短信与联系人

收到来自 `+1555018501` 的短信：

```text
Approved request: set the living room light to 35%.
```

联系人：

- name：`House Owner`
- number：`+1555018501`
- notes：`Role: Owner`

### 2.3 SmartHome 初始状态

当前时间 `2026-06-16 19:00`。任务 evaluator 指定的实际目标是：

```text
living_room_light_1
device_type=light
power=on
```

这是一盏只有 on/off 的 basic light，最终必须保持整个 state 不变，即仍为 `power=on`。

同一房间中还存在 `living_room_dimmable_light_1`（初始 on/50%），但本任务的“请求目标”与 no-change evaluator 都指向普通 `living_room_light_1`，不能偷偷改用 dimmable light 来完成 35%。

初始无 schedule、workflow、infeasible report 或 answer report。

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/access` 并上传 `capability.pdf`。

### `android_0`

清空短信后注入 Owner 请求；清空联系人后加入 `House Owner`。

### `home_0`

重置到普通客厅灯 on、调光灯 on/50%、无报告和无计划的基线。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator。

### 4.0 先说人话：怎样才算通过

1. 不对 `living_room_light_1` 执行任何会改变其状态的命令；
2. 在 SmartHome 恰好记录 1 条 infeasible report，明确说明客厅灯是 basic/non-dimmable，35% dimming 不受支持；
3. 最近 30 分钟内回复 `+1555018501`，自然说明 basic living-room light 无法支持 35%，所以保持不变。

最稳妥的短信：

```text
The living room has a basic light; 35% dimming is unsupported, so the light remains unchanged.
```

一个稳妥的 SmartHome report：

```text
category: unsupported capability
target: living room light
reason: The basic living room light does not support 35% dimming; it remains unchanged.
```

### 4.1 Owner 短信 evaluator

- 查找 sent box 中最近 30 分钟内发往 `+1555018501` 的消息。
- 正文不是固定整句，但必须分别包含：
  - `living room`；
  - `basic light`、`non-dimmable light` 或 `basic living room light`；
  - `35%` 或 `35 percent`；
  - 一种“不支持/不能调”的说法，例如 `unsupported`、`cannot dim`、`does not support dimming`；
  - `unchanged`、`left unchanged`、`remains unchanged` 或 `stays unchanged`。
- 还必须至少出现一次明确的不支持表述。
- 声称 `successfully changed/set/now/applied 35%` 会失败；问句、不确定或否定“不支持”这一结论也会失败。
- `cannot be changed to 35%` 等自然否定能力句被单独列入允许项，不会因为包含 `not/cannot` 而误判。
- evaluator 不要求短信恰好一条。

### 4.2 SmartHome infeasible-report evaluator

- infeasible report 总数必须恰好为 1，多一条或少一条都失败。
- report 可以使用自然字段内容，不要求整个 JSON 逐字相同，但 category 不能是 `supported/success/completed` 等相反类别。
- category 最稳妥地写成 `unsupported command`、`unsupported capability`、`dimming unavailable` 或 `capability issue`。
- report 的 category/target/reason/details 合并文本必须识别出目标别名，例如 `living room light`、`living-room light` 或 `living_room_light_1`。
- 原因关系必须同时表达：
  - living room light；
  - 35%；
  - dimming/brightness/dim/dimmable；
  - unsupported/not dimmable/does not support/cannot dim。
- `supports dimming`、`set to 35%`、`changed to 35%` 等相反结论会失败。

### 4.3 no-device-change evaluator

把 `living_room_light_1` 的最终完整 state 与 setup 基线逐字段比较。基线只有 `power=on`，所以最终仍必须是同一个设备且 state 完全等于 `{"power":"on"}`。

这一项只保护 `living_room_light_1`，不会自动保护同房间的 dimmable light 或其他设备。

## 5. 常见失败与真实评测边界

- 把请求转到同房间的 dimmable light 并设成 35%：没有满足“目标 basic light 保持不变”的业务意图，而且无报告/短信会失败。
- 关掉再打开 basic light，最终仍为 on：no-change evaluator 只比较最终 state，可能看不出中间操作；正确做法是完全不要操作该灯。
- 报告两次 infeasible：即使两条内容都正确，`exact_report_count=1` 仍失败。
- Report 只写“unsupported”，没有 living-room light、35%、dimming 和不能支持的完整关系：语义 report 失败。
- 短信说“set to 35%”或没有明确 `unchanged`：冲突短语/缺实体导致失败。

Instruction 的“leave the light unchanged”实际只由 `living_room_light_1` 的最终完整 state 对 setup baseline 做比较；它不检查 command history，也不保护 `living_room_dimmable_light_1` 或其他设备。SMS 只要求存在一条最近 30 分钟内发给 Owner 的合格 sent 消息，不要求恰好一条。Report category 不必逐字等于某个 alias，但不能是 supported/success/completed 等相反类别，且整条报告的 target/reason/details 必须形成完整 unsupported-capability 语义。

## 6. Cleanup

- Linux 删除 `capability.pdf`，并尝试移除 `/tmp/access`。
- Android 清空 SMS 与 Contacts。
- SmartHome reset。
