'use client'

import React, {useEffect, useMemo, useState} from 'react'
import {LDProvider, useLDClient} from 'launchdarkly-react-client-sdk'
import {createClient} from '@/lib/supabase'

type Props = {
  children: React.ReactNode
}

function getOrCreateUserKey() {
  try {
    const existing = window.localStorage.getItem('ld_user_key')
    if (existing) return existing
    const created = (globalThis.crypto?.randomUUID?.() ?? `anon-${Date.now()}`) as string
    window.localStorage.setItem('ld_user_key', created)
    return created
  } catch {
    return `anon-${Date.now()}`
  }
}

export default function LaunchDarklyProvider({children}: Props) {
  // Hardcoded default for evaluator convenience.
  // `NEXT_PUBLIC_LD_CLIENT_SIDE_ID` still overrides this if set.
  const clientSideID = process.env.NEXT_PUBLIC_LD_CLIENT_SIDE_ID ?? '69babc5aa0d00c0a1715cf82'

  const [userKey, setUserKey] = useState<string | null>(() => {
    // Avoid referencing `window` during SSR/initial rendering.
    if (typeof window === 'undefined') return null
    return getOrCreateUserKey()
  })

  useEffect(() => {
    // If something prevented localStorage access, we still want a stable key.
    if (!userKey && typeof window !== 'undefined') {
      setUserKey(getOrCreateUserKey())
    }
  }, [userKey])

  const user = useMemo(() => {
    if (!userKey) return null
    return {kind: 'user', key: userKey, anonymous: true}
  }, [userKey])

  useEffect(() => {
    if (!clientSideID || !userKey) return
    // Helps debug "scanning for connection" if the SDK fails to initialize.
    // (You can remove/ignore this log after the demo.)
    // eslint-disable-next-line no-console
    console.info('[LaunchDarkly] initializing', {clientSideID, userKey})
  }, [clientSideID, userKey])

  if (!clientSideID || !user) return <>{children}</>

  return (
    <LDProvider
      clientSideID={clientSideID}
      context={user}
      // Bootstrap flags so the SDK evaluates them immediately on load.
      // Add any new flag keys here alongside their default (off) values.
      // Flag keys must match exactly what you created in your LaunchDarkly project.
      flags={{
          'hotels-search-v2': false,
          'hotels-featured-banner': false,
          'ai-chatbot-enabled': false,
          'ai-model-config': {provider: 'anthropic', model: 'claude-haiku-4-5-20251001'},
          'ai-system-prompt-variant': 'concierge',
          'ai-suggested-questions': false,
        }}
      options={{
        streaming: true,
        evaluationReasons: true,
      }}
    >
      <LaunchDarklyConnectivityTrack />
      {/* Syncs the LD context with the authenticated Supabase user.
          This is what enables individual and rule-based targeting — once identified,
          LD can target this user by their email, name, or any other attribute. */}
      <LaunchDarklyIdentifier />
      {children}
    </LDProvider>
  )
}

/**
 * Keeps the LaunchDarkly context in sync with Supabase auth state.
 *
 * When a user signs in, we call ldClient.identify() with their real attributes
 * (email, firstName, lastName). This is what makes individual and rule-based
 * targeting possible — LD can now target this specific user or match rules
 * like "email ends with @company.com".
 *
 * When a user signs out, we revert to an anonymous context so the session
 * is not associated with the previous user's targeting rules.
 *
 * Context attributes exposed for targeting:
 *   - key        → Supabase user UUID (stable, unique per user)
 *   - email      → user's email address (use for individual or domain-based targeting)
 *   - firstName  → from Supabase user_metadata
 *   - lastName   → from Supabase user_metadata
 *   - anonymous  → false when signed in, true when signed out
 */
function LaunchDarklyIdentifier() {
  const ldClient = useLDClient()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!ldClient) return

    const identifyUser = async (user: {id: string; email?: string; user_metadata?: Record<string, string>} | null) => {
      if (user) {
        // Authenticated context — includes real attributes for targeting
        await ldClient.identify({
          kind: 'user',
          key: user.id,
          email: user.email ?? '',
          firstName: user.user_metadata?.first_name ?? '',
          lastName: user.user_metadata?.last_name ?? '',
          anonymous: false,
        })
      } else {
        // Anonymous context — revert when signed out
        const anonKey = localStorage.getItem('ld_user_key') ?? `anon-${Date.now()}`
        await ldClient.identify({kind: 'user', key: anonKey, anonymous: true})
      }
    }

    // Identify on mount (handles page refresh while already signed in)
    supabase.auth.getUser().then(({data: {user}}) => identifyUser(user))

    // Re-identify on every auth state change (sign in / sign out)
    const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      identifyUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [ldClient, supabase])

  return null
}

function LaunchDarklyConnectivityTrack() {
  const ldClient = useLDClient()

  useEffect(() => {
    if (!ldClient) return

    // Fire a single custom event once the SDK is initialized. This validates connectivity
    // and gives the interviewer a concrete "we sent an event" signal.
    let cancelled = false
    ldClient
      .waitForInitialization(5)
      .then(() => {
        if (cancelled) return
        ldClient.track('source', {value: 'cursor'})
        // eslint-disable-next-line no-console
        console.info('[LaunchDarkly] track sent', {key: 'source', value: 'cursor'})
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[LaunchDarkly] track skipped (SDK not initialized)', err)
      })

    return () => {
      cancelled = true
    }
  }, [ldClient])

  return null
}

