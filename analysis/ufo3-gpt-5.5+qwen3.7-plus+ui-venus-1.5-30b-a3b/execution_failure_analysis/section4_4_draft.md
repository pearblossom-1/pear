## 4.4 Failure Analysis

我们从 UFO³+GPT-5.5、Qwen3.7-plus 与 UI-Venus 的 Core-200 正式 selected attempts 中定向复核了八个失败任务，并用同任务成功运行与一个三系统均成功的任务作对照。该分析旨在揭示可观察的执行机制，而非建立互斥错误分类或估计各原因在全部失败中的比例。三个系统的任务快照一致，但 policy、adapter 与 runtime 版本不同，因此案例差异应理解为 baseline-system 行为，而不是严格的纯模型消融。

首先，局部探索可能耗尽共享预算并阻断仍可独立推进的工作。在日历冲突任务中，UFO³ 的 49 次环境动作全部用于 Android 日历，Linux 规则读取、CSV 更新和日志生成始终没有执行；达到 50 次 policy-call 上限时也未触发重规划，两个最终产物均未满足（C01）。这提示跨设备编排需要依据“是否获得新信息”而非仅依据动作是否成功来判断进展，并在局部停滞时保留其他就绪节点的执行机会。

其次，模型可能已经取得正确 source 内容，却没有完成设备边界上的信息搬运。UI-Venus 在 CSV 转 JSON 任务中读出了第一台 Linux 的三条订单，也明确知道目标位于第二台 Linux，但随后反复在目标机打开只存在于源机的同一路径，每次均收到 `FileNotFoundError`，直至步数耗尽。Qwen 与 UFO³ 在同一任务成功，说明失败不是转换规则或任务不可完成，而是源数据未被带入目标设备上下文，且相同错误没有触发替代策略（C02）。

第三，计划对象存在并不等价于目标效果完整。读取同一条 19:30 短信后，Qwen 创建了空气净化器 high 与窗帘 close 的 workflow，却遗漏了初态为 off 的净化器 `turn_on`；UI-Venus 只安排了 high，连窗帘动作也缺失。UFO³ 的成功对照同时包含开机、调档和关帘三步（C03）。因此，计划提交前需要依据初始状态模拟合成效果，并逐项核对所有设备约束，而不能以单个显著参数更新代表联合目标完成。

最后，模型的完成声明可能与环境中的持久状态脱节。播放列表审计任务中，UFO³ 子代理生成了正确写文件命令和四行 CSV，却在同一响应中返回 `FINISH`；runner 将子任务记为 completed，而实际环境 action 为 null，最终文件不存在。UI-Venus 则真正创建了文件，但把 manifest-only 曲目误标为 extra，并遗漏 playlist-only 曲目；Qwen 的同任务成功结果构成对照（C04）。前者要求完成协议绑定已执行动作或保存后回读，后者要求在写入前验证集合差和记录覆盖。上述案例共同表明，改进既需要跨设备调度与设备归属追踪，也需要针对原子效果和持久提交的结果级校验；它们并不支持把所有失败统一归因于“协调”。四设备成功反例 SC01 进一步表明，设备数量本身不是失败的充分条件。

### 表 X 占位：代表性执行失败及其下游影响

| 可观察机制 | baseline / task | 关键轨迹证据 | 明确未满足结果 |
|---|---|---|---|
| 局部探索耗尽共享预算 | UFO³ / `al_calendar_schedule_conflict`（C01） | 49 次动作均在 Android，0 次 replan | Linux CSV 与 change log 均未完成 |
| 数据未跨设备搬运 | UI-Venus / `l2_csv_to_json`（C02） | 目标机重复读取源机路径并持续报错 | 目标 JSON 不存在 |
| 原子效果集合不完整 | Qwen、UI-Venus / `android_smarthome_202`（C03） | 正确时间的 plan 缺少开机或关帘动作 | planned effects 不满足短信请求 |
| 完成声明与环境提交脱节 | UFO³ / `linux_android_1798`（C04） | 正确命令随 `FINISH` 返回，但环境 action 为 null | audit CSV 不存在 |

**拟用 caption：** Representative trajectory-grounded failures. Each row reports an observed divergence and its verified downstream consequence; the cases are qualitative and do not estimate prevalence.

**后续图表素材位置：** C01 可用 `U/004_al_calendar_schedule_conflict/attempts/attempt_001/artifacts/android_0/screenshots/step_098.png`；C03 可用 `Q/157_android_smarthome_202/artifacts/android_0/screenshots/step_016.png`。正文优先使用上表；若改为多 panel 轨迹图，截图只展示已核实的环境状态，不用生成图替代原始证据。
