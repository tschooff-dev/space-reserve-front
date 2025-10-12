'use client'

import {useEffect, useState, useCallback, Suspense} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {createClient} from '@/lib/supabase'
import {Button} from '@/components/ui/button'
import {Card, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import Navigation from '@/components/navigation'
import Loading from '@/components/loading'
import type {User} from '@supabase/supabase-js'

interface Reservation {
  id: string
  hotel_slug: string
  amenity_type: string
  seat_number: string
  time_block: string
  created_at: string
  // Additional data from Sanity
  hotel?: {
    name: string
    heroImage?: string
    heroImageAlt?: string
  }
  amenity?: {
    displayName: string
    layoutImage?: string
    layoutImageAlt?: string
  }
}

function ReservationsContent() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const fetchReservations = useCallback(async (userId: string) => {
    try {
      const {data, error} = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {ascending: false})

      if (error) {
        console.error('Error fetching reservations:', error)
        return
      }

      if (!data || data.length === 0) {
        setReservations([])
        return
      }

      // Fetch additional hotel and amenity data from API routes
      const enrichedReservations = await Promise.all(
        data.map(async (reservation) => {
          try {
            // Fetch hotel data from API route
            const hotelResponse = await fetch(`/api/hotel/${reservation.hotel_slug}`)
            const hotel = hotelResponse.ok ? await hotelResponse.json() : null

            // Fetch amenity data from API route
            const amenityResponse = await fetch(`/api/amenity/${reservation.amenity_type}`)
            const amenity = amenityResponse.ok ? await amenityResponse.json() : null

            return {
              ...reservation,
              hotel: hotel || null,
              amenity: amenity || null,
            }
          } catch (error) {
            console.error('Error fetching hotel/amenity data:', error)
            return reservation
          }
        })
      )

      setReservations(enrichedReservations)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true)
        const {
          data: {user},
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          fetchReservations(user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setUser(null)
        setLoading(false)
      }
    }

    checkUser()
  }, [fetchReservations])

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return
    }

    try {
      const {error} = await supabase.from('reservations').delete().eq('id', reservationId)

      if (error) {
        console.error('Error canceling reservation:', error)
        alert('Error canceling reservation. Please try again.')
      } else {
        // Refresh reservations
        if (user) {
          fetchReservations(user.id)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const confirmed = searchParams.get('confirmed') === 'true'

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-aileron-light text-black mb-8 slide-up">My Reservations</h1>
          <div className="bg-white border border-black rounded-lg p-6 flex items-center justify-center min-h-[400px]">
            <Loading text="Loading your reservations..." size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white page-enter">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center fade-in">
            <h1 className="text-2xl font-aileron-light text-black mb-4">
              Please sign in to view your reservations
            </h1>
            <Button
              onClick={() => router.push('/sign-in')}
              className="bg-black text-white hover:bg-black/90 transition-all duration-200 hover-lift"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white page-enter">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 slide-up">
          <h1 className="text-2xl sm:text-3xl font-aileron-light text-black">My Reservations</h1>
          <Button
            onClick={() => router.push('/hotels')}
            className="bg-black text-white hover:bg-black/90 transition-all duration-200 hover-lift flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>New Reservation</span>
          </Button>
        </div>

        {confirmed && (
          <div className="bg-white border-2 border-black p-4 rounded-lg mb-6 fade-in flex items-center gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-black font-aileron-regular">Your reservation has been confirmed!</p>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-12 fade-in">
            <h2 className="text-xl font-aileron-light text-black mb-4">No reservations found</h2>
            <p className="text-black mb-6 font-foundation-sans">
              Browse hotels and make your first reservation
            </p>
            <Button
              onClick={() => router.push('/hotels')}
              className="bg-black text-white hover:bg-black/90 transition-all duration-200 hover-lift flex items-center gap-2 mx-auto"
            >
              <span className="text-lg">+</span>
              <span>New Reservation</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {reservations.map((reservation, index) => (
              <Card
                key={reservation.id}
                className="hover-glow transition-all duration-200 slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardHeader>
                  {/* Reservation Details */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg font-aileron-regular text-black capitalize truncate">
                            {reservation.amenity?.displayName || reservation.amenity_type}
                          </CardTitle>
                          <p className="text-sm sm:text-base text-black/70 capitalize font-foundation-sans truncate">
                            {reservation.hotel?.name || reservation.hotel_slug.replace('-', ' ')}
                          </p>
                          <div className="mt-2 space-y-2">
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                Seat {reservation.seat_number}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {reservation.time_block}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-black/60 font-foundation-sans">
                              <span className="font-medium">Booked:</span>{' '}
                              {new Date(reservation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {/* Cancel button - Full width on mobile, auto on desktop */}
                        <div className="w-full sm:w-auto sm:ml-4">
                          <Button
                            onClick={() => handleCancelReservation(reservation.id)}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-black border-black hover:bg-black hover:text-white transition-all duration-200 hover-lift"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-light text-black mb-4">Loading...</h1>
        </div>
      </div>
    </div>
  )
}

export default function ReservationsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReservationsContent />
    </Suspense>
  )
}
