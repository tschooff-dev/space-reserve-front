'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

interface ConfirmTrackerProps {
  amenityType: string
  date: string
  timeSlot: string
  seats: string[]
}

export default function ConfirmTracker({ amenityType, date, timeSlot, seats }: ConfirmTrackerProps) {
  useEffect(() => {
    posthog.capture('reservation_confirmed', {
      amenity_type: amenityType,
      date,
      time_slot: timeSlot,
      seats,
    })
  }, [amenityType, date, timeSlot, seats])

  return null
}
