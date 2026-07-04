import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/users/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      setUser(data);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] mb-5 shadow-[var(--shadow-subtle)]">
            <LogIn size={20} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-main)] tracking-tight">Sign in to Notes</h2>
          <p className="text-[var(--text-muted)] mt-1.5 text-sm">Welcome back! Please enter your details.</p>
        </div>

        {/* Form Content */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl p-6 sm:p-8 shadow-[var(--shadow-subtle)]">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 p-3 rounded-md mb-6 text-sm border border-red-100 dark:border-red-900/30">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-3 py-2 bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-main)] rounded-md outline-none focus:border-[var(--ring-main)] focus:ring-1 focus:ring-[var(--ring-main)] transition-all placeholder:text-[var(--text-muted)] text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-main)] rounded-md outline-none focus:border-[var(--ring-main)] focus:ring-1 focus:ring-[var(--ring-main)] transition-all placeholder:text-[var(--text-muted)] text-sm"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center mt-6 py-2 px-4 bg-[var(--text-main)] text-[var(--bg-surface)] text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--ring-main)] focus:ring-offset-2 dark:focus:ring-offset-[var(--bg-surface)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          
        </div>
        
        <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-[var(--text-main)] hover:underline transition-colors">
            Sign up
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;