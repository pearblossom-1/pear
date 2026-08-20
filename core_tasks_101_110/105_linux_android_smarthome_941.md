# Core 105 — linux_android_smarthome_941

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 105 项
- 任务文件：tasks/cross_device/linux_android_smarthome/linux_android_smarthome_941.json
- 运行配置：configs/cross_device/local_android_2linux_smarthome.json
- 难度：hard
- 设备拓扑：1A+2L+1H（android_0、linux_0、linux_1、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

手机上的旧请求要求把 guest-room curtain 调到 20%，但 Linux 上 17:45 收到的最新 booking update 说 GS-2047 已被客人取消，而且明确规定新状态覆盖旧请求。

所以不能动窗帘。正确结果是：

1. guest_room_curtain_1 保持 open_pct=80、status=partial；
2. Home 直接命令数为 0；
3. 工作簿 Decision 填 Cancelled，Home Result 填 No change - booking cancelled；
4. 在原 Markor 笔记中把 Outcome 写成 Cancelled，并用 evaluator 接受的自然句说明 Home 保持不变。

## 1. Instruction

### 英文原文（逐字）

~~~text
The pending guest-room setup may have been superseded, so please close it out against the latest booking status. Reconcile the property phone's `Guest arrival setup request` note with `/tmp/guest-stay-reconcile/booking/latest.txt` on the booking-status Linux workstation. Complete the front-desk register at `/tmp/guest-stay-reconcile/register/request_register.xlsx` and save the finished copy as `/tmp/guest-stay-reconcile/result/request_register_done.xlsx`. Check the live SmartHome state, change the room only if the latest booking still authorizes it, and record the outcome in the original Markor note.
~~~

### 中文翻译

待处理的客房设置请求可能已经被新状态取代，请根据最新预订状态将其结案。把物业手机上的 Guest arrival setup request 笔记与预订状态 Linux 工作站上的 /tmp/guest-stay-reconcile/booking/latest.txt 进行核对。完成前台登记表 /tmp/guest-stay-reconcile/register/request_register.xlsx，并把完成副本保存为 /tmp/guest-stay-reconcile/result/request_register_done.xlsx。检查 SmartHome 实时状态；只有最新预订仍授权时才能改变房间，并在原 Markor 笔记中记录结果。

## 2. 输入、附件与初始业务数据

本任务没有短信或邮件附件。

### 2.1 Android：原 Markor 笔记

文件路径：

    /storage/emulated/0/Documents/Markor/Guest arrival setup request.md

初始全文：

~~~markdown
# Guest arrival setup request

Request GS-2047 is for a guest expected at 20:00. The pending room-preparation
request is to set the guest-room curtain to 20 percent.

Check the latest booking update on Linux before making any Home change.

Closeout:
Outcome:
Home result:
~~~

需要在这份原文件中补全结案字段，而不是新建另一份笔记。

### 2.2 Linux 0：最新预订状态

路径：/tmp/guest-stay-reconcile/booking/latest.txt

~~~text
Guest booking update

Request: GS-2047
Received: 2026-06-16 17:45
Status: Cancelled by guest

Operations rule: the latest booking update overrides an older room-preparation
request. For a cancelled stay, do not issue any Home command. Close the request
as Cancelled and record the Home result as No change - booking cancelled.
~~~

### 2.3 Linux 1：源登记表

路径：/tmp/guest-stay-reconcile/register/request_register.xlsx

工作簿有 Request Register 和 Completion Guide 两个 sheet。

Request Register 修改前：

| Request ID | Room | Requested setup | Decision | Home Result |
|---|---|---|---|---|
| GS-2047 | guest_room | curtain 20 percent | 空 | 空 |

Completion Guide：

- Decision：当前住宿才 Proceed；最新 booking 已取消则 Cancelled；其他运营限制用 Blocked；
- Home Result：记录设置是否执行，或为什么 Home 被有意保持不变。

目标输出路径：

    /tmp/guest-stay-reconcile/result/request_register_done.xlsx

### 2.4 SmartHome 初始状态

当前时间：2026-06-16 18:00；初始 schedule、workflow、history 均为空。

guest_room_curtain_1：

    open_pct = 80
    status = partial

旧笔记请求的 20% 尚未执行。

## 3. Setup 具体流程

### linux_0

删除旧 latest.txt、创建 booking 目录并上传最新状态。

### linux_1

删除旧源/输出工作簿、创建 register/result 目录并上传源登记表。

### android_0

1. 确保 Markor 已安装；
2. 删除同名旧文件；
3. 上传上述原始 Guest arrival setup request.md。

### home_0

从 episode_config.json 重置 Home，写入 curtain=80/partial 和空计划/历史。

Setup 不会自动打开三个附件。

## 4. Evaluator：评测方式与具体评测点

### 4.0 先说人话：怎样才算通过

要同时做到：

- 不发送任何 Home command；
- guest-room curtain 仍是 80/partial；
- 工作簿两格填指定固定文本；
- 原 Markor 笔记保留 GS-2047/guest-room 信息，并新增严格格式的 Outcome 和 Home result 行。

### 4.1 Markor 笔记的实际匹配方式

Evaluator 用 shell/正则检查固定文件，要求：

1. 文件存在；
2. 大小写不敏感地包含 gs-2047；
3. 包含 guest、guest room、guest_room 或 guest-room 形式；
4. 有一整行满足 Outcome: Cancelled 或 Outcome: Canceled，冒号前后可有空格，不能在该行追加其他文字；
5. Home result 行不得含 pending、not confirmed、unverified、unknown、not verified；
6. Home result 行必须是下列核心表达之一：left unchanged、unchanged、no change、no devices were changed、home remained unchanged、no home commands were issued 等；可以在后面用 because、since、after 或 due to 追加理由，并可有句号。

稳妥写法：

    Outcome: Cancelled
    Home result: Left unchanged because the booking was cancelled.

重要边界：工作簿要求的 No change - booking cancelled 带连字符；Markor 正则不接受把这个短语直接照抄成 Home result: No change - booking cancelled，因为追加理由只允许 because/since/after/due to 连接。两处应使用不同但含义一致的写法。

### 4.2 SmartHome 不变

设备状态 evaluator 要求 guest_room_curtain_1 至少保持：

    open_pct = 80
    status = partial

全局 command history 总数必须恰好为 0。任何直接 Home command，即使后来恢复，都失败。

### 4.3 输出工作簿

目标工作簿的 sheet 名集合必须精确为：

- Request Register
- Completion Guide

第一个 sheet 应继续是 Request Register，并且 A1:E2 的 10 个非空单元格必须精确为：

| Request ID | Room | Requested setup | Decision | Home Result |
|---|---|---|---|---|
| GS-2047 | guest_room | curtain 20 percent | Cancelled | No change - booking cancelled |

本任务启用了 reject_extra_nonempty_cells：Request Register 中不能多出标题、备注、第三行或其他非空格。文本逐格精确匹配。

Completion Guide 的 sheet 名必须保留，但 evaluator 不逐格检查其正文。

### 4.4 没有检查的部分

- 没有 schedule/workflow 数量 evaluator；理论上新增未来计划可能绕过零 command history，但违反任务要求。
- 工作簿样式、列宽、颜色不评分。
- Markor 不是全文绝对匹配，原请求的业务锚点和两条 closeout 行才是重点。

## 5. 常见失败与真实评测边界

- 按旧笔记把 curtain 改为 20%：设备和命令数都失败。
- 工作簿 E2 使用同义句：逐格不等，失败。
- Markor 写 Home result: No change - booking cancelled：看似合理，但不符合该正则允许的理由连接形式，失败。
- 另建 Result.md 而不改原文件：固定路径仍是空 closeout，失败。
- 在 Request Register 增加说明行：extra nonempty cells 失败。
- 删除 Completion Guide：sheet 名集合不符，失败。

## 6. Cleanup

- Linux 0 删除 latest.txt；
- Linux 1 删除源和输出工作簿；
- Android 删除原 Markor 文件；
- Home reset；
- 尝试删除空目录。
