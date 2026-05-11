"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Trip, Event, Post, Comment } from "@/types";

const SEED_TRIPS: Trip[] = [
  { id: "t1", title: "Coorg Camping Weekend", destination: "Coorg", state: "Karnataka", startDate: "2026-06-07", endDate: "2026-06-09", type: "Camping", image: "⛺", hostId: "seed", hostName: "Rahul M.", rating: 4.9, budget: "₹4,500", difficulty: "Easy", totalSpots: 12, joinedUsers: ["seed"], description: "2 nights of camping under the stars in Coorg's coffee estate. Campfire, bonfire cooking, and morning hikes included. Perfect first camping trip.", whatToBring: "Sleeping bag, warm clothes, torch, raincoat", createdAt: "2026-04-01" },
  { id: "t2", title: "Mumbai Street Food Safari", destination: "Mumbai", state: "Maharashtra", startDate: "2026-05-24", endDate: "2026-05-24", type: "Food Exploring", image: "🍜", hostId: "seed2", hostName: "Priya S.", rating: 4.8, budget: "₹1,200", difficulty: "Easy", totalSpots: 10, joinedUsers: ["seed2", "seed3"], description: "A 6-hour guided food walk through Dharavi, Mohammed Ali Road, and Juhu Beach. Taste 15+ iconic Mumbai street foods from vada pav to seekh kebabs.", whatToBring: "Comfortable shoes, empty stomach, adventurous taste buds!", createdAt: "2026-04-05" },
  { id: "t3", title: "Manali Snow Trek", destination: "Manali", state: "Himachal Pradesh", startDate: "2026-07-01", endDate: "2026-07-07", type: "Trekking", image: "❄️", hostId: "seed3", hostName: "Arjun K.", rating: 4.7, budget: "₹12,000", difficulty: "Hard", totalSpots: 6, joinedUsers: ["seed3", "seed4", "seed5", "seed6"], description: "7-day high altitude trek covering Beas Kund and Rohtang Pass. Previous trekking experience required.", whatToBring: "Trekking poles, thermal wear, sunscreen, altitude sickness pills", createdAt: "2026-04-10" },
  { id: "t4", title: "Goa Beach Sports Meetup", destination: "Goa", state: "Goa", startDate: "2026-06-05", endDate: "2026-06-07", type: "Sports & Games", image: "🏐", hostId: "seed4", hostName: "Sneha R.", rating: 4.6, budget: "₹3,000", difficulty: "Easy", totalSpots: 20, joinedUsers: ["seed4"], description: "Beach volleyball, frisbee, kayaking and surfing at Ashwem Beach. All skill levels welcome — it's about fun, not competition!", whatToBring: "Swimwear, sunscreen, sports shoes", createdAt: "2026-04-12" },
  { id: "t5", title: "Bangalore Cyclists Weekend Ride", destination: "Nandi Hills", state: "Karnataka", startDate: "2026-05-30", endDate: "2026-05-31", type: "Cycling", image: "🚴", hostId: "seed5", hostName: "Vikram T.", rating: 4.8, budget: "₹1,500", difficulty: "Moderate", totalSpots: 15, joinedUsers: ["seed5", "seed6", "seed7", "seed8"], description: "60km sunrise cycling ride from Bangalore to Nandi Hills and back. Group pace — no one left behind. Breakfast at the top!", whatToBring: "Cycle (gear cycle preferred), helmet, water bottle, energy bar", createdAt: "2026-04-15" },
  { id: "t6", title: "Hyderabad Social Photography Walk", destination: "Hyderabad", state: "Telangana", startDate: "2026-06-14", endDate: "2026-06-14", type: "Content Creation", image: "📸", hostId: "seed6", hostName: "Ananya B.", rating: 5.0, budget: "₹500", difficulty: "Easy", totalSpots: 8, joinedUsers: ["seed6", "seed7"], description: "Walk through Charminar, Laad Bazaar, and Irani Chai cafes — shooting Reels, photos, and short travel vlogs as a group. Great for creators and beginners alike.", whatToBring: "Phone/camera, tripod (optional), willingness to be on camera!", createdAt: "2026-04-18" },
  { id: "t7", title: "Ladakh Bike Expedition", destination: "Ladakh", state: "J&K", startDate: "2026-07-10", endDate: "2026-07-20", type: "Bike Ride", image: "🏔️", hostId: "seed7", hostName: "Karan M.", rating: 4.9, budget: "₹18,000", difficulty: "Hard", totalSpots: 8, joinedUsers: ["seed7"], description: "10-day epic bike expedition from Manali to Leh. Khardung La, Pangong Lake, Nubra Valley. All riding experience levels welcome but minimum 2 years riding required.", whatToBring: "Riding gear, warm layers, sleeping bag, first aid kit", createdAt: "2026-04-20" },
  { id: "t8", title: "Rishikesh Yoga & Wellness Retreat", destination: "Rishikesh", state: "Uttarakhand", startDate: "2026-06-20", endDate: "2026-06-23", type: "Yoga & Wellness", image: "🧘", hostId: "seed8", hostName: "Meera P.", rating: 4.8, budget: "₹8,500", difficulty: "Easy", totalSpots: 10, joinedUsers: ["seed8", "seed9"], description: "3-day yoga, meditation, and Ganga aarti retreat at a riverside ashram. Morning sadhana, evening satsang, and optional white-water rafting.", whatToBring: "Yoga mat, comfortable clothes, open mind", createdAt: "2026-04-22" },
];

const SEED_EVENTS: Event[] = [
  { id: "e1", title: "Midnight Camping at Pondicherry Beach", host: "Rohan D.", hostId: "seed", date: "May 25, 2026", location: "Pondicherry", maxAttendees: 20, attendees: ["seed", "seed2", "seed3"], type: "Camping", price: "₹1,800", image: "🏕️", badge: "Featured", description: "Set up tents right on the beach, watch the sunrise over the Bay of Bengal, bonfire and acoustic music at night. Tents, food & morning coffee all included." },
  { id: "e2", title: "Delhi Street Food Photography Walk", host: "Nisha T.", hostId: "seed2", date: "June 1, 2026", location: "Old Delhi", maxAttendees: 12, attendees: ["seed2"], type: "Food Walk", price: "₹800", image: "🍢", badge: "New", description: "3-hour guided walk through Paranthe Wali Gali, Khari Baoli, and Jama Masjid. Eat 10+ dishes and learn to shoot food on your phone like a pro." },
  { id: "e3", title: "Sahyadri Monsoon Trek", host: "Kavya P.", hostId: "seed3", date: "July 5, 2026", location: "Lonavala, Maharashtra", maxAttendees: 40, attendees: ["seed3", "seed4"], type: "Trekking", price: "₹800", image: "🌧️", badge: null, description: "Monsoon trek through the lush green Sahyadri mountains. Waterfall crossing included. Moderate fitness required." },
  { id: "e4", title: "Bangalore Boardgames & Brunch", host: "Preethi K.", hostId: "seed4", date: "May 18, 2026", location: "Koramangala, Bengaluru", maxAttendees: 25, attendees: Array.from({ length: 12 }, (_, i) => `seed${i}`), type: "Social Meetup", price: "Free", image: "🎲", badge: null, description: "Meet new people over board games and good food. Beginners welcome! We play Catan, Codenames, Jenga and more. Great for making new friends in Bangalore." },
  { id: "e5", title: "Mumbai Cyclists Social Ride", host: "Aryan S.", hostId: "seed5", date: "June 7, 2026", location: "Bandra, Mumbai", maxAttendees: 30, attendees: ["seed5", "seed6"], type: "Sports & Games", price: "Free", image: "🚴", badge: null, description: "15km casual cycling route along the coast — Bandra to Worli Sea Link and back. All cycles welcome, helmets mandatory. Post-ride chai included!" },
  { id: "e6", title: "Reels & Travel Content Bootcamp", host: "Divya V.", hostId: "seed6", date: "June 14, 2026", location: "Bengaluru", maxAttendees: 15, attendees: ["seed6", "seed7", "seed8"], type: "Content Creation", price: "₹1,200", image: "🎬", badge: "New", description: "Learn to shoot and edit travel Reels on your phone in one day. Covers storytelling, transitions, audio syncing, and growing on Instagram. Certificate included." },
  { id: "e7", title: "Royal Enfield Riders Meetup – Pune to Mahabaleshwar", host: "Vikram T.", hostId: "seed7", date: "July 20, 2026", location: "Pune, Maharashtra", maxAttendees: 30, attendees: ["seed7"], type: "Bike Ride", price: "₹1,200", image: "🏍️", badge: null, description: "Monthly RE riders meetup. All RE models welcome. Route: Pune → Tamhini Ghat → Mahabaleshwar → Pune. Distance: ~250km." },
  { id: "e8", title: "Rishikesh Yoga & Sound Healing", host: "Meera P.", hostId: "seed8", date: "June 21, 2026", location: "Rishikesh, Uttarakhand", maxAttendees: 15, attendees: ["seed8", "seed9", "seed10"], type: "Yoga & Wellness", price: "₹2,500", image: "🧘", badge: "Premium", description: "Full-day yoga, pranayama, and Tibetan sound healing session by the Ganga. Evening Ganga aarti included. All levels welcome." },
];

const SEED_POSTS: Post[] = [
  { id: "p1", type: "blog", authorId: "seed2", author: "Priya Sharma", avatar: "🧕", location: "Coorg, Karnataka", title: "My First Camping Trip — What I Packed, What I Forgot, and What Changed Me", excerpt: "I was terrified of sleeping outdoors. Then a random WanderMate group convinced me to try camping in Coorg. Here's the honest diary...", content: "", image: "⛺", likes: ["seed", "seed3", "seed4", "seed5"], comments: [], views: 6240, readTime: "6 min read", tags: ["Camping", "First Trip", "Solo"], createdAt: "2026-04-20" },
  { id: "p2", type: "photo", authorId: "seed3", author: "Arjun Kumar", avatar: "👨", location: "Mumbai", title: "Mumbai Street Food at 2am — A Photo Essay", excerpt: "Pav bhaji, kheema pav, sev puri under sodium lights. The city never sleeps and neither did my stomach.", content: "", image: "🍜", likes: ["seed", "seed2"], comments: [], views: 4800, readTime: "2 min", tags: ["Food", "Mumbai", "Photography"], createdAt: "2026-04-22" },
  { id: "p3", type: "blog", authorId: "seed4", author: "Sneha Reddy", avatar: "👩", location: "Bengaluru", title: "How I Made 20 New Friends Playing Board Games in Bangalore", excerpt: "I moved to Bangalore knowing nobody. Joined a WanderMate social meetup on a whim. Two months later, these strangers are my people...", content: "", image: "🎲", likes: ["seed", "seed2", "seed3", "seed5", "seed6"], comments: [], views: 11400, readTime: "5 min read", tags: ["Social", "Community", "Bengaluru"], createdAt: "2026-04-24" },
  { id: "p4", type: "video", authorId: "seed5", author: "Vikram Tiwari", avatar: "🧔", location: "Manali, HP", title: "How We Shot a 3-Minute Travel Reel on Just a Phone — Full BTS", excerpt: "No DSLR, no drone, no ring light. Just an iPhone 14, golden hour, and 6 strangers who became a crew in 2 days.", content: "", image: "🎬", likes: Array.from({ length: 8 }, (_, i) => `seed${i}`), comments: [], views: 28000, readTime: "8 min video", tags: ["Content Creation", "Reels", "Travel"], createdAt: "2026-04-25" },
  { id: "p5", type: "blog", authorId: "seed6", author: "Ananya Bose", avatar: "👱‍♀️", location: "Rishikesh, Uttarakhand", title: "I Did a 3-Day Yoga Retreat as a Skeptic — Here's What Happened", excerpt: "I went in thinking it was just stretching. I came out understanding what everyone meant by 'vibes'. An honest account...", content: "", image: "🧘", likes: ["seed", "seed2", "seed3"], comments: [], views: 8700, readTime: "6 min read", tags: ["Yoga & Wellness", "Rishikesh", "Wellness"], createdAt: "2026-04-26" },
  { id: "p6", type: "photo", authorId: "seed", author: "Rahul Mehta", avatar: "👨‍🦱", location: "Goa", title: "Beach Volleyball with Strangers — The Unplanned Afternoon That Made the Trip", excerpt: "We were going to just sit on the beach. Then someone pulled out a net. 3 hours later, we had played 5 sets and exchanged numbers.", content: "", image: "🏐", likes: ["seed2", "seed3", "seed4", "seed5"], comments: [], views: 9100, readTime: "1 min", tags: ["Sports & Games", "Goa", "Social Activity"], createdAt: "2026-04-28" },
  { id: "p7", type: "blog", authorId: "seed7", author: "Karan Mehta", avatar: "👦", location: "Nandi Hills, Karnataka", title: "60km in 4 Hours: What a Sunrise Cycling Ride Teaches You About Yourself", excerpt: "I hadn't cycled since school. Joined a group ride on a dare. Halfway up, legs screaming, I understood what people meant by 'the wall'...", content: "", image: "🚴", likes: ["seed", "seed3"], comments: [], views: 5200, readTime: "4 min read", tags: ["Cycling", "Sports & Games", "Karnataka"], createdAt: "2026-04-30" },
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
  deletePost: (postId: string) => void;
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

  const deletePost = (postId: string) => savePosts(posts.filter(p => p.id !== postId));

  const addComment = (postId: string, comment: Comment) => {
    savePosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
  };

  return (
    <DataContext.Provider value={{ trips, events, posts, addTrip, joinTrip, leaveTrip, registerEvent, unregisterEvent, likePost, addPost, deletePost, addComment }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
