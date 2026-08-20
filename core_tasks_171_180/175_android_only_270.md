# Core 175 — `android_only_270`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 175 项
- 任务文件：`tasks/cross_device/android_only/android_only_270.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：medium
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机提供负责人联系人，第二台手机的 OsmAnd 收藏点提供地点和坐标。需要把两端信息合成第二台手机上的 Markor 笔记：

```text
Site Manager 5550270 owns the Dock West handoff at 47.6712, -122.3022.
```

四项核心值是联系人名 `Site Manager`、号码 `5550270`、收藏名 `Dock West`、坐标 `47.6712, -122.3022`。

## 1. Instruction

### 英文原文（逐字）

```text
The Site Manager contact on the first phone has the responsible person's number. Combine it with the Dock West favorite in OsmAnd on the second phone and leave `Dock West handoff.md` in Markor with the contact name, number, favorite name, and coordinates.
```

### 中文翻译

第一台手机上的 `Site Manager` 联系人保存着负责人的电话号码。把它与第二台手机 OsmAnd 中的 `Dock West` 收藏点信息结合起来，并在 Markor 中留下 `Dock West handoff.md`，其中写明联系人姓名、号码、收藏点名称和坐标。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。输入是一条 Android 联系人和一份 OsmAnd GPX 文件。

### 2.1 `android_0`：联系人

Setup 清空 Contacts 后添加：

| 字段 | 值 |
|---|---|
| name | `Site Manager` |
| number | `5550270` |
| notes | `Manager for Dock West handoff.` |

### 2.2 `android_1`：OsmAnd 收藏附件

- 仓库文件：`tasks/cross_device/android_only_assets/android_only_270/android_1/osmand/favorites.gpx`
- 注入路径：`/storage/emulated/0/Android/data/net.osmand/files/favorites/favorites.gpx`
- 完整原文：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="OsmAnd" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="47.671200" lon="-122.302200"><name>Dock West</name></wpt>
</gpx>
```

GPX 存的是 6 位小数；目标 evaluator 接受的是等值的 4 位写法 `47.6712, -122.3022`，有空格或无空格两种格式。

### 2.3 输出笔记

目标路径严格为：

```text
/storage/emulated/0/Documents/Markor/Dock West handoff.md
```

Setup 会先删除旧文件。

## 3. Setup 具体流程

### `android_0`

1. 确保 Contacts 可用；
2. 清空联系人；
3. 添加 Site Manager。

### `android_1`

1. 确保 OsmAnd 可用；
2. 执行 OsmAnd favorites 初始化；
3. 上传 GPX 到 favorites 目录；
4. 确保 Markor 可用；
5. 删除旧的 `Dock West handoff.md`。

## 4. 正确输出

Oracle 正文是一个句子：

```text
Site Manager 5550270 owns the Dock West handoff at 47.6712, -122.3022.
```

也可以分为两行，例如联系人关系一行、地点关系一行；但每个核心实体只能匹配一次。

## 5. Evaluator：评测方式与具体评测点

本任务只有 1 个计分 evaluator。getter 读取固定路径的正文，语义关系通过时返回 `pass`，外层 `exact_match` 再要求 `pass`。不是整句绝对匹配。

### 5.1 四个实体都必须恰好出现一次

实体组为：

- `Site Manager`；
- `5550270`；
- `Dock West`；
- `47.6712, -122.3022` 或 `47.6712,-122.3022`。

匹配大小写不敏感。`unique_entities: true` 要求每个实体组只形成一次匹配，所以不要在标题和正文中各重复一遍 Dock West 或联系人。

注意：直接照抄 GPX 的 `47.671200, -122.302200` 不会匹配 4 位小数实体，因为数字后还有额外数字，不满足实体边界。应写 evaluator 指定的 4 位形式。

### 5.2 两组关系

关系 1 要求同一个 clause 中同时包含：

```text
Site Manager + 5550270 + handoff/responsible/owner 中至少一个
```

关系 2 要求同一个 clause 中同时包含：

```text
Dock West + 坐标 + handoff/favorite/location 中至少一个
```

一个句子可以同时满足两组关系，oracle 就是这样做的。也可以用分号或换行拆成两个 clause。每组默认只能找到一个匹配 clause；重复写同一完整关系可能失败。

### 5.3 全文正向词和冲突词

全文至少要出现 `handoff`、`responsible`、`owner` 中一个。以下任一内容会失败：

```text
not responsible
wrong
cancelled
withdrawn
47.6000
-122.2000
```

通用 scorer 同时拒绝问句、`maybe/perhaps` 等不确定说法，以及否定/撤回关系。

### 5.4 坐标 closed list

`reject_unlisted_entity_pattern` 会扫描正文中形如“十进制纬度, 十进制度”的其他坐标对。除了目标坐标的两种空格格式，额外坐标会失败。因此不要在正文中同时写旧坐标、备用坐标或 GPX 的六位版本。

### 5.5 当前 evaluator 没检查什么

- 不重新读取 Contacts 或 GPX；正确值已经写死在笔记 evaluator 中；
- 不检查联系人和 OsmAnd 收藏在任务结束时是否仍存在；
- 不要求 notes 中逐字出现 `favorite`，只要关系词组合满足；
- 不要求 Markdown 标题或固定句式；
- 当前 getter 实际读取固定文件路径。任务 metadata 里“按内容搜索用户创建笔记”的备注与这份 task JSON/getter 的真实路径行为不一致，应以固定路径为准。

## 6. 常见失败示例

- `Site Manager: 5550270. Dock West: 47.6712, -122.3022.`：缺少 handoff/responsible/owner 等正向关系词，失败。
- `Site Manager 5550270 is responsible. Dock West 47.671200, -122.302200 location.`：坐标精度不是 evaluator 接受的实体形式，失败。
- 在笔记标题和正文中都写 `Dock West`：可能因实体匹配两次违反 unique 要求。
- 文件名写成 `Dock West handoff.txt` 或存到 Download：固定 `.md` 路径读不到，失败。

## 7. Cleanup

- `android_0` 清空 Contacts；
- `android_1` 删除 OsmAnd favorites 文件及备份，并删除 `Dock West handoff.md`。

