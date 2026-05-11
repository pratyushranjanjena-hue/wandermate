"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowRight, MapPin, ChevronDown, ChevronUp, Users, Shield, Camera, Bike, BookOpen } from "lucide-react";

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

const SLIDES = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
];

const H = "calc(100vh - 64px)";

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [heroSlide, setHeroSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setHeroSlide(h => (h + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

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

      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ overflowY: "scroll", scrollSnapType: "y mandatory" }}
      >

        {/* ════ SLIDE 1 — HERO ════ */}
        <div
          ref={el => { slideRefs.current[0] = el; }}
          className="w-full relative overflow-hidden flex"
          style={{ height: H, scrollSnapAlign: "start" }}
        >
          {/* LEFT — dark manifesto */}
          <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-10"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d3d38 100%)" }}>
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

            <div className="relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> India&apos;s Activity Community
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
                <span className="text-white">Your friends said </span>
                <span className="text-red-400 line-through opacity-70">&ldquo;maybe&rdquo;</span>
                <span className="text-white">.<br />We said </span>
                <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">&ldquo;let&apos;s go.&rdquo;</span>
              </h1>

              <p className="text-gray-300 text-base leading-relaxed mb-6">
                WanderMate connects real people across India who want to <strong className="text-white">camp, trek, eat, play, create &amp; explore</strong> — with others who actually show up.
              </p>

              <div className="flex flex-col gap-2.5 mb-7">
                {[
                  { icon: "🔍", bold: "Find activities near you", desc: "Camping, treks, food walks, sports & more — filter by city, budget & age group." },
                  { icon: "🤝", bold: "Meet people, not strangers", desc: "See who's joining before you say yes. Real profiles, real people." },
                  { icon: "✍️", bold: "Share your experience", desc: "Post blogs, photos & videos. Build your explorer profile." },
                ].map(({ icon, bold, desc }) => (
                  <div key={bold} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                    <span className="text-lg shrink-0 mt-0.5">{icon}</span>
                    <p className="text-sm text-white/80 leading-snug">
                      <span className="font-bold text-white">{bold} — </span>{desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/trips" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all shadow-lg shadow-teal-500/30 hover:scale-105">
                  Explore Activities <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/trips/new" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all">
                  Host an Activity
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT — rotating photo with caption */}
          <div className="hidden lg:block relative w-1/2 overflow-hidden">
            <Image src={hs.bg} alt={hs.title} fill className="object-cover transition-all duration-700" priority unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{hs.tag}</span>
                <span className="text-white/70 text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />{hs.location}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-white leading-tight mb-1 drop-shadow-lg">{hs.title}</h2>
              <p className="text-white/70 text-sm mb-4">{hs.subtitle}</p>
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-xs">{hs.meta}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="bg-green-400/20 text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-400/30">{hs.spots}</span>
              </div>
            </div>

            <div className="absolute bottom-8 right-6 z-20 flex gap-2">
              {HERO_SLIDES.map((s, i) => (
                <button key={s.id} onClick={() => setHeroSlide(i)}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${i === heroSlide ? "border-white w-16 h-11" : "border-white/30 w-11 h-8 opacity-60 hover:opacity-90"}`}>
                  <Image src={s.bg} alt={s.title} fill className="object-cover" unoptimized />
                  {i === heroSlide && <div className="absolute inset-0 bg-teal-500/20" />}
                </button>
              ))}
            </div>
          </div>

          <button className="lg:hidden absolute bottom-6 right-6 z-20 flex flex-col items-center gap-1 text-white/50 animate-bounce" onClick={() => scrollToSlide(1)}>
            <span className="text-xs font-medium">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1 text-white/40 animate-bounce" onClick={() => scrollToSlide(1)}>
            <span className="text-xs font-medium">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* ════ SLIDE 2 — ABOUT ════ */}
        <div
          ref={el => { slideRefs.current[1] = el; }}
          className="w-full relative overflow-hidden flex flex-col justify-center"
          style={{ height: H, scrollSnapAlign: "start", background: "linear-gradient(135deg, #0f172a 0%, #0d3d38 50%, #0f172a 100%)" }}
        >
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div className="relative z-10 max-w-6xl mx-auto px-6 w-full flex flex-col h-full justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              <div>
                <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> About WanderMate
                </div>

                <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
                  <span className="text-white">Built for people who<br />want to </span>
                  <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">do more together.</span>
                </h2>

                <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-md">
                  WanderMate is India&apos;s community for real experiences — not just travel. Whether it&apos;s a camping trip, a food walk, a sports meetup, or a content collab — find your people and just go.
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {[["⛺","Camping"],["🥾","Trekking"],["🍜","Food Walks"],["🏐","Sports"],["🎬","Content"],["🧘","Wellness"],["🚴","Cycling"],["🤝","Social"]].map(([emoji, label]) => (
                    <span key={label} className="flex items-center gap-1.5 bg-white/8 border border-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                      {emoji} {label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/trips" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all hover:scale-105 shadow-lg shadow-teal-500/25">
                    Find an Activity <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/trips/new" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all">
                    Host One Yourself
                  </Link>
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-2 gap-3">
                {[
                  { icon: <Users className="w-5 h-5" />, title: "Find Your People", desc: "Match with others by gender, age, budget & city.", color: "from-teal-500/20 to-teal-600/10 border-teal-500/20", text: "text-teal-400" },
                  { icon: <ArrowRight className="w-5 h-5" />, title: "Host in 3 Steps", desc: "Create, set preferences, publish. Done.", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20", text: "text-emerald-400" },
                  { icon: <Camera className="w-5 h-5" />, title: "Share Stories", desc: "Blogs, photos, videos. Build your explorer profile.", color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/20", text: "text-indigo-400" },
                  { icon: <Shield className="w-5 h-5" />, title: "Safe & Trusted", desc: "Verified profiles and transparent hosting.", color: "from-rose-500/20 to-rose-600/10 border-rose-500/20", text: "text-rose-400" },
                  { icon: <Bike className="w-5 h-5" />, title: "All of India", desc: "Every state, every city. Ladakh to Kanyakumari.", color: "from-amber-500/20 to-amber-600/10 border-amber-500/20", text: "text-amber-400" },
                  { icon: <BookOpen className="w-5 h-5" />, title: "Free to Join", desc: "No subscription, no paywall. Just show up.", color: "from-purple-500/20 to-purple-600/10 border-purple-500/20", text: "text-purple-400" },
                ].map(card => (
                  <div key={card.title} className={`bg-gradient-to-br ${card.color} border rounded-2xl p-4 backdrop-blur-sm`}>
                    <div className={`mb-2 ${card.text}`}>{card.icon}</div>
                    <p className="font-bold text-white text-sm mb-1">{card.title}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>{/* end scroll container */}

      {/* dot nav */}
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
