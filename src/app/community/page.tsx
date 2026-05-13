"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, MapPin, Eye, BookOpen, Image as ImageIcon, Video, Send, PenLine, TrendingUp } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import CreatePostModal from "@/components/CreatePostModal";
import PostDetailModal from "@/components/PostDetailModal";
import AuthModal from "@/components/AuthModal";
import { Post, Comment } from "@/types";

type TabType = "All" | "blog" | "photo" | "video";

const CATEGORIES = [
  { label: "All Topics", emoji: "✨" },
  { label: "Camping", emoji: "⛺" },
  { label: "Trekking", emoji: "🥾" },
  { label: "Travel", emoji: "✈️" },
  { label: "Food", emoji: "🍜" },
  { label: "Sports & Games", emoji: "🏐" },
  { label: "Social", emoji: "🤝" },
  { label: "Content Creation", emoji: "🎬" },
];

const TABS: { value: TabType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "All", label: "All Stories", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "teal" },
  { value: "blog", label: "Blogs", icon: <BookOpen className="w-3.5 h-3.5" />, color: "blue" },
  { value: "photo", label: "Photos", icon: <ImageIcon className="w-3.5 h-3.5" />, color: "purple" },
  { value: "video", label: "Videos", icon: <Video className="w-3.5 h-3.5" />, color: "red" },
];

const typeColor: Record<string, string> = {
  blog: "bg-blue-100 text-blue-600",
  photo: "bg-purple-100 text-purple-600",
  video: "bg-red-100 text-red-600",
};

function PostCard({ post, onOpenDetail }: { post: Post; onOpenDetail: (p: Post) => void }) {
  const { likePost, addComment } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const liked = user ? post.likes.includes(user.id) : false;

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
      <article className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Cover */}
        <button className="w-full block relative h-48 overflow-hidden" onClick={() => onOpenDetail(post)}>
          {post.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.mediaUrl} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-teal-800 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-500">
              {post.image}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${typeColor[post.type]}`}>
              {post.type === "blog" ? <BookOpen className="w-3 h-3" /> : post.type === "photo" ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
              {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </span>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
            <Eye className="w-3 h-3" /> {post.views.toLocaleString()}
          </div>
        </button>

        <div className="p-4">
          {/* Author */}
          <Link href={`/profile/${post.authorId}`} className="flex items-center gap-2.5 mb-3 hover:opacity-80 transition-opacity group/author">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-100 to-teal-300 flex items-center justify-center text-xl border-2 border-white shadow-sm shrink-0">
              {post.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 group-hover/author:text-teal-600 transition-colors leading-tight">{post.author}</p>
              <p className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {post.location}</p>
            </div>
          </Link>

          <button onClick={() => onOpenDetail(post)} className="text-left w-full mb-2">
            <h3 className="font-bold text-gray-900 leading-snug hover:text-teal-700 transition-colors">{post.title}</h3>
          </button>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full font-medium">#{tag}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <button onClick={handleLike} className={`flex items-center gap-1.5 font-medium transition-colors ${liked ? "text-red-500" : "hover:text-red-500"}`}>
                <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} /> {post.likes.length}
              </button>
              <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 font-medium hover:text-blue-500 transition-colors">
                <MessageCircle className="w-4 h-4" /> {post.comments.length}
              </button>
            </div>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{post.readTime}</span>
          </div>

          {showComments && (
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {post.comments.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first!</p>}
              {post.comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <span className="text-lg shrink-0">{c.avatar}</span>
                  <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                    <p className="text-xs font-semibold text-gray-800">{c.author}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
              <form onSubmit={handleComment} className="flex gap-2 mt-2">
                <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-300" />
                <button type="submit" className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </article>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="signup" />}
    </>
  );
}

export default function CommunityPage() {
  const { posts } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [activeCategory, setActiveCategory] = useState("All Topics");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filtered = posts.filter(p => {
    const matchesTab = activeTab === "All" || p.type === activeTab;
    const matchesCategory = activeCategory === "All Topics" || p.tags.some(tag => tag.toLowerCase().includes(activeCategory.toLowerCase().split(" ")[0]));
    return matchesTab && matchesCategory;
  });

  const featured = posts.find(p => p.likes.length === Math.max(...posts.map(x => x.likes.length)));

  const handleWriteStory = () => {
    if (!user) { setShowAuth(true); return; }
    setShowCreatePost(true);
  };

  return (
    <div className="min-h-screen relative">
      {/* Blurred travel stories background */}
      <div className="fixed inset-0 -z-10">
        <img src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1600&h=900&fit=crop&auto=format&q=80" alt="" className="w-full h-full object-cover" style={{ filter: "blur(5px)", transform: "scale(1.05)" }} />
        <div className="absolute inset-0" style={{ background: "rgba(245,243,255,0.78)" }} />
      </div>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1a1046 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> {posts.length} Stories Shared
              </div>
              <h1 className="text-4xl font-extrabold text-white leading-tight mb-2">
                Real Stories from<br />
                <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Real Wanderers</span>
              </h1>
              <p className="text-gray-300 text-base max-w-lg">
                Blogs, photos, videos — from people who actually went. No sponsored content, no fake reviews.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/feed" className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:bg-white/10 font-semibold px-6 py-3 rounded-full text-sm transition-all">
                My Feed
              </Link>
              <button onClick={handleWriteStory} className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-6 py-3 rounded-full text-sm transition-all hover:scale-105 shadow-lg shadow-indigo-500/30">
                <PenLine className="w-4 h-4" /> Write a Story
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Featured post */}
        {featured && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              <h2 className="font-bold text-gray-800 text-lg">Most Loved Story</h2>
            </div>
            <button onClick={() => setSelectedPost(featured)} className="w-full text-left relative rounded-2xl overflow-hidden h-56 group">
              {featured.mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.mediaUrl} alt={featured.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-56 bg-gradient-to-br from-slate-700 to-indigo-800 flex items-center justify-center text-8xl group-hover:scale-105 transition-transform duration-500">
                  {featured.image}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-8">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2">Featured Story</span>
                <h3 className="text-2xl font-extrabold text-white leading-tight mb-2 max-w-lg">{featured.title}</h3>
                <p className="text-white/70 text-sm max-w-md line-clamp-2">{featured.excerpt}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xl">{featured.avatar}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{featured.author}</p>
                    <p className="text-white/60 text-xs flex items-center gap-1"><Heart className="w-3 h-3 fill-red-400 text-red-400" /> {featured.likes.length} likes</p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CATEGORIES.map(cat => (
            <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeCategory === cat.label ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"}`}>
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-2xl p-1 w-fit shadow-sm">
          {TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.value ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-6"><strong className="text-gray-700">{filtered.length}</strong> stories found</p>

        {filtered.length === 0 && posts.length === 0 && (
          <div className="text-center py-24 px-4">
            <div className="text-8xl mb-6">✍️</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">No stories yet — yours deserves to be first.</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
              Every great travel community starts with one honest story. That weird detour, the stranger who became a friend, the chai that changed everything. Write it. Someone out there needs to read it.
            </p>
            <button onClick={handleWriteStory}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-full text-base transition-all hover:scale-105 shadow-lg shadow-indigo-200">
              📝 Write the First Story
            </button>
            <p className="text-gray-400 text-xs mt-4">Blogs, photos, and videos — all welcome.</p>
          </div>
        )}

        {filtered.length === 0 && posts.length > 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl font-bold text-gray-700">No stories match this filter</p>
            <button onClick={handleWriteStory} className="mt-3 text-indigo-600 underline text-sm font-medium">Write one yourself!</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(post => <PostCard key={post.id} post={post} onOpenDetail={setSelectedPost} />)}
        </div>
      </div>

      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="signup" />}
    </div>
  );
}
