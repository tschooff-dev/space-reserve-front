<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Space Reserve Next.js App Router application. Here's a summary of all changes made:

**New files created:**
- `instrumentation-client.ts` — Client-side PostHog initialization using the Next.js 15.3+ instrumentation pattern, with reverse proxy routing, exception capture enabled, and debug mode in development.
- `.env.local` — Environment variables `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` set securely (gitignored).

**Modified files:**
- `next.config.ts` — Added PostHog reverse proxy rewrites (`/ingest/*` → `us.i.posthog.com`) and `skipTrailingSlashRedirect: true` to ensure reliable event ingestion.
- `src/app/sign-in/page.tsx` — Added `posthog.identify()` + `user_signed_in` capture on successful login; `captureException` on unexpected errors.
- `src/app/sign-up/page.tsx` — Added `posthog.identify()` with name/email properties + `user_signed_up` capture on successful registration; `captureException` on unexpected errors.
- `src/app/forgot-password/page.tsx` — Added `password_reset_requested` capture on successful reset email dispatch; `captureException` on unexpected errors.
- `src/components/navigation.tsx` — Added `user_signed_out` capture + `posthog.reset()` before sign-out to cleanly end the session.
- `src/app/hotels/page.tsx` — Added `hotel_selected` capture with hotel slug, name, and location when a user clicks a hotel card.
- `src/components/amenity-layout.tsx` — Added `amenity_seat_selected` capture (with seat number, hotel, amenity, date, time context) on each seat click; `amenity_booking_continued` capture (with full booking summary) when the user proceeds to confirmation.
- `src/app/hotel/[slug]/amenity/[type]/confirm/page.tsx` — Added `reservation_confirmed` capture with full reservation details on successful DB insert; `captureException` on errors.
- `src/app/reservations/page.tsx` — Added `reservation_details_viewed` capture when a user opens a reservation's detail modal; `reservation_cancelled` capture with full reservation context on successful cancellation; `captureException` on errors.

**Package installed:** `posthog-js@^1.356.1`

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User successfully created a new account via the sign-up form | `src/app/sign-up/page.tsx` |
| `user_signed_in` | User successfully signed in with email and password | `src/app/sign-in/page.tsx` |
| `user_signed_out` | User clicked the sign-out button in the navigation | `src/components/navigation.tsx` |
| `password_reset_requested` | User submitted the forgot password form to request a reset email | `src/app/forgot-password/page.tsx` |
| `hotel_selected` | User clicked on a hotel card to view its amenities | `src/app/hotels/page.tsx` |
| `amenity_seat_selected` | User selected a seat on the amenity booking layout | `src/components/amenity-layout.tsx` |
| `amenity_booking_continued` | User clicked Continue to Confirmation after selecting seats, date, and time | `src/components/amenity-layout.tsx` |
| `reservation_confirmed` | User confirmed a reservation — top of the checkout conversion funnel completion | `src/app/hotel/[slug]/amenity/[type]/confirm/page.tsx` |
| `reservation_cancelled` | User cancelled an existing reservation from the reservations management page | `src/app/reservations/page.tsx` |
| `reservation_details_viewed` | User opened the details modal for a specific reservation | `src/app/reservations/page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- 📊 **[Analytics basics dashboard](https://us.posthog.com/project/322904/dashboard/1320260)** — Pinned overview of all core metrics
- 🔀 **[Reservation Checkout Funnel](https://us.posthog.com/project/322904/insights/H2Y4nszT)** — Conversion from booking continuation through to confirmed reservation
- 📈 **[User Sign Ups & Sign Ins](https://us.posthog.com/project/322904/insights/DSbKZw0N)** — Daily trend of new registrations vs. returning logins
- ✅ **[Reservations Confirmed Per Day](https://us.posthog.com/project/322904/insights/u44VzEFI)** — Primary business conversion metric
- ❌ **[Reservation Cancellations Per Day](https://us.posthog.com/project/322904/insights/ytT3shC9)** — Churn signal to monitor
- 📉 **[Booking Funnel Volume (Weekly)](https://us.posthog.com/project/322904/insights/p1KJp7Ju)** — Weekly volume at each stage of the booking flow to spot drop-off points

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
