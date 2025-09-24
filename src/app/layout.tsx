import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

// Aileron font family
const aileron = localFont({
  src: [
    {
      path: '../fonts/Aileron-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/Aileron-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Aileron-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-aileron',
  fallback: ['Inter', 'system-ui', 'sans-serif'],
})

// Foundation Sans font family (using Inter as fallback since Foundation Sans not available)
const foundationSans = localFont({
  src: [
    {
      path: '../fonts/Aileron-Regular.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-foundation-sans',
  fallback: ['Inter', 'system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  title: 'Space Reserve',
  description: 'Luxury hotel amenity reservations made simple',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${aileron.variable} ${foundationSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
