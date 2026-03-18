# Space Reserve - Frontend

A luxury hotel amenity reservation platform built with Next.js, Sanity CMS, and Supabase.

## 🚀 Features

- **Mobile-first design** optimized for QR code access
- **Dynamic hotel pages** with customizable amenities
- **Interactive seat selection** with visual layouts
- **Real-time reservations** with Supabase integration
- **Magic link authentication** for seamless user experience
- **Responsive design** that works on all devices

## 🚩 Feature Flags (LaunchDarkly demo)

This repo includes a small LaunchDarkly feature-flag demo that supports:

- **Safe release/rollback**: ship code behind a flag, then toggle it on/off.
- **Instant updates**: toggling a flag updates the UI without a page reload (streaming).
- **Remediation**: a protected "kill switch" endpoint you can trigger via `curl` to force-disable the flag.

### What’s flagged

- **Flag key**: `hotels-search-v2` (boolean)
- **Location**: `src/app/hotels/page.tsx`
- **Behavior**:
  - **OFF**: normal Hotels page (no search box)
  - **ON**: shows an “Experimental search (flagged)” search input and filters hotel cards live

### Assumptions about your environment

- **Node.js**: this project expects a modern Node version (recommended: Node 20+) and npm.
- **Accounts**: to fully run the app you need Sanity + Supabase credentials; to demo feature flags you need a LaunchDarkly account (trial is fine).

## 📱 User Flow

1. **QR Code** → Sign In/Sign Up page
2. **Sign In** → Hotel landing page with amenities
3. **Select Amenity** → Seat selection and time booking
4. **Confirm** → Reservation confirmation
5. **Manage** → View and cancel reservations

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS
- **CMS**: Sanity (deployed at https://spacereserve.sanity.studio/)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Feature Flags**: LaunchDarkly (React SDK v3)
- **Deployment**: Vercel

## ⚙️ Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=tv46avri
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# LaunchDarkly Configuration (Feature Flags)
# Client-side ID (public) from your LaunchDarkly environment settings:
NEXT_PUBLIC_LD_CLIENT_SIDE_ID=your_launchdarkly_client_side_id_here

# (Optional) Kill switch endpoint configuration:
LD_API_TOKEN=your_launchdarkly_api_access_token_here
LD_PROJECT_KEY=your_launchdarkly_project_key_here
LD_ENVIRONMENT_KEY=your_launchdarkly_environment_key_here
LD_KILL_SWITCH_SECRET=choose_a_random_secret_string
```

Tip: you can copy `.env.example` to `.env.local` and fill in values.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔧 LaunchDarkly setup + demo instructions (detailed)

### How the SDK is wired up

```
layout.tsx
  └── LaunchDarklyProvider          ← generates stable anonymous user, initializes LDProvider
        └── LDProvider (LD SDK)     ← opens streaming SSE connection to LaunchDarkly
              └── hotels/page.tsx
                    └── useFlags()  ← reads flag value, re-renders automatically on change
```

The provider (`src/components/launchdarkly-provider.tsx`) creates a stable anonymous user key stored in `localStorage` so the same user gets a consistent flag experience across page loads. The SDK is configured with `streaming: true`, which keeps a persistent Server-Sent Events connection open to LaunchDarkly so flag changes are pushed to the client in real time.

Flag values are read in `src/app/hotels/page.tsx` using the `useFlags()` hook:

```tsx
const flags = useFlags()
const hotelsSearchV2Enabled = Boolean(flags.hotelsSearchV2) // camelCased from ‘hotels-search-v2’
```

### 1) Create the flag in LaunchDarkly

In LaunchDarkly (in the environment you’ll use locally):

- Create a **boolean** flag with key **`hotels-search-v2`**
- Enable **”SDKs using Client-side ID”** in the flag settings (required for browser SDKs)
- Start with it **OFF**

### 2) Add the LaunchDarkly client-side ID

Add your environment’s **Client-side ID** (not the SDK key) to `.env.local`:

```env
NEXT_PUBLIC_LD_CLIENT_SIDE_ID=your_client_side_id_here
```

Restart the dev server after changing env vars:

```bash
npm run dev
```

### 3) Verify instant release/rollback (no reload)

1. Open `http://localhost:3000/hotels`
2. Toggle the flag **ON** in the LaunchDarkly dashboard
3. Watch the UI switch instantly — the “Experimental search (flagged)” search box appears without a page refresh
4. Toggle the flag **OFF** to roll back instantly

### 4) Remediate (kill switch trigger via curl)

This repo includes a protected API endpoint that force-disables the demo flag via the LaunchDarkly REST API — no dashboard access required:

- **Route**: `POST /api/ld/kill-switch`
- **Auth**: `x-kill-switch-secret` header matching `LD_KILL_SWITCH_SECRET`
- **Requires**: `LD_API_TOKEN`, `LD_PROJECT_KEY`, `LD_ENVIRONMENT_KEY` in `.env.local`

```bash
curl -X POST “http://localhost:3000/api/ld/kill-switch” \
  -H “x-kill-switch-secret: $LD_KILL_SWITCH_SECRET”
```

The endpoint calls the LaunchDarkly REST API to set the flag’s `on` value to `false`. Because streaming is active, connected clients see the feature disappear within seconds — no redeploy needed.

### 4. Add Sample Data

1. Go to [Sanity Studio](https://spacereserve.sanity.studio/)
2. Create a hotel (e.g., "Aman New York")
3. Create amenities (e.g., "Pool", "Spa")
4. Link amenities to the hotel

## 📄 Pages Structure

```
/                    → Redirects to /sign-in
/sign-in            → Magic link authentication
/hotel/[slug]       → Hotel landing page with amenities
/hotel/[slug]/amenity/[type] → Seat selection and booking
/hotel/[slug]/amenity/[type]/confirm → Reservation confirmation
/reservations       → User's current reservations
/account           → User account information
/customer-service  → Support and FAQ
```

## 🎨 Design System

- **Colors**: Black and white with minimal accents
- **Typography**: Clean, modern fonts (Inter)
- **Layout**: Minimalist, luxury-focused design
- **Mobile-first**: Optimized for mobile devices
- **QR-friendly**: Designed for QR code access

## 🔗 QR Code URLs

Hotels are accessible via: `https://your-domain.com/hotel/[slug]`

Example: `https://your-domain.com/hotel/aman-new-york`

## 📊 Database Schema

The Supabase `reservations` table includes:

- `user_id` (UUID, references auth.users)
- `hotel_slug` (text)
- `amenity_type` (text)
- `seat_number` (text)
- `time_block` (text)
- `created_at` (timestamp)

## 🚀 Deployment

The app is ready for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📱 Demo Mode

For testing without authentication:

- Click "Continue as Guest" on the sign-in page
- This bypasses auth and allows full functionality

## 🔧 Development

### Key Components

- `Navigation` - Black header with hamburger menu
- `HotelHeader` - Hero image with hotel name
- `AmenityCard` - Clickable amenity cards
- `AmenityLayout` - Interactive seat selection
- `ConfirmationPage` - Reservation confirmation

### Sanity Integration

- Uses GROQ queries to fetch hotel and amenity data
- Real-time content updates without redeployment
- Image optimization via Sanity CDN

### Supabase Integration

- Magic link authentication
- Real-time database for reservations
- Row-level security for user data

## 📞 Support

For questions or issues, contact:

- Email: support@spacereserve.com
- Phone: +1 (555) 123-4567
