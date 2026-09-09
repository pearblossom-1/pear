import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const OUT=path.dirname(fileURLToPath(import.meta.url)), ROOT=path.resolve(OUT,'../..');
const read=p=>fs.readFileSync(path.join(ROOT,p));
const json=p=>JSON.parse(read(p).toString());
const jsonl=p=>read(p).toString().trim().split('\n').map(JSON.parse);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const save=(n,x)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(x,null,2)+'\n');
const lines=(n,x)=>fs.writeFileSync(path.join(OUT,n),x.map(r=>JSON.stringify(r)).join('\n')+'\n');
function walk(p){return fs.readdirSync(path.join(ROOT,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):e.isFile()?[p+'/'+e.name]:[]);}
if(process.argv[2]==='verify'){
 const before=json('analysis/benchmark_overview_20260909/protected_files_before.json');
 const after=Object.fromEntries(['tasks','configs','mdcbench','scripts','tests'].flatMap(walk).filter(p=>!p.includes('/__pycache__/')).sort().map(p=>[p,sha(read(p))]));
 const changed=[...new Set([...Object.keys(before.files),...Object.keys(after)])].filter(p=>before.files[p]!==after[p]);
 save('preservation_check.json',{checked_at:new Date().toISOString(),files:Object.keys(after).length,changed,unchanged:changed.length===0});
 console.log(JSON.stringify({protected_files:Object.keys(after).length,changed}));process.exit(changed.length?1:0);
}
if(fs.existsSync(path.join(OUT,'task_sources.jsonl')))throw Error('Snapshot already exists. Do not silently replace reviewed input.');
// The user explicitly requires content hashes and before/after preservation.
const protectedPaths=['tasks','configs','mdcbench','scripts','tests'].flatMap(walk).filter(p=>!p.includes('/__pycache__/')).sort();
save('protected_files_before.json',{captured_at:new Date().toISOString(),files:Object.fromEntries(protectedPaths.map(p=>[p,sha(read(p))]))});
const sourceManifest='statistics/scope_manifest.json', manifest=json(sourceManifest);
const audit=new Map(jsonl('statistics/task_device_audit.jsonl').map(r=>[r.task_id,r]));
const reviews=new Map(jsonl('analysis/statistics/cross_device_light_review.jsonl').map(r=>[r.task_id,r]));
const migrations=new Map(json('tasks/cross_device/_manifests/topology_views_manifest.json').tasks.map(r=>[r.task_id,r]));
const priorApps=json('statistics/inventory_data.json').apps.filter(r=>r.counted);
const html=jsonl('analysis/statistics/html_website_classification.jsonl');
const allIds=new Set(), allPaths=new Set(), issues=[],rows=[];
const order=['Mobile','Desktop','IoT'];
for(const m of manifest.tasks){
 if(allIds.has(m.task_id))issues.push({type:'duplicate_id',...m});
 if(allPaths.has(m.task_path))issues.push({type:'duplicate_path',...m});
 allIds.add(m.task_id);allPaths.add(m.task_path);
 if(!fs.existsSync(path.join(ROOT,m.task_path))){issues.push({type:'missing_task',...m});continue;}
 const bytes=read(m.task_path),t=JSON.parse(bytes);
 if(t.id!==m.task_id)issues.push({type:'id_mismatch',...m,actual:t.id});
 const devices=t.devices.map(d=>({...d,normalized_type:({android:'Mobile',linux:'Desktop',home:'IoT',smarthome:'IoT'})[d.type]||'Unknown:'+d.type}));
 const counts={};for(const d of devices)counts[d.normalized_type]=(counts[d.normalized_type]||0)+1;
 const types=[...order,...Object.keys(counts).filter(k=>!order.includes(k)).sort()].filter(k=>counts[k]);
 const a=audit.get(t.id),rv=reviews.get(t.id);
 const oldCurrent=a && a.instruction===t.instruction && JSON.stringify(a.declared_devices)===JSON.stringify(t.devices);
 const vd=!oldCurrent?'unresolved':rv?.reviewed_verdict||({confirmed_cross_device:'cross_device',confirmed_non_cross_device:'not_cross_device',unresolved:'unresolved'})[a.verdict];
 const single=devices.length===1&&devices[0].normalized_type==='IoT';
 const proposedExclude=rv?.queue==='previous_non_cross_device'||['android_smarthome_123','android_smarthome_124','android_smarthome_129'].includes(t.id);
 const scopes=['candidate_all'];if(!proposedExclude)scopes.push('proposed_release');if(vd==='cross_device')scopes.push('supported_cross_device');
 const mig=migrations.get(t.id);
 const metadata=Object.fromEntries(Object.entries(t.metadata||{}).filter(([k])=>/^(category|topology_view|difficulty|motif|device_topology|task_pattern|pattern|family|task_family|capability_tags|sh_type|case|surfaces|visible_sources|native_content_outputs|source_origin_kind|source_origin_label|source_original_id|asset_dir|episode_config_ref)$/.test(k)));
 const apps=priorApps.filter(ap=>ap.related_task_ids.includes(t.id)).map(ap=>({canonical_id:ap.canonical_id,display_name:ap.display_name,platform:ap.platform,identity:ap.identity,aliases:ap.aliases,evidence:ap.evidence.filter(e=>e.task_id===t.id),status:'legacy_candidate_needs_current_usage_check'}));
 rows.push({task_id:t.id,task_path:m.task_path,content_sha256:sha(bytes),scopes,final_release_membership:'unknown_no_authoritative_manifest',
  instruction:t.instruction,devices,device_counts:counts,environment_combination:types.join(' + '),device_configuration:types.map(k=>counts[k]+' '+k).join(' + '),device_count:devices.length,
  independent_environment_relation:{verdict:vd,source_current_instruction_devices_match:oldCurrent,source:rv?'analysis/statistics/cross_device_light_review.jsonl':'statistics/task_device_audit.jsonl',method:rv?'previous_Codex_semantic_or_single_home_scope_review':'previous_static_evidence_rules',reason:rv?.reason||a?.reason,roles:rv?.participating_environments||a?.device_roles,all_device_roles_verified:rv?false:a?.required_devices_complete,resource_state_revalidation:'not_full_reaudit',single_home:single},
  original_metadata:metadata,origin:{kind:mig?.source_origin_kind||'numbered_or_home',label:mig?.source_origin_label||metadata.sh_type||path.basename(path.dirname(m.task_path)),mapping:mig?'tasks/cross_device/_manifests/topology_views_manifest.json':null},
  setup:t.setup,variables:t.variables||{},application_candidates:apps,
  website_resources:html.filter(h=>h.associated_task_ids.includes(t.id)),});
 if(!oldCurrent)issues.push({type:'cross_review_input_changed',task_id:t.id,path:m.task_path,reason:'Existing relation evidence cannot be silently inherited.'});
}
const liveSelected=['android_only','linux_only','linux_android','android_smarthome','linux_smarthome','linux_android_smarthome'].flatMap(f=>fs.readdirSync(path.join(ROOT,'tasks/cross_device',f)).filter(n=>n.endsWith('.json')).map(n=>'tasks/cross_device/'+f+'/'+n)).concat(fs.readdirSync(path.join(ROOT,'tasks/smarthome/generated')).filter(n=>n.endsWith('.json')).map(n=>'tasks/smarthome/generated/'+n));
const directoryDelta={not_in_manifest:liveSelected.filter(p=>!allPaths.has(p)),missing_from_dirs:[...allPaths].filter(p=>!liveSelected.includes(p))};
const metadataFields={};
for(const r of rows)for(const [k,v]of Object.entries(r.original_metadata)){const f=metadataFields[k]??={present:0,values:{},task_ids:[]};f.present++;f.task_ids.push(r.task_id);for(const x of Array.isArray(v)?v:[v]){const key=typeof x==='object'?'[structured value]':String(x);f.values[key]=(f.values[key]||0)+1;}}
const scopes=Object.fromEntries(['candidate_all','proposed_release','supported_cross_device'].map(s=>[s,rows.filter(r=>r.scopes.includes(s)).length]));
const byteGroups={};for(const r of rows)(byteGroups[r.content_sha256]??=[]).push(r.task_id);
const insGroups={};for(const r of rows)(insGroups[r.instruction]??=[]).push(r.task_id);
save('scope_record.json',{captured_at:new Date().toISOString(),root:ROOT,git_commit:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),git_branch:execFileSync('git',['branch','--show-current'],{cwd:ROOT,encoding:'utf8'}).trim(),working_tree_dirty:true,
 final_release_status:'not_confirmed',source_manifest:sourceManifest,source_manifest_status:manifest.status,source_manifest_sha256:sha(read(sourceManifest)),
 selected_task_list_sha256:sha(Buffer.from(rows.map(r=>r.task_id+'\t'+r.task_path).join('\n')+'\n')),
 scopes,excluded_from_proposed:['android_smarthome_123','android_smarthome_124','android_smarthome_129'],directoryDelta,issues,
 duplicate_exact_task_bytes:Object.values(byteGroups).filter(x=>x.length>1),duplicate_exact_instructions:Object.values(insGroups).filter(x=>x.length>1),
 inclusion_evidence:['README.md:21-45','tests/test_task_catalog_release.py:16-32','statistics/scope_manifest.json'],
 conflicts:['Release test also retains 320 legacy records; it is not a deduplicated final manifest.','Runner accepts a single explicit --task and does not identify a final all-task release.'],
 scope_rule:'Use saved provisional inventory only; proposed_release subtracts the three documented exclusions conditionally. Do not union legacy copies, derived stages, logs, examples or generation candidates.',
 historical_reference:{total:5894,cross_device:5614,single_home:280,apps:25,website_categories:17,html_resources:460,html_tasks:417}});
lines('task_sources.jsonl',rows);save('metadata_fields.json',metadataFields);
save('application_aliases.json',priorApps.map(({canonical_id,display_name,platform,identity,aliases})=>({canonical_id,display_name,platform,identity,aliases,source:'statistics/inventory_data.json'})));
// Pilot selection is explicitly performed by select_pilot.mjs, separately from source collection.
console.log(JSON.stringify({scopes,protected_files:protectedPaths.length,directoryDelta,issues}));
