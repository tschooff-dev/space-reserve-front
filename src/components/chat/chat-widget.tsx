'use client'

import {useEffect, useMemo, useState} from 'react'
import {useFlags, useLDClient} from 'launchdarkly-react-client-sdk'
import {usePathname} from 'next/navigation'
import {createClient} from '@/lib/supabase'
import {ChatPanel} from './chat-panel'

function buildPageContext(pathname: string): string {
  const hotelMatch = pathname.match(/\/hotel\/([^/]+)/)
  const amenityMatch = pathname.match(/\/amenity\/([^/]+)/)
  const hotelSlug = hotelMatch?.[1]
  const amenityType = amenityMatch?.[1]

  if (pathname === '/') return 'Home page — hotel discovery landing page'
  if (pathname === '/hotels') return 'Hotels listing page — browsing available hotels'
  if (hotelSlug && amenityType && pathname.includes('/confirm')) {
    return `Reservation confirmation page. Hotel slug: "${hotelSlug}". Amenity type: "${amenityType}".`
  }
  if (hotelSlug && amenityType) {
    return `Amenity booking page. Hotel slug: "${hotelSlug}". Amenity type: "${amenityType}". Guest is selecting a date and time slot.`
  }
  if (hotelSlug) {
    return `Hotel detail page. Hotel slug: "${hotelSlug}". Guest is browsing available amenities.`
  }
  if (pathname === '/reservations') return 'Reservations page — viewing existing bookings'
  if (pathname === '/account') return 'Account settings page'
  if (pathname === '/customer-service') return 'Customer service page'
  return `Page: ${pathname}`
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [userKey, setUserKey] = useState<string | undefined>(undefined)
  const flags = useFlags()
  const ldClient = useLDClient()
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase.auth.getUser().then(({data: {user}}) => {
      // Use Supabase UUID when logged in (matches LD identify() call), else fall back to anon key
      setUserKey(user?.id ?? localStorage.getItem('ld_user_key') ?? undefined)
    })
  }, [supabase])

  const chatbotEnabled = Boolean(flags.aiChatbotEnabled)
  const showSuggestedQuestions = Boolean(flags.aiSuggestedQuestions)

  if (!chatbotEnabled) return null

  const handleOpen = () => {
    setIsOpen(true)
    ldClient?.track('ai_chat_opened', {page: pathname})
  }

  const handleClose = () => setIsOpen(false)

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <ChatPanel
          onClose={handleClose}
          userKey={userKey}
          showSuggestedQuestions={showSuggestedQuestions}
          pageContext={buildPageContext(pathname)}
        />
      )}

      <button
        onClick={isOpen ? handleClose : handleOpen}
        className="w-12 h-12 bg-black text-white flex items-center justify-center shadow-lg hover:bg-black/80 transition-colors"
        aria-label={isOpen ? 'Close concierge chat' : 'Open concierge chat'}
      >
        {isOpen ? (
          <span className="text-lg leading-none">×</span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  )
}
