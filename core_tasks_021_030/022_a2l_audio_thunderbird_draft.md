# Core 022 — `a2l_audio_thunderbird_draft`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 22 项
- 任务文件：`tasks/cross_device/real300/a2l_audio_thunderbird_draft.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`（`android_0`、`android_1`、`linux_0`）
- 限制：最多 50 步，最长 300 秒

## 1. Instruction

### 英文原文（逐字）

```text
Audio Recorder on the first phone has a `client-call` recording, and the Android Contacts app on the second phone has the client's email. Please create a draft email in Linux Thunderbird addressed to that email, mention the recording filename in the body, attach the recording file, and leave it in Drafts without sending.
```

### 中文翻译

第一部手机的 Audio Recorder 中有一段 `client-call` 录音，第二部手机的 Android Contacts 应用中保存着客户邮箱。请在 Linux Thunderbird 中创建一封发往该邮箱的草稿，在正文中提到录音文件名，附上录音文件，并将其留在 Drafts 中，不要发送。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的音频附件

- 仓库源文件：`tasks/cross_device/real300_assets/a2l_audio_thunderbird_draft/source/client-call.wav`
- Android 路径：`/sdcard/Recordings/client-call.wav`
- 文件名：`client-call.wav`
- 格式：RIFF/WAVE，PCM 16-bit，单声道，16 kHz
- 时长：1 秒
- 大小：32,044 bytes
- SHA-256：`3a184e14b81152f874eb9d5c4ac8851a8815b58d879267d40604804c5cfe1419`

本任务不评测录音的语音内容；它评测邮件附件是否就是这份源文件。

### 2.2 第二部手机的联系人

| 字段 | 值 |
|---|---|
| 名称 | Client |
| 电话 | `5550101` |
| 邮箱 | `client@example.com` |
| 备注 | Client contact for call recording |

### 2.3 Linux Thunderbird 环境

- profile：`~/.thunderbird/mail.default-release`
- 本地发件身份：`Local Agent <agent@example.test>`
- Drafts 初始为空
- `/tmp/audio_thunderbird_draft` 被创建，但录音不会自动复制到 Linux；操作者需要把 Android 音频传到 Linux 后再用 Thunderbird 附加。

## 3. Setup 具体流程

### `android_0`

1. 确保 Audio Recorder 可用。
2. 删除同名旧录音和旧 MediaStore 记录。
3. 上传 `client-call.wav` 到 `/sdcard/Recordings/`。
4. 触发媒体扫描。

### `android_1`

清空联系人后新增 `Client` 联系人。

### `linux_0`

1. 重建任务临时目录和 Thunderbird profile。
2. 写入本地账户配置。
3. 创建空 Drafts。

## 4. Evaluator：评测方式与具体评测点

本任务只有 1 个 evaluator，权重 100%。

### 4.0 先说人话：怎样才算通过

在 Linux Thunderbird 留下一封未发送草稿：

- To：`client@example.com`
- 正文可写：`Attached is client-call.wav.`
- 附件：从第一部手机取得的原始 `client-call.wav`

主题随意。不能只写文件名而不附件，也不能附一段自己新录的同名 WAV，因为 evaluator 会比较附件字节。

### 4.1 草稿匹配逻辑

- `result.type`：`thunderbird_draft_state`
- evaluator 读取指定 profile 的 Drafts 邮箱，而不是检查当前编辑窗口。
- 收件人集合必须恰好为 `{client@example.com}`；额外 To/Cc/Bcc 地址会使该草稿不匹配。
- 正文必须在一个肯定、非疑问、非否定的句子中包含 `client-call.wav`。
- 主题不检查。

### 4.2 附件匹配逻辑

- 草稿必须恰好有 1 个附件；额外附件也会失败。
- 附件文件名按大小写不敏感匹配 `client-call.wav`。
- 附件字节摘要必须精确等于源 WAV 的 SHA-256。
- MIME type 允许 `audio/wav`、`audio/x-wav`、`audio/wave` 或 `audio/vnd.wave`。
- 附件必须非空。
- 邮件必须仍在 Drafts；只发送出去而不保留匹配草稿不能通过。

