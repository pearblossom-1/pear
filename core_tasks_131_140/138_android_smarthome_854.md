# Core 138 — android_smarthome_854

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 138 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_854.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

Files 中请求的是精确 playlist `Evening Wind Down Kids`。Retro Music 里只有很像但不相同的 `Evening Wind Down`。规则明确禁止 substitution，所以正确行为是：

- 不使用 near-match；
- 不创建任何 Home schedule 或 workflow；
- 不改变 kids-room light；
- 在 Tasks 创建标题精确为 `Missing playlist result` 的任务，notes 写明精确 playlist 缺失且没有安排 routine。

## 1. Instruction

### 英文原文（逐字）

~~~text
`playlist_manifest.csv` in the Android Files app requires an exact Retro Music playlist. Check the requested name, do not substitute the available near-match, and create a Tasks item titled `Missing playlist result` that records the requested playlist and the fact that the exact playlist is missing and no routine was scheduled.
~~~

### 中文翻译

Android Files app 中的 `playlist_manifest.csv` 要求一个精确名称的 Retro Music playlist。核对请求名称，不要用现有的近似名称替代；创建标题为 `Missing playlist result` 的 Tasks item，记录被请求的 playlist，并说明精确 playlist 缺失、没有安排 routine。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件或图片附件。

### 2.1 playlist_manifest.csv 的完整内容

文件路径：`/storage/emulated/0/Download/home/playlist_manifest.csv`。

| scene | requested_playlist | available_decoy | rule |
|---|---|---|---|
| Nursery winddown | Evening Wind Down Kids | Evening Wind Down | no substitution when exact playlist is missing |

请求名与 decoy 只差 `Kids`，但 evaluator 把它们视为不同 playlist。

### 2.2 Retro Music 初始音乐

Setup 动态生成并推送两首可由 Retro Music 扫描的 MP3：

| 标题 | Android 文件 | 默认时长 |
|---|---|---:|
| Blue Hall | `/sdcard/Music/Blue Hall.mp3` | 60 秒 |
| Soft Landing | `/sdcard/Music/Soft Landing.mp3` | 60 秒 |

这些 MP3 不是该任务资产目录中预先存放的独立音频附件；`androidworld_mp3_push` 在 setup 时合成/复制音乐长度 fixture，并设置曲名后推送。

Retro Music 随后创建：

~~~text
Playlist: Evening Wind Down
Tracks:
Blue Hall
Soft Landing
~~~

资产目录中的 `retro/Evening Wind Down.txt` 也正好是这两行曲目名，但 task setup 不把该 TXT 上传到 Files；用户可见的依据是 Retro Music 中的实际 near-match playlist。

### 2.3 Tasks 与 Home 初始状态

- Tasks 在 setup 时被清空；
- Home 当前时间是 2026-06-16 19:00；
- `kids_room_dimmable_light_1` 初始为 power=off、brightness_pct=0；
- Home 初始 schedules=0、workflows=0、history 为空。

## 3. Setup 具体流程

### android_0

1. 确保 Retro Music 可用并清空其音乐状态。
2. 动态推送 `Blue Hall`、`Soft Landing` 两首 MP3。
3. 创建 near-match playlist `Evening Wind Down`，包含这两首歌。
4. 确保 Files 可用。
5. 上传 manifest 到 `/storage/emulated/0/Download/home/playlist_manifest.csv`。
6. 确保 Tasks 可用并清空 Tasks。

### home_0

使用 `android_smarthome_854/episode_config.json` reset Home。

Setup 不会创建 `Evening Wind Down Kids`，也不会预置结果 task 或 Home routine。

## 4. 正确输出

只在 Tasks 创建一项。Oracle 示例：

| 字段 | 内容 |
|---|---|
| title | Missing playlist result |
| notes | Evening Wind Down Kids was unavailable, so I left the routine unscheduled. |

Home 不执行任何 action，也不创建 schedule/workflow。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

四项都必须成功：

1. Tasks item；
2. schedule 总数为 0；
3. workflow 总数为 0；
4. kids-room light 保持初始状态的 hard guard。

### 5.1 Tasks 标题

Evaluator 查找 title 为 `Missing playlist result` 的 task。Title 使用 NFC/空白规范化后的相等比较，默认区分大小写；不是 title 包含关键词即可。

例如 `missing playlist result` 或 `Missing playlist results` 都不匹配。规则没有要求恰好只有一个同名 task，只要至少有一个完整匹配项。

### 5.2 Tasks notes 的语义条件

Notes 必须：

1. 包含 `Evening Wind Down Kids`；
2. 从以下组中至少选一个表达缺失：
   - missing
   - not found
   - could not be found
   - unavailable
   - absent
3. 从以下组中至少选一个表达没有创建 routine：
   - no routine was scheduled
   - routine was not scheduled
   - did not schedule a routine
   - nothing was scheduled
   - left the routine unscheduled
   - no schedule was created

`not found` 和 `could not be found` 被配置为允许的 negative-capability 表达，不会因为含 `not` 被通用否定规则误杀。

不能出现：

- `exact playlist is available`
- `exact playlist was found`
- `substituted Evening Wind Down`
- `used Evening Wind Down instead`
- `routine was scheduled`
- `scheduled the routine`

Notes 不是全文精确匹配，可以自然改写，但问句、不确定、撤销或自相矛盾语义会失败。

### 5.3 schedule/workflow 必须一条都没有

两项 count evaluator 都是 `count=0, match={}`，因此统计所有 record，不只 active record。即使创建后再取消，列表里仍有 cancelled/completed 记录，也不再是 0。

### 5.4 kids-room light guard

`kids_room_dimmable_light_1` 的最终字段必须是：

- power=off；
- brightness_pct=0。

该项 `enable_score_calc=false`，但失败仍会把总分置为 0。

### 5.5 没有检查的内容

- 不检查 Retro Music 的 decoy playlist 是否仍存在；
- 不检查音乐播放队列；
- 不检查 Home command-history 数量；
- 不检查 Tasks 的 due date、completed 或 importance；
- 不要求 notes 与 Oracle 逐字相同。

## 6. 常见失败与真实评测边界

- 看到 near-match 就直接用 `Evening Wind Down`：notes 冲突，且若创建 routine，count 也失败。
- 创建 routine 后取消：schedule/workflow 总记录数不再是 0，失败。
- Notes 只写“missing”，没写精确请求名或“没有 schedule”：失败。
- 标题大小写不一致：失败。
- 不创建 Home routine、但把 kids-room light 直接打开：hard guard 失败。

## 7. Cleanup

- android_0 清空 Retro Music、删除 playlist_manifest.csv、清空 Tasks。
- home_0 reset。

