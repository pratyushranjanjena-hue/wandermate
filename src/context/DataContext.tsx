"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, arrayUnion, arrayRemove, runTransaction, query, orderBy,
  getDocs, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trip, Event, Post, Comment, JoinRequest, ChatMessage, HistoryItem } from "@/types";

interface DataContextType {
  trips: Trip[];
  events: Event[];
  posts: Post[];
  history: HistoryItem[];
  getUserHistory: (userId: string) => HistoryItem[];
  addTrip: (trip: Trip) => Promise<void>;
  addEvent: (event: Event) => Promise<void>;
  joinTrip: (tripId: string, userId: string) => Promise<void>;
  leaveTrip: (tripId: string, userId: string) => Promise<void>;
  registerEvent: (eventId: string, userId: string) => Promise<void>;
  unregisterEvent: (eventId: string, userId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  addPost: (post: Post) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, comment: Comment) => Promise<void>;
  requestToJoinTrip: (tripId: string, request: JoinRequest) => Promise<void>;
  approveJoinTrip: (tripId: string, userId: string) => Promise<void>;
  rejectJoinTrip: (tripId: string, userId: string) => Promise<void>;
  removeFromTrip: (tripId: string, userId: string) => Promise<void>;
  sendTripMessage: (tripId: string, message: ChatMessage) => Promise<void>;
  requestToJoinEvent: (eventId: string, request: JoinRequest) => Promise<void>;
  approveJoinEvent: (eventId: string, userId: string) => Promise<void>;
  rejectJoinEvent: (eventId: string, userId: string) => Promise<void>;
  removeFromEvent: (eventId: string, userId: string) => Promise<void>;
  sendEventMessage: (eventId: string, message: ChatMessage) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [trips,   setTrips]   = useState<Trip[]>([]);
  const [events,  setEvents]  = useState<Event[]>([]);
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Real-time listeners — data syncs across all users automatically
  useEffect(() => {
    const unsubTrips = onSnapshot(
      query(collection(db, "trips"), orderBy("createdAt", "desc")),
      snap => setTrips(snap.docs.map(d => d.data() as Trip))
    );
    const unsubEvents = onSnapshot(
      query(collection(db, "events"), orderBy("date", "desc")),
      snap => setEvents(snap.docs.map(d => d.data() as Event))
    );
    const unsubPosts = onSnapshot(
      query(collection(db, "posts"), orderBy("createdAt", "desc")),
      snap => setPosts(snap.docs.map(d => d.data() as Post))
    );
    const unsubHistory = onSnapshot(
      query(collection(db, "history"), orderBy("archivedAt", "desc")),
      snap => setHistory(snap.docs.map(d => d.data() as HistoryItem))
    );
    return () => { unsubTrips(); unsubEvents(); unsubPosts(); unsubHistory(); };
  }, []);

  // Auto-archive ended trips/events and delete those older than 30 days
  useEffect(() => {
    if (!trips.length && !events.length) return;
    archiveAndCleanup(trips, events);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips.length, events.length]);

  async function archiveAndCleanup(currentTrips: Trip[], currentEvents: Event[]) {
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const batch = writeBatch(db);
    let changed = false;

    for (const trip of currentTrips) {
      if (!trip.endDate) continue;
      const endMs = new Date(trip.endDate).getTime();
      if (endMs >= now) continue;

      // Archive for every participant
      const participants = [...new Set([trip.hostId, ...trip.joinedUsers])];
      for (const uid of participants) {
        const histId = `hist_trip_${trip.id}_${uid}`;
        const existing = history.find(h => h.id === histId);
        if (!existing) {
          const item: HistoryItem = {
            id: histId,
            entityId: trip.id,
            entityType: "trip",
            title: trip.title,
            location: `${trip.destination}, ${trip.state}`,
            date: trip.startDate,
            endDate: trip.endDate,
            role: uid === trip.hostId ? "host" : "member",
            photoUrl: trip.photoUrl,
            image: trip.image || "🗺️",
            archivedAt: new Date().toISOString(),
          };
          batch.set(doc(db, "history", histId), item);
          changed = true;
        }
      }

      // Delete trip if 30+ days past end date
      if (now - endMs > THIRTY_DAYS) {
        batch.delete(doc(db, "trips", trip.id));
        changed = true;
      }
    }

    for (const event of currentEvents) {
      if (!event.date) continue;
      const endMs = new Date(event.date).getTime();
      if (endMs >= now) continue;

      const participants = [...new Set([event.hostId, ...event.attendees])];
      for (const uid of participants) {
        const histId = `hist_event_${event.id}_${uid}`;
        const existing = history.find(h => h.id === histId);
        if (!existing) {
          const item: HistoryItem = {
            id: histId,
            entityId: event.id,
            entityType: "event",
            title: event.title,
            location: event.location,
            date: event.date,
            endDate: event.date,
            role: uid === event.hostId ? "host" : "member",
            photoUrl: event.photoUrl,
            image: event.image || "📅",
            archivedAt: new Date().toISOString(),
          };
          batch.set(doc(db, "history", histId), item);
          changed = true;
        }
      }

      // Delete event if 30+ days past date
      if (now - endMs > THIRTY_DAYS) {
        batch.delete(doc(db, "events", event.id));
        changed = true;
      }
    }

    if (changed) await batch.commit();
  }

  const getUserHistory = (userId: string) =>
    history.filter(h => h.id.endsWith(`_${userId}`));

  // ── Trips ─────────────────────────────────────────────────────────────────
  const addTrip = async (trip: Trip) => {
    await setDoc(doc(db, "trips", trip.id), trip);
  };

  const joinTrip = async (tripId: string, userId: string) => {
    await updateDoc(doc(db, "trips", tripId), { joinedUsers: arrayUnion(userId) });
  };

  const leaveTrip = async (tripId: string, userId: string) => {
    await updateDoc(doc(db, "trips", tripId), { joinedUsers: arrayRemove(userId) });
  };

  // ── Events ────────────────────────────────────────────────────────────────
  const addEvent = async (event: Event) => {
    await setDoc(doc(db, "events", event.id), event);
  };

  const registerEvent = async (eventId: string, userId: string) => {
    await updateDoc(doc(db, "events", eventId), { attendees: arrayUnion(userId) });
  };

  const unregisterEvent = async (eventId: string, userId: string) => {
    await updateDoc(doc(db, "events", eventId), { attendees: arrayRemove(userId) });
  };

  // ── Posts ─────────────────────────────────────────────────────────────────
  const addPost = async (post: Post) => {
    await setDoc(doc(db, "posts", post.id), post);
  };

  const deletePost = async (postId: string) => {
    await deleteDoc(doc(db, "posts", postId));
  };

  const likePost = async (postId: string, userId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const liked = post.likes.includes(userId);
    await updateDoc(doc(db, "posts", postId), {
      likes: liked ? arrayRemove(userId) : arrayUnion(userId),
    });
  };

  const addComment = async (postId: string, comment: Comment) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    await updateDoc(doc(db, "posts", postId), {
      comments: [...post.comments, comment],
    });
  };

  // ── Trip join request system ───────────────────────────────────────────────
  const requestToJoinTrip = async (tripId: string, request: JoinRequest) => {
    await runTransaction(db, async (tx) => {
      const ref  = doc(db, "trips", tripId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const trip = snap.data() as Trip;
      const existing = (trip.pendingRequests ?? []).find(r => r.userId === request.userId);
      if (existing) return;
      tx.update(ref, { pendingRequests: [...(trip.pendingRequests ?? []), request] });
    });
  };

  const approveJoinTrip = async (tripId: string, userId: string) => {
    await runTransaction(db, async (tx) => {
      const ref  = doc(db, "trips", tripId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const trip = snap.data() as Trip;
      const joinedUsers     = trip.joinedUsers.includes(userId) ? trip.joinedUsers : [...trip.joinedUsers, userId];
      const pendingRequests = (trip.pendingRequests ?? []).map(r =>
        r.userId === userId ? { ...r, status: "approved" as const } : r);
      tx.update(ref, { joinedUsers, pendingRequests });
    });
  };

  const rejectJoinTrip = async (tripId: string, userId: string) => {
    await runTransaction(db, async (tx) => {
      const ref  = doc(db, "trips", tripId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const trip = snap.data() as Trip;
      const pendingRequests = (trip.pendingRequests ?? []).map(r =>
        r.userId === userId ? { ...r, status: "rejected" as const } : r);
      tx.update(ref, { pendingRequests });
    });
  };

  const removeFromTrip = async (tripId: string, userId: string) => {
    await runTransaction(db, async (tx) => {
      const ref  = doc(db, "trips", tripId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const trip = snap.data() as Trip;
      tx.update(ref, {
        joinedUsers:     trip.joinedUsers.filter(u => u !== userId),
        pendingRequests: (trip.pendingRequests ?? []).filter(r => r.userId !== userId),
      });
    });
  };

  const sendTripMessage = async (tripId: string, message: ChatMessage) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    await updateDoc(doc(db, "trips", tripId), {
      chatMessages: [...(trip.chatMessages ?? []), message],
    });
  };

  // ── Event join request system ─────────────────────────────────────────────
  const requestToJoinEvent = async (eventId: string, request: JoinRequest) => {
    await runTransaction(db, async (tx) => {
      const ref  = doc(db, "events", eventId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const event = snap.data() as Event;
      const existing = (event.pendingRequests ?? []).find(r => r.userId === request.userId);
      if (existing) return;
      tx.update(ref, { pendingRequests: [...(event.pendingRequests ?? []), request] });
    });
  };

  const approveJoinEvent = async (eventId: string, userId: string) => {
    await runTransaction(db, async (tx) => {
      const ref  = doc(db, "events", eventId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const event = snap.data() as Event;
      const attendees       = event.attendees.includes(userId) ? event.attendees : [...event.attendees, userId];
      const pendingRequests = (event.pendingRequests ?? []).map(r =>
        r.userId === userId ? { ...r, status: "approved" as const } : r);
      tx.update(ref, { attendees, pendingRequests });
    });
  };

  const rejectJoinEvent = async (eventId: string, userId: string) => {
    await runTransaction(db, async (tx) => {
      const ref  = doc(db, "events", eventId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const event = snap.data() as Event;
      const pendingRequests = (event.pendingRequests ?? []).map(r =>
        r.userId === userId ? { ...r, status: "rejected" as const } : r);
      tx.update(ref, { pendingRequests });
    });
  };

  const removeFromEvent = async (eventId: string, userId: string) => {
    await runTransaction(db, async (tx) => {
      const ref  = doc(db, "events", eventId);
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const event = snap.data() as Event;
      tx.update(ref, {
        attendees:       event.attendees.filter(u => u !== userId),
        pendingRequests: (event.pendingRequests ?? []).filter(r => r.userId !== userId),
      });
    });
  };

  const sendEventMessage = async (eventId: string, message: ChatMessage) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    await updateDoc(doc(db, "events", eventId), {
      chatMessages: [...(event.chatMessages ?? []), message],
    });
  };

  return (
    <DataContext.Provider value={{
      trips, events, posts, history, getUserHistory,
      addTrip, addEvent,
      joinTrip, leaveTrip,
      registerEvent, unregisterEvent,
      likePost, addPost, deletePost, addComment,
      requestToJoinTrip, approveJoinTrip, rejectJoinTrip, removeFromTrip, sendTripMessage,
      requestToJoinEvent, approveJoinEvent, rejectJoinEvent, removeFromEvent, sendEventMessage,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
