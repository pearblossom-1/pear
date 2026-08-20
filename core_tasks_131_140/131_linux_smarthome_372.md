# Core 131 — linux_smarthome_372

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 131 项
- 任务文件：`tasks/cross_device/linux_smarthome/linux_smarthome_372.json`
- 运行配置：`configs/cross_device/local_linux_smarthome.json`
- 难度：easy
- 设备拓扑：1L+1H（`linux_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

图片告诉你有三类可能的噪声源：washer、dryer、robot vacuum。真正决定当前来源的是 Home 实时状态：

- laundry room 噪声是 63 dB；
- laundry washer 的显示状态是 `stopped`，所以它不是当前运行声源；
- living room robot vacuum 的显示状态是 `docked`，所以它也不是当前运行声源；
- laundry dryer 是 `running`，因此当前噪声源应写成 dryer。

最终只需要在 Linux 上创建 `/tmp/inspection/findings.docx`；本任务不要求控制任何 Home 设备。

## 1. Instruction

### 英文原文（逐字）

~~~text
Use `/tmp/inspection/source-map.png`, `/tmp/inspection/review.txt`, and the live Home readings to identify the current noise source. Write `/tmp/inspection/findings.docx` with the source and room noise reading, plus the washer and living-room robot statuses that rule them out; preserve the displayed Home status labels in the evidence format from the review note.
~~~

### 中文翻译

使用 `/tmp/inspection/source-map.png`、`/tmp/inspection/review.txt` 和 Home 的实时读数识别当前噪声源。创建 `/tmp/inspection/findings.docx`，写明噪声源和房间噪声读数，并写出用于排除 washer 与 living-room robot 的状态；证据格式要遵照 review note，并保留 Home 显示的原始状态标签。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或音频附件。

### 2.1 source-map.png

- 路径：`/tmp/inspection/source-map.png`
- 格式与尺寸：PNG，1682×935，RGB。
- 标题：`Noise source map`。
- 图片列出三个候选：

| 候选设备 | 图片说明 |
|---|---|
| Washer | laundry spin noise |
| Dryer | tumbling heat noise |
| Robot vacuum | floor cleaning noise |

这张图只说明“哪类设备可能产生哪类噪声”，没有直接标记当前正在发声的是哪台设备。

### 2.2 review.txt 的完整原文

~~~text
Use source-map.png as the noise source map. Query the laundry room washer, laundry room dryer, living room robot vacuum, and room noise. Save findings.docx with evidence.

Keep each reading attributable: write `laundry room noise <value> dB`, `washer <displayed status>`, and `<room> robot vacuum <displayed status>`. Preserve the status labels displayed by Home rather than paraphrasing them.
~~~

### 2.3 Home 初始状态

当前时间：2026-06-16 19:00。

| 项目 | 初始值 | 作用 |
|---|---|---|
| laundry_room.noise_level_db | 63.0 | 要写成 `laundry room noise 63 dB` |
| laundry_room_washer_1 | power=off，cycle=normal，remaining_min=0，status=stopped | 用 `washer stopped` 排除 washer |
| laundry_room_dryer_1 | power=on，cycle=normal，remaining_min=24，status=running | 当前实际声源 |
| living_room_robot_vacuum_1 | power=off，status=docked，battery_pct=90 | 用 `living room robot vacuum docked` 排除机器人 |
| living_room.noise_level_db | 34.0 | 不是要求写入的房间噪声值 |

初始 schedules、workflows、history 均为空。Home 中还有其他房间和设备，但它们不参与这个判断。

## 3. Setup 具体流程

### linux_0

1. 删除旧的 `source-map.png`、`review.txt` 和 `findings.docx`。
2. 创建 `/tmp/inspection`。
3. 上传图片到 `/tmp/inspection/source-map.png`。
4. 上传说明到 `/tmp/inspection/review.txt`。

### home_0

使用 `linux_smarthome_372/episode_config.json` reset Home，恢复上述时间、读数、设备状态以及空计划。

Setup 不会自动打开图片或文本，也不会预先创建 `findings.docx`。

## 4. 建议的输出内容

Oracle 的正文是：

~~~text
Noise source
dryer
laundry room noise 63 dB
washer stopped
living room robot vacuum docked
~~~

不要求逐字照抄这五行，但这种写法最直接，也完整保留了 Home 的 `stopped`、`docked` 标签。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

只有一个 evaluator：`check_docx_text`。它必须成功。

### 5.1 文件位置与读取方式

Evaluator 只读取 `linux_0:/tmp/inspection/findings.docx`。路径或文件名不同就找不到输出。

实现会把文件作为 ZIP/DOCX 打开并读取 `word/document.xml` 中的可见正文文字；打不开、缺少正文 XML 或 XML 无法解析都会失败。本任务没有启用完整 DOCX package 校验，也不检查字体、标题样式、段落数量、表格、页面布局、页眉或页脚。

### 5.2 五个大小写敏感的必含子串

可见正文必须同时包含：

1. `dryer`
2. `laundry room noise`
3. `63`
4. `washer stopped`
5. `living room robot vacuum docked`

这是连续子串检查，默认区分大小写。例如 `Dryer`、`washer is stopped`、`living-room robot vacuum docked` 都不能替代配置中的对应必含子串。

### 5.3 语义关系检查

同一份正文还要通过 entity-relation 规则：

- 上述五个实体都必须出现；
- 至少出现 `noise source`、`current source`、`source` 中的一个；
- 不能出现：
  - `dryer is not the source`
  - `source is not the dryer`
  - `source unknown`
  - `source uncertain`
- 问句、明显不确定表达、否定或后续撤销表达也可能被通用关系规则拒绝。

本任务没有配置 `relation_groups`，所以五项证据不要求处在同一个 clause，也不要求固定行序；分成五行完全可以。

### 5.4 没有检查的内容

- 没有 Home evaluator，不检查是否真的查询过 Home；
- 不检查 dryer 的 `running` 字样是否写入；
- 不检查文档是否与 Oracle 完全相同；
- 不检查对 Home 的 command history。不过任务本身只是查询和写报告，不应控制设备。

## 6. 常见失败与真实评测边界

- 只写“dryer 造成噪声”，没写三个规定格式的证据：失败。
- 把 `stopped` 改写成 `not running`：缺少 `washer stopped`，失败。
- 把 `docked` 改写成 `at the dock`：缺少精确子串，失败。
- 写成 `source uncertain: dryer`：虽然关键词齐全，冲突/不确定规则仍会失败。
- 内容正确但保存成 PDF、ODT 或别的路径：失败。
- 内容正确、排版很简单：可以通过，因为 evaluator 不评审版式。

## 7. Cleanup

- linux_0 删除三个任务文件，并尝试删除空的 `/tmp/inspection` 目录。
- home_0 reset。

