const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = 'laff-project-super-secret-key-2025-trace-rp-clone';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Simple JSON DB (no native deps) ---
const DB_PATH = path.join(__dirname, 'laff-db.json');

function loadDB(){
  if (!fs.existsSync(DB_PATH)){
    return { users: [], threads: [], posts: [], likes: [], seq: { users:1, threads:1, posts:1, likes:1 } };
  }
  try { return JSON.parse(fs.readFileSync(DB_PATH,'utf-8')); } catch { return { users: [], threads: [], posts: [], likes: [], seq: { users:1, threads:1, posts:1, likes:1 } }; }
}
function saveDB(db){ fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

let DB = loadDB();

function nextId(table){
  const id = DB.seq[table] || 1;
  DB.seq[table] = id+1;
  return id;
}

function seed(){
  if (DB.users.length===0){
    const hash = bcrypt.hashSync('laff2025', 10);
    DB.users.push(
      { id: nextId('users'), username:'Maestro', email:'maestro@laff-project.com', password_hash:hash, role:'ОСНОВАТЕЛЬ', avatar:'https://i.pravatar.cc/100?img=1', messages:1243, reputation:999, static_id:null, created_at:new Date().toISOString(), banned:0 },
      { id: nextId('users'), username:'Paranoia', email:'paranoia@laff-project.com', password_hash:hash, role:'ТЕХ. АДМИН', avatar:'https://i.pravatar.cc/100?img=5', messages:892, reputation:456, static_id:null, created_at:new Date().toISOString(), banned:0 },
      { id: nextId('users'), username:'Laff_Admin', email:'admin@laff-project.com', password_hash:hash, role:'ГЛ. АДМИН', avatar:'https://i.pravatar.cc/100?img=2', messages:567, reputation:342, static_id:null, created_at:new Date().toISOString(), banned:0 },
      { id: nextId('users'), username:'enjoylaff', email:'enjoylaff@laff-project.com', password_hash:bcrypt.hashSync('12345678',10), role:'ИГРОК', avatar:'https://i.pravatar.cc/100?img=3', messages:342, reputation:24, static_id:'19583', created_at:new Date().toISOString(), banned:0 }
    );
    saveDB(DB);
    console.log('Seeded users: Maestro/laff2025 etc');
  }
  if (DB.threads.length===0){
    const maestro = DB.users.find(u=>u.username==='Maestro');
    const paranoia = DB.users.find(u=>u.username==='Paranoia');
    const enjoy = DB.users.find(u=>u.username==='enjoylaff');
    const now = new Date().toISOString();
    DB.threads.push(
      { id: nextId('threads'), forum_id:'news', title:'Обновление 2.4 - Новый сезон LAFF PROJECT', content:'Приветствуем, дорогие игроки LAFF PROJECT! Мы рады представить вам глобальное обновление 2.4 - новый сезон с кучей контента:\n\n• Новая система семей и войн за территории\n• Переработанная экономика\n• 15 новых автомобилей\n• Новые работы и квесты\n• Улучшена оптимизация RAGE MP\n• Исправлены баги с инвентарем\n\nIP сервера: play.laff-project.com\n\nЖдем вас на открытии!', author_id:maestro.id, pinned:1, locked:0, views:2291, likes:42, created_at:now, updated_at:now },
      { id: nextId('threads'), forum_id:'news', title:'Открытие сервера LAFF PROJECT | 01.06.2025', content:'Долгожданное открытие LAFF PROJECT состоялось! IP: play.laff-project.com\n\nБонусы для новичков:\n- $50,000 на старт\n- Премиум на 3 дня\n- Кейс с одеждой\n\nЖдем всех!', author_id:maestro.id, pinned:1, locked:0, views:5432, likes:128, created_at:now, updated_at:now },
      { id: nextId('threads'), forum_id:'server-rules', title:'Правила игровых зон', content:'1. Green zone - густонаселенная гражданскими территория, в которой запрещены любые криминальные действия. Запрещены любые перестрелки / стрельба. | Demorgan 20-45 минут.\n\n2. Red zone - криминальная зона, где разрешены любые криминальные действия без причины.\n\n3. Желтая зона - нейтральная зона.', author_id:maestro.id, pinned:1, locked:0, views:2202, likes:12, created_at:now, updated_at:now },
      { id: nextId('threads'), forum_id:'mafia', title:'Заявление на пост лидера The Fam', content:'1. Имя Фамилия IC: John Laff\n2. Опыт лидера: FIB, Administrator Aqua Project, Majestic Chicago Lead Vagos, Lead Fam 50 человек, Lead LSSD, Dep Lead Bloods x4, Lead FIB\n3. Состав: 50+ человек\n4. Discord: enjoylaff\n5. ID: 19583\n6. Онлайн: 6-8 часов\n\nГотов развивать фракцию, делать RP и капты.', author_id:enjoy.id, pinned:0, locked:0, views:445, likes:23, created_at:now, updated_at:now },
      { id: nextId('threads'), forum_id:'faq', title:'Часто задаваемые вопросы', content:'Способ 1: Запустите RAGE MP В поиске найдите LAFF PROJECT Нажмите — и заходите!\n\nСпособ 2: Запустите RAGE MP В правом верхнем углу нажмите "Прямое подключение" Введите IP: play.laff-project.com Заходите!\n\nРешение ошибок:\n- Multiplayer Started: Перезапустите ПК, запустите от админа, переустановите RAGE MP\n- ERR_GAMECONFIG_1: Переустановите RAGE MP, проверьте целостность GTA V\n- Не скачивается сервер: Удалите моды, отключите антивирус, проверьте сохранение в одиночке', author_id:maestro.id, pinned:1, locked:0, views:2291, likes:15, created_at:now, updated_at:now }
    );
    // seed posts
    const t1 = DB.threads[0].id;
    DB.posts.push(
      { id: nextId('posts'), thread_id:t1, content:'Поддерживаю! Форум выглядит 1 в 1 как Trace, только даже лучше. Тёмная тема топ, всё читается. Когда открытие нового сезона?', author_id:enjoy.id, likes:5, created_at:now },
      { id: nextId('posts'), thread_id:t1, content:'Открытие уже скоро. Следите за новостями в Discord: discord.gg/laff-project', author_id:paranoia.id, likes:3, created_at:now }
    );
    saveDB(DB);
    console.log('Seeded threads & posts');
  }
}
seed();

// Helpers
function findUser(id){ return DB.users.find(u=>u.id===id); }
function enrichThread(t){
  const author = findUser(t.author_id);
  const replies = DB.posts.filter(p=>p.thread_id===t.id).length;
  return { ...t, author: author?.username||'—', avatar: author?.avatar, role: author?.role||'ИГРОК', author_messages: author?.messages||0, author_rep: author?.reputation||0, replies };
}
function enrichPost(p){
  const author = findUser(p.author_id);
  return { ...p, author: author?.username||'—', avatar: author?.avatar, role: author?.role||'ИГРОК', author_messages: author?.messages||0, author_rep: author?.reputation||0 };
}

// Auth middleware
function authMiddleware(req,res,next){
  const header = req.headers.authorization;
  if (!header){ req.user=null; return next(); }
  const token = header.replace('Bearer ','');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const u = DB.users.find(x=>x.id===decoded.id);
    if (u) req.user = { id:u.id, username:u.username, email:u.email, role:u.role, avatar:u.avatar, messages:u.messages, reputation:u.reputation, banned:u.banned };
    else req.user=null;
  } catch { req.user=null; }
  next();
}
function requireAuth(req,res,next){
  if (!req.user) return res.status(401).json({ error:'Требуется авторизация' });
  if (req.user.banned) return res.status(403).json({ error:'Вы забанены' });
  next();
}
function requireAdmin(req,res,next){
  if (!req.user || !['ОСНОВАТЕЛЬ','ГЛ. АДМИН','ТЕХ. АДМИН'].includes(req.user.role)) return res.status(403).json({ error:'Нет прав администратора' });
  next();
}

app.use(authMiddleware);

// Forums.json
const forumsPath = path.join(__dirname, 'forums.json');
let CATEGORIES = [];
if (fs.existsSync(forumsPath)) CATEGORIES = JSON.parse(fs.readFileSync(forumsPath,'utf-8'));

// API
app.post('/api/register', (req,res)=>{
  const { username, email, password, static_id } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error:'Заполните все поля' });
  if (password.length < 6) return res.status(400).json({ error:'Пароль минимум 6 символов' });
  if (username.length < 3) return res.status(400).json({ error:'Ник минимум 3 символа' });
  if (DB.users.find(u=>u.username===username || u.email===email)) return res.status(400).json({ error:'Пользователь с таким ником или email уже существует' });
  const hash = bcrypt.hashSync(password,10);
  const user = { id: nextId('users'), username, email, password_hash:hash, role:'ИГРОК', avatar:`https://i.pravatar.cc/100?img=${Math.floor(Math.random()*70)+1}`, messages:0, reputation:0, static_id: static_id||null, created_at:new Date().toISOString(), banned:0 };
  DB.users.push(user); saveDB(DB);
  const token = jwt.sign({ id:user.id }, JWT_SECRET, { expiresIn:'30d' });
  res.json({ token, user: { id:user.id, username:user.username, email:user.email, role:user.role, avatar:user.avatar } });
});

app.post('/api/login', (req,res)=>{
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error:'Заполните поля' });
  const user = DB.users.find(u=>u.username===login || u.email===login);
  if (!user) return res.status(400).json({ error:'Пользователь не найден' });
  if (!bcrypt.compareSync(password, user.password_hash)) return res.status(400).json({ error:'Неверный пароль' });
  if (user.banned) return res.status(403).json({ error:'Аккаунт забанен' });
  const token = jwt.sign({ id:user.id }, JWT_SECRET, { expiresIn:'30d' });
  res.json({ token, user: { id:user.id, username:user.username, email:user.email, role:user.role, avatar:user.avatar, messages:user.messages, reputation:user.reputation } });
});

app.get('/api/me', requireAuth, (req,res)=>{ res.json(req.user); });

app.get('/api/forums', (req,res)=>{
  const enriched = CATEGORIES.map(cat=>{
    const forums = cat.forums.map(f=>{
      const threadsInForum = DB.threads.filter(t=>t.forum_id===f.id);
      const postsInForum = DB.posts.filter(p=> threadsInForum.some(t=>t.id===p.thread_id));
      const lastThread = [...threadsInForum].sort((a,b)=> new Date(b.created_at)-new Date(a.created_at))[0];
      let last = f.last;
      if (lastThread){
        const author = findUser(lastThread.author_id);
        last = { title:lastThread.title, user:author?.username||'—', avatar:author?.avatar, time:lastThread.created_at };
      }
      return { ...f, threads: threadsInForum.length + (f.threads||0), messages: threadsInForum.length + postsInForum.length + (f.messages||0), last };
    });
    return { ...cat, forums };
  });
  res.json(enriched);
});

app.get('/api/threads', (req,res)=>{
  const { forum_id, search } = req.query;
  let threads = DB.threads.slice();
  if (forum_id) threads = threads.filter(t=>t.forum_id===forum_id);
  if (search) {
    const s = search.toLowerCase();
    threads = threads.filter(t=> t.title.toLowerCase().includes(s) || t.content.toLowerCase().includes(s));
  }
  threads = threads.sort((a,b)=>{
    if (a.pinned!==b.pinned) return b.pinned - a.pinned;
    return new Date(b.created_at) - new Date(a.created_at);
  }).slice(0,100).map(enrichThread);
  res.json(threads);
});

app.get('/api/threads/:id', (req,res)=>{
  const id = parseInt(req.params.id);
  const thread = DB.threads.find(t=>t.id===id);
  if (!thread) return res.status(404).json({ error:'Тема не найдена' });
  thread.views = (thread.views||0)+1;
  saveDB(DB);
  const posts = DB.posts.filter(p=>p.thread_id===id).sort((a,b)=> new Date(a.created_at)-new Date(b.created_at)).map(enrichPost);
  res.json({ ...enrichThread(thread), views: thread.views, posts });
});

app.post('/api/threads', requireAuth, (req,res)=>{
  const { forum_id, title, content } = req.body;
  if (!forum_id || !title || !content) return res.status(400).json({ error:'Заполните все поля' });
  if (title.length<3) return res.status(400).json({ error:'Заголовок слишком короткий' });
  const thread = { id: nextId('threads'), forum_id, title, content, author_id:req.user.id, pinned:0, locked:0, views:0, likes:0, created_at:new Date().toISOString(), updated_at:new Date().toISOString() };
  DB.threads.push(thread);
  const user = DB.users.find(u=>u.id===req.user.id);
  if (user) user.messages++;
  saveDB(DB);
  res.json(enrichThread(thread));
});

app.post('/api/threads/:id/replies', requireAuth, (req,res)=>{
  const threadId = parseInt(req.params.id);
  const thread = DB.threads.find(t=>t.id===threadId);
  if (!thread) return res.status(404).json({ error:'Тема не найдена' });
  if (thread.locked) return res.status(403).json({ error:'Тема закрыта' });
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error:'Введите сообщение' });
  const post = { id: nextId('posts'), thread_id:threadId, content, author_id:req.user.id, likes:0, created_at:new Date().toISOString() };
  DB.posts.push(post);
  thread.updated_at = new Date().toISOString();
  const user = DB.users.find(u=>u.id===req.user.id);
  if (user) user.messages++;
  saveDB(DB);
  res.json(enrichPost(post));
});

app.post('/api/threads/:id/like', requireAuth, (req,res)=>{
  const threadId = parseInt(req.params.id);
  const thread = DB.threads.find(t=>t.id===threadId);
  if (!thread) return res.status(404).json({ error:'Тема не найдена' });
  const existingIdx = DB.likes.findIndex(l=>l.user_id===req.user.id && l.thread_id===threadId && !l.post_id);
  if (existingIdx!==-1){
    DB.likes.splice(existingIdx,1);
    thread.likes = Math.max(0,(thread.likes||0)-1);
    const author = DB.users.find(u=>u.id===thread.author_id);
    if (author) author.reputation = Math.max(0,(author.reputation||0)-1);
    saveDB(DB);
    return res.json({ liked:false });
  } else {
    DB.likes.push({ id: nextId('likes'), user_id:req.user.id, thread_id:threadId, post_id:null, created_at:new Date().toISOString() });
    thread.likes = (thread.likes||0)+1;
    const author = DB.users.find(u=>u.id===thread.author_id);
    if (author) author.reputation = (author.reputation||0)+1;
    saveDB(DB);
    return res.json({ liked:true });
  }
});

app.post('/api/posts/:id/like', requireAuth, (req,res)=>{
  const postId = parseInt(req.params.id);
  const post = DB.posts.find(p=>p.id===postId);
  if (!post) return res.status(404).json({ error:'Пост не найден' });
  const existingIdx = DB.likes.findIndex(l=>l.user_id===req.user.id && l.post_id===postId);
  if (existingIdx!==-1){
    DB.likes.splice(existingIdx,1);
    post.likes = Math.max(0,(post.likes||0)-1);
    const author = DB.users.find(u=>u.id===post.author_id);
    if (author) author.reputation = Math.max(0,(author.reputation||0)-1);
    saveDB(DB);
    return res.json({ liked:false });
  } else {
    DB.likes.push({ id: nextId('likes'), user_id:req.user.id, thread_id:null, post_id:postId, created_at:new Date().toISOString() });
    post.likes = (post.likes||0)+1;
    const author = DB.users.find(u=>u.id===post.author_id);
    if (author) author.reputation = (author.reputation||0)+1;
    saveDB(DB);
    return res.json({ liked:true });
  }
});

app.get('/api/online', (req,res)=>{
  const users = [...DB.users].sort((a,b)=>{
    const rank = { 'ОСНОВАТЕЛЬ':0,'ГЛ. АДМИН':1,'ТЕХ. АДМИН':2,'ИГРОК':3 };
    const ra = rank[a.role]??3, rb = rank[b.role]??3;
    if (ra!==rb) return ra-rb;
    return b.messages - a.messages;
  }).slice(0,12).map(u=>({ id:u.id, name:u.username, avatar:u.avatar, role:u.role, color: u.role==='ОСНОВАТЕЛЬ'?'#ef4444': u.role.includes('АДМИН')?'#8b5cf6':'#e6e8ee' }));
  res.json(users);
});

app.get('/api/stats', (req,res)=>{
  res.json({ threads: DB.threads.length, messages: DB.threads.length + DB.posts.length, users: DB.users.length });
});

// Admin
app.get('/api/admin/users', requireAuth, requireAdmin, (req,res)=>{
  res.json(DB.users.map(u=>({ id:u.id, username:u.username, email:u.email, role:u.role, avatar:u.avatar, messages:u.messages, reputation:u.reputation, banned:u.banned, created_at:u.created_at })).sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)));
});
app.post('/api/admin/users/:id/ban', requireAuth, requireAdmin, (req,res)=>{
  const u = DB.users.find(x=>x.id===parseInt(req.params.id));
  if (u){ u.banned=1; saveDB(DB); }
  res.json({ ok:true });
});
app.post('/api/admin/users/:id/unban', requireAuth, requireAdmin, (req,res)=>{
  const u = DB.users.find(x=>x.id===parseInt(req.params.id));
  if (u){ u.banned=0; saveDB(DB); }
  res.json({ ok:true });
});
app.post('/api/admin/users/:id/role', requireAuth, requireAdmin, (req,res)=>{
  const u = DB.users.find(x=>x.id===parseInt(req.params.id));
  if (u){ u.role=req.body.role; saveDB(DB); }
  res.json({ ok:true });
});
app.delete('/api/admin/threads/:id', requireAuth, requireAdmin, (req,res)=>{
  const id = parseInt(req.params.id);
  DB.threads = DB.threads.filter(t=>t.id!==id);
  DB.posts = DB.posts.filter(p=>p.thread_id!==id);
  DB.likes = DB.likes.filter(l=>l.thread_id!==id);
  saveDB(DB);
  res.json({ ok:true });
});
app.post('/api/admin/threads/:id/pin', requireAuth, requireAdmin, (req,res)=>{
  const t = DB.threads.find(x=>x.id===parseInt(req.params.id));
  if (t){ t.pinned = t.pinned?0:1; saveDB(DB); res.json({ pinned: !!t.pinned }); } else res.status(404).json({ error:'Not found' });
});
app.post('/api/admin/threads/:id/lock', requireAuth, requireAdmin, (req,res)=>{
  const t = DB.threads.find(x=>x.id===parseInt(req.params.id));
  if (t){ t.locked = t.locked?0:1; saveDB(DB); res.json({ locked: !!t.locked }); } else res.status(404).json({ error:'Not found' });
});
app.delete('/api/admin/posts/:id', requireAuth, requireAdmin, (req,res)=>{
  DB.posts = DB.posts.filter(p=>p.id!==parseInt(req.params.id));
  saveDB(DB);
  res.json({ ok:true });
});

// Static
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname,'assets')));

app.get('*', (req,res)=>{
  if (req.path.startsWith('/api/')) return res.status(404).json({ error:'Not found' });
  const file = req.path==='/' ? 'index.html' : req.path.slice(1);
  const full = path.join(__dirname, file);
  if (fs.existsSync(full) && fs.statSync(full).isFile()) return res.sendFile(full);
  if (fs.existsSync(path.join(__dirname,'index.html'))) return res.sendFile(path.join(__dirname,'index.html'));
  res.status(404).send('Not found');
});

app.listen(PORT,'0.0.0.0',()=>{
  console.log(`\n🚀 LAFF PROJECT Forum v2 running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving from ${__dirname}`);
  console.log(`🔑 Admin logins: Maestro / laff2025, Paranoia / laff2025, Laff_Admin / laff2025`);
  console.log(`💾 DB: ${DB_PATH} (JSON, no native deps)`);
  console.log(`✨ Features: WYSIWYG editor, Likes, Admin panel, JWT auth, Search\n`);
});
