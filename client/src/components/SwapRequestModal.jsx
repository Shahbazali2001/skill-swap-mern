import React, { useState } from "react";
import { ArrowLeftRight, X } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function SwapRequestModal({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}) {
  const { user: currentUser } = useAuth();

  const myTaughtSkills = currentUser?.skillsToTeach || [];
  const targetTaughtSkills = targetUser?.skillsToTeach || [];

  const [offeredSkillId, setOfferedSkillId] = useState(
    myTaughtSkills[0]?.skill?._id || "",
  );
  const [requestedSkillId, setRequestedSkillId] = useState(
    targetTaughtSkills[0]?.skill?._id || "",
  );
  const [message, setMessage] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offeredSkillId || !requestedSkillId) {
      setError("Please select both a skill you offer and a skill you want.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/swaps", {
        receiverId: targetUser._id,
        offeredSkillId,
        requestedSkillId,
        message:
          message.trim() ||
          `Hi ${targetUser.name.split(" ")[0]}, I would love to trade skills with you!`,
        scheduleNotes: scheduleNotes.trim(),
      });

      if (onSuccess) {
        onSuccess(res.data.data.swap);
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Could not send swap request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-bold">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Request Skill Swap
            </h2>
            <p className="text-xs text-slate-500">
              Initiate a learning barter partnership with {targetUser.name}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold bg-pink-50 text-pink border border-pink-100 px-3.5 py-2 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* What you offer */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                You Teach (Offer)
              </label>
              {myTaughtSkills.length === 0 ? (
                <p className="text-xs text-pink font-semibold">
                  Add skills to teach on your dashboard first!
                </p>
              ) : (
                <select
                  value={offeredSkillId}
                  onChange={(e) => setOfferedSkillId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {myTaughtSkills.map((s) => (
                    <option key={s.skill?._id} value={s.skill?._id}>
                      {s.skill?.name} ({s.level})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* What they offer */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                They Teach (Receive)
              </label>
              {targetTaughtSkills.length === 0 ? (
                <p className="text-xs text-slate-400">
                  User has not listed taught skills
                </p>
              ) : (
                <select
                  value={requestedSkillId}
                  onChange={(e) => setRequestedSkillId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {targetTaughtSkills.map((s) => (
                    <option key={s.skill?._id} value={s.skill?._id}>
                      {s.skill?.name} ({s.level})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Introductory Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder={`Hi ${targetUser.name.split(" ")[0]}, I'd love to swap skills with you!`}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Proposed Schedule / Availability
            </label>
            <input
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="e.g. Weekends, Evenings after 6 PM, 1 hour weekly"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                myTaughtSkills.length === 0 ||
                targetTaughtSkills.length === 0
              }
              className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
            >
              {submitting ? "Sending Request..." : "Send Swap Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
