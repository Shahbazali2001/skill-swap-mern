import React, { useState } from "react";
import { Star, X } from "lucide-react";
import api from "../api/axios";

const AVAILABLE_TAGS = [
  "Punctual",
  "Knowledgeable",
  "Patient Teacher",
  "Great Communicator",
  "Friendly",
  "Well Prepared",
  "Structured Lessons",
  "Fun Experience",
];

export default function ReviewModal({
  isOpen,
  onClose,
  swap,
  onReviewSubmitted,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState([
    "Knowledgeable",
    "Friendly",
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !swap) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Please provide feedback about your exchange.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/reviews", {
        swapRequestId: swap._id,
        rating,
        feedback: feedback.trim(),
        tags: selectedTags,
      });

      if (onReviewSubmitted) {
        onReviewSubmitted(res.data.data.review);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to submit review");
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

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
            ★
          </div>
          <h2 className="text-lg font-black text-slate-900">
            Rate &amp; Review Your Skill Swap
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Help the community build trust by leaving honest feedback on your
            experience.
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold bg-pink-50 text-pink border border-pink-100 px-3.5 py-2 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-center text-xs font-bold text-slate-600 mb-2">
              Overall Rating:{" "}
              <span className="text-amber-500 font-extrabold">
                {rating} Stars
              </span>
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-200 fill-slate-100"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tag Selectors */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Highlight Partner Strengths
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                      active
                        ? "bg-primary text-white border-primary"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Written Feedback &amp; Experience
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              required
              placeholder="What was great about the lesson? How was their teaching style and communication?"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
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
              className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
