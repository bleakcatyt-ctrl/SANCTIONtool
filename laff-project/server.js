const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = 'laff-project-super-secret-key-2025-trace-rp-clone-opening';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Simple JSON DB (no native deps) ---
const DB_PATH = path.join(__dirname, 'laff-db.json');

function loadDB(){
  if (!fs.existsSync(DB_PATH)){
    return { users: [], threads: [], posts: [], likes: [], watched: [], seq: { users:1, threads:1, posts:1, likes:1 } };
  }
  try { 
    const data = JSON.parse(fs.readFileSync(DB_PATH,'utf-8'));
    if(!data.watched) data.watched = [];
    if(!data.seq) data.seq = { users:1, threads:1, posts:1, likes:1 };
    return data;
  } catch { return { users: [], threads: [], posts: [], likes: [], watched: [], seq: { users:1, threads:1, posts:1, likes:1 } }; }
}
function saveDB(db){ fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

let DB = loadDB();

function nextId(table){
  const id = DB.seq[table] || 1;
  DB.seq[table] = id+1;
  return id;
}

// CLEAN SEED - ONLY ADMIN TIRAN FOR OPENING
function seed(){
  if (DB.users.length===0){
    const hash = bcrypt.hashSync('1213ttt3', 10);
    DB.users.push(
      { 
        id: nextId('users'), 
        username:'tiran', 
        email:'tiran@laff-project.com', 
        password_hash:hash, 
        role:'ОСНОВАТЕЛЬ', 
        avatar:'https://i.pravatar.cc/100?img=1', 
        messages:0, 
        reputation:0, 
        static_id:null, 
        created_at:new Date().toISOString(), 
        banned:0 
      }
    );
    saveDB(DB);
    console.log('✅ CLEAN SEED: Only admin tiran / 1213ttt3 created - forum ready for opening');
  }
  // NO THREADS SEED - clean forum for opening
  if (DB.threads.length>0 || DB.posts.length>0 || DB.likes.length>0){
    // If old data exists, clean it (only if user explicitly wants clean, we keep but log)
    console.log(`DB has ${DB.threads.length} threads, ${DB.posts.length} posts - forum not clean, but keeping. Delete laff-db.json to clean.`);
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
  // CLEAN: only real counts from DB, no fake + numbers
  const enriched = CATEGORIES.map(cat=>{
    const forums = cat.forums.map(f=>{
      const threadsInForum = DB.threads.filter(t=>t.forum_id===f.id);
      const postsInForum = DB.posts.filter(p=> threadsInForum.some(t=>t.id===p.thread_id));
      const lastThread = [...threadsInForum].sort((a,b)=> new Date(b.created_at)-new Date(a.created_at))[0];
      let last = null;
      if (lastThread){
        const author = findUser(lastThread.author_id);
        last = { title:lastThread.title, user:author?.username||'—', avatar:author?.avatar, time:lastThread.created_at };
      }
      return { ...f, threads: threadsInForum.length, messages: postsInForum.length, last };
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
  const users = [...DB.users].filter(u=>!u.banned).sort((a,b)=>{
    const rank = { 'ОСНОВАТЕЛЬ':0,'ГЛ. АДМИН':1,'ТЕХ. АДМИН':2,'ИГРОК':3 };
    const ra = rank[a.role]??3, rb = rank[b.role]??3;
    if (ra!==rb) return ra-rb;
    return b.messages - a.messages;
  }).slice(0,12).map(u=>({ id:u.id, name:u.username, avatar:u.avatar, role:u.role, color: u.role==='ОСНОВАТЕЛЬ'?'#ef4444': u.role.includes('АДМИН')?'#8b5cf6':'#e6e8ee' }));
  res.json(users);
});

app.get('/api/users', (req,res)=>{
  // Public users list without sensitive data
  const users = DB.users.filter(u=>!u.banned).map(u=>({
    id:u.id, username:u.username, avatar:u.avatar, role:u.role, messages:u.messages, reputation:u.reputation, created_at:u.created_at
  })).sort((a,b)=> b.messages - a.messages);
  res.json(users);
});

app.get('/api/whats-new', (req,res)=>{
  const threads = [...DB.threads].sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)).slice(0,20).map(enrichThread);
  const posts = [...DB.posts].sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)).slice(0,20).map(p=>{
    const enriched = enrichPost(p);
    const thread = DB.threads.find(t=>t.id===p.thread_id);
    return { ...enriched, threadTitle: thread?.title||'', threadId: p.thread_id };
  });
  res.json({ threads, posts });
});

// Watch thread
app.post('/api/threads/:id/watch', requireAuth, (req,res)=>{
  const threadId = parseInt(req.params.id);
  const thread = DB.threads.find(t=>t.id===threadId);
  if(!thread) return res.status(404).json({ error:'Тема не найдена' });
  
  // Ensure watched field exists
  if(!DB.watched) DB.watched = [];
  const { emailNotify } = req.body;
  
  const existing = DB.watched.find(w=>w.user_id===req.user.id && w.thread_id===threadId);
  if(existing){
    existing.emailNotify = !!emailNotify;
    existing.updated_at = new Date().toISOString();
  } else {
    DB.watched.push({
      id: nextId('likes'), // reuse seq
      user_id: req.user.id,
      thread_id: threadId,
      emailNotify: !!emailNotify,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  saveDB(DB);
  res.json({ ok:true, watching:true, emailNotify: !!emailNotify });
});

app.get('/api/threads/:id/watch', requireAuth, (req,res)=>{
  const threadId = parseInt(req.params.id);
  if(!DB.watched) DB.watched = [];
  const watch = DB.watched.find(w=>w.user_id===req.user.id && w.thread_id===threadId);
  res.json({ watching: !!watch, emailNotify: watch?.emailNotify||false });
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

// Clean endpoint for opening - delete all except tiran
app.post('/api/admin/clean-for-opening', requireAuth, requireAdmin, (req,res)=>{
  if (req.user.username !== 'tiran') return res.status(403).json({ error:'Только tiran может чистить' });
  const tiran = DB.users.find(u=>u.username==='tiran');
  DB.users = tiran ? [tiran] : [];
  DB.threads = [];
  DB.posts = [];
  DB.likes = [];
  DB.watched = [];
  DB.seq = { users: tiran ? tiran.id+1 : 1, threads:1, posts:1, likes:1 };
  // reset tiran stats
  if (tiran){ tiran.messages=0; tiran.reputation=0; }
  saveDB(DB);
  res.json({ ok:true, message:'Форум очищен для открытия. Остался только tiran' });
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
  console.log(`\n🚀 LAFF PROJECT Forum - CLEAN FOR OPENING`);
  console.log(`📁 Serving from ${__dirname}`);
  console.log(`🔑 Admin: tiran / 1213ttt3 (ОСНОВАТЕЛЬ)`);
  console.log(`💾 DB: ${DB_PATH} - Users: ${DB.users.length}, Threads: ${DB.threads.length}, Posts: ${DB.posts.length}`);
  console.log(`✨ Ready for opening - no fake data\n`);
});
