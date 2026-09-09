import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const rows=fs.readFileSync(path.join(here,'task_sources.jsonl'),'utf8').trim().split('\n').map(JSON.parse).filter(r=>r.scopes.includes('proposed_release'));
let state=20260909;const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const groups=new Map();for(const r of rows)(groups.get(r.device_configuration)||groups.set(r.device_configuration,[]).get(r.device_configuration)).push(r);
const selected=[],ids=new Set(),origins=new Set(),apps=new Set();
function take(rr,phase){const shuffled=shuffle(rr.filter(r=>!ids.has(r.task_id)));const r=shuffled.find(r=>!origins.has(r.origin.label))||shuffled.find(r=>r.application_candidates.some(a=>!apps.has(a.canonical_id)))||shuffled[0];if(!r)return;ids.add(r.task_id);origins.add(r.origin.label);r.application_candidates.forEach(a=>apps.add(a.canonical_id));selected.push({task_id:r.task_id,task_path:r.task_path,device_configuration:r.device_configuration,origin:r.origin,phase});}
for(const [_,rr] of [...groups].sort(([a],[b])=>a.localeCompare(b)))for(let i=0;i<4;i++)take(rr,'four_per_device_configuration');
const sourceGroups=new Map();for(const r of rows){const k=r.device_configuration+'|'+r.origin.label;(sourceGroups.get(k)||sourceGroups.set(k,[]).get(k)).push(r);}
for(const [_,rr] of shuffle([...sourceGroups].sort(([a],[b])=>a.localeCompare(b)))){if(selected.length>=100)break;take(rr,'source_diversity_fill');}
fs.writeFileSync(path.join(here,'pilot_sample.json'),JSON.stringify({seed:20260909,prng:'xorshift32',n:selected.length,method:'Four per current device configuration, preferring new origin labels then new application candidates, followed by seeded shuffled configuration/origin strata until 100. Coverage-oriented non-proportional pilot; no prevalence extrapolation. No outcomes read.',tasks:selected},null,2)+'\n');
console.log(JSON.stringify({n:selected.length,configurations:groups.size,origin_labels:origins.size,app_candidates:apps.size}));

