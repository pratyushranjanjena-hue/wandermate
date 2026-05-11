"use client";

import { useRef, useState } from "react";
import MaybeLogo from "@/components/MaybeLogo";

const ICON_SVG = `<svg width="512" height="512" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mb-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </linearGradient>
    <linearGradient id="mb-m" x1="7" y1="11" x2="21" y2="33" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
    <linearGradient id="mb-b" x1="23" y1="11" x2="38" y2="33" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="44" height="44" rx="11" fill="url(#mb-bg)"/>
  <path d="M 7,11 L 20,11 L 13,22 L 20,33 L 7,33" stroke="url(#mb-m)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <line x1="24" y1="11" x2="24" y2="33" stroke="url(#mb-b)" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M 24,11 C 31,11 35,13.5 35,16.5 C 35,19.5 31,22 24,22" stroke="url(#mb-b)" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  <path d="M 24,22 C 32,22 37,24.8 37,27.5 C 37,30.2 32,33 24,33" stroke="url(#mb-b)" stroke-width="3.4" stroke-linecap="round" fill="none"/>
</svg>`;

const FULL_SVG = `<svg width="400" height="100" viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </linearGradient>
    <linearGradient id="m2" x1="16" y1="25" x2="48" y2="75" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
    <linearGradient id="b2" x1="52" y1="25" x2="86" y2="75" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="25" fill="url(#bg2)"/>
  <path d="M 16,25 L 46,25 L 30,50 L 46,75 L 16,75" stroke="url(#m2)" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <line x1="55" y1="25" x2="55" y2="75" stroke="url(#b2)" stroke-width="7.5" stroke-linecap="round"/>
  <path d="M 55,25 C 71,25 80,31 80,37.5 C 80,44 71,50 55,50" stroke="url(#b2)" stroke-width="7.5" stroke-linecap="round" fill="none"/>
  <path d="M 55,50 C 73,50 84,56.5 84,62.5 C 84,68.5 73,75 55,75" stroke="url(#b2)" stroke-width="7.5" stroke-linecap="round" fill="none"/>
  <text x="118" y="72" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="58" fill="#0d9488" letter-spacing="-2">may</text>
  <text x="258" y="72" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="58" fill="#0284c7" letter-spacing="-2">BE</text>
</svg>`;

function downloadSVG(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadPNG(svgString: string, filename: string, size: number) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);
    canvas.toBlob(b => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = filename; a.click();
    }, "image/png");
  };
  img.src = url;
}

const SIZES = [64, 128, 256, 512, 1024];

export default function BrandPage() {
  const [pngSize, setPngSize] = useState(512);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#0c4a6e] py-16 px-6 text-center">
        <p className="text-white/50 text-xs uppercase tracking-widest mb-6">Brand Assets</p>
        <div className="flex justify-center mb-4">
          <MaybeLogo size={72} nameSize="xl" />
        </div>
        <p className="text-white/60 text-sm mt-4">Download your logo in SVG or PNG at any resolution</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

        {/* Icon only */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Icon Mark</h2>
          <p className="text-sm text-gray-400 mb-6">Square icon — use for app icons, favicons, profile pictures</p>
          <div className="flex flex-wrap items-center gap-6 mb-8">
            {[48, 72, 96, 128].map(s => (
              <div key={s} className="flex flex-col items-center gap-2">
                <MaybeLogo size={s} showName={false} />
                <span className="text-xs text-gray-400">{s}px</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadSVG(ICON_SVG, "mayBE-icon.svg")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors">
              ↓ SVG (vector — infinite resolution)
            </button>
            <div className="flex items-center gap-2">
              <select
                value={pngSize}
                onChange={e => setPngSize(+e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300">
                {SIZES.map(s => <option key={s} value={s}>{s}×{s}px</option>)}
              </select>
              <button
                onClick={() => downloadPNG(ICON_SVG, `mayBE-icon-${pngSize}.png`, pngSize)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
                ↓ PNG
              </button>
            </div>
          </div>
        </div>

        {/* Full logo */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Full Logo (Icon + Wordmark)</h2>
          <p className="text-sm text-gray-400 mb-6">Horizontal lockup — use for website headers, presentations, documents</p>
          <div className="flex flex-col gap-5 mb-8">
            <div className="p-4 bg-white border border-gray-100 rounded-xl inline-block">
              <MaybeLogo size={52} nameSize="lg" />
            </div>
            <div className="p-4 bg-[#0f172a] rounded-xl inline-block">
              <MaybeLogo size={52} nameSize="lg" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadSVG(FULL_SVG, "mayBE-logo.svg")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors">
              ↓ SVG (vector)
            </button>
            <button
              onClick={() => downloadPNG(FULL_SVG, "mayBE-logo.png", 1200)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
              ↓ PNG 1200×300
            </button>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Brand Colors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Teal (may)", hex: "#0d9488", text: "white" },
              { name: "Teal Light", hex: "#2dd4bf", text: "gray-800" },
              { name: "Blue (BE)", hex: "#0284c7", text: "white" },
              { name: "Blue Light", hex: "#38bdf8", text: "gray-800" },
              { name: "Dark Navy", hex: "#0f172a", text: "white" },
              { name: "Deep Blue", hex: "#0c4a6e", text: "white" },
            ].map(c => (
              <div key={c.hex} className="rounded-xl overflow-hidden border border-gray-100">
                <div className="h-16" style={{ background: c.hex }} />
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-700">{c.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          SVG files are infinitely scalable — best for printing, apps, and presentations.
        </p>
      </div>
    </div>
  );
}
