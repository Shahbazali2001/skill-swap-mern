import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  ArrowLeftRight,
  BookOpen,
  GraduationCap,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TrustBadge from "../components/TrustBadge";
import SwapRequestModal from "../components/SwapRequestModal";

const CATEGORIES = [
  "All",
  "IT",
  "Arts",
  "Music",
  "Cooking",
  "Languages",
  "Business",
  "Sports",
  "Other",
];

const EXPERTISE_LEVELS = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

export default function ExploreSearch() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States (FR4)
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("teach"); // 'teach' | 'learn' | 'all'
  const [level, setLevel] = useState("All");
  const [location, setLocation] = useState("");
  const [minTrustScore, setMinTrustScore] = useState(0);

  // Swap Request Modal Target
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [banner, setBanner] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (category !== "All") params.category = category;
      if (mode !== "all") params.mode = mode;
      if (level !== "All") params.level = level;
      if (location.trim()) params.location = location.trim();
      if (minTrustScore > 0) params.minTrustScore = minTrustScore;

      const res = await api.get("/users/search", { params });
      setUsers(res.data.data.users || []);
      setTotalCount(res.data.data.count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, category, mode, level, location, minTrustScore]);

  const resetFilters = () => {
    setSearchQuery("");
    setCategory("All");
    setMode("teach");
    setLevel("All");
    setLocation("");
    setMinTrustScore(0);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Advanced Skill Search Engine (FR4)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find community partners by specific skills, expertise tiers,
              geographic proximity, and verified trust scores.
            </p>
          </div>

          {/* Quick Category Chips (FR3) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-5 pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition flex-shrink-0 ${
                  category === cat
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat === "All" ? "🌟 All Categories" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {banner && (
          <div className="mb-6 text-xs font-bold bg-teal-50 text-teal border border-teal-200 px-4 py-3 rounded-2xl shadow-sm animate-in fade-in duration-200">
            {banner}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Filter Sidebar (FR4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>Search Filters</span>
              </h2>
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Keyword Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Skill or Keyword
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Python, Guitar, Design, Ali..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Teaching vs Learning Mode */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Looking For
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setMode("teach")}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                    mode === "teach"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Teachers
                </button>
                <button
                  onClick={() => setMode("learn")}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                    mode === "learn"
                      ? "bg-white text-pink shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Learners
                </button>
                <button
                  onClick={() => setMode("all")}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
                    mode === "all"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Expertise Level Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Expertise Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {EXPERTISE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Geographic Proximity / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Islamabad, Lahore, Karachi..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Minimum Trust Score Slider (FR9) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Min Trust Score:{" "}
                  <span className="text-primary font-black">
                    {minTrustScore}
                  </span>
                </label>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                step={10}
                value={minTrustScore}
                onChange={(e) => setMinTrustScore(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>Any (0)</span>
                <span>Verified (50+)</span>
                <span>Master (90+)</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Search Results Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Found{" "}
                <span className="text-slate-900 font-extrabold">
                  {totalCount}
                </span>{" "}
                potential swap partners
              </span>
            </div>

            {loading && (
              <div className="py-12 text-center text-xs text-slate-400">
                Searching skill community...
              </div>
            )}

            {!loading && users.length === 0 && (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="font-extrabold text-slate-800 text-sm mb-1">
                  No Members Matched
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Try clearing some filter criteria or searching for broader
                  terms like "IT", "Music", or "Arts".
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* User Header */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <Link
                        to={`/profile/${u._id}`}
                        className="group flex-shrink-0"
                      >
                        {u.profileImageUrl ? (
                          <img
                            src={u.profileImageUrl}
                            alt={u.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-100 group-hover:ring-2 ring-primary/40 transition"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition">
                            {u.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/profile/${u._id}`}
                          className="font-extrabold text-sm text-slate-900 hover:text-primary transition block truncate"
                        >
                          {u.name}
                        </Link>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">
                            {u.location || "Location not set"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Badge (FR9) */}
                    <div className="mb-3">
                      <TrustBadge
                        score={u.trustScore || 50}
                        tier={u.trustTier || "New Swapper"}
                        averageRating={u.averageRating || 0}
                        ratingsCount={u.ratingsCount || 0}
                      />
                    </div>

                    {u.headline && (
                      <p className="text-xs text-slate-600 mb-3 italic line-clamp-1">
                        &ldquo;{u.headline}&rdquo;
                      </p>
                    )}

                    {/* Skills to Teach */}
                    <div className="mb-2.5">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-primary" />
                        <span>Teaches</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(u.skillsToTeach || []).map((s) => (
                          <span
                            key={s.skill?._id || s.skill}
                            className="text-[11px] font-bold bg-primary-light text-primary-dark px-2.5 py-0.5 rounded-lg"
                          >
                            {s.skill?.name || "Skill"}{" "}
                            <span className="text-[9px] opacity-75 font-normal">
                              ({s.level})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills to Learn */}
                    <div className="mb-4">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-pink" />
                        <span>Wants to Learn</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(u.skillsToLearn || []).map((s) => (
                          <span
                            key={s.skill?._id || s.skill}
                            className="text-[11px] font-bold bg-pink-light text-pink px-2.5 py-0.5 rounded-lg"
                          >
                            {s.skill?.name || "Skill"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <Link
                      to={`/profile/${u._id}`}
                      className="flex-1 py-2 text-center text-xs font-bold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => setSelectedTargetUser(u)}
                      className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Request Swap</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Swap Request Modal */}
      <SwapRequestModal
        isOpen={!!selectedTargetUser}
        onClose={() => setSelectedTargetUser(null)}
        targetUser={selectedTargetUser}
        onSuccess={() => {
          setBanner(`Swap request sent to ${selectedTargetUser?.name}!`);
          setTimeout(() => setBanner(""), 3000);
        }}
      />
    </div>
  );
}
