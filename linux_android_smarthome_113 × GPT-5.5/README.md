# linux_android_smarthome_113 × GPT-5.5

使用论文已采用的六次独立子任务测试及对应主实验 E2E 运行。未重跑，未重新裁决。运行目录内原文件名与层级保留，凭据如有发现则在副本中移除。

| 运行入口（完整轨迹） | 实际步数 | 采用结果 | 原始截图数 |
|---|---:|---|---:|
| [S01](independent_subtasks/S01/trajectory.json) | 2 | PASS | 4 |
| [S02](independent_subtasks/S02/trajectory.json) | 3 | PASS | 6 |
| [S03](independent_subtasks/S03/trajectory.json) | 4 | PASS | 0 |
| [S04](independent_subtasks/S04/trajectory.json) | 4 | PASS | 6 |
| [S05](independent_subtasks/S05/trajectory.json) | 7 | PASS | 14 |
| [S06](independent_subtasks/S06/trajectory.json) | 2 | FAIL | 0 |
| [E2E](e2e/trajectory.json) | 33 | FAIL | 95 |

S01—S06 是六次分别重置、独立执行的测试；S04—S06 使用参考构造的前序条件，不使用 S01—S03 模型的实际输出。六次合计 22 步，5/6 通过，All-Subtask 未通过。E2E 是另一次连续跨设备运行，33 步，未通过。本案例不属于“子任务全部通过但 E2E 失败”。

## 文件入口

- 每个目录的 trajectory.json：从 reset 初始观测到逐轮动作、执行反馈或错误及结束动作的完整记录；SmartHome 返回包含在观察和 info 中。
- execution_history.jsonl：初始化、模型请求、动作执行及评估等事件。
- config/、materialized_inputs/、stage_runtime_manifest.json：各独立子任务实际指令、目标设备、前序参考输入和初始化配置；prompts/ 保留实际逐轮模型输入。
- artifacts/：全部原始截图及 Android UI 元素记录。SmartHome 使用结构化观察，没有补入展示重跑的控制台画面。
- S01—S03 的 semantic_judge_input.json、semantic_judge_result.json：实际提交的信息报告与判定依据。
- stage_result.json、result.json、evaluator_trace.json：运行结果及对应检查项、实际值和期望值。
- [selection.json](selection.json)：七个原始目录、论文选中记录与交付位置的对应关系。
- [artifact_availability.json](artifact_availability.json)：原生文件、应用记录及状态证据的保存情况。

## 产物保存情况

S04 的 DOCX 原文件未归档在该运行目录；已有创建命令、2380 字节文件的文本回读及通过的 DOCX 评估记录。评估器引用的是共享缓存，该缓存已被后续运行改写，因此未将其当作本次产物打包，也未以任务标准答案或展示重跑文件替代。

S05 保留发送动作、执行反馈、应用截图和 sent-message 检查结果，没有单独的短信数据库导出。S06 的真实工作流结构保存在轨迹与 evaluator_trace.json 的 actual 字段。E2E 同样保留其原始产物操作与最终评估证据，未单独归档 DOCX 或短信数据库。

reference_inputs/ 附上现有任务标准表和住宅配置供阅读；各次运行保存的配置快照、初始观测和实际读取结果是历史状态的依据。各运行当时的评估定义均原样保留，没有用当前定义重评。

共保留七个运行目录的 416 个原始文件、125 张截图。日志中的原始路径未重写；跨机器阅读时，可用 selection.json 的目录对应关系定位包内同名相对路径。
