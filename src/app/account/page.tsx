'use client'

import {Suspense, useEffect, useMemo, useState} from 'react'
import Link from 'next/link'
import {createClient} from '@/lib/supabase'
import Navigation from '@/components/navigation'
import {Button} from '@/components/ui/button'
import Loading from '@/components/loading'
import type {User} from '@supabase/supabase-js'

function AccountContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

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
  }, [supabase.auth])

  const sendPasswordReset = async () => {
    if (!user?.email) return
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    alert('Password reset email sent.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-aileron-light text-black mb-8 slide-up">Account</h1>
          <div className="bg-white border border-black rounded-none p-6 flex items-center justify-center min-h-[400px]">
            <Loading text="Loading your account..." size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white page-enter">
      <Navigation />

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-black/60">Profile</p>
          <h1 className="text-4xl font-aileron-light text-black uppercase tracking-[0.5em]">
            Account
          </h1>
        </div>

        {user ? (
          <div className="space-y-6 border border-black p-8">
            <div className="grid gap-6">
              <label className="text-xs uppercase tracking-[0.3em] text-black/70">
                First Name
                <input
                  type="text"
                  value={user.user_metadata?.first_name || ''}
                  readOnly
                  className="mt-2 w-full border border-black px-4 py-3 font-aileron-regular"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.3em] text-black/70">
                Last Name
                <input
                  type="text"
                  value={user.user_metadata?.last_name || ''}
                  readOnly
                  className="mt-2 w-full border border-black px-4 py-3 font-aileron-regular"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.3em] text-black/70">
                Email
                <input
                  type="email"
                  value={user.email || ''}
                  readOnly
                  className="mt-2 w-full border border-black px-4 py-3 font-aileron-regular"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={sendPasswordReset}
                variant="outline"
                className="rounded-none border border-black text-black uppercase tracking-[0.3em] py-4"
              >
                Reset password via email
              </Button>
              <Button
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/sign-in'
                }}
                className="rounded-none border border-black bg-black text-white uppercase tracking-[0.3em] py-4"
              >
                Sign Out
              </Button>
              <Link href="/settings" className="inline-block">
                <Button
                  variant="outline"
                  className="w-full rounded-none border border-black text-black uppercase tracking-[0.3em] py-4"
                >
                  Typography Settings
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="border border-black p-8 text-center">
            <p className="text-black/70 mb-4 font-aileron-regular">
              Please sign in to view your account information.
            </p>
            <Button
              onClick={() => (window.location.href = '/sign-in')}
              className="rounded-none border border-black bg-black text-white uppercase tracking-[0.3em] py-4"
            >
              Sign In
            </Button>
          </div>
        )}
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
