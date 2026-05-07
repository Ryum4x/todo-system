const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}, retry = true) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 401 && retry && path !== "/auth/refresh/") {
    const refreshed = await fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (refreshed.ok) {
      return request(path, options, false);
    }
  }

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const firstError = Object.values(data)[0];
    const message =
      data.detail ||
      (Array.isArray(firstError) ? firstError[0] : null) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register/", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login/", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/auth/logout/", { method: "POST" }),
  me: () => request("/auth/me/"),
  listTodos: ({ page = 1, search = "" } = {}) =>
    request(`/todos/?page=${encodeURIComponent(page)}&search=${encodeURIComponent(search)}`),
  createTodo: (payload) => request("/todos/", { method: "POST", body: JSON.stringify(payload) }),
  updateTodo: (id, payload) =>
    request(`/todos/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
  patchTodo: (id, payload) =>
    request(`/todos/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteTodo: (id) => request(`/todos/${id}/`, { method: "DELETE" }),
};
