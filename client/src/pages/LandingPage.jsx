import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Users,
  Compass,
  Star,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Layers,
  Award,
  Zap,
  Play,
} from "lucide-react";
import Logo from "../components/Logo";
import TrustBadge from "../components/TrustBadge";

const POPULAR_SKILLS = [
  { name: "Python Programming", category: "IT", level: "Expert", icon: "💻" },
  { name: "Graphic Design", category: "Arts", level: "Advanced", icon: "🎨" },
  { name: "Acoustic Guitar", category: "Music", level: "Advanced", icon: "🎸" },
  {
    name: "Authentic Cooking",
    category: "Cooking",
    level: "Expert",
    icon: "🍳",
  },
  { name: "English IELTS", category: "Languages", level: "Expert", icon: "🗣️" },
  { name: "Video Editing", category: "IT", level: "Advanced", icon: "🎬" },
  {
    name: "Digital Marketing",
    category: "Business",
    level: "Intermediate",
    icon: "📈",
  },
  { name: "Urdu Calligraphy", category: "Arts", level: "Expert", icon: "✒️" },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Create Your Profile & Catalog Skills",
    desc: "List the expertise you can teach and what you yearn to learn with defined proficiency levels.",
    icon: <GraduationCap className="w-6 h-6 text-primary" />,
  },
  {
    step: "02",
    title: "Discover Reciprocal Matches",
    desc: "Our intelligent matching engine automatically pairs your teaching skills with matching learning interests.",
    icon: <Sparkles className="w-6 h-6 text-teal" />,
  },
  {
    step: "03",
    title: "Exchange & Chat in Real Time",
    desc: "Send swap requests, schedule video or local sessions, and collaborate over live encrypted chat.",
    icon: <MessageSquare className="w-6 h-6 text-indigo-500" />,
  },
  {
    step: "04",
    title: "Build Verified Reputation",
    desc: "Rate completed lessons and build your community Trust Score to unlock verified badges and tiers.",
    icon: <Award className="w-6 h-6 text-amber-500" />,
  },
];

const TESTIMONIALS = [
  {
    name: "Hira Aslam",
    headline: "Graphic Designer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    feedback:
      "I traded acoustic guitar lessons for advanced Adobe Illustrator techniques. Zero money spent, and I gained an incredible learning partner!",
    rating: 5,
    swap: "Guitar ⇄ Graphic Design",
    trustScore: 94,
    tier: "Master Swapper",
  },
  {
    name: "Ali Khan",
    headline: "Fullstack Engineer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    feedback:
      "The reciprocal matching engine found me a partner within minutes of listing my Python skills. The real-time chat makes lesson planning seamless.",
    rating: 5,
    swap: "Python ⇄ Guitar",
    trustScore: 88,
    tier: "Trusted Partner",
  },
  {
    name: "Chef Tariq",
    headline: "Culinary Master",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    feedback:
      "Teaching traditional Pakistani recipes in exchange for SEO and social media strategy transformed my culinary workshops!",
    rating: 5,
    swap: "Pakistani Cuisine ⇄ Digital Marketing",
    trustScore: 92,
    tier: "Master Swapper",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary-light selection:text-primary-dark">
      {/* 1. TOP STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size="md" showBadge to="/" />

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#how-it-works" className="hover:text-primary transition">
              How It Works
            </a>
            <a href="#skills" className="hover:text-primary transition">
              Explore Skills
            </a>
            <a href="#features" className="hover:text-primary transition">
              Platform Features
            </a>
            <a href="#testimonials" className="hover:text-primary transition">
              Community Reviews
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 sm:px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-white">
        {/* Background ambient gradient blurs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-primary/10 via-indigo-500/10 to-teal/10 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light/80 border border-primary/20 text-primary-dark text-xs font-black shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Knowledge is the Primary Currency</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Trade Your Skills.{" "}
                <span className="bg-gradient-to-r from-primary via-indigo-600 to-teal bg-clip-text text-transparent">
                  No Money Needed.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                SkillSwap is a peer-to-peer knowledge barter platform. Remove
                financial barriers to learning by teaching what you master in
                return for what you want to learn.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Start Swapping Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-700" />
                  <span>Explore Demo Accounts</span>
                </Link>
              </div>

              {/* Community Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 border-t border-slate-200/80 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  <span>100% Free Skill Barter</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Verified Trust Scores</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Real-Time Sockets Chat</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-500">
                {/* Header of card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-800">
                      Reciprocal Match Found!
                    </span>
                  </div>
                  <span className="text-[11px] font-black bg-teal-50 text-teal px-2.5 py-0.5 rounded-full border border-teal-200">
                    95% Compatible
                  </span>
                </div>

                {/* Match Exchange Demonstration */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-black text-xs">
                        HA
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          Hira Aslam
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Peshawar, Pakistan
                        </div>
                      </div>
                    </div>
                    <TrustBadge score={94} tier="Master Swapper" size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        You Learn
                      </div>
                      <div className="font-extrabold text-primary flex items-center gap-1 mt-0.5">
                        <span>🎸 Acoustic Guitar</span>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        You Teach
                      </div>
                      <div className="font-extrabold text-pink flex items-center gap-1 mt-0.5">
                        <span>💻 Python Core</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Message Snippet */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3 text-xs text-slate-700 flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-primary">
                      Live Chat Active:
                    </span>{" "}
                    &ldquo;Sunday 4 PM works great for our first coding and
                    chords session!&rdquo;
                  </div>
                </div>

                <Link
                  to="/login"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Sign In &amp; Launch Prototype</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY METRICS STATS BAR */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              $0.00
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">
              Cost to Learn Skills
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-primary">
              8+
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">
              Skill Domains
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-teal">
              100%
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">
              Reciprocal Logic
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-purple-600">
              4-Tier
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">
              Trust Algorithm
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR SKILLS CATALOG PREVIEW (FR3) */}
      <section id="skills" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-primary-light/70 px-3 py-1 rounded-full">
            Categorized Skill Catalog
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
            Exchange Across Any Passion &amp; Profession
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Select from categorized domains including IT, Creative Arts, Music,
            Culinary Arts, Languages, and Business.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_SKILLS.map((skill) => (
            <div
              key={skill.name}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{skill.icon}</span>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-primary transition">
                    {skill.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {skill.category}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {skill.level}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
          >
            <span>Explore all categorized skills in search engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 bg-slate-50/60 border-t border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal bg-teal-light px-3 py-1 rounded-full">
              4 Simple Steps
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
              How Knowledge Barter Works on SkillSwap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              From profile creation to verified rating, here is how you trade
              skills with community members.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {step.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. COMMUNITY REVIEWS & TRUST (FR8, FR9) */}
      <section
        id="testimonials"
        className="py-20 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            Community Trust
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
            Real Feedback from Real Swappers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every rating directly informs user Trust Scores and establishes
            community safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <TrustBadge score={t.trustScore} tier={t.tier} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-4">
                  &ldquo;{t.feedback}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-2xl object-cover"
                />
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {t.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {t.swap}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to exchange skills with your community?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create an account or sign in with pre-seeded demo accounts to
            experience all 12 functional requirements live.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-black text-xs rounded-2xl shadow-lg transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs rounded-2xl border border-white/20 transition"
            >
              Sign In to Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-10 px-4 sm:px-6 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="md" light to="/" />
          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <div>Final Year Project (CS619) — Shahbaz Ali (BC210210215)</div>
            <div className="mt-1">
              Supervised by: Sir. Safid Ullah Shah &middot; Group:
              S26PROJECTCAC47
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
