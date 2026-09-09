import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {Workbook} from '@oai/artifact-tool';
const out=path.dirname(fileURLToPath(import.meta.url));
const sourceRows=fs.readFileSync(path.join(out,'task_inventory.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const seenIds=new Set(sourceRows.map(r=>r.task_id)),checks=[];
for(const name of ['device_distribution.csv','application_coverage.csv','website_coverage.csv','iot_coverage.csv','characteristic_distribution.csv','characteristic_cooccurrence.csv','review_queue.csv']){
 const text=fs.readFileSync(path.join(out,name),'utf8'),wb=await Workbook.fromCSV(text,{sheetName:'Data'}),matrix=wb.worksheets.getItemAt(0).getUsedRange().values;
 const headers=matrix[0],rows=matrix.slice(1).map(values=>Object.fromEntries(headers.map((k,i)=>[k,values[i]])));
 for(const r of rows){
  if(r.task_ids){const ids=JSON.parse(r.task_ids);assert.equal(ids.length,new Set(ids).size);assert(ids.every(id=>seenIds.has(id)));assert.equal(ids.length,Number(r.count));}
  if(r.rule_supported_named_task_ids){const ids=JSON.parse(r.rule_supported_named_task_ids);assert.equal(ids.length,new Set(ids).size);assert(ids.every(id=>seenIds.has(id)));assert.equal(ids.length,Number(r.rule_supported_named_reference_count));}
  if(r.positive_task_ids){const ids=JSON.parse(r.positive_task_ids);assert.equal(ids.length,Number(r.confirmed_positive));}
  if(r.count!==undefined&&r.percentage!=='')assert(Math.abs(Number(r.percentage)-100*Number(r.count)/Number(r.denominator))<0.000001);
 }
 checks.push({file:name,parsed_rows:rows.length,task_ids_not_truncated:true,percentages_reconciled:name!=='review_queue.csv'});
}
fs.writeFileSync(path.join(out,'csv_validation.json'),JSON.stringify({checked_at:new Date().toISOString(),checks},null,2)+'\n');
console.log(JSON.stringify(checks));
