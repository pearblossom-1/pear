# Core 121 — linux_smarthome_983

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 121 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_983.json
- 运行配置：configs/cross_device/local_2linux_smarthome.json
- 难度：medium
- 设备拓扑：2L+1H（linux_0、linux_1、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

这是一个“第一台 Linux 看规则、第二台 Linux 填处理表、Home 执行允许操作”的任务。评测时钟固定在 2026-07-15 12:10。

四行请求的正确处理是：

| 行 | 请求 | 当前有效规则 | 是否执行 | Home 最终值 | 工作簿 Decision / After |
|---|---|---|---|---|---|
| R1 | bedroom light off | Protected，7 月 1 日至 8 月 1 日有效 | 不执行 | bedroom light 仍为 on | Protected / on |
| R2 | office purifier low | Exempt，仍在有效期 | 执行 | purifier level=low | Exempt Executed / low |
| R3 | hallway light on | Normal，仍在有效期 | 执行 | light power=on | Normal Executed / on |
| R4 | kitchen purifier high | Exception 已于 7 月 14 日到期；规则说到期后按 protected 处理 | 不执行 | purifier level 仍为 medium | Expired Exception - Protected / medium |

也就是说，只应改变 office purifier 和 hallway light；bedroom light 与 kitchen purifier 必须保持原值。

## 1. Instruction

### 英文原文（逐字）

~~~text
Prepare the maintenance-freeze handoff. Use `/tmp/protection/current.docx` on the first Linux machine to decide the four requests in `/tmp/protection/board.xlsx` on the second, record each decision and resulting value in that workbook, and carry out only the requests allowed by the active SmartHome rules.
~~~

### 中文翻译

准备维护冻结交接。使用第一台 Linux 机器上的 /tmp/protection/current.docx 判断第二台 Linux 机器上 /tmp/protection/board.xlsx 中的四项请求；在该工作簿中记录每项决定及处理后的值，并且只执行当前 SmartHome 规则允许的请求。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或音频附件。

### 2.1 linux_0：current.docx 的完整业务内容

文件标题：Protection and Exception Rules。

正文提示：Use the effective rule for each request row.

规则表：

| row | rule_type | effective_from | effective_to | handling |
|---|---|---|---|---|
| R1 | Protected | 2026-07-01 | 2026-08-01 | do not execute |
| R2 | Exempt | 2026-07-01 | 2026-08-01 | execute if feasible |
| R3 | Normal | 2026-07-01 | 2026-08-01 | execute if feasible |
| R4 | Exception | 2026-07-01 | 2026-07-14 | expired means protected |

文档共 1 页，无页眉、页脚、批注、脚注、尾注或修订痕迹。

### 2.2 linux_1：board.xlsx 的初始内容

工作簿有两个 sheet：Board、Completion Guide。

Board 的列为：

| 列 | 标题 |
|---|---|
| A | Row |
| B | Room |
| C | Request |
| D | Effective |
| E | Rule Type |
| F | Decision |
| G | After |

初始四行：

| 行 | A | B | C | D:G 初始状态 |
|---|---|---|---|---|
| 2 | R1 | bedroom | light off | 空 |
| 3 | R2 | office | purifier low | 空 |
| 4 | R3 | hallway | light on | 空 |
| 5 | R4 | kitchen | purifier high | 空 |

下拉列表：

- F2:F5：Protected、Exempt Executed、Normal Executed、Expired Exception - Protected。
- G2:G5：on、low、medium。

Completion Guide 的说明是：Decision 应使用上述四种政策结果，即 protected、exempt execution、normal execution 或 expired exception/protected。

### 2.3 Home 初始状态

当前时间：2026-07-15 12:10。

| 设备 | 房间 | 初始状态 | 与本题关系 |
|---|---|---|---|
| bedroom_light_1 | bedroom | power=on，protected=true | R1 不得关闭 |
| office_air_purifier_1 | office | power=on，level=medium | R2 改为 low |
| hallway_light_1 | hallway | power=off | R3 改为 on |
| kitchen_air_purifier_1 | kitchen | power=on，level=medium，protected=true | R4 保持 medium |

初始 schedules、workflows、history 都为空。

## 3. Setup 具体流程

### linux_0

1. 删除旧的 /tmp/protection/current.docx。
2. 创建 /tmp/protection。
3. 将仓库中的 current.docx 上传到同一路径。

### linux_1

1. 删除旧的 /tmp/protection/board.xlsx。
2. 创建 /tmp/protection。
3. 将预填工作簿上传到 /tmp/protection/board.xlsx。

### home_0

使用 linux_smarthome_983/episode_config.json 完整 reset Home，建立上面的时间、四个设备和空计划状态。

Setup 只放置文件并重置 Home，不会自动打开 DOCX/XLSX，也不会预先填写表格或执行设备命令。

## 4. Evaluator：评测方式与具体评测点

### 4.0 怎样才算通过

三个 evaluator 都必须成功。第三项虽然标记 enable_score_calc=false，不提供正向分数权重，但它是硬性 guard：一旦失败，总分会被置为 0。

### 4.1 board.xlsx 的精确单元格检查

评测函数：check_xlsx_cells；读取 linux_1 的 /tmp/protection/board.xlsx。

必须存在名为 Board 的 sheet，并且以下单元格文本逐字相等：

| 单元格 | 必须是 |
|---|---|
| F2 | Protected |
| G2 | on |
| F3 | Exempt Executed |
| G3 | low |
| F4 | Normal Executed |
| G4 | on |
| F5 | Expired Exception - Protected |
| G5 | medium |

这里是精确、区分大小写的字符串比较，不是关键词检测。例如 `protected`、`Exempt executed` 或 `Expired Exception-Protected` 都不等于期望值。字体、颜色、列宽等格式不参与比较。

当前规则没有开启 reject_extra_nonempty_cells，因此其他单元格可以有内容；Evaluator 也没有核对 D/E 列。不过标准完成结果应把 D/E 一并填写清楚，见第 5 节。

### 4.2 被允许执行的 Home 结果

第二个 evaluator 以“字段子集匹配”检查：

- office_air_purifier_1：power=on 且 level=low；
- hallway_light_1：power=on。

它只要求列出的字段相等，不要求整个 Home JSON 与某个快照完全相同。

### 4.3 被保护对象必须保持不变

硬性 guard 检查：

- bedroom_light_1：power 必须仍为 on；
- kitchen_air_purifier_1：level 必须仍为 medium。

因此，先错误执行、再改回最终值，可能躲过这两个最终状态检查；但那仍违反 instruction。任务也没有单独检查 command history、schedule 数量或未列出的设备。

## 5. 推荐填写后的完整 Board

Oracle 的完整业务填写如下：

| Row | Room | Request | Effective | Rule Type | Decision | After |
|---|---|---|---|---|---|---|
| R1 | bedroom | light off | current | Protected | Protected | on |
| R2 | office | purifier low | current | Exempt | Exempt Executed | low |
| R3 | hallway | light on | current | Normal | Normal Executed | on |
| R4 | kitchen | purifier high | expired | Expired Exception | Expired Exception - Protected | medium |

真正决定 evaluator 的是 F2:G5；D/E 是合理且完整的审计说明。

## 6. 常见失败与真实评测边界

- 将 R1 的 bedroom light 关掉：Home guard 失败。
- 将 R4 purifier 改成 high：Home guard 失败。
- 正确操作 Home，但没有保存 board.xlsx：工作簿检查失败。
- 在错误的 sheet 或错误单元格填写：失败。
- 写成含义相同但大小写/标点不同的 Decision：失败。
- 只填 D/E 而不填 F/G：失败。

## 7. Cleanup

- linux_0 删除 current.docx，并尝试删除空的 /tmp/protection。
- linux_1 删除 board.xlsx，并尝试删除空的 /tmp/protection。
- home_0 reset。

