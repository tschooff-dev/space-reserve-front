import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import {FontLoader} from '@/components/font-loader'
import LaunchDarklyProvider from '@/components/launchdarkly-provider'

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

const neueHaas = localFont({
  src: [
    {
      path: '../fonts/neue-haas-grotesk-font-fanily-1764144066-0/neuehaasgrottext-55roman-trial.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/neue-haas-grotesk-font-fanily-1764144066-0/neuehaasgrottext-65medium-trial.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/neue-haas-grotesk-font-fanily-1764144066-0/neuehaasgrottext-75bold-trial.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-neue-haas',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
})

const graphik = localFont({
  src: [
    {
      path: '../fonts/Graphik_Collection/Graphik Family/Graphik-Regular-Trial.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Graphik_Collection/Graphik Family/Graphik-Medium-Trial.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Graphik_Collection/Graphik Family/Graphik-Bold-Trial.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-graphik',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
})

const circularStd = localFont({
  src: [
    {
      path: '../fonts/circular-std-medium-500.ttf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-circular',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
})

const sohne = localFont({
  src: [
    {
      path: '../fonts/sohne-font-family-1764147704-0/TestSohne-Buch-BF663d89cd32e6a.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/sohne-font-family-1764147704-0/TestSohne-Halbfett-BF663d89cd2d67b.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/sohne-font-family-1764147704-0/TestSohne-Fett-BF663d89cca89ff.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sohne',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
})

const gtAmerica = localFont({
  src: [
    {
      path: '../fonts/GT-America/GT-America-Standard-Regular-Trial.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/GT-America/GT-America-Standard-Medium-Trial.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/GT-America/GT-America-Standard-Bold-Trial.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gt-america',
  fallback: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
})

const apercu = localFont({
  src: [
    {
      path: '../fonts/apercu-pro/apercu_regular_pro.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/apercu-pro/apercu_medium_pro.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/apercu-pro/apercu_bold_pro.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-apercu',
  fallback: ['Gill Sans', 'Helvetica', 'Arial', 'sans-serif'],
})

const ibmPlexSans = localFont({
  src: [
    {
      path: '../fonts/IBM_Plex_Sans/static/IBMPlexSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/IBM_Plex_Sans/static/IBMPlexSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-ibm-plex',
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
        className={`${inter.variable} ${aileron.variable} ${foundationSans.variable} ${brandonGrotesque.variable} ${proximaNova.variable} ${metropolis.variable} ${freightDisplay.variable} ${neueHaas.variable} ${graphik.variable} ${circularStd.variable} ${sohne.variable} ${gtAmerica.variable} ${apercu.variable} ${ibmPlexSans.variable} font-sans antialiased`}
      >
        <FontLoader />
        <LaunchDarklyProvider>{children}</LaunchDarklyProvider>
      </body>
    </html>
  )
}
