/* XenForo-like header with profile dropdown - EXACT like screenshot tirangang */
function initXenforoHeader(){
  const user = LaffAPI.getUser();
  const right = document.getElementById('auth-right');
  if(!right) return;
  
  const isAdmin = user && ['ОСНОВАТЕЛЬ','ГЛ. АДМИН','ТЕХ. АДМИН'].includes(user.role);
  
  if(user){
    // Top icons like screenshot: T avatar, envelope, bell, search
    right.innerHTML = `
      <div class="xf-top-icons" style="position:relative;">
        <div class="xf-top-icon avatar" id="topAvatar" onclick="document.getElementById('userDropdownExact').classList.toggle('open')" style="background:${stringToColor(user.username)}">
          ${user.avatar && user.avatar.startsWith('http') ? `<img src="${user.avatar}" alt="">` : user.username.charAt(0).toUpperCase()}
        </div>
        <div class="xf-top-icon" onclick="location.href='account.html#alerts'"><i class="fa-regular fa-envelope"></i></div>
        <div class="xf-top-icon" onclick="location.href='account.html#alerts'"><i class="fa-regular fa-bell"></i><span id="bell-badge" style="display:none; position:absolute; top:-2px; right:-2px; background:#dc2626; color:white; font-size:9px; width:16px; height:16px; border-radius:50%; display:grid; place-items:center;">0</span></div>
        <div class="xf-top-icon" onclick="document.getElementById('searchModal')?.classList.add('open') || (document.getElementById('searchInput') && document.getElementById('searchInput').focus())"><i class="fa-solid fa-magnifying-glass"></i></div>
        
        <!-- EXACT DROPDOWN LIKE SCREENSHOT -->
        <div class="xf-user-dropdown" id="userDropdownExact">
          <div class="xf-user-dropdown-tabs">
            <button class="active"><i class="fa-regular fa-user"></i></button>
            <button><i class="fa-regular fa-bookmark"></i></button>
          </div>
          
          <div class="xf-user-profile-card">
            <div class="avatar" style="background:${stringToColor(user.username)}">${user.avatar && user.avatar.startsWith('http') ? `<img src="${user.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : user.username.charAt(0).toUpperCase()}</div>
            <div class="info">
              <h4>${user.username}</h4>
              <span>${user.role==='ОСНОВАТЕЛЬ'?'Основатель':user.role==='ГЛ. АДМИН'?'Главный администратор':user.role==='ТЕХ. АДМИН'?'Тех. администратор':'Новый пользователь'}</span>
            </div>
            <div class="stats">
              <div>Сообщения: <b>${user.messages||0}</b></div>
              <div>Оценка реакций: <b>${user.reputation||0}</b></div>
            </div>
          </div>
          
          <div class="xf-user-menu-grid">
            <a href="profile.html?u=${user.username}"><i class="fa-regular fa-file-lines" style="width:14px"></i> Ваш контент</a>
            <a href="account.html#reactions"><i class="fa-regular fa-heart" style="width:14px"></i> Полученные реакции</a>
            
            <a href="account.html"><i class="fa-regular fa-address-card" style="width:14px"></i> Информация</a>
            <a href="account.html#signature"><i class="fa-solid fa-signature" style="width:14px"></i> Подпись</a>
            
            <a href="account.html#password"><i class="fa-solid fa-lock" style="width:14px"></i> Пароль и безопасность</a>
            <a href="account.html#following"><i class="fa-solid fa-user-plus" style="width:14px"></i> Подписка</a>
            
            <a href="account.html#privacy"><i class="fa-solid fa-shield-halved" style="width:14px"></i> Конфиденциальность</a>
            <a href="account.html#ignoring"><i class="fa-solid fa-user-slash" style="width:14px"></i> Игнорирование</a>
            
            <a href="account.html#preferences" class="full"><i class="fa-solid fa-gear" style="width:14px"></i> Настройки</a>
            <a href="#" class="full" onclick="LaffAPI.logout(); return false;"><i class="fa-solid fa-right-from-bracket" style="width:14px"></i> Выйти</a>
          </div>
          
          <div class="xf-user-menu-footer">
            <input type="text" placeholder="Обновить статус..." onkeypress="if(event.key==='Enter'){ updateStatus(this.value); }">
          </div>
        </div>
      </div>
    `;
    
    // Close dropdown outside
    document.addEventListener('click', (e)=>{
      const menu = document.getElementById('userDropdownExact');
      const avatar = document.getElementById('topAvatar');
      if(menu && avatar && !avatar.contains(e.target) && !menu.contains(e.target)){
        menu.classList.remove('open');
      }
    });
    
    // Show admin elements
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
  const color = '#' + '00000'.substring(0,6-c.length) + c;
  // Make it more orange-ish for T like screenshot if needed, but keep hash
  return color;
}

function updateStatus(text){
  if(!text.trim()) return;
  const user = LaffAPI.getUser();
  if(!user) return;
  localStorage.setItem('laff_status_'+user.id, text);
  alert('Статус обновлен: ' + text);
  document.querySelector('.xf-user-menu-footer input').value = '';
  document.getElementById('userDropdownExact').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', ()=>{
  initXenforoHeader();
  if(LaffAPI.getToken()){
    LaffAPI.fetchMe().then(()=>initXenforoHeader()).catch(()=>{});
  }
});
