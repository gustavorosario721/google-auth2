const API = '/api/auth';
async function request(path, options = {}) {
 const response = await fetch(`${API}/${path}`, { credentials: 'same-origin', ...options, headers: { ...(options.headers || {}), ...(options.body ? { 'Content-Type': 'application/json' } : {}) } });
 let data = {}; try { data = await response.json(); } catch { /* resposta sem JSON */ }
 if (!response.ok) { const error = new Error(data.message || 'Não foi possível concluir a solicitação.'); error.status = response.status; error.code = data.error; throw error; }
 return data;
}
export async function getSession() { return request('session'); }
export async function authenticate(credential) { const csrf = readCookie('gal_csrf') || readCookie('__Host-gal_csrf'); return request('google', { method: 'POST', headers: { 'X-CSRF-Token': csrf || '' }, body: JSON.stringify({ credential }) }); }
export async function logout() { const csrf = readCookie('gal_csrf') || readCookie('__Host-gal_csrf'); return request('logout', { method: 'POST', headers: { 'X-CSRF-Token': csrf || '' }, body: '{}' }); }
function readCookie(name) { return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=').slice(1).join('=') || ''; }
