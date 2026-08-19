# Core 061 — `linux_android_1859`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 61 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1859.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 70 步，最长 600 秒

## 0. 任务链与最终要做的事

四台设备各提供或承载一部分信息：第一部手机有现场位置与照片，第二部手机有检查时间，第一台 Linux 有 registry 和 ODT 模板，最终成品必须出现在第二台 Linux。要把这些来源拼成一份真实、可打开的 `/tmp/inspection/packet.odt`，保留模板的逐字段布局并把当前 inspection 写成 ready。

## 1. Instruction

### 英文原文（逐字）

```text
Create `/tmp/inspection/packet.odt` on the second Linux desktop from the packet template, the current registry row, the first phone's sole OsmAnd favorite and matching field photo, and the second phone's inspection context. Keep the template's readable field layout, include the favorite coordinates and inspection window, describe the visible field condition from the photo in the observation field, and mark the current inspection ready.
```

### 中文翻译

根据 packet 模板、registry 的当前行、第一部手机中唯一的 OsmAnd favorite 及其匹配的现场照片，以及第二部手机中的 inspection context，在第二台 Linux 桌面创建 `/tmp/inspection/packet.odt`。保留模板清晰可读的字段布局，填入 favorite 坐标和检查时间窗口，在 observation 字段描述照片中可见的现场情况，并将当前检查标记为 ready。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机：OsmAnd favorite

`favorites.gpx` 的完整业务内容是一个 waypoint：

```xml
<wpt lat="37.812" lon="-122.386">
  <name>Harbor Gate 8</name>
</wpt>
```

因此 Site=`Harbor Gate 8`，Coordinates=`37.812, -122.386`。

### 2.2 第一部手机：现场照片 `rt-59_photo_a.jpg`

- 路径：`/sdcard/Pictures/FieldAlbum/rt-59_photo_a.jpg`
- 尺寸：1448×1086 JPEG。
- 实际画面：围栏旁有一个明显的橙色交通锥和一个大型蓝色设备/utility cabinet，背景可见水面、船只和围栏。
- Evaluator 只要求 observation 中明确出现 `orange traffic cone` 与 `blue utility cabinet`，并不评分背景细节。

### 2.3 第二部手机：`inspection_context.txt`

```text
Inspection window: 2026-07-24 09:50
Context: perform the approved field inspection during this window.
```

### 2.4 第一台 Linux：`site_registry.csv`

```csv
case,status,code,owner,phone,email,route,include,notes
CASE-1859,current,FB-1859,Ari Singh,+15552001829,ari.singh@example.test,RT-59,yes,approved source row
CASE-OLD,archived,OLD-17,Archived Owner,+15550000000,old@example.test,RT-00,no,inactive archive
CASE-HOLD,hold,HOLD-42,Hold Owner,+15550009999,,RT-59,no,similar-code hold
```

当前行是第一行：Case=`CASE-1859`、Approval=`FB-1859`、Owner=`Ari Singh`、Route=`RT-59`。后两行分别是 archived 与 hold 干扰项，不能写进成品。

### 2.5 第一台 Linux：`packet_template.odt`

这是一个真实 ODT/ODF text package，正文有标题加 9 个字段段落：

```text
Field Inspection Packet
Case: [[CASE]]
Approval: [[APPROVAL]]
Owner: [[OWNER]]
Route: [[ROUTE]]
Site: [[SITE]]
Coordinates: [[COORDINATES]]
Inspection window: [[INSPECTION_WINDOW]]
Decision: [[DECISION]]
Photo observation: [[PHOTO_OBSERVATION]]
```

最终应替换所有 `[[...]]`，而不是在模板后面另堆一串答案。

## 3. Setup 具体流程

### `android_0`

- 确保 Files 可用，上传现场照片到 FieldAlbum。
- 确保 OsmAnd 可用并初始化 favorites 存储。
- 把只含 `Harbor Gate 8` 的 GPX 上传为 OsmAnd favorites.gpx。

### `android_1`

- 确保 Files 可用。
- 上传 inspection_context.txt 到 `/sdcard/Download/inspection_context.txt`。

### `linux_0`

- 创建 `/tmp/inspection` 和 `/tmp/sites`。
- 上传 registry 到 `/tmp/sites/site_registry.csv`。
- 上传模板到 `/tmp/inspection/packet_template.odt`。

### `linux_1`

- 创建 `/tmp/inspection`。
- 删除旧的 `/tmp/inspection/packet.odt`；最终 ODT 必须在这一台 Linux 上新建。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，检查第二台 Linux 上的 ODT；因此这一项失败就是整题失败。

### 4.0 推荐的最终正文

```text
Field Inspection Packet
Case: CASE-1859
Approval: FB-1859
Owner: Ari Singh
Route: RT-59
Site: Harbor Gate 8
Coordinates: 37.812, -122.386
Inspection window: 2026-07-24 09:50
Decision: ready
Photo observation: An orange traffic cone stands beside a blue utility cabinet.
```

### 4.1 文件与 ODF 结构

- 路径精确为 `/tmp/inspection/packet.odt`。
- 不能只是把文本文件改名为 `.odt`；必须是能解析的有效 ODF package，文档种类必须为 text。
- 至少要有 9 个可见段落。模板本身是标题加 9 个字段，共 10 段。

### 4.2 全文包含与排除

以下检查大小写不敏感，所有内容都必须在 ODT 可见文本中出现：

- 标题：Field Inspection Packet
- 当前身份：CASE-1859、FB-1859、Ari Singh、RT-59
- 位置：Harbor Gate 8、37.812、-122.386
- 时间：Inspection window、2026-07-24 09:50
- 决策：ready
- 照片观察：orange traffic cone、blue utility cabinet

不能出现：PLACEHOLDER、CASE-OLD、HOLD-42、rt-59_hold.jpg，以及任一未替换模板标记 `[[CASE]]`、`[[APPROVAL]]`、`[[OWNER]]`、`[[ROUTE]]`、`[[SITE]]`、`[[COORDINATES]]`、`[[INSPECTION_WINDOW]]`、`[[DECISION]]`、`[[PHOTO_OBSERVATION]]`。

### 4.3 九个逐段关系

Evaluator 不接受把所有关键词随便散落在文档里。它要求下面每组内容各自在同一个可见段落中出现：

1. Case + CASE-1859
2. Approval + FB-1859
3. Owner + Ari Singh
4. Route + RT-59
5. Site + Harbor Gate 8
6. Coordinates + 37.812 + -122.386
7. Inspection window + 2026-07-24 09:50
8. Decision + ready
9. Photo observation + orange traffic cone + blue utility cabinet

每组必须恰好找到一个匹配段落，而且九组不能复用同一段落。因此照模板一字段一段最稳妥；把全部字段压成一个段落反而失败。

## 5. 常见失败与真实评测边界

- 输出放在第一台 Linux：失败，getter 只看 `linux_1`。
- 用普通文本伪装成 ODT：有效 package 检查失败。
- 只把答案附在模板末尾却保留 `[[...]]`：命中 exclude，失败。
- observation 只写 “cone and cabinet”：缺少 evaluator 要求的颜色及完整词组，失败。
- 在多个段落重复同一完整字段，例如两处都写 `Case: CASE-1859`：该关系会找到两个候选段落，失败。

有两个实现边界需要明确：

1. Evaluator 检查 ODF 有效性、可见文字和段落关系，但没有逐项比较模板字体、字号、颜色或页面坐标；“readable field layout”主要由一字段一段的结构间接约束。
2. task JSON 含 `paragraph_relations_require_affirmative: true`，但当前 `check_odf_text` 实现并未读取这个键。它对 Decision 只做 `Decision` 与 `ready` 子串共段，exclude 也没有 `not ready`，所以 `Decision: not ready` 目前可能误通过。这是 evaluator 的真实缺口；正确答案仍应写明确的 `Decision: ready`。

## 6. Cleanup

- 第一部手机删除照片和 OsmAnd favorites 文件。
- 第二部手机删除 inspection_context.txt。
- 第一台 Linux 删除 registry 与 packet template。
- 第二台 Linux 删除最终 packet.odt；空目录随后尝试移除。
