"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowRight, MapPin, Calendar, Star, Users, Shield, Camera, Bike, ChevronDown, ChevronUp, Ticket, BookOpen, Search, Heart } from "lucide-react";

const U = (id: string, w = 1400, h = 900) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

// ── Hero slides ──────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: "hero-1",
    bg: U("photo-1548501505-a6a79bf0b774"),
    tag: "Bike Ride", label: "01",
    title: "Ladakh Bike Expedition",
    subtitle: "Ride through the highest motorable roads in the world",
    location: "Ladakh, J&K", meta: "8 riders · June 2026", spots: "3 spots left",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-2",
    bg: U("photo-1587538445896-d1f222cb0653"),
    tag: "Nature Retreat", label: "02",
    title: "Coorg Weekend Escape",
    subtitle: "Coffee estates, waterfalls and misty mountain mornings",
    location: "Coorg, Karnataka", meta: "10 travelers · May 2026", spots: "5 spots left",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-3",
    bg: U("photo-1602853238986-89bc0191754b"),
    tag: "Snow Trek", label: "03",
    title: "Manali High Altitude Trek",
    subtitle: "Frozen valleys, alpine meadows and starlit campsites",
    location: "Manali, HP", meta: "6 trekkers · July 2026", spots: "2 spots left",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-4",
    bg: U("photo-1590393275627-0c48482c60e3"),
    tag: "Backpacking", label: "04",
    title: "Goa Backpacker Meetup",
    subtitle: "Hidden beaches, local shacks and night markets with new friends",
    location: "Goa", meta: "15 backpackers · June 2026", spots: "8 spots left",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-5",
    bg: U("photo-1596018382916-56d2e341d784"),
    tag: "Heritage Walk", label: "05",
    title: "Hampi Ruins Explorer",
    subtitle: "Ancient temples, boulder landscapes and golden hour photography",
    location: "Hampi, Karnataka", meta: "12 explorers · May 2026", spots: "4 spots left",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "hero-6",
    bg: U("photo-1636567652095-f59e54ed6d3a"),
    tag: "Road Trip", label: "06",
    title: "Spiti Valley Road Trip",
    subtitle: "The last road to the edge of India — monasteries and silence",
    location: "Spiti Valley, HP", meta: "4 travelers · July 2026", spots: "1 spot left",
    color: "from-black/70 via-black/40 to-transparent",
  },
];

// ── Trips ────────────────────────────────────────────────────────────────────
const TRIPS = [
  { id: "t1", title: "Ladakh Bike Expedition", destination: "Ladakh, J&K", date: "Jun 15–25", spots: 3, totalSpots: 8, type: "Bike Ride", img: U("photo-1548501505-a6a79bf0b774", 600, 400), budget: "₹18,000", difficulty: "Moderate", rating: 4.9 },
  { id: "t2", title: "Coorg Weekend Retreat", destination: "Coorg, Karnataka", date: "May 24–26", spots: 5, totalSpots: 10, type: "Nature", img: U("photo-1563275955-f699248d51ab", 600, 400), budget: "₹6,500", difficulty: "Easy", rating: 4.8 },
  { id: "t3", title: "Manali Snow Trek", destination: "Manali, HP", date: "Jul 1–7", spots: 2, totalSpots: 6, type: "Trek", img: U("photo-1653077621914-29052ae0899f", 600, 400), budget: "₹12,000", difficulty: "Hard", rating: 4.7 },
  { id: "t4", title: "Goa Backpacker Meetup", destination: "Goa", date: "Jun 5–9", spots: 8, totalSpots: 15, type: "Backpacking", img: U("photo-1652820330085-82a0c2b88d78", 600, 400), budget: "₹8,000", difficulty: "Easy", rating: 4.6 },
  { id: "t5", title: "Hampi Heritage Walk", destination: "Hampi, Karnataka", date: "May 30–Jun 1", spots: 4, totalSpots: 12, type: "Heritage", img: U("photo-1620766182966-c6eb5ed2b788", 600, 400), budget: "₹5,000", difficulty: "Easy", rating: 4.8 },
  { id: "t6", title: "Spiti Valley Road Trip", destination: "Spiti, HP", date: "Jul 10–20", spots: 1, totalSpots: 4, type: "Road Trip", img: U("photo-1663076968785-baebf243d07d", 600, 400), budget: "₹22,000", difficulty: "Hard", rating: 5.0 },
];

// ── Events ───────────────────────────────────────────────────────────────────
const EVENTS = [
  { id: "e1", title: "Royal Enfield Riders Meetup", location: "Pune, Maharashtra", date: "May 18, 2026", type: "Bike Ride", price: "₹1,200", img: U("photo-1530248809527-ee069dc8373a", 600, 400), attendees: 24, max: 30, badge: "Featured" },
  { id: "e2", title: "Backpackers Hostel Crawl – Goa", location: "Panaji, Goa", date: "June 7–8, 2026", type: "Backpacking", price: "Free", img: U("photo-1599603725708-ec7324f3c7d4", 600, 400), attendees: 18, max: 25, badge: null },
  { id: "e3", title: "Photography Walk – Hampi Ruins", location: "Hampi, Karnataka", date: "June 14–15", type: "Photography", price: "₹500", img: U("photo-1600100397608-f010f423b971", 600, 400), attendees: 10, max: 15, badge: "New" },
  { id: "e4", title: "Sahyadri Monsoon Trek", location: "Lonavala, Maharashtra", date: "July 5, 2026", type: "Trek", img: U("photo-1684435948431-c4dd8532813b", 600, 400), price: "₹800", attendees: 32, max: 40, badge: null },
  { id: "e5", title: "Rajasthan Heritage Road Trip", location: "Jaipur → Jaisalmer", date: "Oct 10–20", type: "Road Trip", price: "₹25,000", img: U("photo-1579270946873-006abf1e0ffe", 600, 400), attendees: 6, max: 8, badge: "Premium" },
  { id: "e6", title: "Spiti Valley Bike Tour 2026", location: "Manali → Kaza", date: "Aug 1–14, 2026", type: "Bike Ride", price: "₹20,000", img: U("photo-1714224287863-76a311e2dd5b", 600, 400), attendees: 7, max: 10, badge: null },
];

// ── Community posts ──────────────────────────────────────────────────────────
const POSTS = [
  { id: "p1", type: "blog", author: "Priya S.", avatar: U("photo-1506869640319-fe1a24fd76dc", 80, 80), location: "Ladakh", title: "10 Days in Ladakh on ₹15,000 — Is It Possible?", img: U("photo-1695706833389-df87ea84b2fe", 600, 400), likes: 342, tag: "Budget Travel" },
  { id: "p2", type: "photo", author: "Arjun K.", avatar: U("photo-1565681003317-b137b4e91b86", 80, 80), location: "Coorg", title: "Golden Hour at Raja's Seat", img: U("photo-1700999945165-1882cd786128", 600, 400), likes: 218, tag: "Photography" },
  { id: "p3", type: "blog", author: "Sneha R.", avatar: U("photo-1509016491329-3da6c5ba7555", 80, 80), location: "Hampi", title: "My First Solo Trip at 26", img: U("photo-1591536098930-d571deee309a", 600, 400), likes: 521, tag: "Solo Travel" },
  { id: "p4", type: "video", author: "Vikram T.", avatar: U("photo-1684435948431-c4dd8532813b", 80, 80), location: "Spiti Valley", title: "Riding Through Spiti at 4,500m", img: U("photo-1659267490157-e2a9b9fdb12e", 600, 400), likes: 892, tag: "Bike Ride" },
  { id: "p5", type: "blog", author: "Ananya B.", avatar: U("photo-1670504850854-27ffd755521e", 80, 80), location: "Goa", title: "The Ultimate Goa Hostel Guide", img: U("photo-1646748019366-3f1c922bfe3b", 600, 400), likes: 267, tag: "Goa" },
  { id: "p6", type: "photo", author: "Rahul M.", avatar: U("photo-1509016491329-3da6c5ba7555", 80, 80), location: "Manali", title: "Sunrise from Rohtang Pass", img: U("photo-1712255495820-23c2c2d05bd9", 600, 400), likes: 445, tag: "Mountains" },
];

// ── Destinations ─────────────────────────────────────────────────────────────
const DESTINATIONS = [
  { name: "Ladakh", state: "J&K", img: U("photo-1668602393029-718d15379982", 400, 300), rating: 4.9, trips: 48, tag: "Mountains" },
  { name: "Goa", state: "Goa", img: U("photo-1652820330085-82a0c2b88d78", 400, 300), rating: 4.6, trips: 89, tag: "Beaches" },
  { name: "Manali", state: "HP", img: U("photo-1643284673337-6a09e28308e7", 400, 300), rating: 4.7, trips: 61, tag: "Snow" },
  { name: "Coorg", state: "Karnataka", img: U("photo-1547141521-f6872c7f1e81", 400, 300), rating: 4.8, trips: 32, tag: "Nature" },
  { name: "Hampi", state: "Karnataka", img: U("photo-1596018382916-56d2e341d784", 400, 300), rating: 4.8, trips: 27, tag: "Heritage" },
  { name: "Spiti Valley", state: "HP", img: U("photo-1659267490157-e2a9b9fdb12e", 400, 300), rating: 4.9, trips: 19, tag: "Remote" },
  { name: "Rishikesh", state: "Uttarakhand", img: U("photo-1509016491329-3da6c5ba7555", 400, 300), rating: 4.7, trips: 44, tag: "Adventure" },
  { name: "Jaisalmer", state: "Rajasthan", img: U("photo-1564509261027-29e141e2c598", 400, 300), rating: 4.8, trips: 22, tag: "Desert" },
];

const SLIDES = [
  { id: "hero", label: "Home" },
  { id: "trips", label: "Trips" },
  { id: "events", label: "Events" },
  { id: "community", label: "Community" },
  { id: "destinations", label: "Destinations" },
  { id: "about", label: "About" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [heroSlide, setHeroSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const lastScrollTime = useRef(0);

  // auto-advance hero
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(h => (h + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const goTo = useCallback((index: number) => {
    if (transitioning || index === current || index < 0 || index >= SLIDES.length) return;
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => setTransitioning(false), 950);
  }, [transitioning, current]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goTo(current + 1);
      if (e.key === "ArrowUp") goTo(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, goTo]);

  useEffect(() => {
    const handler = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 1050) return;
      lastScrollTime.current = now;
      if (e.deltaY > 20) goTo(current + 1);
      else if (e.deltaY < -20) goTo(current - 1);
    };
    window.addEventListener("wheel", handler, { passive: true });
    return () => window.removeEventListener("wheel", handler);
  }, [current, goTo]);

  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  };

  const hs = HERO_SLIDES[heroSlide];

  return (
    <div className="relative overflow-hidden" style={{ height: "calc(100vh - 64px)" }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* ── Slides wrapper ── */}
      <div className="absolute inset-0 will-change-transform"
        style={{
          transform: `translateY(calc(-${current} * (100vh - 64px)))`,
          transition: "transform 900ms cubic-bezier(0.76, 0, 0.24, 1)",
        }}>

        {/* ════════════════════════════════ SLIDE 1 — HERO ════════════════════════════════ */}
        <div className="h-[calc(100vh-64px)] w-full relative overflow-hidden">
          {/* BG photo */}
          <div className="absolute inset-0">
            <Image src={hs.bg} alt={hs.title} fill className="object-cover transition-opacity duration-700" priority unoptimized />
            <div className={`absolute inset-0 bg-gradient-to-r ${hs.color}`} />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Hero content */}
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
                    Find a Trip <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/trips/new" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold px-8 py-4 rounded-full text-lg transition-all backdrop-blur-sm">
                    Host a Trip
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-6 max-w-sm">
                  {[["🚀", "Just Launched"], ["Free", "To Join"], ["India", "Wide Trips"], ["Open", "Beta"]].map(([v, l]) => (
                    <div key={l}><p className="text-2xl font-extrabold text-white">{v}</p><p className="text-teal-300/80 text-xs mt-0.5">{l}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hero slide thumbnails */}
          <div className="absolute bottom-8 left-6 z-20 flex gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button key={s.id} onClick={() => setHeroSlide(i)}
                className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${i === heroSlide ? "border-white w-20 h-14" : "border-white/30 w-14 h-10 opacity-60 hover:opacity-90"}`}>
                <Image src={s.bg} alt={s.title} fill className="object-cover" unoptimized />
                {i === heroSlide && <div className="absolute inset-0 bg-teal-500/20" />}
              </button>
            ))}
          </div>

          <div className="absolute bottom-8 right-6 z-20 flex flex-col items-center gap-1 text-white/50 animate-bounce cursor-pointer" onClick={() => goTo(1)}>
            <span className="text-xs font-medium">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* ════════════════════════════════ SLIDE 2 — TRIPS ════════════════════════════════ */}
        <div className="h-[calc(100vh-64px)] w-full bg-gray-50 flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full py-4 flex flex-col h-full justify-center">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">02 / Open Trips</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">Find Your Next Adventure</h2>
                <p className="text-gray-500 text-sm mt-0.5">Real group trips you can join today</p>
              </div>
              <Link href="/trips" className="hidden sm:flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {TRIPS.map(trip => (
                <Link href={`/trips/${trip.id}`} key={trip.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-teal-200 transition-all hover:-translate-y-1">
                  <div className="relative h-28 overflow-hidden">
                    <Image src={trip.img} alt={trip.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-xs bg-teal-500 text-white font-semibold px-2 py-0.5 rounded-full">{trip.type}</span>
                    <span className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${trip.difficulty === "Easy" ? "bg-green-500 text-white" : trip.difficulty === "Moderate" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"}`}>{trip.difficulty}</span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1">{trip.title}</h3>
                    <p className="text-gray-400 text-xs flex items-center gap-0.5 mb-0.5"><MapPin className="w-3 h-3" />{trip.destination}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-0.5"><Calendar className="w-3 h-3" />{trip.date}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-teal-700 font-bold text-sm">{trip.budget}</span>
                      <span className="text-gray-400 text-xs flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{trip.rating}</span>
                    </div>
                    <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1">
                      <div className="bg-teal-500 h-1 rounded-full" style={{ width: `${((trip.totalSpots - trip.spots) / trip.totalSpots) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{trip.spots} spots left</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════ SLIDE 3 — EVENTS ════════════════════════════════ */}
        <div className="h-[calc(100vh-64px)] w-full bg-gray-950 flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full py-4 flex flex-col h-full justify-center">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">03 / Events</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">Upcoming Events</h2>
                <p className="text-gray-400 text-sm mt-0.5">Hosted adventures open for registration</p>
              </div>
              <Link href="/events" className="hidden sm:flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors">
                All Events <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {EVENTS.map(event => (
                <div key={event.id} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="relative h-28 overflow-hidden">
                    <Image src={event.img} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {event.badge && (
                      <span className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${event.badge === "Featured" ? "bg-teal-500 text-white" : event.badge === "New" ? "bg-green-500 text-white" : "bg-purple-500 text-white"}`}>{event.badge}</span>
                    )}
                    <span className={`absolute bottom-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${event.price === "Free" ? "bg-green-500 text-white" : "bg-white/20 text-white border border-white/30"}`}>{event.price}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-xs bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded-full">{event.type}</span>
                    <h3 className="font-bold text-white text-xs mt-1.5 leading-snug line-clamp-2">{event.title}</h3>
                    <p className="text-gray-400 text-xs flex items-center gap-0.5 mt-1"><MapPin className="w-3 h-3" />{event.location}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-0.5 mt-0.5"><Calendar className="w-3 h-3" />{event.date}</p>
                    <div className="mt-2 w-full bg-white/10 rounded-full h-1">
                      <div className="bg-teal-500 h-1 rounded-full" style={{ width: `${(event.attendees / event.max) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-500 text-xs">{event.attendees}/{event.max} going</p>
                      <button className="flex items-center gap-0.5 bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors">
                        <Ticket className="w-3 h-3" /> Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════ SLIDE 4 — COMMUNITY ════════════════════════════════ */}
        <div className="h-[calc(100vh-64px)] w-full bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full py-4 flex flex-col h-full justify-center">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">04 / Community</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">Stories from the Road</h2>
                <p className="text-gray-400 text-sm mt-0.5">Blogs, photos and videos by real travelers</p>
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
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white/80 text-xs">
                      <Heart className="w-3 h-3 fill-red-400 text-red-400" /> {post.likes}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 bg-gray-700">
                        <Image src={post.avatar} alt={post.author} fill className="object-cover" unoptimized />
                      </div>
                      <span className="text-gray-400 text-xs">{post.author}</span>
                    </div>
                    <h3 className="font-bold text-white text-xs leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-gray-500 text-xs flex items-center gap-0.5 mt-1"><MapPin className="w-3 h-3" />{post.location}</p>
                    <span className="inline-block mt-1.5 text-xs bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full">#{post.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════ SLIDE 5 — DESTINATIONS ════════════════════════════════ */}
        <div className="h-[calc(100vh-64px)] w-full bg-gradient-to-br from-emerald-950 to-gray-950 flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full py-4 flex flex-col h-full justify-center">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">05 / Destinations</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">Discover India</h2>
                <p className="text-gray-400 text-sm mt-0.5">Find trips, blogs and photos for any destination</p>
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
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded-full">{dest.tag}</span>
                      <span className="text-yellow-400 text-xs flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400" />{dest.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════ SLIDE 6 — ABOUT ════════════════════════════════ */}
        <div className="h-[calc(100vh-64px)] w-full bg-white flex flex-col justify-center overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 w-full py-4 flex flex-col h-full justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-teal-600 text-xs font-bold uppercase tracking-widest">06 / About WanderMate</span>
                <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-6 leading-tight">Built for Travelers Who Hate Canceling Plans</h2>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: <Users className="w-5 h-5 text-teal-600" />, title: "Find Travel Partners", desc: "Match with people who share your travel style, budget, and destination." },
                    { icon: <Shield className="w-5 h-5 text-teal-600" />, title: "Travel Safely", desc: "ID verified profiles, SOS button, and live location sharing for every trip." },
                    { icon: <Camera className="w-5 h-5 text-teal-600" />, title: "Share Your Story", desc: "Write blogs, post photos and videos. Build your traveler profile." },
                    { icon: <Bike className="w-5 h-5 text-teal-600" />, title: "Host Any Adventure", desc: "Bike rides, treks, road trips, food tours — create your event in 3 steps." },
                    { icon: <BookOpen className="w-5 h-5 text-teal-600" />, title: "Discover Destinations", desc: "Search any place and find real trips, blogs, photos and local tips." },
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
                  <Image src={U("photo-1506869640319-fe1a24fd76dc", 800, 400)} alt="Group travel" fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600/80 to-teal-800/60" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                    <div className="text-4xl mb-2">🌍</div>
                    <h3 className="text-xl font-extrabold mb-1">Ready to Explore?</h3>
                    <p className="text-teal-100 text-sm mb-4">Be among the first to join WanderMate — just launched!</p>
                    <div className="flex gap-3">
                      <Link href="/trips" className="bg-white text-teal-700 hover:bg-teal-50 font-bold py-2 px-5 rounded-full transition-colors text-sm">Browse Trips →</Link>
                      <Link href="/trips/new" className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold py-2 px-5 rounded-full transition-colors text-sm">Host a Trip</Link>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[["🏍️", "Bike Rides"], ["🥾", "Trekking"], ["🚗", "Road Trips"], ["⛺", "Camping"], ["📸", "Photo Tours"], ["🍜", "Food Tours"]].map(([e, l]) => (
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

      </div>{/* end slides wrapper */}

      {/* ── Right dot nav ── */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5">
        {SLIDES.map((slide, i) => (
          <button key={slide.id} onClick={() => goTo(i)} title={slide.label} className={`relative group transition-all duration-300 ${i === current ? "scale-125" : ""}`}>
            <div className={`rounded-full transition-all duration-300 ${i === current ? "w-2.5 h-8 bg-teal-400" : "w-2 h-2 bg-gray-400/60 hover:bg-gray-400"}`} />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-white/80 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-0.5 rounded-md">{slide.label}</span>
          </button>
        ))}
      </div>

      {/* ── Up/Down arrows ── */}
      {current > 0 && (
        <button onClick={() => goTo(current - 1)} className="fixed bottom-16 right-5 z-50 w-9 h-9 bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all">
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      {current < SLIDES.length - 1 && (
        <button onClick={() => goTo(current + 1)} className="fixed bottom-5 right-5 z-50 w-9 h-9 bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all">
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* ── Slide counter ── */}
      <div className="fixed bottom-5 left-5 z-50 text-white/40 text-xs font-mono">
        {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
      </div>
    </div>
  );
}
