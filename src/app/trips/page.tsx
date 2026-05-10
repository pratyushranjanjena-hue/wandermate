"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, Calendar, Users, Star, Search, SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";

const TYPES = ["All", "Bike Ride", "Trek", "Road Trip", "Nature", "Backpacking", "Heritage"];

const MAX_BUDGET = 50000;

// All Indian states with their major cities
const INDIA_STATES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Tirupati", "Rajahmundry", "Kadapa", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Bomdila", "Ziro", "Along", "Tezu"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Sivasagar"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Chirmiri"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Canacona", "Calangute", "Anjuna"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Navsari"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Hisar", "Rohtak", "Karnal", "Sonipat", "Yamunanagar", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi", "Baddi", "Nahan", "Palampur", "Bilaspur", "Chamba"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Shivamogga", "Tumkur", "Bidar", "Coorg", "Hampi", "Hospet", "Udupi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", "Palakkad", "Malappuram", "Kannur", "Kottayam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Nanded", "Lonavala", "Mahabaleshwar"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati", "Ukhrul", "Chandel", "Tamenglong"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara", "Ampati", "Resubelpara", "Mairang"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Mamit", "Lawngtlai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Mon"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Baripada", "Balasore", "Bhadrak", "Jharsuguda", "Khurda", "Konark", "Chilika"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Hoshiarpur", "Batala", "Pathankot"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Jaisalmer", "Pushkar", "Mount Abu"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Ravangla", "Pelling", "Lachung", "Lachen"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Ooty", "Kodaikanal"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Belonia", "Khowai", "Ambassa"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Noida", "Ghaziabad", "Aligarh", "Mathura", "Ayodhya", "Vrindavan"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Mussoorie", "Nainital", "Auli", "Kedarnath"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Durgapur", "Siliguri", "Bardhaman", "Malda", "Darjeeling", "Jalpaiguri", "Cooch Behar"],
  "Andaman & Nicobar": ["Port Blair", "Havelock Island", "Neil Island", "Car Nicobar", "Diglipur"],
  "Chandigarh": ["Chandigarh"],
  "Dadra & Nagar Haveli": ["Silvassa", "Amli", "Khanvel"],
  "Daman & Diu": ["Daman", "Diu"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Janakpuri", "Saket", "Lajpat Nagar", "Connaught Place"],
  "J&K": ["Srinagar", "Jammu", "Leh", "Ladakh", "Kargil", "Anantnag", "Baramulla", "Kathua", "Udhampur", "Gulmarg", "Pahalgam"],
  "Ladakh": ["Leh", "Kargil", "Nubra", "Pangong", "Zanskar"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy", "Andrott"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

function parseBudget(b: string) {
  return parseInt(b.replace(/[₹,]/g, ""), 10) || 0;
}

function formatMonth(dateStr: string) {
  const [year, month] = dateStr.split("-");
  return new Date(+year, +month - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function formatBudget(val: number) {
  if (val >= MAX_BUDGET) return "Any";
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}

export default function TripsPage() {
  const { trips, joinTrip, leaveTrip } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [showAuth, setShowAuth] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedState, setSelectedState] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [maxBudget, setMaxBudget] = useState(MAX_BUDGET);
  const [availableOnly, setAvailableOnly] = useState(false);

  const cityOptions = useMemo(() => {
    if (selectedState === "All") return [];
    return INDIA_STATES[selectedState] ?? [];
  }, [selectedState]);

  const months = useMemo(() => {
    const all = Array.from(new Set(trips.map(t => {
      const [y, m] = t.startDate.split("-");
      return `${y}-${m}`;
    }))).sort();
    return all;
  }, [trips]);

  const activeFilterCount = [
    selectedState !== "All",
    selectedMonth !== "All",
    maxBudget < MAX_BUDGET,
    availableOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedState("All");
    setSelectedCity("All");
    setSelectedMonth("All");
    setMaxBudget(MAX_BUDGET);
    setAvailableOnly(false);
  };

  const filtered = trips.filter(t => {
    if (activeType !== "All" && t.type !== activeType) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.destination.toLowerCase().includes(q) && !t.state.toLowerCase().includes(q)) return false;
    }
    if (selectedState !== "All" && t.state !== selectedState) return false;
    if (selectedCity !== "All" && !t.destination.toLowerCase().includes(selectedCity.toLowerCase())) return false;
    if (selectedMonth !== "All") {
      const [y, m] = t.startDate.split("-");
      if (`${y}-${m}` !== selectedMonth) return false;
    }
    if (maxBudget < MAX_BUDGET && parseBudget(t.budget) > maxBudget) return false;
    if (availableOnly && t.joinedUsers.length >= t.totalSpots) return false;
    return true;
  });

  const handleJoin = (tripId: string) => {
    if (!user) { setShowAuth(true); return; }
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    if (trip.joinedUsers.includes(user.id)) {
      leaveTrip(tripId, user.id);
      showToast("You've left the trip.", "info");
    } else if (trip.joinedUsers.length >= trip.totalSpots) {
      showToast("Sorry, this trip is full!", "error");
    } else {
      joinTrip(tripId, user.id);
      showToast(`You've joined "${trip.title}"! 🎉`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Open Trips</h1>
        <p className="text-gray-500 mt-1">Join a trip that's already planned — just show up and go</p>
      </div>

      {/* Search + buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search destinations, trip types, states..."
            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${showFilters || activeFilterCount > 0 ? "bg-teal-600 text-white border-teal-600" : "border-gray-200 text-gray-600 hover:border-teal-300"}`}>
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white text-teal-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
        <Link href="/trips/new" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors text-center">
          + Host a Trip
        </Link>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">State</label>
              <select
                value={selectedState}
                onChange={e => { setSelectedState(e.target.value); setSelectedCity("All"); }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                <option value="All">All States</option>
                {Object.keys(INDIA_STATES).sort().map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* City — only active when a state is picked */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                City
                {selectedState === "All" && <span className="ml-1 text-gray-300 font-normal">(select state first)</span>}
              </label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                disabled={selectedState === "All"}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-40 disabled:cursor-not-allowed">
                <option value="All">All Cities</option>
                {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Month</label>
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                <option value="All">Any Month</option>
                {months.map(m => (
                  <option key={m} value={m}>{formatMonth(m + "-01")}</option>
                ))}
              </select>
            </div>

            {/* Available only */}
            <div className="flex flex-col justify-end">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Availability</label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none h-[42px]">
                <div
                  onClick={() => setAvailableOnly(v => !v)}
                  className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${availableOnly ? "bg-teal-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${availableOnly ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Available only</span>
              </label>
            </div>
          </div>

          {/* Budget slider — full width row */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max Budget per Person</label>
              <span className="text-sm font-bold text-teal-700">
                {maxBudget >= MAX_BUDGET ? "No limit" : `Up to ₹${maxBudget.toLocaleString()}`}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={MAX_BUDGET}
                step={500}
                value={maxBudget}
                onChange={e => setMaxBudget(+e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-teal-600"
                style={{
                  background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(maxBudget / MAX_BUDGET) * 100}%, #e5e7eb ${(maxBudget / MAX_BUDGET) * 100}%, #e5e7eb 100%)`
                }}
              />
              {/* Tick labels */}
              <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-0.5">
                {[0, 10000, 20000, 30000, 40000, 50000].map(v => (
                  <span key={v}>{v === 0 ? "₹0" : v === MAX_BUDGET ? "Any" : `₹${v / 1000}K`}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <div className="flex justify-end pt-1">
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium">
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Type pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TYPES.map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeType === t ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-400 mb-5">
        {filtered.length} trip{filtered.length !== 1 ? "s" : ""} found
        {(activeFilterCount > 0 || activeType !== "All" || query) ? " — matching your filters" : ""}
      </p>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium">No trips found</p>
          <p className="text-sm mt-1">Try adjusting your filters or <Link href="/trips/new" className="text-teal-600 underline">host your own</Link></p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(trip => {
          const joined = user ? trip.joinedUsers.includes(user.id) : false;
          const full = trip.joinedUsers.length >= trip.totalSpots;
          return (
            <div key={trip.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
              <Link href={`/trips/${trip.id}`}>
                <div className="h-44 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-7xl cursor-pointer hover:scale-105 transition-transform">
                  {trip.image}
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full">{trip.type}</span>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {trip.rating}
                  </span>
                </div>
                <Link href={`/trips/${trip.id}`}>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-teal-700 transition-colors">{trip.title}</h3>
                </Link>
                {trip.from || trip.fromState ? (
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1.5 flex-wrap">
                    <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                    <span>{trip.from || trip.fromState}</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <MapPin className="w-3 h-3 shrink-0 text-teal-500" />
                    <span>{trip.destination}, {trip.state}</span>
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1.5"><MapPin className="w-3 h-3 shrink-0" /> {trip.destination}, {trip.state}</p>
                )}
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1"><Calendar className="w-3 h-3 shrink-0" /> {trip.startDate} → {trip.endDate}</p>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1"><Users className="w-3 h-3 shrink-0" /> Hosted by {trip.hostName}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div><span className="font-bold text-gray-900">{trip.budget}</span><span className="text-gray-400"> /person</span></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${trip.difficulty === "Easy" ? "bg-green-100 text-green-700" : trip.difficulty === "Moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {trip.difficulty}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{trip.joinedUsers.length}/{trip.totalSpots} joined</span>
                    <span className={full ? "text-red-500 font-semibold" : "text-teal-600 font-semibold"}>
                      {full ? "Full" : `${trip.totalSpots - trip.joinedUsers.length} spots left`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${(trip.joinedUsers.length / trip.totalSpots) * 100}%` }} />
                  </div>
                </div>
                <button onClick={() => handleJoin(trip.id)} disabled={full && !joined}
                  className={`mt-4 w-full font-semibold py-2.5 rounded-xl text-sm transition-colors ${joined ? "bg-green-50 border border-green-300 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300" : full ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 text-white"}`}>
                  {joined ? "✓ Joined — Click to Leave" : full ? "Trip Full" : "View & Join Trip"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="signup" />}
    </div>
  );
}
