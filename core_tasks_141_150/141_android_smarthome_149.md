# Core 141 — android_smarthome_149

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 141 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_149.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：medium
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台手机的 Markor 规则是：PM2.5 高于 50 时，把对应房间的净化器开到 high，并通知家人。Home 中 kitchen 的 PM2.5 是 91，净化器当前关闭。因此要：

1. 把 kitchen air purifier 打开并设为 high；
2. 在第二台手机上向联系人号码 `5551490` 发一条短信；
3. 短信要明确说 kitchen、PM2.5=91、高于阈值 50、净化器已经在 high 档运行。

## 1. Instruction

### 英文原文（逐字）

~~~text
The first phone has air-quality rules in Markor, and SmartHome shows an air problem. Please start purification and notify the family from the second phone.
~~~

### 中文翻译

第一台手机的 Markor 中有空气质量规则，而 SmartHome 显示存在空气问题。请启动净化，并从第二台手机通知家人。

## 2. 输入、附件与初始业务数据

本任务没有邮件、日历或办公文档附件。输入来自一份 Markor 文件、一个联系人和 Home 实时状态；短信是需要新建的输出。

### 2.1 android_0：Markor 附件

源文件 `Air Quality Rule.md` 会上传到：

~~~text
/storage/emulated/0/Documents/Markor/Air Quality Rule.md
~~~

文件全文：

~~~text
If PM2.5 is above 50, run the affected room purifier on high and notify family.
~~~

中文：如果 PM2.5 高于 50，就把受影响房间的净化器开到 high，并通知家人。

### 2.2 android_1：联系人与短信初始状态

Contacts 会先被清空，再加入：

| 字段 | 内容 |
|---|---|
| name | Family Air Updates |
| number | 5551490 |
| notes | Send PM2.5 kitchen air updates here. |

Simple SMS Messenger 的短信会被清空，所以 setup 后没有旧的已发送短信可误通过。

### 2.3 home_0：相关初始状态

Home 当前时间为 `2026-06-16T19:00:00`。

| 项目 | 初始值 |
|---|---|
| kitchen PM2.5 | 91.0 |
| kitchen_air_purifier_1 | power=off，level=low |
| schedules | 空 |
| workflows | 空 |
| history | 空 |

91 大于规则阈值 50，因此必须执行净化动作。

## 3. Setup 具体流程

### android_0

1. 确保 Markor 可用。
2. 上传 `Air Quality Rule.md` 到上述精确路径。

### android_1

1. 确保 Contacts 可用并清空联系人。
2. 创建 `Family Air Updates` 联系人及其号码、备注。
3. 确保 Simple SMS Messenger 可用并清空短信。

### home_0

使用 `android_smarthome_149/episode_config.json` reset Home，写入 19:00 的房间读数和设备状态。

Setup 不会替你打开净化器，也不会发送结果短信。

## 4. 正确输出

### 4.1 Home

最终 `kitchen_air_purifier_1` 应为：

~~~text
power: on
level: high
~~~

Oracle 的动作是先 `turn_on`，再 `set_level(level=high)`。

### 4.2 短信

发送到 `5551490`。Oracle 示例正文：

~~~text
Kitchen PM2.5 is 91, above the 50 limit, so the purifier is now running on high.
~~~

不需要逐字照抄，但下面 evaluator 列出的信息必须齐全。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 2 个 evaluator，两个都必须成功：

1. android_1 的已发送短信；
2. kitchen purifier 的最终 Home 状态。

### 5.1 短信不是整句绝对匹配

`exact_match` 比较的是 getter 最终返回的 `present`/`missing`，并不是拿短信正文与 Oracle 整句做等号比较。

Evaluator 在 sent box 中找地址为 `5551490`、发送时间在最近 30 分钟内的消息。号码比较会忽略空格和连字符。至少有一条消息同时满足以下语义条件即可：

- 每个实体组都要命中至少一个写法：
  - `kitchen`；
  - `PM2.5` / `PM 2.5` / `air quality`；
  - `91`；
  - `50`；
  - `purifier` / `purification`；
  - `high`。
- 完成态词语至少命中一组中的一个：`running`、`is on`、`set to`、`started`。
- 还必须出现阈值关系之一：`above 50`、`above the 50`、`over 50`、`exceeds 50`。
- 不能出现：`pending`、`cancelled`、`canceled`、`not started`、`not running`、`not on high`、`will start later`。

通用 relation scorer 会忽略大小写、允许自然空白变化，并按词边界匹配；问句、明显的不确定、否定或撤销表达也会失败。本规则没有 `relation_groups`，所以这些信息不必照 Oracle 的顺序写，也不强制全部在同一句，但写成一条清楚的肯定句最稳妥。

Evaluator 只要求至少一条匹配短信，不要求 sent box 中恰好只有一条。

### 5.2 Home 最终状态

`smarthome.check_device_state` 读取 `kitchen_air_purifier_1`，按字典子集匹配：

- `power` 必须为 `on`；
- `level` 必须为 `high`。

它检查最终状态，不检查你必须用哪两个具体命令，也不检查 command history。

### 5.3 没有单独检查的输入

Evaluator 不检查 Markor 源文件或联系人最后是否仍存在，也不检查其他 Home 设备、schedule 或 workflow。它们只是 setup 提供的信息源。

## 6. 常见失败与真实评测边界

- 只写“空气不好，净化器开了”：缺少 91、50、high 或阈值关系，短信失败。
- 写“will start later”或“pending”：即使其他关键词齐全也失败。
- 发到联系人名字对应的错误号码：失败；目标是 `5551490`。
- 只调到 high 但设备仍是 off：Home 状态失败。
- 短信正文可以改写，不必逐字复制 Oracle。

## 7. Cleanup

- android_0 删除 `Air Quality Rule.md`；
- android_1 清空 Contacts 和 SMS；
- home_0 reset。
