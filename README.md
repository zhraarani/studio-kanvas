# Kanvas Studio

Website company profile agensi desain. Stack: Node.js, Express, SQLite (better-sqlite3), HTML/CSS/JS.

## Setup

```bash
npm install express express-session bcryptjs@2 better-sqlite3
npm install -D nodemon
npm run dev
```

Buka http://localhost:3000

Login admin awal: `admin@kanvas.id` / `admin123` (ganti lewat environment variable
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan `SESSION_SECRET`).
