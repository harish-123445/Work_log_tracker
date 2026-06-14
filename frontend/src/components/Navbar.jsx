import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-white">
            WL
          </span>
          <span className="font-display text-lg font-semibold text-ink">
            WorkLog
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-xs text-muted sm:inline">
              {user.full_name || user.username}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-xs">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
