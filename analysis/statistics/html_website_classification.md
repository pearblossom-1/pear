# HTML / Website：140 个候选页面组的业务与实现分类

日期：2026-09-08。基于当前工作树的静态源码与任务指令复核；不是浏览器执行验证，也不是 agent 成功率审计。

## 1. 结论与范围

- 原待审队列 140 组已逐组完成用途与交互实现分类，业务归类遗漏 0 组。
- 按任务用途：表单型 99，按钮确认型 2，资料型 39；合计 140。
- 按主要业务用途：16 类。每组只归入一个主类；混合任务按主要业务目标归类。
- 140 是任务页面组数，不是独立网站数；16 类是本轮业务分类，也不是 16 个网站。
- 39 组从“独立交互网站候选”降为任务材料类；剩余 101 组是合成表单/确认界面实例，仍不能逐组当作独立网站。

原盘点纳入 460 条 HTML 资源。本轮只复核其中原标为 unresolved_web_application_candidate 的 140 条：恰为 140 个 task-web 组、140 个 HTML 源文件、140 个关联任务，均有 setup 部署路径。另 320 条原资料类不开展新一轮分类；直接关联的确认页只用来核实页面关系，不额外增加本轮分母。

沿用原候选范围可写：460 = 320（本轮未重新归类）+ 39（本轮资料型）+ 99（表单型）+ 2（按钮确认型）。原发现的第 461 条未部署 HTML 仍不加入。

不修改原 summary、inventory、任务、evaluator 或实验集合；不确定最终发布规模，不读取模型成败决定分类。

## 2. 业务分布

分类按“页面服务什么业务”，不是按页面 title、文件名或 HTML 控件猜测。SmartHome 计划/工作流单列；洗衣、清扫与设备维护按其业务单列；普通设备变更与盘点再分开。通用审核与登记只接收不属于这些更具体主类的页面。

| 业务类型 | 全部组数 | 占 140 比例 | 表单/按钮确认型 | 资料型 |
|---|---:|---:|---:|---:|
| SmartHome 计划与工作流 | 16 | 11.43% | 16 | 0 |
| 洗衣、清扫与家电维护 | 16 | 11.43% | 16 | 0 |
| 房间设备变更与审批 | 14 | 10.00% | 13 | 1 |
| 物流、库存与配送 | 12 | 8.57% | 5 | 7 |
| 软件发布与 QA | 12 | 8.57% | 8 | 4 |
| 通用请求审批与审核 | 9 | 6.43% | 7 | 2 |
| 财务、发票与价格 | 9 | 6.43% | 1 | 8 |
| 日程、预约与值班 | 9 | 6.43% | 8 | 1 |
| 登记、调查与信息采集 | 8 | 5.71% | 8 | 0 |
| 身份、验证码与访问确认 | 7 | 5.00% | 7 | 0 |
| 运营、派工与资料交接 | 7 | 5.00% | 1 | 6 |
| SmartHome 状态与能力盘点 | 6 | 4.29% | 6 | 0 |
| 营销与图像制作需求 | 6 | 4.29% | 1 | 5 |
| 服务器与配置运维 | 4 | 2.86% | 1 | 3 |
| 音频、播放与转录 | 3 | 2.14% | 1 | 2 |
| 地点与坐标登记 | 2 | 1.43% | 2 | 0 |
| 合计 | 140 | 100% | 101 | 39 |

比例四舍五入，显示值相加可能不是恰好 100%。类型体现任务材料的业务用途，例如“营销与图像制作需求”不表示网页内实现了图像编辑。

## 3. 页面作用与真实交互

| 本任务中页面的作用 | 组数 | 比例 | 解释 |
|---|---:|---:|---|
| 表单型 | 99 | 70.71% | 输入字段并提交/验证/生成回执的页面；包含特殊不提交分支和先修复表单的任务 |
| 按钮确认型 | 2 | 1.43% | 无可编辑字段，按钮跳转固定确认地址 |
| 资料型 | 39 | 27.86% | 任务读取表格、规则或请求，主要工作在其他环境/应用完成；不要求提交网页 |

资料型不能一律描述为“完全没有 JavaScript”：其中 linux_android_smarthome_872 有可用的 query 回执处理器，linux_only_128 有 acknowledged fragment 处理器，但本任务不要求使用。linux_only_149 还要求打开指定静态确认页；它没有实际网页库存提交或修改逻辑。

按源码实际提交/回执机制（与上面的任务用途是不同维度）汇总：

| 源码实现机制 | 组数 | 其中本任务仅作为资料 |
|---|---:|---:|
| 真实 POST 接收与校验回执 | 40 | 0 |
| 前端预设值校验与成功/失败反馈 | 8 | 0 |
| 表单字段写入 URL query / fragment | 51 | 1 |
| fragment / 页内文本确认 | 2 | 1 |
| 固定按钮跳转确认地址 | 2 | 0 |
| 无实质提交/回执状态处理 | 37 | 37 |

前五项共 103 组存在提交/回执/导航代码。这是 5 种实现机制，不是 5 个已经去重的网站。固定确认导航中的 523 目标页部署存在缺口，不能将上述数量宣传为已验证可用网站数量。

### 具体实现依据

- 40 组 POST 表单：逐一核对 task 的 host_form_submission_state 合约。LinuxRuntime 用实际接收地址替换占位符；HostFormVerifier 接收字段/文件、校验并返回 submitted/invalid 页面。不能因为 HTML 没有 JavaScript 就误判不能提交。这里仅使用接收流程说明实现，不用 evaluator 隐藏答案推定业务需求。
- 这 40 组内部：35 个普通原生 POST、1 个两步 wizard、1 个 multipart 上传、1 个带页内回执的 POST、1 个附 PDF 下载入口、1 个任务要求修复字段名后提交的表单。
- 8 组前端值校验：输入与页面预设值比较，产生成功/失败文字或 fragment；不等于有后端数据库、账户系统或完整审批流程。
- 51 组 query 回执：将输入写入浏览器地址的 query / fragment，其中 50 组要求提交，1 组仅作资料。这些 Home 页面不直接连接或控制 SmartHome；实时查询和设备动作由任务中的 Home 环境承担。
- 2 组 fragment/文本回执：linux_only_263 收集 caseId/owner 并显示提交结果；linux_only_128 只是可选 acknowledged 标记。
- 2 组固定确认导航：linux_only_121 与 linux_smarthome_523；前者的确认页由 setup 明确创建，后者见下方疑点。

相关共用实现：[runtime.py](../../mdcbench/devices/linux/runtime.py)、[host_form.py](../../mdcbench/devices/linux/host_form.py)。共享处理器说明复用机制，不足以单独决定所有业务页面应合并成一个网站。

## 4. 与旧功能标签的区别及边界

旧报告的 4 类是对全部 460 条 HTML 的自动功能标签（可重叠），本轮 16 类是对 140 组的业务主分类（互斥），不能互相替代，也不能相加。

- 旧 form_entry=130 只检测 input/select/textarea，隐藏或 readonly 字段、静态材料中的占位表单也会被计入。
- 旧 submit_confirm_handler=67 漏掉无 JS 的真实原生 POST，同时把仅 preventDefault / return false 的空处理器也作为线索。因此它不是真实提交页面数。
- 仅在本轮 140 组中确认 1 组真正 file-input/multipart 上传：linux_android_1585，含两个文件字段。linux_android_169 虽文件名含 upload，只提交 package_id；linux_android_886 的 files 字段只是文本文件名清单。
- 本轮 140 组中确认 1 组 HTML download 链接：linux_android_230。PDF 由 setup 部署，链接始终可见，不宣称由验证码解锁。原 460 条的 download_export=6 不能被本轮的 1 覆盖。
- Linux/Android 上制作 PNG、PDF、ODT、JSON、CSV、播放音频或编辑工作簿，不等于对应 HTML 实现这些功能。

### 需要保留的具体静态疑点

linux_smarthome_523 的 index.html 点击后跳到 file:///home/user/approval/submitted.html?...#submitted；当前 setup 先删除 submitted.html，随后只部署 index.html，没有创建目标 HTML。故归为“有确认导航代码，但目标页初始化缺失”，不是完整可用的确认网站。依据为该任务 setup 与 HTML；本轮未执行验证、未修复，也不改判历史实验结果。

另外两项属于任务/实现边界，不是本轮发现的模型失败：linux_android_1078 的当前源记录分支要求保持表单未提交；linux_android_235 明确要求 agent 修复字段名不匹配后再提交，server.py 是字段契约示例，实际接收来自 runtime。99 个表单型不能等同于 99 个当前条件下都应该直接提交的任务。

任务要求提交/按钮确认共 100 组（98 个表单 + 2 个按钮）；另外 1 个表单明确应保持未提交；39 个资料型不要求表单提交。此处同样只是静态要求，不是执行成功数量。

## 5. 独立网站实体应该如何表述

此次已完成全部 140 组的语义用途与交互分类，而不是将 140 个不同标题变成 140 个网站。39 组建议按 task-specific HTML materials 保留；其余 101 组记作 synthetic form/confirmation interfaces。

从功能角色、字段/记录结构与状态流，可见它们集中复用“输入记录—接收校验”“输入—前端值核对”“输入—URL 回执”“确认按钮—目标地址”等机制，而不是各自实现完整的票务、音乐、库存或 Home 控制产品。报告保留这些实现分类与每页证据，未把共享 builder/receiver、业务类型、页面标题或端口强行当作正式网站家族。

因此：本轮可直接使用的数值是“140 个候选页面组，16 类业务；99 个表单型、2 个按钮确认型、39 个资料型”。如果论文要求 #websites 的独立实体数，101 不能直接填入；需要为匿名合成界面明确稳定的产品/应用家族边界。旧报告的“已确认网站 0”只代表没有完成独立实体确认项，不等于实际没有 Web 界面。本轮没有凭业务或控件分类擅自增加 #Apps / #websites。

## 6. 逐组清单

每条的简短理由、字段结构、部署位置、真实接收合约、功能与证据见 [html_website_classification.jsonl](html_website_classification.jsonl)。表中按主业务分组，不按模型结果分组。

| 任务及原始 instruction | 业务类型 | 具体用途 | 页面作用 | HTML 源码 |
|---|---|---|---|---|
| [linux_android_smarthome_561](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_561.json) | SmartHome 计划与工作流 | 失败工作流修复回执 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_561/source/home/user/home_ops/home-requests/source/fault.html) |
| [linux_android_smarthome_604](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_604.json) | SmartHome 计划与工作流 | 会议场景改期批准回执 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_604/source/home/user/home_ops/approval-forms/source/approval.html) |
| [linux_android_smarthome_608](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_608.json) | SmartHome 计划与工作流 | 家庭自动化版本部署回执 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_608/source/home/user/home_ops/status-reports/source/release.html) |
| [linux_android_smarthome_660](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_660.json) | SmartHome 计划与工作流 | 会议准备取消回执 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_660/source/home/user/home_ops/operations-log/source/cancel.html) |
| [linux_android_smarthome_670](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_670.json) | SmartHome 计划与工作流 | 抵达环境准备批准 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_670/source/home/user/share/Committee%20Approval.html) |
| [linux_android_smarthome_947](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_947.json) | SmartHome 计划与工作流 | 办公室灯光计划批准 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_947/source/home/user/share/Office%20Meeting%20Approval.html) |
| [linux_smarthome_221](../../tasks/cross_device/linux_smarthome/linux_smarthome_221.json) | SmartHome 计划与工作流 | 例程清理工单回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_221/source/home/user/forms/workflow-cleanup.html) |
| [linux_smarthome_257](../../tasks/cross_device/linux_smarthome/linux_smarthome_257.json) | SmartHome 计划与工作流 | 例程保留取消回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_257/source/tmp/home/gui/dashboard.html) |
| [linux_smarthome_369](../../tasks/cross_device/linux_smarthome/linux_smarthome_369.json) | SmartHome 计划与工作流 | 例程状态核验回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_369/source/home/user/automation/review.html) |
| [linux_smarthome_428](../../tasks/cross_device/linux_smarthome/linux_smarthome_428.json) | SmartHome 计划与工作流 | 占用冲突清扫例程复核 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_428/source/home/user/vacuum/workflow.html) |
| [linux_smarthome_446](../../tasks/cross_device/linux_smarthome/linux_smarthome_446.json) | SmartHome 计划与工作流 | 计划清理变更回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_446/source/home/user/automation/cleanup.html) |
| [linux_smarthome_447](../../tasks/cross_device/linux_smarthome/linux_smarthome_447.json) | SmartHome 计划与工作流 | 失败例程重建登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_447/source/home/user/automation/workflows.html) |
| [linux_smarthome_449](../../tasks/cross_device/linux_smarthome/linux_smarthome_449.json) | SmartHome 计划与工作流 | 三阶段晚间自动化登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_449/source/home/user/automation/stages.html) |
| [linux_smarthome_450](../../tasks/cross_device/linux_smarthome/linux_smarthome_450.json) | SmartHome 计划与工作流 | 迎宾例程取消回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_450/source/home/user/automation/cancel.html) |
| [linux_smarthome_510](../../tasks/cross_device/linux_smarthome/linux_smarthome_510.json) | SmartHome 计划与工作流 | 过期阅读计划取消登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_510/source/home/user/cleanup/schedules.html) |
| [linux_smarthome_622](../../tasks/cross_device/linux_smarthome/linux_smarthome_622.json) | SmartHome 计划与工作流 | 办公室照明计划替换登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_622/source/home/user/change/index.html) |
| [linux_android_smarthome_525](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_525.json) | 洗衣、清扫与家电维护 | 衣物护理洗衣工单 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_525/source/home/user/home_ops/comfort-checks/source/order.html) |
| [linux_android_smarthome_587](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_587.json) | 洗衣、清扫与家电维护 | 洗衣订单执行回执 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_587/source/home/user/home_ops/laundry/source/order.html) |
| [linux_android_smarthome_591](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_591.json) | 洗衣、清扫与家电维护 | 机器人清洁许可回执 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_591/source/home/user/home_ops/robot/source/approval.html) |
| [linux_smarthome_365](../../tasks/cross_device/linux_smarthome/linux_smarthome_365.json) | 洗衣、清扫与家电维护 | 洗衣机状态登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_365/source/home/user/laundry/check.html) |
| [linux_smarthome_393](../../tasks/cross_device/linux_smarthome/linux_smarthome_393.json) | 洗衣、清扫与家电维护 | 漏水事件处置回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_393/source/home/user/incidents/leak.html) |
| [linux_smarthome_400](../../tasks/cross_device/linux_smarthome/linux_smarthome_400.json) | 洗衣、清扫与家电维护 | 洗衣停机审计登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_400/source/home/user/laundry/stop-order.html) |
| [linux_smarthome_406](../../tasks/cross_device/linux_smarthome/linux_smarthome_406.json) | 洗衣、清扫与家电维护 | 烘干换程序延期登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_406/source/home/user/laundry/dryer-change.html) |
| [linux_smarthome_412](../../tasks/cross_device/linux_smarthome/linux_smarthome_412.json) | 洗衣、清扫与家电维护 | 烘干能力与派工登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_412/source/home/user/laundry/dryer-options.html) |
| [linux_smarthome_417](../../tasks/cross_device/linux_smarthome/linux_smarthome_417.json) | 洗衣、清扫与家电维护 | 安静会议清扫处置登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_417/source/home/user/study/quiet.html) |
| [linux_smarthome_422](../../tasks/cross_device/linux_smarthome/linux_smarthome_422.json) | 洗衣、清扫与家电维护 | 低电量清扫安全登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_422/source/home/user/vacuum/request.html) |
| [linux_smarthome_443](../../tasks/cross_device/linux_smarthome/linux_smarthome_443.json) | 洗衣、清扫与家电维护 | 洗衣事故前后记录 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_443/source/home/user/laundry/incident.html) |
| [linux_smarthome_444](../../tasks/cross_device/linux_smarthome/linux_smarthome_444.json) | 洗衣、清扫与家电维护 | 烘干变更延期审批回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_444/source/home/user/laundry/dryer-change.html) |
| [linux_smarthome_445](../../tasks/cross_device/linux_smarthome/linux_smarthome_445.json) | 洗衣、清扫与家电维护 | 清扫优先级派工回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_445/source/home/user/cleaning/board.html) |
| [linux_smarthome_451](../../tasks/cross_device/linux_smarthome/linux_smarthome_451.json) | 洗衣、清扫与家电维护 | 洗衣湿度工单登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_451/source/home/user/case/work-order.html) |
| [linux_smarthome_454](../../tasks/cross_device/linux_smarthome/linux_smarthome_454.json) | 洗衣、清扫与家电维护 | 静音清扫冲突处置回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_454/source/home/user/cleaning/quiet.html) |
| [linux_smarthome_456](../../tasks/cross_device/linux_smarthome/linux_smarthome_456.json) | 洗衣、清扫与家电维护 | 设备生命周期维护工单 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_456/source/home/user/maintenance/dashboard.html) |
| [linux_android_smarthome_598](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_598.json) | 房间设备变更与审批 | 混合设备变更授权统计 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_598/source/home/user/home_ops/status-reports/source/approval.html) |
| [linux_android_smarthome_616](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_616.json) | 房间设备变更与审批 | 家庭变更审批批次 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_616/source/home/user/home_ops/service-notes/source/portal.html) |
| [linux_android_smarthome_620](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_620.json) | 房间设备变更与审批 | 家庭变更看板回执 | 表单型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_620/source/home/user/home_ops/operations-log/source/board.html) |
| [linux_android_smarthome_872](../../tasks/cross_device/linux_android_smarthome/linux_android_smarthome_872.json) | 房间设备变更与审批 | 家庭变更批准资料 | 资料型 | [源码](../../tasks/cross_device/linux_android_smarthome_assets/linux_android_smarthome_872/source/tmp/approved-home-change/policy/approvals.html) |
| [linux_smarthome_251](../../tasks/cross_device/linux_smarthome/linux_smarthome_251.json) | 房间设备变更与审批 | 灯光窗帘配置回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_251/source/tmp/home/gui/lighting.html) |
| [linux_smarthome_378](../../tasks/cross_device/linux_smarthome/linux_smarthome_378.json) | 房间设备变更与审批 | 卧室制冷选择回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_378/source/home/user/climate/cooling.html) |
| [linux_smarthome_381](../../tasks/cross_device/linux_smarthome/linux_smarthome_381.json) | 房间设备变更与审批 | 窗帘请求适用性登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_381/source/home/user/curtain/request.html) |
| [linux_smarthome_387](../../tasks/cross_device/linux_smarthome/linux_smarthome_387.json) | 房间设备变更与审批 | 空调模式请求处置回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_387/source/home/user/climate/mode-check.html) |
| [linux_smarthome_442](../../tasks/cross_device/linux_smarthome/linux_smarthome_442.json) | 房间设备变更与审批 | 多设备请求能力审批登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_442/source/home/user/home/capabilities.html) |
| [linux_smarthome_460](../../tasks/cross_device/linux_smarthome/linux_smarthome_460.json) | 房间设备变更与审批 | 综合变更审批回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_460/source/home/user/change/approval.html) |
| [linux_smarthome_506](../../tasks/cross_device/linux_smarthome/linux_smarthome_506.json) | 房间设备变更与审批 | 房间调整请求复核 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_506/source/home/user/approval/index.html) |
| [linux_smarthome_507](../../tasks/cross_device/linux_smarthome/linux_smarthome_507.json) | 房间设备变更与审批 | 空气污染定向响应回执 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_507/source/home/user/dashboard/air.html) |
| [linux_smarthome_523](../../tasks/cross_device/linux_smarthome/linux_smarthome_523.json) | 房间设备变更与审批 | 照明审批固定确认导航 | 按钮确认型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_523/source/home/user/approval/index.html) |
| [linux_smarthome_553](../../tasks/cross_device/linux_smarthome/linux_smarthome_553.json) | 房间设备变更与审批 | 家庭请求选择与例外登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_553/source/tmp/board/review.html) |
| [linux_android_081](../../tasks/cross_device/linux_android/linux_android_081.json) | 物流、库存与配送 | 快递取件预约 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_081/source/delivery_booking_form.html) |
| [linux_android_086](../../tasks/cross_device/linux_android/linux_android_086.json) | 物流、库存与配送 | 实验室取件时间登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_086/source/lab_booking_form.html) |
| [linux_android_125](../../tasks/cross_device/linux_android/linux_android_125.json) | 物流、库存与配送 | 设备取件预约更正 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_125/source/booking.html) |
| [linux_android_169](../../tasks/cross_device/linux_android/linux_android_169.json) | 物流、库存与配送 | 出库照片关联登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_169/source/package_upload.html) |
| [linux_android_620](../../tasks/cross_device/linux_android/linux_android_620.json) | 物流、库存与配送 | 交付图片处理报告模式说明 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_620/source/upload_template.html) |
| [linux_android_647](../../tasks/cross_device/linux_android/linux_android_647.json) | 物流、库存与配送 | 订单查询资料表 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_647/source/orders/index.html) |
| [linux_android_676](../../tasks/cross_device/linux_android/linux_android_676.json) | 物流、库存与配送 | 仓库取件时刻表 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_676/source/pickup_schedule.html) |
| [linux_android_886](../../tasks/cross_device/linux_android/linux_android_886.json) | 物流、库存与配送 | 授权现场文件包登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_886/source/upload.html) |
| [linux_only_036](../../tasks/cross_device/linux_only/linux_only_036.json) | 物流、库存与配送 | 库存补货规则资料 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_036/source/inventory.html) |
| [linux_only_149](../../tasks/cross_device/linux_only/linux_only_149.json) | 物流、库存与配送 | 库存规则来源及确认页导航 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_149/source/update_instructions.html) |
| [linux_only_320](../../tasks/cross_device/linux_only/linux_only_320.json) | 物流、库存与配送 | 仓库补货更新依据来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_320/source/restock_request.html) |
| [linux_only_344](../../tasks/cross_device/linux_only/linux_only_344.json) | 物流、库存与配送 | 订单更新指令来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_344/source/update_instructions.html) |
| [linux_android_083](../../tasks/cross_device/linux_android/linux_android_083.json) | 软件发布与 QA | 版本发布门禁 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_083/source/release_dashboard.html) |
| [linux_android_1124](../../tasks/cross_device/linux_android/linux_android_1124.json) | 软件发布与 QA | 冻结窗口发布审阅材料 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1124/source/release_form.html) |
| [linux_android_1134](../../tasks/cross_device/linux_android/linux_android_1134.json) | 软件发布与 QA | 未批准发布的门户说明 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1134/source/portal.html) |
| [linux_android_1577](../../tasks/cross_device/linux_android/linux_android_1577.json) | 软件发布与 QA | 就绪版本发布提交 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1577/source/release_portal.html) |
| [linux_android_1582](../../tasks/cross_device/linux_android/linux_android_1582.json) | 软件发布与 QA | 发布批准人登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1582/source/portal.html) |
| [linux_android_1585](../../tasks/cross_device/linux_android/linux_android_1585.json) | 软件发布与 QA | 批准发布包上传 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1585/source/checklist.html) |
| [linux_android_1586](../../tasks/cross_device/linux_android/linux_android_1586.json) | 软件发布与 QA | 发布窗口批准 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1586/source/window_dashboard.html) |
| [linux_android_183](../../tasks/cross_device/linux_android/linux_android_183.json) | 软件发布与 QA | 组件修复的 QA 交接 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_183/source/qa-handoff.html) |
| [linux_android_889](../../tasks/cross_device/linux_android/linux_android_889.json) | 软件发布与 QA | 发布就绪门禁确认 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_889/source/dashboard.html) |
| [linux_android_893](../../tasks/cross_device/linux_android/linux_android_893.json) | 软件发布与 QA | 软件缺陷升级登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_893/source/board.html) |
| [linux_only_126](../../tasks/cross_device/linux_only/linux_only_126.json) | 软件发布与 QA | 项目版本更新请求资料 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_126/source/version_update.html) |
| [linux_only_359](../../tasks/cross_device/linux_only/linux_only_359.json) | 软件发布与 QA | 发布版本来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_359/source/release_status.html) |
| [linux_android_1078](../../tasks/cross_device/linux_android/linux_android_1078.json) | 通用请求审批与审核 | 请求批准码校验入口 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1078/source/request_form.html) |
| [linux_android_1208](../../tasks/cross_device/linux_android/linux_android_1208.json) | 通用请求审批与审核 | 就绪请求批准登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1208/source/tmp/forms/request.html) |
| [linux_android_1580](../../tasks/cross_device/linux_android/linux_android_1580.json) | 通用请求审批与审核 | 变更请求审阅提交 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1580/source/review.html) |
| [linux_android_1587](../../tasks/cross_device/linux_android/linux_android_1587.json) | 通用请求审批与审核 | 运营请求受理 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1587/source/request_board.html) |
| [linux_android_1589](../../tasks/cross_device/linux_android/linux_android_1589.json) | 通用请求审批与审核 | 同行评审指派 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1589/source/review.html) |
| [linux_android_880](../../tasks/cross_device/linux_android/linux_android_880.json) | 通用请求审批与审核 | 缺批准码阻塞说明 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_880/source/form.html) |
| [linux_android_895](../../tasks/cross_device/linux_android/linux_android_895.json) | 通用请求审批与审核 | 访问拒绝决定记录 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_895/source/portal.html) |
| [linux_only_263](../../tasks/cross_device/linux_only/linux_only_263.json) | 通用请求审批与审核 | 待办案例提交与回执 | 表单型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_263/source/linux_1/tmp/form/form.html) |
| [linux_only_272](../../tasks/cross_device/linux_only/linux_only_272.json) | 通用请求审批与审核 | 人工审核规则来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_272/source/linux_1/tmp/form/review.html) |
| [linux_android_230](../../tasks/cross_device/linux_android/linux_android_230.json) | 财务、发票与价格 | 验证码账单下载 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_230/source/download_portal.html) |
| [linux_android_678](../../tasks/cross_device/linux_android/linux_android_678.json) | 财务、发票与价格 | 发票合并所需客户目录 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_678/source/customers.html) |
| [linux_only_083](../../tasks/cross_device/linux_only/linux_only_083.json) | 财务、发票与价格 | 供应商台账批准资料 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_083/source/approvals.html) |
| [linux_only_123](../../tasks/cross_device/linux_only/linux_only_123.json) | 财务、发票与价格 | 发票明细资料 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_123/source/invoices.html) |
| [linux_only_130](../../tasks/cross_device/linux_only/linux_only_130.json) | 财务、发票与价格 | 价格修正来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_130/source/price_updates.html) |
| [linux_only_153](../../tasks/cross_device/linux_only/linux_only_153.json) | 财务、发票与价格 | 发票汇总要求来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_153/source/invoice_tasks.html) |
| [linux_only_160](../../tasks/cross_device/linux_only/linux_only_160.json) | 财务、发票与价格 | 发票确认文档要求来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_160/source/finance.html) |
| [linux_only_175](../../tasks/cross_device/linux_only/linux_only_175.json) | 财务、发票与价格 | 台账审批依据来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_175/source/today_approvals.html) |
| [linux_only_332](../../tasks/cross_device/linux_only/linux_only_332.json) | 财务、发票与价格 | 已批准发票汇总来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_332/source/invoice_dashboard.html) |
| [linux_android_103](../../tasks/cross_device/linux_android/linux_android_103.json) | 日程、预约与值班 | 周审日程状态更新 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_103/source/review_update_form.html) |
| [linux_android_1581](../../tasks/cross_device/linux_android/linux_android_1581.json) | 日程、预约与值班 | 会议室预约 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1581/source/booking.html) |
| [linux_android_161](../../tasks/cross_device/linux_android/linux_android_161.json) | 日程、预约与值班 | 值班排期更正 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_161/source/dashboard.html) |
| [linux_android_177](../../tasks/cross_device/linux_android/linux_android_177.json) | 日程、预约与值班 | 安静工作时段登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_177/source/session-intake.html) |
| [linux_android_180](../../tasks/cross_device/linux_android/linux_android_180.json) | 日程、预约与值班 | 仪器校准阶段时序登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_180/source/control-room-intake.html) |
| [linux_android_185](../../tasks/cross_device/linux_android/linux_android_185.json) | 日程、预约与值班 | 值班闹钟交接回执 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_185/source/alarm-handoff.html) |
| [linux_android_204](../../tasks/cross_device/linux_android/linux_android_204.json) | 日程、预约与值班 | 冷库检查提醒交接 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_204/source/alarm.html) |
| [linux_android_705](../../tasks/cross_device/linux_android/linux_android_705.json) | 日程、预约与值班 | 部署评审会议信息源 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_705/source/deploy_review.html) |
| [linux_android_894](../../tasks/cross_device/linux_android/linux_android_894.json) | 日程、预约与值班 | 班次预约确认 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_894/source/book.html) |
| [linux_android_108](../../tasks/cross_device/linux_android/linux_android_108.json) | 登记、调查与信息采集 | 现场调查登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_108/source/survey_form.html) |
| [linux_android_139](../../tasks/cross_device/linux_android/linux_android_139.json) | 登记、调查与信息采集 | 访客登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_139/source/register.html) |
| [linux_android_203](../../tasks/cross_device/linux_android/linux_android_203.json) | 登记、调查与信息采集 | 资产标签图信息录入 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_203/source/photo_upload_form.html) |
| [linux_android_223](../../tasks/cross_device/linux_android/linux_android_223.json) | 登记、调查与信息采集 | 工作坊报名 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_223/source/form.html) |
| [linux_android_235](../../tasks/cross_device/linux_android/linux_android_235.json) | 登记、调查与信息采集 | 访客签到表字段修复与验证 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_235/source/form.html) |
| [linux_android_237](../../tasks/cross_device/linux_android/linux_android_237.json) | 登记、调查与信息采集 | 设施满意度问卷 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_237/source/survey_form.html) |
| [linux_android_890](../../tasks/cross_device/linux_android/linux_android_890.json) | 登记、调查与信息采集 | 部门收货问卷 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_890/source/form.html) |
| [linux_only_012](../../tasks/cross_device/linux_only/linux_only_012.json) | 登记、调查与信息采集 | 现场记录受理 | 表单型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_012/source/form.html) |
| [linux_android_089](../../tasks/cross_device/linux_android/linux_android_089.json) | 身份、验证码与访问确认 | 客户身份及 OTP 登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_089/source/client_form.html) |
| [linux_android_1307](../../tasks/cross_device/linux_android/linux_android_1307.json) | 身份、验证码与访问确认 | 短信最新验证码验证 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1307/source/tmp/form/submit.html) |
| [linux_android_157](../../tasks/cross_device/linux_android/linux_android_157.json) | 身份、验证码与访问确认 | 两步现场访问申请 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_157/source/apply.html) |
| [linux_android_158](../../tasks/cross_device/linux_android/linux_android_158.json) | 身份、验证码与访问确认 | 一次性验证码确认请求 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_158/source/secure.html) |
| [linux_android_168](../../tasks/cross_device/linux_android/linux_android_168.json) | 身份、验证码与访问确认 | 账户双因素确认 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_168/source/verify.html) |
| [linux_android_220](../../tasks/cross_device/linux_android/linux_android_220.json) | 身份、验证码与访问确认 | 注册双因素确认 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_220/source/confirmation_form.html) |
| [linux_android_888](../../tasks/cross_device/linux_android/linux_android_888.json) | 身份、验证码与访问确认 | 当前注册确认 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_888/source/form.html) |
| [linux_android_090](../../tasks/cross_device/linux_android/linux_android_090.json) | 运营、派工与资料交接 | 日终运营数量快照 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_090/source/day_dashboard.html) |
| [linux_android_1069](../../tasks/cross_device/linux_android/linux_android_1069.json) | 运营、派工与资料交接 | 装卸区检查清单来源 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1069/source/checklist.html) |
| [linux_android_683](../../tasks/cross_device/linux_android/linux_android_683.json) | 运营、派工与资料交接 | 现场派工资料看板 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_683/source/todo.html) |
| [linux_only_057](../../tasks/cross_device/linux_only/linux_only_057.json) | 运营、派工与资料交接 | 客户邮件撰写请求资料 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_057/source/compose_requests.html) |
| [linux_only_064](../../tasks/cross_device/linux_only/linux_only_064.json) | 运营、派工与资料交接 | 项目归档包检查清单 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_064/source/checklist.html) |
| [linux_only_098](../../tasks/cross_device/linux_only/linux_only_098.json) | 运营、派工与资料交接 | 设备零件维修成本资料 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_098/source/maintenance.html) |
| [linux_only_365](../../tasks/cross_device/linux_only/linux_only_365.json) | 运营、派工与资料交接 | 作业结束登记规则来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_365/source/ops_dashboard.html) |
| [linux_smarthome_191](../../tasks/cross_device/linux_smarthome/linux_smarthome_191.json) | SmartHome 状态与能力盘点 | 照明能力核查登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_191/source/home/user/forms/capability.html) |
| [linux_smarthome_247](../../tasks/cross_device/linux_smarthome/linux_smarthome_247.json) | SmartHome 状态与能力盘点 | 家庭环境盘点登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_247/source/tmp/home/gui/home-audit.html) |
| [linux_smarthome_362](../../tasks/cross_device/linux_smarthome/linux_smarthome_362.json) | SmartHome 状态与能力盘点 | 客厅设备状态盘点 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_362/source/home/user/audit/living-room.html) |
| [linux_smarthome_375](../../tasks/cross_device/linux_smarthome/linux_smarthome_375.json) | SmartHome 状态与能力盘点 | 全屋运行状态盘点 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_375/source/home/user/audit/questions.html) |
| [linux_smarthome_441](../../tasks/cross_device/linux_smarthome/linux_smarthome_441.json) | SmartHome 状态与能力盘点 | 全屋五项状态交接登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_441/source/home/user/home/questions.html) |
| [linux_smarthome_448](../../tasks/cross_device/linux_smarthome/linux_smarthome_448.json) | SmartHome 状态与能力盘点 | 环境读数极值交接登记 | 表单型 | [源码](../../tasks/cross_device/linux_smarthome_assets/linux_smarthome_448/source/home/user/home/dashboard.html) |
| [linux_android_1584](../../tasks/cross_device/linux_android/linux_android_1584.json) | 营销与图像制作需求 | 营销活动联系人登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_1584/source/form.html) |
| [linux_only_069](../../tasks/cross_device/linux_only/linux_only_069.json) | 营销与图像制作需求 | 营销横幅制作需求看板 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_069/source/campaign_dashboard.html) |
| [linux_only_148](../../tasks/cross_device/linux_only/linux_only_148.json) | 营销与图像制作需求 | 商品图片加工要求来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_148/source/product_edit_request.html) |
| [linux_only_156](../../tasks/cross_device/linux_only/linux_only_156.json) | 营销与图像制作需求 | 横幅制作要求来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_156/source/banners_request.html) |
| [linux_only_193](../../tasks/cross_device/linux_only/linux_only_193.json) | 营销与图像制作需求 | 横幅设计参数来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_193/source/banner_request.html) |
| [linux_only_353](../../tasks/cross_device/linux_only/linux_only_353.json) | 营销与图像制作需求 | 商品照片标注指令来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_353/source/annotate_instructions.html) |
| [linux_android_697](../../tasks/cross_device/linux_android/linux_android_697.json) | 服务器与配置运维 | 服务器状态审计资料 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_697/source/servers.html) |
| [linux_only_078](../../tasks/cross_device/linux_only/linux_only_078.json) | 服务器与配置运维 | 服务器批准名录 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_078/source/servers.html) |
| [linux_only_121](../../tasks/cross_device/linux_only/linux_only_121.json) | 服务器与配置运维 | 服务配置变更确认 | 按钮确认型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_121/source/dashboard.html) |
| [linux_only_128](../../tasks/cross_device/linux_only/linux_only_128.json) | 服务器与配置运维 | 变更请求与校验规则来源 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_128/source/r204.html) |
| [linux_android_700](../../tasks/cross_device/linux_android/linux_android_700.json) | 音频、播放与转录 | 演出曲目制作请求 | 资料型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_700/source/event_playlist_request.html) |
| [linux_android_891](../../tasks/cross_device/linux_android/linux_android_891.json) | 音频、播放与转录 | 录音与转录目录对账 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_891/source/review.html) |
| [linux_only_081](../../tasks/cross_device/linux_only/linux_only_081.json) | 音频、播放与转录 | 播放器请求资料 | 资料型 | [源码](../../tasks/cross_device/linux_only_assets/linux_only_081/source/play_request.html) |
| [linux_android_141](../../tasks/cross_device/linux_android/linux_android_141.json) | 地点与坐标登记 | 地图收藏登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_141/source/dashboard.html) |
| [linux_android_225](../../tasks/cross_device/linux_android/linux_android_225.json) | 地点与坐标登记 | 仓库地图点登记 | 表单型 | [源码](../../tasks/cross_device/linux_android_assets/linux_android_225/source/map_pin_form.html) |

## 7. 复现与限制

复核读取每个 HTML 的正文、表单结构、脚本及对应原始 task instruction；CSS 样式在人工阅读显示中省略。需要时核对 setup、接收端与直接关联确认页。未执行嵌入脚本、未启动设备、未读取模型轨迹；任务质量之外的问题不扩展为全量审计。

统计输入是 [原 inventory_data.json](../../statistics/inventory_data.json) 和本轮逐项语义判断 JSONL。[summarize_html_website_classification.mjs](summarize_html_website_classification.mjs) 只聚合既有人工式静态判断，不用关键词自动给未读页面贴标签。

在该 worktree 中运行：

~~~bash
node analysis/statistics/summarize_html_website_classification.mjs
~~~

脚本向 stdout 输出本报告，不改写任务或原盘点文件。检查仅针对遗漏/重复候选、证据路径缺失与数量不对账；若发现则修正分类记录或明确范围变化，不修改任务以凑数。

本报告读取当前工作树（包含已有未提交修改），不是不可变发布快照。新增文件仅包含本次分类与汇总；不新增 hash，不更改已有实验统计口径。
