import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const OUT=path.dirname(fileURLToPath(import.meta.url)),BASE=path.dirname(OUT);
const jl=n=>fs.readFileSync(path.join(OUT,n),'utf8').trim().split('\n').map(JSON.parse);
const packs=jl('evidence_packs.jsonl');
const extractedPath=path.join(OUT,'extracted_source_text.jsonl');
const extracted=fs.existsSync(extractedPath)?new Map(jl('extracted_source_text.jsonl').map(r=>[r.source_path,r])):new Map();
for(const p of packs)for(const r of p.resources){const x=extracted.get(r.source_path);if(x&&!x.error&&x.text){r.text=x.text;r.extraction_method=x.method;}}
const old=new Map(fs.readFileSync(path.join(BASE,'task_inventory.jsonl'),'utf8').trim().split('\n').map(JSON.parse).map(x=>[x.task_id,x]));
const aliases=JSON.parse(fs.readFileSync(path.join(BASE,'application_aliases.json')));
const extras=[{canonical_id:'app:android-settings',display_name:'Android Settings',platform:'Android',identity:'com.android.settings',aliases:['settings']},{canonical_id:'app:gedit',display_name:'gedit',platform:'Linux',identity:'gedit',aliases:[]},{canonical_id:'app:gnome-terminal',display_name:'GNOME Terminal',platform:'Linux',identity:'gnome-terminal',aliases:[]}];
const apps=[...aliases,...extras];
const runtime={'app:osmand':'net.osmand','app:retro-music':'code.name.monkey.retromusic','app:audio-recorder':'com.dimowner.audiorecorder','app:android-files':'com.google.android.documentsui','app:camera':'com.android.camera2'};
for(const a of apps){a.previous_identity=a.identity;if(runtime[a.canonical_id])a.identity=runtime[a.canonical_id];a.identity_source=a.canonical_id==='app:gedit'||a.canonical_id==='app:gnome-terminal'?'task setup execute command':'mdcbench/runner/run_llm_task.py:879-890;mdcbench/devices/android/setup.py:125-140;previous application_aliases.json';a.mapping_change=extras.includes(a)?'New concrete application found beyond previous 25-entity list':runtime[a.canonical_id]?'Replaced runtime-alias placeholder with documented package; entity unchanged':'Existing entity and cross-platform grouping retained';}
const def=[
 ['app:markor',/\bMarkor\b/gi,'markor'],['app:simple-calendar',/\b(?:Simple Calendar(?: Pro)?|Google Calendar|Calendar)\b|日历/gi,'simple calendar pro'],
 ['app:simple-sms',/\b(?:Simple SMS Messenger|SMS(?: Messenger)?|text messages?)\b|短信/g,'simple sms messenger'],
 ['app:contacts',/\b(?:Google Contacts|Android Contacts|Contacts|contact entry|contact record)\b|联系人/g,'contacts'],
 ['app:tasks-org',/\bTasks?(?:\.org)?\b|待办/g,'tasks'],['app:clock',/\b(?:Google Clock|Android Clock|Clock)\b|闹钟|计时器/g,'clock'],
 ['app:osmand',/\bOsmAnd\b/gi,'osmand'],['app:simple-gallery',/\b(?:Simple Gallery(?: Pro)?|Gallery)\b|相册/g,'simple gallery pro'],
 ['app:retro-music',/\bRetro(?: Music| Player)?\b/g,'retro music'],['app:broccoli',/\bBroccoli(?: Recipe)?\b/g,'broccoli app'],
 ['app:audio-recorder',/\bAudio Recorder\b/gi,'audio recorder'],['app:simple-draw',/\bSimple Draw(?: Pro)?\b/gi,'simple draw pro'],
 ['app:android-files',/\b(?:Android Files|Files app|Files)\b/g,'files'],['app:camera',/\bCamera\b|相机/g,'camera'],
 ['app:chrome',/\b(?:Google Chrome|Chrome)\b/g,'chrome'],['app:firefox',/\bFirefox\b/g,null],
 ['app:libreoffice-calc',/\b(?:LibreOffice Calc|Calc)\b/g,null],['app:libreoffice-writer',/\b(?:LibreOffice Writer|Writer)\b/g,null],
 ['app:libreoffice-impress',/\b(?:LibreOffice Impress|Impress)\b/g,null],['app:vscode',/\b(?:VS Code|VSCode|Visual Studio Code)\b/g,null],
 ['app:gimp',/\bGIMP\b/g,null],['app:vlc',/\bVLC\b/g,null],['app:thunderbird',/\bThunderbird\b/g,null],
 ['app:evince',/\b(?:Evince|Document Viewer|PDF viewer)\b|PDF\s*阅读器/gi,null],['app:file-roller',/\bArchive Manager\b/gi,null],
 ['app:android-settings',/\b(?:Android Settings|system settings)\b|系统设置/gi,'settings'],['app:gedit',/\bgedit\b/gi,null],['app:gnome-terminal',/\bGNOME Terminal\b/gi,null],
];
const setupAlias={'android files':'files','android file':'files','calendar':'simple calendar pro','sms':'simple sms messenger','messages':'simple sms messenger','gallery':'simple gallery pro','simple draw':'simple draw pro','broccoli':'broccoli app'};
const prefixes={'androidworld_calendar_event_add':'app:simple-calendar','androidworld_contact_add':'app:contacts','androidworld_sms_receive':'app:simple-sms','androidworld_task_add':'app:tasks-org','androidworld_recipe_add':'app:broccoli','androidworld_alarm_add':'app:clock','androidworld_timer_add':'app:clock','androidworld_retro_playlist_add':'app:retro-music','androidworld_osmand_favorite_add':'app:osmand'};
const commands={'app:chrome':/\b(?:google-chrome|chromium)\b/,'app:firefox':/\bfirefox\b/,'app:libreoffice-calc':/--calc\b/,'app:libreoffice-writer':/--writer\b/,'app:libreoffice-impress':/--impress\b/,'app:vscode':/\bcode --/,'app:gimp':/\bgimp\b/,'app:vlc':/\bvlc\b/,'app:thunderbird':/\bthunderbird\b/,'app:evince':/\bevince\b/,'app:file-roller':/\bfile-roller\b/,'app:gedit':/\bgedit\b/,'app:gnome-terminal':/\bgnome-terminal\b/};
const inputVerb=/\b(?:read|review|inspect|compare|check|look|find|consult|use|uses|using|combine|match|matches|open|follow|take|copy|extract|refer|based|from|according|contains?|shows?|lists?|has|have|with|in|assess|audit|reconcile|identify|identifies|identified|selects?|provides?|describes?|includes?|asks?|asked|requests?|says|disagree|owns|confirms?|gives|arrived|approved|approves|maps|determine|resolve)\b|读取|阅读|查看|查阅|核对|检查|参考|依据|根据|说明|记录了|写了|提供|对照|里的|中的|现有|第一台|第二台|中有|里有|导出|笔记是|笔记列出|打开|整理|列出|写明|写有|显示|指定了|标注为|都在|是收据|的本地页面/i;
const outputVerb=/\b(?:create|add|save|write|update|edit|change|set|rename|move|copy|delete|remove|replace|send|reply|record|register|store|complete|make|leave|put|build|fill|capture|take|draw|generate|keep|apply|submit|upload|synchronize|append)\b|创建|新建|添加|保存|写入|写出|写回|生成|修改|更改|调整|登记|删除|取消|回复|发送|录制|画|设置|另存|转成|各录|录一|提交|填入/i;
const mask=s=>s.replace(/`([^`]+)`/g,(z,v)=>/[\/\\]|\.(?:md|txt|csv|json|html|odt|docx|xlsx|odp|pdf|png|jpg|zip)\b/i.test(v)?' '.repeat(z.length):z).replace(/(?:https?:\/\/|file:\/\/\/|\/(?:home|tmp|sdcard|storage)\/)[^\s，。；]+/g,z=>' '.repeat(z.length));
const cleanHTML=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ');
function clauses(s){const re=/[\s\S]+?(?:[。；;\n]|[.!?](?=\s|$)|$)/g;return [...s.matchAll(re)].filter(m=>m[0]).map(m=>({start:m.index,text:m[0]}));}
function review(t){
 const visible=mask(t.instruction),cc=clauses(visible),confirmed=[],excluded=[],uncertain=[],generic=[],bindings=[],records=[];
 const ev=(pointer,quote)=>({source_file:pointer.split('#')[0],location:pointer.includes('#')?'#'+pointer.split('#')[1]:'file contents',quote});
 const pointer=t.task_path+'#/instruction';
 for(const [bi,b]of t.setup.entries())for(const [ci,c]of b.config.entries()){
  const ptr=t.task_path+'#/setup/'+bi+'/config/'+ci;
  if(['ensure_app','open_app'].includes(c.type)){const raw=c.parameters?.app||'',norm=setupAlias[raw.toLowerCase()]||raw.toLowerCase();const d=def.find(x=>x[2]===norm);if(d)bindings.push({app_id:d[0],device_id:b.device_id,original_label:raw,evidence:ev(ptr+'/parameters/app',raw),binding_type:c.type});else if(raw)bindings.push({app_id:null,device_id:b.device_id,original_label:raw,evidence:ev(ptr+'/parameters/app',raw),binding_type:'unrecognized_alias'});}
  if(c.type==='execute')for(const [id,re]of Object.entries(commands))if(re.test(c.parameters?.command||'')&&/\bnohup\b/.test(c.parameters.command)&&!/command -v gedit \|\|/.test(c.parameters.command))bindings.push({app_id:id,device_id:b.device_id,original_label:id.slice(4),evidence:ev(ptr+'/parameters/command',c.parameters.command),binding_type:'configured_launcher'});
  if(prefixes[c.type])records.push({app_id:prefixes[c.type],device_id:b.device_id,parameters:c.parameters||{},evidence:ev(ptr+'/parameters',JSON.stringify(c.parameters))});
 }
 function add(id,label,quote,source,rule,roles){
  const a=apps.find(a=>a.canonical_id===id),bb=bindings.filter(x=>x.app_id===id),rr=records.filter(x=>x.app_id===id);
  let ds=[...new Set([...bb,...rr].map(x=>x.device_id))];if(!ds.length)ds=t.devices.filter(d=>a.platform.includes(d.type==='android'?'Android':'Linux')).map(d=>d.id);
  let found=confirmed.find(a=>a.canonical_id===id);const why={rule_id:rule,annotation_source:rule==='prior_semantic_retained'?'existing_version_matched_Codex_annotation':'deterministic_context_and_identity_rule',roles,evidence:[ev(source,quote)],identity_evidence:bb.map(b=>b.evidence),reason:'Task requires this named app-owned source/action; identity is bound separately. Not inferred from file extension or installation alone.'};
  if(found){found.support.push(why);found.roles=[...new Set([...found.roles,...roles])];return;}
  confirmed.push({canonical_id:id,normalized_name:a.display_name,original_labels:[label],platform:a.platform,identity:a.identity,device_ids:ds,device_assignment:'configured application instances; platform confirmed, individual instance necessity not exhaustively assigned',roles,support:[why]});
 }
 const roleFor=s=>{const a=[];if(/\b(?:read|review|inspect|compare|check|find|consult|extract|from|contains?|shows?|lists?)\b|读取|阅读|查看|查阅|核对|检查|参考|依据|根据|现有|里有|中有/i.test(s))a.push('source_read');if(outputVerb.test(s))a.push(/edit|update|modify|replace|修改|调整|更改|另存/i.test(s)?'process_edit':'result_output');return a.length?a:['read_or_operate_required_object'];};
 for(const [id,re,alias]of def){
  const rawMatches=[...visible.matchAll(re)];
  for(const m of rawMatches){
   const c=cc.find(c=>m.index>=c.start&&m.index<c.start+c.text.length),sentence=c?.text||visible,pre=visible.slice(Math.max(0,m.index-60),m.index),post=visible.slice(m.index+m[0].length,m.index+m[0].length+70);
   const platform=apps.find(a=>a.canonical_id===id).platform;
   const identity=bindings.some(b=>b.app_id===id)||records.some(b=>b.app_id===id)||!platform.startsWith('Android')||['app:android-settings','app:android-files'].includes(id);
   let reject=null,doubt=null;
   if(platform==='Android'&&!t.devices.some(d=>d.type==='android'))reject='No Android environment; functional noun or non-app mention';
   if(id==='app:simple-calendar'&&/^\s*(?:days?|years?|months?|weeks?)\b/i.test(post))reject='Calendar duration unit, not calendar application';
   if(id==='app:osmand'&&/^[- ]compatible\b/i.test(post))reject='OsmAnd-compatible artifact format does not require running OsmAnd';
   if(/(?:may use|can use|optionally|such as|可用|可以使用|例如)\s*(?:the\s+)?$/i.test(pre))reject='Explicit optional tool, not required app';
   if(id==='app:camera'&&!/capture|take (?:a |one |two |three )?(?:new )?(?:photo|picture)|record (?:a |one )?video|拍摄|拍照|录像/i.test(sentence))reject='Existing Camera album/media does not require capture app';
   if(id==='app:android-files'&&/^(?:Files? (?:must|should|are|named)|files?\b)/.test(m[0])&&!/Android Files|Files app|\bFiles\b/.test(m[0]))reject='Generic files';
   if(['app:libreoffice-writer','app:libreoffice-calc','app:libreoffice-impress'].includes(id)&&/^\s*(?:document|template|receipt|deck|workbook|file)\b/i.test(post)&&!/(?:in|using|with|open|use|on|Linux|LibreOffice)\s*(?:the\s+)?$/i.test(pre)&&!/[在用]$/.test(pre))reject='Document/template product label, no required interaction in this clause';
   if(/(?:do not|don't|never|不得|不要)\s*(?:open|use|launch|打开|使用)\s*$/i.test(pre))reject='Explicitly prohibited application use';
   if(/(?:do not|don't|never)\s+(?:create|add|send|modify|edit|change)\b[^.。;；]{0,30}$/i.test(pre))reject='Prohibited app mutation is not positive participation evidence';
   const guard=/(?:leave|keep|preserve|do not change|don't change|保持|保留|不改动|不要修改)[^.。;；]{0,80}$/i.test(pre)&&/(?:unchanged|unmodified|untouched|intact|不变|不改)/i.test(post)&&!/\b(?:create|add|write|new)\b/.test(pre);
   if(guard&&!/read|inspect|compare|check|verify|查看|核对|读取/i.test(pre))doubt='Guard/conditional participation: preserving app state alone may not require app interaction';
   if(id==='app:osmand'&&/unless|if .*authoriz|如果|除非/i.test(sentence))doubt='Conditional OsmAnd action needs source-policy branch review';
   if(!identity)doubt='Concrete app identity lacks an unambiguous task setup binding';
   if(!reject&&!doubt&&!inputVerb.test(sentence)&&!outputVerb.test(sentence))doubt='App mention without resolved source/action relationship';
   if(reject)excluded.push({app_id:id,original_label:m[0],reason:reject,evidence:ev(pointer,t.instruction.slice(Math.max(0,m.index-60),m.index+100))});
   else if(doubt)uncertain.push({app_id:id,issue:doubt,evidence:ev(pointer,t.instruction.slice(Math.max(0,m.index-60),m.index+130))});
   else add(id,m[0],t.instruction.slice(c?.start||0,(c?.start||0)+sentence.length),pointer,'explicit_app_owned_object_and_task_action',roleFor(sentence));
  }
 }
 // Functional labels become concrete apps only with a matching task instance
 // and an active source/output request. Installation alone never triggers these.
 const functional=[
 ['app:simple-sms',/\b(?:message|messages|SMS|text message|reply)\b|\btext (?:the |a |one |[A-Z])|短信|回复/gi],
 ['app:tasks-org',/\b(?:create|add|read|review|match|update|complete|delete|remove|requested|existing|current|incomplete|completed|unfinished|matching)\b[^.;。；]{0,55}\btasks?\b|\btask (?:phone|record|entry|title|notes|due|list)\b/gi],
 ['app:clock',/\b(?:alarm|timer)\b/gi],
 ['app:broccoli',/\b(?:recipe|recipes)\b/gi],
 ['app:simple-calendar',/\b(?:calendar|calendar event|calendar entry|meeting event)\b/gi],
 ['app:simple-gallery',/\b(?:album|gallery)\b/gi],
 ['app:markor',/\b(?:read|review|open|compare|consult|use)\b[^.;。；]{0,75}\bnote\b|\b(?:phone|Android|device)[^.;。；]{0,70}\bnote\b|\/Documents\/Markor\/|\b(?:update|edit)\b[^.;。；]{0,70}\bhandoff\.md/gi],
 ['app:camera',/\b(?:take|capture)\b[^.;。；]{0,45}\b(?:photo|picture|video)\b|拍摄|拍照|录像/gi],
 ['app:contacts',/\b(?:contact|contacts)\b|联系人/gi],
 ['app:simple-calendar',/\b(?:create|schedule|update|read|review|match|compare)\b[^.;。；]{0,70}\b(?:event|meeting)\b/gi],
 ['app:retro-music',/\b(?:playlist|playing queue|current queue|queued tracks)\b/gi],
 ['app:tasks-org',/\b(?:Android|phone|device)[^.;。；]{0,70}\btasks?\b|\bfollow-up tasks?\b|\bcreate\b[^.;。；]{0,60}\bfollow-up\b/gi],
 ];
 for(const [id,re]of functional){
  if(confirmed.some(a=>a.canonical_id===id))continue;const match=[...t.instruction.matchAll(re)][0];if(!match)continue;
  const bb=bindings.filter(b=>b.app_id===id),rr=records.filter(r=>r.app_id===id);if(!bb.length&&!rr.length)continue;
  if(id==='app:simple-sms'&&!rr.length&&!/\b(?:reply|send|message|text)\b|回复|发送|短信/i.test(t.instruction))continue;
  if(id==='app:clock'&&/\b(?:unchanged|preserve|leave|keep)\b.{0,40}\b(?:alarm|timer)/i.test(t.instruction)&&!/\b(?:set|create|update|read|check|compare|requested|enable|disable|remove)\b/i.test(t.instruction))continue;
  if(id==='app:tasks-org'&&/\btask (?:goal|instruction|completion|requirements)\b/i.test(match[0]))continue;
  const insClause=clauses(t.instruction).find(c=>match.index>=c.start&&match.index<c.start+c.text.length)?.text||t.instruction;
  const functionalPre=t.instruction.slice(Math.max(0,match.index-65),match.index);
  if(/(?:do not|don't|never)\s+(?:create|add|send|modify|edit|change)\b[^.。;；]{0,30}$/i.test(functionalPre))continue;
  if(/(?:do not|don't|never)\s*$/i.test(functionalPre)&&/^(?:create|add|send|modify|edit|change)\b/i.test(match[0]))continue;
  if(!inputVerb.test(insClause)&&!outputVerb.test(insClause)&&!/\b(?:note|recipe|task phone|latest message|current message)\b/i.test(insClause))continue;
  add(id,match[0],insClause,pointer,'functional_task_object_with_matching_application_instance',roleFor(insClause));
  if(rr.length)confirmed.find(a=>a.canonical_id===id).support.at(-1).evidence.push(rr[0].evidence);
 }
 // Inspect directly supplied app records. Record type determines identity only after
 // a source/target reference in the instruction links this particular record to the goal.
 if(bindings.some(b=>b.app_id==='app:simple-sms')&&!confirmed.some(a=>a.canonical_id==='app:simple-sms'))for(const clause of clauses(t.instruction)){
  if(/\b(?:email|e-mail|Thunderbird|mailbox)\b/i.test(clause.text))continue;
  const requests=[...clause.text.matchAll(/\b(?:send|notify|text)\b/gi)];
  const positive=requests.find(m=>!/(?:do not|don't|never|cannot|without)\b[^.;。；]{0,30}$/i.test(clause.text.slice(0,m.index))&&(!/^text$/i.test(m[0])||/^\s+(?:[A-Za-z`“])/i.test(clause.text.slice(m.index+m[0].length)))&&(/^(?:notify|text)$/i.test(m[0])||/confirmation|update|summary|notice|notification|text|reminder|warning|response|result|decision|code|setting|phone|contact|recipient|number|guest|body/i.test(clause.text.slice(m.index))));
  if(positive)add('app:simple-sms',positive[0],clause.text,pointer,'required_person_message_with_configured_SMS_channel',['result_output']);
 }
 for(const r of records){const names=['title','name','subject','filename','playlist_name','favorite_name','label'].map(k=>r.parameters[k]).filter(v=>typeof v==='string'&&v.length>=5),matches=names.filter(v=>t.instruction.toLowerCase().includes(v.toLowerCase()));
  if(matches.length&&!confirmed.some(x=>x.canonical_id===r.app_id)&&inputVerb.test(visible)){
   add(r.app_id,matches[0],t.instruction,pointer,'instruction_references_exact_app_record',roleFor(visible));confirmed.find(x=>x.canonical_id===r.app_id).support.at(-1).evidence.push(r.evidence);
  }
 }
 const codes=[...new Set(t.instruction.match(/\b[A-Z]{2,}(?:-[A-Z]+)?-\d{2,}\b/g)||[])];
 for(const r of records){if(confirmed.some(a=>a.canonical_id===r.app_id))continue;const text=JSON.stringify(r.parameters),matched=codes.filter(c=>text.includes(c));
  if(matched.length&&/\b(?:phone|Android|device|mobile)\b/i.test(t.instruction)&&inputVerb.test(t.instruction)){add(r.app_id,matched.join(', '),t.instruction,pointer,'instruction_case_id_matches_native_source_record',['source_read']);confirmed.find(a=>a.canonical_id===r.app_id).support.at(-1).evidence.push(r.evidence);}
 }
 for(const r of records){if(confirmed.some(a=>a.canonical_id===r.app_id))continue;
  if(r.app_id==='app:contacts'&&/saved.*(?:role|authority)|care authority|saved preferences|coordinator role/i.test(t.instruction)){const name=String(r.parameters.name||'').split(/\s+/)[0];if(name.length>=3&&new RegExp('\\b'+name+'\\b','i').test(t.instruction)){add(r.app_id,name,t.instruction,pointer,'named_person_saved_role_matches_contact_record',['source_read']);confirmed.find(a=>a.canonical_id===r.app_id).support.at(-1).evidence.push(r.evidence);}}
  if(r.app_id==='app:simple-calendar'&&/\b(?:time|end|start|arrival|booking|appointment|window|deadline|orientation|check|sleep)\b/i.test(t.instruction)){const words=String(r.parameters.title||'').toLowerCase().match(/[a-z]{5,}/g)||[],matched=words.filter(w=>!['current','event','calendar','follow','meeting','request','approved'].includes(w)&&new RegExp('\\b'+w+'\\b','i').test(t.instruction));if(matched.length){add(r.app_id,matched.join(', '),t.instruction,pointer,'named_time_anchor_matches_calendar_record',['source_read']);confirmed.find(a=>a.canonical_id===r.app_id).support.at(-1).evidence.push(r.evidence);}}
 }
 for(const r of records.filter(x=>x.app_id==='app:contacts')){const role=String(r.parameters.notes||'').match(/\bRole:\s*([A-Za-z][A-Za-z ]+)/);if(role&&t.instruction.toLowerCase().includes(role[1].trim().toLowerCase())&&records.some(s=>s.app_id==='app:simple-sms'&&s.parameters.address===r.parameters.number)&&/request|reply|message|请求|回复|短信/i.test(t.instruction)){add(r.app_id,role[1].trim(),t.instruction,pointer,'named_contact_role_links_message_sender', ['source_read']);confirmed.find(x=>x.canonical_id===r.app_id).support.at(-1).evidence.push(r.evidence);}}
 // Functional GUI instructions bind to a product only where a non-fallback
 // launcher is present. A file-opening setup alone is not sufficient.
 for(const [genericRe,id]of [[/文本编辑器|\btext editor\b/gi,'app:gedit'],[/\bLinux Terminal\b|\bGNOME Terminal\b/gi,'app:gnome-terminal'],[/\b(?:browser|web browser)\b|浏览器|\b(?:submit|fill|complete)\b[^.;。；]{0,35}\bform\b|\b(?:page|form)\b[^.;。；]{0,50}\b(?:submit|download|click)\b|\bdownload\b[^.;。；]{0,40}\b(?:page|its CSV)\b|网页|页面|提交表单/gi,'browser'],[/图片查看器|\bimage viewer\b/gi,'image-viewer']]){
  const matches=[...visible.matchAll(genericRe)];if(!matches.length)continue;
  if(id==='browser'){
   if(confirmed.some(a=>['app:chrome','app:firefox'].includes(a.canonical_id)))continue;
   const bs=[...new Set(bindings.filter(b=>['app:chrome','app:firefox'].includes(b.app_id)).map(b=>b.app_id))];
   if(bs.length===1)add(bs[0],matches[0][0],t.instruction,pointer,'required_browser_interaction_configured_product',roleFor(visible));
   else generic.push({functional_label:'browser interaction',specific_application:'not_specified_or_not_statically_bound',reason:'Task requires browser use, but no unique named product binding.',evidence:ev(pointer,t.instruction)});
  }else if(bindings.some(b=>b.app_id===id))add(id,matches[0][0],t.instruction,pointer,'required_GUI_function_configured_product',roleFor(visible));
  else generic.push({functional_label:matches[0][0],specific_application:'not_specified_or_runtime_dependent',reason:'Instruction names a function; configured alternatives/xdg-open do not select a unique product statically.',evidence:ev(pointer,t.instruction)});
 }
 // Required named note + actual Markor-owned path resolves an implicit source.
 // A .md suffix or ensure_app alone does not trigger this rule.
 if(bindings.some(b=>b.app_id==='app:markor')&&!confirmed.some(a=>a.canonical_id==='app:markor')){
  const references=t.resources.filter(r=>/\/Documents\/Markor\//i.test(r.deployed_path||'')&&t.instruction.toLowerCase().includes(path.basename(r.deployed_path).replace(/\.md$/i,'').toLowerCase()));
  for(const r of references)add('app:markor',path.basename(r.deployed_path),t.instruction,pointer,'required_named_note_matches_Markor_owned_source',['source_read']);
  for(const [bi,b]of t.setup.entries())for(const [ci,c]of b.config.entries()){
   const cmd=Array.isArray(c.parameters?.command)?c.parameters.command.join('\n'):c.parameters?.command;if(typeof cmd!=='string'||!cmd.includes('/Documents/Markor'))continue;
   const named=[...t.instruction.matchAll(/(?:\x60|["“])([^\x60"”]+\.md)(?:\x60|["”])|\b([A-Z][A-Za-z -]{3,70}\.md)\b/g)].map(m=>m[1]||m[2]).filter(n=>cmd.includes(n));
   if(named.length)add('app:markor',named.join('; '),cmd,t.task_path+'#/setup/'+bi+'/config/'+ci+'/parameters/command','required_named_note_matches_Markor_owned_setup_path',['read_or_operate_required_object']);
  }
 }
 // Read uploaded assets, native record contents and literal inline source payloads.
 // These are data-only reads: no task setup command is executed.
 const sourceApps=[];
 const inline=[];
 for(const [bi,b] of t.setup.entries())for(const [ci,c] of b.config.entries()){
  const cmd=Array.isArray(c.parameters?.command)?c.parameters.command.join('\n'):c.parameters?.command;
  if(typeof cmd!=='string')continue;
  const payloads=[...cmd.matchAll(/<<['"]?([A-Za-z_][A-Za-z_0-9]*)['"]?\s*\n([\s\S]*?)\n\1\b/g)].map(m=>m[2]);
  for(const m of cmd.matchAll(/\b(?:printf|echo)\s+(?:'%s(?:\\n)?'\s+)?'([^']{12,})'\s*>/g))payloads.push(m[1].replace(/\\n/g,'\n'));
  for(const text of payloads)inline.push({source_path:t.task_path+'#/setup/'+bi+'/config/'+ci+'/parameters/command',format:'.txt',text,exists:true});
 }
 const native=records.map(r=>({source_path:r.evidence.source_file+r.evidence.location,format:'.txt',text:Object.values(r.parameters).filter(v=>typeof v==='string').join('\n'),exists:true}));
 for(const r of [...t.resources,...native,...inline]){
  if(!r.exists){uncertain.push({issue:'Referenced uploaded source file missing',evidence:ev(r.source_path,r.deployed_path||'')});continue;}
  if(!r.text)continue;
  const text=/\.html?$/.test(r.format)?cleanHTML(r.text):r.text;
  if(bindings.some(b=>b.app_id==='app:tasks-org')&&!confirmed.some(a=>a.canonical_id==='app:tasks-org')&&/\b(?:create|add)\b[^.;。；\n]{0,70}\btasks?\b/i.test(text))sourceApps.push({app_id:'app:tasks-org',issue:'Source requests task creation; verify goal linkage and selected branch',evidence:ev(r.source_path,text.match(/.{0,40}\b(?:create|add)\b[^.;。；\n]{0,70}\btasks?\b.{0,100}/i)?.[0]||text.slice(0,300))});
  for(const [id,re]of def){const ms=[...mask(text).matchAll(re)];if(!ms.length||confirmed.some(x=>x.canonical_id===id))continue;
   for(const m of ms){const snippet=text.slice(Math.max(0,m.index-70),m.index+150);
    if(!/\b(?:read|open|create|save|send|reply|update|check|in|from|using|with|via)\b|打开|读取|创建|保存|发送|回复|更新|查看|在.*中/i.test(snippet))continue;
    sourceApps.push({app_id:id,issue:'Additional app name in supplied source; instruction linkage or branch relevance needs semantic review',evidence:ev(r.source_path,snippet)});
   }
  }
 }
 uncertain.push(...sourceApps);
 // Prior pilot positives are not a completeness certificate. Retain only unchanged
 // app decisions not contradicted by this round's explicit exclusion evidence.
 for(const a of old.get(t.task_id)?.applications||[])if(t.previous_version_matches&&!confirmed.some(x=>x.canonical_id===a.canonical_id)&&!excluded.some(x=>x.app_id===a.canonical_id))add(a.canonical_id,a.display_name,t.instruction,pointer,'prior_semantic_retained',roleFor(visible));
 const resolved=uncertain.filter(u=>!u.app_id||!confirmed.some(a=>a.canonical_id===u.app_id));
 for(const r of records)if(!confirmed.some(a=>a.canonical_id===r.app_id)&&!resolved.some(u=>u.app_id===r.app_id))resolved.push({app_id:r.app_id,issue:'Populated native app record not yet linked or excluded against task goal',evidence:r.evidence});
 const unmentioned=bindings.filter(b=>b.app_id&&!confirmed.some(a=>a.canonical_id===b.app_id)&&!resolved.some(u=>u.app_id===b.app_id));
 for(const b of unmentioned)excluded.push({app_id:b.app_id,original_label:b.original_label,reason:'Only setup binding; no required source/action relationship established in instruction or inspected text. Not counted.',evidence:b.evidence});
 for(const b of bindings.filter(x=>!x.app_id))resolved.push({issue:'Unrecognized/contradictory setup app identity '+b.original_label,evidence:b.evidence});
 const unique=(arr,key)=>[...new Map(arr.map(x=>[key(x),x])).values()];
 const issues=unique(resolved,x=>(x.app_id||'')+'|'+x.issue+'|'+x.evidence.source_file);
 const hasIndirect=/according to|follow (?:the |its )?(?:instructions|directions)|requirements? (?:in|from)|按.*说明|根据.*要求|按.*要求|按.*指示|follow.*(?:brief|request|policy)|按.*(?:请求|需求)/i.test(visible);
 const unsupported=t.resources.filter(r=>r.text===null&&/\.(pdf|docx|odt|xlsx|ods|odp|pptx)$/i.test(r.source_path));
 if(hasIndirect&&unsupported.length)issues.push({issue:'Task delegates requirements to a native document not text-decoded in this pass; additional app directives may remain',evidence:ev(unsupported[0].source_path,unsupported.map(x=>x.deployed_path).join('; '))});
 const status=issues.length?'partial':'complete';
 return {task_id:t.task_id,task_path:t.task_path,content_sha256:t.content_sha256,scopes:t.scopes,status,confirmed_applications:confirmed,unspecified_interactions:generic,excluded_candidates:unique(excluded,x=>x.app_id+'|'+x.reason),unresolved:issues,no_concrete_app_reason:confirmed.length||status!=='complete'?null:t.devices.every(d=>d.normalized_type==='IoT')?'only_IoT_interface':generic.length?'required_function_no_specific_product':'file_or_environment_operations_without_specified_application',review_method:'deterministic_context_and_identity_rules_plus_version_matched_pilot; each actual instruction/setup/text asset parsed',review_rule_version:'application-full.v1',resources_inspected:[...t.resources,...native,...inline].map(r=>({source:r.source_path,text_decoded:r.text!==null,exists:r.exists})),input_instruction:t.instruction};
}
const overridesPath=path.join(OUT,'semantic_overrides.json');const overrides=fs.existsSync(overridesPath)?JSON.parse(fs.readFileSync(overridesPath)):{};
function applyOverride(r){
 const o=overrides[r.task_id];if(!o)return r;r.semantic_review=o;
 for(const id of o.remove_apps||[]){r.confirmed_applications=r.confirmed_applications.filter(a=>a.canonical_id!==id);r.excluded_candidates.push({app_id:id,reason:o.reason,evidence:o.evidence,annotation_source:'Codex_semantic_review'});}
 for(const app of o.add_apps||[]){
  const info=apps.find(a=>a.canonical_id===app.id),found=r.confirmed_applications.find(a=>a.canonical_id===app.id),support={annotation_source:'Codex_semantic_review',reason:app.reason,evidence:app.evidence,roles:app.roles};
  r.excluded_candidates=r.excluded_candidates.filter(e=>e.app_id!==app.id||!e.reason.startsWith('Only setup'));
  if(found){found.support.push(support);found.roles=[...new Set([...found.roles,...app.roles])];}
  else r.confirmed_applications.push({canonical_id:app.id,normalized_name:info.display_name,original_labels:[info.display_name],platform:info.platform,identity:info.identity,device_ids:app.device_ids||[],roles:app.roles,support:[support]});
 }
 if(o.resolve_app_ids)r.unresolved=r.unresolved.filter(u=>!o.resolve_app_ids.includes(u.app_id));
 if(o.resolve_issues)r.unresolved=r.unresolved.filter(u=>!o.resolve_issues.some(s=>u.issue.includes(s)));
 r.status=o.status||(r.unresolved.length?'partial':'complete');
 if(r.confirmed_applications.length||r.status!=='complete')r.no_concrete_app_reason=null;
 else r.no_concrete_app_reason||='file_or_environment_operations_without_specified_application';
 return r;
}
const dir=path.join(OUT,'batches');fs.mkdirSync(dir,{recursive:true});
const all=[];for(let start=0;start<packs.length;start+=250){const num=Math.floor(start/250),file=path.join(dir,'batch_'+String(num).padStart(3,'0')+'.jsonl');let batch;
 if(process.argv.includes('--resume')&&fs.existsSync(file))batch=fs.readFileSync(file,'utf8').trim().split('\n').map(JSON.parse);else{batch=packs.slice(start,start+250).map(t=>applyOverride(review(t)));fs.writeFileSync(file,batch.map(r=>JSON.stringify(r)).join('\n')+'\n');}
 all.push(...batch);fs.writeFileSync(path.join(OUT,'progress.json'),JSON.stringify({reviewed:all.length,total:packs.length,next_batch:num+1,rule_version:'application-full.v1'},null,2)+'\n');
}
fs.writeFileSync(path.join(OUT,'task_application_annotations.jsonl'),all.map(r=>JSON.stringify(r)).join('\n')+'\n');
fs.writeFileSync(path.join(OUT,'application_entities.json'),JSON.stringify(apps,null,2)+'\n');
console.log(JSON.stringify({counts:Object.fromEntries(['complete','partial','unreviewed'].map(s=>[s,all.filter(r=>r.status===s).length])),apps:apps.map(a=>[a.display_name,all.filter(r=>r.confirmed_applications.some(x=>x.canonical_id===a.canonical_id)).length]),issues:all.reduce((m,r)=>{for(const u of r.unresolved)m[u.issue]=(m[u.issue]||0)+1;return m;},{})}));
