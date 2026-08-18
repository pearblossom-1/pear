# Core 061 — `linux_android_1859`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1859.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`；拓扑 `2A+2L`
- 限制：70 步 / 600 秒

## 1. Instruction

### 英文原文（逐字）

```text
Create `/tmp/inspection/packet.odt` on the second Linux desktop from the packet template, the current registry row, the first phone's sole OsmAnd favorite and matching field photo, and the second phone's inspection context. Keep the template's readable field layout, include the favorite coordinates and inspection window, describe the visible field condition from the photo in the observation field, and mark the current inspection ready.
```

### 中文翻译

用模板、current registry 行、第一部手机唯一 OsmAnd favorite 与现场照片、第二部手机 inspection context，在第二台 Linux 创建 packet.odt；保留可读字段布局，写坐标、inspection window、照片可见情况，并标记 ready。

## 2. 数据、Setup 与评测

Registry current：CASE-1859/FB-1859/Ari Singh/RT-59。Favorite：Harbor Gate 8，`37.812,-122.386`。Context：`Inspection window: 2026-07-24 09:50`。照片要求观察字段写出 `orange traffic cone` 和 `blue utility cabinet`。

唯一 ODT evaluator 要求真实 ODF 包、模板标题 `Field Inspection Packet`、所有上述实体，且无 placeholder/archived/hold。Case、Approval、Owner、Route、Site、Coordinates、Inspection window、Decision、Photo observation 各自必须在对应同一段落中与值关联；Decision=ready。散落关键词或残留 `[[...]]` 不通过。

