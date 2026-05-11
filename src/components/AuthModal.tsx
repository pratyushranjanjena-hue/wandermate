"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Shield } from "lucide-react";
import MaybeLogo from "./MaybeLogo";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface Props {
  onClose: () => void;
  defaultTab?: "login" | "signup";
  onSignupSuccess?: () => void;
}

export default function AuthModal({ onClose, defaultTab = "login", onSignupSuccess }: Props) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "", email: "", password: "", city: "",
    gender: "", dob: "", phone: "",
  });
  const [error, setError] = useState("");

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (tab === "login") {
      const res = await login(form.email.trim(), form.password);
      if (res.success) { showToast("Welcome back! 🎉"); onClose(); }
      else setError(res.error || "Login failed");
    } else {
      if (!form.name.trim()) { setError("Name is required"); setLoading(false); return; }
      if (!form.city.trim()) { setError("City is required"); setLoading(false); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
      if (!form.gender) { setError("Please select your gender"); setLoading(false); return; }
      const res = await signup(
        form.name.trim(), form.email.trim(), form.password,
        form.city.trim(), form.gender, form.dob, form.phone.trim()
      );
      if (res.success) {
        showToast("Welcome to mayBE! 🌍");
        onClose();
        onSignupSuccess?.();
      } else setError(res.error || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <MaybeLogo size={38} nameSize="lg" />
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          {(["login", "signup"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <input required type="text" placeholder="Your name" value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
            <input required type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>

          {tab === "signup" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your City *</label>
                <input required type="text" placeholder="e.g. Bengaluru" value={form.city} onChange={e => set("city", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["male", "👨 Male"], ["female", "👩 Female"], ["non-binary", "🧑 Non-binary"], ["prefer-not-to-say", "🔒 Prefer not to say"]].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => set("gender", val)}
                      className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${form.gender === val ? "border-teal-600 bg-teal-50 text-teal-700" : "border-gray-200 text-gray-600 hover:border-teal-200"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                  <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)}
                    max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone (optional)</label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
                </div>
              </div>

              {/* Trust indicators */}
              <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <Shield className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <p className="text-xs text-teal-700">
                  Your details help us match you with the right travel group and keep the community safe. We never share your private info.
                  <br /><span className="font-semibold">After signup, complete your travel personality quiz for better matches.</span>
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
            <div className="relative">
              <input required type={showPass ? "text" : "password"} placeholder={tab === "login" ? "Your password" : "Min 6 characters"} value={form.password} onChange={e => set("password", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
            {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account →"}
          </button>

          {tab === "signup" && (
            <p className="text-center text-xs text-gray-400">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(""); }}
            className="text-teal-600 font-semibold hover:underline">
            {tab === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
