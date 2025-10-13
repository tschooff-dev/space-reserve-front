'use client'

import {useState, useMemo} from 'react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {createClient} from '@/lib/supabase'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic'>('password')
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const {error} = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage('Error: ' + error.message)
      } else {
        setMessage('Successfully signed in!')
        setTimeout(() => {
          router.push('/reservations')
        }, 500)
      }
    } catch {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const {error} = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage('Error: ' + error.message)
      } else {
        setMessage('Check your email for the login link!')
      }
    } catch {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Logo - Top Left */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="block">
          <div className="text-black">
            <h1 className="text-2xl font-aileron-regular leading-tight">SPACERESERVE</h1>
            <p className="text-xs font-aileron-light tracking-wider">SPACERESERVE</p>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Sign In Form */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mb-6">
              <h2 className="text-center text-2xl font-aileron-light text-black">Sign In</h2>
              <p className="mt-2 text-center text-sm font-foundation-sans text-black/70">
                {loginMethod === 'password'
                  ? 'Enter your credentials to sign in'
                  : 'Enter your email to receive a magic link'}
              </p>
            </div>

            {/* Login Method Toggle */}
            <div className="flex border-2 border-black mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className={`flex-1 py-3 text-sm font-aileron-regular uppercase tracking-wide transition-all ${
                  loginMethod === 'password'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black/5'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('magic')}
                className={`flex-1 py-3 text-sm font-aileron-regular uppercase tracking-wide transition-all border-l-2 border-black ${
                  loginMethod === 'magic'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black/5'
                }`}
              >
                Magic Link
              </button>
            </div>

            {loginMethod === 'password' ? (
              <form className="space-y-6" onSubmit={handlePasswordSignIn}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-foundation-sans font-medium text-black"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="block text-sm font-foundation-sans font-medium text-black"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-black/70 hover:text-black underline font-foundation-sans"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="mt-1">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </div>

                {message && (
                  <Alert className="border-black bg-white">
                    <AlertDescription className="text-black">{message}</AlertDescription>
                  </Alert>
                )}
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleMagicLinkSignIn}>
                <div>
                  <label
                    htmlFor="email-magic"
                    className="block text-sm font-foundation-sans font-medium text-black"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <Input
                      id="email-magic"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Magic Link'}
                  </Button>
                </div>

                {message && (
                  <Alert className="border-black bg-white">
                    <AlertDescription className="text-black">{message}</AlertDescription>
                  </Alert>
                )}
              </form>
            )}

            {/* Sign Up Link */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-black/60">Don&apos;t have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/sign-up">
                  <Button variant="outline" className="w-full border-2 border-black text-black">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Demo Mode */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-black/60">Demo Mode</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => (window.location.href = '/hotels')}
                  variant="outline"
                  className="w-full"
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
