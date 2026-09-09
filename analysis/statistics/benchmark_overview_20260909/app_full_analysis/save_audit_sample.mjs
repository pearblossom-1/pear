// Save the actually inspected sample identities and their current annotation state.
// Does not choose samples for extrapolation or infer application labels.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const out=path.dirname(fileURLToPath(import.meta.url));
const jl=n=>fs.readFileSync(path.join(out,n),'utf8').trim().split('\n').map(JSON.parse);
const rows=jl('task_application_annotations.jsonl'),scope=new Map(jl('task_scope.jsonl').map(r=>[r.task_id,r]));
const groups={
 deterministic:['android_only_104','android_only_109','android_only_145','android_only_147','android_only_152','android_only_153','android_only_154','android_only_160','android_only_162','android_only_163','android_only_169','android_only_171','android_only_174','android_only_179','android_only_185','android_only_187','android_only_191','android_only_192','android_only_195','android_only_209','android_only_211','android_only_213','android_only_216','android_only_217','android_only_221','android_only_235','android_only_241','android_only_243','android_only_244','android_only_246','android_only_253','android_only_256','android_only_308','android_only_310','android_only_326','android_only_332','android_only_336','linux_only_091','linux_only_166','linux_only_351','linux_only_358','android_smarthome_493','linux_android_smarthome_709','linux_android_smarthome_719','linux_android_smarthome_784'],
 zero_app_before_omission_correction:['linux_only_001','linux_only_138','linux_only_250','linux_only_371','linux_android_1014','linux_android_1228','linux_android_1455','linux_android_950','android_smarthome_301','android_smarthome_328','android_smarthome_751','android_smarthome_918','linux_smarthome_001','linux_smarthome_315','linux_smarthome_647','linux_smarthome_999','linux_android_smarthome_158','linux_android_smarthome_305','linux_android_smarthome_610','linux_android_smarthome_949','sh1_state_inquiry_bathroom_humidity_feasible_0001','sh3_explicit_control_missing_bedroom_humidifier_infeasible_0006','sh5_event_schedule_dryer_done_living_room_reset_feasible_0022','sh6_coordinated_schedule_plain_light_dim_workflow_infeasible_0018'],
 configured_launchers_not_required:['linux_android_410','linux_android_496','linux_android_499','linux_android_414','linux_android_481','linux_android_585','linux_android_587','linux_android_589','linux_android_593'],
 all_Evince_function_bindings:rows.filter(r=>r.confirmed_applications.some(a=>a.canonical_id==='app:evince')).map(r=>r.task_id),
 Codex_task_specific_decisions:Object.keys(JSON.parse(fs.readFileSync(path.join(out,'semantic_overrides.json')))),
 unresolved_identities:rows.filter(r=>r.status==='partial').map(r=>r.task_id)
};
const record=Object.entries(groups).map(([kind,ids])=>({kind,selection:kind==='zero_app_before_omission_correction'?'ordered first/one-third/two-thirds/last in each zero-app device-combination group before corrections; no extrapolation':'targeted evidence review; no probability extrapolation',task_count:ids.length,tasks:ids.map(id=>{const r=rows.find(r=>r.task_id===id);if(!r)throw Error(id);return{task_id:id,task_path:r.task_path,environment_combination:scope.get(id).environment_combination,status:r.status,confirmed_applications:r.confirmed_applications.map(a=>a.normalized_name),evidence_reference:'task_application_annotations.jsonl:'+id};})}));
fs.writeFileSync(path.join(out,'audit_sample.json'),JSON.stringify({reviewer:'Codex',not_human_annotation:true,not_execution_validation:true,groups:record,unique_tasks:new Set(Object.values(groups).flat()).size},null,2)+'\n');
console.log(JSON.stringify({groups:record.map(r=>[r.kind,r.task_count]),unique_tasks:new Set(Object.values(groups).flat()).size}));
