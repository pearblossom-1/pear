# Diagnostic-60 Prompt v2 Cleanup and Final Freeze

当前 Diagnostic-60 的 Final-60、235-stage decomposition、dependency DAG、gold handoff/state、
evaluator ownership、single-device runtime 和 preflight lifecycle 已基本确认。

本轮只对 **model-visible prompt / request wording** 做最后一次清理，使 GPT-5.5 以普通单设备 Agent 的方式执行任务，
而不是显式知道自己正在参加 isolated-stage / decomposition 实验。

**不要修改采样、DAG、stage boundary、gold semantics 或 evaluator ownership。**
**不要启动完整的 235-stage 正式实验。**

---

## 1. 核心原则

实验内部可以继续使用：

- Diagnostic-60
- isolated stage
- stage ID
- dependency layer / DAG
- gold handoff
- gold predecessor state
- sibling stage
- E2E
- Local-All
- global-only evaluator

这些术语继续保留在：

- executable spec
- runner
- manifest
- logging
- analysis metadata

但 **不要把这些实验内部术语暴露给执行模型**。

模型只需要知道：

- 当前需要完成的任务；
- 当前可以操作的一个设备；
- 当前设备 observation；
- 合法提供的 prior context；
- 当前任务自己的最近交互历史；
- 当前设备的 action space。

---

## 2. 更新三版 device-specific system prompt

仍然保留三版：

- Android
- Linux
- SmartHome

继续以 Core-200 GPT-5.5 baseline prompt 为母版做最小化 device-local adaptation。

### Android 首句建议

将类似：

> You are an isolated-stage agent controlling one fixed Android device on behalf of the user. Your goal is to complete the supplied local stage exactly as instructed, leaving the required local artifact or state available to the user.

改为：

> You are an agent controlling one Android device on behalf of the user. Your goal is to complete the task exactly as instructed, leaving the requested app state or result available to the user.

### Linux 首句建议

> You are an agent controlling one Linux desktop on behalf of the user. Your goal is to complete the task exactly as instructed, leaving the requested file, application state, browser state, or result available to the user.

### SmartHome 首句建议

> You are an agent controlling one SmartHome environment on behalf of the user. Your goal is to complete the task exactly as instructed, leaving the requested smart-home state or result available to the user.

SmartHome 不要写成 “one SmartHome device”，因为 `home_0` 是一个 SmartHome environment/runtime，
其中可以包含多个 physical appliances。

---

## 3. 删除 model-visible 的实验术语

请检查三版 system prompt 和实际每轮 rendered model request，
不要让模型看到以下类型的表述：

- isolated-stage agent
- isolated stage
- local stage
- decomposition
- dependency layer
- gold predecessor / gold handoff
- sibling stage
- predecessor run
- E2E
- frozen device
- frozen spec
- information-acquisition stage
- environment-execution stage
- global-only evaluator
- runner routes to the frozen device

这些词可以继续存在于内部代码和 metadata 中，只是不进入模型可见内容。

---

## 4. 自然化 Fixed-device boundary

例如当前类似：

> The current device instance is {{DEVICE_ID}}. The decomposition already fixed it; do not select or route to a device.

改为：

> The current device is {{DEVICE_ID}}. You can act only on this device.

并补充：

> Do not assume access to any other device or to information that is not explicitly provided in the task context or current observation.

不要提 decomposition、sibling stage 或 E2E。

---

## 5. 自然化 predecessor context

实验内部仍然使用 frozen gold predecessor context。

但模型可见内容不要叫：

> Gold predecessor context

统一改成自然表述，例如：

> Available context

或：

> Information available from prior completed work

System prompt 中类似：

> Gold predecessor context in the stage instruction is authoritative and remains visible on every turn.

改为：

> Any provided prior context is part of the task input and remains available on every turn.

不要告诉模型这些信息是 oracle / gold。

---

## 6. 自然化 Observation Model

不要写：

> persistent isolated-stage instruction

建议类似：

> Each turn includes the task instruction, the current device identity, the current observation from that device, the last 10 textual interaction records for this task, the previous action/result, any previous error, and any provided prior context.

保持：

- task instruction persistent；
- prior context persistent；
- current single-device observation；
- last-10 local textual history；
- previous action/result/error。

不要加入其他设备 observation 或其他 stage trajectory。

---

## 7. 自然化 information / execution completion wording

不要告诉模型：

> For an information-acquisition stage...
> For an environment-execution stage...

改成普通任务类型描述：

> If the task asks you to inspect, retrieve, or report information, include the concrete result in `observation_description` when you finish. If the task asks you to create or modify an artifact or environment state, perform the requested change before finishing.

内部仍然可以根据 stage type 选择 Semantic Judge 或 local evaluator。

---

## 8. 去掉 runner implementation wording

模型不需要知道 runner。

例如：

> the runner routes non-global actions to the frozen device

改为：

> Do not include `target_device` or a top-level `device_id`; all local actions apply to the current device.

底层仍由 runner 自动 route，不改实现语义。

---

## 9. 清理每轮 user/request message

不仅检查 system prompt，也检查实际发送给 GPT-5.5 的每轮输入。

不要出现类似：

```text
Isolated Stage Instruction:
...

Gold Predecessor Context:
...
```

建议统一渲染成类似：

```text
Task:
...

Available context:
...

Current device:
...

Current observation:
...

Recent interaction history:
...
```

如果没有 prior context，则省略 `Available context`。

Stage ID、gold source、DAG predecessor 等信息继续记录在 trajectory metadata，
但不放进 model-visible text。

---

## 10. 保持 action semantics 不变

继续保持：

- 模型不选择 target device；
- 模型不输出 top-level `device_id`；
- runner 根据 executable spec 路由到当前设备；
- 模型仍知道当前具体 device instance，例如 `android_1` / `linux_0`；
- SmartHome physical appliance ID 继续放在 `parameters.device_id`；
- 每轮只暴露当前设备 observation；
- prior context 每轮持续可见；
- history 仅当前任务最近 10 条文本交互；
- max_environment_steps = 30；
- max_agent_execution_wall_time = 600s。

不要因为本轮 prompt 清理改变这些协议。

---

## 11. Prompt version bump

由于正式 235-stage run 尚未开始，本轮属于 pre-run prompt cleanup。

请：

- 将三版 prompt 从 v1 bump 到 v2；
- 更新 prompt manifest；
- 更新 template hash；
- 更新 executable freeze manifest；
- 保存新的 prompt diff / adaptation notes。

内部文件名包含 `isolated_stage` 可以继续保留，不需要重构工程命名。

---

## 12. 验证 model-visible request

增加一个自动或人工检查：

对 Android / Linux / SmartHome 各渲染至少一个完整实际 model request，
确认模型可见文本中不再出现以下实验内部词：

- isolated
- decomposition
- gold predecessor
- gold handoff
- sibling-stage
- predecessor-run
- E2E
- Local-All
- frozen device

注意不要误伤正常 task instruction 中偶然出现的普通词；重点检查 runtime-added framing。

---

## 13. 重新执行轻量 preflight smoke

修改 prompt 后，重新执行之前代表性的少量 lifecycle smoke，
至少覆盖：

- Android information task + Semantic Judge；
- Android environment task + local evaluator；
- SmartHome task；
- Linux same-device re-entry / prior state；
- Linux native artifact transfer。

目的只验证：

- prompt/request rendering；
- parsing；
- routing；
- lifecycle；
- evaluator/judge；
- logging。

**不要根据 smoke 的模型 PASS/FAIL 再优化 prompt。**

如果只有 prompt wording 改动而 runtime semantics 没变，不需要重新设计 DAG 或 gold handoff。

---

## 14. 最终 freeze

完成后记录：

- prompt v2 IDs；
- prompt hashes；
- freeze manifest；
- runtime commit SHA；
- smoke result references；
- `formal_isolated_stage_runs_started = 0`。

完成后停止并汇报。

等待人工确认后，再正式启动：

`GPT-5.5 × 235 single-device local-task runs`

正式运行开始后，不再根据模型表现修改 prompt、DAG、gold handoff 或 evaluator。
