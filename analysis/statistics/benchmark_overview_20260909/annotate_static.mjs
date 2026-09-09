import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const OUT=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(OUT,'../..');
const jl=n=>fs.readFileSync(path.join(OUT,n),'utf8').trim().split('\n').map(JSON.parse);
const save=(n,x)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(x,null,2)+'\n');
const lines=(n,x)=>fs.writeFileSync(path.join(OUT,n),x.map(r=>JSON.stringify(r)).join('\n')+'\n');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const rows=jl('task_sources.jsonl'),pilot=new Map(jl('pilot_annotations.jsonl').map(r=>[r.task_id,r]));
const knownApps=JSON.parse(fs.readFileSync(path.join(OUT,'application_aliases.json'),'utf8'));
const semanticApps=new Map(jl('pilot_application_annotations.jsonl').map(r=>[r.task_id,r]));
const names=Object.keys([...pilot.values()][0].labels),queue=[],inventory=[],characteristics=[];
const patterns={
 'app:markor':/\bMarkor\b/gi,'app:simple-calendar':/\b(?:Simple Calendar Pro|Calendar)\b/g,
 'app:simple-sms':/\b(?:Simple SMS Messenger|SMS)\b|短信/g,
 'app:contacts':/\b(?:Google Contacts|Android Contacts|Contacts)\b|联系人/g,
 'app:tasks-org':/\bTasks(?:\.org)?\b|待办/g,'app:clock':/\b(?:Google Clock|Android Clock|Clock)\b|闹钟|计时器/g,
 'app:osmand':/\bOsmAnd\b/gi,'app:simple-gallery':/\b(?:Simple Gallery Pro|Gallery)\b|相册/g,
 'app:retro-music':/\bRetro(?: Music)?\b/g,'app:broccoli':/\bBroccoli\b/g,
 'app:audio-recorder':/\bAudio Recorder\b/gi,'app:simple-draw':/\bSimple Draw(?: Pro)?\b/gi,
 'app:android-files':/\b(?:Android Files|Files app|Files)\b/g,'app:camera':/\bCamera\b|相机/g,
 'app:chrome':/\bChrome\b/g,'app:firefox':/\bFirefox\b/g,
 'app:libreoffice-calc':/\b(?:LibreOffice Calc|Calc)\b/g,
 'app:libreoffice-writer':/\b(?:LibreOffice Writer|Writer)\b/g,
 'app:libreoffice-impress':/\b(?:LibreOffice Impress|Impress)\b/g,
 'app:vscode':/\b(?:VS Code|VSCode|Visual Studio Code)\b/g,
 'app:gimp':/\bGIMP\b/g,'app:vlc':/\bVLC\b/g,
 'app:thunderbird':/\bThunderbird\b/g,'app:evince':/\b(?:Evince|Document Viewer|PDF viewer)\b|PDF\s*阅读器/gi,
 'app:file-roller':/\bArchive Manager\b/gi
};
const aliases={'calendar':'simple calendar pro','sms':'simple sms messenger','messages':'simple sms messenger','gallery':'simple gallery pro','simple draw':'simple draw pro','android files':'files','broccoli':'broccoli app'};
const iotTargets={8:['curtain','light','robot_vacuum','air_purifier'],15:['light','curtain','air_purifier','heater'],17:['dimmable_light'],18:['air_purifier'],19:['robot_vacuum'],20:['washer'],26:['heater','curtain'],27:['dimmable_light'],28:['robot_vacuum'],46:['air_purifier'],48:['washer'],49:['heater'],50:['air_purifier'],60:['dryer','air_purifier']};
// Saved pilot judgments are the only semantic characteristics. No automatic family expansion.
for(const r of rows){
 const a=pilot.get(r.task_id);
 characteristics.push(a?{...a,scopes:r.scopes}:{task_id:r.task_id,task_path:r.task_path,content_sha256:r.content_sha256,scopes:r.scopes,rule_version:'task-characteristics.v1.20260909',reviewer:null,review_level:'not_reviewed',labels:Object.fromEntries(names.map(n=>[n,{status:'not_reviewed',annotation_source:'not_completed',reason:'Full semantic annotation not completed; no extrapolation from pilot or historical family.'}]))});
 const applications=[],pending=[];
 const visible=r.instruction.replace(/\x60([^\x60]+)\x60/g,(s,t)=>/[\/\\]|\.(?:md|txt|csv|json|html|odt|docx|xlsx|odp|pdf|png|jpg|zip)\b/i.test(t)?' '.repeat(s.length):s)
 .replace(/(?:https?:\/\/|file:\/\/\/|\/(?:home|tmp|sdcard|storage)\/)[^\s，。；]+/g,s=>' '.repeat(s.length));
 const candidates=[...r.application_candidates];
 for(const ap of knownApps)if(!candidates.some(x=>x.canonical_id===ap.canonical_id)&&[...visible.matchAll(patterns[ap.canonical_id])].length)candidates.push({...ap,evidence:[]});
 for(const ap of candidates){
  const bindings=r.setup.flatMap((b,bi)=>b.config.flatMap((c,ci)=>{
   const label=String(c.parameters?.app||'').toLowerCase(),normalized=aliases[label]||label;
   return ['ensure_app','open_app'].includes(c.type)&&ap.aliases.includes(normalized)?[{device_id:b.device_id,original_label:label,normalized_label:normalized,evidence:r.task_path+'#/setup/'+bi+'/config/'+ci}]:[];
  }));
  const oldQuotesValid=ap.evidence.every(e=>r.instruction.toLowerCase().includes(String(e.quote).toLowerCase()));
  const matches=[...visible.matchAll(patterns[ap.canonical_id]||/$^/g)];
  const accepted=matches.find(m=>{
   if(ap.canonical_id==='app:camera'&&r.task_id==='linux_android_105')return false; // Existing camera photos do not require using the capture app.
   const pre=visible.slice(Math.max(0,m.index-32),m.index),post=visible.slice(m.index+m[0].length,m.index+m[0].length+35);
   if(/(?:可用|可以使用|例如|may use|can use|optionally|or use|such as)\s*$/i.test(pre))return false;
   if(/(?:do not|don't|never|不要|不得)\s*(?:open|use|launch|打开|使用)\s*$/i.test(pre))return false;
   if(ap.canonical_id==='app:camera'&&/^\s*(?:album|folder|文件夹|相册)/i.test(post))return false;
   if(['app:libreoffice-writer','app:libreoffice-impress','app:libreoffice-calc'].includes(ap.canonical_id)&&/^\s+(?:document|template|receipt|deck)\b/i.test(post)&&!/(?:in|using|open|use|with)\s+(?:the\s+)?$/i.test(pre))return false;
   return true;
  });
  if(ap.canonical_id==='app:evince'||ap.canonical_id==='app:file-roller'){
   const executable=ap.canonical_id==='app:evince'?'evince':'file-roller';
   for(const [bi,b] of r.setup.entries())for(const [ci,c]of b.config.entries())if(c.type==='execute'&&new RegExp('(?:^|\\s)(?:nohup\\s+)?'+executable+'\\s').test(String(c.parameters?.command||'')))bindings.push({device_id:b.device_id,original_label:executable,normalized_label:executable,evidence:r.task_path+'#/setup/'+bi+'/config/'+ci});
  }
  const hasIdentity=ap.platform==='Android'||['app:evince','app:file-roller'].includes(ap.canonical_id)?bindings.length>0:true;
  if(oldQuotesValid&&accepted&&hasIdentity)applications.push({canonical_id:ap.canonical_id,display_name:ap.display_name,original_label:accepted[0],status:'confirmed_explicit_object',method:'deterministic_current_instruction_and_identity_binding',legacy_evidence:ap.evidence,identity_bindings:bindings,evidence:{path:r.task_path+'#/instruction',quote:r.instruction.slice(Math.max(0,accepted.index-70),Math.min(r.instruction.length,accepted.index+accepted[0].length+120))}});
  else{
   const why=!oldQuotesValid?'old_quote_changed':!hasIdentity?'android_product_identity_unconfirmed':matches.length?'optional_or_format_or_album_mention':'path_only_or_generic_or_no_explicit_name';
   pending.push({...ap,reason:why,status:'unresolved_usage_not_in_main_count'});
   queue.push({task_id:r.task_id,issue:'application_usage',object:ap.canonical_id,reason:why,evidence:r.task_path+'#/instruction',action:'Confirm required app use from named source/current setup; do not count alternatives.'});
  }
 }
 const html=r.website_resources.map(h=>({resource:h.html_path,category:h.business_category,category_zh:h.business_category_zh,role:h.html_role,source_role:h.task_page_role,evidence_paths:h.evidence_paths,deployed_locations:h.deployed_locations,
  status:['browser_execution_asset','editable_html_artifact'].includes(h.html_role)?'not_website_interaction':'reviewed_html_use_category',reason:h.review_reason}));
 const configuredIot=[];
 for(const b of r.setup)for(const c of b.config){if(c.type!=='smarthome.reset')continue;const p=c.parameters.episode_config_ref;if(!p||!fs.existsSync(path.join(ROOT,p)))continue;const ep=JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8')),h=ep.initial_home_config||{},ds=h.devices||Object.entries(h.rooms||{}).flatMap(([room,x])=>(x.devices||[]).map(d=>({...d,room_id:room})));
  for(const type of new Set(ds.map(d=>d.device_type)))configuredIot.push({environment:b.device_id,device_type:type,source:p+'#/initial_home_config',status:'configured_only_not_usage'});
 }
 const usage=a?(iotTargets[a.pilot_index]||[]).map(type=>({device_type:type,status:'confirmed_task_interaction',method:'Codex_semantic_pilot',evidence:r.task_path+'#/instruction'})):[];
 const namedCandidates=applications.map(x=>({...x,status:'name_rule_candidate_not_semantically_validated'}));
 const semantic=semanticApps.get(r.task_id);
 const confirmed=(semantic?.confirmed_apps||[]).map(id=>{
  const named=applications.find(x=>x.canonical_id===id),info=knownApps.find(x=>x.canonical_id===id);
  return {...info,...named,status:'confirmed_required_object',method:'Codex_semantic_judgment',evidence:{path:r.task_path+'#/instruction',quote:r.instruction},semantic_reference:'pilot_application_annotations.jsonl'};
 });
 inventory.push({task_id:r.task_id,task_path:r.task_path,content_sha256:r.content_sha256,scopes:r.scopes,final_release_membership:r.final_release_membership,devices:r.devices,device_counts:r.device_counts,environment_combination:r.environment_combination,device_configuration:r.device_configuration,device_count:r.device_count,
 independent_environment_relation:r.independent_environment_relation,original_metadata:r.original_metadata,origin:r.origin,
 applications:confirmed,application_named_rule_candidates:namedCandidates,unresolved_applications:pending,application_discovery_status:semantic?'partially_semantically_reviewed':'named_rules_only_semantics_not_reviewed',
 websites:html,website_identity_count:'unknown_not_canonical_websites',
 iot_configured_types:configuredIot,iot_required_types:usage,iot_usage_review_status:r.devices.some(d=>d.normalized_type==='IoT')?'partial_or_unreviewed':'not_applicable',
 feature_annotation_reference:'task_characteristics.jsonl'});
}
queue.push({task_id:'__scope__',issue:'release_manifest_missing',object:'proposed_release',reason:'5894 is conditional subtraction, not a confirmed release manifest.',evidence:'statistics/scope_manifest.json;tests/test_task_catalog_release.py',action:'Confirm exact release manifest/branch/scope; do not alter tasks.'});
queue.push({task_id:'sh2_implicit_intent_bedroom_airflow_infeasible_0009',issue:'instruction_evaluator_boundary',object:'bedroom_fan_1',reason:'Instruction asks airflow without naming standalone fan; initial AC is in fan mode, evaluator expects missing bedroom_fan_1.',evidence:'tasks/smarthome/generated/sh2_implicit_intent_bedroom_airflow_infeasible_0009.json#/instruction;tasks/smarthome/episode_configs/sh2_implicit_intent_bedroom_airflow_infeasible_0009.json#/initial_home_config',action:'Clarify separately; leave related features unknown.'});
for(const r of characteristics)if(Object.values(r.labels).some(x=>x.status!=='positive'&&x.status!=='negative'))queue.push({task_id:r.task_id,issue:'characteristics_'+(r.review_level==='not_reviewed'?'not_reviewed':'unknown'),object:Object.entries(r.labels).filter(([,x])=>['unknown','not_reviewed'].includes(x.status)).map(([k])=>k).join(';'),reason:r.review_level==='not_reviewed'?'Full semantic annotation remains incomplete':'Referenced material or boundary requires further judgment',evidence:r.task_path,action:'Review current requirements, not model results; do not infer absence.'});
const resourceMap=new Map();for(const r of rows)for(const h of r.website_resources){if(resourceMap.has(h.html_path))continue;
 let [p,pointer]=h.html_path.split('#'),bytes=fs.readFileSync(path.join(ROOT,p));
 if(pointer){let v=JSON.parse(bytes);for(const k of pointer.slice(1).split('/'))v=v[k.replaceAll('~1','/').replaceAll('~0','~')];const match=String(v).match(/<!doctype html[\s\S]*?<\/html>/i)||String(v).match(/<html[\s\S]*?<\/html>/i);if(!match)throw Error('Inline HTML cannot be extracted: '+h.html_path);bytes=Buffer.from(match[0]);}
 resourceMap.set(h.html_path,{resource:h.html_path,resource_kind:h.resource_kind,content_sha256:hash(bytes),task_ids:h.associated_task_ids,category:h.business_category,category_zh:h.business_category_zh,role:h.html_role});
}
lines('task_inventory.jsonl',inventory);lines('task_characteristics.jsonl',characteristics);lines('review_queue.jsonl',queue);lines('html_resource_audit.jsonl',[...resourceMap.values()]);
save('annotation_progress.json',{pilot:pilot.size,total:rows.length,not_reviewed:rows.length-pilot.size,application_method:'100-task semantic confirmed lower bound; full named-rule candidates separate; not exhaustive usage census',website_categories:new Set([...resourceMap.values()].map(r=>r.category)).size,html_resources:resourceMap.size,html_unique_content:new Set([...resourceMap.values()].map(r=>r.content_sha256)).size,html_tasks:new Set([...resourceMap.values()].flatMap(r=>r.task_ids)).size});
console.log(JSON.stringify({inventory:inventory.length,characteristics:characteristics.length,queue:queue.length,apps:new Set(inventory.flatMap(r=>r.applications.map(a=>a.canonical_id))).size,pending_app_pairs:inventory.reduce((s,r)=>s+r.unresolved_applications.length,0),html:resourceMap.size}));
