# Barter9911.mn

A modern, production-ready **barter · auction · marketplace** web platform for Mongolia.
Built as a fully static single-page app that deploys to **GitHub Pages** — no server, no Vercel, no backend.

Users can exchange items through barter, run and bid on live auctions, buy and sell products, manage their listings, send barter offers, and place bids. Includes a user dashboard and a protected admin dashboard.

> Bilingual UI (🇲🇳 Монгол / 🇬🇧 English) · Blue trust-grade design · Framer Motion animations.

---

## ✨ Features

- **Barter** — list items for exchange, browse with filters, send barter offers.
- **Auctions** — live countdown timers, current-bid tracking, optional maximum / unlimited price, bid history, automatic ended state, atomic bidding via Firestore transactions.
- **Marketplace** — fixed-price listings with seller contact.
- **Post Item** — one form for Barter / Auction / Sale with conditional fields, multi-image upload, durations (12h, 1d, 7d, 14d, 1m).
- **Auth** — email/password, Google, and Facebook sign-in with validation and friendly errors.
- **User dashboard** — my listings, my offers, my bids, mark sold / exchanged, delete, edit profile.
- **Admin dashboard** — totals, pending approvals, approve/reject/delete listings, manage categories, latest users, analytics.
- **Polish** — animated hero, floating cards, scroll reveals, card hover lift, skeletons, empty states, page transitions, animated mobile drawer, glassmorphism, gradients.
- **Resilient** — never white-screens: if Firebase keys are missing it shows clear "connect Firebase" states instead of crashing.

## 🧱 Tech stack

| Area | Choice |
|------|--------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth / DB / Files | Firebase Authentication, Firestore, Storage |
| Routing | React Router (HashRouter) |
| Hosting | GitHub Pages via GitHub Actions |

## 📁 Project structure

```
barter9911.mn/
├── .github/workflows/deploy.yml   # GitHub Pages CI/CD
├── public/                        # .nojekyll, favicon
├── src/
│   ├── components/                # Navbar, Footer, cards, UI primitives, guards…
│   │   └── ui/                    # Button, Input, Select, Modal, Skeletons…
│   ├── context/AuthContext.tsx
│   ├── i18n/                      # translations + LanguageContext (MN/EN)
│   ├── firebase/                  # config, auth, firestore, storage
│   ├── hooks/useAsyncData.ts
│   ├── lib/                       # utils + constants (categories, locations…)
│   ├── pages/                     # Home, Barter, Auction, Marketplace, …
│   ├── types/                     # shared TypeScript types
│   ├── App.tsx                    # routes
│   └── main.tsx                   # entry
├── firestore.rules
├── storage.rules
├── .env.example
└── vite.config.ts
```

---

## 🚀 Getting started (local)

Requirements: **Node 18+** and npm.

```bash
npm install          # install dependencies
cp .env.example .env # add your Firebase keys (see below)
npm run dev          # start dev server (http://localhost:5173)
npm run build        # type-check + production build into dist/
npm run preview      # preview the production build
```

## 🔑 Environment variables

Create a `.env` file (copy from `.env.example`) and fill in the values from
**Firebase console → Project settings → General → Your apps → SDK setup and configuration**.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

All variables **must** be prefixed with `VITE_` for Vite to expose them to the client.

## 🔥 Firebase setup

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method**: enable **Email/Password**, **Google**, and (optionally) **Facebook**.
   - For Facebook you also need a Facebook App ID/secret and to add the OAuth redirect URI Firebase shows you.
3. **Firestore Database**: create a database (production mode), then publish the rules from `firestore.rules`.
4. **Storage**: enable it, then publish the rules from `storage.rules`.
5. Add a **Web app** to the project and copy its config into `.env`.
6. Add your GitHub Pages domain (e.g. `your-username.github.io`) under **Authentication → Settings → Authorized domains** so social sign-in works in production.

Deploy the rules with the Firebase CLI (optional but recommended):

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage
```

### Firestore collections

`users`, `listings`, `barterOffers`, `auctions`, `bids`, `categories` — see `src/types/index.ts` for exact shapes.

---

## 🌐 Deploy to GitHub Pages

This repo ships a ready-to-go workflow at `.github/workflows/deploy.yml`.

1. Push the project to a GitHub repository (any name works — see routing note below).
2. In the repo: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. In the repo: **Settings → Secrets and variables → Actions** → add the six `VITE_FIREBASE_*` secrets (same names as in `.env`).
4. Push to `main` (or run the workflow manually). The action will:
   - checkout → setup Node → `npm ci` → `npm run build` → upload `dist/` artifact → deploy to Pages.

Your site goes live at `https://<your-username>.github.io/<repo-name>/`.

### Why no white screen & no refresh 404s

- **`base: './'`** in `vite.config.ts` makes all asset paths relative, so the build works whether served from a domain root **or** a project sub-path like `/barter9911.mn/` — no broken bundle, no white screen.
- **HashRouter** is used so client routes live after a `#`. GitHub Pages never sees them as server paths, so **refreshing any page works** and there are no 404s. No `404.html` redirect hack needed.

> Prefer clean URLs (BrowserRouter)? Set `base: '/<repo-name>/'`, swap `HashRouter` for `BrowserRouter` in `src/App.tsx`, and add a `public/404.html` that redirects to `index.html`. HashRouter is the zero-config, bulletproof default.

If the repository is named **`barter9911.mn`**, the relative base already handles it; optionally set `base: '/barter9911.mn/'` in `vite.config.ts` for absolute asset URLs.

---

## 👑 Create an admin user

Admin access is controlled by the `role` field on the user's Firestore document.

1. Register normally in the app (creates `users/<uid>` with `role: "user"`).
2. In the Firebase console → **Firestore → users → <your uid>**, change `role` to `admin`.
3. Reload the app — the **Admin** link appears and `/admin` unlocks.

---

## 🛠 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check then build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check only (`tsc --noEmit`) |

## 📄 License

MIT — free to use and adapt.
