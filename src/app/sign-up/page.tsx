'use client'

import {useMemo, useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {createClient} from '@/lib/supabase'

export default function SignUpPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')

  const inputClassName =
    'w-full border border-black px-4 py-3 text-base font-aileron-regular text-black placeholder:text-black/70 focus:outline-none focus:ring-2 focus:ring-black'

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')

    if (!firstName.trim() || !lastName.trim()) {
      setMessage('Please enter your first and last name')
      setMessageType('error')
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters')
      setMessageType('error')
      return
    }

    setLoading(true)

    try {
      const {error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      })

      if (error) {
        setMessage(error.message)
        setMessageType('error')
      } else {
        setMessage('Account created. Check your email to confirm.')
        setMessageType('success')
        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')
        setTimeout(() => router.push('/sign-in'), 2500)
      }
    } catch {
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
            <p className="text-xs uppercase tracking-[0.4em]">SIGN UP</p>
            <p className="mt-4 text-sm font-aileron-regular">
              Already have an account?{' '}
              <Link href="/sign-in" className="underline">
                Sign in.
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSignUp}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  autoComplete="given-name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  className={inputClassName}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  autoComplete="family-name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  className={inputClassName}
                />
              </div>
            </div>

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
                autoComplete="new-password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-black bg-white text-black uppercase tracking-[0.3em] text-xs sm:text-sm py-4 transition-colors disabled:opacity-50"
            >
              {loading ? 'CREATING...' : 'SIGN UP'}
            </button>

            {message && (
              <Alert className={`border ${messageType === 'success' ? 'border-black bg-white' : 'border-black bg-white'}`}>
                <AlertDescription className="text-black text-sm">{message}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
