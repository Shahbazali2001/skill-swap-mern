import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Logo from "./Logo";
import NotificationDropdown from "./NotificationDropdown";
import TrustBadge from "./TrustBadge";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
      isActive(path)
        ? "bg-primary text-white shadow-sm"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  const currentUserId = user?.id || user?._id;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6">
          <Logo size="md" showBadge to="/dashboard" />

          <div className="hidden md:flex items-center gap-1.5">
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <Link to="/explore" className={linkClass("/explore")}>
              <Search className="w-3.5 h-3.5" />
              <span>Explore &amp; Search</span>
            </Link>

            <Link to="/swaps" className={linkClass("/swaps")}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Swaps &amp; Chat</span>
            </Link>

            {user?.role === "admin" && (
              <Link to="/admin" className={linkClass("/admin")}>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </div>

        {/* Right: Live indicator, Notifications, Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Socket Connection Status */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-500"
            title={
              connected
                ? "Connected to real-time chat & alerts server"
                : "Connecting to real-time server..."
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
            />
            <span>{connected ? "Live" : "Offline"}</span>
          </div>

          {/* Real-time Notifications (FR11) */}
          <NotificationDropdown />

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              to={currentUserId ? `/profile/${currentUserId}` : "/dashboard"}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100 transition group"
              title="View Public Profile"
            >
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-bold text-xs">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 group-hover:text-primary transition leading-none">
                  {user?.name}
                </div>
                <div className="mt-1">
                  <TrustBadge
                    score={user?.trustScore || 50}
                    tier={user?.trustTier || "New Swapper"}
                    size="sm"
                  />
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-pink hover:bg-pink-50 rounded-xl transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navbar */}
      <div className="flex md:hidden items-center justify-around pt-2 mt-2 border-t border-slate-100">
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <Link to="/explore" className={linkClass("/explore")}>
          <Search className="w-3.5 h-3.5" />
          <span>Explore</span>
        </Link>
        <Link to="/swaps" className={linkClass("/swaps")}>
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Swaps</span>
        </Link>
        {user?.role === "admin" && (
          <Link to="/admin" className={linkClass("/admin")}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
