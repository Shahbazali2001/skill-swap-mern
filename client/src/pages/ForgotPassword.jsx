import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import api from "../api/axios";
import Logo from "../components/Logo";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(searchParams.get("token") ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [demoCode, setDemoCode] = useState("");

  useEffect(() => {
    if (searchParams.get("token")) {
      setStep(2);
    }
  }, [searchParams]);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });
      setMessage(
        res.data.data.message ||
          "Password reset code has been sent to your email.",
      );
      if (res.data.data.resetToken) {
        setDemoCode(res.data.data.resetToken);
        setToken(res.data.data.resetToken);
      }
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          "Failed to request password reset code",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token.trim() || !newPassword) {
      setError("Please provide the reset code and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        email: email.trim(),
        token: token.trim().toUpperCase(),
        newPassword,
      });

      setMessage(res.data.data.message || "Password reset successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          "Failed to reset password. Token may be invalid or expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light/50 via-white to-teal-light/50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative">
        <div className="flex items-center justify-between mb-6">
          <Logo size="md" showBadge to="/" />
          <Link
            to="/login"
            className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Sign In
          </Link>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-2 text-xl font-bold">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900">
            {step === 1 ? "Reset Your Password " : "Enter Verification Code"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1
              ? "Enter your registered email address to receive an email verification code."
              : "Enter the verification code sent to your email to set a new password."}
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold bg-pink-50 text-pink border border-pink-100 px-3.5 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 text-xs font-bold bg-teal-50 text-teal border border-teal-200 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {demoCode && (
          <div className="mb-4 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl">
            <b>Demo Notice:</b> Your verification code is{" "}
            <code className="bg-white px-2 py-0.5 rounded font-mono font-bold">
              {demoCode}
            </code>{" "}
            (also logged in server console/email service).
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hira@skillswap.test"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 text-xs rounded-xl transition disabled:opacity-60 shadow-sm"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Email Verification Code
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. 4B2A89"
                className="w-full px-3.5 py-2.5 text-sm font-mono uppercase tracking-widest font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 text-xs rounded-xl transition disabled:opacity-60 shadow-sm"
            >
              {loading
                ? "Resetting Password..."
                : "Save New Password & Sign In"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
            >
              Request a different code
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
