import {randomBytes,createHmac,timingSafeEqual} from 'node:crypto';
export const SESSION_TTL_SECONDS=28800;
const prod=process.env.NODE_ENV==='production';
export const sessionCookieName=prod?'__Host-gal_session':'gal_session';
export const csrfCookieName=prod?'__Host-gal_csrf':'gal_csrf';
export function json(res,status,payload){res.status(status).setHeader('Content-Type','application/json; charset=utf-8').end(JSON.stringify(payload))}
export function parseCookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return[decodeURIComponent(x.slice(0,i)),decodeURIComponent(x.slice(i+1))]}))}
export function cookie(name,value,o={}){const p=[name+'='+encodeURIComponent(value),'Path=/','SameSite=Lax'];if(o.httpOnly)p.push('HttpOnly');if(o.maxAge!==undefined)p.push('Max-Age='+o.maxAge);if(prod)p.push('Secure');return p.join('; ')}
export function clearCookie(name,httpOnly=true){return name+'=; Path=/; Max-Age=0; SameSite=Lax'+(httpOnly?'; HttpOnly':'')+(prod?'; Secure':'')}
export function ensureSameOrigin(req){const origin=req.headers.origin,host=req.headers.host;if(!origin||!host)return false;try{return new URL(origin).host===host}catch{return false}}
function equal(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
export function ensureCsrf(req){const c=parseCookies(req),v=req.headers['x-csrf-token'];return ensureSameOrigin(req)&&typeof v==='string'&&!!c[csrfCookieName]&&equal(v,c[csrfCookieName])}
export function createId(){return randomBytes(32).toString('base64url')}
function sign(v){const secret=process.env.SESSION_SECRET;if(!secret||Buffer.byteLength(secret)<32)throw new Error('SESSION_SECRET ausente ou fraco');return createHmac('sha256',secret).update(v).digest('base64url')}
function key(id){return 'gal:session:'+sign(id)}
async function redis(command){const url=process.env.KV_REST_API_URL,token=process.env.KV_REST_API_TOKEN;if(!url||!token)throw new Error('Armazenamento de sessão não configurado');const r=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(command)});if(!r.ok)throw new Error('Falha no armazenamento de sessão');const b=await r.json();if(b.error)throw new Error('Falha no armazenamento de sessão');return b.result}
export async function saveSession(id,user){await redis(['SET',key(id),JSON.stringify(user),'EX',String(SESSION_TTL_SECONDS)])}
export async function getSession(id){if(!id)return null;const raw=await redis(['GET',key(id)]);if(!raw)return null;try{return JSON.parse(raw)}catch{return null}}
export async function deleteSession(id){if(id)await redis(['DEL',key(id)])}
export function setSecurityHeaders(res){res.setHeader('Cache-Control','no-store, private');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY')}
