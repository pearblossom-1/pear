# Core 127 — linux_smarthome_359

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 127 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_359.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：hard
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

工作簿要求建立两个未来计划，而不是现在就改变设备：

1. 19:15 用一个 single scheduled command 打开 bedroom curtain；
2. 19:20 用一个 scheduled workflow，先打开 kitchen purifier，再把 level 设为 high。

Home 当前时间是 19:00，所以两项完整时间分别是 2026-06-16T19:15:00 与 2026-06-16T19:20:00。

最终必须恰好有 1 个 schedule 和 1 个 workflow；curtain 仍关闭，purifier 仍 off/low；同时新建 manifest.json，记录两条 device/run_at/expected。

## 1. Instruction

### 英文原文（逐字）

~~~text
The certification team needs the two future Home changes listed in `/tmp/cert/plan.xlsx` prepared and documented. Schedule each change in the plan's required Home form, but leave the devices unchanged for now. Create `/tmp/cert/manifest.json` using the workbook's visible manifest fields so it records the same planned times and outcomes.
~~~

### 中文翻译

认证团队需要准备并记录 /tmp/cert/plan.xlsx 中列出的两项未来 Home 更改。按照计划要求的 Home 形式安排每项更改，但目前不要改变设备。使用工作簿中可见的 manifest 字段创建 /tmp/cert/manifest.json，使其记录相同的计划时间与结果。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片、音频、DOCX 或 PDF 附件。

### 2.1 plan.xlsx：Sheet1

| Item | Run At | Expected Final | Output | Manifest Fields | Home plan type | Required Home actions |
|---|---|---|---|---|---|---|
| bedroom curtain | 19:15 | open | manifest.json | device, run_at, expected | single scheduled command | open the bedroom curtain |
| kitchen purifier | 19:20 | high | manifest.json | device, run_at, expected | scheduled workflow | turn on the kitchen purifier; then set its level to high |

### 2.2 plan.xlsx：Manifest Contract

| JSON field | Type | Business meaning |
|---|---|---|
| checks | array | 顶层必需的认证检查列表；计划每行一条记录 |
| device, run_at, expected | record fields | 每条 checks 记录的完整字段集；从计划行复制业务值，不加其他字段 |
| record order | plan order | checks 按计划从上到下的顺序 |

工作簿无数据验证下拉；Sheet1 的 F/G 列有更宽列宽以显示完整说明。

### 2.3 Home 初始相关状态

当前时间：2026-06-16 19:00。

bedroom_curtain_1：

    open_pct = 0
    status = closed

kitchen_air_purifier_1：

    power = off
    level = low

初始 schedules、workflows、history 全为空。

## 3. Setup 具体流程

### linux_0

1. 删除旧 /tmp/cert/plan.xlsx 和 /tmp/cert/manifest.json。
2. 创建 /tmp/cert。
3. 上传 plan.xlsx。
4. manifest.json 不会预先存在，需新建。

### home_0

从 linux_smarthome_359/episode_config.json reset 完整 Home；与本题直接相关的是上面的两台设备、19:00 时钟以及零个 schedule/workflow。

## 4. 标准 Home 计划

### 4.1 唯一 schedule

Oracle 使用：

~~~text
schedule_id = cert_bedroom_curtain
run_at = 2026-06-16T19:15:00
device_id = bedroom_curtain_1
command = open
args = {}
status = active
~~~

### 4.2 唯一 workflow

Oracle 使用：

~~~json
{
  "workflow_id": "cert_kitchen_purifier",
  "run_at": "2026-06-16T19:20:00",
  "steps": [
    {
      "device_id": "kitchen_air_purifier_1",
      "command": "turn_on",
      "args": {}
    },
    {
      "device_id": "kitchen_air_purifier_1",
      "command": "set_level",
      "args": {"level": "high"}
    }
  ],
  "status": "active"
}
~~~

schedule_id/workflow_id 可由执行者命名；上面是 oracle 名称。不要 advance time，也不要现在执行 open/turn_on/set_level。

### 4.3 推荐 manifest.json

~~~json
{
  "checks": [
    {
      "device": "bedroom curtain",
      "run_at": "19:15",
      "expected": "open"
    },
    {
      "device": "kitchen purifier",
      "run_at": "19:20",
      "expected": "high"
    }
  ]
}
~~~

这是最符合工作簿可见合同的写法。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有七个 evaluator：

- schedule、workflow、manifest 三项参与平均分；
- schedule 总数、workflow 总数、两台设备 no-change 四项是 enable_score_calc=false 的硬性 guard。

七项都必须成功；任一 guard 失败会把总分置为 0。

### 5.1 schedule 内容

Evaluator 必须找到一条 active schedule，精确匹配：

    run_at = 2026-06-16T19:15:00
    device_id = bedroom_curtain_1
    command = open
    args = {}
    status = active

此 evaluator 没有指定 schedule_id，因此 ID 名称不参与匹配。

### 5.2 workflow 内容

必须找到 active workflow：

    run_at = 2026-06-16T19:20:00
    status = active

steps 长度必须恰好为 2，内容为：

1. kitchen_air_purifier_1 / turn_on / {}；
2. kitchen_air_purifier_1 / set_level / {"level":"high"}。

当前 evaluator 未显式设置 steps_ordered。通用 matcher 在两个步骤影响的字段不重叠时允许无序匹配；turn_on 影响 power，set_level 影响 level，所以技术上调换两步仍可能通过。但工作簿明确写着 “turn on ...; then set ...”，标准答案应保持上述顺序。

workflow_id 同样未进入 evaluator。

### 5.3 计划数量必须恰好为 1+1

两个硬性 guard 分别要求：

    schedules 总数 = 1
    workflows 总数 = 1

它们统计所有状态的记录，不只是 active。因此重复创建、留下取消记录或多建测试计划都会失败。

### 5.4 两台设备现在不能变化

no-device-change guard 将整个设备 state 与 setup baseline 比较：

- bedroom_curtain_1 必须仍是 {"open_pct":0,"status":"closed"}；
- kitchen_air_purifier_1 必须仍是 {"power":"off","level":"low"}。

不是只检查某一个字段。提前执行计划、直接控制设备或把时钟推进到执行时间都会失败。

### 5.5 manifest.json 的记录匹配

实际函数是 check_json_records。要求：

- 文件是有效 JSON object/array，重复 JSON key 会失败；
- 恰好有 2 条业务记录，不能多也不能少；
- 每条标准字段是 device、run_at、expected，不能添加其他记录字段；
- 比较不区分大小写，并会合并连续空白；
- 两条记录按无序 Counter 比较，因此 evaluator 本身不要求计划顺序。

device 字段还可命名为 device_id 或 name，但每条 list 记录只能出现其中一个。

允许值别名：

| 字段 | 标准值 | 也接受 |
|---|---|---|
| run_at | 19:15 | 7:15 PM、7:15PM |
| run_at | 19:20 | 7:20 PM、7:20PM |
| expected | open | opened、fully open |
| expected | high | maximum、max、high level |

允许的 payload 形状比工作簿合同更宽：

1. 顶层直接 array；
2. 顶层 mapping，以设备名作为 key；
3. {"checks": [...]}；
4. {"checks": {...}}。

如果使用 checks wrapper，顶层不能再有其他 key。Mapping 形式中，object key 充当 device；记录里若再写 id，必须与 object key 一致。

尽管 evaluator 接受这些变体，建议使用第 4.3 节的 checks array，因为它严格遵循用户可见合同。

## 6. 配置中的元数据差异

task.evaluation 真正使用 check_json_records，但 metadata.native_content_outputs 把 func 写成 check_json。这只影响描述元数据，不改变运行时实际 evaluator；文档以上述 task.evaluation 为准。

## 7. 常见失败与真实评测边界

- 用两个普通 schedule 代替一个 schedule+一个 workflow：数量/类型检查失败。
- 先打开 curtain 再建计划：no-change guard 失败。
- workflow 少 turn_on 或少 set_level：steps 长度/内容失败。
- 完整时间写成 19:15 而不是 2026-06-16T19:15:00：Home schedule 匹配失败；manifest 中反而应写 19:15。
- manifest 有第三条记录或每条加 notes：check_json_records 失败。
- checks wrapper 旁边再加 metadata：失败。
- ID 使用 oracle 之外的名字不会单独失败，只要 API 接受且其他内容正确。

## 8. Cleanup

- linux_0 删除 plan.xlsx、manifest.json，并尝试删除空的 /tmp/cert。
- home_0 reset。

