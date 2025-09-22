# Space Reserve - Frontend

A luxury hotel amenity reservation platform built with Next.js, Sanity CMS, and Supabase.

## 🚀 Features

- **Mobile-first design** optimized for QR code access
- **Dynamic hotel pages** with customizable amenities
- **Interactive seat selection** with visual layouts
- **Real-time reservations** with Supabase integration
- **Magic link authentication** for seamless user experience
- **Responsive design** that works on all devices

## 📱 User Flow

1. **QR Code** → Sign In/Sign Up page
2. **Sign In** → Hotel landing page with amenities
3. **Select Amenity** → Seat selection and time booking
4. **Confirm** → Reservation confirmation
5. **Manage** → View and cancel reservations

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **CMS**: Sanity (deployed at https://spacereserve.sanity.studio/)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with magic links
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
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

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