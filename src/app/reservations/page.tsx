'use client'

import {useEffect, useState, useCallback, Suspense, useMemo} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {createClient} from '@/lib/supabase'
import {Button} from '@/components/ui/button'
import {Card, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import Navigation from '@/components/navigation'
import Loading from '@/components/loading'
import Image from 'next/image'
import type {User} from '@supabase/supabase-js'

interface Reservation {
  id: string
  hotel_slug: string
  amenity_type: string
  seat_number: string
  reservation_date: string
  time_block: string
  created_at: string
  // Additional data from Sanity
  hotel?: {
    name: string
    location?: string
    description?: string
    heroImage?: string
    heroImageAlt?: string
    contactInfo?: {
      phone?: string
      email?: string
      address?: string
    }
    isActive?: boolean
  }
  amenity?: {
    displayName: string
    description?: string
    layoutImage?: string
    layoutImageAlt?: string
    timeSlots?: string[]
    maxReservations?: number
    seatingLayout?: {
      totalSeats: number
      seatsPerSide: number
      seatNumbering: string
    }
    isActive?: boolean
    specialInstructions?: string
  }
}

function ReservationsContent() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [openSections, setOpenSections] = useState<{
    reservation: boolean
    hotel: boolean
    amenity: boolean
  }>({reservation: true, hotel: false, amenity: false})
  const [copiedId, setCopiedId] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const toggleSection = (section: 'reservation' | 'hotel' | 'amenity') => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const copyReservationId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const fetchReservations = useCallback(
    async (userId: string) => {
      try {
        const {data, error} = await supabase
          .from('reservations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', {ascending: false})

        if (error) {
          console.error('Error fetching reservations:', error)
          return
        }

        if (!data || data.length === 0) {
          setReservations([])
          return
        }

        // Fetch additional hotel and amenity data from API routes
        const enrichedReservations = await Promise.all(
          data.map(async (reservation) => {
            try {
              // Fetch hotel data from API route
              const hotelResponse = await fetch(`/api/hotel/${reservation.hotel_slug}`)
              const hotel = hotelResponse.ok ? await hotelResponse.json() : null

              // Fetch amenity data from API route
              const amenityResponse = await fetch(`/api/amenity/${reservation.amenity_type}`)
              const amenity = amenityResponse.ok ? await amenityResponse.json() : null

              return {
                ...reservation,
                hotel: hotel || null,
                amenity: amenity || null,
              }
            } catch (error) {
              console.error('Error fetching hotel/amenity data:', error)
              return reservation
            }
          })
        )

        setReservations(enrichedReservations)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true)
        const {
          data: {user},
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          fetchReservations(user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setUser(null)
        setLoading(false)
      }
    }

    checkUser()
  }, [fetchReservations, supabase.auth])

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return
    }

    try {
      const {error} = await supabase.from('reservations').delete().eq('id', reservationId)

      if (error) {
        console.error('Error canceling reservation:', error)
        alert('Error canceling reservation. Please try again.')
      } else {
        // Refresh reservations
        if (user) {
          fetchReservations(user.id)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const confirmed = searchParams.get('confirmed') === 'true'

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-aileron-light text-black mb-8 slide-up">My Reservations</h1>
          <div className="bg-white border border-black rounded-lg p-6 flex items-center justify-center min-h-[400px]">
            <Loading text="Loading your reservations..." size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white page-enter">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center fade-in">
            <h1 className="text-2xl font-aileron-light text-black mb-4">
              Please sign in to view your reservations
            </h1>
            <Button
              onClick={() => router.push('/sign-in')}
              className="bg-black text-white hover:bg-black/90 transition-all duration-200 hover-lift"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white page-enter">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 slide-up">
          <h1 className="text-2xl sm:text-3xl font-aileron-light text-black">My Reservations</h1>
          <Button
            onClick={() => router.push('/hotels')}
            className="bg-black text-white hover:bg-black/90 transition-all duration-200 hover-lift flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>New Reservation</span>
          </Button>
        </div>

        {confirmed && (
          <div className="bg-white border-2 border-black p-4 rounded-lg mb-6 fade-in flex items-center gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-black font-aileron-regular">Your reservation has been confirmed!</p>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-12 fade-in">
            <h2 className="text-xl font-aileron-light text-black mb-4">No reservations found</h2>
            <p className="text-black font-foundation-sans">
              Browse hotels and make your first reservation
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {reservations.map((reservation, index) => (
              <Card
                key={reservation.id}
                className="hover-glow transition-all duration-200 slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardHeader>
                  {/* Reservation Details */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg font-aileron-regular text-black capitalize truncate">
                            {reservation.amenity?.displayName || reservation.amenity_type}
                          </CardTitle>
                          <p className="text-sm sm:text-base text-black/70 capitalize font-foundation-sans truncate">
                            {reservation.hotel?.name || reservation.hotel_slug.replace('-', ' ')}
                          </p>
                          <div className="mt-2 space-y-2">
                            {reservation.reservation_date && (
                              <p className="text-sm font-aileron-regular text-black">
                                Reservation Date:{' '}
                                {new Date(
                                  reservation.reservation_date + 'T00:00:00'
                                ).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                Seat {reservation.seat_number}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {reservation.time_block}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-black/60 font-foundation-sans">
                              <span className="font-medium">Booked Date:</span>{' '}
                              {new Date(reservation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {/* Action buttons - Always in one row */}
                        <div className="flex flex-row gap-2 w-full sm:w-auto sm:ml-4">
                          <Button
                            onClick={() => {
                              setSelectedReservation(reservation)
                              setOpenSections({reservation: true, hotel: false, amenity: false})
                            }}
                            size="sm"
                            className="flex-1 sm:flex-none sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover-lift"
                          >
                            See Details
                          </Button>
                          <Button
                            onClick={() => handleCancelReservation(reservation.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none sm:w-auto text-black border-black hover:bg-black hover:text-white transition-all duration-200 hover-lift"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Details Modal with Tabs */}
        {selectedReservation && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedReservation(null)}
          >
            <div
              className="bg-white border-2 border-black max-w-2xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 sm:p-8 border-b-2 border-black">
                <h3 className="text-2xl font-aileron-regular text-black uppercase tracking-wide">
                  Details
                </h3>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="text-black hover:text-black/70 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Accordion Content */}
              <div className="overflow-y-auto flex-1">
                {/* Reservation Accordion */}
                <div className="border-b-2 border-black">
                  <button
                    onClick={() => toggleSection('reservation')}
                    className="w-full flex justify-between items-center p-6 sm:p-8 hover:bg-black/5 transition-all"
                  >
                    <h3 className="text-xl sm:text-2xl font-aileron-regular text-black uppercase tracking-wide">
                      Reservation
                    </h3>
                    <svg
                      className={`w-6 h-6 transition-transform ${openSections.reservation ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openSections.reservation && (
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                      <div className="space-y-4">
                        {/* Seat Layout Visualization */}
                        {selectedReservation.amenity?.seatingLayout && (
                          <div className="mb-6">
                            <h5 className="text-sm font-aileron-regular text-black uppercase tracking-wide mb-4">
                              Your Seat Location
                            </h5>
                            <div className="flex flex-col items-stretch gap-3 max-w-full mx-auto">
                              {/* Top Row Seats */}
                              <div className="flex justify-between gap-1">
                                {Array.from(
                                  {
                                    length:
                                      selectedReservation.amenity!.seatingLayout!.seatsPerSide,
                                  },
                                  (_, i) => i + 1
                                ).map((seatNum) => {
                                  const isSelected = selectedReservation.seat_number
                                    .split(',')
                                    .map((s) => s.trim())
                                    .includes(seatNum.toString())
                                  return (
                                    <div
                                      key={seatNum}
                                      className={`w-8 h-8 sm:w-10 sm:h-10 border-2 flex items-center justify-center text-xs sm:text-sm font-medium font-aileron-regular ${
                                        isSelected
                                          ? 'bg-black text-white border-black'
                                          : 'bg-white text-black/40 border-black/20'
                                      }`}
                                    >
                                      {seatNum}
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Pool/Amenity Area */}
                              <div className="w-full">
                                <div className="border-2 border-black bg-white h-16 sm:h-20 flex items-center justify-center">
                                  <span className="text-lg sm:text-xl font-aileron-regular text-black uppercase tracking-widest">
                                    {selectedReservation.amenity!.displayName}
                                  </span>
                                </div>
                              </div>

                              {/* Bottom Row Seats */}
                              <div className="flex justify-between gap-1">
                                {Array.from(
                                  {
                                    length:
                                      selectedReservation.amenity!.seatingLayout!.seatsPerSide,
                                  },
                                  (_, i) =>
                                    i + selectedReservation.amenity!.seatingLayout!.seatsPerSide + 1
                                ).map((seatNum) => {
                                  const isSelected = selectedReservation.seat_number
                                    .split(',')
                                    .map((s) => s.trim())
                                    .includes(seatNum.toString())
                                  return (
                                    <div
                                      key={seatNum}
                                      className={`w-8 h-8 sm:w-10 sm:h-10 border-2 flex items-center justify-center text-xs sm:text-sm font-medium font-aileron-regular ${
                                        isSelected
                                          ? 'bg-black text-white border-black'
                                          : 'bg-white text-black/40 border-black/20'
                                      }`}
                                    >
                                      {seatNum}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center py-3 border-b border-black/20">
                          <span className="text-sm font-aileron-regular text-black/70">
                            Seat Number
                          </span>
                          <span className="text-lg font-aileron-light text-black">
                            {selectedReservation.seat_number}
                          </span>
                        </div>
                        {selectedReservation.reservation_date && (
                          <div className="flex justify-between items-center py-3 border-b border-black/20">
                            <span className="text-sm font-aileron-regular text-black/70">
                              Reservation Date
                            </span>
                            <span className="text-sm font-aileron-light text-black">
                              {new Date(
                                selectedReservation.reservation_date + 'T00:00:00'
                              ).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-3 border-b border-black/20">
                          <span className="text-sm font-aileron-regular text-black/70">
                            Time Slot
                          </span>
                          <Badge variant="outline" className="text-sm">
                            {selectedReservation.time_block}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-black/20">
                          <span className="text-sm font-aileron-regular text-black/70">
                            Booked On
                          </span>
                          <span className="text-sm font-foundation-sans text-black/60">
                            {new Date(selectedReservation.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="py-3">
                          <span className="text-sm font-aileron-regular text-black/70 block mb-2">
                            Reservation ID
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs font-mono text-black/60 bg-black/5 p-2 rounded border border-black/20 break-all">
                              {selectedReservation.id}
                            </code>
                            <Button
                              onClick={() => copyReservationId(selectedReservation.id)}
                              variant="outline"
                              size="sm"
                              className="text-black border-black hover:bg-black hover:text-white transition-all"
                            >
                              {copiedId ? '✓' : 'Copy'}
                            </Button>
                          </div>
                        </div>

                        {/* Cancel Button */}
                        <div className="pt-4">
                          <Button
                            onClick={() => {
                              handleCancelReservation(selectedReservation.id)
                              setSelectedReservation(null)
                            }}
                            variant="outline"
                            className="w-full text-black border-black hover:bg-black hover:text-white transition-all"
                          >
                            Cancel Reservation
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hotel Accordion */}
                {selectedReservation.hotel && (
                  <div className="border-b-2 border-black">
                    <button
                      onClick={() => toggleSection('hotel')}
                      className="w-full flex justify-between items-center p-6 sm:p-8 hover:bg-black/5 transition-all"
                    >
                      <h3 className="text-xl sm:text-2xl font-aileron-regular text-black uppercase tracking-wide">
                        Hotel
                      </h3>
                      <svg
                        className={`w-6 h-6 transition-transform ${openSections.hotel ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openSections.hotel && (
                      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                        <div className="space-y-4">
                          {selectedReservation.hotel.heroImage && (
                            <div className="relative w-full h-64 border-2 border-black">
                              <Image
                                src={selectedReservation.hotel.heroImage}
                                alt={
                                  selectedReservation.hotel.heroImageAlt ||
                                  selectedReservation.hotel.name
                                }
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="text-2xl font-aileron-light text-black uppercase tracking-wider mb-2">
                              {selectedReservation.hotel.name}
                            </h4>
                            {selectedReservation.hotel.location && (
                              <p className="text-sm text-black/70 font-foundation-sans mb-4">
                                📍 {selectedReservation.hotel.location}
                              </p>
                            )}
                            {selectedReservation.hotel.description && (
                              <p className="text-base text-black/80 font-foundation-sans leading-relaxed mb-4">
                                {selectedReservation.hotel.description}
                              </p>
                            )}

                            {/* Contact Information */}
                            {selectedReservation.hotel.contactInfo && (
                              <div className="border-t-2 border-black pt-4 mt-4">
                                <h5 className="text-sm font-aileron-regular text-black uppercase tracking-wide mb-3">
                                  Contact Information
                                </h5>
                                <div className="space-y-2">
                                  {selectedReservation.hotel.contactInfo.phone && (
                                    <div>
                                      <a
                                        href={`tel:${selectedReservation.hotel.contactInfo.phone}`}
                                        className="text-sm font-foundation-sans text-black hover:underline"
                                      >
                                        {selectedReservation.hotel.contactInfo.phone}
                                      </a>
                                    </div>
                                  )}
                                  {selectedReservation.hotel.contactInfo.email && (
                                    <div>
                                      <a
                                        href={`mailto:${selectedReservation.hotel.contactInfo.email}`}
                                        className="text-sm font-foundation-sans text-black hover:underline"
                                      >
                                        {selectedReservation.hotel.contactInfo.email}
                                      </a>
                                    </div>
                                  )}
                                  {selectedReservation.hotel.contactInfo.address && (
                                    <div>
                                      <p className="text-sm font-foundation-sans text-black/70">
                                        {selectedReservation.hotel.contactInfo.address}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Status */}
                            {selectedReservation.hotel.isActive !== undefined && (
                              <div className="border-t-2 border-black pt-4 mt-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-aileron-regular text-black/70">
                                    Status:
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {selectedReservation.hotel.isActive
                                      ? 'Currently Accepting Reservations'
                                      : 'Not Currently Available'}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Amenity Accordion */}
                {selectedReservation.amenity && (
                  <div className="border-b-2 border-black">
                    <button
                      onClick={() => toggleSection('amenity')}
                      className="w-full flex justify-between items-center p-6 sm:p-8 hover:bg-black/5 transition-all"
                    >
                      <h3 className="text-xl sm:text-2xl font-aileron-regular text-black uppercase tracking-wide">
                        Amenity
                      </h3>
                      <svg
                        className={`w-6 h-6 transition-transform ${openSections.amenity ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openSections.amenity && (
                      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                        <div className="space-y-4">
                          {selectedReservation.amenity.layoutImage && (
                            <div className="relative w-full h-64 border-2 border-black">
                              <Image
                                src={selectedReservation.amenity.layoutImage}
                                alt={
                                  selectedReservation.amenity.layoutImageAlt ||
                                  selectedReservation.amenity.displayName
                                }
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="text-2xl font-aileron-light text-black uppercase tracking-wider mb-2">
                              {selectedReservation.amenity.displayName}
                            </h4>
                            {selectedReservation.amenity.description && (
                              <p className="text-base text-black/80 font-foundation-sans leading-relaxed mb-4">
                                {selectedReservation.amenity.description}
                              </p>
                            )}

                            {/* Available Time Slots */}
                            {selectedReservation.amenity.timeSlots &&
                              selectedReservation.amenity.timeSlots.length > 0 && (
                                <div className="border-t-2 border-black pt-4 mt-4">
                                  <h5 className="text-sm font-aileron-regular text-black uppercase tracking-wide mb-3">
                                    Available Time Slots
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedReservation.amenity.timeSlots.map((slot) => (
                                      <Badge key={slot} variant="outline" className="text-xs">
                                        {slot}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Capacity & Layout */}
                            {(selectedReservation.amenity.maxReservations ||
                              selectedReservation.amenity.seatingLayout) && (
                              <div className="border-t-2 border-black pt-4 mt-4">
                                <h5 className="text-sm font-aileron-regular text-black uppercase tracking-wide mb-3">
                                  Capacity & Layout
                                </h5>
                                <div className="space-y-2">
                                  {selectedReservation.amenity.maxReservations && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-foundation-sans text-black/70">
                                        Max per Time Slot:
                                      </span>
                                      <span className="text-sm font-aileron-light text-black">
                                        {selectedReservation.amenity.maxReservations} people
                                      </span>
                                    </div>
                                  )}
                                  {selectedReservation.amenity.seatingLayout && (
                                    <>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-foundation-sans text-black/70">
                                          Total Seats:
                                        </span>
                                        <span className="text-sm font-aileron-light text-black">
                                          {selectedReservation.amenity.seatingLayout.totalSeats}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-foundation-sans text-black/70">
                                          Seats per Side:
                                        </span>
                                        <span className="text-sm font-aileron-light text-black">
                                          {selectedReservation.amenity.seatingLayout.seatsPerSide}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Special Instructions */}
                            {selectedReservation.amenity.specialInstructions && (
                              <div className="border-t-2 border-black pt-4 mt-4">
                                <h5 className="text-sm font-aileron-regular text-black uppercase tracking-wide mb-2">
                                  Special Instructions
                                </h5>
                                <p className="text-sm text-black/70 font-foundation-sans leading-relaxed">
                                  {selectedReservation.amenity.specialInstructions}
                                </p>
                              </div>
                            )}

                            {/* Status */}
                            {selectedReservation.amenity.isActive !== undefined && (
                              <div className="border-t-2 border-black pt-4 mt-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-aileron-regular text-black/70">
                                    Status:
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {selectedReservation.amenity.isActive
                                      ? 'Currently Available'
                                      : 'Unavailable'}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-light text-black mb-4">Loading...</h1>
        </div>
      </div>
    </div>
  )
}

export default function ReservationsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReservationsContent />
    </Suspense>
  )
}
