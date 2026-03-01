'use client'

import {useState, useMemo} from 'react'
import Link from 'next/link'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {createClient} from '@/lib/supabase'
import posthog from 'posthog-js'

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')

  const inputClassName =
    'w-full border border-black px-4 py-3 text-base font-aileron-regular text-black placeholder:text-black/70 focus:outline-none focus:ring-2 focus:ring-black'

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setMessage(error.message)
        setMessageType('error')
      } else {
        posthog.capture('password_reset_requested', {
          email,
        })
        setMessage('Password reset email sent. Check your inbox for the next steps.')
        setMessageType('success')
        setEmail('')
      }
    } catch (err) {
      posthog.captureException(err)
      setMessage('An unexpected error occurred')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black relative">
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="inline-flex items-center text-black uppercase tracking-[0.4em] text-xs font-aileron-regular"
        >
          LOGO
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-2xl border border-black px-8 py-12 sm:px-12 sm:py-16">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.4em]">FORGOT PASSWORD</p>
            <p className="mt-4 text-sm font-aileron-regular">
              Remembered your password?{' '}
              <Link href="/sign-in" className="underline">
                Sign in.
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-black bg-black text-white uppercase tracking-[0.3em] text-xs sm:text-sm py-4 transition-colors disabled:opacity-50 hover:bg-white hover:text-black"
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>

            {message && (
              <Alert className="border border-black bg-white">
                <AlertDescription
                  className={`text-sm ${messageType === 'error' ? 'text-black' : 'text-black'}`}
                >
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
