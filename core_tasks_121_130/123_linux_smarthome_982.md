# Core 123 — linux_smarthome_982

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 123 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_982.json
- 运行配置：configs/cross_device/local_2linux_smarthome.json
- 难度：medium
- 设备拓扑：2L+1H（linux_0、linux_1、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台 Linux 上是角色权限矩阵，第二台 Linux 上是四项请求。正确判断为：

| 行 | 请求 | 判断 | 是否执行 | 处理后值 |
|---|---|---|---|---|
| R1 | Facilities 把 office curtain 调到 55 | 角色允许，设备也支持 | 执行 | open_pct 55 |
| R2 | Guest 把 office curtain 调到 30 | Guest 无权限 | 不执行 | 保持 open_pct 10 |
| R3 | Facilities 关闭 bedroom light | 规则明确为 protected | 不执行 | 保持 on |
| R4 | Facilities 把 entry light 亮度调到 30 | 权限允许，但它是普通 light，不支持亮度 | 不执行 | 保持 off |

只应有 R1 真正改变 Home。

## 1. Instruction

### 英文原文（逐字）

~~~text
Review the four after-hours access requests in `/tmp/access/requests.xlsx` on the second Linux machine against the role rules in `/tmp/access/matrix.docx` on the first. Record the decision and result for every row, and apply only an authorized, supported request in the connected home.
~~~

### 中文翻译

根据第一台 Linux 机器上 /tmp/access/matrix.docx 中的角色规则，审查第二台 Linux 机器上 /tmp/access/requests.xlsx 中的四项非工作时间访问请求。记录每一行的决定和结果，并且只在连接的 Home 中执行已授权且受设备支持的请求。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或音频附件。

### 2.1 linux_0：matrix.docx 的完整内容

标题：Role Access Matrix。

提示：Apply these role permissions to the request board.

| role | room | command | allowed | protected_override |
|---|---|---|---|---|
| Facilities | office | set_open_pct | yes | no |
| Guest | office | set_open_pct | no | no |
| Facilities | bedroom | turn_off | no | protected |
| Facilities | entry | set_brightness | yes | no |

文档共 1 页，无页眉、页脚、批注、脚注、尾注或修订痕迹。

### 2.2 linux_1：requests.xlsx 的初始内容

工作簿有 Requests 和 Completion Guide 两个 sheet。

Requests 列：

| 列 | 标题 |
|---|---|
| A | Row |
| B | Role |
| C | Room |
| D | Command |
| E | Capability |
| F | Reason |
| G | Decision |
| H | After |

初始请求：

| 行 | Row | Role | Room | Command |
|---|---|---|---|---|
| 2 | R1 | Facilities | office | curtain 55 |
| 3 | R2 | Guest | office | curtain 30 |
| 4 | R3 | Facilities | bedroom | light off |
| 5 | R4 | Facilities | entry | brightness 30 |

E:H 初始为空。

下拉列表：

- G2:G5：Authorized、Unauthorized、Protected、Unsupported；
- H2:H5：open_pct 55、open_pct 10、on、off。

Completion Guide 说明：

- Authorized：角色和房间允许命令；
- Unauthorized：角色被拒绝；
- Protected：受保护房间；
- Unsupported：设备缺少相应命令。

### 2.3 Home 初始状态与能力

当前时间：2026-07-15 12:05。

| 设备 | 初始状态 | 能力/限制 |
|---|---|---|
| office_curtain_1 | open_pct=10，status=partial | 支持 set_open_pct |
| bedroom_light_1 | power=on，protected=true | 简单开关灯，但该请求被规则保护 |
| entry_light_1 | power=off | 普通 light，只支持开/关，不支持 set_brightness |

初始 schedules、workflows、history 为空。

## 3. Setup 具体流程

### linux_0

1. 删除旧的 /tmp/access/matrix.docx。
2. 创建 /tmp/access。
3. 上传角色矩阵到 /tmp/access/matrix.docx。

### linux_1

1. 删除旧的 /tmp/access/requests.xlsx。
2. 创建 /tmp/access。
3. 上传请求工作簿到 /tmp/access/requests.xlsx。

### home_0

从 linux_smarthome_982/episode_config.json reset Home，恢复三台设备、固定时间和空计划。

Setup 不会自动打开附件，也不会预填 Capability、Reason、Decision 或 After。

## 4. 推荐填写后的完整 Requests

Oracle 的完整填写为：

| Row | Role | Room | Command | Capability | Reason | Decision | After |
|---|---|---|---|---|---|---|---|
| R1 | Facilities | office | curtain 55 | Supported | role allowed | Authorized | open_pct 55 |
| R2 | Guest | office | curtain 30 | Supported | role not allowed | Unauthorized | open_pct 10 |
| R3 | Facilities | bedroom | light off | Supported | protected room | Protected | on |
| R4 | Facilities | entry | brightness 30 | Unsupported | plain light cannot dim | Unsupported | off |

Home 只执行：

    office_curtain_1.set_open_pct(open_pct=55)

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

三个 evaluator 都必须成功。第三项 enable_score_calc=false 是硬性 guard，失败会把总分置为 0。

### 5.1 requests.xlsx

评测函数：check_xlsx_cells；读取 linux_1 的 /tmp/access/requests.xlsx。

必须存在 Requests sheet，且：

| 单元格 | 必须是 |
|---|---|
| G2 | Authorized |
| H2 | open_pct 55 |
| G3 | Unauthorized |
| H3 | open_pct 10 |
| G4 | Protected |
| H4 | on |
| G5 | Unsupported |
| H5 | off |

这是区分大小写的精确字符串比较，不是“含有关键词就行”。例如 `authorized`、`open pct 55`、`unsupported device` 都会失败。

Evaluator 只核对 G/H；E/F 的 Capability 与 Reason 没有进入断言。其他单元格、额外 sheet 和格式也未被禁止。不过为了完成“审查”而不只是过测，建议按第 4 节完整填写 E:H。

### 5.2 已授权请求的 Home 结果

office_curtain_1 的 open_pct 必须等于 55。该检查不要求 status 字段，但正常 set_open_pct 后 status 会是 partial。

### 5.3 未获准/不支持请求的保持状态

硬性 guard 要求：

- bedroom_light_1.power 仍为 on；
- entry_light_1.power 仍为 off。

R2 没有独立 Home guard，但 office curtain 的最终 open_pct=55 同时意味着它不能停在 R2 请求的 30 或初始 10。

任务没有 command-history 数量检查，也没有检查 E/F 文本。因此 evaluator 关注的是最终可见状态和 G/H 决策结果，而不是操作轨迹的完整审计。

## 6. 常见失败与真实评测边界

- 把 R2 也执行，最后 curtain=30：Home 检查失败。
- 关闭 bedroom light：硬性 guard 失败。
- 尝试对 entry light 调亮度，即使命令被设备拒绝，最终状态仍须为 off；工作簿还必须写 Unsupported。
- 在 E/F 写对但 G/H 留空：失败。
- G/H 使用近义词或不同大小写：失败。
- 表格正确但没有执行 R1：office curtain 仍为 10，失败。

## 7. Cleanup

- linux_0 删除 matrix.docx，并尝试删除空目录。
- linux_1 删除 requests.xlsx，并尝试删除空目录。
- home_0 reset。

