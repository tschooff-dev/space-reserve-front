'use client'

import {useEffect} from 'react'

export function FontLoader() {
  useEffect(() => {
    // Load saved font preference from localStorage
    const fontPreference = localStorage.getItem('fontPreference')
    if (fontPreference) {
      document.body.classList.add(`font-${fontPreference}`)
    }
  }, [])

  return null
}
