import {NextRequest, NextResponse} from 'next/server'

/**
 * Remediation / "kill switch" endpoint.
 *
 * Call this (e.g. via curl) to force-disable a feature flag in LaunchDarkly
 * without redeploying. Keep it protected via LD_KILL_SWITCH_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.LD_KILL_SWITCH_SECRET
  const authHeader = request.headers.get('x-kill-switch-secret')

  if (!secret || !authHeader || authHeader !== secret) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const token = process.env.LD_API_TOKEN
  const projectKey = process.env.LD_PROJECT_KEY
  const environmentKey = process.env.LD_ENVIRONMENT_KEY

  // The demo flag used in the UI (`src/app/hotels/page.tsx`).
  const flagKey = 'hotels-search-v2'

  if (!token || !projectKey || !environmentKey) {
    return NextResponse.json(
      {
        error:
          'Missing LaunchDarkly configuration. Set LD_API_TOKEN, LD_PROJECT_KEY, LD_ENVIRONMENT_KEY.',
      },
      {status: 500}
    )
  }

  // LaunchDarkly uses JSON Patch to update a flag.
  // Docs: https://apidocs.launchdarkly.com/
  const url = `https://app.launchdarkly.com/api/v2/flags/${encodeURIComponent(
    projectKey
  )}/${encodeURIComponent(flagKey)}`

  const patch = [
    {
      op: 'replace',
      path: `/environments/${environmentKey}/on`,
      value: false,
    },
  ]

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json(
        {error: `LaunchDarkly API error (${res.status})`, details: text},
        {status: 502}
      )
    }

    return NextResponse.json({ok: true, flagKey, disabled: true})
  } catch (error) {
    return NextResponse.json({error: 'Failed to call LaunchDarkly API', details: String(error)}, {status: 502})
  }
}

