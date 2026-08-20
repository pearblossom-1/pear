# Core 161 — android_only_267

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 161 项
- 任务文件：`tasks/cross_device/android_only/android_only_267.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 难度：medium
- 设备拓扑：2A（`android_0`、`android_1`）
- 限制：最多 50 步、300 秒

## 0. 任务链与直白结论

第一台手机的 CSV 清单列出三份应有录音：`brief_a.mp3`、`brief_b.mp3`、`brief_c.mp3`。第二台手机的 `Recordings` 文件夹实际上只有前两份，因此结果是“2 份录音存在，`brief_c.mp3` 缺失”。

需要从第二台手机给联系人 `Status Contact`（号码 `5550267`）发一条短信。最稳妥的正文是：

~~~text
audio_manifest.csv: 2 recordings are present; brief_c.mp3 is missing.
~~~

不要在结果短信里顺手列出 `brief_a.mp3` 或 `brief_b.mp3`；evaluator 的未列出 MP3 检测只把 `brief_c.mp3` 作为允许出现在短信中的 MP3 文件名。

## 1. Instruction

### 英文原文（逐字）

~~~text
The first phone's `audio_manifest.csv` is the recording checklist. Check the Recordings folder on the second phone, then text Status Contact from that phone with the checklist name, the number of listed recordings present, and any missing filename.
~~~

### 中文翻译

第一台手机上的 `audio_manifest.csv` 是录音检查清单。检查第二台手机上的 Recordings 文件夹，然后从第二台手机给 Status Contact 发短信，短信中写明清单名称、清单中实际存在的录音数量，以及任何缺失的文件名。

## 2. 输入、附件与初始业务数据

本任务没有邮件，也没有预置的业务短信。CSV、第二台手机上的录音文件和联系人是输入；新发送的短信是唯一输出。

### 2.1 android_0：`audio_manifest.csv`

上传后的路径：

~~~text
/sdcard/Download/audio_manifest.csv
~~~

文件原文：

~~~csv
file
brief_a.mp3
brief_b.mp3
brief_c.mp3
~~~

即清单共有 3 个 MP3 文件名。

### 2.2 android_1：Recordings 文件夹

Setup 先删除这三个同名文件及对应媒体索引，再生成并放入：

| 路径 | 初始状态 | 说明 |
|---|---|---|
| `/sdcard/Recordings/brief_a.mp3` | 存在 | 由 `androidworld_mp3_push` 合成后从 Music 移入 |
| `/sdcard/Recordings/brief_b.mp3` | 存在 | 同上 |
| `/sdcard/Recordings/brief_c.mp3` | 缺失 | Setup 不生成它 |

`androidworld_mp3_push` 默认生成约 60 秒的可扫描 MP3 fixture，标题使用文件名去掉扩展名后的字符串；具体声学内容和随机 artist 不是本任务业务数据，也不被 evaluator 检查。

### 2.3 android_1：联系人和短信初态

Contacts 会被清空后加入：

| name | number | notes |
|---|---|---|
| Status Contact | 5550267 | Receives recording status. |

Simple SMS Messenger 的短信数据会被清空，所以 Setup 本身不会留下可误判成结果的 sent SMS。

## 3. Setup 具体流程

### android_0

1. 确保 Android Files 可用；
2. 把仓库中的 `audio_manifest.csv` 上传到 Download 根目录。

### android_1

1. 确保 Android Files 可用，并创建 `/sdcard/Recordings`；
2. 删除 `brief_a.mp3`、`brief_b.mp3`、`brief_c.mp3` 及其旧 MediaStore 记录；
3. 合成 `brief_a.mp3` 和 `brief_b.mp3`，从 `/sdcard/Music` 移到 `/sdcard/Recordings`；
4. 对两份现有文件发送媒体扫描广播；
5. 清空 Contacts，创建 Status Contact；
6. 清空 SMS。

## 4. 正确输出

从 android_1 向 `5550267` 发送短信。Oracle 正文为：

~~~text
audio_manifest.csv: 2 recordings are present; brief_c.mp3 is missing.
~~~

可以改写，但应保持两个清晰分句：

- 一个分句把 `audio_manifest.csv`、`2 recordings` 和 `present` 关联起来；
- 另一个分句把 `brief_c.mp3` 和 `missing` 关联起来。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

只有 1 个 evaluator：在 android_1 的 sent box 中找到至少一条收件人、时间和正文都符合规则的短信。

### 5.1 发送位置、收件人和时间

- 必须是 android_1 发出的消息，不是 android_0；
- 必须位于 sent box；
- address 必须对应 `5550267`；
- 必须是最近 30 分钟内发送；
- 不要求 sent box 恰好只有一条消息，也不要求全局只发送一次。

电话号码比较会清理常见格式字符，所以空格或连字符不会改变号码身份。

### 5.2 正文不是整句绝对匹配

正文按大小写不敏感的词边界语义规则检查，必须各出现一次：

- `audio_manifest.csv`；
- `2 recordings` 或 `two recordings`；
- `brief_c.mp3`。

`unique_entities=true` 表示上述三个顶层实体组都必须恰好匹配一次。重复抄写清单名、数量或缺失文件名会失败。

还必须有：

- `present` 或 `available`；
- `missing`、`absent` 或 `not found`。

### 5.3 两个关系必须分别说清楚

Evaluator 的两个 `relation_groups` 要求：

1. 同一个 clause 中同时有 `audio_manifest.csv`、`2 recordings`/`two recordings`，并有 `present`/`available`；
2. 同一个 clause 中有 `brief_c.mp3`，并有 `missing`/`absent`/`not found`，且该 clause 不能又说 `present` 或 `exists`。

Clause 通常由分号、竖线、换行，或句号/问号/感叹号后的空白切分。每个关系默认只能匹配一个 clause。因此用分号或分行表达最稳。

### 5.4 明确禁止的正文

以下会失败：

- `pending`、`cancelled`、`withdrawn`、`retracted`；
- 声称 `brief_c.mp3 is present` 或 `brief_c.mp3 exists`；
- 写成 `3 recordings` 或 `three recordings`；
- 出现 evaluator 实体表之外的其他 `*.mp3` 文件名。

最后一条意味着虽然 `brief_a.mp3` 和 `brief_b.mp3` 是真实存在的输入文件，也不要在短信里逐个列名；只写“2 recordings”即可。

### 5.5 当前 evaluator 没有检查什么

- 不直接重新统计 Recordings 文件夹；
- 不检查 CSV 在任务结束时是否仍存在；
- 不检查联系人是否被修改；
- 不检查 MP3 的音频内容、时长或字节；
- 不要求短信逐字等于 oracle，只要求上述关系通过。

## 6. 常见失败与真实评测边界

- `2 recordings present. brief_c.mp3 missing.`：缺少清单名，失败。
- `audio_manifest.csv lists 2 recordings; brief_c.mp3 missing.`：第一条关系里没有 present/available，失败。
- `audio_manifest.csv: 2 recordings present, brief_a.mp3 and brief_b.mp3 available; brief_c.mp3 missing.`：出现未允许的 MP3 文件名，失败。
- 把两种状态都写在同一条无标点长句中，可能让 `brief_c.mp3` 所在 clause 同时含 present 和 missing，从而失败。

## 7. Cleanup

- android_0 删除 `/sdcard/Download/audio_manifest.csv`；
- android_1 删除三份目标录音及对应媒体索引；
- android_1 清空 Contacts 和 SMS。
