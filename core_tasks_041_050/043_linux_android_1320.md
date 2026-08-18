# Core 043 — `linux_android_1320`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1320.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`；拓扑 `2A+2L`
- 限制：最多 50 步；未单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
Review the recipe and allergy contact on the phones together with `/tmp/meal/pantry.csv` on the first Linux machine and `/tmp/meal/suppliers.csv` on the second. Write the decision and reason to `/tmp/meal/meal_decision.md` on the second Linux machine; if the recipe is unsafe, clearly block it and leave `/tmp/meal/supplier_order.csv` absent.
```

### 中文翻译

结合两部手机上的食谱与过敏联系人、第一台 Linux 的 pantry.csv 和第二台 Linux 的 suppliers.csv 作出判断，并把决定和原因写入第二台 Linux 的 meal_decision.md；若食谱不安全，要明确阻止并保持 supplier_order.csv 不存在。

## 2. 输入、附件与 Setup

- 食谱：`Sesame Rice Bowl`；ingredients `rice; sesame oil; cucumber`；directions `Mix.`。
- 联系人：`Guest Allergy / 5551201320`，notes 为 `Allergy: sesame`。
- pantry.csv：rice=yes，sesame oil=no。
- suppliers.csv：sesame oil 可由 Supplier A 提供，cucumber 可由 Supplier B 提供。

即使供应商能补 sesame oil，过敏信息仍使该食谱不安全。Setup 会清理两个输出，不能创建 order。

## 3. Evaluator 与通过标准

本任务 2 项评分。稳妥决定：`Sesame Rice Bowl is blocked and unsafe for Guest Allergy because it contains sesame oil.`

- decision 文件要包含 Sesame Rice Bowl、Guest Allergy、sesame oil，且同一段落把食谱、联系人、allergy、sesame oil 关联起来。
- 必须肯定表达 blocked/unsafe/cannot serve；`safe to serve`、order placed、approved 等会失败。
- 第二项直接执行 `test ! -e /tmp/meal/supplier_order.csv`；文件只要存在，即使为空也失败。

