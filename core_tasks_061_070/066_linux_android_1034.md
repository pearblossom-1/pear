# Core 066 — `linux_android_1034`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 66 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1034.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 50 步，最长 420 秒

## 0. 任务链与最终判断

手机 source 指向 NX03460，Linux CSV 中该 code 对应 North Annex Access，但 latitude/longitude 都为空。Policy 规定这种情况不能创建目标 favorite，必须保留第二部手机现有的 Reference Depot，并分别给现场用户与 dispatcher 留下 blocked handoff。

## 1. Instruction

### 英文原文（逐字）

```text
The field team needs a route decision for the current approved request. Reconcile `/sdcard/Download/1034-A_source.md` with `/tmp/sites/missing_coordinate.csv` and `/tmp/sites/handoff_policy.md`. Because the selected site has no coordinates, preserve OsmAnd and its existing reference favorite. Leave a blocked note at `/storage/emulated/0/Documents/Markor/1034-A_blocked.md` and a dispatcher handoff at `/tmp/sites/1034-A_handoff.txt` on the second Linux desktop; both should identify the case and approval code, owner, site, and missing-coordinate reason.
```

### 中文翻译

现场团队需要为当前已批准请求作出 route decision。请核对 `/sdcard/Download/1034-A_source.md`、`/tmp/sites/missing_coordinate.csv` 和 `/tmp/sites/handoff_policy.md`。由于选中站点没有坐标，要保持 OsmAnd 及其现有 reference favorite 不变；在 `/storage/emulated/0/Documents/Markor/1034-A_blocked.md` 写 blocked note，并在第二台 Linux 的 `/tmp/sites/1034-A_handoff.txt` 写 dispatcher handoff。两份文本都要写明 case、approval code、owner、site 和缺少坐标这一原因。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机 `1034-A_source.md`

```text
# Route request

Case: 1034-A
Approval code: NX03460
Owner: Nadia Ross
```

### 2.2 第一台 Linux `missing_coordinate.csv`

```csv
approval_code,site,latitude,longitude,status
NX03460,North Annex Access,,,blocked_missing_coordinates
NX03461,South Annex Access,37.7150,-122.3150,ready
```

NX03460 与手机 code 匹配。它的两个坐标 cell 都为空，状态也是 `blocked_missing_coordinates`。NX03461 有坐标但 code 不匹配，不能改选。

### 2.3 第一台 Linux `handoff_policy.md`

```text
# Missing-coordinate route policy

If the selected site has no coordinates, preserve existing OsmAnd favorites, do not create a target favorite, and leave consistent affirmative blocked-route handoffs for the field user and dispatcher.
```

### 2.4 第二部手机初始 OsmAnd favorite

`baseline_favorites.gpx` 中只有：

```xml
<wpt lat="37.7000" lon="-122.3000">
  <name>Reference Depot</name>
</wpt>
```

这就是必须原样保留的 reference favorite。North Annex Access 不应被添加，因为没有可用坐标。

## 3. Setup 具体流程

### `android_0`

- 确保 Files 可用。
- 上传 1034-A_source.md 到 Download。

### `android_1`

- 确保 OsmAnd 可用并初始化 favorites。
- 上传 baseline_favorites.gpx，建立唯一的 Reference Depot。
- 确保 Markor 可用，删除旧 blocked note。

### `linux_0`

- 创建 `/tmp/sites`，删除旧 CSV/policy。
- 上传 missing_coordinate.csv 与 handoff_policy.md。

### `linux_1`

- 创建 `/tmp/sites`。
- 删除旧 `/tmp/sites/1034-A_handoff.txt`。

## 4. Evaluator：评测方式与具体评测点

任务有 3 个 evaluation 单元：OsmAnd 基线保持、Markor blocked note、第二台 Linux dispatcher handoff。

### 4.1 OsmAnd favorite set

- 最终必须精确只有一条 `Reference Depot`。
- 目标坐标为 `37.7, -122.3`，容差 `0.0002`。
- 增加 North Annex Access、删除 Reference Depot 或增加任意额外 favorite 都失败。

### 4.2 Markor blocked note

推荐内容：

```text
1034-A / NX03460 for Nadia Ross is blocked: North Annex Access has no coordinates and cannot be routed.
```

要求：

- 路径精确为 `/storage/emulated/0/Documents/Markor/1034-A_blocked.md`。
- 实体必须齐全：1034-A、NX03460、Nadia Ross、North Annex Access。
- blocked 组至少命中一个：`blocked`、`cannot route`、`cannot be routed`。
- 缺坐标组至少命中一个：`missing coordinates`、`no coordinates`、`coordinates unavailable`。
- 不能出现 `coordinates present`、`coordinates available`、`route ready`、`not blocked`、`1034-D`。
- 问句、不确定和否定式关系失败。未配置 clause/近邻绑定，按全文检查。

### 4.3 第二台 Linux dispatcher handoff

推荐内容同样可以是：

```text
1034-A / NX03460 for Nadia Ross is blocked: North Annex Access has no coordinates and cannot route.
```

其语义要求与 Markor 类似，但可接受范围略窄：

- 四个实体仍必须齐全。
- 第一组只接受 `blocked` 或 `cannot route`。
- 第二组只接受 `missing coordinates` 或 `no coordinates`。
- 冲突是 `route ready`、`coordinates available`、`1034-D`。
- 顶层另外排除大小写敏感的小写子串 `missing`。

因此第二台 Linux 最稳妥的缺坐标写法是 `no coordinates`。只写 `coordinates are absent` 虽然意思正确，却不命中 required phrase；写小写 `missing coordinates` 又会先命中顶层 exclude。

## 5. 常见失败与真实评测边界

- 在 OsmAnd 中为 North Annex Access 猜一个坐标：favorite set 不再等于基线，失败。
- 两份文本只写 blocked，不解释无坐标：缺少第二个 required group，失败。
- Linux handoff 写 `missing coordinates`：语义组本来接受，但顶层 raw exclude 先排除 `missing`，实际失败。
- Linux handoff 写 `coordinates unavailable`：Markor 接受，Linux handoff 不接受。
- 为解释干扰项而写 1034-D：命中 conflict。

第二台 Linux 的 `missing` 自相冲突是 evaluator 配置缺口：同一个字面词既被用作文件读取失败哨兵，又出现在允许的业务短语中。大小写敏感意味着 `Missing coordinates` 可能绕过顶层小写 exclude，但依赖这种偶然差异不如直接使用明确允许的 `no coordinates`。

## 6. Cleanup

- 第一部手机删除 source。
- 第二部手机删除 OsmAnd favorites/backup 与 blocked note。
- 第一台 Linux 删除 CSV/policy。
- 第二台 Linux 删除 handoff.txt；Linux 空目录随后尝试移除。
