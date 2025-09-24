import {sanityClient} from '@/lib/sanity'
import {NextRequest, NextResponse} from 'next/server'

export async function GET(request: NextRequest, context: {params: Promise<{type: string}>}) {
  try {
    const {type} = await context.params

    const amenity = await sanityClient.fetch(
      `*[_type == "amenity" && type == $type][0] {
        displayName,
        "layoutImage": layoutImage.asset->url,
        "layoutImageAlt": layoutImage.alt
      }`,
      {type}
    )

    if (!amenity) {
      return NextResponse.json({error: 'Amenity not found'}, {status: 404})
    }

    return NextResponse.json(amenity)
  } catch (error) {
    console.error('Error fetching amenity:', error)
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
