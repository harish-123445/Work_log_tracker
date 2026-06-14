import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create account.");
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
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Create account</h2>

          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mb-4">
            <label className="label-field">Full name</label>
            <input
              className="input-field"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="label-field">Username</label>
            <input
              className="input-field"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              required
              minLength={3}
            />
          </div>

          <div className="mb-4">
            <label className="label-field">Email</label>
            <input
              className="input-field"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="label-field">Password</label>
            <input
              className="input-field"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-muted">At least 6 characters.</p>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>

          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
