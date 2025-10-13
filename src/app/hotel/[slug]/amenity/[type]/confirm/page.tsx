'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import Navigation from '@/components/navigation'
import {createClient} from '@/lib/supabase'

interface Reservation {
  hotelSlug: string
  amenityType: string
  seats: string[]
  date: string
  timeSlot: string
  hotelName: string
  amenityName: string
}

export default function ConfirmationPage() {
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const storedReservation = localStorage.getItem('reservation')
    if (storedReservation) {
      setReservation(JSON.parse(storedReservation))
    } else {
      router.push('/')
    }
  }, [router])

  const handleConfirm = async () => {
    if (!reservation) return

    setLoading(true)

    try {
      // Get current user
      const {
        data: {user},
      } = await supabase.auth.getUser()

      if (user) {
        // Insert reservation into database
        const {error} = await supabase.from('reservations').insert([
          {
            user_id: user.id,
            hotel_slug: reservation.hotelSlug,
            amenity_type: reservation.amenityType,
            seat_number: reservation.seats.join(', '),
            reservation_date: reservation.date,
            time_block: reservation.timeSlot,
          },
        ])

        if (error) {
          console.error('Error creating reservation:', error)
          alert('Error creating reservation. Please try again.')
        } else {
          // Clear localStorage and redirect to success page
          localStorage.removeItem('reservation')
          router.push('/reservations?confirmed=true')
        }
      } else {
        // Demo mode - just redirect to reservations
        localStorage.removeItem('reservation')
        router.push('/reservations?confirmed=true')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    localStorage.removeItem('reservation')
    router.back()
  }

  if (!reservation) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-black rounded-lg p-6">
          <h1 className="text-2xl font-light text-black mb-6">Confirm Your Reservation</h1>

          <div className="space-y-4 mb-8">
            <div>
              <h2 className="font-medium text-black">Hotel</h2>
              <p className="text-black/70">{reservation.hotelName}</p>
            </div>

            <div>
              <h2 className="font-medium text-black">Amenity</h2>
              <p className="text-black/70">{reservation.amenityName}</p>
            </div>

            <div>
              <h2 className="font-medium text-black">Selected Seats</h2>
              <p className="text-black/70">{reservation.seats.join(', ')}</p>
            </div>

            <div>
              <h2 className="font-medium text-black">Date</h2>
              <p className="text-black/70">
                {new Date(reservation.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <h2 className="font-medium text-black">Time Slot</h2>
              <p className="text-black/70">{reservation.timeSlot}</p>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-4 rounded-lg mb-6">
            <h3 className="font-medium text-black mb-2">Important:</h3>
            <ul className="text-black text-sm space-y-1">
              <li>• Please arrive 10 minutes before your reserved time</li>
              <li>• Cancellations must be made at least 2 hours in advance</li>
              <li>• You may reserve up to 2 seats per time slot</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-black text-white hover:bg-black/90"
            >
              {loading ? 'Confirming...' : 'Confirm Reservation'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
