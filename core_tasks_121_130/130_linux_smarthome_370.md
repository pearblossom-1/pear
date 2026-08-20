# Core 130 — linux_smarthome_370

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 130 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_370.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：easy
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

PDF 给出的 PM2.5 分级为：

- 0–50：normal；
- 51–80：elevated；
- 81–100：critical。

查询 Home 后，最高 PM2.5 是 garage 的 97，因此 worst.json 应记录 room=garage、pm25=97、grade=critical。此题只查询，不改变 Home。

## 1. Instruction

### 英文原文（逐字）

~~~text
Grade the SmartHome air quality using the thresholds in `/tmp/air/thresholds.pdf` and save the worst readings to `/tmp/air/worst.json`.
~~~

### 中文翻译

使用 /tmp/air/thresholds.pdf 中的阈值对 SmartHome 空气质量进行分级，并将最差读数保存到 /tmp/air/worst.json。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、音频、图片、DOCX 或电子表格附件。

### 2.1 thresholds.pdf 的完整可见业务内容

PDF 标题：PM2.5 Grading。

副标题：Room-level reporting thresholds。

Grade Bands：

| PM2.5 | grade |
|---:|---|
| 0–50 | normal |
| 51–80 | elevated |
| 81–100 | critical |

Report：Report the worst room, actual PM2.5, and grade.

Output：Save worst.json.

页脚：Internal operations reference；Page 1。

PDF 共 1 页，无表单域或批注。

### 2.2 Home 房间 PM2.5

当前时间：2026-06-16 19:00。

| 房间 | air_quality_pm25 | 分级 |
|---|---:|---|
| bedroom | 30.7 | normal |
| kitchen | 74.0 | elevated |
| living_room | 25.4 | normal |
| office | 23.1 | normal |
| study | 33.0 | normal |
| garage | 97.0 | critical |

garage=97 是唯一最高值，也落在 81–100 critical 区间。

## 3. Setup 具体流程

### linux_0

1. 删除旧 /tmp/air/thresholds.pdf 与 /tmp/air/worst.json。
2. 创建 /tmp/air。
3. 上传 thresholds.pdf。
4. worst.json 不会预先存在，需创建。

### home_0

从 linux_smarthome_370/episode_config.json reset 完整 Home，恢复六个房间及设备、19:00 时钟、空 schedules/workflows/history。

Setup 不会自动查询 Home，也不会创建 worst.json。

## 4. 推荐 worst.json

~~~json
{
  "room": "garage",
  "pm25": 97,
  "grade": "critical"
}
~~~

这与 oracle 输出一致。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

本题只有一个 evaluator：check_json_semantic_report。它只读取 /tmp/air/worst.json；没有 Home state、query-history 或 no-mutation evaluator。

文件必须是有效的顶层 JSON object。重复 key 会直接失败。

### 5.1 三个必需业务字段

必须恰好映射出以下三类字段：

| 标准字段 | 值要求 |
|---|---|
| room | string，语义上肯定包含 garage |
| pm25 | 精确数值 97 |
| grade | string，语义上肯定包含 critical |

pm25 写成字符串 `"97"` 会失败。标准 JSON number 97 最稳妥。

room 与 grade 大小写不敏感，并采用文本/实体关系判断，不是整句绝对匹配。例如 `Garage`、`worst room: garage` 可以命中 room；`Critical` 可以命中 grade。但问句、不确定说法或冲突表述会失败：

- room 冲突词：not garage、unknown room；
- grade 冲突词：not critical、non-critical。

推荐直接使用 `"garage"` 与 `"critical"`，不要加说明性句子。

### 5.2 字段名别名

字段名会先转小写，并把非字母数字字符规范成下划线。每个业务字段必须且只能匹配一个名称；同时写 room 和 worst_room 会因为重复映射而失败。

允许别名：

| 标准字段 | 可接受字段名 |
|---|---|
| room | room、worst_room、room_name、location |
| pm25 | pm25、pm2_5、pm2.5、actual_pm25、reading |
| grade | grade、category、severity、classification |

例如 `"PM2.5"` 会规范成 pm2_5，因此可接受。

### 5.3 额外字段是封闭白名单

除了映射后的 room/pm25/grade，只允许以下额外字段：

- notes
- source
- measured_at

加入其他字段，例如 threshold、all_rooms、status，会失败。允许字段的值没有额外内容断言。

### 5.4 与普通 check_json 的区别

这里不是只沿几个 key path 检查后忽略所有其他 key；check_json_semantic_report 会：

1. 验证必需字段是否唯一映射；
2. 对 pm25 做精确值检查；
3. 对 room/grade 做大小写不敏感的语义文本检查；
4. 拒绝白名单之外的额外字段。

所以第 4 节的三个字段标准 JSON 是最稳妥的答案。

## 6. 配置中的元数据差异

task.evaluation 使用 check_json_semantic_report，但 metadata.native_content_outputs.func 写成 check_json。运行时按 evaluation 执行语义报告检查；metadata 中的旧函数名不应被当作真实评测逻辑。

## 7. 常见失败与真实评测边界

- 选择 kitchen=74 作为最差：room/pm25/grade 都会错。
- 97 分成 elevated：grade 失败。
- 写 `"pm25": "97"`：类型不对，失败。
- 同时写 room 与 location：同一规范字段出现两个候选，失败。
- 加入 all_readings 数组：不是允许额外字段，失败。
- JSON 正确即可通过；Evaluator 不验证是否真的调用过 get_home_state，也不验证 Home 是否保持不变。

## 8. Cleanup

- linux_0 删除 thresholds.pdf 与 worst.json，并尝试删除空的 /tmp/air。
- home_0 reset。

