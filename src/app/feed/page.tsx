"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart, MessageCircle, Send, MapPin, Eye, Compass,
  UserPlus, Trash2, Camera, BookOpen, Video, Zap,
  TrendingUp, Flame, Users
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";
import PostDetailModal from "@/components/PostDetailModal";
import CreatePostModal from "@/components/CreatePostModal";
import { UserAvatar } from "@/components/AvatarPicker";
import { Post, Comment } from "@/types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const POST_TYPE_STYLE: Record<string, { label: string; icon: React.ReactNode; badge: string }> = {
  blog: { label: "Blog", icon: <BookOpen className="w-3 h-3" />, badge: "bg-blue-500/80 text-white" },
  photo: { label: "Photo", icon: <Camera className="w-3 h-3" />, badge: "bg-purple-500/80 text-white" },
  video: { label: "Video", icon: <Video className="w-3 h-3" />, badge: "bg-red-500/80 text-white" },
};

// Unsplash covers for text-only (no mediaUrl) posts based on tag keywords
const TAG_COVERS: Record<string, string> = {
  camping: "photo-1504280390367-361c6d9f38f4",
  trekking: "photo-1551632811-561732d1e306",
  travel: "photo-1476514525535-07fb3b4ae5f1",
  food: "photo-1567337710282-00832b415979",
  sports: "photo-1530549387789-4c1017266635",
  social: "photo-1511632765486-a01980e01a18",
  content: "photo-1492691527719-9d1e07e534b4",
  cycling: "photo-1571068316344-75bc76f77890",
  yoga: "photo-1506126613408-eca07ce68773",
  mountains: "photo-1506905925346-21bda4d32df4",
  beach: "photo-1512343879784-a960bf40e7f2",
  heritage: "photo-1524230572899-a752b3835840",
};

function getCoverPhoto(post: Post) {
  for (const tag of post.tags) {
    const key = Object.keys(TAG_COVERS).find(k => tag.toLowerCase().includes(k));
    if (key) return `https://images.unsplash.com/${TAG_COVERS[key]}?w=600&h=600&fit=crop&auto=format&q=80`;
  }
  return `https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop&auto=format&q=80`;
}

function FeedCard({ post, onOpenDetail }: { post: Post; onOpenDetail: (p: Post) => void }) {
  const { user } = useAuth();
  const { likePost, addComment, deletePost } = useData();
  const { showToast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = user?.id === post.authorId;
  const liked = user ? post.likes.includes(user.id) : false;
  const typeStyle = POST_TYPE_STYLE[post.type];

  const handleLike = () => {
    if (!user) { setShowAuth(true); return; }
    likePost(post.id, user.id);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    if (!commentText.trim()) return;
    const comment: Comment = { id: `c_${Date.now()}`, authorId: user.id, author: user.name, avatar: user.avatar, text: commentText.trim(), createdAt: new Date().toISOString() };
    addComment(post.id, comment);
    setCommentText("");
    showToast("Comment added!");
  };

  return (
    <>
      <article className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden max-w-lg w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <Link href={`/profile/${post.authorId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="relative">
              <UserAvatar avatar={post.avatar} size="md" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 group-hover:text-teal-600 transition-colors">{post.author}</p>
              <p className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{post.location} · {timeAgo(post.createdAt)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${typeStyle.badge}`}>
              {typeStyle.icon} {typeStyle.label}
            </span>
            {isOwner && (
              confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => { deletePost(post.id); showToast("Post deleted", "info"); }} className="text-xs bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-0.5 rounded-lg">Delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 hover:text-gray-600 px-1">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="text-gray-200 hover:text-red-400 transition-colors ml-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Media */}
        <button className="w-full block relative" onClick={() => onOpenDetail(post)}>
          {post.mediaUrl ? (
            post.type === "video" ? (
              <div className="w-full aspect-square bg-gray-900 flex items-center justify-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center backdrop-blur-sm z-10">
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p className="absolute bottom-3 left-3 text-white/60 text-xs z-10">Tap to play</p>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.mediaUrl} alt={post.title} className="w-full object-cover max-h-[500px]" />
            )
          ) : (
            <div className="relative w-full aspect-square overflow-hidden">
              <Image src={getCoverPhoto(post)} alt={post.title} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white font-extrabold text-xl leading-tight drop-shadow-lg">{post.title}</p>
                {post.excerpt && <p className="text-white/75 text-sm mt-1.5 line-clamp-3 leading-relaxed">{post.excerpt}</p>}
              </div>
            </div>
          )}
        </button>

        {/* Actions bar */}
        <div className="px-4 pt-3.5 pb-1">
          <div className="flex items-center gap-5 mb-3">
            <button onClick={handleLike}
              className={`flex items-center gap-1.5 transition-all ${liked ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}>
              <Heart className={`w-6 h-6 transition-transform ${liked ? "fill-red-500 scale-110" : ""}`} />
              <span className="text-sm font-semibold">{post.likes.length}</span>
            </button>
            <button onClick={() => setShowCommentBox(!showCommentBox)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-semibold">{post.comments.length}</span>
            </button>
            <div className="ml-auto flex items-center gap-1 text-xs text-gray-300">
              <Eye className="w-3.5 h-3.5" /> {post.views.toLocaleString()}
            </div>
          </div>

          {/* Caption */}
          {post.mediaUrl && (
            <>
              <p className="text-sm text-gray-800 leading-snug mb-1">
                <Link href={`/profile/${post.authorId}`} className="font-bold text-gray-900 mr-1.5 hover:text-teal-600 transition-colors">{post.author}</Link>
                {post.title}
              </p>
              {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mb-1">{post.excerpt}</p>}
            </>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
              {post.tags.map(t => <span key={t} className="text-xs text-teal-600 font-medium">#{t}</span>)}
            </div>
          )}

          {post.comments.length > 0 && (
            <button onClick={() => onOpenDetail(post)} className="text-xs text-gray-400 mt-1 hover:text-gray-600 transition-colors">
              View all {post.comments.length} comment{post.comments.length > 1 ? "s" : ""}
            </button>
          )}
        </div>

        {/* Comment input */}
        {showCommentBox && (
          <form onSubmit={handleComment} className="border-t border-gray-100 mt-2 px-4 py-3 flex items-center gap-3">
            {user && <UserAvatar avatar={user.avatar} size="sm" />}
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm border-none outline-none bg-transparent placeholder:text-gray-400"
              onClick={() => { if (!user) setShowAuth(true); }}
              readOnly={!user} />
            {commentText.trim() && (
              <button type="submit" className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        )}
      </article>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

function Sidebar() {
  const { user, getAllUsers, followUser } = useAuth();
  const { posts, trips } = useData();
  const { showToast } = useToast();

  if (!user) return null;

  const all = getAllUsers();
  const suggestions = all.filter(u => u.id !== user.id && !(user.following || []).includes(u.id)).slice(0, 5);
  const topPosts = [...posts].sort((a, b) => b.likes.length - a.likes.length).slice(0, 3);
  const openTrips = trips.filter(t => t.joinedUsers.length < t.totalSpots).slice(0, 2);

  return (
    <div className="w-72 shrink-0 hidden lg:flex flex-col gap-6">
      {/* Current user card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity group mb-4">
          <div className="relative">
            <UserAvatar avatar={user.avatar} size="md" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 group-hover:text-teal-600 transition-colors">{user.name}</p>
            <p className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{user.city}</p>
          </div>
        </Link>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-gray-50 rounded-xl py-2">
            <p className="font-extrabold text-gray-900 text-base">{posts.filter(p => p.authorId === user.id).length}</p>
            <p className="text-gray-400">Posts</p>
          </div>
          <div className="bg-gray-50 rounded-xl py-2">
            <p className="font-extrabold text-gray-900 text-base">{(user.following || []).length}</p>
            <p className="text-gray-400">Following</p>
          </div>
          <div className="bg-gray-50 rounded-xl py-2">
            <p className="font-extrabold text-gray-900 text-base">{(user.followers || []).length}</p>
            <p className="text-gray-400">Followers</p>
          </div>
        </div>
      </div>

      {/* Trending posts */}
      {topPosts.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-bold text-gray-800">Trending Stories</p>
          </div>
          <div className="space-y-3">
            {topPosts.map(p => (
              <div key={p.id} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                  {p.mediaUrl
                    ? // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.mediaUrl} alt={p.title} className="w-10 h-10 object-cover" />
                    : <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-300 flex items-center justify-center text-xl">{p.image}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-1">{p.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Heart className="w-3 h-3 text-red-400 fill-red-400" /> {p.likes.length} likes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open trips */}
      {openTrips.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <p className="text-sm font-bold text-gray-800">Open Activities</p>
            </div>
            <Link href="/trips" className="text-xs text-teal-600 font-semibold hover:underline">See all</Link>
          </div>
          <div className="space-y-2.5">
            {openTrips.map(t => (
              <Link key={t.id} href={`/trips/${t.id}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-lg shrink-0">
                  {t.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-1">{t.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {t.totalSpots - t.joinedUsers.length} spots left
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Suggested users */}
      {suggestions.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">People to Follow</p>
            <Link href="/match" className="text-xs text-teal-600 font-semibold hover:underline">Match ⚡</Link>
          </div>
          <div className="space-y-3">
            {suggestions.map(su => (
              <div key={su.id} className="flex items-center justify-between group">
                <Link href={`/profile/${su.id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                  <UserAvatar avatar={su.avatar} size="sm" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 group-hover:text-teal-600 transition-colors">{su.name}</p>
                    <p className="text-xs text-gray-400">{su.city}</p>
                  </div>
                </Link>
                <button onClick={() => { followUser(su.id); showToast(`Following ${su.name}!`); }}
                  className="text-xs text-teal-600 font-bold hover:text-teal-800 border border-teal-200 hover:border-teal-400 px-3 py-1 rounded-full transition-all">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type FeedTab = "following" | "discover";

export default function FeedPage() {
  const { user } = useAuth();
  const { posts } = useData();
  const [showAuth, setShowAuth] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<FeedTab>("discover");

  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d3d38 100%)" }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mb-6">
            <Compass className="w-10 h-10 text-teal-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Your Travel Feed</h2>
          <p className="text-gray-300 text-base max-w-sm mb-2">See camps, treks, food walks, road trips and moments from real people across India.</p>
          <p className="text-gray-500 text-sm mb-8">Sign in to follow people, post stories and join activities.</p>
          <button onClick={() => setShowAuth(true)} className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:scale-105 shadow-xl shadow-teal-500/30">
            Sign In / Join Free
          </button>

          {/* Preview strip */}
          <div className="mt-12 flex gap-3 overflow-hidden max-w-lg opacity-40">
            {["photo-1504280390367-361c6d9f38f4","photo-1567337710282-00832b415979","photo-1530549387789-4c1017266635","photo-1511632765486-a01980e01a18"].map(id => (
              <div key={id} className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <Image src={`https://images.unsplash.com/${id}?w=200&h=200&fit=crop&auto=format&q=60`} alt="" width={96} height={96} className="object-cover w-full h-full" unoptimized />
              </div>
            ))}
          </div>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const following = user.following || [];

  const feedPosts: Post[] = activeTab === "following"
    ? [...posts]
        .filter(p => following.includes(p.authorId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [...posts].sort((a, b) => {
        const aFollowed = following.includes(a.authorId) ? 1 : 0;
        const bFollowed = following.includes(b.authorId) ? 1 : 0;
        if (bFollowed !== aFollowed) return bFollowed - aFollowed;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
              <button onClick={() => setActiveTab("discover")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === "discover" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <TrendingUp className="w-3.5 h-3.5" /> Discover
              </button>
              <button onClick={() => setActiveTab("following")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === "following" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <Users className="w-3.5 h-3.5" /> Following {following.length > 0 && <span className="bg-teal-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{following.length}</span>}
              </button>
            </div>
            <button onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-full text-sm transition-all hover:scale-105 shadow-md shadow-teal-600/25">
              + Share a Moment
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex gap-10 justify-center">
            {/* Feed column */}
            <div className="w-full max-w-lg space-y-5">
              {/* Create post card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar avatar={user.avatar} size="md" />
                  <button onClick={() => setShowCreatePost(true)}
                    className="flex-1 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-400 transition-colors">
                    What are you up to, {user.name.split(" ")[0]}?
                  </button>
                </div>
                <div className="flex gap-2 border-t border-gray-100 pt-3">
                  {[
                    { icon: <Camera className="w-4 h-4 text-purple-500" />, label: "Photo" },
                    { icon: <Video className="w-4 h-4 text-red-500" />, label: "Video" },
                    { icon: <BookOpen className="w-4 h-4 text-blue-500" />, label: "Blog" },
                    { icon: <Zap className="w-4 h-4 text-teal-500" />, label: "Activity" },
                  ].map(item => (
                    <button key={item.label} onClick={() => setShowCreatePost(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 py-1.5 rounded-xl transition-colors">
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Following empty state */}
              {activeTab === "following" && following.length === 0 && (
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                    <UserPlus className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="font-bold text-gray-800 mb-1">You&apos;re not following anyone yet</p>
                  <p className="text-sm text-gray-500 mb-3">Follow travelers to see their posts in your feed</p>
                  <Link href="/match" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors">
                    <Zap className="w-4 h-4" /> Find People to Follow
                  </Link>
                </div>
              )}

              {/* Following has people but no posts */}
              {activeTab === "following" && following.length > 0 && feedPosts.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-5xl mb-3">🌍</p>
                  <p className="font-medium text-gray-600">No posts from people you follow yet</p>
                  <p className="text-sm mt-1">Switch to Discover to see all posts</p>
                </div>
              )}

              {feedPosts.map(post => (
                <FeedCard key={post.id} post={post} onOpenDetail={setSelectedPost} />
              ))}

              {activeTab === "discover" && feedPosts.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-5xl mb-3">🌍</p>
                  <p className="font-medium">No posts yet</p>
                  <button onClick={() => setShowCreatePost(true)} className="mt-2 text-teal-600 underline text-sm">Be the first to post!</button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <Sidebar />
          </div>
        </div>
      </div>

      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
    </>
  );
}
