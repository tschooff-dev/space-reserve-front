import {supabase} from '@/lib/supabase'
import {sanityClient, queries} from '@/lib/sanity'
import type Anthropic from '@anthropic-ai/sdk'

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'check_availability',
    description:
      'Check real-time seat availability for a hotel amenity on a specific date. Returns available seat counts per time slot. Use this whenever a guest asks about availability, open slots, or whether something is booked.',
    input_schema: {
      type: 'object',
      properties: {
        hotel_slug: {
          type: 'string',
          description: 'The hotel slug identifier (e.g. "grand-budapest-hotel")',
        },
        amenity_type: {
          type: 'string',
          description: 'The amenity type key (e.g. "spa", "pool", "gym")',
        },
        date: {
          type: 'string',
          description: 'Date to check in YYYY-MM-DD format',
        },
      },
      required: ['hotel_slug', 'amenity_type', 'date'],
    },
  },
  {
    name: 'get_hotel_amenities',
    description:
      'Get the list of amenities available at a hotel, including time slots and total seat capacity. Use this when a guest asks what amenities a hotel offers, or before checking availability if you need to know valid amenity types.',
    input_schema: {
      type: 'object',
      properties: {
        hotel_slug: {
          type: 'string',
          description: 'The hotel slug identifier',
        },
      },
      required: ['hotel_slug'],
    },
  },
]

type ToolInput = Record<string, string>

export async function executeToolCall(toolName: string, input: ToolInput): Promise<unknown> {
  if (toolName === 'check_availability') {
    return checkAvailability(input.hotel_slug, input.amenity_type, input.date)
  }
  if (toolName === 'get_hotel_amenities') {
    return getHotelAmenities(input.hotel_slug)
  }
  return {error: `Unknown tool: ${toolName}`}
}

async function checkAvailability(hotelSlug: string, amenityType: string, date: string) {
  const amenity = await sanityClient.fetch(queries.getAmenityByType, {type: amenityType})

  if (!amenity) {
    return {error: `Amenity type "${amenityType}" not found. Try get_hotel_amenities to see valid types.`}
  }

  const {data: reservations, error} = await supabase
    .from('reservations')
    .select('seat_number, time_block')
    .eq('hotel_slug', hotelSlug)
    .eq('amenity_type', amenityType)
    .eq('reservation_date', date)

  if (error) {
    return {error: 'Failed to fetch reservation data'}
  }

  const slotCounts: Record<string, number> = {}
  reservations?.forEach(r => {
    r.seat_number
      .split(',')
      .filter(Boolean)
      .forEach(() => {
        slotCounts[r.time_block] = (slotCounts[r.time_block] || 0) + 1
      })
  })

  const totalSeats = amenity.seatingLayout.totalSeats

  return {
    amenity: amenity.displayName,
    date,
    totalSeats,
    slots: amenity.timeSlots.map((slot: string) => ({
      timeSlot: slot,
      availableSeats: totalSeats - (slotCounts[slot] || 0),
      isAvailable: totalSeats - (slotCounts[slot] || 0) > 0,
    })),
  }
}

async function getHotelAmenities(hotelSlug: string) {
  const hotel = await sanityClient.fetch(queries.getHotelBySlug, {slug: hotelSlug})

  if (!hotel) {
    return {error: `Hotel "${hotelSlug}" not found`}
  }

  return {
    hotel: hotel.name,
    amenities: (hotel.amenities ?? []).map((a: {displayName: string; type: string; timeSlots: string[]; seatingLayout: {totalSeats: number}; description?: string}) => ({
      name: a.displayName,
      type: a.type,
      timeSlots: a.timeSlots,
      totalSeats: a.seatingLayout.totalSeats,
      description: a.description,
    })),
  }
}
