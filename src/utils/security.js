export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
export function decodeJwtPart(part) { try { return JSON.parse(atob(part.replace(/-/g,'+').replace(/_/g,'/'))); } catch { return null; } }
export function initials(name = '') { return name.trim().split(/\s+/).slice(0,2).map(x=>x[0] || '').join('').toUpperCase() || 'U'; }
