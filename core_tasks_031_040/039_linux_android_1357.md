# Core 039 — `linux_android_1357`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 39 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1357.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与分支判断

第一部手机明确指定 site code，Linux CSV 用同名两行制造干扰。必须以 `SITE-1357` 这个 code 选中第一行，而不是仅按 `South Annex` 名称选有坐标的 B 行。选中行的 lat/lon 都为空，所以任务直接进入 blocked-note 分支，不创建路线或 OsmAnd favorite。

## 1. Instruction

### 英文原文（逐字）

```text
Use the request in `/storage/emulated/0/Download/site_request_1357.txt` on the first phone to select the matching row from `/tmp/site/site_rows.csv`. If that exact site lacks coordinates, write `Blocked route SITE-1357.md` in Markor on the second phone with the selected site code, display name, and reason the route is blocked.
```

### 中文翻译

使用第一部手机 `/storage/emulated/0/Download/site_request_1357.txt` 中的请求，从 `/tmp/site/site_rows.csv` 选择匹配行。如果这个精确站点缺少坐标，就在第二部手机 Markor 的 `Blocked route SITE-1357.md` 中写出所选 site code、display name 和路线被阻止的原因。

## 2. 输入、附件与初始业务数据

请求原文：

```text
Requested site code SITE-1357 for South Annex; do not use same-name SITE-1357B.
```

CSV：

```csv
site_code,display_name,lat,lon
SITE-1357,South Annex,,
SITE-1357B,South Annex,37.1357,-122.1357
```

两个 display name 一样，但只能按 site code 选 `SITE-1357`；该行 lat/lon 为空，因此必须走 blocked 分支。

## 3. Setup 具体流程

### `linux_0`

删除旧 `/tmp/site/site_rows.csv`，创建目录并上传完整两行 CSV。

### `android_0`

确保 Files 可用，把请求全文上传到 `/storage/emulated/0/Download/site_request_1357.txt`。

### `android_1`

确保 Markor 可用并删除精确目标 `/storage/emulated/0/Documents/Markor/Blocked route SITE-1357.md`。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 Markor evaluator。

### 4.0 先说人话：怎样才算通过

在精确路径创建笔记，最稳妥正文：

```text
SITE-1357 South Annex: the route is blocked because coordinates are missing.
```

### 4.1 匹配细节

- 必须出现 `SITE-1357` 与 `South Annex`。
- 必须同时表达 route blocked 和 missing coordinates 两组意思。
- 禁止出现 `SITE-1357B`。
- 写 coordinates available/present、route open/can route、wrong site，或疑问/不确定/否定关系会失败。
- evaluator 不检查 OsmAnd，也不要求建立任何路线；唯一计分输出就是这份笔记。

## 5. 关系规则怎样判定

必须同时满足：

1. 两个 entity：`SITE-1357`、`South Annex`。
2. 第一组 required phrase：route blocked / cannot route 等任一别名。
3. 第二组 required phrase：missing/no/unavailable/not provided coordinates 等任一别名。
4. 至少一个正向 blocked 短语。
5. 不出现 `SITE-1357B` 或任一“coordinates available / route open / can route / wrong site”冲突。
6. 整段不是问句、不确定、否定或后来撤销。

因此下面能够通过：

```text
SITE-1357 — South Annex cannot be routed because coordinates were not provided.
```

而 `SITE-1357 South Annex has no coordinates. Route status pending.` 会失败：虽然缺坐标成立，但没有肯定的 blocked-route 结论。

Evaluator 不检查标题行格式、Markdown 语法或是否提到 CSV 文件名；也不验证第一部手机请求是否被修改。

## 6. Cleanup

清理会删除 Linux CSV、第一部手机请求文件和第二部手机 blocked note，并移除空目录。
