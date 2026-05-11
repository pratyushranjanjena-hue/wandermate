"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, ArrowRight, Upload, X, Loader2, Ticket, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { Event } from "@/types";
import AuthModal from "@/components/AuthModal";
import { compressPhoto, saveMedia } from "@/lib/mediaStorage";

const EVENT_TYPES = ["Camping", "Trekking", "Travel", "Food Walk", "Sports & Games", "Social Meetup", "Content Creation", "Bike Ride", "Cycling", "Yoga & Wellness", "Music & Culture", "Photography", "Backpacking", "Road Trip", "Heritage Walk", "Other"];

export default function NewEventPage() {
  const [step, setStep] = useState(1);
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login to create an event</h2>
        <p className="text-gray-500 text-sm mb-6">You need to be signed in to publish events.</p>
        <button onClick={() => setShowAuth(true)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors">
          Sign In / Join Free
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="signup" />}
      </div>
    </div>
  );
  const { addEvent } = useData();
  const { showToast } = useToast();
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    type: "Social Meetup",
    date: "",
    location: "",
    maxAttendees: "20",
    price: "",
    description: "",
  });

  const [photoPreview, setPhotoPreview] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const { dataUrl, blob } = await compressPhoto(file);
      const key = `event_photo_${Date.now()}`;
      await saveMedia(key, blob);
      setPhotoDataUrl(dataUrl);
      setPhotoPreview(dataUrl);
    } catch {
      showToast("Could not process photo. Try another file.", "error");
    }
    setPhotoUploading(false);
    e.target.value = "";
  };

  const clearPhoto = () => { setPhotoPreview(""); setPhotoDataUrl(""); };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handlePublish = () => {
    if (!user) { setShowAuth(true); return; }
    const event: Event = {
      id: `event_${Date.now()}`,
      title: form.title,
      host: user.name,
      hostId: user.id,
      date: form.date,
      location: form.location,
      maxAttendees: parseInt(form.maxAttendees) || 20,
      attendees: [user.id],
      type: form.type,
      price: form.price ? `₹${form.price}` : "Free",
      image: "",
      photoUrl: photoDataUrl || undefined,
      badge: null,
      description: form.description,
    };
    addEvent(event);
    showToast("Event published! People can now register 🎉");
    router.push("/events");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create an Event</h1>
        <p className="text-gray-500 mt-1">Food walks, meetups, yoga, cycling — casual hangouts for real people</p>
      </div>

      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-400"}`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-12 ${step > s ? "bg-purple-600" : "bg-gray-200"}`} />}
          </div>
        ))}
        <span className="ml-3 text-sm text-gray-500">{step === 1 ? "Event Info" : step === 2 ? "Details" : "Review & Publish"}</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
        {step === 1 && (
          <div className="space-y-6">
            {/* Cover Photo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cover Photo <span className="text-gray-400 font-normal">(optional — makes your event stand out)</span>
              </label>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="cover" className="w-full h-44 object-cover" />
                  <button type="button" onClick={clearPhoto}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    Photo uploaded ✓
                  </div>
                </div>
              ) : photoUploading ? (
                <div className="border-2 border-dashed border-purple-300 rounded-2xl py-8 flex flex-col items-center gap-2 text-purple-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Compressing photo…</span>
                </div>
              ) : (
                <button type="button" onClick={() => photoRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 hover:border-purple-400 rounded-2xl py-8 text-gray-400 hover:text-purple-600 transition-colors">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-semibold">Click to upload a cover photo</span>
                  <span className="text-xs">JPG, PNG, WebP · Auto compressed</span>
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
              <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="e.g. Sunday Food Walk in Bandra, Yoga at Cubbon Park..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => set("type", t)}
                    className={`px-3 py-1.5 border rounded-full text-sm transition-colors ${form.type === t ? "border-purple-600 bg-purple-50 text-purple-700 font-semibold" : "border-gray-200 hover:border-purple-300"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><Calendar className="inline w-4 h-4 mr-1" />Date *</label>
                <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><MapPin className="inline w-4 h-4 mr-1" />Location *</label>
                <input type="text" value={form.location} onChange={e => set("location", e.target.value)}
                  placeholder="e.g. Indiranagar, Bengaluru"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><Users className="inline w-4 h-4 mr-1" />Max Attendees</label>
                <input type="number" value={form.maxAttendees} onChange={e => set("maxAttendees", e.target.value)} min={2} max={200}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><Ticket className="inline w-4 h-4 mr-1" />Price per Person (₹)</label>
                <input type="number" value={form.price} onChange={e => set("price", e.target.value)}
                  placeholder="Leave empty = Free"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                {!form.price && <p className="text-xs text-green-600 mt-1">Empty = Free event 🎁</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea rows={6} value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="What will happen at this event? What should people expect? Any requirements?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              {photoPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={photoPreview} alt="cover" className="w-full h-full object-cover" />
                : <span className="text-6xl">🎪</span>
              }
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{form.title || "Untitled Event"}</h2>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-500" /> {form.location || "No location"} · {form.date || "No date"}
              </p>
              <p className="text-gray-500 text-sm mt-0.5">{form.type}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-xl p-4">
              <div><p className="font-bold text-gray-900">{form.maxAttendees}</p><p className="text-xs text-gray-500">Max attendees</p></div>
              <div><p className="font-bold text-gray-900">{form.price ? `₹${form.price}` : "Free"}</p><p className="text-xs text-gray-500">Per person</p></div>
              <div><p className="font-bold text-gray-900">1</p><p className="text-xs text-gray-500">Going so far</p></div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-gray-700 space-y-2">
              <p>✅ Event published instantly — no approval needed</p>
              <p>✅ People can register and get your contact</p>
              <p>✅ You'll see the full attendees list</p>
            </div>
            <button onClick={handlePublish}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors">
              Publish Event 🚀
            </button>
          </div>
        )}

        {step < 3 && (
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
            ) : <div />}
            <button onClick={() => {
              if (step === 1 && !form.title.trim()) { showToast("Please enter an event title", "error"); return; }
              if (step === 1 && !form.date) { showToast("Please select a date", "error"); return; }
              if (step === 1 && !form.location.trim()) { showToast("Please enter a location", "error"); return; }
              setStep(step + 1);
            }} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="signup" />}
    </div>
  );
}
