"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Users, Star, ArrowLeft, CheckCircle, Shield, Package } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { trips, joinTrip, leaveTrip } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);

  const trip = trips.find(t => t.id === id);
  if (!trip) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Trip not found</h2>
      <Link href="/trips" className="text-teal-600 underline">Back to trips</Link>
    </div>
  );

  const joined = user ? trip.joinedUsers.includes(user.id) : false;
  const full = trip.joinedUsers.length >= trip.totalSpots;
  const isHost = user?.id === trip.hostId;

  const handleJoin = () => {
    if (!user) { setShowAuth(true); return; }
    if (joined) { leaveTrip(trip.id, user.id); showToast("You've left the trip.", "info"); }
    else if (full) { showToast("Sorry, this trip is full!", "error"); }
    else { joinTrip(trip.id, user.id); showToast(`You've joined "${trip.title}"! 🎉`); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-teal-600 text-sm font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Trips
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center text-9xl">
            {trip.image}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full">{trip.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${trip.difficulty === "Easy" ? "bg-green-100 text-green-700" : trip.difficulty === "Moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{trip.difficulty}</span>
              {trip.rating > 0 && <span className="text-xs text-gray-500 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {trip.rating}</span>}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {trip.from || trip.fromState ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {trip.from || trip.fromState}
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  <MapPin className="w-4 h-4 text-teal-500" />
                  {trip.destination}, {trip.state}
                </span>
              ) : (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-teal-500" /> {trip.destination}, {trip.state}</span>
              )}
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-teal-500" /> {trip.startDate} → {trip.endDate}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-teal-500" /> Hosted by {trip.hostName}</span>
            </div>
          </div>

          {trip.description && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-3">About This Trip</h2>
              <p className="text-gray-600 leading-relaxed">{trip.description}</p>
            </div>
          )}

          {trip.whatToBring && (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" /> What to Bring
              </h2>
              <p className="text-gray-600">{trip.whatToBring}</p>
            </div>
          )}

          <div className="bg-gray-900 text-white rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-teal-500" /> Safety & Trust</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["All joiners are ID verified", "Group chat created on join", "Live location sharing during trip", "SOS button available in-app", "Host rated by past travelers", "Expense splitting included"].map(s => (
                <div key={s} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-24">
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{trip.budget}</div>
            <p className="text-gray-400 text-sm mb-5">per person</p>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Spots Available</span><span className="font-semibold text-gray-900">{trip.totalSpots - trip.joinedUsers.length}/{trip.totalSpots}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Difficulty</span><span className="font-semibold text-gray-900">{trip.difficulty}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold text-gray-900">{trip.type}</span></div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{trip.joinedUsers.length} joined</span>
                <span>{full ? "FULL" : `${trip.totalSpots - trip.joinedUsers.length} left`}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${(trip.joinedUsers.length / trip.totalSpots) * 100}%` }} />
              </div>
            </div>

            {!isHost && (
              <button onClick={handleJoin} disabled={full && !joined}
                className={`w-full font-bold py-3 rounded-xl transition-colors text-sm ${joined ? "bg-green-50 border border-green-300 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300" : full ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 text-white"}`}>
                {joined ? "✓ Joined — Click to Leave" : full ? "Trip is Full" : "Join This Trip →"}
              </button>
            )}
            {isHost && (
              <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-xl py-3">
                You are hosting this trip
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">Free to join · No payment required to reserve a spot</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Group Members ({trip.joinedUsers.length})</h3>
            <div className="flex flex-wrap gap-2">
              {trip.joinedUsers.map((_, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-lg">{["🧕","👨","👩","🧔","👱‍♀️"][i % 5]}</div>
              ))}
              {trip.joinedUsers.length < trip.totalSpots && (
                <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">+</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="signup" />}
    </div>
  );
}
