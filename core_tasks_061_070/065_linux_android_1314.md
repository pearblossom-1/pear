# Core 065 — `linux_android_1314`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 65 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1314.json`
- 运行配置：`configs/cross_device/local_android_linux.json`
- 设备拓扑：`1A+1L`（`android_0`、`linux_0`）
- 限制：最多 50 步；任务未设置 wall-time 秒数

## 0. 任务链与最终要做的事

手机短信给出当前 release 与 approval reference；Linux manifest 再决定哪些源文件属于该 approval。最终要创建一个成员集合和内容都严格固定的 ZIP：两个 required 文件，加一份位于 ZIP 根目录的原始 manifest 副本。

## 1. Instruction

### 英文原文（逐字）

```text
The phone identifies the current approval for REL-1314. Match that approval against `/tmp/release/manifest.csv`, then create `/tmp/release/ready_release.zip` containing exactly the two required files for that approval plus a root-level copy of the manifest named `manifest_copy.csv`. Exclude obsolete and draft rows.
```

### 中文翻译

手机标明了 REL-1314 当前使用的 approval。请在 `/tmp/release/manifest.csv` 中匹配该 approval，然后创建 `/tmp/release/ready_release.zip`：其中只能包含该 approval 对应的两个 required 文件，以及一份位于 ZIP 根目录、名为 `manifest_copy.csv` 的 manifest 副本。排除 obsolete 和 draft 项。

## 2. 输入、附件与初始业务数据

### 2.1 手机 SMS

Setup 清空短信后，收到一条来自 `5551201314` 的短信：

```text
Approved REL-1314 with AP-1314.
```

所以要匹配的 release=`REL-1314`、approval_ref=`AP-1314`。

### 2.2 Linux `manifest.csv`

```csv
release,approval_ref,filename,status
REL-1314,AP-1314,dispatch_client.py,required
REL-1314,AP-1314,release_notes.md,required
REL-1314,AP-LEGACY,release_notes_draft.md,obsolete
REL-1314,AP-LEGACY,legacy_config.json,obsolete
```

前两行才是当前 approval 的 required 文件；后两行属于 AP-LEGACY，不能把对应文件装进 ZIP。

### 2.3 四个候选源文件

`dispatch_client.py`：

```python
"""Dispatch client for the approved REL-1314 package."""

def build_dispatch_payload(case_id: str, route: str) -> dict[str, str]:
    return {"case_id": case_id, "route": route, "release": "REL-1314"}
```

`release_notes.md`：

```text
# REL-1314 release notes

This approved release adds the route-dispatch payload helper and validates the current case and route before handoff. Approval reference: AP-1314.
```

`release_notes_draft.md`（不能打包）：

```text
# Draft REL-1314 notes

Obsolete draft retained only for comparison. Do not package this AP-LEGACY material.
```

`legacy_config.json`（不能打包）：

```json
{"release":"REL-1314","approval_ref":"AP-LEGACY","status":"obsolete","endpoint":"legacy-dispatch"}
```

## 3. Setup 具体流程

### `linux_0`

- 删除并重建 `/tmp/release`，创建 `/tmp/release/files`。
- 上传完整 manifest.csv。
- 把上述四个候选文件全部放入 `/tmp/release/files`；`ready_release.zip` 尚不存在。

### `android_0`

- 确保 Simple SMS Messenger 可用。
- 清空 SMS。
- 注入上面的 AP-1314 approval 短信。

## 4. Evaluator：评测方式与具体评测点

本题只有 1 个 `check_archive_contents` evaluator。它检查的目标不是 ZIP 中能否“找到”三个文件，而是成员集合与每个成员内容都精确相等。

### 4.1 ZIP 中唯一允许的三个成员

```text
dispatch_client.py
release_notes.md
manifest_copy.csv
```

- 三者都必须直接位于 ZIP 根目录。
- 不能有 `/tmp/release/files/`、`files/` 或其他公共父目录前缀。
- 不能有显式目录 entry、隐藏文件或第四个文件。
- 成员名区分大小写，且不能重复。

### 4.2 三个成员的内容

- `dispatch_client.py` 必须与输入源文件字节完全一致。
- `release_notes.md` 必须与输入源文件字节完全一致。
- `manifest_copy.csv` 必须与完整的原始 `/tmp/release/manifest.csv` 字节完全一致。
- 仅仅内容“意思一样”不够；改换行、改注释、重排 CSV 或过滤 CSV 都会使内容比较失败。

### 4.3 最直接的目标结构

```text
ready_release.zip
├── dispatch_client.py
├── release_notes.md
└── manifest_copy.csv
```

## 5. 常见失败与配置边界

- 直接把 `/tmp/release/files` 整目录压缩：会多出 draft/legacy，且可能带 `files/` 前缀，失败。
- 只检查 extension，把 release_notes_draft.md 也打包：成员集合失败。
- 将 manifest 命名为 `manifest.csv`：成员名不符。
- 自己重写一个内容相同但格式不同的 manifest_copy.csv：字节内容比较失败。

Instruction 中 “Exclude obsolete and draft rows” 容易被理解成“从 manifest_copy.csv 删除 obsolete 行”，但 evaluator 明确要求 `manifest_copy.csv` 是完整原始 manifest 的逐字节副本，因此两条 obsolete/AP-LEGACY 行仍必须留在这个副本中；实际被排除的是它们对应的 archive 文件。若把 manifest 副本过滤成只剩两条 required 行，反而失败。

另一个非执行性问题是 task metadata 的 `linux_source_paths` 仍写着旧占位名 `app.bin`、`notes.md`、`draft.txt`，与真实 setup 不一致。Runner 的实际上传和 evaluator 使用的是本篇列出的四个真实文件，所以当前执行不受该 metadata 陈旧项影响。

## 6. Cleanup

- Linux 删除 manifest、ready_release.zip 及四个候选文件，并尝试删除空目录。
- 手机清空 SMS。
