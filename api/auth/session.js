import { json, parseCookies, sessionCookieName, csrfCookieName, cookie, createId, getSession, setSecurityHeaders } from './_shared.js';
export default async function handler(req, res) {
 setSecurityHeaders(res);
 if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return json(res, 405, { error: 'MÉTODO_NÃO_PERMITIDO', message: 'Método não permitido.' }); }
 const cookies = parseCookies(req);
 if (!cookies[csrfCookieName]) res.setHeader('Set-Cookie', cookie(csrfCookieName, createId(), { maxAge: 28800 }));
 if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return json(res, 200, { authenticated: false, sessionStoreConfigured: false });
 try { const user = await getSession(cookies[sessionCookieName]); return json(res, 200, { authenticated: !!user, user: user || null, sessionStoreConfigured: true }); }
 catch { return json(res, 503, { error: 'SESSAO_INDISPONIVEL', message: 'Não foi possível consultar a sessão.' }); }
}
