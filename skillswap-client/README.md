# SkillSwap — Frontend (React + Vite + Tailwind)

Frontend UI for the SkillSwap platform, matching the provided design mockup plus a set of
extra features layered on top (see below).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Tech stack
- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- react-icons (Feather + Heroicons)

## Structure
```
src/
  components/   Navbar, Sidebar, Footer, Button, Badge, Avatar, SkillCard, UserCard,
                VerifiedBadge, GamificationCard, RecommendedSkills, ReportModal...
  layouts/      PublicLayout (navbar+footer), DashboardLayout (sidebar+topbar)
  pages/        Home, Login, Register, Explore, Categories, About, Contact,
                Dashboard, Discover, Profile, MySkills, SwapRequests, Chat,
                Notifications, Reviews, Bookmarks, Settings,
                Schedule, Workshops, Leaderboard, Admin
  data/         mockData.js — placeholder data (swap for real API calls)
public/
  manifest.json, pwa-icon.svg, sw.js  — PWA support (installable + offline shell)
```

## New features added on top of the original roadmap

| Feature | Where |
|---|---|
| Verified badges (skill + identity) | Profile page, UserCard, Settings → Verification tab |
| Video intro on profile | Profile → About tab |
| Two-way reviews (received / given) | Reviews page |
| Scheduling / calendar booking | Dashboard → Schedule |
| Video call button | Chat header, Schedule upcoming sessions |
| Session notes panel | Chat page (toggle via notes icon) |
| Skill points, levels, streaks | Dashboard → GamificationCard widget |
| Recommended skills (matching logic placeholder) | Dashboard → RecommendedSkills widget |
| Leaderboard | Dashboard → Leaderboard |
| Group workshops (1-to-many swaps) | Dashboard → Workshops |
| Location-based filter | Explore page |
| Report & block flow | Chat menu → ReportModal |
| Identity verification tier | Settings → Verification tab |
| Admin analytics dashboard | Dashboard → Admin |
| PWA support (installable, offline shell) | manifest.json + sw.js, registered in main.jsx |

## Notes
- All pages are wired to the real Express/MongoDB backend via `src/api/axios.js` and
  live Socket.IO events — nothing reads from `src/data/mockData.js` anymore (kept only
  as a reference/fixture file, unused by the app).
- The "Recommended Skills" matching logic is still a static placeholder — a real version
  would need a backend endpoint doing co-occurrence or embedding-based matching.
- Service worker caches a network-first app shell; safe to ignore in local dev if it
  fails to register (sandboxed/non-HTTPS environments block SW registration).
- See the top-level `README.md` (one folder up) for deployment steps.
