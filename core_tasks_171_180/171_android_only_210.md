# Core 171 — `android_only_210`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 171 项
- 任务文件：`tasks/cross_device/android_only/android_only_210.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：easy
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机的 Tasks 任务是权威来源；第二台手机已有一条同名但时间、地点和描述都过时的 Calendar 事件。需要把第二台手机上的 `Client delivery` 修正为：

| 字段 | 正确值 |
|---|---|
| 日期 | 2026-07-02 |
| 开始 | 14:15 |
| 结束 | 15:00 |
| 地点 | `Pier 6` |
| 描述 | 同时明确 `DEL-210` 和来源是 `Tasks` |

最稳妥的描述是：

```text
Code DEL-210; source=Tasks.
```

最终只能有一条标题为 `Client delivery` 的事件；留下旧事件再新建一条同名正确事件，会因同名事件不唯一而失败。

## 1. Instruction

### 英文原文（逐字）

```text
The first phone's Tasks app has Client delivery. Please use it to correct the time, location, and description of the same-named Calendar event on the second phone.
```

### 中文翻译

第一台手机的 Tasks 应用里有一项 `Client delivery`。请以它为依据，修正第二台手机上同名 Calendar 事件的时间、地点和描述。

## 2. 输入、附件与初始业务数据

本任务没有文件附件、短信、邮件、图片或音频。输入全部来自 Setup 写入的 Tasks 和 Calendar 记录。

### 2.1 `android_0`：权威 Tasks 任务

| 字段 | Setup 值 |
|---|---|
| title | `Client delivery` |
| notes | `Authoritative: 2026-07-02 14:15-15:00 at Pier 6. Code DEL-210. Calendar should say source=Tasks.` |
| dueDate | `1783001700000` 毫秒，即 2026-07-02 14:15:00 UTC |
| completed | `0`，未完成 |

Notes 的完整原文已经把目标时间、地点、代码和来源标识全部说清楚。`dueDate` 只对应开始时间；结束时间 15:00 来自 notes。

### 2.2 `android_1`：待修正的 Calendar 事件

| 字段 | 初始值 | 直白含义 |
|---|---|---|
| title | `Client delivery` | 标题已经正确 |
| start_ts | `1782997200` | 2026-07-02 13:00:00 UTC |
| end_ts | `1782999000` | 2026-07-02 13:30:00 UTC |
| location | `Old pier` | 错误旧地点 |
| description | `Stale DEL-210.` | 含代码但明确是旧信息，且没有 Tasks 来源 |

Calendar 在设备界面中的显示时区取决于模拟器设置；task/evaluator 保存并比较的是上述 epoch 秒。任务业务文本把目标时段写成 14:15–15:00。

## 3. Setup 具体流程

### `android_0`

1. `ensure_app` 确保 Tasks 可用；
2. `androidworld_tasks_clear` 清空原有 Tasks 数据；
3. 添加第 2.1 节的 `Client delivery` 权威任务。

### `android_1`

1. `ensure_app` 确保 Simple Calendar Pro 可用；
2. `androidworld_calendar_clear` 清空 Calendar；
3. 添加第 2.2 节的过时事件。

因此任务开始时，两端各只有一条相关业务记录，没有同名干扰项。

## 4. 正确输出

在 `android_1` 上编辑原事件，或删除旧事件后重建，最终效果都可以；evaluator 不追踪数据库行 ID，只看最终状态。Oracle 使用的是：

```text
Title: Client delivery
Start: 2026-07-02 14:15
End: 2026-07-02 15:00
Location: Pier 6
Description: Code DEL-210; source=Tasks.
```

## 5. Evaluator：评测方式与具体评测点

本任务只有 1 个计分 evaluator。外层 `func` 虽叫 `exact_match`，但不是把整条 Calendar 事件序列化后逐字比较；Calendar getter 先按字段和语义规则判断，返回字符串 `present` 或 `missing`，外层再要求结果精确等于 `present`。

### 5.1 同名事件必须唯一

`unique_identity_fields: ["title"]` 的实际效果是：

1. 先找标题等于 `Client delivery` 的事件；
2. 必须恰好找到 1 条；
3. 再检查这一条的其他字段。

标题比较默认区分大小写，但会把连续空白折叠为一个空格。因此 `Client Delivery` 不等于目标标题，两个同名事件也会直接返回 `missing`。其他标题的无关事件不会导致失败。

### 5.2 时间和地点是确定值匹配

唯一同名事件必须满足：

- `start_ts == 1783001700`；
- `end_ts == 1783004400`；
- location 在折叠多余空白后精确等于 `Pier 6`，默认区分大小写。

这不是“差几分钟也行”的范围匹配，也不是只看界面显示文字。

### 5.3 描述不是整句绝对匹配

描述使用通用 entity-relation 语义匹配，大小写不敏感，必须包含：

- `DEL-210`；
- 以下来源写法中的一个：`Tasks`、`source Tasks`、`source=Tasks`、`sourced from Tasks`。

`unique_entities: true` 要求代码实体和 Tasks 来源实体各只匹配一次。几个来源候选彼此重叠时会合并为一次，例如 `source=Tasks` 不会因为内部还有 `Tasks` 而被算成两次；但把 `DEL-210` 或来源完整重复两遍仍会失败。

描述中还不能出现：

- `stale`；
- `cancelled` / `canceled`；
- `withdrawn`；
- `Old pier`；
- `not sourced from Tasks`。

通用关系 scorer 也拒绝问句、不确定表达和否定/撤回语义。因此 `Could this be DEL-210 from Tasks?`、`maybe sourced from Tasks` 都不会通过。

### 5.4 常见写法结果

- `DEL-210; source=Tasks.`：通过描述规则。
- `DEL-210 at Pier 6.`：没有 Tasks 来源，失败。
- `Tasks delivery.`：没有 `DEL-210`，失败。
- `DEL-210 was stale; now sourced from Tasks.`：仍含冲突词 `stale`，失败。
- 新建正确事件但保留旧的同名事件：同名事件共 2 条，失败。
- 时间和地点正确，但描述仍为 `Stale DEL-210.`：失败。

### 5.5 当前 evaluator 没检查什么

- 不要求一定编辑原数据库行，删除后重建也行；
- 不检查第一台手机的 Tasks 任务是否仍存在或是否被修改；
- 不检查 Calendar 中是否有其他不同标题的事件；
- 不要求描述逐字等于 oracle，也不要求固定标点。

## 6. Cleanup

- `android_0` 清空 Tasks；
- `android_1` 清空 Calendar。

