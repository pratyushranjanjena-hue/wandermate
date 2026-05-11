interface Props {
  size?: number;
  showName?: boolean;
  nameSize?: "sm" | "md" | "lg" | "xl";
  dark?: boolean;
}

export default function MaybeLogo({ size = 36, showName = true, nameSize = "md", dark = false }: Props) {
  const nameSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="maybe-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="maybe-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f0fdfa" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>

        {/* Rounded square background */}
        <rect width="40" height="40" rx="10" fill="url(#maybe-bg)" />
        <rect width="40" height="40" rx="10" fill="url(#maybe-grad)" opacity="0.12" />

        {/* "mB" lettermark — fluid, stylised */}
        {/* lowercase m — two arches */}
        <path
          d="M6 28V16c0 0 1-3 4-3s4 3 4 3V28"
          stroke="url(#maybe-grad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M14 16c0 0 1-3 4-3s4 3 4 3V28"
          stroke="url(#maybe-grad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Capital B — bold right side */}
        <path
          d="M24 13H31C33.2 13 35 14.8 35 17C35 18.5 34.1 19.8 32.8 20.5C34.3 21.2 35.3 22.6 35.3 24.3C35.3 26.8 33.3 28.8 30.8 28.8H24V13Z"
          fill="url(#maybe-grad)"
          opacity="0.15"
        />
        <path
          d="M24 13H31C33.2 13 35 14.8 35 17C35 19.2 33.2 21 31 21H24"
          stroke="url(#maybe-grad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M24 21H31C33.5 21 35.5 23 35.5 25.5C35.5 28 33.5 30 31 30H24V13"
          stroke="url(#maybe-grad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Accent dot — period after "maybe?" */}
        <circle cx="20" cy="33" r="2" fill="url(#maybe-grad)" opacity="0.7" />
      </svg>

      {/* Wordmark */}
      {showName && (
        <span className={`font-extrabold tracking-tight ${nameSizes[nameSize]} ${dark ? "text-white" : ""}`}
          style={{ fontFamily: "inherit" }}>
          <span style={{ color: "#0d9488" }}>may</span>
          <span style={{ color: "#0284c7" }}>BE</span>
        </span>
      )}
    </div>
  );
}
