# 4.4 Failure Analysis

我们对本机Gemini 3.1 Pro Preview、Crab-MAE（GPT-5.5）和Mobile-Agent-v3.5（GUI-Owl-1.5-32B-Instruct）的既有主实验进行定性分析，核验六条失败轨迹，并以两条成功轨迹作有限对照。案例依据公开目标、历史动作、执行反馈及关键观测选取，不构成覆盖全部失败的互斥分类，也不估计各原因的总体占比。以下四个案例揭示了三种可观察的执行问题。

首先，局部操作成功不保证其作用于任务指定对象。在笔记转文档任务中，Gemini的目标是读取“Memo draft”，却打开了同一列表中的“Color Light Request”，随后将后者的香氛说明转换成Linux上的ODT并结束（G1）。历史截图和转换反馈表明，失败不在文档生成，而在来源身份与下游内容的绑定。Crab也出现了对象替换：面对将普通卧室灯调到35%的请求，它成功调整了另一盏可调光灯，却未处理指定灯的能力限制（C1）。这是一个Home环境内的家电错选，不是跨设备实例路由错误；同任务的Gemini成功对照保留了原目标并报告不可行（S2）。

其次，明确的局部执行错误未必引出有效恢复。Mobile-Agent在双Linux转换任务中已取得三条CSV订单，并将数据带到正确目标设备，但生成的单行Python在分号后使用with语句，持续返回SyntaxError（M1）。首次修改只替换变量名，后续48次命令完全相同，直到动作预算耗尽，仍未生成所需JSON。相同任务的Gemini对照用多行脚本成功写入（S1）。因此该例不能概括为跨设备信息未传递；失败发生在目标端的转换与修复回路。日志外层调用成功与内层子进程失败并存，也提醒我们不能将工具调用返回等同于任务动作成功。

最后，正确子目标仍可能被阻断在动作编排接口。Crab在卧室设置任务中已输出亮度20%和关帘的正确要求，却反复在同一协调轮提交两个Home动作，被“每环境每轮一个动作”的协议拒绝（C2）。联系人确认样式后来已经可见，但这种批次错误没有被有效拆分恢复；完整轨迹中没有一次Home动作执行，最终灯光与窗帘仍保持原状态。这里的证据指向当前模型、框架和适配接口组成的系统行为，而不是基础模型不会调光，也不能仅据来回切换应用就断言记忆丢失。

这些案例提示，应区分对象匹配、动作合法性、调用反馈和最终业务状态。目标绑定检查、可执行动作编排及面向错误反馈的恢复策略值得进一步检验，但本轮没有验证任何新增模块的改善效果；上述机制也不被用于解释所有baseline或全部跨设备性能差距。

## 图表占位：紧凑案例表

拟置于正文末尾的Table X；较长轨迹、G2/M2及成功对照放附录。以下为内容占位，不是失败频率统计。

| 机制 | 模型与任务 / Case | 关键证据 | 未满足结果 |
|---|---|---|---|
| 来源对象绑定错误 | Gemini；al_writer_from_note_gui / G1 | 列表有指定笔记，却打开另一笔记；实际转换了错误正文 | 指定通知的文档内容缺失 |
| 同环境内目标替换 | Crab-MAE；plain_light_dimming / C1 | bedroom_dimmable_light_1发生50→35变化；指定bedroom_light_1未被正确处理 | 请求对象的能力限制未处理 |
| 错误后的无效重复 | Mobile-Agent；l2_csv_to_json / M1 | 已读CSV；SyntaxError后48次相同命令 | 目标JSON未生成 |
| 动作编排不符合接口 | Crab-MAE；android_smarthome_251 / C2 | 正确参数的双动作批次被拒；没有Home执行step | 灯仍70%、窗帘仍80%开 |

Caption候选：**Selected execution failures from three local baseline systems.** 案例展示指定对象、命令恢复与合法动作编排之间的不同断点；记录的是定向核验的轨迹事实，不代表错误类别频率或基础模型的独立因果效应。

### 候选证据素材位置

以下均为仓库相对路径。JSON事件索引零基；截图已实际查看，不重绘真实观测。长任务名及完整模板见 [failure_cases.md](failure_cases.md)。

- G1：`runs/core200-rerun-20260826/gemini-3.1-pro-preview-lite/PC-20260130VLZZ/run_01/017_al_writer_from_note_gui/artifacts/android_0/screenshots/step_002.png`与`step_006.png`；同attempt的`trajectory.json` events[4]为实际错误内容写入及转换反馈。
- C1：`runs/core200-rerun-20260826/crab-mae-gpt55-core200/PC-20260130VLZZ/run_01/192_sh3_explicit_control_plain_light_dimming_infeasible_0013/trajectory.json`，events[0]的Home设备列表、events[2].info中的before/after；无需虚构Home截图。
- M1：`runs/core200-rerun-20260826/mobile-agent-v3.5-gui-owl15-32b/PC-20260130VLZZ/run_01/007_l2_csv_to_json/trajectory.json`，events[2].info.stdout、events[4].info.stderr，以及events[6]至events[100]的step动作与反馈。图表若摘录错误，只保留SyntaxError和相关结构，不复制整段冗长日志。
- C2：`runs/core200-rerun-20260826/crab-mae-gpt55-core200/PC-20260130VLZZ/run_01/146_android_smarthome_251/trajectory.json`，events[5]与events[86].diagnostics.coordination_errors；同目录`evaluator_trace.json` evaluators[1:3].actual给出未改变的Home状态；`artifacts/android_0/screenshots/step_047.png`显示实际可见的联系人样式。
