import { createClient } from "npm:@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "npm:jose@5";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

async function accessToken(serviceAccount: Record<string,string>) {
  const key = await importPKCS8(serviceAccount.private_key, "RS256");
  const now = Math.floor(Date.now()/1000);
  const assertion = await new SignJWT({ scope:"https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg:"RS256", typ:"JWT" })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now).setExpirationTime(now+3600).sign(key);
  const response = await fetch("https://oauth2.googleapis.com/token", { method:"POST", headers:{"content-type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion}) });
  if(!response.ok) throw new Error("FCM OAuth token request failed: "+await response.text());
  return (await response.json()).access_token as string;
}

Deno.serve(async (req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="POST") return new Response("Method not allowed",{status:405,headers:cors});
  try {
    const url=Deno.env.get("SUPABASE_URL")!;
    const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
    const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth=req.headers.get("Authorization")??"";
    const caller=createClient(url,anon,{global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await caller.auth.getUser();
    if(userError||!user) return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:{...cors,"content-type":"application/json"}});
    const {notification_id}=await req.json();
    if(typeof notification_id!=="string") return new Response(JSON.stringify({error:"notification_id is required"}),{status:400,headers:{...cors,"content-type":"application/json"}});
    const admin=createClient(url,service);
    const {data:actor}=await admin.from("users").select("id,role,status,employment_status,id_approval_status").eq("auth_user_id",user.id).maybeSingle();
    if(!actor||actor.status!=="active"||actor.employment_status!=="ACTIVE"||actor.id_approval_status!=="APPROVED") return new Response(JSON.stringify({error:"Inactive employee"}),{status:403,headers:{...cors,"content-type":"application/json"}});
    const {data:notice,error:noticeError}=await admin.from("notifications").select("id,user_id,title,body,type,data").eq("id",notification_id).single();
    if(noticeError||!notice) return new Response(JSON.stringify({error:"Notification not found"}),{status:404,headers:{...cors,"content-type":"application/json"}});
    if(notice.user_id!==actor.id&&actor.role!=="owner") return new Response(JSON.stringify({error:"Forbidden"}),{status:403,headers:{...cors,"content-type":"application/json"}});
    const {data:devices}=await admin.from("user_devices").select("fcm_token").eq("employee_id",notice.user_id).eq("is_active",true);
    if(!devices?.length) return new Response(JSON.stringify({sent:0,reason:"No registered devices"}),{headers:{...cors,"content-type":"application/json"}});
    const account=JSON.parse(Deno.env.get("FCM_SERVICE_ACCOUNT_JSON")??"{}");
    if(!account.project_id||!account.private_key||!account.client_email) throw new Error("FCM_SERVICE_ACCOUNT_JSON secret is not configured");
    const token=await accessToken(account);
    const results=await Promise.all(devices.map(async d=>{
      const response=await fetch("https://fcm.googleapis.com/v1/projects/"+account.project_id+"/messages:send",{method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:JSON.stringify({message:{token:d.fcm_token,notification:{title:notice.title,body:notice.body},data:{notification_id:notice.id,type:notice.type,...Object.fromEntries(Object.entries(notice.data??{}).map(([k,v])=>[k,String(v)]))}}})});
      return {ok:response.ok,status:response.status};
    }));
    const sent=results.filter(r=>r.ok).length;
    await admin.from("notifications").update({sent_push_at:sent?new Date().toISOString():null,push_error:sent===results.length?null:JSON.stringify(results.filter(r=>!r.ok))}).eq("id",notice.id);
    return new Response(JSON.stringify({sent,total:devices.length}),{headers:{...cors,"content-type":"application/json"}});
  } catch(error) {
    return new Response(JSON.stringify({error:error instanceof Error?error.message:"Unexpected error"}),{status:500,headers:{...cors,"content-type":"application/json"}});
  }
});
