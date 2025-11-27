import Image from 'next/image'
import Link from 'next/link'
import {sanityClient} from '@/lib/sanity'

type LandingHero = {
  name: string
  heroImage?: string
  heroImageAlt?: string
}

async function fetchLandingHero(): Promise<LandingHero | null> {
  try {
    const query = `*[_type == "hotel" && slug.current == $slug][0]{
      name,
      "heroImage": heroImage.asset->url,
      "heroImageAlt": heroImage.alt
    }`
    const data = await sanityClient.fetch<LandingHero | null>(query, {slug: 'aman-new-york'})
    return data
  } catch (error) {
    console.error('Failed to load landing hero', error)
    return null
  }
}

export default async function Home() {
  const heroHotel = await fetchLandingHero()
  const heroName = heroHotel?.name?.toUpperCase() || 'AMAN NEW YORK'
  const heroImage = heroHotel?.heroImage
  const heroImageAlt = heroHotel?.heroImageAlt || heroName

  return (
    <main className="min-h-screen bg-white text-black flex flex-col">
      <section className="relative min-h-screen w-full overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={heroImageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="p-6 sm:p-10">
            <Link
              href="/"
              className="inline-flex items-center text-white uppercase tracking-[0.4em] text-xs font-aileron-regular"
            >
              LOGO
            </Link>
          </div>

          <div className="px-6 sm:px-10 pb-32 sm:pb-40 flex flex-col items-center text-center">
            <p className="text-white/80 uppercase tracking-[0.5em] text-xs sm:text-sm mb-5">
              {heroName}
            </p>
            <div className="text-white font-aileron-light leading-tight space-y-2 max-w-4xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl">PRIVATE AMENITIES</h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white/70 tracking-[0.5em] uppercase">
                WELCOME
              </h2>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-12 sm:pb-16 flex justify-center">
            <Link
              href="#access"
              prefetch={false}
              className="inline-flex items-center justify-center w-full sm:w-auto px-12 py-4 border border-black bg-black text-white text-xs sm:text-sm uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-colors duration-300"
            >
              CONTINUE
            </Link>
          </div>
        </div>
      </section>

      <section
        id="access"
        className="flex flex-col items-center justify-center gap-8 py-16 sm:py-24 px-6 sm:px-10 bg-white"
      >
        <div className="text-center max-w-2xl">
          <p className="uppercase tracking-[0.4em] text-xs sm:text-sm font-aileron-regular">
            ACCESS RESERVED EXPERIENCES
          </p>
        </div>

        <div className="w-full max-w-xl flex flex-col gap-4">
          <Link
            href="/sign-up"
            prefetch={false}
            className="w-full border border-black text-black bg-white uppercase tracking-[0.3em] text-xs sm:text-sm py-4 text-center hover:bg-black hover:text-white transition-colors duration-300"
          >
            Sign Up
          </Link>
          <Link
            href="/sign-in"
            prefetch={false}
            className="w-full border border-black text-white bg-black uppercase tracking-[0.3em] text-xs sm:text-sm py-4 text-center hover:bg-white hover:text-black transition-colors duration-300"
          >
            Sign In
          </Link>
        </div>
      </section>
    </main>
  )
}
