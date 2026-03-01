'use client'

import {useEffect, useState, useCallback, Suspense, useMemo} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase'
import {Button} from '@/components/ui/button'
import {Card, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import Navigation from '@/components/navigation'
import LoadingSpinner from '@/components/loading'
import Image from 'next/image'
import type {User} from '@supabase/supabase-js'
import posthog from 'posthog-js'

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

const formatTimeBlock = (block: string) => block.replace(/\s*-\s*/g, ' - ')

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
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()
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

  const handleCancelReservation = async () => {
    if (!reservationToCancel) return

    setIsCancelling(true)
    try {
      const {error} = await supabase.from('reservations').delete().eq('id', reservationToCancel.id)

      if (error) {
        console.error('Error canceling reservation:', error)
        posthog.captureException(error)
        alert('Error canceling reservation. Please try again.')
      } else {
        posthog.capture('reservation_cancelled', {
          reservation_id: reservationToCancel.id,
          hotel_slug: reservationToCancel.hotel_slug,
          hotel_name: reservationToCancel.hotel?.name,
          amenity_type: reservationToCancel.amenity_type,
          amenity_name: reservationToCancel.amenity?.displayName,
          seat_number: reservationToCancel.seat_number,
          reservation_date: reservationToCancel.reservation_date,
          time_block: reservationToCancel.time_block,
        })
        if (user) {
          fetchReservations(user.id)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      posthog.captureException(error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsCancelling(false)
      setReservationToCancel(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-aileron-light text-black mb-8 slide-up uppercase tracking-[0.3em]">
            Reservations
          </h1>
          <div className="bg-white border border-black rounded-none p-6 flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
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
            <h1 className="text-2xl font-aileron-light text-black mb-4 uppercase tracking-[0.3em]">
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
        <div className="flex flex-col gap-4 mb-10 slide-up">
          <h1 className="text-2xl sm:text-3xl font-aileron-light text-black uppercase tracking-[0.3em]">
            Reservations
          </h1>
          <p className="text-sm font-aileron-regular text-black uppercase tracking-[0.3em]">Pool</p>
        </div>

        <div className="border border-black p-8 flex flex-col gap-6 fade-in mb-10">
          <div>
            <p className="text-xs font-aileron-regular uppercase tracking-[0.3em] text-black/70">
              Pool
            </p>
            <p className="mt-4 text-3xl font-aileron-light text-black">Reserve a private space</p>
          </div>
          <Button
            onClick={() => router.push('/hotels')}
            className="border border-black bg-white text-black rounded-none uppercase tracking-[0.3em] py-4 hover:bg-black hover:text-white transition-colors"
          >
            Continue
          </Button>
        </div>

        {reservations.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {reservations.map((reservation, index) => (
              <Card
                key={reservation.id}
                className="border border-black rounded-none transition-all duration-200 slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardHeader className="p-6 sm:p-8">
                  <div className="flex flex-col gap-5">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-aileron-regular text-black uppercase tracking-[0.3em]">
                        {reservation.amenity?.displayName || reservation.amenity_type}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-black/70 uppercase tracking-[0.3em]">
                        {reservation.hotel?.name || reservation.hotel_slug.replace('-', ' ')}
                      </p>
                    </div>
                    <div className="space-y-1 text-sm font-aileron-regular">
                      {reservation.reservation_date && (
                        <p>
                          {new Date(reservation.reservation_date + 'T00:00:00').toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      )}
                      <p>{formatTimeBlock(reservation.time_block)}</p>
                      <p>Seat {reservation.seat_number}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => {
                          posthog.capture('reservation_details_viewed', {
                            reservation_id: reservation.id,
                            hotel_slug: reservation.hotel_slug,
                            hotel_name: reservation.hotel?.name,
                            amenity_type: reservation.amenity_type,
                            amenity_name: reservation.amenity?.displayName,
                            reservation_date: reservation.reservation_date,
                            time_block: reservation.time_block,
                          })
                          setSelectedReservation(reservation)
                          setOpenSections({reservation: true, hotel: false, amenity: false})
                        }}
                        className="flex-1 border border-black bg-black text-white rounded-none uppercase tracking-[0.3em] py-3 hover:bg-white hover:text-black transition-colors"
                      >
                        Details
                      </Button>
                      <Button
                        onClick={() => setReservationToCancel(reservation)}
                        className="flex-1 border border-black bg-white text-black rounded-none uppercase tracking-[0.3em] py-3 hover:bg-black hover:text-white transition-colors"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {reservationToCancel && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isCancelling && setReservationToCancel(null)}
          >
            <div
              className="bg-white border-2 border-black w-full max-w-lg sm:max-w-xl p-8 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-black/60">
                  Cancel Reservation
                </p>
                <h3 className="text-2xl font-aileron-light text-black">Are you sure?</h3>
                <p className="text-sm text-black/70 font-aileron-regular">
                  This will release your reserved seat for other guests.
                </p>
              </div>

              <div className="text-sm text-black font-aileron-regular space-y-1">
                <p className="uppercase tracking-[0.3em]">
                  {reservationToCancel.hotel?.name ||
                    reservationToCancel.hotel_slug.replace('-', ' ')}
                </p>
                <p>
                  {reservationToCancel.amenity?.displayName || reservationToCancel.amenity_type}
                </p>
                {reservationToCancel.reservation_date && (
                  <p>
                    {new Date(
                      reservationToCancel.reservation_date + 'T00:00:00'
                    ).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
                <p>{formatTimeBlock(reservationToCancel.time_block)}</p>
                <p>Seat {reservationToCancel.seat_number}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setReservationToCancel(null)}
                  disabled={isCancelling}
                  className="flex-1 border border-black bg-white text-black rounded-none uppercase tracking-[0.3em] py-3 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                >
                  Keep Reservation
                </Button>
                <Button
                  onClick={handleCancelReservation}
                  disabled={isCancelling}
                  className="flex-1 border border-black bg-black text-white rounded-none uppercase tracking-[0.3em] py-3 hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                >
                  {isCancelling ? 'Canceling...' : 'Cancel Reservation'}
                </Button>
              </div>
            </div>
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
                              setReservationToCancel(selectedReservation)
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
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center">
        <LoadingSpinner />
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
