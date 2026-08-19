# Core 077 — `linux_android_smarthome_161`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 77 项
- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_161.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`
- 设备拓扑：`1A+1L+1H`（`android_0`、`linux_0`、`home_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与授权结论

短信请求暖 guest room；同号码联系人 Alex House 的 notes 表明 Role=Owner。Linux workbook 规定 Owner 对 guest room 的最高设置是 22 C，而 Guest 角色只读。因此该请求有权限，应把 guest_room heater 打开并将 target 设为 22 C，再回复请求者实际结果。

## 1. Instruction

### 英文原文（逐字）

```text
Use the authorized climate request in Simple SMS Messenger, the matching contact role, and `/tmp/access/guest-climate.xlsx` to set the guest-room SmartHome climate. Reply to the requester with the actual heater result.
```

### 中文翻译

使用 Simple SMS Messenger 中已获授权的 climate request、匹配联系人的 role，以及 `/tmp/access/guest-climate.xlsx`，设置 guest-room SmartHome climate。然后向请求者回复 heater 的实际结果。

## 2. 输入、附件与初始业务数据

### 2.1 手机 SMS

来自 `+1555016101`：

```text
Please warm the guest room to the allowed setting.
```

### 2.2 手机 Contact

```text
Name: Alex House
Number: +1555016101
Notes: Role: Owner; guest room climate allowed
```

号码与 SMS requester 完全相同，因此 workbook 中应查 Owner 行。

### 2.3 Linux workbook `guest-climate.xlsx`

Workbook 只有一个可见 sheet `Sheet1`，使用范围 A1:C3，无公式。完整单元格内容：

| Role | Room | Max temperature |
|---|---|---|
| Owner | guest room | 22 C |
| Guest | read only | none |

因此允许值是 22 C；Guest 行不是本请求者角色。

### 2.4 SmartHome 初始相关状态

- current_time=`2026-06-16T19:00:00`
- guest room 环境温度=`25.4 C`
- `guest_room_heater_1`：power=off，target_temperature_c=19.0

目标是 heater 的配置状态 on/22.0，而不是等待模拟环境温度变化。

## 3. Setup 具体流程

### `linux_0`

- 创建 `/tmp/access`，删除旧 guest-climate.xlsx。
- 上传 workbook。

### `android_0`

- 确保 Simple SMS Messenger 可用，清空 SMS，注入请求。
- 确保 Contacts 可用，清空 Contacts，添加 Alex House。

### `home_0`

- 用 episode_config 重置 SmartHome，加载 heater 的 off/19 初态。

## 4. Evaluator：评测方式与具体评测点

本题有 2 个 evaluation 单元：回复 SMS 与 SmartHome heater state。

### 4.1 SmartHome heater

`guest_room_heater_1` 最终必须至少满足：

```json
{
  "power": "on",
  "target_temperature_c": 22.0
}
```

这是状态字段的 subset 匹配；设备记录中的其他正常字段不影响，但 power 和 target 两项都必须准确。

### 4.2 发给请求者的 SMS

稳妥回复：

```text
Guest room heater is on and now set to 22 C.
```

具体规则：

- 必须在 sent box 中，地址为 `+1555016101`，且在最近 30 分钟窗口内。
- 房间实体接受 `guest room`、`guest-room`、`guest bedroom`。
- 设备实体接受 `heater` 或 `heating`。
- 温度接受 `22`、`22.0`、`twenty-two`、`twenty two`。
- 至少命中一个肯定结果：`now set`、`set to`、`is on`、`turned on`、`warmed to`、`heating at`。
- 不能出现 `off`、`failed`、`could not`、`cannot`、`not set`、`unavailable`、`21`、`23`、`cooling`。
- 问句、不确定或否定陈述失败。未配置 clause/近邻绑定，按整条 body 检查。

Getter 只需要存在一条匹配 recent sent SMS，没有要求整个 sent box 只有这一条。

## 5. 常见失败与真实评测边界

- 只开 heater，不把 target 改到 22：home evaluator 失败。
- Home 状态正确但不回复：SMS 项失败。
- 回复 “set to 23” 或同时提及 21/23：命中 conflict。
- 回复 “heater setting 22” 但没有任何肯定结果词：positive phrase 缺失。

Evaluator 不直接验证联系人 role 或 workbook 行是否被读取；它以最终 heater state 和回信内容体现授权决策。输入还有一处语义不协调：guest room 初始环境温度是 25.4 C，高于 target 22 C，却用 “warm” 描述请求。评分不会等待房间真的变暖，也不检查环境温度，只要求 heater=on、target=22 与相应回信。

## 6. Cleanup

- Linux 删除 guest-climate.xlsx 和空目录。
- 手机清空 SMS、Contacts，并再次清空 SMS（配置有重复 clear）。
- SmartHome reset。
