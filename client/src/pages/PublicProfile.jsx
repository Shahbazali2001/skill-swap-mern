import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  ArrowLeftRight,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TrustBadge from "../components/TrustBadge";
import SwapRequestModal from "../components/SwapRequestModal";
import ReportModal from "../components/ReportModal";

export default function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [banner, setBanner] = useState("");

  const isMe = currentUser && (currentUser.id === id || currentUser._id === id);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${id}`);
      setProfileUser(res.data.data.user);
      setReviews(res.data.data.reviews || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "User profile not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-400">
          Loading member profile...
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto py-16 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-base font-extrabold text-slate-800 mb-1">
            User Not Found
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            {error || "This user profile could not be loaded."}
          </p>
          <Link
            to="/explore"
            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
        </Link>

        {banner && (
          <div className="mb-6 text-xs font-bold bg-teal-50 text-teal border border-teal-200 px-4 py-3 rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{banner}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {profileUser.profileImageUrl ? (
                <img
                  src={profileUser.profileImageUrl}
                  alt={profileUser.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-primary/20 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-sm">
                  {profileUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {profileUser.name}
                  </h1>
                  <TrustBadge
                    score={profileUser.trustScore || 50}
                    tier={profileUser.trustTier || "New Swapper"}
                  />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                  {profileUser.headline || "SkillSwap Community Member"}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />{" "}
                  {profileUser.location || "Location not specified"}
                </p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            {!isMe && (
              <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSwapModalOpen(true)}
                  className="flex-1 sm:flex-none w-full sm:w-44 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Request Swap</span>
                </button>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="py-2.5 px-3 border border-slate-200 text-slate-400 hover:text-pink hover:bg-pink-50 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5"
                  title="Report inappropriate content or behavior"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Report User</span>
                </button>
              </div>
            )}
          </div>

          {profileUser.bio && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                About &amp; Background (FR2)
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {profileUser.bio}
              </p>
            </div>
          )}
        </div>

        {/* Skills Section Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Skills Taught */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                Skills Offered to Teach
              </h3>
            </div>

            <div className="space-y-2.5">
              {(profileUser.skillsToTeach || []).length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  No teaching skills listed.
                </p>
              )}
              {(profileUser.skillsToTeach || []).map((s) => (
                <div
                  key={s.skill?._id || s.skill}
                  className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      {s.skill?.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {s.skill?.category}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-primary text-white px-2.5 py-0.5 rounded-lg">
                    {s.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills to Learn */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-pink-light text-pink flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                Skills Wanted to Learn
              </h3>
            </div>

            <div className="space-y-2.5">
              {(profileUser.skillsToLearn || []).length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  No learning wishlist listed.
                </p>
              )}
              {(profileUser.skillsToLearn || []).map((s) => (
                <div
                  key={s.skill?._id || s.skill}
                  className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      {s.skill?.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {s.skill?.category}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-pink text-white px-2.5 py-0.5 rounded-lg">
                    Seeking
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reputation Score & Reviews Section (FR8, FR9) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Community Reputation &amp; Reviews (FR8, FR9)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic ratings submitted after completed peer skill exchanges
              </p>
            </div>

            <div className="w-full sm:w-72">
              <TrustBadge
                score={profileUser.trustScore || 50}
                tier={profileUser.trustTier || "New Swapper"}
                averageRating={profileUser.averageRating || 0}
                ratingsCount={reviews.length}
                size="lg"
              />
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No reviews yet. Be the first to complete a skill exchange with{" "}
                {profileUser.name.split(" ")[0]}!
              </div>
            )}

            {reviews.map((r) => (
              <div
                key={r._id}
                className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 sm:p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${r.reviewer?._id}`}>
                      {r.reviewer?.profileImageUrl ? (
                        <img
                          src={r.reviewer.profileImageUrl}
                          alt={r.reviewer.name}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-bold text-xs">
                          {r.reviewer?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link
                        to={`/profile/${r.reviewer?._id}`}
                        className="text-xs font-black text-slate-900 hover:text-primary transition"
                      >
                        {r.reviewer?.name}
                      </Link>
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= r.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2">
                  {r.feedback}
                </p>

                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {r.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Swap Request Modal */}
      <SwapRequestModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        targetUser={profileUser}
        onSuccess={() => {
          setBanner(`Swap request successfully sent to ${profileUser.name}!`);
          setTimeout(() => setBanner(""), 3000);
        }}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetUser={profileUser}
      />
    </div>
  );
}
