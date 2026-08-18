# Core 019 — `a2l2_vscode_web_music_final_gate`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 19 项
- 任务文件：`tasks/cross_device/real300/a2l2_vscode_web_music_final_gate.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 50 步，最长 300 秒

## 1. Instruction

### 英文原文（逐字）

```text
Prepare the launch validator for the staging kiosk. The first phone's Markor note `Launch checklist` contains the approved operations checklist, and the second phone's Retro Music playlist `Launch audio` contains the approved audio cues. In the VSCode project on the first Linux machine, fix `/tmp/launch/validator.html` so it accepts exactly those two lists; missing, substituted, duplicated, extra, or non-list values must fail. Copy the corrected page to `/home/user/launch/validator.html` on the second Linux machine, open that copy in Chrome, and use it to confirm the approved lists pass.
```

### 中文翻译

请为预发布 kiosk 准备 launch validator。第一部手机的 Markor 笔记 `Launch checklist` 包含已批准的操作检查清单，第二部手机的 Retro Music 播放列表 `Launch audio` 包含已批准的音频提示。在第一台 Linux 机器的 VSCode 项目中修复 `/tmp/launch/validator.html`，使它只接受这两份准确列表；缺项、替换项、重复项、额外项或非列表值都必须失败。把修正后的页面复制到第二台 Linux 机器的 `/home/user/launch/validator.html`，在 Chrome 中打开该副本，并用它确认已批准列表能够通过。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的 Markor 清单

```markdown
# Launch checklist

- copy approved
- test suite passed
- handoff owner assigned
```

规范清单成员为：

```text
copy approved
test suite passed
handoff owner assigned
```

### 2.2 第二部手机的 Retro Music 播放列表

- 播放列表名：`Launch audio`
- 按 setup 顺序包含：

```text
launch_intro
safety_brief
handoff_cue
```

### 2.3 第一台 Linux 的代码附件

`README.md` 明确要求函数：

```text
evaluateLaunchGate(checklist, playlistTracks)
```

返回对象必须包含：

- `checklistReady`：仅当 checklist 与批准清单成员完全相同时为 `true`。
- `audioReady`：仅当 playlistTracks 与批准音轨成员完全相同时为 `true`。
- `launch_passed`：仅当前两项都为 `true` 时为 `true`。

初始 `validator.html` 的错误实现只检查两个数组的长度是否为 3，而且把 `launch_passed` 永远写成 `false`：

```javascript
function evaluateLaunchGate(checklist, playlistTracks) {
  const checklistReady = Array.isArray(checklist) && checklist.length === 3;
  const audioReady = Array.isArray(playlistTracks) && playlistTracks.length === 3;
  return { checklistReady, audioReady, launch_passed: false };
}
```

页面还提供两块 textarea 和 Validate 按钮，用于人工输入一行一个项目并显示 JSON 结果。

## 3. Setup 具体流程

### `android_0`

写入上述 `Launch checklist.md`。

### `android_1`

1. 清理同名媒体和 Retro Music 状态。
2. 注入三首 MP3。
3. 创建 `Launch audio` 播放列表并加入三首歌。
4. 打开 Retro Music。

### `linux_0`

1. 重建 `/tmp/launch`。
2. 上传 `README.md` 和有缺陷的 `validator.html`。

### `linux_1`

删除并重建 `/home/user/launch`。这里初始没有 validator；必须把第一台 Linux 修好的文件复制过来。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个 evaluator，各占 `1/2`。

### 4.0 先说人话：怎样才算通过

第二台 Linux 的最终文件中，`evaluateLaunchGate` 必须真正比较“准确成员集合”，而不是只看长度。批准列表即使换顺序也应通过；少一个、改一个、重复一个、多一个或传入非数组都必须返回相应的 false。

完成后必须在第二台 Linux 的 Chrome 打开：

```text
file:///home/user/launch/validator.html
```

仅修第一台 Linux 的源文件、不复制，或者复制后未在 Chrome 打开，都不能完整通过。

### 4.1 持久化文件行为测试（权重 `1/2`）

- `result.type`：`chrome_persisted_file_cases`
- evaluator 从磁盘上的第二台 Linux 文件启动多个全新、隔离的浏览器上下文，并直接调用全局函数 `evaluateLaunchGate`。
- 它不是只测一个正确样例，而是每次运行随机排列一批行为用例，包括：
  - 正确列表及重排后的正确列表；
  - 每个位置分别缺失；
  - 每个位置被不可预测的近似字符串替换；
  - 不同重叠数量的部分正确列表；
  - 单字符插入、删除、换位、多处变化和不同长度的近似值；
  - 重复成员、额外成员；
  - 字符串、对象、`null`、空数组等非合格输入。
- 成员比较是集合意义上的顺序不敏感，但要求数组长度准确、成员唯一、集合完全相等。
- 返回对象的 `checklistReady`、`audioReady`、`launch_passed` 必须是实际布尔值，并与每个测试用例的真值一致。函数缺失、抛异常或任一用例错误即返回 `fail`。

### 4.2 Chrome 标签页（权重 `1/2`）

- `func`：`is_expected_tabs`
- 默认空白页和新标签页会被忽略。
- 评测目标 URL 是第二台 Linux 的 `file:///home/user/launch/validator.html`。
- 最稳妥做法是只保留这个非默认标签页，避免其他业务标签影响标签列表匹配。
- evaluator 不读取 textarea 中最后显示的人工结果；真正的函数行为由上一项自动用例验证。

