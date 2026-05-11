interface Props {
  size?: number;
  showName?: boolean;
  nameSize?: "sm" | "md" | "lg" | "xl";
}

export default function MaybeLogo({ size = 36, showName = true, nameSize = "md" }: Props) {
  const nameSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          {/* Background fill */}
          <linearGradient id="mb-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>
          {/* M stroke — teal */}
          <linearGradient id="mb-m" x1="7" y1="11" x2="21" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          {/* B stroke — blue */}
          <linearGradient id="mb-b" x1="22" y1="11" x2="37" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Dark rounded-square background */}
        <rect width="44" height="44" rx="11" fill="url(#mb-bg)" />

        {/*
          Rotated M — the letter M turned 90° CW so both peaks point RIGHT.
          Path reads: left-top spine → top-right peak → center-left valley → bottom-right peak → left-bottom spine
          This creates the double-chevron "zig" shape you showed in the image.
        */}
        <path
          d="M 7,11 L 21,11 L 14,22 L 21,33 L 7,33"
          stroke="url(#mb-m)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/*
          Capital B — spine on left, two bumps curving right.
          Top bump is slightly smaller; bottom bump is larger (classic B proportions).
        */}
        {/* Spine */}
        <path
          d="M 23,11 L 23,33"
          stroke="url(#mb-b)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Top bump */}
        <path
          d="M 23,11 C 34,11 34,22 23,22"
          stroke="url(#mb-b)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bottom bump — slightly wider */}
        <path
          d="M 23,22 C 37,22 37,33 23,33"
          stroke="url(#mb-b)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {showName && (
        <span
          className={`font-extrabold tracking-tight leading-none ${nameSizes[nameSize]}`}
          style={{ letterSpacing: "-0.02em" }}
        >
          <span style={{ color: "#0d9488" }}>may</span>
          <span style={{ color: "#0284c7" }}>BE</span>
        </span>
      )}
    </div>
  );
}
