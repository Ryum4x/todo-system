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

## API Routes

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `GET/POST /api/todos/`
- `GET/PUT/PATCH/DELETE /api/todos/<id>/`
