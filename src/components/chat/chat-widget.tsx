'use client'

import {useState} from 'react'
import {useFlags, useLDClient} from 'launchdarkly-react-client-sdk'
import {usePathname} from 'next/navigation'
import {ChatPanel} from './chat-panel'

type ModelConfig = {
  provider: string
  model: string
}

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  provider: 'anthropic',
  model: 'claude-haiku-4-5-20251001',
}

function buildPageContext(pathname: string): string {
  if (pathname === '/') return 'Home page — hotel discovery landing page'
  if (pathname === '/hotels') return 'Hotels listing page — browsing available hotels'
  if (pathname.includes('/amenity') && pathname.includes('/confirm')) return 'Reservation confirmation page — reviewing a booking'
  if (pathname.includes('/amenity')) return 'Amenity booking page — selecting amenity options and time slots'
  if (pathname.match(/\/hotel\//)) return 'Hotel detail page — viewing hotel amenities'
  if (pathname === '/reservations') return 'Reservations page — viewing existing bookings'
  if (pathname === '/account') return 'Account settings page'
  if (pathname === '/customer-service') return 'Customer service page'
  return `Page: ${pathname}`
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const flags = useFlags()
  const ldClient = useLDClient()
  const pathname = usePathname()

  const chatbotEnabled = Boolean(flags.aiChatbotEnabled)
  const modelConfig: ModelConfig = (flags.aiModelConfig as ModelConfig) ?? DEFAULT_MODEL_CONFIG
  const promptVariant: string = (flags.aiSystemPromptVariant as string) ?? 'concierge'
  const showSuggestedQuestions = Boolean(flags.aiSuggestedQuestions)

  if (!chatbotEnabled) return null

  const handleOpen = () => {
    setIsOpen(true)
    ldClient?.track('ai_chat_opened', {
      model: modelConfig.model,
      promptVariant,
      page: pathname,
    })
  }

  const handleClose = () => setIsOpen(false)

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <ChatPanel
          onClose={handleClose}
          modelConfig={modelConfig}
          promptVariant={promptVariant}
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
