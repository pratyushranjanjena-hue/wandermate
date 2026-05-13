export interface VideoMeta {
  type: "youtube" | "instagram" | "unknown";
  embedUrl: string | null;
  thumbnailUrl: string | null;
  originalUrl: string;
}

function youtubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isInstagramReel(url: string): boolean {
  return /instagram\.com\/(reel|p)\/[A-Za-z0-9_-]+/.test(url);
}

export function parseVideoUrl(url: string): VideoMeta {
  const trimmed = url.trim();

  const ytId = youtubeId(trimmed);
  if (ytId) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      originalUrl: trimmed,
    };
  }

  if (isInstagramReel(trimmed)) {
    // Instagram doesn't allow iframe embeds from external domains in most cases,
    // so we show a card with a direct link instead
    return {
      type: "instagram",
      embedUrl: null,
      thumbnailUrl: null,
      originalUrl: trimmed,
    };
  }

  return { type: "unknown", embedUrl: null, thumbnailUrl: null, originalUrl: trimmed };
}

export function isValidVideoUrl(url: string): boolean {
  const meta = parseVideoUrl(url);
  return meta.type === "youtube" || meta.type === "instagram";
}
