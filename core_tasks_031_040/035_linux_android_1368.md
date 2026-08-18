# Core 035 — `linux_android_1368`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 35 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1368.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`
- 限制：最多 50 步；任务文件没有单独设置最长秒数

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

- `linux_0`：上传 patch CSV。
- `android_0`：清空日历后写入唯一初始事件。
- `android_1`：确保 Markor 可用，并删除旧目标笔记。

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
- 改标题、改时间、改地点、复制事件或覆盖掉旧描述都会失败。

### 4.2 Markor evaluator

- 精确路径：`/storage/emulated/0/Documents/Markor/Calendar patch CAL-1368.md`。
- 必须出现完整标题、09:00 的可接受写法、Room 9、追加句。
- 还要表达 updated/applied/final 等肯定结果。
- `proposed`、`pending`、`unchanged`、`not applied`、`wrong` 等冲突语义会失败；疑问、不确定和否定关系也会失败。

