import React from "react";
import { Link } from "react-router-dom";
import { Check, MessageSquare, Star, X, CheckCircle2, Ban } from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  accepted: "bg-teal-100 text-teal-800 border-teal-200",
  rejected: "bg-pink-100 text-pink-800 border-pink-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function SwapRequestCard({
  swap,
  currentUserId,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  onOpenChat,
  onOpenReview,
}) {
  const isReceiver =
    String(swap.receiver?._id || swap.receiver) === String(currentUserId);
  const otherUser = isReceiver ? swap.requester : swap.receiver;
  const direction = isReceiver ? "received from" : "sent to";

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5 min-w-0">
        <Link to={`/profile/${otherUser?._id}`} className="flex-shrink-0 group">
          {otherUser?.profileImageUrl ? (
            <img
              src={otherUser.profileImageUrl}
              alt={otherUser.name}
              className="w-11 h-11 rounded-2xl object-cover border border-slate-100 group-hover:ring-2 ring-primary/40 transition"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition">
              {otherUser?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/profile/${otherUser?._id}`}
              className="text-sm font-extrabold text-slate-900 hover:text-primary transition"
            >
              {otherUser?.name}
            </Link>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                STATUS_STYLES[swap.status] || STATUS_STYLES.pending
              }`}
            >
              {swap.status}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            {direction} <b>{otherUser?.name}</b> &middot; Offers{" "}
            <b className="text-slate-800">{swap.offeredSkill?.name}</b> in
            exchange for{" "}
            <b className="text-slate-800">{swap.requestedSkill?.name}</b>
          </p>

          {swap.message && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 mt-2 italic">
              &ldquo;{swap.message}&rdquo;
            </p>
          )}

          {swap.scheduleNotes && (
            <p className="text-[11px] text-slate-500 mt-1">
              📅 <b>Schedule Note:</b> {swap.scheduleNotes}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
        {/* Pending Actions */}
        {swap.status === "pending" && isReceiver && (
          <>
            <button
              onClick={() => onAccept(swap)}
              className="text-xs font-bold bg-teal text-white px-3 py-1.5 rounded-xl hover:bg-teal-700 transition flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              onClick={() => onReject(swap)}
              className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </>
        )}

        {swap.status === "pending" && !isReceiver && (
          <button
            onClick={() => onCancel && onCancel(swap)}
            className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl hover:bg-pink-50 hover:text-pink transition flex items-center gap-1"
          >
            <Ban className="w-3.5 h-3.5" /> Cancel Request
          </button>
        )}

        {/* Accepted Actions */}
        {swap.status === "accepted" && (
          <>
            <button
              onClick={() => onOpenChat(swap)}
              className="text-xs font-bold bg-primary text-white px-3.5 py-1.5 rounded-xl hover:bg-primary-dark transition flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat &amp; Schedule
            </button>
            <button
              onClick={() => onComplete && onComplete(swap)}
              className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition flex items-center gap-1"
              title="Mark exchange as completed and rate each other"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Complete Swap
            </button>
          </>
        )}

        {/* Completed Actions */}
        {swap.status === "completed" && (
          <>
            <button
              onClick={() => onOpenChat(swap)}
              className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button
              onClick={() => onOpenReview && onOpenReview(swap)}
              className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition flex items-center gap-1 shadow-sm"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />{" "}
              Rate &amp; Review
            </button>
          </>
        )}
      </div>
    </div>
  );
}
