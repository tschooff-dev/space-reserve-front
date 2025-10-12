'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import Navigation from '@/components/navigation'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import Loading from '@/components/loading'
import Image from 'next/image'

interface Hotel {
  name: string
  slug: string
  description?: string
  location?: string
  heroImage?: string
  heroImageAlt?: string
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('/api/hotels')
        if (response.ok) {
          const data = await response.json()
          setHotels(data)
        }
      } catch (error) {
        console.error('Error fetching hotels:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-aileron-light text-black mb-8 uppercase tracking-wider">
            Hotels
          </h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading text="Loading hotels..." size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-aileron-light text-black mb-2 uppercase tracking-wider">
          Hotels
        </h1>
        <p className="text-black/70 font-foundation-sans mb-8 sm:mb-12">
          Select a hotel to view available amenities and make a reservation
        </p>

        {hotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black font-foundation-sans">No hotels available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <Card
                key={hotel.slug}
                className="cursor-pointer hover:bg-black/5 transition-all duration-200 border-2 border-black"
                onClick={() => router.push(`/hotel/${hotel.slug}`)}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {hotel.heroImage && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={hotel.heroImage}
                      alt={hotel.heroImageAlt || hotel.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-aileron-light uppercase tracking-wider text-black">
                    {hotel.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {hotel.location && (
                    <p className="text-sm text-black/70 font-foundation-sans">{hotel.location}</p>
                  )}
                  {hotel.description && (
                    <p className="text-sm text-black/60 font-foundation-sans line-clamp-2">
                      {hotel.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
