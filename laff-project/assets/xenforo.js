/* XenForo-like header with profile dropdown - shared for all pages */
function initXenforoHeader(){
  const user = LaffAPI.getUser();
  const right = document.getElementById('auth-right');
  if(!right) return;
  
  const isAdmin = user && ['ОСНОВАТЕЛЬ','ГЛ. АДМИН','ТЕХ. АДМИН'].includes(user.role);
  
  if(user){
    right.innerHTML = `
      <div class="xf-user-menu" id="userMenu">
        <div class="xf-user-trigger" onclick="document.getElementById('userDropdown').classList.toggle('open')">
          <img src="${user.avatar}" alt="">
          <span>${user.username}</span>
          <span style="font-size:9px; background:${isAdmin?'#dc2626':'#4b5563'}; color:white; padding:2px 6px; border-radius:999px;">${user.role}</span>
          <i class="fa-solid fa-caret-down"></i>
        </div>
        <div class="xf-dropdown" id="userDropdown">
          <div class="xf-dropdown-header">
            <img src="${user.avatar}" alt="">
            <div>
              <h4>${user.username}</h4>
              <span>${user.email||''}</span>
              <span class="role-badge" style="background:${isAdmin?'#dc2626':'#4b5563'}">${user.role}</span>
            </div>
          </div>
          <div class="xf-dropdown-menu">
            <a href="profile.html?u=${user.username}"><i class="fa-regular fa-user"></i> Ваш профиль</a>
            <a href="account.html"><i class="fa-solid fa-gear"></i> Ваша учетная запись</a>
            <a href="account.html"><i class="fa-regular fa-address-card"></i> Информация</a>
            <a href="account.html" onclick="localStorage.setItem('xf_tab','password')"><i class="fa-solid fa-lock"></i> Пароль и безопасность</a>
            <div class="sep"></div>
            <a href="whats-new.html"><i class="fa-solid fa-bolt"></i> Что нового</a>
            <a href="users.html"><i class="fa-solid fa-users"></i> Пользователи</a>
            ${isAdmin ? `<a href="admin.html"><i class="fa-solid fa-shield-halved"></i> Админ-панель</a>` : ''}
            <div class="sep"></div>
            <a href="#" class="danger" onclick="LaffAPI.logout(); return false;"><i class="fa-solid fa-right-from-bracket"></i> Выйти</a>
          </div>
        </div>
      </div>
    `;
    
    // Close dropdown outside
    document.addEventListener('click', (e)=>{
      const menu = document.getElementById('userMenu');
      const dropdown = document.getElementById('userDropdown');
      if(menu && !menu.contains(e.target) && dropdown){
        dropdown.classList.remove('open');
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
      <a href="#" onclick="document.getElementById('loginModal')?.classList.add('open'); document.querySelector('.xf-login-overlay')?.classList.add('open'); return false;"><i class="fa-solid fa-right-to-bracket"></i> Вход</a>
      <a href="#" onclick="document.getElementById('registerModal')?.classList.add('open'); return false;">Регистрация</a>
      <a href="#" class="search"><i class="fa-solid fa-magnifying-glass"></i> Поиск</a>
    `;
    const adminCard = document.getElementById('admin-card');
    if(adminCard) adminCard.style.display = 'none';
    const footerAdmin = document.getElementById('footer-admin-link');
    if(footerAdmin) footerAdmin.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  initXenforoHeader();
  if(LaffAPI.getToken()){
    LaffAPI.fetchMe().then(()=>initXenforoHeader()).catch(()=>{});
  }
});
