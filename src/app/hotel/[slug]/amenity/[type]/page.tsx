import {notFound} from 'next/navigation'
import {sanityClient, queries, Hotel, Amenity} from '@/lib/sanity'
import AmenityLayout from '@/components/amenity-layout'
import Navigation from '@/components/navigation'

interface AmenityPageProps {
  params: {
    slug: string
    type: string
  }
}

export default async function AmenityPage({params}: AmenityPageProps) {
  const [hotel, amenity]: [Hotel | null, Amenity | null] = await Promise.all([
    sanityClient.fetch(queries.getHotelBySlug, {slug: params.slug}),
    sanityClient.fetch(queries.getAmenityByType, {type: params.type}),
  ])

  if (!hotel || !amenity) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Amenity Layout */}
      <AmenityLayout hotel={hotel} amenity={amenity} />
    </div>
  )
}
