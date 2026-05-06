# Django + React Todo App

Simple full-stack todo app with:
- User registration and login (JWT auth)
- Protected dashboard
- Full CRUD for todos (create/read/update/delete)

## Backend (Django + DRF)

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`

Set frontend API URL locally with:

```bash
cd frontend
cp .env.example .env
```

Set backend env values locally with:

```bash
cd backend
cp .env.example .env
```

## API Routes

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `GET/POST /api/todos/`
- `GET/PUT/PATCH/DELETE /api/todos/<id>/`

## Deploy on Render

This repository includes a `render.yaml` Blueprint that provisions:
- Django API (`todo-backend`)
- React static site (`todo-frontend`)
- PostgreSQL database (`todo-db`)

### Steps

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Confirm the generated service names/domains and update these env vars if you use different names:
   - `ALLOWED_HOSTS`
   - `CORS_ALLOWED_ORIGINS`
   - `CSRF_TRUSTED_ORIGINS`
   - `VITE_API_BASE_URL`
4. Deploy.

Render runs migrations and static collection during backend start.
