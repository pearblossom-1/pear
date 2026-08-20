# Core 135 — linux_smarthome_981

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 135 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_981.json`
- 运行配置：`configs/cross_device/local_2linux_smarthome.json`
- 难度：medium
- 设备拓扑：2L+1H（`linux_0`、`linux_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

当前时间是 2026-07-15 12:00。四行请求的结果：

| 行 | 政策/实时判断 | 正确结果 |
|---|---|---|
| R1 | Window=Open，到 18:00 有效；office curtain 当前 20，目标 60 可执行 | Executed，open_pct 60 |
| R2 | Window=Closed | Blocked，bedroom light 保持 on |
| R3 | 有效期是前一天 18:00，已经过期 | Expired，purifier 保持 medium |
| R4 | Window=Open，但 office light 已经是 brightness 35 | Already Applied，保持 brightness 35 |

只应执行 R1 的 curtain command。

## 1. Instruction

### 英文原文（逐字）

~~~text
Close out the current home-automation change window. Use `/tmp/window/policy.docx` on the first Linux machine and the live SmartHome state to complete the decision and result columns in `/tmp/window/board.xlsx` on the second; execute only a still-open feasible change, leaving blocked, expired, and already-applied devices unchanged.
~~~

### 中文翻译

关闭当前 home-automation change window。使用第一台 Linux 上的 `/tmp/window/policy.docx` 和实时 SmartHome 状态，完成第二台 Linux 上 `/tmp/window/board.xlsx` 的 decision 与 result 列；只执行仍在开放窗口内且可行的更改，blocked、expired 和 already-applied 设备保持不变。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片或音频附件。

### 2.1 linux_0：policy.docx 的完整内容

标题：`Change Window Policy`。

正文：

~~~text
Use the row policy and live SmartHome state to decide each board request.
~~~

政策表：

| row | window | valid_until | handling |
|---|---|---|---|
| R1 | Open | 2026-07-15T18:00:00 | execute if feasible |
| R2 | Closed | 2026-07-15T18:00:00 | block |
| R3 | Open | 2026-07-14T18:00:00 | expired |
| R4 | Open | 2026-07-15T18:00:00 | record already applied |

文档共 1 页；没有页眉/页脚正文、批注、脚注、尾注或修订痕迹。预览中标题、说明和四行政策均完整可见。

### 2.2 linux_1：board.xlsx 初始内容

工作簿有 `Board` 和 `Completion Guide` 两个 sheet。

Board 列：

| 列 | 标题 |
|---|---|
| A | Row |
| B | Request |
| C | Action |
| D | Window |
| E | Live |
| F | Reason |
| G | Decision |
| H | After |

初始四行：

| Row | Request | Action |
|---|---|---|
| R1 | open office shade | office curtain 60 |
| R2 | closed bedroom light | bedroom light off |
| R3 | expired kitchen purifier | kitchen purifier high |
| R4 | already office light | office light 35 |

D:H 初始为空。

G2:G5 下拉选项：Executed、Blocked、Expired、Already Applied。  
H2:H5 下拉选项：open_pct 60、on、medium、brightness 35。

Completion Guide：

~~~text
Executed = valid window and action applied; Blocked = policy blocks it; Expired = request window elapsed; Already Applied = live state already satisfies it.
~~~

### 2.3 Home 初始状态

当前时间：2026-07-15 12:00。

| 设备 | 初始状态 |
|---|---|
| office_curtain_1 | open_pct=20，status=partial |
| bedroom_light_1 | power=on |
| kitchen_air_purifier_1 | power=on，level=medium |
| office_dimmable_light_1 | power=on，brightness_pct=35 |

初始 schedules、workflows、history 均为空。

## 3. Setup 具体流程

### linux_0

1. 删除旧的 `/tmp/window/policy.docx`。
2. 创建 `/tmp/window`。
3. 上传 policy.docx。

### linux_1

1. 删除旧的 `/tmp/window/board.xlsx`。
2. 创建 `/tmp/window`。
3. 上传 board.xlsx。

### home_0

使用 `linux_smarthome_981/episode_config.json` reset Home。

Setup 不会自动打开 DOCX/XLSX，也不会填写 Board。

## 4. 推荐填写后的完整 Board

| Row | Request | Action | Window | Live | Reason | Decision | After |
|---|---|---|---|---|---|---|---|
| R1 | open office shade | office curtain 60 | Open | open_pct 20 | window open and feasible | Executed | open_pct 60 |
| R2 | closed bedroom light | bedroom light off | Closed | on | window frozen | Blocked | on |
| R3 | expired kitchen purifier | kitchen purifier high | Expired | medium | approval expired | Expired | medium |
| R4 | already office light | office light 35 | Open | brightness 35 | target already applied | Already Applied | brightness 35 |

Home 只执行：

~~~text
office_curtain_1.set_open_pct(open_pct=60)
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

三个 evaluator 都必须成功。第三项虽然 `enable_score_calc=false`，仍是硬性 guard；它失败时总分会被置为 0，任务也不会成功。

### 5.1 board.xlsx

评测函数：`check_xlsx_cells`；文件为 `linux_1:/tmp/window/board.xlsx`，明确要求 `Board` sheet。

| 单元格 | 必须是 |
|---|---|
| G2 | Executed |
| H2 | open_pct 60 |
| G3 | Blocked |
| H3 | on |
| G4 | Expired |
| H4 | medium |
| G5 | Already Applied |
| H5 | brightness 35 |

这是区分大小写的精确单元格字符串比较。D/E/F 没有进入机器断言，但业务上建议完整填写。

### 5.2 被执行的 Home 结果

`office_curtain_1.open_pct` 必须等于 60。该 evaluator 没有要求 `status`，正常执行后通常为 `partial`。

### 5.3 不应改变的三项最终字段

硬性 guard 要求：

- `bedroom_light_1.power` 仍为 `on`；
- `kitchen_air_purifier_1.level` 仍为 `medium`；
- `office_dimmable_light_1.brightness_pct` 仍为 35。

这是字段子集的最终状态检查，不是 command-history 检查。例如 purifier 的 `power` 和 office light 的 `power` 没有被这条规则直接断言。

### 5.4 没有检查的内容

- 不检查 D/E/F；
- 不检查 command-history 数量或是否曾临时改动后恢复；
- 不检查 schedule/workflow；
- 不要求唯一一次 curtain command；
- 不检查 blocked/expired/already-applied 设备的全部状态字段，只检查上面列出的字段。

## 6. 常见失败与真实评测边界

- R1 表格写对但 curtain 仍为 20：失败。
- 关闭 bedroom light：硬性 guard 失败。
- 把 purifier 调到 high：level guard 失败。
- 对已满足的 office light 改成其他亮度：brightness guard 失败。
- G/H 用近义词，如 `Done`、`Already applied`：精确单元格失败。
- 只填 G/H、Home 最终状态正确：机器可以通过，但没有完整完成 instruction 所说的 decision/result 依据记录。

## 7. Cleanup

- linux_0 删除 policy.docx，并尝试删除空目录。
- linux_1 删除 board.xlsx，并尝试删除空目录。
- home_0 reset。

