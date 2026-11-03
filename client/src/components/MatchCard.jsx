import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, CheckCircle, MapPin, Sparkles } from "lucide-react";
import TrustBadge from "./TrustBadge";

/**
 * FR5 - Matching Logic Engine Card
 */
export default function MatchCard({ match, onRequestSwap }) {
  const {
    user,
    theyTeachIWant,
    iTeachTheyWant,
    reciprocal,
    compatibilityPercentage,
  } = match;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link
            to={`/profile/${user._id}`}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-100 group-hover:ring-2 ring-primary/50 transition"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition flex items-center gap-1.5">
                {user.name}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {user.location || "Location not set"}
              </div>
            </div>
          </Link>

          {/* Compatibility badge */}
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-black bg-gradient-to-r from-primary/10 to-teal/10 text-primary-dark px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal" />
              {compatibilityPercentage || 85}% Match
            </span>
          </div>
        </div>

        {/* Reputation Badge (FR9) */}
        <div className="mb-3">
          <TrustBadge
            score={user.trustScore}
            tier={user.trustTier}
            averageRating={user.averageRating}
            ratingsCount={user.ratingsCount}
          />
        </div>

        {/* They Teach / You Want */}
        {theyTeachIWant.length > 0 && (
          <div className="mb-2.5">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              They Teach (You Want)
            </div>
            <div className="flex flex-wrap gap-1">
              {theyTeachIWant.map((s) => (
                <span
                  key={s._id}
                  className="text-[11px] font-bold bg-primary-light text-primary-dark px-2.5 py-0.5 rounded-lg"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* You Teach / They Want */}
        {iTeachTheyWant.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              You Teach (They Want)
            </div>
            <div className="flex flex-wrap gap-1">
              {iTeachTheyWant.map((s) => (
                <span
                  key={s._id}
                  className="text-[11px] font-bold bg-pink-light text-pink px-2.5 py-0.5 rounded-lg"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2">
        {reciprocal && (
          <div className="text-[11px] font-bold text-teal flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-teal" /> 2-Way Reciprocal
            Opportunity
          </div>
        )}

        <div className="flex gap-2">
          <Link
            to={`/profile/${user._id}`}
            className="flex-1 text-center py-2 text-xs font-bold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition"
          >
            View Profile
          </Link>
          <button
            onClick={() => onRequestSwap(match)}
            disabled={
              iTeachTheyWant.length === 0 && theyTeachIWant.length === 0
            }
            className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-xl hover:bg-primary-dark transition flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Request Swap
          </button>
        </div>
      </div>
    </div>
  );
}
