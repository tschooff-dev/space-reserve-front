'use client'

import {useEffect, useState, Suspense} from 'react'
import {createClient} from '@/lib/supabase'
import Navigation from '@/components/navigation'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardTitle} from '@/components/ui/card'
import Loading from '@/components/loading'
import type {User} from '@supabase/supabase-js'

function AccountContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const {
          data: {user},
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-aileron-light text-black mb-8 slide-up">Account</h1>
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center min-h-[400px]">
            <Loading text="Loading your account..." size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white page-enter">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-aileron-light text-black mb-8 slide-up">Account</h1>

        <Card className="hover-glow transition-all duration-200">
          {user ? (
            <CardContent className="space-y-4 fade-in">
              <div className="slide-up" style={{animationDelay: '0.1s'}}>
                <CardTitle className="text-lg font-aileron-regular text-gray-900 mb-2">
                  Email
                </CardTitle>
                <p className="text-gray-600 font-foundation-sans">{user.email}</p>
              </div>

              <div className="slide-up" style={{animationDelay: '0.2s'}}>
                <CardTitle className="text-lg font-aileron-regular text-gray-900 mb-2">
                  Member Since
                </CardTitle>
                <p className="text-gray-600 font-foundation-sans">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-4 slide-up" style={{animationDelay: '0.3s'}}>
                <Button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    window.location.href = '/sign-in'
                  }}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 transition-all duration-200 hover-lift"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent className="text-center fade-in">
              <p className="text-gray-600 mb-4 font-foundation-sans">
                Please sign in to view your account information.
              </p>
              <Button
                onClick={() => (window.location.href = '/sign-in')}
                className="bg-black text-white hover:bg-gray-800 transition-all duration-200 hover-lift"
              >
                Sign In
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

function AccountLoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-aileron-light text-black mb-8 slide-up">Account</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center min-h-[400px]">
          <Loading text="Loading your account..." size="lg" />
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountLoadingFallback />}>
      <AccountContent />
    </Suspense>
  )
}
