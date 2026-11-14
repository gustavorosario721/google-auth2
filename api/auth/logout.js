import { json, parseCookies, sessionCookieName, csrfCookieName, clearCookie, cookie, createId, ensureCsrf, deleteSession, setSecurityHeaders, SESSION_TTL_SECONDS } from './_shared.js';

export default async function handler(req, res) {
 setSecurityHeaders(res);
 if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'MÉTODO_NÃO_PERMITIDO', message: 'Método não permitido.' }); }
 if (!ensureCsrf(req)) return json(res, 403, { error: 'CSRF_INVALIDO', message: 'Não foi possível validar a solicitação de saída.' });
 const cookies = parseCookies(req);
 try {
  await deleteSession(cookies[sessionCookieName]);
  // Clear the authenticated session but issue a fresh CSRF cookie for the next anonymous login.
  res.setHeader('Set-Cookie', [
   clearCookie(sessionCookieName),
   cookie(csrfCookieName, createId(), { maxAge: SESSION_TTL_SECONDS })
  ]);
  return json(res, 200, { success: true });
 }
 catch { return json(res, 503, { error: 'LOGOUT_INDISPONIVEL', message: 'Não foi possível invalidar a sessão no servidor. Tente novamente.' }); }
}
