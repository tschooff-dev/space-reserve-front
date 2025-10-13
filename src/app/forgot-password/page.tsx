'use client'

import {useState, useMemo} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {createClient} from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')
  const supabase = useMemo(() => createClient(), [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setMessage('Error: ' + error.message)
        setMessageType('error')
      } else {
        setMessage(
          'Password reset email sent! Check your inbox for instructions to reset your password.'
        )
        setMessageType('success')
        setEmail('')
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
        {/* Forgot Password Form */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mb-6">
              <h2 className="text-center text-2xl font-aileron-light text-black">Reset Password</h2>
              <p className="mt-2 text-center text-sm font-foundation-sans text-black/70">
                Enter your email address and we&apos;ll send you instructions to reset your password
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleResetPassword}>
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
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
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

            {/* Back to Sign In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-black/60">Remember your password?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full border-2 border-black text-black">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
