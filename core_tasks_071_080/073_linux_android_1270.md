# Core 073 — `linux_android_1270`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1270.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`；拓扑 `1A+2L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Compare the Broccoli recipe with `/tmp/pantry/pantry_plan.csv` and write `/tmp/pantry/recipe_check.xlsx` on the second Linux machine. Create one complete visible table with columns `ingredient`, `recipe_amount`, `pantry_amount`, and `status`; include every relevant ingredient exactly once.
```

### 中文翻译

比较 Broccoli 食谱与 pantry CSV，在第二台 Linux 写一个完整可见 XLSX 表，四列固定，每个相关 ingredient 正好一次。

## 2. 数据与精确表格

Recipe：beans 2 cups、rice 2 cups、cilantro 1 bunch。Pantry：beans 2 cups、rice 1 cup、cilantro 1 bunch、lime 2。

Evaluator 要求有效 XLSX logical table，精确四列四行：

```text
beans    | 2 cups  | 2 cups  | matched
rice     | 2 cups  | 1 cup   | quantity mismatch
cilantro | 1 bunch | 1 bunch | matched
lime     | missing | 2       | pantry-only
```

允许 documented 同义值（如 match、short、not in recipe），但不允许额外/重复行列。

