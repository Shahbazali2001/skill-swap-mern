import React from "react";
import { Link } from "react-router-dom";

/**
 * SkillSwap Brand Logo Component
 * Available in sizes: 'sm' | 'md' | 'lg' | 'xl'
 */
export default function Logo({
  size = "md",
  to = "/",
  showText = true,
  showBadge = false,
  light = false,
}) {
  const sizeConfig = {
    sm: {
      iconBox: "w-7 h-7 rounded-xl",
      svg: "w-4 h-4",
      text: "text-base",
      badge: "text-[9px] px-1.5 py-0.5",
    },
    md: {
      iconBox: "w-9 h-9 rounded-2xl",
      svg: "w-5 h-5",
      text: "text-lg",
      badge: "text-[9px] px-1.5 py-0.5",
    },
    lg: {
      iconBox: "w-11 h-11 rounded-2xl",
      svg: "w-6 h-6",
      text: "text-2xl",
      badge: "text-[10px] px-2 py-0.5",
    },
    xl: {
      iconBox: "w-14 h-14 rounded-3xl",
      svg: "w-8 h-8",
      text: "text-3xl",
      badge: "text-xs px-2.5 py-1",
    },
  }[size] || {
    iconBox: "w-9 h-9 rounded-2xl",
    svg: "w-5 h-5",
    text: "text-lg",
    badge: "text-[9px] px-1.5 py-0.5",
  };

  const content = (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      {/* Dynamic Gradient Icon Emblem */}
      <div
        className={`${sizeConfig.iconBox} relative bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeConfig.svg} text-white`}
        >
          {/* Interlocking arrows / exchange icon */}
          <path
            d="M7 8L3 12L7 16"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 12H15C17.7614 12 20 9.76142 20 7V6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 16L21 12L17 8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12H9C6.23858 12 4 14.2386 4 17V18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Small subtle glow effect */}
        <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {showText && (
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black ${sizeConfig.text} tracking-tight transition-colors ${
              light ? "text-white" : "text-slate-900 group-hover:text-primary"
            }`}
          >
            Skill
            <span className="text-primary group-hover:text-indigo-600 transition-colors">
              Swap
            </span>
          </span>
          {showBadge && (
            <span
              className={`font-extrabold uppercase rounded-md tracking-wider ${sizeConfig.badge} ${
                light
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-primary-light/60 text-primary-dark border border-primary/20"
              }`}
            >
              Barter P2P
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!to) return content;
  return <Link to={to}>{content}</Link>;
}
