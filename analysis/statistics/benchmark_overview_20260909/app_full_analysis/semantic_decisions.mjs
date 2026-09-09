// Codex-authored decisions after reading these particular instructions and sources.
// Explicit IDs, not a family propagation rule. Regenerates override evidence only.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const OUT=path.dirname(fileURLToPath(import.meta.url));
const jl=n=>fs.readFileSync(path.join(OUT,n),'utf8').trim().split('\n').map(JSON.parse);
const packs=new Map(jl('evidence_packs.jsonl').map(r=>[r.task_id,r]));
const nativeText=new Map(jl('extracted_source_text.jsonl').filter(r=>!r.error).map(r=>[r.source_path,r.text]));
const overrides={};
function decision(task,id,keep,reason,roles=['source_read']){
 const p=packs.get(task);if(!p)throw Error(task);
 const evidence=[{source_file:p.task_path,location:'#/instruction',quote:p.instruction},...p.setup.flatMap((b,bi)=>b.config.map((c,ci)=>({source_file:p.task_path,location:'#/setup/'+bi+'/config/'+ci,quote:JSON.stringify(c)})).filter(c=>/ensure_app|androidworld_|Markor|nohup/.test(c.quote))),...p.resources.map(r=>({source_file:r.source_path,location:'file contents; deployment at '+r.deployed_path,quote:(r.text||nativeText.get(r.source_path)||'Non-text artifact, used only as an identity/location reference.').slice(0,1800)}))];
 const o=overrides[task]||={reason:'',evidence:[],add_apps:[],remove_apps:[],resolve_app_ids:[]};
 o.reason+=(o.reason?' | ':'')+id+': '+reason;o.evidence.push(...evidence);
 if(keep)o.add_apps.push({id,roles,reason,evidence});else o.remove_apps.push(id);
 o.resolve_app_ids.push(id);
}
const add=(t,a,r,roles)=>decision(t,a,true,r,roles);
const drop=(t,a,r)=>decision(t,a,false,r);
const nativeSources={
 'app:simple-sms':{
 linux_android_1097:'Dock 4 outage and caller number are in the seeded message.',
 linux_android_1109:'Approval and customer request are in the message; task also requires the confirmation text.',
 linux_android_1131:'Waiver approval is supplied in the message.',
 linux_android_1157:'Supervisor line is a message source and receives the summary.',
 linux_android_1173:'Dinner request is the incoming message.',
 linux_android_1177:'Approval thread must be inspected to establish the missing approval.',
 linux_android_1193:'Customer request and required confirmation use the SMS thread.',
 linux_android_1295:'Pantry Chili request is supplied by SMS.',
 linux_android_1395:'Project Orion meeting request is supplied by SMS.',
 linux_android_1396:'Badge assignment B1396 is supplied by SMS.',
 linux_android_1491:'Event coordinator request is supplied by SMS.',
 linux_android_1556:'Procurement invoice request is supplied by SMS.',
 linux_android_1689:'Open request and customer ID are supplied by SMS.',
 linux_android_632:'Alex and Riley requests are distinct seeded messages needed for reconciliation.',
 linux_android_701:'QA approval source is the seeded SMS.',
 linux_android_706:'Payroll request is the seeded SMS.',
 linux_android_740:'Alex Team Sync request in SMS specifies the deck and roster requirements.',
 linux_android_815:'Android field updates are the seeded per-site messages.',
 android_smarthome_802:'Incoming REQ-EA air-quality request is the seeded SMS.',
 android_smarthome_957:'Incoming vacuum request is the seeded SMS and the policy requires a response.',
 linux_android_smarthome_274:'Casey authorized privacy request is in the seeded SMS.',
 linux_android_smarthome_275:'Requested fifteen-minute buffer is in the seeded SMS; confirmation is required.',
 linux_android_smarthome_277:'Avery proposed curtain addition is in the seeded SMS and must be evaluated against service policy.',
 linux_android_smarthome_279:'Mina requested heater target and replacement are in the seeded SMS.',
 linux_android_smarthome_280:'Devon requested 21:30 curtain add-on is in the seeded SMS.',
 linux_android_smarthome_282:'Quinn authorized replacement request is in the seeded SMS.',
 linux_android_smarthome_284:'Nurse requested buffer and heater target are in SMS; confirmation is required.',
 linux_android_smarthome_285:'Jamie requested purifier speed and dark-room effects are in SMS.',
 linux_android_smarthome_289:'Parker requested fifteen-minute lead is in SMS.',
 linux_android_smarthome_290:'Reese requested arrival light and purifier setting are in SMS.',
 linux_android_smarthome_292:'Robin requested humidifier medium setting is in SMS.'
 },
 'app:tasks-org':{
 linux_android_1057:'Authorized pantry-check record supplies approval and ownership, and the shortage follow-up is an Android task.',
 linux_android_1125:'Compliance checklist is supplied as native task records.',
 linux_android_1143:'Required prep items are supplied as native task records.',
 linux_android_1158:'Route checklist and completion exceptions are supplied as native task records.',
 linux_android_1186:'Route-request source is the native task.',
 linux_android_1192:'Case task supplies the join key and source fields.',
 linux_android_1229:'Checklist status and comments are native task fields.',
 linux_android_1275:'Route request task selects SITE-1275 for the missing-coordinate branch.',
 linux_android_1308:'Checked issue labels are the task-owned filter source.',
 linux_android_1318:'Checklist is provided as native task records.',
 linux_android_821:'Casey authorization task determines the allowed clinic records.',
 linux_android_996:'996-A schedule intake task selects the blank-date row and its branch requires a follow-up task.',
 android_smarthome_981:'Latest approval review is the native task on the approval phone.',
 linux_android_smarthome_333:'Bedroom setup reminder is a native task to complete with brightness.',
 linux_android_smarthome_564:'Three native checklist items define the required handover observations.',
 linux_android_smarthome_601:'Environment work items are native tasks; kitchen/bathroom items must be completed.'
 },
 'app:contacts':{
 linux_android_1170:'Guest allergy profile is in contact notes.',
 linux_android_1662:'Directory full name and preferred name are contact fields.',
 linux_android_742:'Current primary account manager is the seeded Sarah Lee contact; Tom Reed is a decoy.',
 linux_android_969:'Amina Yusuf dietary profile, owner and approval are in contact notes.',
 linux_android_979:'Amina Cho severe allergy, owner and approval are in contact notes.',
 linux_android_smarthome_116:'Air Lead is resolved from the saved Alex Air Lead contact.',
 linux_android_smarthome_598:'Sender emergency-owner authority is in saved contact notes.'
 },
 'app:osmand':{
 linux_android_1257:'Depot favorite is the native navigation source.',
 linux_android_1496:'Favorite coordinates are native OsmAnd state.',
 linux_android_1864:'Requested replacement targets the old native entrance favorite.',
 linux_android_smarthome_628:'Saved Office destination must be checked against Away Mode Map.',
 linux_android_smarthome_653:'Saved East Door favorite must match the arrival location.',
 linux_android_smarthome_663:'Native favorites across both phones determine the route and entrance.',
 linux_android_smarthome_681:'Installed home favorites must be reconciled with route index and task.',
 linux_android_smarthome_682:'Installed accessible entrance favorite is required policy input.',
 linux_android_smarthome_683:'Navigation favorite must match the departure event.',
 linux_android_smarthome_684:'Airport navigation favorite is required policy input.'
 },
 'app:simple-calendar':{
 linux_android_1122:'Deadline is supplied by the native calendar event.',
 android_smarthome_968:'Current guest visit is the calendar event on the event phone.',
 linux_android_smarthome_568:'Visit start/end are the native Guest visit event.',
 linux_android_smarthome_683:'Departure time/location are the native Leave for Office event.'
 },
 'app:clock':{linux_android_smarthome_552:'Actual Quiet Session/Cleaning Window timers provide the overlap inputs.'}
};
for(const [app,rows]of Object.entries(nativeSources))for(const [task,reason]of Object.entries(rows))add(task,app,reason);
for(const [task,app,reason,roles]of [
 ['linux_only_090','app:gimp','Source README explicitly requires opening the template in GIMP.', ['source_read','process_edit']],
 ['linux_only_344','app:libreoffice-calc','Source page explicitly directs opening orders.xlsx in Calc.', ['source_read','process_edit']],
 ['linux_android_092','app:gimp','Chinese instruction explicitly requires using GIMP.', ['process_edit','result_output']],
 ['linux_android_123','app:camera','Referenced request explicitly requires recording the walkthrough with Android Camera.', ['result_output']],
 ['linux_android_1457','app:retro-music','Playlist request explicitly requires creating the Retro Music playlist.', ['result_output']],
 ['linux_android_152','app:vscode','Instruction explicitly names VS Code for the required project work.', ['source_read','process_edit']],
 ['linux_android_153','app:vscode','Instruction explicitly names VS Code for the required project work.', ['source_read','process_edit']],
 ['linux_android_264','app:vscode','Instruction explicitly names VS Code for the required project work.', ['source_read','process_edit']],
 ['linux_android_213','app:gimp','Instruction explicitly requires GIMP resizing.', ['process_edit','result_output']],
 ['linux_android_260','app:simple-gallery','Instruction requires comparing the existing Gallery photos.', ['source_read']],
 ['linux_android_338','app:simple-gallery','Instruction requires finding the source photo in Gallery.', ['source_read']],
 ['linux_android_492','app:markor','Recipe request requires a Markor handoff on the second phone.', ['result_output']],
 ['linux_android_546','app:vlc','Exact copied media must be left playing in VLC; source preservation is a separate restriction.', ['result_output']],
 ['linux_android_774','app:osmand','Site visit request explicitly requires the OsmAnd favorite.', ['source_read']],
 ['android_smarthome_595','app:simple-calendar','Arrival-event time is required policy input.', ['source_read']],
 ['android_smarthome_803','app:tasks-org','Leave one Tasks handoff requires creating an output, not merely preserving state.', ['result_output']],
 ['linux_android_smarthome_283','app:simple-calendar','Policy uses the actual calendar-event boundary.', ['source_read']],
 ['linux_android_smarthome_284','app:simple-calendar','Policy uses the actual respiratory-check end.', ['source_read']],
 ['linux_android_smarthome_285','app:simple-calendar','Policy uses the actual sleep-booking start.', ['source_read']],
 ['linux_android_smarthome_292','app:simple-calendar','Policy uses the actual arrival booking.', ['source_read']],
 ['linux_android_smarthome_461','app:simple-calendar','Policy uses the appointment start.', ['source_read']],
 ['linux_android_smarthome_648','app:osmand','Saved favorite is required by the arrival policy.', ['source_read']],
 ['linux_android_smarthome_673','app:simple-gallery','Required Gallery photo is the policy source.', ['source_read']],
 ['linux_android_smarthome_846','app:android-files','Files manifest identifies the required playlist.', ['source_read']]
])add(task,app,reason,roles);
for(const [task,app,reason]of [
 ['android_only_046','app:retro-music','Sprint Retro is a meeting title in a distractor row, not the music app.'],
 ['android_only_302','app:tasks-org','SMS missing-exact-recipe branch requires a reply and explicitly no prep task; Clean pantry shelf is unrelated.'],
 ['linux_only_118','app:android-files','Files to update is a heading for Linux code files, not Android Files.'],
 ['linux_only_153','app:tasks-org','Invoice Processing Tasks is a page heading, not Tasks.org.'],
 ['linux_android_075','app:tasks-org','Customer-service pending rows are in CSV, not Tasks.org.'],
 ['linux_android_1012','app:simple-sms','Selected policy branch forbids sending SMS; existing message app is not a source.'],
 ['linux_android_1032','app:markor','Policy prohibits creating the Markor copy.'],
 ['linux_android_1034','app:osmand','Approved NX03460 row has no coordinates; favorites are only preserved, not queried or modified.'],
 ['linux_android_1057','app:broccoli','All shortages are in CSV and authorization in Tasks; recipe is only protected against modification.'],
 ['linux_android_1075','app:retro-music','Library snapshot is in Markor and selected missing-track branch forbids playlist creation.'],
 ['linux_android_1076','app:broccoli','Allergy-blocked recipe proposal is supplied outside Broccoli and no recipe may be added.'],
 ['linux_android_1181','app:contacts','Sender phone and case code match CSV directly; saved contact adds no required field.'],
 ['linux_android_1275','app:osmand','Selected SITE-1275 has both coordinates blank; no favorite is authorized and no read is required.'],
 ['linux_android_1328','app:contacts','Order ID and sender phone match the workbook directly; contact records are not required.'],
 ['linux_android_1393','app:contacts','Contacts is a README section, not the contact application.'],
 ['linux_android_1493','app:simple-calendar','Calendar link is document content; requested execution reads PDF and sets an alarm.'],
 ['linux_android_1554','app:camera','Camera is the existing media album, not a capture action.'],
 ['linux_android_1557','app:camera','Camera is the existing media album, not a capture action.'],
 ['linux_android_187','app:camera','Camera is the existing photo source, not a capture action.'],
 ['linux_android_755','app:camera','Camera denotes existing album images.'],
 ['linux_android_1851','app:thunderbird','Thunderbird occurs in a historical note; task source is CSV/Markor, not mail.'],
 ['linux_android_863','app:osmand','Favorite export is a file in Downloads, not required live OsmAnd state.'],
 ['linux_android_874','app:simple-sms','Contact restriction branch prohibits SMS; contact read/edit is the required work.'],
 ['linux_android_877','app:osmand','Favorite inventory is an exported file in Android Files.'],
 ['linux_android_917','app:simple-gallery','Grouping manifest is in Markor, not a required Gallery interaction.'],
 ['linux_android_950','app:camera','Request annotates an existing photo; no capture is requested.'],
 ['linux_android_974','app:simple-sms','SMS-capable phone is a field validation criterion; output is Linux payload/blocked file.'],
 ['linux_android_996','app:simple-calendar','Intake 996-A selects blank scheduled_date; policy forbids creating a Calendar event.'],
 ['android_smarthome_137','app:markor','Instruction forbids the extra Markor report.'],
 ['android_smarthome_139','app:markor','Instruction forbids the extra Markor report.'],
 ['android_smarthome_249','app:markor','Instruction forbids the extra Markor report.'],
 ['android_smarthome_248','app:tasks-org','Instruction forbids an extra Tasks record.'],
 ['android_smarthome_495','app:clock','Disabled-clock fact is supplied by Tasks; live Clock state is not required.'],
 ['android_smarthome_504','app:clock','Disabled-clock fact is supplied by Markor; live Clock state is not required.'],
 ['android_smarthome_656','app:osmand','Missing favorite is determined from Files inventory, not live OsmAnd.'],
 ['linux_android_smarthome_017','app:simple-calendar','Missing event is a supplied fact; no additional Calendar query is requested or populated.'],
 ['linux_android_smarthome_868','app:simple-calendar','No calendar entry is a supplied fact, not a required app query.'],
 ['linux_android_smarthome_868','app:clock','No alarm is a supplied fact, not a required app query.'],
 ['linux_only_111','app:libreoffice-writer','Writer template is a source format label, with no required Writer operation.'],
 ['linux_only_323','app:libreoffice-writer','Writer template is a source format label, with no required Writer operation.'],
 ['linux_android_1698','app:libreoffice-writer','Writer document is the artifact label, with no required Writer operation.']
])drop(task,app,reason);
for(const [t,a,r,roles] of [
 ['android_only_176','app:simple-draw','Task request explicitly requires creating the cover in Simple Draw Pro.', ['result_output']],
 ['linux_android_1210','app:simple-sms','Opted-in Iris receives a case update by text; opted-out Owen must not be contacted.', ['result_output']],
 ['linux_android_622','app:contacts','REQ-221 Thunderbird draft explicitly requires adding Evelyn Park contact.', ['result_output']],
 ['linux_android_622','app:retro-music','REQ-221 Thunderbird draft explicitly requires a five-track Roadtrip Mix playlist.', ['result_output']],
 ['linux_android_737','app:libreoffice-impress','Delivery-review SMS explicitly says to create the deck in Impress.', ['result_output']],
 ['linux_android_740','app:libreoffice-impress','Alex request explicitly calls for an Impress deck.', ['result_output']],
 ['linux_android_928','app:simple-sms','Referenced readiness rules require the newest QA SMS approval.', ['source_read']],
 ['android_smarthome_749','app:markor','Tasks source explicitly identifies Markor target note for curtain recovery.', ['source_read','result_output']],
 ['android_smarthome_752','app:markor','Transcript source explicitly requires Markor powered steps and recovery note.', ['source_read','result_output']],
 ['android_smarthome_757','app:markor','Calendar source explicitly requires Markor temporary-override policy.', ['source_read','result_output']],
 ['android_smarthome_844','app:android-files','Calendar source explicitly directs reading todays route record from Files.', ['source_read']],
 ['android_smarthome_900','app:markor','Capability rows explicitly require the Markor capability rule.', ['source_read']],
 ['linux_android_smarthome_902','app:android-files','Native ticket explicitly identifies Files as the detailed request source.', ['source_read']],
 ['linux_android_smarthome_970','app:android-files','Native board task explicitly identifies four requests from Android Files.', ['source_read']],
 ['linux_android_smarthome_116','app:markor','Requested Air Quality Verification note matches the exact Markor output path in setup.', ['result_output']],
 ['linux_android_smarthome_116','app:simple-sms','Critical-case alert is addressed to the resolved Air Lead; task config binds the message channel to Simple SMS Messenger.', ['result_output']],
 ['linux_android_smarthome_041','app:markor','Tonight Sleep note supplies input and must receive actual settings.', ['source_read','process_edit']]
])add(t,a,r,roles);
drop('android_only_014','app:camera','Camera folder is only the destination for any valid JPEG; no capture app is required.');
drop('linux_android_615','app:camera','Camera album contains the existing evidence screenshot; no capture is required.');
drop('linux_only_233','app:libreoffice-writer','Writer report is an uploaded ODT; task audits fields without requiring Writer interaction or launcher.');
drop('linux_only_245','app:gimp','GIMP export manifest is CSV and existing PNG files; no GIMP interaction is required.');
add('linux_android_smarthome_570','app:simple-sms','Bathroom dampness message is a required incoming source; its thread receives the drying plan.', ['source_read','result_output']);
add('linux_android_smarthome_648','app:simple-sms','Owner rainy-arrival message supplies entrance and ETA; the same owner receives the timing reply.', ['source_read','result_output']);
// These launchers are setup conveniences, not required named GUI applications.
for(const task of ['linux_android_410','linux_android_496','linux_android_499','linux_android_414','linux_android_481','linux_android_585','linux_android_587','linux_android_589','linux_android_593']){
 const p=packs.get(task);const o=overrides[task]||={reason:'',evidence:[],add_apps:[],remove_apps:[],resolve_app_ids:[]};
 o.reason+=' Configured xfce4-terminal/thunar/nautilus is only a launcher; instruction requires script/file work but does not require that product.';
 o.evidence.push({source_file:p.task_path,location:'#/instruction and #/setup',quote:p.instruction});
}
drop('linux_only_357','app:tasks-org','Task ID is a Markdown table heading on Linux, not an Android application.');
drop('linux_android_988','app:simple-calendar','Policy expressly forbids Calendar events; recurring reminders become due-dated Tasks.');
drop('android_only_301','app:simple-calendar','Exact North Shed favorite is absent; only the Tasks follow-up is required, while Calendar contains an unrelated seeded event.');
add('linux_android_1072','app:simple-calendar','Reconcile the actual tentative visit with the authoritative missing-date schedule; event is a read-only source, not an output.', ['source_read']);
add('linux_android_1073','app:simple-sms','Newest dispatcher SMS selects request 1073-A rather than the demo request; outbound SMS is prohibited, incoming read is necessary.', ['source_read']);
add('linux_android_1073','app:tasks-org','Missing phone branch requires the coordinator follow-up task, bound to Tasks.org on android_1.', ['result_output']);
add('linux_android_1664','app:contacts','Directory phone supplies email addresses only for attendees named in the event.', ['source_read']);
add('linux_android_993','app:contacts','Selected request row requires editing the existing organizer contact note, not creating another contact.', ['process_edit']);
for(const [t,r]of Object.entries({
 linux_android_1022:'West Annex field observation is the uploaded Markor source note, supplying checklist, approval and observed access facts.',
 linux_android_1023:'Evidence inventory is the uploaded Markor note specifying captured items and approval.',
 linux_android_1157:'Scan batch is uploaded into Markor and is needed for discrepancy reconciliation.',
 linux_android_1184:'Investigator current captions are in Evidence captions.md under Markor.',
 linux_android_1330:'Route request is the Markor ROUTE-1330 note on the field phone.',
 linux_android_803:'Elena West Annex field observation is the uploaded Markor field-round note.',
 linux_android_895:'Second-phone current request is the Markor current-request.md source.',
 linux_android_930:'Maya field note with active site and approval is the Markor case-A_source.md source.',
 android_smarthome_808:'Room-protection guidance is the Markor Protected decoy note; its content is required despite its filename.',
 android_smarthome_817:'Scheduling rule is the uploaded Markor Restore dependency rule.',
 android_smarthome_968:'Restore-only policy is the uploaded Markor Guest restore-only rule.',
 android_smarthome_978:'Duty-phone incident handling policy is the uploaded Markor source.',
 android_smarthome_981:'Prior applied record is the Markor Old bedroom light record.'
}))add(t,'app:markor',r,['source_read']);
add('linux_android_1058','app:tasks-org','Actual sesame-oil order conflicts with the severe sesame card; policy requires the blocked follow-up task.', ['result_output']);
add('linux_android_1455','app:tasks-org','PDF Action items specifies two due-dated, importance-set, incomplete records; Tasks.org setup binds that phone queue. Context item is excluded.', ['result_output']);
add('linux_android_719','app:tasks-org','Active README deployment request explicitly requires the design task on its tablet; archived request is excluded.', ['result_output']);
// This identity conflict stays partial; remove an unjustified Google identity.
drop('android_smarthome_1013','app:contacts','Task setup names simple contacts pro, while the native helper targets Contacts data; concrete product remains unresolved.');
overrides.android_smarthome_1013.resolve_app_ids=[];
for(const o of Object.values(overrides)){o.evidence=[...new Map(o.evidence.map(e=>[e.source_file+e.location+e.quote,e])).values()];o.resolve_app_ids=[...new Set(o.resolve_app_ids)];}
fs.writeFileSync(path.join(OUT,'semantic_overrides.json'),JSON.stringify(overrides,null,2)+'\n');
console.log(JSON.stringify({Codex_reviewed_tasks:Object.keys(overrides).length}));
