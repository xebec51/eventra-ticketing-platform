# Eventra

Eventra is a smart event ticketing platform for campus programs, community events, seminars, workshops, competitions, and other approval-driven small-to-mid scale events. It combines public event discovery with role-based operational dashboards for admins, organizers, and attendees.

## Overview

Eventra focuses on operational clarity:

- Guests can browse public events and event details.
- Users can register, book tickets, upload manual payment proof, collect QR tickets, save favorites, and submit reviews after attending.
- Organizers can manage events, ticket types, bookings, payments, check-in, analytics, and exports within their own scope.
- Admins can moderate platform activity, approve organizers, manage users and categories, review payments, moderate reviews, export reports, and inspect audit logs.

## Feature Summary

### Public

- Landing page with featured, upcoming, and popular events
- Searchable event catalog
- Category and city filtering
- Public event detail pages
- Public ticket verification route at `/verify/[ticketCode]`

### Auth and Access Control

- NextAuth/Auth.js credentials login
- Role-aware dashboard redirects
- Protected dashboard routes through `proxy.ts`
- Organizer status routing for `PENDING` and `REJECTED`

### Admin

- Organizer approval and rejection
- User status management
- Category management
- Global event, booking, and payment oversight
- Review moderation
- Analytics dashboards
- XLSX exports for bookings and attendees
- Activity log audit trail

### Organizer

- Organizer profile management
- Event CRUD and publishing workflow
- Ticket type management
- Booking and payment review
- Cash-on-venue approval flow
- Ticket check-in by ticket code
- Analytics dashboard and scoped exports

### User

- Registration and login
- Ticket booking
- Manual payment proof submission
- Booking history and booking detail
- QR ticket wallet
- Favorite events
- Review submission after event completion and used-ticket validation
- Profile management

## Tech Stack

- Next.js 16.2.10 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma 7.8.0
- PostgreSQL on Neon
- NextAuth/Auth.js
- Zod
- React Hook Form
- Recharts
- TanStack Table
- QRCode
- xlsx
- date-fns
- bcryptjs

## Roles

- `ADMIN`
- `ORGANIZER`
- `USER`
- Guest

## Core Business Rules

### Organizer approval

- Organizer registration creates a `User` with role `ORGANIZER` and status `PENDING`.
- Admin approval sets the organizer user to `ACTIVE` and stamps `approvedAt` plus `approvedBy`.
- Admin rejection sets the organizer user to `REJECTED` and stores a rejection reason.

### Booking and payment

- `BookingStatus` and `PaymentStatus` are separate.
- Free bookings use `FREE`, become `APPROVED` immediately, and issue tickets instantly.
- `BANK_TRANSFER` and `E_WALLET` bookings start as `PENDING + UNPAID` and receive a 24-hour expiry deadline.
- Payment proof submission changes payment state to `WAITING_CONFIRMATION`.
- Payment verification marks the booking `PAID`, records verifier metadata, then approves the booking and generates tickets.
- Invalid proof marks payment as `FAILED` while leaving the booking pending so the user can resubmit.
- `CASH_ON_VENUE` creates a reservation without immediate payment, but tickets are only issued after organizer/admin approval.
- Expired `PENDING + UNPAID` bookings become `CANCELLED` with the reason `Payment deadline expired`.

### Tickets and QR

- Tickets are generated only after booking approval.
- One ticket is generated per booked quantity.
- QR images are not stored in the database.
- The database stores only `ticketCode` and `qrPayload`.
- The frontend renders QR images from `qrPayload`.

### Check-in

- Check-in is tracked at ticket level, not booking level.
- A valid ticket becomes `USED` after successful check-in.
- Duplicate check-in is blocked.

### Reviews

- Reviews require the event to be finished.
- Reviews require at least one `USED` ticket for that event.
- One booking can only produce one review.
- One user can only review a given event once.

## Database / ERD Summary

Implemented Prisma models:

- `User`
- `OrganizerProfile`
- `EventCategory`
- `Event`
- `TicketType`
- `Booking`
- `BookingItem`
- `Ticket`
- `FavoriteEvent`
- `EventReview`
- `ActivityLog`

Important relationships:

- `events.organizer_profile_id` references `organizer_profiles.id`
- `booking_items` belong to `bookings` and `ticket_types`
- `tickets` belong to `bookings`, `booking_items`, `events`, `users`, and `ticket_types`
- `event_reviews.booking_id` is unique
- `favorite_events.user_id + event_id` is unique

## Routes

### Public

- `/`
- `/events`
- `/events/[slug]`
- `/login`
- `/register`
- `/register/organizer`
- `/verify/[ticketCode]`
- `/pending-organizer`
- `/rejected-organizer`
- `/unauthorized`

### Shared dashboard

- `/dashboard`
- `/dashboard/profile`
- `/dashboard/settings`

### Admin

- `/dashboard/admin`
- `/dashboard/admin/users`
- `/dashboard/admin/organizers`
- `/dashboard/admin/events`
- `/dashboard/admin/categories`
- `/dashboard/admin/bookings`
- `/dashboard/admin/payments`
- `/dashboard/admin/reports`
- `/dashboard/admin/activity-logs`

### Organizer

- `/dashboard/organizer`
- `/dashboard/organizer/events`
- `/dashboard/organizer/events/[id]`
- `/dashboard/organizer/bookings`
- `/dashboard/organizer/payments`
- `/dashboard/organizer/check-in`
- `/dashboard/organizer/reports`
- `/dashboard/organizer/profile`

### User

- `/dashboard/user`
- `/dashboard/user/bookings`
- `/dashboard/user/bookings/[id]`
- `/dashboard/user/tickets`
- `/dashboard/user/favorites`
- `/dashboard/user/reviews`
- `/dashboard/user/profile`

## Demo Accounts

All demo accounts use the password:

```text
Password123!
```

Accounts:

- `admin@eventra.demo`
- `organizer.alpha@eventra.demo`
- `organizer.beta@eventra.demo`
- `organizer.pending@eventra.demo`
- `organizer.rejected@eventra.demo`
- `user.one@eventra.demo`
- `user.two@eventra.demo`

## Environment Variables

Required variables:

```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Production example:

```env
NEXTAUTH_URL=https://eventra-ticketing-platform.vercel.app
NEXT_PUBLIC_APP_URL=https://eventra-ticketing-platform.vercel.app
```

Do not commit `.env`, `.env.local`, or any secret file.

## Local Development

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Apply the local migration:

```bash
npx prisma migrate dev
```

Seed demo data:

```bash
npm run seed
```

Start the dev server:

```bash
npm run dev
```

## Validation Commands

Recommended validation:

```bash
npx prisma validate
npx prisma generate
npm run lint
npm run build
```

## Manual Payment Explanation

Eventra simulates manual payment operations rather than integrating a live payment gateway.

- Users create a paid booking.
- They upload a payment proof URL.
- Organizer or admin reviews the proof.
- Valid proof marks the booking as paid and triggers approval.
- Invalid proof keeps the booking pending with a failed payment state so the user can correct it.

## Cash on Venue Explanation

`CASH_ON_VENUE` acts as an offline seat reservation model.

- The user reserves inventory.
- Payment is handled at the event venue.
- Tickets still require organizer/admin approval before they are issued.

## Booking Status vs Payment Status

Examples:

- `PENDING + UNPAID`: reservation created, awaiting user payment
- `PENDING + WAITING_CONFIRMATION`: proof uploaded, awaiting review
- `PENDING + FAILED`: proof rejected, user may resubmit
- `APPROVED + PAID`: verified and approved
- `APPROVED + NOT_REQUIRED`: free or approved cash-on-venue
- `CANCELLED + UNPAID`: expired before payment

## Deployment Notes

### Vercel

- Set all environment variables in the Vercel project
- Ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` point to the deployed domain
- The build script already runs `prisma generate && next build`

### Neon

- Point `DATABASE_URL` to the Neon database
- Run migrations against the production database before first use

## Known Limitations

- Payment proof is URL-based and does not include a real file upload pipeline
- No live payment gateway integration is included
- No QR scanner camera flow is included; check-in is manual by ticket code
- Exports are generated as route-based XLSX downloads without background job processing

## Future Improvements

- Real payment gateway integration
- File uploads for payment proof and organizer branding assets
- QR scanner camera support
- Email notifications for approvals, reminders, and check-in confirmations
- Stronger search, pagination, and server-side filtering for large datasets
- Automated scheduled expiry jobs instead of manual sync triggers

## Repository Notes

- Prisma client output is generated into `app/generated/prisma`
- Seed data includes multiple booking/payment/ticket/review states for testing
- The app is designed to remain deployable to Vercel with Neon-backed PostgreSQL
