# Core 190 — `linux_only_331`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 190 项
- 任务文件：`tasks/cross_device/linux_only/linux_only_331.json`
- 运行配置：`configs/cross_device/local_2linux.json`
- 难度：medium
- 设备拓扑：2L（`linux_0`、`linux_1`）
- 限制：最多 40 步、300 秒

## 0. 任务链与直白结论

第一台 Linux 的 VLC 实际正在循环播放：

```text
evening_breeze_demo.wav
```

第二台机器的请求却期望：

```text
evening_breeze.wav
```

两者 basename 不同，所以不能写 confirmed，必须在原 Markdown 最后追加一行精确的 mismatch 状态，同时不能改变第一台机器的播放。最终追加行是：

```text
Playback status: mismatch — requested M-200 (evening_breeze.wav); VLC is playing evening_breeze_demo.wav
```

## 1. Instruction

### 英文原文（逐字）

```text
Observe the filename currently playing in VLC on the first Linux machine without changing playback. On the second, preserve `/home/user/notes/play_request.md` and append one final status line using the matching confirmation or mismatch form described in the request and the observed basename.
```

### 中文翻译

请观察第一台 Linux 机器上 VLC 当前正在播放的文件名，不要改变播放。在第二台机器上保留 `/home/user/notes/play_request.md` 的原有内容，并按照请求中描述的匹配确认或不匹配格式，使用观察到的 basename 在最后追加一行状态。

## 2. 输入、附件与实际初始状态

### 2.1 `linux_1`：`play_request.md`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_331/source/play_request.md`
- 注入路径：`/home/user/notes/play_request.md`
- 完整原文：

```markdown
## Playback Request
Requested by: ops@example.test
file_id: M-200
requested_filename: evening_breeze.wav
Append exactly one final line. If VLC plays the requested file, use `Playback status: confirmed — VLC is playing M-200 (evening_breeze.wav)`. Otherwise use `Playback status: mismatch — requested M-200 (evening_breeze.wav); VLC is playing <actual_filename>`.
Do not start or change playback.
```

注意两种分支的格式已在文件中逐字给出，包含反引号、Unicode 长破折号 `—`、括号、分号和句点。

### 2.2 `linux_0`：`evening_breeze_demo.wav`

- 仓库文件：`tasks/cross_device/linux_only_assets/linux_only_331/source/evening_breeze_demo.wav`
- 注入路径：`/home/user/media/evening_breeze_demo.wav`
- 文件大小：220,544 字节；
- 时长：5.000 秒；
- 编码：Microsoft PCM / `pcm_s16le`；
- 采样规格：16-bit、单声道、22050 Hz；
- 任务用途：由 Setup 启动的 VLC 循环播放。Evaluator 关心播放状态和精确路径，不分析音频语义或声音内容。

### 2.3 仓库中存在但本题没有注入的旧状态附件

资产目录还包含 `source/vlc_playback_state.json`：

```json
{"current_filename": "evening_breeze_demo.mp3", "duration_seconds": 205, "state": "playing", "anchors": ["evening_breeze_demo.mp3", "playing", "205"]}
```

它没有出现在 task 的任何 `upload_file` setup 中，运行时不会放到两台 Linux 上，而且内容还是旧的 `.mp3`/205 秒模拟状态。当前任务已经改用真实 WAV 与实时 VLC getter；不能根据这个未注入 JSON 写 `evening_breeze_demo.mp3`。

## 3. Setup 具体流程

### `linux_0`

1. 创建 `/home/user/media` 和 `/home/user/.cache/mdcbench`；
2. 执行 `pkill -x vlc`，停止可能遗留的 VLC；
3. 删除旧 WAV 和旧日志；
4. 上传 `evening_breeze_demo.wav`；
5. 后台启动：

```text
vlc --intf dummy --extraintf http --http-port 8080 --http-password password --loop /home/user/media/evening_breeze_demo.wav
```

6. stdout/stderr 写入 `/home/user/.cache/mdcbench/vlc_331.log`；
7. 等待 3 秒让播放和 HTTP 状态接口启动。

### `linux_1`

1. 创建 `/home/user/notes`；
2. 删除并上传原始 `play_request.md`。

## 4. 正确输出的完整文件

最终 `/home/user/notes/play_request.md` 应为：

```markdown
## Playback Request
Requested by: ops@example.test
file_id: M-200
requested_filename: evening_breeze.wav
Append exactly one final line. If VLC plays the requested file, use `Playback status: confirmed — VLC is playing M-200 (evening_breeze.wav)`. Otherwise use `Playback status: mismatch — requested M-200 (evening_breeze.wav); VLC is playing <actual_filename>`.
Do not start or change playback.
Playback status: mismatch — requested M-200 (evening_breeze.wav); VLC is playing evening_breeze_demo.wav
```

必须使用观察到的 basename `evening_breeze_demo.wav`，不是完整路径，也不是请求名，更不是旧 JSON 中的 `.mp3`。

## 5. Evaluator：评测方式与具体评测点

本题有 1 个计分 evaluator 和 1 个不计分硬保护 evaluator。

### 5.1 Markdown 是整份文件绝对匹配

Evaluator 在 `linux_1` 执行：

```text
cat /home/user/notes/play_request.md 2>/dev/null || echo missing
```

命令 getter 会只去掉输出末尾连续的 `\r`/`\n`，然后 OSWorld `exact_match` 使用 Python `==` 与 task JSON 中的完整期望字符串比较。

因此：

- 原来的 6 行必须逐字保留；
- 第 7 行必须逐字符等于 mismatch 行；
- 大小写、空格、反引号、冒号、分号、括号和 `—` 都敏感；
- 不能加标题、解释、时间戳或第二条状态；
- 文件末尾有无一个换行不影响结果；即使有多个纯尾随换行，也会被 getter 去掉；
- 但正文中间多空行、额外空格或额外文本都会影响绝对相等。

使用 ASCII 连字符 `-` 或两个减号 `--` 代替 Unicode `—` 会失败。

### 5.2 VLC getter 检查最终仍在播放精确文件

不计分 evaluator 在 `linux_0` 使用：

```text
type: vlc_playing_file
expected_file: /home/user/media/evening_breeze_demo.wav
```

正常情况下它访问 VLC HTTP `status.xml`：

1. `<state>` 必须是 `playing`；
2. 从 meta 中读取 URI/location；若 status 没给精确 URI，则读取 playlist 当前 leaf；
3. 所有非空来源值都必须规范化为同一个精确本地路径 `/home/user/media/evening_breeze_demo.wav`；
4. 不能只靠窗口标题或 basename 猜测，因为相同 basename 在其他目录不能建立精确路径。

HTTP 不可用时才回退到 playerctl/process observation。Task 配了 `retries=3`、`retry_delay_s=1`；但默认 `retry_on_observed_false=false`，如果健康 HTTP 接口明确返回 wrong file/not playing，通常会直接判 false，而不会把明确错误当临时状态重复等待。

### 5.3 该 VLC 项虽然不计分，却是硬 guard

`enable_score_calc=false` 只表示它不进入平均分，不表示可以忽略。全局逻辑规定：任一不计分 evaluator 失败，最终 score 直接置 0，并且 `success=false`。

所以：

- Markdown 完全正确但 VLC 被停止：0 分；
- Markdown 完全正确但改播 requested 文件：0 分；
- VLC 正确但 Markdown 有一个字符差异：计分项失败，整体失败。

### 5.4 “不改变播放”的当前可观测边界

Evaluator 只检查评测时刻的最终播放状态和路径。它不能证明整个任务期间从未暂停、跳转、重启或先改播再改回。

因此当前 guard 能证明的是“最后仍由 VLC 播放预期 demo WAV”，不能证明完整历史。Instruction 明确要求不改变播放，正确做法是只观察状态，不操作播放控件。

## 6. 当前 evaluator 没检查什么

- 不分析 WAV 声音内容、波形或文件正文；
- 不检查 Markdown 是用何种编辑器修改；
- 不使用旧 `vlc_playback_state.json`；
- 不检查播放位置、循环次数、音量或静音状态；
- 不记录完整播放历史；
- 不检查请求者邮箱是否真实，只要求原文件绝对保留。

## 7. 常见失败示例

- 写 confirmed：请求 basename 与实际 basename 不同，应走 mismatch。
- 写 `evening_breeze_demo.mp3`：这是未注入旧 JSON 的干扰值。
- 写完整路径 `/home/user/media/evening_breeze_demo.wav`：模板要求 `<actual_filename>`，期望只用 basename。
- 使用普通短横线代替 `—`：整文件精确匹配失败。
- 为了观察而打开另一个文件或重启 VLC：可能让硬 guard 失败，也违反 instruction。
- 保留原文但追加两个状态行：不是“exactly one final line”，绝对匹配失败。

## 8. Cleanup

- `linux_0` 停止 VLC，并删除 WAV 与 VLC 日志；
- `linux_1` 删除 `play_request.md`。

