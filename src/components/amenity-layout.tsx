'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Hotel, Amenity } from '@/lib/sanity'
import { Button } from '@/components/ui/button'

interface AmenityLayoutProps {
  hotel: Hotel
  amenity: Amenity
}

export default function AmenityLayout({ hotel, amenity }: AmenityLayoutProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const router = useRouter()

  // Generate seat numbers based on the seating layout
  const generateSeats = () => {
    const seats: string[] = []
    const { totalSeats, seatNumbering } = amenity.seatingLayout
    
    if (seatNumbering === 'alphabetical-number') {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
      const seatsPerLetter = Math.ceil(totalSeats / letters.length)
      
      for (let i = 0; i < totalSeats; i++) {
        const letterIndex = Math.floor(i / seatsPerLetter)
        const number = (i % seatsPerLetter) + 1
        seats.push(`${letters[letterIndex]}${number}`)
      }
    } else {
      // Sequential numbering
      for (let i = 1; i <= totalSeats; i++) {
        seats.push(i.toString())
      }
    }
    
    return seats
  }

  const seats = generateSeats()
  const leftSeats = seats.slice(0, amenity.seatingLayout.seatsPerSide)
  const rightSeats = seats.slice(amenity.seatingLayout.seatsPerSide)

  const handleSeatClick = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber))
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
      localStorage.setItem('reservation', JSON.stringify({
        hotelSlug: hotel.slug,
        amenityType: amenity.type,
        seats: selectedSeats,
        timeSlot: selectedTimeSlot,
        hotelName: hotel.name,
        amenityName: amenity.displayName
      }))
      
      router.push(`/hotel/${hotel.slug}/amenity/${amenity.type}/confirm`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-black mb-2">
          {amenity.displayName}
        </h1>
        <p className="text-gray-600">
          {hotel.name}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Layout Visualization */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-black">Select Your Seats</h2>
          
          {/* Pool/Amenity Layout */}
          <div className="relative bg-blue-100 p-8 rounded-lg">
            {amenity.layoutImage && (
              <Image
                src={amenity.layoutImage}
                alt={amenity.layoutImageAlt || `${amenity.displayName} layout`}
                width={400}
                height={200}
                className="mx-auto mb-4"
              />
            )}
            
            {/* Seats Layout */}
            <div className="flex justify-between items-center">
              {/* Left Side Seats */}
              <div className="flex flex-col space-y-2">
                {leftSeats.map((seat) => (
                  <button
                    key={seat}
                    onClick={() => handleSeatClick(seat)}
                    className={`w-12 h-12 rounded border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      selectedSeats.includes(seat)
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {seat}
                  </button>
                ))}
              </div>

              {/* Pool/Amenity Area */}
              <div className="flex-1 mx-8 bg-blue-200 rounded-lg h-32 flex items-center justify-center">
                <span className="text-blue-800 font-medium">
                  {amenity.displayName}
                </span>
              </div>

              {/* Right Side Seats */}
              <div className="flex flex-col space-y-2">
                {rightSeats.map((seat) => (
                  <button
                    key={seat}
                    onClick={() => handleSeatClick(seat)}
                    className={`w-12 h-12 rounded border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      selectedSeats.includes(seat)
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {seat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedSeats.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-black mb-2">Selected Seats:</h3>
              <p className="text-gray-700">
                {selectedSeats.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Time Selection */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-black">Select Time Slot</h2>
          
          <div className="grid gap-3">
            {amenity.timeSlots.map((timeSlot) => (
              <button
                key={timeSlot}
                onClick={() => handleTimeSlotSelect(timeSlot)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedTimeSlot === timeSlot
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">{timeSlot}</div>
                <div className="text-sm opacity-75">
                  Available ({amenity.maxReservations} max)
                </div>
              </button>
            ))}
          </div>

          {/* Special Instructions */}
          {amenity.specialInstructions && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Important Notes:</h3>
              <p className="text-yellow-700 text-sm">
                {amenity.specialInstructions}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={selectedSeats.length === 0 || !selectedTimeSlot}
            className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Confirmation
          </Button>
        </div>
      </div>
    </div>
  )
}
