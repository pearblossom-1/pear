# Core 039 — `linux_android_1357`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 39 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1357.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`
- 限制：最多 50 步；任务文件没有单独设置最长秒数

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

- `android_0`：上传请求 TXT。
- `linux_0`：上传 site_rows.csv。
- `android_1`：准备 Markor 并删除旧目标笔记。

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

