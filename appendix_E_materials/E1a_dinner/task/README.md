# 任务与初始化入口

`config/` 是此次运行保存的原始配置快照，包含完整用户指令、设备列表、初始化、清理、评测条件和运行参数；同一份原件也保留在 `../run/config/`。

`main_experiment_selection.json` 原样摘取主实验汇总中本任务的一条采用记录，并注明来源；不是按分数重新选择的运行。

`resources/` 保留工作树现有的规则文件、手机输入文件及住宅配置，沿用资源目录层级。历史初始状态以 `../run/trajectory.json` 的 reset 观测、配置快照及实际读取反馈为准。Android 食谱、待办和闹钟的初始化内容直接见 `config/task.json` 的 setup。
