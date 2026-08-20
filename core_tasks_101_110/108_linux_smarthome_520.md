# Core 108 — linux_smarthome_520

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 108 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_520.json
- 运行配置：configs/cross_device/local_2linux_smarthome.json
- 难度：hard
- 设备拓扑：2L+1H（linux_0、linux_1、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台 Linux 的 zones.csv 把区域代码映射到房间并给出保护规则；第二台 Linux 的 requests.xlsx 有三条请求：

- O1 → office：正常请求，office 是 dimmable light，支持亮度 40，所以执行；
- B2 → bedroom：明确是 protected room，即使 curtain 支持 70% 也不能执行；
- E1 → entry：普通 light 不支持 brightness，所以拒绝。

最终只改变 office_dimmable_light_1，使其 on + 40；然后把三行完整结论另存到 completed-register.xlsx。

## 1. Instruction

### 英文原文（逐字）

~~~text
On the first Linux desktop, read `/home/user/floor/zones.csv` for the area-code mapping and handling rules. The second Linux desktop has `/tmp/floor/requests.xlsx` with three area requests and parameters. Map each request to a Home room, carry out the requests that are allowed and supported, and save the completed register to `/tmp/floor/completed-register.xlsx`.
~~~

### 中文翻译

在第一台 Linux 桌面上读取 /home/user/floor/zones.csv，获取区域代码映射和处理规则。第二台 Linux 桌面上的 /tmp/floor/requests.xlsx 包含三条区域请求和参数。把每条请求映射到 Home 房间，执行允许且受支持的请求，并将完成后的登记表保存为 /tmp/floor/completed-register.xlsx。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 Linux 0：zones.csv

运行时路径：/home/user/floor/zones.csv

~~~csv
area_code,room,handling
O1,office,normal request
B2,bedroom,protected room - do not control devices
E1,entry,normal request subject to device capability
~~~

### 2.2 Linux 1：requests.xlsx

运行时路径：/tmp/floor/requests.xlsx

工作簿有 Sheet1 和 Completion Guide。

Sheet1 修改前：

| Area Code | Requested Action | Parameter | Room | Actual Device | Decision | Reason |
|---|---|---:|---|---|---|---|
| O1 | set light brightness | 40 | 空 | 空 | 空 | 空 |
| B2 | open curtain | 70 | 空 | 空 | 空 | 空 |
| E1 | set light brightness | 30 | 空 | 空 | 空 | 空 |

Completion Guide：

- Executed：支持且已执行；
- Protected：被房间政策阻止；
- Rejected：设备缺少请求能力；
- Actual Device / Reason：写实际检查的设备，并简要记录应用状态或保护/能力原因。

最终是新文件 /tmp/floor/completed-register.xlsx，不是覆盖 zones.csv。

### 2.3 SmartHome 初始状态

当前时间：2026-06-16 19:00；schedule、workflow、history 均为空。

| 房间 | 设备 | 初始状态 | 能力结论 |
|---|---|---|---|
| office | office_dimmable_light_1 | off，brightness=0 | 支持亮度 |
| bedroom | bedroom_curtain_1 | open_pct=0，closed | 支持开合，但房间受保护 |
| entry | entry_light_1 | on | 普通 light，不支持 brightness |

## 3. Setup 具体流程

### linux_0

删除旧 zones.csv，创建 /home/user/floor，并上传 CSV。

### linux_1

删除旧 requests.xlsx 和 completed-register.xlsx，创建 /tmp/floor，并上传源工作簿。

### home_0

从 episode_config.json 重置三个房间、三台设备和空历史。

Setup 不会自动打开 CSV 或 XLSX。

### 配置元数据中的已知不一致

metadata.surfaces 包含 linux.png，readiness.linux_sources_present 写成 3；但实际 setup 和 asset 清单只有 zones.csv 与 requests.xlsx 两个 Linux 来源，没有 PNG。这个元数据不一致不影响当前 evaluator。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

最稳妥的标准做法是：

1. 对 office light 发 turn_on；
2. 再发 set_brightness 40；
3. 不操作 bedroom curtain 和 entry light；
4. 输出完整三行登记表；
5. 让全局 Home command history 恰好为 2。

### 4.1 Office 最终状态

office_dimmable_light_1 必须至少满足：

    power = on
    brightness_pct = 40

这是字段子集检查。

### 4.2 completed-register.xlsx

Evaluator 要求存在名称精确为 Sheet1 的 sheet，并逐格检查 A1:G4：

| Area Code | Requested Action | Parameter | Room | Actual Device | Decision | Reason |
|---|---|---:|---|---|---|---|
| O1 | set light brightness | 40 | office | office dimmable light | Executed | brightness set to 40 |
| B2 | open curtain | 70 | bedroom | bedroom curtain | Protected | protected room |
| E1 | set light brightness | 30 | entry | entry light | Rejected | unsupported dimming |

所有指定字符串逐格精确比较，大小写和空格不要改写。

边界：

- 没有 reject_extra_nonempty_cells；
- Completion Guide 或其他 sheet 不参与评分；
- 额外单元格不会被该 evaluator 主动拒绝；
- 格式、字体、颜色、列宽不评分。

### 4.3 全局命令数

Home command history 中任意命令记录总数必须恰好为 2。正向 oracle 使用 turn_on office light + set_brightness 40。

真实边界：该 evaluator 只数命令总数，没有检查两条命令的 device_id、command 或 args；而 set_brightness 本身可以把 dimmable light 变成 on。因此从纯 evaluator 角度，一条 office set_brightness 加一条无关命令也可能同时满足“office 最终状态 + 总数 2”。这会违反 zones.csv 的业务规则，不能视为正确执行路径。

另外没有 bedroom_curtain 或 entry_light 的 no-device-change evaluator；它们主要受业务规则和命令总数间接约束。

## 5. 常见失败与真实评测边界

- 执行 B2 curtain=70：违反 protected room。
- 尝试给 entry 普通 light 设 brightness=30：不支持。
- 只输出已执行的 O1，漏掉 B2/E1 结论：工作簿失败。
- Decision 写 Denied、Skipped 等同义词：逐格不等，失败。
- Sheet1 改名：指定 sheet 找不到，失败。
- 使用 1 条或 3 条 Home command：history count 失败。

应按 instruction 和正向 oracle 使用两条 office 命令，不利用命令身份未检查的缺口。

## 6. Cleanup

- Linux 0 删除 zones.csv；
- Linux 1 删除 requests.xlsx 和 completed-register.xlsx；
- Home reset；
- 尝试删除空目录。
