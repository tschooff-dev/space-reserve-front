'use client'

import {useMemo, useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {createClient} from '@/lib/supabase'

export default function SignInPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const inputClassName =
    'w-full border border-black px-4 py-3 text-base font-aileron-regular text-black placeholder:text-black/70 focus:outline-none focus:ring-2 focus:ring-black'

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
router.push('/reservations')
      }
    } catch (err) {
      // `signInWithPassword` can fail with a network/CORS error which surfaces as "Failed to fetch".
      // Show the actual message to make local debugging possible.
      // eslint-disable-next-line no-console
      console.error('[SignIn] signInWithPassword failed', err)
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setMessage(msg)
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
            <p className="text-xs uppercase tracking-[0.4em]">SIGN IN</p>
            <p className="mt-4 text-sm font-aileron-regular">
              Need an account?{' '}
              <Link href="/sign-up" className="underline">
                Sign up.
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSignIn}>
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

            <div>
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className={inputClassName}
              />
              <div className="mt-3 flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold uppercase tracking-[0.3em]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-black bg-black text-white uppercase tracking-[0.3em] text-xs sm:text-sm py-4 transition-colors disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>

            {message && (
              <Alert className="border border-black bg-white">
                <AlertDescription className="text-black text-sm">{message}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
