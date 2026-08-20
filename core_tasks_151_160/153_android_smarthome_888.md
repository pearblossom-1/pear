# Core 153 — android_smarthome_888

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 153 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_888.json`
- 运行配置：`configs/cross_device/local_2android_smarthome.json`
- 难度：hard
- 设备拓扑：2A+1H（`android_0`、`android_1`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第一台手机 Tasks 的请求编号是 L-42，要求 study light=70% 用于 reading。第二台手机 approval table 中 L-42=approved，而 L-43 是另一个 rejected 请求。因此：

1. L-42 匹配且已批准，可以把 study light 打开并设为 70%；
2. 在第二台手机创建 `Approval source chain.md`，写清 L-42 请求、approved 证据、study light 70%、reading，以及设置已经应用。

## 1. Instruction

### 英文原文（逐字）

~~~text
Before changing the study light, verify the request in the first phone's Tasks app against the approval table in Android Files on the second phone. Apply it only when the matching row is approved. For the household record, leave a Markor note named `Approval source chain` on the second phone with the matched request, approval evidence, setting applied, and reason.
~~~

### 中文翻译

在更改 study light 前，把第一台手机 Tasks app 中的请求与第二台手机 Android Files 中的审批表核对。只有匹配行已批准时才应用。为家庭留档，在第二台手机创建名为 `Approval source chain` 的 Markor note，包含匹配的请求、审批证据、已应用设置和原因。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。输入是一条 Tasks 请求、一份 CSV 审批表和 Home 状态。

### 2.1 android_0：Tasks 请求

Tasks 会先被清空，再加入：

| 字段 | 内容 |
|---|---|
| title | Study light request |
| notes | Request row L-42: set study light to 70 percent for reading. |
| dueDate | 0 |
| completed | 0 |

### 2.2 android_1：审批表

`approval_table.csv` 上传到：

~~~text
/storage/emulated/0/Download/home/approval_table.csv
~~~

完整内容：

~~~csv
row,status,reason
L-42,approved,reading setup approved by owner
L-43,rejected,bedroom change not approved
~~~

匹配请求 L-42 的状态是 approved；L-43 不应被混用。

### 2.3 android_1：Markor 初始状态

确保 Markor 可用，并删除旧结果：

~~~text
/storage/emulated/0/Documents/Markor/Approval source chain.md
~~~

### 2.4 home_0：初始状态

当前时间：`2026-06-16T19:00:00`。

`study_dimmable_light_1` 初始为 `power=off`、`brightness_pct=0`。初始 schedules、workflows 和 history 均为空。

## 3. Setup 具体流程

### android_0

确保 Tasks 可用，清空 Tasks，再加入 `Study light request`。

### android_1

1. 确保 Android Files 可用并上传 approval table；
2. 确保 Markor 可用；
3. 删除旧 `Approval source chain.md`。

### home_0

使用 `android_smarthome_888/episode_config.json` reset Home。

## 4. 正确输出

### 4.1 Home

`study_dimmable_light_1` 最终：

~~~text
power: on
brightness_pct: 70
~~~

### 4.2 Markor

精确路径：

~~~text
/storage/emulated/0/Documents/Markor/Approval source chain.md
~~~

Oracle 示例：

~~~text
# Approval source chain
Request: L-42 asks for the study light at 70% for reading.
Approval: the owner approved L-42 for the reading setup.
Applied: the study light was set to 70%.
~~~

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

共有 2 个 evaluator，两个都必须成功：Markor source-chain note，以及 study light 的最终状态。

### 5.1 Note 采用 entity-relation 匹配

Evaluator 读取精确路径全文，要求包含每个实体组：

- `L-42`；
- `approved` 或 `approval`；
- `study light` 或 `study-light`；
- `70` 或 `70%`；
- `reading`。

还需至少出现 `applied`、`set`、`executed` 之一。

不得出现：

- `pending`、`not applied`、`not approved`、`unapproved`；
- `rejected`、`denied`、`wrong row`。

这不是 Oracle 全文绝对匹配，也没有 clause 绑定。标题行本身不参与语义要求，但文件路径必须精确。由于 `rejected` 是冲突词，不要在结果 note 中顺带抄写 L-43 那一行。

### 5.2 Home 状态

`smarthome.check_device_state` 按子集要求：

- power=`on`；
- brightness_pct=`70`。

不检查 command history 或动作顺序。

### 5.3 没有直接检查的输入链

Evaluator 不重新确认 Tasks 中确有 L-42，也不检查 approval CSV 最后是否存在；它们由 setup 提供。Note 的关键词和最终 Home 状态共同体现选择了已批准分支。

## 6. 常见失败与真实评测边界

- 误看 L-43 的 rejected：若 note 出现 `rejected`，语义检查失败。
- 只在 note 写 approved，但未把灯设到 70%：Home 失败。
- 只改灯、不创建精确路径 note：失败。
- Note 不需要逐字复制 CSV reason，但必须写 reading。
- 保存到第一台手机：evaluator 在 android_1 的精确路径读取，失败。

## 7. Cleanup

- android_0 清空 Tasks；
- android_1 删除 approval CSV 和结果 note；
- home_0 reset。
