'use client'

import {useEffect} from 'react'
import {usePathname} from 'next/navigation'

export function FontLoader() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't apply fonts on the settings page - let each card show its own font
    if (pathname === '/settings') {
      return
    }

    // Function to apply font to body
    const applyFont = (fontId: string | null) => {
      // Remove all font classes from body
      const fontClasses = [
        'font-default',
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
        'font-freight',
      ]
      fontClasses.forEach((cls) => document.body.classList.remove(cls))

      // Add the selected font class
      if (fontId) {
        document.body.classList.add(`font-${fontId}`)
      }
    }

    // Load and apply saved font preference on mount
    const fontPreference = localStorage.getItem('fontPreference')
    applyFont(fontPreference)

    // Listen for font changes via custom event
    const handleFontChange = (event: CustomEvent) => {
      applyFont(event.detail.fontId)
    }

    window.addEventListener('fontChange', handleFontChange as EventListener)

    return () => {
      window.removeEventListener('fontChange', handleFontChange as EventListener)
    }
  }, [pathname])

  return null
}
