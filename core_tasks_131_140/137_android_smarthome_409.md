# Core 137 — android_smarthome_409

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 137 项
- 任务文件：`tasks/cross_device/android_smarthome/android_smarthome_409.json`
- 运行配置：`configs/cross_device/local_android_smarthome.json`
- 难度：medium
- 设备拓扑：1A+1H（`android_0`、`home_0`）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

CSV 有两个 living-room 请求：

- C1：curtain 支持 percentage，应执行到 35%；
- C2：目标是 basic light，它只有开/关能力，没有 brightness command，所以不能执行，也不能拿 dimmable light 替代。

Home 只能出现 1 条 command history，也就是 C1 的 curtain 调整。Markor note 要分别写清 C1 已执行、C2 不支持及原因。

## 1. Instruction

### 英文原文（逐字）

~~~text
The Files app has `comfort_requests.csv`, and Markor has a `Comfort request results` note ready for this handoff. Process both living-room requests, apply the supported curtain adjustment, and complete the note with the result of each request, including why the light-brightness request cannot be carried out.
~~~

### 中文翻译

Files app 中有 `comfort_requests.csv`，Markor 中已有一份 `Comfort request results` note 等待完成。处理两项 living-room 请求，执行受支持的 curtain 调整，并在 note 中完成每项请求的结果，包括解释为什么 light-brightness 请求无法执行。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、图片或音频附件。

### 2.1 comfort_requests.csv 的完整内容

路径：`/storage/emulated/0/Download/comfort_requests.csv`。

| request_id | room | target | command | args | approval | notes |
|---|---|---|---|---|---|---|
| C1 | living_room | curtain | set_open_pct | open_pct=35 | approved | feasible if curtain supports percentage |
| C2 | living_room | basic light | set_brightness | brightness_pct=40 | approved | basic light has no brightness command; do not substitute |

“approved”不等于设备一定支持。C2 已获批准，但 target 是 basic light，能力不支持 brightness。

### 2.2 Markor 初始模板的完整内容

路径：`/storage/emulated/0/Documents/Markor/Comfort request results.md`。

~~~markdown
# Comfort request results

Complete one section for each request in `comfort_requests.csv`.

## C1

- Target:
- Status:
- Result:

## C2

- Target:
- Status:
- Reason:
~~~

### 2.3 Home 初始状态

当前时间：2026-06-16 19:00。

| 设备 | 类型 | 初始状态 | 能力结论 |
|---|---|---|---|
| living_room_curtain_1 | curtain | open_pct=0，status=closed | 支持 set_open_pct |
| living_room_light_1 | light | power=off | basic light，只支持开/关，不支持 brightness |

Home 中没有 living-room dimmable light。初始 schedules、workflows、history 均为空。

## 3. Setup 具体流程

### android_0

1. 确保 Files 和 Markor 可用。
2. 删除旧的 `Comfort request results.md`。
3. 上传 `comfort_requests.csv` 到 Download。
4. 上传未完成的 Markor 模板到 Documents/Markor。

### home_0

使用 `android_smarthome_409/episode_config.json` reset Home。

Setup 不会自动打开 CSV/note，也不会控制 curtain。

## 4. 正确输出

Home 只执行：

~~~text
living_room_curtain_1.set_open_pct(open_pct=35)
~~~

Oracle 的 Markor note：

~~~markdown
# Comfort request results

## C1 — living-room curtain
Status: Executed
Result: curtain set to 35% open.

## C2 — living-room basic light brightness
Status: Unsupported
Reason: the basic light has no brightness command, so it cannot be applied.
~~~

可以使用其他自然措辞，但 C1/C2 的结果不能串错。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

三个 evaluator 都必须成功：

1. Markor note 语义；
2. curtain 最终状态；
3. Home command history 恰好 1 条的 hard guard。

第三项 `enable_score_calc=false` 失败仍会把任务总分置为 0。

### 5.1 Markor note：不是全文精确匹配

Evaluator 读取精确路径 `Comfort request results.md`，要求全文含有以下实体：

~~~text
C1
curtain
35
C2
basic light
brightness
~~~

同时至少出现 `executed`、`applied`、`unsupported`、`cannot` 中一个，并且不能出现：

- `C1 unsupported`
- `C1 failed`
- `C2 executed`
- `C2 applied`

### 5.2 C1/C2 的“靠近关系”

为了避免只把关键词随便堆在一起，规则还会按中间 token 数计算最近关系：

| Anchor | 附近必须有 | 最大距离 | 附近不能由其压过 |
|---|---|---:|---|
| C1 | executed / applied / set | 20 | unsupported / failed |
| C1 | 35 | 24 | 无 |
| C2 | unsupported / cannot / no brightness command | 24 | executed / applied |

这里 `same_clause` 没有启用，所以不是严格要求同一句；但跨边界会产生距离惩罚。最稳妥、也最符合模板的写法，是 C1 和 C2 各自使用独立短小 section。

通用关系规则还会拒绝问句、明显不确定、否定或撤销语义。它不要求完全保留模板项目符号或 Oracle 句子。

### 5.3 Curtain 最终状态

`living_room_curtain_1` 必须同时满足：

- open_pct=35；
- status=partial。

### 5.4 只能有一条 Home command

`smarthome.check_command_history_count` 使用 `count=1, match={}`，因此统计整个 Home history 中的所有 command，必须恰好 1 条。读取 Home 状态不算 command。

这条 guard 阻止为 C2 再发设备命令，也阻止多次反复调整 curtain。

### 5.5 没有检查的内容

- CSV 本身不作为输出评测；
- 没有直接检查 living_room_light_1 的最终 power；
- 没有 schedule/workflow evaluator；
- Note 不需要和 Oracle 全文相同，只要关系规则通过。

业务上“不改 basic light”主要由 C2 note 语义和总 command 数量共同约束。

## 6. 常见失败与真实评测边界

- Curtain 最终 35，但 note 没写 C2 为什么不支持：note 失败。
- 对 basic light 发 brightness command：即使设备拒绝，也可能破坏“恰好一条 history”的 guard。
- 为 C2 找另一盏 dimmable light 替代：违反 CSV 的 do not substitute，且 command 数超限。
- C1/C2 状态写反：冲突短语或 nearest relation 失败。
- Curtain 调到 35 后又调回来再调一次：最终状态可能对，但 history 不再是 1，失败。

## 7. Cleanup

- android_0 删除 comfort_requests.csv 和结果 note。
- home_0 reset。

