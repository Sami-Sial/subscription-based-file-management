export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen fc-canvas">
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div
            className="absolute inset-0 rounded-2xl animate-ping"
            style={{
              background: "var(--accent)",
              opacity: 0.15,
              animationDuration: "1.4s",
            }}
          />
          <div
            className="relative w-full h-full rounded-2xl flex items-center justify-center"
            style={{
              background: "var(--bg-inverse)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="loader-flame" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#FFB27A" />
                  <stop offset="0.55" stopColor="#FF7A2B" />
                  <stop offset="1" stopColor="#EA4408" />
                </linearGradient>
              </defs>
              <path
                d="M13 26.5 C13 22 15.5 19 18.5 16.5 C19.5 18.5 20 20 20 21.5 C21.5 20 22.5 18 22.5 15 C25.5 17 27.5 20.5 27.5 24.2 C27.5 28 24.5 30.5 20.25 30.5 C16.5 30.5 13 29 13 26.5 Z"
                fill="url(#loader-flame)"
              />
            </svg>
          </div>
        </div>
        <p className="text-xs font-medium fc-text-muted tracking-wider uppercase">
          Loading
        </p>
      </div>
    </div>
  );
}
