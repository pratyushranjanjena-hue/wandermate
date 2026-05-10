"use client";

import { useRef, useState } from "react";
import { Camera, Link as LinkIcon, Smile, Check, Loader2 } from "lucide-react";

const EMOJIS = ["🧕", "👨", "👩", "🧔", "👱‍♀️", "👨‍🦱", "👩‍🦰", "🧑", "👲", "👳", "🧑‍💼", "👩‍💼", "🧑‍🎤", "👩‍🎤", "🧑‍🌾", "👩‍🌾"];

// Compress + resize image to max 400×400 JPEG at quality 0.82
// Output is always well under 200 KB regardless of input size
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 400;
      let { width, height } = img;
      if (width > height) { if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; } }
      else { if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; } }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

interface Props {
  current: string;
  onChange: (value: string) => void;
}

function isEmoji(s: string) {
  return !s.startsWith("http") && !s.startsWith("data:");
}

export function UserAvatar({
  avatar, size = "md", className = "",
}: { avatar: string; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizeMap = { sm: "w-9 h-9 text-xl", md: "w-12 h-12 text-2xl", lg: "w-20 h-20 text-5xl", xl: "w-28 h-28 text-6xl" };
  const s = sizeMap[size];
  if (isEmoji(avatar)) {
    return (
      <div className={`${s} rounded-full bg-gradient-to-br from-teal-100 to-teal-300 flex items-center justify-center border-2 border-teal-200 shrink-0 ${className}`}>
        {avatar}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatar} alt="avatar" className={`${s} rounded-full object-cover border-2 border-teal-200 shrink-0 ${className}`} />
  );
}

type Mode = "upload" | "url" | "emoji";

export default function AvatarPicker({ current, onChange }: Props) {
  const [mode, setMode] = useState<Mode>("upload");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [preview, setPreview] = useState<string>(current);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyPreview = (v: string) => {
    setPreview(v);
    onChange(v);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // No size limit needed — we compress everything to ~100KB
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      applyPreview(compressed);
    } catch {
      alert("Could not process this image. Please try a different file.");
    } finally {
      setCompressing(false);
      // reset input so same file can be re-selected
      e.target.value = "";
    }
  };

  const handleUrl = () => {
    const url = urlInput.trim();
    if (!url.startsWith("http")) { setUrlError("Enter a valid image URL starting with http"); return; }
    setUrlError("");
    applyPreview(url);
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <UserAvatar avatar={preview} size="xl" className="border-4 border-white shadow-lg" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white">
            {compressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        <div className="text-sm text-gray-500">
          <p className="font-semibold text-gray-800">Update your photo</p>
          <p>Upload from device, paste a URL,</p>
          <p>or pick an avatar emoji below.</p>
          <p className="text-xs text-teal-600 mt-1">Any size — auto compressed ✓</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {([["upload", <Camera key="c" className="w-3.5 h-3.5" />, "Upload Photo"],
           ["url",    <LinkIcon key="l" className="w-3.5 h-3.5" />, "Image URL"],
           ["emoji",  <Smile key="s" className="w-3.5 h-3.5" />,  "Avatar"]] as [Mode, React.ReactNode, string][]).map(([m, icon, label]) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${mode === m ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Upload */}
      {mode === "upload" && (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={compressing}
          className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-2xl py-6 text-gray-400 hover:text-teal-600 transition-colors disabled:opacity-60">
          {compressing
            ? <><Loader2 className="w-7 h-7 animate-spin text-teal-500" /><span className="text-sm font-medium text-teal-600">Compressing photo...</span></>
            : <><Camera className="w-7 h-7" /><span className="text-sm font-medium">Click to choose a photo from your device</span><span className="text-xs">JPG, PNG, WebP · Any size — auto compressed</span></>
          }
        </button>
      )}

      {/* URL */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setUrlError(""); }}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <button type="button" onClick={handleUrl}
              className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Apply
            </button>
          </div>
          {urlError && <p className="text-red-500 text-xs">{urlError}</p>}
          <p className="text-xs text-gray-400">Paste any direct image link from Unsplash, Google Photos, etc.</p>
        </div>
      )}

      {/* Emoji grid */}
      {mode === "emoji" && (
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(e => (
            <button key={e} type="button" onClick={() => applyPreview(e)}
              className={`w-12 h-12 text-2xl rounded-xl border-2 transition-colors ${preview === e ? "border-teal-600 bg-teal-50" : "border-gray-100 hover:border-teal-300"}`}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
