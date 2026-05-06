const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export const getTokens = () => ({
  access: localStorage.getItem("accessToken"),
  refresh: localStorage.getItem("refreshToken"),
});

export const setTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

const authHeaders = () => {
  const { access } = getTokens();
  return access ? { Authorization: `Bearer ${access}` } : {};
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

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
  me: () => request("/auth/me/"),
  listTodos: () => request("/todos/"),
  createTodo: (payload) => request("/todos/", { method: "POST", body: JSON.stringify(payload) }),
  updateTodo: (id, payload) =>
    request(`/todos/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
  patchTodo: (id, payload) =>
    request(`/todos/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteTodo: (id) => request(`/todos/${id}/`, { method: "DELETE" }),
};
