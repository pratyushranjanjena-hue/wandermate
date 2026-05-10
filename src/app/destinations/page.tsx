"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Star, Users, BookOpen, Camera } from "lucide-react";
import { useData } from "@/context/DataContext";

const DESTINATIONS = [
  { id: 1, name: "Ladakh", state: "J&K", image: "🏔️", rating: 4.9, tags: ["Mountains", "Bike Rides", "Monasteries", "Cold Desert"], bestTime: "Jun–Sep" },
  { id: 2, name: "Coorg", state: "Karnataka", image: "🌿", rating: 4.8, tags: ["Nature", "Coffee Estates", "Waterfalls", "Weekend Getaway"], bestTime: "Oct–Mar" },
  { id: 3, name: "Manali", state: "Himachal Pradesh", image: "❄️", rating: 4.7, tags: ["Snow", "Trek", "Bike Rides", "Adventure"], bestTime: "Dec–Jan, Jun–Aug" },
  { id: 4, name: "Goa", state: "Goa", image: "🏖️", rating: 4.6, tags: ["Beaches", "Nightlife", "Backpacking", "Food"], bestTime: "Nov–Mar" },
  { id: 5, name: "Hampi", state: "Karnataka", image: "🏛️", rating: 4.8, tags: ["Heritage", "History", "Photography", "Boulder Climbing"], bestTime: "Oct–Feb" },
  { id: 6, name: "Spiti Valley", state: "Himachal Pradesh", image: "🌄", rating: 4.9, tags: ["Remote", "Bike Rides", "Monasteries", "High Altitude"], bestTime: "Jun–Sep" },
  { id: 7, name: "Rishikesh", state: "Uttarakhand", image: "🌊", rating: 4.7, tags: ["Adventure", "Rafting", "Yoga", "Mountains"], bestTime: "Feb–Apr, Sep–Nov" },
  { id: 8, name: "Jaisalmer", state: "Rajasthan", image: "🏜️", rating: 4.8, tags: ["Desert", "Camel Ride", "Heritage", "Dunes"], bestTime: "Oct–Mar" },
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
    photos: Math.floor(Math.random() * 1000) + 200,
  })), [trips, posts]);

  const filtered = enriched.filter(d => {
    const matchQuery = !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.state.toLowerCase().includes(query.toLowerCase());
    const matchTag = !activeTag || d.tags.some(t => t.toLowerCase() === activeTag.toLowerCase());
    return matchQuery && matchTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Discover Destinations</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">Search any place to find trips, blogs, photos, and everything you need before you go</p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search Ladakh, Goa, Spiti Valley..."
            className="w-full pl-12 pr-32 py-4 border border-gray-200 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
            Search
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-10">
        <button onClick={() => setActiveTag("")}
          className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${!activeTag ? "bg-teal-600 text-white border-teal-600" : "bg-white border-gray-200 text-gray-600 hover:border-teal-500 hover:bg-teal-50"}`}>
          All
        </button>
        {ALL_TAGS.map(tag => (
          <button key={tag} onClick={() => setActiveTag(tag === activeTag ? "" : tag)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${activeTag === tag ? "bg-teal-600 text-white border-teal-600" : "bg-white border-gray-200 text-gray-600 hover:border-teal-500 hover:bg-teal-50"}`}>
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🗺️</p>
          <p className="text-lg font-medium">No destinations found</p>
          <button onClick={() => { setQuery(""); setActiveTag(""); }} className="mt-2 text-teal-600 underline text-sm">Clear filters</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(dest => (
          <div key={dest.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group">
            <div className="h-36 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">{dest.image}</div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{dest.name}</h3>
                  <p className="text-gray-400 text-xs flex items-center gap-0.5 mt-0.5"><MapPin className="w-3 h-3" /> {dest.state}</p>
                </div>
                <span className="flex items-center gap-0.5 text-sm font-semibold text-gray-700">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {dest.rating}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2 mb-3">
                {dest.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-xs text-gray-500 border-t border-gray-50 pt-3">
                <div>
                  <p className="font-bold text-gray-800 text-sm flex items-center justify-center gap-0.5"><Users className="w-3 h-3 text-teal-500" /> {dest.trips}</p>
                  <p>Trips</p>
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm flex items-center justify-center gap-0.5"><BookOpen className="w-3 h-3 text-blue-400" /> {dest.blogs}</p>
                  <p>Blogs</p>
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm flex items-center justify-center gap-0.5"><Camera className="w-3 h-3 text-purple-400" /> {dest.photos}</p>
                  <p>Photos</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                Best time: <span className="text-gray-600 font-medium">{dest.bestTime}</span>
              </div>
              <button className="mt-3 w-full bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold py-2 rounded-xl text-sm transition-colors">
                Explore {dest.name} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
