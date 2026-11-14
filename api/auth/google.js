import { OAuth2Client } from 'google-auth-library';
import { json,cookie,createId,saveSession,sessionCookieName,csrfCookieName,ensureCsrf,setSecurityHeaders,SESSION_TTL_SECONDS } from './_shared.js';
const client=new OAuth2Client();
export default async function handler(req,res){
 setSecurityHeaders(res);
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'MÉTODO_NÃO_PERMITIDO',message:'Método não permitido.'})}
 if(!ensureCsrf(req))return json(res,403,{error:'CSRF_INVALIDO',message:'Não foi possível validar a origem da solicitação. Atualize a página.'});
 const clientId=process.env.GOOGLE_CLIENT_ID;
 if(!clientId||!process.env.SESSION_SECRET||Buffer.byteLength(process.env.SESSION_SECRET)<32||!process.env.KV_REST_API_URL||!process.env.KV_REST_API_TOKEN)return json(res,503,{error:'CONFIGURACAO_INCOMPLETA',message:'A autenticação ainda não está configurada no servidor. Verifique as variáveis e o armazenamento de sessão.'});
 const credential=req.body?.credential;
 if(typeof credential!=='string'||credential.length<100||credential.length>10000)return json(res,400,{error:'PAYLOAD_INVALIDO',message:'Credencial de autenticação inválida.'});
 try{
  const ticket=await client.verifyIdToken({idToken:credential,audience:clientId});const p=ticket.getPayload();
  if(!p||(p.iss!=='https://accounts.google.com'&&p.iss!=='accounts.google.com')||!p.sub||p.aud!==clientId||!p.exp||p.exp*1000<=Date.now())return json(res,401,{error:'TOKEN_INVALIDO',message:'O token é inválido, expirou ou não foi emitido para esta aplicação.'});
  const user={sub:p.sub,name:p.name||null,email:p.email||null,picture:p.picture||null,emailVerified:p.email_verified===true,provider:'Google',authenticatedAt:new Date().toISOString()};
  const sid=createId();await saveSession(sid,user);
  res.setHeader('Set-Cookie',[cookie(sessionCookieName,sid,{httpOnly:true,maxAge:SESSION_TTL_SECONDS}),cookie(csrfCookieName,createId(),{maxAge:SESSION_TTL_SECONDS})]);
  return json(res,200,{authenticated:true,user});
 }catch{return json(res,401,{error:'TOKEN_REJEITADO',message:'Não foi possível validar sua identidade com o Google. Faça login novamente.'})}
}
