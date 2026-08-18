# Core 017 — `al_writer_from_note_gui`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 17 项
- 任务文件：`tasks/cross_device/real200/al_writer_from_note_gui.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 45 步，最长 360 秒

## 1. Instruction

### 英文原文（逐字）

```text
The Android Markor note `Memo draft` is a short notice. Please use LibreOffice Writer on Linux to create `/tmp/memo/memo.odt` with the title and body.
```

### 中文翻译

Android Markor 笔记 `Memo draft` 是一则简短通知。请在 Linux 上使用 LibreOffice Writer 创建 `/tmp/memo/memo.odt`，写入其中的标题和正文。

## 2. 输入、附件与初始业务数据

### 2.1 Android Markor 笔记原文

- 路径：`/storage/emulated/0/Documents/Markor/Memo draft.md`
- 完整内容：

```markdown
# Memo draft

Title: Dock schedule change

Body: Please tell the morning crew that badge pickup moves to 08:45 and the north desk should stay staffed until 10:15.
```

需要放入 ODT 的标题和正文分别是：

```text
Dock schedule change
Please tell the morning crew that badge pickup moves to 08:45 and the north desk should stay staffed until 10:15.
```

`# Memo draft`、`Title:` 和 `Body:` 是源笔记的组织标签，不是目标正文要求的一部分。

### 2.2 Linux 输出

- 目标路径：`linux_0:/tmp/memo/memo.odt`
- Setup 会重建 `/tmp/memo` 并删除旧输出。

## 3. Setup 具体流程

### `android_0`

1. 确保 Markor 可用。
2. 创建 Markor 文档目录。
3. 写入上述 `Memo draft.md` 原文。

### `linux_0`

1. 删除并重建 `/tmp/memo`。
2. 删除旧的 `memo.odt`。

没有预置 ODT 模板，操作者需要在 Writer 中新建文档并保存为指定格式和路径。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

创建一个真正的 Writer ODT，至少有两个可见段落，并让标题段落先出现、正文段落后出现：

```text
Dock schedule change

Please tell the morning crew that badge pickup moves to 08:45 and the north desk should stay staffed until 10:15.
```

最稳妥的方法是只保留这两个段落。截图、纯文本改后缀、损坏的 ODT 或把标题正文拼成同一段都不能通过。

### 4.1 ODT 包检查

- `func`：`check_odf_text`
- 文件必须是有效的 ODF text 文档，而不是只含目标字符串的伪 ZIP。
- 包内必须包含 `styles.xml` 和 `meta.xml`，并满足基本 ODT 包结构。
- 可见段落数至少为 2。

### 4.2 段落与语义检查

- 标题必须作为一个完整可见段落，正文也必须作为另一个完整可见段落。
- 两个精确段落各自只能匹配一次，并且标题要位于正文之前。
- 比较不区分大小写，但标点和词语内容在段落归一化后仍需一致。
- 文档不得包含 `placeholder summary`、`WRONG-000`、`cancelled/canceled`、`obsolete`、`superseded`、`ignore this notice`。
- evaluator 还拒绝“不要使用上文”“通知已取消/替换/撤回”等冲突语句；即使目标文字也出现，后文把它推翻仍失败。
- 没有要求特定字体、字号、页数或标题样式。

