"use client";

import { useState } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { UserPreferences } from "@/types";

const TOTAL_STEPS = 4;

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${selected
        ? "bg-teal-600 border-teal-600 text-white shadow-sm"
        : "border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700"}`}>
      {label}
    </button>
  );
}

function SingleSelect({ options, value, onChange }: { options: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([val, label]) => (
        <ToggleChip key={val} label={label} selected={value === val} onClick={() => onChange(value === val ? "" : val)} />
      ))}
    </div>
  );
}

function MultiSelect({ options, values, onChange }: { options: [string, string][]; values: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) => onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([val, label]) => (
        <ToggleChip key={val} label={label} selected={values.includes(val)} onClick={() => toggle(val)} />
      ))}
    </div>
  );
}

const emptyPrefs = (): Partial<UserPreferences> => ({
  accommodation: "", pace: "", wakeTime: "", tripStyle: "", budgetRange: "",
  travelTypes: [], skillTags: [],
  ageGroup: "", languages: [],
  diet: "", cuisines: [], movieGenres: [], music: [], dealbreakers: [],
  instagram: "",
});

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<Partial<UserPreferences>>(
    user?.preferences ? { ...emptyPrefs(), ...user.preferences } : emptyPrefs()
  );

  const set = <K extends keyof UserPreferences>(k: K, v: UserPreferences[K]) =>
    setPrefs(p => ({ ...p, [k]: v }));

  const save = () => {
    if (!user) return;
    updateUser({ preferences: { ...user.preferences, ...prefs } as UserPreferences, onboardingDone: true });
    showToast("Your travel profile is set! 🎉 Find your tribe →");
    onClose();
  };

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 pt-6 pb-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</p>
              <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                {step === 1 && "Your Travel Style"}
                {step === 2 && "What You Love"}
                {step === 3 && "Food & Entertainment"}
                {step === 4 && "Skill Tags & Dealbreakers"}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* ── STEP 1: Travel Style ── */}
          {step === 1 && (
            <>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Where do you stay?</p>
                <SingleSelect value={prefs.accommodation || ""} onChange={v => set("accommodation", v as any)}
                  options={[["budget-hostel","🛏️ Budget Hostel"],["mid-range-hotel","🏨 Mid-range Hotel"],["5-star","⭐ 5-Star"],["camping","⛺ Camping"],["homestay","🏡 Homestay"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Trip pace?</p>
                <SingleSelect value={prefs.pace || ""} onChange={v => set("pace", v as any)}
                  options={[["slow-relaxed","🐢 Slow & Relaxed"],["moderate","🚶 Moderate"],["packed-itinerary","⚡ Packed Itinerary"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Morning style?</p>
                <SingleSelect value={prefs.wakeTime || ""} onChange={v => set("wakeTime", v as any)}
                  options={[["early-bird","🌅 Early Bird (5–7am)"],["night-owl","🦉 Night Owl"],["flexible","😴 Flexible"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Preferred group size?</p>
                <SingleSelect value={prefs.tripStyle || ""} onChange={v => set("tripStyle", v as any)}
                  options={[["solo-explorer","🧍 Solo Explorer"],["small-group","👥 Small Group (2–6)"],["large-group","🎉 Large Group (7+)"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Budget per trip?</p>
                <SingleSelect value={prefs.budgetRange || ""} onChange={v => set("budgetRange", v as any)}
                  options={[["under-5k","💸 Under ₹5K"],["5k-15k","💰 ₹5K–₹15K"],["15k-40k","💳 ₹15K–₹40K"],["40k-plus","🏆 ₹40K+"]]} />
              </div>
            </>
          )}

          {/* ── STEP 2: Travel Interests ── */}
          {step === 2 && (
            <>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">What kind of trips?</p>
                <MultiSelect values={prefs.travelTypes || []} onChange={v => set("travelTypes", v)}
                  options={[["mountains","⛰️ Mountains"],["beaches","🏖️ Beaches"],["heritage","🏛️ Heritage"],["wildlife","🦁 Wildlife"],["road-trips","🚗 Road Trips"],["backpacking","🎒 Backpacking"],["adventure","🪂 Adventure"],["spiritual","🙏 Spiritual"],["photography","📸 Photography"],["food-tours","🍜 Food Tours"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Your age group?</p>
                <SingleSelect value={prefs.ageGroup || ""} onChange={v => set("ageGroup", v as any)}
                  options={[["18-24","18–24"],["25-30","25–30"],["31-40","31–40"],["41-50","41–50"],["50+","50+"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Languages you speak?</p>
                <MultiSelect values={prefs.languages || []} onChange={v => set("languages", v)}
                  options={[["hindi","हिंदी"],["english","English"],["tamil","தமிழ்"],["telugu","తెలుగు"],["kannada","ಕನ್ನಡ"],["bengali","বাংলা"],["marathi","मराठी"],["gujarati","ગુજરાતી"],["punjabi","ਪੰਜਾਬੀ"],["malayalam","മലയാളം"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">Instagram handle <span className="text-gray-400 font-normal">(optional — helps others verify you're real)</span></p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input type="text" placeholder="yourhandle" value={prefs.instagram || ""} onChange={e => set("instagram", e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
                </div>
              </div>
            </>
          )}

          {/* ── STEP 3: Food & Entertainment ── */}
          {step === 3 && (
            <>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Diet preference?</p>
                <SingleSelect value={prefs.diet || ""} onChange={v => set("diet", v as any)}
                  options={[["veg","🥗 Vegetarian"],["non-veg","🍗 Non-Vegetarian"],["vegan","🌱 Vegan"],["jain","🙏 Jain"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Favourite cuisines?</p>
                <MultiSelect values={prefs.cuisines || []} onChange={v => set("cuisines", v)}
                  options={[["indian","🇮🇳 Indian"],["chinese","🥡 Chinese"],["italian","🍕 Italian"],["iranian","🫕 Iranian"],["continental","🍽️ Continental"],["street-food","🌮 Street Food"],["seafood","🦞 Seafood"],["japanese","🍣 Japanese"],["thai","🍲 Thai"],["mexican","🌯 Mexican"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Movie genres you enjoy?</p>
                <MultiSelect values={prefs.movieGenres || []} onChange={v => set("movieGenres", v)}
                  options={[["action","💥 Action"],["romance","❤️ Romance"],["horror","👻 Horror"],["thriller","🔪 Thriller"],["suspense","🕵️ Suspense"],["comedy","😂 Comedy"],["sci-fi","🚀 Sci-Fi"],["documentary","🎥 Documentary"],["hindi","🎬 Hindi Films"],["english","🎞️ English Films"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Music taste?</p>
                <MultiSelect values={prefs.music || []} onChange={v => set("music", v)}
                  options={[["bollywood","🎵 Bollywood"],["rock","🎸 Rock"],["classical","🎻 Classical"],["hip-hop","🎤 Hip-Hop"],["indie","🎶 Indie"],["electronic","🎛️ Electronic"],["jazz","🎷 Jazz"],["folk","🪕 Folk"]]} />
              </div>
            </>
          )}

          {/* ── STEP 4: Skill Tags & Dealbreakers ── */}
          {step === 4 && (
            <>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Your travel skill tags</p>
                <p className="text-xs text-gray-400 mb-2">These help trip hosts balance groups (e.g. a bike trip host can see if you're a Pro Rider vs Beginner)</p>
                <MultiSelect values={prefs.skillTags || []} onChange={v => set("skillTags", v)}
                  options={[["pro-rider","🏍️ Pro Rider"],["beginner-rider","🛵 Beginner Rider"],["mechanic","🔧 Mechanic"],["experienced-trekker","🥾 Experienced Trekker"],["beginner-trekker","🏃 Beginner Trekker"],["photographer","📸 Photographer"],["diver","🤿 Diver"],["swimmer","🏊 Swimmer"],["first-aid","🏥 First Aid Trained"],["navigator","🗺️ Navigator"],["driver-4x4","🚙 4x4 Driver"]]} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Dealbreakers on a trip</p>
                <p className="text-xs text-gray-400 mb-2">We'll try to match you with groups that respect these</p>
                <MultiSelect values={prefs.dealbreakers || []} onChange={v => set("dealbreakers", v)}
                  options={[["smoking","🚬 Smoking"],["drinking","🍺 Drinking"],["late-nights","🌙 Late Nights"],["pets","🐾 Pets on Trip"],["kids-on-trip","👶 Kids on Trip"],["strict-veg","🥗 Non-Veg Meals"],["loud-music","🔊 Loud Music"]]} />
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-50 border border-teal-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <p className="font-bold text-gray-900 text-sm">Your Travel DNA summary</p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {prefs.accommodation && <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">{prefs.accommodation.replace("-", " ")}</span>}
                  {prefs.pace && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{prefs.pace.replace("-", " ")}</span>}
                  {prefs.budgetRange && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{prefs.budgetRange.replace("-", " ")}</span>}
                  {(prefs.travelTypes || []).map(t => <span key={t} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{t}</span>)}
                  {(prefs.skillTags || []).map(t => <span key={t} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{t.replace("-", " ")}</span>)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer nav */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Skip for now</button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={save}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Save My Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
