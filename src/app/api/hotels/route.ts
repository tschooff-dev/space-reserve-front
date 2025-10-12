import {sanityClient} from '@/lib/sanity'
import {NextResponse} from 'next/server'

export async function GET() {
  try {
    const query = `*[_type == "hotel"] | order(name asc) {
      name,
      "slug": slug.current,
      description,
      location,
      "heroImage": heroImage.asset->url,
      "heroImageAlt": heroImage.alt
    }`

    const hotels = await sanityClient.fetch(query)
    return NextResponse.json(hotels)
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json({error: 'Failed to fetch hotels'}, {status: 500})
  }
}
