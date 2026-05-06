import { useEffect, useState } from "react";
import { api, clearTokens, getTokens, setTokens } from "./api";

const emptyForm = { title: "", description: "" };

export default function App() {
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [todoForm, setTodoForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getTokens().access) bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const profile = await api.me();
      setUser(profile);
    } catch {
      clearTokens();
      setUser(null);
      return;
    }

    try {
      await loadTodos();
    } catch (err) {
      setError(err.message || "Failed to load todos");
    }
  }

  async function loadTodos() {
    setTodos(await api.listTodos());
  }

  async function onAuthSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload =
        mode === "register"
          ? await api.register(authForm)
          : await api.login({ username: authForm.username, password: authForm.password });
      setTokens(payload);
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
      await loadTodos();
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
    await loadTodos();
  }

  async function deleteTodo(id) {
    await api.deleteTodo(id);
    if (editingId === id) {
      setEditingId(null);
      setTodoForm(emptyForm);
    }
    await loadTodos();
  }

  function logout() {
    clearTokens();
    setUser(null);
    setTodos([]);
    setMode("login");
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Todo App</h1>
            <p className="mt-2 text-sm text-slate-600">
              {mode === "login" ? "Sign in to your dashboard" : "Create your account"}
            </p>
          </div>
          <form onSubmit={onAuthSubmit} className="space-y-3">
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Username"
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              required
            />
            {mode === "register" && (
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Email"
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
            )}
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Password"
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
            />
            <button
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
            </button>
          </form>
          <button
            className="mt-4 text-sm font-medium text-blue-600 transition hover:text-blue-700"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
          </button>
          {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Welcome, {user.username}</p>
        </div>
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit Todo" : "Add Todo"}</h2>
        <form onSubmit={onTodoSubmit} className="mt-3 space-y-3">
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Title"
            value={todoForm.title}
            onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
            required
          />
          <textarea
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Description"
            value={todoForm.description}
            onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              type="submit"
            >
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTodoForm(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Your Todos</h2>
        {todos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No tasks yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <h3
                    className={`text-base font-semibold ${
                      todo.completed ? "text-slate-400 line-through" : "text-slate-800"
                    }`}
                  >
                    {todo.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{todo.description || "No description"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    onClick={() => toggleTodo(todo)}
                  >
                    {todo.completed ? "Mark Pending" : "Mark Done"}
                  </button>
                  <button
                    className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
                    onClick={() => startEdit(todo)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </main>
  );
}
