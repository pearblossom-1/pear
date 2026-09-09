// User-authorized app attribution. Preserves the earlier evidence-only census.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {Workbook} from '@oai/artifact-tool';

const BASE=path.dirname(fileURLToPath(import.meta.url));
const OUT=path.join(BASE,'operation_attribution_v2');
const jl=n=>fs.readFileSync(path.join(BASE,n),'utf8').trim().split('\n').map(JSON.parse);
const original=jl('task_application_annotations.jsonl');
const packs=new Map(jl('evidence_packs.jsonl').map(p=>[p.task_id,p]));
const entities=JSON.parse(fs.readFileSync(path.join(BASE,'application_entities.json'),'utf8'));
const apps=new Map(entities.map(a=>[a.canonical_id,a]));
const identityIds=['linux_android_861','linux_android_862','linux_android_951','linux_android_960','linux_android_972','android_smarthome_1013'];
const manual={
 linux_only_213:{add:['app:evince'],reason:'初始化的 baseline site plan 是 site_plan.pdf，指令需要以其为基线读出区位信息。'},
 linux_only_030:{add:['app:chrome'],reason:'当前价格来自两张 product pages；读取网页价格与更新 XLSX 分别计 Chrome 和 Calc。'},
 linux_only_060:{add:['app:vscode'],reason:'除发布跟踪 XLSX 外，还明确更新项目 package 文件和 README，归 VS Code。'},
 linux_only_061:{add:['app:libreoffice-calc'],reason:'approved_versions.csv 是独立批准版本源而非测试夹具，保留 Calc 与配置修改的 VS Code。'},
 linux_only_133:{add:['app:libreoffice-calc'],reason:'bug_tracker.csv 是跨机指派工作记录而非项目测试夹具，读取其分配行归 Calc。'},
 linux_only_188:{add:['app:vscode'],reason:'从供应商 CSV 和配置行模板生成配置文件与处理记录，配置编写也归 VS Code。'},
 linux_only_191:{replace:true,add:['app:file-roller','app:libreoffice-calc','app:libreoffice-writer','app:evince'],reason:'读取压缩包内两份发票 CSV 和 PDF 模板，再制作一页文字/表格 PDF 报告；报告制作归 Writer。'},
 linux_only_203:{replace:true,add:['app:evince','app:libreoffice-writer'],reason:'读取两份 PDF 包清单并编制一页同步报告，分别归 PDF 阅读与 Writer 文档制作。'},
 linux_android_1081:{add:['app:libreoffice-writer'],reason:'交付包含两张匹配照片及说明的 PDF 资料包，文档编排归 Writer，另保留 CSV 索引的 Calc。'},
 linux_android_1090:{add:['app:gimp'],reason:'Linux 图形工作站要求制作带源照片和文字的 700×500 图片卡，归 GIMP。'},
 linux_android_1092:{remove:['app:evince'],reason:'PDF 只出现在禁止创建的不完整资料包要求中，不是需要阅读的来源。'},
 linux_android_1140:{add:['app:android-files'],reason:'在 Android 选择训练照片后用于 Linux 演示文稿，Android 文件访问也计入。'},
 linux_android_1464:{remove:['app:libreoffice-calc'],reason:'唯一 CSV 来源在 Android 请求手机；Linux 只播放指定媒体并写 TXT，不另推定 Linux Calc。'},
 linux_android_1530:{remove:['app:gedit'],reason:'TXT 请求在 Android Downloads，Linux 处理 ODT/Word 与 XLSX；不因手机 TXT 增加 Linux gedit。'},
 linux_android_453:{add:['app:audio-recorder'],reason:'Android 明确要制作并保存一段 M4A 确认录音，按已有 Audio Recorder 归类。'},
 linux_android_461:{add:['app:libreoffice-writer','app:audio-recorder'],reason:'要求填 ODT 模板并保存报告，同时在 Android 录制 M4A 确认，分别归 Writer 与 Audio Recorder。'},
 linux_android_463:{add:['app:libreoffice-calc'],reason:'两个压缩包中的库存数据需要按合并规则交付 CSV，不只是 ZIP 文件移动。'},
 linux_android_467:{remove:['app:vlc'],reason:'指令明确只读取录音文件名，不需要播放或理解音频，故不计 VLC。'},
 linux_android_483:{add:['app:vscode','app:android-files'],reason:'除 PDF/图片来源外，还要编辑 Linux 项目 README，并复制选定图标至 Android 指定目录。'},
 linux_android_566:{add:['app:simple-draw'],reason:'除了 Linux 海报，Android 还须创建独立方形社交图片，按既有 Simple Draw Pro 的绘图功能归属。'},
 linux_android_614:{add:['app:osmand','app:vlc'],reason:'Android 的 Field Site A favorite 是任务信息来源；Linux 要读取当前播放的检查录音身份并包装该录音，不能仅记 ZIP。'},
 linux_android_657:{add:['app:tasks-org','app:clock'],reason:'指令要求在一台手机安排摄影待办、另一台手机设置独立 08:30 提醒，依任务来源材料归已有 Tasks.org 和 Clock。'},
 linux_android_679:{remove:['app:gedit'],reason:'过滤请求 TXT 在 Android，Linux 只需处理主 CSV；不因此增加 Linux gedit。'},
 linux_android_826:{remove:['app:vscode'],reason:'JSON 菜谱清单只在 Android；Linux 读取 pantry.csv 并输出购物 CSV，不把手机 JSON 归给 Linux VS Code。'},
 linux_android_862:{add:['app:gimp'],remove:['app:android-files'],reason:'明确要求在 Linux 制作含两张原照片及说明的 1200×800 PNG contact sheet，归 GIMP；Android 照片访问已归 Gallery，不因 Linux CSV 额外计 Android Files。'},
 linux_android_1640:{remove:['app:simple-gallery'],reason:'field album 是源文件夹名称；任务只要求按清单搬移图片且保持字节，不要求相册内容交互，归 Android Files。'},
 linux_android_972:{add:['app:libreoffice-calc'],remove:['app:file-roller'],reason:'Evidence Control 的源 manifest 是 evidence_manifest.csv；setup 删除唯一必需照片，当前实例走 blocked JSON 路径，不能因提到 ZIP 就计归档应用。'},
};
for(const id of ['linux_only_062','linux_only_077','linux_only_153','linux_only_160','linux_only_307','linux_only_312','linux_only_322'])
 manual[id]={add:['app:evince','app:libreoffice-writer'],reason:'任务需要阅读 PDF 来源并编制或修订可读 PDF 文档，分别归 Evince 和 Writer 文档制作。'};
for(const id of ['linux_only_052','linux_only_058','linux_only_194'])
 manual[id]={add:['app:gnome-terminal'],reason:'明确要求运行已有 .sh 脚本并使用命令结果，独立命令执行归已有 GNOME Terminal。'};
for(const id of ['linux_android_1252','linux_android_1277','linux_android_1315','linux_android_1333','linux_android_1358','linux_android_1360','linux_android_1364','linux_android_1380','linux_android_879'])
 manual[id]={remove:['app:file-roller'],reason:'ZIP 只作为不得创建的输出出现；实际任务是检查源清单并输出阻塞记录，不计归档应用。'};
const isTarget=r=>(r.status==='complete'&&!r.confirmed_applications.length&&r.no_concrete_app_reason!=='only_IoT_interface')||identityIds.includes(r.task_id);

function attribute(r){
 const p=packs.get(r.task_id),instruction=p.instruction;
 const result={task_id:r.task_id,task_path:r.task_path,scopes:r.scopes,
  original_status:r.status,original_no_app_reason:r.no_concrete_app_reason,
  evidence_confirmed_app_ids:r.confirmed_applications.map(a=>a.canonical_id),
  added_applications:[],attributed_app_ids:r.confirmed_applications.map(a=>a.canonical_id),
  attribution_reviewed:isTarget(r),input_instruction:instruction,
  source_annotation_reference:'../task_application_annotations.jsonl#'+r.task_id};
 if(!isTarget(r))return result;
 const linux=p.devices.filter(d=>d.type==='linux').map(d=>d.id),android=p.devices.filter(d=>d.type==='android').map(d=>d.id);
 const add=(id,reason,quote=instruction,source=r.task_path+'#/instruction',basis='operation_attribution')=>{
  assert(apps.has(id),id);
  if(result.attributed_app_ids.includes(id))return;
  const app=apps.get(id),devices=app.platform==='Android'?android:app.platform==='Linux'?linux:[...linux,...android];
  if(!devices.length)return;
  result.added_applications.push({canonical_id:id,normalized_name:app.display_name,basis,reason,evidence:[{source,quote}],compatible_device_ids:devices,
   device_assignment:'compatible environments, not proof every instance uses this app',product_required_by_task:false});
  result.attributed_app_ids.push(id);
 };
 if(identityIds.includes(r.task_id))add(r.task_id==='android_smarthome_1013'?'app:contacts':'app:simple-gallery',
  r.task_id==='android_smarthome_1013'?'用户授权将指令中的 Contacts 归入已有 Google Contacts 统计项，不声称已经排除 setup 中具体产品身份差异。':'用户授权将指令中的 Gallery 归入已有 Simple Gallery Pro 统计项。',instruction,undefined,'user_authorized_identity_attribution');
 // Files explicitly named by the instruction, including assets inside a named directory.
 // Setup-only files and metadata/evaluator keywords do not directly create an app relation.
 const material=[{source:r.task_path+'#/instruction',text:instruction}];
 for(const resource of p.resources){
  const name=path.basename(resource.deployed_path||''),dir=path.dirname(resource.deployed_path||'');
  const named=name.length>3&&instruction.toLowerCase().includes(name.toLowerCase());
  const escapedDir=dir.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const inNamedDir=dir.length>8&&new RegExp(escapedDir+'/?(?=[`\\s，。；、]|$)').test(instruction);
  if(named||inNamedDir)material.push({source:resource.setup_pointer,text:resource.deployed_path,device_id:resource.device_id});
 }
 let linuxInstruction=instruction;
 for(const resource of p.resources.filter(m=>android.includes(m.device_id))){
  const deployed=resource.deployed_path||'',name=path.basename(deployed);
  if(deployed)linuxInstruction=linuxInstruction.replaceAll(deployed,'[Android source file]');
  if(name.length>3&&!p.resources.some(m=>linux.includes(m.device_id)&&path.basename(m.deployed_path||'')===name))
   linuxInstruction=linuxInstruction.replaceAll(name,'[Android source file]');
 }
 linuxInstruction=linuxInstruction.replace(/\/(?:sdcard|storage\/emulated\/0)\/[^`\s,;，。]+/g,'[Android file path]');
 const linuxMaterials=material.filter(m=>!m.device_id||linux.includes(m.device_id)).map(m=>m.source===r.task_path+'#/instruction'?{...m,text:linuxInstruction}:m);
 const corpus=linuxMaterials.map(m=>m.text).join('\n');
 const hit=regex=>linuxMaterials.find(m=>regex.test(m.text));
 const assign=(id,re,reason)=>{const evidence=hit(re);if(evidence)add(id,reason,evidence.source===r.task_path+'#/instruction'?instruction:evidence.text,evidence.source);};
 const project=/\b(?:project|codebase|repository|test_suite|pytest|unit tests?|script|function|patch|source code|program|Python)\b|代码|脚本|编程|项目|测试套件/i.test(instruction);
 const codeAction=project&&/fix|repair|implement|edit|update|correct|run|pass|write|create|debug|修改|修复|编写|实现|运行|通过/i.test(instruction);
 if(codeAction)add('app:vscode','代码/项目修改或程序运行归入已有 VS Code；项目测试夹具和运行日志不因此额外算 Office/文本编辑器。');
 if(linux.length){
  if(!codeAction||/spreadsheet|workbook|worksheet|单元格|工作表|表格|\.xlsx\b|\.ods\b/i.test(instruction))
   assign('app:libreoffice-calc',/\.(?:csv|tsv|xlsx?|ods)\b|\b(?:CSVs?|spreadsheet|workbook|worksheet|Calc)\b|工作表|电子表格/i,'需要读取、处理或写入表格内容，按用户新口径归入 LibreOffice Calc。');
  assign('app:libreoffice-writer',/\.(?:docx?|odt)\b|\b(?:ODT|DOCX)\b|\bWriter\s+(?:report|document|template)|\bword[- ]processing\b/i,'文字文档的阅读、修改或交付归入 LibreOffice Writer。');
  assign('app:libreoffice-impress',/\.(?:pptx?|odp)\b|\b(?:slides?|presentation|Impress)\b|幻灯片|演示文稿/i,'演示文稿内容处理归入 LibreOffice Impress。');
  if(!codeAction)assign('app:vscode',/\.(?:json|jsonl|ya?ml|toml|conf|ini|py|js|ts|xml|svg|md)\b|\b(?:JSON|Markdown|README|source code|configuration file)\b/i,'结构化数据、配置或 Markdown 的阅读/编辑归入已有 VS Code。');
  if(!codeAction)assign('app:gedit',/\.txt\b/i,'普通文本的阅读/编辑归入已有 gedit；不把纯文本假称为 Office 原生文档。');
  // A PDF exported from an Office document does not require a second PDF application.
  const pdfSource=material.find(m=>/\.pdf\b/i.test(m.text)&&m.source!==r.task_path+'#/instruction'&&(!m.device_id||linux.includes(m.device_id)));
  const genericPdfSource=/\bPDFs?\b/i.test(instruction)&&p.resources.some(m=>linux.includes(m.device_id)&&/\.pdf$/i.test(m.deployed_path));
  if(pdfSource||genericPdfSource||(/\.pdf\b/i.test(instruction)&&!/export|save.*\.pdf|导出|另存/i.test(instruction)))
   add('app:evince','阅读 PDF 来源文档归入已有 Evince / Document Viewer；仅导出 PDF 不单独增加该应用。',pdfSource?.text||instruction,pdfSource?.source);
  const linuxImage=material.some(m=>m.device_id&&linux.includes(m.device_id)&&/\.(?:png|jpe?g|webp|xcf)\b/i.test(m.text));
  const imageOutput=/\b(?:create|make|render|resize|crop|draw|design|save|export)\b[\s\S]{0,250}(?:\.(?:png|jpg|jpeg)\b|\b(?:PNGs?|poster|images?|contact sheet|labeled)\b)|生成.*(?:png|图片)|图片查看器/i.test(linuxInstruction);
  if((!android.length||linuxImage||imageOutput)&&/\.(?:png|jpe?g|webp|xcf)\b|\b(?:PNGs?|JPGs?|GIMP|photos?|images?|contact sheet|labelled|labeled|banner|badge)\b|图片查看器|图像|图片/i.test(corpus)&&
    !(/copy.*(?:original bytes|unchanged)|preserv.*(?:original bytes|bytes|original files)/i.test(instruction)&&!/read|inspect|view|label|resize|crop|render|draw|create.*(?:png|image)|查看|读取|制作|绘制/i.test(instruction)))
   assign('app:gimp',/\.(?:png|jpe?g|webp|xcf)\b|\b(?:PNGs?|JPGs?|GIMP|images?|photos?|contact sheet|banner|badge)\b|图片查看器|图像|图片/i,'Linux 图像阅读、处理或制作，按已有图像应用 GIMP 作功能归属，不声明它是唯一允许的查看器。');
  if(/\.zip\b|\b(?:unpack|zip archive|ZIP|archive file)\b|解压|压缩|打包/i.test(instruction))
   assign('app:file-roller',/\.zip\b|\b(?:archive|unpack|package|bundle)\b|解压|压缩|打包/i,'归档包内容检查、解压或组装归入已有 Archive Manager / File Roller。');
  const htmlSource=material.some(m=>m.device_id&&linux.includes(m.device_id)&&/\.html\b/i.test(m.text));
  const htmlInteraction=/\b(?:browser|webpage|web page|form|dashboard)\b|file:\/\/|浏览器|网页|表单/i.test(instruction)||htmlSource;
  if(htmlInteraction&&!/exported browser|browser export/i.test(instruction))
   add('app:chrome','要求浏览、读取网页或提交表单，按已有 Chrome 归类；静态生成 HTML 本身不等于浏览器交互。');
  if(/(?:save|write|create|generate|publish|export)\b[^.\n]{0,100}(?:HTML|\.html)|(?:生成|保存).*html/i.test(instruction)&&!htmlInteraction)
   add('app:vscode','HTML 源文件生成/编辑归入已有 VS Code，不把生成文件误算成浏览器操作。');
  if((/\b(?:listen|play|playing|VLC)\b|听取|收听|播放/i.test(instruction))&&/\b(?:audio|video|media|recording|clip|playback|VLC)\b|音频|视频|录音/i.test(instruction)&&!/not need to play|do not play|不用播放|不需.*播放/i.test(instruction))
   add('app:vlc','Linux 音频/视频的播放或收听归入已有 VLC。');
  if(/\.eml\b|\bThunderbird\b|\b(?:email|e-mail) draft\b|\b(?:send|read|reply|compose)\s+(?:the |an? )?(?:email|mail|e-mail)\b/i.test(instruction))
   add('app:thunderbird','Linux 邮件阅读或草稿处理归入已有 Thunderbird。');
  if(!result.attributed_app_ids.length&&/copy|move|rename|directory|folder|command|terminal|shell|复制|移动|目录|命令/i.test(instruction))
   add('app:gnome-terminal','纯 Linux 文件/目录或命令操作归入已有 GNOME Terminal 的文件操作功能，不误归 Android Files。');
 }
 if(android.length){
  const androidSource=p.resources.some(x=>android.includes(x.device_id));
  if((androidSource&&/Downloads|shared folder|Android.*(?:files?|manifest|folder)|phone.*(?:files?|manifest|folder)|download|\.csv\b|\.json\b|\.zip\b|文件|共享目录/i.test(instruction))||/\/sdcard\/|\/storage\/emulated\/0\/|\bAndroid Downloads?\b|\bDownloads?\b[^.]{0,70}\b(?:Android|phone)\b/i.test(instruction))
   add('app:android-files','指令要求访问 Android 上的文件或 Downloads，按已有 Android Files 的文件访问流程归类。');
  if(/\bGallery\b|\balbum\b|相册/i.test(instruction))add('app:simple-gallery','Android 相册信息访问归入已有 Simple Gallery Pro。');
  if(/\bMarkor\b/i.test(instruction))add('app:markor','指令中的笔记操作归入已有 Markor。');
  if(/\b(?:record|create|save|add|update|complete)\b[^.]{0,100}\btask\b|待办/i.test(instruction)&&p.metadata.surfaces?.some(x=>/tasks?|task/.test(x)))
   add('app:tasks-org','指令要求创建或更新待办记录，归入已有 Tasks.org。');
 }
 if(manual[r.task_id]){
  const m=manual[r.task_id];
  if(m.replace){result.added_applications=[];result.attributed_app_ids=[...result.evidence_confirmed_app_ids];}
  for(const id of m.remove||[]){result.added_applications=result.added_applications.filter(a=>a.canonical_id!==id);result.attributed_app_ids=result.attributed_app_ids.filter(a=>a!==id||result.evidence_confirmed_app_ids.includes(id));}
  for(const id of m.add||[])add(id,m.reason,instruction,undefined,'reviewed_operation_attribution');
  result.review_note=m.reason;
 }
 result.attributed_app_ids.sort();
 return result;
}

const rows=original.map(attribute);
if(process.argv.includes('--preview')){
 const preview=JSON.stringify({targets:rows.filter(r=>r.attribution_reviewed).length,
  without_apps:rows.filter(r=>r.attribution_reviewed&&!r.attributed_app_ids.length),
  attribution:rows.filter(r=>r.attribution_reviewed).map(r=>({id:r.task_id,apps:r.attributed_app_ids,instruction:r.input_instruction}))},null,2);
 await new Promise(resolve=>process.stdout.write(preview,resolve));
 process.exit(0);
}
fs.mkdirSync(OUT,{recursive:true});
const save=(name,v)=>fs.writeFileSync(path.join(OUT,name),JSON.stringify(v,null,2)+'\n');
assert.equal(new Set(rows.map(r=>r.task_id)).size,5897);
for(const r of rows){assert.equal(new Set(r.attributed_app_ids).size,r.attributed_app_ids.length);assert(r.evidence_confirmed_app_ids.every(a=>r.attributed_app_ids.includes(a)));}
const sets=['candidate_all_provisional','proposed_release_conditional'];
const summaries={},coverage=[];
const counts=(rr,field)=>{const out={};for(const r of rr){const k=r[field].length;out[k]=(out[k]||0)+1;}return out;};
for(const scope of sets){
 const rr=rows.filter(r=>r.scopes.includes(scope));
 const n=rr.length,oldPairs=rr.reduce((s,r)=>s+r.evidence_confirmed_app_ids.length,0),pairs=rr.reduce((s,r)=>s+r.attributed_app_ids.length,0);
 summaries[scope]={task_count:n,original_app_covered_tasks:rr.filter(r=>r.evidence_confirmed_app_ids.length).length,
  attributed_app_covered_tasks:rr.filter(r=>r.attributed_app_ids.length).length,without_app_tasks:rr.filter(r=>!r.attributed_app_ids.length).length,
  original_task_app_pairs:oldPairs,attributed_task_app_pairs:pairs,added_task_app_pairs:pairs-oldPairs,
  original_app_count_distribution:counts(rr,'evidence_confirmed_app_ids'),attributed_app_count_distribution:counts(rr,'attributed_app_ids'),
  pure_home_tasks:rr.filter(r=>r.original_no_app_reason==='only_IoT_interface').length,
  remaining_non_home_without_apps:rr.filter(r=>!r.attributed_app_ids.length&&r.original_no_app_reason!=='only_IoT_interface').map(r=>r.task_id),
  inferred_task_ids:rr.filter(r=>r.added_applications.length).map(r=>r.task_id)};
 for(const app of entities){
  const matched=rr.filter(r=>r.attributed_app_ids.includes(app.canonical_id)),old=rr.filter(r=>r.evidence_confirmed_app_ids.includes(app.canonical_id));
  coverage.push({scope,canonical_id:app.canonical_id,application:app.display_name,platform:app.platform,
   previous_evidence_confirmed_tasks:old.length,added_attributed_tasks:matched.length-old.length,
   attributed_task_count:matched.length,denominator:n,attributed_percentage:Number((100*matched.length/n).toFixed(6)),
   task_ids:JSON.stringify(matched.map(r=>r.task_id)),metric:'task_application_attribution_not_observed_usage',
   counting_rule:'unique task-app pair; multi-label; percentages may sum above 100'});
 }
 assert.equal(Object.values(summaries[scope].attributed_app_count_distribution).reduce((s,n)=>s+n,0),n);
}
const csvChecks=[];
async function csv(name,data){
 const h=Object.keys(data[0]),matrix=[h,...data.map(r=>h.map(k=>r[k]??''))];
 const wb=Workbook.create(),sh=wb.worksheets.add('Data'),range=sh.getRangeByIndexes(0,0,matrix.length,h.length);
 range.values=matrix;wb.recalculate();assert.deepEqual(range.values,matrix);
 const content=range.values.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
 fs.writeFileSync(path.join(OUT,name),content);
 const back=await Workbook.fromCSV(fs.readFileSync(path.join(OUT,name),'utf8'),{sheetName:'Data'});
 assert.deepEqual(back.worksheets.getItemAt(0).getUsedRange().values.map(r=>r.map(v=>String(v??''))),matrix.map(r=>r.map(v=>String(v??''))));
 csvChecks.push({file:name,rows:data.length,values_roundtrip_match:true});
}
fs.writeFileSync(path.join(OUT,'task_application_attribution.jsonl'),rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
await csv('application_coverage.csv',coverage);
await csv('task_application_mapping.csv',rows.map(r=>({task_id:r.task_id,task_path:r.task_path,scopes:JSON.stringify(r.scopes),
 previous_apps:JSON.stringify(r.evidence_confirmed_app_ids.map(id=>apps.get(id).display_name)),
 added_attributed_apps:JSON.stringify(r.added_applications.map(a=>a.normalized_name)),
 all_attributed_apps:JSON.stringify(r.attributed_app_ids.map(id=>apps.get(id).display_name)),
 app_count:r.attributed_app_ids.length,attribution_reviewed:r.attribution_reviewed,
 reason:r.added_applications.map(a=>a.reason).join(' '),
 evidence_reference:'task_application_attribution.jsonl#'+r.task_id})));
save('summary.json',{policy:'user_authorized_operation_attribution.v2',created_at:new Date().toISOString(),
 original_report:'../README.md',source_annotations:'../task_application_annotations.jsonl',
 original_entities:entities.length,new_entities_added:0,identity_attributions:identityIds,
 task_specific_decisions:manual,
 attribution_target_count:rows.filter(r=>r.attribution_reviewed).length,scopes:summaries,csv_checks:csvChecks,
 task_set_modified:false,original_evidence_annotations_modified:false,models_or_devices_run:false});
const s=summaries[sets[0]],c=summaries[sets[1]],table=(h,rr)=>['| '+h.join(' | ')+' |','| '+h.map(()=>'---').join(' | ')+' |',...rr.map(r=>'| '+r.join(' | ')+' |')].join('\n');
const ordered=coverage.filter(r=>r.scope===sets[0]).sort((a,b)=>b.attributed_task_count-a.attributed_task_count);
const labels=Object.keys(s.attributed_app_count_distribution).map(Number).sort((a,b)=>a-b);
fs.writeFileSync(path.join(OUT,'README.md'),[
 '# DevicesWorld 应用归属统计（操作归类口径 v2）','',
 '按用户确认的新口径，将原有 6 条身份待定任务和 1,388 条未限定具体软件的非纯 Home 任务归入已有应用项。一个任务可对应多个应用，同一任务多次或跨设备使用同一应用仅计一次。保留原证据口径，不修改任务文件、实验集合或历史结果。','',
 '这是一层应用归属统计，不是“任务只能使用该软件”或“模型实际使用了该软件”的运行结论。此前已经有明确应用的其他任务保留原关系，本轮不额外推定其中每一个文件的可选打开软件。','',
 '## 汇总','',
 table(['范围','任务数','旧口径有已确认应用','新口径有应用归属','无应用','任务—应用关系'],sets.map(k=>{const t=summaries[k];return[k,t.task_count,t.original_app_covered_tasks,t.attributed_app_covered_tasks,t.without_app_tasks,t.attributed_task_app_pairs];})),
 '',`沿用 ${entities.length} 个应用分类，不新增应用。候选任务总数仍为 ${s.task_count}；${c.task_count} 仅是既有三条排除建议生效后的条件性范围，未宣称最终发布规模已确定。`,
 '',`旧口径有 4,223 条 complete 且有应用，另有 2 条 partial 已确认部分应用，故旧覆盖总数为 ${s.original_app_covered_tasks}。其余 4 条 partial 加上 1,388 条非纯 Home 无应用任务是新增覆盖对象。`,
 '',`新增 ${s.added_task_app_pairs} 个任务—应用关系。${s.pure_home_tasks} 条纯 Home 任务继续只作为 IoT，不强行归入 app。`,
 '', '## 多标签分布','',table(['每任务应用数','旧证据口径任务数','新归属口径任务数'],labels.map(k=>[k,s.original_app_count_distribution[k]||0,s.attributed_app_count_distribution[k]||0])),
 '',`各应用覆盖率均以本范围全部任务为分母，主范围百分比之和为 ${(100*s.attributed_task_app_pairs/s.task_count).toFixed(2)}%，不归一化为100%。`,
 '', '## 完整应用表','',table(['应用','旧确认任务数','本轮新增归属','新任务数','覆盖率'],ordered.map(a=>[a.application,a.previous_evidence_confirmed_tasks,a.added_attributed_tasks,a.attributed_task_count,a.attributed_percentage.toFixed(2)+'%'])),
 '', '## 归类规则与边界','',
 '- 代码/项目修改归 VS Code。JSON、配置、Markdown 等结构化或技术文本归 VS Code；普通 TXT 阅读/编辑归 gedit。程序自身的测试夹具、日志不自动额外计 Calc 或 gedit。',
 '- 表格内容处理归 LibreOffice Calc；Word/ODT 内容处理归 LibreOffice Writer；演示文稿归 LibreOffice Impress。PDF 来源阅读归 Evince，单纯从 Office 导出 PDF 不额外计 PDF 阅读器。',
 '- Linux 图像阅读/编辑按已有 GIMP 归属。浏览网页/提交表单归 Chrome；仅生成 HTML 或读取浏览器导出文件，不自动算浏览器。归档内容操作归 File Roller。',
 '- Android 文件访问归 Android Files。它不是 Linux 文件管理器，不把平台混淆。纯 Linux 文件/命令操作可按已有 GNOME Terminal 的功能归属。',
 '- 五条 Gallery 按用户确认归 Simple Gallery Pro；android_smarthome_1013 的 Contacts 归已有 Google Contacts 统计项。这是用户授权身份归属，不冒称已通过运行核实具体包名。该任务原有 Calendar 关系保留。',
 '- 指令指名的对象/操作与直接关联来源支持本轮规则；未引用的 setup 文件、安装列表和 evaluator 关键词不直接增加应用。补归类是静态规则及具体任务复核，不是重新逐条执行验证。',
 '', '## 六条原待定任务','',table(['任务','归属后应用'],identityIds.map(id=>{const r=rows.find(r=>r.task_id===id);return[id,r.attributed_app_ids.map(a=>apps.get(a).display_name).join('、')];})),
 '', '## 文件','',
 '- application_coverage.csv：全部 28 个应用在两种范围下的旧计数、新增归属、新计数、覆盖率及完整 task IDs。',
 '- task_application_mapping.csv：全部 5,897 条任务的旧应用、补充应用、合并应用列表和原因。',
 '- task_application_attribution.jsonl：逐任务保存归属依据、证据和原标注引用，未覆盖旧证据文件。',
 '- summary.json：两范围及多标签分布。复现：使用原分析环境的 Node 运行上一级 attribute_operations.mjs。',
 '', '设备、网站/HTML 与任务范围统计均沿用原结果，未修改。CSV 使用 Spreadsheets 技能的 artifact-tool 生成并回读核对。未自动提交或上传。',
 ...(s.remaining_non_home_without_apps.length?['', '## 仍无可支持归属的非纯 Home 任务','',s.remaining_non_home_without_apps.join('、')]:[]),
 ].join('\n')+'\n');
console.log(JSON.stringify({scopes:Object.fromEntries(Object.entries(summaries).map(([k,v])=>[k,{...v,inferred_task_ids:undefined}])),csv_checks:csvChecks},null,2));
