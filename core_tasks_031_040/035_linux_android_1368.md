# Core 035 — `linux_android_1368`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 35 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1368.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与设备分工

第一台 Linux 的一行 CSV 指定“给哪一天的哪项事件追加什么”；第一部手机保存要原地修改的事件；第二部手机只保存最终结果摘要。两个 evaluator 等权，事件正确但没有笔记，或笔记正确但事件被改坏，都不能整体通过。

## 1. Instruction

### 英文原文（逐字）

```text
Please apply `/tmp/calendar/description_patch.csv` to the matching event in Simple Calendar Pro on the first phone, keeping its title, time, and location unchanged. Also write `Calendar patch CAL-1368.md` in Markor on the second phone with a concise summary of the final event title, time, location, and appended description.
```

### 中文翻译

请把 `/tmp/calendar/description_patch.csv` 应用到第一部手机 Simple Calendar Pro 中匹配的事件，同时保持标题、时间和地点不变。还要在第二部手机 Markor 中创建 `Calendar patch CAL-1368.md`，简要总结最终事件标题、时间、地点和追加后的描述。

## 2. 输入、附件与初始业务数据

Patch CSV：

```csv
event,date,append_text
CAL-1368,2026-08-29,Bring revised permit packet
```

初始日历事件：

- 标题：`CAL-1368 Permit Review`
- 时间：2026-08-29 09:00–10:00
- 地点：`Room 9`
- 描述：`Original description`

“append”表示必须保留旧描述，再追加 `Bring revised permit packet`，不能用新句覆盖旧句。

## 3. Setup 具体流程

### `linux_0`

删除旧 `/tmp/calendar/description_patch.csv`，创建目录并上传这份只有一条 patch 的 CSV。

### `android_0`

确保 Simple Calendar Pro 可用，清空 Calendar，写入唯一初始事件；开始/结束时间戳分别为 `1787994000`、`1787997600`。

### `android_1`

确保 Markor 可用，删除精确目标 `/storage/emulated/0/Documents/Markor/Calendar patch CAL-1368.md`；没有预置摘要模板。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，通常各占一半。

### 4.0 先说人话：怎样才算通过

只编辑事件描述，使最终描述同时含旧句和追加句；标题、09:00–10:00、Room 9 完全不变。笔记可写：

```text
Final updated event: CAL-1368 Permit Review at 09:00 in Room 9. Applied: Bring revised permit packet.
```

### 4.1 日历 evaluator

- 用标题、开始、结束、地点作为唯一身份字段，必须恰好有一个匹配事件。
- description 必须同时 contains `Original description` 和 `Bring revised permit packet`。
- 改标题、改时间、改地点或覆盖掉旧描述都会失败。配置的 `unique_identity_fields` 要求以标题、开始、结束、地点组成的身份匹配唯一；复制一份这四项完全相同的事件会导致失败。

### 4.2 Markor evaluator

- 精确路径：`/storage/emulated/0/Documents/Markor/Calendar patch CAL-1368.md`。
- 必须出现完整标题、09:00 的可接受写法、Room 9、追加句。
- 还要表达 updated/applied/final 等肯定结果。
- `proposed`、`pending`、`unchanged`、`not applied`、`wrong` 等冲突语义会失败；疑问、不确定和否定关系也会失败。

## 5. 笔记匹配例子与覆盖边界

笔记的四个 entity 是：完整标题、09:00 的四种时间别名之一、`Room 9`、追加句。它还必须命中一组 required outcome（updated/update applied/applied/final），并通过通用肯定关系检查。

可以通过：

```text
Final event: CAL-1368 Permit Review, 9:00 AM, Room 9. Bring revised permit packet was applied.
```

不能通过：

```text
Proposed update for CAL-1368 Permit Review ...       （proposed 冲突）
CAL-1368 ... Bring revised permit packet not applied.（局部否定）
Was the final CAL-1368 event at 09:00 in Room 9?     （问句）
```

注意：笔记 evaluator 没有把 `Original description` 配成必需 entity，也没有要求写出 10:00 结束时间；这些信息由 Calendar evaluator 守住。Calendar 描述只要求同时包含两段文字，不固定它们之间的标点或追加顺序。

## 6. Cleanup

清理会删除 Linux patch、清空第一部手机日历，并删除第二部手机的目标 Markor 笔记；空目录会被收拢。
