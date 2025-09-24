'use client'

import {useRouter} from 'next/navigation'
import {Amenity} from '@/lib/sanity'

interface AmenityCardProps {
  amenity: Amenity
  hotelSlug: string
}

export default function AmenityCard({amenity, hotelSlug}: AmenityCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/hotel/${hotelSlug}/amenity/${amenity.type}`)
  }

  return (
    <div
      className="border-2 border-black p-6 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      <h3 className="text-2xl font-aileron-regular text-black mb-4 text-center">{amenity.displayName}</h3>

      {amenity.description && (
        <p className="text-gray-600 text-sm font-foundation-sans mb-4 text-center">{amenity.description}</p>
      )}

      <div className="space-y-2">
        <div className="text-xs font-foundation-sans text-gray-500">Available Time Slots:</div>
        <div className="flex flex-wrap gap-1">
          {amenity.timeSlots.slice(0, 3).map((slot, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-foundation-sans">
              {slot}
            </span>
          ))}
          {amenity.timeSlots.length > 3 && (
            <span className="text-gray-500 text-xs font-foundation-sans px-2 py-1">
              +{amenity.timeSlots.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className="text-xs font-foundation-sans text-gray-500">Max {amenity.maxReservations} per slot</span>
      </div>
    </div>
  )
}
