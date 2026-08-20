# Core 169 — android_only_260

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 169 项
- 任务文件：`tasks/cross_device/android_only/android_only_260.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：easy
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机 CSV 要求在第二台手机创建名为 `Road Survey` 的 Retro Music 播放列表，成员正好是：

- `north_loop`；
- `bridge_check`；
- `gate_exit`。

不能少歌、多歌或重复歌曲。当前 evaluator 不要求这三首在特定顺序中。

## 1. Instruction

### 英文原文（逐字）

~~~text
The playlist manifest on the first phone is the source for creation. Create the Road Survey playlist in Retro Music on the second phone with only the songs listed in the manifest.
~~~

### 中文翻译

第一台手机上的播放列表清单是创建依据。请在第二台手机的 Retro Music 中创建 Road Survey 播放列表，并且其中只能包含清单列出的歌曲。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。CSV 和三份 setup 合成的 MP3 是输入；Retro Music 播放列表是输出。

### 2.1 android_0：`road_survey_playlist.csv`

上传路径：

~~~text
/sdcard/Download/road_survey_playlist.csv
~~~

文件原文：

~~~csv
playlist,song
Road Survey,north_loop
Road Survey,bridge_check
Road Survey,gate_exit
~~~

三行都属于同一个 `Road Survey` 播放列表。

### 2.2 android_1：音乐库

Setup 生成并放入 `/sdcard/Music`：

| 文件 | Retro Music title |
|---|---|
| `north_loop.mp3` | north_loop |
| `bridge_check.mp3` | bridge_check |
| `gate_exit.mp3` | gate_exit |

`androidworld_mp3_push` 默认生成约 60 秒的可扫描 MP3，ID3 title 使用传入 song 字符串；artist 是 fixture 随机值，不参与本任务。Evaluator 比较播放列表中的 title，不比较音频字节或 artist。

### 2.3 Retro Music 初态

Setup 先删除三份旧文件并执行 `androidworld_retro_music_clear`，再推送三首歌。因此开始时有可选歌曲，但没有已经完成的 Road Survey 结果播放列表。

## 3. Setup 具体流程

### android_0

1. 确保 Android Files 可用；
2. 上传 `road_survey_playlist.csv` 到 Download。

### android_1

1. 确保 Retro Music 可用；
2. 删除三份同名旧 MP3；
3. 清理 Retro Music 的任务媒体/播放列表状态；
4. 合成并推送 `north_loop`、`bridge_check`、`gate_exit`；
5. 扫描 Music 目录，使 Retro Music 能读取它们。

## 4. 正确输出

在 android_1 的 Retro Music 创建：

| 字段 | 正确值 |
|---|---|
| playlist name | Road Survey |
| songs | north_loop、bridge_check、gate_exit，各一次 |

Oracle 使用 `androidworld_retro_playlist_add`，按 CSV 行顺序加入三首；人工操作不必依赖该内部 setup action。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

只有 1 个 `retro_music_playlist` evaluator。它读取 Retro Music 的 `playlist.db`，找到目标播放列表并核对歌曲 title 的精确多重集合。

### 5.1 播放列表名称

名称按大小写不敏感、连续空白折叠后与 `Road Survey` 比较：

- 必须恰好有一个规范化名称匹配的播放列表；
- 两个都叫 Road Survey 的重复播放列表会失败；
- `allow_unrelated` 没有设为 false，因而其他不同名称的播放列表可以存在。

### 5.2 歌曲成员：精确多重集合

预期 title：

~~~text
north_loop
bridge_check
gate_exit
~~~

成员比较也会忽略大小写和多余连续空白，但使用 Counter 比较，因此：

- 三首各一次：通过；
- 少一首：失败；
- 多一首清单外歌曲：失败；
- 某首重复两次：失败。

Task JSON 还写了 `track_count: 3`，但当前 `get_retro_music_playlist` 实现并不单独读取这个字段。这里仍然必须正好 3 首，因为 `expected_songs` 的精确多重集合本身已经强制了数量。

### 5.3 顺序是否检查

`order_sensitive` 未设置，所以 getter 走无序 Counter 比较。三首歌的排列顺序不会影响通过。

这和“only the songs listed”一致：成员必须精确，但 instruction 没要求 CSV 顺序。

### 5.4 当前 evaluator 没有检查什么

- 不检查 CSV 最终是否仍存在；
- 不检查三份 MP3 文件名或字节，只从 Retro Music 数据库读取 playlist song title；
- 不检查播放列表封面、描述或播放状态；
- 不拒绝其他不同名播放列表；
- 不检查歌曲顺序。

## 6. 常见失败与真实评测边界

- 播放列表命名为 `Road survey list`：名称不匹配，失败。
- 把三首加入 Library 但不创建播放列表：失败。
- 加入清单三首再多加一首：精确多重集合失败。
- 三首顺序与 CSV 不同：当前 evaluator 仍通过。
- 创建两个同名 Road Survey：名称匹配不唯一，失败。

## 7. Cleanup

- android_0 删除 `road_survey_playlist.csv`；
- android_1 清理 Retro Music；
- android_1 删除三份 MP3。
