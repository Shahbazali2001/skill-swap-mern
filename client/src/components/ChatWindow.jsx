import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Send,
  Calendar,
  Check,
  CheckCheck,
  User as UserIcon,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function ChatWindow({ conversation, onSwapStatusChange }) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUserId = user?.id || user?._id;

  // Load history & join room
  useEffect(() => {
    if (!conversation) return;
    let cancelled = false;

    setLoading(true);
    api.get(`/conversations/${conversation._id}/messages`).then((res) => {
      if (!cancelled) {
        setMessages(res.data.data.messages || []);
        setLoading(false);
      }
    });

    if (socket) {
      socket.emit("join_room", { conversationId: conversation._id });
      socket.emit("mark_read", { conversationId: conversation._id });
    }

    return () => {
      cancelled = true;
      if (socket) {
        socket.emit("leave_room", { conversationId: conversation._id });
      }
    };
  }, [conversation, socket]);

  // Real-time socket message & typing events
  useEffect(() => {
    if (!socket || !conversation) return;

    const handleNewMessage = ({ message }) => {
      if (message.conversation === conversation._id) {
        setMessages((prev) => [...prev, message]);
        socket.emit("mark_read", { conversationId: conversation._id });
      }
    };

    const handleUserTyping = (data) => {
      if (
        data.conversationId === conversation._id &&
        data.userId !== currentUserId
      ) {
        setIsPartnerTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (
        data.conversationId === conversation._id &&
        data.userId !== currentUserId
      ) {
        setIsPartnerTyping(false);
      }
    };

    const handleMessagesRead = (data) => {
      if (
        data.conversationId === conversation._id &&
        data.userId !== currentUserId
      ) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            readBy: Array.from(new Set([...(m.readBy || []), data.userId])),
          })),
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, conversation, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!socket || !conversation) return;

    socket.emit("typing_start", { conversationId: conversation._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId: conversation._id });
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || !conversation) return;

    socket.emit("send_message", {
      conversationId: conversation._id,
      content: text.trim(),
    });
    socket.emit("typing_stop", { conversationId: conversation._id });
    setText("");
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 text-2xl">
          💬
        </div>
        <h3 className="font-extrabold text-slate-700 text-sm">
          No Active Chat Selected
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Select an accepted skill exchange from the left panel to coordinate
          lessons and curriculum.
        </p>
      </div>
    );
  }

  const otherUser = conversation.participants?.find(
    (p) => String(p._id) !== String(currentUserId),
  );
  const swap = conversation.swapRequest;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${otherUser?._id}`} className="group">
            {otherUser?.profileImageUrl ? (
              <img
                src={otherUser.profileImageUrl}
                alt={otherUser.name}
                className="w-10 h-10 rounded-2xl object-cover border border-slate-100 group-hover:ring-2 ring-primary/40 transition"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-black text-xs">
                {otherUser?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${otherUser?._id}`}
                className="text-sm font-extrabold text-slate-900 hover:text-primary transition"
              >
                {otherUser?.name}
              </Link>
              <span className="text-[10px] font-bold bg-teal-50 text-teal border border-teal-200 px-2 py-0.2 rounded-full">
                Active Partner
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-300"}`}
              />
              <span>
                {connected ? "Online & Encrypted" : "Reconnecting..."}
              </span>
            </div>
          </div>
        </div>

        {swap && (
          <div className="hidden sm:block text-right">
            <div className="text-[11px] font-bold text-slate-500">
              Exchange:{" "}
              <span className="text-primary font-black">
                {swap.offeredSkill?.name}
              </span>{" "}
              ⇄{" "}
              <span className="text-pink font-black">
                {swap.requestedSkill?.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Schedule Context Banner */}
      {swap?.scheduleNotes && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 text-xs text-amber-900">
          <Calendar className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="font-semibold truncate">
            <b>Agreed Schedule:</b> {swap.scheduleNotes}
          </span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50/70">
        {loading && (
          <div className="text-xs text-slate-400 text-center py-6">
            Loading messages...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">👋</div>
            <h4 className="text-xs font-bold text-slate-700">
              Start the conversation!
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Introduce yourself, align on lesson goals, and agree on a
              convenient video call or meeting time.
            </p>
          </div>
        )}

        {messages.map((m) => {
          const mine =
            String(m.sender?._id || m.sender) === String(currentUserId);
          const isReadByPartner =
            m.readBy &&
            m.readBy.some((id) => String(id) !== String(currentUserId));

          return (
            <div
              key={m._id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-sm leading-relaxed ${
                    mine
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {mine && (
                    <span title={isReadByPartner ? "Read" : "Delivered"}>
                      {isReadByPartner ? (
                        <CheckCheck className="w-3 h-3 text-primary" />
                      ) : (
                        <Check className="w-3 h-3 text-slate-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isPartnerTyping && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 italic py-1">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1 text-[11px] font-semibold">
              {otherUser?.name?.split(" ")[0]} is typing...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 border-t border-slate-200 bg-white flex gap-2"
      >
        <input
          value={text}
          onChange={handleInputChange}
          placeholder="Discuss schedule, lesson goals, or ask questions..."
          className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 sm:px-5 py-2.5 rounded-2xl transition disabled:opacity-40 flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
