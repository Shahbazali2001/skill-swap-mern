import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  History,
  MessageSquare,
  Star,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Navbar from "../components/Navbar";
import SwapRequestCard from "../components/SwapRequestCard";
import ChatWindow from "../components/ChatWindow";
import ReviewModal from "../components/ReviewModal";

export default function SwapChat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();

  const [swaps, setSwaps] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState("");

  // Review Modal state (FR8)
  const [reviewModalSwap, setReviewModalSwap] = useState(null);

  const currentUserId = user?.id || user?._id;

  const loadAll = useCallback(async () => {
    try {
      const [swapsRes, convRes] = await Promise.all([
        api.get("/swaps"),
        api.get("/conversations"),
      ]);
      const swapList = swapsRes.data.data.swaps || [];
      const convList = convRes.data.data.conversations || [];
      setSwaps(swapList);
      setConversations(convList);

      // If active conversation not set or auto-focus requested
      if (!activeConversation && convList.length > 0) {
        setActiveConversation(convList[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeConversation]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time swap updates
  useEffect(() => {
    if (!socket) return;
    const onNewRequest = () => {
      loadAll();
      setBanner("New swap request received!");
      setTimeout(() => setBanner(""), 3000);
    };
    const onStatusChanged = () => {
      loadAll();
      setBanner("A swap request status updated.");
      setTimeout(() => setBanner(""), 3000);
    };

    socket.on("swap:new_request", onNewRequest);
    socket.on("swap:status_changed", onStatusChanged);

    return () => {
      socket.off("swap:new_request", onNewRequest);
      socket.off("swap:status_changed", onStatusChanged);
    };
  }, [socket, loadAll]);

  const handleAccept = async (swap) => {
    try {
      await api.patch(`/swaps/${swap._id}`, { status: "accepted" });
      setBanner("Swap request accepted! Chat room is now open.");
      setTimeout(() => setBanner(""), 3000);
      await loadAll();
    } catch (err) {
      setBanner(err.response?.data?.error?.message || "Could not accept swap");
    }
  };

  const handleReject = async (swap) => {
    try {
      await api.patch(`/swaps/${swap._id}`, { status: "rejected" });
      setBanner("Swap request declined.");
      setTimeout(() => setBanner(""), 2500);
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (swap) => {
    try {
      await api.patch(`/swaps/${swap._id}`, { status: "cancelled" });
      setBanner("Swap request cancelled.");
      setTimeout(() => setBanner(""), 2500);
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (swap) => {
    try {
      await api.patch(`/swaps/${swap._id}`, { status: "completed" });
      setBanner("Swap marked as completed! Please share your feedback.");
      setTimeout(() => setBanner(""), 3000);
      await loadAll();
      // Prompt review modal immediately (FR8)
      setReviewModalSwap(swap);
    } catch (err) {
      setBanner(
        err.response?.data?.error?.message || "Could not complete swap",
      );
    }
  };

  const handleOpenChat = async (swap) => {
    const conv = conversations.find(
      (c) => String(c.swapRequest?._id || c.swapRequest) === String(swap._id),
    );
    if (conv) {
      setActiveConversation(conv);
    } else {
      const res = await api.get("/conversations");
      const freshConvs = res.data.data.conversations || [];
      setConversations(freshConvs);
      const found = freshConvs.find(
        (c) => String(c.swapRequest?._id || c.swapRequest) === String(swap._id),
      );
      setActiveConversation(found || null);
    }
  };

  const pending = swaps.filter((s) => s.status === "pending");
  const accepted = swaps.filter((s) => s.status === "accepted");
  const completed = swaps.filter((s) => s.status === "completed");
  const history = swaps.filter((s) =>
    ["rejected", "cancelled"].includes(s.status),
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Swap Pipeline &amp; Real-Time Chat (FR6, FR7)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage learning exchange partnerships, coordinate schedules, and
              rate completed swaps.
            </p>
          </div>
        </div>

        {banner && (
          <div className="mb-6 text-xs font-bold bg-teal-50 text-teal border border-teal-200 px-4 py-3 rounded-2xl shadow-sm animate-in fade-in duration-200">
            {banner}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Exchange Pipeline (FR6) */}
          <div className="lg:col-span-6 space-y-6">
            {loading && (
              <div className="text-xs text-slate-400 py-6">
                Loading swaps...
              </div>
            )}

            {!loading && (
              <>
                {/* Pending Requests */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h2 className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Pending Requests (
                      {pending.length})
                    </h2>
                  </div>
                  <div className="space-y-2.5">
                    {pending.length === 0 && (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-400">
                        No pending swap requests
                      </div>
                    )}
                    {pending.map((s) => (
                      <SwapRequestCard
                        key={s._id}
                        swap={s}
                        currentUserId={currentUserId}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onCancel={handleCancel}
                        onOpenChat={handleOpenChat}
                      />
                    ))}
                  </div>
                </div>

                {/* Accepted / Active Exchanges */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h2 className="text-xs font-black text-teal uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowLeftRight className="w-3.5 h-3.5" /> Active Learning
                      Exchanges ({accepted.length})
                    </h2>
                  </div>
                  <div className="space-y-2.5">
                    {accepted.length === 0 && (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-400">
                        No active swaps yet. Accept a request or explore skills
                        to begin!
                      </div>
                    )}
                    {accepted.map((s) => (
                      <SwapRequestCard
                        key={s._id}
                        swap={s}
                        currentUserId={currentUserId}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onComplete={handleComplete}
                        onOpenChat={handleOpenChat}
                      />
                    ))}
                  </div>
                </div>

                {/* Completed Swaps (FR8) */}
                {completed.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h2 className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        Exchanges ({completed.length})
                      </h2>
                    </div>
                    <div className="space-y-2.5">
                      {completed.map((s) => (
                        <SwapRequestCard
                          key={s._id}
                          swap={s}
                          currentUserId={currentUserId}
                          onOpenChat={handleOpenChat}
                          onOpenReview={(sw) => setReviewModalSwap(sw)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" /> Past / Closed (
                        {history.length})
                      </h2>
                    </div>
                    <div className="space-y-2.5 opacity-80">
                      {history.map((s) => (
                        <SwapRequestCard
                          key={s._id}
                          swap={s}
                          currentUserId={currentUserId}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: Real-Time Chat Box (FR7) */}
          <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[650px]">
            <ChatWindow conversation={activeConversation} />
          </div>
        </div>
      </div>

      {/* Review Modal (FR8) */}
      <ReviewModal
        isOpen={!!reviewModalSwap}
        onClose={() => setReviewModalSwap(null)}
        swap={reviewModalSwap}
        onReviewSubmitted={() => {
          setBanner("Thank you! Your rating and review have been posted.");
          setTimeout(() => setBanner(""), 3000);
          loadAll();
        }}
      />
    </div>
  );
}
