# 附录 A：任务构建与数据集材料索引

整理日期：2026-09-24。对应 **A. Task Construction and Dataset Details** 的三个小节。组织方式参照本仓库 [附录 E 材料](../appendix_E_materials/case_index.md)：分节 notes、原始配置/资源、证据记录及来源清单；不把说明文档当作原始执行记录。

| 小节与入口 | 材料对象 | 已保存内容 | 证据边界 |
| --- | --- | --- | --- |
| [A.1 任务规格与跨设备依赖](A1_task_specification/notes.md) | Lite #4 `al_calendar_schedule_conflict`，Android + Linux | 正式 GPT-5.5 执行冻结的完整任务配置、Linux 初始 CSV 与规则、Android Calendar setup、第一次源文件读取记录、要求与评测映射 | 是任务规格案例，不是完整失败分析轨迹；不替代附录 E 的 UFO³ 同名任务运行 |
| [A.2 任务构建流程](A2_task_construction_pipeline/notes.md) | 当前 Stage0–Stage8 引擎；历史 R01/sample_000014 | 四阶段解释、九个真实阶段产物、后续 selected 快照、资源、源码/提示词/能力配置、既有验证报告 | 历史阶段输出与后续维护版本分开；该生成样本不被说成 A.1 的生成来源或 Lite 入选任务 |
| [A.3 任务集与 Lite 选择](A3_dataset_composition/notes.md) | 实验工作树全池库存、正式 Lite-200 冻结配置的分组 | 5,897 口径、七类设备分布、200 条逐任务索引、配额/理由、替换与历史 QA 记录 | 不重复计入 real100–300 旧来源；不把库存识别当作全量真机可执行性认证 |

## 主要入口

- [英文附录正文草稿](appendix_A_draft_en.md)：可继续改写用于论文，并保留来源/版本边界。
- [用户提供的流程图 PDF](figures/DevicesWorld_task_construction%20%2813%29.pdf)：原始文件内容未改动、未重新导出；一页四阶段概念图。
- [流程图预览](figures/DevicesWorld_task_construction_preview.png)：从原 PDF 渲染，供网页阅读；正式矢量材料仍用 PDF。
- [图的说明](figures/notes.md)：说明原图与现有实现的关系，附代码映射参考图入口。
- [总体来源清单](material_inventory.json)：原始路径、本目录位置、复制/派生方式；各 A1/A2/A3 另有对应分节清单。
- [来源与声明边界](source_notes/sources_and_boundaries.md)、[仍缺哪些证据](missing_materials.md)。

## 统计与选取结论

| 设备组合 | 全池配置数 | Lite-200 |
| --- | ---: | ---: |
| Android only | 372 | 20 |
| Linux only | 371 | 18 |
| Android + Linux | 1,876 | 67 |
| Android + SmartHome | 1,018 | 25 |
| Linux + SmartHome | 1,010 | 30 |
| Android + Linux + SmartHome | 970 | 30 |
| SmartHome only | 280 | 10 |
| **合计** | **5,897** | **200** |

“全池”指定本次读取的实验工作树七类设备目录，不是未经核对的 GitHub release 总量；Lite 设备分组取自正式冻结 task configs。200 条中 190 条有至少两个运行端点；home 端点数量不代表实际灯、传感器等物理设备数量。

Lite 是配额与覆盖导向的策展式选择，不是 Stage0 对当前全池均匀抽样。旧 real100/200/300 仅是来源名称，在主分布中已经并入设备组合。原始选择器公式和发布版本相匹配的全量验收状态仍有证据边界，不能补造。

## 文件保存约定

```text
appendix_A_materials/
  README.md
  case_index.md
  material_inventory.json
  missing_materials.md
  appendix_A_draft_en.md
  A1_task_specification/
    notes.md
    material_inventory.json
    task/config/task.json
    task/resources/{android,linux}/
    evidence/
  A2_task_construction_pipeline/
    notes.md
    material_inventory.json
    stage_example/{historical_stages,later_selected}/
    source_snapshots/
  A3_dataset_composition/
    notes.md
    material_inventory.json
    data/
    selection_evidence/
  figures/
    DevicesWorld_task_construction (13).pdf
    DevicesWorld_task_construction_preview.png
    notes.md
    implementation_reference/
  source_notes/
```

原始配置、资源、阶段 JSON、源码快照、历史报告及 PDF 保留原文；只对本次撰写的说明文档调整链接和材料入口。原始记录中的绝对路径不重写，跨机器阅读以来源清单的 `bundle_path` 定位，不能把这些路径当作本仓库缺失的超链接。

没有复制全部模型的运行日志，也没有为了形式上“齐全”生成不存在的阶段执行、截图或验收结论。本次只新增附录 A 资料目录，不改动附录 E、正式任务、实验结果或 benchmark 代码。
