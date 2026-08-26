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

// --- Simple JSON DB ---
const DB_PATH = path.join(__dirname, 'laff-db.json');

function loadDB(){
  const empty = { users: [], threads: [], posts: [], likes: [], watched: [], roles: [], seq: { users:1, threads:1, posts:1, likes:1, roles:1 } };
  if (!fs.existsSync(DB_PATH)) return empty;
  try { 
    const data = JSON.parse(fs.readFileSync(DB_PATH,'utf-8'));
    if(!data.watched) data.watched = [];
    if(!data.roles) data.roles = [];
    if(!data.likes) data.likes = [];
    if(!data.seq) data.seq = { users:1, threads:1, posts:1, likes:1, roles:1 };
    if(!data.seq.roles) data.seq.roles = 1;
    return data;
  } catch { return empty; }
}
function saveDB(db){ fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

let DB = loadDB();

function nextId(table){
  const id = DB.seq[table] || 1;
  DB.seq[table] = id+1;
  return id;
}

function stringToColor(str){
  if(!str) return '#4b5563';
  let hash=0;
  for(let i=0;i<str.length;i++) hash = str.charCodeAt(i) + ((hash<<5)-hash);
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0,6-c.length) + c;
}

// Default roles like XenForo
const DEFAULT_ROLES = [
  { name: 'ИГРОК', color: '#4b5563', permissions: { viewForum:true, createThread:true, replyThread:true, uploadAvatar:true, editOwnProfile:true }, isAdmin:false, isFounder:false, priority:0 },
  { name: 'Модератор', color: '#16a34a', permissions: { viewForum:true, createThread:true, replyThread:true, uploadAvatar:true, editOwnProfile:true, deletePost:true, deleteThread:true, lockThread:true, banUser:false, manageUsers:false, manageRoles:false, viewAdmin:false }, isAdmin:false, isFounder:false, priority:10 },
  { name: 'ТЕХ. АДМИН', color: '#8b5cf6', permissions: { viewForum:true, createThread:true, replyThread:true, uploadAvatar:true, editOwnProfile:true, deletePost:true, deleteThread:true, lockThread:true, pinThread:true, banUser:true, manageUsers:true, manageRoles:false, viewAdmin:true }, isAdmin:true, isFounder:false, priority:50 },
  { name: 'ГЛ. АДМИН', color: '#dc2626', permissions: { viewForum:true, createThread:true, replyThread:true, uploadAvatar:true, editOwnProfile:true, deletePost:true, deleteThread:true, lockThread:true, pinThread:true, banUser:true, manageUsers:true, manageRoles:true, viewAdmin:true }, isAdmin:true, isFounder:false, priority:90 },
  { name: 'ОСНОВАТЕЛЬ', color: '#ef4444', permissions: { viewForum:true, createThread:true, replyThread:true, uploadAvatar:true, editOwnProfile:true, deletePost:true, deleteThread:true, lockThread:true, pinThread:true, banUser:true, manageUsers:true, manageRoles:true, viewAdmin:true, isFounder:true }, isAdmin:true, isFounder:true, priority:100 }
];

function seed(){
  // Seed roles if empty
  if (DB.roles.length===0){
    DEFAULT_ROLES.forEach(r=>{
      DB.roles.push({ id: nextId('roles'), ...r, created_at: new Date().toISOString() });
    });
    saveDB(DB);
    console.log('✅ Seeded roles:', DB.roles.map(r=>r.name).join(', '));
  }

  // Seed only tiran admin
  if (DB.users.length===0){
    const hash = bcrypt.hashSync('1213ttt3b', 10);
    DB.users.push(
      { 
        id: nextId('users'), 
        username:'tiran', 
        email:'tiran@laff-project.com', 
        password_hash:hash, 
        role:'ОСНОВАТЕЛЬ', 
        avatar:'', // No random avatar - empty, will show letter
        messages:0, 
        reputation:0, 
        static_id:null, 
        created_at:new Date().toISOString(), 
        banned:0,
        profile: {}
      }
    );
    saveDB(DB);
    console.log('✅ CLEAN SEED: Only admin tiran / 1213ttt3b created - CLEAN FOR OPENING');
  }
}
seed();

// Helpers
function findUser(id){ return DB.users.find(u=>u.id===id); }
function findRole(name){ return DB.roles.find(r=>r.name===name); }
function getRolePerms(roleName){
  const role = findRole(roleName);
  return role ? role.permissions : {};
}
function enrichThread(t){
  const author = findUser(t.author_id);
  const replies = DB.posts.filter(p=>p.thread_id===t.id).length;
  const role = author ? findRole(author.role) : null;
  return { ...t, author: author?.username||'—', avatar: author?.avatar||'', role: author?.role||'ИГРОК', roleColor: role?.color||'#4b5563', author_messages: author?.messages||0, author_rep: author?.reputation||0, replies };
}
function enrichPost(p){
  const author = findUser(p.author_id);
  const role = author ? findRole(author.role) : null;
  return { ...p, author: author?.username||'—', avatar: author?.avatar||'', role: author?.role||'ИГРОК', roleColor: role?.color||'#4b5563', author_messages: author?.messages||0, author_rep: author?.reputation||0 };
}

// Auth middleware
function authMiddleware(req,res,next){
  const header = req.headers.authorization;
  if (!header){ req.user=null; return next(); }
  const token = header.replace('Bearer ','');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const u = DB.users.find(x=>x.id===decoded.id);
    if (u) {
      const role = findRole(u.role);
      req.user = { 
        id:u.id, username:u.username, email:u.email, role:u.role, roleColor: role?.color||'#4b5563', 
        avatar:u.avatar, messages:u.messages, reputation:u.reputation, banned:u.banned,
        permissions: role?.permissions||{}, profile: u.profile||{}
      };
    } else req.user=null;
  } catch { req.user=null; }
  next();
}
function requireAuth(req,res,next){
  if (!req.user) return res.status(401).json({ error:'Требуется авторизация' });
  if (req.user.banned) return res.status(403).json({ error:'Вы забанены' });
  next();
}
function requireAdmin(req,res,next){
  if (!req.user) return res.status(403).json({ error:'Нет прав' });
  const role = findRole(req.user.role);
  if (!role || !role.isAdmin) return res.status(403).json({ error:'Нет прав администратора' });
  next();
}
function requireFounder(req,res,next){
  if (!req.user) return res.status(403).json({ error:'Нет прав' });
  const role = findRole(req.user.role);
  if (!role || !role.isFounder) return res.status(403).json({ error:'Только основатель' });
  next();
}

app.use(authMiddleware);

// Forums.json
const forumsPath = path.join(__dirname, 'forums.json');
let CATEGORIES = [];
if (fs.existsSync(forumsPath)) CATEGORIES = JSON.parse(fs.readFileSync(forumsPath,'utf-8'));

// API - Auth
app.post('/api/register', (req,res)=>{
  const { username, email, password, static_id } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error:'Заполните все поля' });
  if (password.length < 6) return res.status(400).json({ error:'Пароль минимум 6 символов' });
  if (username.length < 3) return res.status(400).json({ error:'Ник минимум 3 символа' });
  if (DB.users.find(u=>u.username===username || u.email===email)) return res.status(400).json({ error:'Пользователь с таким ником или email уже существует' });
  const hash = bcrypt.hashSync(password,10);
  // NO RANDOM AVATAR - empty, will show letter in frontend
  const user = { 
    id: nextId('users'), username, email, password_hash:hash, role:'ИГРОК', 
    avatar:'', // Empty - no random avatar
    messages:0, reputation:0, static_id: static_id||null, created_at:new Date().toISOString(), banned:0, profile:{} 
  };
  DB.users.push(user); saveDB(DB);
  const token = jwt.sign({ id:user.id }, JWT_SECRET, { expiresIn:'30d' });
  const role = findRole(user.role);
  res.json({ token, user: { id:user.id, username:user.username, email:user.email, role:user.role, roleColor:role?.color, avatar:user.avatar } });
});

app.post('/api/login', (req,res)=>{
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error:'Заполните поля' });
  const user = DB.users.find(u=>u.username===login || u.email===login);
  if (!user) return res.status(400).json({ error:'Пользователь не найден' });
  if (!bcrypt.compareSync(password, user.password_hash)) return res.status(400).json({ error:'Неверный пароль' });
  if (user.banned) return res.status(403).json({ error:'Аккаунт забанен' });
  const token = jwt.sign({ id:user.id }, JWT_SECRET, { expiresIn:'30d' });
  const role = findRole(user.role);
  res.json({ token, user: { id:user.id, username:user.username, email:user.email, role:user.role, roleColor:role?.color, avatar:user.avatar, messages:user.messages, reputation:user.reputation } });
});

app.get('/api/me', requireAuth, (req,res)=>{ res.json(req.user); });

// Forums
app.get('/api/forums', (req,res)=>{
  const enriched = CATEGORIES.map(cat=>{
    const forums = cat.forums.map(f=>{
      const threadsInForum = DB.threads.filter(t=>t.forum_id===f.id);
      const postsInForum = DB.posts.filter(p=> threadsInForum.some(t=>t.id===p.thread_id));
      const lastThread = [...threadsInForum].sort((a,b)=> new Date(b.created_at)-new Date(a.created_at))[0];
      let last = null;
      if (lastThread){
        const author = findUser(lastThread.author_id);
        last = { title:lastThread.title, user:author?.username||'—', avatar:author?.avatar||'', time:lastThread.created_at };
      }
      return { ...f, threads: threadsInForum.length, messages: postsInForum.length, last };
    });
    return { ...cat, forums };
  });
  res.json(enriched);
});

// Threads
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
  if(!req.user.permissions.createThread) return res.status(403).json({ error:'Нет прав создавать темы' });
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
  if(!req.user.permissions.replyThread) return res.status(403).json({ error:'Нет прав отвечать' });
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

// Likes
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

// Users & stats
app.get('/api/online', (req,res)=>{
  const users = [...DB.users].filter(u=>!u.banned).sort((a,b)=>{
    const ra = findRole(a.role)?.priority||0;
    const rb = findRole(b.role)?.priority||0;
    if (ra!==rb) return rb-ra;
    return b.messages - a.messages;
  }).slice(0,12).map(u=>{
    const role = findRole(u.role);
    return { id:u.id, name:u.username, avatar:u.avatar||'', role:u.role, color: role?.color||'#4b5563' };
  });
  res.json(users);
});

app.get('/api/users', (req,res)=>{
  const users = DB.users.filter(u=>!u.banned).map(u=>{
    const role = findRole(u.role);
    return {
      id:u.id, username:u.username, avatar:u.avatar||'', role:u.role, roleColor: role?.color||'#4b5563',
      messages:u.messages, reputation:u.reputation, created_at:u.created_at, profile: u.profile||{}
    };
  }).sort((a,b)=> b.messages - a.messages);
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

// Roles - XenForo-like editable
app.get('/api/roles', (req,res)=>{
  res.json(DB.roles.sort((a,b)=> a.priority - b.priority));
});

app.post('/api/roles', requireAuth, requireFounder, (req,res)=>{
  const { name, color, permissions, isAdmin, isFounder, priority } = req.body;
  if(!name) return res.status(400).json({ error:'Название обязательно' });
  if(DB.roles.find(r=>r.name===name)) return res.status(400).json({ error:'Роль уже существует' });
  
  const role = {
    id: nextId('roles'),
    name,
    color: color||'#4b5563',
    permissions: permissions||{ viewForum:true, createThread:true, replyThread:true },
    isAdmin: !!isAdmin,
    isFounder: !!isFounder,
    priority: priority||0,
    created_at: new Date().toISOString()
  };
  DB.roles.push(role);
  saveDB(DB);
  res.json(role);
});

app.put('/api/roles/:id', requireAuth, requireFounder, (req,res)=>{
  const id = parseInt(req.params.id);
  const role = DB.roles.find(r=>r.id===id);
  if(!role) return res.status(404).json({ error:'Роль не найдена' });
  if(role.name==='ОСНОВАТЕЛЬ' && req.user.username!=='tiran') return res.status(403).json({ error:'Только tiran может менять основателя' });
  
  const { name, color, permissions, isAdmin, isFounder, priority } = req.body;
  if(name) {
    // Update users with old role name
    DB.users.forEach(u=>{ if(u.role===role.name) u.role=name; });
    role.name = name;
  }
  if(color) role.color = color;
  if(permissions) role.permissions = permissions;
  if(typeof isAdmin==='boolean') role.isAdmin = isAdmin;
  if(typeof isFounder==='boolean') role.isFounder = isFounder;
  if(typeof priority==='number') role.priority = priority;
  role.updated_at = new Date().toISOString();
  
  saveDB(DB);
  res.json(role);
});

app.delete('/api/roles/:id', requireAuth, requireFounder, (req,res)=>{
  const id = parseInt(req.params.id);
  const role = DB.roles.find(r=>r.id===id);
  if(!role) return res.status(404).json({ error:'Роль не найдена' });
  if(role.isFounder) return res.status(403).json({ error:'Нельзя удалить роль основателя' });
  if(DB.users.some(u=>u.role===role.name)) return res.status(400).json({ error:'Есть пользователи с этой ролью, сначала смените им роль' });
  
  DB.roles = DB.roles.filter(r=>r.id!==id);
  saveDB(DB);
  res.json({ ok:true });
});

// Account
app.get('/api/account/alerts', requireAuth, (req,res)=>{
  const userThreads = DB.threads.filter(t=>t.author_id===req.user.id);
  const alerts = [];
  userThreads.forEach(t=>{
    const replies = DB.posts.filter(p=>p.thread_id===t.id && p.author_id!==req.user.id).slice(-3);
    replies.forEach(p=>{
      const author = findUser(p.author_id);
      alerts.push({
        id: p.id,
        from: author?.username||'Пользователь',
        avatar: author?.avatar||'',
        text: `ответил в вашу тему "${t.title.substring(0,30)}"`,
        created_at: p.created_at,
        read: false
      });
    });
  });
  res.json(alerts.sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)).slice(0,20));
});

app.post('/api/account/update', requireAuth, (req,res)=>{
  const { location, website, about, birthMonth, birthDay, birthYear, showBirth, showYear, emailNews } = req.body;
  const user = DB.users.find(u=>u.id===req.user.id);
  if(!user) return res.status(404).json({ error:'User not found' });
  
  if(!user.profile) user.profile = {};
  user.profile.location = location||'';
  user.profile.website = website||'';
  user.profile.about = about||'';
  user.profile.birthMonth = birthMonth||'';
  user.profile.birthDay = birthDay||'';
  user.profile.birthYear = birthYear||'';
  user.profile.showBirth = !!showBirth;
  user.profile.showYear = !!showYear;
  user.profile.emailNews = !!emailNews;
  user.profile.updated_at = new Date().toISOString();
  
  saveDB(DB);
  res.json({ ok:true, profile: user.profile });
});

app.post('/api/account/email', requireAuth, (req,res)=>{
  const { email } = req.body;
  if(!email || !email.includes('@')) return res.status(400).json({ error:'Неверный email' });
  if(DB.users.find(u=>u.email===email && u.id!==req.user.id)) return res.status(400).json({ error:'Email уже занят' });
  const user = DB.users.find(u=>u.id===req.user.id);
  user.email = email;
  saveDB(DB);
  res.json({ ok:true, email });
});

app.post('/api/account/password', requireAuth, (req,res)=>{
  const { current, newPass } = req.body;
  const user = DB.users.find(u=>u.id===req.user.id);
  if(!bcrypt.compareSync(current, user.password_hash)) return res.status(400).json({ error:'Неверный текущий пароль' });
  if(!newPass || newPass.length<6) return res.status(400).json({ error:'Минимум 6 символов' });
  user.password_hash = bcrypt.hashSync(newPass, 10);
  saveDB(DB);
  res.json({ ok:true });
});

app.post('/api/account/avatar', requireAuth, (req,res)=>{
  const { avatar } = req.body;
  if(!avatar) return res.status(400).json({ error:'Нет аватара' });
  // Allow empty to remove avatar (letter avatar)
  const user = DB.users.find(u=>u.id===req.user.id);
  user.avatar = avatar; // Can be '' for letter, or base64, or URL
  saveDB(DB);
  res.json({ ok:true, avatar });
});

// Watch thread
app.post('/api/threads/:id/watch', requireAuth, (req,res)=>{
  const threadId = parseInt(req.params.id);
  const thread = DB.threads.find(t=>t.id===threadId);
  if(!thread) return res.status(404).json({ error:'Тема не найдена' });
  if(!DB.watched) DB.watched = [];
  const { emailNotify } = req.body;
  const existing = DB.watched.find(w=>w.user_id===req.user.id && w.thread_id===threadId);
  if(existing){
    existing.emailNotify = !!emailNotify;
    existing.updated_at = new Date().toISOString();
  } else {
    DB.watched.push({
      id: nextId('likes'),
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

// Admin - Users
app.get('/api/admin/users', requireAuth, requireAdmin, (req,res)=>{
  res.json(DB.users.map(u=>{
    const role = findRole(u.role);
    return { id:u.id, username:u.username, email:u.email, role:u.role, roleColor: role?.color||'#4b5563', avatar:u.avatar||'', messages:u.messages, reputation:u.reputation, banned:u.banned, created_at:u.created_at, profile: u.profile||{} };
  }).sort((a,b)=> new Date(b.created_at)-new Date(a.created_at)));
});

app.post('/api/admin/users/:id/ban', requireAuth, requireAdmin, (req,res)=>{
  const u = DB.users.find(x=>x.id===parseInt(req.params.id));
  if (!u) return res.status(404).json({ error:'Not found' });
  if(u.username==='tiran') return res.status(403).json({ error:'Нельзя забанить основателя' });
  u.banned=1; saveDB(DB);
  res.json({ ok:true });
});

app.post('/api/admin/users/:id/unban', requireAuth, requireAdmin, (req,res)=>{
  const u = DB.users.find(x=>x.id===parseInt(req.params.id));
  if (u){ u.banned=0; saveDB(DB); }
  res.json({ ok:true });
});

app.post('/api/admin/users/:id/role', requireAuth, requireAdmin, (req,res)=>{
  const u = DB.users.find(x=>x.id===parseInt(req.params.id));
  if (!u) return res.status(404).json({ error:'User not found' });
  const { role } = req.body;
  if(!role) return res.status(400).json({ error:'Role required' });
  if(!findRole(role)) return res.status(400).json({ error:'Роль не существует, создайте её сначала' });
  
  // Only founder can give founder/admin roles
  const targetRole = findRole(role);
  const currentUserRole = findRole(req.user.role);
  if(targetRole.isFounder && req.user.username!=='tiran') return res.status(403).json({ error:'Только tiran может выдавать основателя' });
  if(targetRole.priority > (currentUserRole?.priority||0) && req.user.username!=='tiran') return res.status(403).json({ error:'Нельзя выдать роль выше своей' });
  
  if(u.username==='tiran' && role!=='ОСНОВАТЕЛЬ') return res.status(403).json({ error:'Нельзя снять основателя с tiran' });
  
  u.role=role; saveDB(DB);
  res.json({ ok:true, role });
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

app.post('/api/admin/clean-for-opening', requireAuth, requireFounder, (req,res)=>{
  if (req.user.username !== 'tiran') return res.status(403).json({ error:'Только tiran может чистить' });
  const tiran = DB.users.find(u=>u.username==='tiran');
  DB.users = tiran ? [tiran] : [];
  DB.threads = [];
  DB.posts = [];
  DB.likes = [];
  DB.watched = [];
  DB.seq = { users: tiran ? tiran.id+1 : 1, threads:1, posts:1, likes:1, roles: DB.seq.roles };
  if (tiran){ tiran.messages=0; tiran.reputation=0; tiran.avatar=''; }
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
  console.log(`\n🚀 LAFF PROJECT Forum - CLEAN FOR OPENING - ROLES EDITABLE`);
  console.log(`📁 Serving from ${__dirname}`);
  console.log(`🔑 Admin: tiran / 1213ttt3b (ОСНОВАТЕЛЬ) - can edit all roles - CLEAN FOR OPENING`);
  console.log(`💾 DB: ${DB_PATH} - Users: ${DB.users.length}, Roles: ${DB.roles.length}, Threads: ${DB.threads.length}`);
  console.log(`✨ Roles editable like XenForo, no random avatars, custom avatar in profile\n`);
});
