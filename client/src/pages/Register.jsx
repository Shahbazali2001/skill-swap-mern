import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    bio: "",
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
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
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

        <h1 className="text-xl font-black text-slate-900 mb-1">
          Create your account
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Join the peer-to-peer knowledge barter community (FR1)
        </p>

        {error && (
          <div className="mb-4 text-xs font-semibold bg-pink-50 text-pink border border-pink-100 px-3.5 py-2 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g. Zainab Tariq"
            />
          </div>

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
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="zainab@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Location / City
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g. Islamabad, Pakistan"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-xl py-2.5 text-xs transition disabled:opacity-60 shadow-sm flex items-center justify-center gap-1.5 mt-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{loading ? "Creating account..." : "Create Account"}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
