import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "hira@skillswap.test",
    password: "password123",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (email) => {
    setForm({ email, password: "password123" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light/50 via-white to-teal-light/50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <Logo size="md" showBadge to="/" />
          <Link
            to="/"
            className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
        </div>

        <h1 className="text-xl font-black text-slate-900 mb-1">Welcome back</h1>
        <p className="text-xs text-slate-500 mb-6">
          Sign in to exchange skills with peers in your community (FR1)
        </p>

        {error && (
          <div className="mb-4 text-xs font-semibold bg-pink-50 text-pink border border-pink-100 px-3.5 py-2 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-xl py-2.5 text-xs transition disabled:opacity-60 shadow-sm flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don&rsquo;t have an account?{" "}
          <Link
            to="/register"
            className="text-primary font-bold hover:underline"
          >
            Register Now
          </Link>
        </p>

        {/* Demo Fast-Login Selector */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-left">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 text-center">
            ⚡ 1-Click Demo Accounts (Password: password123)
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center text-[11px]">
            <button
              type="button"
              onClick={() => setDemoUser("hira@skillswap.test")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary-light hover:text-primary font-bold transition"
            >
              Hira (Guitar/Design)
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("ali@skillswap.test")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary-light hover:text-primary font-bold transition"
            >
              Ali (Python/Web)
            </button>
            <button
              type="button"
              onClick={() => setDemoUser("admin@skillswap.test")}
              className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold transition"
            >
              Admin Supervisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
