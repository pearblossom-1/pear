# Core 059 — `linux_android_947`

- 任务文件：`tasks/cross_device/linux_android/linux_android_947.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`；拓扑 `1A+2L`
- 限制：最多 50 步，最长 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
The approved recording case needs to be handed to both the phone recording operator and the second-Linux transfer operator. Reconcile `/sdcard/Download/947-A_source.md` with `/tmp/audio_file_list_creates_reco/request_table.csv` and follow `/tmp/audio_file_list_creates_reco/handoff_policy.md`. Save the routing decision to `/tmp/audio_file_list_creates_reco/decision.json`, leave the phone operator a `947-A recording handoff` note in Markor, and write the transfer handoff to `/tmp/audio_file_list_creates_reco/handoff.txt` on the second Linux machine.
```

### 中文翻译

把 approved recording case 同时交给手机 recording operator 和第二台 Linux transfer operator。核对手机 source、request table 和 policy，保存 decision.json，创建手机 Markor handoff note，并在第二台 Linux 写 handoff.txt。

## 2. 输入、Setup 与评测

手机 source：947-A/NX94733/Tao Lin；CSV 唯一 approved 行同值，943-D 式 hold 干扰在此为 `947-D`。Policy 公开 JSON schema。

本任务 3 项：

- Markor 精确路径，需含 947-A、NX94733、Tao Lin、recording handoff 和 ready/approved。
- decision.json 只能有一条记录，可直接用数组或 `{ "handoffs": [...] }`：`{"case_id":"947-A","approval_code":"NX94733","owner":"Tao Lin","selected_source":"/tmp/audio_file_list_creates_reco/request_table.csv","status":"ready"}`；字段大小写敏感，无额外记录。
- handoff.txt 要把 case/code/owner、second Linux/transfer operator、recording handoff 与 ready/prepared 肯定关联；missing/placeholder/blocked 失败。

