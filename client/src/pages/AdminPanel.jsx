import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Users,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Ban,
  Unlock,
  Search,
  Activity,
  ArrowLeftRight,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TrustBadge from "../components/TrustBadge";

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'users' | 'skills' | 'reports'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState("");

  // User search & filters
  const [userQuery, setUserQuery] = useState("");

  // Skill Form
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "IT",
    description: "",
  });
  const [editingSkill, setEditingSkill] = useState(null);
  const [savingSkill, setSavingSkill] = useState(false);

  // Report action state
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportActionNotes, setReportActionNotes] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, skillsRes, reportsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/skills"),
        api.get("/admin/reports"),
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users || []);
      setSkills(skillsRes.data.data.skills || []);
      setReports(reportsRes.data.data.reports || []);
    } catch (err) {
      console.error(err);
      setBanner("Failed to load administrative data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // User Moderation Actions
  const handleToggleSuspend = async (targetUser) => {
    const nextStatus = !targetUser.isSuspended;
    const reason = nextStatus
      ? prompt(
          "Enter suspension reason:",
          "Violation of Community Terms & Conditions",
        )
      : "";

    if (nextStatus && !reason) return;

    try {
      await api.patch(`/admin/users/${targetUser._id}/status`, {
        isSuspended: nextStatus,
        suspensionReason: reason,
      });
      setBanner(
        `User ${targetUser.name} ${nextStatus ? "suspended" : "re-activated"}.`,
      );
      setTimeout(() => setBanner(""), 3000);
      loadAllAdminData();
    } catch (err) {
      setBanner(err.response?.data?.error?.message || "Action failed");
    }
  };

  const handleToggleRole = async (targetUser) => {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    if (
      !window.confirm(
        `Change ${targetUser.name}'s role to ${nextRole.toUpperCase()}?`,
      )
    )
      return;

    try {
      await api.patch(`/admin/users/${targetUser._id}/status`, {
        role: nextRole,
      });
      setBanner(`Updated ${targetUser.name} role to ${nextRole}.`);
      setTimeout(() => setBanner(""), 3000);
      loadAllAdminData();
    } catch (err) {
      setBanner(err.response?.data?.error?.message || "Action failed");
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${targetUser.name}? This will remove all their swaps, reviews, and messages.`,
      )
    )
      return;

    try {
      await api.delete(`/admin/users/${targetUser._id}`);
      setBanner(`User ${targetUser.name} was removed.`);
      setTimeout(() => setBanner(""), 3000);
      loadAllAdminData();
    } catch (err) {
      setBanner(err.response?.data?.error?.message || "Failed to delete user");
    }
  };

  // Skill Management Actions
  const handleCreateOrUpdateSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    setSavingSkill(true);
    try {
      if (editingSkill) {
        await api.put(`/admin/skills/${editingSkill._id}`, newSkill);
        setBanner(`Skill "${newSkill.name}" updated!`);
      } else {
        await api.post("/admin/skills", newSkill);
        setBanner(`Skill "${newSkill.name}" added to catalog!`);
      }
      setNewSkill({ name: "", category: "IT", description: "" });
      setEditingSkill(null);
      setTimeout(() => setBanner(""), 3000);
      loadAllAdminData();
    } catch (err) {
      setBanner(err.response?.data?.error?.message || "Failed to save skill");
    } finally {
      setSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (skill) => {
    if (
      !window.confirm(`Delete skill "${skill.name}" from the global catalog?`)
    )
      return;

    try {
      await api.delete(`/admin/skills/${skill._id}`);
      setBanner(`Skill "${skill.name}" removed.`);
      setTimeout(() => setBanner(""), 3000);
      loadAllAdminData();
    } catch (err) {
      setBanner(err.response?.data?.error?.message || "Failed to delete skill");
    }
  };

  // Report Resolution Actions
  const handleResolveReport = async (
    report,
    actionTaken,
    status = "resolved",
  ) => {
    try {
      await api.patch(`/admin/reports/${report._id}`, {
        status,
        actionTaken,
        adminNotes: reportActionNotes || "Resolved by Administrator",
      });
      setBanner(`Report marked as ${status} with action: ${actionTaken}.`);
      setSelectedReport(null);
      setReportActionNotes("");
      setTimeout(() => setBanner(""), 3000);
      loadAllAdminData();
    } catch (err) {
      setBanner(
        err.response?.data?.error?.message || "Failed to update report",
      );
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      {/* Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Administrative Control Panel (FR12)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Moderation dashboard, skill catalog management, user accounts,
                and community reports
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "users"
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "skills"
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Catalog ({skills.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "reports"
                  ? "bg-pink text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                Reports ({reports.filter((r) => r.status === "pending").length})
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {banner && (
          <div className="mb-6 text-xs font-bold bg-teal-50 text-teal border border-teal-200 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{banner}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                <div className="text-2xl font-black text-slate-900">
                  {stats.metrics.totalUsers}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                  Total Members
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                <div className="text-2xl font-black text-teal">
                  {stats.metrics.activeUsers}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                  Active Users
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                <div className="text-2xl font-black text-primary">
                  {stats.metrics.totalSwaps}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                  Total Swaps
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                <div className="text-2xl font-black text-emerald-600">
                  {stats.metrics.completedSwaps}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                  Completed
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                <div className="text-2xl font-black text-purple-600">
                  {stats.metrics.totalSkills}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                  Catalog Skills
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                <div className="text-2xl font-black text-pink">
                  {stats.metrics.pendingReports}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                  Reports Queue
                </div>
              </div>
            </div>

            {/* Category breakdown & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category distribution */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Skills Distribution by Category</span>
                </h3>
                <div className="space-y-3">
                  {(stats.categoryStats || []).map((cat) => (
                    <div
                      key={cat._id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-700">
                        {cat._id}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{
                              width: `${Math.min(100, cat.count * 20)}%`,
                            }}
                          />
                        </div>
                        <span className="font-extrabold text-slate-900 w-6 text-right">
                          {cat.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-pink" />
                  <span>Recent Moderation Reports</span>
                </h3>
                <div className="space-y-3">
                  {(stats.recentReports || []).length === 0 && (
                    <p className="text-xs text-slate-400 italic">
                      No reports submitted.
                    </p>
                  )}
                  {(stats.recentReports || []).map((rep) => (
                    <div
                      key={rep._id}
                      className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900">
                          {rep.reportedUser?.name}
                        </span>
                        <span className="text-slate-400"> reported by </span>
                        <span className="font-bold text-slate-700">
                          {rep.reporter?.name}
                        </span>
                        <p className="text-[11px] text-pink font-semibold mt-0.5">
                          Reason: {rep.reason}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {rep.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MODERATION */}
        {activeTab === "users" && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  User Moderation (FR12)
                </h2>
                <p className="text-xs text-slate-500">
                  Manage user statuses, roles, and ban offending accounts
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Filter users by name/email..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Reputation</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-extrabold text-slate-900">
                        <div>{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {u.email}
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <TrustBadge
                          score={u.trustScore || 50}
                          tier={u.trustTier || "New Swapper"}
                        />
                      </td>
                      <td className="py-3 text-slate-500">
                        {u.location || "—"}
                      </td>
                      <td className="py-3">
                        {u.isSuspended ? (
                          <span className="text-[10px] font-extrabold bg-pink-100 text-pink px-2 py-0.5 rounded-full">
                            Suspended
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className={`p-1.5 rounded-lg border transition ${
                              u.isSuspended
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-pink-50 text-pink border-pink-200 hover:bg-pink-100"
                            }`}
                            title={
                              u.isSuspended ? "Restore Account" : "Suspend User"
                            }
                          >
                            {u.isSuspended ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Ban className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-[11px] font-bold"
                            title="Toggle Admin Privilege"
                          >
                            Role
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-slate-400 hover:text-pink hover:bg-pink-50 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SKILL CATALOG MANAGEMENT */}
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Add / Edit Skill Form */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-black text-slate-900 mb-4">
                {editingSkill
                  ? "Edit Catalog Skill"
                  : "Add Skill to Catalog (FR3, FR12)"}
              </h2>

              <form onSubmit={handleCreateOrUpdateSkill} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Skill Name
                  </label>
                  <input
                    value={newSkill.name}
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, name: e.target.value })
                    }
                    required
                    placeholder="e.g. Flutter Mobile Dev, Sourdough Bread..."
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newSkill.category}
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, category: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {[
                      "IT",
                      "Arts",
                      "Music",
                      "Cooking",
                      "Languages",
                      "Business",
                      "Sports",
                      "Other",
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    value={newSkill.description}
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Brief description of the skill curriculum..."
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editingSkill && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkill(null);
                        setNewSkill({
                          name: "",
                          category: "IT",
                          description: "",
                        });
                      }}
                      className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingSkill}
                    className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
                  >
                    {savingSkill
                      ? "Saving..."
                      : editingSkill
                        ? "Update Skill"
                        : "Add Skill"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Skills List */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
              <h2 className="text-base font-black text-slate-900 mb-2">
                Available Skill Catalog ({skills.length})
              </h2>

              <div className="max-h-[500px] overflow-y-auto space-y-2.5 divide-y divide-slate-100">
                {skills.map((s) => (
                  <div
                    key={s._id}
                    className="pt-2.5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        {s.name}
                      </div>
                      <div className="text-[10px] font-semibold text-primary">
                        {s.category}
                      </div>
                      {s.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {s.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingSkill(s);
                          setNewSkill({
                            name: s.name,
                            category: s.category,
                            description: s.description || "",
                          });
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                        title="Edit Skill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(s)}
                        className="p-1.5 hover:bg-pink-50 rounded-lg text-slate-400 hover:text-pink transition"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MODERATION REPORTS QUEUE */}
        {activeTab === "reports" && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Content Moderation &amp; User Reports (FR12)
              </h2>
              <p className="text-xs text-slate-500">
                Review community reports and take decisive moderation actions
              </p>
            </div>

            <div className="space-y-4">
              {reports.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  🎉 No reported content or users in the queue!
                </div>
              )}

              {reports.map((rep) => (
                <div
                  key={rep._id}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-slate-900">
                        Report #{rep._id.slice(-6)}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        Filed by <b>{rep.reporter?.name}</b> (
                        {rep.reporter?.email}) against{" "}
                        <b>{rep.reportedUser?.name}</b>
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        rep.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/60 rounded-xl p-3 text-xs">
                    <div className="font-extrabold text-pink mb-1">
                      Reason: {rep.reason}
                    </div>
                    <p className="text-slate-700 whitespace-pre-line">
                      {rep.details}
                    </p>
                  </div>

                  {rep.status === "pending" && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <input
                        placeholder="Admin notes / action rationale..."
                        value={
                          selectedReport === rep._id ? reportActionNotes : ""
                        }
                        onChange={(e) => {
                          setSelectedReport(rep._id);
                          setReportActionNotes(e.target.value);
                        }}
                        className="flex-1 min-w-[200px] border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button
                        onClick={() =>
                          handleResolveReport(rep, "user_suspended")
                        }
                        className="px-3 py-1.5 bg-pink text-white text-xs font-bold rounded-xl hover:bg-pink/90 transition"
                      >
                        Suspend User
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep, "warning_sent")}
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition"
                      >
                        Issue Warning
                      </button>
                      <button
                        onClick={() =>
                          handleResolveReport(rep, "none", "dismissed")
                        }
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
