# Core 009 — `a2l2_training_deck_notify`

- Core 来源：`experiments/human_validation1000/core200_manifest.jsonl` 第 9 项
- 任务文件：`tasks/cross_device/real200/a2l2_training_deck_notify.json`
- 运行配置：`configs/cross_device/local_2android_2linux.json`
- 设备拓扑：`2A+2L`（`android_0`、`android_1`、`linux_0`、`linux_1`）
- 限制：最多 70 步，最长 540 秒

## 1. Instruction

### 英文原文（逐字）

```text
Please prepare a training package: Simple Calendar Pro on the first phone has the training event, and the Android Contacts app on the second phone has the attendees. On the second Linux machine, use the Impress template `/tmp/training/training_deck.odp` from the first Linux machine to create `/tmp/training/field_onboarding_deck.odp`. Fill the template with the event title, date, start and end time, location, and all attendee names. Then create a Thunderbird draft addressed to every attendee that identifies the event.
```

### 中文翻译

请准备一份培训资料包：第一部手机的 Simple Calendar Pro 中有培训事件，第二部手机的 Android Contacts 应用中有参会者。请在第二台 Linux 机器上使用来自第一台 Linux 机器的 Impress 模板 `/tmp/training/training_deck.odp` 创建 `/tmp/training/field_onboarding_deck.odp`。在模板中填写事件标题、日期、开始和结束时间、地点以及所有参会者姓名。然后创建一封发送给每位参会者、并能识别该事件的 Thunderbird 草稿。

## 2. 输入、附件、联系人与邮件环境

### 2.1 第一部手机：培训事件

```json
{
  "title": "Field onboarding",
  "start_ts": 1781798400,
  "end_ts": 1781805600,
  "location": "Training room A",
  "description": "Training event: Field onboarding; deck required; attendees listed on second phone contacts",
  "reminder_1_minutes": 60
}
```

任务 evaluator 使用的 UTC 时间口径是 `2026-06-18 16:00-18:00`；事件带提前 60 分钟提醒。

### 2.2 第二部手机：联系人

| 姓名 | 电话 | 邮箱 | Notes |
|---|---|---|---|
| Alex Kim | `5550196` | `alex.kim@example.test` | `Training attendee` |
| Priya Rao | `5550197` | `priya.rao@example.test` | `Training attendee` |

这些邮箱是 Thunderbird 草稿的目标收件人。Setup 还确保第二部手机上的 Simple Calendar Pro 可用，但不向该手机写 Calendar 事件。

### 2.3 第一台 Linux：Impress ODP 模板附件

- 仓库源文件：`tasks/cross_device/real200_assets/a2l2_training_deck_notify/source/training_template_196.odp`
- 注入路径：`linux_0:/tmp/training/training_deck.odp`
- 包类型：OpenDocument Presentation 1.2
- 包成员：`mimetype`、`styles.xml`、`content.xml`、`meta.xml`、`META-INF/manifest.xml`
- 生成器元数据：`ODFPY/1.4.1`

模板只有 1 张 10 × 7.5 英寸的横向 4:3 幻灯片，使用 `TrainingMaster`。页面上只有 1 个文本 frame：

- 位置：`x=0.8in`、`y=0.7in`
- 大小：`8.4in × 6.0in`
- 填充：`#F2F4F7`
- 边框：`#9CA3AF`

完整可见文字为 6 个段落：

```text
Training Package Template
Event: [[EVENT]]
Date: [[DATE]]
Time: [[TIME]]
Location: [[LOCATION]]
Attendees: [[ATTENDEES]]
```

标题样式为 24 pt、粗体、蓝色 `#2E74B5`；其余字段为 16 pt、深灰色 `#1F2937`。

由于本机没有 LibreOffice，本次通过完整解包 `content.xml`、`styles.xml`、`meta.xml` 和 manifest 来核对该单页模板，没有声称完成幻灯片视觉渲染。

### 2.4 第二台 Linux：Thunderbird 本地草稿环境

Setup 创建一个干净的本地 profile：

- Profile：`~/.thunderbird/mail.default-release`
- `profiles.ini`：将该 profile 设为默认 profile
- 身份邮箱：`agent@example.test`
- 身份显示名：`Field Operator`
- Account 类型：`none`，使用 `Mail/Local Folders`
- 初始 Drafts mbox：`~/.thunderbird/mail.default-release/Mail/Local Folders/Drafts`，为空
- 同时创建空 `Drafts.msf`

没有预置来信或草稿，也没有外部邮件服务器；任务只要求创建本地 draft，不要求发送。

### 2.5 预期输出

- `linux_1:/tmp/training/field_onboarding_deck.odp`
- `linux_1` 的上述 Thunderbird profile 中的一封匹配草稿

## 3. Setup 具体流程

### `android_0`

1. 确保 Simple Calendar Pro 可用。
2. 清空 Calendar。
3. 写入第 2.1 节培训事件。

### `android_1`

1. 确保 Simple Calendar Pro 和 Contacts 可用。
2. 清空 Contacts。
3. 写入 Alex Kim 与 Priya Rao 的完整电话、邮箱和 notes。

### `linux_0`

1. 删除旧 `/tmp/training` 后重建目录。
2. 上传 `training_template_196.odp`，目标名为 `training_deck.odp`。

### `linux_1`

1. 删除旧 `/tmp/training` 后重建目录。
2. 删除旧的 `mail.default-release`，重建第 2.4 节的本地 Thunderbird profile、identity 和空 Drafts。
3. 不预置 ODP 输出，也不会把第一台 Linux 的模板自动复制到第二台。

Cleanup 清除 Calendar、Contacts、两台 Linux 的 `/tmp/training`，并删除任务创建的 Thunderbird profile 和 `profiles.ini`。

## 4. Evaluator：评测方式与具体评测点

本任务有 2 个默认启用 evaluator，各占 `1/2`；任务级 `success` 要求 ODP 与邮件草稿都通过。

### 4.0 先说人话：怎样才算通过

要完成两个东西：

1. 在第二台 Linux 上生成一页培训幻灯片，填入：
   - `Field onboarding`
   - `2026-06-18`
   - `16:00-18:00`
   - `Training room A`
   - `Alex Kim, Priya Rao`
2. 在 Thunderbird 中保存一封草稿，收件人恰好是：
   - `alex.kim@example.test`
   - `priya.rao@example.test`

邮件正文最简单可以写：

```text
Field onboarding training package is ready.
```

这封草稿不需要发送，也不要求添加 ODP 附件，subject 甚至可以为空。事件名必须出现在正文，只写在 subject 里不够；多加第三个收件人也会失败。

### 4.1 `field_onboarding_deck.odp`（权重 `1/2`）

- `func`：`check_odf_text`
- getter：`vm_file`
- 实现：解析 ODP ZIP、manifest、`content.xml` 与 `styles.xml` 的可见结构；不是文件字节或哈希绝对相等。

#### 包和总体文本

必须满足：

1. 是结构有效的 presentation ODF 包，根 mimetype 正确，并包含 `styles.xml`、`meta.xml` 及标准 manifest/content 成员。
2. 至少有一个 draw page；后续结构合同进一步要求恰好 1 个可见页面。
3. 可见文本不区分大小写地包含 `Training Package Template`。
4. 不得保留 `[[EVENT]]`、`[[DATE]]`、`[[TIME]]`、`[[LOCATION]]`、`[[ATTENDEES]]`。
5. 不得出现 `missing attendee`、`wrong event` 或 `result.json`。

#### 单页/单 frame 结构

- 恰好 1 个可见页面。
- 标题 anchor `Training Package Template` 必须只定位到这 1 页。
- 该页恰好 1 个可见 frame。
- anchor 与五个字段必须处于同一个 frame。
- 该 frame 中恰好 6 个可见段落。
- 每个字段必须采用可解析的单段 `Label: Value` 形状；同一 label 只能出现一次。

#### 字段值

| Label | 评测合同 |
|---|---|
| `Event` | 忽略大小写及多余空白后整值等于 `Field onboarding` |
| `Date` | 日期解析结果等于 `2026-06-18`；接受等价自然日期写法 |
| `Time` | 恰好解析出 `16:00` 与 `18:00` 的时间范围；接受等价 12/24 小时写法 |
| `Location` | 整值等于 `Training room A` |
| `Attendees` | 精确集合 `{Alex Kim, Priya Rao}`；顺序不限，可用逗号、分号、`and` 或 `&` 分隔，不能漏、加或重复 |

#### 页面与 frame 几何

- 页面必须横向。
- 宽高比目标为 `1.3333333333`，允许误差 `0.2`。
- frame 相对页面尺寸必须落入：
  - `x`: 0.04–0.15
  - `y`: 0.04–0.15
  - `width`: 0.70–0.95
  - `height`: 0.65–0.90
- 页面必须通过 master page 关联到 page layout，frame 必须引用 graphic-family 样式。

Evaluator 没有把模板的蓝色、字体字号、灰色填充和边框颜色写成计分合同；这些是附件真实样式，但不是本项必须逐色保留的评测点。

### 4.2 Thunderbird 草稿（权重 `1/2`）

- `result.type`：`thunderbird_draft_state`
- Profile 被严格限定为 `~/.thunderbird/mail.default-release`。
- getter 找到匹配草稿时返回 `present`，`exact_match` 要求状态恰好为 `present`。

读取范围与过滤：

1. 只读取该 profile 下 `Mail/Local Folders/Drafts` mbox，以及 Drafts/`.Drafts` 的 Maildir `cur`、`new`。
2. 忽略带 Mozilla expunged/deleted 状态的 mbox 邮件和 Maildir `T`（trashed）条目。
3. 收件人从 To、Cc、Bcc 以及 resent recipient headers 合并为不区分大小写的集合。

匹配要求：

- 同一封草稿的收件人集合必须恰好为：
  - `alex.kim@example.test`
  - `priya.rao@example.test`
- 不能多出第三个收件人。
- 草稿正文中必须有一个肯定、非疑问、非不确定的 clause 包含完整短语 `Field onboarding`。
- 只在 subject 写 `Field onboarding`、正文不写，不能满足 `body_contains`。
- 后续正文若撤销、否定、标为错误/过时，或用 `maybe/might/unknown` 等不确定表达反转该事件声明，会失败。

### 4.3 未被邮件 evaluator 要求的内容

- 不要求 subject 非空，也不检查 subject 中的事件名。
- 不要求附件；ODP 不需要附到草稿。
- 不要求固定发件人字段、固定 MIME 形状或固定正文全文。
- 不要求 profile 中恰好只有一封草稿；只要存在至少一封匹配草稿即可。
- 不要求实际发送邮件。
