const SU=process.env.SUPABASE_URL,SK=process.env.SUPABASE_ANON_KEY;
// Valid token + email on the team_emails allowlist (RLS only shows a user their own row)
async function auth(req){const t=(req.headers.authorization||"").replace("Bearer ","");if(!t)return null;
 const r=await fetch(SU+"/rest/v1/team_emails?select=email,role",{headers:{apikey:SK,Authorization:"Bearer "+t}});
 if(!r.ok)return null;const a=await r.json();return a.length?a[0]:null}
async function gem(prompt){const m=process.env.GEMINI_MODEL||"gemini-2.5-flash";
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${process.env.GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json",temperature:0.2}})});
 const j=await r.json();if(!r.ok)throw new Error((j.error&&j.error.message)||"Gemini error");
 return JSON.parse(j.candidates[0].content.parts[0].text)}
module.exports={auth,gem};
