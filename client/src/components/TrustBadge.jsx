import React from "react";

const TIER_STYLES = {
  "Master Swapper": {
    badge: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "👑",
    bar: "bg-purple-600",
  },
  "Trusted Partner": {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "🛡️",
    bar: "bg-emerald-600",
  },
  "Verified Member": {
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "✓",
    bar: "bg-blue-600",
  },
  "New Swapper": {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "🌱",
    bar: "bg-amber-500",
  },
};

/**
 * FR9 - Reputation Score Algorithm Display
 */
export default function TrustBadge({
  score = 50,
  tier = "New Swapper",
  ratingsCount = 0,
  averageRating = 0,
  size = "sm",
}) {
  const style = TIER_STYLES[tier] || TIER_STYLES["New Swapper"];

  if (size === "lg") {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{style.icon}</span>
            <div>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${style.badge}`}
              >
                {tier}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900">
              {score}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Trust Score
            </div>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${style.bar}`}
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 font-semibold">
            <span className="text-amber-500">★</span>
            <span className="text-slate-900 font-bold">
              {averageRating > 0 ? averageRating.toFixed(1) : "New"}
            </span>
            <span className="text-slate-400">({ratingsCount} reviews)</span>
          </div>
          <div className="text-[11px] text-slate-400">Community Verified</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5"
      title={`Trust Score: ${score}/100 based on ratings and completed swaps`}
    >
      <span
        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${style.badge}`}
      >
        <span>{style.icon}</span>
        <span>{tier}</span>
        <span className="font-mono text-[10px] opacity-75">({score})</span>
      </span>
    </div>
  );
}
