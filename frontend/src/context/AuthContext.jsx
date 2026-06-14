import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("worklog_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        setToken(null);
        localStorage.removeItem("worklog_token");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(username, password) {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    const res = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    localStorage.setItem("worklog_token", res.data.access_token);
    setToken(res.data.access_token);
    const me = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${res.data.access_token}` },
    });
    setUser(me.data);
  }

  async function register(payload) {
    await api.post("/auth/register", payload);
    await login(payload.username, payload.password);
  }

  function logout() {
    localStorage.removeItem("worklog_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
