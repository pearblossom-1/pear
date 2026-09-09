// Summarize SAVED annotations only. This script does not infer/regenerate labels.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {Workbook} from '@oai/artifact-tool';
const OUT=path.dirname(fileURLToPath(import.meta.url)),BASE=path.dirname(OUT);
const jl=(n,dir=OUT)=>fs.readFileSync(path.join(dir,n),'utf8').trim().split('\n').map(JSON.parse);
const jr=n=>JSON.parse(fs.readFileSync(path.join(OUT,n),'utf8'));
const save=(n,x)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(x,null,2)+'\n');
const scope=jl('task_scope.jsonl'),rows=jl('task_application_annotations.jsonl'),apps=jr('application_entities.json'),provenance=jr('scope_provenance.json');
const byId=new Map(rows.map(r=>[r.task_id,r])),old=jl('task_inventory.jsonl',BASE),oldById=new Map(old.map(r=>[r.task_id,r]));
assert.equal(byId.size,rows.length);assert.equal(rows.length,scope.length);
assert.deepEqual([...byId.keys()].sort(),scope.map(r=>r.task_id).sort());
for(const s of scope){const r=byId.get(s.task_id);assert.equal(s.task_path,r.task_path);assert.equal(s.content_sha256,r.content_sha256);assert.deepEqual(s.scopes,r.scopes);assert(['complete','partial','unreviewed'].includes(r.status));assert.equal(r.confirmed_applications.length,new Set(r.confirmed_applications.map(a=>a.canonical_id)).size);assert(r.status!=='complete'||!r.unresolved.length);assert(r.confirmed_applications.every(a=>a.support.length&&a.support.every(e=>e.evidence.length)));if(r.status==='complete'&&!r.confirmed_applications.length)assert(r.no_concrete_app_reason);}
const pct=(n,d)=>Number((100*n/d).toFixed(6));
const sets=['candidate_all_provisional','proposed_release_conditional'],coverage=[],devices=[],summaries={};
const unique=a=>[...new Set(a)],counts=(a,key)=>Object.fromEntries(unique(a.map(key)).sort().map(k=>[k,a.filter(r=>key(r)===k).length]));
for(const set of sets){const ss=scope.filter(s=>s.scopes.includes(set)),rr=ss.map(s=>byId.get(s.task_id)),n=ss.length;
 for(const app of apps){const selected=rr.filter(r=>r.confirmed_applications.some(a=>a.canonical_id===app.canonical_id));coverage.push({scope:set,canonical_id:app.canonical_id,normalized_name:app.display_name,platform:app.platform,identity:app.identity,count:selected.length,denominator:n,percentage:pct(selected.length,n),metric:'confirmed_task_coverage_lower_bound',scope_status:'provisional_not_final_release',task_ids:JSON.stringify(selected.map(r=>r.task_id)),evidence_reference:'task_application_annotations.jsonl#/confirmed_applications',counting_unit:'unique task_id; multi-application proportions not normalized'});}
 for(const [level,field]of [['environment_combination','environment_combination'],['device_configuration','device_configuration'],['device_count','device_count']]){
  const grouped=counts(ss,s=>String(s[field]));assert.equal(Object.values(grouped).reduce((a,b)=>a+b,0),n);
  for(const [category,count]of Object.entries(grouped)){const selected=ss.filter(s=>String(s[field])===category);devices.push({scope:set,level,category,parent_combination:level==='device_configuration'?selected[0].environment_combination:'',count,denominator:n,percentage:pct(count,n),task_ids:JSON.stringify(selected.map(s=>s.task_id))});}
 }
 const ds=devices.filter(d=>d.scope===set);for(const d of ds.filter(d=>d.level==='environment_combination'))assert.equal(ds.filter(x=>x.level==='device_configuration'&&x.parent_combination===d.category).reduce((s,x)=>s+x.count,0),d.count);
 const previousScope=set==='candidate_all_provisional'?'candidate_all':'proposed_release';
 const previous=old.filter(r=>r.scopes.includes(previousScope));assert.deepEqual(previous.map(r=>r.task_id).sort(),ss.map(r=>r.task_id).sort());
 for(const s of ss){const o=oldById.get(s.task_id);assert.equal(s.environment_combination,o.environment_combination);assert.equal(s.device_configuration,o.device_configuration);assert.equal(s.device_count,o.device_count);}
 const complete=rr.filter(r=>r.status==='complete'),partial=rr.filter(r=>r.status==='partial'),unreviewed=rr.filter(r=>r.status==='unreviewed');
 assert.equal(complete.length+partial.length+unreviewed.length,n);
 summaries[set]={task_count:n,complete:complete.length,partial:partial.length,unreviewed:unreviewed.length,complete_with_concrete_app:complete.filter(r=>r.confirmed_applications.length).length,complete_without_concrete_app:complete.filter(r=>!r.confirmed_applications.length).length,confirmed_app_covered_tasks:rr.filter(r=>r.confirmed_applications.length).length,confirmed_task_app_pairs:rr.reduce((s,r)=>s+r.confirmed_applications.length,0),confirmed_entities:coverage.filter(c=>c.scope===set&&c.count>0).length,complete_no_app_reasons:counts(complete.filter(r=>!r.confirmed_applications.length),r=>r.no_concrete_app_reason),unspecified_interaction_tasks:rr.filter(r=>r.unspecified_interactions.length).length,total_device_instances:ss.reduce((s,r)=>s+r.device_count,0),mean_device_count:ss.reduce((s,r)=>s+r.device_count,0)/n,max_device_count:Math.max(...ss.map(s=>s.device_count)),old_device_distribution_matches:true,environment_combinations:counts(ss,s=>s.environment_combination),specific_device_configurations:counts(ss,s=>s.device_configuration),device_count_distribution:counts(ss,s=>String(s.device_count)),partial_task_ids:partial.map(r=>r.task_id),percentage_sum:coverage.filter(c=>c.scope===set).reduce((s,c)=>s+c.percentage,0),ready_for_final_full_coverage_figure:false,figure_readiness_reason:'Scope awaits final release confirmation; six unresolved identities remain. Current confirmed lower-bound figure is possible only if explicitly labeled.'};
}
const identity=apps.map(app=>{
 const relations=rows.flatMap(r=>r.confirmed_applications.filter(a=>a.canonical_id===app.canonical_id).map(a=>({r,a})));
 const labels=unique([app.display_name,...app.aliases,...relations.flatMap(({a})=>a.original_labels||[])]);
 return {canonical_id:app.canonical_id,normalized_name:app.display_name,platform:app.platform,identity:app.identity,original_names_and_functional_labels:JSON.stringify(labels),previous_identity:app.previous_identity,identity_evidence:app.identity_source,mapping_change:app.mapping_change,affected_task_ids:JSON.stringify(relations.map(({r})=>r.task_id)),mapping_status:'confirmed_entity; functions require task-instance binding'};
});
identity.push({canonical_id:'unresolved:gallery',normalized_name:'Gallery (specific product unresolved)',platform:'Android',identity:'unknown',original_names_and_functional_labels:'["Gallery","Android Gallery"]',previous_identity:'not forced into Simple Gallery Pro',identity_evidence:'task_application_annotations.jsonl#/unresolved',mapping_change:'Keep separate from confirmed Simple Gallery Pro',affected_task_ids:JSON.stringify(summaries[sets[0]].partial_task_ids.filter(id=>id!=='android_smarthome_1013')),mapping_status:'unresolved; excluded from concrete coverage counts'});
identity.push({canonical_id:'unresolved:simple-contacts-pro',normalized_name:'Contacts identity conflict',platform:'Android',identity:'unknown',original_names_and_functional_labels:'["Contacts","simple contacts pro"]',previous_identity:'Google Contacts not retained for this task',identity_evidence:'android_smarthome_1013 setup; androidworld_contact_add implementation',mapping_change:'Do not merge Simple Contacts Pro with Google Contacts',affected_task_ids:'["android_smarthome_1013"]',mapping_status:'unresolved; excluded from concrete coverage counts'});
const unresolved=rows.filter(r=>r.status!=='complete').map(r=>({task_id:r.task_id,task_path:r.task_path,status:r.status,scopes:JSON.stringify(r.scopes),issues:JSON.stringify(r.unresolved.map(u=>({app_id:u.app_id||null,issue:u.issue}))),evidence:JSON.stringify(r.unresolved.map(u=>u.evidence)),confirmed_apps:JSON.stringify(r.confirmed_applications.map(a=>a.normalized_name)),impact:'Task stays in full denominator; unknown application identity contributes no positive app count',next_step:r.task_id==='android_smarthome_1013'?'Confirm whether concrete contact app is Google Contacts or Simple Contacts Pro using authoritative environment mapping; do not modify task in this analysis':'Confirm intended Gallery product from authoritative task/environment documentation; do not infer Simple Gallery Pro from a generic name'}));
const csvChecks=[];
async function csv(name,data){const headers=Object.keys(data[0]),matrix=[headers,...data.map(r=>headers.map(k=>r[k]??''))],wb=Workbook.create(),sh=wb.worksheets.add('Data'),range=sh.getRangeByIndexes(0,0,matrix.length,headers.length);range.values=matrix;wb.recalculate();assert.deepEqual(range.values,matrix);const content=range.values.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';fs.writeFileSync(path.join(OUT,name),content);const back=await Workbook.fromCSV(content,{sheetName:'Data'}),actual=back.worksheets.getItemAt(0).getUsedRange().values;assert.deepEqual(actual.map(r=>r.map(v=>String(v??''))),matrix.map(r=>r.map(v=>String(v??''))));for(const r of data){if(r.task_ids){const ids=JSON.parse(r.task_ids);assert.equal(ids.length,new Set(ids).size);assert.equal(ids.length,r.count);assert(ids.every(id=>byId.has(id)));}if(r.denominator)assert(Math.abs(r.percentage-r.count/r.denominator*100)<0.000001);}csvChecks.push({file:name,rows:data.length,roundtrip_values_match:true,task_ids_not_truncated:true});}
await csv('application_coverage.csv',coverage);await csv('application_identity_map.csv',identity);await csv('unresolved_cases.csv',unresolved);await csv('device_distribution.csv',devices);
// Compare actual previous device CSV, not only its underlying JSONL.
const oldWb=await Workbook.fromCSV(fs.readFileSync(path.join(BASE,'device_distribution.csv'),'utf8'),{sheetName:'Old'}),oldTable=oldWb.worksheets.getItemAt(0).getUsedRange().values,oldHeader=oldTable[0],oldD=oldTable.slice(1).map(r=>Object.fromEntries(oldHeader.map((k,i)=>[k,r[i]])));
for(const d of devices){const oldScope=d.scope===sets[0]?'candidate_all':'proposed_release',o=oldD.find(r=>r.scope===oldScope&&r.level===d.level&&String(r.category)===d.category);assert(o,'Missing previous device category '+d.category);assert.equal(Number(o.count),d.count);assert.equal(Number(o.denominator),d.denominator);}
save('csv_validation.json',{checks:csvChecks,old_device_csv_matches:true});
const extraction=jl('extracted_source_text.jsonl'),pilot=old.filter(r=>r.applications.length),main=sets[0];
const summary={generated_at:new Date().toISOString(),provenance,scope_status:'provisional',primary_scope:main,scopes:summaries,review:{all_tasks_parsed:rows.length,unreviewed:rows.filter(r=>r.status==='unreviewed').length,Codex_task_specific_decision_count:Object.keys(jr('semantic_overrides.json')).length,full_rule_passes:'All 5897 actual task instructions/setup/linked textual resources; per-instance bindings, not family label propagation',annotation_sources:unique(rows.flatMap(r=>r.confirmed_applications.flatMap(a=>a.support.map(s=>s.annotation_source)))),uploaded_resources:jl('evidence_packs.jsonl').reduce((n,p)=>n+p.resources.length,0),native_documents_text_extracted:extraction.filter(e=>!e.error).length,native_document_extraction_errors:extraction.filter(e=>e.error).map(e=>({path:e.source_path,error:e.error})),prior_task_versions_changed:provenance.changed_since_previous_snapshot.length},previous_pipeline:{full_name_screen:5897,semantic_pilot_tasks:100,confirmed_app_tasks:pilot.length,confirmed_entities:25,counts_not_reused_as_full_census:true},coverage:coverage.filter(r=>r.scope===main).sort((a,b)=>b.count-a.count),device_verification:{same_task_ids_and_denominators:true,one_configuration_per_task:true,nested_and_count_totals_match:true,old_jsonl_and_csv_match:true,IoT_endpoints_not_counted_as_independent_devices:true,correction_needed:false},html:{changed:false,resources:460,categories:17,resource_associated_tasks:417,website_interaction_tasks:416,reference:'../html_resource_audit.jsonl;../website_coverage.csv',not_in_app_list:true},quality:{unique_annotation_per_task:true,unique_task_app_pairs:true,statuses_reconcile:true,counts_recomputed_from_saved_positive_annotations:true,unknown_not_counted_as_absent:true,no_model_outcomes_used:true,no_devices_or_agents_run:true,source_preservation_reference:'source_preservation_check.json'},limitations:['Candidate scope, not approved final release manifest.','Six concrete product identities unresolved; all coverage rates are confirmed lower bounds over full scope.','Static application review, not execution validation or complete evaluator/quality audit.','Configured device_ids describe possible app instances; individual device necessity is not exhaustively assigned.','Generic filesystem/terminal operations and unconstrained GUI functions are not concrete products.','Raster/media content was not comprehensively OCRed/transcribed; application participation follows required object/operation and linked textual task materials, not media-content validation.']};
save('summary.json',summary);
if(fs.existsSync(path.join(OUT,'source_preservation_check.json'))){
 const check=jr('source_preservation_check.json');
 summary.quality.source_preservation={checked_files:check.checked_files,changed_files:check.changed_files,checked_at:check.checked_at,task_content_hashes_checked:scope.length};
 save('summary.json',summary);
}
const table=(headers,data)=>['| '+headers.join(' | ')+' |','| '+headers.map(()=>'---').join(' | ')+' |',...data.map(r=>'| '+r.join(' | ')+' |')].join('\n');
const s=summaries[main],c=summaries[sets[1]],node='/Users/lht/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node',relative='analysis/benchmark_overview_20260909/app_full_analysis';
const readme=[
'# DevicesWorld 全量应用覆盖核对',
'',
'本轮覆盖全部 **5,897 条现有候选任务**。未发现已确认的最终发布 manifest，因此结果标为 **provisional**。5,894 是沿用现有清洗建议排除三条后的条件性范围，不是本轮凑出的正式规模。所有文件均新增在本子目录，未覆盖旧报告。',
'',
'## 范围与完成程度',
'',
table(['范围','任务数','complete','partial','unreviewed','complete 有具体应用','complete 无具体应用'],sets.map(k=>{const x=summaries[k];return[k,x.task_count,x.complete,x.partial,x.unreviewed,x.complete_with_concrete_app,x.complete_without_concrete_app];})),
'',
'- 主清单来自 `statistics/scope_manifest.json` 的六个编号目录与280条单Home任务；逐任务路径、当前内容SHA-256、原始设备及统计范围保存在 `task_scope.jsonl`。不合并相似但不同ID，不加入历史副本、backup、子任务或运行日志。',
'- 条件性排除依据是既有 `analysis/statistics/cross_device_light_review.jsonl` 的非跨设备记录：android_smarthome_123、124、129；按路径和ID共同匹配。原manifest没有改动。最终发布仍需用户确认。',
'- 源版本 HEAD：`'+provenance.commit+'`，分支 `'+provenance.branch+'`。工作树原有未提交修改已记录于 `scope_provenance.json`，实际读的是当前文件，不是假称clean的HEAD版本；与上轮5897条内容快照相比变更0条。',
'- `complete` 是本轮静态应用核对完成，不代表任务执行成功或质量完全验证；确认无具体软件、仅IoT也可complete。6条partial仍保留在所有适用分母里。',
'',
'## 完整应用覆盖',
'',
'当前确认 **'+s.confirmed_entities+' 个应用实体**，'+s.confirmed_app_covered_tasks+'条任务有至少一个已确认应用，共'+s.confirmed_task_app_pairs+'个去重任务—应用关系。CSV完整列出28个实体在两个范围下的统计，不仅Top-N；每行保存完整task IDs。',
'',
table(['应用','候选5897：确认任务数','已确认覆盖下界','条件5894：确认任务数'],summary.coverage.map(a=>[a.normalized_name,a.count,a.percentage.toFixed(2)+'%',coverage.find(x=>x.scope===sets[1]&&x.canonical_id===a.canonical_id).count])),
'',
'同一任务多次或跨设备使用同一实体只计一次；多个应用分别计入。主范围覆盖比例之和为'+s.percentage_sum.toFixed(2)+'%，未归一化成100%。纯IoT的280条任务始终在全量分母中。',
'',
'**正式完整应用分布图尚不宜定稿。** 可以画明确标注“当前候选范围、已确认覆盖下界”的预备图，但应先确认发布清单并解决6条身份疑点后再称完整分布。本轮不生成图或修改论文声明。',
'',
'## 与旧100条试标的区别',
'',
'旧流程扫描了5897条，但应用主count仅来自100条Codex试标，其中77条有应用、25个实体。全量名称候选没有被当成最终语义标注。本轮重新处理5897条实际实例；旧阳性仅在内容版本一致且不与当前证据冲突时保留，不能作为该任务全部应用已经核完的凭据。',
'',
'保留原25个实体粒度，新增 Android Settings、gedit、GNOME Terminal（分别'+coverage.find(x=>x.scope===main&&x.canonical_id==='app:android-settings').count+'、2、1条）。新增来自实际要求及唯一配置绑定，不来自安装清单。xfce4-terminal、Thunar、Nautilus只作启动便利，不计入应用覆盖。OsmAnd、Retro Music、Audio Recorder、Files、Camera的旧runtime alias补充为已有运行时代码中明确的包名，不改变实体。Chrome跨平台合并方式沿用旧清单；Calc/Writer/Impress仍分开。',
'',
'## 判定与证据',
'',
'批量规则先关联实际指令中的应用对象/动作，再用该实例setup别名、原生记录、已引用资源确定身份；安装或配置存在本身不能确认参与。原生短信正文、联系人/待办/事件字段、Markor文件、PDF/Office/ZIP文本一起检查信息来源和输出去向。固定174条任务的Codex具体决定在 `semantic_decisions.mjs` / `semantic_overrides.json`，不称人工标注，不按家族无条件传播。',
'',
'依据和规则名保存在每个任务—应用关系的support中，带task JSON字段或来源路径。角色包括source_read、process_edit、result_output；仅可确定读/操作但方向未进一步区分时标read_or_operate_required_object。device_ids是配置中的可能实例，不声称这些实例全都必需；应用按task ID计数。',
'',
'未限定具体产品的通用文件操作不映射到Files/VS Code/Terminal；生成HTML不自动算浏览器，格式不算Office软件；Camera相册不等于相机拍摄；仅保护不变不算使用。但必须读真实Calendar/Clock来判断不存在时，仍计信息来源。确切Markor目录与被引用笔记内容能证明来源时，不因为指令没写Markor而漏计。详见 `audit_report.md`。',
'',
'## 尚待确认的6条',
'',
table(['任务','问题'],unresolved.map(r=>[r.task_id,r.task_id==='android_smarthome_1013'?'指令Contacts、setup simple contacts pro 与原生联系人helper身份冲突':'指令要求Gallery，但未找到能唯一确定具体Gallery产品的配置绑定'])),
'',
'这6条不是缺陷或失败标签。若5条Gallery最终确认为Simple Gallery Pro，该应用最多增加5个任务；联系人若确认为Google Contacts则其计数增加1，若为另一具体产品则需要新增实体。不能仅为了完成表格而猜测映射。',
'',
'两份原生PDF文字提取报错（linux_only_007 gamma.pdf、linux_only_231 report.pdf）已逐任务核对为文件清单/空产物种子，不承载必需的应用指示，不因此增加应用疑点；不把它们宣布为任务执行bug。图片/音频未作全量OCR或内容有效性审计。',
'',
'## 设备统计对账与HTML边界',
'',
table(['范围','设备实例总数','平均设备数','最大设备数'],sets.map(k=>{const x=summaries[k];return[k,x.total_device_instances,x.mean_device_count.toFixed(6),x.max_device_count];})),
'',
'设备与应用使用完全相同的task IDs和分母。每任务恰归入一个具体配置，14种具体配置对账回7种环境组合，设备数量层级也等于范围总数。一个Home只计一个IoT环境，灯/空调/房间等端点不增加设备实例。与旧JSONL及 `../device_distribution.csv` 两种范围逐项一致，**不需要修正旧设备计数**。',
'',
'HTML结果保留原处：460条资源、17类用途、关联417个任务；实际网站用途交互统计416条任务。它们不加入28个应用实体。本轮范围与旧对应范围一致，无需重新归类网站或改变其计数。',
'',
'## 复现、续跑与文件',
'',
'只汇总当前保存标注（不会改语义标签）：',
'',
'```bash',
'cd '+provenance.root,
node+' '+relative+'/aggregate.mjs',
'```',
'',
'显式重新应用已记录规则/具体决定：先运行 `semantic_decisions.mjs`，再运行 `review.mjs --all`；仅中断续跑、规则未变时运行 `review.mjs --resume`。24个250条以内的batch与progress.json保存进度。更新规则/决定后不能用resume跳过旧batch。最后再运行aggregate。',
'',
'`prepare.mjs`只读源任务并保存一次快照，已有快照时拒绝覆盖；`extract_sources.mjs`只做本地原生文档文字提取。二者不运行setup、生成器或agent。原文中的命令只作为数据读取。',
'',
'- task_scope.jsonl：5897条范围和版本；task_application_annotations.jsonl：5897条标注。',
'- application_coverage.csv：完整应用计数/分母/百分比/ID；application_identity_map.csv：别名、实体与变更、两类未决身份。',
'- unresolved_cases.csv：6条任务及全部问题证据；device_distribution.csv：两范围的组合/配置/设备数。',
'- summary.json：机器可读汇总；csv_validation.json：电子表格工具生成与回读逐值核对。',
'- evidence_packs.jsonl / extracted_source_text.jsonl：来源快照及只读文字提取；audit_report.md / audit_sample.json：抽检与系统性修正记录。',
'- source_preservation_before.json / source_preservation_check.json：本轮原任务、资源、运行配置与实现前后核对。',
'',
'CSV依照Spreadsheets技能通过artifact-tool表格生成并回读；PDF技能用于只读提取关联文档文字。本轮没有修改任务、资源、已有实验配置或evaluator，没有运行设备/模型，没有读取密钥或调用收费API；没有自动commit或push。',
...(summary.quality.source_preservation?['','已完成源文件保护核对：'+summary.quality.source_preservation.checked_files+'个原始任务/资源/配置/实现文件未变化，5897条任务内容哈希一致。现有Git未提交修改为本轮开始前已有修改，未覆盖。']:[]),
];
fs.writeFileSync(path.join(OUT,'README.md'),readme.join('\n')+'\n');
console.log(JSON.stringify({scopes:summaries,csv:csvChecks}));
