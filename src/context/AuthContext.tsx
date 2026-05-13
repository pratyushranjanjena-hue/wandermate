"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc, setDoc, getDoc, updateDoc, collection, getDocs, runTransaction,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, city: string, gender?: string, dob?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  followUser: (targetId: string) => Promise<void>;
  unfollowUser: (targetId: string) => Promise<void>;
  getUserById: (id: string) => Promise<User | null>;
  getAllUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AVATARS = ["🧕", "👨", "👩", "🧔", "👱‍♀️", "👨‍🦱", "👩‍🦰", "🧑"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) setUser(snap.data() as User);
        setEmailVerified(firebaseUser.emailVerified);
      } else {
        setUser(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) setUser(snap.data() as User);
      return { success: true };
    } catch (e: any) {
      const msg = e.code === "auth/user-not-found" || e.code === "auth/wrong-password" || e.code === "auth/invalid-credential"
        ? "Incorrect email or password."
        : "Login failed. Please try again.";
      return { success: false, error: msg };
    }
  };

  const signup = async (name: string, email: string, password: string, city: string, gender?: string, dob?: string, phone?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        id: cred.user.uid,
        name,
        email: email.toLowerCase(),
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        city,
        bio: "New to mayBE. Ready to explore! 🌍",
        verified: false,
        travelStyle: "Mid-range",
        budget: "₹5,000–₹15,000",
        tripsJoined: [],
        tripsHosted: [],
        eventsRegistered: [],
        followers: [],
        following: [],
        onboardingDone: false,
        preferences: {
          accommodation: "", pace: "", wakeTime: "", tripStyle: "", budgetRange: "",
          travelTypes: [], skillTags: [],
          gender: (gender as any) || "", ageGroup: "", languages: [],
          diet: "", cuisines: [], movieGenres: [], music: [], dealbreakers: [],
          phone: phone || "", dob: dob || "",
        },
      };
      await setDoc(doc(db, "users", cred.user.uid), newUser);
      await sendEmailVerification(cred.user);
      setUser(newUser);
      setEmailVerified(false);
      return { success: true };
    } catch (e: any) {
      const msg = e.code === "auth/email-already-in-use"
        ? "An account with this email already exists."
        : "Signup failed. Please try again.";
      return { success: false, error: msg };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return { success: false, error: "Not logged in." };
      if (firebaseUser.emailVerified) return { success: false, error: "Email is already verified." };
      await sendEmailVerification(firebaseUser);
      return { success: true };
    } catch {
      return { success: false, error: "Could not send email. Please try again later." };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (e: any) {
      const msg = e.code === "auth/user-not-found"
        ? "No account found with this email."
        : "Failed to send reset email. Please try again.";
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await updateDoc(doc(db, "users", user.id), updates as any);
    setUser(updated);
  };

  const followUser = async (targetId: string) => {
    if (!user) return;
    await runTransaction(db, async (tx) => {
      const myRef     = doc(db, "users", user.id);
      const targetRef = doc(db, "users", targetId);
      const mySnap     = await tx.get(myRef);
      const targetSnap = await tx.get(targetRef);
      if (!mySnap.exists() || !targetSnap.exists()) return;

      const myData     = mySnap.data() as User;
      const targetData = targetSnap.data() as User;

      const newFollowing  = myData.following.includes(targetId) ? myData.following : [...myData.following, targetId];
      const newFollowers  = targetData.followers.includes(user.id) ? targetData.followers : [...targetData.followers, user.id];

      tx.update(myRef,     { following: newFollowing });
      tx.update(targetRef, { followers: newFollowers });
    });
    setUser(u => u ? { ...u, following: u.following.includes(targetId) ? u.following : [...u.following, targetId] } : u);
  };

  const unfollowUser = async (targetId: string) => {
    if (!user) return;
    await runTransaction(db, async (tx) => {
      const myRef     = doc(db, "users", user.id);
      const targetRef = doc(db, "users", targetId);
      const mySnap     = await tx.get(myRef);
      const targetSnap = await tx.get(targetRef);
      if (!mySnap.exists() || !targetSnap.exists()) return;

      const myData     = mySnap.data() as User;
      const targetData = targetSnap.data() as User;

      tx.update(myRef,     { following: myData.following.filter(id => id !== targetId) });
      tx.update(targetRef, { followers: targetData.followers.filter(id => id !== user.id) });
    });
    setUser(u => u ? { ...u, following: u.following.filter(id => id !== targetId) } : u);
  };

  const getUserById = async (id: string): Promise<User | null> => {
    const snap = await getDoc(doc(db, "users", id));
    return snap.exists() ? (snap.data() as User) : null;
  };

  const getAllUsers = async (): Promise<User[]> => {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map(d => d.data() as User);
  };

  return (
    <AuthContext.Provider value={{ user, loading, emailVerified, login, signup, resetPassword, resendVerificationEmail, logout, updateUser, followUser, unfollowUser, getUserById, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
