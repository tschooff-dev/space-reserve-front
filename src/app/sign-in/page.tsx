'use client'

import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {createClient} from '@/lib/supabase'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-aileron-regular text-black">LOGO</h1>
        </div>
      </div>

      {/* Sign In Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-center text-2xl font-aileron-light text-black">Sign In</h2>
            <p className="mt-2 text-center text-sm font-foundation-sans text-gray-600">
              Enter your email to receive a magic link
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-foundation-sans font-medium text-gray-700"
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
              <Button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </div>

            {message && (
              <Alert
                className={
                  message.includes('Error')
                    ? 'border-red-200 bg-red-50'
                    : 'border-green-200 bg-green-50'
                }
              >
                <AlertDescription
                  className={message.includes('Error') ? 'text-red-600' : 'text-green-600'}
                >
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </form>

          {/* Demo Mode */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Mode</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => (window.location.href = '/hotel/aman-new-york')}
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
  )
}
