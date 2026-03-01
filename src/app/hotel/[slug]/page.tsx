import {notFound} from 'next/navigation'
import {sanityClient, queries, Hotel} from '@/lib/sanity'
import HotelHeader from '@/components/hotel-header'
import AmenityCard from '@/components/amenity-card'
import Navigation from '@/components/navigation'
import HotelViewTracker from '@/components/hotel-view-tracker'

interface HotelPageProps {
  params: {
    slug: string
  }
}

export default async function HotelPage({params}: HotelPageProps) {
  const {slug} = await params
  const hotel: Hotel | null = await sanityClient.fetch(queries.getHotelBySlug, {
    slug,
  })

  if (!hotel) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />
      
<HotelViewTracker hotelName={hotel.name} />

      {/* Hero Section */}
      <HotelHeader hotel={hotel} />

      {/* Amenities Section */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-brand-title text-black mb-8">Reserve Your Experience</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hotel.amenities?.map((amenity) => (
              <AmenityCard key={amenity._id} amenity={amenity} hotelSlug={hotel.slug} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const hotels = await sanityClient.fetch(queries.getAllHotels)

  return hotels.map((hotel: Hotel) => ({
    slug: hotel.slug,
  }))
}
