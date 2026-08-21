import { useMemo, useState } from 'react';
import {
  Bell, BellOff, Check, ChevronDown, ChevronRight, CircleHelp, FileText, Gift, Hash, Headphones,
  Image as ImageIcon, Inbox, LockKeyhole, Menu, MessageCircle, Mic, MicOff, MonitorUp, MoreHorizontal,
  Paperclip, Phone, Plus, Search, Settings, Shield, ShieldCheck, Smile, Sparkles, UserPlus, Users,
  Video, Volume2, VolumeX, X
} from 'lucide-react';

type Message = {
  id: number; author: string; avatar: string; color: string; time: string; text: string;
  reactions?: { emoji: string; count: number; active?: boolean }[];
  file?: { name: string; size: string };
};

const servers = [
  { id: 'home', label: 'C', name: 'Cipher', color: '#6c63ff' },
  { id: 'dev', label: 'DC', name: 'Dev Community', color: '#2563eb' },
  { id: 'design', label: '✦', name: 'Design Lab', color: '#db2777' },
  { id: 'game', label: 'G', name: 'Game Night', color: '#ea580c' },
];

type Channel = { name: string; kind: 'text' | 'voice'; unread?: number; users?: string[] };
const channelGroups: { name: string; channels: Channel[] }[] = [
  { name: 'ИНФОРМАЦИЯ', channels: [{ name: 'добро-пожаловать', kind: 'text' }, { name: 'объявления', kind: 'text' }] },
  { name: 'ОБЩЕНИЕ', channels: [{ name: 'общий', kind: 'text', unread: 3 }, { name: 'проекты', kind: 'text' }, { name: 'random', kind: 'text' }] },
  { name: 'ГОЛОСОВЫЕ КАНАЛЫ', channels: [{ name: 'Кофейня', kind: 'voice', users: ['MK', 'SA'] }, { name: 'Фокус-комната', kind: 'voice' }] },
];

const baseMessages: Message[] = [
  { id: 1, author: 'Миша Крылов', avatar: 'МК', color: '#e76f51', time: 'Сегодня, в 10:12', text: 'Доброе утро! 👋 Кто сегодня подключается к созвону по новому релизу?', reactions: [{ emoji: '👋', count: 4 }, { emoji: '☕', count: 2 }] },
  { id: 2, author: 'Саша Алексеева', avatar: 'СА', color: '#8b5cf6', time: 'Сегодня, в 10:14', text: 'Я буду! Уже посмотрела последние изменения — новый экран настроек выглядит отлично.' },
  { id: 3, author: 'Антон Волков', avatar: 'АВ', color: '#0ea5e9', time: 'Сегодня, в 10:16', text: 'Загрузил свежую сборку и список изменений. Всё подписано и зашифровано, как договаривались.', file: { name: 'cipher-release-notes-v2.pdf', size: '2.4 МБ · PDF' }, reactions: [{ emoji: '🔥', count: 6 }, { emoji: '🔒', count: 3, active: true }] },
  { id: 4, author: 'Миша Крылов', avatar: 'МК', color: '#e76f51', time: 'Сегодня, в 10:20', text: 'Супер. Тогда встречаемся в «Кофейне» в 11:00. @Саша, покажешь обновлённый onboarding?' },
  { id: 5, author: 'Саша Алексеева', avatar: 'СА', color: '#8b5cf6', time: 'Сегодня, в 10:22', text: 'Конечно! Подготовлю короткое демо ✨', reactions: [{ emoji: '🙌', count: 3 }] },
];

const members = [
  { name: 'Миша Крылов', note: 'Планирует релиз', initials: 'МК', color: '#e76f51', status: 'online' },
  { name: 'Саша Алексеева', note: 'Работает над дизайном', initials: 'СА', color: '#8b5cf6', status: 'online' },
  { name: 'Антон Волков', note: 'В Кофейне', initials: 'АВ', color: '#0ea5e9', status: 'online' },
  { name: 'Елена Соколова', note: 'В сети', initials: 'ЕС', color: '#10b981', status: 'online' },
  { name: 'Илья Орлов', note: 'Не беспокоить', initials: 'ИО', color: '#f59e0b', status: 'busy' },
  { name: 'Настя Белова', note: 'Была недавно', initials: 'НБ', color: '#ec4899', status: 'offline' },
  { name: 'Денис Попов', note: 'Был 2 ч. назад', initials: 'ДП', color: '#64748b', status: 'offline' },
];

function Avatar({ initials, color, size = 38, status }: { initials: string; color: string; size?: number; status?: string }) {
  return <div className="avatar" style={{ width: size, height: size, background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, #111827))`, fontSize: size * .31 }}>
    {initials}{status && <span className={`presence ${status}`} />}
  </div>;
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return <span className="tooltip-wrap">{children}<span className="tooltip">{text}</span></span>;
}

export default function App() {
  const [activeServer, setActiveServer] = useState('home');
  const [activeChannel, setActiveChannel] = useState('общий');
  const [messages, setMessages] = useState(baseMessages);
  const [draft, setDraft] = useState('');
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [memberPanel, setMemberPanel] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [modal, setModal] = useState<'security' | 'call' | 'settings' | null>(null);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => search.trim() ? messages.filter(m => `${m.author} ${m.text}`.toLowerCase().includes(search.toLowerCase())) : messages, [search, messages]);
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(''), 2600); };

  function sendMessage() {
    if (!draft.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), author: 'Алекс Морозов', avatar: 'АМ', color: '#6366f1', time: 'Только что', text: draft.trim() }]);
    setDraft('');
  }

  return <div className="app-shell">
    <aside className={`rail ${mobileNav ? 'mobile-open' : ''}`}>
      <Tooltip text="Личные сообщения"><button className="brand-mark" onClick={() => notify('Личные сообщения')}><ShieldCheck size={25}/></button></Tooltip>
      <div className="rail-separator" />
      {servers.map(server => <Tooltip key={server.id} text={server.name}><button
        className={`server ${activeServer === server.id ? 'active' : ''}`}
        style={{ '--server-color': server.color } as React.CSSProperties}
        onClick={() => { setActiveServer(server.id); notify(`Открыт сервер «${server.name}»`); }}>
        {server.label}
      </button></Tooltip>)}
      <Tooltip text="Добавить сервер"><button className="server add" onClick={() => notify('Создание сервера скоро будет доступно')}><Plus size={22}/></button></Tooltip>
      <div className="rail-spacer" />
      <Tooltip text="Скачать приложение"><button className="rail-bottom"><MonitorUp size={20}/></button></Tooltip>
    </aside>

    <aside className={`channels ${mobileNav ? 'mobile-open' : ''}`}>
      <button className="workspace-title">Cipher Community <ChevronDown size={16}/></button>
      <div className="channel-scroll">
        <button className="discover-card" onClick={() => setModal('security')}><span className="discover-icon"><Shield size={17}/></span><span><b>Приватное пространство</b><small>Шифрование включено</small></span><ChevronRight size={16}/></button>
        {channelGroups.map(group => <section className="channel-group" key={group.name}>
          <div className="group-title"><span><ChevronDown size={12}/>{group.name}</span><Plus size={15}/></div>
          {group.channels.map(channel => <div key={channel.name}>
            <button className={`channel ${activeChannel === channel.name ? 'selected' : ''}`} onClick={() => { setActiveChannel(channel.name); setMobileNav(false); }}>
              {channel.kind === 'text' ? <Hash size={18}/> : <Volume2 size={18}/>}<span>{channel.name}</span>
              {channel.unread && activeChannel !== channel.name && <b className="unread-count">{channel.unread}</b>}
              {channel.kind === 'voice' && <span className="voice-icons"><UserPlus size={14}/><Settings size={14}/></span>}
            </button>
            {channel.users?.map(user => <div className="voice-user" key={user}><Avatar initials={user} color={user === 'MK' ? '#e76f51' : '#8b5cf6'} size={24}/><span>{user === 'MK' ? 'Миша Крылов' : 'Саша Алексеева'}</span></div>)}
          </div>)}
        </section>)}
      </div>
      <div className="user-panel">
        <Avatar initials="АМ" color="#6366f1" size={34} status="online"/>
        <button className="user-copy" onClick={() => setModal('settings')}><b>Алекс Морозов</b><small>alex_m#2048</small></button>
        <div className="user-actions">
          <button onClick={() => setMuted(!muted)}>{muted ? <MicOff size={17}/> : <Mic size={17}/>}</button>
          <button onClick={() => setDeafened(!deafened)}>{deafened ? <VolumeX size={17}/> : <Headphones size={17}/>}</button>
          <button onClick={() => setModal('settings')}><Settings size={17}/></button>
        </div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu size={21}/></button>
        <Hash size={21} className="muted-icon"/><b>{activeChannel}</b><span className="top-divider"/><span className="topic">Разговоры обо всём — с уважением и по делу</span>
        <div className="header-actions">
          <Tooltip text="Уведомления"><button onClick={() => notify('Уведомления включены')}><Bell size={20}/></button></Tooltip>
          <Tooltip text="Начать звонок"><button onClick={() => setModal('call')}><Phone size={19}/></button></Tooltip>
          <Tooltip text="Участники"><button className={memberPanel ? 'active-icon' : ''} onClick={() => setMemberPanel(!memberPanel)}><Users size={20}/></button></Tooltip>
          <div className={`search ${showSearch ? 'wide' : ''}`}><input placeholder="Поиск" value={search} onFocus={() => setShowSearch(true)} onChange={e => setSearch(e.target.value)}/>{search ? <button onClick={() => setSearch('')}><X size={15}/></button> : <Search size={16}/>}</div>
          <Tooltip text="Входящие"><button><Inbox size={20}/></button></Tooltip><Tooltip text="Помощь"><button><CircleHelp size={20}/></button></Tooltip>
        </div>
      </header>

      <section className="content-wrap">
        <div className="chat">
          <div className="messages">
            <div className="channel-intro">
              <div className="channel-intro-icon"><Hash size={35}/></div>
              <h1>Добро пожаловать в #{activeChannel}!</h1>
              <p>Это начало канала #{activeChannel}. Все сообщения защищены сквозным шифрованием.</p>
              <button onClick={() => setModal('security')}><LockKeyhole size={14}/> Подробнее о защите</button>
            </div>
            <div className="date-line"><span>21 августа 2026 г.</span></div>
            {filtered.map(message => <article className="message" key={message.id}>
              <Avatar initials={message.avatar} color={message.color}/>
              <div className="message-body"><div className="message-meta"><b>{message.author}</b><time>{message.time}</time>{message.id === 3 && <span className="verified"><ShieldCheck size={12}/> проверено</span>}</div>
                <p>{message.text}</p>
                {message.file && <button className="file-card" onClick={() => notify('Файл проверен и готов к расшифровке')}><span><FileText size={24}/></span><div><b>{message.file.name}</b><small>{message.file.size}</small></div><span className="file-lock"><LockKeyhole size={14}/></span></button>}
                {message.reactions && <div className="reactions">{message.reactions.map(r => <button className={r.active ? 'active' : ''} key={r.emoji} onClick={() => notify(`Реакция ${r.emoji} добавлена`)}>{r.emoji} <b>{r.count}</b></button>)}<button><Smile size={14}/></button></div>}
              </div>
              <div className="message-actions"><button><Smile size={16}/></button><button><MessageCircle size={16}/></button><button><MoreHorizontal size={16}/></button></div>
            </article>)}
            {filtered.length === 0 && <div className="no-results"><Search size={25}/><b>Ничего не найдено</b><span>Попробуйте изменить поисковый запрос</span></div>}
          </div>
          <div className="composer-wrap">
            <div className="encryption-note"><ShieldCheck size={12}/> Сквозное шифрование активно</div>
            <div className="composer"><button><Plus size={20}/></button><textarea rows={1} value={draft} placeholder={`Написать #${activeChannel}`} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}/><button><Gift size={19}/></button><button><ImageIcon size={19}/></button><button><Smile size={19}/></button></div>
          </div>
        </div>

        {memberPanel && <aside className="members">
          <div className="member-heading">В СЕТИ — 5</div>
          {members.slice(0,5).map(member => <button className="member" key={member.name} onClick={() => notify(`Профиль: ${member.name}`)}><Avatar initials={member.initials} color={member.color} size={34} status={member.status}/><span><b>{member.name}</b><small>{member.note}</small></span></button>)}
          <div className="member-heading">НЕ В СЕТИ — 2</div>
          {members.slice(5).map(member => <button className="member offline-member" key={member.name}><Avatar initials={member.initials} color={member.color} size={34} status={member.status}/><span><b>{member.name}</b><small>{member.note}</small></span></button>)}
          <div className="secure-room"><ShieldCheck size={18}/><div><b>Защищённая комната</b><p>Ключи обновлены 8 мин. назад</p></div><Check size={15}/></div>
        </aside>}
      </section>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={() => setModal(null)}><div className="modal" onMouseDown={e => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setModal(null)}><X size={19}/></button>
      {modal === 'security' && <><div className="modal-hero security"><ShieldCheck size={30}/></div><h2>Ваши разговоры защищены</h2><p className="modal-lead">Сообщения, файлы и звонки в Cipher используют сквозное шифрование. Только участники беседы могут получить доступ к содержимому.</p><div className="security-list"><div><LockKeyhole/><span><b>Ключи только на устройствах</b><small>Приватные ключи никогда не покидают ваше устройство</small></span></div><div><Sparkles/><span><b>Perfect Forward Secrecy</b><small>Ключи регулярно обновляются автоматически</small></span></div><div><Shield/><span><b>Проверка подлинности</b><small>Каждое сообщение подписано отправителем</small></span></div></div><button className="primary" onClick={() => setModal(null)}>Понятно</button></>}
      {modal === 'call' && <><div className="call-avatars"><Avatar initials="АМ" color="#6366f1" size={76}/><div className="call-line"/><Avatar initials="МК" color="#e76f51" size={76}/></div><h2>Начать защищённый звонок?</h2><p className="modal-lead">Подключение к каналу «{activeChannel}» будет защищено DTLS-SRTP.</p><div className="call-actions"><button className="call-btn video" onClick={() => { setModal(null); notify('Видеозвонок начат'); }}><Video/>С видео</button><button className="call-btn audio" onClick={() => { setModal(null); notify('Голосовой звонок начат'); }}><Phone/>Только аудио</button></div></>}
      {modal === 'settings' && <><div className="modal-hero"><Settings size={29}/></div><h2>Настройки пользователя</h2><div className="settings-row"><span><b>Двухфакторная аутентификация</b><small>Дополнительная защита аккаунта</small></span><button className="toggle on"><span/></button></div><div className="settings-row"><span><b>Звуки уведомлений</b><small>Входящие сообщения и звонки</small></span><button className="toggle"><span/></button></div><div className="settings-row"><span><b>Статус в сети</b><small>Показывать активность друзьям</small></span><button className="toggle on"><span/></button></div><button className="primary" onClick={() => setModal(null)}>Сохранить настройки</button></>}
    </div></div>}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}
