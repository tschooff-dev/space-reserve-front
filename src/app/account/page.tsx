'use client'

import {useEffect, useState, Suspense} from 'react'
import {createClient} from '@/lib/supabase'
import Navigation from '@/components/navigation'
import {Button} from '@/components/ui/button'
import type {User} from '@supabase/supabase-js'

function AccountContent() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: {user},
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-light text-black mb-8">Account</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {user ? (
            <div className="space-y-4">
              <div>
                <h2 className="font-medium text-gray-900">Email</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <div>
                <h2 className="font-medium text-gray-900">Member Since</h2>
                <p className="text-gray-600">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    window.location.href = '/sign-in'
                  }}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please sign in to view your account information.</p>
              <Button
                onClick={() => (window.location.href = '/sign-in')}
                className="bg-black text-white hover:bg-gray-800"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AccountLoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-light text-black mb-8">Account</h1>
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
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
