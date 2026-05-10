"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Trip, Event, Post, Comment } from "@/types";

const SEED_TRIPS: Trip[] = [
  { id: "t1", title: "Ladakh Bike Expedition", destination: "Ladakh", state: "J&K", startDate: "2026-06-15", endDate: "2026-06-25", type: "Bike Ride", image: "🏔️", hostId: "seed", hostName: "Rahul M.", rating: 4.9, budget: "₹18,000", difficulty: "Moderate", totalSpots: 8, joinedUsers: ["seed"], description: "An epic 10-day bike expedition through the highest motorable roads in the world. We ride from Manali to Leh and beyond, covering Khardung La, Pangong Lake, and Nubra Valley.", whatToBring: "Riding gear, warm layers, sleeping bag, first aid kit", createdAt: "2026-04-01" },
  { id: "t2", title: "Coorg Weekend Retreat", destination: "Coorg", state: "Karnataka", startDate: "2026-05-24", endDate: "2026-05-26", type: "Nature", image: "🌿", hostId: "seed2", hostName: "Priya S.", rating: 4.8, budget: "₹6,500", difficulty: "Easy", totalSpots: 10, joinedUsers: ["seed2", "seed3"], description: "A rejuvenating 3-day retreat to the coffee hills of Coorg. We'll visit Abbey Falls, Raja's Seat, and do a coffee estate tour.", whatToBring: "Light clothes, rain jacket, trekking shoes", createdAt: "2026-04-05" },
  { id: "t3", title: "Manali Snow Trek", destination: "Manali", state: "Himachal Pradesh", startDate: "2026-07-01", endDate: "2026-07-07", type: "Trek", image: "❄️", hostId: "seed3", hostName: "Arjun K.", rating: 4.7, budget: "₹12,000", difficulty: "Hard", totalSpots: 6, joinedUsers: ["seed3", "seed4", "seed5", "seed6"], description: "7-day high altitude trek covering Beas Kund and Rohtang Pass. Previous trekking experience required.", whatToBring: "Trekking poles, thermal wear, sunscreen, altitude sickness pills", createdAt: "2026-04-10" },
  { id: "t4", title: "Goa Backpacker Meetup", destination: "Goa", state: "Goa", startDate: "2026-06-05", endDate: "2026-06-09", type: "Backpacking", image: "🏖️", hostId: "seed4", hostName: "Sneha R.", rating: 4.6, budget: "₹8,000", difficulty: "Easy", totalSpots: 15, joinedUsers: ["seed4"], description: "5 days in Goa exploring hidden beaches, local shacks, and night markets. Perfect for solo travelers looking for a group!", whatToBring: "Light clothes, sunscreen, good sandals", createdAt: "2026-04-12" },
  { id: "t5", title: "Hampi Heritage Walk", destination: "Hampi", state: "Karnataka", startDate: "2026-05-30", endDate: "2026-06-01", type: "Heritage", image: "🏛️", hostId: "seed5", hostName: "Vikram T.", rating: 4.8, budget: "₹5,000", difficulty: "Easy", totalSpots: 12, joinedUsers: ["seed5", "seed6", "seed7", "seed8", "seed9", "seed10", "seed11", "seed12"], description: "A guided 3-day walk through the UNESCO heritage site of Hampi. We'll cover Virupaksha Temple, Vittala Temple complex, and watch the sunset from Hemakuta Hill.", whatToBring: "Comfortable walking shoes, hat, water bottle, camera", createdAt: "2026-04-15" },
  { id: "t6", title: "Spiti Valley Road Trip", destination: "Spiti Valley", state: "Himachal Pradesh", startDate: "2026-07-10", endDate: "2026-07-20", type: "Road Trip", image: "🌄", hostId: "seed6", hostName: "Ananya B.", rating: 5.0, budget: "₹22,000", difficulty: "Hard", totalSpots: 4, joinedUsers: ["seed6", "seed7", "seed8", "seed9"], description: "The most remote road trip in India. 10 days through Spiti Valley in a 4x4. Very limited spots — serious travelers only.", whatToBring: "Warm clothes, emergency kit, offline maps downloaded", createdAt: "2026-04-18" },
];

const SEED_EVENTS: Event[] = [
  { id: "e1", title: "Royal Enfield Riders Meetup – Pune to Mahabaleshwar", host: "Rohan D.", hostId: "seed", date: "May 18, 2026", location: "Pune, Maharashtra", maxAttendees: 30, attendees: ["seed", "seed2", "seed3"], type: "Bike Ride", price: "₹1,200", image: "🏍️", badge: "Featured", description: "Monthly RE riders meetup. All RE models welcome. Route: Pune → Tamhini Ghat → Mahabaleshwar → Pune. Distance: ~250km." },
  { id: "e2", title: "Backpackers Hostel Crawl – Goa", host: "Nisha T.", hostId: "seed2", date: "June 7–8, 2026", location: "Panaji, Goa", maxAttendees: 25, attendees: ["seed2"], type: "Backpacking", price: "Free", image: "🎒", badge: null, description: "Visit 5 of the best hostels in North Goa in one night. Great way to meet fellow travelers and find your kind of crowd." },
  { id: "e3", title: "Weekend Photography Walk – Hampi Ruins", host: "Aditya V.", hostId: "seed3", date: "June 14–15, 2026", location: "Hampi, Karnataka", maxAttendees: 15, attendees: ["seed3", "seed4"], type: "Photography", price: "₹500", image: "📸", badge: "New", description: "Guided photography walk at golden hour. Professional photographer leading the group. All skill levels welcome." },
  { id: "e4", title: "Sahyadri Monsoon Trek", host: "Kavya P.", hostId: "seed4", date: "July 5, 2026", location: "Lonavala, Maharashtra", maxAttendees: 40, attendees: Array.from({ length: 32 }, (_, i) => `seed${i}`), type: "Trek", price: "₹800", image: "🌧️", badge: null, description: "Monsoon trek through the lush green Sahyadri mountains. Waterfall crossing included. Moderate fitness required." },
  { id: "e5", title: "Rajasthan Heritage Road Trip", host: "Suresh K.", hostId: "seed5", date: "Oct 10–20, 2026", location: "Jaipur → Jodhpur → Jaisalmer", maxAttendees: 8, attendees: ["seed5", "seed6"], type: "Road Trip", price: "₹25,000", image: "🏜️", badge: "Premium", description: "10-day premium road trip through royal Rajasthan. Includes heritage hotel stays, camel safari, and folk music evening." },
  { id: "e6", title: "Spiti Valley Bike Tour 2026", host: "Vikram T.", hostId: "seed6", date: "Aug 1–14, 2026", location: "Manali → Kaza → Manali", maxAttendees: 10, attendees: ["seed6", "seed7", "seed8"], type: "Bike Ride", price: "₹20,000", image: "⛰️", badge: null, description: "14-day high altitude bike tour of Spiti Valley. Route: Manali → Rohtang → Kaza → Chandratal → Manali. 650km total." },
];

const SEED_POSTS: Post[] = [
  { id: "p1", type: "blog", authorId: "seed2", author: "Priya Sharma", avatar: "🧕", location: "Ladakh, J&K", title: "10 Days in Ladakh on a Budget of ₹15,000 — Is It Actually Possible?", excerpt: "Everyone told me Ladakh would drain my wallet. Here's exactly how I did it cheaper than a weekend in Goa...", content: "Full blog content here...", image: "🏔️", likes: ["seed", "seed3", "seed4", "seed5"], comments: [], views: 8420, readTime: "6 min read", tags: ["Budget Travel", "Ladakh", "Solo"], createdAt: "2026-04-20" },
  { id: "p2", type: "photo", authorId: "seed3", author: "Arjun Kumar", avatar: "👨", location: "Coorg, Karnataka", title: "Golden Hour at Raja's Seat", excerpt: "Shot this on day 2 of our WanderMate group trip. The whole group was there — strangers became friends in 48 hours.", content: "", image: "🌅", likes: ["seed", "seed2"], comments: [], views: 5200, readTime: "2 min", tags: ["Photography", "Coorg", "Sunset"], createdAt: "2026-04-22" },
  { id: "p3", type: "blog", authorId: "seed4", author: "Sneha Reddy", avatar: "👩", location: "Hampi, Karnataka", title: "First Solo Trip at 26 — What I Wish Someone Had Told Me", excerpt: "I almost cancelled because no one wanted to come. Then I found WanderMate, joined a group of 8 strangers, and it changed how I travel forever...", content: "Full blog content here...", image: "🏛️", likes: ["seed", "seed2", "seed3", "seed5", "seed6"], comments: [], views: 14200, readTime: "8 min read", tags: ["Solo Travel", "First Trip", "Community"], createdAt: "2026-04-24" },
  { id: "p4", type: "video", authorId: "seed5", author: "Vikram Tiwari", avatar: "🧔", location: "Spiti Valley, HP", title: "Riding Through Spiti at 4,500m — Our Royal Enfield Group Ride", excerpt: "Full ride recap from Manali to Kaza. 14 days, 8 bikes, zero breakdowns (almost). Here's everything you need to plan this.", content: "", image: "🏍️", likes: Array.from({ length: 8 }, (_, i) => `seed${i}`), comments: [], views: 31000, readTime: "12 min video", tags: ["Bike Ride", "Spiti", "Royal Enfield"], createdAt: "2026-04-25" },
  { id: "p5", type: "blog", authorId: "seed6", author: "Ananya Bose", avatar: "👱‍♀️", location: "Goa", title: "The Ultimate Goa Hostel Guide for First-Timers", excerpt: "Hostels sorted by vibe, budget, and location. I've stayed in 12 of them. Here's the honest review no blogger will give you...", content: "Full blog content here...", image: "🏖️", likes: ["seed", "seed2", "seed3"], comments: [], views: 9800, readTime: "5 min read", tags: ["Goa", "Budget", "Hostels"], createdAt: "2026-04-26" },
  { id: "p6", type: "photo", authorId: "seed", author: "Rahul Mehta", avatar: "👨‍🦱", location: "Manali, HP", title: "Sunrise from Rohtang Pass — Worth the 4am Wakeup", excerpt: "Woke up the entire group at 3:45am for this. Half of them were mad. Nobody was mad at the top.", content: "", image: "❄️", likes: ["seed2", "seed3", "seed4", "seed5"], comments: [], views: 11200, readTime: "1 min", tags: ["Manali", "Sunrise", "Mountains"], createdAt: "2026-04-28" },
];

interface DataContextType {
  trips: Trip[];
  events: Event[];
  posts: Post[];
  addTrip: (trip: Trip) => void;
  joinTrip: (tripId: string, userId: string) => void;
  leaveTrip: (tripId: string, userId: string) => void;
  registerEvent: (eventId: string, userId: string) => void;
  unregisterEvent: (eventId: string, userId: string) => void;
  likePost: (postId: string, userId: string) => void;
  addPost: (post: Post) => void;
  addComment: (postId: string, comment: Comment) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const t = localStorage.getItem("wm_trips");
    const e = localStorage.getItem("wm_events");
    const p = localStorage.getItem("wm_posts");
    setTrips(t ? JSON.parse(t) : SEED_TRIPS);
    setEvents(e ? JSON.parse(e) : SEED_EVENTS);
    setPosts(p ? JSON.parse(p) : SEED_POSTS);
  }, []);

  const saveTrips = (data: Trip[]) => { setTrips(data); localStorage.setItem("wm_trips", JSON.stringify(data)); };
  const saveEvents = (data: Event[]) => { setEvents(data); localStorage.setItem("wm_events", JSON.stringify(data)); };
  const savePosts = (data: Post[]) => { setPosts(data); localStorage.setItem("wm_posts", JSON.stringify(data)); };

  const addTrip = (trip: Trip) => saveTrips([trip, ...trips]);

  const joinTrip = (tripId: string, userId: string) => {
    saveTrips(trips.map(t => t.id === tripId && !t.joinedUsers.includes(userId)
      ? { ...t, joinedUsers: [...t.joinedUsers, userId] } : t));
  };

  const leaveTrip = (tripId: string, userId: string) => {
    saveTrips(trips.map(t => t.id === tripId
      ? { ...t, joinedUsers: t.joinedUsers.filter(u => u !== userId) } : t));
  };

  const registerEvent = (eventId: string, userId: string) => {
    saveEvents(events.map(e => e.id === eventId && !e.attendees.includes(userId)
      ? { ...e, attendees: [...e.attendees, userId] } : e));
  };

  const unregisterEvent = (eventId: string, userId: string) => {
    saveEvents(events.map(e => e.id === eventId
      ? { ...e, attendees: e.attendees.filter(u => u !== userId) } : e));
  };

  const likePost = (postId: string, userId: string) => {
    savePosts(posts.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(userId);
      return { ...p, likes: liked ? p.likes.filter(u => u !== userId) : [...p.likes, userId] };
    }));
  };

  const addPost = (post: Post) => savePosts([post, ...posts]);

  const addComment = (postId: string, comment: Comment) => {
    savePosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
  };

  return (
    <DataContext.Provider value={{ trips, events, posts, addTrip, joinTrip, leaveTrip, registerEvent, unregisterEvent, likePost, addPost, addComment }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
