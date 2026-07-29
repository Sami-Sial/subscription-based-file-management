export default function Loader() {
  return (
    <div
      className="flex items-center justify-center min-h-screen fc-canvas"
      style={{ flexDirection: "column", gap: 0 }}
    >
      {/* Outer glow layer */}
      <div style={{ position: "relative", width: 88, height: 88 }}>

        {/* Spinning ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "var(--accent)",
            borderRightColor: "rgba(234,68,8,0.25)",
            animation: "fc-loader-spin 0.9s linear infinite",
          }}
        />

        {/* Second slower counter-spin ring */}
        <div
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: "50%",
            border: "1.5px solid transparent",
            borderTopColor: "rgba(234,68,8,0.4)",
            borderLeftColor: "rgba(234,68,8,0.15)",
            animation: "fc-loader-spin-reverse 1.4s linear infinite",
          }}
        />

        {/* Center icon */}
        <div
          style={{
            position: "absolute",
            inset: 18,
            borderRadius: "14px",
            background: "var(--bg-inverse)",
            boxShadow: "0 0 0 1px rgba(234,68,8,0.2), 0 8px 32px -8px rgba(234,68,8,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="ldr-flame" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#FFB27A" />
                <stop offset="0.5" stopColor="#FF7A2B" />
                <stop offset="1" stopColor="#EA4408" />
              </linearGradient>
            </defs>
            <path
              d="M13 26.5 C13 22 15.5 19 18.5 16.5 C19.5 18.5 20 20 20 21.5 C21.5 20 22.5 18 22.5 15 C25.5 17 27.5 20.5 27.5 24.2 C27.5 28 24.5 30.5 20.25 30.5 C16.5 30.5 13 29 13 26.5 Z"
              fill="url(#ldr-flame)"
            />
          </svg>
        </div>

        {/* Pulse glow */}
        <div
          style={{
            position: "absolute",
            inset: "-10px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234,68,8,0.12) 0%, transparent 70%)",
            animation: "fc-loader-pulse 1.8s ease-in-out infinite",
          }}
        />
      </div>

      {/* Label */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <p
          className="fc-text"
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            background: "linear-gradient(90deg, var(--text-muted) 0%, var(--accent) 50%, var(--text-muted) 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "fc-text-shimmer 2s linear infinite",
          }}
        >
          FileCloud
        </p>

        {/* Dots */}
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                animation: `fc-loader-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes fc-loader-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fc-loader-spin-reverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes fc-loader-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes fc-loader-dot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
