"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { MapPin, Grid3X3, BookOpen, UserPlus, UserCheck, ArrowLeft, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import PostDetailModal from "@/components/PostDetailModal";
import AuthModal from "@/components/AuthModal";
import { UserAvatar } from "@/components/AvatarPicker";
import { Post, UserPreferences } from "@/types";

const BUDGET_LABEL: Record<string, string> = {
  "under-5k": "Under ₹5K", "5k-15k": "₹5K–₹15K", "15k-40k": "₹15K–₹40K", "40k-plus": "₹40K+"
};
const ACCOMMODATION_LABEL: Record<string, string> = {
  "budget-hostel": "🛏️ Hostel", "mid-range-hotel": "🏨 Hotel", "5-star": "⭐ 5-Star", "camping": "⛺ Camping", "homestay": "🏡 Homestay"
};
const PACE_LABEL: Record<string, string> = {
  "slow-relaxed": "🐢 Relaxed", "moderate": "🚶 Moderate", "packed-itinerary": "⚡ Packed"
};
const WAKE_LABEL: Record<string, string> = {
  "early-bird": "🌅 Early Bird", "night-owl": "🦉 Night Owl", "flexible": "😴 Flexible"
};

function PreferenceBadges({ prefs }: { prefs: UserPreferences }) {
  const badges: { label: string; color: string }[] = [];
  if (prefs.accommodation) badges.push({ label: ACCOMMODATION_LABEL[prefs.accommodation] || prefs.accommodation, color: "bg-blue-100 text-blue-700" });
  if (prefs.pace) badges.push({ label: PACE_LABEL[prefs.pace] || prefs.pace, color: "bg-purple-100 text-purple-700" });
  if (prefs.wakeTime) badges.push({ label: WAKE_LABEL[prefs.wakeTime] || prefs.wakeTime, color: "bg-yellow-100 text-yellow-700" });
  if (prefs.budgetRange) badges.push({ label: `💰 ${BUDGET_LABEL[prefs.budgetRange] || prefs.budgetRange}`, color: "bg-green-100 text-green-700" });
  if (prefs.diet) badges.push({ label: prefs.diet === "veg" ? "🥗 Vegetarian" : prefs.diet === "non-veg" ? "🍗 Non-Veg" : prefs.diet === "vegan" ? "🌱 Vegan" : "🙏 Jain", color: "bg-orange-100 text-orange-700" });
  (prefs.travelTypes || []).slice(0, 3).forEach(t => badges.push({ label: t, color: "bg-teal-100 text-teal-700" }));
  (prefs.skillTags || []).slice(0, 3).forEach(t => badges.push({ label: t.replace(/-/g, " "), color: "bg-red-100 text-red-700" }));
  if (badges.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-teal-500" /> Travel DNA</p>
      <div className="flex flex-wrap gap-1.5">
        {badges.map((b, i) => (
          <span key={i} className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${b.color}`}>{b.label}</span>
        ))}
      </div>
    </div>
  );
}

const typeColor = {
  blog: "bg-blue-500",
  photo: "bg-purple-500",
  video: "bg-red-500",
};

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, getUserById, followUser, unfollowUser } = useAuth();
  const { posts } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"posts" | "blog">("posts");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [profileUser, setProfileUser] = useState<import("@/types").User | null>(null);
  const [followerUsers, setFollowerUsers] = useState<import("@/types").User[]>([]);
  const [followingUsers, setFollowingUsers] = useState<import("@/types").User[]>([]);
  const [followLoading, setFollowLoading] = useState(false);

  const refreshProfile = () => getUserById(id).then(u => { if (u) setProfileUser(u); });

  useEffect(() => {
    refreshProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!profileUser) return;
    Promise.all((profileUser.followers || []).map(fid => getUserById(fid))).then(list => setFollowerUsers(list.filter(Boolean) as import("@/types").User[]));
    Promise.all((profileUser.following || []).map(fid => getUserById(fid))).then(list => setFollowingUsers(list.filter(Boolean) as import("@/types").User[]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUser?.followers?.length, profileUser?.following?.length]);

  if (!profileUser) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">👤</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
        <p className="text-gray-500 mb-6">This profile doesn't exist or was removed.</p>
        <Link href="/" className="text-teal-600 hover:underline">← Go home</Link>
      </div>
    );
  }

  // If viewing own profile, redirect hint
  const isOwnProfile = user?.id === id;
  const isFollowing = user ? (user.following || []).includes(id) : false;

  const userPosts = posts.filter(p => p.authorId === id);
  const blogPosts = userPosts.filter(p => p.type === "blog");
  const displayed = activeTab === "posts" ? userPosts : blogPosts;

  const followers = profileUser.followers || [];
  const following = profileUser.following || [];

  const handleFollow = async () => {
    if (!user) { setShowAuth(true); return; }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        showToast(`Unfollowed ${profileUser.name}`, "info");
      } else {
        await followUser(id);
        showToast(`Following ${profileUser.name}! 🎉`);
      }
      await refreshProfile();
    } finally {
      setFollowLoading(false);
    }
  };

  const totalLikes = userPosts.reduce((sum, p) => sum + p.likes.length, 0);

  // Compatibility score (0–100) based on shared preferences
  const compatibilityScore = (() => {
    if (!user || isOwnProfile || !user.preferences || !profileUser.preferences) return null;
    const a = user.preferences;
    const b = profileUser.preferences;
    let score = 0; let max = 0;
    const match = (va: string, vb: string) => { max += 20; if (va && vb && va === vb) score += 20; };
    const overlap = (va: string[], vb: string[], weight: number) => {
      if (!va.length && !vb.length) return;
      max += weight;
      const common = va.filter(x => vb.includes(x)).length;
      const total = new Set([...va, ...vb]).size;
      score += total > 0 ? Math.round((common / total) * weight) : 0;
    };
    match(a.accommodation, b.accommodation);
    match(a.pace, b.pace);
    match(a.wakeTime, b.wakeTime);
    match(a.budgetRange, b.budgetRange);
    match(a.diet, b.diet);
    overlap(a.travelTypes, b.travelTypes, 30);
    overlap(a.cuisines, b.cuisines, 15);
    overlap(a.languages, b.languages, 15);
    const dealbreakersHit = (a.dealbreakers || []).some(d => {
      if (d === "smoking" && b.skillTags?.includes("smoker")) return true;
      return false;
    });
    if (dealbreakersHit) score = Math.max(0, score - 20);
    return max > 0 ? Math.min(100, Math.round((score / max) * 100)) : null;
  })();

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <UserAvatar avatar={profileUser.avatar} size="xl" className="border-4 border-white shadow-lg" />
            {profileUser.verified && (
              <span className="absolute bottom-1 right-1 bg-blue-500 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">✓</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">{profileUser.name}</h1>
              {isOwnProfile ? (
                <Link href="/profile"
                  className="inline-block border border-gray-300 rounded-lg px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Edit Profile
                </Link>
              ) : (
                <button onClick={handleFollow} disabled={followLoading}
                  className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
                    : "bg-teal-600 text-white hover:bg-teal-700"}`}>
                  {followLoading ? "..." : isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-8 mb-3">
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg">{userPosts.length}</p>
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
            </div>

            <p className="font-semibold text-gray-900">{profileUser.name}</p>
            <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5" /> {profileUser.city}
            </p>
            {profileUser.bio && <p className="text-sm text-gray-700 mt-1 max-w-sm">{profileUser.bio}</p>}
            {profileUser.website && (
              <a href={profileUser.website} target="_blank" rel="noopener noreferrer"
                className="text-sm text-teal-600 hover:underline mt-1 block">{profileUser.website}</a>
            )}

            {/* Compatibility score */}
            {compatibilityScore !== null && (
              <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border ${
                compatibilityScore >= 70 ? "bg-green-50 border-green-200 text-green-700" :
                compatibilityScore >= 40 ? "bg-yellow-50 border-yellow-200 text-yellow-700" :
                "bg-gray-50 border-gray-200 text-gray-600"
              }`}>
                <Zap className="w-4 h-4" />
                {compatibilityScore}% travel match
                {compatibilityScore >= 70 ? " 🔥 Great fit!" : compatibilityScore >= 40 ? " — Decent match" : " — Different styles"}
              </div>
            )}

            {/* Preferences badges */}
            {profileUser.preferences && <PreferenceBadges prefs={profileUser.preferences} />}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200 mb-6">
          <button onClick={() => setActiveTab("posts")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 -mt-px ${activeTab === "posts" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            <Grid3X3 className="w-4 h-4" /> Posts
          </button>
          <button onClick={() => setActiveTab("blog")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 -mt-px ${activeTab === "blog" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            <BookOpen className="w-4 h-4" /> Blog
          </button>
        </div>

        {/* Posts Grid */}
        {displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📷</p>
            <p className="font-medium">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {displayed.map(post => (
              <button key={post.id} onClick={() => setSelectedPost(post)}
                className="relative aspect-square group overflow-hidden bg-gray-100">
                {post.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center`}>
                    <span className="text-5xl">{post.image}</span>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-semibold">
                  <span>❤️ {post.likes.length}</span>
                  <span>💬 {post.comments.length}</span>
                </div>
                {/* Type badge */}
                <span className={`absolute top-2 right-2 w-5 h-5 rounded-full ${typeColor[post.type]} opacity-80`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowFollowers(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Followers</h3>
              <button onClick={() => setShowFollowers(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-4 space-y-3">
              {followerUsers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No followers yet</p>
              ) : followerUsers.map(fu => (
                  <Link key={fu.id} href={`/profile/${fu.id}`} onClick={() => setShowFollowers(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <UserAvatar avatar={fu.avatar} size="sm" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{fu.name}</p>
                      <p className="text-xs text-gray-400">{fu.city}</p>
                    </div>
                  </Link>
              ))}
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
              {followingUsers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Not following anyone yet</p>
              ) : followingUsers.map(fu => (
                  <Link key={fu.id} href={`/profile/${fu.id}`} onClick={() => setShowFollowing(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-3xl">{fu.avatar}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{fu.name}</p>
                      <p className="text-xs text-gray-400">{fu.city}</p>
                    </div>
                  </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
