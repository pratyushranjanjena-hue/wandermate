"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Trip, Event, Post, Comment } from "@/types";

interface DataContextType {
  trips: Trip[];
  events: Event[];
  posts: Post[];
  addTrip: (trip: Trip) => void;
  addEvent: (event: Event) => void;
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
    setTrips(t ? JSON.parse(t) : []);
    setEvents(e ? JSON.parse(e) : []);
    setPosts(p ? JSON.parse(p) : []);
  }, []);

  const saveTrips  = (data: Trip[])  => { setTrips(data);  localStorage.setItem("wm_trips",  JSON.stringify(data)); };
  const saveEvents = (data: Event[]) => { setEvents(data); localStorage.setItem("wm_events", JSON.stringify(data)); };
  const savePosts  = (data: Post[])  => { setPosts(data);  localStorage.setItem("wm_posts",  JSON.stringify(data)); };

  const addTrip  = (trip: Trip)   => saveTrips([trip, ...trips]);
  const addEvent = (event: Event) => saveEvents([event, ...events]);

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

  const addPost    = (post: Post)     => savePosts([post, ...posts]);
  const deletePost = (postId: string) => savePosts(posts.filter(p => p.id !== postId));

  const addComment = (postId: string, comment: Comment) => {
    savePosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
  };

  return (
    <DataContext.Provider value={{ trips, events, posts, addTrip, addEvent, joinTrip, leaveTrip, registerEvent, unregisterEvent, likePost, addPost, deletePost, addComment }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
