# Core 077 — `linux_android_smarthome_161`

- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_161.json`
- 运行配置：`configs/cross_device/local_android_linux_smarthome.json`；拓扑 `1A+1L+1H`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
Use the authorized climate request in Simple SMS Messenger, the matching contact role, and `/tmp/access/guest-climate.xlsx` to set the guest-room SmartHome climate. Reply to the requester with the actual heater result.
```

### 中文翻译

按授权短信、匹配联系人 role 和 XLSX 设置 guest-room SmartHome climate，并回复实际 heater 结果。

## 2. 数据与评测

Requester `+1555016101` 要求 warm guest room；Contact Alex House role Owner。XLSX：Owner/guest room/max 22 C；Guest 只读。

两项评分：guest_room_heater_1 最终 power=on、target=22；最近短信需发给请求号码并肯定关联 guest room、heater、22，以及 now set/set to/is on/warmed to 等，禁止 off/failed/cannot。推荐：`Guest room heater is on and now set to 22 C.`

