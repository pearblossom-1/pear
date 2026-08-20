# Core 146 — android_smarthome_251

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 146 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_251.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

同一台手机上有一条收到的请求短信和一个匹配联系人：

- 请求要求 bedroom light=20%、curtain closed；
- 联系人确认号码是 `5552510`，并给出回信风格。

需要先完成 Home 设置，再向 `5552510` 发一条完成确认短信。

## 1. Instruction

### 英文原文（逐字）

~~~text
On this phone, a request in Simple SMS Messenger and the matching note in Android Contacts specify a bedroom setup, its reply destination, and the requested confirmation style. Make the Home changes, then reply in Simple SMS Messenger using that style with the completed light and curtain settings.
~~~

### 中文翻译

在这台手机上，Simple SMS Messenger 中的一条请求和 Android Contacts 中匹配的备注指定了卧室设置、回复目的地和要求的确认风格。完成 Home 更改后，在 Simple SMS Messenger 中按该风格回复，并写明已经完成的灯光和窗帘设置。

## 2. 输入、附件与初始业务数据

本任务没有文件附件或邮件。短信和联系人由 setup 直接写入手机。

### 2.1 收到的请求短信

Simple SMS Messenger 会先清空，然后通过 `androidworld_sms_receive` 注入一条收件箱消息：

| 字段 | 内容 |
|---|---|
| address | 5552510 |
| body | Set bedroom light to 20% and curtain closed, then reply. |

它是输入消息，不是已经发送的结果。

### 2.2 联系人备注

Contacts 会先清空，再加入：

| 字段 | 内容 |
|---|---|
| name | Bedroom Updates |
| number | 5552510 |
| notes | Receives bedroom setup replies in this style: Bedroom light is at LEVEL%; curtain is closed. |

### 2.3 home_0：相关初始状态

当前时间：`2026-06-16T19:00:00`。

| 设备 | 初始状态 |
|---|---|
| bedroom_dimmable_light_1 | power=on，brightness_pct=70 |
| bedroom_curtain_1 | open_pct=80，status=partial |

初始 schedules、workflows 和 history 均为空。

## 3. Setup 具体流程

### android_0

1. 确保 Simple SMS Messenger 可用；
2. 清空 SMS；
3. 从 `5552510` 注入请求短信并等待 5 秒；
4. 确保 Contacts 可用并清空联系人；
5. 创建 `Bedroom Updates` 联系人及其完整备注。

### home_0

使用 `android_smarthome_251/episode_config.json` reset Home。

Setup 不会改动卧室设备，也不会替你发送回复。

## 4. 正确输出

### 4.1 Home

| 设备 | 正确最终状态 |
|---|---|
| bedroom_dimmable_light_1 | power=on，brightness_pct=20 |
| bedroom_curtain_1 | open_pct=0 |

Oracle 使用 `set_brightness(20)` 和 `close`。

### 4.2 回复短信

发送到 `5552510`。Oracle 示例：

~~~text
Bedroom setup is complete: the light is at 20% and the curtain is closed.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 3 个 evaluator，全部必须成功：

1. sent SMS；
2. bedroom dimmable light 最终状态；
3. bedroom curtain 最终状态。

### 5.1 Sent SMS 采用语义匹配

Evaluator 只查询 sent box，输入的 received SMS 不会被当成输出。它要求至少一条发给 `5552510`、最近 30 分钟内的短信，正文命中所有实体组：

- `bedroom`；
- `light`；
- `20` 或 `20%`；
- `curtain`；
- `closed` 或 `close`。

此外至少出现一个完成态词语：

- `complete`、`completed`、`applied`、`set`。

不能出现：

- `pending`、`cancelled`、`canceled`、`not applied`、`not complete`、`not closed`。

不是与联系人备注或 Oracle 做整句绝对匹配；标点和语序可改。无 `relation_groups`，实体可以跨句，但问句、不确定、否定或撤销语义会被通用 relation scorer 拒绝。Evaluator 不要求恰好一条 sent SMS。

### 5.2 Light 状态

`smarthome.check_device_state` 按子集检查 `bedroom_dimmable_light_1`：

- power=`on`；
- brightness_pct=`20`。

### 5.3 Curtain 状态

另一个 `check_device_state` 只要求 `bedroom_curtain_1.open_pct=0`。

当前 evaluator 没有同时要求 `status=closed`；只要 open_pct 为 0 即满足这一项。两个状态 evaluator 都只看最终值，不看执行命令或顺序。

## 6. 常见失败与真实评测边界

- 只回复短信，不改 Home：两个设备状态项失败。
- 把 20% 理解成降低 20 个百分点，设为 50%：失败；目标是绝对值 20。
- 短信发在 received/draft 而不是 sent box：失败。
- 短信写“will do later”或“pending”：没有肯定完成态，且会命中冲突。
- 不必逐字使用联系人备注中的分号格式。

## 7. Cleanup

- android_0 清空 SMS 和 Contacts；
- home_0 reset。
