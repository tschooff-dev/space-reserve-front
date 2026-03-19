# Space Reserve - Frontend

A luxury hotel amenity reservation platform built with Next.js, Sanity CMS, and Supabase.

## 🚀 Features

- **Mobile-first design** optimized for QR code access
- **Dynamic hotel pages** with customizable amenities
- **Interactive seat selection** with visual layouts
- **Real-time reservations** with Supabase integration
- **Email/password authentication** via Supabase
- **Responsive design** that works on all devices

## 🚩 Feature Flags (LaunchDarkly demo)

This repo includes a small LaunchDarkly feature-flag demo that supports:

- **Safe release/rollback**: ship code behind a flag, then toggle it on/off.
- **Instant updates**: toggling a flag updates the UI without a page reload (streaming).
- **Remediation**: a protected "kill switch" endpoint you can trigger via `curl` to force-disable the flag.

### What’s flagged (flag keys used by this app)

- `hotels-search-v2` (boolean)
  - **Location**: `src/app/hotels/page.tsx`
  - **Behavior**:
    - OFF: normal Hotels page (no search box)
    - ON: shows an “Experimental search (flagged)” search input and filters hotel cards live

- `hotels-featured-banner` (boolean)
  - **Location**: `src/app/hotels/page.tsx` + `src/components/featured-banner.tsx`
  - **Behavior**:
    - OFF by default
    - ON only for targeted contexts (individual + rule-based targeting)

### Assumptions about your environment

- **Node.js**: version 20.9.0 or higher is required (Next.js 16 enforces this). If you're on an older version, use `nvm install 20 && nvm use 20` before running.
- **npm**: comes with Node, no separate install needed.
- **LaunchDarkly account**: a free trial account is sufficient. Sign up at https://launchdarkly.com/start-trial/. You only need the client-side ID from your environment settings — no paid plan required.
- **Supabase + Sanity**: required to run the full app (reservations, hotel/amenity data). If you only want to demo the feature flag, you can still load `/hotels` as long as the API returns data — the flag behavior is independent of these services.
- **No global installs needed**: everything runs via `npm run dev`, no globally installed CLIs required.

## 📱 User Flow

1. **Sign in / sign up** (email + password via Supabase)
2. **Hotels** → hotel landing page with amenity cards
3. **Select Amenity** → seat selection and time booking
4. **Confirm** → reservation confirmation
5. **Reservations** → view and cancel reservations

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS
- **CMS**: Sanity (deployed at https://spacereserve.sanity.studio/)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
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

## 🎯 Part 2: Context Attributes + Individual & Rule-Based Targeting

### What's flagged

- **Flag key**: `hotels-featured-banner` (boolean)
- **Location**: `src/app/hotels/page.tsx` + `src/components/featured-banner.tsx`
- **Behavior**:
  - **OFF**: normal Hotels page
  - **ON**: a "Summer Collection" promotional banner appears above the hotel cards

### Context attributes

When a user signs in, the app calls `ldClient.identify()` with their Supabase user data, enriching the LD context with real attributes:

| Attribute | Source | Example |
|---|---|---|
| `key` | Supabase user UUID | `"d3f2a1..."` |
| `email` | Supabase auth | `"jane@company.com"` |
| `firstName` | Supabase user_metadata | `"Jane"` |
| `lastName` | Supabase user_metadata | `"Smith"` |
| `anonymous` | `false` when signed in | `false` |

This happens automatically in `LaunchDarklyIdentifier` inside `src/components/launchdarkly-provider.tsx`. On sign-out, the context reverts to anonymous.

### Individual targeting + Rule-based targeting (active simultaneously)

LaunchDarkly evaluates targeting top-to-bottom and stops at the first match, so individual targets and rules can be active at the same time:

```
┌─────────────────────────────────────────────────┐
│  1. Individual targets  (highest priority)       │
│     → specific users always get true             │
├─────────────────────────────────────────────────┤
│  2. Rules                                        │
│     → everyone matching the rule gets true       │
├─────────────────────────────────────────────────┤
│  3. Default variation                            │
│     → everyone else gets false                   │
└─────────────────────────────────────────────────┘
```

**Set up individual targeting:**

1. Go to the `hotels-featured-banner` flag → **Targeting**
2. Under **Target individuals**, search for a user by email
3. Set their variation to **true**

**Set up a rule (at the same time):**

1. Click **Add rule**
2. Set a condition using a context attribute, for example:
   - `email` **contains** `@company.com` → serve **true**
   - `firstName` **is one of** `Jane, John` → serve **true**
3. Save

Both will be active simultaneously. The individually targeted user is matched first; the rule catches everyone else who qualifies. All changes propagate instantly via streaming — no page reload required.

---

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

For connectivity verification, the provider also sends a custom tracking event (`ldClient.track('source', { value: 'cursor' })`) after initialization completes.

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

### 5) (For Part 2) Create `hotels-featured-banner` + targeting

To demonstrate context-based targeting, also create this boolean flag:

- **Key**: `hotels-featured-banner`
- **Type**: Boolean
- **Default variation**: `false` (OFF)
- **Enable**: "SDKs using Client-side IDs"

Then set up **Targeting configuration** for your LaunchDarkly environment (commonly `Test`):

- **Individual targeting**:
  - Use `key` (Supabase user UUID) OR `email` to serve `true`
- **Rule-based targeting** (add under the **Default rule**):
  - Example rule: `email` **contains** `@yourdomain.com` → serve `true`

Save changes and hard refresh `http://localhost:3000/hotels` after signing in/out to see the banner appear/disappear.

### 6) (Extra Credit) Experimentation setup

After creating the custom metric (`featured_banner_seen`) and confirming events are arriving, create an experiment on the same flag (`hotels-featured-banner`):

- **Name**: `Featured Banner Impact`
- **Hypothesis**:  
  `If we show the featured banner to targeted users, then featured banner impressions will increase because the banner is a prominent above-the-fold element on the hotels page.`
- **Metric source**: `LaunchDarkly hosted`
- **Primary metric**: `Featured Banner Seen` (Count)
- **Randomize by**: `user`
- **Audience allocation**: `100%` (for faster demo data)
- **Variations split**: `50/50`
- **Control**: `false` (banner hidden)
- **Treatment**: `true` (banner shown)
- **Variation outside experiment**: `false`
- **Statistical approach**: `Bayesian`
- **Success threshold**: `95%`

Demo note for interviewers:

- For this assignment demo, the experiment is run long enough to prove setup and initial data capture.
- In production, the experiment should run until there is sufficient sample size and statistical confidence before making a rollout decision.

### 7. Add Sample Data

1. Go to [Sanity Studio](https://spacereserve.sanity.studio/)
2. Create a hotel (e.g., "Aman New York")
3. Create amenities (e.g., "Pool", "Spa")
4. Link amenities to the hotel

## 📄 Pages Structure

```
/                    → Redirects to /sign-in
/sign-in            → Supabase email/password authentication
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

If you want to demo feature flags without signing in:

- `hotels-search-v2` works for anonymous users (it uses the anonymous LaunchDarkly context).
- `hotels-featured-banner` requires a signed-in Supabase user so the app can call `ldClient.identify()` and populate context attributes (`email`, `firstName`, `lastName`, etc.) for targeting.

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

- Email/password authentication
- Real-time database for reservations
- Row-level security for user data

## 📞 Support

For questions or issues, contact:

- Email: support@spacereserve.com
- Phone: +1 (555) 123-4567
