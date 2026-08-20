# Core 165 — android_only_264

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 165 项
- 任务文件：`tasks/cross_device/android_only/android_only_264.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：medium
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机的 `Safety walk` 事件在 08:30 开始。第二台手机的 `alarm_policy.json` 规定提前 25 分钟，并用 `Prep for` 作为标签前缀。

计算：

~~~text
08:30 - 25 minutes = 08:05
~~~

所以要在第二台手机 Clock 中创建并启用一个 08:05 的闹钟，标签为：

~~~text
Prep for Safety walk
~~~

## 1. Instruction

### 英文原文（逐字）

~~~text
The Safety walk event in Calendar on the first phone is the time source. Please use the lead time in `alarm_policy.json` on the second phone to create the corresponding Clock alarm on the second phone.
~~~

### 中文翻译

第一台手机 Calendar 中的 Safety walk 事件是时间来源。请使用第二台手机上 `alarm_policy.json` 中的提前时间，在第二台手机的 Clock 中创建对应闹钟。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。输入是一个 Calendar 事件和一份 JSON；输出是 android_1 上的 Clock alarm。

### 2.1 android_0：Safety walk 事件

| 字段 | 内容 |
|---|---|
| title | Safety walk |
| start_ts | `1784881800`（任务时区换算为 2026-07-24 08:30） |
| end_ts | `1784883600`（2026-07-24 09:00） |
| location | Gate 4 |
| description | Needs policy alarm. |

### 2.2 android_1：`alarm_policy.json`

上传路径：

~~~text
/sdcard/Download/alarm_policy.json
~~~

文件原文：

~~~json
{"lead_minutes":25,"label_prefix":"Prep for"}
~~~

字段含义：

- `lead_minutes=25`：闹钟比事件开始时间早 25 分钟；
- `label_prefix="Prep for"`：标签由此前缀、一个空格和事件标题组成。

### 2.3 android_1：Clock 初态

Setup 会清空 Clock，因此开始时没有旧闹钟可以直接满足 evaluator。

## 3. Setup 具体流程

### android_0

1. 确保 Simple Calendar Pro 可用；
2. 清空 Calendar；
3. 创建上述 Safety walk 事件。

### android_1

1. 确保 Android Files 可用；
2. 上传 `alarm_policy.json` 到 Download；
3. 确保 Clock 可用；
4. 清空 Clock 数据/闹钟。

## 4. 正确输出

在 android_1 创建：

| 字段 | 正确值 |
|---|---|
| hour | 8 |
| minute | 5 |
| label | Prep for Safety walk |
| enabled | true |

Oracle 也是先清空 Clock，再添加上述闹钟。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

只有 1 个 evaluator：`androidworld_alarm` 必须在 android_1 找到至少一个同时匹配时间、标签和启用状态的闹钟。

### 5.1 时间、标签和开关

必须同时满足：

- 小时为 `8`；
- 分钟为 `5`；
- label 规范化后等于 `Prep for Safety walk`；
- `enabled=true`。

标签比较会忽略大小写、首尾空白并折叠连续空白。因此 `prep for safety walk` 在底层 provider 比较中也能命中，但实际操作仍建议使用 instruction 推导出的标准大小写。

08:30、08:25、08:00 都不通过；只建闹钟但把开关关闭也不通过。

### 5.2 是“至少存在一个”，不是闹钟集合绝对匹配

Getter 从 Clock provider、数据库或 UI 中寻找匹配项，命中一项即返回 `present`：

- 不要求这个身份的闹钟恰好只有一个；
- 不要求 Clock 最终只有一个闹钟；
- 不排斥其他无关闹钟。

Setup 已经清空 Clock，所以正常完成时自然只需创建一个。

### 5.3 当前 evaluator 没有检查什么

- 不检查 Calendar 事件或 JSON 最终是否仍存在；
- 不重新在 evaluator 中执行“08:30 - 25”的计算，只检查最终 08:05；
- 不检查 location `Gate 4` 或 description；
- 不检查重复日期、星期、铃声、振动或 snooze；
- contract 没有 `one_time` 字段，因此不验证循环规则；
- 不要求标签区分大小写。

## 6. 常见失败与真实评测边界

- 误把 25 当成事件后的延迟，创建 08:55：失败。
- 创建 08:05 但不加标签或写成 `Safety walk`：失败。
- 标签正确、时间正确但闹钟关闭：失败。
- 创建一个额外闹钟通常不会被本 evaluator 拒绝，但不是任务所需。

## 7. Cleanup

- android_0 清空 Calendar；
- android_1 删除 `alarm_policy.json`；
- android_1 清空 Clock。
