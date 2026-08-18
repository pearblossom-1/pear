# Core 078 — `linux_android_smarthome_614`

- 任务文件：`tasks/cross_device/linux_android_smarthome/linux_android_smarthome_614.json`
- 运行配置：`configs/cross_device/local_2android_linux_smarthome.json`；拓扑 `2A+1L+1H`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
The first phone has yesterday's continue-cleaning photo; the second phone has today's authenticated Owner stop request and contact. Use `/tmp/home_ops/approval-forms/source/priority.pdf` to resolve the conflict, dock the SmartHome robot, and reply to the Owner with the actual result.
```

### 中文翻译

第一部手机照片是昨天继续清扫，第二部手机是今天认证 Owner 的 stop 请求。按 priority PDF 解决冲突，把机器人回 dock，并回复实际结果。

## 2. 数据与评测

PDF：最新 authenticated Owner request 优先；冲突时 stop cleaning and dock。短信来自 `+1555061401`，Contact Owner 同号码。

两项评分：living_room_robot_vacuum_1 最终 power=off、status=docked；向 Owner 发肯定短信并提 cleaning robot，不能说 not docked/undocked/still cleaning。推荐：`The cleaning robot stopped and is docked.`

