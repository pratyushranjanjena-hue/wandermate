"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, MapPin, Eye, BookOpen, Image, Video, Send } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import CreatePostModal from "@/components/CreatePostModal";
import PostDetailModal from "@/components/PostDetailModal";
import AuthModal from "@/components/AuthModal";
import { Post, Comment } from "@/types";

type TabType = "All" | "blog" | "photo" | "video";

const CATEGORIES = ["All Topics", "Camping", "Trekking", "Travel", "Food", "Sports & Games", "Social", "Content Creation"];

const typeIcon = { blog: <BookOpen className="w-3.5 h-3.5" />, photo: <Image className="w-3.5 h-3.5" />, video: <Video className="w-3.5 h-3.5" /> };
const typeColor = { blog: "bg-blue-100 text-blue-600", photo: "bg-purple-100 text-purple-600", video: "bg-red-100 text-red-600" };

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
      <article className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <button className="w-full block" onClick={() => onOpenDetail(post)}>
          {post.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.mediaUrl} alt={post.title} className="w-full h-44 object-cover hover:opacity-95 transition-opacity" />
          ) : (
            <div className="h-44 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-7xl">{post.image}</div>
          )}
        </button>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor[post.type]}`}>
              {typeIcon[post.type]} {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views.toLocaleString()}</span>
          </div>
          <Link href={`/profile/${post.authorId}`} className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity group">
            <span className="text-2xl">{post.avatar}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">{post.author}</p>
              <p className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {post.location}</p>
            </div>
          </Link>
          <button onClick={() => onOpenDetail(post)} className="text-left w-full">
            <h3 className="font-bold text-gray-900 leading-snug mb-2 hover:text-teal-700 transition-colors">{post.title}</h3>
          </button>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? "text-red-500" : "hover:text-red-500"}`}>
                <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`} /> {post.likes.length}
              </button>
              <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-4 h-4" /> {post.comments.length}
              </button>
            </div>
            <span className="text-xs">{post.readTime}</span>
          </div>

          {showComments && (
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {post.comments.length === 0 && <p className="text-xs text-gray-400">No comments yet. Be the first!</p>}
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

  const handleWriteStory = () => {
    if (!user) { setShowAuth(true); return; }
    setShowCreatePost(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Stories</h1>
          <p className="text-gray-500 mt-1">Camping, food, sports, travel & more — share your experiences</p>
        </div>
        <div className="flex gap-3">
          <Link href="/feed" className="border border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
            My Feed
          </Link>
          <button onClick={handleWriteStory} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            + Write a Story
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeCategory === cat ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-8 border-b border-gray-100">
        {(["All", "blog", "photo", "video"] as TabType[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors capitalize ${activeTab === tab ? "border-teal-600 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab === "All" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1) + "s"}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">✍️</p>
          <p className="text-lg font-medium">No stories yet</p>
          <button onClick={handleWriteStory} className="mt-3 text-teal-600 underline text-sm">Be the first to share!</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(post => <PostCard key={post.id} post={post} onOpenDetail={setSelectedPost} />)}
      </div>

      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="signup" />}
    </div>
  );
}
