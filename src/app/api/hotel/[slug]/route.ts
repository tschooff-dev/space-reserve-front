import {sanityClient} from '@/lib/sanity'
import {NextRequest, NextResponse} from 'next/server'

export async function GET(
  request: NextRequest,
  {params}: {params: {slug: string}}
) {
  try {
    const {slug} = await params
    
    const hotel = await sanityClient.fetch(
      `*[_type == "hotel" && slug.current == $slug][0] {
        name,
        "heroImage": heroImage.asset->url,
        "heroImageAlt": heroImage.alt
      }`,
      {slug}
    )

    if (!hotel) {
      return NextResponse.json({error: 'Hotel not found'}, {status: 404})
    }

    return NextResponse.json(hotel)
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
