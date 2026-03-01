'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function AmenityViewTracker({ hotelName, amenityType }: { hotelName: string; amenityType: string }) {
  useEffect(() => {
    posthog.capture('amenity_viewed', { hotel_name: hotelName, amenity_type: amenityType })
  }, [hotelName, amenityType])

  return null
}
