# Core 117 — `linux_smarthome_796`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 117 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_796.json`
- 运行配置：`configs/cross_device/local_2linux_smarthome.json`
- 难度：medium
- 设备拓扑：`2L+1H`（`linux_0`、`linux_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

这是 capability audit，不是设备控制任务。CSV 列出四个资产和“目录声称应支持的命令”，需要用实时 Home inventory 核实：

- office curtain 实际存在并支持 `set_open_pct`：Supported；
- office basic light 存在，但只能开/关，不支持 brightness：Unsupported；
- guest-room heater 不在实时 inventory：Missing；
- hallway dimmer 存在并支持 `set_brightness`：Supported。

只填写 `audit.xlsx`，不要向 Home 发任何 command。

## 1. Instruction

### 英文原文（逐字）

```text
`/home/user/assets/labels.csv` on the first Linux machine lists the asset IDs, and `/tmp/assets/audit.xlsx` on the second Linux machine is the audit workbook. Query Home capabilities and complete the reconciliation.
```

### 中文翻译

第一台 Linux 机器上的 `/home/user/assets/labels.csv` 列出资产 ID，第二台 Linux 机器上的 `/tmp/assets/audit.xlsx` 是 audit 工作簿。查询 Home capabilities 并完成核对。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 Linux 0：`labels.csv` 原文

```csv
asset,room,device,expected_command
A-01,office,curtain,set_open_pct
A-02,office,basic light,set_brightness
A-03,guest room,heater,set_target_temperature
A-04,hallway,dimmer,set_brightness
```

### 2.2 Linux 1：`audit.xlsx` 修改前内容

运行时路径及最终保存路径：`/tmp/assets/audit.xlsx`

工作簿有 `Audit` 与 `Completion Guide` 两个 sheet。`Audit` 修改前：

| Asset | Expected Command | Actual | Notes | Decision |
|---|---|---|---|---|
| A-01 office curtain | set_open_pct | 空 | 空 | 空 |
| A-02 office basic light | set_brightness | 空 | 空 | 空 |
| A-03 guest heater | set_target_temperature | 空 | 空 | 空 |
| A-04 hallway dimmer | set_brightness | 空 | 空 | 空 |

Completion Guide：Supported 表示真实设备接受预期命令；Unsupported 表示设备存在但缺少该命令；Missing 表示没有匹配设备。

### 2.3 SmartHome 初始 inventory

当前时间：`2026-06-16 19:00`。

```text
office_curtain_1:
  type=curtain, open_pct=20

office_light_1:
  type=light, power=off

hallway_dimmable_light_1:
  type=dimmable_light, power=off, brightness_pct=0
```

Guest room 存在，但没有任何 heater。初始 command history、schedules、workflows 均为空。

## 3. Setup 具体流程

### `linux_0`

删除旧 labels.csv，创建 `/home/user/assets`，上传 CSV。

### `linux_1`

删除旧 audit.xlsx，创建 `/tmp/assets`，上传工作簿。

### `home_0`

从 episode config 重置 Home。Setup 不会自动打开两个输入文件。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator。

### 4.0 先说人话：怎样才算通过

不操作任何设备，只查询 capability，然后把 `Audit` sheet 填成固定答案；Home command history 必须仍为 0。

### 4.1 `Audit` sheet 逐格精确结果

| Asset | Expected Command | Actual | Notes | Decision |
|---|---|---|---|---|
| A-01 office curtain | set_open_pct | set_open_pct supported | live match | Supported |
| A-02 office basic light | set_brightness | turn_on/turn_off only | catalog overstates capability | Unsupported |
| A-03 guest heater | set_target_temperature | missing from live inventory | asset not present | Missing |
| A-04 hallway dimmer | set_brightness | set_brightness supported | live match | Supported |

Evaluator 要求 sheet 名精确为 `Audit`，并逐格比较 A1:E5。文本必须按上表写，不接受同义改写；格式、样式、列宽不评分，Completion Guide 不评分。

### 4.2 零命令守护

`smarthome.check_command_history_count` 要求全局 command history 总数精确为 0。即使只是“测试一下” curtain 或 dimmer 再恢复，也会留下历史而失败。

## 5. 常见失败与真实评测边界

- 因 CSV 写了 expected command 就真的操作设备：history 不再为 0，失败。
- 把普通 light 当成 dimmable light：R2 应是 Unsupported。
- 看到 guest room 存在就假设 heater 也存在：R3 应是 Missing。
- 在工作簿中写 `Not supported` 或 `Absent`：不是 evaluator 固定文本，失败。

当前 evaluator 不直接比较三台现有设备的最终 state，也不检查 schedules/workflows；零 command history 是它对 Home 不应被控制的主要保证。

## 6. Cleanup

- Linux 0 删除 labels.csv；
- Linux 1 删除 audit.xlsx；
- Home reset；
- 尝试删除空目录。

