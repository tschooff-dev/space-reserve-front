'use client'

import {useState, useEffect, useMemo} from 'react'
import {useRouter} from 'next/navigation'
import {Hotel, Amenity} from '@/lib/sanity'
import {Button} from '@/components/ui/button'
import {createClient} from '@/lib/supabase'

interface AmenityLayoutProps {
  hotel: Hotel
  amenity: Amenity
}

const formatTimeSlot = (slot: string) => slot.replace(/\s*-\s*/g, ' - ')

const formatDisplayDate = (value: string) =>
  new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

export default function AmenityLayout({hotel, amenity}: AmenityLayoutProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [reservedSeats, setReservedSeats] = useState<string[]>([])
  const [loadingReservations, setLoadingReservations] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const generateSeats = () => {
    const seats: string[] = []
    const {totalSeats} = amenity.seatingLayout

    for (let i = 1; i <= totalSeats; i++) {
      seats.push(i.toString())
    }

    return seats
  }

  const seats = generateSeats()
  const midpoint = Math.floor(seats.length / 2)
  const topSeats = seats.slice(0, midpoint)
  const bottomSeats = seats.slice(midpoint)

  const handleSeatClick = (seatNumber: string) => {
    if (reservedSeats.includes(seatNumber)) {
      return
    }

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber))
    } else if (selectedSeats.length < 2) {
      setSelectedSeats([...selectedSeats, seatNumber])
    }
  }

  useEffect(() => {
    const fetchReservedSeats = async () => {
      if (!selectedDate || !selectedTimeSlot) {
        setReservedSeats([])
        return
      }

      setLoadingReservations(true)
      try {
        const {data, error} = await supabase
          .from('reservations')
          .select('seat_number')
          .eq('hotel_slug', hotel.slug)
          .eq('amenity_type', amenity.type)
          .eq('reservation_date', selectedDate)
          .eq('time_block', selectedTimeSlot)

        if (error) {
          console.error('Error fetching reservations:', error)
          setReservedSeats([])
        } else if (data) {
          const reserved = data.flatMap((reservation) =>
            reservation.seat_number.split(',').map((seat: string) => seat.trim())
          )
          setReservedSeats(reserved)
          setSelectedSeats((prev) => prev.filter((seat) => !reserved.includes(seat)))
        }
      } catch (error) {
        console.error('Error:', error)
        setReservedSeats([])
      } finally {
        setLoadingReservations(false)
      }
    }

    fetchReservedSeats()
  }, [selectedDate, selectedTimeSlot, hotel.slug, amenity.type, supabase])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
  }

  const handleContinue = () => {
    if (selectedSeats.length > 0 && selectedDate && selectedTimeSlot) {
      localStorage.setItem(
        'reservation',
        JSON.stringify({
          hotelSlug: hotel.slug,
          amenityType: amenity.type,
          seats: selectedSeats,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          hotelName: hotel.name,
          amenityName: amenity.displayName,
        })
      )

      router.push(`/hotel/${hotel.slug}/amenity/${amenity.type}/confirm`)
    }
  }

  const getTodayDate = () => new Date().toISOString().split('T')[0]

  const getMaxDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  const canSelectSeats = Boolean(selectedDate && selectedTimeSlot)
  const canContinue = selectedSeats.length > 0 && canSelectSeats

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 py-10 sm:py-14 min-h-[calc(100vh-200px)]">
      <div className="mb-12 space-y-2">
        <p className="text-sm font-aileron-regular text-black/70 uppercase tracking-[0.4em]">
          {hotel.name}
        </p>
        <h1 className="text-4xl sm:text-5xl font-aileron-light text-black uppercase tracking-[0.5em]">
          {amenity.displayName}
        </h1>
      </div>

      <div className="space-y-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="border border-black p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-black/60">Date</p>
            <input
              type="date"
              id="reservation-date"
              value={selectedDate}
              onChange={handleDateChange}
              onClick={(e) => e.currentTarget.showPicker?.()}
              min={getTodayDate()}
              max={getMaxDate()}
              required
              className="w-full border border-black px-4 py-3 bg-white text-black font-aileron-regular text-base uppercase tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-black appearance-none cursor-pointer"
            />
            {selectedDate && (
              <p className="text-xs text-black/60 uppercase tracking-[0.3em]">
                {formatDisplayDate(selectedDate)}
              </p>
            )}
          </div>

          <div className="border border-black p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-black/60">Time</p>
            <div className="flex flex-col gap-3">
              {amenity.timeSlots.map((timeSlot) => {
                const selected = selectedTimeSlot === timeSlot
                return (
                  <button
                    key={timeSlot}
                    onClick={() => handleTimeSlotSelect(timeSlot)}
                    disabled={!selectedDate}
                    className={`border border-black px-4 py-4 text-left uppercase tracking-[0.3em] text-sm transition-colors ${
                      selected
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-black hover:text-white'
                    } ${!selectedDate ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-lg font-aileron-regular">{formatTimeSlot(timeSlot)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="border border-black p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs uppercase tracking-[0.3em] text-black/60 gap-2">
            <span>Seats</span>
            {canSelectSeats && selectedDate && (
              <span>
                {formatDisplayDate(selectedDate)} · {formatTimeSlot(selectedTimeSlot)}
              </span>
            )}
          </div>

          {!canSelectSeats ? (
            <p className="text-sm font-aileron-regular text-black/60">
              Choose a date and time to preview available seating.
            </p>
          ) : (
            <div className="space-y-6">
              {loadingReservations && (
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">
                  Checking availability
                </p>
              )}

              <div className="flex flex-col items-center gap-5">
                <div className="flex flex-wrap justify-center gap-2">
                  {topSeats.map((seat) => {
                    const isReserved = reservedSeats.includes(seat)
                    const isSelected = selectedSeats.includes(seat)
                    return (
                      <button
                        key={seat}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isReserved}
                        className={`w-10 h-10 sm:w-12 sm:h-12 border text-xs font-aileron-regular tracking-[0.2em] transition-colors ${
                          isSelected
                            ? 'bg-black text-white border-black'
                            : isReserved
                              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed line-through'
                              : 'bg-white text-black border-black hover:bg-black hover:text-white'
                        }`}
                        title={isReserved ? 'Already reserved' : 'Available'}
                      >
                        {seat}
                      </button>
                    )
                  })}
                </div>

                <div className="w-full border border-black h-14 sm:h-16 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-aileron-regular text-black uppercase tracking-[0.6em]">
                    POOL
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {bottomSeats.map((seat) => {
                    const isReserved = reservedSeats.includes(seat)
                    const isSelected = selectedSeats.includes(seat)
                    return (
                      <button
                        key={seat}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isReserved}
                        className={`w-10 h-10 sm:w-12 sm:h-12 border text-xs font-aileron-regular tracking-[0.2em] transition-colors ${
                          isSelected
                            ? 'bg-black text-white border-black'
                            : isReserved
                              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed line-through'
                              : 'bg-white text-black border-black hover:bg-black hover:text-white'
                        }`}
                        title={isReserved ? 'Already reserved' : 'Available'}
                      >
                        {seat}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-black/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border border-black bg-white"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border border-black bg-black"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border border-gray-300 bg-gray-100"></div>
                  <span>Reserved</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedSeats.length > 0 && (
          <div className="border border-black p-6 flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-black/70">
            <p>
              Seats <span className="text-black ml-1">{selectedSeats.join(', ')}</span>
            </p>
            <p>
              Date{' '}
              <span className="text-black ml-1">
                {selectedDate ? formatDisplayDate(selectedDate) : 'Select a date'}
              </span>
            </p>
            <p>
              Time <span className="text-black ml-1">{formatTimeSlot(selectedTimeSlot)}</span>
            </p>
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full border border-black bg-black text-white rounded-none uppercase tracking-[0.3em] py-4 text-sm sm:text-base disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue to Confirmation
        </Button>
      </div>
    </div>
  )
}
