# Core 032 — `linux_android_1040`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 32 项
- 任务文件：`tasks/cross_device/linux_android/linux_android_1040.json`
- 运行配置：`configs/cross_device/local_2android_linux.json`
- 设备拓扑：`2A+1L`
- 限制：最多 50 步，最长 420 秒

## 0. 任务链与设备分工

| 设备 | 信息/产物 |
|---|---|
| `android_0` | 请求身份、两首已注入歌曲；最终 Calendar 事件和播放列表 |
| `android_1` | 播放列表曲目顺序说明 |
| `linux_0` | schedule、policy；最终结构化 `decision.json` |

三项各自独立计分：日历正确不能替代播放列表，播放列表正确也不能替代 JSON。

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

第二部手机 `/sdcard/Download/1040-A_android_1_context.md` 的完整可见内容是：

```text
# Route review audio

Use these two tracks, in this order, for the approved route review playlist:

- harbor check-in
- night route brief
```

Schedule CSV 全文：

```csv
case_id,event_title,owner,status,approval_code,start,end,location
1040-D,Old route draft,Mira Patel,hold,D10407,2026-07-18 09:00,2026-07-18 09:45,Archive Room
1040-A,Route review briefing,Mira Patel,approved,NX04005,2026-07-18 11:30,2026-07-18 12:15,Operations Room
1040-P,Pending route review,Jon Bell,pending,D10401,2026-07-18 14:00,2026-07-18 14:45,North Annex
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

### `android_0`

1. 确保 Files、Simple Calendar Pro、Retro Music 可用。
2. 上传请求到 `/sdcard/Download/1040-A_source.md`。
3. 清空 Calendar 与 Retro Music 数据。
4. 定向删除两首同名旧 MP3 和 MediaStore 记录。
5. 通过任务 helper 推入 `harbor check-in.mp3`、`night route brief.mp3`；这里只建立音乐库，不预建目标 playlist。

### `android_1`

确保 Files 可用，把完整曲目顺序说明上传到 `/sdcard/Download/1040-A_android_1_context.md`。

### `linux_0`

创建 `/tmp/music`，删除旧 schedule、policy 和 decision，再上传 `/tmp/music/event_schedule.csv` 与 `/tmp/music/handoff_policy.md`。

## 4. Evaluator：评测方式与具体评测点

本任务有 3 个 evaluator，通常各占 `1/3`。

### 4.0 先说人话：怎样才算通过

第一部手机要有 11:30–12:15、Operations Room 的 `Route review briefing` 事件；播放列表必须叫 `1040-A route set`，并严格按 `harbor check-in`、`night route brief` 排列；JSON 五个字段和值照上方 schema 写。

### 4.1 日历

标题、开始时间戳 `1784374200`、结束时间戳 `1784376900` 和地点都要匹配批准行。Getter 要求至少存在一条匹配事件；没有配置“Calendar 中只能有这一条”的全局集合约束，所以额外事件不影响这一项。

### 4.2 播放列表

播放列表名固定为 `1040-A route set`，歌曲列表必须严格等于 `harbor check-in` 后接 `night route brief`；颠倒、漏歌、多歌都会失败。其他不同名称的播放列表不属于这项 getter 的目标。

### 4.3 JSON

用结构化 JSON evaluator 检查五个必需字符串字段的精确值，不是文本关键词搜索。键名区分大小写，值也按 JSON 字符串精确比较；`case_id=1040-D` 或 `status=placeholder` 会失败。额外键不参与这份最小字段检查，这是当前 evaluator 的明确边界；最稳妥是只保留 schema 中五键。

## 5. 常见失败与不评测项

- 使用 hold 行 `1040-D` 的 09:00 事件，即使 owner 相同也失败。
- 正确两首歌但 playlist 名写成 `Route review set`，失败。
- JSON 是合法文本但写成数组、字段嵌套在 `decision` 下，五个顶层路径取不到值。
- `status` 写 `approved` 而不是 policy 指定的 `ready`，失败。
- 曲目标题带 `.mp3` 是否匹配取决于 Retro Music 返回的 song title；setup 注入的规范标题不含扩展名，按界面标题原样选最稳妥。

Evaluator 不检查日历描述，不检查 JSON 是否由 GUI 创建，也不要求把两首音频复制到 Linux。

## 6. Cleanup

清理会删除两部手机的两个 Download 输入，清空第一部手机 Calendar/Retro Music，删除两首任务 MP3 及其媒体记录，并移除 Linux 的 schedule、policy、decision 和空目录。
