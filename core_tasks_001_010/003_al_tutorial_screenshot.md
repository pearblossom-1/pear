# Core 003 — `al_tutorial_screenshot`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 3 项
- 任务文件：`tasks/cross_device/real100/al_tutorial_screenshot.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 22 步，最长 220 秒

## 1. Instruction

### 英文原文（逐字）

```text
I'm writing a Linux tutorial and need a reproducible evidence check. In Android Markor, `tutorial_evidence_request.md` has the title `Tutorial evidence request`; use the row where `page=linux-basics` and `status=needed`. On Linux, create an executable `/tmp/tutorial/linux-basics/capture_evidence.sh` that runs that row's command in its specified working directory and saves the command output to `/tmp/tutorial/linux-basics/evidence.txt`.
```

### 中文翻译

我正在编写一份 Linux 教程，需要一个可复现的证据检查。在 Android Markor 中，`tutorial_evidence_request.md` 的标题是 `Tutorial evidence request`；请使用其中 `page=linux-basics` 且 `status=needed` 的那一行。在 Linux 上创建可执行文件 `/tmp/tutorial/linux-basics/capture_evidence.sh`，让它在该行指定的工作目录中运行该行的命令，并把命令输出保存到 `/tmp/tutorial/linux-basics/evidence.txt`。

## 2. 输入、附件与初始业务数据

### 2.1 Android Markor 请求附件

- 仓库源文件：`tasks/cross_device/real100_assets/al_tutorial_screenshot/source/tutorial_evidence_request.md`
- 注入路径：`/storage/emulated/0/Documents/Markor/tutorial_evidence_request.md`
- 完整原文：

```text
Tutorial evidence request
Use the row in this note where page=linux-basics and status=needed.

page,working_directory,command,status
linux-basics,/tmp/tutorial/linux-basics,pwd && printf 'shell=%s\n' "${SHELL:-/bin/sh}" && wc -c < tutorial_input.txt && sha256sum tutorial_input.txt,needed
linux-basics,/tmp/tutorial/linux-basics,printf 'draft example\n',draft
shell-advanced,/tmp/tutorial,find . -maxdepth 1 -type f -print,needed
linux-basics,/tmp/old_tutorial,printf 'archived example\n',archived
```

唯一同时满足 `page=linux-basics` 与 `status=needed` 的选择是：

- 工作目录：`/tmp/tutorial/linux-basics`
- 命令：

```sh
pwd && printf 'shell=%s\n' "${SHELL:-/bin/sh}" && wc -c < tutorial_input.txt && sha256sum tutorial_input.txt
```

### 2.2 Linux 初始文件

Setup 创建：

- `/tmp/tutorial/linux-basics/`
- `/tmp/tutorial/linux-basics/tutorial_input.txt`，初始内容为一行 `sample tutorial input`

Setup 删除任何旧的 `capture_evidence.sh` 和 `evidence.txt`。没有短信、邮件或二进制附件。

### 2.3 预期输出

- 可执行脚本：`/tmp/tutorial/linux-basics/capture_evidence.sh`
- 脚本运行后生成：`/tmp/tutorial/linux-basics/evidence.txt`

## 3. Setup 具体流程

### `android_0`

1. 确保 Markor 可用。
2. 创建 Markor 文档目录并删除同名旧笔记。
3. 上传第 2.1 节的 Markdown 文件到指定路径。

### `linux_0`

执行一条 shell setup：创建工作目录，向 `tutorial_input.txt` 写入 `sample tutorial input\n`，并删除旧脚本与旧 evidence。

Cleanup 删除本任务的笔记、输入、脚本和 evidence；仅在目录为空时移除两级 `/tmp/tutorial` 目录。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重为 100%。

### 4.0 先说人话：怎样才算通过

你要写一个真正可执行的脚本。评测时会把输入文件换成一份随机的新内容，然后从 `/tmp` 目录启动你的脚本。

脚本必须自己进入 `/tmp/tutorial/linux-basics`，执行 Markor 中选定的那条命令，并把结果写进 `evidence.txt`。最终文件要恰好反映这次随机输入的：

1. 当前目录；
2. shell；
3. 文件真实字节数；
4. 文件真实 SHA-256。

所以，提前手写一份固定的 `evidence.txt` 不会通过；脚本不可执行、依赖当前目录、没有重新生成 evidence，或者字节数/摘要是旧值，也都不会通过。

- `device_id`：`linux_0`
- `result.type`：`vm_command_line`
- `func`：`exact_match`
- 最终比较：评测命令打印 `pass` 或 `fail`，然后与字符串 `pass` 绝对相等。

评测命令按以下顺序执行：

1. `test -x /tmp/tutorial/linux-basics/capture_evidence.sh`：脚本必须存在且具有可执行位。
2. 删除已有的 `evidence.txt`，因此预先写好的静态 evidence 不能直接通过。
3. 使用 Python `secrets.token_bytes` 将 `tutorial_input.txt` 替换成一段全新的不可预测二进制数据，长度为 128–255 字节。
4. 评测器先 `cd /tmp`，再用 `timeout 10` 执行脚本。这验证脚本不能依赖评测器当前目录，必须自己在指定工作目录中运行目标命令。
5. 读取新生成的 `evidence.txt`，要求恰好 4 行：

| 行号 | 精确要求 |
|---|---|
| 1 | 去除两端空白后恰好为 `/tmp/tutorial/linux-basics` |
| 2 | 以 `shell=` 开头，等号后必须为非空字符串；不要求某个固定 shell 路径 |
| 3 | 只含十进制数字，数值必须等于本轮随机输入的真实字节数 |
| 4 | 按空白切分后恰好是两个字段：随机输入的真实 SHA-256 十六进制摘要，以及 `tutorial_input.txt` |

只有所有条件成立才打印 `pass`。

### 不评测的内容

- 不静态检查脚本源码是否逐字包含请求中的命令；只检查实际执行行为。
- 不要求使用特定 shell 语法、重定向写法或脚本解释器。
- 任务名中虽有 `screenshot`，当前任务并不生成或评测截图；产物是 shell 脚本与文本 evidence。
