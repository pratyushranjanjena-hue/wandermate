"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, ArrowRight, ArrowRightLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { Trip } from "@/types";
import AuthModal from "@/components/AuthModal";

const TRIP_TYPES = ["Bike Ride", "Trek", "Road Trip", "Camping", "Backpacking", "Food Tour", "Heritage Walk", "Photography Tour", "Other"];
const IMAGES = ["🏔️", "🌿", "❄️", "🏖️", "🏛️", "🌄", "🌅", "🏍️", "🎒", "📸", "🌊", "🏜️", "⛺"];

const INDIA_STATES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Tirupati", "Rajahmundry", "Kadapa", "Anantapur"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Bomdila", "Ziro", "Along", "Tezu"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Sivasagar"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Calangute", "Anjuna", "Canacona"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Hisar", "Rohtak", "Karnal", "Sonipat", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi", "Baddi", "Nahan", "Palampur", "Chamba", "Kullu"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Shivamogga", "Coorg", "Hampi", "Udupi"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", "Palakkad", "Malappuram", "Kannur", "Kottayam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Lonavala", "Mahabaleshwar"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati", "Ukhrul"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara", "Mairang"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Baripada", "Balasore", "Bhadrak", "Jharsuguda", "Khurda", "Konark", "Chilika"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Hoshiarpur", "Pathankot"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Jaisalmer", "Pushkar", "Mount Abu"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Ravangla", "Pelling", "Lachung", "Lachen"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Ooty", "Kodaikanal"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Noida", "Ghaziabad", "Aligarh", "Mathura", "Ayodhya"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Mussoorie", "Nainital", "Auli", "Kedarnath"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Durgapur", "Siliguri", "Bardhaman", "Darjeeling", "Jalpaiguri"],
  "Andaman & Nicobar": ["Port Blair", "Havelock Island", "Neil Island", "Diglipur"],
  "Chandigarh": ["Chandigarh"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Janakpuri", "Saket", "Lajpat Nagar", "Connaught Place"],
  "J&K": ["Srinagar", "Jammu", "Leh", "Kargil", "Anantnag", "Baramulla", "Kathua", "Gulmarg", "Pahalgam"],
  "Ladakh": ["Leh", "Kargil", "Nubra", "Pangong", "Zanskar"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

const STATE_NAMES = Object.keys(INDIA_STATES).sort();

export default function NewTripPage() {
  const [step, setStep] = useState(1);
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();
  const { addTrip } = useData();
  const { showToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", type: "Bike Ride",
    fromState: "", from: "",
    toState: "", destination: "",
    startDate: "", endDate: "",
    totalSpots: "8", budget: "", difficulty: "Moderate" as Trip["difficulty"],
    description: "", whatToBring: "", image: "🏔️",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const fromCities = useMemo(() => form.fromState ? (INDIA_STATES[form.fromState] ?? []) : [], [form.fromState]);
  const toCities   = useMemo(() => form.toState   ? (INDIA_STATES[form.toState]   ?? []) : [], [form.toState]);

  const handlePublish = () => {
    if (!user) { setShowAuth(true); return; }
    const trip: Trip = {
      id: `trip_${Date.now()}`,
      title: form.title,
      from: form.from || form.fromState || undefined,
      fromState: form.fromState || undefined,
      destination: form.destination || form.toState,
      state: form.toState,
      startDate: form.startDate,
      endDate: form.endDate,
      type: form.type,
      image: form.image,
      hostId: user.id,
      hostName: user.name,
      rating: 0,
      budget: `₹${form.budget}`,
      difficulty: form.difficulty,
      totalSpots: parseInt(form.totalSpots) || 8,
      joinedUsers: [user.id],
      description: form.description,
      whatToBring: form.whatToBring,
      createdAt: new Date().toISOString().split("T")[0],
    };
    addTrip(trip);
    showToast("Trip published! Travelers can now join 🎉");
    router.push("/trips");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Host a Trip</h1>
        <p className="text-gray-500 mt-1">Fill in the details and find your travel tribe</p>
      </div>

      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-400"}`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-12 ${step > s ? "bg-teal-600" : "bg-gray-200"}`} />}
          </div>
        ))}
        <span className="ml-3 text-sm text-gray-500">{step === 1 ? "Basic Info" : step === 2 ? "Trip Details" : "Review & Publish"}</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
        {step === 1 && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Title *</label>
              <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="e.g. Royal Enfield Ladakh Ride 2026"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Type</label>
              <div className="flex flex-wrap gap-2">
                {TRIP_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => set("type", t)}
                    className={`px-3 py-1.5 border rounded-full text-sm transition-colors ${form.type === t ? "border-teal-600 bg-teal-50 text-teal-700 font-semibold" : "border-gray-200 hover:border-teal-300"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* From → To route */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-teal-600" /> Route
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">

                {/* FROM */}
                <div>
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Starting Point (From)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">State</label>
                      <select value={form.fromState} onChange={e => { set("fromState", e.target.value); set("from", ""); }}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                        <option value="">Select State</option>
                        {STATE_NAMES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">City</label>
                      <select value={form.from} onChange={e => set("from", e.target.value)}
                        disabled={!form.fromState}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-40 disabled:cursor-not-allowed">
                        <option value="">Select City</option>
                        {fromCities.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Arrow divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="flex items-center gap-1 text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 text-xs font-semibold">
                    <ArrowRight className="w-3 h-3" /> TO
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* TO */}
                <div>
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Destination (To)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">State *</label>
                      <select value={form.toState} onChange={e => { set("toState", e.target.value); set("destination", ""); }}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                        <option value="">Select State</option>
                        {STATE_NAMES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">City</label>
                      <select value={form.destination} onChange={e => set("destination", e.target.value)}
                        disabled={!form.toState}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-40 disabled:cursor-not-allowed">
                        <option value="">Select City</option>
                        {toCities.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><Calendar className="inline w-4 h-4 mr-1" />Start Date</label>
                <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
            </div>

            {/* Emoji */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pick a Cover Emoji</label>
              <div className="flex flex-wrap gap-2">
                {IMAGES.map(img => (
                  <button key={img} type="button" onClick={() => set("image", img)}
                    className={`text-2xl w-10 h-10 rounded-xl border-2 transition-colors ${form.image === img ? "border-teal-600 bg-teal-50" : "border-gray-100 hover:border-teal-200"}`}>
                    {img}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><Users className="inline w-4 h-4 mr-1" />Max Group Size</label>
                <input type="number" value={form.totalSpots} onChange={e => set("totalSpots", e.target.value)} min={2} max={50}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Budget per Person (₹)</label>
                <input type="number" value={form.budget} onChange={e => set("budget", e.target.value)} placeholder="e.g. 12000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {(["Easy", "Moderate", "Hard"] as Trip["difficulty"][]).map(d => (
                  <button key={d} type="button" onClick={() => set("difficulty", d)}
                    className={`py-3 border rounded-xl text-sm font-medium transition-colors ${form.difficulty === d ? "border-teal-600 bg-teal-50 text-teal-700" : "border-gray-200 hover:border-teal-300"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Description *</label>
              <textarea rows={5} value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="Tell travelers what this trip is about, what to expect, the route..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">What to Bring</label>
              <input type="text" value={form.whatToBring} onChange={e => set("whatToBring", e.target.value)}
                placeholder="e.g. Sleeping bag, trekking shoes, rain jacket"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="h-32 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center text-7xl">
              {form.image}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{form.title || "Untitled Trip"}</h2>
              <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                {form.from || form.fromState ? (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{form.from || form.fromState}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </>
                ) : null}
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{form.destination || form.toState || "Destination"}</span>
                {form.toState && <span className="text-gray-400">({form.toState})</span>}
              </div>
              <p className="text-gray-500 text-sm mt-1">{form.type} · {form.startDate} → {form.endDate}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-xl p-4">
              <div><p className="font-bold text-gray-900">{form.totalSpots}</p><p className="text-xs text-gray-500">Max travelers</p></div>
              <div><p className="font-bold text-gray-900">₹{form.budget || "TBD"}</p><p className="text-xs text-gray-500">Per person</p></div>
              <div><p className="font-bold text-gray-900">{form.difficulty}</p><p className="text-xs text-gray-500">Difficulty</p></div>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-gray-700 space-y-2">
              <p>✅ ID Verification required for all joiners</p>
              <p>✅ Group chat created automatically</p>
              <p>✅ Expense splitting enabled</p>
              <p>✅ SOS & live location active during trip</p>
            </div>
            <button onClick={handlePublish}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">
              Publish Trip 🚀
            </button>
          </div>
        )}

        {step < 3 && (
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
            ) : <div />}
            <button onClick={() => {
              if (step === 1 && !form.title.trim()) { showToast("Please enter a trip title", "error"); return; }
              if (step === 1 && !form.toState) { showToast("Please select a destination state", "error"); return; }
              setStep(step + 1);
            }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="signup" />}
    </div>
  );
}
