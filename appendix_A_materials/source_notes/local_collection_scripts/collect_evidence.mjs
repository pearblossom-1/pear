import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT='/Users/lht/home/MDCBench';
const EXP=path.join(ROOT,'workflow/experiment_worktrees/gpt55-core200-rerun-20260826');
const OUT=path.join(ROOT,'output/paper_appendix/appendix_A_task_construction');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=async(p,v)=>{await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,JSON.stringify(v,null,2)+'\n');};
const copies=[];
async function copy(source,dest){const target=path.join(OUT,dest);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(source,target);copies.push({source,bundle_path:dest});}

// Historical source read: this tests whether the copied fixture agrees with what
// the agent actually received, not whether the agent solved the task.
const a1=await read(path.join(OUT,'A1_example/provenance.json'));
const historyPath=path.join(a1.selected_attempt,'execution_history.jsonl');
const events=(await fs.readFile(historyPath,'utf8')).trim().split('\n').map(JSON.parse);
const event=events.find(e=>e.event==='environment_action_completed'&&e.step_event?.step_index===0);
const stdout=event.step_event.info.stdout;
const agreements=[];
for(const f of a1.source_asset_copies){const content=await fs.readFile(path.join(OUT,f.bundle_path),'utf8');const matched=stdout.includes(content);agreements.push({bundle_path:f.bundle_path,complete_content_found_in_first_source_read:matched});if(!matched)throw Error('Historical source differs: '+f.bundle_path);}
await write(path.join(OUT,'A1_example/historical_source_read.json'),{source:historyPath,event:'environment_action_completed',step_index:0,recorded_at:event.recorded_at,action:event.step_event.action,info:event.step_event.info,agreements});
a1.source_caveat='Linux source files were copied from the local experimental worktree. Their complete contents match the first historical Linux source-read stdout (step 0); see historical_source_read.json. The calendar setup comes from the exact frozen task config.';
await write(path.join(OUT,'A1_example/provenance.json'),a1);

// Keep historical stage records and the later selected file separate: the latter
// has received post-generation edits and is not the untouched Stage8 output.
const batchPath=path.join(ROOT,'runs/generation_engine_probe/stress_gpt5mini/R01/result.json');
const batch=await read(batchPath);
const record=batch.records.find(r=>r.sample_id==='sample_000014');
const selectedPath=path.join(ROOT,'runs/generation_engine_probe/stress_gpt5mini/R01_R35_selected_manifest.json');
const selected=(await read(selectedPath)).selected.find(r=>r.round==='R01'&&r.sample==='sample_000014');
await write(path.join(OUT,'A2_stage_example/historical_pipeline_record.json'),record);
for(const [stage,value]of Object.entries(record.pipeline.stages))await write(path.join(OUT,'A2_stage_example/historical_stages',stage+'.json'),value);
await write(path.join(OUT,'A2_stage_example/historical_assembled_task.json'),record.pipeline.stages.stage8.task_draft.task_json);
await copy(selected.task,'A2_stage_example/later_selected/task.json');
const later=await read(selected.task);
for(const device of later.setup)for(const config of device.config??[])if(config.type==='upload_file')for(const file of config.parameters.files)await copy(file.local_path.replace('${repo_root}',ROOT),'A2_stage_example/later_selected/source/'+path.basename(file.local_path));
await write(path.join(OUT,'A2_stage_example/provenance.json'),{round:'R01',sample:'sample_000014',batch_path:batchPath,model:batch.model??null,profile:batch.profile??null,sample_set:batch.sample_set?{total_count:batch.sample_set.total_count,random_seed:batch.sample_set.random_seed}:null,selected_manifest:selectedPath,selected_entry:selected,historical_status:record.status,historical_static_report:record.pipeline.stages.stage8.static_report,historical_task_equals_later_selected_task:JSON.stringify(record.pipeline.stages.stage8.task_draft.task_json)===JSON.stringify(later),note:'Historical stages are preserved as generated, including imperfections. Later selected config and source files are a separate local snapshot, not evidence that Stage3 alone performed every later repair. No live smoke or agent execution was run for this packet.'});

const sources=[
 'mdcbench/tasks/generation/engine/pipeline.py',
 'mdcbench/tasks/generation/engine/prompts.py',
 'mdcbench/tasks/generation/engine/pattern_catalog.py',
 'mdcbench/tasks/generation/engine/stages/stage4_materializer.py',
 'mdcbench/tasks/generation/engine/stages/stage8_assembly.py',
 'mdcbench/tasks/generation/engine/probes/run_pipeline_probe.py',
 'mdcbench/tasks/generation/profiles/linux_android/stage0.py',
 'mdcbench/tasks/generation/profiles/linux_android/surface_capabilities.yaml',
 'mdcbench/tasks/generation/profiles/linux_android/surface_capabilities.py',
 'mdcbench/tasks/generation/profiles/registry.py',
 'mdcbench/tasks/generation/profiles/smarthome/__init__.py',
 'mdcbench/tasks/generation/profiles/smarthome_mixed/__init__.py',
 'scripts/generation/check_selected_tasks_gate.py',
 'scripts/smoke/run_generated_setup_smoke.py',
 'scripts/smoke/run_generated_selected_oracle_smoke.py',
 'scripts/organize_cross_device_topology_views.py',
 'docs/paperdossier2/MDCBench_task_construction_pipeline.md',
 'docs/R01-R35生成任务真机smoke测试记录.md',
 'tasks/cross_device/_manifests/topology_views_report.md'
];
const promptDir='mdcbench/tasks/generation/profiles/linux_android/prompts';
for(const f of await fs.readdir(path.join(ROOT,promptDir)))if(f.endsWith('.yaml'))sources.push(promptDir+'/'+f);
for(const file of sources)await copy(path.join(ROOT,file),'source_snapshots/'+file);
for(const file of ['mdcbench_lite_v1_selection_report.md','mdcbench_lite_v1_replacement_log.md','mdcbench_lite_v1_smoke_report.md'])await copy(path.join(EXP,'tasks/mdcbench_lite',file),'selection_evidence/'+file);
const manifest=await read(path.join(EXP,'tasks/mdcbench_lite/mdcbench_lite_v1.json'));
await write(path.join(OUT,'selection_evidence/manifest_policy_and_status.json'),{source:path.join(EXP,'tasks/mdcbench_lite/mdcbench_lite_v1.json'),schema_version:manifest.schema_version,benchmark_name:manifest.benchmark_name,version:manifest.version,generated_at_utc:manifest.generated_at_utc,release_status:manifest.release_status,human_quality_review_state:manifest.human_quality_review_state,maintenance_note:manifest.maintenance_note,selection_policy:manifest.selection_policy});
await write(path.join(OUT,'data/evidence_source_index.json'),{collected_date:'2026-09-24',note:'Read-only copies. Current source snapshots need not be the exact revisions that produced historical stage records. Historical reports may include superseded status assertions; consult A2/A3 notes. This is a documentation packet, not a standalone runtime distribution.',copies});
console.log(JSON.stringify({copied_files:copies.length,a1_source_agreement:agreements,stage_example:record.sample_id,historical_status:record.status,history_and_later_snapshot_differ:JSON.stringify(record.pipeline.stages.stage8.task_draft.task_json)!==JSON.stringify(later)},null,2));
