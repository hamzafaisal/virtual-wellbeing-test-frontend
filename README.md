Virtual Wellness Frontend (Next.js)
===================================

Production-grade Next.js frontend for the Virtual Wellness Clinic admin tool.

Overview
--------
- Admin portal to manage clients and appointments
- Modern, consistent design system (Inter font, Tailwind utilities, subtle shadows, neutral grays, blue primary)
- Robust API layer with Axios, React Query caching, and centralized error handling
- Authentication with bearer tokens, protected routes, and clean redirects
- Fully typed with TypeScript, validated forms with Zod + React Hook Form
- Sleek toast notifications via Sonner


Tech Stack
----------
- Next.js (App Router) + TypeScript
- Tailwind CSS
- @tanstack/react-query
- axios
- zod, react-hook-form, @hookform/resolvers
- sonner
- lucide-react
- date-fns
- Jest + Testing Library + MSW (for tests)

Project Structure
-----------------
```
virtual-wellness-frontend/
  ├─ src/
  │  ├─ app/
  │  │  ├─ layout.tsx                 # Root layout; Query + Toast + Auth providers
  │  │  ├─ page.tsx                   # Dashboard (protected)
  │  │  ├─ appointments/
  │  │  │  ├─ page.tsx               # Appointments list (protected)
  │  │  │  ├─ new/page.tsx           # New appointment form (protected)
  │  │  │  └─ upcoming/page.tsx      # Upcoming appointments (protected)
  │  │  ├─ clients/page.tsx          # Clients list (protected)
  │  │  └─ login/page.tsx            # Login (public)
  │  ├─ components/
  │  │  ├─ layout/
  │  │  │  ├─ header.tsx
  │  │  │  ├─ navigation.tsx
  │  │  │  ├─ client-header.tsx      # Client-only header with auth context
  │  │  │  └─ conditional-header.tsx # Hides header on /login and when unauthenticated
  │  │  └─ ui/                        # Button, Input, Card, etc.
  │  ├─ lib/
  │  │  ├─ api/                      # axios http + feature APIs
  │  │  │  ├─ http.ts                # Axios instance + interceptors
  │  │  │  ├─ index.ts
  │  │  │  ├─ client.ts
  │  │  │  ├─ appointment.ts
  │  │  │  ├─ dashboard.ts
  │  │  │  └─ auth.ts
  │  │  ├─ config/env.ts             # NEXT_PUBLIC_API_BASE_URL helper
  │  │  ├─ constants/messages.ts     # Success & error messages
  │  │  ├─ contexts/auth-context.tsx # Auth provider & hook
  │  │  ├─ providers/                # React Query + Toast providers
  │  │  └─ utils/                    # cn.ts, datetime helpers
  │  └─ styles/globals.css           # Tailwind + design tokens
  ├─ middleware.ts                    # Auth guard via cookie (see Auth section)
  ├─ jest.config.ts, tests/           # Unit tests (MSW-backed)
  └─ README.md
```

Environment Variables
---------------------
Create `.env.local` at the project root:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
# Optional: customize dev port
PORT=3000
```

You can also create `.env.production` and `.env.test` with the same keys.

Getting Started
---------------
1) Install dependencies
```
npm install
```

2) Run the dev server
```
# Windows PowerShell
$env:PORT=3000; npm run dev
# bash/cmd
PORT=3000 npm run dev
```
Open `http://localhost:3000`.

3) Build & run production
```
npm run build
npm run start
```

Authentication
--------------
- Login API: `POST /auth/login` with `{ email, password }`
- On success, the app stores the access token in localStorage and also writes a non-HttpOnly cookie `access_token` (for middleware routing only).
- Axios request interceptor attaches `Authorization: Bearer <token>` to every request.
- Axios response interceptor normalizes errors and redirects to `/login` on 401 for non-login requests.
- Protected pages are wrapped by `ProtectedRoute` (client side). The header is hidden on `/login` and when unauthenticated.
- `middleware.ts` performs early redirects using the `access_token` cookie to prevent UI flashes on direct navigation.

Demo Credentials
----------------
Use the demo credentials on the login page:
```
Email:    admin@virtualwellness.com
Password: admin123
```

Design System & UX
------------------
- Inter font, subtle shadows, neutral grays, blue primary accents
- Tailwind utility classes (custom form styles in `globals.css`)
- Consistent table, card, and form styling across pages
- Sonner toasts for success/error feedback

Scripts
-------
```
npm run dev     # Start Next.js dev server (Turbopack)
npm run build   # Build production bundle
npm run start   # Start production server
npm run test    # Run unit tests
```

Port configuration:
- Scripts accept an optional `PORT` env var. Examples:
  - PowerShell: `$env:PORT=3000; npm run dev`
  - bash/cmd: `PORT=3000 npm run dev`
  - If `PORT` is unset, Next.js defaults to 3000.

API Layer
---------
- Centralized axios instance in `src/lib/api/http.ts` with:
  - Base URL from `NEXT_PUBLIC_API_BASE_URL`
  - Request interceptor adding bearer token
  - Response interceptor normalizing errors and handling 401 (skips redirect on `/auth/login`)
- Feature APIs under `src/lib/api/*` return typed data structures consumed by React Query.

Testing
-------
- Jest with `jest-environment-jsdom`
- React Testing Library for components
- MSW for API mocking in unit tests

Run tests:
```
npm test
```

Troubleshooting
---------------
- Windows port error (`%PORT% is not a non-negative number`): set the env var before running `npm run dev`.
- Unauthorized after login: ensure backend is running and `NEXT_PUBLIC_API_BASE_URL` is correct.
- Clear auth: remove `access_token` and `user` from localStorage and clear the `access_token` cookie.
