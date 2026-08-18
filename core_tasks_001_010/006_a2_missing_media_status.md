# Core 006 — `a2_missing_media_status`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 6 项
- 任务文件：`tasks/cross_device/real100/a2_missing_media_status.json`
- 运行配置：`configs/cross_device/local_2android.json`
- 设备拓扑：`2A`（`android_0`、`android_1`）
- 限制：最多 18 步，最长 180 秒

## 1. Instruction

### 英文原文（逐字）

```text
The first phone received a Simple SMS Messenger message asking me to find a specific photo in `/sdcard/Download/` on the second phone's Android Files app. Please check it. If the photo is missing, write a `Photo status` note in Markor on the second phone with the missing filename and Simple SMS Messenger as the source.
```

### 中文翻译

第一部手机收到了一条 Simple SMS Messenger 短信，要求我在第二部手机的 Android Files 应用中查找 `/sdcard/Download/` 里的某张特定照片。请进行检查。如果照片缺失，请在第二部手机的 Markor 中写一篇 `Photo status` 笔记，注明缺失的文件名，并将 Simple SMS Messenger 标为来源。

## 2. 输入、附件与初始业务数据

### 2.1 第一部手机的收件短信

- 应用：Simple SMS Messenger
- 短信箱：收件箱
- 发件地址：`5550503`
- 正文原文：

```text
Please find photo site_panel.jpg in Download.
```

- Setup 注入后等待 5 秒。

资产文件 `source/photo_request_sms.txt` 保存相同正文；setup 直接通过 `androidworld_sms_receive` 注入，并不把 TXT 上传到手机。

### 2.2 第二部手机的目标文件状态

- 要检查的用户可见路径：`/sdcard/Download/site_panel.jpg`
- evaluator 使用的等价规范路径：`/storage/emulated/0/Download/site_panel.jpg`
- Setup 明确删除该文件，因此初始状态是缺失。
- Setup 同时删除旧笔记 `/storage/emulated/0/Documents/Markor/Photo status.md`。

本任务没有实际图片附件；“缺失”本身就是 fixture 输入状态。

### 2.3 预期输出

- 第二部手机上的 Markor 文件：`/storage/emulated/0/Documents/Markor/Photo status.md`
- 笔记要表达标题、文件 `site_panel.jpg` 的 missing 状态，以及唯一来源 `Simple SMS Messenger`。

## 3. Setup 具体流程

### `android_0`

1. 确保 Simple SMS Messenger 可用。
2. 清空 SMS 数据库。
3. 从 `5550503` 注入第 2.1 节的收件短信并等待 5 秒。

### `android_1`

1. 确保 Markor 和 Android Files 可用。
2. 删除旧的 `Photo status.md`。
3. 删除 `/storage/emulated/0/Download/site_panel.jpg`。

Cleanup 再次清空第一部手机短信，并删除第二部手机的笔记和目标照片。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个默认启用 evaluator，各占 `1/2`；任务级 `success` 要求两项同时通过。

### 4.0 先说人话：怎样才算通过

要满足两件事：照片确实不存在，并且 Markor 笔记把这件事写清楚。

最稳妥的笔记是：

```text
# Photo status
Source: Simple SMS Messenger
site_panel.jpg: missing
```

这样会通过，因为它明确写了正确标题、唯一来源、正确文件名和“缺失”结论。

以下情况会失败：

- 写成 `site_panel.jpg: present`；
- 写成 `site_panel.jpg might be missing`，因为语气不确定；
- 写成 `Is site_panel.jpg missing?`，因为这是问题；
- 文件其实被创建出来了；
- 来源写错，或者写了两行来源；
- 只写“照片缺失”却没有准确写出 `site_panel.jpg`。

### 4.1 Markor 状态笔记（权重 `1/2`）

- `result.type`：`android_named_status_note`
- getter 通过 ADB `cat` 读取笔记全文，内部解析成功时返回 `pass`，否则返回 `fail`。
- `func`：`exact_match`，最终只把该状态字符串与 `pass` 绝对比较；并非把整篇笔记和某个标准答案逐字比较。

#### 标题行

必须存在一个独立行，规范化后等于 `Photo status`。可接受的典型写法包括：

```text
Photo status
# Photo status
Title: Photo status
```

标题不能只作为另一句中的普通子串出现。

#### 来源行

必须恰好解析出 1 条来源声明，值规范化后等于 `Simple SMS Messenger`。支持的完整行形状为：

```text
Source: Simple SMS Messenger
Source - Simple SMS Messenger
Source is Simple SMS Messenger
Requested via Simple SMS Messenger
From Simple SMS Messenger
```

行首可以有 Markdown 项目符号或标题符号。若出现两条可识别来源声明，即使两条都相同，也会因“声明数不等于 1”而失败。

#### 文件名与 missing 关系

1. 实体名按不区分大小写的精确边界匹配 `site_panel.jpg`。边界把字母、数字、下划线、点和连字符视为文件名字符，因此 `old_site_panel.jpg` 或 `site_panel.jpg.bak` 不会冒充目标文件。
2. 与该文件名处于同一 clause 的状态必须明确为 missing。
3. missing 同义模式包括 `missing`、`absent`、`unavailable`、`not found`、`does not exist`、`not present`、`not available`、`couldn't find` 等。
4. `present`、`exists`、`available`、`found`、`located` 属于 present 语义；同一 clause 同时含 present 与 missing 会被判为冲突。
5. `maybe`、`possibly`、`might`、`unknown`、`not sure`、`cannot confirm` 等不确定表达，以及问句，会返回 invalid。
6. `not missing`、`never missing`、`no longer missing/present` 等容易反转极性的表达被明确拒绝。

Clause 切分规则是：换行、分号 `;`、竖线 `|`、逗号都会切分；句号/问号/感叹号只有在其后为空白且下一字符为大写字母时形成句界。若多个实体和相反状态没有任何这些分隔符，就可能落入同一 clause 并因极性混合失败。

本任务未开启 `require_one_relation_per_entity`，所以同一文件名出现多次且所有有效断言都一致为 missing 时不会仅因重复而失败；但只要出现 present、invalid 或没有任何 missing 断言，就会失败。

### 4.2 目标文件确实缺失（权重 `1/2`）

- `result.type`：`android_file_state`
- getter 在第二部手机上执行普通文件测试 `test -f`。
- 若文件不存在，结构化结果在旧式 scalar 评分边界被投影为字符串 `missing`。
- `exact_match` 要求该字符串恰好为 `missing`。

因此，仅在笔记里声称缺失但实际创建了 `site_panel.jpg`，只能得到一半分数且任务不成功。

### 4.3 不评测的内容

- 不要求笔记逐字使用 `site_panel.jpg: missing`；自然句式和多种 missing 同义词可通过。
- 不要求笔记只有三行，也不限制额外无关说明，只要不产生冲突关系或重复来源声明。
- 不评测 Android Files 的操作轨迹或截图，只读取最终文件状态和 Markor 内容。
