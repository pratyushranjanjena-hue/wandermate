"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, MapPin, Star, Users, BookOpen, Camera, ArrowRight, Compass } from "lucide-react";
import { useData } from "@/context/DataContext";

const DESTINATIONS = [
  { id: 1, name: "Ladakh", state: "J&K / Ladakh", photo: "photo-1506905925346-21bda4d32df4", rating: 4.9, tags: ["Mountains", "Bike Rides", "Monasteries", "Cold Desert"], bestTime: "Jun–Sep", vibe: "Surreal. High altitude. Once-in-a-lifetime.", color: "from-blue-900/80 to-blue-700/40" },
  { id: 2, name: "Coorg", state: "Karnataka", photo: "photo-1513581166391-887a96ddeafd", rating: 4.8, tags: ["Nature", "Coffee Estates", "Waterfalls", "Weekend Getaway"], bestTime: "Oct–Mar", vibe: "Green hills, fresh air, total peace.", color: "from-green-900/80 to-green-700/40" },
  { id: 3, name: "Manali", state: "Himachal Pradesh", photo: "photo-1575936123452-b67c3203c357", rating: 4.7, tags: ["Snow", "Trek", "Bike Rides", "Adventure"], bestTime: "Dec–Jan, Jun–Aug", vibe: "Snow peaks, river roars, adventure calls.", color: "from-slate-900/80 to-slate-700/40" },
  { id: 4, name: "Goa", state: "Goa", photo: "photo-1512343879784-a960bf40e7f2", rating: 4.6, tags: ["Beaches", "Nightlife", "Backpacking", "Food"], bestTime: "Nov–Mar", vibe: "Beaches, cashew feni and zero plans.", color: "from-amber-900/80 to-amber-700/40" },
  { id: 5, name: "Hampi", state: "Karnataka", photo: "photo-1524230572899-a752b3835840", rating: 4.8, tags: ["Heritage", "History", "Photography", "Boulder Climbing"], bestTime: "Oct–Feb", vibe: "Ancient ruins, boulders, golden hour magic.", color: "from-orange-900/80 to-orange-700/40" },
  { id: 6, name: "Spiti Valley", state: "Himachal Pradesh", photo: "photo-1502786129293-79981df4e689", rating: 4.9, tags: ["Remote", "Bike Rides", "Monasteries", "High Altitude"], bestTime: "Jun–Sep", vibe: "Barren but breathtaking. The moon's twin.", color: "from-gray-900/80 to-gray-700/40" },
  { id: 7, name: "Rishikesh", state: "Uttarakhand", photo: "photo-1615380547903-daa3ee690cde", rating: 4.7, tags: ["Adventure", "Rafting", "Yoga", "Mountains"], bestTime: "Feb–Apr, Sep–Nov", vibe: "Ganges, yoga, rafting and real conversations.", color: "from-teal-900/80 to-teal-700/40" },
  { id: 8, name: "Jaisalmer", state: "Rajasthan", photo: "photo-1477587458883-47145ed6736e", rating: 4.8, tags: ["Desert", "Camel Ride", "Heritage", "Dunes"], bestTime: "Oct–Mar", vibe: "Golden fort city rising from the desert.", color: "from-yellow-900/80 to-yellow-700/40" },
];

const ALL_TAGS = ["Mountains", "Beaches", "Heritage", "Bike Rides", "Trek", "Desert", "Waterfalls", "Snow", "Nature", "Adventure", "Food", "Photography"];

export default function DestinationsPage() {
  const { trips, posts } = useData();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");

  const enriched = useMemo(() => DESTINATIONS.map(dest => ({
    ...dest,
    trips: trips.filter(t => t.destination.toLowerCase().includes(dest.name.toLowerCase())).length,
    blogs: posts.filter(p => p.location.toLowerCase().includes(dest.name.toLowerCase())).length,
    photos: Math.floor(Math.random() * 800) + 200,
  })), [trips, posts]);

  const filtered = enriched.filter(d => {
    const matchQuery = !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.state.toLowerCase().includes(query.toLowerCase());
    const matchTag = !activeTag || d.tags.some(t => t.toLowerCase() === activeTag.toLowerCase());
    return matchQuery && matchTag;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #134e4a 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" /> {DESTINATIONS.length} Destinations
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Where Do You Want<br />
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">To Go Next?</span>
          </h1>
          <p className="text-gray-300 text-base max-w-xl mx-auto mb-8">
            Explore India&apos;s most loved destinations — see live trips, real stories, and people already planning to go.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search Ladakh, Goa, Spiti Valley..."
              className="w-full pl-12 pr-4 py-4 border-0 rounded-2xl text-base shadow-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tag filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button onClick={() => setActiveTag("")}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${!activeTag ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"}`}>
            All Places
          </button>
          {ALL_TAGS.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag === activeTag ? "" : tag)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeTag === tag ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"}`}>
              {tag}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🗺️</p>
            <p className="text-xl font-bold text-gray-700">No destinations found</p>
            <button onClick={() => { setQuery(""); setActiveTag(""); }} className="mt-2 text-teal-600 underline text-sm font-medium">Clear filters</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(dest => (
            <div key={dest.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
              {/* Photo */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={`https://images.unsplash.com/${dest.photo}?w=600&h=400&fit=crop&auto=format&q=80`}
                  alt={dest.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${dest.color}`} />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-white text-xl leading-tight">{dest.name}</h3>
                      <p className="text-white/70 text-xs flex items-center gap-0.5 mt-0.5"><MapPin className="w-3 h-3" /> {dest.state}</p>
                    </div>
                    <span className="flex items-center gap-0.5 text-sm font-bold text-white bg-black/30 px-2 py-0.5 rounded-full">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {dest.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="text-gray-500 text-xs italic mb-3 leading-relaxed">&ldquo;{dest.vibe}&rdquo;</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {dest.tags.map(tag => (
                    <span key={tag} className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1 text-center text-xs border-t border-gray-100 pt-3 mb-3">
                  <div>
                    <p className="font-bold text-gray-800 flex items-center justify-center gap-0.5"><Users className="w-3 h-3 text-teal-500" /> {dest.trips}</p>
                    <p className="text-gray-400">Trips</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 flex items-center justify-center gap-0.5"><BookOpen className="w-3 h-3 text-blue-400" /> {dest.blogs}</p>
                    <p className="text-gray-400">Blogs</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 flex items-center justify-center gap-0.5"><Camera className="w-3 h-3 text-purple-400" /> {dest.photos}</p>
                    <p className="text-gray-400">Photos</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Best: <span className="text-gray-600 font-semibold">{dest.bestTime}</span></p>
                  <button className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs font-bold transition-colors">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
