'use client'

import {useRouter} from 'next/navigation'
import {Amenity} from '@/lib/sanity'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'

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
    <Card
      className="border-2 border-black cursor-pointer hover:bg-black/5 transition-colors"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-aileron-regular text-black text-center">
          {amenity.displayName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {amenity.description && (
          <p className="text-black/70 text-sm font-foundation-sans text-center">
            {amenity.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="text-xs font-foundation-sans text-black/60">Available Time Slots:</div>
          <div className="flex flex-wrap gap-1">
            {amenity.timeSlots.slice(0, 3).map((slot, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {slot}
              </Badge>
            ))}
            {amenity.timeSlots.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{amenity.timeSlots.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            Max {amenity.maxReservations} per slot
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
