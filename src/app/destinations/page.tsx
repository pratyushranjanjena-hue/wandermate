"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Users, BookOpen, ArrowRight, Compass, Map as MapIcon } from "lucide-react";
import { useData } from "@/context/DataContext";

export default function DestinationsPage() {
  const { trips, posts } = useData();
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("");

  // Derive all unique destinations from user-created trips
  const destinations = useMemo(() => {
    const map = new Map<string, {
      destination: string;
      state: string;
      tripIds: string[];
      photoUrl?: string;
      image: string;
      types: string[];
      totalTravelers: number;
    }>();

    for (const trip of trips) {
      const key = `${trip.destination.toLowerCase()}||${trip.state.toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, {
          destination: trip.destination,
          state: trip.state,
          tripIds: [],
          photoUrl: undefined,
          image: trip.image || "🗺️",
          types: [],
          totalTravelers: 0,
        });
      }
      const entry = map.get(key)!;
      entry.tripIds.push(trip.id);
      if (!entry.photoUrl && trip.photoUrl) entry.photoUrl = trip.photoUrl;
      if (!entry.types.includes(trip.type)) entry.types.push(trip.type);
      entry.totalTravelers += trip.joinedUsers.length + 1; // +1 for host
    }

    return Array.from(map.values())
      .map(entry => ({
        ...entry,
        blogCount: posts.filter(p =>
          p.location.toLowerCase().includes(entry.destination.toLowerCase())
        ).length,
      }))
      .sort((a, b) => b.tripIds.length - a.tripIds.length);
  }, [trips, posts]);

  // All unique trip types for filter chips
  const allTypes = useMemo(() => {
    const types = new Set<string>();
    trips.forEach(t => types.add(t.type));
    return Array.from(types).sort();
  }, [trips]);

  const filtered = destinations.filter(d => {
    const matchQuery = !query ||
      d.destination.toLowerCase().includes(query.toLowerCase()) ||
      d.state.toLowerCase().includes(query.toLowerCase());
    const matchType = !activeType || d.types.includes(activeType);
    return matchQuery && matchType;
  });

  return (
    <div className="min-h-screen relative">
      {/* Blurred activity background */}
      <div className="fixed inset-0 -z-10">
        <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&h=900&fit=crop&auto=format&q=80" alt="" className="w-full h-full object-cover" style={{ filter: "blur(5px)", transform: "scale(1.05)" }} />
        <div className="absolute inset-0" style={{ background: "rgba(240,253,250,0.75)" }} />
      </div>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #134e4a 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" /> {destinations.length} Destination{destinations.length !== 1 ? "s" : ""}
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Where Are People<br />
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Travelling Right Now?</span>
          </h1>
          <p className="text-gray-300 text-base max-w-xl mx-auto mb-8">
            Destinations come alive when travellers create trips. Every place here has an active trip you can join.
          </p>

          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by city or state..."
              className="w-full pl-12 pr-4 py-4 border-0 rounded-2xl text-base shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Type filter chips — only shown if there are trips */}
        {allTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <button onClick={() => setActiveType("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${!activeType ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"}`}>
              All Types
            </button>
            {allTypes.map(type => (
              <button key={type} onClick={() => setActiveType(type === activeType ? "" : type)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeType === type ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"}`}>
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Empty state — no trips at all */}
        {destinations.length === 0 && (
          <div className="text-center py-28">
            <p className="text-7xl mb-5">🗺️</p>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No destinations yet</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Destinations appear here automatically when travellers create trips. Be the first to plan one!</p>
            <Link href="/trips/new"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-full transition-colors">
              Create the first trip <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Empty search/filter result */}
        {destinations.length > 0 && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl font-bold text-gray-700">No destinations match your search</p>
            <button onClick={() => { setQuery(""); setActiveType(""); }}
              className="mt-2 text-teal-600 underline text-sm font-medium">
              Clear filters
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(dest => (
            <div key={`${dest.destination}-${dest.state}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Photo / Emoji cover */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-teal-700 to-emerald-800">
                {dest.photoUrl ? (
                  <Image src={dest.photoUrl} alt={dest.destination} fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40">
                    {dest.image}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-extrabold text-white text-xl leading-tight">{dest.destination}</h3>
                  <p className="text-white/70 text-xs flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-3 h-3" /> {dest.state}
                  </p>
                </div>
              </div>

              <div className="p-4">
                {/* Trip type tags */}
                {dest.types.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {dest.types.slice(0, 4).map(type => (
                      <span key={type} className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-medium">
                        {type}
                      </span>
                    ))}
                    {dest.types.length > 4 && (
                      <span className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full font-medium">
                        +{dest.types.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1 text-center text-xs border-t border-gray-100 pt-3 mb-3">
                  <div>
                    <p className="font-bold text-gray-800 flex items-center justify-center gap-0.5">
                      <MapIcon className="w-3 h-3 text-teal-500" /> {dest.tripIds.length}
                    </p>
                    <p className="text-gray-400">Trips</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 flex items-center justify-center gap-0.5">
                      <BookOpen className="w-3 h-3 text-blue-400" /> {dest.blogCount}
                    </p>
                    <p className="text-gray-400">Posts</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 flex items-center justify-center gap-0.5">
                      <Users className="w-3 h-3 text-purple-400" /> {dest.totalTravelers}
                    </p>
                    <p className="text-gray-400">Travellers</p>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link href={`/trips?destination=${encodeURIComponent(dest.destination)}`}
                    className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs font-bold transition-colors">
                    View Trips <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
