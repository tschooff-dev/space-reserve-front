import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import {FontLoader} from '@/components/font-loader'

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

// Brandon Grotesque
const brandonGrotesque = localFont({
  src: [
    {
      path: '../fonts/brandon-grotesque-font-family-1760103642-0/HvDTrial_Brandon_Grotesque_light-BF64a625c93e709.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/brandon-grotesque-font-family-1760103642-0/HvDTrial_Brandon_Grotesque_regular-BF64a625c9311e1.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/brandon-grotesque-font-family-1760103642-0/HvDTrial_Brandon_Grotesque_medium-BF64a625c84a521.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/brandon-grotesque-font-family-1760103642-0/HvDTrial_Brandon_Grotesque_bold-BF64a625c9151d5.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-brandon-grotesque',
  fallback: ['Montserrat', 'Helvetica', 'sans-serif'],
})

// Proxima Nova
const proximaNova = localFont({
  src: [
    {
      path: '../fonts/Proxima-Nova-Extra-Condensed/Demo_Fonts/Fontspring-DEMO-proximanova-light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/Proxima-Nova-Extra-Condensed/Demo_Fonts/Fontspring-DEMO-proximanova-regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Proxima-Nova-Extra-Condensed/Demo_Fonts/Fontspring-DEMO-proximanova-semibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/Proxima-Nova-Extra-Condensed/Demo_Fonts/Fontspring-DEMO-proximanova-bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-proxima-nova',
  fallback: ['Montserrat', 'Helvetica', 'sans-serif'],
})

// Metropolis (Gotham alternative)
const metropolis = localFont({
  src: [
    {
      path: '../fonts/gotham-similar-fonts/metropolis/Metropolis-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/gotham-similar-fonts/metropolis/Metropolis-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/gotham-similar-fonts/metropolis/Metropolis-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/gotham-similar-fonts/metropolis/Metropolis-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-metropolis',
  fallback: ['Montserrat', 'Helvetica', 'sans-serif'],
})

// Freight Display
const freightDisplay = localFont({
  src: [
    {
      path: '../fonts/Freight Disp Black/Freight Disp Black.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-freight-display',
  fallback: ['Georgia', 'serif'],
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
        className={`${inter.variable} ${aileron.variable} ${foundationSans.variable} ${brandonGrotesque.variable} ${proximaNova.variable} ${metropolis.variable} ${freightDisplay.variable} font-sans antialiased`}
      >
        <FontLoader />
        {children}
      </body>
    </html>
  )
}
