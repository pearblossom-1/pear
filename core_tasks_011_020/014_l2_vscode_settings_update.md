# Core 014 — `l2_vscode_settings_update`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 14 项
- 任务文件：`tasks/cross_device/real200/l2_vscode_settings_update.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 设备拓扑：`2L`（`linux_0`、`linux_1`）
- 限制：最多 90 步，最长 720 秒

## 1. Instruction

### 英文原文（逐字）

```text
`/tmp/code/settings.md` on the first Linux machine lists the VSCode workspace settings keys and values that need updating. Please open `/tmp/code/project/` in VSCode on the second Linux machine and update the workspace settings according to settings.md.
```

### 中文翻译

第一台 Linux 机器上的 `/tmp/code/settings.md` 列出了需要更新的 VSCode 工作区设置键和值。请在第二台 Linux 机器的 VSCode 中打开 `/tmp/code/project/`，并按照 settings.md 更新工作区设置。

## 2. 输入、附件与初始业务数据

### 2.1 第一台 Linux 的 `settings.md`

完整原文：

```markdown
# VSCode workspace settings request

Update /tmp/code/project/.vscode/settings.json with these exact values:

- python.testing.pytestEnabled = true
- editor.formatOnSave = true
- files.exclude["**/__pycache__"] = true

Keep the file as valid JSON.
```

### 2.2 第二台 Linux 的项目文件

`/tmp/code/project/README.txt`：

```text
Workspace settings exercise. Update only .vscode/settings.json.
```

初始 `/tmp/code/project/.vscode/settings.json`：

```json
{
  "python.testing.pytestEnabled": false,
  "editor.formatOnSave": false,
  "files.exclude": {}
}
```

目标文件不是把 `files.exclude["**/__pycache__"]` 写成一个完整的扁平键；正确 JSON 形状是让顶层 `files.exclude` 的值成为对象。

## 3. Setup 具体流程

### `linux_0`

1. 删除并重建 `/tmp/code`。
2. 上传请求文件为 `/tmp/code/settings.md`。

### `linux_1`

1. 删除并重建 `/tmp/code/project/.vscode`。
2. 上传 `README.txt`。
3. 上传初始的 `.vscode/settings.json`。

Setup 不自动打开 VSCode；任务要求操作者在第二台 Linux 中打开项目并编辑目标文件。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

让第二台 Linux 的 `.vscode/settings.json` 至少包含：

```json
{
  "python.testing.pytestEnabled": true,
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/__pycache__": true
  }
}
```

三个 `true` 都必须是 JSON 布尔值，不能写成字符串 `"true"`。文件必须保存到第二台 Linux 的确切路径。

### 4.1 JSON 评测逻辑

- `func`：`check_json`
- `result`：`linux_1:/tmp/code/project/.vscode/settings.json`
- 文件必须存在且能被解析为 JSON。
- 精确检查以下路径：
  - 顶层键 `python.testing.pytestEnabled == true`
  - 顶层键 `editor.formatOnSave == true`
  - `files.exclude` 对象中的 `**/__pycache__ == true`
- 同时明确拒绝前两个键仍为 `false`。
- evaluator 没有声明“禁止额外键”，所以正常保留其他无关 VSCode 设置不会单独导致失败；但目标三项必须满足。
- 不检查是否真的通过 VSCode GUI 修改，也不检查 `README.txt`。

