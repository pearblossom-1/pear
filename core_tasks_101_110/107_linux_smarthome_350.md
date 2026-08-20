# Core 107 — linux_smarthome_350

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 107 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_350.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：hard
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

DOCX 想要“在 maintenance 开始前 10 分钟关闭 garage heater”，但它同时明确说 request 和 SmartHome 中都看不到 maintenance event 或具体时间。

没有开始时间，就无法计算“提前 10 分钟”究竟是什么时间。因此正确结果不是猜一个时间，也不是立刻关 heater，而是：

- 不创建 schedule；
- 不创建 workflow；
- 不发送任何 Home command；
- 写 result.json，明确缺少 maintenance start 锚点，状态为 not scheduled，原因码为 no_visible_event_or_time。

## 1. Instruction

### 英文原文（逐字）

~~~text
Can you review `/tmp/maintenance/request.docx` and check whether the maintenance start can actually be scheduled from what's available? Save the decision to `/tmp/maintenance/result.json`.
~~~

### 中文翻译

请查看 /tmp/maintenance/request.docx，并根据当前可用信息判断 maintenance start 是否真的能够被安排。将决定保存到 /tmp/maintenance/result.json。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 request.docx 的详细内容

运行时路径：/tmp/maintenance/request.docx

源文档只有 1 页、4 个正文段落，没有表格、图片、页眉页脚正文、批注或修订。可见全文：

~~~text
Automation request

Turn off the garage heater 10 minutes before maintenance starts.

No maintenance event or time is visible in SmartHome or the request.

Record the missing anchor and save /tmp/maintenance/result.json with keys missing_anchor, status, and reason_code. For this operations feed, record missing_anchor as maintenance start, choose status from scheduled or not scheduled, and use the controlled reason code no_visible_event_or_time.
~~~

文档已经直接告诉执行者：缺少 event/time，不能推算运行时刻。

### 2.2 SmartHome 初始状态

当前时间：2026-06-16 19:00。

- garage_heater_1：power=on、target_temperature_c=20；
- schedules=0；
- workflows=0；
- history=0。

其他房间设备存在，但与缺失时间锚点无关。

### 2.3 目标 JSON

初始没有 /tmp/maintenance/result.json。正确业务对象是：

~~~json
{
  "missing_anchor": "maintenance start",
  "status": "not scheduled",
  "reason_code": "no_visible_event_or_time"
}
~~~

## 3. Setup 具体流程

### linux_0

1. 删除旧 request.docx 和 result.json；
2. 创建 /tmp/maintenance；
3. 上传 request.docx。

### home_0

从 episode_config.json 重置 Home，恢复 garage heater 和空 schedule/workflow/history。

Setup 不会自动打开 DOCX，也不会创建结果文件。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

Home 必须完全没有新动作或计划，且 result.json 必须是一个只有三个指定字段的合法 JSON 对象。

### 4.1 三个 Home 零数量检查

Evaluator 分别要求：

- schedule 总数恰好 0；
- workflow 总数恰好 0；
- command history 总数恰好 0。

因此以下做法都失败：

- 猜一个 maintenance 时间并排 schedule；
- 建 workflow；
- 立即关 garage heater；
- 先操作再恢复。

### 4.2 JSON 语义匹配

Evaluator 使用 json_semantic_match。默认是封闭对象：

- 必须是合法 JSON object；
- key 名必须准确为 missing_anchor、status、reason_code；
- 三个 key 都必须存在；
- 不允许额外 key；
- 重复 JSON key 会直接判失败；
- 三个 value 都必须是字符串；
- 字符串比较会压缩连续空白并忽略大小写。

因此下面可以通过：

~~~json
{"missing_anchor":"Maintenance Start","status":"NOT SCHEDULED","reason_code":"no_visible_event_or_time"}
~~~

但把 key 改成 missingAnchor、添加 notes，或把 status 写成布尔值，都失败。最稳妥仍是使用文档给出的标准 JSON。

### 4.3 没有单独检查的部分

- 没有 evaluator 重新读取 DOCX；DOCX 是输入。
- 没有 garage heater 最终 state evaluator，但 history=0 已禁止通过命令改变它。
- 不要求 infeasible report 或 answer report；唯一文件输出是 result.json。

## 5. 常见失败与真实评测边界

- 把 current time 19:00 当作 maintenance start：来源没有这样说，且任何 schedule 都失败。
- 立刻 turn_off garage heater：history 失败。
- 输出普通文本或 Markdown 而不是合法 JSON：解析失败。
- JSON 写 scheduled：value 不匹配。
- JSON 多写 explanation 字段：封闭对象拒绝额外 key。
- 复制 Python dict 使用单引号：不是合法 JSON，失败。

本题的核心是识别信息不足，并把“不安排”结构化记录下来。

## 6. Cleanup

- Linux 删除 request.docx 和 result.json，并尝试删除空目录；
- Home reset。
