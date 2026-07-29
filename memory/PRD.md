# FileCloud — Product Requirements Document

## Original Problem Statement
> "this is file and folder management system ui and ux of this project is very simple you have to only enhance ui and ux of this and also make pages of terms of services and privacy policy about us and improve ui ux of all pages of this project including homepage other all pages including admin user dashboards and their pages that are in site enhance ui according to you and also spacing should be perfect"

## User Choices Captured
- **Style:** Professional / Enterprise — design agent's discretion
- **Theme:** Both light & dark (with toggle)
- **Functionality:** Keep 100 % intact — visual only
- **Brand:** Keep name "FileCloud"; new logo allowed
- **Scope:** All pages across the app

## Tech Stack
- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, Framer Motion, Recharts, lucide-react
- **Backend:** Node.js + Express + Prisma + PostgreSQL + Stripe (unchanged)
- **Storage:** Cloudinary (unchanged)

## Design System — "Midnight Ember"
- **Palette:** Midnight (deep navy #0A0E1C) + Ember (warm orange #EA4408) — a non-generic professional pairing
- **Type:** `Plus Jakarta Sans` (avoids AI-slop Inter/Roboto). Mono: `JetBrains Mono`
- **Motion:** Framer Motion + custom CSS keyframes (`fc-anim-fadeUp`, `fc-anim-float`, `fc-shimmer`)
- **Tokens:** Full CSS variables in `globals.css` with `[data-theme]` switching (no flash on load)
- **Signature elements:** Ember flame in logo mark, grid/dot backgrounds, noise overlay, glass headers, custom scrollbar & selection

## What's Been Implemented (Jan 2026)

### New Global Foundation
- `globals.css` — comprehensive design token system with light + dark modes
- `layout.js` — Plus Jakarta Sans + JetBrains Mono, ThemeProvider, themed Toaster
- `ThemeProvider.jsx` + `ThemeToggle.jsx` — persistent theme (localStorage), respects OS preference, zero flash
- `Logo.jsx` — bespoke ember-flame SVG logo with brand + gradient
- `PublicHeader.jsx` / `PublicFooter.jsx` — shared marketing chrome with theme toggle, footer legal links
- `AuthShell.jsx` — two-column auth layout with brand storytelling side + form side
- `Loader.jsx` — themed ember-pulse loader

### New Pages
- `/about` — hero, mission, values (4 principles), stats, maker card
- `/terms` — nine-section legal doc styled in `fc-prose`
- `/privacy` — nine-section privacy doc styled in `fc-prose`

### Rebuilt Pages
- `/` — hero with ember gradient headline, features grid, workflow steps, dynamic pricing, dark CTA strip
- `/login` `/register` `/forgot-password` `/forgot-password/reset` `/otp-verify` — all rebuilt on AuthShell
- Admin & User Sidebars — themed, new logo, role indicator pill, animated active bar
- Admin & User Navbars — glass surface, ThemeToggle, user avatar chip, themed logout
- Dashboard layouts — swapped hardcoded `bg-[#f5f6fa]` for theme-aware `fc-canvas`

### Persistence
- All new/updated files live under `/app/client/**` — persistent per Emergent pod rules.
- No functionality touched. All API endpoints, business logic, and data flows unchanged.

## Data-testid Coverage
Every interactive element added has a testid: `theme-toggle`, `brand-logo`, `login-form`, `login-email-input`, `login-password-input`, `login-submit-btn`, `signup-link`, `register-form`, `register-*-input`, `register-terms-checkbox`, `register-submit-btn`, `forgot-*`, `otp-input-*`, `otp-verify-btn`, `otp-resend-btn`, `admin-nav-*`, `user-nav-*`, `mobile-menu-btn`, `navbar-settings-btn`, `navbar-logout-btn`, `hero-primary-cta`, `hero-pricing-cta`, `pricing-plan-*`, `feature-card-*`.

## Verification Performed
- Static syntax check (brace/paren balance) on all 21 new/modified files: ok
- Live screenshot verification of `/`, `/about`, `/terms`, `/login`, `/register`, `/`(dark) — all render correctly under Next.js dev server
- Loader renders during auth check on dashboard routes (expected — no backend running in preview)

## Backlog / P1
- Themed refinement of remaining internal dashboard pages (admin dashboard, subscriptions table, users table, user drive, recent files, plan modal, settings) — currently work but keep their existing color language; can be polished to fully match the new token system on request
- Add sun/moon animation on ThemeToggle transitions
- Bring the ember hero glow into the pricing "Recommended" card as an animated aurora
