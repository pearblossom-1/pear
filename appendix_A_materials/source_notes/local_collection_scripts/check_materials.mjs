import fs from 'node:fs/promises';
import path from 'node:path';

const OUT='/Users/lht/home/MDCBench/output/paper_appendix/appendix_A_task_construction';
const read=async p=>JSON.parse(await fs.readFile(path.join(OUT,p),'utf8'));
const failures=[];
const checks=[];
function check(name,ok){checks.push({name,passed:ok});if(!ok)failures.push(name);}
const stats=await read('data/dataset_statistics.json');
const index=await read('data/lite200_task_index.json');
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
check('Lite index has 200 distinct task IDs',index.length===200&&new Set(index.map(r=>r.task_id)).size===200);
check('Lite device, endpoint, family and difficulty totals each equal 200',[stats.lite.actual_device_types,stats.lite.actual_device_count,stats.lite.manifest_families,stats.lite.manifest_difficulty].every(o=>sum(o)===200));
const pool=stats.root_inventories.find(r=>r.root.includes('experiment_worktrees'));
check('Experimental canonical pool totals agree at 5897',pool.canonical_count===5897&&sum(pool.canonical_device_types)===5897&&sum(pool.canonical_device_count)===5897);
const provenance=await read('A1_example/provenance.json');
check('A1 task is byte-for-byte formal frozen task config',(await fs.readFile(path.join(OUT,'A1_example/task.json'))).equals(await fs.readFile(provenance.task_snapshot)));
const sourceRead=await read('A1_example/historical_source_read.json');
for(const file of ['week.csv','rule.txt'])check('Historical stdout contains complete '+file,sourceRead.info.stdout.includes(await fs.readFile(path.join(OUT,'A1_example/source',file),'utf8')));
const stage=await read('A2_stage_example/historical_pipeline_record.json');
check('A2 preserves all nine historical stages',Object.keys(stage.pipeline.stages).length===9&&Array.from({length:9},(_,i)=>'stage'+i).every(k=>stage.pipeline.stages[k]));
const stageProvenance=await read('A2_stage_example/provenance.json');
check('Historical and later selected configs are explicitly separated',stageProvenance.historical_task_equals_later_selected_task===false);
let links=0;
for(const file of (await fs.readdir(OUT)).filter(f=>f.endsWith('.md'))){
 const text=await fs.readFile(path.join(OUT,file),'utf8');
 for(const match of text.matchAll(/\]\((\/[^)]+)\)/g)){links++;try{await fs.access(match[1]);}catch{failures.push(file+': missing '+match[1]);}}
}
checks.push({name:'All '+links+' absolute Markdown links resolve',passed:!failures.some(v=>v.includes(': missing '))});
const report={date:'2026-09-24',scope:'Offline documentation checks only: counts, evidence identity, stage/version separation and local links. No runtime, device, evaluator or model execution.',checks,failures};
await fs.writeFile(path.join(OUT,'data/materials_validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exitCode=1;
