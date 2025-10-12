'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Hotel, Amenity} from '@/lib/sanity'
import {Button} from '@/components/ui/button'

interface AmenityLayoutProps {
  hotel: Hotel
  amenity: Amenity
}

export default function AmenityLayout({hotel, amenity}: AmenityLayoutProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const router = useRouter()

  // Generate simple numbered seats (1, 2, 3...)
  const generateSeats = () => {
    const seats: string[] = []
    const {totalSeats} = amenity.seatingLayout

    for (let i = 1; i <= totalSeats; i++) {
      seats.push(i.toString())
    }

    return seats
  }

  const seats = generateSeats()
  const topSeats = seats.slice(0, Math.floor(seats.length / 2))
  const bottomSeats = seats.slice(Math.floor(seats.length / 2))

  const handleSeatClick = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber))
    } else if (selectedSeats.length < 2) {
      setSelectedSeats([...selectedSeats, seatNumber])
    }
  }

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
  }

  const handleContinue = () => {
    if (selectedSeats.length > 0 && selectedTimeSlot) {
      // Store selection in localStorage for demo purposes
      localStorage.setItem(
        'reservation',
        JSON.stringify({
          hotelSlug: hotel.slug,
          amenityType: amenity.type,
          seats: selectedSeats,
          timeSlot: selectedTimeSlot,
          hotelName: hotel.name,
          amenityName: amenity.displayName,
        })
      )

      router.push(`/hotel/${hotel.slug}/amenity/${amenity.type}/confirm`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-aileron-light text-black mb-2 uppercase tracking-wider">
          {amenity.displayName}
        </h1>
        <p className="text-black/70 font-foundation-sans uppercase tracking-wide text-sm">
          {hotel.name}
        </p>
      </div>

      <div className="space-y-8 sm:space-y-12">
        {/* Seat Selection - Ticketmaster Style */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-aileron-regular text-black uppercase tracking-wide">
            Select Your Seats
          </h2>

          {/* Horizontal Layout with Pool in Center */}
          <div className="flex flex-col items-stretch gap-4 sm:gap-6 py-8 max-w-5xl mx-auto w-full">
            {/* Top Row Seats */}
            <div className="flex justify-between">
              {topSeats.map((seat) => (
                <button
                  key={seat}
                  onClick={() => handleSeatClick(seat)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-sm sm:text-base font-medium font-aileron-regular transition-all ${
                    selectedSeats.includes(seat)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-black hover:text-white'
                  }`}
                >
                  {seat}
                </button>
              ))}
            </div>

            {/* Pool Rectangle - Long Horizontal */}
            <div className="w-full">
              <div className="border-2 border-black bg-white h-24 sm:h-32 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-aileron-regular text-black uppercase tracking-widest">
                  POOL
                </span>
              </div>
            </div>

            {/* Bottom Row Seats */}
            <div className="flex justify-between">
              {bottomSeats.map((seat) => (
                <button
                  key={seat}
                  onClick={() => handleSeatClick(seat)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-sm sm:text-base font-medium font-aileron-regular transition-all ${
                    selectedSeats.includes(seat)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-black hover:text-white'
                  }`}
                >
                  {seat}
                </button>
              ))}
            </div>
          </div>

          {/* Selection Summary */}
          {selectedSeats.length > 0 && (
            <div className="bg-white border-2 border-black p-4 sm:p-6">
              <p className="font-aileron-regular text-black">
                <span className="uppercase tracking-wide text-sm">Selected Seats:</span>{' '}
                <span className="font-aileron-light text-lg">{selectedSeats.join(', ')}</span>
              </p>
            </div>
          )}
        </div>

        {/* Time Selection */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-aileron-regular text-black uppercase tracking-wide">
            Select Time
          </h2>

          <div className="grid gap-3 sm:gap-4">
            {amenity.timeSlots.map((timeSlot) => (
              <button
                key={timeSlot}
                onClick={() => handleTimeSlotSelect(timeSlot)}
                className={`p-4 sm:p-6 border-2 text-left transition-all ${
                  selectedTimeSlot === timeSlot
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                <div className="font-aileron-regular text-lg sm:text-xl">{timeSlot}</div>
              </button>
            ))}
          </div>

          {/* Special Instructions */}
          {amenity.specialInstructions && (
            <div className="bg-white border-2 border-black p-4 sm:p-6">
              <h3 className="font-aileron-regular text-black mb-2 uppercase tracking-wide text-sm">
                Important Notes
              </h3>
              <p className="text-black font-foundation-sans text-sm">
                {amenity.specialInstructions}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={selectedSeats.length === 0 || !selectedTimeSlot}
            className="w-full bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed h-12 sm:h-14 text-base sm:text-lg font-aileron-regular uppercase tracking-wide"
          >
            Continue to Confirmation
          </Button>
        </div>
      </div>
    </div>
  )
}
