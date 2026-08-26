/* XenForo-like header - MINIMAL COMPACT like screenshot */
function initXenforoHeader(){
  const user = LaffAPI.getUser();
  const right = document.getElementById('auth-right');
  if(!right) return;
  
  const isAdmin = user && ['ОСНОВАТЕЛЬ','ГЛ. АДМИН','ТЕХ. АДМИН','Модератор'].includes(user.role);
  
  if(user){
    right.innerHTML = `
      <div class="xf-top-icons" style="position:relative;">
        <div class="xf-top-icon avatar" id="topAvatar" onclick="event.stopPropagation(); document.getElementById('userDropdownExact').classList.toggle('open')" style="background:${stringToColor(user.username)}">
          ${user.avatar && user.avatar.length>10 ? `<img src="${user.avatar}" alt="">` : user.username.charAt(0).toUpperCase()}
        </div>
        <div class="xf-top-icon" title="Сообщения" onclick="location.href='account.html'"><i class="fa-regular fa-envelope"></i></div>
        <div class="xf-top-icon" title="Оповещения" onclick="location.href='account.html'"><i class="fa-regular fa-bell"></i></div>
        <div class="xf-top-icon" title="Поиск" onclick="document.getElementById('searchInput')?.focus()"><i class="fa-solid fa-magnifying-glass"></i></div>
        
        <div class="xf-user-dropdown" id="userDropdownExact">
          <div class="xf-user-dropdown-tabs">
            <button class="active" title="Профиль"><i class="fa-regular fa-user"></i></button>
            <button title="Закладки"><i class="fa-regular fa-bookmark"></i></button>
          </div>
          <div class="xf-user-profile-card">
            <div class="avatar" style="background:${stringToColor(user.username)}">${user.avatar && user.avatar.length>10 ? `<img src="${user.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : user.username.charAt(0).toUpperCase()}</div>
            <div class="info">
              <h4>${user.username}</h4>
              <span>${user.role==='ОСНОВАТЕЛЬ'?'Основатель':user.role==='ГЛ. АДМИН'?'Гл. администратор':user.role==='ТЕХ. АДМИН'?'Тех. администратор':user.role||'Новый пользователь'}</span>
            </div>
            <div class="stats">
              <div>Сообщения: <b>${user.messages||0}</b></div>
              <div>Реакции: <b>${user.reputation||0}</b></div>
            </div>
          </div>
          <div class="xf-user-menu-grid">
            <a href="profile.html?u=${user.username}"><i class="fa-regular fa-file-lines"></i> Ваш контент</a>
            <a href="account.html#reactions"><i class="fa-regular fa-heart"></i> Полученные реакции</a>
            <a href="account.html"><i class="fa-regular fa-address-card"></i> Информация</a>
            <a href="account.html#signature"><i class="fa-solid fa-signature"></i> Подпись</a>
            <a href="account.html#password"><i class="fa-solid fa-lock"></i> Пароль и безопасность</a>
            <a href="account.html#following"><i class="fa-solid fa-user-plus"></i> Подписка</a>
            <a href="account.html#privacy"><i class="fa-solid fa-shield-halved"></i> Конфиденциальность</a>
            <a href="account.html#ignoring"><i class="fa-solid fa-user-slash"></i> Игнорирование</a>
            <a href="account.html#preferences"><i class="fa-solid fa-gear"></i> Настройки</a>
            <a href="#" class="danger" onclick="LaffAPI.logout(); return false;"><i class="fa-solid fa-right-from-bracket"></i> Выйти</a>
          </div>
          <div class="xf-user-menu-footer">
            <input type="text" placeholder="Обновить статус..." onkeypress="if(event.key==='Enter'){ updateStatus(this.value); }">
          </div>
        </div>
      </div>
    `;
    document.addEventListener('click', (e)=>{
      const menu = document.getElementById('userDropdownExact');
      const avatar = document.getElementById('topAvatar');
      if(menu && avatar && !avatar.contains(e.target) && !menu.contains(e.target)){
        menu.classList.remove('open');
      }
    });
    const adminCard = document.getElementById('admin-card');
    if(isAdmin && adminCard){
      adminCard.style.display = 'block';
      const userEl = document.getElementById('admin-card-user');
      if(userEl) userEl.textContent = user.username;
    }
    const footerAdmin = document.getElementById('footer-admin-link');
    if(footerAdmin) footerAdmin.style.display = isAdmin ? 'inline' : 'none';
  } else {
    right.innerHTML = `
      <a href="#" onclick="document.getElementById('loginModal')?.classList.add('open'); return false;"><i class="fa-solid fa-right-to-bracket"></i> Вход</a>
      <a href="#" onclick="document.getElementById('registerModal')?.classList.add('open'); return false;">Регистрация</a>
      <a href="#" class="search"><i class="fa-solid fa-magnifying-glass"></i> Поиск</a>
    `;
    const adminCard = document.getElementById('admin-card');
    if(adminCard) adminCard.style.display = 'none';
    const footerAdmin = document.getElementById('footer-admin-link');
    if(footerAdmin) footerAdmin.style.display = 'none';
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
  const input = document.querySelector('.xf-user-menu-footer input');
  if(input) input.value = '';
  document.getElementById('userDropdownExact')?.classList.remove('open');
  const note = document.createElement('div');
  note.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#16a34a; color:white; padding:10px 16px; border-radius:8px; font-size:12px; z-index:10000;';
  note.textContent = 'Статус: ' + text;
  document.body.appendChild(note);
  setTimeout(()=>note.remove(), 3000);
}
document.addEventListener('DOMContentLoaded', ()=>{
  initXenforoHeader();
  if(LaffAPI.getToken()){
    LaffAPI.fetchMe().then(()=>initXenforoHeader()).catch(()=>{});
  }
});
