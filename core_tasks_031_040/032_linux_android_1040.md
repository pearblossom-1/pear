# Core 032 — `linux_android_1040`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 32 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1040.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`
- 限制：最多 50 步，最长 420 秒

## 1. Instruction

### 英文原文（逐字）

```text
Please set up the approved route-review session. Match `/sdcard/Download/1040-A_source.md` on the first phone to the current event in `/tmp/music/event_schedule.csv` using `/tmp/music/handoff_policy.md`; the second phone's `/sdcard/Download/1040-A_android_1_context.md` gives the track order. On the first phone, create the approved Simple Calendar Pro event and the Retro Music playlist `1040-A route set` in that order. Save the route-handoff decision to `/tmp/music/decision.json` on Linux using the schema shown in the policy.
```

### 中文翻译

请设置已批准的路线审查 session。用 `/tmp/music/handoff_policy.md`，把第一部手机的 `/sdcard/Download/1040-A_source.md` 与 `/tmp/music/event_schedule.csv` 中的当前事件匹配；第二部手机的 `/sdcard/Download/1040-A_android_1_context.md` 给出曲目顺序。在第一部手机创建批准的 Simple Calendar Pro 事件，并按指定顺序创建 Retro Music 播放列表 `1040-A route set`。再按 policy 中的 schema 把路线交接决定保存到 Linux 的 `/tmp/music/decision.json`。

## 2. 输入、附件与初始业务数据

第一部手机 source：

```text
1040-A
NX04005
Mira Patel
```

第二部手机曲目说明要求按此顺序：

```text
harbor check-in
night route brief
```

Schedule CSV 的关键三行：旧 draft `1040-D` 为 hold；`1040-A` 为 approved；`1040-P` 为 pending。批准行完整内容是：

```csv
1040-A,Route review briefing,Mira Patel,approved,NX04005,2026-07-18 11:30,2026-07-18 12:15,Operations Room
```

Policy 给出的完整最小 JSON schema：

```json
{
  "case_id": "1040-A",
  "owner": "Mira Patel",
  "approval_code": "NX04005",
  "selected_source": "event_schedule.csv#1040-A",
  "status": "ready"
}
```

音乐库已预置上述两首 MP3；日历和 Retro Music 播放列表初始清空。

## 3. Setup 具体流程

- `android_0`：上传 source，准备 Calendar 与 Retro Music，两首歌入库并清空旧业务状态。
- `android_1`：上传 track-order context。
- `linux_0`：上传 schedule、policy，清理旧 `decision.json`。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，通常各占 `1/3`。

### 4.0 先说人话：怎样才算通过

第一部手机要有 11:30–12:15、Operations Room 的 `Route review briefing` 事件；播放列表必须叫 `1040-A route set`，并严格按 `harbor check-in`、`night route brief` 排列；JSON 五个字段和值照上方 schema 写。

### 4.1 日历

标题、开始时间、结束时间和地点都要匹配批准行。错误选中 1040-D/P 会失败。

### 4.2 播放列表

播放列表名固定，歌曲集合与顺序都严格检查；颠倒、漏歌、多歌都会失败。

### 4.3 JSON

用结构化 JSON evaluator 检查五个必需字符串字段的精确值，不是文本关键词搜索。`case_id=1040-D` 或 placeholder 状态会失败。额外键不参与这份最小字段检查，但最稳妥是只保留 schema 中五键。

