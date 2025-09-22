'use client'

import {useEffect, useState, useCallback, Suspense} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {createClient} from '@/lib/supabase'
import {Button} from '@/components/ui/button'
import Navigation from '@/components/navigation'
import type {User} from '@supabase/supabase-js'

interface Reservation {
  id: string
  hotel_slug: string
  amenity_type: string
  seat_number: string
  time_block: string
  created_at: string
}

function ReservationsContent() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const fetchReservations = useCallback(
    async (userId: string) => {
      try {
        const {data, error} = await supabase
          .from('reservations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', {ascending: false})

        if (error) {
          console.error('Error fetching reservations:', error)
        } else {
          setReservations(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {user},
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        fetchReservations(user.id)
      } else {
        setLoading(false)
      }
    }

    checkUser()
  }, [supabase, fetchReservations])

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
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-light text-black mb-4">
              Please sign in to view your reservations
            </h1>
            <Button
              onClick={() => router.push('/sign-in')}
              className="bg-black text-white hover:bg-gray-800"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-light text-black mb-8">My Reservations</h1>

        {confirmed && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <p className="text-green-800">✅ Your reservation has been confirmed!</p>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-light text-gray-600 mb-4">No reservations found</h2>
            <p className="text-gray-500 mb-6">Start by making a reservation at your hotel</p>
            <Button
              onClick={() => router.push('/hotel/aman-new-york')}
              className="bg-black text-white hover:bg-gray-800"
            >
              Browse Amenities
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-black capitalize">
                      {reservation.amenity_type}
                    </h3>
                    <p className="text-gray-600 capitalize">
                      {reservation.hotel_slug.replace('-', ' ')}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Seats:</span> {reservation.seat_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Time:</span> {reservation.time_block}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Booked:</span>{' '}
                        {new Date(reservation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => handleCancelReservation(reservation.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
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
