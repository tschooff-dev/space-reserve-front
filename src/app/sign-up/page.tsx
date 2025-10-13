'use client'

import {useState, useMemo} from 'react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {createClient} from '@/lib/supabase'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      setMessageType('error')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters')
      setMessageType('error')
      setLoading(false)
      return
    }

    try {
      const {error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage('Error: ' + error.message)
        setMessageType('error')
      } else {
        setMessage('Account created! Check your email to confirm your account.')
        setMessageType('success')
        // Clear form
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        // Redirect to sign-in after 3 seconds
        setTimeout(() => {
          router.push('/sign-in')
        }, 3000)
      }
    } catch {
      setMessage('An unexpected error occurred')
      setMessageType('error')
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
        {/* Sign Up Form */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mb-6">
              <h2 className="text-center text-2xl font-aileron-light text-black">Create Account</h2>
              <p className="mt-2 text-center text-sm font-foundation-sans text-black/70">
                Sign up to start making reservations
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSignUp}>
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
                    className="border-2 border-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-foundation-sans font-medium text-black"
                >
                  Password
                </label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min. 6 characters)"
                    className="border-2 border-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-foundation-sans font-medium text-black"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="border-2 border-black"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </div>

              {message && (
                <Alert
                  className={`border-2 ${messageType === 'success' ? 'border-green-600 bg-green-50' : 'border-black bg-white'}`}
                >
                  <AlertDescription
                    className={messageType === 'success' ? 'text-green-800' : 'text-black'}
                  >
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </form>

            {/* Sign In Link */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-black/60">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full border-2 border-black text-black">
                    Sign In
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
