# Core 170 — android_only_285

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 170 项
- 任务文件：`tasks/cross_device/android_only/android_only_285.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：hard
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机清单列出三份待导出 MP3。第二台手机源 Music 目录中：

- `north_loop.mp3` 存在：复制到 Export，并报告 copied；
- `bridge_check.mp3` 存在：复制到 Export，并报告 copied；
- `missing_song.mp3` 缺失：不要创建，报告 missing；
- `unlisted.mp3` 虽然存在，但不在清单中：绝对不要导出，也不要写进报告。

还要在 Markor 创建精确名为 `Music export report.md` 的报告。

## 1. Instruction

### 英文原文（逐字）

~~~text
`music_export_manifest.csv` on the first phone lists the MP3 files to export. On the second phone, copy each listed song that exists into the Music/Export folder. Leave a `Music export report` note in Markor for the audio producer that identifies every listed file as copied or missing. Do not export files that are absent from the manifest.
~~~

### 中文翻译

第一台手机上的 `music_export_manifest.csv` 列出了要导出的 MP3 文件。在第二台手机上，把清单中实际存在的每首歌复制到 Music/Export 文件夹。然后在 Markor 中给音频制作人留下一份 `Music export report` 笔记，把清单中的每个文件标明为“已复制”或“缺失”。不要导出清单中没有的文件。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件。CSV 与第二台手机 Music 中的音频文件是输入；Export 中的副本和 Markor 报告是两个联合输出。

### 2.1 android_0：`music_export_manifest.csv`

上传路径：

~~~text
/sdcard/Download/music_export_manifest.csv
~~~

文件原文：

~~~csv
song
north_loop.mp3
bridge_check.mp3
missing_song.mp3
~~~

`unlisted.mp3` 不在清单中。

### 2.2 android_1：源 Music 文件

Setup 生成：

| 源路径 | 初始状态 | 是否在清单 |
|---|---|---|
| `/sdcard/Music/north_loop.mp3` | 存在 | 是 |
| `/sdcard/Music/bridge_check.mp3` | 存在 | 是 |
| `/sdcard/Music/unlisted.mp3` | 存在 | 否 |
| `/sdcard/Music/missing_song.mp3` | 缺失 | 是 |

三份现有文件由 `androidworld_mp3_push` 合成，默认约 60 秒，title 分别为 `north_loop`、`bridge_check`、`unlisted`。本任务关心源/副本字节一致性，不关心音频说了什么。

### 2.3 android_1：Export 和 Markor 初态

Setup 创建 `/sdcard/Music/Export`，并删除以下可能残留的结果：

- Export 下的 `north_loop.mp3`、`bridge_check.mp3`、`missing_song.mp3`、`unlisted.mp3`；
- `/storage/emulated/0/Documents/Markor/Music export report.md`。

## 3. Setup 具体流程

### android_0

1. 确保 Android Files 和 Markor 可用；
2. 上传 `music_export_manifest.csv` 到 Download。

### android_1

1. 确保 Android Files 可用；
2. 创建 Export 目录；
3. 删除任务相关源文件、旧导出文件、旧报告和对应媒体索引；
4. 合成并推送 `north_loop.mp3`、`bridge_check.mp3`、`unlisted.mp3`；
5. 不创建 `missing_song.mp3`。

## 4. 正确输出

### 4.1 Export 文件

最终要求：

| Export 路径 | 正确状态 |
|---|---|
| `/sdcard/Music/Export/north_loop.mp3` | 存在，且与源 north_loop 逐字节相同 |
| `/sdcard/Music/Export/bridge_check.mp3` | 存在，且与源 bridge_check 逐字节相同 |
| `/sdcard/Music/Export/missing_song.mp3` | 不存在 |
| `/sdcard/Music/Export/unlisted.mp3` | 不存在 |

应执行“复制”而非移动，因为 evaluator 还要读取两个源文件做 `cmp`。

### 4.2 Markor 报告

精确路径：

~~~text
/storage/emulated/0/Documents/Markor/Music export report.md
~~~

Oracle 内容：

~~~text
north_loop.mp3: copied
bridge_check.mp3: copied
missing_song.mp3: missing
~~~

不要在报告中提 `unlisted.mp3`；报告只应覆盖清单项目。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

有 2 个 evaluator，必须同时通过：

1. shell 检查两个 byte-identical 副本，以及两个不得存在的导出文件；
2. Markor 报告对三个清单项给出正确 copied/missing 关系。

### 5.1 文件导出 shell 检查

Evaluator 依次执行等价检查：

~~~sh
cmp -s /sdcard/Music/north_loop.mp3 /sdcard/Music/Export/north_loop.mp3
cmp -s /sdcard/Music/bridge_check.mp3 /sdcard/Music/Export/bridge_check.mp3
test ! -e /sdcard/Music/Export/missing_song.mp3
test ! -e /sdcard/Music/Export/unlisted.mp3
~~~

四项全部成立才输出 `present`。因此：

- 两个副本必须存在且与各自源文件逐字节相同；
- 源文件也必须保留，否则 `cmp` 失败；
- 不能用同名空文件或重新编码版本代替复制；
- missing 和 unlisted 两个 Export 路径必须完全不存在。

这个 shell 不是 Export 整个目录的精确库存检查：它没有枚举其他任意文件名。Instruction 仍明确禁止导出清单外文件，正确结果只应包含两份副本。

### 5.2 报告的三个实体

`unique_entities=true` 要求以下文件名各匹配一次：

- `north_loop.mp3`；
- `bridge_check.mp3`；
- `missing_song.mp3`。

任何其他匹配 `*.mp3` 的文件名都会被 `reject_unlisted_entity_pattern` 拒绝。这也是报告里不能写 `unlisted.mp3 was not exported` 的原因：虽然这句话业务上为真，但它加入了 evaluator 未允许的 MP3 实体。

### 5.3 三条状态关系

每个 relation group 都必须在一个 clause 中成立，且默认只匹配一个 clause：

- `north_loop.mp3` + `copied` 或 `exported`；
- `bridge_check.mp3` + `copied` 或 `exported`；
- `missing_song.mp3` + `missing`、`absent` 或 `not found`。

前两项不能出现 `not copied`/`not exported`；missing 项不能说 `present`/`exists`。全文还不得出现 `is present`、`exists`、`cancelled`、`withdrawn` 等冲突表达。

问句、不确定、否定正确结果或后文撤销也会失败。每个文件单独一行最稳。

### 5.4 当前 evaluator 没有检查什么

- 不检查源 MP3 的音频格式、时长或 ID3，只用 `cmp` 比较源和副本；
- 不检查 Export 中除四个点名路径外的其他文件；
- 不检查 CSV 最终是否仍存在；
- 不要求报告逐字等于 oracle或包含 audio producer 姓名；
- 不要求给任何人发送短信或邮件；
- 不要求 MediaStore/Retro Music 已扫描 Export 副本。

## 6. 常见失败与真实评测边界

- 把源文件移动进 Export：源路径消失，`cmp` 失败。
- 新建同名空文件作为“导出”：与源不相同，失败。
- 为 `missing_song.mp3` 创建占位文件：文件检查与报告语义都会冲突。
- 导出 `unlisted.mp3`：shell 检查失败。
- 报告补充 `unlisted.mp3: not exported`：未列出实体检测失败。
- 两个文件正确复制，但没做 Markor 报告：第二个 evaluator 失败。

## 7. Cleanup

- android_0 删除 `music_export_manifest.csv`；
- android_1 删除三份任务源 MP3；
- android_1 删除四个任务相关 Export 路径，并在可行时移除 Export 目录；
- android_1 删除 `Music export report.md` 和相关 MediaStore 项。
