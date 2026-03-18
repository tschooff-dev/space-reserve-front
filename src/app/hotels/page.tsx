'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import Navigation from '@/components/navigation'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import LoadingSpinner from '@/components/loading'
import Image from 'next/image'
import {useFlags} from 'launchdarkly-react-client-sdk'

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
  const [search, setSearch] = useState('')
  const router = useRouter()
  const flags = useFlags()
  const hotelsSearchV2Enabled = Boolean(flags.hotelsSearchV2)

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

  const visibleHotels =
    hotelsSearchV2Enabled && search.trim()
      ? hotels.filter((h) => {
          const q = search.trim().toLowerCase()
          return (
            h.name.toLowerCase().includes(q) ||
            (h.location?.toLowerCase().includes(q) ?? false) ||
            (h.description?.toLowerCase().includes(q) ?? false)
          )
        })
      : hotels

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-aileron-light text-black mb-8 uppercase tracking-wider">
            Hotels
          </h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
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

        {hotelsSearchV2Enabled && hotels.length > 0 && (
          <div className="mb-8 sm:mb-10 border-2 border-black p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-black/60 mb-3">
              Experimental search (flagged)
            </p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotels by name, city, or description"
              className="w-full border border-black bg-white px-4 py-3 font-foundation-sans text-black placeholder:text-black/40 outline-none focus:ring-2 focus:ring-black/20"
            />
            {search.trim() && (
              <p className="mt-2 text-sm text-black/70 font-foundation-sans">
                Showing {visibleHotels.length} of {hotels.length}
              </p>
            )}
          </div>
        )}

        {visibleHotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black font-foundation-sans">
              {hotels.length === 0
                ? 'No hotels available at the moment.'
                : 'No hotels match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleHotels.map((hotel, index) => (
              <Card
                key={hotel.slug}
                className="hover:bg-black/5 transition-all duration-200 border-2 border-black"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => {
router.push(`/hotel/${hotel.slug}`)
                  }}
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
                  <CardHeader className="mt-3">
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
