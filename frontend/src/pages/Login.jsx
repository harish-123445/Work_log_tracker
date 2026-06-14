import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not sign in. Check your username and password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-primary font-display text-lg font-bold text-white">
            WL
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">WorkLog</h1>
          <p className="mt-1 font-mono text-xs text-muted">Your career project ledger</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Sign in</h2>

          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mb-4">
            <label className="label-field">Username</label>
            <input
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="label-field">Password</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-4 text-center text-sm text-muted">
            New here?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
