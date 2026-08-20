# Core 168 — android_only_218

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 168 项
- 任务文件：`tasks/cross_device/android_only/android_only_218.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：easy
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第二台手机的 stale 事件写着请求码 `RC-42`。第一台手机上有两个同名 `Site briefing` 事件，必须用这个请求码消歧：

- `RC-42` 对应 09:30–10:00、North Yard；
- `RC-99` 对应 11:30–12:00、East Lot。

因此要把第二台手机上唯一的 Site briefing 改成 RC-42 的当前版本，而不是复制 RC-99，也不能留下同标题的 stale 重复项。

## 1. Instruction

### 英文原文（逐字）

~~~text
Both phones have a Site briefing event. Use the request code in the stale event on the second phone to identify its current counterpart on the first phone, then correct the second phone's event to match it.
~~~

### 中文翻译

两台手机上都有 Site briefing 事件。使用第二台手机陈旧事件中的请求码，在第一台手机上识别它对应的当前事件，然后修正第二台手机上的事件，使其与当前版本一致。

## 2. 输入、附件与初始业务数据

本任务没有文件附件、短信或邮件。全部业务输入都在两个 Calendar 中；输出是 android_1 上修正后的 Calendar 事件。

### 2.1 android_0：两个当前候选事件

| 请求码 | title | start | end | location | description |
|---|---|---|---|---|---|
| RC-42 | Site briefing | `1783243800`（2026-07-05 09:30） | `1783245600`（10:00） | North Yard | `RC-42 current briefing.` |
| RC-99 | Site briefing | `1783251000`（2026-07-05 11:30） | `1783252800`（12:00） | East Lot | `RC-99 current briefing.` |

两项 title 完全相同，不能只看标题；要用 android_1 stale description 中的 RC-42。

### 2.2 android_1：待修正的 stale 事件

| 字段 | 初始内容 |
|---|---|
| title | Site briefing |
| start | `1783240200`（2026-07-05 08:30） |
| end | `1783242000`（09:00） |
| location | Old Yard |
| description | `RC-42 stale.` |

android_1 Setup 先清空 Calendar，因此只有这一项。

## 3. Setup 具体流程

### android_0

1. 确保 Simple Calendar Pro 可用；
2. 清空 Calendar；
3. 创建 RC-42 和 RC-99 两个同标题当前事件。

### android_1

1. 确保 Simple Calendar Pro 可用；
2. 清空 Calendar；
3. 创建一条 RC-42 stale 事件。

## 4. 正确输出

android_1 最终应有且只有一条 title 为 `Site briefing` 的事件，字段为：

| 字段 | 正确值 |
|---|---|
| title | Site briefing |
| start_ts | 1783243800 |
| end_ts | 1783245600 |
| location | North Yard |
| description | RC-42 current briefing. |

Oracle 的做法是清空 android_1 Calendar 后新建这条事件。直接编辑 stale 事件，只要最终状态相同，也可以通过。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

只有 1 个 `androidworld_calendar_event` evaluator。它先按 title 做唯一身份筛选，再检查该唯一事件的时间、地点和 description 语义。

### 5.1 同标题事件必须唯一

`unique_identity_fields=["title"]` 表示 android_1 中规范化后 title 精确等于 `Site briefing` 的事件必须恰好有一条：

- 保留 stale 事件并新增正确事件，会因同标题两条而失败；
- 只留下 RC-99 同标题事件，唯一性成立但后续字段不匹配，仍失败；
- 其他不同 title 的无关事件不会被这个 evaluator 排斥。

Calendar 文本字段默认区分大小写，并做 NFC 与连续空白规范化。因此 title 和 location 应分别使用 `Site briefing`、`North Yard` 的标准大小写。

### 5.2 时间和地点是精确字段

唯一事件必须：

- `start_ts=1783243800`；
- `end_ts=1783245600`；
- `location=North Yard`。

时间比较是 epoch 秒整数精确匹配，不是“同一天大致时间”。地点也不是包含匹配。

### 5.3 Description 是语义匹配

Description 必须包含且每个实体组恰好一次：

- `RC-42`；
- `current`；
- `briefing`。

还要求 `current`、`updated` 或 `corrected` 至少命中一个。不过 `current` 本身又是必需实体，所以实际最稳且事实上必需的是写出 `current`。

不得出现：

- `RC-99`；
- `stale`；
- `cancelled`/`canceled`、`withdrawn`；
- `not current`。

Description 不必逐字等于 `RC-42 current briefing.`，但问句、不确定、否定或撤销语义会失败。

### 5.4 当前 evaluator 没有检查什么

- 不要求 android_1 整个 Calendar 只有一条事件，只要求这个 title 唯一；
- 不检查 android_0 两个源事件是否仍在；
- 不检查 reminder、重复规则或 Calendar 账户；
- 不要求必须通过“编辑”操作完成，删除后重建相同最终状态也通过；
- 不检查 title 以外的其他无关事件。

## 6. 常见失败与真实评测边界

- 复制第一台手机的 RC-99 事件：请求码、时间和地点都错，失败。
- 新建正确项但未删除/修改 stale 项：同标题不唯一，失败。
- 时间和地点正确，但 description 仍是 `RC-42 stale.`：冲突词 stale，失败。
- 写 `RC-42 updated briefing.` 但完全不写 current：由于 entities 中单独要求 `current`，失败。
- 只改开始时间、不改结束时间或地点：精确字段失败。

## 7. Cleanup

- android_0 清空 Calendar；
- android_1 清空 Calendar。
