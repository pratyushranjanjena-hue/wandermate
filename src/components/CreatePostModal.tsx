"use client";

import { useState, useRef } from "react";
import { X, BookOpen, ImageIcon, Video, Upload, Loader2, Play, Film } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { Post } from "@/types";
import { compressPhoto, saveMedia } from "@/lib/mediaStorage";

const EMOJI_COVERS = ["🏔️", "🌿", "❄️", "🏖️", "🏛️", "🌄", "🌅", "🏍️", "🎒", "📸", "🌊", "🏜️", "🌸", "⛺", "🗺️"];

const POST_TYPES: { value: Post["type"]; label: string; icon: React.ReactNode }[] = [
  { value: "blog",  label: "Blog Post", icon: <BookOpen className="w-4 h-4" /> },
  { value: "photo", label: "Photo",     icon: <ImageIcon className="w-4 h-4" /> },
  { value: "video", label: "Video",     icon: <Video className="w-4 h-4" />     },
];

type UploadState = "idle" | "processing" | "done" | "error";

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { addPost } = useData();
  const { showToast } = useToast();

  const [type, setType] = useState<Post["type"]>("blog");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [emojiCover, setEmojiCover] = useState("🏔️");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // media state
  const [mediaPreview, setMediaPreview] = useState<string>("");   // object URL or data URL for preview
  const [mediaKey, setMediaKey]     = useState<string>("");       // key stored in IndexedDB
  const [mediaDataUrl, setMediaDataUrl] = useState<string>("");   // compressed data URL (photos only, stored in post.mediaUrl)
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaFileName, setMediaFileName] = useState("");
  const [mediaFileSizeMB, setMediaFileSizeMB] = useState(0);

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState("processing");
    setMediaFileName(file.name);
    setMediaFileSizeMB(+(file.size / 1024 / 1024).toFixed(1));
    try {
      const { dataUrl, blob } = await compressPhoto(file);
      const key = `post_photo_${Date.now()}`;
      await saveMedia(key, blob);
      setMediaKey(key);
      setMediaDataUrl(dataUrl);
      setMediaPreview(dataUrl);
      setUploadState("done");
    } catch {
      setUploadState("error");
      showToast("Could not process photo. Try another file.", "error");
    }
    e.target.value = "";
  };

  // ── Video upload ──────────────────────────────────────────────────────────
  const handleVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > 200) { showToast("Video must be under 200 MB", "error"); e.target.value = ""; return; }
    setUploadState("processing");
    setMediaFileName(file.name);
    setMediaFileSizeMB(+sizeMB.toFixed(1));
    setUploadProgress(0);

    try {
      // Fake progress while storing (IndexedDB write is fast but we show feedback)
      const interval = setInterval(() => setUploadProgress(p => Math.min(p + 12, 90)), 120);
      const key = `post_video_${Date.now()}`;
      await saveMedia(key, file);
      clearInterval(interval);
      setUploadProgress(100);
      // Preview via object URL
      const objUrl = URL.createObjectURL(file);
      setMediaKey(key);
      setMediaPreview(objUrl);
      setMediaDataUrl("");        // videos not stored as data URL
      setUploadState("done");
    } catch {
      setUploadState("error");
      showToast("Could not save video. Try a smaller file.", "error");
    }
    e.target.value = "";
  };

  const clearMedia = () => {
    setMediaPreview(""); setMediaKey(""); setMediaDataUrl("");
    setUploadState("idle"); setUploadProgress(0); setMediaFileName("");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const post: Post = {
      id: `post_${Date.now()}`,
      type,
      authorId: user.id,
      author: user.name,
      avatar: user.avatar,
      location: location.trim(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      image: emojiCover,
      // For photos store compressed data URL directly (fits in localStorage ~150KB)
      // For videos store the IndexedDB key prefixed with "idb:" so PostDetailModal can retrieve it
      mediaUrl: type === "video" && mediaKey
        ? `idb:${mediaKey}`
        : mediaDataUrl
          ? mediaDataUrl
          : undefined,
      likes: [],
      comments: [],
      views: 0,
      readTime: type === "blog"
        ? `${Math.max(1, Math.floor(content.split(" ").length / 200))} min read`
        : type === "video" ? "Video" : "Photo",
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString().split("T")[0],
    };

    addPost(post);
    showToast("Your story has been posted! 🎉");
    onClose();
  };

  // ── Media upload zone ─────────────────────────────────────────────────────
  const UploadZone = () => {
    if (uploadState === "done" && mediaPreview) {
      return (
        <div className="relative rounded-2xl overflow-hidden bg-black">
          {type === "video" ? (
            <video src={mediaPreview} controls className="w-full max-h-56 object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaPreview} alt="preview" className="w-full max-h-56 object-cover" />
          )}
          <button type="button" onClick={clearMedia}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {mediaFileName} · {mediaFileSizeMB} MB
          </div>
        </div>
      );
    }

    if (uploadState === "processing") {
      return (
        <div className="border-2 border-dashed border-teal-300 rounded-2xl py-8 flex flex-col items-center gap-3 text-teal-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">
            {type === "photo" ? "Compressing photo…" : `Saving video… ${uploadProgress}%`}
          </p>
          {type === "video" && (
            <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
        </div>
      );
    }

    return (
      <button type="button"
        onClick={() => type === "video" ? videoRef.current?.click() : photoRef.current?.click()}
        className="w-full flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-2xl py-8 text-gray-400 hover:text-teal-600 transition-colors">
        {type === "video"
          ? <><Film className="w-10 h-10" /><span className="text-sm font-semibold">Click to upload a video</span><span className="text-xs">MP4, MOV, WebM · Max 200 MB</span></>
          : <><Upload className="w-10 h-10" /><span className="text-sm font-semibold">Click to upload a photo</span><span className="text-xs">JPG, PNG, WebP · Any size — auto compressed</span></>
        }
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Share Your Story</h2>
        <p className="text-gray-500 text-sm mb-6">Inspire the community with your travel experience</p>

        {/* Type selector */}
        <div className="flex gap-2 mb-6">
          {POST_TYPES.map(pt => (
            <button key={pt.value} type="button" onClick={() => { setType(pt.value); clearMedia(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${type === pt.value ? "bg-teal-600 text-white border-teal-600" : "border-gray-200 text-gray-600 hover:border-teal-300"}`}>
              {pt.icon} {pt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden file inputs */}
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideo} />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your story a great title"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location *</label>
            <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Ladakh, J&K"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description *</label>
            <textarea required rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="A one-liner that makes people want to read more..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
          </div>

          {/* Media upload (photo / video types) */}
          {(type === "photo" || type === "video") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {type === "photo" ? "Upload Photo *" : "Upload Video *"}
              </label>
              <UploadZone />
            </div>
          )}

          {/* Blog content */}
          {type === "blog" && (
            <>
              {/* Allow optional cover photo for blogs too */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Photo <span className="text-gray-400 font-normal">(optional)</span></label>
                {uploadState === "done" && mediaPreview ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaPreview} alt="cover" className="w-full h-40 object-cover" />
                    <button type="button" onClick={clearMedia}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : uploadState === "processing" ? (
                  <div className="border-2 border-dashed border-teal-300 rounded-2xl py-5 flex items-center justify-center gap-2 text-teal-600">
                    <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Compressing…</span>
                  </div>
                ) : (
                  <button type="button" onClick={() => photoRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-2xl py-4 text-gray-400 hover:text-teal-600 transition-colors text-sm">
                    <Upload className="w-4 h-4" /> Upload a cover photo
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blog Content</label>
                <textarea rows={7} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your full story here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
              </div>
            </>
          )}

          {/* Emoji cover fallback */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Emoji Cover <span className="text-gray-400 font-normal">(shown if no photo uploaded)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_COVERS.map(img => (
                <button key={img} type="button" onClick={() => setEmojiCover(img)}
                  className={`text-2xl w-10 h-10 rounded-xl border-2 transition-colors ${emojiCover === img ? "border-teal-600 bg-teal-50" : "border-gray-100 hover:border-teal-200"}`}>
                  {img}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. Ladakh, Budget Travel, Solo"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
          </div>

          <button type="submit" disabled={submitting || uploadState === "processing"}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            {submitting ? "Posting…" : "Publish Story 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
