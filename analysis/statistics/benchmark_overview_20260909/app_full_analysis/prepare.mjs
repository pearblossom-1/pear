import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export const OUT=path.dirname(fileURLToPath(import.meta.url)),BASE=path.dirname(OUT),ROOT=path.resolve(BASE,'../..');
const read=p=>fs.readFileSync(path.join(ROOT,p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const save=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n');
const lines=(n,v)=>fs.writeFileSync(path.join(OUT,n),v.map(x=>JSON.stringify(x)).join('\n')+'\n');
if(process.argv[2]==='verify'){
 const old=JSON.parse(fs.readFileSync(path.join(OUT,'source_preservation_before.json'))),changed=[];
 for(const [p,s] of Object.entries(old.files)){if(!fs.existsSync(path.join(ROOT,p))){changed.push(p);continue;}const z=fs.statSync(path.join(ROOT,p));if(z.size!==s.size||z.mtimeMs!==s.mtimeMs)changed.push(p);}
 save('source_preservation_check.json',{checked_at:new Date().toISOString(),method:'size_and_mtime_for_protected_files_plus_task_content_hash',checked_files:Object.keys(old.files).length,changed_files:changed});
 const tasks=fs.readFileSync(path.join(OUT,'task_scope.jsonl'),'utf8').trim().split('\n').map(JSON.parse);const taskChanges=tasks.filter(t=>sha(read(t.task_path))!==t.content_sha256).map(t=>t.task_id);
 if(changed.length||taskChanges.length)throw Error(JSON.stringify({changed,taskChanges}));console.log(JSON.stringify({preserved:Object.keys(old.files).length,tasks:tasks.length}));process.exit(0);
}
if(fs.existsSync(path.join(OUT,'task_scope.jsonl')))throw Error('Saved scope exists; resume review without recollecting.');
const manifest=JSON.parse(read('statistics/scope_manifest.json')),old=fs.readFileSync(path.join(BASE,'task_sources.jsonl'),'utf8').trim().split('\n').map(JSON.parse),oldMap=new Map(old.map(r=>[r.task_id,r]));
const light=fs.readFileSync(path.join(ROOT,'analysis/statistics/cross_device_light_review.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const exclusions=light.filter(r=>r.reviewed_verdict==='not_cross_device'&&r.review_scope==='semantic_review');
const oldProtected=JSON.parse(fs.readFileSync(path.join(BASE,'protected_files_before.json'))),files={};
for(const p of Object.keys(oldProtected.files)){if(fs.existsSync(path.join(ROOT,p))){const s=fs.statSync(path.join(ROOT,p));files[p]={size:s.size,mtimeMs:s.mtimeMs};}}
save('source_preservation_before.json',{captured_at:new Date().toISOString(),files});
const scope=[],packs=[],versions=[];const order=['Mobile','Desktop','IoT'];
for(const m of manifest.tasks){
 const raw=read(m.task_path),t=JSON.parse(raw),o=oldMap.get(t.id);if(t.id!==m.task_id)throw Error('Manifest id mismatch '+m.task_path);
 const digest=sha(raw),counts={},devices=t.devices.map(d=>({...d,normalized_type:({android:'Mobile',linux:'Desktop',smarthome:'IoT',home:'IoT'})[d.type]||'Unknown:'+d.type}));
 for(const d of devices)counts[d.normalized_type]=(counts[d.normalized_type]||0)+1;
 const types=[...order,...Object.keys(counts).filter(k=>!order.includes(k))].filter(k=>counts[k]);
 const excluded=exclusions.find(r=>r.task_id===t.id&&r.task_path===m.task_path);
 const s={task_id:t.id,task_path:m.task_path,content_sha256:digest,primary_scope:'candidate_all_provisional',scopes:['candidate_all_provisional',...(excluded?[]:['proposed_release_conditional'])],exclusion_reference:excluded?'analysis/statistics/cross_device_light_review.jsonl:'+t.id:null,final_release_confirmed:false,devices,device_count:devices.length,environment_combination:types.join(' + '),device_configuration:types.map(k=>counts[k]+' '+k).join(' + '),previous_version_matches:o?.content_sha256===digest};
 scope.push(s);if(!s.previous_version_matches)versions.push(t.id);
 const resources=[];
 for(const [bi,b] of (t.setup||[]).entries())for(const [ci,c] of b.config.entries())if(c.type==='upload_file')for(const [fi,f]of(c.parameters?.files||[]).entries()){
  const p=String(f.local_path||'').replace(/^\$\{repo_root\}\//,'');if(!p||path.isAbsolute(p))continue;
  const exists=fs.existsSync(path.join(ROOT,p)),ext=path.extname(p).toLowerCase();let text=null;
  if(exists&&['.md','.txt','.csv','.json','.yaml','.yml','.tsv','.html','.htm','.ics','.vcf','.gpx','.eml'].includes(ext))text=read(p).toString('utf8');
  resources.push({source_path:p,deployed_path:f.path,device_id:b.device_id,setup_pointer:m.task_path+'#/setup/'+bi+'/config/'+ci+'/parameters/files/'+fi,exists,format:ext,text});
 }
 packs.push({...s,instruction:t.instruction,setup:t.setup||[],metadata:t.metadata||{},resources});
}
if(new Set(scope.map(s=>s.task_id)).size!==scope.length)throw Error('Duplicate IDs');
lines('task_scope.jsonl',scope);lines('evidence_packs.jsonl',packs);
const git=args=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();
save('scope_provenance.json',{captured_at:new Date().toISOString(),root:ROOT,commit:git(['rev-parse','HEAD']),branch:git(['branch','--show-current']),git_status:git(['status','--short']),task_and_resource_uncommitted:git(['diff','--name-only','--','tasks','configs','mdcbench']),manifest:'statistics/scope_manifest.json',manifest_status:manifest.status,primary_scope:'candidate_all_provisional',count:scope.length,conditional_count:scope.filter(s=>s.scopes.includes('proposed_release_conditional')).length,conditional_exclusions:exclusions.map(r=>({task_id:r.task_id,task_path:r.task_path,reason:r.reason})),changed_since_previous_snapshot:versions,scope_limit:'No final manifest located; existing recorded exclusion recommendations are conditional, never applied to original manifests.'});
console.log(JSON.stringify({tasks:scope.length,conditional:scope.filter(s=>s.scopes.length>1).length,versions,resources:packs.reduce((s,p)=>s+p.resources.length,0),protected_files:Object.keys(files).length}));
