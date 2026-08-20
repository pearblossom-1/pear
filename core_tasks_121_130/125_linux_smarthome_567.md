# Core 125 — linux_smarthome_567

- Core 来源：experiments/human_validation1000/core200_manifest.jsonl 第 125 项
- 任务文件：tasks/cross_device/linux_smarthome/linux_smarthome_567.json
- 运行配置：configs/cross_device/local_2linux_smarthome.json
- 难度：hard
- 设备拓扑：2L+1H（linux_0、linux_1、home_0）
- 限制：最多 50 步；任务文件没有单独设置最长秒数

## 0. 任务链与直白结论

第二台 Linux 的 DOCX 要求：

- entryway light 调到 30%；
- entryway curtain 调到 50%。

但 Home 中 entry light 是普通 light，不是 dimmable_light，无法调亮度。第一台 Linux 的 fallback 明确规定：灯不能 dim 时，保持灯不变，把 curtain 设为 50%，并在请求文档里说明灯无法 dim。

所以正确结果是：

- curtain 从 10% 改到 50%；
- light 保持 power=off；
- 更新 request.docx，明确写出 curtain 已到 50%，以及 entry light could not be dimmed。

## 1. Instruction

### 英文原文（逐字）

~~~text
Please finish the entryway setup described in `/tmp/comfort/request.docx` on the second Linux desktop. If one of the requested settings is unavailable, follow the alternative instructions in `/tmp/comfort/alternative.md` on the first Linux desktop. Make the supported changes, then update the request document with what you completed and anything you could not change.
~~~

### 中文翻译

请完成第二台 Linux 桌面上 /tmp/comfort/request.docx 所描述的入口区域设置。如果其中一个请求设置不可用，请遵循第一台 Linux 桌面上 /tmp/comfort/alternative.md 中的替代说明。完成受支持的更改，然后更新请求文档，写明已完成的内容以及无法更改的内容。

## 2. 输入、附件与初始业务数据

本任务没有短信、邮件、音频或图片附件。

### 2.1 linux_1：request.docx 的原始可见内容

~~~text
Entryway setup request
Requested changes
Light: Dim the entryway light to 30%.
Curtain: Set the entryway curtain to 50%.
When you finish
Add a short note explaining what you completed and anything you could not change.
~~~

该 DOCX 共 1 页，无表格、页眉、页脚、批注、脚注、尾注或修订痕迹。

### 2.2 linux_0：alternative.md 的完整内容

~~~text
# If a setting isn't available

If the entryway light cannot be dimmed, leave it unchanged and set the entryway curtain to 50%. In the request document, note that the light could not be dimmed.
~~~

### 2.3 Home 初始状态与实际能力

当前时间：2026-06-25 17:00。

| 设备 | 类型 | 初始状态 | 能力结论 |
|---|---|---|---|
| entry_curtain_1 | curtain | open_pct=10，status=partial | 支持 set_open_pct(50) |
| entry_light_1 | light | power=off | 只支持开/关；没有 set_brightness，不能 dim |

初始 schedules、workflows、history 为空。

## 3. Setup 具体流程

### linux_0

1. 删除旧 /tmp/comfort/alternative.md。
2. 创建 /tmp/comfort。
3. 上传 fallback Markdown。

### linux_1

1. 删除旧 /tmp/comfort/request.docx。
2. 创建 /tmp/comfort。
3. 上传原始 request.docx；同一路径也是最终输出路径。

### home_0

从 linux_smarthome_567/episode_config.json reset Home，恢复 curtain=10%、普通 light=off 和空计划。

Setup 不会自动打开文档，也不会把 request.docx 复制到第一台 Linux。

## 4. 标准操作与推荐文档内容

Home 只需执行：

    entry_curtain_1.set_open_pct(open_pct=50)

不要尝试给 entry_light_1 设置 brightness；保持它为 off。

Oracle 生成的最终 DOCX 可见正文是：

~~~text
Entryway setup request
What was completed
The entryway curtain was set to 50%.
The entryway light could not be dimmed, so it was left unchanged.
~~~

不要求逐字照抄 oracle，但这四行是最稳妥的表述。保留原文并在末尾追加同样意思的完成说明也可以通过。

## 5. Evaluator：评测方式与具体评测点

### 5.0 怎样才算通过

三个 evaluator 都计分且都必须成功：

1. curtain 最终 50%；
2. light 最终仍 off；
3. request.docx 的可见正文满足文本关系规则。

### 5.1 curtain 状态

entry_curtain_1.open_pct 必须等于 50。Evaluator 没有要求 status，但正常命令后会保持 partial。

### 5.2 light 状态

entry_light_1.power 必须等于 off。它检查最终状态，不检查是否曾发出一个失败的 dim 命令；正确做法仍是识别 capability 后不发送不支持的命令。

### 5.3 request.docx：不是整篇绝对匹配

评测函数 check_docx_text 会打开 DOCX 压缩包、解析 word/document.xml，并检查可见正文。它不是把整份文件与 oracle DOCX 做二进制或全文逐字比较，也不检查字体、页边距或原模板是否保留。

首先必须在正文任意位置包含 `curtain`，大小写不敏感。

然后正文整体必须出现以下四类实体，每类至少命中一个允许表达：

1. curtain：entry curtain / entryway curtain / curtain；
2. 50%：50 percent / 50% / half open / half-open / halfway open / halfway；
3. light：entry light / entryway light / light；
4. 无法调光：下方任一允许短语。

无法调光的完整允许短语列表：

- could not be dimmed
- couldn't be dimmed
- cannot be dimmed
- can't be dimmed
- does not support dimming
- doesn't support dimming
- dimming is unavailable
- dimming was unavailable
- brightness cannot be adjusted
- brightness can't be adjusted
- brightness could not be adjusted
- brightness couldn't be adjusted
- brightness control is unavailable
- brightness control was unavailable
- light setting is unavailable
- light setting was unavailable

还要满足两个“同一语义分句”关系：

- curtain 表达与 50% 表达必须出现在同一个 clause；
- light 表达与“无法调光”表达必须出现在同一个 clause。

这里的 clause 大致按分号、竖线、换行，或句号/问号/感叹号后面的空白切分。因此最稳妥的是写成两个完整句子：

~~~text
The entryway curtain was set to 50%.
The entryway light could not be dimmed, so it was left unchanged.
~~~

第二类 clause 不能同时包含以下冲突说法：

- was dimmed
- dimming succeeded
- brightness was adjusted
- brightness was set

例如 `The entry light could not be dimmed, but brightness was set.` 会因为自相矛盾而失败。

Evaluator 还会拒绝明显的问句、不确定说法或后续撤销式表述；上面的直接肯定句最安全。

### 5.4 原始 DOCX 对匹配的影响

原始正文已经含有 `Curtain: ... 50%.`，所以 curtain+50 关系本来就存在；但原始的 `Light: Dim ... 30%.` 不是“无法调光”的陈述。最终文档仍必须增加 light 与 negative-capability phrase 同一 clause 的说明。

Evaluator 没有 template_structure 规则，因此可以追加段落，也可以重写正文；只要文件仍是可解析的 DOCX 且可见文本满足上述关系即可。

## 6. 常见失败与真实评测边界

- 只改 Home、不保存 DOCX：文本检查失败。
- 文档只写 `could not be dimmed`，但同一 clause 没出现 light：失败。
- 文档只写 `curtain completed`，没出现 50% 或同 clause 关系：失败。
- 写 `light dimming succeeded`：与要求冲突。
- 把 light 打开或改变其最终 power：Home 检查失败。
- 把 DOCX 误存成纯文本但仍取名 .docx：无法解析，失败。
- 评测不要求保留原始六个段落，但 instruction 的业务含义是“更新请求文档”，推荐保留清晰标题和完成记录。

## 7. Cleanup

- linux_0 删除 alternative.md，并尝试删除空目录。
- linux_1 删除最终 request.docx，并尝试删除空目录。
- home_0 reset。

