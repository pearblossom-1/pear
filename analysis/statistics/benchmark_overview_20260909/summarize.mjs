import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const OUT=path.dirname(fileURLToPath(import.meta.url));
import {Workbook} from '@oai/artifact-tool';
const jl=n=>fs.readFileSync(path.join(OUT,n),'utf8').trim().split('\n').map(JSON.parse);
const jr=n=>JSON.parse(fs.readFileSync(path.join(OUT,n),'utf8'));
const save=(n,x)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(x,null,2)+'\n');
const rows=jl('task_inventory.jsonl'),chars=jl('task_characteristics.jsonl'),queue=jl('review_queue.jsonl'),html=jl('html_resource_audit.jsonl');
const source=jr('scope_record.json'),progress=jr('annotation_progress.json'),aliases=jr('application_aliases.json'),metadata=jr('metadata_fields.json');
// Application totals now read the saved, user-approved attribution layer.
// The task inventory remains the original source/pilot snapshot for other metrics.
const attribution=jl('app_full_analysis/operation_attribution_v2/task_application_attribution.jsonl');
const attributionById=new Map(attribution.map(r=>[r.task_id,r]));
const appEntities=jr('app_full_analysis/application_entities.json');
const attributionSummary=jr('app_full_analysis/operation_attribution_v2/summary.json');
assert.deepEqual([...attributionById.keys()].sort(),rows.map(r=>r.task_id).sort());
for(const r of rows)assert.equal(attributionById.get(r.task_id).task_path,r.task_path);
const scopes=['candidate_all','proposed_release','supported_cross_device'];
const ids=arr=>[...new Set(arr.map(r=>r.task_id))].sort();
const pct=(n,d)=>Number((100*n/d).toFixed(6));
const uniq=a=>[...new Set(a)].sort();
assert.equal(rows.length,new Set(rows.map(r=>r.task_id)).size);
assert.equal(rows.length,chars.length);for(const r of rows){const c=chars.find(x=>x.task_id===r.task_id);assert(c);assert.equal(c.content_sha256,r.content_sha256);}
const sums={};const devices=[],apps=[],websites=[],iot=[],features=[],co=[],reviewedCounts=[];
const featureNames=Object.keys(chars[0].labels);
const kinds=uniq(html.map(r=>r.category));
for(const scope of scopes){
 const rr=rows.filter(r=>r.scopes.includes(scope)),cc=chars.filter(r=>r.scopes.includes(scope)),n=rr.length;
 assert.equal(n,source.scopes[scope]);
 const comboCounts={};
 for(const [level,field]of [['environment_combination','environment_combination'],['device_configuration','device_configuration'],['device_count','device_count']]){
  let total=0;
  for(const value of uniq(rr.map(r=>String(r[field])))){const selected=rr.filter(r=>String(r[field])===value),count=selected.length;total+=count;
   const parent=level==='device_configuration'?selected[0].environment_combination:'';
   devices.push({scope,level,category:value,parent_combination:parent,count,denominator:n,percentage:pct(count,n)});
   if(level==='environment_combination')comboCounts[value]=count;
  }
  assert.equal(total,n);
 }
 for(const [combo,count]of Object.entries(comboCounts))assert.equal(devices.filter(r=>r.scope===scope&&r.level==='device_configuration'&&r.parent_combination===combo).reduce((s,r)=>s+r.count,0),count);
 const stats={count:n,total_device_instances:rr.reduce((s,r)=>s+r.device_count,0),mean_device_count:rr.reduce((s,r)=>s+r.device_count,0)/n,max_device_count:Math.max(...rr.map(r=>r.device_count)),device_relation_counts:Object.fromEntries(uniq(rr.map(r=>r.independent_environment_relation.verdict)).map(v=>[v,rr.filter(r=>r.independent_environment_relation.verdict===v).length]))};
 const ar=rr.map(r=>attributionById.get(r.task_id));
 for(const a of appEntities){
  const selected=ar.filter(r=>r.attributed_app_ids.includes(a.canonical_id));
  const confirmed=ar.filter(r=>r.evidence_confirmed_app_ids.includes(a.canonical_id));
  const added=ar.filter(r=>r.added_applications.some(x=>x.canonical_id===a.canonical_id));
  apps.push({scope,canonical_id:a.canonical_id,normalized_name:a.display_name,platform:a.platform,
   count:selected.length,denominator:n,percentage:pct(selected.length,n),
   evidence_confirmed_count:confirmed.length,operation_or_identity_attributed_count:added.length,
   metric:'task_application_attribution_not_observed_usage',task_ids:JSON.stringify(ids(selected)),
   evidence_confirmed_task_ids:JSON.stringify(ids(confirmed)),added_attributed_task_ids:JSON.stringify(ids(added)),
   evidence_reference:'app_full_analysis/operation_attribution_v2/task_application_attribution.jsonl',
   counting_rule:'unique task-app pair; multi-label; percentages may exceed 100 in total'});
  assert.equal(selected.length,confirmed.length+added.length);
 }
 for(const k of kinds){
  const category=html.find(h=>h.category===k).category_zh,selected=rr.filter(r=>r.websites.some(w=>w.category===k&&w.status==='reviewed_html_use_category'));
  const assets=html.filter(h=>h.category===k&&h.task_ids.some(id=>rr.some(r=>r.task_id===id)));
  websites.push({scope,category_id:k,normalized_category:category,original_category:category,count:selected.length,denominator:n,percentage:pct(selected.length,n),task_ids:JSON.stringify(ids(selected)),html_resource_count:assets.length,all_asset_associated_task_count:rr.filter(r=>r.websites.some(w=>w.category===k)).length,metric:'reviewed_HTML_use_category_not_independent_website',evidence_reference:'task_inventory.jsonl/websites;../statistics/html_website_classification.jsonl'});
 }
 const types=uniq(rr.flatMap(r=>r.iot_configured_types.map(d=>d.device_type)));
 for(const type of types){
  for(const metric of ['confirmed_interaction_lower_bound','configured_only_not_usage']){
   const selected=rr.filter(r=>(metric==='confirmed_interaction_lower_bound'?r.iot_required_types:r.iot_configured_types).some(x=>x.device_type===type));
   iot.push({scope,device_type:type,metric,count:selected.length,denominator:n,percentage:pct(selected.length,n),task_ids:JSON.stringify(ids(selected)),evidence_reference:'task_inventory.jsonl/iot_required_types or iot_configured_types',completeness:metric==='confirmed_interaction_lower_bound'?'targeted_pilot_only_no_extrapolation':'complete_configured_inventory_not_required_device_audit'});
  }
 }
 for(const f of featureNames){
  const selected=cc.filter(r=>r.labels[f].status==='positive');const counts=Object.fromEntries(['positive','negative','unknown','not_reviewed'].map(s=>[s,cc.filter(r=>r.labels[f].status===s).length]));
  assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),n);
  features.push({scope,feature:f,confirmed_positive:counts.positive,confirmed_negative:counts.negative,unknown:counts.unknown,not_reviewed:counts.not_reviewed,count:counts.positive,denominator:n,percentage:pct(counts.positive,n),percentage_label:'confirmed_coverage_lower_bound_not_final_distribution',positive_task_ids:JSON.stringify(ids(selected)),evidence_reference:'task_characteristics.jsonl',rule_version:'task-characteristics.v1.20260909'});
 }
 for(let i=0;i<featureNames.length;i++)for(let j=i+1;j<featureNames.length;j++){
  const f=featureNames[i],g=featureNames[j],pos=cc.filter(r=>r.labels[f].status==='positive'&&r.labels[g].status==='positive'),bothKnown=cc.filter(r=>['positive','negative'].includes(r.labels[f].status)&&['positive','negative'].includes(r.labels[g].status));
  co.push({scope,feature_a:f,feature_b:g,count:pos.length,denominator:n,percentage:pct(pos.length,n),both_labels_decided:bothKnown.length,metric:'confirmed_cooccurrence_lower_bound',task_ids:JSON.stringify(ids(pos))});
 }
 for(const r of cc){const known=Object.values(r.labels).filter(x=>['positive','negative'].includes(x.status)).length;
  reviewedCounts.push({scope,task_id:r.task_id,positive_features:Object.values(r.labels).filter(x=>x.status==='positive').length,negative_features:Object.values(r.labels).filter(x=>x.status==='negative').length,unknown_features:Object.values(r.labels).filter(x=>x.status==='unknown').length,not_reviewed_features:Object.values(r.labels).filter(x=>x.status==='not_reviewed').length,coverage_state:known===7?'fully_decided':r.review_level==='not_reviewed'?'not_reviewed':'partial',none_applicable:known===7&&Object.values(r.labels).every(x=>x.status==='negative')});
 }
 const appCountDistribution={};for(const r of ar){const k=r.attributed_app_ids.length;appCountDistribution[k]=(appCountDistribution[k]||0)+1;}
 sums[scope]={...stats,confirmed_application_entities:appEntities.length,explicit_app_covered_tasks:ar.filter(r=>r.evidence_confirmed_app_ids.length).length,
  attributed_application_entities:apps.filter(a=>a.scope===scope&&a.count>0).length,attributed_app_covered_tasks:ar.filter(r=>r.attributed_app_ids.length).length,
  attributed_task_app_pairs:ar.reduce((s,r)=>s+r.attributed_app_ids.length,0),application_count_distribution:appCountDistribution,
  semantic_pilot_app_covered_tasks:rr.filter(r=>r.applications.length).length,
  html_category_covered_tasks:rr.filter(r=>r.websites.some(w=>w.status==='reviewed_html_use_category')).length,semantic_pilot_tasks:cc.filter(r=>r.review_level!=='not_reviewed').length,fully_decided_pilot_tasks:cc.filter(r=>Object.values(r.labels).every(x=>['positive','negative'].includes(x.status))).length,not_reviewed_features_tasks:cc.filter(r=>r.review_level==='not_reviewed').length};
 const key=scope==='candidate_all'?'candidate_all_provisional':scope==='proposed_release'?'proposed_release_conditional':null;
 if(key){const expected=attributionSummary.scopes[key];assert.equal(sums[scope].attributed_app_covered_tasks,expected.attributed_app_covered_tasks);assert.equal(sums[scope].attributed_task_app_pairs,expected.attributed_task_app_pairs);assert.deepEqual(appCountDistribution,expected.attributed_app_count_distribution);}
}
async function csv(name,data){
 if(!data.length)throw Error('No rows '+name);
 const cols=Object.keys(data[0]),matrix=[cols,...data.map(r=>cols.map(k=>r[k]??''))];
 const wb=Workbook.create(),sh=wb.worksheets.add('Data'),range=sh.getRangeByIndexes(0,0,matrix.length,cols.length);
 range.values=matrix;wb.recalculate();
 const actual=range.values;assert.deepEqual(actual,matrix,'CSV table values changed in artifact-tool: '+name);
 const content=actual.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
 fs.writeFileSync(path.join(OUT,name),content,'utf8');
 console.log(name+': '+data.length+' rows');
}
await csv('device_distribution.csv',devices);
await csv('application_coverage.csv',apps);
await csv('website_coverage.csv',websites);
await csv('iot_coverage.csv',iot);
await csv('characteristic_distribution.csv',features);
await csv('characteristic_cooccurrence.csv',co);
await csv('review_queue.csv',queue);
fs.writeFileSync(path.join(OUT,'task_feature_counts.jsonl'),reviewedCounts.map(r=>JSON.stringify(r)).join('\n')+'\n');
const {not_reviewed,...previousProgress}=progress;
save('summary.json',{source,progress:{...previousProgress,feature_not_reviewed:not_reviewed,
 application_method:attributionSummary.policy,application_annotated_tasks:attribution.length,application_attribution_target_count:attributionSummary.attribution_target_count,
 application_reference:'app_full_analysis/operation_attribution_v2/summary.json'},scopes:sums,checks:{unique_inventory:true,annotation_hashes_match:true,device_sums_and_nested_sums:true,feature_status_sums:true,counts_deduplicated_by_task:true,application_attribution_totals_match:true},note:'No final release scope asserted. CSV percentages are 0–100. Application attribution includes user-authorized inference, not observed usage. Other feature/IoT statistics retain their original coverage. No model outputs used.'});
const table=(headers,records)=>['| '+headers.join(' | ')+' |','| '+headers.map(()=>'---').join(' | ')+' |',...records.map(r=>'| '+r.join(' | ')+' |')].join('\n');
const main='proposed_release';
const readme=[
'# DevicesWorld Benchmark Overview 统计准备',
'',
'统计日期：2026-09-09。**最终发布清单尚未确认；本报告完整提供当前候选配置统计，以及条件性5,894条范围的汇总。不得把后者冒充已发布的正式清单。**',
'',
'## 主要结果与分母',
'',
table(['scope','任务数','设备实例总数','平均设备数','最大设备数'],scopes.map(s=>[s,sums[s].count,sums[s].total_device_instances,sums[s].mean_device_count.toFixed(4),sums[s].max_device_count])),
'',
'- candidate_all：statistics/scope_manifest.json 的当前5,897条，来源为6个编号目录加280条 generated SmartHome。',
'- proposed_release：条件性排除 android_smarthome_123、124、129，保留280条单Home；对应历史参考5,894。排除建议未写入任何已有manifest。',
'- supported_cross_device：现有静态证据与上一轮轻量复核支持的5,614条。前5,367为规则证据、247为Codex语义复核；不等同逐条执行验证，也不声称全部声明设备不可替代。',
'- 对照当前目录清单，无新增/丢失文件；无重复ID或同路径重复。完整对账、精确重复指令及内容组见scope_record.json。不同ID不因文本相似合并。',
'',
'## 范围来源与冲突',
'',
'源码worktree：'+source.root+'。Git branch：'+source.git_branch+'；HEAD：'+source.git_commit+'。当前工作树原本不干净，读取当前文件而非HEAD快照。',
'',
'README.md:21–45明确主任务目录，但无最终全量manifest；tests/test_task_catalog_release.py:16–32又把320条legacy目录保留为published catalog。core/task_config.py与runner只加载用户传入的--task，不能从入口反推出唯一最终集合。历史迁移表证明1194条历史迁移，其中300条来自real100/200/300；它不是最终发布清单。未把real副本、real20、examples、fake、stage specs、实验日志或生成候选并入本次范围，也未按source_original_id合并现有不同任务。',
'',
'来源清单SHA-256：'+source.source_manifest_sha256+'；规范化 task_id TAB task_path LF 有序清单SHA-256：'+source.selected_task_list_sha256+'。每任务当前内容SHA-256见task_inventory.jsonl。按本次用户明确要求记录hash，不修改实验逻辑。',
'',
'## (a) 配置中的独立设备组合',
'',
'以下表的分母是proposed_release='+sums[main].count+'；三个scope的全部层级和比例均在device_distribution.csv中。Android=Mobile、Linux=Desktop、一个Home=一个IoT环境，不把房间灯/空调数量加入设备实例。',
'',
table(['环境类型组合','任务数','占比'],devices.filter(r=>r.scope===main&&r.level==='environment_combination').map(r=>[r.category,r.count,r.percentage.toFixed(2)+'%'])),
'',
table(['具体配置','任务数','占比'],devices.filter(r=>r.scope===main&&r.level==='device_configuration').map(r=>[r.category,r.count,r.percentage.toFixed(2)+'%'])),
'',
'外层配置已对账回对应内层组合。设备数分布含单Home；最大值与平均值不能用IoT端点数替代。原始type及归一化type逐任务保留。没有发现未知type。',
'',
'## (c) 应用、HTML用途类别与IoT端点',
'',
'应用总表已同步后续全量核对及用户确认的操作归类 v2，不再使用原100条试标的77条覆盖下界作为当前结果。沿用28个应用分类；指令/配置证据确认的关系与按操作/身份授权补充的归属分别保留。本轮只汇总已保存标注，不重新判断任务、不读取模型结果。',
'',
table(['scope','任务数','有应用归属','无应用归属','任务—应用关系'],scopes.map(k=>[k,sums[k].count,sums[k].attributed_app_covered_tasks,sums[k].count-sums[k].attributed_app_covered_tasks,sums[k].attributed_task_app_pairs])),
'',
'5,897条候选中，2,170条归属一个应用、3,447条归属多个应用，280条纯Home不强行归入app。原有6条待定身份已按用户授权归入已有项：5条Gallery归Simple Gallery Pro、1条Contacts归Google Contacts；这不声称已经运行核实具体包名。',
'',
'下表同时给出当前候选和条件性发布范围；百分比沿用本报告的proposed_release分母5,894。完整三个scope及task IDs见 application_coverage.csv。',
'',
table(['应用','候选5897归属任务数','条件5894归属任务数','占条件范围比例'],apps.filter(r=>r.scope===main).sort((a,b)=>b.count-a.count).map(r=>[r.normalized_name,apps.find(a=>a.scope==='candidate_all'&&a.canonical_id===r.canonical_id).count,r.count,r.percentage.toFixed(2)+'%'])),
'',
'多应用任务可进入多行，同一任务—应用只计一次，各行比例不归一化到100%。代码、Office文档等按用户同意的操作规则归入已有应用，不把文件格式本身新增为应用。该指标是应用归属，不是唯一必需软件或模型实际使用频次；纯IoT仍不计app。',
'',
'[操作归类规则与逐任务明细](app_full_analysis/operation_attribution_v2/README.md)保存本次补归类依据；[旧严格证据报告](app_full_analysis/README.md)及试标文件保留作历史对照。此前已有明确应用的其他任务保留原关系，本轮未额外推定它们每一个文件的可选打开软件。',
'',
'### HTML用途类别：不是独立网站实体数',
'',
'恢复了上一轮全部17类用途映射。实际HTML资源'+progress.html_resources+'条（458实体文件+2内联片段），关联'+progress.html_tasks+'个任务；按精确内容bytes去重后'+progress.html_unique_content+'种，不做标点/模板语义去重。程序化构造页与待编辑HTML产物不当作网站交互；因此网站用途主覆盖关联'+sums[main].html_category_covered_tasks+'个任务，不与417个资源关联任务混用。',
'',
table(['用途类别','任务覆盖数','占全量比例','相关HTML资源'],websites.filter(r=>r.scope===main).map(r=>[r.normalized_category,r.count,r.percentage.toFixed(2)+'%',r.html_resource_count])),
'',
'html_resource_audit.jsonl保留资源路径、内容哈希和关联ID；website_coverage.csv保留全部17类、task IDs及资源数。资源关联表与实际网站交互是不同口径。独立网站产品数量仍unknown；不能写成460个网站或28+17个应用实体。',
'',
'### IoT端点',
'',
'iot_coverage.csv将configured_only_not_usage与confirmed_interaction_lower_bound分开。前者只反映初始化存在的类型；后者为试标中明确交互对象，仍不完整，不能将配置出现当任务使用。缺失而被请求的设备不是已存在交互实例，未知类型需求保留待核实，不计入应用数。',
'',
'## (b) 任务特征：100条试标，非完整分布',
'',
'试标覆盖14种设备配置、48个来源标签，seed=20260909；算法与完整ID在pilot_sample.json。选择为覆盖多样性而非按比例抽样，不向全库外推。标注者为Codex，不是人工标注。',
'',
'proposed_release中检查'+sums[main].semantic_pilot_tasks+'条，其中'+sums[main].fully_decided_pilot_tasks+'条七个标签均已判定；其余试标保留部分unknown。另'+sums[main].not_reviewed_features_tasks+'条尚未语义判断。task_characteristics.jsonl为每个task保存positive/negative/unknown/not_reviewed和来源。',
'',
table(['特征','确认包含','确认不含','unknown','尚未检查','已确认全量覆盖'],features.filter(r=>r.scope===main).map(r=>[r.feature,r.confirmed_positive,r.confirmed_negative,r.unknown,r.not_reviewed,r.percentage.toFixed(2)+'%'])),
'',
'每任务确认标签数及尚未判断数量在task_feature_counts.jsonl；characteristic_cooccurrence.csv是共同确认positive的下界，并列双方均有确定判断的数量。未审任务的positive=0表示尚无确认，不表示实际零特征。',
'',
'F1/F2会因“原样字段转入新表示”重叠，F3/F4会因“多来源政策决定动作”重叠；这些是真实现象，不调整事实来压低共现。设备控制/调度较易说明；模板是否构成第二来源、查找是否构成条件判断需严格边界。100条试标不足以判断哪类几乎覆盖全库。',
'',
'**建议图(b)暂不采用主文；试标规则和边界可入附录。** (a)在最终范围确认后可用于主文；(c)可按已确认的“应用归属”口径准备图，不能标成实际使用频次。17类HTML用途不变。应用统计更新不代表任务特征或IoT使用统计也完成了全量标注。',
'',
'## 已有标签与当前内容',
'',
table(['metadata字段','当前覆盖候选任务数','不同原始值数量'],Object.entries(metadata).filter(([k])=>!['asset_dir','episode_config_ref','source_original_id'].includes(k)).map(([k,v])=>[k,v.present,Object.keys(v.values).length])),
'',
'metadata_fields.json保存完整原标签与关联任务。task_pattern/task_family等没有作为统一顶层字段出现；motif M1–M8共175条，未恢复可直接适用全库的统一字典；capability_tags共145条，混合平台、模态、负例和工作流，其中information_transfer在145条中全有，不自动映射为F1。sh_type共280条，SH1–SH6是构造类型，不代表当前分支真的控制设备。difficulty含Simple/Medium/Complex/Hard混合，不归并到本次特征。',
'',
'发现明确需要另行确认的边界：sh2_implicit_intent_bedroom_airflow_infeasible_0009指令要求空气流动，初始AC有fan模式，evaluator却要求缺失bedroom_fan_1。相关标签unknown，详见review_queue；未读模型结果、未改任务、未改判。试标sh1_state_inquiry_kitchen_air_quality_feasible_0023仅读PM2.5，七类不适用，区别于unknown。',
'',
'## 历史数字对照',
'',
table(['历史参考','本轮','解释'],[['总数5,894','candidate=5,897；proposed=5,894','3条排除仅为条件，需确认最终清单'],['跨设备5,614','证据支持5,614','继承清洗证据且核对当前instruction/devices，非本轮全量有效性复审'],['单Home280','280','一个独立Home环境，未加入IoT端点'],['应用25 / 网站17类','28个应用分类 / 17用途类别','应用归属已同步v2；候选5617条有app，条件范围5614条有app；不是45个独立应用网站'],['HTML460 / 417任务',progress.html_resources+' / '+progress.html_tasks,'精确内容去重'+progress.html_unique_content+'；网站交互覆盖与资源关联另列']]),
'',
'## 文件、命令与复现',
'',
'- README.md：本报告；scope_record.json：来源/范围/commit/清单hash/重复与差异。',
'- task_inventory.jsonl：原始清单/试标快照，scope明确三个统计范围，设备/网站/IoT统计仍使用它；其中旧应用字段不代表最新应用归属。',
'- device_distribution.csv：内层类型、外层配置与设备数量分布；scope/count/denominator/percentage齐全。百分比用0–100。',
'- application_coverage.csv / website_coverage.csv / iot_coverage.csv：完整列表，非Top-N；task IDs不截断。',
'- task_characteristics.jsonl / characteristic_distribution.csv / characteristic_cooccurrence.csv / task_feature_counts.jsonl：标签与共现。',
'- annotation_rules.md / pilot_annotations.jsonl / pilot_application_annotations.jsonl / pilot_sample.json：固定试标定义、特征和应用决定、抽样。',
'- review_queue.csv/jsonl：历史初筛/试标队列，不是待删除任务表。其中应用配对及task_inventory中的application_discovery_status保留为旧流程记录，不能再当作当前应用待审队列；当前应用依据见app_full_analysis/operation_attribution_v2。特征unknown/未审状态不变。',
'- protected_files_before.json / preservation_check.json：本次用户要求的原任务/资源/配置及实现内容前后核对。出现变化时先报告，不改回他人文件。',
'- 本轮前后核对33,433个原始任务、资源、配置及实现文件，内容变化0；CSV额外回读检查见csv_validation.json。',
'',
'正常重算只读取已保存清单和标注，不重新判断语义：',
'',
'~~~bash',
'cd '+source.root,
'/Users/lht/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node analysis/benchmark_overview_20260909/summarize.mjs',
'~~~',
'',
'collect.mjs为一次性只读来源快照（检测已存在快照时拒绝覆盖）；select_pilot.mjs为显式试标选择，不应在已有决定后任意重选；annotate_static.mjs显式应用已记录的直接名称规则与固定pilot决定，仅写本目录。普通聚合不调用它们。',
'',
'CSV按Spreadsheets技能使用artifact-tool矩形值表生成并逐值对照，未创建多余XLSX或正式图。本轮仅更新应用汇总，没有启动设备、任务生成器或模型实验；原任务、实验配置与其他统计未修改。上传状态见pear目录的PUBLICATION.md。',
'',
'### 需要确认/尚未完成',
'',
'1. 提供或确认最终发布清单（是否为现有候选减3条且含280单Home）。当前final_release_membership全为unknown，不伪造正式任务名单。',
'2. 本轮应用归属口径已按用户确认完成并接入总表；若论文要声明唯一必需应用或实际运行使用频次，仍需另行证据，不能从归属推断。IoT任务使用仍只有部分确认。',
'3. 完整特征语义标注尚未完成，不把100条试标比例外推。若要正式图(b)，需补充其余标签和独立review。',
'4. 单独确认airflow任务可见语义与evaluator边界；本轮不做修复或实验重跑。',
''];
fs.writeFileSync(path.join(OUT,'README.md'),readme.join('\n'));
console.log(JSON.stringify({scopes:sums,apps:apps.filter(r=>r.scope===main).map(r=>[r.normalized_name,r.count]),feature_counts:features.filter(r=>r.scope===main).map(r=>[r.feature,r.count,r.confirmed_negative,r.unknown,r.not_reviewed])}));
