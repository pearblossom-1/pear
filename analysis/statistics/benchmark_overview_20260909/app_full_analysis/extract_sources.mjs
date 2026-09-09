import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const OUT=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(OUT,'../../..');
const rows=fs.readFileSync(path.join(OUT,'evidence_packs.jsonl'),'utf8').trim().split('\n').map(JSON.parse),cache=new Map();
const xmlText=s=>s.replace(/<\/(?:w:p|text:p|text:h|row|si)>/g,'\n').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');
for(const t of rows)for(const r of t.resources){if(!r.exists||r.text!==null||cache.has(r.source_path))continue;const p=path.join(ROOT,r.source_path),ext=path.extname(p);let texts=[],method=null,error=null;
 try{
  if(ext==='.pdf'){texts=[execFileSync('/opt/homebrew/bin/pdftotext',['-layout',p,'-'],{encoding:'utf8',maxBuffer:8e6,stdio:['ignore','pipe','pipe']})];method='pdftotext_read_only';}
  else if(['.docx','.odt','.xlsx','.ods','.odp','.pptx','.zip'].includes(ext)){
   const names=execFileSync('/usr/bin/unzip',['-Z1',p],{encoding:'utf8',maxBuffer:8e6,stdio:['ignore','pipe','pipe']}).split('\n');
   const selected=names.filter(n=>ext==='.zip'?/\.(md|txt|csv|json|html|htm|yaml|yml|ics|vcf)$/i.test(n)&&!/(?:^|\/)(?:node_modules|__MACOSX)\//.test(n):/^(?:word\/document\.xml|content\.xml|xl\/(?:sharedStrings|worksheets\/sheet\d+)\.xml|ppt\/slides\/slide\d+\.xml)$/.test(n));
   texts=selected.map(n=>{const s=execFileSync('/usr/bin/unzip',['-p',p,n],{encoding:'utf8',maxBuffer:8e6,stdio:['ignore','pipe','pipe']});return 'MEMBER: '+n+'\n'+(n.endsWith('.xml')?xmlText(s):s);});method='unzip_member_text_read_only';
  }
 }catch(e){error=String(e.message).slice(0,350);}
 if(method||error)cache.set(r.source_path,{source_path:r.source_path,text:texts.join('\n'),method,error});
}
fs.writeFileSync(path.join(OUT,'extracted_source_text.jsonl'),[...cache.values()].map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({decoded:cache.size,errors:[...cache.values()].filter(x=>x.error).map(x=>({source:x.source_path,error:x.error})),empty:[...cache.values()].filter(x=>!x.text&&!x.error).length}));
