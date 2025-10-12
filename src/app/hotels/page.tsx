'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import Navigation from '@/components/navigation'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import Loading from '@/components/loading'
import Image from 'next/image'
import {QRCodeSVG} from 'qrcode.react'

interface Hotel {
  name: string
  slug: string
  description?: string
  location?: string
  heroImage?: string
  heroImageAlt?: string
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [showQRCode, setShowQRCode] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('/api/hotels')
        if (response.ok) {
          const data = await response.json()
          setHotels(data)
        }
      } catch (error) {
        console.error('Error fetching hotels:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  const downloadQRCode = (hotelSlug: string) => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    // Create a canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (larger for better quality)
    const size = 512
    canvas.width = size
    canvas.height = size

    // Draw white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'})
    const url = URL.createObjectURL(svgBlob)

    const img = document.createElement('img')
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size)
      URL.revokeObjectURL(url)

      // Download the canvas as PNG
      canvas.toBlob((blob) => {
        if (!blob) return
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${hotelSlug}-qr-code.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(downloadUrl)
      })
    }
    img.src = url
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-aileron-light text-black mb-8 uppercase tracking-wider">
            Hotels
          </h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading text="Loading hotels..." size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-aileron-light text-black mb-2 uppercase tracking-wider">
          Hotels
        </h1>
        <p className="text-black/70 font-foundation-sans mb-8 sm:mb-12">
          Select a hotel to view available amenities and make a reservation
        </p>

        {hotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black font-foundation-sans">No hotels available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <Card
                key={hotel.slug}
                className="hover:bg-black/5 transition-all duration-200 border-2 border-black"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="cursor-pointer" onClick={() => router.push(`/hotel/${hotel.slug}`)}>
                  {hotel.heroImage && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <Image
                        src={hotel.heroImage}
                        alt={hotel.heroImageAlt || hotel.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="mt-3">
                    <CardTitle className="text-xl sm:text-2xl font-aileron-light uppercase tracking-wider text-black">
                      {hotel.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {hotel.location && (
                      <p className="text-sm text-black/70 font-foundation-sans">{hotel.location}</p>
                    )}
                    {hotel.description && (
                      <p className="text-sm text-black/60 font-foundation-sans line-clamp-2">
                        {hotel.description}
                      </p>
                    )}
                  </CardContent>
                </div>
                <CardContent className="pt-0">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowQRCode(hotel.slug)
                    }}
                    className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-all"
                  >
                    Get QR Code
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* QR Code Modal */}
        {showQRCode && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRCode(null)}
          >
            <div
              className="bg-white border-2 border-black p-6 sm:p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-aileron-regular text-black uppercase tracking-wide">
                  QR Code
                </h3>
                <button
                  onClick={() => setShowQRCode(null)}
                  className="text-black hover:text-black/70 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="bg-white p-4 border-2 border-black flex items-center justify-center mb-4">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={`${window.location.origin}/hotel/${showQRCode}`}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-sm text-black/70 font-foundation-sans text-center mb-4">
                Scan to visit hotel page
              </p>

              <p className="text-xs text-black/60 font-foundation-sans break-all text-center border border-black/20 p-2 rounded mb-4">
                {`${window.location.origin}/hotel/${showQRCode}`}
              </p>

              <Button
                onClick={() => downloadQRCode(showQRCode)}
                className="w-full bg-black text-white hover:bg-black/90 transition-all"
              >
                Download QR Code
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
