'use client'

import {useEffect, useState, useMemo} from 'react'
import {useRouter} from 'next/navigation'
import Navigation from '@/components/navigation'
import {Button} from '@/components/ui/button'
import {createClient} from '@/lib/supabase'
import posthog from 'posthog-js'

interface ReservationDraft {
  hotelSlug: string
  amenityType: string
  seats: string[]
  date: string
  timeSlot: string
  hotelName: string
  amenityName: string
}

const formatDisplayDate = (value: string) =>
  new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

const formatTimeSlot = (slot: string) => slot.replace(/\s*-\s*/g, ' - ')

export default function ConfirmationPage() {
  const [reservation, setReservation] = useState<ReservationDraft | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const storedReservation = localStorage.getItem('reservation')
    if (!storedReservation) {
      router.push('/')
      return
    }
    setReservation(JSON.parse(storedReservation))
  }, [router])

  const handleConfirm = async () => {
    if (!reservation) return
    setLoading(true)

    try {
      const {
        data: {user},
      } = await supabase.auth.getUser()

      if (user) {
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
          posthog.captureException(error)
          alert('Unable to confirm right now. Please try again.')
          return
        }

        posthog.capture('reservation_confirmed', {
          hotel_slug: reservation.hotelSlug,
          hotel_name: reservation.hotelName,
          amenity_type: reservation.amenityType,
          amenity_name: reservation.amenityName,
          seats: reservation.seats,
          seat_count: reservation.seats.length,
          date: reservation.date,
          time_slot: reservation.timeSlot,
        })
      }

      localStorage.removeItem('reservation')
      router.push(
        `/hotel/${reservation.hotelSlug}/amenity/${reservation.amenityType}/confirm/success`
      )
    } catch (error) {
      console.error('Error:', error)
      posthog.captureException(error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    localStorage.removeItem('reservation')
    router.back()
  }

  if (!reservation) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10 space-y-3">
          <p className="text-sm uppercase tracking-[0.4em]">{reservation.hotelName}</p>
          <h1 className="text-4xl font-aileron-light uppercase tracking-[0.5em]">
            Confirm Reservation
          </h1>
        </div>

        <section className="border border-black p-8 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-black/60">Amenity</p>
            <p className="text-2xl font-aileron-light uppercase tracking-[0.4em]">
              {reservation.amenityName}
            </p>
          </div>

          <div className="grid gap-4 text-xs uppercase tracking-[0.3em] text-black/70">
            <div className="flex justify-between border-b border-black/20 pb-3">
              <span>Selection</span>
              <span className="text-black">{reservation.seats.join(', ')}</span>
            </div>
            <div className="flex justify-between border-b border-black/20 pb-3">
              <span>Date</span>
              <span className="text-black">{formatDisplayDate(reservation.date)}</span>
            </div>
            <div className="flex justify-between border-b border-black/20 pb-3">
              <span>Time</span>
              <span className="text-black">{formatTimeSlot(reservation.timeSlot)}</span>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="rounded-none border border-black text-black uppercase tracking-[0.3em] py-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-none border border-black bg-black text-white uppercase tracking-[0.3em] py-4 disabled:opacity-40"
          >
            {loading ? 'Confirming…' : 'Confirm Reservation'}
          </Button>
        </div>
      </main>
    </div>
  )
}
