# Core 062 — `linux_android_905`

- 任务文件：`tasks/cross_device/linux_android/linux_android_905.json`
- 运行配置：`configs/cross_device/local_android_2linux.json`；拓扑 `1A+2L`
- 限制：50 步 / 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
Prepare the approved event playlist handoff. The phone has `/sdcard/Download/905-A_source.md`; Linux has `/tmp/event/setlist.csv` and `/tmp/event/handoff_policy.md`. Create the Retro Music playlist `905-A route set` in the track order given by the setlist, then leave a concise ready handoff at `/tmp/event/handoff.txt` on the second Linux desktop. The handoff should clearly relate the selected case, approval code, owner, and ready status.
```

### 中文翻译

准备 approved event playlist handoff。按手机 source、Linux setlist/policy 创建指定 Retro Music playlist，再在第二台 Linux 写 ready handoff，关联 case/code/owner/status。

## 2. 数据、Setup 与评测

Source：905-A/NX90530/Jon Bell。Setlist approved 行依序 `track_905_alpha`、`track_905_bravo`；905-D hold 是干扰。Android 曲库已含两首，playlist 初始空。

两项评分：playlist 名必须精确 `905-A route set`，歌曲集合与顺序精确；handoff.txt 可写 `905-A / NX90530 for Jon Bell: playlist is approved and ready.`，必须肯定关联三实体与 ready，不能有 missing/placeholder/not ready/pending/blocked/905-D。

