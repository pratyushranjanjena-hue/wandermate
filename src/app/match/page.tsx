"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Zap, MapPin, Filter, Users, SlidersHorizontal, UserPlus, UserCheck, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";
import OnboardingModal from "@/components/OnboardingModal";
import { User, UserPreferences } from "@/types";

// ── Scoring engine ────────────────────────────────────────────────────────────
function calcScore(a: UserPreferences, b: UserPreferences): number {
  let score = 0; let max = 0;

  const match = (va: string, vb: string, weight = 20) => {
    max += weight;
    if (va && vb && va === vb) score += weight;
  };
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

  // Dealbreaker penalty
  const dealHit = (a.dealbreakers || []).some(d => (b.skillTags || []).includes(d));
  if (dealHit) score = Math.max(0, score - 25);

  return max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;
}

function scoreLabel(s: number) {
  if (s >= 80) return { text: "Perfect Match 🔥", color: "text-green-600", bg: "bg-green-50 border-green-200" };
  if (s >= 60) return { text: "Great Fit 👍", color: "text-teal-600", bg: "bg-teal-50 border-teal-200" };
  if (s >= 40) return { text: "Decent Match", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" };
  return { text: "Different Style", color: "text-gray-500", bg: "bg-gray-50 border-gray-200" };
}

const BUDGET_LABEL: Record<string, string> = {
  "under-5k": "Under ₹5K", "5k-15k": "₹5K–₹15K", "15k-40k": "₹15K–₹40K", "40k-plus": "₹40K+"
};
const TRAVEL_TYPES = ["mountains","beaches","heritage","wildlife","road-trips","backpacking","adventure","spiritual","photography","food-tours"];
const BUDGET_OPTS = ["under-5k","5k-15k","15k-40k","40k-plus"];
const SKILL_TAGS = ["pro-rider","beginner-rider","mechanic","experienced-trekker","beginner-trekker","photographer","diver","swimmer","first-aid","navigator","driver-4x4"];

function MatchCard({ matchUser, score, isFollowing, onFollow }: {
  matchUser: User; score: number; isFollowing: boolean; onFollow: () => void;
}) {
  const label = scoreLabel(score);
  const prefs = matchUser.preferences;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <Link href={`/profile/${matchUser.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-100 to-teal-300 flex items-center justify-center text-3xl border-2 border-teal-200 shrink-0">
            {matchUser.avatar}
          </div>
          <div>
            <p className="font-bold text-gray-900">{matchUser.name}</p>
            <p className="text-sm text-gray-400 flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5" />{matchUser.city}</p>
            {prefs?.ageGroup && <p className="text-xs text-gray-400 mt-0.5">{prefs.ageGroup} yrs</p>}
          </div>
        </Link>
        <div className="text-right shrink-0">
          <div className={`text-2xl font-extrabold ${label.color}`}>{score}%</div>
          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${label.bg} ${label.color}`}>{label.text}</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${score >= 70 ? "bg-green-500" : score >= 40 ? "bg-teal-500" : "bg-gray-400"}`}
          style={{ width: `${score}%` }} />
      </div>

      {/* Preferences */}
      {prefs && (
        <div className="space-y-2">
          {/* Top shared traits */}
          <div className="flex flex-wrap gap-1.5">
            {prefs.budgetRange && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">💰 {BUDGET_LABEL[prefs.budgetRange]}</span>
            )}
            {prefs.pace && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {prefs.pace === "slow-relaxed" ? "🐢 Relaxed" : prefs.pace === "moderate" ? "🚶 Moderate" : "⚡ Packed"}
              </span>
            )}
            {prefs.diet && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                {prefs.diet === "veg" ? "🥗 Veg" : prefs.diet === "non-veg" ? "🍗 Non-Veg" : prefs.diet === "vegan" ? "🌱 Vegan" : "🙏 Jain"}
              </span>
            )}
            {(prefs.travelTypes || []).slice(0, 2).map(t => (
              <span key={t} className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 capitalize">{t.replace(/-/g, " ")}</span>
            ))}
          </div>
          {/* Skill tags */}
          {(prefs.skillTags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(prefs.skillTags || []).map(t => (
                <span key={t} className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 capitalize">{t.replace(/-/g, " ")}</span>
              ))}
            </div>
          )}
          {/* Languages */}
          {(prefs.languages || []).length > 0 && (
            <p className="text-xs text-gray-400">Speaks: {(prefs.languages || []).join(", ")}</p>
          )}
        </div>
      )}

      {matchUser.bio && <p className="text-sm text-gray-500 line-clamp-2">{matchUser.bio}</p>}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link href={`/profile/${matchUser.id}`}
          className="flex-1 text-center border border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-600 text-sm font-semibold py-2 rounded-xl transition-colors">
          View Profile
        </Link>
        <button onClick={onFollow}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2 rounded-xl transition-colors ${isFollowing
            ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
            : "bg-teal-600 text-white hover:bg-teal-700"}`}>
          {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
        </button>
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
  useEffect(() => { setAllUsers(getAllUsers()); }, [user]);

  const matches = useMemo(() => {
    if (!user) return [];
    const others = allUsers.filter(u => u.id !== user.id);
    return others
      .map(u => ({
        user: u,
        score: (user.preferences && u.preferences) ? calcScore(user.preferences, u.preferences) : 0,
      }))
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

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Zap className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Travel Tribe</h2>
        <p className="text-gray-500 mb-6">Sign in to see who matches your travel style, budget and personality</p>
        <button onClick={() => setShowAuth(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-full transition-colors">
          Sign In to Match
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSignupSuccess={() => setShowOnboarding(true)} />}
        {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      </div>
    );
  }

  const profileComplete = !!(user.preferences?.budgetRange || user.preferences?.travelTypes?.length);

  const handleFollow = (targetUser: User) => {
    const isFollowing = (user.following || []).includes(targetUser.id);
    if (isFollowing) {
      unfollowUser(targetUser.id);
      showToast(`Unfollowed ${targetUser.name}`);
    } else {
      followUser(targetUser.id);
      showToast(`Now following ${targetUser.name}! 🎉`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-8 h-8 text-teal-600" /> Smart Group Matching
          </h1>
          <p className="text-gray-500 mt-1">Find travelers who match your style, budget, and personality</p>
        </div>
        <button onClick={() => setShowOnboarding(true)}
          className="flex items-center gap-2 border border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          {profileComplete ? "Update My Profile" : "Complete My Profile"}
        </button>
      </div>

      {/* Profile incomplete banner */}
      {!profileComplete && (
        <div className="bg-gradient-to-r from-teal-50 to-teal-50 border border-teal-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-teal-800">Your travel profile is incomplete</p>
            <p className="text-teal-600 text-sm mt-0.5">Complete the quiz to see compatibility scores and get better matches</p>
          </div>
          <button onClick={() => setShowOnboarding(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0">
            Take the Quiz →
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
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
            <option value="">🏷️ Any Skill Tag</option>
            {SKILL_TAGS.map(t => <option key={t} value={t} className="capitalize">{t.replace(/-/g, " ")}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Min match:</span>
            <select value={minScore} onChange={e => setMinScore(Number(e.target.value))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white">
              <option value={0}>Any</option>
              <option value={40}>40%+</option>
              <option value={60}>60%+</option>
              <option value={80}>80%+</option>
            </select>
          </div>
          {(filterBudget || filterTravel || filterSkill || search || minScore > 0) && (
            <button onClick={() => { setFilterBudget(""); setFilterTravel(""); setFilterSkill(""); setSearch(""); setMinScore(0); }}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-teal-500" /> {matches.length} travelers found</span>
        {matches.filter(m => m.score >= 70).length > 0 && (
          <span className="flex items-center gap-1.5 text-green-600 font-semibold">
            🔥 {matches.filter(m => m.score >= 70).length} perfect matches
          </span>
        )}
      </div>

      {/* Match grid */}
      {matches.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🔍</p>
          <p className="font-medium text-lg">No matches found</p>
          <p className="text-sm mt-1">Try adjusting your filters or invite friends to join WanderMate</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map(m => (
            <MatchCard
              key={m.user.id}
              matchUser={m.user}
              score={m.score}
              isFollowing={(user.following || []).includes(m.user.id)}
              onFollow={() => handleFollow(m.user)}
            />
          ))}
        </div>
      )}

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
