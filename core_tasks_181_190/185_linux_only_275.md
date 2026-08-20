# Core 185 — `linux_only_275`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 185 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_275.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：easy
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 列出 Review 文件夹必须具备的三个离线页面。第二台 Linux 上：

- Release Readiness Checklist 的文件存在，书签也在 Review 文件夹：`ready`；
- Support Escalation Directory 的文件存在，但书签被放在 Archive 文件夹：`missing_bookmark`；
- Deployment Rollback Guide 对应的 `c.html` 根本不存在：`missing_file`，而且该状态优先于“也没有书签”。

只需在第二台机器生成三行 CSV，且不能改动原书签导出 HTML 的任何字节。

## 1. Instruction

### 英文原文（逐字）

```text
Before the offline review portal is handed over, compare `/tmp/portal/required_pages.json` on the first Linux machine with `/tmp/portal/bookmark_export.html` and the local page files on the second. Write one disposition for every required page to `/tmp/portal/missing_pages.csv`; leave the bookmark export unchanged.
```

### 中文翻译

在离线审查门户交接之前，请把第一台 Linux 机器上的 `/tmp/portal/required_pages.json` 与第二台机器上的 `/tmp/portal/bookmark_export.html` 及本地页面文件进行比较。为每个必需页面在 `/tmp/portal/missing_pages.csv` 中写一条处置结论；不要改动书签导出文件。

## 2. 输入、附件与完整内容

本题没有短信或邮件。输入是一份 JSON、一份 Netscape 格式书签导出 HTML，以及两份本地 HTML 页面。

### 2.1 `linux_0`：`required_pages.json`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_275/source/linux_0/tmp/portal/required_pages.json`
- 注入路径：`/tmp/portal/required_pages.json`
- 完整原文：

```json
{
  "folder": "Review",
  "pages": [
    {
      "name": "Release Readiness Checklist",
      "path": "/tmp/portal/local_pages/a.html"
    },
    {
      "name": "Support Escalation Directory",
      "path": "/tmp/portal/local_pages/b.html"
    },
    {
      "name": "Deployment Rollback Guide",
      "path": "/tmp/portal/local_pages/c.html"
    }
  ],
  "report_schema": {
    "columns": [
      "page",
      "status"
    ],
    "priority": [
      "missing_file",
      "missing_bookmark",
      "ready"
    ],
    "dispositions": [
      {
        "status": "ready",
        "meaning": "the required page file exists and its bookmark is in the required folder"
      },
      {
        "status": "missing_bookmark",
        "meaning": "the page file exists but the required-folder bookmark is missing"
      },
      {
        "status": "missing_file",
        "meaning": "the local page file is missing; this takes priority if its bookmark is also missing"
      }
    ]
  }
}
```

### 2.2 `linux_1`：`bookmark_export.html`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_275/source/linux_1/tmp/portal/bookmark_export.html`
- 注入路径：`/tmp/portal/bookmark_export.html`
- 完整原文：

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This file uses the standard browser bookmark export format. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1785196800" LAST_MODIFIED="1785196800">Review</H3>
    <DL><p>
        <DT><A HREF="file:///tmp/portal/local_pages/a.html" ADD_DATE="1785196800">Release Readiness Checklist</A>
    </DL><p>
    <DT><H3 ADD_DATE="1785196800" LAST_MODIFIED="1785196800">Archive</H3>
    <DL><p>
        <DT><A HREF="file:///tmp/portal/local_pages/b.html" ADD_DATE="1785196800">Support Escalation Directory</A>
    </DL><p>
</DL><p>
```

关键不是“有没有任何书签”，而是书签是否位于 JSON 指定的 `Review` 文件夹。`b.html` 的书签虽然存在，却在 `Archive` 下，所以仍是 `missing_bookmark`。

### 2.3 `linux_1`：`local_pages/a.html`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Release Readiness Checklist</title>
</head>
<body>
  <main>
    <h1>Release Readiness Checklist</h1>
    <p>Use this page during the offline handover review.</p>
    <ul>
      <li>Confirm the release notes have been approved.</li>
      <li>Verify the rollback package is available locally.</li>
      <li>Record the on-call owner before enabling the portal.</li>
    </ul>
  </main>
</body>
</html>
```

此文件存在，且 Review 文件夹中有对应书签，因此 `ready`。

### 2.4 `linux_1`：`local_pages/b.html`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Support Escalation Directory</title>
</head>
<body>
  <main>
    <h1>Support Escalation Directory</h1>
    <p>Offline contacts for the launch support window.</p>
    <dl>
      <dt>Application support</dt>
      <dd>Extension 4102</dd>
      <dt>Network operations</dt>
      <dd>Extension 4128</dd>
      <dt>Release manager</dt>
      <dd>Extension 4150</dd>
    </dl>
  </main>
</body>
</html>
```

此文件存在，但 Review 中没有它的书签，因此 `missing_bookmark`。

### 2.5 明确不存在的附件

JSON 要求：

```text
/tmp/portal/local_pages/c.html
```

Setup 不会上传或创建该文件，书签导出中也没有 Deployment Rollback Guide。按照 priority，最终只写 `missing_file`，不是 `missing_bookmark`。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/tmp/portal`；
2. 删除并上传 `required_pages.json`。

### `linux_1`

1. 创建 `/tmp/portal`，删除并上传 `bookmark_export.html`；
2. 创建 `/tmp/portal/local_pages`，删除并上传 `a.html`；
3. 删除并上传 `b.html`；
4. 删除旧 `/tmp/portal/missing_pages.csv`。

Setup 没有导入 Chrome 书签数据库；`bookmark_export.html` 本身就是要读取且必须保持不变的源文件。

## 4. 正确输出

推荐的完整 CSV：

```csv
page,status
Release Readiness Checklist,ready
Support Escalation Directory,missing_bookmark
Deployment Rollback Guide,missing_file
```

三条数据行的顺序可以变化。

## 5. Evaluator：评测方式与具体评测点

本题有 1 个计分 evaluator 和 1 个不计分硬保护 evaluator。

### 5.1 CSV evaluator：表头和三条处置精确匹配

Evaluator 用 `utf-8-sig` 和 `csv.DictReader` 读取：

```text
/tmp/portal/missing_pages.csv
```

表头必须精确为：

```python
["page", "status"]
```

数据单元格会 `.strip()`，然后要求恰好是下面三个唯一二元组：

```text
Release Readiness Checklist | ready
Support Escalation Directory | missing_bookmark
Deployment Rollback Guide | missing_file
```

规则是集合匹配，所以行顺序不限；但名称、大小写和状态代码必须精确。多行、少行、重复行、额外列或调换列顺序都会失败。

### 5.2 书签源文件是按 SHA-256 字节保护的硬 guard

第二个 evaluator 读取 `bookmark_export.html` 的原始字节并计算 SHA-256，要求精确等于：

```text
15b2b0952d382f4d01e4a778fab50cd419efbfe87b020922fd76c3d190b5ab00
```

这意味着任何字节变化都失败，包括：

- 把 Support 书签移动到 Review；
- 改 HTML 大小写、缩进或换行；
- 用浏览器重新导出导致 metadata 或序列化变化；
- 删除注释或改时间戳。

该 evaluator 标记为 `enable_score_calc=false`，不参与平均分，但它是硬保护：全局逻辑会让任何不计分 evaluator 的失败把最终 score 直接归零，并使 `success=false`。因此“CSV 正确但修改了书签导出”不是部分通过，而是 0 分失败。

### 5.3 评测时不重新推导业务逻辑

CSV evaluator 没有在评测时重新读取 JSON、HTML 或检查文件存在性；三个期望处置已经硬编码。源文件 guard 只保护书签导出，`a.html`、`b.html` 没有独立完整性 guard。

## 6. 当前 evaluator 没检查什么

- 不检查 CSV 行顺序；
- 不要求打开 Chrome，也不读取真实 Chrome bookmark 数据库；
- 不检查 `a.html`、`b.html` 的正文是否保持不变；
- 不验证任务执行过程是否真的遍历文件系统，只看最终 CSV 与书签源字节；
- 不要求在 CSV 中写解释原因，只有 `page,status` 两列。

## 7. 常见失败示例

- 为了“修复”门户而把 b 的书签移到 Review：违反 leave unchanged，硬 guard 失败并归零。
- 把 Deployment Rollback Guide 写成 `missing_bookmark`：忽略了 missing_file 优先级。
- 使用状态 `missing bookmark`（空格）而非 `missing_bookmark`：精确值失败。
- 额外添加 `reason` 列：表头不再精确。
- 只报告两条缺失项、漏掉 ready 项：instruction 要求每个 required page 一条，记录数也不符。

## 8. Cleanup

- `linux_0` 删除 `required_pages.json`；
- `linux_1` 删除书签导出、两份本地页面和输出 CSV。

