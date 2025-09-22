'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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
            <h1 className="text-xl font-light">LOGO</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={() => router.push('/account')}
                className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium"
              >
                Account
              </button>
              <button
                onClick={() => router.push('/reservations')}
                className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium"
              >
                Reservations
              </button>
              <button
                onClick={() => router.push('/customer-service')}
                className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium"
              >
                Customer Service
              </button>
              <button
                onClick={handleSignOut}
                className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium"
              >
                Log out
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black">
            <button
              onClick={() => {
                router.push('/account')
                setIsMenuOpen(false)
              }}
              className="text-white hover:text-gray-300 block px-3 py-2 text-base font-medium w-full text-left"
            >
              Account
            </button>
            <button
              onClick={() => {
                router.push('/reservations')
                setIsMenuOpen(false)
              }}
              className="text-white hover:text-gray-300 block px-3 py-2 text-base font-medium w-full text-left"
            >
              Reservations
            </button>
            <button
              onClick={() => {
                router.push('/customer-service')
                setIsMenuOpen(false)
              }}
              className="text-white hover:text-gray-300 block px-3 py-2 text-base font-medium w-full text-left"
            >
              Customer Service
            </button>
            <button
              onClick={() => {
                handleSignOut()
                setIsMenuOpen(false)
              }}
              className="text-white hover:text-gray-300 block px-3 py-2 text-base font-medium w-full text-left"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
