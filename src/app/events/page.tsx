"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";

const EVENT_TYPES = ["All Events", "Camping", "Trekking", "Travel", "Food Walk", "Sports & Games", "Social Meetup", "Content Creation", "Bike Ride", "Cycling", "Yoga & Wellness", "Music & Culture", "Photography", "Backpacking", "Road Trip"];

export default function EventsPage() {
  const { events, registerEvent, unregisterEvent } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeType, setActiveType] = useState("All Events");
  const [showAuth, setShowAuth] = useState(false);

  const filtered = events.filter(e => activeType === "All Events" || e.type === activeType);

  const handleRegister = (eventId: string) => {
    if (!user) { setShowAuth(true); return; }
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    if (event.attendees.includes(user.id)) {
      unregisterEvent(eventId, user.id);
      showToast("Registration cancelled.", "info");
    } else if (event.attendees.length >= event.maxAttendees) {
      showToast("This event is full!", "error");
    } else {
      registerEvent(eventId, user.id);
      showToast(`Registered for "${event.title}"! 🎉`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events & Meetups</h1>
          <p className="text-gray-500 mt-1">Camping, food walks, sports, travel & more — join or host your own</p>
        </div>
        <Link href="/trips/new" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors text-center">
          + Host an Activity
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {EVENT_TYPES.map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeType === t ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-lg font-medium">No events found</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(event => {
          const registered = user ? event.attendees.includes(user.id) : false;
          const full = event.attendees.length >= event.maxAttendees;
          return (
            <div key={event.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative h-44 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-7xl">
                {event.image}
                {event.badge && (
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${event.badge === "Featured" ? "bg-teal-600 text-white" : event.badge === "New" ? "bg-green-500 text-white" : "bg-purple-500 text-white"}`}>
                    {event.badge}
                  </span>
                )}
                {registered && (
                  <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">✓ Registered</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full">{event.type}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${event.price === "Free" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{event.price}</span>
                </div>
                <h3 className="font-bold text-gray-900 leading-tight">{event.title}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-gray-500 text-sm flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-teal-500" /> {event.date}</p>
                  <p className="text-gray-500 text-sm flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-500" /> {event.location}</p>
                  <p className="text-gray-500 text-sm flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-teal-500" /> Hosted by {event.host}</p>
                </div>
                {event.description && <p className="text-gray-400 text-xs mt-2 line-clamp-2">{event.description}</p>}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{event.attendees.length} going</span>
                    <span className={full ? "text-red-500 font-semibold" : "text-teal-600 font-semibold"}>
                      {full ? "Full" : `${event.maxAttendees - event.attendees.length} spots left`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${(event.attendees.length / event.maxAttendees) * 100}%` }} />
                  </div>
                </div>
                <button onClick={() => handleRegister(event.id)} disabled={full && !registered}
                  className={`mt-4 w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl text-sm transition-colors ${registered ? "bg-green-50 border border-green-300 text-green-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300" : full ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 text-white"}`}>
                  <Ticket className="w-4 h-4" />
                  {registered ? "✓ Registered — Click to Cancel" : full ? "Event Full" : "Register Now"}
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
