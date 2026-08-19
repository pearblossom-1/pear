# Core 064 — `linux_android_1037`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 64 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1037.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步，最长 420 秒

## 0. 任务链与最终要做的事

第一部手机确认 case/code/owner，Linux registry 用 approval code 找到站点与坐标，第二部手机负责真正添加 OsmAnd favorite 并写 Markor handoff。匹配结果是 `North Service Gate / 37.7812 / -122.4018`。

## 1. Instruction

### 英文原文（逐字）

```text
Use the approval note on the first phone together with `/tmp/sites/site_registry.csv` and `/tmp/sites/handoff_policy.md`. Add the approved site to OsmAnd Favorites on the second phone without disturbing the existing reference favorite. Then leave a concise handoff in Markor at `/storage/emulated/0/Documents/Markor/1037-A_handoff.md` that identifies the case, owner, approval code, site, coordinates, and confirms the favorite is ready.
```

### 中文翻译

结合第一部手机上的 approval note、`/tmp/sites/site_registry.csv` 和 `/tmp/sites/handoff_policy.md`，把已批准站点添加到第二部手机的 OsmAnd Favorites 中，同时不要扰动现有的 reference favorite。然后在第二部手机的 `/storage/emulated/0/Documents/Markor/1037-A_handoff.md` 留下一份简洁 handoff，写明 case、owner、approval code、site、coordinates，并确认 favorite 已 ready。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机 `1037-A_source.md`

```text
# Approved site request

Case: 1037-A
Approval code: NX03781
Owner: Priya Shah
Status: approved
```

### 2.2 Linux `site_registry.csv`

```csv
approval_code,status,site,latitude,longitude,route
NX03781,approved,North Service Gate,37.7812,-122.4018,RT-37
NX03782,hold,South Service Gate,37.7701,-122.4102,RT-38
```

用 code `NX03781` 匹配得到 North Service Gate。第二行 NX03782/South Service Gate 是 hold 干扰项。

### 2.3 Linux `handoff_policy.md`

```text
# Approved site favorite handoff policy

Match the phone's approved code to the registry. Add only that matching site to OsmAnd, then leave a positive Markor handoff that relates the phone request to the matched site and coordinates.
```

## 3. Setup 具体流程

### `android_0`

- 确保 Files 可用。
- 上传 1037-A_source.md 到 `/sdcard/Download/1037-A_source.md`。

### `android_1`

- 确保 OsmAnd 可用并运行 favorites 初始化。
- 随后明确删除 OsmAnd 的 `favorites.gpx` 和 `favourites_bak.gpx`。
- 删除旧的 1037-A_handoff.md。
- 确保 Markor 可用。

### `linux_0`

- 创建 `/tmp/sites`，删除旧 registry/policy。
- 上传 site_registry.csv 与 handoff_policy.md。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluation 单元：OsmAnd favorite set 与 Markor note。

### 4.1 OsmAnd Favorites

- 第二部手机最终 favorite set 必须精确为一条：`North Service Gate`。
- 纬度目标 `37.7812`，经度目标 `-122.4018`。
- 坐标容差是 `0.0002`；在容差内可通过，超出则失败。
- 这是整套 favorite 的 exact 检查：少目标、名称错误或有额外 favorite 都失败。

### 4.2 Markor handoff

推荐内容：

```text
1037-A / NX03781 for Priya Shah: North Service Gate was added at 37.7812, -122.4018, and the favorite is ready.
```

具体规则：

- 路径必须是 `/storage/emulated/0/Documents/Markor/1037-A_handoff.md`。
- 必须包含 1037-A、Priya Shah、NX03781、North Service Gate。
- 纬度可写 `37.7812`、`37.7812° N` 或 `37.7812 N`。
- 经度可写 `-122.4018`、`122.4018° W` 或 `122.4018 W`。
- 必须从 added/saved/created 中命中一个，另从 ready/approved/complete 中命中一个；两组都要有。
- 不能出现 `not added`、`pending`、`blocked`、`1037-D`。
- 问句、不确定或否定式陈述失败。未配置 clause/近邻关系，实现在整篇 note 中查找这些要素。

## 5. 常见失败与配置边界

- Favorite 正确但 note 漏 owner 或任一坐标：note 项失败。
- Note 正确但 favorite 坐标写反：OsmAnd 项失败。
- Note 写 `approved` 却没写 added/saved/created：只满足第二个短语组，仍失败。
- 为解释排除项而在 note 中提到 `1037-D`：命中 conflict，失败。

本题存在一个真实的 setup/evaluator 不一致：instruction 要“不要扰动 existing reference favorite”，但 setup 在 OsmAnd 初始化后删除了 favorites 与 backup 文件，没有上传或创建任何具名 reference favorite；evaluator 也要求最终集合精确只有 North Service Gate。如果真有一条 reference favorite 并按 instruction 保留下来，当前 exact-set evaluator 反而会因额外 favorite 失败。因此现有配置实际只评分“添加这一条目标 favorite”，没有真正测试 reference preservation。

## 6. Cleanup

- 第一部手机删除 source。
- 第二部手机删除 favorites、backup 和 Markor note。
- Linux 删除 registry/policy 并尝试移除空目录。
