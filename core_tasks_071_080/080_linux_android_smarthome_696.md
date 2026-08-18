# Core 080 — `linux_android_smarthome_696`

- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_696.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`；拓扑 `1A+1L+1H`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Match the recipe code in the existing `Dinner scene request` Task with the Broccoli recipe and `/tmp/home_ops/service-notes/source/index.csv`. Schedule the mapped SmartHome cooking scene, then complete that original Task—do not create a duplicate—with a natural note relating the matched recipe and scene time.
```

### 中文翻译

把现有 Task 的 recipe code 与 Broccoli recipe、index.csv 匹配，安排 SmartHome cooking scene，再完成原任务（不复制），用自然 notes 关联 recipe 与 scene time。

## 2. 数据与评测

Task code R-5；Recipe Stir Fry 含 tofu；CSV R-5 映射 18:05、厨房净化器 high、餐厅调光灯50%。R-7 是干扰。

两项评分：`Dinner scene request` 同名任务恰好一个、completed，notes 含 Stir Fry 和 18:05 且无 pending/cancelled/wrong recipe；唯一 active workflow run_at 18:05，精确使 kitchen_air_purifier_1 on/high、dining_room_dimmable_light_1 on/brightness50。推荐 notes：`Stir Fry scene scheduled for 18:05 and complete.`

