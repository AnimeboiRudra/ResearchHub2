const {auth,gem}=require("../lib/util");
const T=(u,ms=6000)=>{const c=new AbortController();setTimeout(()=>c.abort(),ms);return fetch(u,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 ResearchHub"},signal:c.signal})};
// Real evidence: link status, domain type, Crossref match
async function evid(s){const e={};const doi=((s.url||"")+" "+s.text).match(/10\.\d{4,9}\/[^\s"<>]+/);
 if(s.url){try{const r=await T(s.url);e.http=r.status;const h=new URL(s.url).hostname;
  e.domain=/\.(gov|edu)$|\.(ac|edu|gov)\.[a-z]{2}$/.test(h)?"gov/edu":/nature\.com|science\.org|springer|elsevier|wiley|sciencedirect|nih\.gov|doi\.org|who\.int|un\.org|ipcc|oup\.com/.test(h)?"journal/institution":"other"}catch(x){e.http="unreachable"}}
 try{const u=doi?`https://api.crossref.org/works/${encodeURIComponent(doi[0].replace(/[.,;)]+$/,""))}`:`https://api.crossref.org/works?rows=1&query.bibliographic=${encodeURIComponent(s.text.slice(0,200))}`;
  const r=await T(u);if(r.ok){const j=await r.json();const w=doi?j.message:(j.message.items||[])[0];
   if(w)e.crossref={title:(w.title||[])[0],doi:w.DOI,year:w.issued&&w.issued["date-parts"]&&w.issued["date-parts"][0][0],exactDOI:!!doi}}}catch(x){}
 return e}
module.exports=async(req,res)=>{
 if(req.method!=="POST")return res.status(405).end();
 const me=await auth(req);if(!me)return res.status(401).json({error:"Not a team member"});
 const {action:a,...d}=req.body||{};
 try{
  if(a==="check"){const ev=await Promise.all(d.sources.map(evid));
   const g=await gem(`You are a strict research fact-checker. Idea: "${d.title}". Each source has automated evidence (link HTTP status, domain type, Crossref match). Grade "Strong" (verified, reputable), "Medium", "Weak" (blog, unverifiable, Crossref title mismatch) or "Unverified" (no evidence). Base grades only on the evidence given. Reply JSON array of {"grade":"","reason":"max 20 words"} in order.\n`+d.sources.map((s,i)=>`${i+1}. ${s.text} ${s.url||""}\nEvidence: ${JSON.stringify(ev[i])}`).join("\n"));
   return res.json({results:ev.map((e,i)=>({grade:(g[i]||{}).grade||"Unverified",reason:(g[i]||{}).reason||"",evidence:e}))})}
  if(a==="score"){const i=d.idea;
   return res.json(await gem(`Act as a strict judge of the Oxford Saïd Global Climate Tech Challenge. Score the idea 0-10 on: ${d.criteria.join(", ")} (Cost: 10 = cheap to implement). Title: ${i.title}\nTheme: ${i.theme}\nResearch: ${i.summary}\nNeglect: ${i.neglect}\nSources: ${i.sources.map(s=>(s.grade||"unchecked")+": "+s.text).join("; ")}\nReply JSON {"scores":{"Impact":0},"why":{"Impact":"max 15 words"},"risk":"weakest point, max 25 words"} using every criterion name exactly.`))}
  if(a==="gaps")return res.json(await gem(`Team ideas for the Oxford Saïd Global Climate Tech Challenge:\n${d.ideas}\n\nPast finalists:\n${d.past}\n\nReply JSON {"gaps":["themes/problems/evidence the team has not researched yet, max 6"],"overlaps":["pairs of team ideas that overlap and why"],"similar_to_past":["team idea vs past finalist similarity and how to differentiate"]}`));
  if(a==="brief")return res.json(await gem(`Read this research for the idea "${d.title}" (Oxford Saïd Global Climate Tech Challenge). Reply JSON {"tldr":"2 plain sentences","claims":["key claims, max 6"],"missing":["what is weak, unsupported or missing, max 4"],"next":["concrete next steps, max 4"]}. Use only the text below.\n\n${d.research}`));
  if(a==="chat")return res.json(await gem(`Answer using ONLY the team research below. Cite idea titles and source names. If the answer isn't there, say so.\n\n${d.context}\n\nQuestion: ${d.question}\nReply JSON {"answer":"","cited":["idea titles"]}`));
  res.status(400).json({error:"unknown action"})
 }catch(e){res.status(500).json({error:e.message})}};
