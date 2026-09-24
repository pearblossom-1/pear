import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT='/Users/lht/home/MDCBench';
const EXP=path.join(ROOT,'workflow/experiment_worktrees/gpt55-core200-rerun-20260826');
const OUT=path.join(ROOT,'output/paper_appendix/appendix_A_task_construction');
const readJSON=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const saveJSON=async(p,v)=>{await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,JSON.stringify(v,null,2)+'\n');};
const count=xs=>Object.fromEntries([...new Set(xs)].sort().map(x=>[x,xs.filter(a=>a===x).length]));
const manifestPath=path.join(EXP,'tasks/mdcbench_lite/mdcbench_lite_v1.json');
const manifest=await readJSON(manifestPath);
const reviewManifest=await readJSON(path.join(ROOT,'analysis/chatgpt+claude/failure_pattern_validation/sampling_manifest.json'));
const baseline=reviewManifest.baseline_sampling.find(b=>b.baseline==='gpt-5.5');
const formal=[...baseline.candidate_records,...baseline.excluded_records];
if(formal.length!==200||new Set(formal.map(r=>r.task_id)).size!==200)throw Error('Expected 200 distinct formal runs');
const lite=[];
for(const m of manifest.tasks){
 const r=formal.find(r=>r.task_id===m.task_id);if(!r)throw Error('Manifest task has no selected attempt '+m.task_id);
 const task=await readJSON(r.evidence.task);const types=[...new Set(task.devices.map(d=>d.type))].sort();
 lite.push({lite_index:m.lite_index,task_id:m.task_id,manifest_family:m.family,task_path:m.task_path,frozen_task_path:r.evidence.task,selected_attempt:r.selected_attempt,instruction:task.instruction,devices:task.devices,device_types:types.join('+'),device_count:task.devices.length,evaluation_count:task.evaluation.length,manifest_difficulty:m.difficulty,task_difficulty:task.metadata?.difficulty??null,surface_tags:m.surface_tags??[],capability_tags:m.capability_tags??[],task_surfaces:task.metadata?.surfaces??null,selection_reason:m.selection_reason,quality_score:m.quality_score,source_origin_kind:m.source_origin_kind,source_origin_label:m.source_origin_label});
}
const canon=new Set(['cross_device/android_only','cross_device/linux_only','cross_device/linux_android','cross_device/android_smarthome','cross_device/linux_smarthome','cross_device/linux_android_smarthome','smarthome/generated']);
async function inventory(root){
 const found=[],errors=[];
 async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()){if(e.name.endsWith('_assets')||['episode_configs','scripted','mdcbench_lite','_manifests'].includes(e.name))continue;await walk(p);}else if(e.isFile()&&e.name.endsWith('.json')){let j;try{j=await readJSON(p);}catch(err){errors.push({path:p,error:String(err)});continue;}if(typeof j.id==='string'&&typeof j.instruction==='string'&&Array.isArray(j.devices)&&Array.isArray(j.evaluation)){const rel=path.relative(path.join(root,'tasks'),p),dir=path.dirname(rel);found.push({task_id:j.id,path:p,relative_path:rel,directory:dir,canonical:canon.has(dir),device_types:[...new Set(j.devices.map(d=>d.type))].sort().join('+'),device_count:j.devices.length,origin_kind:j.metadata?.origin_kind??j.metadata?.source_origin_kind??null,origin_source:j.metadata?.origin_source??null});}}}}
 await walk(path.join(root,'tasks'));
 const c=found.filter(r=>r.canonical),byID=count(c.map(r=>r.task_id));
 return {root,counting_rule:'Task-shaped JSON: string id/instruction and array devices/evaluation. Exclude asset/episode/scripted/manifest directories. Canonical seven device-oriented directories explicitly listed; this is a inventory definition, not fresh schema or execution certification.',canonical_directories:[...canon],task_shaped_count:found.length,canonical_count:c.length,canonical_unique_task_ids:new Set(c.map(r=>r.task_id)).size,canonical_duplicate_ids:Object.entries(byID).filter(([,n])=>n>1),counts_by_directory:count(found.map(r=>r.directory)),canonical_device_types:count(c.map(r=>r.device_types)),canonical_device_count:count(c.map(r=>r.device_count)),canonical_origin_kind:count(c.map(r=>r.origin_kind??'unknown')),parse_errors:errors,tasks:found};
}
const roots=[];for(const root of [ROOT,EXP])roots.push(await inventory(root));
const stats={created_date:'2026-09-24',root_inventories:roots.map(({tasks,...r})=>r),lite:{manifest:manifestPath,manifest_release_status:manifest.release_status,manifest_generated_at:manifest.generated_at_utc,manifest_maintenance_note:manifest.maintenance_note,selection_policy:manifest.selection_policy,count:lite.length,unique_task_ids:new Set(lite.map(r=>r.task_id)).size,actual_device_types:count(lite.map(r=>r.device_types)),actual_device_count:count(lite.map(r=>r.device_count)),manifest_families:count(lite.map(r=>r.manifest_family)),manifest_difficulty:count(lite.map(r=>r.manifest_difficulty)),frozen_task_difficulty:count(lite.map(r=>r.task_difficulty??'unknown')),manifest_surface_tags:count(lite.flatMap(r=>r.surface_tags)),manifest_capability_tags:count(lite.flatMap(r=>r.capability_tags)),surface_tag_note:'Overlapping manifest labels, not newly verified app-capability annotations.'}};
await saveJSON(path.join(OUT,'data/dataset_statistics.json'),stats);
await saveJSON(path.join(OUT,'data/lite200_task_index.json'),lite);
await saveJSON(path.join(OUT,'data/task_pool_inventory.json'),roots.flatMap(r=>r.tasks.map(t=>({...t,root:r.root}))));
const a1=lite.find(r=>r.task_id==='al_calendar_schedule_conflict');
const task=await readJSON(a1.frozen_task_path);
await fs.mkdir(path.join(OUT,'A1_example/source'),{recursive:true});
await fs.copyFile(a1.frozen_task_path,path.join(OUT,'A1_example/task.json'));
await saveJSON(path.join(OUT,'A1_example/source/android_calendar_setup.json'),task.setup.find(d=>d.device_id==='android_0'));
const copies=[];
for(const d of task.setup)for(const c of d.config||[])if(c.type==='upload_file')for(const f of c.parameters.files){const src=f.local_path.replace('${repo_root}',EXP),dest=path.join(OUT,'A1_example/source',path.basename(src));await fs.copyFile(src,dest);copies.push({source:src,bundle_path:path.relative(OUT,dest),device_id:d.device_id,device_path:f.path});}
await saveJSON(path.join(OUT,'A1_example/provenance.json'),{task_id:a1.task_id,task_snapshot:a1.frozen_task_path,selected_attempt:a1.selected_attempt,task_storage:'Byte-for-byte copy of formal experiment config/task.json; no rewritten task or evaluator.',source_asset_copies:copies,source_caveat:'These small Linux source files are copied from the local experimental worktree. Historical stdout is separately checked for agreement; source assets were not all snapshotted with each run.',calendar:'Extracted from the exact frozen setup; this is environment initialization data, not a model-visible prompt or an oracle solution.'});
console.log(JSON.stringify(stats,null,2));
