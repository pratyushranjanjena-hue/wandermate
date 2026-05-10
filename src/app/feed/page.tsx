"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Send, MapPin, Eye, Compass, UserPlus } from "lucide-react";
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
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function FeedCard({ post, onOpenDetail }: { post: Post; onOpenDetail: (p: Post) => void }) {
  const { user } = useAuth();
  const { likePost, addComment } = useData();
  const { showToast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
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
    const comment: Comment = {
      id: `c_${Date.now()}`,
      authorId: user.id,
      author: user.name,
      avatar: user.avatar,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    addComment(post.id, comment);
    setCommentText("");
    showToast("Comment added!");
  };

  return (
    <>
      <article className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden max-w-lg w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={`/profile/${post.authorId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <UserAvatar avatar={post.avatar} size="md" />
            <div>
              <p className="font-bold text-sm text-gray-900">{post.author}</p>
              <p className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{post.location}</p>
            </div>
          </Link>
          <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
        </div>

        {/* Media */}
        <button className="w-full block" onClick={() => onOpenDetail(post)}>
          {post.mediaUrl ? (
            post.type === "video" ? (
              <div className="w-full aspect-video bg-black flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center backdrop-blur-sm">
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p className="absolute bottom-3 left-3 text-white/70 text-xs">Tap to play</p>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.mediaUrl} alt={post.title} className="w-full object-contain bg-black max-h-[480px]" />
            )
          ) : (
            <div className="w-full aspect-square bg-gradient-to-br from-teal-50 to-teal-100 flex flex-col items-center justify-center gap-3 p-6">
              <span className="text-7xl">{post.image}</span>
              {post.content && <p className="text-sm text-gray-600 text-center line-clamp-4">{post.content || post.excerpt}</p>}
            </div>
          )}
        </button>

        {/* Actions */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={handleLike} className={`transition-all ${liked ? "text-red-500 scale-110" : "text-gray-600 hover:text-red-400"}`}>
              <Heart className={`w-6 h-6 ${liked ? "fill-red-500" : ""}`} />
            </button>
            <button onClick={() => setShowCommentBox(!showCommentBox)} className="text-gray-600 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {post.views.toLocaleString()}
            </div>
          </div>

          <p className="text-sm font-bold text-gray-900 mb-1">{post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</p>

          {/* Caption */}
          <p className="text-sm text-gray-800">
            <Link href={`/profile/${post.authorId}`} className="font-bold text-gray-900 mr-2 hover:text-teal-600">{post.author}</Link>
            {post.title}
          </p>
          {post.excerpt && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{post.excerpt}</p>}

          {post.tags.length > 0 && (
            <p className="text-xs text-teal-600 mt-1">{post.tags.map(t => `#${t}`).join(" ")}</p>
          )}

          {/* View comments */}
          {post.comments.length > 0 && (
            <button onClick={() => onOpenDetail(post)} className="text-xs text-gray-400 mt-1 hover:text-gray-600 transition-colors">
              View all {post.comments.length} comments
            </button>
          )}
        </div>

        {/* Comment input */}
        {showCommentBox && (
          <form onSubmit={handleComment} className="border-t border-gray-100 px-4 py-3 flex items-center gap-3">
            {user && <UserAvatar avatar={user.avatar} size="sm" />}
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm border-none outline-none bg-transparent placeholder:text-gray-400"
              onClick={() => { if (!user) setShowAuth(true); }}
              readOnly={!user}
            />
            {commentText.trim() && (
              <button type="submit" className="text-teal-600 text-sm font-bold hover:text-teal-700">Post</button>
            )}
          </form>
        )}
      </article>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

// Suggested users sidebar
function SuggestedUsers() {
  const { user, getAllUsers, followUser, getUserById } = useAuth();
  const { showToast } = useToast();

  if (!user) return null;
  const all = getAllUsers();
  const suggestions = all.filter(u => u.id !== user.id && !(user.following || []).includes(u.id)).slice(0, 5);

  if (suggestions.length === 0) return null;

  return (
    <div className="w-72 shrink-0 hidden lg:block">
      {/* Current user mini profile */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile">
          <UserAvatar avatar={user.avatar} size="md" />
        </Link>
        <div>
          <Link href="/profile" className="font-bold text-sm text-gray-900 hover:text-teal-600 block">{user.name}</Link>
          <p className="text-xs text-gray-400">{user.city}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-500">Suggestions For You</p>
        <Link href="/community" className="text-xs text-teal-600 font-semibold hover:underline">See All</Link>
      </div>

      <div className="space-y-3">
        {suggestions.map(su => (
          <div key={su.id} className="flex items-center justify-between">
            <Link href={`/profile/${su.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <UserAvatar avatar={su.avatar} size="sm" />
              <div>
                <p className="font-semibold text-sm text-gray-900">{su.name}</p>
                <p className="text-xs text-gray-400">{su.city}</p>
              </div>
            </Link>
            <button onClick={() => { followUser(su.id); showToast(`Following ${su.name}!`); }}
              className="text-xs text-teal-600 font-bold hover:text-teal-800 transition-colors">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { user, getAllUsers } = useAuth();
  const { posts } = useData();
  const [showAuth, setShowAuth] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Compass className="w-12 h-12 text-teal-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Travel Feed</h2>
        <p className="text-gray-500 mb-6">Sign in to see posts from travelers you follow</p>
        <button onClick={() => setShowAuth(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-full transition-colors">
          Sign In / Join Free
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  const following = user.following || [];

  // Show followed users' posts, then all posts sorted by date
  const feedPosts = following.length > 0
    ? [...posts].sort((a, b) => {
        const aFollowed = following.includes(a.authorId) ? 1 : 0;
        const bFollowed = following.includes(b.authorId) ? 1 : 0;
        if (bFollowed !== aFollowed) return bFollowed - aFollowed;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    : [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-12 justify-center">
          {/* Feed */}
          <div className="w-full max-w-lg space-y-6">
            {/* Create post prompt */}
            <button onClick={() => setShowCreatePost(true)}
              className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm hover:border-teal-300 transition-colors text-left">
              <UserAvatar avatar={user.avatar} size="md" className="shrink-0" />
              <span className="text-gray-400 text-sm flex-1">Share your travel moment...</span>
              <span className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-full font-semibold">Post</span>
            </button>

            {following.length === 0 && (
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 text-center">
                <UserPlus className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-800 mb-1">Follow travelers to see their posts here</p>
                <p className="text-sm text-gray-500">Showing all community posts below</p>
              </div>
            )}

            {feedPosts.map(post => (
              <FeedCard key={post.id} post={post} onOpenDetail={setSelectedPost} />
            ))}

            {feedPosts.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-3">🌍</p>
                <p className="font-medium">No posts yet</p>
                <button onClick={() => setShowCreatePost(true)} className="mt-2 text-teal-600 underline text-sm">Be the first to post!</button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <SuggestedUsers />
        </div>
      </div>

      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
    </>
  );
}
