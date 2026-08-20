# Core 145 — android_smarthome_241

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 145 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_241.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：medium
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台手机 Broccoli 中的 Lentil Soup 食谱要求烹饪时把 kitchen purifier 开到 high。第二台手机联系人备注给出通知号码。因此要：

1. 把 Home 的 kitchen purifier 打开并设为 high；
2. 在第二台手机向 `5552410` 发短信，说明 Lentil Soup/cooking、kitchen purifier 已经在 high 档运行。

## 1. Instruction

### 英文原文（逐字）

~~~text
Broccoli app on the first phone has the recipe, and Android Contacts on the second phone has the family note. Please prepare the kitchen air handling and notify the family in Simple SMS Messenger.
~~~

### 中文翻译

第一台手机的 Broccoli app 中有食谱，第二台手机的 Android Contacts 中有家庭备注。请准备好厨房空气处理，并在 Simple SMS Messenger 中通知家人。

## 2. 输入、附件与初始业务数据

本任务没有文件附件、邮件或预置短信。食谱和联系人由 setup 直接写入各自 app 数据库；短信是输出。

### 2.1 android_0：Broccoli 食谱

Broccoli recipes 会先被清空，再加入：

| 字段 | 内容 |
|---|---|
| title | Lentil Soup |
| ingredients | lentils, onion, garlic |
| directions | Simmer on the stove; run kitchen purifier high while cooking. |
| preparationTime | 45 minutes |

真正决定 Home 动作的是 directions 中的 `run kitchen purifier high while cooking`。

### 2.2 android_1：联系人

Contacts 会先被清空，再加入：

| 字段 | 内容 |
|---|---|
| name | Family Kitchen |
| number | 5552410 |
| notes | Send cooking air updates here. |

Simple SMS Messenger 的短信会被清空。

### 2.3 home_0：相关初始状态

当前时间：`2026-06-16T19:00:00`。

| 项目 | 初始值 |
|---|---|
| kitchen PM2.5 | 72.0 |
| kitchen_air_purifier_1 | power=off，level=low |
| schedules/workflows/history | 均为空 |

## 3. Setup 具体流程

### android_0

1. 确保 Broccoli app 可用；
2. 清空 recipes；
3. 添加 `Lentil Soup` 的完整记录。

### android_1

1. 确保 Contacts 可用并清空联系人；
2. 添加 `Family Kitchen`；
3. 确保 Simple SMS Messenger 可用并清空短信。

### home_0

使用 `android_smarthome_241/episode_config.json` reset Home。

Setup 不会启动 purifier，也不会发送短信。

## 4. 正确输出

### 4.1 Home

`kitchen_air_purifier_1` 最终为：

~~~text
power: on
level: high
~~~

Oracle 先执行 `turn_on`，再执行 `set_level(high)`。

### 4.2 短信

发送到 `5552410`。Oracle 示例：

~~~text
Lentil Soup cooking has started; the kitchen purifier is running on high.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 2 个 evaluator，两个都必须成功：一条匹配的 sent SMS，以及 kitchen purifier 的最终状态。

### 5.1 短信语义条件

Evaluator 在 sent box 中找发给 `5552410`、最近 30 分钟内的消息。正文必须包含每组中的至少一个：

- `Lentil Soup` 或 `cooking`；
- `kitchen`；
- `purifier` 或 `air purifier`；
- `high`。

还要至少包含一个肯定状态表达：

- `running`、`is on`、`started`、`set to high`。

不能包含：

- `pending`、`cancelled`、`canceled`、`not running`、`not on high`、`not started`。

这是大小写不敏感的 entity-relation 匹配，不是 Oracle 整句绝对匹配。实体可以跨句出现；问句、不确定、否定或撤销语义仍会被通用规则拒绝。Evaluator 不要求提到 ingredients 或 45 minutes，也不要求恰好一条 sent SMS。

### 5.2 Home 状态

`smarthome.check_device_state` 按子集要求：

- power=`on`；
- level=`high`。

它不检查动作顺序或 command history。

### 5.3 没有检查的输入

Evaluator 不检查 Broccoli 食谱和联系人完成后是否仍存在，也不使用 PM2.5=72 作为短信必填项。PM2.5 是 Home 初始环境数据，但本任务的明确动作来源是食谱 directions。

## 6. 常见失败与真实评测边界

- 只开 purifier 而没有设 high：Home 失败。
- 短信写“Dinner is ready”：缺少 kitchen、purifier、high，失败。
- 短信写 “purifier will start later”：命中冲突/非完成语义，失败。
- 不必在短信写 lentils、onion、garlic 或 45 minutes。
- 可以写 `Cooking started` 而不必逐字写 `Lentil Soup`，因为第一实体组是二选一。

## 7. Cleanup

- android_0 清空 Broccoli recipes；
- android_1 清空 Contacts 和 SMS；
- home_0 reset。
