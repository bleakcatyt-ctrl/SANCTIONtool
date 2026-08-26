# LAFF PROJECT — Форум (Копия Trace RP) v2.0

Полная копия форума **forum.trace-rp.com** в стиле XenForo Dark, переименованная под бренд **LAFF PROJECT ☂️** — теперь с полноценным бэкендом!

## 🚀 Что нового в v2.0 (Backend)

- **Node.js + Express + JSON DB** — без нативных зависимостей, работает везде
- **JWT авторизация** — регистрация, логин, токены на 30 дней
- **WYSIWYG редактор** — тулбар как в XenForo: жирный, курсив, цитаты, код, ссылки, изображения, списки
- **Система лайков** — лайки на темы и посты с анимацией ❤️, влияет на репутацию
- **Админ-панель** (`/admin.html`) — управление пользователями (бан/разбан, роли), темами (пин/лок/удаление), постами, статистика
- **Поиск** — по заголовкам и содержимому тем (API)
- **Реальное время** — просмотры, ответы, онлайн пользователи из БД
- **Сид данные** — 4 тестовых пользователя, 5 тем, посты

## 🎨 Frontend (клон Trace RP)

- **Точная копия дизайна Trace RP**: темная тема XenForo, категории, ноды, треды, посты, сайдбар
- **Все разделы оригинала**:
  - Главный раздел (Новости, Команда, Обращения)
  - Family War (Семьи, Топ семей)
  - Info (FAQ, Жалобы)
  - Основные кодексы (Правила сервера, AirDrop, Лидеры, Законы, Уставы)
  - Гос. структуры (GOV, LSPD, LSSD, FIB, EMS, NG)
  - Крайм (Мафии, Банды)
  - Прочее (Маркет, Баги, Идеи)
- **Переименовано**: Trace → LAFF PROJECT, IP: `play.laff-project.com`
- **Адаптив** + модерн UI с градиентами и blur

## 📁 Структура

```
laff-project/
├── server.js           # Express бэкенд + JSON DB
├── forums.json         # Структура форумов (категории)
├── package.json        # Зависимости (express, cors, bcryptjs, jsonwebtoken)
├── laff-db.json        # База данных (создается автоматически, в .gitignore)
├── index.html          # Главная - список форумов
├── forum.html?f=...    # Список тем раздела
├── thread.html?id=...  # Просмотр темы + ответы + WYSIWYG
├── admin.html          # Админ-панель (только для админов)
└── assets/
    ├── style.css       # XenForo Dark тема
    ├── editor.css      # Стили WYSIWYG редактора
    ├── api.js          # API клиент (fetch + JWT)
    ├── app-v2.js       # Основная логика фронтенда (backend-connected)
    ├── editor.js       # WYSIWYG редактор класс LaffEditor
    ├── app.js          # Legacy fallback (v1)
    └── logo.png
```

## 🔧 Установка и запуск

```bash
cd laff-project
npm install
node server.js
# Открой http://localhost:8000
```

Сервер запустится на `0.0.0.0:8000` и отдаст статику + API.

## 🔑 Тестовые аккаунты

| Логин | Пароль | Роль |
|-------|--------|------|
| Maestro | laff2025 | ОСНОВАТЕЛЬ |
| Paranoia | laff2025 | ТЕХ. АДМИН |
| Laff_Admin | laff2025 | ГЛ. АДМИН |
| enjoylaff | 12345678 | ИГРОК |

Или зарегистрируй новый аккаунт через форму.

## 🛠️ API Endpoints

```
POST   /api/register
POST   /api/login
GET    /api/me
GET    /api/forums
GET    /api/threads?forum_id=&search=
GET    /api/threads/:id
POST   /api/threads
POST   /api/threads/:id/replies
POST   /api/threads/:id/like
POST   /api/posts/:id/like
GET    /api/online
GET    /api/stats

Admin (требует роль админа):
GET    /api/admin/users
POST   /api/admin/users/:id/ban
POST   /api/admin/users/:id/unban
POST   /api/admin/users/:id/role
DELETE /api/admin/threads/:id
POST   /api/admin/threads/:id/pin
POST   /api/admin/threads/:id/lock
DELETE /api/admin/posts/:id
```

## ✨ Особенности

- **WYSIWYG**: `new LaffEditor('id', { placeholder })` — contenteditable с тулбаром, поддерживает `document.execCommand`
- **Лайки**: `like-btn` с классом `.liked` и анимацией `heartPop`
- **Админка**: проверка роли в `checkAdmin()`, таблицы с действиями
- **Безопасность**: bcrypt для паролей, JWT для сессий, проверка бана
- **No native deps**: JSON файл вместо SQLite, чтобы не компилировать `better-sqlite3` в sandbox

## 🌐 Деплой

- **Локально**: `node server.js`
- **VPS**: `pm2 start server.js --name laff-forum`
- **Docker**: можно добавить Dockerfile (node:18-alpine + copy)
- **GitHub**: весь код в ветке `arena/01a03ce3-sanctiontool` → PR в main

## 📸 Скриншоты (как на Trace RP)

- Темная тема #0b0c0f + фиолетовый акцент #8b5cf6 + glow
- Ноды форумов: иконка 48px, счетчики, last post с аватаром
- Треды: пин 📌, бейджи NEW/ВАЖНО, лайки ❤️, замок 🔒
- Посты: слева профиль с ролью (admin/mod), справа контент + actions

## 💜 Дальше можно добавить

- Загрузка аватарок (multer)
- Уведомления (WebSocket)
- Личные сообщения
- BBCode парсер
- Пагинация
- Кеширование

Сделано с любовью к Trace RP дизайну 💜

---

**GitHub**: https://github.com/bleakcatyt-ctrl/SANCTIONtool/tree/arena/01a03ce3-sanctiontool/laff-project
**Форум**: http://localhost:8000
**Админка**: http://localhost:8000/admin.html
