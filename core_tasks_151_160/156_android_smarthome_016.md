# Core 156 — android_smarthome_016

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 156 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_016.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：easy
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

比较 Home 所有房间的 PM2.5 后，living room 的 86.0 是最高值。其 air purifier 当前 off/low。需要创建 `Home Environment Report.md`，明确记录：

- living room 是 PM2.5 最高房间；
- PM2.5=86；
- purifier 当前 off；
- 给出实际建议，例如 turn on purifier。

这是报告任务，不要求真的打开 purifier。

## 1. Instruction

### 英文原文（逐字）

~~~text
Check the live Home environment to find the room with the highest PM2.5 reading. Create a Markor note named `Home Environment Report` that records that room, its PM2.5 value, the current purifier state, and a practical recommendation.
~~~

### 中文翻译

检查 Home 的实时环境，找出 PM2.5 读数最高的房间。创建名为 `Home Environment Report` 的 Markor note，记录该房间、PM2.5 数值、当前 purifier 状态和一条可行建议。

## 2. 输入、附件与初始业务数据

本任务没有手机输入附件、短信、联系人或邮件。输入完全来自 Home 实时状态；手机仅用于写结果。

### 2.1 Home PM2.5 全部读数

当前时间：`2026-06-16T19:00:00`。

| 排名 | 房间 | PM2.5 |
|---:|---|---:|
| 1 | living_room | 86.0 |
| 2 | dining_room | 42.3 |
| 3 | office | 31.5 |
| 4 | bedroom | 29.5 |
| 5 | bathroom | 17.1 |

### 2.2 Purifier 状态

| 房间 | purifier |
|---|---|
| living_room | power=off，level=low |
| dining_room | power=on，level=low |
| bedroom | power=off，level=medium |
| bathroom | power=on，level=medium |
| office | 没有 air purifier 记录 |

初始 schedules、workflows 和 history 为空。

### 2.3 Markor 初始状态

Setup 会删除旧文件：

~~~text
/storage/emulated/0/Documents/Markor/Home Environment Report.md
~~~

## 3. Setup 具体流程

### android_0

确保 Markor 可用，并删除旧 `Home Environment Report.md`。

### home_0

使用 `android_smarthome_016/episode_config.json` reset Home，写入上述实时房间和设备状态。

## 4. 正确输出

精确文件路径：

~~~text
/storage/emulated/0/Documents/Markor/Home Environment Report.md
~~~

Oracle 示例：

~~~text
# Home Environment Report
The living room has the highest PM2.5 reading at 86.0. Its air purifier is off.
Recommendation: turn on the living-room purifier and review the air again after it has run.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

本任务只有 1 个 evaluator：精确路径上的 Markor note 必须通过 entity-relation 规则。没有 Home 状态 evaluator。

### 5.1 全文必须具备的实体

正文必须命中所有实体组：

- `living room` 或 `living-room`；
- `highest`；
- `PM2.5` / `PM 2.5` / `air quality`；
- `86` / `86.0`；
- `purifier` / `air purifier`；
- `off`；
- `recommendation`；
- `turn on` / `turn it on` / `start`。

还需至少命中一个正向表达：`recommendation`、`turn on`、`turn it on`、`start`。

不得出现：

- `pending`、`not the highest`；
- `purifier is on`、`purifier running`；
- `do not turn on`、`not to turn on`、`avoid turning on`。

### 5.2 关键四项必须在同一个 clause

额外 `relation_groups` 要求同一个 clause 同时包含：

- living room；
- highest；
- PM2.5/air quality；
- 86。

实现会在以下边界切分 clause：

- 分号 `;`；
- 竖线 `|`；
- 换行；
- 句号、问号或感叹号后跟空白。

所以这句能通过：

~~~text
The living room has the highest PM2.5 reading at 86.
~~~

但下面拆成两个句子会失败，因为没有一个 clause 同时具备四项：

~~~text
The living room has the highest PM2.5. The reading is 86.
~~~

该 group 默认还要求匹配它的 clause 恰好 1 个；把同样的完整结论在两个不同 clause 重复两次也会失败。Purifier off 和 recommendation 可以放在其他 clause。

### 5.3 不是整篇绝对匹配

除了上述同-clause 约束，标题、句序和其他措辞可改，匹配大小写不敏感。文件路径仍必须精确。

### 5.4 Home 不需要被修改

Evaluator 不检查 purifier 最终状态，也没有 no-change guard。Instruction 要求记录当前状态并给建议，不是执行建议；正确做法是保持 purifier off，只在 note 中建议 turn on。

## 6. 常见失败与真实评测边界

- 只写 living room=86，不写 `highest` 或 PM2.5：失败。
- 把 living room、highest、PM2.5、86 分散到多个 clause：relation group 失败。
- 写 purifier running：与真实 off 状态冲突，失败。
- 真正打开 purifier 不会帮助 note evaluator，而且偏离 instruction。
- 文件名大小写或目录不对：精确路径读取失败。

## 7. Cleanup

- android_0 删除 `Home Environment Report.md`；
- home_0 reset。
