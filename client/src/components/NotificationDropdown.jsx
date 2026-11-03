import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import api from "../api/axios";
import { useSocket } from "../context/SocketContext";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time socket notification push (FR11)
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification:new", handleNewNotification);
    return () => socket.off("notification:new", handleNewNotification);
  }, [socket]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await handleMarkAsRead(n._id);
    }
    setIsOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => {
        const item = notifications.find((n) => n._id === id);
        return item && !item.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-primary hover:bg-slate-100 transition focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading notifications...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 flex gap-3 items-start cursor-pointer transition hover:bg-slate-50 ${
                  !n.read ? "bg-primary-light/20" : ""
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-primary"
                  style={{ opacity: n.read ? 0 : 1 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-60 hover:opacity-100 flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(n._id, e)}
                      title="Mark as read"
                      className="p-1 hover:text-primary"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteNotification(n._id, e)}
                    title="Delete"
                    className="p-1 hover:text-pink"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
