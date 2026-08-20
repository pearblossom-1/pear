# Core 122 — linux_smarthome_656

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 122 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_656.json
- 运行配置：configs/cross_device/local_linux_smarthome.json
- 难度：medium
- 设备拓扑：1L+1H（linux_0、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

读取 Markdown 中的三个房间和优先方案，再查询 Home 中实际有哪些设备：

- office 有 air conditioner，可完整执行：开机、cool、24°C；
- study 有 heater，可完整执行：开机、22°C；
- guest room 没有任何 climate device，不能执行，报告 no climate device。

最后还必须在 Linux 新建 /tmp/climate/fallback_result.json，把三间房的结果写进去。

## 1. Instruction

### 英文原文（逐字）

~~~text
Read `/tmp/climate/fallback_matrix.md`, check the listed rooms and live SmartHome capabilities, and apply the best permitted climate fallback for each room. Save the compact room-by-room handoff to `/tmp/climate/fallback_result.json` using the visible schema in the matrix, including the reason for any unavailable room.
~~~

### 中文翻译

读取 /tmp/climate/fallback_matrix.md，检查其中列出的房间以及 SmartHome 的实时能力，并为每个房间应用允许的最佳气候备选方案。按照矩阵中可见的 schema，将简洁的逐房间交接结果保存到 /tmp/climate/fallback_result.json；对于不可用的房间，需要包含原因。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片或办公文档附件。

### 2.1 fallback_matrix.md 的完整内容

标题：Fallback Matrix。

| room | preferred | target_c | fallback_order |
|---|---|---:|---|
| office | exact_target | 24 | exact_target;mode_only;report |
| study | portable_heat | 22 | exact_target;mode_only;report |
| guest room | heat | 22 | exact target; mode only; report |

Result handoff 段落要求：

- 顶层是一个 JSON object；
- 其中有 rooms object；
- rooms 以 office、study、guest room 为 key；
- 每个房间记录使用 status，值为 applied 或 unavailable；
- 应记录 device；
- 设备已应用时包含 target_c；
- 没有兼容气候设备时写 status: unavailable 和 reason: no climate device。

### 2.2 Home 初始状态与能力

当前时间：2026-06-25 12:00。

| 房间 | 设备 | 初始状态 | 可用能力 |
|---|---|---|---|
| office | office_air_conditioner_1 | off、mode=auto、target=26 | turn_on、set_mode；模式含 cool；set_target_temperature |
| study | study_heater_1 | off、target=22 | turn_on、set_target_temperature |
| guest_room | 无 climate device | — | 无 |

房间环境读数不会决定答案；本题依据的是设备存在性与 capability。

## 3. Setup 具体流程

### linux_0

1. 删除旧的 fallback_matrix.md 和 fallback_result.json。
2. 创建 /tmp/climate。
3. 上传新的 /tmp/climate/fallback_matrix.md。
4. 不会预先创建 fallback_result.json；它是本题输出。

### home_0

从 linux_smarthome_656/episode_config.json reset Home，建立 office AC、study heater、没有气候设备的 guest room，以及空 schedules/workflows/history。

## 4. 应形成的标准结果

### 4.1 Home 操作

office_air_conditioner_1：

    turn_on
    set_mode(mode="cool")
    set_target_temperature(temperature_c=24)

study_heater_1：

    turn_on
    set_target_temperature(temperature_c=22)

guest room 不执行设备命令。

### 4.2 推荐 JSON

~~~json
{
  "rooms": {
    "office": {
      "status": "applied",
      "device": "air conditioner",
      "target_c": 24
    },
    "study": {
      "status": "applied",
      "device": "heater",
      "target_c": 22
    },
    "guest room": {
      "status": "unavailable",
      "reason": "no climate device"
    }
  }
}
~~~

这与 oracle 输出一致。虽然附件文字笼统说每个房间记录使用 device，oracle 和 evaluator 都不要求 unavailable 房间有 device 字段。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

三个 evaluator 都计分且都必须通过：office 最终状态、study 最终状态、JSON 指定字段。

### 5.1 office Home 状态

office_air_conditioner_1 必须同时满足：

    power = on
    mode = cool
    target_temperature_c = 24

这是状态字段的子集匹配。只开机但不切 cool，或 target 留在 26，都会失败。

### 5.2 study Home 状态

study_heater_1 必须同时满足：

    power = on
    target_temperature_c = 22

初始 target 本来就是 22，因此只要最终开机且 target 仍是 22 即可；Evaluator 不要求一定调用过 set_target_temperature。

### 5.3 fallback_result.json

评测函数 check_json 会先解析有效 JSON，再沿以下 key path 取值并用 eq 精确比较：

| JSON 路径 | 必须等于 |
|---|---|
| rooms.office.status | applied |
| rooms.office.device | air conditioner |
| rooms.office.target_c | 24 |
| rooms.study.status | applied |
| rooms.study.device | heater |
| rooms.study.target_c | 22 |
| rooms["guest room"].status | unavailable |
| rooms["guest room"].reason | no climate device |

字符串比较区分大小写；`Air Conditioner` 不等于 `air conditioner`。数字 24/22 应写成 JSON number，不要写成字符串。

当前 check_json 只检查上述路径，没有关闭整个对象：额外 key 不会导致失败，房间顺序也不影响对象取值。它也没有检查 guest room 的 device 或 target_c 字段。

## 6. 常见失败与真实评测边界

- 把 guest room 的 key 写成 guest_room：评测找不到 `rooms -> guest room`，失败。
- 把 target_c 写成 `"24"`：是字符串而不是数字，失败。
- JSON 正确但没有真正改变 Home：office/study 状态检查失败。
- Home 正确但 JSON 文件路径或文件名不对：失败。
- 只报告 guest room，不写 office/study：失败。
- 本题没有 command-history 数量、无额外计划或未列设备保持不变的检查。

## 7. Cleanup

- linux_0 删除 fallback_matrix.md 与 fallback_result.json，并尝试删除空的 /tmp/climate。
- home_0 reset。

