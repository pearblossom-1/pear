# Core 065 — `linux_android_1314`

- 任务文件：`tasks/cross_device/linux_android/linux_android_1314.json`
- 运行配置：`configs/cross_device/local_android_linux.json`；拓扑 `1A+1L`
- 限制：50 步；未设秒数

## 1. Instruction

### 英文原文（逐字）

```text
The phone identifies the current approval for REL-1314. Match that approval against `/tmp/release/manifest.csv`, then create `/tmp/release/ready_release.zip` containing exactly the two required files for that approval plus a root-level copy of the manifest named `manifest_copy.csv`. Exclude obsolete and draft rows.
```

### 中文翻译

按手机当前 approval 匹配 manifest，创建 ZIP，只含该 approval 的两个 required 文件及根目录 manifest_copy.csv，排除 obsolete/draft。

## 2. 数据、Setup 与评测

短信：`Approved REL-1314 with AP-1314.`。Manifest required：dispatch_client.py、release_notes.md；AP-LEGACY 的 release_notes_draft.md、legacy_config.json obsolete。四个源文件均已暂存。

唯一 archive evaluator 要求根目录成员集合精确为 `dispatch_client.py`、`release_notes.md`、`manifest_copy.csv`，并把三者内容分别与原两个文件和完整原 manifest 比较。多目录、草稿、legacy、改写内容或漏项失败。

