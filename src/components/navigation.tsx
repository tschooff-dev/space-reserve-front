'use client'

import {useEffect, useMemo, useState} from 'react'
import {createClient} from '@/lib/supabase'
import {useRouter} from 'next/navigation'
import type {User} from '@supabase/supabase-js'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSignOut = async () => {
await supabase.auth.signOut()
    router.push('/sign-in')
    setCurrentUser(null)
  }

  const goTo = (path: string) => {
    router.push(path)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const syncUser = async () => {
      const {
        data: {user},
      } = await supabase.auth.getUser()
      setCurrentUser(user)
    }

    const {data} = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })

    syncUser()
    return () => {
      data.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <nav className="bg-black text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => goTo('/')} className="font-header text-sm tracking-[0.6em]">
            LOGO
          </button>

          <button
            onClick={toggleMenu}
            className="flex flex-col justify-center items-center w-8 h-8 gap-[5px] focus:outline-none"
            aria-label="Toggle navigation"
          >
            <span className="sr-only">Open main menu</span>
            <span
              className={`block h-[1px] w-6 bg-white transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-[6px]' : ''
              }`}
            />
            <span
              className={`block h-[1px] w-6 bg-white transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-[1px] w-6 bg-white transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute right-0 w-full sm:w-64 bg-black border-t border-white/10">
          <div className="px-4 py-2 flex flex-col text-left">
            {!currentUser && (
              <button
                onClick={() => goTo('/sign-in')}
                className="px-4 py-4 text-xs uppercase tracking-[0.4em] hover:text-white/70"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => goTo('/reservations')}
              className="px-4 py-4 text-xs uppercase tracking-[0.4em] hover:text-white/70"
            >
              Reservations
            </button>
            <button
              onClick={() => goTo('/account')}
              className="px-4 py-4 text-xs uppercase tracking-[0.4em] hover:text-white/70"
            >
              Account
            </button>
            {currentUser && (
              <>
                <div className="border-t border-white/10 my-2" />
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="px-4 py-4 text-xs uppercase tracking-[0.4em] hover:text-white/70"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
