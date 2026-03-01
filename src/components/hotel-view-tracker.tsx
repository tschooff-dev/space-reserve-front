'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function HotelViewTracker({ hotelName }: { hotelName: string }) {
  useEffect(() => {
    posthog.capture('hotel_viewed', { hotel_name: hotelName })
  }, [hotelName])

  return null
}