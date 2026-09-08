import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

// Aggregate the explicit per-page semantic decisions; this does not infer labels,
// launch pages, run agents, or write task/report files. Markdown goes to stdout.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const rows = fs.readFileSync(path.join(here, 'html_website_classification.jsonl'), 'utf8')
  .trim().split('\n').map(line => JSON.parse(line));
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'statistics/inventory_data.json'), 'utf8'));
const queue = inventory.html.filter(row => row.entity_status === 'unresolved_web_application_candidate');
assert.equal(rows.length, 140, 'Reviewed queue changed: revise scope explicitly before aggregating.');
assert.equal(new Set(rows.map(row => row.task_id)).size, rows.length, 'Duplicate reviewed task.');
assert.deepEqual(rows.map(row => row.html_path).sort(), queue.map(row => row.resource).sort(),
  'Review is missing/adding pages relative to the original queue.');
for (const row of rows) {
  assert.equal(row.classification_review, 'completed_static_review', row.task_id);
  assert(row.review_reason && row.business_category_zh && row.deployed_paths.length, row.task_id);
  for (const evidence of row.evidence_paths) {
    assert(fs.existsSync(path.join(root, evidence)), 'Missing evidence: ' + evidence);
  }
}
const count = predicate => rows.filter(predicate).length;
const pct = n => (100 * n / rows.length).toFixed(2) + '%';
const groups = new Map();
for (const row of rows) {
  if (!groups.has(row.business_category)) groups.set(row.business_category, []);
  groups.get(row.business_category).push(row);
}
const byBusiness = [...groups.values()].sort((a,b) => b.length-a.length || a[0].business_category.localeCompare(b[0].business_category));
const material = row => row.task_page_role === 'task_material';
const form = row => row.task_page_role === 'form_workflow';
const confirmation = row => row.task_page_role === 'confirmation_navigation';
assert.equal(count(material) + count(form) + count(confirmation), rows.length);
const mechanisms = [
  ['host_form_receipt', '真实 POST 接收与校验回执'],
  ['client_value_validation', '前端预设值校验与成功/失败反馈'],
  ['url_query_receipt', '表单字段写入 URL query / fragment'],
  ['fragment_text_receipt', 'fragment / 页内文本确认'],
  ['fixed_confirmation_navigation', '固定按钮跳转确认地址'],
  ['no_submission_state', '无实质提交/回执状态处理'],
];
const roleNames = {task_material:'资料型',form_workflow:'表单型',confirmation_navigation:'按钮确认型'};
const escape = text => String(text || '').replaceAll('|','\\|').replaceAll('\n',' ');
const link = (label, target) => '[' + escape(label) + '](' + encodeURI(target) + ')';
const L = [
'# HTML / Website：140 个候选页面组的业务与实现分类',
'',
'日期：2026-09-08。基于当前工作树的静态源码与任务指令复核；不是浏览器执行验证，也不是 agent 成功率审计。',
'',
'## 1. 结论与范围',
'',
'- 原待审队列 140 组已逐组完成用途与交互实现分类，业务归类遗漏 0 组。',
'- 按任务用途：表单型 ' + count(form) + '，按钮确认型 ' + count(confirmation) + '，资料型 ' + count(material) + '；合计 140。',
'- 按主要业务用途：' + groups.size + ' 类。每组只归入一个主类；混合任务按主要业务目标归类。',
'- 140 是任务页面组数，不是独立网站数；16 类是本轮业务分类，也不是 16 个网站。',
'- 39 组从“独立交互网站候选”降为任务材料类；剩余 101 组是合成表单/确认界面实例，仍不能逐组当作独立网站。',
'',
'原盘点纳入 460 条 HTML 资源。本轮只复核其中原标为 unresolved_web_application_candidate 的 140 条：恰为 140 个 task-web 组、140 个 HTML 源文件、140 个关联任务，均有 setup 部署路径。另 320 条原资料类不开展新一轮分类；直接关联的确认页只用来核实页面关系，不额外增加本轮分母。',
'',
'沿用原候选范围可写：460 = 320（本轮未重新归类）+ 39（本轮资料型）+ 99（表单型）+ 2（按钮确认型）。原发现的第 461 条未部署 HTML 仍不加入。',
'',
'不修改原 summary、inventory、任务、evaluator 或实验集合；不确定最终发布规模，不读取模型成败决定分类。',
'',
'## 2. 业务分布',
'',
'分类按“页面服务什么业务”，不是按页面 title、文件名或 HTML 控件猜测。SmartHome 计划/工作流单列；洗衣、清扫与设备维护按其业务单列；普通设备变更与盘点再分开。通用审核与登记只接收不属于这些更具体主类的页面。',
'',
'| 业务类型 | 全部组数 | 占 140 比例 | 表单/按钮确认型 | 资料型 |',
'|---|---:|---:|---:|---:|',
];
for (const g of byBusiness) L.push('| ' + g[0].business_category_zh + ' | ' + g.length + ' | ' + pct(g.length) + ' | ' + g.filter(r=>!material(r)).length + ' | ' + g.filter(material).length + ' |');
L.push('| 合计 | 140 | 100% | 101 | 39 |','',
'比例四舍五入，显示值相加可能不是恰好 100%。类型体现任务材料的业务用途，例如“营销与图像制作需求”不表示网页内实现了图像编辑。',
'',
'## 3. 页面作用与真实交互',
'',
'| 本任务中页面的作用 | 组数 | 比例 | 解释 |',
'|---|---:|---:|---|',
'| 表单型 | 99 | ' + pct(99) + ' | 输入字段并提交/验证/生成回执的页面；包含特殊不提交分支和先修复表单的任务 |',
'| 按钮确认型 | 2 | ' + pct(2) + ' | 无可编辑字段，按钮跳转固定确认地址 |',
'| 资料型 | 39 | ' + pct(39) + ' | 任务读取表格、规则或请求，主要工作在其他环境/应用完成；不要求提交网页 |',
'',
'资料型不能一律描述为“完全没有 JavaScript”：其中 linux_android_smarthome_872 有可用的 query 回执处理器，linux_only_128 有 acknowledged fragment 处理器，但本任务不要求使用。linux_only_149 还要求打开指定静态确认页；它没有实际网页库存提交或修改逻辑。',
'',
'按源码实际提交/回执机制（与上面的任务用途是不同维度）汇总：',
'',
'| 源码实现机制 | 组数 | 其中本任务仅作为资料 |',
'|---|---:|---:|');
for (const [key,label] of mechanisms) {
  L.push('| ' + label + ' | ' + count(r=>r.implementation_mechanism===key) + ' | ' + count(r=>r.implementation_mechanism===key && material(r)) + ' |');
}
L.push('',
'前五项共 ' + count(r=>r.implementation_mechanism!=='no_submission_state') + ' 组存在提交/回执/导航代码。这是 5 种实现机制，不是 5 个已经去重的网站。固定确认导航中的 523 目标页部署存在缺口，不能将上述数量宣传为已验证可用网站数量。',
'',
'### 具体实现依据',
'',
'- 40 组 POST 表单：逐一核对 task 的 host_form_submission_state 合约。LinuxRuntime 用实际接收地址替换占位符；HostFormVerifier 接收字段/文件、校验并返回 submitted/invalid 页面。不能因为 HTML 没有 JavaScript 就误判不能提交。这里仅使用接收流程说明实现，不用 evaluator 隐藏答案推定业务需求。',
'- 这 40 组内部：35 个普通原生 POST、1 个两步 wizard、1 个 multipart 上传、1 个带页内回执的 POST、1 个附 PDF 下载入口、1 个任务要求修复字段名后提交的表单。',
'- 8 组前端值校验：输入与页面预设值比较，产生成功/失败文字或 fragment；不等于有后端数据库、账户系统或完整审批流程。',
'- 51 组 query 回执：将输入写入浏览器地址的 query / fragment，其中 50 组要求提交，1 组仅作资料。这些 Home 页面不直接连接或控制 SmartHome；实时查询和设备动作由任务中的 Home 环境承担。',
'- 2 组 fragment/文本回执：linux_only_263 收集 caseId/owner 并显示提交结果；linux_only_128 只是可选 acknowledged 标记。',
'- 2 组固定确认导航：linux_only_121 与 linux_smarthome_523；前者的确认页由 setup 明确创建，后者见下方疑点。',
'',
'相关共用实现：' + link('runtime.py', '../../mdcbench/devices/linux/runtime.py') + '、' + link('host_form.py', '../../mdcbench/devices/linux/host_form.py') + '。共享处理器说明复用机制，不足以单独决定所有业务页面应合并成一个网站。',
'',
'## 4. 与旧功能标签的区别及边界',
'',
'旧报告的 4 类是对全部 460 条 HTML 的自动功能标签（可重叠），本轮 16 类是对 140 组的业务主分类（互斥），不能互相替代，也不能相加。',
'',
'- 旧 form_entry=130 只检测 input/select/textarea，隐藏或 readonly 字段、静态材料中的占位表单也会被计入。',
'- 旧 submit_confirm_handler=67 漏掉无 JS 的真实原生 POST，同时把仅 preventDefault / return false 的空处理器也作为线索。因此它不是真实提交页面数。',
'- 仅在本轮 140 组中确认 1 组真正 file-input/multipart 上传：linux_android_1585，含两个文件字段。linux_android_169 虽文件名含 upload，只提交 package_id；linux_android_886 的 files 字段只是文本文件名清单。',
'- 本轮 140 组中确认 1 组 HTML download 链接：linux_android_230。PDF 由 setup 部署，链接始终可见，不宣称由验证码解锁。原 460 条的 download_export=6 不能被本轮的 1 覆盖。',
'- Linux/Android 上制作 PNG、PDF、ODT、JSON、CSV、播放音频或编辑工作簿，不等于对应 HTML 实现这些功能。',
'',
'### 需要保留的具体静态疑点',
'',
'linux_smarthome_523 的 index.html 点击后跳到 file:///home/user/approval/submitted.html?...#submitted；当前 setup 先删除 submitted.html，随后只部署 index.html，没有创建目标 HTML。故归为“有确认导航代码，但目标页初始化缺失”，不是完整可用的确认网站。依据为该任务 setup 与 HTML；本轮未执行验证、未修复，也不改判历史实验结果。',
'',
'另外两项属于任务/实现边界，不是本轮发现的模型失败：linux_android_1078 的当前源记录分支要求保持表单未提交；linux_android_235 明确要求 agent 修复字段名不匹配后再提交，server.py 是字段契约示例，实际接收来自 runtime。99 个表单型不能等同于 99 个当前条件下都应该直接提交的任务。',
'',
'任务要求提交/按钮确认共 100 组（98 个表单 + 2 个按钮）；另外 1 个表单明确应保持未提交；39 个资料型不要求表单提交。此处同样只是静态要求，不是执行成功数量。',
'',
'## 5. 独立网站实体应该如何表述',
'',
'此次已完成全部 140 组的语义用途与交互分类，而不是将 140 个不同标题变成 140 个网站。39 组建议按 task-specific HTML materials 保留；其余 101 组记作 synthetic form/confirmation interfaces。',
'',
'从功能角色、字段/记录结构与状态流，可见它们集中复用“输入记录—接收校验”“输入—前端值核对”“输入—URL 回执”“确认按钮—目标地址”等机制，而不是各自实现完整的票务、音乐、库存或 Home 控制产品。报告保留这些实现分类与每页证据，未把共享 builder/receiver、业务类型、页面标题或端口强行当作正式网站家族。',
'',
'因此：本轮可直接使用的数值是“140 个候选页面组，16 类业务；99 个表单型、2 个按钮确认型、39 个资料型”。如果论文要求 #websites 的独立实体数，101 不能直接填入；需要为匿名合成界面明确稳定的产品/应用家族边界。旧报告的“已确认网站 0”只代表没有完成独立实体确认项，不等于实际没有 Web 界面。本轮没有凭业务或控件分类擅自增加 #Apps / #websites。',
'',
'## 6. 逐组清单',
'',
'每条的简短理由、字段结构、部署位置、真实接收合约、功能与证据见 ' + link('html_website_classification.jsonl','html_website_classification.jsonl') + '。表中按主业务分组，不按模型结果分组。',
'',
'| 任务及原始 instruction | 业务类型 | 具体用途 | 页面作用 | HTML 源码 |',
'|---|---|---|---|---|');
for (const g of byBusiness) for (const row of g) {
  L.push('| '+link(row.task_id,'../../'+row.task_path)+' | '+escape(row.business_category_zh)+' | '+escape(row.business_role)+' | '+roleNames[row.task_page_role]+' | '+link('源码','../../'+row.html_path)+' |');
}
L.push('',
'## 7. 复现与限制',
'',
'复核读取每个 HTML 的正文、表单结构、脚本及对应原始 task instruction；CSS 样式在人工阅读显示中省略。需要时核对 setup、接收端与直接关联确认页。未执行嵌入脚本、未启动设备、未读取模型轨迹；任务质量之外的问题不扩展为全量审计。',
'',
'统计输入是 ' + link('原 inventory_data.json','../../statistics/inventory_data.json') + ' 和本轮逐项语义判断 JSONL。' + link('summarize_html_website_classification.mjs','summarize_html_website_classification.mjs') + ' 只聚合既有人工式静态判断，不用关键词自动给未读页面贴标签。',
'',
'在该 worktree 中运行：',
'',
'~~~bash',
'node analysis/statistics/summarize_html_website_classification.mjs',
'~~~',
'',
'脚本向 stdout 输出本报告，不改写任务或原盘点文件。检查仅针对遗漏/重复候选、证据路径缺失与数量不对账；若发现则修正分类记录或明确范围变化，不修改任务以凑数。',
'',
'本报告读取当前工作树（包含已有未提交修改），不是不可变发布快照。新增文件仅包含本次分类与汇总；不新增 hash，不更改已有实验统计口径。'
);
process.stdout.write(L.join('\n') + '\n');
