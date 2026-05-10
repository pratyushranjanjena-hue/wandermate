"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, city: string, gender?: string, dob?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  followUser: (targetId: string) => void;
  unfollowUser: (targetId: string) => void;
  getUserById: (id: string) => User | null;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | null>(null);

const AVATARS = ["🧕", "👨", "👩", "🧔", "👱‍♀️", "👨‍🦱", "👩‍🦰", "🧑"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("wm_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const getUsers = (): Record<string, { password: string; user: User }> => {
    const stored = localStorage.getItem("wm_users");
    return stored ? JSON.parse(stored) : {};
  };

  const saveUsers = (users: Record<string, { password: string; user: User }>) => {
    localStorage.setItem("wm_users", JSON.stringify(users));
  };

  const getAllUsers = (): User[] => {
    const users = getUsers();
    return Object.values(users).map(r => r.user);
  };

  const getUserById = (id: string): User | null => {
    const users = getUsers();
    const record = Object.values(users).find(r => r.user.id === id);
    return record ? record.user : null;
  };

  const login = async (email: string, password: string) => {
    const users = getUsers();
    const record = users[email.toLowerCase()];
    if (!record) return { success: false, error: "No account found with this email." };
    if (record.password !== password) return { success: false, error: "Incorrect password." };
    setUser(record.user);
    localStorage.setItem("wm_user", JSON.stringify(record.user));
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string, city: string, gender?: string, dob?: string, phone?: string) => {
    const users = getUsers();
    const key = email.toLowerCase();
    if (users[key]) return { success: false, error: "An account with this email already exists." };
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email: key,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      city,
      bio: "New to WanderMate. Ready to explore! 🌍",
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
    users[key] = { password, user: newUser };
    saveUsers(users);
    setUser(newUser);
    localStorage.setItem("wm_user", JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wm_user");
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("wm_user", JSON.stringify(updated));
    const users = getUsers();
    if (users[user.email]) {
      users[user.email].user = updated;
      saveUsers(users);
    }
  };

  const followUser = (targetId: string) => {
    if (!user) return;
    const users = getUsers();

    // Update current user's following list
    const currentFollowing = user.following || [];
    const updatedFollowing = currentFollowing.includes(targetId)
      ? currentFollowing
      : [...currentFollowing, targetId];
    const updatedCurrentUser = { ...user, following: updatedFollowing };
    setUser(updatedCurrentUser);
    localStorage.setItem("wm_user", JSON.stringify(updatedCurrentUser));
    if (users[user.email]) users[user.email].user = updatedCurrentUser;

    // Update target user's followers list
    const targetEntry = Object.values(users).find(r => r.user.id === targetId);
    if (targetEntry) {
      const existingFollowers = targetEntry.user.followers || [];
      const updatedFollowers = existingFollowers.includes(user.id)
        ? existingFollowers
        : [...existingFollowers, user.id];
      targetEntry.user = { ...targetEntry.user, followers: updatedFollowers };
    }

    saveUsers(users);
  };

  const unfollowUser = (targetId: string) => {
    if (!user) return;
    const users = getUsers();

    // Update current user's following list
    const updatedFollowing = (user.following || []).filter(id => id !== targetId);
    const updatedCurrentUser = { ...user, following: updatedFollowing };
    setUser(updatedCurrentUser);
    localStorage.setItem("wm_user", JSON.stringify(updatedCurrentUser));
    if (users[user.email]) users[user.email].user = updatedCurrentUser;

    // Update target user's followers list
    const targetEntry = Object.values(users).find(r => r.user.id === targetId);
    if (targetEntry) {
      targetEntry.user = { ...targetEntry.user, followers: (targetEntry.user.followers || []).filter(id => id !== user.id) };
    }

    saveUsers(users);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, followUser, unfollowUser, getUserById, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
