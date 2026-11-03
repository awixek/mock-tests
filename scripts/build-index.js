// tests/<SECTION>/<test>.json scan karke tests-index.json banata hai
const fs=require('fs'),path=require('path'),root='tests';
const num=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
const sections=(fs.existsSync(root)?fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort(num):[]).map(name=>{
  const tests=fs.readdirSync(path.join(root,name)).filter(f=>f.endsWith('.json')).sort(num).map(f=>{
    try{const t=JSON.parse(fs.readFileSync(path.join(root,name,f),'utf8'));
      return {name:f.slice(0,-5),title:t.title||f.slice(0,-5),questions:(t.questions||[]).length,duration:t.duration||30}}
    catch(e){console.error('Bad JSON, skip:',name+'/'+f,e.message);return null}
  }).filter(Boolean);
  return {name,tests};
}).filter(s=>s.tests.length);
fs.writeFileSync('tests-index.json',JSON.stringify({sections},null,1));
console.log('tests-index.json ready:',sections.map(s=>s.name+' '+s.tests.length).join(', '));
