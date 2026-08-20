# Core 118 — `linux_smarthome_576`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 118 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_576.json`
- 运行配置：`configs/cross_device/local_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1L+1H`（`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

政策要求在“occupied、温度高于 27°C、而且有空调”的房间中最多选一个最热房间：

- guest room 32°C，有空调但 unoccupied，不选；
- nursery 31°C，occupied 但没有空调，不选；
- office 30°C，occupied 且有空调；
- living room 29°C，occupied 且有空调。

所以唯一答案是 office：将 office AC 设为 on/cool/24°C，并写出四字段的 `decision.json`。其他两台空调和 nursery light 都必须保持原样。

## 1. Instruction

### 英文原文（逐字）

```text
Read `/tmp/climate/cooling.md`, then inventory the rooms and air conditioners in Home. Follow the policy to cool only the hottest currently occupied room that has an air conditioner, and save the facility decision to `/tmp/climate/decision.json` using the four fields and reason values documented there.
```

### 中文翻译

阅读 `/tmp/climate/cooling.md`，然后盘点 Home 中的房间和空调。按照政策，只给当前有人、拥有空调且最热的那个房间降温，并使用文档规定的四个字段和 reason 值，把设施决定保存到 `/tmp/climate/decision.json`。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 `cooling.md` 原文

```markdown
# Cooling selection rule

Review occupied rooms with air conditioners. Select at most one room: the hottest eligible room above 27 C.

For the selected room, cool to 24 C and save the decision details in `/tmp/climate/decision.json`.

The facility log uses exactly these fields: `selected_room`, `observed_temperature_c`, `action`, and `reason_code`.

For the room selected by this policy, use the controlled reason code `hottest_occupied_coolable_room`.
```

### 2.2 SmartHome 初始状态

当前时间：`2026-06-25 16:00`。

| 房间 | 温度 | occupied | 可用设备 |
|---|---:|---|---|
| guest room | 32 | false | AC off/auto/26 |
| nursery | 31 | true | 只有普通 light，off |
| office | 30 | true | AC off/auto/26 |
| living room | 29 | true | AC off/auto/26 |

初始 schedules、workflows、history 为空。

## 3. Setup 具体流程

### `linux_0`

1. 删除旧 `cooling.md` 和 `decision.json`；
2. 创建 `/tmp/climate`；
3. 上传 policy Markdown。

### `home_0`

从 episode config 重置四个房间、三台空调和 nursery light。Setup 不会自动打开 Markdown。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator。

### 4.0 先说人话：怎样才算通过

Office AC 最终必须是 on/cool/24；JSON 必须是一个没有额外键的四字段对象；living/guest AC 和 nursery light 必须保持 setup 初态。

### 4.1 Office AC 状态

```text
office_air_conditioner_1:
  power=on
  mode=cool
  target_temperature_c=24
```

### 4.2 `decision.json` 的真实匹配方式

目标对象：

```json
{
  "selected_room": "office",
  "observed_temperature_c": 30,
  "action": "cool to 24 C",
  "reason_code": "hottest_occupied_coolable_room"
}
```

虽然 evaluator 名称是 `json_semantic_match`，本题没有配置任何宽松 alias，实际边界很接近闭合对象精确匹配：

- 顶层必须是 JSON object；
- 四个键都必须存在，且不允许额外键；
- 重复 JSON key 会直接失败；
- `observed_temperature_c` 必须是 JSON 数字 30，字符串 `"30"` 不通过；
- 字符串比较会忽略大小写差异并折叠多余空白，但不会把不同措辞当同义词；
- 键名没有 alias，必须使用文档给出的四个键。

### 4.3 非目标设备守护

必须保持：

```text
living_room_air_conditioner_1: off, auto, 26
guest_room_air_conditioner_1: off, auto, 26
nursery_light_1: off
```

因此不能选全屋最热但无人的 guest room，也不能因为 nursery 更热而操作没有空调的房间。

## 5. 常见失败与真实评测边界

- 选 guest room：忽略 occupied 条件，失败。
- 选 nursery：没有 AC，且会破坏 nursery light 守护。
- 同时冷却 office 和 living room：违反 at most one，并破坏 living AC 状态。
- JSON 加入 `timestamp`、`device_id` 或备注键：闭合对象不允许额外键，失败。
- `action` 写成 `set office to 24`：不是配置的同义值，失败。

Evaluator 没有全局 command-count、schedule-count 或 workflow-count 检查；最终设备状态和三个非目标守护是主要 Home 约束。

## 6. Cleanup

- 删除 cooling.md 和 decision.json；
- 尝试删除空的 `/tmp/climate`；
- Home reset。

