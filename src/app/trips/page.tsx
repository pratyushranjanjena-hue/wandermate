"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users, Star, Search, SlidersHorizontal, X, ArrowRight, Flame, TrendingUp } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

const TYPES = [
  { label: "All", emoji: "✨" },
  { label: "Camping", emoji: "⛺" },
  { label: "Trekking", emoji: "🥾" },
  { label: "Travel", emoji: "✈️" },
  { label: "Food Exploring", emoji: "🍜" },
  { label: "Sports & Games", emoji: "🏐" },
  { label: "Social Activity", emoji: "🤝" },
  { label: "Content Creation", emoji: "🎬" },
  { label: "Bike Ride", emoji: "🏍️" },
  { label: "Road Trip", emoji: "🚗" },
  { label: "Backpacking", emoji: "🎒" },
  { label: "Heritage", emoji: "🏛️" },
  { label: "Nature", emoji: "🌿" },
  { label: "Cycling", emoji: "🚴" },
  { label: "Yoga & Wellness", emoji: "🧘" },
];

const TYPE_PHOTOS: Record<string, string> = {
  "Camping": "photo-1504280390367-361c6d9f38f4",
  "Trekking": "photo-1551632811-561732d1e306",
  "Travel": "photo-1476514525535-07fb3b4ae5f1",
  "Food Exploring": "photo-1567337710282-00832b415979",
  "Sports & Games": "photo-1592656094267-764a45160876",
  "Social Activity": "photo-1511632765486-a01980e01a18",
  "Content Creation": "photo-1492691527719-9d1e07e534b4",
  "Bike Ride": "photo-1558618666-fcd25c85cd64",
  "Road Trip": "photo-1469854523086-cc02fe5d8800",
  "Backpacking": "photo-1501554728187-ce583db33af7",
  "Heritage": "photo-1524230572899-a752b3835840",
  "Nature": "photo-1448375240586-882707db888b",
  "Cycling": "photo-1571068316344-75bc76f77890",
  "Yoga & Wellness": "photo-1506126613408-eca07ce68773",
};

const FALLBACK_PHOTO = "photo-1504280390367-361c6d9f38f4";

const MAX_BUDGET = 50000;

const INDIA_STATES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Tirupati"],
  "Goa": ["Panaji", "Margao", "Calangute", "Anjuna"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kasol"],
  "J&K": ["Srinagar", "Jammu", "Gulmarg", "Pahalgam"],
  "Karnataka": ["Bengaluru", "Mysuru", "Coorg", "Hampi", "Udupi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Munnar", "Alleppey"],
  "Ladakh": ["Leh", "Kargil", "Nubra", "Pangong"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Pachmarhi"],
  "Maharashtra": ["Mumbai", "Pune", "Nashik", "Lonavala", "Mahabaleshwar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Jaisalmer", "Pushkar"],
  "Tamil Nadu": ["Chennai", "Ooty", "Kodaikanal", "Madurai"],
  "Telangana": ["Hyderabad", "Warangal"],
  "Uttarakhand": ["Dehradun", "Rishikesh", "Haridwar", "Mussoorie", "Nainital", "Auli"],
  "West Bengal": ["Kolkata", "Darjeeling", "Siliguri"],
  "Delhi": ["New Delhi", "Connaught Place"],
  "Punjab": ["Amritsar", "Ludhiana", "Chandigarh"],
};

function parseBudget(b: string) { return parseInt(b.replace(/[₹,]/g, ""), 10) || 0; }
function formatMonth(dateStr: string) {
  const [year, month] = dateStr.split("-");
  return new Date(+year, +month - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function getPhotoUrl(type: string, w = 600, h = 400) {
  const id = TYPE_PHOTOS[type] ?? FALLBACK_PHOTO;
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

export default function TripsPage() {
  const { trips } = useData();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [maxBudget, setMaxBudget] = useState(MAX_BUDGET);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedAge, setSelectedAge] = useState("All");

  const cityOptions = useMemo(() => selectedState === "All" ? [] : INDIA_STATES[selectedState] ?? [], [selectedState]);
  const months = useMemo(() => {
    const all = Array.from(new Set(trips.map(t => { const [y, m] = t.startDate.split("-"); return `${y}-${m}`; }))).sort();
    return all;
  }, [trips]);

  const activeFilterCount = [
    selectedState !== "All", selectedMonth !== "All", maxBudget < MAX_BUDGET,
    availableOnly, selectedGender !== "All", selectedAge !== "All",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedState("All"); setSelectedCity("All"); setSelectedMonth("All");
    setMaxBudget(MAX_BUDGET); setAvailableOnly(false); setSelectedGender("All"); setSelectedAge("All");
  };

  const filtered = trips.filter(t => {
    if (activeType !== "All" && t.type !== activeType) return false;
    if (query) { const q = query.toLowerCase(); if (!t.title.toLowerCase().includes(q) && !t.destination.toLowerCase().includes(q) && !t.state.toLowerCase().includes(q)) return false; }
    if (selectedState !== "All" && t.state !== selectedState) return false;
    if (selectedCity !== "All" && !t.destination.toLowerCase().includes(selectedCity.toLowerCase())) return false;
    if (selectedMonth !== "All") { const [y, m] = t.startDate.split("-"); if (`${y}-${m}` !== selectedMonth) return false; }
    if (maxBudget < MAX_BUDGET && parseBudget(t.budget) > maxBudget) return false;
    if (availableOnly && t.joinedUsers.length >= t.totalSpots) return false;
    if (selectedGender !== "All") { const pref = t.genderPreference ?? "Everyone"; if (pref !== "Everyone" && pref !== selectedGender) return false; }
    if (selectedAge !== "All") { if (t.ageGroups && t.ageGroups.length > 0 && !t.ageGroups.includes(selectedAge)) return false; }
    return true;
  });


  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d3d38 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> {trips.length} Activities Live
              </div>
              <h1 className="text-4xl font-extrabold text-white leading-tight mb-2">
                Find Your Next<br />
                <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Adventure Together</span>
              </h1>
              <p className="text-gray-300 text-base max-w-lg">
                Camping, trekking, food walks, sports, road trips & more — real people, real plans, across India.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{trips.length}</p>
                  <p className="text-xs uppercase tracking-wide">Open activities</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{trips.filter(t => t.joinedUsers.length < t.totalSpots).length}</p>
                  <p className="text-xs uppercase tracking-wide">Spots available</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{new Set(trips.map(t => t.state)).size}</p>
                  <p className="text-xs uppercase tracking-wide">States covered</p>
                </div>
              </div>
              <Link href="/trips/new" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-full text-sm transition-all hover:scale-105 shadow-lg shadow-teal-500/30 whitespace-nowrap self-start sm:self-center">
                + Host an Activity
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search destinations, activity types, states..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white shadow-sm" />
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all shadow-sm ${showFilters || activeFilterCount > 0 ? "bg-teal-600 text-white border-teal-600" : "border-gray-200 text-gray-600 bg-white hover:border-teal-300"}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && <span className="bg-white text-teal-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">State</label>
                <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedCity("All"); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                  <option value="All">All States</option>
                  {Object.keys(INDIA_STATES).sort().map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">City {selectedState === "All" && <span className="text-gray-300 font-normal">(select state first)</span>}</label>
                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} disabled={selectedState === "All"}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-40">
                  <option value="All">All Cities</option>
                  {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Month</label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                  <option value="All">Any Month</option>
                  {months.map(m => <option key={m} value={m}>{formatMonth(m + "-01")}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Who Can Join</label>
                <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                  <option value="All">Everyone</option>
                  <option value="Males Only">Males Only</option>
                  <option value="Females Only">Females Only</option>
                  <option value="Couples">Couples</option>
                  <option value="Mixed Groups">Mixed Groups</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Age Group</label>
                <select value={selectedAge} onChange={e => setSelectedAge(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                  <option value="All">All Ages</option>
                  <option value="18–24">18–24</option>
                  <option value="25–30">25–30</option>
                  <option value="31–40">31–40</option>
                  <option value="41–50">41–50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Availability</label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none h-[42px]">
                  <div onClick={() => setAvailableOnly(v => !v)}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${availableOnly ? "bg-teal-500" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${availableOnly ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Available spots only</span>
                </label>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max Budget per Person</label>
                <span className="text-sm font-bold text-teal-700">{maxBudget >= MAX_BUDGET ? "No limit" : `Up to ₹${maxBudget.toLocaleString()}`}</span>
              </div>
              <input type="range" min={0} max={MAX_BUDGET} step={500} value={maxBudget} onChange={e => setMaxBudget(+e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-teal-600"
                style={{ background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(maxBudget / MAX_BUDGET) * 100}%, #e5e7eb ${(maxBudget / MAX_BUDGET) * 100}%, #e5e7eb 100%)` }} />
              <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                {[0, 10000, 20000, 30000, 40000, 50000].map(v => <span key={v}>{v === 0 ? "₹0" : v === MAX_BUDGET ? "Any" : `₹${v / 1000}K`}</span>)}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex justify-end pt-1">
                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium">
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Type pills */}
        <div className="flex gap-2 flex-wrap mb-5">
          {TYPES.map(t => (
            <button key={t.label} onClick={() => setActiveType(t.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeType === t.label ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600"}`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-500" />
          <span><strong className="text-gray-700">{filtered.length}</strong> {filtered.length === 1 ? "activity" : "activities"} found{(activeFilterCount > 0 || activeType !== "All" || query) ? " — matching your filters" : ""}</span>
        </p>

        {filtered.length === 0 && trips.length === 0 && (
          <div className="text-center py-24 px-4">
            <div className="text-8xl mb-6">🏕️</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">No activities yet — but the trail starts with you!</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
              mayBE is brand new and waiting for its first adventurer. Be the one who kicks things off — host a trek, a road trip, a food walk, anything. Your crew is out there.
            </p>
            <Link href="/trips/new"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-full text-base transition-all hover:scale-105 shadow-lg shadow-teal-200">
              🚀 Host the First Activity
            </Link>
            <p className="text-gray-400 text-xs mt-4">It takes 2 minutes. No approval needed.</p>
          </div>
        )}

        {filtered.length === 0 && trips.length > 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl font-bold text-gray-700">No activities match your filters</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or <Link href="/trips/new" className="text-teal-600 underline font-medium">host your own</Link></p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(trip => {
            const joined = user ? trip.joinedUsers.includes(user.id) : false;
            const pending = user ? (trip.pendingRequests ?? []).some(r => r.userId === user.id && r.status === "pending") : false;
            const full = trip.joinedUsers.length >= trip.totalSpots;
            const fillPct = (trip.joinedUsers.length / trip.totalSpots) * 100;
            const isHot = fillPct >= 70;
            return (
              <div key={trip.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                {/* Photo header */}
                <Link href={`/trips/${trip.id}`} className="block relative h-48 overflow-hidden">
                  {trip.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={trip.photoUrl} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Image src={getPhotoUrl(trip.type)} alt={trip.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="bg-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {TYPES.find(t => t.label === trip.type)?.emoji ?? "✨"} {trip.type}
                    </span>
                    {isHot && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"><Flame className="w-3 h-3" /> Hot</span>}
                  </div>
                  {joined && <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">✓ Joined</span>}
                  {/* Bottom overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-base leading-tight drop-shadow">{trip.title}</h3>
                    <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {trip.destination}, {trip.state}
                    </p>
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-teal-500" /> {trip.startDate}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-teal-500" /> by {trip.hostName}</span>
                    {trip.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {trip.rating}</span>}
                  </div>

                  {/* Gender/Age badges */}
                  {((trip.genderPreference && trip.genderPreference !== "Everyone") || (trip.ageGroups && trip.ageGroups.length > 0)) && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {trip.genderPreference && trip.genderPreference !== "Everyone" && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                          {trip.genderPreference === "Females Only" ? "👩 " : trip.genderPreference === "Males Only" ? "👨 " : trip.genderPreference === "Couples" ? "💑 " : "🤝 "}{trip.genderPreference}
                        </span>
                      )}
                      {trip.ageGroups && trip.ageGroups.length > 0 && (
                        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full font-medium">
                          🎂 {trip.ageGroups.join(", ")}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div><span className="text-lg font-extrabold text-gray-900">{trip.budget}</span><span className="text-gray-400 text-xs"> /person</span></div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${trip.difficulty === "Easy" ? "bg-green-100 text-green-700" : trip.difficulty === "Moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                      {trip.difficulty}
                    </span>
                  </div>

                  {/* Spots bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{trip.joinedUsers.length}/{trip.totalSpots} joined</span>
                      <span className={full ? "text-red-500 font-semibold" : "text-teal-600 font-semibold"}>{full ? "Full" : `${trip.totalSpots - trip.joinedUsers.length} spots left`}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${isHot ? "bg-orange-400" : "bg-teal-500"}`} style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/trips/${trip.id}`} className="flex-1 text-center border border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-600 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                      View Details
                    </Link>
                    <Link href={`/trips/${trip.id}`}
                      className={`flex-1 text-center font-semibold py-2.5 rounded-xl text-sm transition-colors ${joined ? "bg-green-50 border border-green-300 text-green-700" : pending ? "bg-amber-50 border border-amber-200 text-amber-700" : full ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none" : "bg-teal-600 hover:bg-teal-700 text-white"}`}>
                      {joined ? "✓ In Group" : pending ? "⏳ Pending" : full ? "Full" : "Request →"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
