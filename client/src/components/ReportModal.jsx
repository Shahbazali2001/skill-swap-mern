import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import api from "../api/axios";

const REPORT_REASONS = [
  "Inappropriate Behavior",
  "Spam / Scam",
  "Harassment",
  "Did Not Show Up",
  "Off-topic Content",
  "Other",
];

export default function ReportModal({ isOpen, onClose, targetUser }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      setError("Please provide specific details for the moderation report.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await api.post("/reports", {
        reportedUserId: targetUser._id,
        reason,
        details: details.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Report User / Content
            </h2>
            <p className="text-xs text-slate-500">
              Reporting {targetUser.name}
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center text-xs font-bold text-teal bg-teal-light rounded-2xl">
            ✓ Report submitted to administrators for review. Thank you for
            keeping our community safe.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-xs font-semibold bg-pink-50 text-pink border border-pink-100 px-3.5 py-2 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Specific Details / Incident Context
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                required
                placeholder="Describe what occurred, any date/time information, or inappropriate messages..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                disabled={submitting}
                className="flex-1 py-2.5 bg-pink text-white text-xs font-bold rounded-xl hover:bg-pink/90 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
