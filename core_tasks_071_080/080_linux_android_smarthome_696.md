# Core 080 — `linux_android_smarthome_696`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 80 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_696.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与匹配结论

现有 Android Task 的 notes 给出 recipe code R-5；Broccoli recipe Stir Fry 含 tofu；Linux CSV 的 R-5 行也要求 tofu，并映射到 18:05、kitchen purifier high、dining-room light 50%。因此要创建一条 18:05 active workflow，然后更新并完成原来的 Dinner scene request，不要新建同名 Task。

## 1. Instruction

### 英文原文（逐字）

```text
Match the recipe code in the existing `Dinner scene request` Task with the Broccoli recipe and `/tmp/home_ops/service-notes/source/index.csv`. Schedule the mapped SmartHome cooking scene, then complete that original Task—do not create a duplicate—with a natural note relating the matched recipe and scene time.
```

### 中文翻译

把现有 `Dinner scene request` Task 中的 recipe code 与 Broccoli recipe 及 `/tmp/home_ops/service-notes/source/index.csv` 匹配。安排映射得到的 SmartHome cooking scene，然后完成原来的 Task——不要创建重复项——并用自然 note 关联匹配到的 recipe 与 scene time。

## 2. 输入、附件与初始业务数据

### 2.1 手机现有 Task

```text
Title: Dinner scene request
Notes: Recipe code: R-5
Due date: none (0)
Completed: false
```

### 2.2 手机 Broccoli recipe

```text
Title: Stir Fry
Ingredients: tofu, vegetables, oil
Directions: Stir fry tofu and vegetables in oil.
Preparation time: 20 minutes
```

### 2.3 Linux `index.csv`

```csv
recipe_code,required_ingredient,run_at,air_device_id,air_level,light_device_id,light_pct
R-5,tofu,18:05,kitchen_air_purifier_1,high,dining_room_dimmable_light_1,50
R-7,pasta,20:00,kitchen_air_purifier_1,medium,dining_room_dimmable_light_1,35
```

R-5 与 Task code 匹配，required ingredient tofu 也确实存在于 Stir Fry。R-7/pasta 是 wrong-recipe 干扰行。

### 2.4 SmartHome 初始相关状态

- current_time=`2026-06-16T17:45:00`
- `kitchen_air_purifier_1`：power=off、level=medium
- `dining_room_dimmable_light_1`：power=off、brightness=0
- 初始 workflows 为空

## 3. Setup 具体流程

### `linux_0`

- 创建 service-notes/source 目录并删除旧 index.csv。
- 上传新的 index.csv。

### `android_0`

- 确保 Tasks 可用并清空，添加唯一未完成的 Dinner scene request。
- 确保 Broccoli app 可用并清空 recipes，添加 Stir Fry。

### `home_0`

- 用 episode_config 重置 SmartHome，加载相关设备初态与空 workflow 列表。

## 4. Evaluator：评测方式与具体评测点

本题有 2 个 evaluation 单元：Android Task final state 与 SmartHome workflow。

### 4.1 Android 原 Task

最终必须恰好有一个 title 等于 `Dinner scene request` 的 Task，并满足：

- completed=1。
- notes 必须含 `Stir Fry`。
- notes 必须含 `18:05`、`6:05 PM`、`6:05PM` 中任一时间写法。
- notes 必须含 `scheduled`、`prepared`、`ready` 中任意一个。
- notes 不能含 `not scheduled`、`cancelled`、`pending`、`wrong recipe`。
- 问句、不确定或否定结果失败。

推荐 notes：

```text
Stir Fry scene scheduled for 18:05 and ready.
```

`require_exactly_one=true` 按精确 title 统计；多一个同名 Task，即使一个已完成、一个未完成，也失败。其他不同 title 的 Task 不影响这一 getter。

### 4.2 SmartHome workflow

- active workflow 总数恰好 1。
- run_at 精确为 `2026-06-16T18:05:00`。
- 规范化 effects 精确为：

```json
{
  "kitchen_air_purifier_1": {
    "power": "on",
    "level": "high"
  },
  "dining_room_dimmable_light_1": {
    "power": "on",
    "brightness_pct": 50
  }
}
```

额外 active workflow、额外 device effect 或使用 R-7 的 medium/35/20:00 均失败。

## 5. 常见失败与评测边界

- 新建第二个同名 completed Task，而不更新原项：同名计数=2，Task evaluator 失败。
- 只把原 Task 勾完成但 notes 仍只有 Recipe code R-5：缺 Stir Fry、时间和状态词。
- Workflow 正确但 Task 未完成，或反之：只能通过一个 evaluation 单元。
- 立即控制设备但不建立 workflow：home evaluator 不看即时 device state。

“Complete that original Task” 只被最终同名计数和内容间接约束：getter 不保存 setup row ID，所以若删除原 Task 再创建唯一一条同名正确 Task，技术上也可能通过，尽管违反 instruction。正确操作应更新原项。Evaluator 也不直接要求 notes 保留 `R-5` 或提 tofu；这些是选择 Stir Fry/R-5 scene 的公开依据。

## 6. Cleanup

- Linux 删除 index.csv 并清理空目录。
- 手机两次清空 Tasks、两次清空 Recipes（cleanup 配置重复，但结果相同）。
- SmartHome reset。
