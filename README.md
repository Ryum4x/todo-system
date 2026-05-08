# Django + React Todo アプリ

Django（DRF）と React（Vite）で構成したフルスタック Todo アプリです。

- ユーザー登録 / ログイン
- 保護されたダッシュボード
- Todo の CRUD（作成・一覧・更新・削除）
- タイトル検索
- ページネーション
- 英語 / 日本語 UI 切り替え

## バックエンド（Django + DRF）

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

バックエンドは `http://127.0.0.1:8000` で起動します。

## フロントエンド（React + Vite）

```bash
cd frontend
npm install
npm run dev
```

フロントエンドは `http://127.0.0.1:5173` で起動します。

## ローカル環境変数の設定

フロントエンド:

```bash
cd frontend
cp .env.example .env
```

バックエンド:

```bash
cd backend
cp .env.example .env
```

## API ルート

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET/POST /api/todos/`
- `GET/PUT/PATCH/DELETE /api/todos/<id>/`

`/api/todos/` は以下のクエリパラメータに対応しています。

- `page`: ページ番号
- `search`: タイトル部分一致検索

## 認証方式

JWT は HttpOnly Cookie で管理しています（`localStorage` には保存しません）。

- `access_token`（短期）
- `refresh_token`（長期）

クロスドメイン運用（Render など）では、以下の設定が重要です。

- `COOKIE_SECURE=True`
- `COOKIE_SAMESITE=None`
- `CORS_ALLOWED_ORIGINS` と `CSRF_TRUSTED_ORIGINS` を正しく設定

## Render へのデプロイ

このリポジトリには `render.yaml`（Blueprint）が含まれており、以下を自動作成します。

- Django API（`todo-backend`）
- React Static Site（`todo-frontend`）
- PostgreSQL（`todo-db`）

### 手順

1. GitHub に push する
2. Render で Blueprint を作成し、このリポジトリを選択する
3. サービス名 / ドメインが異なる場合は、次の環境変数を実際の値に合わせる
   - `ALLOWED_HOSTS`
   - `CORS_ALLOWED_ORIGINS`
   - `CSRF_TRUSTED_ORIGINS`
   - `VITE_API_BASE_URL`
   - `COOKIE_SECURE`
   - `COOKIE_SAMESITE`
4. デプロイする

バックエンド起動時に migration と `collectstatic` が自動実行されます。

## テスト

### バックエンドテストを実行

```bash
cd backend
python manage.py test
```

以下を自動テストします。

- 認証（register / login / me / refresh / logout）
- Todo CRUD
- ユーザー分離（他ユーザーの Todo へアクセス不可）
- タイトル検索
- ページネーション
