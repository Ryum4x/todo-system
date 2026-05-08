import { useEffect, useState } from "react";
import { api } from "./api";

const emptyForm = { title: "", description: "" };
const LANG_KEY = "uiLang";
const THEME_KEY = "uiTheme";
const i18n = {
  en: {
    title: "Todo App",
    signIn: "Sign in to your dashboard",
    createAccount: "Create your account",
    username: "Username",
    email: "Email",
    password: "Password",
    pleaseWait: "Please wait...",
    login: "Login",
    register: "Register",
    needAccount: "Need an account? Register",
    haveAccount: "Already have an account? Login",
    dashboard: "Dashboard",
    welcome: "Welcome",
    logout: "Logout",
    addTodo: "Add Todo",
    editTodo: "Edit Todo",
    todoTitle: "Title",
    todoDescription: "Description",
    update: "Update",
    create: "Create",
    cancel: "Cancel",
    yourTodos: "Your Todos",
    searchTitle: "Search title...",
    search: "Search",
    clear: "Clear",
    noTasks: "No tasks yet.",
    noDescription: "No description",
    markPending: "Mark Pending",
    markDone: "Mark Done",
    edit: "Edit",
    delete: "Delete",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    langButton: "日本語",
    darkMode: "Dark",
    lightMode: "Light",
  },
  ja: {
    title: "Todo アプリ",
    signIn: "ダッシュボードにログイン",
    createAccount: "アカウントを作成",
    username: "ユーザー名",
    email: "メールアドレス",
    password: "パスワード",
    pleaseWait: "処理中...",
    login: "ログイン",
    register: "登録",
    needAccount: "アカウントが必要ですか？登録",
    haveAccount: "アカウントをお持ちですか？ログイン",
    dashboard: "ダッシュボード",
    welcome: "ようこそ",
    logout: "ログアウト",
    addTodo: "Todo を追加",
    editTodo: "Todo を編集",
    todoTitle: "タイトル",
    todoDescription: "説明",
    update: "更新",
    create: "作成",
    cancel: "キャンセル",
    yourTodos: "あなたの Todo",
    searchTitle: "タイトルで検索...",
    search: "検索",
    clear: "クリア",
    noTasks: "タスクはまだありません。",
    noDescription: "説明なし",
    markPending: "未完了にする",
    markDone: "完了にする",
    edit: "編集",
    delete: "削除",
    previous: "前へ",
    next: "次へ",
    page: "ページ",
    of: "/",
    langButton: "English",
    darkMode: "ダーク",
    lightMode: "ライト",
  },
};

export default function App() {
  const [lang, setLang] = useState(localStorage.getItem(LANG_KEY) || "en");
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || "light");
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [todoForm, setTodoForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const t = i18n[lang] || i18n.en;

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("theme-dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggleLanguage() {
    const next = lang === "en" ? "ja" : "en";
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  async function bootstrap() {
    try {
      const profile = await api.me();
      setUser(profile);
    } catch {
      setUser(null);
      return;
    }

  }

  async function loadTodos() {
    const data = await api.listTodos({ page, search });
    setTodos(data.results || []);
    setTotalPages(Math.max(1, Math.ceil((data.count || 0) / 10)));
  }

  useEffect(() => {
    if (!user) return;
    loadTodos().catch((err) => setError(err.message || "Failed to load todos"));
  }, [user, page, search]);

  async function onAuthSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await api.register(authForm);
      } else {
        await api.login({ username: authForm.username, password: authForm.password });
      }
      await bootstrap();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function onTodoSubmit(e) {
    e.preventDefault();
    if (!todoForm.title.trim()) return;
    try {
      if (editingId) {
        const current = todos.find((t) => t.id === editingId);
        await api.updateTodo(editingId, {
          title: todoForm.title,
          description: todoForm.description,
          completed: current?.completed || false,
        });
      } else {
        await api.createTodo({ ...todoForm, completed: false });
      }
      setTodoForm(emptyForm);
      setEditingId(null);
      await loadTodos().catch(() => null);
    } catch (err) {
      setError(err.message || "Failed to save todo");
    }
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setTodoForm({ title: todo.title, description: todo.description || "" });
  }

  async function toggleTodo(todo) {
    await api.patchTodo(todo.id, { completed: !todo.completed });
    await loadTodos().catch(() => null);
  }

  async function deleteTodo(id) {
    await api.deleteTodo(id);
    if (editingId === id) {
      setEditingId(null);
      setTodoForm(emptyForm);
    }
    await loadTodos().catch(() => null);
  }

  async function logout() {
    await api.logout().catch(() => null);
    setUser(null);
    setTodos([]);
    setMode("login");
    setPage(1);
    setSearch("");
    setSearchInput("");
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8 animate-fade-in">
        <section className="glass-card w-full max-w-md p-6 animate-slide-up">
          <div className="mb-6">
            <div className="mb-2 flex justify-end">
              <button
                className="soft-btn mr-2 px-3 py-1 text-xs"
                onClick={toggleTheme}
                type="button"
              >
                {theme === "dark" ? t.lightMode : t.darkMode}
              </button>
              <button
                className="soft-btn px-3 py-1 text-xs"
                onClick={toggleLanguage}
                type="button"
              >
                {t.langButton}
              </button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {mode === "login" ? t.signIn : t.createAccount}
            </p>
          </div>
          <form onSubmit={onAuthSubmit} className="space-y-3">
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder={t.username}
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              required
            />
            {mode === "register" && (
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder={t.email}
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
            )}
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder={t.password}
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
            <button
              className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? t.pleaseWait : mode === "login" ? t.login : t.register}
            </button>
          </form>
          <button
            className="mt-4 text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? t.needAccount : t.haveAccount}
          </button>
          {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 animate-fade-in">
      <header className="glass-card mb-6 flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.dashboard}</h1>
          <p className="text-sm text-slate-600">{t.welcome}, {user.username}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="soft-btn px-3 py-2"
            onClick={toggleTheme}
          >
            {theme === "dark" ? t.lightMode : t.darkMode}
          </button>
          <button
            className="soft-btn px-3 py-2"
            onClick={toggleLanguage}
          >
            {t.langButton}
          </button>
          <button
            className="soft-btn"
            onClick={logout}
          >
            {t.logout}
          </button>
        </div>
      </header>

      <section className="glass-card mb-6 p-5 animate-slide-up">
        <h2 className="text-lg font-semibold text-slate-900">{editingId ? t.editTodo : t.addTodo}</h2>
        <form onSubmit={onTodoSubmit} className="mt-3 space-y-3">
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder={t.todoTitle}
            value={todoForm.title}
            onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
            required
          />
          <textarea
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder={t.todoDescription}
            value={todoForm.description}
            onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="primary-btn"
              type="submit"
            >
              {editingId ? t.update : t.create}
            </button>
            {editingId && (
              <button
                className="soft-btn"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTodoForm(emptyForm);
                }}
              >
                {t.cancel}
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t.yourTodos}</h2>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <input
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder={t.searchTitle}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="soft-btn px-3 py-2"
            >
              {t.search}
            </button>
            <button
              type="button"
              className="soft-btn px-3 py-2"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              {t.clear}
            </button>
          </form>
        </div>
        {todos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            {t.noTasks}
          </p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo, idx) => (
              <li
                key={todo.id}
                className="glass-card p-4 animate-slide-up"
                style={{ animationDelay: `${Math.min(idx * 40, 180)}ms` }}
              >
                <div className="mb-3">
                  <h3
                    className={`text-base font-semibold ${
                      todo.completed ? "text-slate-400 line-through" : "text-slate-800"
                    }`}
                  >
                    {todo.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{todo.description || t.noDescription}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-sm"
                    onClick={() => toggleTodo(todo)}
                  >
                    {todo.completed ? t.markPending : t.markDone}
                  </button>
                  <button
                    className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-sm"
                    onClick={() => startEdit(todo)}
                  >
                    {t.edit}
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-sm"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    {t.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between">
          <button
            className="soft-btn px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            {t.previous}
          </button>
          <p className="text-sm text-slate-600">
            {t.page} {page} {t.of} {totalPages}
          </p>
          <button
            className="soft-btn px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            {t.next}
          </button>
        </div>
      </section>

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </main>
  );
}
