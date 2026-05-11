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
          <linearGradient id="mb-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>
          <linearGradient id="mb-m" x1="7" y1="11" x2="21" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="mb-b" x1="23" y1="11" x2="38" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="44" height="44" rx="11" fill="url(#mb-bg)" />

        {/*
          M rotated 90° CW — peaks pointing right.
          Reads as a zigzag: left-column → right-peak → middle-valley → right-peak → left-column
        */}
        <path
          d="M 7,11 L 20,11 L 13,22 L 20,33 L 7,33"
          stroke="url(#mb-m)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/*
          Capital B — vertical spine + two round bumps.
          Each bump is drawn as two cubic bezier arcs meeting at the rightmost point,
          giving a proper semicircular D shape (not a teardrop).

          Top bump:  spine(24,11) → right apex(35,16.5) → spine(24,22)
          Bottom bump: spine(24,22) → right apex(37,27.5) → spine(24,33)
          Bottom bump is intentionally wider than top — classic B proportions.
        */}

        {/* Spine */}
        <line
          x1="24" y1="11" x2="24" y2="33"
          stroke="url(#mb-b)"
          strokeWidth="3.4"
          strokeLinecap="round"
        />

        {/* Top bump — two arcs through apex (35, 16.5) */}
        <path
          d="M 24,11 C 31,11 35,13.5 35,16.5 C 35,19.5 31,22 24,22"
          stroke="url(#mb-b)"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Bottom bump — two arcs through apex (37, 27.5), slightly wider */}
        <path
          d="M 24,22 C 32,22 37,24.8 37,27.5 C 37,30.2 32,33 24,33"
          stroke="url(#mb-b)"
          strokeWidth="3.4"
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
