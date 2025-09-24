import Image from 'next/image'
import {Hotel} from '@/lib/sanity'

interface HotelHeaderProps {
  hotel: Hotel
}

export default function HotelHeader({hotel}: HotelHeaderProps) {
  return (
    <div className="relative h-96 w-full">
      {hotel.heroImage && (
        <Image
          src={hotel.heroImage}
          alt={hotel.heroImageAlt || hotel.name}
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-brand-hero mb-4">{hotel.name}</h1>
          {hotel.description && (
            <p className="text-lg md:text-xl font-aileron-light max-w-2xl mx-auto">{hotel.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
