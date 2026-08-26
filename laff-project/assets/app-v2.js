/* LAFF PROJECT - Fullstack App v2 - Backend connected */

let CATEGORIES_CACHE = null;

async function loadCategories(){
  try {
    const cats = await LaffAPI.fetchForums();
    CATEGORIES_CACHE = cats;
    return cats;
  } catch(e){
    console.warn('API not available, using fallback', e);
    // fallback to old hardcoded if needed - will be loaded from forums.json via fetch if exists
    try {
      const res = await fetch('/forums.json');
      if (res.ok) {
        CATEGORIES_CACHE = await res.json();
        return CATEGORIES_CACHE;
      }
    } catch {}
    return [];
  }
}

function formatTime(dateStr){
  if (!dateStr) return 'Только что';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs/60000);
  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffMins < 1440) return `${Math.floor(diffMins/60)} ч назад`;
  return d.toLocaleDateString('ru-RU') + ' в ' + d.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'});
}

async function renderForumList(){
  const container = document.getElementById('forum-container');
  if (!container) return;
  
  const cats = CATEGORIES_CACHE || await loadCategories();
  if (!cats || cats.length===0){
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-dim)">Загрузка форумов...</div>';
    return;
  }

  container.innerHTML = cats.map(cat => `
    <div class="category">
      <div class="cat-header">
        <div class="cat-icon">${cat.icon}</div>
        <div>
          <div class="cat-title">${cat.title}</div>
          <div class="cat-desc">${cat.desc}</div>
        </div>
        <div class="cat-count">${cat.count}</div>
      </div>
      <div class="forum-list">
        ${cat.forums.map(f => `
          <a href="forum.html?f=${f.id}" class="forum-node">
            <div class="f-icon ${f.unread ? 'unread' : ''}">${f.icon}</div>
            <div class="f-main">
              <h3>${f.title} ${f.badge ? `<span class="badge">${f.badge}</span>` : ''} ${f.unread ? `<span class="badge-new">NEW</span>` : ''}</h3>
              <p>${f.desc}</p>
            </div>
            <div class="f-stats">
              <b>${f.threads || 0}</b><span>Тем</span>
              <div style="height:6px"></div>
              <b>${f.messages || 0}</b><span>Сообщений</span>
            </div>
            <div class="f-last">
              <img src="${f.last?.avatar || 'https://i.pravatar.cc/100?img=1'}" alt="">
              <div class="f-last-info">
                <a href="forum.html?f=${f.id}">${(f.last?.title || 'Нет тем').substring(0,32)}</a>
                <span>${f.last?.user || '—'} • ${formatTime(f.last?.time)}</span>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');
}

async function renderThreadList(){
  const params = new URLSearchParams(location.search);
  const forumId = params.get('f') || 'news';
  const titleEl = document.getElementById('forum-title');
  const descEl = document.getElementById('forum-desc');

  // find forum info
  const cats = CATEGORIES_CACHE || await loadCategories();
  const forum = cats.flatMap(c=>c.forums).find(x=>x.id===forumId);
  if (forum && titleEl){ titleEl.textContent = forum.title; descEl.textContent = forum.desc; }

  const list = document.getElementById('thread-list');
  if (!list) return;
  list.innerHTML = '<div style="padding:20px;color:var(--text-dim)">Загрузка тем...</div>';

  try {
    const threads = await LaffAPI.fetchThreads(forumId);
    if (threads.length===0){
      list.innerHTML = `<div class="thread-list-header"><span>Темы</span></div><div style="padding:40px;text-align:center;color:var(--text-dim)">В этом разделе пока нет тем. Будьте первым!</div>`;
      return;
    }
    list.innerHTML = `
      <div class="thread-list-header">
        <span>Тема</span>
        <span style="margin-left:auto; display:flex; gap:24px"><span>Ответы</span><span>Просмотры</span></span>
      </div>
      ${threads.map(t => `
        <a href="thread.html?id=${t.id}&f=${forumId}" class="thread-item ${t.pinned ? 'pinned':''}">
          <div class="t-avatar"><img src="${t.avatar}"></div>
          <div class="t-main">
            <h3>${t.pinned ? '<span class="pin">📌</span>' : ''}${t.title} ${t.likes ? `<span style="background:rgba(239,68,68,0.15);color:#ef4444;padding:2px 6px;border-radius:999px;font-size:10px">❤️ ${t.likes}</span>` : ''}</h3>
            <div class="t-meta">
              <span>${t.author}</span> • <span>${formatTime(t.created_at)}</span> • <span style="background:#1f2433;border:1px solid #2e3448;padding:2px 6px;border-radius:999px;font-size:10px">${t.role}</span>
              ${t.locked ? '<span style="color:var(--red)">🔒 Закрыто</span>' : ''}
            </div>
          </div>
          <div class="t-stats">
            <div style="display:flex; gap:18px; justify-content:flex-end">
              <div><b>${t.replies ?? 0}</b><div style="font-size:11px;color:var(--text-dim)">ответов</div></div>
              <div><b>${t.views ?? 0}</b><div style="font-size:11px;color:var(--text-dim)">просм.</div></div>
            </div>
          </div>
        </a>
      `).join('')}
    `;
  } catch(e){
    list.innerHTML = `<div style="padding:20px;color:#ef4444">Ошибка загрузки: ${e.message}</div>`;
  }
}

async function renderThread(){
  const container = document.getElementById('thread-view');
  if (!container) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;

  container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-dim)">Загрузка темы...</div>';

  try {
    const thread = await LaffAPI.fetchThread(id);
    const isAdmin = LaffAPI.getUser() && ['ОСНОВАТЕЛЬ','ГЛ. АДМИН','ТЕХ. АДМИН'].includes(LaffAPI.getUser().role);

    container.innerHTML = `
      <div class="thread-title-bar">
        <h1>${thread.pinned ? '📌 ' : ''}${thread.title}</h1>
        <div class="meta">
          <span>👤 ${thread.author}</span>
          <span>🕒 ${formatTime(thread.created_at)}</span>
          <span>👁️ ${thread.views} просмотров</span>
          <span>💬 ${thread.posts.length} ответов</span>
          ${thread.locked ? '<span style="color:#ef4444">🔒 Закрыто</span>' : ''}
        </div>
        ${isAdmin ? `<div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn btn-ghost" style="height:30px;font-size:12px" onclick="adminPin(${thread.id})">${thread.pinned ? 'Открепить' : 'Закрепить'}</button>
          <button class="btn btn-ghost" style="height:30px;font-size:12px" onclick="adminLock(${thread.id})">${thread.locked ? 'Открыть' : 'Закрыть'}</button>
          <button class="btn btn-ghost" style="height:30px;font-size:12px;color:#ef4444" onclick="adminDeleteThread(${thread.id})">Удалить тему</button>
        </div>` : ''}
      </div>
      
      <div class="post" id="post-main">
        <div class="post-user">
          <img src="${thread.avatar}">
          <h4>${thread.author}</h4>
          <div class="role ${thread.role.includes('ОСНОВАТЕЛЬ')||thread.role.includes('ГЛ.') ? 'admin' : thread.role.includes('ТЕХ') ? 'mod' : ''}">${thread.role}</div>
          <div class="post-stats">
            <div><b>${thread.author_messages || 0}</b><br>сообщений</div>
            <div><b>${thread.author_rep || 0}</b><br>репутация</div>
          </div>
        </div>
        <div class="post-content">
          <div style="white-space:pre-wrap; line-height:1.7">${escapeHtml(thread.content).replace(/\\n/g,'<br>')}</div>
          <div style="margin-top:16px; padding:12px; background:var(--bg-soft); border:1px solid var(--border); border-radius:10px; font-size:12px; color:var(--text-dim)">
            IP сервера: <code style="background:var(--bg);padding:2px 8px;border-radius:6px;border:1px solid var(--border)">play.laff-project.com</code> • LAFF PROJECT — копия Trace RP с улучшениями
          </div>
          <div class="post-actions">
            <button class="btn btn-ghost like-btn" style="height:32px" onclick="likeThread(${thread.id}, this)"><i class="fa-solid fa-heart"></i> Нравится (${thread.likes||0})</button>
            <button class="btn btn-ghost" style="height:32px" onclick="document.getElementById('replyEditor').scrollIntoView({behavior:'smooth'})"><i class="fa-solid fa-reply"></i> Ответить</button>
            <button class="btn btn-ghost" style="height:32px" onclick="navigator.clipboard.writeText(location.href); alert('Ссылка скопирована')"><i class="fa-solid fa-link"></i> Поделиться</button>
          </div>
        </div>
      </div>

      <div id="posts-list">
        ${thread.posts.map(p => `
          <div class="post" id="post-${p.id}">
            <div class="post-user">
              <img src="${p.avatar}">
              <h4>${p.author}</h4>
              <div class="role ${p.role.includes('ОСНОВАТЕЛЬ')||p.role.includes('ГЛ.') ? 'admin' : p.role.includes('ТЕХ') ? 'mod' : ''}">${p.role}</div>
              <div class="post-stats"><div><b>${p.author_messages||0}</b><br>сообщений</div><div><b>${p.author_rep||0}</b><br>репутация</div></div>
            </div>
            <div class="post-content">
              <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">${formatTime(p.created_at)}</div>
              <div style="white-space:pre-wrap">${escapeHtml(p.content)}</div>
              <div class="post-actions">
                <button class="btn btn-ghost like-btn" style="height:32px" onclick="likePost(${p.id}, this)"><i class="fa-solid fa-heart"></i> ${p.likes||0}</button>
                <button class="btn btn-ghost" style="height:32px" onclick="quotePost('${escapeHtml(p.author)}', \`${escapeHtml(p.content).substring(0,200)}\`)"><i class="fa-solid fa-quote-left"></i> Цитата</button>
                ${isAdmin ? `<button class="btn btn-ghost" style="height:32px;color:#ef4444" onclick="adminDeletePost(${p.id})">Удалить</button>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="padding:20px; background:var(--bg-soft); border-top:1px solid var(--border)">
        <h4 style="margin-bottom:12px">Ответить в тему</h4>
        <div id="replyEditor"></div>
        <div style="margin-top:12px; display:flex; gap:10px; justify-content:flex-end">
          <button class="btn btn-ghost" onclick="editor.clear()">Очистить</button>
          <button class="btn btn-primary" onclick="postReply(${thread.id})"><i class="fa-solid fa-paper-plane"></i> Отправить ответ</button>
        </div>
      </div>
    `;

    // init editor
    window.editor = new LaffEditor('replyEditor', { placeholder: 'Напишите ответ...' });

  } catch(e){
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#ef4444">Ошибка: ${e.message}<br><a href="index.html" style="color:var(--accent)">На главную</a></div>`;
  }
}

function escapeHtml(str){
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function renderOnline(){
  const el = document.getElementById('online-users');
  if (!el) return;
  try {
    const users = await LaffAPI.fetchOnline();
    el.innerHTML = users.map(u => `
      <div class="user-chip"><img src="${u.avatar}"><span style="color:${u.color}">${u.name}</span><span class="dot"></span></div>
    `).join('');
  } catch {
    // fallback
    el.innerHTML = '<div style="color:var(--text-dim);font-size:12px">Загрузка...</div>';
  }
}

async function renderStats(){
  try {
    const s = await LaffAPI.fetchStats();
    const elT = document.getElementById('stat-threads');
    const elM = document.getElementById('stat-messages');
    const elU = document.getElementById('stat-users');
    if (elT) elT.textContent = s.threads;
    if (elM) elM.textContent = s.messages;
    if (elU) elU.textContent = s.users;
  } catch {}
}

async function postReply(threadId){
  const content = window.editor ? window.editor.getText().trim() : '';
  if (!content) return alert('Введите сообщение');
  if (!LaffAPI.getUser()) return alert('Войдите чтобы ответить');
  try {
    await LaffAPI.replyThread(threadId, content);
    location.reload();
  } catch(e){ alert(e.message); }
}

async function likeThread(id, btn){
  if (!LaffAPI.getUser()) return alert('Войдите чтобы ставить лайки');
  try {
    const res = await LaffAPI.likeThread(id);
    btn.classList.toggle('liked', res.liked);
    // update count - reload for simplicity
    // location.reload();
    const match = btn.textContent.match(/\\d+/);
    let count = match ? parseInt(match[0]) : 0;
    btn.innerHTML = `<i class="fa-solid fa-heart"></i> Нравится (${res.liked ? count+1 : Math.max(0,count-1)})`;
  } catch(e){ alert(e.message); }
}
async function likePost(id, btn){
  if (!LaffAPI.getUser()) return alert('Войдите чтобы ставить лайки');
  try {
    const res = await LaffAPI.likePost(id);
    btn.classList.toggle('liked', res.liked);
    const current = parseInt(btn.textContent) || 0;
    btn.innerHTML = `<i class="fa-solid fa-heart"></i> ${res.liked ? current+1 : Math.max(0,current-1)}`;
  } catch(e){ alert(e.message); }
}

function quotePost(author, content){
  if (window.editor){
    window.editor.setHTML(`<blockquote><b>${author} писал:</b><br>${content}</blockquote><br><br>`);
    document.getElementById('replyEditor').scrollIntoView({behavior:'smooth'});
  }
}

// Admin actions
async function adminDeleteThread(id){
  if (!confirm('Удалить тему?')) return;
  try { await LaffAPI.adminDeleteThread(id); location.href='index.html'; } catch(e){ alert(e.message); }
}
async function adminPin(id){
  try { await LaffAPI.adminPinThread(id); location.reload(); } catch(e){ alert(e.message); }
}
async function adminLock(id){
  try { await LaffAPI.adminLockThread(id); location.reload(); } catch(e){ alert(e.message); }
}
async function adminDeletePost(id){
  if (!confirm('Удалить пост?')) return;
  try { await LaffAPI.adminDeletePost(id); document.getElementById('post-'+id)?.remove(); } catch(e){ alert(e.message); }
}

function initSearch(){
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', async (e)=>{
    const q = e.target.value.trim().toLowerCase();
    if (!q){ renderForumList(); return; }
    if (q.length < 2) return;
    try {
      const threads = await LaffAPI.fetchThreads(null, q);
      const container = document.getElementById('forum-container');
      if (!threads.length){
        container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-dim)">Ничего не найдено по "${q}"</div>`;
        return;
      }
      container.innerHTML = `
        <div class="category">
          <div class="cat-header"><div class="cat-icon">🔍</div><div><div class="cat-title">Результаты поиска: "${q}"</div><div class="cat-desc">Найдено ${threads.length} тем</div></div></div>
          <div class="forum-list">
            ${threads.map(t => `
              <a href="thread.html?id=${t.id}" class="forum-node">
                <div class="f-icon">📄</div>
                <div class="f-main"><h3>${t.title}</h3><p>${t.content.substring(0,120)}...</p></div>
                <div class="f-stats"><b>${t.views}</b><span>просм</span></div>
                <div class="f-last"><img src="${t.avatar}"><div class="f-last-info"><a>${t.author}</a><span>${formatTime(t.created_at)}</span></div></div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    } catch(e){}
  });
}

function initModals(){
  document.querySelectorAll('[data-modal]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-modal');
      document.getElementById(id)?.classList.add('open');
    });
  });
  document.querySelectorAll('.modal-backdrop').forEach(bg=>{
    bg.addEventListener('click', (e)=>{
      if(e.target===bg) bg.classList.remove('open');
    });
  });
  document.querySelectorAll('[data-close]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      btn.closest('.modal-backdrop')?.classList.remove('open');
    });
  });
}

function initAuthUI(){
  const user = LaffAPI.getUser();
  const actions = document.querySelector('.actions');
  if (!actions) return;

  if (user){
    actions.innerHTML = `
      <div class="search-box" style="margin-right:8px"><input id="searchInput" placeholder="Поиск..."><i class="fa-solid fa-magnifying-glass"></i></div>
      <a href="admin.html" style="${['ОСНОВАТЕЛЬ','ГЛ. АДМИН','ТЕХ. АДМИН'].includes(user.role) ? '' : 'display:none'}" class="btn btn-ghost"><i class="fa-solid fa-shield"></i> Админка</a>
      <div style="display:flex;align-items:center;gap:10px;background:var(--bg-card);border:1px solid var(--border);padding:4px 12px 4px 4px;border-radius:999px">
        <img src="${user.avatar}" style="width:28px;height:28px;border-radius:50%">
        <span style="font-weight:600;font-size:13px">${user.username}</span>
        <span style="font-size:10px;background:var(--accent);color:white;padding:2px 6px;border-radius:999px">${user.role}</span>
      </div>
      <button class="btn btn-ghost btn-icon" onclick="LaffAPI.logout()" title="Выйти"><i class="fa-solid fa-right-from-bracket"></i></button>
    `;
    initSearch();
  } else {
    // keep default login buttons, but wire them
    const loginBtns = document.querySelectorAll('[data-modal=\"loginModal\"]');
    const regBtns = document.querySelectorAll('[data-modal=\"registerModal\"]');
  }
}

async function handleLoginForm(){
  const loginModal = document.getElementById('loginModal');
  if (!loginModal) return;
  const form = loginModal.querySelector('.modal-body');
  if (!form) return;
  // replace with functional form if not already
  const loginInput = loginModal.querySelector('input[type=\"text\"], input:not([type])');
  // We'll attach to button
  const btn = loginModal.querySelector('.btn-primary');
  if (btn){
    btn.onclick = async () => {
      const inputs = loginModal.querySelectorAll('.input');
      const loginVal = inputs[0]?.value;
      const passVal = inputs[1]?.value;
      if (!loginVal || !passVal) return alert('Заполните поля');
      try {
        await LaffAPI.login(loginVal, passVal);
        location.reload();
      } catch(e){ alert(e.message); }
    };
  }
}
async function handleRegisterForm(){
  const modal = document.getElementById('registerModal');
  if (!modal) return;
  const btn = modal.querySelector('.btn-primary');
  if (btn){
    btn.onclick = async () => {
      const inputs = modal.querySelectorAll('.input');
      const username = inputs[0]?.value;
      const email = inputs[1]?.value;
      const password = inputs[2]?.value;
      const static_id = inputs[3]?.value;
      if (!username || !email || !password) return alert('Заполните обязательные поля');
      try {
        await LaffAPI.register(username, email, password, static_id);
        location.reload();
      } catch(e){ alert(e.message); }
    };
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  initAuthUI();
  await loadCategories();
  await renderForumList();
  await renderThreadList();
  await renderThread();
  await renderOnline();
  await renderStats();
  initSearch();
  initModals();
  handleLoginForm();
  handleRegisterForm();
  
  // try fetch me to update
  if (LaffAPI.getToken()){
    await LaffAPI.fetchMe().catch(()=>{});
    initAuthUI();
  }
});
