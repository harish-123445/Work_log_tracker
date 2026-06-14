# WorkLog — Career Project Ledger

A personal database for tracking everything you work on across companies:
project title, your role, features/responsibilities, technologies, timeline,
project manager, status, achievements, and notes. Built so you can take it
with you if you switch jobs — and export records as PDF/Word for appraisals.

## Tech stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite (swappable to PostgreSQL),
  JWT authentication, python-docx + reportlab for exports.
- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios.

## Project structure

```
worklog-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── database.py      # DB engine/session (reads DATABASE_URL)
│   │   ├── models.py         # User, Project tables
│   │   ├── schemas.py        # Pydantic request/response models
│   │   ├── auth.py            # password hashing + JWT
│   │   ├── reports.py        # PDF / Word export builders
│   │   └── routers/
│   │       ├── auth.py        # /auth/register, /auth/login, /auth/me
│   │       ├── projects.py    # /projects CRUD, filters, stats
│   │       └── export.py      # /export/... PDF & Word downloads
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/             # Login, Register, Dashboard, ProjectForm, ProjectDetail
    │   ├── components/         # Navbar, ProjectCard, TagListInput, StatusBadge, ...
    │   ├── context/AuthContext.jsx
    │   └── api.js              # Axios client (reads VITE_API_URL)
    ├── tailwind.config.js
    └── .env (VITE_API_URL)
```

## Running locally

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # adjust if needed
uvicorn app.main:app --reload --port 8000
```

The API will be at `http://localhost:8000`. Interactive docs at
`http://localhost:8000/docs`. A SQLite file `worklog.db` is created
automatically on first run — no extra setup needed.

### 2. Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Open `http://localhost:5173`, register an account, and start logging projects.

## How the data is organized

Each **project** record stores:

- Company name and your role/title on that project
- Project title and description
- Timeline (start date, end date — leave end date blank while ongoing)
- Status: Ongoing / Completed / On Hold
- Project manager name + contact
- Key features / responsibilities (an editable list)
- Technologies / tools used (an editable list)
- Achievements / impact
- Free-form notes

Everything is tied to **your account** (JWT login), so the same database can
hold projects from multiple companies — filter the dashboard by company or
status, or search by keyword.

## Exporting for appraisals

- On any project page: **Export PDF** or **Export Word** downloads that single
  project as a formatted document.
- On the dashboard: **Export all (PDF/Word)** downloads a full report of every
  project, grouped by company — handy for performance reviews or building a
  resume later.

## Deploying

The app is built to move with you:

- **Database**: Set `DATABASE_URL` to point at a hosted Postgres instance
  (e.g. `postgresql+psycopg2://user:pass@host:5432/dbname`) when you deploy —
  no code changes needed, SQLAlchemy handles both.
- **Secret key**: Set `SECRET_KEY` to a long random string in production
  (used to sign JWTs).
- **CORS**: Set `FRONTEND_ORIGINS` to a comma-separated list of allowed
  frontend URLs (e.g. `https://worklog.yourdomain.com`).
- **Frontend**: Set `VITE_API_URL` to your deployed API URL, then
  `npm run build` produces a static `dist/` folder you can host anywhere
  (Netlify, Vercel, S3, etc.). The backend can run on any host that supports
  Python (Render, Railway, Fly.io, a small VPS, etc.).

Because authentication is per-account, you can keep using the same deployed
instance even after switching companies — just keep adding projects under
your existing login.
