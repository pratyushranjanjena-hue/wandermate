"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Zap, MapPin, Users, SlidersHorizontal, UserPlus, UserCheck, Search, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";
import OnboardingModal from "@/components/OnboardingModal";
import { User, UserPreferences } from "@/types";

function calcScore(a: UserPreferences, b: UserPreferences): number {
  let score = 0; let max = 0;
  const match = (va: string, vb: string, weight = 20) => { max += weight; if (va && vb && va === vb) score += weight; };
  const overlap = (va: string[], vb: string[], weight: number) => {
    if (!va?.length && !vb?.length) return;
    max += weight;
    const common = (va || []).filter(x => (vb || []).includes(x)).length;
    const total = new Set([...(va || []), ...(vb || [])]).size;
    score += total > 0 ? Math.round((common / total) * weight) : 0;
  };
  match(a.accommodation, b.accommodation, 15);
  match(a.pace, b.pace, 20);
  match(a.wakeTime, b.wakeTime, 15);
  match(a.budgetRange, b.budgetRange, 25);
  match(a.diet, b.diet, 10);
  overlap(a.travelTypes, b.travelTypes, 30);
  overlap(a.cuisines, b.cuisines, 10);
  overlap(a.languages, b.languages, 15);
  overlap(a.movieGenres, b.movieGenres, 10);
  const dealHit = (a.dealbreakers || []).some(d => (b.skillTags || []).includes(d));
  if (dealHit) score = Math.max(0, score - 25);
  return max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;
}

function scoreLabel(s: number) {
  if (s >= 80) return { text: "Perfect Match", emoji: "🔥", color: "text-green-600", bg: "bg-green-50 border-green-200", bar: "bg-green-500" };
  if (s >= 60) return { text: "Great Fit", emoji: "👍", color: "text-teal-600", bg: "bg-teal-50 border-teal-200", bar: "bg-teal-500" };
  if (s >= 40) return { text: "Decent Match", emoji: "🤔", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", bar: "bg-yellow-400" };
  return { text: "Different Style", emoji: "🙂", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", bar: "bg-gray-300" };
}

const BUDGET_LABEL: Record<string, string> = {
  "under-5k": "Under ₹5K", "5k-15k": "₹5K–₹15K", "15k-40k": "₹15K–₹40K", "40k-plus": "₹40K+"
};
const TRAVEL_TYPES = ["mountains","beaches","heritage","wildlife","road-trips","backpacking","adventure","spiritual","photography","food-tours"];
const BUDGET_OPTS = ["under-5k","5k-15k","15k-40k","40k-plus"];
const SKILL_TAGS = ["pro-rider","beginner-rider","mechanic","experienced-trekker","beginner-trekker","photographer","diver","swimmer","first-aid","navigator","driver-4x4"];

const PACE_LABEL: Record<string, string> = { "slow-relaxed": "🐢 Relaxed", "moderate": "🚶 Moderate", "packed-itinerary": "⚡ Packed" };
const DIET_LABEL: Record<string, string> = { "veg": "🥗 Veg", "non-veg": "🍗 Non-Veg", "vegan": "🌱 Vegan", "jain": "🙏 Jain" };

function MatchCard({ matchUser, score, isFollowing, onFollow }: {
  matchUser: User; score: number; isFollowing: boolean; onFollow: () => void;
}) {
  const label = scoreLabel(score);
  const prefs = matchUser.preferences;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${label.bar}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Link href={`/profile/${matchUser.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-200 to-emerald-300 flex items-center justify-center text-3xl border-2 border-white shadow-md shrink-0">
              {matchUser.avatar}
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">{matchUser.name}</p>
              <p className="text-sm text-gray-400 flex items-center gap-0.5 mt-0.5"><MapPin className="w-3.5 h-3.5" />{matchUser.city}</p>
              {prefs?.ageGroup && <p className="text-xs text-gray-400 mt-0.5">{prefs.ageGroup} yrs</p>}
            </div>
          </Link>
          <div className="text-right shrink-0">
            <div className={`text-3xl font-extrabold ${label.color}`}>{score}%</div>
            <div className={`text-xs font-bold px-2.5 py-0.5 rounded-full border mt-0.5 ${label.bg} ${label.color}`}>{label.emoji} {label.text}</div>
          </div>
        </div>

        {/* Score bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all duration-700 ${label.bar}`} style={{ width: `${score}%` }} />
        </div>

        {/* Trait chips */}
        {prefs && (
          <div className="space-y-2 mb-4">
            <div className="flex flex-wrap gap-1.5">
              {prefs.budgetRange && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">💰 {BUDGET_LABEL[prefs.budgetRange]}</span>}
              {prefs.pace && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">{PACE_LABEL[prefs.pace]}</span>}
              {prefs.diet && <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">{DIET_LABEL[prefs.diet]}</span>}
              {(prefs.travelTypes || []).slice(0, 2).map(t => (
                <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 capitalize">{t.replace(/-/g, " ")}</span>
              ))}
            </div>
            {(prefs.skillTags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(prefs.skillTags || []).map(t => (
                  <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 capitalize">{t.replace(/-/g, " ")}</span>
                ))}
              </div>
            )}
            {(prefs.languages || []).length > 0 && (
              <p className="text-xs text-gray-400">Speaks: {(prefs.languages || []).join(", ")}</p>
            )}
          </div>
        )}

        {matchUser.bio && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{matchUser.bio}</p>}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/profile/${matchUser.id}`}
            className="flex-1 text-center border border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-600 text-sm font-semibold py-2.5 rounded-xl transition-colors">
            View Profile
          </Link>
          <button onClick={onFollow}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl transition-colors ${isFollowing ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500" : "bg-teal-600 text-white hover:bg-teal-700"}`}>
            {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MatchPage() {
  const { user, getAllUsers, followUser, unfollowUser } = useAuth();
  const { showToast } = useToast();
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [filterBudget, setFilterBudget] = useState("");
  const [filterTravel, setFilterTravel] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => { getAllUsers().then(setAllUsers); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const matches = useMemo(() => {
    if (!user) return [];
    return allUsers
      .filter(u => u.id !== user.id)
      .map(u => ({ user: u, score: (user.preferences && u.preferences) ? calcScore(user.preferences, u.preferences) : 0 }))
      .filter(m => {
        if (search && !m.user.name.toLowerCase().includes(search.toLowerCase()) && !m.user.city.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterBudget && m.user.preferences?.budgetRange !== filterBudget) return false;
        if (filterTravel && !(m.user.preferences?.travelTypes || []).includes(filterTravel)) return false;
        if (filterSkill && !(m.user.preferences?.skillTags || []).includes(filterSkill)) return false;
        if (m.score < minScore) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [user, allUsers, filterBudget, filterTravel, filterSkill, search, minScore]);

  const handleFollow = (targetUser: User) => {
    const isFollowing = (user!.following || []).includes(targetUser.id);
    if (isFollowing) { unfollowUser(targetUser.id); showToast(`Unfollowed ${targetUser.name}`); }
    else { followUser(targetUser.id); showToast(`Now following ${targetUser.name}! 🎉`); }
  };

  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d3d38 100%)" }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-teal-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Find Your Activity Tribe</h2>
          <p className="text-gray-300 text-base max-w-sm mb-8">Sign in to see who matches your style, budget, vibe and interests — across India.</p>
          <button onClick={() => setShowAuth(true)} className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:scale-105 shadow-xl shadow-teal-500/30">
            Sign In to Start Matching
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSignupSuccess={() => setShowOnboarding(true)} />}
        {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      </div>
    );
  }

  const profileComplete = !!(user.preferences?.budgetRange || user.preferences?.travelTypes?.length);
  const perfectCount = matches.filter(m => m.score >= 80).length;
  const greatCount = matches.filter(m => m.score >= 60 && m.score < 80).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d3d38 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> AI-Powered Matching
              </div>
              <h1 className="text-4xl font-extrabold text-white leading-tight mb-2">
                Meet People Who<br />
                <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Actually Show Up</span>
              </h1>
              <p className="text-gray-300 text-base max-w-lg">
                Matched by budget, pace, travel style and interests — not just location.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {(perfectCount > 0 || greatCount > 0) && (
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-green-400">{perfectCount}</p>
                    <p className="text-xs uppercase tracking-wide">Perfect matches</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-teal-400">{greatCount}</p>
                    <p className="text-xs uppercase tracking-wide">Great fits</p>
                  </div>
                  <div className="w-px h-10 bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-white">{matches.length}</p>
                    <p className="text-xs uppercase tracking-wide">Total found</p>
                  </div>
                </div>
              )}
              <button onClick={() => setShowOnboarding(true)}
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-full text-sm transition-all hover:scale-105 shadow-lg shadow-teal-500/30">
                <SlidersHorizontal className="w-4 h-4" />
                {profileComplete ? "Update My Profile" : "Complete My Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Incomplete profile banner */}
        {!profileComplete && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">⚡</div>
            <div className="flex-1">
              <p className="font-bold text-amber-800">Your profile is incomplete — matches are limited</p>
              <p className="text-amber-600 text-sm mt-0.5">Take the quick quiz to unlock full compatibility scores and better recommendations.</p>
            </div>
            <button onClick={() => setShowOnboarding(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0">
              Take the Quiz →
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or city..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
            </div>
            <select value={filterBudget} onChange={e => setFilterBudget(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white">
              <option value="">💰 Any Budget</option>
              {BUDGET_OPTS.map(b => <option key={b} value={b}>{BUDGET_LABEL[b]}</option>)}
            </select>
            <select value={filterTravel} onChange={e => setFilterTravel(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white capitalize">
              <option value="">🗺️ Any Travel Type</option>
              {TRAVEL_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/-/g, " ")}</option>)}
            </select>
            <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white capitalize">
              <option value="">🏷️ Any Skill</option>
              {SKILL_TAGS.map(t => <option key={t} value={t} className="capitalize">{t.replace(/-/g, " ")}</option>)}
            </select>
            <select value={minScore} onChange={e => setMinScore(Number(e.target.value))}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white">
              <option value={0}>⚡ Any match %</option>
              <option value={40}>40%+ match</option>
              <option value={60}>60%+ match</option>
              <option value={80}>🔥 80%+ only</option>
            </select>
            {(filterBudget || filterTravel || filterSkill || search || minScore > 0) && (
              <button onClick={() => { setFilterBudget(""); setFilterTravel(""); setFilterSkill(""); setSearch(""); setMinScore(0); }}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-teal-500" /> <strong className="text-gray-700">{matches.length}</strong> people found</span>
          {perfectCount > 0 && <span className="flex items-center gap-1.5 text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-1 rounded-full">🔥 {perfectCount} perfect {perfectCount === 1 ? "match" : "matches"}</span>}
          {greatCount > 0 && <span className="flex items-center gap-1.5 text-teal-600 font-semibold bg-teal-50 border border-teal-200 px-3 py-1 rounded-full"><TrendingUp className="w-3.5 h-3.5" /> {greatCount} great fits</span>}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl font-bold text-gray-700">No matches found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or <button onClick={() => setShowOnboarding(true)} className="text-teal-600 underline font-medium">update your profile</button></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map(m => (
              <MatchCard key={m.user.id} matchUser={m.user} score={m.score}
                isFollowing={(user.following || []).includes(m.user.id)}
                onFollow={() => handleFollow(m.user)} />
            ))}
          </div>
        )}
      </div>
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
