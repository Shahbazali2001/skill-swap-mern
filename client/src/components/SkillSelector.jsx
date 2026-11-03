import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";

/**
 * FR3 - Skill Cataloging Selector
 */
export default function SkillSelector({
  allSkills = [],
  existingIds = [],
  onAdd,
  buttonLabel = "Add Skill",
  showLevel = false,
}) {
  const [category, setCategory] = useState("");
  const [skillId, setSkillId] = useState("");
  const [level, setLevel] = useState("Intermediate");

  const categories = useMemo(
    () => [...new Set(allSkills.map((s) => s.category))].sort(),
    [allSkills],
  );

  const filteredSkills = useMemo(
    () =>
      allSkills.filter(
        (s) =>
          (!category || s.category === category) &&
          !existingIds.map(String).includes(String(s._id)),
      ),
    [allSkills, category, existingIds],
  );

  const handleAdd = () => {
    if (!skillId) return;
    onAdd(showLevel ? { skill: skillId, level } : { skill: skillId });
    setSkillId("");
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setSkillId("");
        }}
        className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={skillId}
        onChange={(e) => setSkillId(e.target.value)}
        className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 min-w-[170px] focus:outline-none focus:ring-2 focus:ring-primary/40 flex-1 sm:flex-initial"
      >
        <option value="">Select a skill...</option>
        {filteredSkills.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      {showLevel && (
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {["Beginner", "Intermediate", "Advanced", "Expert"].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={handleAdd}
        disabled={!skillId}
        className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1 disabled:opacity-40 shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{buttonLabel}</span>
      </button>
    </div>
  );
}
