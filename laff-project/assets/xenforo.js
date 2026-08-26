/* XenForo-like header - ALL BUTTONS WORKING - FINAL */
function initXenforoHeader(){
  const user = LaffAPI.getUser();
  const right = document.getElementById('auth-right');
  if(!right) return;
  
  const isAdmin = user && ['ОСНОВАТЕЛЬ','ГЛ. АДМИН','ТЕХ. АДМИН','Модератор'].includes(user.role);
  
  if(user){
    right.innerHTML = `
      <div class="xf-top-icons" style="position:relative;">
        <div class="xf-top-icon avatar" id="topAvatar" style="background:${stringToColor(user.username)}" title="${user.username}">
          ${user.avatar && user.avatar.length>10 ? `<img src="${user.avatar}" alt="">` : user.username.charAt(0).toUpperCase()}
        </div>
        <div class="xf-top-icon" title="Сообщения" onclick="location.href='account.html'"><i class="fa-regular fa-envelope"></i></div>
        <div class="xf-top-icon" title="Оповещения" onclick="location.href='account.html'"><i class="fa-regular fa-bell"></i></div>
        <div class="xf-top-icon" title="Поиск" onclick="openSearch()"><i class="fa-solid fa-magnifying-glass"></i></div>
        
        <div class="xf-user-dropdown" id="userDropdownExact" hidden>
          <div class="xf-user-dropdown-tabs">
            <button class="active"><i class="fa-regular fa-user"></i></button>
            <button><i class="fa-regular fa-bookmark"></i></button>
          </div>
          <div class="xf-user-profile-card">
            <div class="avatar" style="background:${stringToColor(user.username)}">${user.avatar && user.avatar.length>10 ? `<img src="${user.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : user.username.charAt(0).toUpperCase()}</div>
            <div class="info">
              <h4>${user.username}</h4>
              <span>${user.role||'Новый пользователь'}</span>
            </div>
            <div class="stats">
              <div>Сообщения: <b>${user.messages||0}</b></div>
              <div>Реакции: <b>${user.reputation||0}</b></div>
            </div>
          </div>
          <div class="xf-user-menu-grid">
            <a href="profile.html?u=${user.username}"><i class="fa-regular fa-user"></i> Ваш профиль</a>
            <a href="account.html"><i class="fa-solid fa-gear"></i> Ваша учетная запись</a>
            <a href="account.html"><i class="fa-regular fa-address-card"></i> Информация</a>
            <a href="account.html#password"><i class="fa-solid fa-lock"></i> Пароль и безопасность</a>
            <a href="whats-new.html"><i class="fa-solid fa-bolt"></i> Что нового</a>
            <a href="users.html"><i class="fa-solid fa-users"></i> Пользователи</a>
            ${isAdmin ? `<a href="admin.html"><i class="fa-solid fa-shield-halved"></i> Админ-панель</a>` : ''}
            <a href="#" class="danger" onclick="LaffAPI.logout(); return false;"><i class="fa-solid fa-right-from-bracket"></i> Выйти</a>
          </div>
          <div class="xf-user-menu-footer">
            <input type="text" placeholder="Обновить статус..." onkeydown="if(event.key==='Enter'){ updateStatus(this.value); }">
          </div>
        </div>
      </div>
    `;

    setTimeout(()=>{
      const avatar = document.getElementById('topAvatar');
      const dropdown = document.getElementById('userDropdownExact');
      if(avatar && dropdown){
        dropdown.hidden = true;
        avatar.addEventListener('click', (e)=>{
          e.stopPropagation();
          e.preventDefault();
          const isOpen = !dropdown.hidden;
          if(isOpen){
            dropdown.hidden = true;
            dropdown.classList.remove('open');
          } else {
            dropdown.hidden = false;
            dropdown.classList.add('open');
          }
        });
      }
    }, 100);

    document.addEventListener('click', (e)=>{
      const dropdown = document.getElementById('userDropdownExact');
      const avatar = document.getElementById('topAvatar');
      if(dropdown && avatar && !avatar.contains(e.target) && !dropdown.contains(e.target)){
        dropdown.hidden = true;
        dropdown.classList.remove('open');
      }
    });
    window.addEventListener('scroll', ()=>{ const dd=document.getElementById('userDropdownExact'); if(dd){ dd.hidden=true; dd.classList.remove('open'); } }, {passive:true});
  } else {
    right.innerHTML = `
      <a href="#" onclick="openLogin(); return false;"><i class="fa-solid fa-right-to-bracket"></i> Вход</a>
      <a href="#" onclick="openRegister(); return false;">Регистрация</a>
      <a href="#" onclick="openSearch(); return false;" class="search"><i class="fa-solid fa-magnifying-glass"></i> Поиск</a>
    `;
  }
}

function openLogin(){
  const m = document.getElementById('loginModal');
  if(m) m.classList.add('open');
}
function openRegister(){
  const m = document.getElementById('registerModal');
  if(m) m.classList.add('open');
}
function openSearch(){
  let modal = document.getElementById('searchModal');
  if(modal){
    modal.classList.add('open');
    modal.hidden = false;
    document.getElementById('searchInput')?.focus();
    return;
  }
  modal = document.createElement('div');
  modal.id = 'searchModal';
  modal.className = 'xf-login-overlay open';
  modal.style.cssText = 'display:grid; position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:1001; place-items:center; padding:20px;';
  modal.innerHTML = `
    <div class="xf-login-modal" style="max-width:500px; background:#1e1e1e; border:1px solid #2a2a2a; border-radius:8px; overflow:hidden;">
      <div style="background:#252525; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #2a2a2a;">
        <h2 style="font-size:14px; color:#fff;"><i class="fa-solid fa-magnifying-glass"></i> Поиск по форуму</h2>
        <button onclick="document.getElementById('searchModal').classList.remove('open'); document.getElementById('searchModal').hidden=true;" style="background:none; border:none; color:#8a8f98; font-size:16px; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div style="padding:14px; background:#1c1c1c;">
        <input id="searchInputGlobal" class="xf-input" placeholder="Введите запрос..." style="width:100%; background:#111; border:1px solid #2a2a2a; border-radius:6px; padding:8px 12px; color:#fff;" onkeypress="if(event.key==='Enter'){ doGlobalSearch(); }">
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button style="background:#3b82f6; color:white; border:none; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="doGlobalSearch()"><i class="fa-solid fa-magnifying-glass"></i> Поиск</button>
          <button style="background:#252525; border:1px solid #2a2a2a; color:#9ca3af; padding:8px 12px; border-radius:6px; cursor:pointer;" onclick="document.getElementById('searchModal').classList.remove('open'); document.getElementById('searchModal').hidden=true;">Отмена</button>
        </div>
        <div id="searchResultsGlobal" style="margin-top:12px; max-height:300px; overflow-y:auto;"></div>
      </div>
    </div>
  `;
  modal.addEventListener('click', (e)=>{ if(e.target===modal){ modal.classList.remove('open'); modal.hidden=true; } });
  document.body.appendChild(modal);
  document.getElementById('searchInputGlobal').focus();
}

async function doGlobalSearch(){
  const input = document.getElementById('searchInputGlobal') || document.getElementById('searchInput');
  const q = input ? input.value.trim() : '';
  if(!q) return;
  const resultsEl = document.getElementById('searchResultsGlobal') || document.getElementById('searchResults');
  if(resultsEl) resultsEl.innerHTML = '<div style="padding:8px; color:#8a8f98; font-size:11px;">Поиск...</div>';
  try {
    const threads = await LaffAPI.fetchThreads(null, q);
    if(resultsEl){
      if(!threads.length){
        resultsEl.innerHTML = `<div style="padding:12px; color:#8a8f98; font-size:11px; text-align:center;">Ничего не найдено по "${q}"</div>`;
      } else {
        resultsEl.innerHTML = threads.map(t=>`
          <a href="thread.html?id=${t.id}" style="display:block; padding:8px 10px; background:#252525; border:1px solid #2a2a2a; border-radius:6px; margin-bottom:6px;">
            <div style="font-size:12px; font-weight:600; color:#e5e7eb;">${t.title}</div>
            <div style="font-size:10px; color:#8a8f98; margin-top:2px;">${t.author} • ${t.forum_id}</div>
          </a>
        `).join('');
      }
    } else {
      location.href = 'whats-new.html?search=' + encodeURIComponent(q);
    }
  } catch(e){
    if(resultsEl) resultsEl.innerHTML = `<div style="padding:8px; color:#ef4444; font-size:11px;">${e.message}</div>`;
  }
}

function stringToColor(str){
  if(!str) return '#ff6b35';
  let hash=0;
  for(let i=0;i<str.length;i++) hash = str.charCodeAt(i) + ((hash<<5)-hash);
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0,6-c.length) + c;
}

function updateStatus(text){
  if(!text.trim()) return;
  const user = LaffAPI.getUser();
  if(!user) return;
  localStorage.setItem('laff_status_'+user.id, text);
  const dd = document.getElementById('userDropdownExact');
  if(dd){ dd.hidden=true; dd.classList.remove('open'); }
  const note = document.createElement('div');
  note.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#16a34a; color:white; padding:8px 14px; border-radius:6px; font-size:11px; z-index:10000;';
  note.textContent = 'Статус: ' + text;
  document.body.appendChild(note);
  setTimeout(()=>note.remove(), 2500);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initXenforoHeader();
  if(LaffAPI.getToken()){
    LaffAPI.fetchMe().then(()=>initXenforoHeader()).catch(()=>{});
  }
});
