# QuickFix – Local Service Booking Platform

## Original Problem Statement
Build a production-ready MERN-style local service booking marketplace ("QuickFix") with Customer, Provider and Admin roles. Core features: authentication, profile management, search & filter services, service details, booking system, booking history, ratings & reviews, provider dashboard, admin dashboard, CRUD operations, image upload. Premium startup-quality SaaS UI inspired by Stripe/Linear/Airbnb/Notion/Vercel with dark mode, glassmorphism, gradients, animations, mobile-first responsive design.

## Platform Adaptation (user-approved)
- Backend: FastAPI (Python) + MongoDB instead of Node/Express (platform default)
- Frontend: React CRA instead of Vite (platform default)
- Image uploads: built-in Object Storage instead of Cloudinary
- Database: pre-configured local MongoDB instead of Atlas
- Auth: custom JWT email/password with httpOnly cookies (access 15min / refresh 7day)

## Architecture
- `backend/`: FastAPI app, `database.py`, `models.py` (PyObjectId/BaseDocument pattern), `auth_utils.py` (bcrypt+JWT+lockout), `storage_utils.py` (Emergent Object Storage), `seed_data.py`, `routers/` (auth, users, services, bookings, reviews, provider, admin, files)
- `frontend/`: React + Tailwind + shadcn/ui, `context/AuthContext.jsx`, `lib/api.js` (axios withCredentials), pages for Landing/Login/Register/Services/ServiceDetail, role dashboards under `pages/customer`, `pages/provider`, `pages/admin`
- MongoDB collections: users, services, bookings, reviews, files, login_attempts

## User Personas
- **Customer**: browses/searches services, books providers, tracks booking history, leaves reviews, manages profile with avatar
- **Provider**: manages own services (CRUD + images), manages incoming bookings (confirm/reject/complete), views earnings & stats
- **Admin**: platform oversight — user management (block/verify/delete), service moderation (toggle active/delete), booking visibility, revenue/analytics

## Core Requirements (static)
Auth (register/login/logout/me/refresh, brute-force lockout), profile mgmt with avatar upload, service search/filter (category/city/price/sort), service detail with gallery+reviews, booking flow (date/time slot/address/notes), booking status lifecycle (pending→confirmed/rejected→completed/cancelled), reviews tied to completed bookings with rating recalculation, provider dashboard (overview stats, services CRUD, bookings management), admin dashboard (stats, users, services, bookings).

## What's Been Implemented (2026-07-18)
- Full backend: 8 routers, JWT cookie auth with lockout protection, object storage image uploads (avatars + service photos, up to 5MB/5 images), MongoDB indexes, admin seeding, 10 sample providers (20 services across all 10 categories) + 2 sample customers seeded on startup
- Full frontend: premium dark SaaS UI (Outfit/Manrope fonts, blue accent, glassmorphism navbar, bento category grid, framer-motion animations), Landing/Login/Register/Services/ServiceDetail pages, role-based dashboards (Customer: bookings+profile, Provider: overview+services+bookings, Admin: overview+users+services+bookings), booking + review modals, dark mode toggle, mobile-responsive nav
- Testing agent verified: 31/31 backend pytest cases (auth, services CRUD, full booking lifecycle, reviews+rating recalc, admin actions) + all frontend flows (registration/login for all 3 roles, search/filter, booking creation, dashboard CRUD, responsive mobile view) — 100% pass rate, zero bugs found

## Test Credentials
See `/app/memory/test_credentials.md` — admin@quickfix.com/Admin@123, 10 sample providers + 2 customers, all password `Password@123`.

## Prioritized Backlog (P1/P2 — not yet built)
- P1: Forgot/reset password flow (skipped in MVP per scope minimization)
- P1: Real-time notifications for booking status changes (email/SMS via Twilio/SendGrid)
- P2: Payment integration (Stripe) for booking deposits/full payment
- P2: Provider service area radius / geolocation-based search instead of plain city text match
- P2: Admin analytics charts (revenue over time, category breakdown) using recharts
- P2: Provider onboarding verification documents upload

## Next Tasks
- Await user feedback on priority features from backlog above
- Consider adding Stripe payments if user wants to monetize bookings
