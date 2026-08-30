# DevicesWorld 60-Task Device-Level Decomposition Experiment Plan

## 1. 目标

本实验用于分析 DevicesWorld 中完整跨设备任务的低成功率，究竟有多少来自单个设备上的局部操作能力不足，又有多少来自跨设备信息传递、依赖维护和端到端组合困难。

核心思路是：

> 从冻结后的 Core-200 中采样 60 个具有代表性的任务，按照任务依赖拓扑和执行设备，将每个完整任务拆分为若干 device-local stages。随后使用同一个固定模型分别独立执行这些 stages，并与原始完整任务的 E2E 结果进行比较。

该实验是 diagnostic experiment，不是重新构造一个新的 benchmark，因此不要求为每一个拆分 stage 开发与主 benchmark 同等复杂的 evaluator。

---

## 2. 第一阶段：采样 60 个代表性任务

目前 60 个任务尚未采样。

应先从冻结后的 Core-200 中进行分层抽样，而不是根据模型成功/失败结果人工挑选。

### 2.1 采样需要覆盖

尽量覆盖：

- 不同设备组合；
- 2 / 3 / 4 台设备；
- Android / Linux / SmartHome 的不同组合；
- same-type multi-device 与 heterogeneous-device tasks；
- 不同难度；
- 不同 task families / builders；
- 不同任务模式；
- 不同 dependency topology，例如：
  - chain；
  - fan-in；
  - fan-out；
  - return dependency；
  - multi-output / joint postconditions。

同时避免：

- 大量来自同一模板或 builder 的近重复任务；
- 只选择容易拆分的任务；
- 根据已有模型成功率、score、trajectory 或 failure type 进行筛选。

### 2.2 推荐流程

1. 整理 Core-200 的任务 metadata；
2. 根据设备组合、设备数量、difficulty、task family、dependency pattern 等分层；
3. 使用固定随机种子进行 deterministic sampling；
4. 生成 60 个 primary tasks；
5. 额外准备少量 backup tasks；
6. 人工快速检查：
   - 是否存在明显重复；
   - 是否能够形成清晰的 dependency graph；
   - 是否适合进行 device-level decomposition；
7. 冻结最终 Diagnostic-60 task list。

---

## 3. 第二阶段：为每个任务建立依赖拓扑

对每个 sampled task，根据 instruction、setup、source information、required outputs 和 expected outcomes，恢复其任务依赖关系。

复杂任务可以表示为 DAG，例如：

```text
                    S2 (Android-1)
                  ↗                 ↘
S1 (Linux-1)                           S4 (Linux-1)
                  ↘                 ↗
                    S3 (Android-0)
```

这里：

- S1 位于第一 dependency layer；
- S2、S3 位于同一 dependency layer，但执行设备不同；
- S4 虽然与 S1 都位于 Linux-1，但位于不同 dependency layer，因此仍然必须作为独立 stage。

---

## 4. 第三阶段：按照“依赖层级 + 设备”进行拆分

拆分单位定义为：

> **device-local semantic stage**

而不是简单地“一台设备对应一个子任务”。

### 基本规则

#### Rule 1：不同 dependency layer 必须拆分

即使两个阶段发生在同一台设备上，只要后一个阶段依赖中间其他 stage 的结果，也应分别测试。

例如：

```text
Linux-1 → Android-0 → Linux-1
```

前后两个 Linux-1 操作属于不同 stage。

#### Rule 2：同一 dependency layer、不同设备必须拆分

例如：

```text
Android-0 读取联系人
Android-1 读取验证码
```

二者应作为两个独立 stage。

#### Rule 3：同一 layer、同一设备中语义连续的操作可以合并

不要把每一次 read、click 或局部操作机械拆成独立 stage。

拆分粒度应足以定位跨设备依赖问题，但不能退化成 primitive-action benchmark。

---

## 5. Intermediate Semantic Stages

很多 stage 的作用不是改变环境，而是：

- 读取短信；
- 获取联系人；
- 查看 Calendar；
- 读取 CSV / JSON / 文档；
- 理解 policy / rule；
- 从 SmartHome 查询状态；
- 提取后续任务需要的信息。

这类 stage 在原始完整任务中通常没有独立 evaluator。

因此本实验不要求为它们重新开发复杂 programmatic evaluator。

### 5.1 Stage 输出

完成该 stage 后，让模型显式报告自己获取或理解到的 task-relevant information。

只需要报告：

> downstream execution 所必需的信息。

不要求复述完整 source content。

---

## 6. Intermediate Stage 的评估

对于读取、提取、理解规则、语义整合等 intermediate stages，采用固定的 **AI semantic judge**。

Judge 主要判断：

> 模型输出是否正确、充分地保留了后续阶段完成任务所需的信息，并且没有加入会导致后续执行错误的实质性错误。

重点考虑：

- Correctness；
- Sufficiency / Completeness；
- No material distortion。

建议输出：

```text
PASS
FAIL
UNCERTAIN
```

对 `UNCERTAIN` 或少量抽样结果进行人工复核即可。

AI judge 的 prompt、输入格式和判定标准应在正式实验前固定，不根据结果不断调整。

---

## 7. Environment-Changing Stages 的评估

对于真正产生环境结果的 stage，例如：

- 发短信；
- 写文件；
- 修改 CSV / JSON；
- 填写网页；
- 创建 note / calendar record；
- 编写邮件；
- SmartHome control；
- 创建 scheduled task；

优先复用原任务 evaluator 中与该 stage 对应的 evaluation items。

如果原 evaluator 可以自然拆出对应 subset，则直接复用。

如果无法合理复用，则采用简单 stage-specific success criterion 或 AI judge，但不需要为了 60-task diagnostic experiment 重写一整套复杂 evaluator。

---

## 8. Gold Predecessor State 与 Gold Handoff

每一个 stage 都应被独立测试。

后续 stage 不应接收前序 stage 实际运行产生的错误输出，而应接收：

> 理论上前序 stage 正确完成后应该产生的 gold information 和 gold environment state。

例如：

```text
S1 (Linux-1)
        ↓
S2 (Android-1)
S3 (Android-0)
        ↓
S4 (Linux-1)
```

测试 S4 时应保证：

1. Linux-1 保留 S1 正确完成后应存在的环境修改；
2. S4 收到 S2 理论上应提供的正确信息；
3. S4 收到 S3 理论上应提供的正确信息；
4. S2 / S3 在各自 isolated run 中是否成功，与 S4 的输入无关。

这样才能真正测量：

> S4 本身在前置条件正确时是否可解。

---

## 9. Stage 初始化

需要区分两类 predecessor 影响。

### 9.1 Information Handoff

如果 predecessor 只是读取或理解信息，则将理论正确的信息作为 downstream context 提供。

### 9.2 Environment-State Handoff

如果 predecessor 会修改设备状态，例如：

- 新建文件；
- 修改文件；
- 创建记录；
- 改变 SmartHome state；
- 创建某种应用状态；

那么 downstream stage 的环境初始化必须恢复到 predecessor 正确完成后的 gold state。

不能只传文本信息而忽略环境状态。

---

## 10. 正式运行

最终冻结 60 个任务及其 decomposition specs 后，使用同一个固定模型执行：

1. 原始完整 E2E task；
2. 每个拆分后的 isolated stage。

如果当前 Core-200 主实验结果与任务版本和配置完全一致，可以直接复用对应 60 个任务的 E2E 结果。

否则重新运行。

每个 stage 至少保存：

- task / stage ID；
- stage instruction；
- predecessor dependencies；
- gold handoff；
- initialization reference；
- trajectory；
- stage output；
- stage success judgement；
- judge output / evaluator result；
- steps；
- termination reason。

---

## 11. 主要指标

### 11.1 Stage Success

所有 isolated stages 的平均成功率。

用于观察局部阶段本身的可解性。

### 11.2 Local-All Success

以原始任务为单位。

只有某个完整任务拆出的 **所有 stages 都独立成功** 时：

```text
Local-All = 1
```

否则：

```text
Local-All = 0
```

然后计算 60 个任务的 Local-All Success Rate。

### 11.3 E2E Success

同一批 60 个原始任务在完整跨设备执行中的成功率。

### 11.4 Conditional E2E

只考虑 `Local-All = 1` 的任务：

> 当每一个局部 stage 都独立可解时，完整任务最终仍然有多少能够端到端成功？

### 11.5 Composition Gap

比较：

```text
Local-All Success
vs.
E2E Success
```

用于衡量局部组件能够独立完成，但组合到完整跨设备 episode 后产生的性能下降。

论文中建议称为：

> **cross-device / end-to-end composition gap**

而不要过度解释为纯粹的 coordination gap。

---

## 12. 可选分析

在不增加额外运行成本的情况下，可以简单按 stage 类型分析：

- information acquisition / semantic interpretation；
- environment execution。

如果样本量合适，也可进一步区分：

- source acquisition；
- local processing / decision；
- target execution。

该分析为可选项，不应影响主实验执行。

---

## 13. Decomposition 需要人工 Review

不建议完全自动生成后直接运行。

推荐：

1. Codex / LLM 根据 task spec 生成 decomposition proposal；
2. 输出 dependency graph；
3. 输出每个 stage：
   - device；
   - dependency layer；
   - predecessor；
   - stage goal；
   - expected handoff；
   - gold predecessor state；
   - evaluation method；
4. 人工快速 review；
5. 修正明显：
   - 过度拆分；
   - 漏掉 dependency；
   - 错误 device assignment；
   - gold handoff 不完整；
   - stage instruction 泄漏答案；
6. 冻结 decomposition spec；
7. 再生成 executable stage tasks 并运行。

---

## 14. 推荐整体流程

```text
Core-200
   ↓
Stratified sampling
   ↓
Diagnostic-60
   ↓
Build dependency graph
   ↓
Device-aware stage decomposition
   ↓
Human review & freeze
   ↓
Generate isolated stage tasks
   ↓
Validate stage initialization / evaluation
   ↓
Run fixed model on all stages
   ↓
Compute:
Stage Success
Local-All
E2E
Conditional E2E
Composition Gap
```

---

## 15. Codex 当前阶段优先事项

第一阶段先不要直接开始正式运行。

优先完成：

1. Core-200 metadata 整理；
2. 60-task stratified sampling proposal；
3. Diagnostic-60 sampling report；
4. 60 个任务 dependency graph proposal；
5. decomposition proposal；
6. stage evaluation method proposal；
7. 需要人工确认的问题列表。

完成后等待研究者确认，再进入 executable stage construction 和正式运行。

---

## 16. 最重要的原则

- 60 个任务必须先按预定义规则采样，不能看模型表现后再挑；
- decomposition 基于 task dependency + device，而不是基于模型失败轨迹；
- 不同 dependency layer 的同一设备操作也需要拆分；
- 同一 layer 的不同设备操作必须拆分；
- downstream stage 使用 gold predecessor information / state；
- predecessor 实际执行失败不能污染 downstream stage；
- intermediate semantic stages 使用固定 AI judge；
- 最终环境操作 stage 尽量复用原 evaluator；
- 本实验的目的在于诊断 local solvability 与 end-to-end composition gap，而不是构造新的完整 subtask benchmark。
