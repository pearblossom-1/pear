# Core 140 — android_smarthome_407

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 140 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_407.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

照片中可以直接看出：

- entry door 是 closed；
- 鞋架及地面上有多双 shoes，所以 shoes present。

Home 查询得到：

- entry brightness=82 lux；
- entry light=off。

把照片名、房间和这四项事实写进 `Entry inspection audit.md`。本任务明确禁止控制设备，Home command history 必须保持 0。

## 1. Instruction

### 英文原文（逐字）

~~~text
Simple Gallery Pro has an entry inspection photo, and the Files app's `gallery_manifest.csv` lists the checks to complete. Inspect the photo, query the corresponding live Home state, and record the requested visual observations, brightness reading, and light state in a Markor note named `Entry inspection audit`. Do not control any devices.
~~~

### 中文翻译

Simple Gallery Pro 中有一张 entry inspection 照片，Files app 的 `gallery_manifest.csv` 列出了要完成的检查。查看照片，查询相应的实时 Home 状态，并在名为 `Entry inspection audit` 的 Markor note 中记录要求的视觉观察、亮度读数和灯光状态。不要控制任何设备。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或音频附件。

### 2.1 entry_photo_407.png

- Android 路径：`/sdcard/DCIM/Camera/entry_photo_407.png`
- 格式与尺寸：PNG，1536×1024，RGB。
- 画面内容：室内玄关；正前方的入户门完全闭合；左侧有长椅/鞋架，架上和旁边可以看到多双鞋；墙上挂有外套和帽子。
- 照片可支持的两个结论：`door closed`、`shoes present`。

数值 82 lux 和 Home light off 不是从照片像素推断，而是要查询 live Home。

### 2.2 gallery_manifest.csv 的完整内容

文件路径：`/storage/emulated/0/Download/gallery_manifest.csv`。

第一行记录：

| photo | room | check |
|---|---|---|
| entry_photo_407.png | entry | inspect whether the entry door is open or closed and whether shoes are present; also record live brightness and light state |

第二行是 report-note 说明：

| photo | room | check |
|---|---|---|
| report_note | Entry inspection audit | Record the photo name and room, whether the entry door is open or closed, whether shoes are present, and the live brightness and light state. |

CSV 采用三列结构；第二行把 `Entry inspection audit` 放在 room 列中，实际作用是告诉你 note 名称和要记录的字段。

### 2.3 Markor 初始状态

旧的 `/storage/emulated/0/Documents/Markor/Entry inspection audit.md` 会被删除，setup 不预置结果正文。

### 2.4 Home 初始状态

当前时间：2026-06-16 19:00。

| 项目 | 初始值 |
|---|---|
| entry.temperature_c | 22.0 |
| entry.humidity_pct | 45.0 |
| entry.brightness_lux | 82.0 |
| entry.occupied | false |
| entry_light_1 | type=light，power=off |

初始 schedules、workflows、history 均为空。

## 3. Setup 具体流程

### android_0

1. 确保 Simple Gallery Pro 可用。
2. 删除旧照片，并删除 MediaStore 中两个可能路径对应的旧记录。
3. 创建 DCIM/Camera 目录。
4. 上传 `entry_photo_407.png`。
5. 发送 MEDIA_SCANNER_SCAN_FILE broadcast，使 Gallery 能看见照片。
6. 确保 Files 和 Markor 可用。
7. 删除旧结果 note。
8. 上传 `gallery_manifest.csv` 到 Download。

### home_0

使用 `android_smarthome_407/episode_config.json` reset Home。

Setup 不会自动打开照片/CSV，也不会创建结果 note。

## 4. 正确输出

Oracle 示例：

~~~markdown
# Entry inspection audit

Photo: entry_photo_407.png
Room: entry
Visual observation: entry door closed; shoes present.
Live brightness: 82 lux
Live light state: off
~~~

保存路径：

~~~text
/storage/emulated/0/Documents/Markor/Entry inspection audit.md
~~~

不执行任何 Home command。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

两项都必须成功：

1. Markor note 的 entity-relation；
2. Home command history=0 的 hard guard。

### 5.1 全文必须出现的实体

从精确 note 路径读取正文后，规则要求全文出现：

~~~text
entry_photo_407.png
entry
door
shoes
82
light
~~~

还要求 `closed`、`present`、`82 lux`、`off` 中至少出现一个，并禁止全文出现：

- `door open`
- `no shoes`
- `shoes absent`
- `light on`

“positive_phrases 至少一个”并不是全部四个只靠这一项检查；下面的 relation groups 会分别绑定四个事实。

### 5.2 四个 relation group

每个 group 都必须在某一个 clause 中成立：

| Group | 同一 clause 中必须有 | 该 clause 中不能有 |
|---|---|---|
| Door | door + closed | open |
| Shoes | shoes +（present 或 visible） | absent / none / no shoes |
| Brightness | brightness + 82，再命中 lux 或 82 之一 | 无 |
| Light | light + off | light on |

通用实现把下列边界切成 clause：

- 分号 `;`；
- 竖线 `|`；
- 换行/回车；
- 句号、问号、感叹号后紧跟空白。

每个 group 默认必须恰好匹配一个 clause；把同一事实在两个不同 clause 中重复两次，可能因为“匹配到多个 clause”而失败。一条 clause 同时写全四项则可以通过，因为每个 group 都只找到这一条 matching clause。

### 5.3 `lux` 的当前真实边界

业务说明和 Oracle 都要求写 `82 lux`，推荐严格这样写。

但当前 brightness group 的 `phrases` 是 `lux` 或 `82`，而 `82` 同时已经是该组实体。定向调用当前 evaluator 验证：

~~~text
brightness 82
~~~

即使没有单词 `lux`，也能满足这一个 group。因此“必须写 lux”目前不是硬性机器条件；硬条件是 `brightness` 与 `82` 在同一 clause。为了忠实完成 manifest，仍应写 `82 lux`。

### 5.4 禁止任何 Home command

`smarthome.check_command_history_count` 使用 `count=0, match={}`，统计整个 Home command history，必须一条都没有。查询 room/device state 不计作控制命令。

该 evaluator `enable_score_calc=false`，但失败会把总分置为 0。

### 5.5 没有检查的内容

- 没有直接对照片做图像 evaluator；视觉结论通过 note 语义检查；
- 不单独检查 entry room 或 light 的最终 Home state；
- 不检查 CSV 是否保持不变；
- 不检查 note 与 Oracle 全文一致或 Markdown 排版；
- 不检查查询动作的调用次数。

## 6. 常见失败与真实评测边界

- 只写照片观察，不写 brightness/light：缺实体或 group，失败。
- 把 door 写 open：冲突，失败。
- 写 `shoes absent`：冲突，失败。
- 为了“验证灯”把 entry light 打开再关回去：最终可能仍 off，但 history 已不为 0，失败。
- 把 `brightness` 和 `82` 分到不同 clause：brightness group 失败。
- 在两个不同句子里重复 `door closed`：同一 group 可能匹配两条 clause，失败。
- 写成一行 `entry_photo_407.png entry door closed shoes present brightness 82 light off`：当前 evaluator 可以通过；业务上更清楚的做法仍是写带标签的多行审计。

## 7. Cleanup

- android_0 删除照片及对应 MediaStore 记录、删除 gallery_manifest.csv、删除结果 note。
- home_0 reset。

