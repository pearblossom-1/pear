# Core 075 — `linux_android_1354`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 75 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1354.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`
- 设备拓扑：`1A+2L`（`android_0`、`linux_0`、`linux_1`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与筛选结论

手机 Markor note 同时有 active actions 和 archived old route。第一台 Linux 提供 summary template，第二台 Linux 承载最终 summary。应把 owner、date 和两个 active actions 填入模板，不能把 Archived 行复制进结果。

## 1. Instruction

### 英文原文（逐字）

```text
Take the Markor note, apply `/tmp/summary/summary_template.md`, and write `/tmp/summary/summary.md` on the second Linux machine.
```

### 中文翻译

读取 Markor note，套用 `/tmp/summary/summary_template.md`，并在第二台 Linux 上写入 `/tmp/summary/summary.md`。

## 2. 输入、附件与初始业务数据

### 2.1 手机 Markor note

文件名与路径：`/storage/emulated/0/Documents/Markor/Ops Summary 1354.md`。

完整内容：

```text
Owner: Neve
Date: 2026-08-26
Active: inspect valves; call depot
Archived: old route
```

需要保留的是 Neve、日期、inspect valves、call depot；`old route` 是不能进入最终 summary 的 archived 内容。

### 2.2 第一台 Linux template

`/tmp/summary/summary_template.md`：

```text
# Summary
Owner:
Date:
Actions:
Footer: template 1354
```

## 3. Setup 具体流程

### `linux_0`

- 删除旧 summary_template.md，创建 `/tmp/summary`。
- 上传模板；第一台 Linux 不承载结果。

### `linux_1`

- 删除旧 summary.md，创建 `/tmp/summary`。
- 最终文件必须写在这台机器。

### `android_0`

- 确保 Markor 可用。
- 上传 Ops Summary 1354.md 到 Markor 文档目录。

## 4. Evaluator：评测方式与具体评测点

本题只有 1 个全文语义 evaluator，读取第二台 Linux 的 `/tmp/summary/summary.md`。

### 4.0 符合 instruction 的推荐结果

```text
# Summary
Owner: Neve
Date: 2026-08-26
Actions: inspect valves; call depot
Footer: template 1354
```

### 4.1 实际要求

- 全文必须出现 `Neve`。
- 必须出现 `2026-08-26`。
- 必须出现 `inspect valves`。
- 必须出现 `call depot`。
- 不能出现 `old route`、`archived route`、`do not inspect`、`do not call`。
- 顶层排除小写 `missing`。
- 通用关系 scorer 拒绝问句、不确定、撤销和对必需实体的局部否定。
- 没有 clause/近邻规则；四个实体可以位于不同段落。

## 5. 常见失败与真实评测边界

- 直接复制整份 Markor note：包含 `old route`，命中 conflict。
- 只填 Owner/Date，漏任一 action：实体不全。
- 在第一台 Linux 写 summary.md：getter 只看 linux_1。
- 写 “do not inspect valves”：虽然包含 inspect valves，局部否定与显式 conflict 都会失败。

Evaluator 没有检查 `# Summary`、Owner/Date/Actions 标签、Footer 或模板的整体结构；只写一句 `Neve on 2026-08-26: inspect valves and call depot.` 也可能通过。因此 “apply template” 目前没有被真正结构化评分。推荐结果保留模板，是为了完成 instruction，而不仅是满足宽松 evaluator。

## 6. Cleanup

- 第一台 Linux 删除 template。
- 第二台 Linux 删除 summary.md。
- 手机删除 Markor source note；Linux 空目录随后清理。
