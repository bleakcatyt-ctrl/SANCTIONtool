/* LAFF PROJECT API Client */
const API_BASE = '';

function getToken(){ return localStorage.getItem('laff_token'); }
function setToken(t){ localStorage.setItem('laff_token', t); }
function clearToken(){ localStorage.removeItem('laff_token'); localStorage.removeItem('laff_user'); }

function getUser(){ try { return JSON.parse(localStorage.getItem('laff_user')); } catch { return null; } }
function setUser(u){ localStorage.setItem('laff_user', JSON.stringify(u)); }

async function apiFetch(path, opts = {}){
  const headers = { 'Content-Type': 'application/json', ...(opts.headers||{}) };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...opts, headers });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

// Auth
async function login(login, password){
  const data = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ login, password }) });
  setToken(data.token); setUser(data.user);
  return data.user;
}
async function register(username, email, password, static_id){
  const data = await apiFetch('/api/register', { method: 'POST', body: JSON.stringify({ username, email, password, static_id }) });
  setToken(data.token); setUser(data.user);
  return data.user;
}
async function fetchMe(){
  try { const u = await apiFetch('/api/me'); setUser(u); return u; } catch { return null; }
}
function logout(){ clearToken(); location.reload(); }

// Forums
async function fetchForums(){ return apiFetch('/api/forums'); }
async function fetchThreads(forum_id, search){ 
  let q = '/api/threads';
  const params = new URLSearchParams();
  if (forum_id) params.set('forum_id', forum_id);
  if (search) params.set('search', search);
  if (params.toString()) q += '?' + params.toString();
  return apiFetch(q);
}
async function fetchThread(id){ return apiFetch('/api/threads/' + id); }
async function createThread(forum_id, title, content){ return apiFetch('/api/threads', { method: 'POST', body: JSON.stringify({ forum_id, title, content }) }); }
async function replyThread(thread_id, content){ return apiFetch(`/api/threads/${thread_id}/replies`, { method: 'POST', body: JSON.stringify({ content }) }); }
async function likeThread(id){ return apiFetch(`/api/threads/${id}/like`, { method: 'POST' }); }
async function likePost(id){ return apiFetch(`/api/posts/${id}/like`, { method: 'POST' }); }
async function fetchOnline(){ return apiFetch('/api/online'); }
async function fetchStats(){ return apiFetch('/api/stats'); }

// Admin
async function adminFetchUsers(){ return apiFetch('/api/admin/users'); }
async function adminBanUser(id){ return apiFetch(`/api/admin/users/${id}/ban`, { method: 'POST' }); }
async function adminUnbanUser(id){ return apiFetch(`/api/admin/users/${id}/unban`, { method: 'POST' }); }
async function adminSetRole(id, role){ return apiFetch(`/api/admin/users/${id}/role`, { method: 'POST', body: JSON.stringify({ role }) }); }
async function adminDeleteThread(id){ return apiFetch(`/api/admin/threads/${id}`, { method: 'DELETE' }); }
async function adminPinThread(id){ return apiFetch(`/api/admin/threads/${id}/pin`, { method: 'POST' }); }
async function adminLockThread(id){ return apiFetch(`/api/admin/threads/${id}/lock`, { method: 'POST' }); }
async function adminDeletePost(id){ return apiFetch(`/api/admin/posts/${id}`, { method: 'DELETE' }); }

window.LaffAPI = {
  getToken, setToken, getUser, setUser, logout,
  login, register, fetchMe,
  fetchForums, fetchThreads, fetchThread, createThread, replyThread, likeThread, likePost,
  fetchOnline, fetchStats,
  adminFetchUsers, adminBanUser, adminUnbanUser, adminSetRole, adminDeleteThread, adminPinThread, adminLockThread, adminDeletePost
};
