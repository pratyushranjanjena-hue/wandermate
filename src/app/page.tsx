"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowRight, MapPin, Calendar, Users, Shield, Camera, Bike, ChevronDown, ChevronUp, Ticket, BookOpen, Search } from "lucide-react";

const U = (id: string, w = 1400, h = 900) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const HERO_SLIDES = [
  {
    id: "hero-1",
    bg: U("photo-1504280390367-361c6d9f38f4"),
    tag: "Camping", label: "01",
    title: "Camping Under the Stars",
    subtitle: "Wake up to birdsong, campfire coffee, and people who get it",
    location: "Coorg, Karnataka", meta: "12 spots available", spots: "Join this activity",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-2",
    bg: U("photo-1567337710282-00832b415979"),
    tag: "Food Exploring", label: "02",
    title: "India's Best Street Food Walks",
    subtitle: "Eat your way through Mumbai, Delhi, Hyderabad with locals who know every stall",
    location: "Across India", meta: "Food walks every weekend", spots: "Explore food events",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-3",
    bg: U("photo-1602853238986-89bc0191754b"),
    tag: "Trekking", label: "03",
    title: "Manali High Altitude Trek",
    subtitle: "Frozen valleys, alpine meadows and starlit campsites",
    location: "Manali, HP", meta: "Group treks — all levels", spots: "See treks",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-4",
    bg: U("photo-1530549387789-4c1017266635"),
    tag: "Sports & Games", label: "04",
    title: "Beach Sports & Weekend Games",
    subtitle: "Volleyball, cricket, cycling, frisbee — play with new people every weekend",
    location: "Goa, Mumbai, Bengaluru", meta: "Open to all fitness levels", spots: "Join a sports meetup",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-5",
    bg: U("photo-1492691527719-9d1e07e534b4"),
    tag: "Content Creation", label: "05",
    title: "Shoot, Edit & Create Together",
    subtitle: "Travel Reels, food photography, vlogs — with a crew that shares your vision",
    location: "All over India", meta: "Creator meetups monthly", spots: "Find your crew",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-6",
    bg: U("photo-1511632765486-a01980e01a18"),
    tag: "Social Activity", label: "06",
    title: "Meet Your Kind of People",
    subtitle: "Board games, open mics, city walks — no reason needed to make new friends",
    location: "Your city", meta: "Social meetups near you", spots: "See what's happening",
    color: "from-black/70 via-black/40 to-transparent",
  },
];

const TRIPS = [
  { id: "t1", title: "Coorg Camping Weekend", destination: "Coorg, Karnataka", date: "Jun 7–9", type: "Camping", img: U("photo-1504280390367-361c6d9f38f4", 600, 400), budget: "₹4,500" },
  { id: "t2", title: "Mumbai Street Food Safari", destination: "Mumbai, Maharashtra", date: "May 24", type: "Food Exploring", img: U("photo-1567337710282-00832b415979", 600, 400), budget: "₹1,200" },
  { id: "t3", title: "Manali Snow Trek", destination: "Manali, HP", date: "Jul 1–7", type: "Trekking", img: U("photo-1602853238986-89bc0191754b", 600, 400), budget: "₹12,000" },
  { id: "t4", title: "Goa Beach Sports Meetup", destination: "Goa", date: "Jun 5–7", type: "Sports & Games", img: U("photo-1530549387789-4c1017266635", 600, 400), budget: "₹3,000" },
  { id: "t5", title: "Bangalore Cyclists Sunrise Ride", destination: "Nandi Hills, Karnataka", date: "May 30–31", type: "Cycling", img: U("photo-1476611338391-6f395a0ebc7b", 600, 400), budget: "₹1,500" },
  { id: "t6", title: "Hyderabad Photography Walk", destination: "Hyderabad", date: "Jun 14", type: "Content Creation", img: U("photo-1492691527719-9d1e07e534b4", 600, 400), budget: "₹500" },
];

const EVENTS = [
  { id: "e1", title: "Midnight Camping at Pondicherry Beach", location: "Pondicherry", date: "May 25, 2026", type: "Camping", price: "₹1,800", img: U("photo-1504280390367-361c6d9f38f4", 600, 400), badge: "Featured" },
  { id: "e2", title: "Delhi Street Food Photography Walk", location: "Old Delhi", date: "June 1, 2026", type: "Food Walk", price: "₹800", img: U("photo-1567337710282-00832b415979", 600, 400), badge: "New" },
  { id: "e3", title: "Bangalore Boardgames & Brunch", location: "Koramangala, Bengaluru", date: "May 18, 2026", type: "Social Meetup", price: "Free", img: U("photo-1511632765486-a01980e01a18", 600, 400), badge: null },
  { id: "e4", title: "Sahyadri Monsoon Trek", location: "Lonavala, Maharashtra", date: "July 5, 2026", type: "Trekking", img: U("photo-1602853238986-89bc0191754b", 600, 400), price: "₹800", badge: null },
  { id: "e5", title: "Travel Reels & Content Bootcamp", location: "Bengaluru", date: "June 14, 2026", type: "Content Creation", price: "₹1,200", img: U("photo-1492691527719-9d1e07e534b4", 600, 400), badge: "New" },
  { id: "e6", title: "Mumbai Cyclists Social Ride", location: "Bandra, Mumbai", date: "June 7, 2026", type: "Sports & Games", price: "Free", img: U("photo-1530549387789-4c1017266635", 600, 400), badge: null },
];

const POSTS = [
  { id: "p1", type: "blog", location: "Coorg, Karnataka", title: "My First Camping Trip — What I Packed, What I Forgot", img: U("photo-1504280390367-361c6d9f38f4", 600, 400), tag: "Camping" },
  { id: "p2", type: "photo", location: "Mumbai", title: "Mumbai Street Food at 2am — A Photo Essay", img: U("photo-1567337710282-00832b415979", 600, 400), tag: "Food" },
  { id: "p3", type: "blog", location: "Bengaluru", title: "How I Made 20 New Friends Over Board Games", img: U("photo-1511632765486-a01980e01a18", 600, 400), tag: "Social" },
  { id: "p4", type: "video", location: "Manali, HP", title: "How We Shot a Travel Reel on Just a Phone", img: U("photo-1492691527719-9d1e07e534b4", 600, 400), tag: "Content Creation" },
  { id: "p5", type: "blog", location: "Rishikesh", title: "I Did a Yoga Retreat as a Skeptic — Here's What Happened", img: U("photo-1545389336-cf090694435e", 600, 400), tag: "Wellness" },
  { id: "p6", type: "photo", location: "Goa", title: "Beach Volleyball with Strangers Made My Trip", img: U("photo-1530549387789-4c1017266635", 600, 400), tag: "Sports" },
];

const DESTINATIONS = [
  { name: "Ladakh", state: "J&K", img: U("photo-1668602393029-718d15379982", 400, 300), tag: "Mountains" },
  { name: "Goa", state: "Goa", img: U("photo-1652820330085-82a0c2b88d78", 400, 300), tag: "Beaches" },
  { name: "Manali", state: "HP", img: U("photo-1643284673337-6a09e28308e7", 400, 300), tag: "Snow" },
  { name: "Coorg", state: "Karnataka", img: U("photo-1547141521-f6872c7f1e81", 400, 300), tag: "Nature" },
  { name: "Hampi", state: "Karnataka", img: U("photo-1596018382916-56d2e341d784", 400, 300), tag: "Heritage" },
  { name: "Spiti Valley", state: "HP", img: U("photo-1659267490157-e2a9b9fdb12e", 400, 300), tag: "Remote" },
  { name: "Rishikesh", state: "Uttarakhand", img: U("photo-1509016491329-3da6c5ba7555", 400, 300), tag: "Adventure" },
  { name: "Jaisalmer", state: "Rajasthan", img: U("photo-1564509261027-29e141e2c598", 400, 300), tag: "Desert" },
];

const SLIDES = [
  { id: "hero", label: "Home" },
  { id: "discover", label: "Discover" },
  { id: "community", label: "Stories" },
  { id: "destinations", label: "Destinations" },
  { id: "about", label: "About" },
];

const H = "calc(100vh - 64px)";

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [heroSlide, setHeroSlide] = useState(0);
  const [discoverTab, setDiscoverTab] = useState<"activities" | "events">("activities");
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setHeroSlide(h => (h + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Track active slide via IntersectionObserver on the scroll container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observers = slideRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setCurrent(i); },
        { root: container, threshold: 0.5 }
      );
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const scrollToSlide = useCallback((index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    slideRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") scrollToSlide(current + 1);
      if (e.key === "ArrowUp") scrollToSlide(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, scrollToSlide]);

  const hs = HERO_SLIDES[heroSlide];

  return (
    <div className="relative" style={{ height: H }}>

      {/* ── Scroll container — CSS snap handles all scrolling natively ── */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ overflowY: "scroll", scrollSnapType: "y mandatory" }}
      >

        {/* ════ SLIDE 1 — HERO ════ */}
        <div
          ref={el => { slideRefs.current[0] = el; }}
          className="w-full relative overflow-hidden"
          style={{ height: H, scrollSnapAlign: "start" }}
        >
          <div className="absolute inset-0">
            <Image src={hs.bg} alt={hs.title} fill className="object-cover transition-opacity duration-700" priority unoptimized />
            <div className={`absolute inset-0 bg-gradient-to-r ${hs.color}`} />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-teal-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">{hs.tag}</span>
                  <span className="text-white/70 text-sm flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{hs.location}</span>
                </div>
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">{hs.title}</h1>
                <p className="text-lg text-white/75 mb-3">{hs.subtitle}</p>
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-white/60 text-sm">{hs.meta}</span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="bg-green-400/20 text-green-300 text-sm font-semibold px-2.5 py-0.5 rounded-full border border-green-400/30">{hs.spots}</span>
                </div>
                <div className="flex flex-wrap gap-4 mb-10">
                  <Link href="/trips" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-full text-lg transition-all shadow-xl hover:scale-105">
                    Explore Activities <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/trips/new" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold px-8 py-4 rounded-full text-lg transition-all backdrop-blur-sm">
                    Host an Activity
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-6 max-w-sm">
                  {[["🚀", "Just Launched"], ["Free", "To Join"], ["India", "Wide"], ["Open", "Beta"]].map(([v, l]) => (
                    <div key={l}><p className="text-2xl font-extrabold text-white">{v}</p><p className="text-teal-300/80 text-xs mt-0.5">{l}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 z-20 flex gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button key={s.id} onClick={() => setHeroSlide(i)}
                className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${i === heroSlide ? "border-white w-20 h-14" : "border-white/30 w-14 h-10 opacity-60 hover:opacity-90"}`}>
                <Image src={s.bg} alt={s.title} fill className="object-cover" unoptimized />
                {i === heroSlide && <div className="absolute inset-0 bg-teal-500/20" />}
              </button>
            ))}
          </div>

          <button className="absolute bottom-8 right-6 z-20 flex flex-col items-center gap-1 text-white/50 animate-bounce" onClick={() => scrollToSlide(1)}>
            <span className="text-xs font-medium">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* ════ SLIDE 2 — DISCOVER (Activities + Events combined) ════ */}
        <div
          ref={el => { slideRefs.current[1] = el; }}
          className="w-full bg-gray-50 flex flex-col justify-center overflow-hidden"
          style={{ height: H, scrollSnapAlign: "start" }}
        >
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col h-full justify-center">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">02 / Discover</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">Find What to Do Next</h2>
                <p className="text-gray-500 text-sm mt-0.5">Activities and events happening across India</p>
              </div>
              <Link
                href={discoverTab === "activities" ? "/trips" : "/events"}
                className="hidden sm:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
              >
                See All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-full p-1 w-fit shadow-sm">
              <button
                onClick={() => setDiscoverTab("activities")}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${discoverTab === "activities" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                🏃 Activities
              </button>
              <button
                onClick={() => setDiscoverTab("events")}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${discoverTab === "events" ? "bg-teal-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                📅 Events
              </button>
            </div>

            {discoverTab === "activities" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {TRIPS.map(trip => (
                  <Link href={`/trips/${trip.id}`} key={trip.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-teal-200 transition-all hover:-translate-y-1">
                    <div className="relative h-28 overflow-hidden">
                      <Image src={trip.img} alt={trip.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-xs bg-teal-500 text-white font-semibold px-2 py-0.5 rounded-full">{trip.type}</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1">{trip.title}</h3>
                      <p className="text-gray-400 text-xs flex items-center gap-0.5 mb-0.5"><MapPin className="w-3 h-3" />{trip.destination}</p>
                      <p className="text-gray-400 text-xs flex items-center gap-0.5"><Calendar className="w-3 h-3" />{trip.date}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-teal-700 font-bold text-sm">{trip.budget}</span>
                        <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-1.5 py-0.5 rounded-full">Open</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {discoverTab === "events" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {EVENTS.map(event => (
                  <div key={event.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-teal-200 transition-all hover:-translate-y-1 cursor-pointer">
                    <div className="relative h-28 overflow-hidden">
                      <Image src={event.img} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      {event.badge && (
                        <span className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${event.badge === "Featured" ? "bg-teal-500 text-white" : event.badge === "New" ? "bg-green-500 text-white" : "bg-purple-500 text-white"}`}>{event.badge}</span>
                      )}
                      <span className={`absolute bottom-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${event.price === "Free" ? "bg-green-500 text-white" : "bg-white/20 text-white border border-white/30"}`}>{event.price}</span>
                    </div>
                    <div className="p-3">
                      <span className="text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-full">{event.type}</span>
                      <h3 className="font-bold text-gray-900 text-xs mt-1.5 leading-snug line-clamp-2">{event.title}</h3>
                      <p className="text-gray-500 text-xs flex items-center gap-0.5 mt-1"><MapPin className="w-3 h-3" />{event.location}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-0.5 mt-0.5"><Calendar className="w-3 h-3" />{event.date}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-teal-600 text-xs font-semibold">Register →</p>
                        <Link href="/events" className="flex items-center gap-0.5 bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors">
                          <Ticket className="w-3 h-3" /> Join
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ════ SLIDE 3 — COMMUNITY ════ */}
        <div
          ref={el => { slideRefs.current[2] = el; }}
          className="w-full bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col justify-center overflow-hidden"
          style={{ height: H, scrollSnapAlign: "start" }}
        >
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col h-full justify-center">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">03 / Stories</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">Stories from the Community</h2>
                <p className="text-gray-400 text-sm mt-0.5">Camping diaries, food walks, sports moments, creator tips & more</p>
              </div>
              <Link href="/community" className="hidden sm:flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
                All Stories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {POSTS.map(post => (
                <div key={post.id} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/40 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="relative h-28 overflow-hidden">
                    <Image src={post.img} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${post.type === "blog" ? "bg-blue-500/80 text-white" : post.type === "photo" ? "bg-purple-500/80 text-white" : "bg-red-500/80 text-white"}`}>
                      {post.type === "blog" ? "✍️ Blog" : post.type === "photo" ? "📷 Photo" : "🎬 Video"}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-white text-xs leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-gray-500 text-xs flex items-center gap-0.5 mt-1"><MapPin className="w-3 h-3" />{post.location}</p>
                    <span className="inline-block mt-1.5 text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full">#{post.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════ SLIDE 4 — DESTINATIONS ════ */}
        <div
          ref={el => { slideRefs.current[3] = el; }}
          className="w-full bg-gradient-to-br from-emerald-950 to-gray-950 flex flex-col justify-center overflow-hidden"
          style={{ height: H, scrollSnapAlign: "start" }}
        >
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col h-full justify-center">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">04 / Destinations</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">Discover India</h2>
                <p className="text-gray-400 text-sm mt-0.5">Find activities, blogs and photos for any destination</p>
              </div>
              <Link href="/destinations" className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
                Explore All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative max-w-md mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Link href="/destinations">
                <div className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-gray-400 cursor-pointer hover:bg-white/15 transition-colors">
                  Search any destination...
                </div>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {DESTINATIONS.map(dest => (
                <Link href="/destinations" key={dest.name}
                  className="group relative rounded-2xl overflow-hidden h-32 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <Image src={dest.img} alt={dest.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <h3 className="font-bold text-white text-sm leading-tight">{dest.name}</h3>
                    <p className="text-gray-300 text-xs">{dest.state}</p>
                    <span className="text-xs bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded-full mt-1 inline-block">{dest.tag}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ════ SLIDE 5 — ABOUT ════ */}
        <div
          ref={el => { slideRefs.current[4] = el; }}
          className="w-full bg-white flex flex-col justify-center overflow-hidden"
          style={{ height: H, scrollSnapAlign: "start" }}
        >
          <div className="max-w-6xl mx-auto px-6 w-full flex flex-col h-full justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">05 / About WanderMate</span>
                <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-6 leading-tight">Built for People Who Want to Do More Together</h2>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: <Users className="w-5 h-5 text-teal-600" />, title: "Find Your People", desc: "Match with others who share your interests — camping, food, sports, travel, or content creation." },
                    { icon: <Shield className="w-5 h-5 text-teal-600" />, title: "Safe & Verified", desc: "ID verified profiles, SOS button, and live location sharing for every activity." },
                    { icon: <Camera className="w-5 h-5 text-teal-600" />, title: "Share Your Story", desc: "Write blogs, post photos and videos. Build your creator and traveler profile." },
                    { icon: <Bike className="w-5 h-5 text-teal-600" />, title: "Host Any Activity", desc: "Camping, treks, food walks, sports, meetups — create your group in 3 steps." },
                    { icon: <BookOpen className="w-5 h-5 text-teal-600" />, title: "Discover Anywhere", desc: "Search any place and find real activities, blogs, photos and local tips." },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">{item.icon}</div>
                      <div><p className="font-bold text-gray-900 text-sm">{item.title}</p><p className="text-gray-500 text-sm">{item.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden h-52 shadow-2xl">
                  <Image src={U("photo-1506869640319-fe1a24fd76dc", 800, 400)} alt="Group activities" fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600/80 to-teal-800/60" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                    <div className="text-4xl mb-2">🌍</div>
                    <h3 className="text-xl font-extrabold mb-1">Ready to Explore?</h3>
                    <p className="text-teal-100 text-sm mb-4">Be among the first to join WanderMate — just launched!</p>
                    <div className="flex gap-3">
                      <Link href="/trips" className="bg-white text-teal-700 hover:bg-teal-50 font-bold py-2 px-5 rounded-full transition-colors text-sm">Browse Activities →</Link>
                      <Link href="/trips/new" className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold py-2 px-5 rounded-full transition-colors text-sm">Host an Activity</Link>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[["🏕️", "Camping"], ["🥾", "Trekking"], ["🍜", "Food Walks"], ["🏐", "Sports"], ["📸", "Content"], ["🧘", "Wellness"]].map(([e, l]) => (
                    <Link href="/events" key={l} className="bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-200 rounded-xl p-3 text-center transition-colors">
                      <div className="text-2xl mb-1">{e}</div>
                      <p className="text-xs font-medium text-gray-700">{l}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>{/* end scroll container */}

      {/* ── Right dot nav — absolute so it floats above the scroll container ── */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5 pointer-events-auto">
        {SLIDES.map((slide, i) => (
          <button key={slide.id} onClick={() => scrollToSlide(i)} title={slide.label} className={`relative group transition-all duration-300 ${i === current ? "scale-125" : ""}`}>
            <div className={`rounded-full transition-all duration-300 ${i === current ? "w-2.5 h-8 bg-teal-400" : "w-2 h-2 bg-gray-400/60 hover:bg-gray-400"}`} />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-white/80 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 rounded-md">{slide.label}</span>
          </button>
        ))}
      </div>

      {current > 0 && (
        <button onClick={() => scrollToSlide(current - 1)} className="absolute bottom-16 right-5 z-50 w-9 h-9 bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all">
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      {current < SLIDES.length - 1 && (
        <button onClick={() => scrollToSlide(current + 1)} className="absolute bottom-5 right-5 z-50 w-9 h-9 bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all">
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      <div className="absolute bottom-5 left-5 z-50 text-white/40 text-xs font-mono">
        {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
      </div>
    </div>
  );
}
