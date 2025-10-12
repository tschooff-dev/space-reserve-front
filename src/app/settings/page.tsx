'use client'

import {useState, useEffect} from 'react'
import Navigation from '@/components/navigation'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'

type FontOption = {
  id: string
  name: string
  displayFont: string
  bodyFont: string
  cssClass: string
  description: string
}

const fontOptions: FontOption[] = [
  {
    id: 'default',
    name: 'Default (Aileron + Foundation Sans)',
    displayFont: 'Aileron',
    bodyFont: 'Foundation Sans',
    cssClass: 'font-aileron',
    description: 'Current font pairing - Clean and modern',
  },
  {
    id: 'helvetica',
    name: 'Helvetica Neue',
    displayFont: 'Helvetica Neue',
    bodyFont: 'Helvetica Neue',
    cssClass: 'font-helvetica',
    description: 'Classic Swiss minimalism - Used by Everlane, American Apparel',
  },
  {
    id: 'futura',
    name: 'Futura + Inter',
    displayFont: 'Futura',
    bodyFont: 'Inter',
    cssClass: 'font-futura',
    description: 'Geometric elegance - Used by Supreme, Louis Vuitton',
  },
  {
    id: 'didot',
    name: 'Didot + Inter',
    displayFont: 'Didot',
    bodyFont: 'Inter',
    cssClass: 'font-didot',
    description: "High fashion editorial - Used by Vogue, Harper's Bazaar",
  },
  {
    id: 'avenir',
    name: 'Avenir Next',
    displayFont: 'Avenir Next',
    bodyFont: 'Avenir Next',
    cssClass: 'font-avenir',
    description: 'Modern geometric humanist - Clean and sophisticated',
  },
  {
    id: 'garamond',
    name: 'Garamond + Inter',
    displayFont: 'Garamond',
    bodyFont: 'Inter',
    cssClass: 'font-garamond',
    description: 'Classic elegance - Used by Tiffany & Co, Abercrombie & Fitch',
  },
  {
    id: 'optima',
    name: 'Optima + Inter',
    displayFont: 'Optima',
    bodyFont: 'Inter',
    cssClass: 'font-optima',
    description: 'Timeless sophistication - Used by Estée Lauder, Marks & Spencer',
  },
  {
    id: 'bodoni',
    name: 'Bodoni + Inter',
    displayFont: 'Bodoni',
    bodyFont: 'Inter',
    cssClass: 'font-bodoni',
    description: 'Bold luxury statement - Used by Giorgio Armani, Vogue Italia',
  },
  {
    id: 'brandon',
    name: 'Brandon Grotesque',
    displayFont: 'Brandon Grotesque',
    bodyFont: 'Brandon Grotesque',
    cssClass: 'font-brandon',
    description: 'Modern sans-serif - Used by Comedy Central, Uber, Netflix',
  },
  {
    id: 'proxima',
    name: 'Proxima Nova',
    displayFont: 'Proxima Nova',
    bodyFont: 'Proxima Nova',
    cssClass: 'font-proxima',
    description: 'Contemporary geometric - Used by Buzzfeed, Mashable, Wired',
  },
  {
    id: 'gotham',
    name: 'Metropolis (Gotham Alternative)',
    displayFont: 'Metropolis',
    bodyFont: 'Metropolis',
    cssClass: 'font-gotham',
    description: 'New York sophistication - Open source Gotham alternative',
  },
  {
    id: 'freight',
    name: 'Freight Display Black',
    displayFont: 'Freight Display',
    bodyFont: 'Inter',
    cssClass: 'font-freight',
    description: 'Editorial luxury serif - Bold statement headlines',
  },
]

export default function SettingsPage() {
  const [selectedFont, setSelectedFont] = useState<string>('default')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved font preference
    const savedFont = localStorage.getItem('fontPreference')
    if (savedFont) {
      setSelectedFont(savedFont)
    }

    // Remove all font classes from body on settings page to prevent interference with previews
    document.body.classList.remove(
      'font-aileron',
      'font-helvetica',
      'font-futura',
      'font-didot',
      'font-avenir',
      'font-garamond',
      'font-optima',
      'font-bodoni',
      'font-brandon',
      'font-proxima',
      'font-gotham',
      'font-freight'
    )
  }, [])

  const handleFontSelect = (fontId: string) => {
    setSelectedFont(fontId)
    localStorage.setItem('fontPreference', fontId)

    // Dispatch custom event to notify FontLoader on other pages/tabs
    window.dispatchEvent(
      new CustomEvent('fontChange', {
        detail: {fontId},
      })
    )
  }

  const handleReset = () => {
    setSelectedFont('default')
    localStorage.removeItem('fontPreference')

    // Dispatch custom event to reset font
    window.dispatchEvent(
      new CustomEvent('fontChange', {
        detail: {fontId: null},
      })
    )
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-aileron-light text-black mb-2 uppercase tracking-wider">
            Typography Settings
          </h1>
          <p className="text-black/70 font-foundation-sans text-sm">
            Select your preferred font pairing for the entire application
          </p>
        </div>

        {/* Font Options */}
        <div className="space-y-6 mb-8">
          {fontOptions.map((font) => (
            <Card
              key={font.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedFont === font.id
                  ? 'border-black bg-black text-white'
                  : 'border-black bg-white hover:bg-black/5'
              } ${font.cssClass}`}
              onClick={() => handleFontSelect(font.id)}
            >
              <CardHeader>
                <CardTitle
                  className={`text-xl sm:text-2xl ${
                    selectedFont === font.id ? 'text-white' : 'text-black'
                  }`}
                >
                  {font.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p
                  className={`text-sm ${
                    selectedFont === font.id ? 'text-white/80' : 'text-black/70'
                  }`}
                >
                  {font.description}
                </p>

                {/* Font Preview */}
                <div
                  className={`space-y-3 p-4 rounded border ${
                    selectedFont === font.id ? 'border-white/20 bg-white/10' : 'border-black/10'
                  }`}
                >
                  <div>
                    <p
                      className={`text-xs uppercase tracking-wider mb-1 ${
                        selectedFont === font.id ? 'text-white/60' : 'text-black/60'
                      }`}
                    >
                      Display Font (Hotel Names)
                    </p>
                    <p
                      className={`text-2xl sm:text-3xl ${
                        selectedFont === font.id ? 'text-white' : 'text-black'
                      }`}
                    >
                      THE AMAN NEW YORK
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-xs uppercase tracking-wider mb-1 ${
                        selectedFont === font.id ? 'text-white/60' : 'text-black/60'
                      }`}
                    >
                      Body Font
                    </p>
                    <p
                      className={`text-base ${
                        selectedFont === font.id ? 'text-white/90' : 'text-black/80'
                      }`}
                    >
                      A bandeau bra made of the softest buttery fabric that stretches with your body
                      while providing lift for your bust.
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-xs uppercase tracking-wider mb-1 ${
                        selectedFont === font.id ? 'text-white/60' : 'text-black/60'
                      }`}
                    >
                      Navigation Example
                    </p>
                    <p
                      className={`text-sm uppercase tracking-widest ${
                        selectedFont === font.id ? 'text-white' : 'text-black'
                      }`}
                    >
                      SPACERESERVE
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 sm:flex-none border-black text-black hover:bg-black hover:text-white"
          >
            Reset to Default
          </Button>
        </div>

        {/* Notes */}
        <div className="mt-12 p-6 border-2 border-black bg-white">
          <h3 className="font-aileron-regular text-black mb-2 uppercase tracking-wide text-sm">
            Note
          </h3>
          <p className="text-black/70 font-foundation-sans text-sm">
            Your font preference is saved locally and will persist across sessions. Partner-facing
            fonts (hotel names) are critically important for maintaining brand consistency.
          </p>
        </div>
      </div>
    </div>
  )
}
