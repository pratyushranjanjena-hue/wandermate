"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users, Ticket, Flame, Search } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

const EVENT_TYPES = [
  { label: "All Events", emoji: "✨" },
  { label: "Camping", emoji: "⛺" },
  { label: "Trekking", emoji: "🥾" },
  { label: "Travel", emoji: "✈️" },
  { label: "Food Walk", emoji: "🍜" },
  { label: "Sports & Games", emoji: "🏐" },
  { label: "Social Meetup", emoji: "🤝" },
  { label: "Content Creation", emoji: "🎬" },
  { label: "Bike Ride", emoji: "🏍️" },
  { label: "Cycling", emoji: "🚴" },
  { label: "Yoga & Wellness", emoji: "🧘" },
  { label: "Music & Culture", emoji: "🎵" },
  { label: "Photography", emoji: "📸" },
  { label: "Backpacking", emoji: "🎒" },
  { label: "Road Trip", emoji: "🚗" },
];

const TYPE_PHOTOS: Record<string, string> = {
  "Camping": "photo-1504280390367-361c6d9f38f4",
  "Trekking": "photo-1551632811-561732d1e306",
  "Travel": "photo-1476514525535-07fb3b4ae5f1",
  "Food Walk": "photo-1567337710282-00832b415979",
  "Sports & Games": "photo-1612872087720-bb876e2e67d1",
  "Social Meetup": "photo-1511632765486-a01980e01a18",
  "Content Creation": "photo-1492691527719-9d1e07e534b4",
  "Bike Ride": "photo-1558618666-fcd25c85cd64",
  "Cycling": "photo-1571068316344-75bc76f77890",
  "Yoga & Wellness": "photo-1506126613408-eca07ce68773",
  "Music & Culture": "photo-1493225457124-a3eb161ffa5f",
  "Photography": "photo-1452587925148-ce544e77e70d",
  "Backpacking": "photo-1501554728187-ce583db33af7",
  "Road Trip": "photo-1469854523086-cc02fe5d8800",
};

function getPhoto(type: string) {
  const id = TYPE_PHOTOS[type] ?? "photo-1511632765486-a01980e01a18";
  return `https://images.unsplash.com/${id}?w=600&h=400&fit=crop&auto=format&q=80`;
}

export default function EventsPage() {
  const { events } = useData();
  const { user } = useAuth();
  const [activeType, setActiveType] = useState("All Events");
  const [query, setQuery] = useState("");

  const filtered = events.filter(e => {
    const matchType = activeType === "All Events" || e.type === activeType;
    const matchQuery = !query || e.title.toLowerCase().includes(query.toLowerCase()) || e.location.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });


  const thisWeek = filtered.filter(e => e.badge === "Featured" || e.badge === "New").slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> {events.length} Upcoming Events
              </div>
              <h1 className="text-4xl font-extrabold text-white leading-tight mb-2">
                Something&apos;s Always<br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Happening Near You</span>
              </h1>
              <p className="text-gray-300 text-base max-w-lg">
                One-time meetups, weekend camps, food walks, sports — no long-term commitment, just show up.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{events.filter(e => e.price === "Free").length}</p>
                  <p className="text-xs uppercase tracking-wide">Free events</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{events.filter(e => e.attendees.length < e.maxAttendees).length}</p>
                  <p className="text-xs uppercase tracking-wide">Open spots</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{new Set(events.map(e => e.location.split(",")[0].trim())).size}</p>
                  <p className="text-xs uppercase tracking-wide">Cities</p>
                </div>
              </div>
              <Link href="/events/new" className="inline-flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-3 rounded-full text-sm transition-all hover:scale-105 shadow-lg shadow-purple-500/30">
                + Create an Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured strip */}
        {thisWeek.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="font-bold text-gray-800 text-lg">Trending This Week</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {thisWeek.map(event => (
                <div key={event.id} className="relative rounded-2xl overflow-hidden h-36 group cursor-pointer">
                  {event.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.photoUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Image src={getPhoto(event.type)} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm leading-tight">{event.title}</p>
                    <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{event.location}</p>
                  </div>
                  <span className={`absolute top-2.5 right-2.5 text-xs font-bold px-2 py-0.5 rounded-full ${event.badge === "Featured" ? "bg-teal-500 text-white" : "bg-green-500 text-white"}`}>{event.badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search events by name or city..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white shadow-sm" />
        </div>

        {/* Type pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {EVENT_TYPES.map(t => (
            <button key={t.label} onClick={() => setActiveType(t.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeType === t.label ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600"}`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-6"><strong className="text-gray-700">{filtered.length}</strong> events found</p>

        {filtered.length === 0 && events.length === 0 && (
          <div className="text-center py-24 px-4">
            <div className="text-8xl mb-6">🎪</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">No events yet — yours could be the first!</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
              The best gatherings start with one person brave enough to say "let&apos;s do this". A Sunday brunch, a morning cycle, a food walk — whatever gets people moving. Someone has to go first. Why not you?
            </p>
            <Link href="/events/new"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3.5 rounded-full text-base transition-all hover:scale-105 shadow-lg shadow-purple-200">
              🎉 Create the First Event
            </Link>
            <p className="text-gray-400 text-xs mt-4">Free to create. Takes 2 minutes.</p>
          </div>
        )}

        {filtered.length === 0 && events.length > 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📅</p>
            <p className="text-xl font-bold text-gray-700">No events match your search</p>
            <p className="text-gray-400 text-sm mt-2">Try a different category or <Link href="/events/new" className="text-purple-600 underline font-medium">create one yourself</Link></p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(event => {
            const registered = user ? event.attendees.includes(user.id) : false;
            const pending = user ? (event.pendingRequests ?? []).some(r => r.userId === user.id && r.status === "pending") : false;
            const full = event.attendees.length >= event.maxAttendees;
            const fillPct = (event.attendees.length / event.maxAttendees) * 100;
            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                {/* Photo */}
                <Link href={`/events/${event.id}`} className="block relative h-48 overflow-hidden">
                  {event.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.photoUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Image src={getPhoto(event.type)} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {EVENT_TYPES.find(t => t.label === event.type)?.emoji ?? "✨"} {event.type}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${event.price === "Free" ? "bg-green-500 text-white" : "bg-gray-800/80 text-white"}`}>{event.price}</span>
                  </div>
                  {event.badge && !registered && (
                    <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${event.badge === "Featured" ? "bg-teal-500 text-white" : event.badge === "New" ? "bg-green-500 text-white" : "bg-orange-500 text-white"}`}>{event.badge}</span>
                  )}
                  {registered && <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">✓ Attending</span>}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-base leading-tight drop-shadow">{event.title}</h3>
                  </div>
                </Link>

                <div className="p-4">
                  <div className="space-y-1.5 mb-3">
                    <p className="text-gray-500 text-sm flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-500" /> {event.date}</p>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-purple-500" /> {event.location}</p>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-500" /> Hosted by {event.host}</p>
                  </div>
                  {event.description && <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">{event.description}</p>}

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{event.attendees.length} going</span>
                      <span className={full ? "text-red-500 font-semibold" : "text-purple-600 font-semibold"}>{full ? "Full" : `${event.maxAttendees - event.attendees.length} spots left`}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${fillPct >= 70 ? "bg-orange-400" : "bg-purple-500"}`} style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`} className="flex-1 text-center border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600 text-sm font-semibold py-2.5 rounded-xl transition-colors">
                      View Details
                    </Link>
                    <Link href={`/events/${event.id}`}
                      className={`flex-1 text-center flex items-center justify-center gap-1.5 font-semibold py-2.5 rounded-xl text-sm transition-colors ${registered ? "bg-green-50 border border-green-300 text-green-700" : pending ? "bg-amber-50 border border-amber-200 text-amber-700" : full ? "bg-gray-100 text-gray-400 pointer-events-none" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
                      <Ticket className="w-3.5 h-3.5" />
                      {registered ? "✓ Attending" : pending ? "⏳ Pending" : full ? "Full" : "Request →"}
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
