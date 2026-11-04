import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Award,
  CheckCircle,
  Clock,
  Compass,
  Eye,
  Flame,
  MessageSquare,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import SkillSelector from "../components/SkillSelector";
import MatchCard from "../components/MatchCard";
import TrustBadge from "../components/TrustBadge";
import SwapRequestModal from "../components/SwapRequestModal";

export default function Dashboard() {
  const { user, refreshMe } = useAuth();
  const navigate = useNavigate();

  const [allSkills, setAllSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    bio: user?.bio || "",
    location: user?.location || "",
    headline: user?.headline || "",
    profileImageUrl: user?.profileImageUrl || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [banner, setBanner] = useState("");

  // Selected match for swap modal
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);

  const loadData = async () => {
    try {
      const [skillsRes, matchesRes, swapsRes, recentRes] = await Promise.all([
        api.get("/skills"),
        api.get("/matches"),
        api.get("/swaps"),
        api.get("/users/me/recently-viewed"),
      ]);

      setAllSkills(skillsRes.data.data.skills || []);
      setMatches(matchesRes.data.data.matches || []);
      setSwaps(swapsRes.data.data.swaps || []);
      setRecentlyViewed(recentRes.data.data.recentlyViewed || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/users/me", profileForm);
      await refreshMe();
      setBanner("Profile updated successfully!");
      setTimeout(() => setBanner(""), 2500);
      loadData();
    } catch (err) {
      setBanner(
        err.response?.data?.error?.message || "Failed to update profile",
      );
      setTimeout(() => setBanner(""), 3000);
    } finally {
      setSavingProfile(false);
    }
  };

  const addTeachSkill = async ({ skill, level }) => {
    const current = (user.skillsToTeach || []).map((s) => ({
      skill: s.skill?._id || s.skill,
      level: s.level,
    }));
    await api.put("/users/me/skills", {
      skillsToTeach: [...current, { skill, level }],
    });
    await refreshMe();
    setBanner("Skill added to Teach list");
    setTimeout(() => setBanner(""), 2000);
    loadData();
  };

  const removeTeachSkill = async (skillId) => {
    const current = (user.skillsToTeach || [])
      .filter((s) => (s.skill?._id || s.skill) !== skillId)
      .map((s) => ({ skill: s.skill?._id || s.skill, level: s.level }));
    await api.put("/users/me/skills", { skillsToTeach: current });
    await refreshMe();
    loadData();
  };

  const addLearnSkill = async ({ skill }) => {
    const current = (user.skillsToLearn || []).map((s) => ({
      skill: s.skill?._id || s.skill,
    }));
    await api.put("/users/me/skills", {
      skillsToLearn: [...current, { skill }],
    });
    await refreshMe();
    setBanner("Skill added to Learn wishlist");
    setTimeout(() => setBanner(""), 2000);
    loadData();
  };

  const removeLearnSkill = async (skillId) => {
    const current = (user.skillsToLearn || [])
      .filter((s) => (s.skill?._id || s.skill) !== skillId)
      .map((s) => ({ skill: s.skill?._id || s.skill }));
    await api.put("/users/me/skills", { skillsToLearn: current });
    await refreshMe();
    loadData();
  };

  const handleRequestSwap = (match) => {
    setSelectedTargetUser(match.user);
  };

  if (!user) return null;

  const pendingIncoming = swaps.filter(
    (s) =>
      s.status === "pending" &&
      String(s.receiver?._id) === String(user._id || user.id),
  );
  const activeSwaps = swaps.filter((s) => s.status === "accepted");
  const completedSwaps = swaps.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      {/* Top Banner & Quick Overview Header */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="w-16 h-16 rounded-3xl object-cover border-2 border-primary/20 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-black text-2xl shadow-sm">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome back, {user.name.split(" ")[0]}
                </h1>
                <TrustBadge
                  score={user.trustScore || 50}
                  tier={user.trustTier || "New Swapper"}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {user.headline || "Skill Exchange Enthusiast"} &middot;{" "}
                <span className="font-semibold">
                  {user.location || "Location not set"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/explore"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>Explore Skills</span>
            </Link>
            <Link
              to="/swaps"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-2xl transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Swaps &amp; Chat ({activeSwaps.length})</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {banner && (
          <div className="text-xs font-bold bg-teal-50 text-teal border border-teal-200 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4" />
            <span>{banner}</span>
          </div>
        )}

        {/* FR10: Centralized Dashboard Metrics / Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">
                {activeSwaps.length}
              </div>
              <div className="text-xs font-bold text-slate-400 mt-0.5">
                Active Exchanges
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal flex items-center justify-center font-bold">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">
                {pendingIncoming.length}
              </div>
              <div className="text-xs font-bold text-slate-400 mt-0.5">
                Pending Requests
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">
                {completedSwaps.length}
              </div>
              <div className="text-xs font-bold text-slate-400 mt-0.5">
                Completed Swaps
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">
                {user.trustScore || 50}/100
              </div>
              <div className="text-xs font-bold text-slate-400 mt-0.5">
                Trust Score
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Profile & Skill Manager (FR2, FR3) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Overview & Quick Edit */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-900">
                  Profile Details
                </h2>
                <Link
                  to={`/profile/${user._id || user.id}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Public
                </Link>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Headline
                  </label>
                  <input
                    value={profileForm.headline}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        headline: e.target.value,
                      })
                    }
                    placeholder="e.g. Graphic Designer & Guitar Enthusiast"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Bio &amp; Teaching Style
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                    rows={3}
                    placeholder="Tell exchange partners about your background..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Location / City
                  </label>
                  <input
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        location: e.target.value,
                      })
                    }
                    placeholder="e.g. Islamabad, Pakistan"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    value={profileForm.profileImageUrl}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        profileImageUrl: e.target.value,
                      })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {savingProfile ? "Saving Profile..." : "Save Profile"}
                </button>
              </form>
            </div>

            {/* Skills to Teach (FR3) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-slate-900">
                  Skills to Teach
                </h2>
                <span className="text-[11px] font-bold text-primary">
                  {(user.skillsToTeach || []).length} active
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(user.skillsToTeach || []).length === 0 && (
                  <span className="text-xs text-slate-400 italic">
                    No teaching skills added yet
                  </span>
                )}
                {(user.skillsToTeach || []).map((s) => (
                  <span
                    key={s.skill?._id || s.skill}
                    className="text-xs font-bold bg-primary-light text-primary-dark px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                  >
                    <span>{s.skill?.name || "Skill"}</span>
                    <span className="text-[10px] opacity-75">({s.level})</span>
                    <button
                      onClick={() => removeTeachSkill(s.skill?._id || s.skill)}
                      className="text-primary-dark/60 hover:text-primary-dark text-sm leading-none ml-1 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {allSkills.length > 0 && (
                <SkillSelector
                  allSkills={allSkills}
                  existingIds={(user.skillsToTeach || []).map(
                    (s) => s.skill?._id || s.skill,
                  )}
                  onAdd={addTeachSkill}
                  showLevel
                  buttonLabel="Add"
                />
              )}
            </div>

            {/* Skills to Learn (FR3) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-slate-900">
                  Skills to Learn
                </h2>
                <span className="text-[11px] font-bold text-pink">
                  {(user.skillsToLearn || []).length} on wishlist
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(user.skillsToLearn || []).length === 0 && (
                  <span className="text-xs text-slate-400 italic">
                    No learning wishlist added yet
                  </span>
                )}
                {(user.skillsToLearn || []).map((s) => (
                  <span
                    key={s.skill?._id || s.skill}
                    className="text-xs font-bold bg-pink-light text-pink px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                  >
                    <span>{s.skill?.name || "Skill"}</span>
                    <button
                      onClick={() => removeLearnSkill(s.skill?._id || s.skill)}
                      className="text-pink/60 hover:text-pink text-sm leading-none ml-1 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {allSkills.length > 0 && (
                <SkillSelector
                  allSkills={allSkills}
                  existingIds={(user.skillsToLearn || []).map(
                    (s) => s.skill?._id || s.skill,
                  )}
                  onAdd={addLearnSkill}
                  buttonLabel="Add"
                />
              )}
            </div>
          </div>

          {/* RIGHT: Suggested Matches (FR5) & Recently Viewed Profiles (FR10) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Suggested Reciprocal Matches (FR5) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal" />
                    <span>Suggested Skill Matches </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calculated based on reciprocal skill overlap and community
                    trust score
                  </p>
                </div>
                <Link
                  to="/explore"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Advanced Search</span> &rarr;
                </Link>
              </div>

              {loading && (
                <div className="text-xs text-slate-400 py-6">
                  Finding compatible partners...
                </div>
              )}

              {!loading && matches.length === 0 && (
                <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center text-xs text-slate-400">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-extrabold text-slate-700 text-sm mb-1">
                    No Matches Yet
                  </h3>
                  <p className="max-w-xs mx-auto text-slate-400">
                    Add more skills to teach and learn on the left panel to
                    discover automatic exchange partners!
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.slice(0, 4).map((m) => (
                  <MatchCard
                    key={m.user._id}
                    match={m}
                    onRequestSwap={handleRequestSwap}
                  />
                ))}
              </div>
            </div>

            {/* Recently Viewed Profiles (FR10) */}
            {recentlyViewed.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span>Recently Viewed Profiles</span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {recentlyViewed.slice(0, 6).map((item) => {
                    const u = item.user;
                    if (!u) return null;
                    return (
                      <Link
                        key={u._id}
                        to={`/profile/${u._id}`}
                        className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition flex items-center gap-3 group"
                      >
                        {u.profileImageUrl ? (
                          <img
                            src={u.profileImageUrl}
                            alt={u.name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-black text-xs">
                            {u.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 group-hover:text-primary transition truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {u.location || "Member"}
                          </div>
                          <div className="mt-0.5">
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">
                              ★ {u.trustScore || 50} pts
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swap Request Modal */}
      <SwapRequestModal
        isOpen={!!selectedTargetUser}
        onClose={() => setSelectedTargetUser(null)}
        targetUser={selectedTargetUser}
        onSuccess={() => {
          setBanner("Swap request submitted successfully!");
          setTimeout(() => setBanner(""), 3000);
          loadData();
        }}
      />
    </div>
  );
}
