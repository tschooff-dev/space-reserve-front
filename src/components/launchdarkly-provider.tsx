'use client'

import React, {useEffect, useMemo, useState} from 'react'
import {LDProvider} from 'launchdarkly-react-client-sdk'

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

  const [userKey, setUserKey] = useState<string | null>(null)
  useEffect(() => {
    setUserKey(getOrCreateUserKey())
  }, [])

  const user = useMemo(() => {
    if (!userKey) return null
    return {key: userKey, anonymous: true}
  }, [userKey])

  if (!clientSideID || !user) return <>{children}</>

  return (
    <LDProvider
      clientSideID={clientSideID}
      context={user}
      options={{
        streaming: true,
      }}
    >
      {children}
    </LDProvider>
  )
}

