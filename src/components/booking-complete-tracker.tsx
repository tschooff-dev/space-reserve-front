'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function BookingCompleteTracker({ amenityType, hotelName }: { amenityType: string; hotelName: string }) {
  useEffect(() => {
    posthog.capture('booking_completed', { amenity_type: amenityType, hotel_name: hotelName })
  }, [amenityType, hotelName])

  return null
}
