'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import {Button} from '@/components/ui/button'

export default function ReservationSuccessPage() {
  const [booking, setBooking] = useState<{ amenityType: string; hotelName: string } | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('lastBooking')
    if (stored) {
      setBooking(JSON.parse(stored))
      sessionStorage.removeItem('lastBooking')
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
<main className="max-w-3xl mx-auto px-6 py-20 space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-black/70">Reservation</p>
          <h1 className="mt-4 text-4xl font-aileron-light uppercase tracking-[0.5em]">
            Your reservation is confirmed
          </h1>
        </div>

        <div className="pt-6">
          <Button className="rounded-none border border-black bg-black text-white uppercase tracking-[0.3em] py-4 px-8 hover:bg-white hover:text-black" asChild>
            <Link href="/reservations">Reservations</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
