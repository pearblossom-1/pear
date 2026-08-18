# Core 052 — `linux_android_1181`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1181.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：最多 50 步；未单独设置最长秒数

## 1. Instruction

### 英文原文（逐字）

```text
A customer texted from the support phone. Match the sender and case code against `/tmp/support/tickets.csv`, then reply with the matching case status and next step.
```

### 中文翻译

客户从 support phone 发来短信。按 sender 与 case code 在 tickets.csv 中匹配，然后回复对应 case status 和 next step。

## 2. 输入、Setup 与评测

收到 `5551201181` 的短信：`This is Mira. Please check CASE-4187 before lunch.`；联系人是 Mira Chen。CSV 唯一同时匹配号码和 case 的行：`Mira Chen,5551201181,CASE-4187,parts allocated,Depot pickup Friday`。近名 Mira Cheng、CASE-4180 等是干扰。

唯一 evaluator 查最近 30 分钟发往该号码的 SMS。稳妥回复：

```text
CASE-4187: parts are allocated. Depot pickup is Friday.
```

必须出现 CASE-4187、parts/components、Depot、Friday；同一 clause 要把 parts 与 allocated/assigned/reserved 关联，另一 clause 把 Depot、Friday 与 pickup/collection 关联。出现 backordered/unavailable/cancelled/closed 或其他星期会失败。不是绝对整句匹配。

