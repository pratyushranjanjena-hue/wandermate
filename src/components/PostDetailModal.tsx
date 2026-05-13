"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Heart, MessageCircle, MapPin, Eye, BookOpen, Image, Video, ExternalLink } from "lucide-react";
import { parseVideoUrl } from "@/lib/videoUtils";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { Post, Comment } from "@/types";
import AuthModal from "./AuthModal";
import { UserAvatar } from "./AvatarPicker";

const typeIcon = { blog: <BookOpen className="w-3.5 h-3.5" />, photo: <Image className="w-3.5 h-3.5" />, video: <Video className="w-3.5 h-3.5" /> };
const typeColor = { blog: "bg-blue-100 text-blue-600", photo: "bg-purple-100 text-purple-600", video: "bg-red-100 text-red-600" };

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  post: Post;
  onClose: () => void;
}

export default function PostDetailModal({ post: initialPost, onClose }: Props) {
  const { user } = useAuth();
  const { likePost, addComment, posts } = useData();
  const { showToast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  // Always use the live post from context so likes/comments update in real-time
  const post = posts.find(p => p.id === initialPost.id) ?? initialPost;

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

  const hasMedia = post.mediaUrl && post.mediaUrl.length > 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row"
          onClick={e => e.stopPropagation()}
        >
          {/* Left: Media */}
          <div className="md:w-1/2 bg-black flex items-center justify-center min-h-[280px] md:min-h-0 relative shrink-0">
            {hasMedia ? (
              post.type === "video" ? (() => {
                const meta = parseVideoUrl(post.mediaUrl!);
                if (meta.type === "youtube" && meta.embedUrl) {
                  return (
                    <iframe
                      src={meta.embedUrl}
                      title={post.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full aspect-video max-h-[60vh]"
                    />
                  );
                }
                // Instagram — can't embed, show a nice link card
                return (
                  <div className="w-full h-full min-h-[280px] bg-gradient-to-br from-purple-900 to-pink-900 flex flex-col items-center justify-center gap-5 p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                      <ExternalLink className="w-9 h-9 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-lg mb-1">Instagram Reel</p>
                      <p className="text-white/60 text-sm mb-4">Instagram doesn&apos;t allow embedding — open it directly</p>
                      <a href={post.mediaUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-6 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity">
                        <ExternalLink className="w-4 h-4" /> Open Reel
                      </a>
                    </div>
                  </div>
                );
              })() : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-contain max-h-[60vh]" />
              )
            ) : (
              <div className="w-full h-full min-h-[280px] md:min-h-full bg-gradient-to-br from-teal-900 to-teal-700 flex flex-col items-center justify-center gap-4 p-8">
                <span className="text-8xl">{post.image}</span>
                {post.content && (
                  <p className="text-white/80 text-sm text-center leading-relaxed line-clamp-6">{post.content}</p>
                )}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="md:w-1/2 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <Link href={`/profile/${post.authorId}`} onClick={onClose} className="hover:opacity-80 transition-opacity">
                  <UserAvatar avatar={post.avatar} size="sm" />
                </Link>
                <div>
                  <Link href={`/profile/${post.authorId}`} onClick={onClose}
                    className="font-bold text-gray-900 text-sm hover:text-teal-600 transition-colors">{post.author}</Link>
                  <p className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {post.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor[post.type]}`}>
                  {typeIcon[post.type]} {post.type}
                </span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Caption & Comments */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Caption */}
              <div className="flex gap-3">
                <UserAvatar avatar={post.avatar} size="sm" className="shrink-0" />
                <div>
                  <span className="font-bold text-sm text-gray-900 mr-2">{post.author}</span>
                  <span className="text-sm text-gray-700">{post.title}</span>
                  <p className="text-sm text-gray-500 mt-1">{post.excerpt}</p>
                  {post.tags.length > 0 && (
                    <p className="text-xs text-teal-600 mt-1">{post.tags.map(t => `#${t}`).join(" ")}</p>
                  )}
                </div>
              </div>

              {/* Comments */}
              {post.comments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No comments yet. Be the first!</p>
              ) : (
                post.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <UserAvatar avatar={c.avatar} size="sm" className="shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-sm text-gray-900">{c.author}</span>
                        <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 px-5 py-3 shrink-0 space-y-2">
              <div className="flex items-center gap-4">
                <button onClick={handleLike}
                  className={`transition-all ${liked ? "text-red-500 scale-110" : "text-gray-500 hover:text-red-400"}`}>
                  <Heart className={`w-6 h-6 ${liked ? "fill-red-500" : ""}`} />
                </button>
                <button className="text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                  <Eye className="w-3.5 h-3.5" /> {post.views.toLocaleString()} views
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900">{post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</p>
              <p className="text-xs text-gray-400">{post.createdAt}</p>
            </div>

            {/* Comment input */}
            <form onSubmit={handleComment} className="border-t border-gray-100 px-5 py-3 flex items-center gap-3 shrink-0">
              {user && <UserAvatar avatar={user.avatar} size="sm" className="shrink-0" />}
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={user ? "Add a comment..." : "Sign in to comment..."}
                onClick={() => { if (!user) setShowAuth(true); }}
                readOnly={!user}
                className="flex-1 text-sm border-none outline-none bg-transparent placeholder:text-gray-400 cursor-text"
              />
              {commentText.trim() && (
                <button type="submit" className="text-teal-600 text-sm font-bold hover:text-teal-700">Post</button>
              )}
            </form>
          </div>
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTab="login" />}
    </>
  );
}
