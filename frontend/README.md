# Muhafiz — AI Content Moderation Platform (Frontend)

A premium, light-themed SaaS frontend for the AI Content Moderation Platform.
Built with Next.js App Router, TypeScript, Tailwind CSS, and Radix-based UI
primitives. Talks to the existing backend at `http://localhost:5001` — no
backend code is modified.

---

## 1. Architecture Summary

- **Next.js App Router** (`app/`) — every route is a server component shell
  rendering a client component for interactivity (auth, data fetching).
- **`lib/auth.tsx`** — React context holding the JWT-authenticated user.
  Checks `/api/auth/me` on load if a token exists in `localStorage`, exposes
  `login`, `register`, `logout`.
- **`lib/api.ts`** — a single Axios instance. A request interceptor attaches
  `Authorization: Bearer <token>` to every call; a response interceptor
  clears storage and redirects to `/login` on `401`.
- **`lib/services.ts`** — one typed function per backend endpoint. Nothing
  in the UI calls Axios directly; everything goes through this file, so the
  exact request/response shapes match the backend in one place.
- **`components/layout/ProtectedRoute.tsx`** + **`RoleGuard.tsx`** — route
  guards. `ProtectedRoute` redirects unauthenticated users to `/login`.
  `RoleGuard` redirects authenticated users of the wrong role to their own
  dashboard (`/dashboard` for `USER`, `/admin` for `ADMIN`).
- **Design tokens** live in `tailwind.config.js` (`canvas`, `surface`, `ink`,
  `teal`, `emerald`, `amber`, `coral`, `slate`) — a light, compliance/security
  SaaS palette, no dark purple/neon gradients.

---

## 2. Folder Structure

```
app/
  page.tsx                       Landing page
  login/page.tsx
  register/page.tsx
  dashboard/page.tsx             User dashboard
  upload/page.tsx                Upload + live moderation results
  submissions/page.tsx           User submission history
  submissions/[id]/page.tsx      Submission detail + report download
  appeals/page.tsx               My appeals
  admin/page.tsx                 Admin overview
  admin/submissions/page.tsx     All submissions + override
  admin/appeals/page.tsx         Appeals queue
  admin/policies/page.tsx        Policy configuration
  admin/analytics/page.tsx       Analytics
  layout.tsx, globals.css

components/
  layout/      Navbar, Footer, Sidebar, MobileSidebar, DashboardLayout,
               AuthLayout, ProtectedRoute, RoleGuard
  ui/          Button, Card, Input, Select, Switch, Dialog, Pagination,
               VerdictBadge, AppealStatusBadge, CategoryBadge, StatCard,
               EmptyState, LoadingState, ErrorState, PageHeader, AmbientBlobs
  submissions/ SubmissionCard, SubmissionFilters, ImageResultCard,
               CategoryBreakdownCard
  upload/      ImageUploadDropzone, FileAppealModal
  admin/       PolicyCard, AdminActionModal (override), ResolveAppealModal
  dashboard/   DistributionBar, TopUsersList
  landing/     FeatureCard

lib/
  api.ts        Axios instance + interceptors + error helper
  services.ts   One function per backend endpoint
  auth.tsx      Auth context/provider
  format.ts     Date/file-size/confidence/image-url formatting
  report.ts     Client-side downloadable moderation report
  utils.ts      cn() classname merge helper

types/index.ts  Types mirroring the backend exactly
```

---

## 3. Setup / Install Commands

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`. The backend must already be running at
`http://localhost:5001` (per your existing setup).

```bash
npm run build
npm start
```

---

## 4. package.json Dependencies

See `package.json`. Key libraries:

| Package | Purpose |
|---|---|
| `next`, `react`, `react-dom` | Framework |
| `axios` | HTTP client |
| `lucide-react` | Icons |
| `clsx`, `tailwind-merge`, `class-variance-authority` | Styling utilities (shadcn-style) |
| `@radix-ui/react-*` | Accessible primitives (Switch, Select, Dialog, Slot, Label) |
| `date-fns` | Date formatting |

---

## 5. Environment Variables

`.env.local.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

Copy to `.env.local` and adjust if your backend runs elsewhere.

---

## 6. Auth Flow

1. On login/register, the backend's `{ token, user }` response is stored in
   `localStorage` (`token`, `user`).
2. Every Axios request automatically attaches `Authorization: Bearer <token>`.
3. On app load, if a token exists, `GET /api/auth/me` verifies it and
   populates the auth context. If verification fails, storage is cleared.
4. A `401` response at any time clears storage and redirects to `/login`.
5. After login, the user is redirected based on `user.role`:
   `USER → /dashboard`, `ADMIN → /admin`.
6. `RoleGuard` prevents a `USER` from viewing `/admin/*` pages (and vice
   versa) even if they navigate there directly.

---

## 7. Backend Integration Notes

- All endpoints, request bodies, query parameters, and response shapes in
  `lib/services.ts` match the backend specification exactly — no renamed
  fields, no invented routes.
- Image uploads use `FormData` with field name `images` (matches multer's
  `upload.array("images", 10)` on the backend). The `Content-Type` boundary
  header is left for the browser/Axios to set automatically — it is never
  set manually.
- Uploaded images are displayed via the backend's static `/uploads/<file>`
  route (already exposed by the backend's `express.static` middleware).

---

## 8. Download Report

The submission detail page includes a **Download report** button. Since the
backend has no dedicated export endpoint, the report is generated entirely
client-side (`lib/report.ts`) from the already-fetched submission data and
downloaded as a `.txt` file — no backend changes required.

---

## 9. Design System

- **Palette**: off-white canvas (`#FAFAF8`), white cards, charcoal-slate text,
  muted teal as primary, emerald/amber/coral as semantic verdict colors,
  slate for neutral/pending states.
- **Type**: Sora (display/headings), Inter (body), JetBrains Mono (scores,
  IDs, timestamps).
- **Motion**: subtle ambient background blobs on public pages only, gentle
  fade/slide transitions, no heavy animation. `prefers-reduced-motion` is
  respected globally.
- **Accessibility**: visible focus rings everywhere, verdicts always paired
  with an icon + text label (never color alone), labeled form fields,
  keyboard-operable dropzone and dialogs (Radix primitives).

---

## 10. Pages Implemented

Public: Landing, Login, Register.
User: Dashboard, Upload, Submission History, Submission Detail, My Appeals.
Admin: Overview, All Submissions (+ override modal), Appeals Queue (+ resolve
modal), Policies (+ snapshot warning), Analytics.
