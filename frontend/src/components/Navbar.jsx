import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, LogOut, Sun, Moon, CheckSquare, User } from "lucide-react";
import { useTheme } from "./ThemeContext";

const Navbar = ({ user, setUser }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!user) return;
    const delay = setTimeout(() => {
      navigate(search.trim() ? `/?search=${encodeURIComponent(search)}` : "/");
    }, 500);
    return () => clearTimeout(delay);
  }, [search, navigate, user]);

  useEffect(() => {
    setSearch("");
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-[var(--bg-main)]/90 backdrop-blur-md border-b border-[var(--border-main)] no-theme-transition">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between gap-6">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="text-[var(--text-main)] transition-colors">
            <CheckSquare size={20} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-wide text-[var(--text-main)] hidden sm:block">
            Notes
          </span>
        </Link>

        {/* Search Section */}
        {user && (
          <div className="flex-1 max-w-md relative group hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-[var(--text-muted)] group-focus-within:text-[var(--text-main)] transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg-surface)] text-sm text-[var(--text-main)] border border-[var(--border-main)] rounded-md outline-none hover:border-[var(--border-hover)] focus:border-[var(--ring-main)] focus:ring-1 focus:ring-[var(--ring-main)] transition-all placeholder:text-[var(--text-muted)] shadow-[var(--shadow-subtle)]"
            />
          </div>
        )}

        {/* User & Actions Section */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-main)] transition-colors focus:outline-none"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          </button>
          
          {user && (
            <div className="flex items-center gap-1 ml-3 pl-4 border-l border-[var(--border-main)]">
              <div className="flex items-center gap-2 px-2 py-1 rounded-md text-[var(--text-main)]">
                <div className="w-5 h-5 rounded-full bg-[var(--bg-surface-active)] flex items-center justify-center border border-[var(--border-main)] overflow-hidden">
                   <User size={12} className="text-[var(--text-muted)] mt-1" />
                </div>
                <span className="text-sm font-medium hidden md:block">
                  {user.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors focus:outline-none ml-1"
                title="Logout"
              >
                <LogOut size={16} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Search */}
      {user && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-[var(--border-main)]">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-[var(--text-muted)] group-focus-within:text-[var(--text-main)] transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg-surface)] text-sm text-[var(--text-main)] border border-[var(--border-main)] rounded-md outline-none focus:border-[var(--ring-main)] focus:ring-1 focus:ring-[var(--ring-main)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
