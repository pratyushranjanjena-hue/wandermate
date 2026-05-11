"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, BadgeCheck, Edit, Save, X, LogOut, Grid3X3, BookOpen, UserPlus, Camera, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";
import PostDetailModal from "@/components/PostDetailModal";
import CreatePostModal from "@/components/CreatePostModal";
import AvatarPicker, { UserAvatar } from "@/components/AvatarPicker";
import { Post } from "@/types";

type TabType = "posts" | "trips" | "events";

const typeColor = {
  blog: "bg-blue-500",
  photo: "bg-purple-500",
  video: "bg-red-500",
};

export default function ProfilePage() {
  const { user, updateUser, logout, getUserById } = useAuth();
  const { trips, events, posts, deletePost } = useData();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", bio: "", avatar: "", website: "" });
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">👤</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to see your profile</h2>
      <p className="text-gray-500 mb-6">Track your trips, reviews, and travel stories</p>
      <button onClick={() => setShowAuth(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-full transition-colors">
        Sign In / Join Free
      </button>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );

  const myTripsHosted = trips.filter(t => t.hostId === user.id);
  const myTripsJoined = trips.filter(t => t.joinedUsers.includes(user.id) && t.hostId !== user.id);
  const myEvents = events.filter(e => e.attendees.includes(user.id));
  const myPosts = posts.filter(p => p.authorId === user.id);
  const totalLikes = myPosts.reduce((sum, p) => sum + p.likes.length, 0);

  const followers = user.followers || [];
  const following = user.following || [];

  const startEdit = () => {
    setForm({ name: user.name, city: user.city, bio: user.bio, avatar: user.avatar, website: user.website || "" });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!form.name.trim()) { showToast("Name cannot be empty", "error"); return; }
    updateUser({ name: form.name.trim(), city: form.city.trim(), bio: form.bio.trim(), avatar: form.avatar, website: form.website.trim() || undefined });
    setEditing(false);
    showToast("Profile updated!");
  };

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Instagram-style Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            {editing ? (
              <div className="w-full sm:w-72">
                <AvatarPicker current={form.avatar} onChange={v => setForm(f => ({ ...f, avatar: v }))} />
              </div>
            ) : (
              <div className="relative">
                <UserAvatar avatar={user.avatar} size="xl" className="border-4 border-white shadow-lg" />
                {user.verified && (
                  <span className="absolute bottom-1 right-1 bg-blue-500 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">✓</span>
                )}
                {/* Quick camera shortcut when not editing */}
                <button onClick={startEdit}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800/80 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors border-2 border-white">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="space-y-3">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Your city"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
                <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Bio"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
                <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="Website (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button onClick={() => setEditing(false)} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-1.5">
                    {user.name}
                    {user.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                  </h1>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <button onClick={startEdit}
                      className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      Edit Profile
                    </button>
                    <button onClick={() => { logout(); }}
                      className="border border-red-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center sm:justify-start gap-8 mb-3">
                  <div className="text-center cursor-default">
                    <p className="font-bold text-gray-900 text-lg">{myPosts.length}</p>
                    <p className="text-sm text-gray-500">posts</p>
                  </div>
                  <button onClick={() => setShowFollowers(true)} className="text-center hover:opacity-70 transition-opacity">
                    <p className="font-bold text-gray-900 text-lg">{followers.length}</p>
                    <p className="text-sm text-gray-500">followers</p>
                  </button>
                  <button onClick={() => setShowFollowing(true)} className="text-center hover:opacity-70 transition-opacity">
                    <p className="font-bold text-gray-900 text-lg">{following.length}</p>
                    <p className="text-sm text-gray-500">following</p>
                  </button>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-lg">{totalLikes}</p>
                    <p className="text-sm text-gray-500">likes</p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> {user.city || "Add your city"}
                </p>
                {user.bio && <p className="text-sm text-gray-700 max-w-sm">{user.bio}</p>}
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:underline block mt-1">{user.website}</a>
                )}
              </>
            )}
          </div>
        </div>

        {/* Story highlights row — quick stats */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-1">
          {[
            { label: "Trips", count: myTripsHosted.length + myTripsJoined.length, emoji: "🗺️" },
            { label: "Hosted", count: myTripsHosted.length, emoji: "🏕️" },
            { label: "Events", count: myEvents.length, emoji: "📅" },
            { label: "Likes", count: totalLikes, emoji: "❤️" },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-teal-400 flex items-center justify-center text-2xl bg-teal-50">
                {s.emoji}
              </div>
              <p className="text-xs text-gray-500">{s.label} ({s.count})</p>
            </div>
          ))}
          <button onClick={() => setShowCreatePost(true)}
            className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl hover:border-teal-400 hover:bg-teal-50 transition-colors">
              +
            </div>
            <p className="text-xs text-gray-500">New Post</p>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200 mb-0.5">
          <button onClick={() => setActiveTab("posts")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 -mt-px ${activeTab === "posts" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            <Grid3X3 className="w-4 h-4" /> Posts
          </button>
          <button onClick={() => setActiveTab("trips")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 -mt-px ${activeTab === "trips" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            <BookOpen className="w-4 h-4" /> Trips
          </button>
          <button onClick={() => setActiveTab("events")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 -mt-px ${activeTab === "events" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            <Calendar className="w-4 h-4" /> Events
          </button>
        </div>

        {/* Posts Grid */}
        {activeTab === "posts" && (
          myPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-400 border-t border-gray-100">
              <p className="text-5xl mb-3">📷</p>
              <p className="font-medium text-gray-500">No posts yet</p>
              <button onClick={() => setShowCreatePost(true)} className="mt-3 text-teal-600 text-sm hover:underline">
                Share your first story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {myPosts.map(post => (
                <div key={post.id} className="relative aspect-square group overflow-hidden bg-gray-100">
                  {/* Thumbnail — click to open */}
                  <button className="w-full h-full" onClick={() => setSelectedPost(post)}>
                    {post.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                        <span className="text-5xl">{post.image}</span>
                      </div>
                    )}
                  </button>

                  {/* Hover overlay — likes/comments */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center gap-4 text-white text-sm font-semibold">
                    <span>❤️ {post.likes.length}</span>
                    <span>💬 {post.comments.length}</span>
                  </div>

                  {/* Type dot */}
                  <span className={`absolute top-2 left-2 w-5 h-5 rounded-full ${typeColor[post.type]} opacity-80`} />

                  {/* Delete button — top right, appears on hover */}
                  {confirmDeleteId === post.id ? (
                    <div className="absolute top-1 right-1 flex gap-1 z-10">
                      <button
                        onClick={() => { deletePost(post.id); setConfirmDeleteId(null); showToast("Post deleted", "info"); }}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDeleteId(post.id); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Trips tab */}
        {activeTab === "trips" && (
          <div className="divide-y divide-gray-50 border-t border-gray-100">
            {[...myTripsHosted, ...myTripsJoined].length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-3">🗺️</p>
                <p className="font-medium">No trips yet</p>
                <Link href="/trips" className="mt-3 inline-block text-teal-600 underline text-sm">Browse trips</Link>
              </div>
            ) : [...myTripsHosted, ...myTripsJoined].map(trip => (
              <div key={trip.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{trip.image}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{trip.title}</p>
                    <p className="text-sm text-gray-400">{trip.destination} · {trip.hostId === user.id ? "Host" : `By ${trip.hostName}`}</p>
                  </div>
                </div>
                <Link href={`/trips/${trip.id}`} className="text-xs text-teal-600 hover:underline">View →</Link>
              </div>
            ))}
          </div>
        )}

        {/* Events tab */}
        {activeTab === "events" && (
          <div className="divide-y divide-gray-50 border-t border-gray-100">
            {myEvents.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-3">📅</p>
                <p className="font-medium">No events registered yet</p>
                <Link href="/events" className="mt-3 inline-block text-teal-600 underline text-sm">Browse events</Link>
              </div>
            ) : myEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{event.image}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-400">{event.date} · {event.location}</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Registered</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Detail */}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}

      {/* Create Post */}
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}

      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowFollowers(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Followers</h3>
              <button onClick={() => setShowFollowers(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-4 space-y-3">
              {followers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No followers yet</p>
              ) : followers.map(fid => {
                const fu = getUserById(fid);
                return fu ? (
                  <Link key={fid} href={`/profile/${fid}`} onClick={() => setShowFollowers(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-3xl">{fu.avatar}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{fu.name}</p>
                      <p className="text-xs text-gray-400">{fu.city}</p>
                    </div>
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowFollowing(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Following</h3>
              <button onClick={() => setShowFollowing(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-4 space-y-3">
              {following.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Not following anyone yet</p>
              ) : following.map(fid => {
                const fu = getUserById(fid);
                return fu ? (
                  <Link key={fid} href={`/profile/${fid}`} onClick={() => setShowFollowing(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-3xl">{fu.avatar}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{fu.name}</p>
                      <p className="text-xs text-gray-400">{fu.city}</p>
                    </div>
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
