/* LAFF PROJECT Forum App - Trace RP Clone */

const CATEGORIES = [
  {
    id: 'main',
    icon: '☂️',
    title: 'Главный раздел',
    desc: 'Основная информация о проекте LAFF PROJECT',
    count: '3 форума',
    forums: [
      { id: 'news', icon: '📢', title: 'Новости проекта', desc: 'Важные обновления, патчи, мероприятия и новости от команды LAFF PROJECT. Следите за актуальной информацией.', threads: 42, messages: 312, badge: 'ВАЖНО', unread: true, last: { title: 'Обновление 2.4 - Новый сезон', user: 'Maestro', avatar: 'https://i.pravatar.cc/100?img=1', time: 'Сегодня в 14:32' } },
      { id: 'team', icon: '👑', title: 'Команда LAFF PROJECT', desc: 'Состав администрации, кураторы, хелперы. Заявления и информация о команде.', threads: 18, messages: 156, unread: true, last: { title: 'Набор в команду проекта', user: 'Laff_Admin', avatar: 'https://i.pravatar.cc/100?img=2', time: 'Сегодня в 12:10' } },
      { id: 'appeals', icon: '📨', title: 'Обращения к Главной Администрации', desc: 'Жалобы, предложения, вопросы к руководству проекта. Конфиденциально.', threads: 124, messages: 892, last: { title: 'Предложение по улучшению экономики', user: 'enjoylaff', avatar: 'https://i.pravatar.cc/100?img=3', time: 'Вчера в 23:45' } },
    ]
  },
  {
    id: 'familywar',
    icon: '⚔️',
    title: 'Family War',
    desc: 'Система семей и войн за территории',
    count: '2 форума',
    forums: [
      { id: 'families', icon: '👨‍👩‍👧‍👦', title: 'Семьи на LAFF PROJECT', desc: 'Список семей, заявления на создание, информация о Family War, правила войн за территории.', threads: 67, messages: 543, badge: 'NEW', unread: true, last: { title: 'Family | Laff Family - набор', user: 'qvizzovich', avatar: 'https://i.pravatar.cc/100?img=4', time: 'Сегодня в 09:15' } },
      { id: 'fam-top', icon: '🏆', title: 'Топ семей и рейтинг', desc: 'Рейтинг самых активных и влиятельных семей проекта. Статистика и награды.', threads: 12, messages: 89, last: { title: 'Итоги недели Family War', user: 'Paranoia', avatar: 'https://i.pravatar.cc/100?img=5', time: 'Вчера в 18:20' } },
    ]
  },
  {
    id: 'info',
    icon: '📚',
    title: 'Главный раздел',
    desc: 'Информация и помощь игрокам',
    count: '4 форума',
    forums: [
      { id: 'info-main', icon: 'ℹ️', title: 'Info LAFF PROJECT', desc: 'Правила получения особого транспорта, промокоды, гайды для новичков.', threads: 2, messages: 2, last: { title: 'Правила получения особого транспорта', user: 'Maestro', avatar: 'https://i.pravatar.cc/100?img=1', time: '19.06.2025' } },
      { id: 'faq', icon: '❓', title: 'Часто задаваемые вопросы', desc: 'Как зайти на сервер, решение ошибок RAGE MP, техническая помощь.', threads: 8, messages: 124, badge: 'FAQ', last: { title: 'Решение ошибки Multiplayer Started', user: 'Laff_Tech', avatar: 'https://i.pravatar.cc/100?img=6', time: 'Сегодня в 11:02' } },
      { id: 'complaints-players', icon: '🚨', title: 'Жалобы на игроков', desc: 'Жалобы на нарушение правил сервера со стороны игроков. Форма подачи.', threads: 342, messages: 2103, unread: true, last: { title: 'Жалоба на игрока #19583', user: 'A1WASS1', avatar: 'https://i.pravatar.cc/100?img=7', time: 'Сегодня в 13:44' } },
      { id: 'complaints-admins', icon: '⚖️', title: 'Жалобы на администрацию', desc: 'Если вы считаете что администратор нарушил правила. Рассматривает ГА.', threads: 89, messages: 456, last: { title: 'Жалоба на администратора', user: 'w1ex', avatar: 'https://i.pravatar.cc/100?img=8', time: 'Вчера в 22:10' } },
    ]
  },
  {
    id: 'laws',
    icon: '📜',
    title: 'Основные кодексы',
    desc: 'Законодательная база штата',
    count: '5 форумов',
    forums: [
      { id: 'server-rules', icon: '📋', title: 'Правила сервера', desc: 'Общие правила проекта LAFF PROJECT. Обязательно к изучению всем игрокам.', threads: 15, messages: 15, badge: 'ПРАВИЛА', unread: true, last: { title: 'Правила игровых зон', user: 'Maestro', avatar: 'https://i.pravatar.cc/100?img=1', time: '11.03.2025' } },
      { id: 'airdrop', icon: '🪂', title: 'Правила войны за AirDrop', desc: 'Правила участия в войне за AirDrop, запреты и наказания.', threads: 1, messages: 12, last: { title: 'Правила войны за AirDrop', user: 'Paranoia', avatar: 'https://i.pravatar.cc/100?img=5', time: '11.03.2025' } },
      { id: 'leader-rules', icon: '👔', title: 'Правила для лидеров фракций', desc: 'Обязанности, запреты, система выговоров для лидеров гос и крайм.', threads: 4, messages: 22, last: { title: 'Правила для лидеров фракций', user: 'Paranoia', avatar: 'https://i.pravatar.cc/100?img=5', time: '06.11.2025' } },
      { id: 'laws-state', icon: '⚖️', title: 'Законодательная база', desc: 'Уголовный, административный кодексы, законы об оружии, о транспорте.', threads: 18, messages: 67, last: { title: 'Закон "О регулировании оборота оружия..."', user: 'Paranoia', avatar: 'https://i.pravatar.cc/100?img=5', time: '28.10.2025' } },
      { id: 'lssd-charter', icon: '🛡️', title: 'Уставы гос. организаций', desc: 'Уставы LSPD, LSSD, FIB, GOV, EMS, NG. Внутренние правила.', threads: 24, messages: 98, last: { title: 'Устав Los Santos Sheriff Department', user: 'Laff_Admin', avatar: 'https://i.pravatar.cc/100?img=2', time: '26.11.2025' } },
    ]
  },
  {
    id: 'gov',
    icon: '🏛️',
    title: 'Государственные структуры',
    desc: 'Фракции правительства штата San Andreas',
    count: '6 форумов',
    forums: [
      { id: 'gov-f', icon: '🏛️', title: 'Government', desc: 'Правительство, мэрия, суды, адвокаты. Заявления, жалобы, RP биографии.', threads: 156, messages: 1243, unread: true, last: { title: 'Заявление на пост Губернатора', user: 'ps1xoz', avatar: 'https://i.pravatar.cc/100?img=9', time: 'Сегодня в 10:30' } },
      { id: 'lspd', icon: '🚓', title: 'Los Santos Police Department', desc: 'Полицейский департамент Лос-Сантоса. Академия, заявления, отчеты.', threads: 203, messages: 1876, last: { title: 'Отчет о патруле #124', user: 'versiss', avatar: 'https://i.pravatar.cc/100?img=10', time: 'Сегодня в 08:20' } },
      { id: 'lssd', icon: '⭐', title: 'Los Santos Sheriff Department', desc: 'Шерифский департамент. Заявления на вступление, устав, приказы.', threads: 98, messages: 765, last: { title: 'Заявление в LSSD | John Laff', user: 'John_Laff', avatar: 'https://i.pravatar.cc/100?img=11', time: 'Вчера в 21:00' } },
      { id: 'fib', icon: '🕵️', title: 'Federal Investigation Bureau', desc: 'Федеральное бюро расследований. Секретные операции, набор.', threads: 87, messages: 654, last: { title: 'Кейс-файл #892', user: 'dezon', avatar: 'https://i.pravatar.cc/100?img=12', time: 'Вчера в 19:30' } },
      { id: 'ems', icon: '🚑', title: 'Emergency Medical Service', desc: 'Медицинская служба, больница ЛС. Заявления, отчеты, медкарты.', threads: 112, messages: 876, last: { title: 'Заявление на стажера EMS', user: 'Anrofee', avatar: 'https://i.pravatar.cc/100?img=13', time: 'Сегодня в 07:45' } },
      { id: 'ng', icon: '🎖️', title: 'San Andreas National Guard', desc: 'Национальная гвардия. Военная база, призыв, устав.', threads: 76, messages: 543, last: { title: 'Рапорт на повышение', user: 'LitEnergy', avatar: 'https://i.pravatar.cc/100?img=14', time: 'Вчера в 20:15' } },
    ]
  },
  {
    id: 'crime',
    icon: '💀',
    title: 'Криминальные организации',
    desc: 'Мафии, банды, нелегальный мир',
    count: '2 форума',
    forums: [
      { id: 'mafia', icon: '🤵', title: 'Мафии', desc: 'La Cosa Nostra, Yakuza, Russian Mafia, Armenian Mafia. Заявления на лидерки, биографии.', threads: 134, messages: 987, unread: true, last: { title: 'Заявление на пост лидера The Fam', user: 'enjoylaff', avatar: 'https://i.pravatar.cc/100?img=3', time: 'Сегодня в 14:10' } },
      { id: 'gangs', icon: '🔫', title: 'Банды', desc: 'Grove Street, Ballas, Vagos, Bloods, Marabunta. Территории, капты, заявления.', threads: 198, messages: 1432, last: { title: 'Grove Street | Заявление', user: 'wazy', avatar: 'https://i.pravatar.cc/100?img=15', time: 'Сегодня в 13:00' } },
    ]
  },
  {
    id: 'other',
    icon: '💬',
    title: 'Прочее',
    desc: 'Общение и технические разделы',
    count: '3 форума',
    forums: [
      { id: 'market', icon: '💸', title: 'Торговая площадка', desc: 'Продажа имущества, бизнеса, автомобилей, обмен.', threads: 456, messages: 3421, last: { title: 'Продам дом в Vinewood', user: 'w1ex', avatar: 'https://i.pravatar.cc/100?img=8', time: 'Сегодня в 14:50' } },
      { id: 'reports', icon: '🐛', title: 'Баги и тех. раздел', desc: 'Нашли баг? Сообщите здесь. Обращения в технический раздел.', threads: 67, messages: 234, last: { title: 'Баг с инвентарем', user: 'Astepyha', avatar: 'https://i.pravatar.cc/100?img=16', time: 'Сегодня в 12:45' } },
      { id: 'ideas', icon: '💡', title: 'Идеи и предложения', desc: 'Предлагайте идеи по улучшению сервера LAFF PROJECT.', threads: 123, messages: 876, last: { title: 'Идея: новые работы', user: 'qvizzovich', avatar: 'https://i.pravatar.cc/100?img=4', time: 'Вчера в 23:10' } },
    ]
  },
];

const THREADS = {
  news: [
    { id: 1, title: 'Обновление 2.4 - Новый сезон LAFF PROJECT', author: 'Maestro', avatar: 'https://i.pravatar.cc/100?img=1', role: 'ОСНОВАТЕЛЬ', replies: 42, views: 2291, time: 'Сегодня в 14:32', pinned: true, content: 'Приветствуем, дорогие игроки LAFF PROJECT! Мы рады представить вам глобальное обновление 2.4 - новый сезон с кучей контента...' },
    { id: 2, title: 'Открытие сервера LAFF PROJECT | 01.06.2025', author: 'Laff_Admin', avatar: 'https://i.pravatar.cc/100?img=2', role: 'ГЛ. АДМИН', replies: 128, views: 5432, time: '01.06.2025', pinned: true, content: 'Долгожданное открытие LAFF PROJECT состоялось! IP: play.laff-project.com' },
    { id: 3, title: 'Вайп и награды за бета-тест', author: 'Paranoia', avatar: 'https://i.pravatar.cc/100?img=5', role: 'ТЕХ. АДМИН', replies: 12, views: 892, time: 'Вчера в 18:00', content: 'Всем участникам бета-теста выданы награды...' },
  ],
  'server-rules': [
    { id: 101, title: 'Правила игровых зон', author: 'Maestro', avatar: 'https://i.pravatar.cc/100?img=1', role: 'ОСНОВАТЕЛЬ', replies: 0, views: 2202, time: '11.03.2025', pinned: true, content: '1. Green zone - густонаселенная гражданскими территория, где запрещены любые криминальные действия...' },
    { id: 102, title: 'Общие правила сервера LAFF PROJECT', author: 'Maestro', avatar: 'https://i.pravatar.cc/100?img=1', role: 'ОСНОВАТЕЛЬ', replies: 0, views: 4532, time: '11.03.2025', pinned: true, content: '1.1 Незнание правил не освобождает от ответственности...' },
  ],
  mafia: [
    { id: 201, title: 'Заявление на пост лидера The Fam', author: 'enjoylaff', avatar: 'https://i.pravatar.cc/100?img=3', role: 'ИГРОК', replies: 23, views: 445, time: 'Сегодня в 14:10', pinned: false, content: '1. Имя Фамилия IC: John Laff\n2. Опыт лидера: FIB, Administrator Aqua Project, Majestic Chicago Lead Vagos...\n3. Состав: 50+ человек\n4. Discord: enjoylaff\n5. ID: 19583' },
    { id: 202, title: 'La Cosa Nostra | Заявление на лидерку', author: 'w1ex', avatar: 'https://i.pravatar.cc/100?img=8', role: 'ИГРОК', replies: 8, views: 234, time: 'Вчера в 20:00', content: 'Имею большой опыт, состав 10+ человек...' },
  ],
  faq: [
    { id: 301, title: 'Часто задаваемые вопросы', author: 'Maestro', avatar: 'https://i.pravatar.cc/100?img=1', role: 'ОСНОВАТЕЛЬ', replies: 0, views: 2291, time: '19.06.2025', pinned: true, content: 'Способ 1: Запустите RAGE MP, найдите LAFF PROJECT. Способ 2: Прямое подключение IP: play.laff-project.com\n\nРешение ошибок:\n- Multiplayer Started - перезапустите ПК, запустите от админа\n- ERR_GAMECONFIG - переустановите RAGE MP...' },
  ]
};

const USERS_ONLINE = [
  { name: 'Maestro', avatar: 'https://i.pravatar.cc/100?img=1', color: '#ef4444' },
  { name: 'Paranoia', avatar: 'https://i.pravatar.cc/100?img=5', color: '#8b5cf6' },
  { name: 'Laff_Admin', avatar: 'https://i.pravatar.cc/100?img=2', color: '#ef4444' },
  { name: 'enjoylaff', avatar: 'https://i.pravatar.cc/100?img=3', color: '#e6e8ee' },
  { name: 'qvizzovich', avatar: 'https://i.pravatar.cc/100?img=4', color: '#22c55e' },
  { name: 'w1ex', avatar: 'https://i.pravatar.cc/100?img=8', color: '#e6e8ee' },
  { name: 'A1WASS1', avatar: 'https://i.pravatar.cc/100?img=7', color: '#e6e8ee' },
  { name: 'versiss', avatar: 'https://i.pravatar.cc/100?img=10', color: '#06b6d4' },
];

function renderForumList(){
  const container = document.getElementById('forum-container');
  if(!container) return;
  container.innerHTML = CATEGORIES.map(cat => `
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
              <b>${f.threads}</b><span>Тем</span>
              <div style="height:6px"></div>
              <b>${f.messages}</b><span>Сообщений</span>
            </div>
            <div class="f-last">
              <img src="${f.last.avatar}" alt="">
              <div class="f-last-info">
                <a href="thread.html?id=${f.id}_last">${f.last.title}</a>
                <span>${f.last.user} • ${f.last.time}</span>
              </div>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderThreadList(){
  const params = new URLSearchParams(location.search);
  const forumId = params.get('f') || 'news';
  const forum = CATEGORIES.flatMap(c=>c.forums).find(x=>x.id===forumId);
  const threads = THREADS[forumId] || THREADS['news'];
  
  const titleEl = document.getElementById('forum-title');
  const descEl = document.getElementById('forum-desc');
  if(titleEl && forum){ titleEl.textContent = forum.title; descEl.textContent = forum.desc; }
  
  const list = document.getElementById('thread-list');
  if(!list) return;
  list.innerHTML = `
    <div class="thread-list-header">
      <span>Тема</span>
      <span style="margin-left:auto; display:flex; gap:24px"><span>Ответы</span><span>Просмотры</span></span>
    </div>
    ${threads.map(t => `
      <a href="thread.html?id=${t.id}&f=${forumId}" class="thread-item ${t.pinned ? 'pinned':''}">
        <div class="t-avatar"><img src="${t.avatar}"></div>
        <div class="t-main">
          <h3>${t.pinned ? '<span class="pin">📌</span>' : ''}${t.title}</h3>
          <div class="t-meta">
            <span>${t.author}</span> • <span>${t.time}</span> • <span class="role" style="background:#1f2433;border:1px solid #2e3448;padding:2px 6px;border-radius:999px;font-size:10px">${t.role}</span>
          </div>
        </div>
        <div class="t-stats">
          <div style="display:flex; gap:18px; justify-content:flex-end">
            <div><b>${t.replies}</b><div style="font-size:11px;color:var(--text-dim)">ответов</div></div>
            <div><b>${t.views}</b><div style="font-size:11px;color:var(--text-dim)">просм.</div></div>
          </div>
        </div>
      </a>
    `).join('')}
  `;
}

function renderThread(){
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'));
  const forumId = params.get('f') || 'news';
  const allThreads = Object.values(THREADS).flat();
  let thread = allThreads.find(t=>t.id===id);
  if(!thread){
    // try find by forum last
    const forum = CATEGORIES.flatMap(c=>c.forums).find(x=>x.id===forumId);
    thread = { id: 999, title: forum ? forum.last.title : 'Тема', author: forum ? forum.last.user : 'Maestro', avatar: forum ? forum.last.avatar : 'https://i.pravatar.cc/100?img=1', role: 'ИГРОК', time: 'Сегодня', views: 123, replies: 5, content: 'Содержимое темы...' };
  }
  const container = document.getElementById('thread-view');
  if(!container) return;
  container.innerHTML = `
    <div class="thread-title-bar">
      <h1>${thread.title}</h1>
      <div class="meta">
        <span>👤 ${thread.author}</span>
        <span>🕒 ${thread.time}</span>
        <span>👁️ ${thread.views} просмотров</span>
        <span>💬 ${thread.replies} ответов</span>
      </div>
    </div>
    <div class="post">
      <div class="post-user">
        <img src="${thread.avatar}">
        <h4>${thread.author}</h4>
        <div class="role ${thread.role.includes('ОСНОВАТЕЛЬ')||thread.role.includes('ГЛ.') ? 'admin' : thread.role.includes('ТЕХ') ? 'mod' : ''}">${thread.role}</div>
        <div class="post-stats">
          <div><b>1,243</b><br>сообщений</div>
          <div><b>89</b><br>репутация</div>
        </div>
      </div>
      <div class="post-content">
        <p style="white-space:pre-wrap">${thread.content}</p>
        <p>Это официальный форум <b>LAFF PROJECT</b> — копия и улучшенная версия Trace RP. Мы сохранили всю структуру, дизайн и атмосферу, но добавили свой стиль и улучшили UX.</p>
        <p>IP сервера: <code style="background:var(--bg-soft);padding:2px 8px;border-radius:6px;border:1px solid var(--border)">play.laff-project.com</code></p>
        <div class="post-actions">
          <button class="btn btn-ghost" style="height:32px">👍 Нравится</button>
          <button class="btn btn-ghost" style="height:32px">💬 Ответить</button>
          <button class="btn btn-ghost" style="height:32px">🔗 Поделиться</button>
        </div>
      </div>
    </div>
    <!-- Mock replies -->
    <div class="post">
      <div class="post-user">
        <img src="https://i.pravatar.cc/100?img=3">
        <h4>enjoylaff</h4>
        <div class="role">ИГРОК</div>
        <div class="post-stats"><div><b>342</b><br>сообщений</div><div><b>24</b><br>репутация</div></div>
      </div>
      <div class="post-content">
        <p>Поддерживаю! Форум выглядит 1 в 1 как Trace, только даже лучше. Тёмная тема топ, всё читается.</p>
        <p>Когда открытие нового сезона?</p>
        <div class="post-actions"><button class="btn btn-ghost" style="height:32px">👍 Нравится</button><button class="btn btn-ghost" style="height:32px">💬 Ответить</button></div>
      </div>
    </div>
    <div class="post">
      <div class="post-user">
        <img src="https://i.pravatar.cc/100?img=5">
        <h4>Paranoia</h4>
        <div class="role mod">ТЕХ. АДМИН</div>
        <div class="post-stats"><div><b>892</b><br>сообщений</div><div><b>156</b><br>репутация</div></div>
      </div>
      <div class="post-content">
        <p>Открытие уже скоро. Следите за новостями в Discord: <a href="#" style="color:var(--accent)">discord.gg/laff-project</a></p>
        <div class="post-actions"><button class="btn btn-ghost" style="height:32px">👍 Нравится</button><button class="btn btn-ghost" style="height:32px">💬 Ответить</button></div>
      </div>
    </div>
    <div style="padding:20px; background:var(--bg-soft); border-top:1px solid var(--border); display:flex; gap:12px">
      <img src="https://i.pravatar.cc/100?img=20" style="width:40px;height:40px;border-radius:10px">
      <div style="flex:1; display:flex; gap:10px">
        <input id="replyInput" class="input" placeholder="Написать ответ...">
        <button class="btn btn-primary" onclick="postReply()">Отправить</button>
      </div>
    </div>
  `;
}

function renderOnline(){
  const el = document.getElementById('online-users');
  if(!el) return;
  el.innerHTML = USERS_ONLINE.map(u => `
    <div class="user-chip"><img src="${u.avatar}"><span style="color:${u.color}">${u.name}</span><span class="dot"></span></div>
  `).join('');
}

function postReply(){
  const input = document.getElementById('replyInput');
  if(!input || !input.value.trim()) return;
  alert('Ответ опубликован: ' + input.value + '\\n(Демо режим - в реальной версии сохранится в БД)');
  input.value='';
}

function initSearch(){
  const input = document.getElementById('searchInput');
  if(!input) return;
  input.addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase();
    if(!q){ renderForumList(); return; }
    const filtered = CATEGORIES.map(cat=>({
      ...cat,
      forums: cat.forums.filter(f=> f.title.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q))
    })).filter(cat=>cat.forums.length>0);
    const container = document.getElementById('forum-container');
    if(filtered.length===0){ container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-dim)">Ничего не найдено по запросу "${q}"</div>`; return; }
    container.innerHTML = filtered.map(cat => `
      <div class="category">
        <div class="cat-header"><div class="cat-icon">${cat.icon}</div><div><div class="cat-title">${cat.title}</div><div class="cat-desc">${cat.desc}</div></div></div>
        <div class="forum-list">
          ${cat.forums.map(f => `
            <a href="forum.html?f=${f.id}" class="forum-node"><div class="f-icon">${f.icon}</div><div class="f-main"><h3>${f.title}</h3><p>${f.desc}</p></div><div class="f-stats"><b>${f.threads}</b><span>Тем</span><div style="height:6px"></div><b>${f.messages}</b><span>Сообщений</span></div><div class="f-last"><img src="${f.last.avatar}"><div class="f-last-info"><a>${f.last.title}</a><span>${f.last.user} • ${f.last.time}</span></div></div></a>
          `).join('')}
        </div>
      </div>
    `).join('');
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

document.addEventListener('DOMContentLoaded', ()=>{
  renderForumList();
  renderThreadList();
  renderThread();
  renderOnline();
  initSearch();
  initModals();
  
  // stats
  const totalThreads = CATEGORIES.flatMap(c=>c.forums).reduce((s,f)=>s+f.threads,0);
  const totalMessages = CATEGORIES.flatMap(c=>c.forums).reduce((s,f)=>s+f.messages,0);
  const elT = document.getElementById('stat-threads');
  const elM = document.getElementById('stat-messages');
  const elU = document.getElementById('stat-users');
  if(elT) elT.textContent = totalThreads;
  if(elM) elM.textContent = totalMessages;
  if(elU) elU.textContent = '1,243';
});
