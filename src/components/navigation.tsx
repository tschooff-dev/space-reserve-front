'use client'

import {useState} from 'react'
import {createClient} from '@/lib/supabase'
import {useRouter} from 'next/navigation'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-aileron-light tracking-wider">SPACERESERVE</h1>
          </div>

          {/* Hamburger Menu Button - Always visible */}
          <button
            onClick={toggleMenu}
            className="flex flex-col justify-center items-center w-8 h-8 gap-[5px] focus:outline-none group"
            aria-label="Toggle menu"
          >
            <span className="sr-only">Open main menu</span>
            {/* Three thin horizontal lines */}
            <span
              className={
                isMenuOpen
                  ? 'block h-[1px] w-6 bg-white transition-all duration-300 rotate-45 translate-y-[6px]'
                  : 'block h-[1px] w-6 bg-white transition-all duration-300'
              }
            />
            <span
              className={
                isMenuOpen
                  ? 'block h-[1px] w-6 bg-white transition-all duration-300 opacity-0'
                  : 'block h-[1px] w-6 bg-white transition-all duration-300'
              }
            />
            <span
              className={
                isMenuOpen
                  ? 'block h-[1px] w-6 bg-white transition-all duration-300 -rotate-45 -translate-y-[6px]'
                  : 'block h-[1px] w-6 bg-white transition-all duration-300'
              }
            />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 w-full sm:w-64 bg-black border-t border-white/10 z-50">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => {
                router.push('/account')
                setIsMenuOpen(false)
              }}
              className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-aileron-light w-full text-left transition-colors"
            >
              Account
            </button>
            <button
              onClick={() => {
                router.push('/reservations')
                setIsMenuOpen(false)
              }}
              className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-aileron-light w-full text-left transition-colors"
            >
              Reservations
            </button>
            <button
              onClick={() => {
                router.push('/customer-service')
                setIsMenuOpen(false)
              }}
              className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-aileron-light w-full text-left transition-colors"
            >
              Customer Service
            </button>
            <div className="border-t border-white/10 my-2" />
            <button
              onClick={() => {
                handleSignOut()
                setIsMenuOpen(false)
              }}
              className="text-white hover:text-gray-300 block px-4 py-3 text-sm font-aileron-light w-full text-left transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
