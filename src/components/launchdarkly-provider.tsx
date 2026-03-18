'use client'

import React, {useEffect, useMemo, useState} from 'react'
import {LDProvider, useLDClient} from 'launchdarkly-react-client-sdk'

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
  // Set this in `.env.local` (client-side/public). You get it from your LaunchDarkly environment settings.
  const clientSideID = process.env.NEXT_PUBLIC_LD_CLIENT_SIDE_ID

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
      // Request the demo flag so the SDK loads it promptly.
      flags={{'hotels-search-v2': false}}
      options={{
        streaming: true,
        evaluationReasons: true,
      }}
    >
      <LaunchDarklyConnectivityTrack />
      {children}
    </LDProvider>
  )
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

