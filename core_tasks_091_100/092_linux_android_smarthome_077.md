# Core 092 — `linux_android_smarthome_077`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 92 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_077.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 难度：medium
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与匹配结论

Android note 说同一 20:00 时刻把 living-room AC 目标从旧值改为 24°C；PDF 规定同设备同时间的新批准请求替换旧 schedule，不能留下重复 AC schedule；SmartHome 中旧记录正是 `living_ac_old_2000`、20:00、25°C、active。因此要把旧 ID 留存但改成 cancelled，新建唯一一条 20:00/24°C active schedule，并在结果笔记里明确写出旧 25°C 取消、新 24°C 生效。

## 1. Instruction

### 英文原文（逐字）

```text
Use the approved Climate Update note on Android and /tmp/schedules/merge.pdf to replace the existing living-room AC schedule. Cancel the identified old schedule, create the approved active correction, and record the applied old-to-new result in Markor as Climate correction result.md.
```

### 中文翻译

使用 Android 上已批准的 `Climate Update` 笔记和 `/tmp/schedules/merge.pdf`，替换现有的客厅空调 schedule。取消被指出的旧 schedule，创建已批准且处于启用状态的新修正，并在 Markor 的 `Climate correction result.md` 中记录已经执行的旧到新变更结果。

## 2. 输入、附件与初始业务数据

### 2.1 Android 笔记原文

路径：`/storage/emulated/0/Documents/Markor/Climate Update.md`

```text
Approved living-room AC correction: keep 20:00 but use 24 C.
```

即：时间仍为 20:00，但温度从旧值改为 24°C。

### 2.2 Linux PDF 的完整业务内容

路径：`/tmp/schedules/merge.pdf`，一页，标题为 `Schedule Merge Rule`。页面文字表达：

- `REPLACEMENT RULE`：同一设备、同一执行时间下，批准的新请求替代旧 schedule；
- `REQUIRED OUTCOME`：不能保留重复的空调 schedules；
- 页脚：`Internal operations reference`。

### 2.3 SmartHome 初始 schedule

- 当前时间：`2026-06-16 19:00`
- schedule ID：`living_ac_old_2000`
- 执行时间：`2026-06-16 20:00`
- 设备：`living_room_air_conditioner_1`
- 动作：`set_target_temperature`
- 参数：`temperature_c=25`
- 状态：`active`

初始客厅空调已经开启，模式为 cool，目标温度为 25°C。

## 3. Setup 具体流程

### `linux_0`

创建 `/tmp/schedules`，上传 `merge.pdf`。

### `android_0`

确保 Markor 可用，上传 `Climate Update.md`，并删除旧的目标输出 `Climate correction result.md`。

### `home_0`

重置到上述 25°C 旧 schedule 仍处于 active 的状态。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，通常各占 `1/3`。

### 4.0 先说人话：怎样才算通过

- 把 `living_ac_old_2000` 标为 cancelled，不能直接让它消失；
- 新建唯一一个 active schedule：20:00 对客厅空调执行 `set_target_temperature(24)`；
- 创建 Markor 文件 `Climate correction result.md`，明确说旧 25°C 已取消、新 24°C 已启用、时间是 20:00。

最稳妥的笔记正文：

```text
Climate correction applied: old 25 C schedule cancelled and new 24 C schedule active at 20:00.
```

### 4.1 Markor 笔记 evaluator

- 路径必须精确为 `/storage/emulated/0/Documents/Markor/Climate correction result.md`。
- 不是整篇原文匹配，而是关系词检查：必须出现 `Climate correction`、旧 25 C、新 24 C、20:00。
- 必须同时表达“applied/active”和“cancelled/retired”。
- `cancelled` 被允许用于描述旧 schedule，不会被通用反转检测误杀。
- 若写 `pending`、`new 24 C schedule cancelled` 或 `old 25 C schedule remains`，会失败。
- 疑问、不确定和否定表达会失败。

### 4.2 旧 schedule 状态 evaluator

它按固定 ID `living_ac_old_2000` 查找记录，并要求状态为 `cancelled`。所以删除旧记录不等于取消，删除后反而不能通过这一项。

### 4.3 新 schedule evaluator

- 必须恰好有 1 条匹配的新 schedule；
- 所有 active schedule 的总数也必须恰好为 1；
- 匹配字段是时间 `2026-06-16T20:00:00`、客厅空调、`set_target_temperature`、24°C、`active`；
- 新 schedule 的 ID 没有被固定；
- 已 cancelled 的旧记录可以保留，额外 active schedule 不可以保留。

## 5. 常见失败与真实评测边界

- 直接把 `living_ac_old_2000` 从 25 改成 24 并继续 active：新值可能匹配，但旧 ID 没有 cancelled，旧状态项失败。
- 删除旧记录：status evaluator 仍找不到固定 ID，失败。
- 保留旧 25°C active，再新增 24°C active：全局 active schedule 数为 2，失败。
- 另建一条 AC `turn_on` schedule：即使空调业务状态合理，也会让 active 数超过 1；本题只需要一条 set-target schedule。
- 笔记写“24 C pending”或没说明旧 25°C 被取消：语义项失败。

新 schedule evaluator 只检查 20:00 的 `set_target_temperature(24)`，不要求 schedule 再设置 power 或 mode；setup 中空调已经 on/cool。它也不保护空调即时状态或其他设备。Markor 关系不要求全文逐字一致，但四组实体、两组状态结论和极性必须同时成立。

## 6. Cleanup

- Linux 删除 `merge.pdf`，并尝试移除 `/tmp/schedules`。
- Android 删除源 `Climate Update.md` 和结果 `Climate correction result.md`。
- SmartHome reset。
