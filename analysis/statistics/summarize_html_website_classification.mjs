import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

// This script aggregates reviewed decisions, not raw-page keyword classifications.
// It only reads the adjacent JSONL and prints Markdown, so it also works in pear.
const here = path.dirname(fileURLToPath(import.meta.url));
const rows = fs.readFileSync(path.join(here, 'html_website_classification.jsonl'), 'utf8')
  .trim().split('\n').map(line=>JSON.parse(line));
assert.equal(rows.length,460,'The recorded candidate scope must be changed explicitly.');
assert.equal(new Set(rows.map(r=>r.html_path)).size,460,'Duplicate HTML resource.');
assert.equal(rows.filter(r=>r.review_scope_group==='previous_140').length,140);
assert.equal(rows.filter(r=>r.review_scope_group==='previous_320').length,320);
for(const r of rows) {
  assert(r.business_category_zh && r.review_reason && r.html_role && r.deployed_locations.length,r.html_path);
  assert.equal(r.classification_review,'completed_static_review');
}
const n = fn => rows.filter(fn).length;
const old = r=>r.review_scope_group==='previous_140';
const pct = k=>(k/460*100).toFixed(2)+'%';
const ids = rr=>new Set(rr.flatMap(r=>r.associated_task_ids));
const businesses = new Map();
for(const r of rows){if(!businesses.has(r.business_category))businesses.set(r.business_category,[]);businesses.get(r.business_category).push(r);}
const groups=[...businesses.values()].sort((a,b)=>b.length-a.length||a[0].business_category.localeCompare(b[0].business_category));
const roles = [
  ['reference_material','阅读参考与资料页（含目录/附件索引）'],
  ['form_interface','表单型界面'],
  ['confirmation_button','固定按钮确认入口'],
  ['download_gateway','专门下载入口'],
  ['static_confirmation','静态确认/回执页'],
  ['browser_execution_asset','浏览器结果构造程序'],
  ['editable_html_artifact','待编辑 HTML 产物模板'],
];
const roleNames=Object.fromEntries(roles);
const features=[
  ['information_display','信息展示'],
  ['business_form_entry','表单业务输入入口'],
  ['submission_confirmation_logic','提交/确认状态处理代码'],
  ['hyperlink_navigation','原生超链接'],
  ['download_export','下载链接'],
  ['file_upload','真实文件上传控件'],
  ['browser_result_computation','浏览器结果计算/构造'],
];
const esc=s=>String(s||'').replaceAll('|','\\|').replaceAll('\n',' ');
const link=(name,p)=>'['+esc(name)+']('+encodeURI(p)+')';
const L=[
'# HTML / Website 完整分类统计：460 条资源',
'',
'日期：2026-09-08。此版替换此前仅含 140 组的补充表，覆盖原盘点纳入的全部 HTML；不是最终发布范围或设备执行验证。',
'',
'## 1. 完整范围与对账',
'',
'| 项目 | 数量 |',
'|---|---:|',
'| 此前待归类并已复核的页面组 | 140 |',
'| 此前标为资料类、本轮补充逐项归类的资源 | 320 |',
'| **完整 HTML 统计范围** | **460** |',
'| 关联不同原始任务 | '+ids(rows).size+' |',
'| 实体 HTML 文件 | '+n(r=>r.resource_kind==='file')+' |',
'| setup 内联 HTML | '+n(r=>r.resource_kind==='inline_setup')+' |',
'| 主要业务类型（每资源一个主类） | '+businesses.size+' |',
'',
'原发现数为 461；linux_only_249 的未部署旧 form.html 仍排除，故 461 − 1 = 460。不是“140 加上另外 460”，也不是 460 个独立网站或 460 个任务。',
'',
'旧 140 关联 '+ids(rows.filter(old)).size+' 个任务；补充 320 关联 '+ids(rows.filter(r=>!old(r))).size+' 个任务；两部分有 '+[...ids(rows.filter(old))].filter(id=>ids(rows.filter(r=>!old(r))).has(id)).length+' 个任务重合，按任务去重后为 '+ids(rows).size+'。同一任务的目录、详情、历史候选和确认页可占多条 HTML 资源，但不据此增加网站。',
'',
'本轮读取全部新增 320 条的正文/属性/脚本与原始 instruction，并沿用已完成的 140 条逐项复核；核对 setup 部署，针对下载与浏览器构造程序读取直接相关实现。未启动网页、设备或 agent；未依据模型表现分类，也未修改任务、evaluator、原统计范围或实验集合。',
'',
'## 2. 完整业务分类表',
'',
'分母统一为 460。采用“业务目的”主分类，不把一个资源重复计入多个业务类。Home 环境设置、未来计划、家电维护和只读盘点分别归类；有食谱内容的新增资源归入食谱与烹饪准备。软件类名称扩展为“软件研发、发布与 QA”，以包含新纳入的 API/算法修复说明；原 140 的分类归属不变。',
'',
'| 业务类型 | 原 140 | 补充 320 | **全部** | 占 460 比例 |',
'|---|---:|---:|---:|---:|',
];
for(const g of groups)L.push('| '+g[0].business_category_zh+' | '+g.filter(old).length+' | '+g.filter(r=>!old(r)).length+' | **'+g.length+'** | '+pct(g.length)+' |');
L.push('| **合计** | **140** | **320** | **460** | **100%** |','',
'显示百分比经四舍五入。这里的 '+businesses.size+' 类描述页面内容服务的业务，不是 '+businesses.size+' 个网站；例如营销图片制作要求页不代表网页本身有图像编辑器。',
'',
'## 3. 完整页面作用分类',
'',
'以下为互斥的主要页面作用，数量必须合计 460。资料页可含普通链接或未被本任务使用的回执处理器，不等于所有资料页都无 JavaScript。',
'',
'| 页面作用 | 原 140 | 补充 320 | **全部** | 比例 |',
'|---|---:|---:|---:|---:|');
for(const [key,name]of roles)L.push('| '+name+' | '+n(r=>old(r)&&r.html_role===key)+' | '+n(r=>!old(r)&&r.html_role===key)+' | **'+n(r=>r.html_role===key)+'** | '+pct(n(r=>r.html_role===key))+' |');
assert.equal(roles.reduce((s,[key])=>s+n(r=>r.html_role===key),0),460);
L.push('| **合计** | **140** | **320** | **460** | **100%** |','',
'- 348 条资料类 = 原 140 中 39 条 + 补充 320 中 309 条；后者再分为 297 条普通资料、10 条目录/书签索引、2 条附件索引。',
'- 99 条表单型包含不同接收机制，不等于 99 个独立网站；其中 linux_android_1078 当前分支要求不提交，linux_android_235 要先修复字段名再提交。',
'- 2 条按钮确认入口与 4 条静态回执分开统计：前者是发起导航的界面，后者是已显示确认内容或作为目标的页面。同一流程不因此变成两个网站。',
'- 5 条专门下载入口不包含表单型 linux_android_230；该表单还提供 PDF 下载，所以下载功能总数是 6 而不是 5。',
'- linux_android_165 的 build-result.html 是浏览器执行程序：fetch source-input.json，调用 gate.js，写 DOM 结果；build-result.sh 通过 headless Chrome 提取结果生成 JSON。这是待修复模块的任务执行资产，不是纯静态正文，也不凭该程序额外计一个网站。',
'- linux_only_271 的 report.html 是待替换的报告草稿，编辑发生在外部，不是内嵌 Web 编辑器。',
'',
'## 4. 完整功能分布（可多标签）',
'',
'此表覆盖全部 460，功能可重叠，不能把各行相加当页面/应用总数。业务类型、主要页面作用、实现功能是三个不同维度。',
'',
'| 功能 | 原 140 | 补充 320 | 全部资源数 |',
'|---|---:|---:|---:|');
for(const [key,name]of features)L.push('| '+name+' | '+n(r=>old(r)&&r.function_labels.includes(key))+' | '+n(r=>!old(r)&&r.function_labels.includes(key))+' | '+n(r=>r.function_labels.includes(key))+' |');
L.push('',
'功能口径说明：',
'',
'- 表单业务入口按实际收集字段的流程计，不把隐藏 token、readonly 材料、无处理器的装饰按钮自动计入。这里不是声称每个入口均已通过执行测试。',
'- 提交/确认处理共 103：真实 POST 接收 40、前端值校验 8、query 回执 51、fragment/文本确认 2、固定确认导航 2。含两个在本任务中仅作为资料的处理器（linux_android_smarthome_872、linux_only_128）。',
'- 原生超链接指 HTML 源码中的 a[href]，不包括纯文本 URL、脚本修改 location 或浏览器自行输入地址；只确认链接存在，未全面验证每个目标地址可访问。',
'- 下载共 6 页：linux_android_230、linux_only_019、linux_smarthome_508、570、783、974；直接下载附件均在 setup 中部署。783 含当前与历史两条下载链接，但按页面只计 1。',
'- 真实文件上传仅 linux_android_1585，含两个 file 字段及 multipart 接收。文件名含 upload 或字段写着 files 并不足以计上传。',
'- 规则页面中的公式、阈值、筛选要求由 agent/外部应用执行，不当作 Web 查询筛选或 Web 计算功能。浏览器结果构造程序单列，不与“用户交互计算器”混称。',
'',
'旧 summary 中 form_entry=130、submit_confirm_handler=67 是自动源码线索，不是这次语义复核后的可用业务入口数：旧规则既把隐藏/readonly 控件计入，也漏掉原生 POST；还漏掉没有输入控件的 browser-backed 结果程序。本报告保留每条 initial_inventory_function_labels，另以 function_labels 保存完整复核口径，不默默覆盖原 summary。',
'',
'## 5. 页面关系、网站身份与具体例外',
'',
'### 不按页面或业务类型计网站',
'',
'- linux_android_073 的 5 页是一个维护资料集合：目录与 East/West、Current/Archived/Draft 候选，不是 5 个网站。',
'- linux_android_165 的 2 页分别是人读契约和程序化结果构造页；同任务不等于同一功能，更不能把执行程序当成额外网站产品。',
'- linux_only_121 的按钮页与 setup 内联确认页属于同一确认路径；linux_only_149 的说明页与确认页同理。',
'- JSONL 中 page_collection_id 仅表示同一 task 的关联资源，不冒充正式网站 canonical_id；标题、业务类、端口和共享处理器也不直接作为网站身份。',
'',
'**独立网站实体数仍需身份/家族确认，不能填写 460、140 或 17。** 当前已有 25 个明确应用实体的统计不在本轮重算；本次完成的是全部 HTML 的业务与页面/功能分类，而不是把每个合成页面包装成新应用。匿名下载页同样不能因可下载就独立算网站。网页是 task-specific materials 并不意味着它无价值或任务应删除。',
'',
'### 具体静态限制',
'',
'- linux_smarthome_523 的按钮指向 submitted.html，但当前 setup 清除该文件后只部署 index.html，未见确认目标重建。仍记为有固定导航代码，并明确该缺口；不声称流程已验证可用，不修改或重判实验。',
'- linux_android_230 的 PDF 链接始终可见，不宣称验证码技术上解锁文件。',
'- linux_android_165 当前 gate.js 为待修复实现；有计算执行链不表示初始算法正确，这正是任务要求，不是本轮擅自修复的对象。',
'- HTML 包含“submit”“dashboard”“editor”之类文案，但没有相应处理代码时，以实际界面/任务使用方式分类，不补出原任务没有的功能。',
'',
'## 6. 全部 460 条逐项清单',
'',
'完整理由、关联任务、部署位置、页面集合、原始与复核功能、证据路径均见 '+link('html_website_classification.jsonl','html_website_classification.jsonl')+'。以下每行对应一个 HTML 资源，按业务主类排列；“原 140 / 补充 320”用于回溯来源。',
'',
'| 任务 | 来源 | 业务类型 | 页面具体用途 | 页面作用 | 源码/内联位置 |',
'|---|---|---|---|---|---|');
for(const g of groups)for(const r of g)L.push('| '+link(r.task_id,'../../'+r.task_path)+' | '+(old(r)?'原 140':'补充 320')+' | '+esc(r.business_category_zh)+' | '+esc(r.business_role)+' | '+roleNames[r.html_role]+' | '+link(r.resource_kind==='inline_setup'?'setup 内联':'HTML','../../'+r.html_path.split('#')[0])+' |');
L.push('',
'## 7. 复现、版本与范围',
'',
'统计基于当前 MDCBench 工作树及原 inventory_data.json 所定义的候选范围。来源 worktree：/Users/lht/home/MDCBench/workflow/experiment_worktrees/gpt55-core200-rerun-20260826。包含已有未提交任务修改，不把当前 HEAD 当作全体文件的不可变发布快照。',
'',
'本轮仅更新 analysis/statistics 下的完整报告、JSONL 和聚合脚本，原 summary 作为历史初筛报告保留。上一版 140 组补充报告可在 pear 的 b1605eb 提交中查看；此次报告入口改为完整 460 条。',
'',
'聚合脚本只读取同目录 JSONL，无需设备、网络或原始任务目录，在 MDCBench 和 pear 均可生成同一报告：',
'',
'~~~bash',
'node analysis/statistics/summarize_html_website_classification.mjs',
'~~~',
'',
'脚本输出到 stdout，不写任务文件。逐条语义分类已记录于 JSONL，不通过关键词自动替未读任务贴标签。提交前核对 460 条覆盖、重复资源、140/320 分组、证据位置及各表合计；这些检查只为发现漏项/重复/路径遗漏，不修改任务来满足统计。未新增 hash、校验和或网站实体包装层。',
'',
'本报告是轻量静态分类，不是网页运行验收、全量任务质量审计或最终发布集规模声明。'
);
process.stdout.write(L.join('\n')+'\n');
